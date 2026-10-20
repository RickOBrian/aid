/**
 * «Записать изменения» (changelog-guide §6): сравнение библиотеки со снимком
 * последней опубликованной версии и сборка записи «Не опубликовано».
 *
 * Модуль чистый — без Plugin API. Снимок снимают lib/changelogSnapshot.ts,
 * таблицу в Figma обновляет lib/changelogTable.ts, отправку делает code.ts.
 *
 * Запись каждый раз собирается целиком из разницы «опубликованный снимок →
 * текущее состояние»: повторное нажатие не дописывает изменения второй раз,
 * а заменяет «Не опубликовано» новой полной картиной. Фразы, которые дизайнер
 * уже написал, переносятся по ключу группы (`group`).
 */

export type ChangeKind = "added" | "changed" | "removed" | "fixed" | "deprecated";
export type BumpType = "major" | "minor" | "patch";

/** Значение переменной в одном режиме — уже в виде для чейнжлога: `#2D6CDF`, `#000000 30%`, `{Text/Primary}`, `16`. */
export interface VariableSnapshotItem {
  id: string;
  name: string;
  /** modeId → значение. */
  values: Record<string, string>;
  scopes: string[];
  description: string;
}

export interface VariablesSnapshot {
  kind: "variables";
  collectionId: string;
  collectionName: string;
  modes: Array<{ id: string; name: string }>;
  items: VariableSnapshotItem[];
}

export interface ComponentSnapshotItem {
  id: string;
  name: string;
  /** Имена вариантов набора, отсортированы; у одиночного компонента — пусто. */
  variants: string[];
  /** Свойство → краткое описание: `VARIANT: Off, On`, `BOOLEAN = true`. */
  properties: Record<string, string>;
  description: string;
}

export interface ComponentsSnapshot {
  kind: "components";
  items: ComponentSnapshotItem[];
}

export type LibrarySnapshot = VariablesSnapshot | ComponentsSnapshot;

/** Изменение в формате changelog-guide §5. */
export interface ChangelogChange {
  kind: ChangeKind;
  description: string;
  details?: string;
}

/** Запись «Не опубликовано»: версия и дата ставятся только на границе релиза. */
export interface UnpublishedEntry {
  version: null;
  date: null;
  author: string;
  type: BumpType;
  changes: ChangelogChange[];
}

/** Изменение, как его показывает плагин до отправки. */
export interface DraftChange extends ChangelogChange {
  /** Стабильный ключ группы — по нему переносится фраза дизайнера. */
  group: string;
  bump: BumpType;
  /** Подсказка, что изменилось, — для полей, где фразу пишет автор. */
  hint: string;
}

const BUMP_ORDER: Record<BumpType, number> = { patch: 0, minor: 1, major: 2 };

export function maxBump(bumps: BumpType[]): BumpType {
  return bumps.reduce<BumpType>((max, bump) => (BUMP_ORDER[bump] > BUMP_ORDER[max] ? bump : max), "patch");
}

/** Список имён для фразы: до трёх — через запятую, больше — числом. */
function namesPhrase(names: string[], one: string, many: string, counted: (n: number) => string): string {
  if (names.length === 1) return `${one} ${names[0]}`;
  if (names.length <= 3) return `${many}: ${names.join(", ")}`;
  return counted(names.length);
}

/** «переменная / переменные / переменных» по правилам русского числа. */
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function variablesWord(n: number): string {
  return `${n} ${pluralRu(n, "переменной", "переменных", "переменных")}`;
}

function formatValues(item: VariableSnapshotItem, modes: VariablesSnapshot["modes"]): string {
  if (modes.length === 1) return item.values[modes[0].id] ?? "";
  return modes
    .filter((mode) => item.values[mode.id] !== undefined)
    .map((mode) => `${mode.name} ${item.values[mode.id]}`)
    .join(", ");
}

