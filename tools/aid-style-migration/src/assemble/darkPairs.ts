/**
 * Тёмные пары: «Главная» и «Главная dark» — один экран в двух темах
 * (решение: пара сводится в одну строку «было → стало»).
 */

import { hasDarkWord, stripThemeWords } from "../lib/vocabulary";
import { signature, type NodeFacts } from "./screens";

export interface ScreenFacts extends NodeFacts {
  pageId: string;
  x: number;
  y: number;
  /** Относительная яркость фона корня 0…1; null — фона нет. */
  bgLuminance: number | null;
}

export interface DarkPair {
  lightId: string;
  darkId: string;
  /** Почему решили, что это пара, — видно пользователю. */
  reason: string;
}

/** Ниже этой яркости фон считаем тёмным. */
const DARK_BG_LUMINANCE = 0.2;

export function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function isDark(screen: ScreenFacts): boolean {
  return hasDarkWord(screen.name) || (screen.bgLuminance !== null && screen.bgLuminance < DARK_BG_LUMINANCE);
}

function distance(a: ScreenFacts, b: ScreenFacts): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Для каждого тёмного экрана — светлый из той же страницы:
 * 1) то же имя без слов темы и та же структура — надёжно;
 * 2) та же структура — ближайший по расположению;
 * 3) то же имя без слов темы — ближайший.
 */
export function findDarkPairs(screens: ScreenFacts[]): DarkPair[] {
  const darks = screens.filter(isDark);
  const lights = screens.filter((s) => !isDark(s));
  const used = new Set<string>();
  const pairs: DarkPair[] = [];

  for (const dark of darks) {
    const pool = lights.filter((l) => l.pageId === dark.pageId && !used.has(l.id));
    const darkName = stripThemeWords(dark.name);
    const darkSig = signature(dark);
    const nearest = (list: ScreenFacts[]) => list.sort((a, b) => distance(a, dark) - distance(b, dark))[0];

    const byNameAndSig = pool.filter((l) => stripThemeWords(l.name) === darkName && signature(l) === darkSig);
    const bySig = pool.filter((l) => signature(l) === darkSig);
    const byName = darkName ? pool.filter((l) => stripThemeWords(l.name) === darkName) : [];

    let match: ScreenFacts | undefined;
    let reason = "";
    if (byNameAndSig.length) {
      match = nearest(byNameAndSig);
      reason = "имя и структура";
    } else if (bySig.length) {
      match = nearest(bySig);
      reason = "структура, ближайший";
    } else if (byName.length) {
      match = nearest(byName);
      reason = "имя, ближайший";
    }
    if (match) {
      used.add(match.id);
      pairs.push({ lightId: match.id, darkId: dark.id, reason });
    }
  }
  return pairs;
}
