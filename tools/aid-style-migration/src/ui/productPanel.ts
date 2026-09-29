/** Вкладка «Продукт»: профиль, материалы, индексация открытого файла, тема. */

import { THEME_ROLES, type ThemeRole } from "../lib/vocabulary";
import type { ProfileState } from "../profile/controller";
import { EXEMPLAR_LIMIT, type ExemplarScope } from "../profile/usage";
import type { FileSurvey } from "../profile/indexFile";
import { MATERIAL_LABELS, type Material, type MaterialKind } from "../profile/types";
import { badge, el, h, send } from "./dom";

const STAT_LABELS: Record<string, string> = {
  collections: "коллекций",
  variables: "переменных",
  hiddenVariables: "скрытых от публикации (в перевод не идут)",
  textStyles: "стилей текста",
  effectStyles: "стилей эффектов",
  sets: "наборов",
  variants: "вариантов",
  components: "компонентов",
  screens: "экранов прочитано",
  darkScreens: "из них тёмных",
  usedVariables: "токенов в ходу",
  fromProduct: "из них из токенов продукта",
  sameNameOnly: "то же имя, другой ключ (копия библиотеки?)",
  localInFile: "локальные в файле образцов",
  otherLibraries: "из других библиотек",
  usedTextStyles: "стилей текста в ходу",
  usedComponents: "компонентов в ходу",
  annotationsSkipped: "аннотаций и выносок пропущено",
};

const ROLE_LABELS: Record<ThemeRole, string> = {
  [THEME_ROLES.light]: "светлая",
  [THEME_ROLES.dark]: "тёмная",
  [THEME_ROLES.other]: "другое",
};

/** Что можно проиндексировать из открытого файла сейчас. Стандарты — пакетом, позже. */
const INDEXABLE: MaterialKind[] = ["tokens", "components", "icons", "exemplars"];

let current: ProfileState | null = null;
let setStatus: (text: string) => void = () => undefined;

