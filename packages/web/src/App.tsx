import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { ResultCard } from "@/components/ResultCard.tsx";
import { searchPages, type SearchResult } from "@/lib/meili.ts";

const DEBOUNCE_MS = 150;

export default function App() {
	const [query, setQuery] = useState("");
	const [result, setResult] = useState<SearchResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const q = query.trim();
		if (!q) {
			setResult(null);
			setError(null);
			setLoading(false);
			return;
		}

		let cancelled = false;
		setLoading(true);
		const timer = setTimeout(async () => {
			try {
				const res = await searchPages(q);
				if (!cancelled) {
					setResult(res);
					setError(null);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "Search failed");
					setResult(null);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}, DEBOUNCE_MS);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [query]);

	const hasQuery = query.trim().length > 0;

	return (
		<div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
			<header className="mb-6">
				<h1 className="text-2xl font-bold text-neutral-900">nLab Search</h1>
				<p className="text-sm text-neutral-500">
					Full-text search over the nLab wiki.
				</p>
			</header>

			<div className="relative">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
				<Input
					autoFocus
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search pages…"
					className="pl-10"
				/>
				{loading && (
					<Loader2 className="absolute right-3 top-1/2 size-5 -translate-y-1/2 animate-spin text-neutral-400" />
				)}
			</div>

			<div className="mt-6 space-y-3">
				{error && (
					<p className="text-sm text-red-600">Error: {error}</p>
				)}

				{result && (
					<p className="text-xs text-neutral-400">
						{result.estimatedTotalHits.toLocaleString()} results in{" "}
						{result.processingTimeMs} ms
					</p>
				)}

				{result?.hits.map((hit) => (
					<ResultCard key={hit.id} hit={hit} />
				))}

				{hasQuery && result && result.hits.length === 0 && !loading && (
					<p className="text-sm text-neutral-500">No results.</p>
				)}
			</div>
		</div>
	);
}
