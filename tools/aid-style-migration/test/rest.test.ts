import { describe, expect, it } from "vitest";
import { parseFigmaFileKey } from "../src/lib/figmaUrl";
import { collectionsFromRest, effectStyleFromRest, textStyleFromRest } from "../src/profile/restParse";

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
