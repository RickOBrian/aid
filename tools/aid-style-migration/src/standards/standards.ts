/**
 * Стандарты ДС как ориентир аналитика (решение Principal Designer,
 * 2026-09-30): машинный слой `skills/_shared/standards/*.json` читается при
 * сборке, только на чтение. Стандарт подсказывает и сверяет, но не решает
 * вместо образцов: отход продукта — находка, а не ошибка (проект ADR
 * «Язык продукта», п. 2).
 *
 * Роль плагина → слот стандарта — только там, где гайд говорит прямо
 * («Акцентный текст и ссылки»); где стандарт молчит, слота нет, и плагин
 * так и пишет.
 */

import semantic from "../../../../skills/_shared/standards/semantic-color-tokens.json";
import naming from "../../../../skills/_shared/standards/naming-conventions.json";
import states from "../../../../skills/_shared/standards/component-states.json";
import type { LanguageRule, StyleLanguage } from "../core/language";
import { roleLabel } from "../core/roleLabels";
import { conceptOf, type ProductTerm } from "../core/tokenTerms";

export interface StandardRef {
  id: string;
  version: string;
  status: string;
}

/** Какие стандарты и каких версий прочитаны — для отчётов (стык в корневом CLAUDE.md). */
export const STANDARDS: StandardRef[] = [semantic, naming, states].map((s) => ({ id: s.id, version: s.version, status: s.status }));

export interface Slot {
  /** Токен или группа стандарта: `text-accent`, `bg-component-floating-*`. */
  slot: string;
  /** Назначение словами гайда. */
  use: string;
  /** Откуда: раздел гайда; «по смыслу» — толкование, а не прямая строка. */
  basis: string;
  /** Меняется ли слот с темой: `-static` и inverse на акценте — нет. */
  themed: boolean;
}

type TokenEntry = { name: string; use: string };
const all: TokenEntry[] = [...semantic.tokens.text, ...semantic.tokens.icon, ...semantic.tokens.line, ...semantic.tokens.bg];

function token(name: string, basis: string, themed = true): Slot {
  const t = all.find((x) => x.name === name);
  return { slot: name, use: t?.use ?? "", basis, themed };
}

function group(slot: string, use: string, basis: string): Slot {
  return { slot, use, basis, themed: true };
}

const disabled = states.tokenMapping.disabled.token;

/** Роль плагина → слот стандарта. Нет в таблице — стандарт роль не описывает. */
const SLOTS: Record<string, Slot> = {
  "screen-bg": token("bg-base-main", "§6"),
  surface: token("bg-base-main-secondary", "§6"),
  card: token("bg-card-main", "§6"),
  overlay: token("bg-overlay-main", "§6"),
  modal: token("bg-modal-main", "§6"),
  sheet: { ...token("bg-modal-main", "§6"), basis: "§6, по смыслу: шторка — модальная поверхность" },
  "text/primary": token("text-primary", "§5"),
  "text/secondary": token("text-secondary", "§5"),
  // На цветной плашке цвет текста и иконки не должен меняться с темой — законный -static (§9).
  "text/on-color": token("text-inverse", "§5, §7: текст на акцентном фоне; неизменность с темой — законный -static, §9", false),
  "text/status-negative": token("text-error", "§5"),
  "text/status-positive": token("text-success", "§5"),
  link: token("text-accent", "§5: «Акцентный текст и ссылки»"),
  "icon/primary": token("icon-primary", "§5"),
  "icon/secondary": token("icon-secondary", "§5"),
  "icon/accent": token("icon-accent", "§5"),
  "icon/on-color": token("icon-inverse", "§5, §7: иконка на акцентном фоне; неизменность с темой — законный -static, §9", false),
  divider: token("line-default", "§5"),
  "input/stroke": token("line-default", "§5: «Стандартный разделитель и бордер»"),
  "action-main": { ...token("bg-accent-main", "§1, по смыслу: пример компонента на акцентном фоне"), use: "Основной акцентный фон" },
  "action-primary": { ...token("bg-accent-main", "§1, по смыслу: пример компонента на акцентном фоне"), use: "Основной акцентный фон" },
  "action-disabled": group(disabled, "Состояние «недоступен»", "§9 и component-states.json"),
  "action-floating": group("bg-component-floating-*", semantic.bgGroups.component.floating, "§4"),
  input: group("bg-component-form-*", semantic.bgGroups.component.form, "§4"),
  chip: group("bg-component-control-*", semantic.bgGroups.component.control, "§4, по смыслу: чип — контрол"),
};

