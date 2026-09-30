/**
 * Вкладка «Карта стиля» (этап 3a): стиль исходника → токены продукта.
 * Только анализ; выбор другого варианта здесь — черновик, сохранение
 * решений и применение — этап 3b.
 */

import type { Rgba } from "../map/color";
import type { ApplyResult, Decisions } from "../map/apply";
import type { Candidate, Confidence, Proposal, StyleMap } from "../map/types";
import { badge, el, h, send } from "./dom";

/** Что показывать: по умолчанию — только то, что требует решения (принцип «маленькое понятное окно»). */
type Filter = "decide" | "doubt" | "sure" | "all";

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
let filter: Filter = "decide";
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

/** Нужно решение: неуверенно или нет токена. Такие при применении не привязываются (решение 2026-09-30). */
function needsDecision(p: Proposal): boolean {
  return (p.confidence === "low" || p.target === null) && !choice.has(p.sourceId);
}

function passes(p: Proposal): boolean {
  if (filter === "decide") return needsDecision(p);
  if (filter === "doubt") return p.confidence === "medium" && p.target !== null;
  if (filter === "sure") return p.confidence === "high";
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
  // Для «нужно решение» выбор нужен даже из одного варианта — это и есть подтверждение.
  if (options.length === 0 || (options.length < 2 && !needsDecision(p))) return null;
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
    setStatus("Решение принято — будет применено. Смотреть — «Применить → ПОСЛЕ»");
    renderSummary();
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

function section(title: string, rows: HTMLElement[], hint?: string): HTMLElement | null {
  // Пустые разделы не показываем вовсе — окно маленькое.
  if (rows.length === 0) return null;
  const box = h("details", { className: "ds-card" });
  // Раскрыт только первый непустой раздел; остальные — по клику.
  box.open = !openedOne;
  openedOne = true;
  box.append(h("summary", { text: `${title} · ${rows.length}` }));
  if (hint) box.append(h("p", { className: "ds-hint", text: hint }));
  box.append(...rows);
  return box;
}

let openedOne = false;

function renderSummary(): void {
  const map = current;
  if (!map) return;
  const all = [...map.colors, ...map.texts, ...map.radii, ...map.spacing].map((x) => x.proposal);
  const decide = all.filter(needsDecision).length;
  const doubt = all.filter((p) => p.confidence === "medium" && p.target !== null).length;
  const sure = all.filter((p) => p.confidence === "high").length;
  el("map-summary").textContent =
    `«${map.basis.productName}», экранов ${map.screens}: уверенно ${sure}, спорно ${doubt}, нужно решение ${decide} — они не применятся, пока не выберете.` +
    (map.basis.exemplars ? "" : " Образцов нет — роли только по именам токенов.");
  const labels: Record<Filter, string> = { decide: `Нужно решение · ${decide}`, doubt: `Спорно · ${doubt}`, sure: `Уверенно · ${sure}`, all: "Все" };
  for (const b of el("map-filter").querySelectorAll<HTMLButtonElement>("button")) b.textContent = labels[b.dataset.filter as Filter];
}

function render(): void {
  const map = current;
  if (!map) return;
  renderSummary();
  el("map-summary").hidden = false;
  el("map-options").hidden = false;
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
            h("div", { className: "ds-screen__meta", text: `×${source.count}${inside} · ${source.origin}` }),
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

  openedOne = false;
  const sections = [
    section("Палитра", colorRows.filter((r) => !r.classList.contains("ds-map-group")).length ? colorRows : [], "Слева — как было (светлая, тёмная), справа — токен продукта в его светлом и тёмном режиме."),
    section("Текст", textRows, "Уровни исходника → стили продукта по рангу; порядок сохраняется."),
    section("Радиусы", valueRows(map.radii)),
    section("Отступы", valueRows(map.spacing)),
  ].filter((x): x is HTMLElement => x !== null);
  el("map-sections").replaceChildren(
    ...(sections.length ? sections : [h("p", { className: "ds-hint", text: filter === "decide" ? "Всё решено — можно применять" : "Нечего показать с этим фильтром" })]),
  );
}

/**
 * Решения для применения: ручной выбор или предложение карты, кроме
 * неуверенных — они остаются как в исходнике до решения («чисто, а не
 * грубо», 2026-09-30).
 */
function decisions(map: StyleMap): Decisions {
  const pick = (items: Array<{ proposal: Proposal }>) =>
    Object.fromEntries(
      items
        .map(({ proposal }) => [proposal.sourceId, choice.get(proposal.sourceId) ?? (needsDecision(proposal) ? undefined : proposal.target?.key)] as const)
        .filter((x): x is readonly [string, string] => Boolean(x[1])),
    );
  return {
    colors: pick(map.colors),
    texts: pick(map.texts),
    radii: pick(map.radii),
    spacing: pick(map.spacing),
    keepUpper: el<HTMLInputElement>("keep-upper").checked,
  };
}

function busy(on: boolean): void {
  for (const id of ["map-build", "map-remove"]) el<HTMLButtonElement>(id).disabled = on;
  el<HTMLButtonElement>("map-apply").disabled = on || !current;
}

export function initMap(status: (text: string) => void): void {
  setStatus = status;
  el("map-apply").addEventListener("click", () => {
    if (!current) return;
    busy(true);
    setStatus("Строю «ПОСЛЕ»…");
    send({ type: "style-apply", decisions: decisions(current) });
  });
  el("map-remove").addEventListener("click", () => {
    busy(true);
    setStatus("Убираю «ПОСЛЕ»…");
    send({ type: "style-remove" });
  });
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
    el<HTMLButtonElement>("map-apply").disabled = false;
    setStatus("Карта готова, макеты не менялись. Решите отмеченное или сразу «Применить → ПОСЛЕ»");
  },
  applied(r: ApplyResult & { unpairedDark?: number }): void {
    busy(false);
    const undecided = current ? [...current.colors, ...current.texts, ...current.radii, ...current.spacing].filter((x) => needsDecision(x.proposal)).length : 0;
    const failed = r.failed ? ` Не удалось ${r.failed}: ${r.failures.join("; ")}.` : "";
    setStatus(
      `«ПОСЛЕ» готово за ${(r.ms / 1000).toFixed(1)} с: экранов ${r.screens}; привязано цветов ${r.colors}, текстов ${r.texts}, радиусов ${r.radii}, отступов ${r.spacing}. ` +
        `Без решения оставлено ${undecided} — в «ПОСЛЕ» они как в исходнике.${failed}`,
    );
  },
  removed(rows: number): void {
    busy(false);
    setStatus(rows ? `«ПОСЛЕ» убрано: секций ${rows}. «ДО» и исходники не тронуты` : "Секций «ПОСЛЕ» нет");
  },
  failed(): void {
    busy(false);
  },
};
