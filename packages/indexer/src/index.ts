import path from 'node:path'
import { existsSync } from 'node:fs'
import { loadConfig, type Config } from './config.js'
import { Git } from './git.js'
import { findPageDirs, parsePage, type PageDoc } from './extract.js'
import { loadState, saveState } from './state.js'
import { SearchIndex } from './search-index.js'

const sleep = (ms: number): Promise<void> =>
	new Promise(resolve => setTimeout(resolve, ms))

async function fullReindex(index: SearchIndex, config: Config): Promise<void> {
	const pagesRoot = path.join(config.repoDir, 'pages')
	const dirs = await findPageDirs(pagesRoot)
	console.log(`[full] ${dirs.length} page dirs found`)

	let batch: PageDoc[] = []
	let count = 0
	for (const dir of dirs) {
		const doc = await parsePage(dir, config.maxContentChars)
		if (!doc) continue
		batch.push(doc)
		if (batch.length >= config.batchSize) {
			await index.upsertBatch(batch)
			count += batch.length
			console.log(`[full] queued ${count}`)
			batch = []
		}
	}
	await index.upsertBatch(batch)
	count += batch.length
	console.log(`[full] done, ${count} docs queued`)
}

async function incremental(
	index: SearchIndex,
	git: Git,
	config: Config,
	oldSha: string,
	newSha: string,
): Promise<void> {
	const dirs = await git.changedPageDirs(oldSha, newSha)
	const toUpsert: PageDoc[] = []
	const toDelete: number[] = []

	for (const dir of dirs) {
		if (existsSync(path.join(dir, 'content.md'))) {
			const doc = await parsePage(dir, config.maxContentChars)
			if (doc) toUpsert.push(doc)
		} else {
			const id = Number(path.basename(dir))
			if (Number.isInteger(id)) toDelete.push(id)
		}
	}

	for (let i = 0; i < toUpsert.length; i += config.batchSize) {
		await index.upsertBatch(toUpsert.slice(i, i + config.batchSize))
	}
	await index.deleteIds(toDelete)
	console.log(`[incr] +${toUpsert.length} -${toDelete.length}`)
}

/** `--count`: dry-run extraction against REPO_DIR, no Meilisearch needed. */
async function dryRunCount(): Promise<void> {
	const repoDir = process.env.REPO_DIR ?? '/data/repo'
	const pagesRoot = path.join(repoDir, 'pages')
	const dirs = await findPageDirs(pagesRoot)
	console.log(`page dirs: ${dirs.length}`)
	if (dirs[0]) {
		const sample = await parsePage(dirs[0], null)
		console.log('sample:', {
			id: sample?.id,
			title: sample?.title,
			url: sample?.url,
			contentLen: sample?.content.length,
		})
	}
}

async function main(): Promise<void> {
	if (process.argv.includes('--count')) {
		await dryRunCount()
		return
	}

	const config = loadConfig()
	const git = new Git(config.repoDir)

	await git.ensureRepo(config.repoUrl, config.repoBranch)

	const index = new SearchIndex(config)

	let state = await loadState(config.stateDir)
	if (!state.lastIndexedSha) {
		await fullReindex(index, config)
		state = { lastIndexedSha: await git.localHead() }
		await saveState(config.stateDir, state)
	} else {
		const head = await git.localHead()
		if (head !== state.lastIndexedSha) {
			console.log('[startup] reconciling missed commits')
			await incremental(index, git, config, state.lastIndexedSha, head)
			state = { lastIndexedSha: head }
			await saveState(config.stateDir, state)
		}
	}

	const intervalMs = config.pollIntervalMinutes * 60_000
	console.log(`[poll] every ${config.pollIntervalMinutes} min`)
	for (;;) {
		await sleep(intervalMs)

		try {
			const remote = await git.remoteHead(config.repoBranch)
			const local = await git.localHead()
			if (remote === local) {
				console.log('[poll] up to date')
				continue
			}

			console.log(`[poll] new commit ${remote.slice(0, 8)}, syncing`)
			await git.fetchAndReset(config.repoBranch)
			const newHead = await git.localHead()

			await incremental(index, git, config, local, newHead)

			state = { lastIndexedSha: newHead }
			await saveState(config.stateDir, state)
		} catch (err) {
			console.error('[poll] error:', err)
		}
	}
}

main().catch((err: unknown) => {
	console.error(err)
	process.exit(1)
})
