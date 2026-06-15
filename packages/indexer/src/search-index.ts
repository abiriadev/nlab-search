import { MeiliSearch, type Index as MeiliIndex } from 'meilisearch'
import type { Config } from './config.js'
import type { PageDoc } from './extract.js'

export class SearchIndex {
	#client: MeiliSearch
	#indexName: string
	#index: MeiliIndex<PageDoc> | null = null

	constructor(config: Config) {
		this.#client = new MeiliSearch({
			host: config.meiliHost,
			apiKey: config.meiliMasterKey,
			// Indexing batches can take well over the 5s default; wait indefinitely
			// (timeout < 1 disables the per-task timeout).
			defaultWaitOptions: { timeout: 0 },
		})

		this.#indexName = config.indexName
	}

	/** Create the index (if missing) and apply settings. Idempotent. */
	async ensureIndex() {
		if (this.#index !== null) return

		try {
			await this.#client.getIndex(this.#indexName)
		} catch {
			await this.#client
				.createIndex(this.#indexName, { primaryKey: 'id' })
				.waitTask()
		}

		const index = this.#client.index<PageDoc>(this.#indexName)
		await index
			.updateSettings({
				searchableAttributes: ['title', 'content'],
				displayedAttributes: ['id', 'title', 'url', 'content'],
			})
			.waitTask()

		this.#index = index
	}

	async upsertBatch(docs: PageDoc[]): Promise<void> {
		await this.ensureIndex()
		if (docs.length === 0) return

		// #index is guaranteed to be non-null here
		await this.#index!.addDocuments(docs, { primaryKey: 'id' }).waitTask()
	}

	async deleteIds(ids: number[]): Promise<void> {
		await this.ensureIndex()
		if (ids.length === 0) return

		await this.#index!.deleteDocuments(ids).waitTask()
	}
}