function statsText(stats: Record<string, number>): string {
  return Object.entries(stats)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${STAT_LABELS[k] ?? k} ${n}`)
    .join(", ");
}

function materialRow(m: Material, state: ProfileState): HTMLElement {
  const status = state.libraries.find((l) => l.materialId === m.id)?.enabled;
  const meta: Array<Node | string> = [statsText(m.stats) || "пусто"];
  if (status === true) meta.push(badge("подключена в этом файле", "success"));
  if (status === false) meta.push(badge("не подключена в этом файле", "warning"));

  // В два шага: материал с индексом легко убрать случайно, а собирать его заново — долго.
  const drop = h("button", { className: "ds-link", text: "убрать", type: "button" });
  drop.addEventListener("click", () => {
    if (!drop.dataset.armed) {
      drop.dataset.armed = "1";
      drop.textContent = "точно убрать?";
      setTimeout(() => {
        delete drop.dataset.armed;
        drop.textContent = "убрать";
      }, 4000);
      return;
    }
    send({ type: "material-remove", id: m.id });
  });

  return h("div", { className: "ds-material" }, [
    h("div", { className: "ds-material__body" }, [
      h("div", {}, [badge(MATERIAL_LABELS[m.kind], "info"), ` ${m.fileName}`]),
      h("div", { className: "ds-screen__meta" }, meta),
      ...(m.notes ?? []).map((n) => h("div", { className: "ds-screen__meta", text: n })),
      h("div", { className: "ds-screen__meta", text: `прочитан ${new Date(m.indexedAt).toLocaleString("ru-RU")}` }),
    ]),
    drop,
  ]);
}

function renderTheme(state: ProfileState): void {
  const card = el("theme-card");
  const profile = state.active;
  card.hidden = !profile || state.themeCandidates.length === 0;
  if (card.hidden || !profile) return;

  const select = el<HTMLSelectElement>("theme-collection");
  select.replaceChildren(
    h("option", { text: "— темы нет —" }),
    ...state.themeCandidates.map((c) => {
      const o = h("option", { text: `${c.name} · ${c.modes.map((m) => m.name).join(" / ")}` });
      o.value = c.key;
      return o;
    }),
  );
  select.value = profile.theme?.collectionKey ?? "";
  if (!profile.theme) select.selectedIndex = 0;
  renderModes(state);
}

function renderModes(state: ProfileState): void {
  const key = el<HTMLSelectElement>("theme-collection").value;
  const candidate = state.themeCandidates.find((c) => c.key === key);
  const saved = state.active?.theme?.collectionKey === key ? state.active.theme : null;
  el("theme-modes").replaceChildren(
    ...(candidate?.modes ?? []).map((m) => {
      const role = h("select", { className: "ds-input" });
      role.dataset.mode = m.modeId;
      role.setAttribute("aria-label", `Роль режима ${m.name}`);
      for (const r of Object.values(THEME_ROLES)) {
        const o = h("option", { text: ROLE_LABELS[r] });
        o.value = r;
        role.append(o);
      }
      role.value = saved?.modes.find((x) => x.modeId === m.modeId)?.role ?? THEME_ROLES.other;
      return h("label", { className: "ds-mode" }, [h("span", { text: m.name }), role]);
    }),
  );
}

function render(state: ProfileState): void {
  current = state;
  const select = el<HTMLSelectElement>("profile-select");
  select.replaceChildren(
    ...(state.profiles.length
      ? state.profiles.map((p) => {
          const o = h("option", { text: p.name });
          o.value = p.id;
          return o;
        })
      : [h("option", { text: "— продуктов пока нет —" })]),
  );
  select.disabled = state.profiles.length === 0;
  if (state.active) select.value = state.active.id;
  el("profile-delete").hidden = !state.active;
  el<HTMLButtonElement>("profile-export").disabled = !state.active;

  const profile = state.active;
  el("materials-card").hidden = !profile;
  if (profile) {
    el("materials-list").replaceChildren(
      ...(profile.materials.length
        ? profile.materials.map((m) => materialRow(m, state))
        : [h("p", { className: "ds-hint", text: "Материалов пока нет" })]),
    );
    el("missing-list").replaceChildren(
      ...state.missing.map((m) => h("div", { text: `Нет: ${MATERIAL_LABELS[m.kind].toLowerCase()} — ${m.impact}` })),
    );
  }
  renderTheme(state);
}

function scopeChoice(screens: number): HTMLElement {
  const option = (value: ExemplarScope, text: string, checked: boolean) => {
    const input = h("input");
    input.type = "radio";
    input.name = "exemplar-scope";
    input.value = value;
    input.checked = checked;
    return h("label", { className: "ds-check" }, [input, h("span", { text })]);
  };
  return h("div", {}, [
    option("page", `текущая страница · экранов ${screens}`, true),
    option("selection", "только выделенное", false),
  ]);
}

function renderSurvey(survey: FileSurvey): void {
  const parts = [
    survey.variables ? `переменных ${survey.variables} в ${survey.collections} коллекц.` : "",
    survey.textStyles ? `стилей текста ${survey.textStyles}` : "",
    survey.effectStyles ? `стилей эффектов ${survey.effectStyles}` : "",
    survey.components ? `компонентов ${survey.components}${survey.componentSets ? ` (наборов ${survey.componentSets})` : ""}` : "",
    survey.screensOnPage ? `экранов на текущей странице ${survey.screensOnPage}` : "",
  ].filter(Boolean);
  el("survey-summary").textContent = `«${survey.fileName}»: ${parts.join(", ") || "ничего подходящего"}. Чем этот файл служит продукту?`;
  el("survey-kinds").replaceChildren(
    ...INDEXABLE.map((kind) => {
      const input = h("input");
      input.type = "checkbox";
      input.value = kind;
      input.checked = survey.suggested.includes(kind);
      return h("label", { className: "ds-check" }, [input, h("span", { text: MATERIAL_LABELS[kind] })]);
    }),
    h("div", { className: "ds-hint", text: `Образцы читаются с текущей страницы или из выделения — не больше ${EXEMPLAR_LIMIT} экранов, равномерно.` }),
    scopeChoice(survey.screensOnPage),
  );
  el("survey-box").hidden = false;
}

export function initProduct(status: (text: string) => void): void {
  setStatus = status;

  el<HTMLSelectElement>("profile-select").addEventListener("change", (e) => {
    send({ type: "profile-select", id: (e.target as HTMLSelectElement).value });
  });
  el("profile-create").addEventListener("click", () => {
    const input = el<HTMLInputElement>("profile-name");
    const name = input.value.trim();
    if (!name) {
      setStatus("Введите название продукта");
      return;
    }
    input.value = "";
    send({ type: "profile-create", name });
  });
  // Двухшаговое удаление: confirm() в iframe плагина ненадёжен.
  const del = el<HTMLButtonElement>("profile-delete");
  del.addEventListener("click", () => {
    const profile = current?.active;
    if (!profile) return;
    if (del.dataset.armed !== profile.id) {
      del.dataset.armed = profile.id;
      del.textContent = "точно удалить вместе с индексами?";
      setTimeout(() => {
        delete del.dataset.armed;
        del.textContent = "удалить";
      }, 4000);
      return;
    }
    delete del.dataset.armed;
    del.textContent = "удалить";
    send({ type: "profile-delete", id: profile.id });
  });
  el("profile-export").addEventListener("click", () => send({ type: "profile-export" }));
  el("profile-import").addEventListener("click", () => el<HTMLInputElement>("profile-file").click());
  el<HTMLInputElement>("profile-file").addEventListener("change", async (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (file) send({ type: "profile-import", text: await file.text() });
  });

  el("survey").addEventListener("click", () => {
    setStatus("Изучаю открытый файл…");
    send({ type: "file-survey" });
  });
  el("index-file").addEventListener("click", () => {
    const kinds = [...el("survey-kinds").querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')]
      .map((i) => i.value as MaterialKind)
      .filter((k) => INDEXABLE.includes(k));
    if (!kinds.length) {
      setStatus("Отметьте, чем служит файл");
      return;
    }
    el("survey-box").hidden = true;
    setStatus("Индексирую…");
    const scope = el("survey-kinds").querySelector<HTMLInputElement>('input[name="exemplar-scope"]:checked');
    send({ type: "file-index", kinds, exemplarScope: (scope?.value as ExemplarScope) ?? "page" });
  });

  el("theme-collection").addEventListener("change", () => current && renderModes(current));
  el("theme-save").addEventListener("click", () => {
    const key = el<HTMLSelectElement>("theme-collection").value || null;
    const roles: Record<string, ThemeRole> = {};
    for (const s of el("theme-modes").querySelectorAll<HTMLSelectElement>("select")) roles[s.dataset.mode!] = s.value as ThemeRole;
    if (key && !Object.values(roles).includes(THEME_ROLES.dark)) {
      setStatus("Отметьте, какой режим тёмный");
      return;
    }
    send({ type: "theme-set", collectionKey: key, roles });
    setStatus("Тема сохранена");
  });

  send({ type: "profile-load" });
}

export const productHandlers = {
  state(state: ProfileState): void {
    render(state);
  },
  survey(survey: FileSurvey): void {
    renderSurvey(survey);
    setStatus("");
  },
  exported(fileName: string, text: string): void {
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(`Профиль выгружен: ${fileName}`);
  },
  progress(title: string): void {
    setStatus(`Индексирую: ${title}…`);
  },
};
