/**
 * Аннотации, пояснения и технические иллюстрации — не макет. Их нельзя
 * учитывать в статистике образцов и нельзя переводить (замечание Principal
 * Designer, 2026-09-29: «нас интересуют только макеты»).
 *
 * Узнаём по имени слоя или главного компонента: слова ниже — начала слов,
 * как в словаре темы. Служебные компоненты описаний библиотеки
 * (`_description/…`) — тоже сюда.
 */

const STEMS = [
  "annotat",
  "note",
  "comment",
  "spec",
  "redline",
  "measure",
  "callout",
  "sticky",
  "legend",
  "guideline",
  "description",
  "аннотац",
  "заметк",
  "коммент",
  "примечан",
  "пояснен",
  "специфик",
  "разметк",
  "выноск",
  "легенд",
  "описани",
  "техническ",
];

function words(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-zа-яё0-9]+/i)
    .filter(Boolean);
}

export function isAnnotationName(name: string): boolean {
  if (name.startsWith("_description")) return true;
  return words(name).some((w) => STEMS.some((s) => w.startsWith(s)));
}

/** Нода целиком вне экрана — стрелка, выноска, подпись сбоку; в макет не входит. */
export function outside(
  box: { x: number; y: number; width: number; height: number } | null,
  screen: { x: number; y: number; width: number; height: number } | null,
): boolean {
  if (!box || !screen) return false;
  return (
    box.x + box.width <= screen.x ||
    box.y + box.height <= screen.y ||
    box.x >= screen.x + screen.width ||
    box.y >= screen.y + screen.height
  );
}
