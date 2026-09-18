/**
 * Подписи токенов и стилей библиотеки — находка №11 аудита.
 *
 * Подпись токена в списке содержит имя и коллекцию. При ручном выборе
 * в реестр решений уходила именно подпись, а не имя токена: поле
 * targetVariableName получало строку вида «bg/accent (color-sem)», тогда как
 * при выборе предложенного токена туда попадало чистое имя. Одно и то же
 * поле реестра заполнялось в двух форматах в зависимости от того, каким
 * путём дизайнер принял решение.
 */

import { describe, expect, it } from "vitest";

import {
  findLibraryTextStyleByLabel,
  findLibraryTokenByLabel,
  formatLibraryTextStyleLabel,
  formatLibraryTokenLabel,
} from "../src/lib/libraryLabels";
import { libraryTextStyle, libraryToken } from "./fixtures";

const TOKENS = [
  libraryToken({ name: "bg/accent", variableId: "var-1" }),
  libraryToken({ name: "bg/accent", variableId: "var-2", collectionName: "color-core" }),
  libraryToken({ name: "text/primary", variableId: "var-3" }),
];

describe("подпись токена", () => {
  it("содержит имя и коллекцию", () => {
    expect(formatLibraryTokenLabel(TOKENS[0])).toBe("bg/accent (color-sem)");
  });

  it("подпись — это не имя: путать их нельзя", () => {
    expect(formatLibraryTokenLabel(TOKENS[0])).not.toBe(TOKENS[0].name);
  });

  it("различает одноимённые токены из разных коллекций", () => {
    expect(formatLibraryTokenLabel(TOKENS[0])).not.toBe(formatLibraryTokenLabel(TOKENS[1]));
  });
});

describe("поиск токена по подписи", () => {
  it("находит по полной подписи", () => {
    expect(findLibraryTokenByLabel("bg/accent (color-sem)", TOKENS)?.variableId).toBe("var-1");
  });

  it("одноимённые токены различаются по коллекции", () => {
    expect(findLibraryTokenByLabel("bg/accent (color-core)", TOKENS)?.variableId).toBe("var-2");
  });

  it("по одному имени без коллекции не находит — подпись неполная", () => {
    expect(findLibraryTokenByLabel("bg/accent", TOKENS)).toBeUndefined();
  });

  it("пробелы по краям не мешают", () => {
    expect(findLibraryTokenByLabel("  text/primary (color-sem)  ", TOKENS)?.variableId).toBe("var-3");
  });

  it("пустая подпись ничего не находит", () => {
    expect(findLibraryTokenByLabel("", TOKENS)).toBeUndefined();
    expect(findLibraryTokenByLabel("   ", TOKENS)).toBeUndefined();
  });

  it("форматирование и поиск — обратные операции", () => {
    for (const token of TOKENS) {
      expect(findLibraryTokenByLabel(formatLibraryTokenLabel(token), TOKENS)).toBe(token);
    }
  });
});

describe("подпись стиля текста", () => {
  const styles = [
    libraryTextStyle({ name: "body/m", nodeId: "S:1" }),
    libraryTextStyle({ name: "heading/s", nodeId: "S:2" }),
  ];

  it("совпадает с именем стиля", () => {
    expect(formatLibraryTextStyleLabel(styles[0])).toBe("body/m");
  });

  it("форматирование и поиск — обратные операции", () => {
    for (const style of styles) {
      expect(findLibraryTextStyleByLabel(formatLibraryTextStyleLabel(style), styles)).toBe(style);
    }
  });

  it("пустая подпись ничего не находит", () => {
    expect(findLibraryTextStyleByLabel("  ", styles)).toBeUndefined();
  });
});
