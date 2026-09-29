/**
 * Вкладка «Карта стиля» (этап 3a): стиль исходника → токены продукта.
 * Только анализ; выбор другого варианта здесь — черновик, сохранение
 * решений и применение — этап 3b.
 */

import type { Rgba } from "../map/color";
import type { Candidate, Confidence, Proposal, StyleMap } from "../map/types";
import { badge, el, h, send } from "./dom";

type Filter = "all" | "doubt" | "gap";

const CONFIDENCE: Record<Confidence, [string, "success" | "warning" | "danger"]> = {
  high: ["уверенно", "success"],
  medium: ["спорно", "warning"],
  low: ["неуверенно", "danger"],
};

const USE_TITLE: Record<string, string> = {
  background: "Фон экрана",
  surface: "Поверхности",
  text: "Текст",
  icon: "Иконки",
  stroke: "Обводки",
};

const CASE_LABEL: Record<string, string> = { upper: "капс", title: "С Заглавных", sentence: "с заглавной", lower: "строчные", mixed: "" };

let current: StyleMap | null = null;
let filter: Filter = "all";
/** Черновой выбор пользователя: источник → ключ токена. */
const choice = new Map<string, string>();
let setStatus: (text: string) => void = () => undefined;

function css(c: Rgba): string {
  return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${Math.round(c.a * 100) / 100})`;
}

function swatch(c: Rgba | null | undefined, title: string): HTMLElement {
  const s = h("span", { className: c ? "ds-swatch" : "ds-swatch ds-swatch--none" });
  s.title = c ? `${title}: ${css(c)}` : `${title}: нет данных`;
  if (c) {
    const fill = h("i");
    // Цвет образца — это данные дизайна, а не оформление интерфейса.
    fill.style.background = css(c);
    s.append(fill);
  }
  return s;
}

function passes(p: Proposal): boolean {
  if (filter === "doubt") return p.confidence !== "high";
  if (filter === "gap") return p.target === null;
  return true;
}

function focusLink(label: string, nodeId: string | undefined): HTMLElement {
  const b = h("button", { className: "ds-screen__name", text: label, type: "button" });
  b.title = "Показать пример на канвасе";
  if (nodeId) b.addEventListener("click", () => send({ type: "focus", nodeId }));
  return b;
}

function chooser(p: Proposal): HTMLElement | null {
  const options: Candidate[] = [...(p.target ? [p.target] : []), ...p.alternatives];
  if (options.length < 2) return null;
  const select = h("select", { className: "ds-input" });
  select.setAttribute("aria-label", "Другой вариант");
  for (const o of options) {
    const opt = h("option", { text: o.name });
    opt.value = o.key;
    select.append(opt);
  }
  select.value = choice.get(p.sourceId) ?? p.target?.key ?? "";
  select.addEventListener("change", () => {
    choice.set(p.sourceId, select.value);
    setStatus("Выбор отмечен — сохранение решений и применение появятся на этапе 3b");
  });
  return select;
}

function row(left: HTMLElement[], right: HTMLElement[], p: Proposal): HTMLElement {
  const [text, tone] = CONFIDENCE[p.confidence];
  const pick = chooser(p);
  return h("div", { className: "ds-map-row" }, [
    h("div", { className: "ds-map-side" }, left),
    h("span", { className: "ds-map-arrow", text: "→" }),
    h("div", { className: "ds-map-side" }, [...right, h("div", {}, [badge(text, tone)]), ...(pick ? [pick] : [])]),
    h("div", { className: "ds-map-why", text: p.reasons.join(" · ") }),
  ]);
}

function section(title: string, rows: HTMLElement[], hint?: string): HTMLElement {
  const box = h("details", { className: "ds-card" });
  box.open = true;
  box.append(h("summary", { text: `${title} · ${rows.length}` }));
  if (hint) box.append(h("p", { className: "ds-hint", text: hint }));
  if (rows.length === 0) box.append(h("p", { className: "ds-hint", text: "Нечего показать с этим фильтром" }));
  box.append(...rows);
  return box;
}

function render(): void {
  const map = current;
  if (!map) return;
  const all = [...map.colors, ...map.texts, ...map.radii, ...map.spacing].map((x) => x.proposal);
  const sure = all.filter((p) => p.confidence === "high").length;
  const gaps = all.filter((p) => !p.target).length;
  el("map-summary").textContent =
    `Продукт «${map.basis.productName}», экранов ${map.screens}. Уверенно ${sure} из ${all.length}, спорно ${all.length - sure - gaps}, нет в продукте ${gaps}. ` +
    `Образцы: ${map.basis.exemplars ? "учтены" : "нет — роли только по именам токенов"}. Улик тёмной темы: ${map.basis.darkEvidence}. ` +
    `Пропущено: аннотаций ${map.skipped.annotations}, системных элементов ${map.skipped.system}, текстов со смешанным шрифтом ${map.skipped.mixedText}.`;
  el("map-filter").hidden = false;

  // Палитра — по местам в макете.
  const colorRows: HTMLElement[] = [];
  for (const use of ["background", "surface", "text", "icon", "stroke"]) {
    const items = map.colors.filter((c) => c.source.use === use && passes(c.proposal));
    if (!items.length) continue;
    colorRows.push(h("p", { className: "ds-map-group", text: USE_TITLE[use] }));
    for (const { source, proposal, target } of items) {
      const inside = source.inInstances ? ` · в компонентах ${source.inInstances}` : "";
      colorRows.push(
        row(
          [
            h("div", { className: "ds-map-line" }, [swatch(source.light, "светлая"), swatch(source.dark, "тёмная"), focusLink(source.label, source.examples[0])]),
            h("div", { className: "ds-screen__meta", text: `×${source.count}${inside}` }),
          ],
          [
            h("div", { className: "ds-map-line" }, [swatch(target?.light, "светлая"), swatch(target?.dark, "тёмная"), h("span", { text: proposal.target?.name ?? "нет токена" })]),
          ],
          proposal,
        ),
      );
    }
  }

  const textRows = map.texts
    .filter((t) => passes(t.proposal))
    .map(({ source, proposal, target }) =>
      row(
        [
          focusLink(source.label, source.examples[0]),
          h("div", { className: "ds-screen__meta", text: `×${source.count}${CASE_LABEL[source.visibleCase] ? ` · ${CASE_LABEL[source.visibleCase]}` : ""}` }),
        ],
        [h("span", { text: proposal.target?.name ?? "нет стиля" }), h("div", { className: "ds-screen__meta", text: target ? `${target.fontFamily} ${target.size} / ${target.weight}` : "" })],
        proposal,
      ),
    );

  const valueRows = (items: StyleMap["radii"]) =>
    items
      .filter((v) => passes(v.proposal))
      .map(({ source, proposal, target }) =>
        row(
          [focusLink(String(source.value), source.examples[0]), h("div", { className: "ds-screen__meta", text: `×${source.count}` })],
          [h("span", { text: proposal.target ? `${proposal.target.name}${target ? ` · ${target.value}` : ""}` : "нет токена" })],
          proposal,
        ),
      );

  el("map-sections").replaceChildren(
    section("Палитра", colorRows, "Слева — как было (светлая, тёмная), справа — токен продукта в его светлом и тёмном режиме."),
    section("Текст", textRows, "Уровни исходника → стили продукта по рангу; порядок сохраняется."),
    section("Радиусы", valueRows(map.radii)),
    section("Отступы", valueRows(map.spacing)),
  );
}

export function initMap(status: (text: string) => void): void {
  setStatus = status;
  el("map-build").addEventListener("click", () => {
    el<HTMLButtonElement>("map-build").disabled = true;
    setStatus("Строю карту стиля…");
    send({ type: "style-map" });
  });
  for (const b of el("map-filter").querySelectorAll<HTMLButtonElement>("button")) {
    b.addEventListener("click", () => {
      filter = b.dataset.filter as Filter;
      for (const x of el("map-filter").querySelectorAll("button")) x.setAttribute("aria-pressed", String(x === b));
      render();
    });
  }
}

export const mapHandlers = {
  map(map: StyleMap): void {
    current = map;
    choice.clear();
    el<HTMLButtonElement>("map-build").disabled = false;
    render();
    setStatus("Карта стиля готова — ничего не изменено");
  },
  failed(): void {
    el<HTMLButtonElement>("map-build").disabled = false;
  },
};
