/**
 * Сравнение иконок макета с иконочной библиотекой (v1.5.0, этап 3).
 *
 * Форма важнее имени. Пороги — из этапа 0 (docs/icons-spike-2026-09-19.md):
 * - ≥ 0.97 — та же форма: экземпляр чужого компонента — «Совпала форма»,
 *   без компонента — «Отвязанная иконка»;
 * - 0.85–0.97 — «Похожая форма»; если другая форма отстаёт меньше чем на
 *   0.05 — ещё и «Спорный вариант»;
 * - ниже — по форме не предлагаем; совпало имя — «Конфликт», иначе «Нет в
 *   библиотеке».
 *
 * Среди равных по форме (двойники библиотеки: состояния, размеры,
 * дубликаты) выбор — ближе по размеру рисунка → совпадают прозрачности слоёв
 * → совпало имя. Не разрешилось — «Спорный вариант» со списком.
 */

import type { LibraryIcon, StoredDecision } from "../comparators/types";
import type { IconRecord } from "./iconScanner";
import { shapeSimilarity, unpackFingerprint, type Fingerprint } from "./iconShape";

export const SAME_SHAPE = 0.97;
export const SIMILAR_SHAPE = 0.85;
export const SHAPE_MARGIN = 0.05;
/** Похожесть, с которой две формы считаются одной (двойники). */
export const TWIN_SHAPE = 0.99;
const FINGERPRINT_SIZE = 32;
/** Сколько ближайших по форме показывать первыми в списке выбора. */
const NEAREST_COUNT = 5;
/** Разница размеров рисунка, которой можно пренебречь, px. */
const SIZE_TOLERANCE = 0.5;

export type IconStatus = "exact" | "mapped" | "value" | "detached" | "approximate" | "conflict" | "layout-only";

export interface IconMatch {
  icon: LibraryIcon;
  similarity: number;
}

export interface IconComparisonResult {
  record: IconRecord;
  status: IconStatus;
  target?: IconMatch;
  /** Неразличимые кандидаты — когда выбор за дизайнером («Спорный вариант»). */
  alternatives: IconMatch[];
  /** Ближайшие по форме, даже ниже порога, — первыми в списке выбора. */
  nearest?: IconMatch[];
  flags: {
    /**
     * Экземпляр растянут, а в библиотеке есть та же иконка нужного размера.
     * Растянутый экземпляр без такой — норма: разные размеры не хранятся,
     * увеличение допускается (решение Principal Designer).
     */
    nonstandardSize?: boolean;
    /**
     * Иконка без компонента собрана из нескольких слоёв, а библиотечная —
     * из меньшего числа: скорее всего ошибка сборки. У экземпляра слои задаёт
     * компонент, а не автор макета, — ему пометка не ставится.
     */
    multiLayer?: boolean;
    disputed?: boolean;
  };
  decision?: StoredDecision;
}

const printsCache = new WeakMap<readonly LibraryIcon[], Fingerprint[]>();

function libraryPrints(library: readonly LibraryIcon[]): Fingerprint[] {
  let prints = printsCache.get(library);
  if (!prints) {
    prints = library.map((icon) => unpackFingerprint(icon.fingerprint, FINGERPRINT_SIZE));
    printsCache.set(library, prints);
  }
  return prints;
}

const GENERIC_LAYER_NAMES = /^(vector|group|frame|union|subtract|intersect|exclude|rectangle|ellipse|line|polygon|star|icon)(\s*\d+)?$/i;

/** «controls/close_24» → «close»: последний сегмент, без префикса ic_ и размера. */
export function normalizeIconName(name: string): string {
  const last = name.split("/").pop() ?? name;
  return last
    .trim()
    .toLowerCase()
    .replace(/^(ic|icon)[_\-\s]+/, "")
    .replace(/[_\-\s]*\d+(px)?$/, "")
    .replace(/[^a-zа-я0-9]+/g, "");
}

/** Имя, по которому иконку макета можно сопоставить с библиотекой. */
function layoutIconName(record: IconRecord): string | null {
  if (record.component) return record.component.setName ?? record.component.name;
  return GENERIC_LAYER_NAMES.test(record.representativeName.trim()) ? null : record.representativeName;
}

function namesMatch(layoutName: string | null, icon: LibraryIcon): boolean {
  if (!layoutName) return false;
  const wanted = normalizeIconName(layoutName);
  if (!wanted) return false;
  return (
    normalizeIconName(icon.name) === wanted || (icon.setName !== undefined && normalizeIconName(icon.setName) === wanted)
  );
}

const glyphSide = (glyph: { width: number; height: number } | null | undefined) =>
  glyph ? Math.max(glyph.width, glyph.height) : 0;

interface Ranked extends IconMatch {
  sizeDiff: number;
  opacityDiffers: number;
  nameDiffers: number;
}

function sameTieBreak(a: Ranked, b: Ranked): boolean {
  return Math.abs(a.sizeDiff - b.sizeDiff) <= SIZE_TOLERANCE && a.opacityDiffers === b.opacityDiffers && a.nameDiffers === b.nameDiffers;
}

/**
 * Лучший кандидат по форме с разбором двойников. `disputed` — выбор не
 * разрешился: неразличимые по всем признакам или слишком близкая другая форма.
 */
