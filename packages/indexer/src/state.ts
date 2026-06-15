import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

export interface State {
	lastIndexedSha: string | null
}

const statePath = (stateDir: string) => path.join(stateDir, 'state.json')

export async function loadState(stateDir: string): Promise<State> {
	try {
		const raw = await readFile(statePath(stateDir), 'utf8')
		const parsed = JSON.parse(raw) as Partial<State>

		return { lastIndexedSha: parsed.lastIndexedSha ?? null }
	} catch {
		return { lastIndexedSha: null }
	}
}

export async function saveState(stateDir: string, state: State): Promise<void> {
	await mkdir(stateDir, { recursive: true })
	await writeFile(statePath(stateDir), JSON.stringify(state, null, 2))
}
