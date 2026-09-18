/**
 * Несколько библиотек: в настройках загружается список, в сканировании
 * выбирается одна.
 *
 * Идентификаторы переменных и стилей (`VariableID:23:13`, node_id стиля)
 * уникальны только внутри файла — в двух библиотеках они могут совпасть.
 * Поэтому решение с конкретным токеном действует только в той библиотеке,
 * где его приняли; решения без токена — в любой.
 */

import { beforeEach, describe, expect, it } from "vitest";

import {
  getActiveLibraryKey,
  getLibraries,
  getLibraryData,
  getMappingHistory,
  migrateLegacyLibrary,
  removeLibrary,
  setActiveLibraryKey,
  setLibraryCache,
  setLibraryFileKey,
  setLibraryFileName,
  setLibraryTextStylesCache,
  setMappingHistoryEntry,
  upsertLibrary,
} from "../src/lib/storage";
import { scopeHistoryToLibrary } from "../src/lib/libraryScope";
import type { StoredDecision } from "../src/comparators/types";
import { libraryTextStyle, libraryToken } from "./fixtures";
import { resetFigmaStub } from "./figmaStub";

const T = "2026-09-18T00:00:00.000Z";

function meta(fileKey: string, fileName = fileKey) {
  return { fileKey, fileName, colorCount: 1, textStyleCount: 1, fetchedAt: T };
}

const DATA = { tokens: [libraryToken({ name: "text-primary" })], styles: [libraryTextStyle({ name: "body-m" })] };

beforeEach(() => {
  resetFigmaStub();
});

describe("список библиотек", () => {
  it("добавление сохраняет порядок, повторная загрузка того же файла обновляет запись на месте", async () => {
    await upsertLibrary(meta("A"), DATA);
    await upsertLibrary(meta("B"), DATA);
    await upsertLibrary({ ...meta("A", "A v2") }, DATA);
    const libraries = await getLibraries();
    expect(libraries.map((item) => item.fileKey)).toEqual(["A", "B"]);
    expect(libraries[0].fileName).toBe("A v2");
  });

  it("данные библиотеки хранятся отдельно от списка и удаляются вместе с ней", async () => {
    await upsertLibrary(meta("A"), DATA);
    expect((await getLibraryData("A"))?.tokens).toHaveLength(1);
    await removeLibrary("A");
    expect(await getLibraries()).toEqual([]);
    expect(await getLibraryData("A")).toBeNull();
  });

  it("удаление выбранной библиотеки снимает выбор", async () => {
    await upsertLibrary(meta("A"), DATA);
    await setActiveLibraryKey("A");
    await removeLibrary("A");
    expect(await getActiveLibraryKey()).toBeNull();
  });
});

describe("миграция одной библиотеки из прошлых версий", () => {
  it("прежняя библиотека становится первой и выбранной, решения с токеном привязываются к ней", async () => {
    await setLibraryFileKey("LEGACY");
    await setLibraryFileName("AID Driver");
    await setLibraryCache({ tokens: DATA.tokens, fetchedAt: T, fileKey: "LEGACY", fileName: "AID Driver" });
    await setLibraryTextStylesCache({ styles: DATA.styles, fetchedAt: T, fileKey: "LEGACY", fileName: "AID Driver" });
    await setMappingHistoryEntry("mapped", { decision: "mapped", targetVariableId: "VariableID:1:1", timestamp: T });
    await setMappingHistoryEntry("ignored", { decision: "ignored", comment: "x", timestamp: T });

    expect(await migrateLegacyLibrary()).toBe(true);

    const [library] = await getLibraries();
    expect(library).toMatchObject({ fileKey: "LEGACY", fileName: "AID Driver", colorCount: 1, textStyleCount: 1 });
    expect(await getActiveLibraryKey()).toBe("LEGACY");
    expect((await getLibraryData("LEGACY"))?.styles).toHaveLength(1);

    const history = await getMappingHistory();
    expect(history.mapped.libraryFileKey).toBe("LEGACY");
    expect(history.ignored.libraryFileKey).toBeUndefined();
  });

  it("выполняется один раз", async () => {
    await setLibraryCache({ tokens: DATA.tokens, fetchedAt: T, fileKey: "LEGACY", fileName: "AID" });
    expect(await migrateLegacyLibrary()).toBe(true);
    await removeLibrary("LEGACY");
    expect(await migrateLegacyLibrary()).toBe(false);
    expect(await getLibraries()).toEqual([]);
  });

  it("без прежней библиотеки создаёт пустой список", async () => {
    expect(await migrateLegacyLibrary()).toBe(false);
    expect(await getLibraries()).toEqual([]);
  });
});

describe("scopeHistoryToLibrary", () => {
  const mappedInA: StoredDecision = { decision: "mapped", targetVariableId: "VariableID:1:1", libraryFileKey: "A", timestamp: T };
  const fixInA: StoredDecision = { decision: "value_fix_proposed", targetVariableId: "VariableID:1:1", libraryFileKey: "A", timestamp: T };
  const ignored: StoredDecision = { decision: "ignored", comment: "x", timestamp: T };
  const candidate: StoredDecision = { decision: "candidate", libraryFileKey: "A", timestamp: T };
  const legacyRegistry: StoredDecision = { decision: "mapped", targetVariableId: "VariableID:1:1", timestamp: T, source: "registry" };

  const history = { mappedInA, fixInA, ignored, candidate, legacyRegistry };

  it("в своей библиотеке действуют все решения", () => {
    expect(Object.keys(scopeHistoryToLibrary(history, "A")).sort()).toEqual(Object.keys(history).sort());
  });

  it("в другой библиотеке решения с токеном не действуют — тот же id там может быть другим токеном", () => {
    const scoped = scopeHistoryToLibrary(history, "B");
    expect(scoped.mappedInA).toBeUndefined();
    expect(scoped.fixInA).toBeUndefined();
  });

  it("«игнорировать» и «кандидат» от библиотеки не зависят", () => {
    const scoped = scopeHistoryToLibrary(history, "B");
    expect(scoped.ignored).toBe(ignored);
    expect(scoped.candidate).toBe(candidate);
  });

  it("решение без отметки библиотеки (старые записи реестра) действует везде", () => {
    expect(scopeHistoryToLibrary(history, "B").legacyRegistry).toBe(legacyRegistry);
  });

  it("без выбранной библиотеки историю не трогает", () => {
    expect(scopeHistoryToLibrary(history, null)).toBe(history);
  });
});
