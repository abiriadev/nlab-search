import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync } from 'node:fs'
import path from 'node:path'

const exec = promisify(execFile)
const MAX_BUFFER = 1024 * 1024 * 128

export class Git {
	#repoDir: string

	constructor(repoDir: string) {
		this.#repoDir = repoDir
	}

	async git(...args: string[]): Promise<string> {
		const { stdout } = await exec('git', args, {
			cwd: this.#repoDir,
			maxBuffer: MAX_BUFFER,
		})
		return stdout.trim()
	}

	/** Clone the repo if it isn't already present at repoDir. */
	async ensureRepo(repoUrl: string, branch: string): Promise<void> {
		if (existsSync(path.join(this.#repoDir, '.git'))) return
		console.log(`[git] cloning ${repoUrl} (${branch}) -> ${this.#repoDir}`)
		await exec(
			'git',
			['clone', '--branch', branch, repoUrl, this.#repoDir],
			{
				maxBuffer: MAX_BUFFER,
			},
		)
	}

	localHead(): Promise<string> {
		return this.git('rev-parse', 'HEAD')
	}

	/** Latest commit sha on the remote branch (one network round-trip, no token). */
	async remoteHead(branch: string): Promise<string> {
		const out = await this.git('ls-remote', 'origin', branch)
		const sha = out.split(/\s+/)[0]
		if (!sha) throw new Error(`Could not resolve remote head for ${branch}`)
		return sha
	}

	async fetchAndReset(branch: string): Promise<void> {
		await this.git('fetch', 'origin', branch)
		await this.git('reset', '--hard', `origin/${branch}`)
	}

	/**
	 * Page directories touched between two commits (absolute paths).
	 * Covers both `content.md` and `name` changes; deduped by page dir.
	 */
	async changedPageDirs(oldSha: string, newSha: string): Promise<string[]> {
		const out = await this.git(
			'diff',
			'--name-only',
			oldSha,
			newSha,
			'--',
			'pages',
		)
		if (!out) return []

		const dirs = new Set<string>()

		for (const line of out.split('\n')) {
			if (!line.trim()) continue // skip empty lines

			dirs.add(path.join(this.#repoDir, path.dirname(line)))
		}

		return [...dirs]
	}
}
