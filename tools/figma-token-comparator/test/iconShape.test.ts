/**
 * Отпечаток формы иконки: разбор пути, растеризация, похожесть.
 */

import { describe, expect, it } from "vitest";

import { fingerprint, pathToPolylines, shapeSimilarity, type ShapePath } from "../src/lib/iconShape";

const SQUARE: ShapePath = { d: "M0 0H10V10H0Z" };
/** Квадрат с квадратной дыркой: внешний контур по часовой, внутренний против. */
const FRAME_NONZERO: ShapePath = { d: "M0 0H10V10H0Z M3 3V7H7V3Z" };
/** Тот же квадрат с дыркой, но оба контура в одну сторону — дырка только по evenodd. */
const FRAME_SAME_DIR = "M0 0H10V10H0Z M3 3H7V7H3Z";
const ARROW_WHOLE: ShapePath = { d: "M2 11H16V9L22 12L16 15V13H2Z" };
const ARROW_SHAFT: ShapePath = { d: "M2 11H16V13H2Z" };
const ARROW_HEAD: ShapePath = { d: "M16 9L22 12L16 15Z" };
const CIRCLE: ShapePath = {
  d: "M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2Z",
};

describe("pathToPolylines", () => {
  it("абсолютные и относительные команды дают одну и ту же фигуру", () => {
    expect(pathToPolylines("M0 0L10 0L10 10L0 10Z")).toEqual(pathToPolylines("m0 0l10 0l0 10l-10 0z"));
  });

  it("каждый подпуть — отдельная ломаная", () => {
    expect(pathToPolylines(FRAME_NONZERO.d)).toHaveLength(2);
  });

  it("кривые аппроксимируются точками на кривой", () => {
    const [polyline] = pathToPolylines("M0 0C0 10 10 10 10 0");
    expect(polyline.length).toBeGreaterThan(4);
    expect(polyline[polyline.length - 1]).toEqual([10, 0]);
  });
});

describe("fingerprint", () => {
  it("квадрат заполняет всю маску", () => {
    const print = fingerprint([SQUARE], { size: 8 });
    expect(print.count).toBe(64);
  });

  it("evenodd вырезает дырку, nonzero с однонаправленными контурами — нет", () => {
    const evenOdd = fingerprint([{ d: FRAME_SAME_DIR, fillRule: "evenodd" }], { size: 10 });
    const nonZero = fingerprint([{ d: FRAME_SAME_DIR, fillRule: "nonzero" }], { size: 10 });
    expect(evenOdd.count).toBeLessThan(nonZero.count);
    expect(nonZero.count).toBe(100);
  });

  it("не зависит от положения и масштаба", () => {
    const base = fingerprint([CIRCLE]);
    const moved = fingerprint([{ ...CIRCLE, transform: [3, 0, 0, 3, 100, -40] }]);
    expect(shapeSimilarity(base, moved)).toBeGreaterThan(0.97);
  });

  it("иконка из двух слоёв совпадает с цельной (стрелка: хвостик + указатель)", () => {
    const whole = fingerprint([ARROW_WHOLE]);
    const split = fingerprint([ARROW_SHAFT, ARROW_HEAD]);
    expect(shapeSimilarity(whole, split)).toBeGreaterThan(0.95);
  });

  it("разные формы различаются", () => {
    expect(shapeSimilarity(fingerprint([CIRCLE]), fingerprint([ARROW_WHOLE]))).toBeLessThan(0.5);
  });

  it("пустая геометрия — пустой отпечаток", () => {
    expect(fingerprint([{ d: "" }]).count).toBe(0);
  });
});
