/**
 * Карточка «Язык продукта» во вкладке «Продукт»: изучить образцы в
 * открытом файле, ответить на анкету по одному вопросу, посмотреть все
 * правила, выгрузить файл языка. Подробности вопроса — на доске на
 * канвасе (решение Б): окно принимает решения, канвас показывает.
 */

import { isOpen, type Question } from "../core/questions";
import { CONCEPT_LABELS } from "../core/tokenTerms";
import { DOMINANT_SHARE, languageStats, type LanguageRule, type RuleStatus, type RuleValue, type StyleLanguage } from "../core/language";
import { GROUP_LABELS, GROUP_ORDER, roleGroup, roleLabel } from "../core/roleLabels";
import type { ProfileState } from "../profile/controller";
import type { ScanScope } from "../assemble/types";
import type { PageInfo } from "../messages";
import { badge, el, h, send } from "./dom";

/** Статусы — действиями, а не оценками (замечание Principal Designer). */
const STATUS: Record<RuleStatus, [string, "neutral" | "success" | "info" | "warning" | "danger"]> = {
  proposed: ["правило есть", "info"],
  confirmed: ["решено", "success"],
  disputed: ["нужно ваше решение", "warning"],
  missing: ["образцов нет", "neutral"],
};

const CASES: Record<string, string> = { upper: "КАПС", lower: "строчные", title: "Каждое Слово", sentence: "Как в предложении", mixed: "смешанный" };

type Filter = "all" | "open";
let filter: Filter = "all";
let scopeKind: ScanScope["kind"] = "pages";
let pages: PageInfo[] = [];
const checkedPages = new Set<string>();
let selectionCount = 0;
let lastState: ProfileState | null = null;
/** Какой вопрос показан: id, чтобы после ответа не терять место. */
let currentId: string | null = null;

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

/** Похожее на ошибку сборки образца: сколько не учтено и сколько учтено с пометкой. */
function asideNote(r: LanguageRule): string {
  const aside = (r.setAside ?? []).reduce((n, v) => n + v.count, 0);
  const parts: string[] = [];
  if (aside) parts.push(`не учтено ${aside} — похоже на ошибку в образце`);
  if (r.suspectKept) parts.push(`${r.suspectKept} похожи на ошибку, но их большинство — учтены`);
  return parts.length ? `⚠ ${parts.join("; ")} (см. «Ошибки в образцах»)` : "";
}

function ruleRow(r: LanguageRule): HTMLElement {
  const row = ruleBody(r);
  const note = asideNote(r);
  if (note) row.appendChild(h("div", { className: "ds-screen__meta", text: note }));
  return row;
}

