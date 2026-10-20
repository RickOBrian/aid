/**
 * «Записать изменения» (changelog-guide §6) — главный поток.
 *
 * Плагин открыт в файле библиотеки:
 * 1. сервер отдаёт чейнжлоги из main; плагин оставляет те, чья таблица
 *    (`figmaTable`) есть в этом файле;
 * 2. первый раз дизайнер выбирает, что записывает таблица (коллекция
 *    переменных или компоненты), и принимает текущее состояние за
 *    опубликованное — это первый снимок;
 * 3. дальше плагин сравнивает снимок с текущим состоянием и собирает
 *    «Не опубликовано»; дизайнер дописывает фразы, плагин обновляет таблицу
 *    в Figma и отправляет запись на сервер, тот открывает или обновляет PR.
 */

import {
  applySavedDescriptions,
  buildUnpublishedEntry,
  descriptionsByGroup,
  diffSnapshots,
  resolveBaseline,
  validateDrafts,
  type BumpType,
  type DraftChange,
  type LibrarySnapshot,
} from "./lib/changelogRecord";
import {
  readChangelogState,
  takeSnapshot,
  writeChangelogState,
  type ChangelogSource,
  type StoredChangelogState,
} from "./lib/changelogSnapshot";
import { ChangelogTableError, findChangelogTable, writeUnpublishedRow } from "./lib/changelogTable";
import { fetchChangelogs, recordChangelogOnBackend, type ChangelogSummary } from "./lib/changelogApi";
import { RegistryBackendError } from "./lib/registryBackendApi";
import * as storage from "./lib/storage";
import type { ChangelogTableInfo, CodeToUiMessage } from "./messages";

type Send = (message: CodeToUiMessage) => void;

/** Последний список с сервера — чтобы не ходить за ним на каждое действие. */
let knownChangelogs: ChangelogSummary[] = [];

function currentUserName(): string {
  return figma.currentUser?.name?.trim() || "";
}

function sourceLabel(source: ChangelogSource, collections: Map<string, string>): string {
  if (source.kind === "components") return "Компоненты и иконки файла";
  return collections.get(source.collectionId) ?? "Коллекция удалена";
}

async function localCollections(): Promise<Map<string, string>> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  return new Map(collections.filter((collection) => !collection.remote).map((collection) => [collection.id, collection.name]));
}

function summaryFor(path: string): ChangelogSummary {
  const summary = knownChangelogs.find((item) => item.path === path);
  if (!summary?.figmaTable) throw new Error("Чейнжлог не найден — обновите список.");
  return summary;
}

async function tableFor(path: string): Promise<{ summary: ChangelogSummary; table: FrameNode }> {
  const summary = summaryFor(path);
  const table = summary.figmaTable ? await findChangelogTable(summary.figmaTable.nodeId) : null;
  if (!table) throw new Error("Таблица этого чейнжлога не найдена в открытом файле.");
  return { summary, table };
}

function backendFailure(send: Send, error: unknown): void {
  const reason = error instanceof RegistryBackendError ? error.code : "submit_failed";
  send({ type: "changelog-failed", payload: { reason } });
}

export async function handleChangelogLoad(send: Send): Promise<void> {
  try {
    knownChangelogs = await fetchChangelogs();
  } catch (error) {
    backendFailure(send, error);
    return;
  }

  const collections = await localCollections();
  const tables: ChangelogTableInfo[] = [];
  for (const summary of knownChangelogs) {
    if (!summary.figmaTable) continue;
    // fileKey доступен не всем плагинам; если он есть — сверяем и его.
    if (figma.fileKey && figma.fileKey !== summary.figmaTable.fileKey) continue;
    const table = await findChangelogTable(summary.figmaTable.nodeId);
    if (!table) continue;
    const state = readChangelogState(table);
    tables.push({
      path: summary.path,
      artifact: summary.artifact,
      currentVersion: summary.currentVersion,
      pullRequestUrl: summary.pullRequest?.url ?? null,
      hasSnapshot: Boolean(state),
      sourceLabel: state ? sourceLabel(state.source, collections) : null,
    });
  }

  send({
    type: "changelog-tables",
    payload: {
      tables,
      collections: [...collections].map(([id, name]) => ({ id, name })),
    },
  });
}

