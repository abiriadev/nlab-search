import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

// utility functions to extract data from the local sync dir

export interface PageDoc {
	id: number
	title: string
	url: string
	content: string
}

/** nLab public URL for a page title (spaces -> "+", everything else %-encoded). */
export const pageUrl = (title: string) =>
	'https://ncatlab.org/nlab/show/' +
	encodeURIComponent(title).replace(/%20/g, '+')

/**
 * A page directory looks like `.../pages/<d>/<d>/<d>/<d>/<id>/` and contains
 * `content.md` and `name`. Returns null if the dir is not a valid page
 * (e.g. missing files, or removed).
 */
export async function parsePage(
	pageDir: string,
	maxContentChars: number | null,
): Promise<PageDoc | null> {
	const id = Number(path.basename(pageDir))
	if (!Number.isInteger(id)) return null

	const contentPath = path.join(pageDir, 'content.md')
	const namePath = path.join(pageDir, 'name')
	if (!existsSync(contentPath) || !existsSync(namePath)) return null

	const [rawContent, rawName] = await Promise.all([
		readFile(contentPath, 'utf8'),
		readFile(namePath, 'utf8'),
	])

	const title = rawName.trim()
	let content = rawContent
	if (maxContentChars != null && content.length > maxContentChars) {
		content = content.slice(0, maxContentChars)
	}

	return { id, title, url: pageUrl(title), content }
}

/** Recursively collect every page directory (those containing `content.md`). */
export async function findPageDirs(pagesRoot: string): Promise<string[]> {
	const entries = await readdir(pagesRoot, {
		recursive: true,
		withFileTypes: true,
	})
	const dirs: string[] = []
	for (const e of entries) {
		if (e.isFile() && e.name === 'content.md') {
			dirs.push(e.parentPath)
		}
	}
	return dirs
}
