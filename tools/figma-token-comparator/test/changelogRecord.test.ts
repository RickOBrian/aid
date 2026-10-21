import { describe, expect, it } from "vitest";

import "./figmaStub";
import {
  applySavedDescriptions,
  buildUnpublishedEntry,
  CHANGELOG_PATH_PATTERN,
  descriptionsByGroup,
  diffComponents,
  diffSnapshots,
  diffVariables,
  maxBump,
  pluralRu,
  resolveBaseline,
  splitIntoChunks,
  validateDrafts,
  type ComponentsSnapshot,
  type VariablesSnapshot,
} from "../src/lib/changelogRecord";
import { readChangelogState, writeChangelogState } from "../src/lib/changelogSnapshot";

const MODES = [
  { id: "m1", name: "Day" },
  { id: "m2", name: "Night" },
];

function collection(items: VariablesSnapshot["items"], modes = MODES): VariablesSnapshot {
  return { kind: "variables", collectionId: "c1", collectionName: "color-sem", modes, items };
}

function variable(id: string, name: string, day: string, night: string, extra: Partial<VariablesSnapshot["items"][number]> = {}) {
  return { id, name, values: { m1: day, m2: night }, scopes: ["ALL_FILLS"], description: "", ...extra };
}

const BASE = collection([
  variable("v1", "Button/Warning", "#E52817", "#E53828"),
  variable("v2", "Text/Primary", "#000000", "#FFFFFF"),
  variable("v3", "Stroke/Old", "#CCCCCC", "#333333"),
]);

describe("diffVariables", () => {
  it("без изменений — пустой список", () => {
    expect(diffVariables(BASE, BASE)).toEqual([]);
  });

  it("собирает добавление, удаление, переименование и значения в формате §5", () => {
    const current = collection([
      variable("v1", "Button/Warning Default", "#E52817", "#E53727"),
      variable("v2", "Text/Primary", "#000000", "#FFFFFF"),
      variable("v4", "Button/Warning Pressed", "#BF0020", "#FF4747"),
    ]);
    const changes = diffVariables(BASE, current);
    expect(changes.map((change) => [change.group, change.kind, change.bump])).toEqual([
      ["variables-added", "added", "minor"],
      ["variables-removed", "removed", "major"],
      ["variables-renamed", "changed", "major"],
      ["variables-values", "changed", "patch"],
    ]);
    expect(changes[0]).toMatchObject({
      description: "Добавлена переменная Button/Warning Pressed",
      details: "Button/Warning Pressed: Day #BF0020, Night #FF4747",
    });
    expect(changes[1].details).toBe("Stroke/Old");
    expect(changes[2].details).toBe("Button/Warning → Button/Warning Default");
    expect(changes[3]).toMatchObject({
      description: "Изменено значение Button/Warning Default",
      details: "Button/Warning Default Night: #E53828 → #E53727",
    });
  });

  it("одиночный режим — без имени режима", () => {
    const one = [{ id: "m1", name: "Value" }];
    const base = collection([{ id: "s", name: "space-16", values: { m1: "16" }, scopes: [], description: "" }], one);
    const current = collection([{ id: "s", name: "space-16", values: { m1: "18" }, scopes: [], description: "" }], one);
    expect(diffVariables(base, current)[0].details).toBe("space-16: 16 → 18");
  });

  it("много переменных — числом, а не списком", () => {
    const current = collection([
      ...BASE.items,
      ...["a", "b", "c", "d"].map((id) => variable(id, `New/${id}`, "#111111", "#222222")),
    ]);
    expect(diffVariables(BASE, current)[0].description).toBe("Добавлено переменных: 4");
  });

  it("видит scope, описание и режимы", () => {
    const current = collection(
      [
        variable("v1", "Button/Warning", "#E52817", "#E53828", { scopes: ["FRAME_FILL"] }),
        variable("v2", "Text/Primary", "#000000", "#FFFFFF", { description: "Основной текст" }),
        variable("v3", "Stroke/Old", "#CCCCCC", "#333333"),
      ],
      [
        { id: "m1", name: "Light" },
        { id: "m2", name: "Night" },
      ]
    );
    const groups = diffVariables(BASE, current).map((change) => change.group);
    expect(groups).toEqual(["modes-renamed", "variables-scopes", "variables-descriptions"]);
  });
});

