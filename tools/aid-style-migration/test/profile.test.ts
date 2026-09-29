import { describe, expect, it } from "vitest";
import {
  buildExport,
  exemplarVariableOrigin,
  createProfile,
  materialId,
  missingMaterials,
  parseExport,
  removeMaterial,
  suggestTheme,
  upsertMaterial,
} from "../src/profile/profile";
import { resolveValue } from "../src/profile/tokenValues";
import type { IndexedCollection, Material, VariableValue } from "../src/profile/types";

const NOW = "2026-09-29T12:00:00Z";

function material(kind: Material["kind"], fileName = "Lib"): Material {
  return { id: materialId(kind, fileName), kind, fileName, source: "open-file", indexedAt: NOW, stats: {} };
}

function collection(name: string, modes: string[], colors = 1): IndexedCollection {
  return {
    key: `k-${name}`,
    name,
    published: true,
    modes: modes.map((m, i) => ({ modeId: `${i}`, name: m })),
    variables: Array.from({ length: colors }, (_, i) => ({
      key: `v${i}`,
      name: `c${i}`,
      published: true,
      resolvedType: "COLOR" as const,
      description: "",
      scopes: [],
      valuesByMode: {},
      resolvedByMode: {},
    })),
  };
}

describe("профиль", () => {
  it("id из имени, без повторов", () => {
    expect(createProfile("Новый продукт", [], NOW).id).toBe("новый-продукт");
    expect(createProfile("Новый продукт", ["новый-продукт"], NOW).id).toBe("новый-продукт-2");
  });

  it("повторная индексация того же файла заменяет материал", () => {
    let p = createProfile("P", [], NOW);
    p = upsertMaterial(p, material("tokens"), NOW);
    p = upsertMaterial(p, { ...material("tokens"), stats: { variables: 5 } }, NOW);
    p = upsertMaterial(p, material("icons", "Icons"), NOW);
    expect(p.materials.map((m) => m.id)).toEqual(["tokens:Lib", "icons:Icons"]);
    expect(p.materials[0].stats.variables).toBe(5);
  });

  it("без токенов нет и темы", () => {
    let p = createProfile("P", [], NOW);
    p = { ...upsertMaterial(p, material("tokens"), NOW), theme: { collectionKey: "k", collectionName: "c", modes: [] } };
    expect(removeMaterial(p, "tokens:Lib", NOW).theme).toBeNull();
  });

  it("показывает, чего не хватает и что от этого хуже", () => {
    const p = upsertMaterial(createProfile("P", [], NOW), material("tokens"), NOW);
    expect(missingMaterials(p).map((m) => m.kind)).toEqual(["components", "icons", "exemplars"]);
  });
});

describe("тема продукта", () => {
  it("находит коллекцию с тёмным режимом, как бы он ни назывался", () => {
    const theme = suggestTheme([collection("space", ["Mode 1"]), collection("color-sem", ["day", "night"], 131)]);
    expect(theme?.collectionName).toBe("color-sem");
    expect(theme?.modes.map((m) => m.role)).toEqual(["light", "dark"]);
  });

  it("второй режим пары без «светлого» слова всё равно светлый", () => {
    const theme = suggestTheme([collection("Color", ["Default", "Dark"])]);
    expect(theme?.modes.map((m) => m.role)).toEqual(["light", "dark"]);
  });

  it("несколько кандидатов — с большим числом цветов", () => {
    const theme = suggestTheme([collection("a", ["Light", "Dark"], 2), collection("b", ["Light", "Dark"], 40)]);
    expect(theme?.collectionName).toBe("b");
  });

  it("нет тёмного режима — нет темы", () => {
    expect(suggestTheme([collection("Button", ["Large", "Small"])])).toBeNull();
  });
});

describe("экспорт и импорт", () => {
  it("круговой путь", () => {
    const p = upsertMaterial(createProfile("P", [], NOW), material("tokens"), NOW);
    const text = JSON.stringify(buildExport(p, {}));
    const back = parseExport(text);
    expect("error" in back ? back.error : back.profile.id).toBe("p");
  });

  it("понятные ошибки", () => {
    expect(parseExport("{")).toEqual({ error: "Это не JSON" });
    expect(parseExport("{}")).toEqual({ error: "Это не профиль AID Style Migration" });
    expect(parseExport(JSON.stringify({ format: "aid-style-migration/profile", version: 99 }))).toEqual({
      error: "Профиль из более новой версии плагина — обновите плагин",
    });
  });
});

describe("итоговые значения переменных", () => {
  const red = { kind: "color" as const, r: 1, g: 0, b: 0, a: 1 };
  const black = { kind: "color" as const, r: 0, g: 0, b: 0, a: 1 };
  type Entry = { valuesByMode: Record<string, VariableValue>; defaultModeId: string };
  const byKey = new Map<string, Entry>([
    // примитивы — один режим «core»
    ["core-red", { valuesByMode: { core: red }, defaultModeId: "core" }],
    ["core-black", { valuesByMode: { core: black }, defaultModeId: "core" }],
    // семантика ссылается на семантику
    ["sem-accent", { valuesByMode: { day: { kind: "alias" as const, name: "red", key: "core-red" } }, defaultModeId: "day" }],
  ]);

  it("семантика → примитив в режиме по умолчанию коллекции цели", () => {
    expect(resolveValue({ kind: "alias", name: "red", key: "core-red" }, "night", byKey)).toEqual(red);
  });
  it("цепочка ссылок проходится до конца", () => {
    expect(resolveValue({ kind: "alias", name: "accent", key: "sem-accent" }, "day", byKey)).toEqual(red);
  });
  it("ссылка наружу — null, а не ошибка", () => {
    expect(resolveValue({ kind: "alias", name: "x", key: "remote" }, "day", byKey)).toBeNull();
  });
  it("не ссылка — как есть", () => {
    expect(resolveValue(black, "day", byKey)).toEqual(black);
  });
});

describe("откуда токены образцов", () => {
  const usage = { light: {}, dark: {} };
  const data = {
    screens: 1, darkScreens: 0, screensFound: 1, nodes: 1, annotationsSkipped: 0, textStyles: {}, components: {},
    unbound: { fills: 0, strokes: 0, texts: 0 }, textCases: {},
    variables: {
      k1: { name: "Bg/Primary", collection: "color-sem", remote: true, ...usage },
      k2: { name: "Bg/Primary", collection: "color-sem", remote: true, ...usage },
      k3: { name: "tx-bg/level 1", collection: "Color", remote: false, ...usage },
      k4: { name: "map/road", collection: "Maps", remote: true, ...usage },
    },
  };

  it("тот же ключ, то же имя, локальные, чужие", () => {
    const o = exemplarVariableOrigin(data, new Set(["k1"]), new Set(["Bg/Primary"]));
    expect([o.fromProduct, o.sameNameOnly, o.local, o.other]).toEqual([1, 1, 1, 1]);
    expect(o.foreignCollections.map(([n]) => n).sort()).toEqual(["Color", "Maps", "color-sem"]);
  });
});
