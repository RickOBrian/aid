/**
 * Атомы стиля исходника (этап 3a): читаем копии «Было» на странице
 * «AID Migration» — цвета по месту в макете, стили текста, радиусы,
 * отступы. Документ не меняет.
 *
 * Не макет — не читаем: аннотации, выноски вне экрана, системные элементы
 * (клавиатура, статус-бар). Внутренности компонентов читаем, но считаем
 * отдельно: они переведутся заменой компонента на этапе 4.
 */

import { KEY_PAIR, KEY_ROLE, KEY_SECTION, KEY_SOURCE } from "../assemble/build";
import { findThemeCollection } from "../assemble/collect";
import { isAnnotationName, outside } from "../lib/annotations";
import { isSystemName } from "../lib/system";
import { WORK_PAGE_NAME } from "../lib/workPage";
import { fillUse, visibleCase, type TextCaseKind, type UseKind } from "../profile/usage";
import { toHex, type Rgba } from "./color";
import { colorAtomId, colorKey, textAtomId, valueAtomId } from "./keys";
import { weightOf } from "./typography";
import type { SourceColor, SourceText, SourceValue } from "./types";

const EXAMPLES = 5;

export interface Atoms {
  screens: number;
  colors: SourceColor[];
  texts: SourceText[];
  radii: SourceValue[];
  spacing: SourceValue[];
  skipped: { annotations: number; system: number; mixedText: number };
  darkEvidence: number;
}

interface Theme {
  collectionId: string;
  darkModeId: string;
}

interface Ctx {
  screen: { width: number; height: number; box: Rect | null };
  inInstance: boolean;
  /** Тот же узел в настоящей тёмной паре — если структура совпала. */
  twin: SceneNode | null;
}

class Collector {
  colors = new Map<string, SourceColor>();
  texts = new Map<string, SourceText & { cases: Partial<Record<TextCaseKind, number>> }>();
  radii = new Map<number, SourceValue>();
  spacing = new Map<number, SourceValue>();
  skipped = { annotations: 0, system: 0, mixedText: 0 };
  darkEvidence = 0;
  private variables = new Map<string, Variable | null>();

  constructor(private theme: Theme | null) {}

  private async variable(id: string): Promise<Variable | null> {
    if (!this.variables.has(id)) this.variables.set(id, await figma.variables.getVariableByIdAsync(id));
    return this.variables.get(id) ?? null;
  }

  /** Значение переменной исходника в тёмном режиме его темы — ссылки проходим до конца. */
  private async darkValue(variable: Variable, depth = 0): Promise<Rgba | null> {
    if (!this.theme || depth > 10) return null;
    const value = variable.valuesByMode[this.theme.darkModeId] ?? Object.values(variable.valuesByMode)[0];
    if (value && typeof value === "object" && "type" in value && value.type === "VARIABLE_ALIAS") {
      const next = await this.variable(value.id);
      return next ? this.darkValue(next, depth + 1) : null;
    }
    if (value && typeof value === "object" && "r" in value) return { r: value.r, g: value.g, b: value.b, a: "a" in value ? value.a : 1 };
    return null;
  }

  private collections = new Map<string, string>();

