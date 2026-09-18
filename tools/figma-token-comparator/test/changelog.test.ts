/**
 * Чейнджлог во вкладке «Гайд».
 *
 * Главное правило — версия из package.json обязана быть описана и иметь
 * дату: так релиз без записи в чейнджлоге не соберётся через ворота тестов.
 */

import { describe, expect, it } from "vitest";

import { CHANGELOG, compareVersions, getChangelogEntryState } from "../src/lib/changelog";
import { version as packageVersion } from "../package.json";

describe("CHANGELOG", () => {
  it("версия из package.json описана и имеет дату выпуска", () => {
    const entry = CHANGELOG.find((item) => item.version === packageVersion);
    expect(entry, `нет записи для ${packageVersion}`).toBeDefined();
    expect(entry?.date, `у ${packageVersion} нет даты — перед релизом её нужно проставить`).toMatch(
      /^\d{4}-\d{2}-\d{2}$/
    );
  });

  it("версии уникальны и идут от новой к старой", () => {
    const versions = CHANGELOG.map((item) => item.version);
    expect(new Set(versions).size).toBe(versions.length);
    for (let i = 1; i < versions.length; i += 1) {
      expect(compareVersions(versions[i - 1], versions[i])).toBeGreaterThan(0);
    }
  });

  it("без даты может быть только версия новее текущей — ещё не выпущенная", () => {
    for (const entry of CHANGELOG.filter((item) => !item.date)) {
      expect(compareVersions(entry.version, packageVersion)).toBeGreaterThan(0);
    }
  });

  it("в каждой записи есть что прочитать, пустых пунктов нет", () => {
    for (const entry of CHANGELOG) {
      expect(entry.summary.trim()).not.toBe("");
      for (const group of entry.groups) {
        expect(group.items.length).toBeGreaterThan(0);
        for (const item of group.items) expect(item.trim()).not.toBe("");
      }
      for (const action of entry.actions ?? []) expect(action.trim()).not.toBe("");
    }
  });
});

describe("compareVersions", () => {
  it("сравнивает по числам, а не по строкам", () => {
    expect(compareVersions("0.1.10", "0.1.9")).toBeGreaterThan(0);
    expect(compareVersions("0.2.0", "0.1.9")).toBeGreaterThan(0);
    expect(compareVersions("0.1.2", "0.1.2")).toBe(0);
    expect(compareVersions("0.1.2", "1.0.0")).toBeLessThan(0);
  });
});

describe("getChangelogEntryState", () => {
  it("своя версия — current, новее без даты — upcoming, остальные — released", () => {
    expect(getChangelogEntryState({ version: "1.1.0", date: "2026-09-18" }, "1.1.0")).toBe("current");
    expect(getChangelogEntryState({ version: "1.2.0" }, "1.1.0")).toBe("upcoming");
    expect(getChangelogEntryState({ version: "1.0.1", date: "2026-09-18" }, "1.1.0")).toBe("released");
  });
});
