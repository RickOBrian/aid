/**
 * Извлекает file_key из полного URL Figma или возвращает ключ как есть.
 *
 * Поддерживаемые форматы:
 * - https://www.figma.com/design/AbCdEf123/Name
 * - https://www.figma.com/file/AbCdEf123/Name
 * - https://www.figma.com/design/MainKey/branch/BranchKey/Name  → BranchKey
 * - AbCdEf123 (голый ключ)
 *
 * Не возвращает slug названия файла из URL — только технический file_key.
 */

const FIGMA_FILE_KEY_PATTERN = /^[A-Za-z0-9]{10,}$/;

/** true, если строка похожа на технический file_key Figma (не slug названия). */
export function isLikelyFigmaFileKey(value: string): boolean {
  return FIGMA_FILE_KEY_PATTERN.test(value.trim());
}

export function parseFigmaFileKey(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const looksLikeFigmaUrl = /figma\.com/i.test(trimmed) || /^https?:\/\//i.test(trimmed);

  // Branch: /design/{main}/branch/{branchKey}/...
  const branchMatch = trimmed.match(
    /figma\.com\/(?:design|file)\/[A-Za-z0-9]+\/branch\/([A-Za-z0-9]+)/i
  );
  if (branchMatch?.[1]) return branchMatch[1];

  // Standard design/file URL — только первый сегмент после /design|file/
  const fileMatch = trimmed.match(/figma\.com\/(?:design|file)\/([A-Za-z0-9]+)(?:\/|\?|#|$)/i);
  if (fileMatch?.[1]) return fileMatch[1];

  const withoutQuery = trimmed.split("?")[0]?.split("#")[0]?.trim() ?? trimmed;

  // Голый ключ без URL
  if (isLikelyFigmaFileKey(withoutQuery)) return withoutQuery;

  // URL Figma, но ключ не извлечён — не угадываем slug названия файла
  if (looksLikeFigmaUrl) return "";

  // Последний сегмент пути — только если это не URL (например, скопировали ключ с лишним /)
  const lastSegment = withoutQuery.split("/").filter(Boolean).pop() ?? withoutQuery;
  if (isLikelyFigmaFileKey(lastSegment)) return lastSegment;

  return "";
}

/**
 * Человекочитаемое имя из slug URL Figma (fallback, если REST /files недоступен).
 */
export function parseFigmaFileTitleFromUrl(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(/figma\.com\/(?:design|file)\/[A-Za-z0-9]+\/([^/?#]+)/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]).replace(/-/g, " ").replace(/\s+/g, " ").trim() || null;
  } catch {
    return match[1].replace(/-/g, " ").trim() || null;
  }
}

/**
 * Нормализует ввод пользователя для поля «File key» и API.
 * Возвращает file_key или пустую строку, если из ввода нельзя извлечь ключ.
 */
export function normalizeLibraryFileKeyInput(raw: string): string {
  return parseFigmaFileKey(raw);
}
