/**
 * Страж решения «продукт — это данные, а не код» (CLAUDE.md плагина).
 * Имена продуктов и режимов темы живут в профиле продукта; появились в
 * src/ — значит, продуктовое протекло в движок.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "..", "src");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const PRODUCT_NAMES = /\b(driver|rider)\b/i;
/** Имена режимов как строковые литералы: `"night"`, 'Dark' и т. п. */
const MODE_LITERALS = /["'`](day|night|light|dark)["'`]/i;

describe("движок не знает продуктов", () => {
  for (const path of files(SRC).filter((p) => /\.(ts|html)$/.test(p))) {
    it(path.slice(SRC.length + 1), () => {
      const text = readFileSync(path, "utf8");
      expect(text).not.toMatch(PRODUCT_NAMES);
      expect(text).not.toMatch(MODE_LITERALS);
    });
  }
});