export function slotFor(role: string): Slot | null {
  return SLOTS[role] ?? null;
}

// ---------------------------------------------------------------------------
// Находки: отличия продукта от стандарта
// ---------------------------------------------------------------------------

export type FindingKind = "static-in-themed-role" | "naming";

export interface StandardFinding {
  kind: FindingKind;
  title: string;
  lines: string[];
  /** Уровень: риск — может сломать тёмную тему; отличие — пункт для решения. */
  level: "risk" | "difference";
}

/** Токен продукта с цветом в светлой и тёмной теме — из индекса библиотеки. */
export interface ProductToken {
  key: string;
  name: string;
  hexLight?: string;
  hexDark?: string;
}

/** Токен не меняется с темой — по значениям, а не по имени: у продукта своё именование. */
export function isStatic(t: ProductToken): boolean {
  return Boolean(t.hexLight && t.hexDark && t.hexLight.toLowerCase() === t.hexDark.toLowerCase());
}

function mainToken(r: LanguageRule): string | undefined {
  return r.decision?.value?.token?.key ?? r.values[0]?.token?.key;
}

/**
 * Сверка языка продукта со стандартом:
 * - статичный токен в роли, которая по стандарту меняется с темой, —
 *   риск: в тёмной теме цвет не поменяется (§9 `-static`);
 * - имена семантических токенов не по нотации стандарта — отличие
 *   (naming-conventions: kebab, без цифр и названий цветов).
 */
export function compareWithStandards(lang: StyleLanguage, tokens: ProductToken[], terms: ProductTerm[] = []): StandardFinding[] {
  const out: StandardFinding[] = [];
  const byKey = new Map(tokens.map((t) => [t.key, t]));

  for (const r of lang.rules) {
    const slot = slotFor(r.role);
    const key = mainToken(r);
    const t = key ? byKey.get(key) : undefined;
    if (!slot || !slot.themed || !t || !isStatic(t) || r.status === "missing") continue;
    out.push({
      kind: "static-in-themed-role",
      level: "risk",
      title: `«${roleLabel(r.role)}» — токен не меняется с темой`,
      lines: [
        `В образцах «${roleLabel(r.role)}» — ${t.name}: в светлой и тёмной теме один цвет ${t.hexLight}.${(() => {
          const c = conceptOf(t.name, terms);
          return c ? ` В словаре продукта слово «${c.term}» — это ${c.concept}.` : "";
        })()}`,
        `По стандарту роль соответствует ${slot.slot} (${slot.use}, ${slot.basis}) — он меняется с темой; неизменный цвет — модификатор -static, «когда цвет не должен меняться между режимами».`,
        "Если элемент лежит на обычном фоне, в тёмной теме он может потеряться. Если на цветной плашке — всё верно, это случай -static.",
      ],
    });
  }

  const pattern = new RegExp(naming.tokens.semantic.pattern);
  const used = new Set(lang.rules.flatMap((r) => r.values.map((v) => v.token?.key)).filter(Boolean) as string[]);
  const off = tokens.filter((t) => used.has(t.key) && !pattern.test(t.name.split("/").pop() ?? t.name) && !pattern.test(t.name));
  if (off.length) {
    out.push({
      kind: "naming",
      level: "difference",
      title: `Имена токенов не по нотации стандарта: ${off.length}`,
      lines: [
        `Стандарт: semantic-имя в нотации ${naming.tokens.notation} (${naming.tokens.semantic.pattern}), без цифр и названий цветов; имя — назначение, а не цвет.`,
        `В ходу у продукта: ${off.slice(0, 6).map((t) => t.name).join(", ")}${off.length > 6 ? "…" : ""}.`,
        "Это не ошибка перевода — пункт для решения по библиотеке: переименовывать ли и когда.",
      ],
    });
  }
  return out;
}
