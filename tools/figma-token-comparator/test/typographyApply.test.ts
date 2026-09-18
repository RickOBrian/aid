/**
 * Находка №23: привязка стиля текста в режиме `documentAccess: "dynamic-page"`.
 *
 * В этом режиме `TextNode.textStyleId` только для чтения — присваивание
 * бросает исключение, стиль привязывается через `setTextStyleIdAsync`.
 * Типы Figma сеттер не запрещают, поэтому typecheck ошибку не ловил: в живой
 * Figma «Применить в макет» для типографики пропускал каждый слой.
 */

import { describe, expect, it, vi } from "vitest";

import { applyImportedTextStyleToNode } from "../src/lib/typographyApply";

/** TEXT-нода так, как её видит плагин с `documentAccess: "dynamic-page"`. */
function dynamicPageTextNode() {
  const node = {
    type: "TEXT" as const,
    setTextStyleIdAsync: vi.fn(async (_styleId: string) => {}),
  };
  Object.defineProperty(node, "textStyleId", {
    get: () => "",
    set: () => {
      throw new Error("Cannot call with documentAccess: dynamic-page. Use node.setTextStyleIdAsync instead.");
    },
  });
  return node;
}

describe("applyImportedTextStyleToNode", () => {
  it("привязывает стиль через setTextStyleIdAsync, а не присваиванием", async () => {
    const node = dynamicPageTextNode();
    const style = { id: "S:key-body-m,1:0", fontName: { family: "Inter", style: "Regular" } };
    const loadFontAsync = vi.fn(async () => {});
    (globalThis as unknown as { figma: Record<string, unknown> }).figma.loadFontAsync = loadFontAsync;

    await applyImportedTextStyleToNode(node as unknown as TextNode, style as unknown as TextStyle);

    expect(loadFontAsync).toHaveBeenCalledWith(style.fontName);
    expect(node.setTextStyleIdAsync).toHaveBeenCalledWith(style.id);
  });
});
