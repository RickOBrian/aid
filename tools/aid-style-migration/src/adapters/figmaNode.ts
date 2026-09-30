/**
 * Адаптер Plugin API → нормализованный узел (Я1). Невидимое не берём;
 * аннотации и системные элементы отсекает не адаптер, а движок.
 */

import type { Rgba } from "../map/color";
import type { NNode, NPaint, NVariable } from "../core/node";

export class FigmaReader {
  private variables = new Map<string, NVariable | null>();
  private collections = new Map<string, string>();
  private styles = new Map<string, { key: string; name: string } | null>();

  private async variable(id: string): Promise<NVariable | null> {
    if (!this.variables.has(id)) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (!v) {
        this.variables.set(id, null);
      } else {
        if (!this.collections.has(v.variableCollectionId)) {
          let name = "";
          try {
            name = (await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId))?.name ?? "";
          } catch {
            // коллекция чужой библиотеки может быть недоступна
          }
          this.collections.set(v.variableCollectionId, name);
        }
        this.variables.set(id, { id, key: v.key || v.id, name: v.name, collection: this.collections.get(v.variableCollectionId) ?? "", remote: v.remote });
      }
    }
    return this.variables.get(id) ?? null;
  }

  private async paints(value: unknown, node: SceneNode): Promise<NPaint[]> {
    if (!Array.isArray(value)) return [];
    const out: NPaint[] = [];
    for (const p of value as Paint[]) {
      if (p.visible === false) continue;
      if (p.type === "SOLID") {
        const alias = p.boundVariables?.color;
        const variable = alias ? await this.variable(alias.id) : null;
        let color: Rgba = { ...p.color, a: p.opacity ?? 1 };
        if (alias) {
          const v = await figma.variables.getVariableByIdAsync(alias.id);
          const r = v?.resolveForConsumer(node).value;
          if (r && typeof r === "object" && "r" in r) color = { r: r.r, g: r.g, b: r.b, a: ("a" in r ? r.a : 1) * (p.opacity ?? 1) };
        }
        out.push({ kind: "solid", color, ...(variable ? { variable } : {}) });
      } else if (p.type === "IMAGE") out.push({ kind: "image" });
      else if (p.type.startsWith("GRADIENT")) out.push({ kind: "gradient" });
      else out.push({ kind: "other" });
    }
    return out;
  }

  private async style(id: string): Promise<{ key: string; name: string } | null> {
    if (!this.styles.has(id)) {
      const s = await figma.getStyleByIdAsync(id);
      this.styles.set(id, s ? { key: s.key, name: s.name } : null);
    }
    return this.styles.get(id) ?? null;
  }

  /** Экран целиком: координаты — относительно его левого верхнего угла. */
  async read(node: SceneNode, origin?: { x: number; y: number }): Promise<NNode | null> {
    if (!node.visible) return null;
    const box = node.absoluteBoundingBox ?? { x: node.x, y: node.y, width: node.width, height: node.height };
    const o = origin ?? { x: box.x, y: box.y };
    const n: NNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      x: Math.round(box.x - o.x),
      y: Math.round(box.y - o.y),
      width: Math.round(node.width),
      height: Math.round(node.height),
      fills: await this.paints("fills" in node ? node.fills : [], node),
      strokes: await this.paints("strokes" in node ? node.strokes : [], node),
      strokeWeight: "strokeWeight" in node && typeof node.strokeWeight === "number" ? node.strokeWeight : 0,
      radius: "cornerRadius" in node && typeof node.cornerRadius === "number" ? node.cornerRadius : null,
      children: [],
    };
    if ("layoutMode" in node && node.layoutMode !== "NONE" && node.layoutMode !== "GRID") {
      n.layout = {
        mode: node.layoutMode,
        padding: [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft],
        gap: node.itemSpacing,
        primaryAlign: node.primaryAxisAlignItems,
        counterAlign: node.counterAxisAlignItems,
      };
    }
    if (node.type === "TEXT") {
      const style = typeof node.textStyleId === "string" && node.textStyleId ? await this.style(node.textStyleId) : null;
      n.text = {
        characters: node.characters,
        fontFamily: node.fontName === figma.mixed ? "mixed" : node.fontName.family,
        fontStyle: node.fontName === figma.mixed ? "mixed" : node.fontName.style,
        fontSize: node.fontSize === figma.mixed ? 0 : node.fontSize,
        textCase: typeof node.textCase === "string" ? node.textCase : "ORIGINAL",
        textDecoration: typeof node.textDecoration === "string" ? node.textDecoration : "NONE",
        align: node.textAlignHorizontal,
        ...(style ? { styleKey: style.key, styleName: style.name } : {}),
      };
    }
    if (node.type === "INSTANCE") {
      const main = await node.getMainComponentAsync();
      if (main) {
        const set = main.parent?.type === "COMPONENT_SET" ? main.parent : null;
        n.component = { key: set ? set.key : main.key, name: main.name, setName: set ? set.name : "" };
      }
    }
    if ("children" in node) {
      for (const c of node.children) {
        const child = await this.read(c, o);
        if (child) n.children.push(child);
      }
    }
    return n;
  }
}