function ruleBody(r: LanguageRule): HTMLElement {
  const [text, tone] = STATUS[r.status];
  const head = h("div", { className: "ds-map-line" }, [h("span", { text: roleLabel(r.role) }), badge(text, tone)]);
  if (r.status === "missing") {
    return h("div", { className: "ds-lang-row" }, [head, h("div", { className: "ds-screen__meta", text: "В изученных образцах такого элемента нет — ответьте в анкете, как его оформлять" })]);
  }
  if (r.decision) {
    return h("div", { className: "ds-lang-row" }, [head, h("div", { className: "ds-screen__meta", text: `Решение: ${r.decision.label}` })]);
  }
  if (r.byComponent?.length) {
    // Разные варианты компонента — не спор: у каждого своё значение.
    return h("div", { className: "ds-lang-row" }, [
      head,
      h("div", { className: "ds-screen__meta", text: "Зависит от компонента — у каждого варианта своё:" }),
      ...r.byComponent.slice(0, 5).map((b) => {
        const v = r.values[b.value];
        return h("div", { className: "ds-map-line" }, [swatch(v.hexLight, "светлая"), swatch(v.hexDark, "тёмная"), h("span", { text: `${b.component === "—" ? "нарисовано вручную" : b.component} — ${v.token?.name ?? v.hex}` })]);
      }),
    ]);
  }
  if (r.byState?.length) {
    return h("div", { className: "ds-lang-row" }, [
      head,
      h("div", { className: "ds-screen__meta", text: "Зависит от состояния — у отмеченного и неотмеченного своё:" }),
      ...r.byState.map((b) => {
        const v = r.values[b.value];
        return h("div", { className: "ds-map-line" }, [swatch(v.hexLight, "светлая"), swatch(v.hexDark, "тёмная"), h("span", { text: `${b.state === "on" ? "отмечен / включён" : "не отмечен / выключен"} — ${v.token?.name ?? v.hex}` })]);
      }),
    ]);
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

// ---------------------------------------------------------------------------
// Анкета — по одному вопросу
// ---------------------------------------------------------------------------

const KIND_LABEL: Record<Question["kind"], string> = {
  contradiction: "в образцах по-разному",
  gap: "в образцах нет",
  outlier: "отступления от правила",
  thin: "мало образцов",
  term: "словарь продукта",
};

function renderQuestion(state: ProfileState): void {
  const qs = state.questions;
  const box = el("question-box");
  box.hidden = qs.length === 0;
  if (!qs.length) return;
  let i = qs.findIndex((q) => q.id === currentId);
  if (i === -1) i = 0;
  const q = qs[i];
  currentId = q.id;
  const open = qs.filter((x) => isOpen(x, state.answers)).length;
  const answered = !isOpen(q, state.answers);
  el("q-counter").textContent = `Вопрос ${i + 1} из ${qs.length} · ${KIND_LABEL[q.kind]} · нужно решение: ${open}`;
  el("q-title").textContent = q.title;
  el("q-lines").replaceChildren(...q.lines.map((l) => h("div", { text: l })));

  const answer = state.answers[q.id];
  const options = q.options.map((o) => {
    const input = h("input");
    input.type = "radio";
    input.name = "q-option";
    input.value = o.id;
    input.checked = answer?.optionId === o.id;
    return h("label", {}, [input, h("span", { text: o.label })]);
  });
  const own = h("input");
  own.type = "radio";
  own.name = "q-option";
  own.value = "note";
  own.checked = answer?.optionId === "note";
  const note = h("textarea", { className: "ds-input" });
  note.id = "q-note";
  note.rows = 2;
  note.placeholder = "Свой вариант — например, «зелёная только для принятия заказа»";
  note.value = answer?.note ?? "";
  note.addEventListener("focus", () => (own.checked = true));
  el("q-options").replaceChildren(...options, h("label", {}, [own, h("span", { text: "Свой вариант" })]), note);

  const btn = el<HTMLButtonElement>("q-answer");
  btn.textContent = answered ? "Изменить ответ" : "Ответить";
  el<HTMLButtonElement>("q-prev").disabled = i === 0;
  el<HTMLButtonElement>("q-next").disabled = i === qs.length - 1;
}

function step(delta: number): void {
  const qs = lastState?.questions ?? [];
  const i = qs.findIndex((q) => q.id === currentId);
  const next = qs[Math.min(qs.length - 1, Math.max(0, i + delta))];
  if (next) currentId = next.id;
  render();
}

function submit(): void {
  const q = lastState?.questions.find((x) => x.id === currentId);
  if (!q) return;
  const picked = el("q-options").querySelector<HTMLInputElement>('input[name="q-option"]:checked');
  if (!picked) return;
  const note = el<HTMLTextAreaElement>("q-note").value.trim();
  if (picked.value === "note" && !note) return;
  // Ответили — следующий открытый вопрос, чтобы идти по анкете подряд.
  const qs = lastState?.questions ?? [];
  const i = qs.findIndex((x) => x.id === q.id);
  const nextOpen = qs.slice(i + 1).find((x) => isOpen(x, lastState?.answers ?? {}));
  send({ type: "language-answer", questionId: q.id, optionId: picked.value, ...(note ? { note } : {}) });
  if (nextOpen) currentId = nextOpen.id;
}

/** Находки для библиотеки: цвет без токена внутри компонента — вопрос к библиотеке, не к дизайнеру. */
function findingsList(lang: StyleLanguage): HTMLElement[] {
  const list = lang.findings ?? [];
  if (!list.length) return [];
  const fold = h("details", { className: "ds-fold" });
  fold.append(
    h("summary", { text: `Находки для библиотеки: ${list.length}` }),
    h("p", { className: "ds-hint", text: "Цвет без токена внутри компонента — задан в самом компоненте или переопределён в макете. В анкету не идёт: это предложение для библиотеки или повод поправить образец." }),
    ...list.slice(0, 15).map((f) => h("div", { className: "ds-map-line" }, [swatch(f.hex, "цвет"), h("span", { text: `${f.component} · ${roleLabel(f.role)} — ${f.hex}, ${f.count}` })])),
  );
  return [fold];
}

/** Ошибки в образцах: риск — ломается тема или контраст; сомнение — токен не того семейства, цвет без токена. */
function renderIssues(state: ProfileState): void {
  const issues = state.issues ?? [];
  el("issues-fold").hidden = !state.language;
  const risks = issues.filter((i) => i.level === "risk").length;
  el("issues-summary").textContent = `Ошибки в образцах: рисков ${risks}, сомнений ${issues.length - risks}`;
  el("issues-list").replaceChildren(
    ...(issues.length
      ? issues.slice(0, 40).map((i) =>
          h("div", { className: "ds-lang-row" }, [
            h("div", { className: "ds-map-line" }, [h("span", { text: i.title }), badge(i.level === "risk" ? "риск" : "сомнение", i.level === "risk" ? "danger" : "warning")]),
            ...i.lines.map((l) => h("div", { className: "ds-screen__meta", text: l })),
            h(
              "div",
              { className: "ds-map-line" },
              i.examples.map((e) => focusLink(`📍 ${e.screenName}`, e.nodeId, e.screenName)),
            ),
          ]),
        )
      : [h("p", { className: "ds-hint", text: "Ошибок не нашлось — или токены библиотеки не прочитаны (нужны значения в обеих темах)." })]),
  );
}

/** Словарь продукта: слово → смысл стандарта, подтверждено ли в анкете. */
function renderTerms(state: ProfileState): void {
  const terms = state.terms ?? [];
  el("terms-fold").hidden = terms.length === 0;
  if (!terms.length) return;
  const confirmed = (t: string) => state.answers[`term:${t}`]?.optionId;
  el("terms-summary").textContent = `Словарь продукта: ${terms.filter((t) => t.concept !== "mixed" && t.concept !== "themed").length} слов`;
  el("terms-list").replaceChildren(
    ...terms.map((t) => {
      const answer = confirmed(t.term);
      const meaning = t.concept === "mixed" ? "ведёт себя по-разному" : CONCEPT_LABELS[t.concept];
      const status = answer ? badge(answer === `concept:${t.concept}` ? "подтверждено" : "исправлено", "success") : t.concept === "mixed" || t.concept === "themed" ? badge("не модификатор", "neutral") : badge("нужно подтвердить", "warning");
      return h("div", { className: "ds-lang-row" }, [
        h("div", { className: "ds-map-line" }, [h("span", { text: `«${t.term}» — ${meaning}` }), status]),
        h("div", { className: "ds-screen__meta", text: `Пары: ${t.pairs.slice(0, 3).map((p) => `${p.token} к ${p.base}`).join(", ")}${t.pairs.length > 3 ? "…" : ""}` }),
      ]);
    }),
  );
}

/** Сверка со стандартами: ориентир, не решение; риск — может сломать тёмную тему. */
function renderStandards(state: ProfileState): void {
  const st = state.standards;
  el("standards-fold").hidden = !st || !state.language;
  if (!st) return;
  const risks = st.findings.filter((f) => f.level === "risk").length;
  el("standards-summary").textContent = `Сверка со стандартами ДС: рисков ${risks}, отличий ${st.findings.length - risks}`;
  el("standards-refs").textContent =
    `Стандарт — ориентир: подсказывает и сверяет, но не решает вместо образцов. Прочитано: ${st.refs.map((r) => `${r.id} ${r.version} (${r.status})`).join(", ")}.`;
  el("standards-list").replaceChildren(
    ...(st.findings.length
      ? st.findings.map((f) =>
          h("div", { className: "ds-lang-row" }, [
            h("div", { className: "ds-map-line" }, [h("span", { text: f.title }), badge(f.level === "risk" ? "риск" : "отличие", f.level === "risk" ? "danger" : "neutral")]),
            ...f.lines.map((l) => h("div", { className: "ds-screen__meta", text: l })),
          ]),
        )
      : [h("p", { className: "ds-hint", text: "Отличий от стандарта не нашлось" })]),
  );
}

function render(): void {
  const state = lastState;
  el("language-card").hidden = !state?.active;
  const lang = state?.language ?? null;
  el<HTMLButtonElement>("language-export").disabled = !lang;
  if (!lang || !state) {
    el("language-summary").textContent = "Образцы ещё не изучали.";
    el("language-sources").replaceChildren();
    el("language-rules").replaceChildren();
    el("question-box").hidden = true;
    return;
  }
  const s = languageStats(lang);
  el("language-summary").textContent =
    `Правило есть: ${s.proposed} · решено: ${s.confirmed} · нужно ваше решение: ${s.disputed} · образцов нет: ${s.missing}. ` +
    `Правило есть, если один вариант — не меньше ${Math.round(DOMINANT_SHARE * 100)} % случаев; иначе плагин спрашивает.`;
  renderQuestion(state);
  renderStandards(state);
  renderTerms(state);
  renderIssues(state);
  el("language-sources").replaceChildren(...sourcesList(lang), ...findingsList(lang));

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
      scopeKind = b.dataset.scope as ScanScope["kind"];
      renderScope();
    });
  }
  el("language-page-filter").addEventListener("input", renderPages);
  el("language-pages-all").addEventListener("click", () => {
    for (const p of filteredPages()) checkedPages.add(p.id);
    renderPages();
  });
  el("language-pages-none").addEventListener("click", () => {
    checkedPages.clear();
    renderPages();
  });
  for (const b of el("language-filter").querySelectorAll<HTMLButtonElement>("button")) {
    b.addEventListener("click", () => {
      filter = b.dataset.filter as Filter;
      for (const x of el("language-filter").querySelectorAll("button")) x.setAttribute("aria-pressed", String(x === b));
      render();
    });
  }
  el("language-learn").addEventListener("click", () => {
    if (scopeKind === "selection" && selectionCount === 0) {
      status("Выделите экраны образцов или выберите страницы");
      return;
    }
    if (scopeKind === "pages" && checkedPages.size === 0) {
      status("Отметьте хотя бы одну страницу с образцами");
      return;
    }
    status("Изучаю образцы…");
    const scope: ScanScope = scopeKind === "selection" ? { kind: "selection" } : { kind: "pages", pageIds: pages.filter((p) => checkedPages.has(p.id)).map((p) => p.id) };
    send({ type: "language-learn", scope });
  });
  el("language-export").addEventListener("click", () => send({ type: "language-export" }));
  el("q-answer").addEventListener("click", submit);
  el("q-prev").addEventListener("click", () => step(-1));
  el("q-next").addEventListener("click", () => step(1));
  el("q-board").addEventListener("click", () => {
    status("Собираю доску вопросов…");
    send({ type: "language-board", questionId: currentId });
  });
}