/** Первый снимок: текущее состояние принимается за опубликованную версию. */
export async function handleChangelogBaseline(send: Send, path: string, source: ChangelogSource): Promise<void> {
  const { summary, table } = await tableFor(path);
  const published = await takeSnapshot(source);
  writeChangelogState(table, {
    path,
    source,
    baseVersion: summary.currentVersion,
    published,
    recorded: null,
    descriptions: {},
    author: currentUserName(),
  });
  await handleChangelogLoad(send);
}

interface PreparedDraft {
  state: StoredChangelogState;
  drafts: DraftChange[];
  table: FrameNode;
  summary: ChangelogSummary;
  current: LibrarySnapshot;
}

async function prepare(path: string): Promise<PreparedDraft> {
  const { summary, table } = await tableFor(path);
  const stored = readChangelogState(table);
  if (!stored) throw new Error("Для этой таблицы ещё нет снимка опубликованной версии.");

  // «Не опубликовано» получило версию — опубликованным становится записанное состояние.
  const { baseline, advanced } = resolveBaseline(stored, summary.currentVersion);
  const state: StoredChangelogState = { ...stored, ...baseline, descriptions: advanced ? {} : stored.descriptions };
  if (advanced) writeChangelogState(table, state);

  const current = await takeSnapshot(state.source);
  const drafts = applySavedDescriptions(diffSnapshots(state.published, current), state.descriptions);
  return { state, drafts, table, summary, current };
}

export async function handleChangelogPrepare(send: Send, path: string): Promise<void> {
  const { state, drafts, summary } = await prepare(path);
  send({
    type: "changelog-draft",
    payload: {
      path,
      artifact: summary.artifact,
      baseVersion: state.baseVersion,
      author: state.author || currentUserName(),
      drafts,
    },
  });
}

function sameChanges(a: DraftChange[], b: DraftChange[]): boolean {
  return (
    a.length === b.length &&
    a.every((draft, index) => draft.group === b[index].group && (draft.details ?? "") === (b[index].details ?? ""))
  );
}

export async function handleChangelogRecord(
  send: Send,
  path: string,
  edited: DraftChange[],
  author: string,
  type?: BumpType
): Promise<void> {
  const sharedSecret = await storage.getRegistrySecret();
  if (!sharedSecret) {
    send({ type: "changelog-failed", payload: { reason: "invalid_key" } });
    return;
  }

  // Снимаем состояние заново: между черновиком и отправкой библиотеку могли поправить.
  const { state, drafts, table, current } = await prepare(path);
  if (!sameChanges(drafts, edited)) {
    send({ type: "changelog-failed", payload: { reason: "stale" } });
    await handleChangelogPrepare(send, path);
    return;
  }

  const descriptions = new Map(edited.map((draft) => [draft.group, draft.description]));
  const final = drafts.map((draft) => ({ ...draft, description: descriptions.get(draft.group) ?? draft.description }));
  const problems = validateDrafts(final, author);
  if (problems.length > 0) {
    send({ type: "changelog-failed", payload: { reason: "invalid", problems } });
    return;
  }

  const entry = buildUnpublishedEntry(final, author, type);
  try {
    await writeUnpublishedRow(table, entry);
  } catch (error) {
    const message = error instanceof ChangelogTableError ? error.message : "Не удалось обновить таблицу в Figma.";
    send({ type: "changelog-failed", payload: { reason: "table", problems: [message] } });
    return;
  }

  let result;
  try {
    result = await recordChangelogOnBackend(
      { path, recordedBy: currentUserName() || author.trim(), entry },
      sharedSecret
    );
  } catch (error) {
    backendFailure(send, error);
    return;
  }

  writeChangelogState(table, {
    ...state,
    recorded: current,
    descriptions: descriptionsByGroup(final),
    author: author.trim(),
  });
  send({ type: "changelog-recorded", payload: { path, ...result } });
}
