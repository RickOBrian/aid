import { describe, expect, it } from "vitest";
import { parseFigmaFileKey } from "../src/lib/figmaUrl";
import {
  collectionsFromRest,
  componentsIndexFromRest,
  effectStyleFromRest,
  smallShare,
  textStyleFromRest,
  type RestComponentNode,
} from "../src/profile/restParse";

describe("ссылка на файл", () => {
  it("ключ из ссылки, ветки и голый ключ", () => {
    expect(parseFigmaFileKey("https://www.figma.com/design/ouP1hUC4YjVRpfgdvzy3FA/Name?node-id=7-8")).toBe("ouP1hUC4YjVRpfgdvzy3FA");
    expect(parseFigmaFileKey("https://www.figma.com/design/Main1234567/branch/Branch12345/Name")).toBe("Branch12345");
    expect(parseFigmaFileKey("ouP1hUC4YjVRpfgdvzy3FA")).toBe("ouP1hUC4YjVRpfgdvzy3FA");
    expect(parseFigmaFileKey("https://example.com/whatever")).toBe("");
  });
});

describe("переменные из REST", () => {
  const meta = {
    variableCollections: {
      core: { id: "core", name: "core", key: "kc", modes: [{ modeId: "c", name: "Value" }], defaultModeId: "c", remote: false, hiddenFromPublishing: true },
      sem: { id: "sem", name: "color-sem", key: "ks", modes: [{ modeId: "d", name: "day" }, { modeId: "n", name: "night" }], defaultModeId: "d", remote: false },
      ext: { id: "ext", name: "other", key: "ke", modes: [{ modeId: "x", name: "x" }], defaultModeId: "x", remote: true },
    },
    variables: {
      white: { id: "white", name: "white", key: "kw", variableCollectionId: "core", resolvedType: "COLOR", valuesByMode: { c: { r: 1, g: 1, b: 1, a: 1 } }, remote: false },
      black: { id: "black", name: "black", key: "kb", variableCollectionId: "core", resolvedType: "COLOR", valuesByMode: { c: { r: 0, g: 0, b: 0, a: 1 } }, remote: false },
      bg: {
        id: "bg", name: "Bg/Primary", key: "kbg", variableCollectionId: "sem", resolvedType: "COLOR", remote: false,
        valuesByMode: { d: { type: "VARIABLE_ALIAS", id: "white" }, n: { type: "VARIABLE_ALIAS", id: "black" } },
      },
      foreign: { id: "foreign", name: "x", key: "kx", variableCollectionId: "ext", resolvedType: "COLOR", valuesByMode: { x: 1 }, remote: true },
    },
  };

  it("чужие (remote) не берём, скрытые помечаем, ссылки разрешаем по режимам", () => {
    const collections = collectionsFromRest(meta);
    expect(collections.map((c) => c.name)).toEqual(["core", "color-sem"]);
    expect(collections[0].published).toBe(false);
    const bg = collections[1].variables[0];
    expect(bg.published).toBe(true);
    expect(bg.valuesByMode.d).toEqual({ kind: "alias", name: "white", key: "kw" });
    expect(bg.resolvedByMode.d).toEqual({ kind: "color", r: 1, g: 1, b: 1, a: 1 });
    expect(bg.resolvedByMode.n).toEqual({ kind: "color", r: 0, g: 0, b: 0, a: 1 });
  });
});

describe("стили из REST", () => {
  const entry = { key: "k", node_id: "1:2", style_type: "TEXT", name: "Body 1" };

  it("стиль текста: шрифт, кегль, регистр, авто-интерлиньяж", () => {
    const s = textStyleFromRest(entry, { style: { fontFamily: "Roboto", fontWeight: 500, fontSize: 16, lineHeightPx: 24, lineHeightUnit: "PIXELS", textCase: "UPPER" } });
    expect(s).toMatchObject({ fontFamily: "Roboto", fontStyle: "Medium", fontSize: 16, lineHeight: 24, textCase: "UPPER", published: true });
    expect(textStyleFromRest(entry, { style: { fontFamily: "Roboto", fontSize: 16, lineHeightPx: 18.75, lineHeightUnit: "INTRINSIC_%" } })?.lineHeight).toBeNull();
    expect(textStyleFromRest(entry, undefined)).toBeNull();
  });

  it("стиль эффекта: только видимые эффекты", () => {
    const s = effectStyleFromRest({ ...entry, style_type: "EFFECT" }, {
      effects: [
        { type: "DROP_SHADOW", offset: { x: 0, y: 4 }, radius: 16, color: { r: 0, g: 0, b: 0, a: 0.16 } },
        { type: "LAYER_BLUR", radius: 4, visible: false },
      ],
    });
    expect(s.effects).toEqual(["DROP_SHADOW 0,4 r16 s0 #00000029"]);
  });
});

describe("компоненты из REST", () => {
  const set = { key: "kset", node_id: "1:1", name: "Button", containing_frame: { name: "Buttons", pageName: "Controls" } };
  const variant = (id: string, name: string) => ({
    key: `k${id}`,
    node_id: id,
    name,
    containing_frame: { name: "Button", pageName: "Controls", containingComponentSet: { name: "Button", nodeId: "1:1" } },
  });
  const icon = (id: string) => ({ key: `k${id}`, node_id: id, name: `icon-${id}`, containing_frame: { name: "action", pageName: "Icons" } });

  it("варианты — внутри своего набора, с размерами из дочерних нод", () => {
    const nodes = new Map<string, RestComponentNode | undefined>([
      [
        "1:1",
        {
          absoluteBoundingBox: { width: 300, height: 120 },
          componentPropertyDefinitions: { Size: { type: "VARIANT", defaultValue: "L", variantOptions: ["L", "M"] } },
          children: [
            { id: "1:2", absoluteBoundingBox: { width: 140, height: 48 } },
            { id: "1:3", absoluteBoundingBox: { width: 120, height: 40 } },
          ],
        },
      ],
    ]);
    const index = componentsIndexFromRest([set], [variant("1:2", "Size=L"), variant("1:3", "Size=M")], nodes);
    expect(index.components).toEqual([]);
    expect(index.sets[0]).toMatchObject({ name: "Button", group: "Buttons", page: "Controls", width: 300 });
    expect(index.sets[0].properties).toEqual([{ name: "Size", type: "VARIANT", defaultValue: "L", variantOptions: ["L", "M"] }]);
    expect(index.sets[0].variants).toEqual([
      { key: "k1:2", name: "Size=L", width: 140, height: 48 },
      { key: "k1:3", name: "Size=M", width: 120, height: 40 },
    ]);
  });

  it("библиотека из мелких одиночных — иконки; служебные «_» не берём", () => {
    const nodes = new Map<string, RestComponentNode | undefined>([
      ["2:1", { absoluteBoundingBox: { width: 24, height: 24 } }],
      ["2:2", { absoluteBoundingBox: { width: 24, height: 24 } }],
      ["2:3", { absoluteBoundingBox: { width: 24, height: 24 } }],
    ]);
    const index = componentsIndexFromRest([], [icon("2:1"), icon("2:2"), { ...icon("2:3"), name: "_helper" }], nodes);
    expect(index.components.map((c) => c.name)).toEqual(["icon-2:1", "icon-2:2"]);
    expect(smallShare(index)).toBe(1);
  });

  it("крупные компоненты — не иконки", () => {
    const index = componentsIndexFromRest([set], [variant("1:2", "Size=L")], new Map([["1:1", { absoluteBoundingBox: { width: 300, height: 120 } }]]));
    expect(smallShare(index)).toBe(0);
  });
});
