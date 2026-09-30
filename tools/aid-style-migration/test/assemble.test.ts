import { describe, expect, it } from "vitest";
import { findDarkPairs, isDark, relativeLuminance, type ScreenFacts } from "../src/assemble/darkPairs";
import { DEFAULT_LAYOUT, layoutTiles } from "../src/assemble/layout";
import { classify, type NodeFacts } from "../src/assemble/screens";
import { isAnnotationName, isHelperLayerName, outside } from "../src/lib/annotations";
import { hasDarkWord, stripThemeWords } from "../src/lib/vocabulary";

function node(over: Partial<NodeFacts> = {}): NodeFacts {
  return {
    id: "1",
    name: "Login",
    type: "FRAME",
    width: 390,
    height: 844,
    visible: true,
    childTypes: ["INSTANCE", "TEXT"],
    imageOnly: false,
    hasInstance: true,
    hasBackground: true,
    ...over,
  };
}

function screen(over: Partial<ScreenFacts> = {}): ScreenFacts {
  return { ...node(), pageId: "p1", x: 0, y: 0, bgLuminance: 1, ...over };
}

describe("словарь темы", () => {
  it("night, dark, тёмная — синонимы", () => {
    for (const name of ["Main Dark", "Main / Night", "Главная тёмная", "Главная (темная)", "Ночной режим"]) {
      expect(hasDarkWord(name)).toBe(true);
    }
  });
  it("не срабатывает на похожие слова внутри", () => {
    expect(hasDarkWord("Landing")).toBe(false);
    expect(hasDarkWord("Order MERGED")).toBe(false);
  });
  it("убирает слова темы для сравнения имён", () => {
    expect(stripThemeWords("Главная / Dark")).toBe(stripThemeWords("Главная / Light"));
    expect(stripThemeWords("FAQ / Opened Night")).toBe("faq opened");
  });
});

describe("что считать экраном", () => {
  it("фрейм размером с телефон — экран", () => {
    expect(classify(node()).kind).toBe("screen");
  });
  it("модалка 390×209 — тоже экран", () => {
    expect(classify(node({ height: 209 })).kind).toBe("screen");
  });
  it("картинка размером с экран — отдельная категория", () => {
    expect(classify(node({ type: "RECTANGLE", childTypes: [], imageOnly: true, height: 867 })).kind).toBe("image");
  });
  it("подписи, стрелки, скрытое и пустое — не экраны, с причиной", () => {
    expect(classify(node({ type: "TEXT", childTypes: [] }))).toEqual({ kind: "skip", reason: "подпись или графика" });
    expect(classify(node({ type: "VECTOR", width: 200, height: 0 })).kind).toBe("skip");
    expect(classify(node({ visible: false })).reason).toBe("скрыт");
    expect(classify(node({ childTypes: [] })).reason).toBe("пустой");
    expect(classify(node({ width: 198, height: 30 })).reason).toContain("не похож на экран");
  });
});

describe("тёмные пары", () => {
  it("яркость: белый 1, чёрный 0", () => {
    expect(relativeLuminance(1, 1, 1)).toBeCloseTo(1);
    expect(relativeLuminance(0, 0, 0)).toBe(0);
  });

  it("тёмный — по слову в имени или по фону", () => {
    expect(isDark(screen({ name: "Main Night" }))).toBe(true);
    expect(isDark(screen({ bgLuminance: 0.02 }))).toBe(true);
    expect(isDark(screen({ bgLuminance: null }))).toBe(false);
  });

  it("пара по имени и структуре", () => {
    const pairs = findDarkPairs([
      screen({ id: "l", name: "Главная" }),
      screen({ id: "d", name: "Главная dark", y: 1000, bgLuminance: 0.02 }),
    ]);
    expect(pairs).toEqual([{ lightId: "l", darkId: "d", reason: "имя и структура" }]);
  });

  it("много одноимённых экранов — берётся ближайший с той же структурой", () => {
    const pairs = findDarkPairs([
      screen({ id: "l1", x: 0 }),
      screen({ id: "l2", x: 500 }),
      screen({ id: "l3", x: 1000, childTypes: ["TEXT"] }),
      screen({ id: "d", x: 520, y: 1000, bgLuminance: 0.01 }),
    ]);
    expect(pairs[0].lightId).toBe("l2");
  });

  it("светлый экран не достаётся двум тёмным", () => {
    const pairs = findDarkPairs([
      screen({ id: "l" }),
      screen({ id: "d1", bgLuminance: 0.01 }),
      screen({ id: "d2", bgLuminance: 0.01 }),
    ]);
    expect(pairs).toHaveLength(1);
  });

  it("пары только внутри страницы", () => {
    const pairs = findDarkPairs([screen({ id: "l", pageId: "a" }), screen({ id: "d", pageId: "b", bgLuminance: 0.01 })]);
    expect(pairs).toHaveLength(0);
  });
});

