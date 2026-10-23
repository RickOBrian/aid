import { describe, expect, it } from "vitest";
import {
  MAPPING_NAMESPACE,
  MAPPING_PAGE_KEY,
  isMarkedMappingPage,
  markMappingPage,
  pickMappingPage,
} from "../src/lib/mappingPage";

class FakePage {
  private data = new Map<string, string>();
  constructor(public name: string, marked = false) {
    if (marked) markMappingPage(this);
  }
  getSharedPluginData(namespace: string, key: string): string {
    return this.data.get(`${namespace}/${key}`) ?? "";
  }
  setSharedPluginData(namespace: string, key: string, value: string): void {
    this.data.set(`${namespace}/${key}`, value);
  }
}

describe("pickMappingPage", () => {
  it("находит страницу по метке, как бы её ни назвали", () => {
    const pages = [new FakePage("Cover"), new FakePage("Отчёты TC", true), new FakePage("Маппинг")];
    expect(pickMappingPage(pages)).toBe(pages[1]);
  });

  it("без метки находит прежнее имя «Маппинг»", () => {
    const pages = [new FakePage("Cover"), new FakePage("Маппинг")];
    expect(pickMappingPage(pages)).toBe(pages[1]);
  });

  it("без метки находит новое имя «Mapping», без учёта регистра и пробелов", () => {
    const pages = [new FakePage("Cover"), new FakePage(" mapping ")];
    expect(pickMappingPage(pages)).toBe(pages[1]);
  });

  it("помеченная страница важнее страницы с известным именем", () => {
    const pages = [new FakePage("Маппинг"), new FakePage("Mapping", true)];
    expect(pickMappingPage(pages)).toBe(pages[1]);
  });

  it("null, если подходящей страницы нет", () => {
    expect(pickMappingPage([new FakePage("Cover"), new FakePage("Маппинг токенов")])).toBeNull();
  });
});

describe("markMappingPage", () => {
  it("ставит метку в sharedPluginData", () => {
    const page = new FakePage("Маппинг");
    expect(isMarkedMappingPage(page)).toBe(false);
    markMappingPage(page);
    expect(page.getSharedPluginData(MAPPING_NAMESPACE, MAPPING_PAGE_KEY)).toBe("1");
    expect(isMarkedMappingPage(page)).toBe(true);
  });
});
