/**
 * Сравнение иконок макета с библиотекой (v1.5.0, этап 3).
 *
 * Форма важнее имени; пороги — из этапа 0 (docs/icons-spike-2026-09-19.md).
 */

import { describe, expect, it } from "vitest";

import { compareIcons, requiresIconUserAction } from "../src/lib/iconComparator";
import type { IconRecord } from "../src/lib/iconScanner";
import { fingerprint, packFingerprint, type ShapePath } from "../src/lib/iconShape";
import type { LibraryIcon, StoredDecision } from "../src/comparators/types";

const ARROW = "M2 11H16V9L22 12L16 15V13H2Z";
const CROSS = "M5 4L12 11L19 4L20 5L13 12L20 19L19 20L12 13L5 20L4 19L11 12L4 5Z";
const CIRCLE = "M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2Z";
const SQUARE = "M3 3H21V21H3Z";
/** Стрелка с чуть другим наконечником — «похожая», но не та же. */
const ARROW_BLUNT = "M2 11H15V8L22 12L15 16V13H2Z";

const print = (d: string) => packFingerprint(fingerprint([{ d } as ShapePath]));

function lib(key: string, d: string, extra: Partial<LibraryIcon> = {}): LibraryIcon {
  return {
    key,
    nodeId: `n-${key}`,
    name: key,
    width: 24,
    height: 24,
    glyph: { x: 2, y: 2, width: 20, height: 20 },
    opacities: [1],
    layers: 1,
    fingerprint: print(d),
    ...extra,
  };
}

function rec(overrides: Partial<IconRecord> & { d: string }): IconRecord {
  const { d, ...rest } = overrides;
  return {
    id: `r-${Math.random().toString(36).slice(2)}`,
    kind: "detached",
    representativeName: "Vector",
    representativePath: "Page / Card / Vector",
    width: 24,
    height: 24,
    scaled: false,
    fingerprint: print(d),
    glyph: { width: 20, height: 20 },
    opacities: [1],
    layers: 1,
    count: 1,
    occurrences: [["1:1"]],
    ...rest,
  };
}

const LIBRARY = [lib("arrow", ARROW), lib("close", CROSS), lib("circle", CIRCLE)];
const instanceOf = (key: string, name = key, extra: Partial<IconRecord["component"]> = {}) =>
  ({ key, name, remote: true, width: 24, height: 24, ...extra }) as NonNullable<IconRecord["component"]>;

describe("compareIcons — статусы", () => {
  it("экземпляр иконки этой библиотеки нормального размера — совпадает и скрыт", () => {
    const [result] = compareIcons([rec({ d: ARROW, kind: "instance", component: instanceOf("arrow") })], LIBRARY, {});
    expect(result.status).toBe("exact");
    expect(requiresIconUserAction(result)).toBe(false);
  });

  it("экземпляр чужого компонента с той же формой — «Совпала форма» с предложением", () => {
    const [result] = compareIcons(
      [rec({ d: ARROW, kind: "instance", component: instanceOf("old-arrow", "icon/arrow-right") })],
      LIBRARY,
      {}
    );
    expect(result.status).toBe("value");
    expect(result.target?.icon.key).toBe("arrow");
    expect(result.target?.similarity).toBeGreaterThanOrEqual(0.97);
    expect(requiresIconUserAction(result)).toBe(true);
  });

  it("точная копия без компонента — «Отвязанная иконка»", () => {
    const [result] = compareIcons([rec({ d: CROSS })], LIBRARY, {});
    expect(result.status).toBe("detached");
    expect(result.target?.icon.key).toBe("close");
  });

  it("похожая, но не та же форма — «Похожая форма»", () => {
    const [result] = compareIcons([rec({ d: ARROW_BLUNT })], LIBRARY, {});
    expect(result.status).toBe("approximate");
    expect(result.target?.icon.key).toBe("arrow");
  });

  it("имя совпало, форма другая — «Конфликт», предложение по имени", () => {
    const [result] = compareIcons(
      [rec({ d: SQUARE, kind: "instance", component: instanceOf("x", "controls/close") })],
      LIBRARY,
      {}
    );
    expect(result.status).toBe("conflict");
    expect(result.target?.icon.key).toBe("close");
  });

  it("ничего похожего — «Нет в библиотеке»", () => {
    const [result] = compareIcons([rec({ d: SQUARE })], LIBRARY, {});
    expect(result.status).toBe("layout-only");
    expect(result.target).toBeUndefined();
  });
});

