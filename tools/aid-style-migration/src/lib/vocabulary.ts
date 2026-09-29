/**
 * Слова, по которым плагин узнаёт тему в именах экранов и режимов.
 *
 * Night, Dark, «тёмная» — синонимы, одна роль «тёмная тема» (решение
 * Principal Designer, 2026-09-29). Это распознавание, а не выбор режима:
 * какой режим продукта тёмный, решает профиль продукта. Поэтому здесь
 * слова живут законно, а страж productAgnostic.test.ts этот файл не
 * проверяет на имена режимов.
 */

/** Начала слов: сравниваем с началом каждого слова в имени. */
const DARK_STEMS = ["dark", "night", "тёмн", "темн", "ночь", "ночн"];
const LIGHT_STEMS = ["light", "day", "светл", "днев", "день"];

function words(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-zа-яё0-9]+/i)
    .filter(Boolean);
}

function hasStem(name: string, stems: string[]): boolean {
  return words(name).some((w) => stems.some((s) => w.startsWith(s)));
}

export function hasDarkWord(name: string): boolean {
  return hasStem(name, DARK_STEMS);
}

export function hasLightWord(name: string): boolean {
  return hasStem(name, LIGHT_STEMS);
}

/** Имя без слов темы — чтобы «Главная dark» и «Главная» совпали. */
export function stripThemeWords(name: string): string {
  return words(name)
    .filter((w) => ![...DARK_STEMS, ...LIGHT_STEMS].some((s) => w.startsWith(s)))
    .join(" ");
}
