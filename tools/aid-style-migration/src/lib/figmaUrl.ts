/**
 * file_key из ссылки Figma или голый ключ. Скопировано из Token Comparator
 * (решение №12), без изменений логики.
 *
 * - https://www.figma.com/design/AbCdEf123/Name → AbCdEf123
 * - https://www.figma.com/design/Main/branch/Branch/Name → Branch
 * - AbCdEf123 → AbCdEf123
 */

const FILE_KEY = /^[A-Za-z0-9]{10,}$/;

export function parseFigmaFileKey(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const branch = trimmed.match(/figma\.com\/(?:design|file)\/[A-Za-z0-9]+\/branch\/([A-Za-z0-9]+)/i);
  if (branch?.[1]) return branch[1];
  const file = trimmed.match(/figma\.com\/(?:design|file)\/([A-Za-z0-9]+)(?:\/|\?|#|$)/i);
  if (file?.[1]) return file[1];
  const bare = trimmed.split("?")[0]?.split("#")[0]?.trim() ?? trimmed;
  if (FILE_KEY.test(bare)) return bare;
  return "";
}
