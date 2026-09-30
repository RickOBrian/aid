/**
 * Карточка «Язык продукта» во вкладке «Продукт» (шаг 4): изучить образцы
 * в открытом файле, посмотреть, что продукт делает с каждой ролью,
 * выгрузить файл языка. Спорное и пробелы решает анкета (шаг 5).
 */

import { DOMINANT_SHARE, languageStats, type LanguageRule, type RuleStatus, type RuleValue, type StyleLanguage } from "../core/language";
import { GROUP_LABELS, GROUP_ORDER, roleGroup, roleLabel } from "../core/roleLabels";
import type { ProfileState } from "../profile/controller";
import type { ExemplarScope } from "../profile/usage";
import { badge, el, h, send } from "./dom";

const STATUS: Record<RuleStatus, [string, "neutral" | "success" | "info" | "warning" | "danger"]> = {
  proposed: ["найдено", "info"],
  confirmed: ["подтверждено", "success"],
  disputed: ["спорно", "warning"],
  missing: ["нет в образцах", "neutral"],
};

const CASES: Record<string, string> = { upper: "КАПС", lower: "строчные", title: "Каждое Слово", sentence: "Как в предложении", mixed: "смешанный" };

type Filter = "all" | "open";
let filter: Filter = "all";
let scope: ExemplarScope = "page";
let lastState: ProfileState | null = null;

function swatch(hex: string | undefined, title: string): HTMLElement {
  const s = h("span", { className: hex ? "ds-swatch" : "ds-swatch ds-swatch--none" });
  s.title = hex ? `${title}: ${hex}` : `${title}: в образцах не встречается`;
  if (hex) {
    const fill = h("i");
    // Цвет образца — это данные дизайна, а не оформление интерфейса.
    fill.style.background = hex;
    s.append(fill);
  }
  return s;
}

function focusLink(label: string, nodeId: string | undefined, screen: string): HTMLElement {
  const b = h("button", { className: "ds-screen__name", text: label, type: "button" });
  b.title = `Показать пример на канвасе: ${screen}`;
  if (nodeId) b.addEventListener("click", () => send({ type: "focus", nodeId }));
  return b;
}

function valueLine(v: RuleValue, total: number): HTMLElement {
  const share = Math.round((v.count / total) * 100);
  const name = v.token ? v.token.name : `${v.hex} · без токена`;
  const ex = v.examples[0];
  return h("div", { className: "ds-map-line" }, [
    swatch(v.hexLight, "светлая"),
    swatch(v.hexDark, "тёмная"),
    ex ? focusLink(name, ex.nodeId, ex.screenName) : h("span", { text: name }),
    h("span", { className: "ds-screen__meta", text: `${share} % · ${v.count}` }),
  ]);
}

function shapeText(r: LanguageRule): string {
  const parts: string[] = [];
  const top = <T>(list: Array<{ value: T; count: number }>) => (list.length ? list[0].value : undefined);
  const style = top(r.textStyles);
  if (style) parts.push(`стиль «${style.name}»`);
  const kase = top(r.textCases);
  if (kase && r.role.endsWith("/label")) parts.push(CASES[kase] ?? kase);
  const radius = top(r.radius);
  if (radius !== undefined) parts.push(`радиус ${radius}`);
  const height = top(r.height);
  if (height !== undefined && /^(action-|input|chip)/.test(r.role)) parts.push(`высота ${height}`);
  return parts.join(" · ");
}

function ruleRow(r: LanguageRule): HTMLElement {
  const [text, tone] = STATUS[r.status];
  const head = h("div", { className: "ds-map-line" }, [h("span", { text: roleLabel(r.role) }), badge(text, tone)]);
  if (r.status === "missing") {
    return h("div", { className: "ds-lang-row" }, [head, h("div", { className: "ds-screen__meta", text: "Роли нет в изученных образцах — пробел в образцах или в библиотеке" })]);
  }
  const shown = r.status === "disputed" ? r.values.slice(0, 4) : r.values.slice(0, 1);
  const rest = r.values.length - shown.length;
  const shape = shapeText(r);
  return h("div", { className: "ds-lang-row" }, [
    head,
    ...shown.map((v) => valueLine(v, r.total)),
    ...(rest > 0 ? [h("div", { className: "ds-screen__meta", text: `ещё вариантов: ${rest}` })] : []),
    ...(shape ? [h("div", { className: "ds-screen__meta", text: shape })] : []),
  ]);
}

function sourcesList(lang: StyleLanguage): HTMLElement[] {
  return lang.sources.map((s) => {
    const forget = h("button", { className: "ds-link", text: "забыть", type: "button" });
    forget.title = "Убрать вклад этого файла из языка продукта";
    let armed = false;
    forget.addEventListener("click", () => {
      // Два шага вместо confirm(): в iframe Figma диалог не показывается.
      if (!armed) {
        armed = true;
        forget.textContent = "точно забыть?";
        return;
      }
      send({ type: "language-forget", fileName: s.fileName });
    });
    const found = s.screensFound > s.screens ? ` из ${s.screensFound}` : "";
    return h("div", { className: "ds-map-line" }, [
      h("span", { text: `«${s.fileName}» — экранов ${s.screens}${found}, тёмных ${s.darkScreens}` }),
      forget,
    ]);
  });
}

function render(): void {
  const state = lastState;
  el("language-card").hidden = !state?.active;
  const lang = state?.language ?? null;
  el<HTMLButtonElement>("language-export").disabled = !lang;
  el("language-filter").hidden = !lang;
  if (!lang) {
    el("language-summary").textContent = "Образцы ещё не изучали.";
    el("language-sources").replaceChildren();
    el("language-rules").replaceChildren();
    return;
  }
  const s = languageStats(lang);
  el("language-summary").textContent =
    `Найдено правил: ${s.proposed + s.confirmed} · спорных: ${s.disputed} · нет в образцах: ${s.missing}. ` +
    `Правило однозначное, если одно значение — не меньше ${Math.round(DOMINANT_SHARE * 100)} % случаев.`;
  el("language-sources").replaceChildren(...sourcesList(lang));

  const rules = lang.rules.filter((r) => filter === "all" || r.status === "disputed" || r.status === "missing");
  const blocks: HTMLElement[] = [];
  for (const g of GROUP_ORDER) {
    const list = rules.filter((r) => roleGroup(r.role) === g);
    if (!list.length) continue;
    blocks.push(h("h3", { className: "ds-map-group", text: GROUP_LABELS[g] }), ...list.map(ruleRow));
  }
  el("language-rules").replaceChildren(...(blocks.length ? blocks : [h("p", { className: "ds-hint", text: "Спорного и пробелов нет" })]));
}

export function initLanguage(status: (text: string) => void): void {
  for (const b of el("language-scope").querySelectorAll<HTMLButtonElement>("button")) {
    b.addEventListener("click", () => {
      scope = b.dataset.scope as ExemplarScope;
      for (const x of el("language-scope").querySelectorAll("button")) x.setAttribute("aria-pressed", String(x === b));
    });
  }
  for (const b of el("language-filter").querySelectorAll<HTMLButtonElement>("button")) {
    b.addEventListener("click", () => {
      filter = b.dataset.filter as Filter;
      for (const x of el("language-filter").querySelectorAll("button")) x.setAttribute("aria-pressed", String(x === b));
      render();
    });
  }
  el("language-learn").addEventListener("click", () => {
    status("Изучаю образцы…");
    send({ type: "language-learn", scope });
  });
  el("language-export").addEventListener("click", () => send({ type: "language-export" }));
}

export function renderLanguage(state: ProfileState): void {
  lastState = state;
  render();
}