function rankByShape(
  record: IconRecord,
  library: readonly LibraryIcon[],
  prints: Fingerprint[]
): { best?: Ranked; alternatives: Ranked[]; disputed: boolean; nearest: Ranked[] } {
  if (library.length === 0) return { alternatives: [], disputed: false, nearest: [] };
  const layoutPrint = unpackFingerprint(record.fingerprint, FINGERPRINT_SIZE);
  const layoutName = layoutIconName(record);
  const layoutSide = glyphSide(record.glyph);
  const layoutOpacities = record.opacities.join(",");

  const ranked: Ranked[] = library.map((icon, index) => ({
    icon,
    similarity: shapeSimilarity(layoutPrint, prints[index]),
    sizeDiff: Math.abs(glyphSide(icon.glyph) - layoutSide),
    opacityDiffers: icon.opacities.join(",") === layoutOpacities ? 0 : 1,
    nameDiffers: namesMatch(layoutName, icon) ? 0 : 1,
  }));
  const top = Math.max(...ranked.map((item) => item.similarity));

  // Двойники лучшей формы — выбор среди них по признакам, а не по долям процента похожести.
  const twins = ranked
    .filter((item) => item.similarity >= top - (1 - TWIN_SHAPE))
    .sort((a, b) => a.sizeDiff - b.sizeDiff || a.opacityDiffers - b.opacityDiffers || a.nameDiffers - b.nameDiffers);
  const best = twins[0];
  const tied = twins.filter((item) => sameTieBreak(item, best));

  // Другая форма, почти такая же похожая, — выбор тоже спорный.
  const closeOthers = ranked.filter(
    (item) => item.similarity < top - (1 - TWIN_SHAPE) && item.similarity >= top - SHAPE_MARGIN && item.similarity >= SIMILAR_SHAPE
  );

  const disputed = tied.length > 1 || (top < SAME_SHAPE && closeOthers.length > 0);
  const alternatives = disputed ? [...tied, ...closeOthers].sort((a, b) => b.similarity - a.similarity) : [];
  const nearest = [...ranked].sort((a, b) => b.similarity - a.similarity).slice(0, NEAREST_COUNT);
  return { best, alternatives, disputed, nearest };
}

function match(icon: LibraryIcon, record: IconRecord, prints: Fingerprint[], library: readonly LibraryIcon[]): IconMatch {
  const index = library.indexOf(icon);
  return {
    icon,
    similarity: shapeSimilarity(unpackFingerprint(record.fingerprint, FINGERPRINT_SIZE), prints[index]),
  };
}

const strip = ({ icon, similarity }: IconMatch): IconMatch => ({ icon, similarity });

function withMultiLayer(result: IconComparisonResult): IconComparisonResult {
  if (result.record.kind === "detached" && result.target && result.record.layers > (result.target.icon.layers ?? 1)) {
    result.flags.multiLayer = true;
  }
  return result;
}

function compareOne(
  record: IconRecord,
  library: readonly LibraryIcon[],
  prints: Fingerprint[],
  decision: StoredDecision | undefined
): IconComparisonResult {
  const base = { record, alternatives: [] as IconMatch[], flags: {}, ...(decision ? { decision } : {}) };

  // Решение с конкретной иконкой — если она есть в библиотеке.
  if (decision && (decision.decision === "mapped" || decision.decision === "mapped_suggested")) {
    const chosen = library.find((icon) => icon.key === decision.targetComponentKey);
    if (chosen) return withMultiLayer({ ...base, status: "mapped", target: match(chosen, record, prints, library) });
  }

  // Экземпляр иконки этой библиотеки.
  const own = record.component ? library.find((icon) => icon.key === record.component?.key) : undefined;
  if (own) {
    const result: IconComparisonResult = { ...base, status: "exact", target: { icon: own, similarity: 1 } };
    if (record.scaled) {
      // Та же форма нужного размера — если она есть в библиотеке. Нет — увеличение
      // допустимо, строка не нужна.
      const ownPrint = prints[library.indexOf(own)];
      const sameShape = library.filter(
        (icon, index) => shapeSimilarity(ownPrint, prints[index]) >= TWIN_SHAPE && icon.key !== own.key
      );
      const fitting = sameShape.find(
        (icon) => Math.abs(icon.width - record.width) <= SIZE_TOLERANCE && Math.abs(icon.height - record.height) <= SIZE_TOLERANCE
      );
      if (fitting) {
        result.flags.nonstandardSize = true;
        result.target = match(fitting, record, prints, library);
      }
    }
    return result;
  }

  const { best, alternatives, disputed, nearest: ranked } = rankByShape(record, library, prints);
  const nearest = ranked.map(strip);
  if (best && best.similarity >= SIMILAR_SHAPE) {
    const status: IconStatus =
      best.similarity >= SAME_SHAPE ? (record.kind === "instance" ? "value" : "detached") : "approximate";
    return withMultiLayer({
      ...base,
      status,
      target: strip(best),
      alternatives: alternatives.map(strip),
      nearest,
      flags: disputed ? { disputed: true } : {},
    });
  }

  // Форма не подошла — остаётся имя.
  const layoutName = layoutIconName(record);
  const named = library.find((icon) => namesMatch(layoutName, icon));
  if (named) {
    return withMultiLayer({ ...base, status: "conflict", target: match(named, record, prints, library), nearest });
  }
  return { ...base, status: "layout-only", nearest };
}

export function compareIcons(
  records: readonly IconRecord[],
  library: readonly LibraryIcon[],
  history: Record<string, StoredDecision>
): IconComparisonResult[] {
  const prints = libraryPrints(library);
  return records.map((record) => compareOne(record, library, prints, history[record.id]));
}

/** Строка требует решения — остаётся в таблице. */
export function requiresIconUserAction(result: IconComparisonResult): boolean {
  if (result.decision?.decision === "ignored") return false;
  if (result.status === "mapped") return false;
  if (result.status === "exact") return Boolean(result.flags.nonstandardSize);
  return true;
}
