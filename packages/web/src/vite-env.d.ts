/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_MEILI_HOST: string;
	readonly VITE_MEILI_SEARCH_KEY: string;
	readonly VITE_MEILI_INDEX: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