describe("diffComponents", () => {
  const base: ComponentsSnapshot = {
    kind: "components",
    items: [
      { id: "1", name: "Switch", variants: ["State=Off", "State=On"], properties: { Label: "TEXT = On" }, description: "" },
      { id: "2", name: "info", variants: [], properties: {}, description: "" },
    ],
  };

  it("показывает, что изменилось, а фразу оставляет автору", () => {
    const current: ComponentsSnapshot = {
      kind: "components",
      items: [
        {
          id: "1",
          name: "Switch",
          variants: ["State=Loading", "State=Off", "State=On"],
          properties: { Label: "TEXT = Вкл", Icon: "BOOLEAN = true" },
          description: "",
        },
        { id: "2", name: "info_outline", variants: [], properties: {}, description: "" },
        { id: "3", name: "info_filled", variants: [], properties: {}, description: "" },
      ],
    };
    const changes = diffComponents(base, current);
    expect(changes.map((change) => change.group)).toEqual([
      "components-added",
      "components-renamed",
      "variants-added",
      "properties-added",
      "properties-changed",
    ]);
    expect(changes.every((change) => change.description === "")).toBe(true);
    expect(changes[1].details).toBe("info → info_outline");
    expect(changes[2].details).toBe("Switch: State=Loading");
    expect(changes[4].details).toBe("Switch · Label: TEXT = On → TEXT = Вкл");
  });

  it("снимки разного вида не сравниваются", () => {
    expect(() => diffSnapshots(BASE, base)).toThrow();
  });
});

describe("запись «Не опубликовано»", () => {
  const drafts = diffVariables(
    BASE,
    collection([...BASE.items.slice(0, 2), variable("v4", "Button/Warning Pressed", "#BF0020", "#FF4747")])
  );

  it("type — самая старшая цифра из изменений", () => {
    expect(maxBump(["patch", "minor"])).toBe("minor");
    expect(maxBump(["patch", "major", "minor"])).toBe("major");
    expect(buildUnpublishedEntry(drafts, "Артур").type).toBe("major");
  });

  it("цифру можно поднять, но не опустить ниже вычисленной", () => {
    const patchOnly = drafts.filter((draft) => draft.bump === "patch");
    expect(buildUnpublishedEntry(patchOnly, "Артур", "minor").type).toBe("minor");
    expect(buildUnpublishedEntry(drafts, "Артур", "patch").type).toBe("major");
  });

  it("версия и дата пустые, служебных полей черновика нет", () => {
    const entry = buildUnpublishedEntry(drafts, " Артур ");
    expect(entry.version).toBeNull();
    expect(entry.date).toBeNull();
    expect(entry.author).toBe("Артур");
    expect(Object.keys(entry.changes[0]).sort()).toEqual(["description", "details", "kind"]);
  });

  it("без описания или автора отправлять нельзя", () => {
    const empty = drafts.map((draft) => ({ ...draft, description: "" }));
    expect(validateDrafts(empty, "Артур")).toHaveLength(drafts.length);
    expect(validateDrafts(drafts, "")).toContain("Укажите автора.");
    expect(validateDrafts([], "Артур")).toContain("Изменений нет — записывать нечего.");
  });

  it("фразы дизайнера переносятся на новый черновик по группе", () => {
    const edited = drafts.map((draft) => ({ ...draft, description: `Своя фраза ${draft.group}` }));
    const restored = applySavedDescriptions(drafts, descriptionsByGroup(edited));
    expect(restored.map((draft) => draft.description)).toEqual(edited.map((draft) => draft.description));
  });
});