  /** Откуда переменная исходника: коллекция и локальная или из библиотеки — у одноимённых разное. */
  private async origin(v: Variable): Promise<string> {
    if (!this.collections.has(v.variableCollectionId)) {
      let name = "";
      try {
        name = (await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId))?.name ?? "";
      } catch {
        // коллекция чужой библиотеки может быть недоступна
      }
      this.collections.set(v.variableCollectionId, name);
    }
    const name = this.collections.get(v.variableCollectionId) || "коллекция неизвестна";
    return `${name} · ${v.remote ? "из библиотеки" : "локальная"}`;
  }

  private static solids(node: SceneNode, field: "fills" | "strokes"): SolidPaint[] {
    if (!(field in node)) return [];
    const paints = (node as unknown as Record<string, unknown>)[field];
    return Array.isArray(paints) ? (paints as Paint[]).filter((p): p is SolidPaint => p.type === "SOLID" && p.visible !== false) : [];
  }

  private async addColor(node: SceneNode, paint: SolidPaint, use: UseKind, ctx: Ctx, twinPaint: SolidPaint | undefined): Promise<void> {
    let light: Rgba = { ...paint.color, a: paint.opacity ?? 1 };
    let dark: Rgba | null = twinPaint ? { ...twinPaint.color, a: twinPaint.opacity ?? 1 } : null;
    const alias = paint.boundVariables?.color;
    const v = alias ? await this.variable(alias.id) : null;
    const key = colorKey(paint, v);
    let label = toHex(light);
    let origin = "без токена";
    if (alias) {
      if (v) {
        label = v.name;
        origin = await this.origin(v);
        const resolved = v.resolveForConsumer(node).value;
        if (resolved && typeof resolved === "object" && "r" in resolved) light = { r: resolved.r, g: resolved.g, b: resolved.b, a: ("a" in resolved ? resolved.a : 1) * (paint.opacity ?? 1) };
        if (!dark && this.theme && v.variableCollectionId === this.theme.collectionId) dark = await this.darkValue(v);
      }
    }
    if (dark) this.darkEvidence++;
    const id = colorAtomId(key, use);
    const entry = this.colors.get(id) ?? { id, key, label, origin, use, light, dark, count: 0, inInstances: 0, examples: [] };
    entry.count++;
    if (ctx.inInstance) entry.inInstances++;
    if (!entry.dark && dark) entry.dark = dark;
    if (entry.examples.length < EXAMPLES) entry.examples.push(node.id);
    this.colors.set(id, entry);
  }

  private addValue(map: Map<number, SourceValue>, value: number, node: SceneNode): void {
    const v = Math.round(value * 10) / 10;
    const entry = map.get(v) ?? { id: valueAtomId(value), value: v, count: 0, examples: [] };
    entry.count++;
    if (entry.examples.length < EXAMPLES) entry.examples.push(node.id);
    map.set(v, entry);
  }

  private addText(node: TextNode): void {
    if (node.fontName === figma.mixed || node.fontSize === figma.mixed) {
      this.skipped.mixedText++;
      return;
    }
    const font = node.fontName;
    const size = node.fontSize;
    const lh = node.lineHeight === figma.mixed ? null : node.lineHeight.unit === "PIXELS" ? node.lineHeight.value : null;
    const kase = visibleCase(node.characters, typeof node.textCase === "string" ? node.textCase : "ORIGINAL");
    const id = textAtomId(font, size);
    const entry = this.texts.get(id) ?? {
      id,
      label: `${font.family} ${font.style} ${size}`,
      fontFamily: font.family,
      fontStyle: font.style,
      weight: weightOf(font.style),
      size,
      lineHeight: lh,
      visibleCase: kase,
      count: 0,
      examples: [],
      cases: {},
    };
    entry.count++;
    entry.cases[kase] = (entry.cases[kase] ?? 0) + 1;
    if (entry.examples.length < EXAMPLES) entry.examples.push(node.id);
    this.texts.set(id, entry);
  }

  async visit(node: SceneNode, ctx: Ctx, root = false): Promise<void> {
    if (!node.visible) return;
    if (!root && (isAnnotationName(node.name) || outside(node.absoluteBoundingBox, ctx.screen.box))) {
      this.skipped.annotations++;
      return;
    }
    let inInstance = ctx.inInstance;
    if (node.type === "INSTANCE") {
      const main = await node.getMainComponentAsync();
      const setName = main?.parent?.type === "COMPONENT_SET" ? main.parent.name : "";
      if (isSystemName(node.name) || (main && (isSystemName(main.name) || isSystemName(setName)))) {
        this.skipped.system++;
        return;
      }
      inInstance = true;
    }
    const here: Ctx = { ...ctx, inInstance };

    const fills = Collector.solids(node, "fills");
    const twinFills = ctx.twin ? Collector.solids(ctx.twin, "fills") : [];
    const use = fillUse({
      nodeType: node.type,
      width: node.width,
      height: node.height,
      screenWidth: ctx.screen.width,
      screenHeight: ctx.screen.height,
      insideSmallInstance: inInstance && node.type !== "TEXT" && node.width <= 48 && node.height <= 48,
    });
    for (const [i, p] of fills.entries()) await this.addColor(node, p, use, here, twinFills[i]);
    const strokes = Collector.solids(node, "strokes");
    const twinStrokes = ctx.twin ? Collector.solids(ctx.twin, "strokes") : [];
    for (const [i, p] of strokes.entries()) await this.addColor(node, p, "stroke", here, twinStrokes[i]);

    if (node.type === "TEXT") {
      this.addText(node);
      return;
    }
    if ("cornerRadius" in node && typeof node.cornerRadius === "number" && node.cornerRadius > 0) this.addValue(this.radii, node.cornerRadius, node);
    if ("layoutMode" in node && node.layoutMode !== "NONE") {
      for (const v of [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft, node.itemSpacing]) {
        if (v > 0) this.addValue(this.spacing, v, node);
      }
    }
    if ("children" in node) {
      const twinKids = ctx.twin && "children" in ctx.twin ? ctx.twin.children : null;
      for (const [i, child] of node.children.entries()) {
        // Двойник — только если структура совпадает: тот же тип на том же месте.
        const twin = twinKids && twinKids.length === node.children.length && twinKids[i].type === child.type ? twinKids[i] : null;
        await this.visit(child, { ...here, twin }, false);
      }
    }
  }

  result(screens: number): Atoms {
    const texts = [...this.texts.values()].map(({ cases, ...t }) => {
      const top = (Object.entries(cases) as Array<[TextCaseKind, number]>).sort((a, b) => b[1] - a[1])[0];
      return { ...t, visibleCase: top ? top[0] : t.visibleCase };
    });
    return {
      screens,
      colors: [...this.colors.values()],
      texts,
      radii: [...this.radii.values()],
      spacing: [...this.spacing.values()],
      skipped: this.skipped,
      darkEvidence: this.darkEvidence,
    };
  }
}

