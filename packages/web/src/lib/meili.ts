import { MeiliSearch } from "meilisearch";

export const indexName = import.meta.env.VITE_MEILI_INDEX || "pages";

const client = new MeiliSearch({
	host: import.meta.env.VITE_MEILI_HOST,
	apiKey: import.meta.env.VITE_MEILI_SEARCH_KEY,
});

export const pagesIndex = client.index(indexName);

export interface PageHit {
	id: number;
	title: string;
	url: string;
	_formatted?: {
		title?: string;
		content?: string;
	};
}

export interface SearchResult {
	hits: PageHit[];
	estimatedTotalHits: number;
	processingTimeMs: number;
}

export async function searchPages(query: string): Promise<SearchResult> {
	const res = await pagesIndex.search(query, {
		limit: 20,
		attributesToRetrieve: ["id", "title", "url"],
		attributesToHighlight: ["title", "content"],
		attributesToCrop: ["content"],
		cropLength: 40,
		highlightPreTag: "<mark>",
		highlightPostTag: "</mark>",
	});
	return {
		hits: res.hits as PageHit[],
		estimatedTotalHits: res.estimatedTotalHits ?? res.hits.length,
		processingTimeMs: res.processingTimeMs,
	};
}
