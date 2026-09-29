/**
 * Токены продукта в форме, удобной переводу: цвет в светлом и тёмном
 * режиме темы, как их используют образцы; стили текста; шкалы радиусов и
 * отступов. Из индексов профиля — чистая логика.
 */

import { THEME_ROLES } from "../lib/vocabulary";
import type { ExemplarIndex, IndexedCollection, IndexedVariable, ProductProfile, TokensIndex, VariableValue } from "../profile/types";
import type { Rgba } from "./color";
import { weightOf } from "./typography";
import type { TargetColor, TargetText, TargetValue } from "./types";

function rgba(v: VariableValue | null | undefined): Rgba | null {
  return v && v.kind === "color" ? { r: v.r, g: v.g, b: v.b, a: v.a } : null;
}

function num(v: VariableValue | null | undefined): number | null {
  return v && v.kind === "number" ? v.value : null;
}

/** Значения в светлом и тёмном режиме: для коллекции темы — по ролям режимов, иначе — первый режим. */
function modesFor(c: IndexedCollection, profile: ProductProfile): { light: string; dark: string | null } {
  const theme = profile.theme;
  if (theme && theme.collectionKey === c.key) {
    const light = theme.modes.find((m) => m.role === THEME_ROLES.light)?.modeId ?? c.modes[0].modeId;
    const dark = theme.modes.find((m) => m.role === THEME_ROLES.dark)?.modeId ?? null;
    return { light, dark };
  }
  return { light: c.modes[0]?.modeId ?? "", dark: null };
}

function published(tokens: TokensIndex[]): Array<{ c: IndexedCollection; v: IndexedVariable }> {
  return tokens.flatMap((t) => t.collections.filter((c) => c.published).flatMap((c) => c.variables.filter((v) => v.published).map((v) => ({ c, v }))));
}

export function targetColors(profile: ProductProfile, tokens: TokensIndex[], exemplars: ExemplarIndex | null): TargetColor[] {
  const out: TargetColor[] = [];
  for (const { c, v } of published(tokens)) {
    if (v.resolvedType !== "COLOR") continue;
    const modes = modesFor(c, profile);
    const light = rgba(v.resolvedByMode[modes.light]);
    if (!light) continue;
    const dark = modes.dark ? rgba(v.resolvedByMode[modes.dark]) : null;
    const usage = exemplars?.variables[v.key]?.light ?? null;
    out.push({ key: v.key, name: v.name, scopes: v.scopes, light, dark, usage });
  }
  return out;
}

export function targetTexts(tokens: TokensIndex[], exemplars: ExemplarIndex | null): TargetText[] {
  return tokens.flatMap((t) =>
    t.textStyles
      .filter((s) => s.published)
      .map((s) => ({
        key: s.key,
        name: s.name,
        fontFamily: s.fontFamily,
        weight: weightOf(s.fontStyle),
        size: s.fontSize,
        lineHeight: s.lineHeight,
        textCase: s.textCase,
        uses: exemplars?.textStyles[s.key]?.uses ?? 0,
      })),
  );
}

/**
 * Шкала радиусов или отступов: числовые переменные с подходящей областью
 * применения; если scopes не заданы — по имени коллекции или переменной.
 */
export function targetValues(tokens: TokensIndex[], kind: "radius" | "spacing"): TargetValue[] {
  const scope = kind === "radius" ? "CORNER_RADIUS" : "GAP";
  const nameRe = kind === "radius" ? /radius|corner|радиус|скругл/i : /space|spacing|gap|padding|отступ|промежут/i;
  const out: TargetValue[] = [];
  for (const { c, v } of published(tokens)) {
    if (v.resolvedType !== "FLOAT") continue;
    const fits = v.scopes.includes(scope) || ((v.scopes.length === 0 || v.scopes.includes("ALL_SCOPES")) && (nameRe.test(c.name) || nameRe.test(v.name)));
    if (!fits) continue;
    const value = num(v.resolvedByMode[c.modes[0]?.modeId ?? ""]);
    if (value !== null) out.push({ key: v.key, name: v.name, value });
  }
  return out;
}
