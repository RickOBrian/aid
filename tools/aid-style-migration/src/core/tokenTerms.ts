/**
 * Словарь продукта: что значат слова-модификаторы в именах токенов —
 * по поведению значений в темах, а не по названию (замечание Principal
 * Designer, 2026-09-30: у каждого продукта свои синонимы стандарта; у
 * одного «Light Ind» / «Dark Ind» ведут себя как `-static`, «Inverted» —
 * как `inverse`; у другого то же называется «const»).
 *
 * Пара «основной токен + слово»: `Texts/Primary` и `Texts/Primary
 * Inverted`. Поведение пары:
 * - static-dm / static-lm / static — значение одинаково в обеих темах и
 *   совпадает с тёмным / светлым значением основного (или ни с одним);
 * - inverse — значения меняются местами с основным;
 * - themed — меняется с темой иначе.
 * Слово получает смысл, если почти во всех его парах поведение одно.
 */

export type TermConcept = "static" | "static-lm" | "static-dm" | "inverse" | "themed";

export interface TermToken {
  key: string;
  name: string;
  hexLight?: string;
  hexDark?: string;
}

export interface TermPair {
  token: string;
  base: string;
  concept: TermConcept;
}

export interface ProductTerm {
  /** Слово как в именах продукта: «Inverted», «Light Ind». */
  term: string;
  /** Главное поведение; `mixed` — пары ведут себя по-разному. */
  concept: TermConcept | "mixed";
  /** Доля пар с главным поведением. */
  share: number;
  pairs: TermPair[];
}

/** Слово признаём термином, если так ведут себя не меньше этой доли пар. */
const TERM_SHARE = 0.8;

/** Как в стандарте (`semantic-color-tokens.json`, §7 и §9). */
export const CONCEPT_LABELS: Record<TermConcept, string> = {
  static: "-static: одинаковый в светлой и тёмной теме",
  "static-lm": "-static-lm: всегда как в светлой теме",
  "static-dm": "-static-dm: всегда как в тёмной теме",
  inverse: "inverse: меняется местами с основным — для текста и иконок на инверсном фоне",
  themed: "меняется с темой — отдельный оттенок, не модификатор стандарта",
};

const norm = (hex?: string) => (hex ?? "").toLowerCase();
/** Цвет без прозрачности: у inverse бывает белый 100 % против белого 50 % — тот же смысл. */
const rgb = (hex?: string) => norm(hex).slice(0, 7);

function behave(t: TermToken, base: TermToken): TermConcept | null {
  const tl = norm(t.hexLight);
  const td = norm(t.hexDark);
  const bl = norm(base.hexLight);
  const bd = norm(base.hexDark);
  if (!tl || !td || !bl || !bd) return null;
  // Основной сам не меняется с темой — пара ничего не говорит о слове («Positive Deep»).
  if (rgb(bl) === rgb(bd)) return null;
  if (tl === td) return rgb(tl) === rgb(bd) ? "static-dm" : rgb(tl) === rgb(bl) ? "static-lm" : "static";
  if (rgb(tl) === rgb(bd) && rgb(td) === rgb(bl)) return "inverse";
  return "themed";
}

/** Все static-разновидности для смысла слова — одно: «не меняется с темой». */
function family(c: TermConcept): TermConcept {
  return c === "static-lm" || c === "static-dm" ? "static" : c;
}

/**
 * Словарь по токенам продукта. Основной токен — самый длинный токен,
 * чьё имя — начало имени этого, с пробелом, «-» или «_» после.
 */
export function learnTerms(tokens: TermToken[]): ProductTerm[] {
  const byName = [...tokens].sort((a, b) => b.name.length - a.name.length);
  const pairs = new Map<string, TermPair[]>();
  for (const t of tokens) {
    const base = byName.find((b) => b !== t && t.name.length > b.name.length && t.name.startsWith(b.name) && /^[\s_-]/.test(t.name.slice(b.name.length)));
    if (!base) continue;
    const term = t.name.slice(base.name.length).replace(/^[\s_-]+/, "").trim();
    const concept = behave(t, base);
    if (!term || !concept) continue;
    const list = pairs.get(term) ?? [];
    list.push({ token: t.name, base: base.name, concept });
    pairs.set(term, list);
  }
  const out: ProductTerm[] = [];
  for (const [term, list] of pairs) {
    const counts = new Map<TermConcept, number>();
    for (const p of list) counts.set(family(p.concept), (counts.get(family(p.concept)) ?? 0) + 1);
    const [top, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    const share = n / list.length;
    // У static уточняем разновидность, если она у всех пар одна.
    let concept: TermConcept | "mixed" = share >= TERM_SHARE ? top : "mixed";
    if (concept === "static") {
      const kinds = new Set(list.filter((p) => family(p.concept) === "static").map((p) => p.concept));
      if (kinds.size === 1) concept = [...kinds][0];
    }
    out.push({ term, concept, share, pairs: list });
  }
  // Сначала слова-модификаторы стандарта, потом «просто оттенки».
  const weight = (t: ProductTerm) => (t.concept === "themed" || t.concept === "mixed" ? 1 : 0);
  return out.sort((a, b) => weight(a) - weight(b) || b.pairs.length - a.pairs.length);
}

/** Смысл токена по словарю: «Texts/Primary Inverted» → inverse. */
export function conceptOf(tokenName: string, terms: ProductTerm[]): { term: string; concept: TermConcept } | null {
  for (const t of terms) {
    if (t.concept === "mixed" || t.concept === "themed") continue;
    if (t.pairs.some((p) => p.token === tokenName)) return { term: t.term, concept: t.concept };
  }
  return null;
}