describe("resolveBaseline", () => {
  const recorded = collection([variable("v9", "New", "#000000", "#000000")]);

  it("версия в main не менялась — снимок прежний", () => {
    const stored = { baseVersion: "1.10.0", published: BASE, recorded };
    expect(resolveBaseline(stored, "1.10.0")).toEqual({ baseline: stored, advanced: false });
  });

  it("версия выросла — опубликованным становится записанное", () => {
    const { baseline, advanced } = resolveBaseline({ baseVersion: "1.10.0", published: BASE, recorded }, "1.11.0");
    expect(advanced).toBe(true);
    expect(baseline).toEqual({ baseVersion: "1.11.0", published: recorded, recorded: null });
  });

  it("версия выросла, а записей не было — снимок остаётся, версия обновляется", () => {
    const { baseline } = resolveBaseline({ baseVersion: "1.10.0", published: BASE, recorded: null }, "1.11.0");
    expect(baseline.published).toBe(BASE);
    expect(baseline.baseVersion).toBe("1.11.0");
  });
});

describe("хранение снимка в файле", () => {
  function fakeNode() {
    const data = new Map<string, string>();
    return {
      data,
      getSharedPluginData: (namespace: string, key: string) => data.get(`${namespace}/${key}`) ?? "",
      setSharedPluginData: (namespace: string, key: string, value: string) => {
        if (value === "") data.delete(`${namespace}/${key}`);
        else data.set(`${namespace}/${key}`, value);
      },
    };
  }

  it("большой снимок делится на куски и читается обратно", () => {
    const node = fakeNode();
    const big = collection(
      Array.from({ length: 2000 }, (_, index) => variable(`v${index}`, `Группа/Переменная ${index}`, "#123456", "#654321"))
    );
    const state = {
      path: "tokens/rider-colors-semantic-changelog.json",
      source: { kind: "variables" as const, collectionId: "c1" },
      baseVersion: "1.10.0",
      published: big,
      recorded: null,
      descriptions: { "variables-added": "Фраза" },
      author: "Артур",
    };
    writeChangelogState(node as unknown as BaseNode, state);
    expect([...node.data.keys()].filter((key) => key.includes("published.")).length).toBeGreaterThan(1);
    expect(readChangelogState(node as unknown as BaseNode)).toEqual(state);

    // Снимок стал меньше — лишние куски стираются.
    writeChangelogState(node as unknown as BaseNode, { ...state, published: BASE });
    expect([...node.data.keys()].filter((key) => key.includes("published."))).toEqual(["aid_changelog/published.0"]);
    expect(readChangelogState(node as unknown as BaseNode)?.published).toEqual(BASE);
  });

  it("без снимка — null", () => {
    expect(readChangelogState(fakeNode() as unknown as BaseNode)).toBeNull();
  });
});

describe("мелочи", () => {
  it("splitIntoChunks", () => {
    expect(splitIntoChunks("abcdef", 4)).toEqual(["abcd", "ef"]);
    expect(splitIntoChunks("", 4)).toEqual([""]);
  });

  it("pluralRu", () => {
    expect([1, 2, 5, 11, 21, 22, 112].map((n) => pluralRu(n, "a", "b", "c"))).toEqual(["a", "b", "c", "c", "a", "b", "c"]);
  });

  it("CHANGELOG_PATH_PATTERN — только чейнжлоги tokens/ и components/", () => {
    expect(CHANGELOG_PATH_PATTERN.test("tokens/rider-colors-semantic-changelog.json")).toBe(true);
    expect(CHANGELOG_PATH_PATTERN.test("components/switch-changelog.json")).toBe(true);
    expect(CHANGELOG_PATH_PATTERN.test("decisions-registry.json")).toBe(false);
    expect(CHANGELOG_PATH_PATTERN.test("tokens/../x-changelog.json")).toBe(false);
  });
});