function sameList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/** Разница двух снимков одной коллекции переменных. */
export function diffVariables(base: VariablesSnapshot, current: VariablesSnapshot): DraftChange[] {
  const changes: DraftChange[] = [];
  const baseById = new Map(base.items.map((item) => [item.id, item]));
  const currentById = new Map(current.items.map((item) => [item.id, item]));
  const baseModes = new Map(base.modes.map((mode) => [mode.id, mode.name]));
  const currentModes = new Map(current.modes.map((mode) => [mode.id, mode.name]));

  // Режимы коллекции
  const addedModes = current.modes.filter((mode) => !baseModes.has(mode.id)).map((mode) => mode.name);
  const removedModes = base.modes.filter((mode) => !currentModes.has(mode.id)).map((mode) => mode.name);
  const renamedModes = current.modes
    .filter((mode) => baseModes.has(mode.id) && baseModes.get(mode.id) !== mode.name)
    .map((mode) => `${baseModes.get(mode.id)} → ${mode.name}`);

  if (addedModes.length > 0) {
    changes.push({
      group: "modes-added",
      kind: "added",
      bump: "minor",
      description: namesPhrase(addedModes, "Добавлен режим", "Добавлены режимы", (n) => `Добавлено режимов: ${n}`),
      details: addedModes.join("\n"),
      hint: "",
    });
  }
  if (removedModes.length > 0) {
    changes.push({
      group: "modes-removed",
      kind: "removed",
      bump: "major",
      description: namesPhrase(removedModes, "Удалён режим", "Удалены режимы", (n) => `Удалено режимов: ${n}`),
      details: removedModes.join("\n"),
      hint: "",
    });
  }
  if (renamedModes.length > 0) {
    changes.push({
      group: "modes-renamed",
      kind: "changed",
      bump: "major",
      description: renamedModes.length === 1 ? `Переименован режим ${renamedModes[0]}` : "Переименованы режимы",
      details: renamedModes.join("\n"),
      hint: "",
    });
  }

  // Переменные
  const added = current.items.filter((item) => !baseById.has(item.id));
  const removed = base.items.filter((item) => !currentById.has(item.id));
  const renamed: string[] = [];
  const valueLines: string[] = [];
  const valueNames: string[] = [];
  const scopeLines: string[] = [];
  const scopeNames: string[] = [];
  const descriptionLines: string[] = [];
  const descriptionNames: string[] = [];

  for (const item of current.items) {
    const before = baseById.get(item.id);
    if (!before) continue;
    if (before.name !== item.name) renamed.push(`${before.name} → ${item.name}`);

    let valueChanged = false;
    for (const mode of current.modes) {
      if (!baseModes.has(mode.id)) continue; // новый режим — уже в «Добавлен режим»
      const was = before.values[mode.id];
      const now = item.values[mode.id];
      if (was === undefined || now === undefined || was === now) continue;
      const label = current.modes.length === 1 ? item.name : `${item.name} ${mode.name}`;
      valueLines.push(`${label}: ${was} → ${now}`);
      valueChanged = true;
    }
    if (valueChanged) valueNames.push(item.name);

    const wasScopes = [...before.scopes].sort();
    const nowScopes = [...item.scopes].sort();
    if (!sameList(wasScopes, nowScopes)) {
      scopeLines.push(`${item.name}: ${wasScopes.join(", ") || "—"} → ${nowScopes.join(", ") || "—"}`);
      scopeNames.push(item.name);
    }

    if (before.description !== item.description) {
      descriptionLines.push(`${item.name}: «${before.description}» → «${item.description}»`);
      descriptionNames.push(item.name);
    }
  }

  if (added.length > 0) {
    changes.push({
      group: "variables-added",
      kind: "added",
      bump: "minor",
      description: namesPhrase(
        added.map((item) => item.name),
        "Добавлена переменная",
        "Добавлены переменные",
        (n) => `Добавлено переменных: ${n}`
      ),
      details: added.map((item) => `${item.name}: ${formatValues(item, current.modes)}`).join("\n"),
      hint: "",
    });
  }
  if (removed.length > 0) {
    changes.push({
      group: "variables-removed",
      kind: "removed",
      bump: "major",
      description: namesPhrase(
        removed.map((item) => item.name),
        "Удалена переменная",
        "Удалены переменные",
        (n) => `Удалено переменных: ${n}`
      ),
      details: removed.map((item) => item.name).join("\n"),
      hint: "",
    });
  }
  if (renamed.length > 0) {
    changes.push({
      group: "variables-renamed",
      kind: "changed",
      bump: "major",
      description: renamed.length === 1 ? `Переименована переменная ${renamed[0]}` : `Переименовано переменных: ${renamed.length}`,
      details: renamed.join("\n"),
      hint: "",
    });
  }
  if (valueLines.length > 0) {
    changes.push({
      group: "variables-values",
      kind: "changed",
      bump: "patch",
      description:
        valueNames.length === 1
          ? `Изменено значение ${valueNames[0]}`
          : `Изменены значения ${variablesWord(valueNames.length)}`,
      details: valueLines.join("\n"),
      hint: "",
    });
  }
  if (scopeLines.length > 0) {
    changes.push({
      group: "variables-scopes",
      kind: "changed",
      bump: "patch",
      description:
        scopeNames.length === 1
          ? `Изменена область применения ${scopeNames[0]}`
          : `Изменена область применения ${variablesWord(scopeNames.length)}`,
      details: scopeLines.join("\n"),
      hint: "",
    });
  }
  if (descriptionLines.length > 0) {
    changes.push({
      group: "variables-descriptions",
      kind: "changed",
      bump: "patch",
      description:
        descriptionNames.length === 1
          ? `Изменено описание ${descriptionNames[0]}`
          : `Изменены описания ${variablesWord(descriptionNames.length)}`,
      details: descriptionLines.join("\n"),
      hint: "",
    });
  }

  return changes;
}

