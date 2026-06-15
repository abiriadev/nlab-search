import { z } from 'zod'

const emptyToUndefined = (v: unknown) =>
	typeof v === 'string' && v.trim() === '' ? undefined : v

const ConfigSchema = z.object({
	meiliHost: z.preprocess(
		emptyToUndefined,
		z.string().default('http://localhost:7700'),
	),
	meiliMasterKey: z
		.string({ error: 'Missing required env var: MEILI_MASTER_KEY' })
		.min(1, 'Missing required env var: MEILI_MASTER_KEY'),
	indexName: z.preprocess(emptyToUndefined, z.string().default('pages')),
	repoUrl: z.preprocess(
		emptyToUndefined,
		z.string().default('https://github.com/ncatlab/nlab-content'),
	),
	repoBranch: z.preprocess(emptyToUndefined, z.string().default('master')),
	repoDir: z.preprocess(emptyToUndefined, z.string().default('/data/repo')),
	stateDir: z.preprocess(emptyToUndefined, z.string().default('/data/state')),
	pollIntervalMinutes: z.preprocess(
		emptyToUndefined,
		z.coerce.number().default(10),
	),
	maxContentChars: z.preprocess(
		emptyToUndefined,
		z.coerce.number().nullable().default(null),
	),
	batchSize: z.preprocess(emptyToUndefined, z.coerce.number().default(1000)),
})

export type Config = z.infer<typeof ConfigSchema>

export function loadConfig(): Config {
	return ConfigSchema.parse({
		meiliHost: process.env.MEILI_HOST,
		meiliMasterKey: process.env.MEILI_MASTER_KEY,
		indexName: process.env.MEILI_INDEX,
		repoUrl: process.env.REPO_URL,
		repoBranch: process.env.REPO_BRANCH,
		repoDir: process.env.REPO_DIR,
		stateDir: process.env.STATE_DIR,
		pollIntervalMinutes: process.env.POLL_INTERVAL_MINUTES,
		maxContentChars: process.env.MAX_CONTENT_CHARS,
		batchSize: process.env.INDEX_BATCH_SIZE,
	})
}