describe("compareIcons — выбор среди равных по форме", () => {
  it("состояния одной формы различаются прозрачностью слоёв", () => {
    const library = [lib("lane_0", ARROW, { opacities: [0.5] }), lib("lane_1", ARROW, { opacities: [1] })];
    const [dim] = compareIcons([rec({ d: ARROW, opacities: [0.5] })], library, {});
    const [solid] = compareIcons([rec({ d: ARROW, opacities: [1] })], library, {});
    expect(dim.target?.icon.key).toBe("lane_0");
    expect(solid.target?.icon.key).toBe("lane_1");
    expect(dim.flags.disputed).toBeFalsy();
  });

  it("тот же рисунок другого размера — выбирается ближайший по размеру рисунка", () => {
    const library = [
      lib("close_small", CROSS, { glyph: { x: 6, y: 6, width: 12, height: 12 } }),
      lib("close_large", CROSS, { glyph: { x: 2, y: 2, width: 20, height: 20 } }),
    ];
    const [result] = compareIcons([rec({ d: CROSS, glyph: { width: 12, height: 12 } })], library, {});
    expect(result.target?.icon.key).toBe("close_small");
  });

  it("полные дубликаты — «Спорный вариант» со списком двойников", () => {
    const library = [lib("box", SQUARE), lib("delivery", SQUARE)];
    const [result] = compareIcons([rec({ d: SQUARE })], library, {});
    expect(result.flags.disputed).toBe(true);
    expect(result.alternatives.map((alt) => alt.icon.key).sort()).toEqual(["box", "delivery"]);
  });

  it("среди дубликатов имя разрешает спор", () => {
    const library = [lib("box", SQUARE), lib("delivery", SQUARE)];
    const [result] = compareIcons(
      [rec({ d: SQUARE, kind: "instance", component: instanceOf("old", "icons/delivery") })],
      library,
      {}
    );
    expect(result.target?.icon.key).toBe("delivery");
    expect(result.flags.disputed).toBeFalsy();
  });
});

describe("compareIcons — пометки", () => {
  it("растянутый экземпляр библиотеки — «Нестандартный размер», предложение — та же форма нужного размера", () => {
    const library = [
      lib("close_24", CROSS),
      lib("close_32", CROSS, { width: 32, height: 32, glyph: { x: 3, y: 3, width: 26, height: 26 } }),
    ];
    const [result] = compareIcons(
      [
        rec({
          d: CROSS,
          kind: "instance",
          component: instanceOf("close_24"),
          width: 32,
          height: 32,
          scaled: true,
          glyph: { width: 26, height: 26 },
        }),
      ],
      library,
      {}
    );
    expect(result.status).toBe("exact");
    expect(result.flags.nonstandardSize).toBe(true);
    expect(result.target?.icon.key).toBe("close_32");
    expect(requiresIconUserAction(result)).toBe(true);
  });

  it("иконка из нескольких слоёв при однослойной библиотечной — пометка", () => {
    const [result] = compareIcons([rec({ d: ARROW, layers: 2 })], LIBRARY, {});
    expect(result.flags.multiLayer).toBe(true);
  });
});

describe("compareIcons — решения", () => {
  const T = "2026-09-19T00:00:00.000Z";

  it("выбранная иконка — «Решение принято», строка скрыта", () => {
    const record = rec({ d: SQUARE });
    const decision: StoredDecision = { decision: "mapped", targetComponentKey: "circle", timestamp: T };
    const [result] = compareIcons([record], LIBRARY, { [record.id]: decision });
    expect(result.status).toBe("mapped");
    expect(result.target?.icon.key).toBe("circle");
    expect(requiresIconUserAction(result)).toBe(false);
  });

  it("«Игнорировать» скрывает, «Кандидат» оставляет", () => {
    const a = rec({ d: SQUARE });
    const b = rec({ d: SQUARE });
    const [ignored, candidate] = compareIcons([a, b], LIBRARY, {
      [a.id]: { decision: "ignored", comment: "так надо", timestamp: T },
      [b.id]: { decision: "candidate", timestamp: T },
    });
    expect(requiresIconUserAction(ignored)).toBe(false);
    expect(requiresIconUserAction(candidate)).toBe(true);
  });

  it("решение с иконкой, которой нет в библиотеке, строку не закрывает", () => {
    const record = rec({ d: SQUARE });
    const [result] = compareIcons([record], LIBRARY, {
      [record.id]: { decision: "mapped", targetComponentKey: "gone", timestamp: T },
    });
    expect(result.status).toBe("layout-only");
    expect(requiresIconUserAction(result)).toBe(true);
  });
});