/**
 * Разница двух снимков компонентов или иконок. Фразу пишет автор: плагин
 * показывает, что изменилось (имена, варианты, свойства), и оставляет
 * `description` пустым.
 */
export function diffComponents(base: ComponentsSnapshot, current: ComponentsSnapshot): DraftChange[] {
  const baseById = new Map(base.items.map((item) => [item.id, item]));
  const currentById = new Map(current.items.map((item) => [item.id, item]));
  const changes: DraftChange[] = [];

  const added = current.items.filter((item) => !baseById.has(item.id));
  const removed = base.items.filter((item) => !currentById.has(item.id));
  const renamed: string[] = [];
  const variantsAdded: string[] = [];
  const variantsRemoved: string[] = [];
  const propertiesAdded: string[] = [];
  const propertiesRemoved: string[] = [];
  const propertiesChanged: string[] = [];
  const descriptions: string[] = [];

  for (const item of current.items) {
    const before = baseById.get(item.id);
    if (!before) continue;
    if (before.name !== item.name) renamed.push(`${before.name} → ${item.name}`);

    const wasVariants = new Set(before.variants);
    const nowVariants = new Set(item.variants);
    const plus = item.variants.filter((variant) => !wasVariants.has(variant));
    const minus = before.variants.filter((variant) => !nowVariants.has(variant));
    if (plus.length > 0) variantsAdded.push(`${item.name}: ${plus.join("; ")}`);
    if (minus.length > 0) variantsRemoved.push(`${item.name}: ${minus.join("; ")}`);

    for (const [property, value] of Object.entries(item.properties)) {
      const was = before.properties[property];
      if (was === undefined) propertiesAdded.push(`${item.name} · ${property}: ${value}`);
      else if (was !== value) propertiesChanged.push(`${item.name} · ${property}: ${was} → ${value}`);
    }
    for (const property of Object.keys(before.properties)) {
      if (item.properties[property] === undefined) propertiesRemoved.push(`${item.name} · ${property}`);
    }

    if (before.description !== item.description) {
      descriptions.push(`${item.name}: «${before.description}» → «${item.description}»`);
    }
  }

  const push = (group: string, kind: ChangeKind, bump: BumpType, hint: string, lines: string[]): void => {
    if (lines.length === 0) return;
    changes.push({ group, kind, bump, description: "", details: lines.join("\n"), hint });
  };

  push(
    "components-added",
    "added",
    "minor",
    "Добавлены",
    added.map((item) => (item.variants.length > 0 ? `${item.name} (${item.variants.length} вар.)` : item.name))
  );
  push("components-removed", "removed", "major", "Удалены", removed.map((item) => item.name));
  push("components-renamed", "changed", "major", "Переименованы", renamed);
  push("variants-added", "added", "minor", "Добавлены варианты", variantsAdded);
  push("variants-removed", "removed", "major", "Удалены варианты", variantsRemoved);
  push("properties-added", "added", "minor", "Добавлены свойства", propertiesAdded);
  push("properties-removed", "removed", "major", "Удалены свойства", propertiesRemoved);
  push("properties-changed", "changed", "minor", "Изменены свойства", propertiesChanged);
  push("components-descriptions", "changed", "patch", "Изменены описания", descriptions);

  return changes;
}