/** Все светлые «Было» на странице сборки; тёмные пары — как двойники. */
export async function collectAtoms(report: (done: number, total: number) => void): Promise<Atoms> {
  const work = figma.root.children.find((p) => p.name === WORK_PAGE_NAME);
  if (!work) throw new Error("Страницы «AID Migration» нет — сначала соберите макеты на вкладке «Сборка»");
  await work.loadAsync();
  const sections = work.children.filter((n): n is SectionNode => n.type === "SECTION" && n.getPluginData(KEY_SECTION) !== "");
  const cells = sections.flatMap((s) => s.children).filter((n) => n.getPluginData(KEY_ROLE) === "before-light");
  if (cells.length === 0) throw new Error("На «AID Migration» нет собранных экранов — сначала «Собрать»");

  const darkByLight = new Map<string, SceneNode>();
  for (const s of sections) for (const n of s.children) if (n.getPluginData(KEY_PAIR)) darkByLight.set(n.getPluginData(KEY_PAIR), n);

  const theme = await findThemeCollection();
  const collector = new Collector(theme ? { collectionId: theme.collection.id, darkModeId: theme.darkModeId } : null);
  const prevSkip = figma.skipInvisibleInstanceChildren;
  figma.skipInvisibleInstanceChildren = true;
  try {
    for (const [i, cell] of cells.entries()) {
      const twin = darkByLight.get(cell.getPluginData(KEY_SOURCE)) ?? null;
      await collector.visit(cell, { screen: { width: cell.width, height: cell.height, box: cell.absoluteBoundingBox }, inInstance: false, twin }, true);
      report(i + 1, cells.length);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    figma.skipInvisibleInstanceChildren = prevSkip;
  }
  return collector.result(cells.length);
}