// ---------------------------------------------------------------------------
// Где образцы: выделение или несколько страниц
// ---------------------------------------------------------------------------

function filteredPages(): PageInfo[] {
  const q = el<HTMLInputElement>("language-page-filter").value.trim().toLowerCase();
  return q ? pages.filter((p) => p.name.toLowerCase().includes(q)) : pages;
}

function renderPages(): void {
  el("language-pages-list").replaceChildren(
    ...filteredPages().map((p) => {
      const input = h("input");
      input.type = "checkbox";
      input.checked = checkedPages.has(p.id);
      input.addEventListener("change", () => {
        if (input.checked) checkedPages.add(p.id);
        else checkedPages.delete(p.id);
      });
      return h("label", { className: "ds-check" }, [input, h("span", { text: p.name })]);
    }),
  );
}

function renderScope(): void {
  for (const x of el("language-scope").querySelectorAll<HTMLButtonElement>("button")) x.setAttribute("aria-pressed", String(x.dataset.scope === scopeKind));
  el("language-pages-box").hidden = scopeKind !== "pages";
}

export const languageHandlers = {
  /** Страницы файла; текущая отмечена сразу — чаще всего образцы на ней. */
  pages(list: PageInfo[], currentPageId: string, selected: number): void {
    pages = list;
    checkedPages.clear();
    if (list.some((p) => p.id === currentPageId)) checkedPages.add(currentPageId);
    languageHandlers.selection(selected);
    renderPages();
    renderScope();
  },
  selection(count: number): void {
    selectionCount = count;
    el("language-selection-count").textContent = String(count);
  },
};

export function renderLanguage(state: ProfileState): void {
  lastState = state;
  render();
}