export function diffSnapshots(base: LibrarySnapshot, current: LibrarySnapshot): DraftChange[] {
  if (base.kind === "variables" && current.kind === "variables") return diffVariables(base, current);
  if (base.kind === "components" && current.kind === "components") return diffComponents(base, current);
  throw new Error("Снимки разного вида сравнивать нельзя.");
}

/** Перенести фразы, которые дизайнер уже написал, на свежий черновик. */
export function applySavedDescriptions(drafts: DraftChange[], saved: Record<string, string>): DraftChange[] {
  return drafts.map((draft) => {
    const description = saved[draft.group];
    return description && description.trim() ? { ...draft, description } : draft;
  });
}

/** Ошибки записи, которые не дают её отправить. */
export function validateDrafts(drafts: DraftChange[], author: string): string[] {
  const problems: string[] = [];
  if (drafts.length === 0) problems.push("Изменений нет — записывать нечего.");
  if (!author.trim()) problems.push("Укажите автора.");
  for (const draft of drafts) {
    if (!draft.description.trim()) {
      problems.push(`Нет описания: ${draft.hint || draft.group}.`);
    }
  }
  return problems;
}

export function buildUnpublishedEntry(drafts: DraftChange[], author: string): UnpublishedEntry {
  return {
    version: null,
    date: null,
    author: author.trim(),
    type: maxBump(drafts.map((draft) => draft.bump)),
    changes: drafts.map((draft) => ({
      kind: draft.kind,
      description: draft.description.trim(),
      ...(draft.details ? { details: draft.details } : {}),
    })),
  };
}

/** Фразы по группам — их плагин хранит в файле, чтобы не просить написать заново. */
export function descriptionsByGroup(drafts: DraftChange[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const draft of drafts) {
    if (draft.description.trim()) result[draft.group] = draft.description.trim();
  }
  return result;
}

/**
 * Состояние снимков в файле библиотеки.
 *
 * - `published` — состояние на последней опубликованной версии `baseVersion`;
 * - `recorded` — состояние на момент последнего «Записать изменения».
 *
 * Когда в чейнжлоге main `currentVersion` больше не равен `baseVersion`,
 * значит, «Не опубликовано» получило версию: опубликованным становится
 * записанное состояние.
 */
export interface ChangelogBaseline {
  baseVersion: string | null;
  published: LibrarySnapshot;
  recorded: LibrarySnapshot | null;
}

export interface ResolvedBaseline {
  baseline: ChangelogBaseline;
  /** true — снимок сдвинут после публикации, его нужно сохранить. */
  advanced: boolean;
}

export function resolveBaseline(stored: ChangelogBaseline, mainCurrentVersion: string | null): ResolvedBaseline {
  if (stored.baseVersion === mainCurrentVersion) return { baseline: stored, advanced: false };
  return {
    baseline: {
      baseVersion: mainCurrentVersion,
      published: stored.recorded ?? stored.published,
      recorded: null,
    },
    advanced: true,
  };
}

/** Kind → подпись бейджа в таблице Figma (changelog-guide §5 «Таблица в Figma»). */
export const KIND_LABELS: Record<ChangeKind, string> = {
  added: "Добавлено",
  changed: "Изменено",
  removed: "Удалено",
  fixed: "Исправлено",
  deprecated: "Устарело",
};

/** Пути чейнжлогов, которые плагин может записывать. Сервер проверяет то же. */
export const CHANGELOG_PATH_PATTERN = /^(tokens|components)\/[a-z0-9][a-z0-9-]*-changelog\.json$/;

/** Делит длинную строку на куски: у sharedPluginData предел 100 kB на запись. */
export function splitIntoChunks(text: string, size: number): string[] {
  if (text.length === 0) return [""];
  const chunks: string[] = [];
  for (let start = 0; start < text.length; start += size) chunks.push(text.slice(start, start + size));
  return chunks;
}
