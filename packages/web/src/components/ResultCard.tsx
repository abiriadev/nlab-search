import { Card, CardContent } from "@/components/ui/card.tsx";
import type { PageHit } from "@/lib/meili.ts";

/** Render Meilisearch-highlighted HTML (<mark>…</mark>) safely-enough for a prototype. */
function Highlighted({ html, fallback }: { html?: string; fallback: string }) {
	if (!html) return <>{fallback}</>;
	return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ResultCard({ hit }: { hit: PageHit }) {
	const snippet = hit._formatted?.content;
	return (
		<a href={hit.url} target="_blank" rel="noreferrer" className="block">
			<Card className="transition-colors hover:border-neutral-400">
				<CardContent>
					<h2 className="text-lg font-semibold text-neutral-900">
						<Highlighted html={hit._formatted?.title} fallback={hit.title} />
					</h2>
					{snippet && (
						<p className="mt-1 line-clamp-3 text-sm text-neutral-600">
							<Highlighted html={snippet} fallback="" />
						</p>
					)}
					<p className="mt-2 truncate text-xs text-neutral-400">{hit.url}</p>
				</CardContent>
			</Card>
		</a>
	);
}
