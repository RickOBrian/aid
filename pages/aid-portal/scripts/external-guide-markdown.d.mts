import type { Marked } from 'marked';

export const ROUTE_HREF_PREFIX: string;
export function escapeHtml(text: string): string;
export function slug(text: string): string;
export function sanitizeHtml(raw: string): string;
export function mermaidToHtml(source: string): string;
export function createExternalMarked(options: { resolveChapter: (fileName: string) => string | null }): Marked;