describe("раскладка", () => {
  const phone = { width: 390, height: 844 };

  it("36 экранов — не колонка вниз, а сетка близкая к пропорции экрана", () => {
    const layout = layoutTiles(Array.from({ length: 36 }, () => [phone]));
    expect(layout.perLine).toBeGreaterThan(4);
    expect(layout.width / layout.height).toBeGreaterThan(1);
    expect(layout.width / layout.height).toBeLessThan(3);
  });

  it("плитка с тёмной парой шире, ячейки не наезжают", () => {
    const layout = layoutTiles([[phone, phone], [phone]]);
    const [a, b] = layout.tiles;
    expect(a.cellX[1] - a.cellX[0]).toBe(390 + DEFAULT_LAYOUT.cellGap);
    expect(b.x - a.x).toBeGreaterThanOrEqual(390 * 2 + DEFAULT_LAYOUT.cellGap);
  });

  it("высокий экран раздвигает свой ряд, следующий ряд ниже него", () => {
    const layout = layoutTiles([[{ width: 390, height: 2051 }], ...Array.from({ length: 20 }, () => [phone])]);
    const firstLine = layout.tiles[0];
    const nextLine = layout.tiles.find((t) => t.y > firstLine.y)!;
    expect(nextLine.y).toBeGreaterThan(firstLine.cellY + 2051);
  });

  it("один экран — одна плитка", () => {
    const layout = layoutTiles([[phone]]);
    expect(layout.perLine).toBe(1);
    expect(layout.tiles).toHaveLength(1);
  });
});

describe("аннотации — не макет", () => {
  it("узнаёт по имени на двух языках и служебные описания", () => {
    for (const name of ["Annotation", "Notes / Flow", "Redline", "Spec", "Аннотация", "Заметка дизайнера", "Пояснение", "_description/info_row", "Техническая схема"]) {
      expect(isAnnotationName(name)).toBe(true);
    }
  });
  it("не трогает обычные слои", () => {
    for (const name of ["Button", "Notification", "Header", "Text", "Nav Bar", "Карточка заказа"]) {
      expect(isAnnotationName(name)).toBe(false);
    }
  });
  it("экран с именем аннотации не собирается", () => {
    expect(classify(node({ name: "Annotation / Login" })).reason).toBe("аннотация или пояснение");
  });
  it("обвязка флоу размером с экран — не экран (образцы 2026-09-30)", () => {
    // Стрелка с подписью «Свайп вниз», ромб условия: группа без фона и компонентов.
    expect(classify(node({ type: "GROUP", width: 357, height: 346, hasInstance: false, hasBackground: false })).kind).toBe("skip");
    // Заголовок сценария 1560×126 — с фоном, но низкий для широкой полосы.
    expect(classify(node({ type: "GROUP", width: 1560, height: 126, hasInstance: false })).kind).toBe("skip");
    // Экран с картой во вложенном компоненте — без своего фона, но с компонентами.
    expect(classify(node({ hasBackground: false })).kind).toBe("screen");
    // Макет без компонентов, но с фоном — экран (грязные исходники).
    expect(classify(node({ hasInstance: false })).kind).toBe("screen");
  });
  it("внутри экрана слова аннотаций не работают: комментарий и описание — элементы интерфейса", () => {
    expect(isHelperLayerName("comment")).toBe(false);
    expect(isHelperLayerName("Description")).toBe(false);
    expect(isHelperLayerName("_description/info_row")).toBe(true);
  });
  it("целиком вне экрана — не макет, пересекает — макет", () => {
    const screenBox = { x: 0, y: 0, width: 390, height: 844 };
    expect(outside({ x: 420, y: 10, width: 200, height: 40 }, screenBox)).toBe(true);
    expect(outside({ x: 380, y: 10, width: 200, height: 40 }, screenBox)).toBe(false);
  });
});
