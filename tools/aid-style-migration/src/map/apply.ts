/**
 * Применение карты стиля (этап 3b): плитки пересобираются с «Стало»,
 * «Стало · светлая» переводится на токены и стили продукта, «Стало ·
 * тёмная» — её копия в тёмном режиме темы продукта.
 *
 * Исходники и «Было» не меняются. Структура макета не меняется: только
 * привязки цвета, стиля текста, радиусов и отступов. Внутри компонентов —
 * оверрайды инстанса, без отвязки (у агента отвязка уничтожила все 599
 * инстансов — спайк, п. 1). Откат — «Убрать «Стало»»: пересборка без него.
 */

import { assemble, KEY_ROLE, KEY_SECTION, plannedFromWorkPage } from "../assemble/build";
import { isAnnotationName, outside } from "../lib/annotations";
import { isSystemName } from "../lib/system";
import { WORK_PAGE_NAME } from "../lib/workPage";
import * as store from "../profile/storage";
import { fillUse, visibleCase } from "../profile/usage";
import { THEME_ROLES } from "../lib/vocabulary";
import { DEFAULT_LAYOUT } from "../assemble/layout";
import { colorAtomId, colorKey, textAtomId, valueAtomId } from "./keys";

/** Решения карты: атом исходника → ключ токена или стиля продукта. */
export interface Decisions {
  colors: Record<string, string>;
  texts: Record<string, string>;
  radii: Record<string, string>;
  spacing: Record<string, string>;
  /** Сохранять капс исходника, если у стиля продукта его нет (спайк, п. 2). */
  keepUpper: boolean;
}

export interface ApplyResult {
  screens: number;
  colors: number;
  texts: number;
  radii: number;
  spacing: number;
  failed: number;
  failures: string[];
  ms: number;
}

const SPACING_FIELDS = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "itemSpacing"] as const;
const RADIUS_FIELDS = ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"] as const;

class Applier {
  result = { colors: 0, texts: 0, radii: 0, spacing: 0, failed: 0 };
  failures: string[] = [];
  private vars = new Map<string, Promise<Variable>>();
  private styles = new Map<string, Promise<TextStyle>>();
  private sourceVars = new Map<string, Variable | null>();

  /** Прозрачность токенов продукта в светлом режиме — чтобы не умножить прозрачность дважды. */
  constructor(
    private d: Decisions,
    private alpha: Map<string, number>,
  ) {}

  private fail(what: string, e: unknown): void {
    this.result.failed++;
    if (this.failures.length < 8) this.failures.push(`${what}: ${e instanceof Error ? e.message : String(e)}`);
  }

  private variable(key: string): Promise<Variable> {
    if (!this.vars.has(key)) this.vars.set(key, figma.variables.importVariableByKeyAsync(key));
    return this.vars.get(key)!;
  }

  private style(key: string): Promise<TextStyle> {
    if (!this.styles.has(key)) {
      this.styles.set(
        key,
        figma.importStyleByKeyAsync(key).then(async (s) => {
          if (s.type !== "TEXT") throw new Error(`стиль ${s.name} не текстовый`);
          await figma.loadFontAsync(s.fontName);
          return s;
        }),
      );
    }
    return this.styles.get(key)!;
  }

  private async sourceVar(id: string): Promise<Variable | null> {
    if (!this.sourceVars.has(id)) this.sourceVars.set(id, await figma.variables.getVariableByIdAsync(id));
    return this.sourceVars.get(id) ?? null;
  }

  private async repaint(node: SceneNode, field: "fills" | "strokes", use: ReturnType<typeof fillUse> | "stroke"): Promise<void> {
    const paints = (node as unknown as Record<string, unknown>)[field];
    if (!Array.isArray(paints) || paints.length === 0) return;
    let changed = false;
    const next: Paint[] = [];
    for (const p of paints as Paint[]) {
      if (p.type !== "SOLID" || p.visible === false) {
        next.push(p);
        continue;
      }
      const alias = p.boundVariables?.color;
      const key = colorKey(p, alias ? await this.sourceVar(alias.id) : null);
      const target = this.d.colors[colorAtomId(key, use)];
      if (!target) {
        next.push(p);
        continue;
      }
      try {
        const v = await this.variable(target);
        // Прозрачность несёт токен — прозрачность заливки не умножаем на неё второй раз.
        const base: SolidPaint = (this.alpha.get(target) ?? 1) < 0.99 ? { ...p, opacity: 1 } : p;
        next.push(figma.variables.setBoundVariableForPaint(base, "color", v));
        changed = true;
        this.result.colors++;
      } catch (e) {
        next.push(p);
        this.fail(`цвет ${key}`, e);
      }
    }
    if (changed) (node as unknown as Record<string, unknown>)[field] = next;
  }

  private async restyle(node: TextNode): Promise<void> {
    if (node.fontName === figma.mixed || node.fontSize === figma.mixed) return;
    const key = this.d.texts[textAtomId(node.fontName, node.fontSize)];
    if (!key) return;
    const before = visibleCase(node.characters, typeof node.textCase === "string" ? node.textCase : "ORIGINAL");
    try {
      const style = await this.style(key);
      await node.setTextStyleIdAsync(style.id);
      if (this.d.keepUpper && before === "upper" && node.textCase !== "UPPER") node.textCase = "UPPER";
      this.result.texts++;
    } catch (e) {
      this.fail(`текст «${node.characters.slice(0, 20)}»`, e);
    }
  }

  private async bind(node: SceneNode, fields: readonly string[], values: number[], table: Record<string, string>, counter: "radii" | "spacing"): Promise<void> {
    for (const [i, field] of fields.entries()) {
      const value = values[i];
      if (!(value > 0)) continue;
      const key = table[valueAtomId(value)];
      if (!key) continue;
      try {
        (node as unknown as { setBoundVariable(f: string, v: Variable): void }).setBoundVariable(field, await this.variable(key));
        this.result[counter]++;
      } catch (e) {
        this.fail(`${field} ${value}`, e);
      }
    }
  }

  async visit(node: SceneNode, screen: { width: number; height: number; box: Rect | null }, inInstance: boolean, root = false): Promise<void> {
    if (!node.visible) return;
    if (!root && (isAnnotationName(node.name) || outside(node.absoluteBoundingBox, screen.box))) return;
    let inside = inInstance;
    if (node.type === "INSTANCE") {
      const main = await node.getMainComponentAsync();
      const setName = main?.parent?.type === "COMPONENT_SET" ? main.parent.name : "";
      if (isSystemName(node.name) || (main && (isSystemName(main.name) || isSystemName(setName)))) return;
      inside = true;
    }
    const use = fillUse({
      nodeType: node.type,
      width: node.width,
      height: node.height,
      screenWidth: screen.width,
      screenHeight: screen.height,
      insideSmallInstance: inside && node.type !== "TEXT" && node.width <= 48 && node.height <= 48,
    });
    await this.repaint(node, "fills", use);
    await this.repaint(node, "strokes", "stroke");

    if (node.type === "TEXT") {
      await this.restyle(node);
      return;
    }
    if ("cornerRadius" in node && typeof node.cornerRadius === "number" && node.cornerRadius > 0) {
      await this.bind(node, RADIUS_FIELDS, RADIUS_FIELDS.map(() => node.cornerRadius as number), this.d.radii, "radii");
    }
    if ("layoutMode" in node && node.layoutMode !== "NONE") {
      await this.bind(node, SPACING_FIELDS, SPACING_FIELDS.map((f) => node[f]), this.d.spacing, "spacing");
    }
    if ("children" in node) for (const child of node.children) await this.visit(child, screen, inside);
  }
}

/** Прозрачность цветовых токенов продукта (первый режим) — из индекса профиля. */
async function tokenAlpha(): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const profiles = await store.getProfiles();
  const activeId = await store.getActiveProfileId();
  const profile = profiles.find((p) => p.id === activeId) ?? profiles[0];
  for (const m of profile?.materials ?? []) {
    const index = await store.getIndex(profile!.id, m.id);
    if (index?.kind !== "tokens") continue;
    for (const c of index.data.collections) {
      for (const v of c.variables) {
        const value = v.resolvedByMode[c.modes[0]?.modeId ?? ""];
        if (value?.kind === "color") out.set(v.key, value.a);
      }
    }
  }
  return out;
}

/** Коллекция темы продукта и её тёмный режим — для «Стало · тёмная». */
async function productDarkMode(): Promise<{ collection: VariableCollection; modeId: string } | null> {
  const profiles = await store.getProfiles();
  const activeId = await store.getActiveProfileId();
  const profile = profiles.find((p) => p.id === activeId) ?? profiles[0];
  const theme = profile?.theme;
  const dark = theme?.modes.find((m) => m.role === THEME_ROLES.dark);
  if (!profile || !theme || !dark) return null;
  for (const m of profile.materials) {
    const index = await store.getIndex(profile.id, m.id);
    if (index?.kind !== "tokens") continue;
    const collection = index.data.collections.find((c) => c.key === theme.collectionKey);
    const sample = collection?.variables.find((v) => v.published);
    if (!sample) continue;
    const imported = await figma.variables.importVariableByKeyAsync(sample.key);
    const c = await figma.variables.getVariableCollectionByIdAsync(imported.variableCollectionId);
    if (c) return { collection: c, modeId: dark.modeId };
  }
  return null;
}

export async function applyStyle(decisions: Decisions, report: (title: string) => void): Promise<ApplyResult> {
  const t0 = Date.now();
  const planned = await plannedFromWorkPage();
  if (planned.pages.length === 0) throw new Error("На «AID Migration» нет собранных экранов — сначала «Собрать»");

  report("пересобираю плитки со «Стало»");
  await assemble({ pages: planned.pages, darkFromTheme: planned.darkFromTheme, onConflict: "replace", withAfter: true }, (d, t) =>
    report(`плитки ${d} из ${t}`),
  );

  const dark = await productDarkMode();
  const work = figma.root.children.find((p) => p.name === WORK_PAGE_NAME)!;
  const cells = work.children
    .filter((n): n is SectionNode => n.type === "SECTION" && n.getPluginData(KEY_SECTION) !== "")
    .flatMap((s) => s.children)
    .filter((n) => n.getPluginData(KEY_ROLE) === "after-light");

  if (cells.length === 0) {
    // Пересборка прошла, а ячеек «Стало» нет — молча отчитаться «Готово» нельзя.
    throw new Error(
      "«Стало» не создано: в собранных плитках нет экранов для перевода (только картинки или пусто). Пересоберите на вкладке «Сборка» и повторите",
    );
  }
  const applier = new Applier(decisions, await tokenAlpha());
  const prevSkip = figma.skipInvisibleInstanceChildren;
  figma.skipInvisibleInstanceChildren = true;
  try {
    for (const [i, cell] of cells.entries()) {
      report(`перевожу экран ${i + 1} из ${cells.length}`);
      await applier.visit(cell, { width: cell.width, height: cell.height, box: cell.absoluteBoundingBox }, false, true);
      // «Стало · тёмная» — копия переведённой светлой в тёмном режиме темы продукта; руками не правится.
      const night = cell.clone();
      cell.parent!.appendChild(night);
      night.x = cell.x + cell.width + DEFAULT_LAYOUT.cellGap;
      night.y = cell.y;
      night.setPluginData(KEY_ROLE, "after-dark");
      if (dark) night.setExplicitVariableModeForCollection(dark.collection, dark.modeId);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    figma.skipInvisibleInstanceChildren = prevSkip;
  }
  if (!dark) applier.failures.unshift("у продукта не задан тёмный режим темы — «Стало · тёмная» совпадает со светлой");
  // Показать результат: первая переведённая плитка.
  figma.viewport.scrollAndZoomIntoView([cells[0]]);
  return { screens: cells.length, ...applier.result, failures: applier.failures, ms: Date.now() - t0 };
}

/** Откат перевода: пересборка без «Стало». «Было» и исходники не трогаются. */
export async function removeAfter(report: (title: string) => void): Promise<number> {
  const planned = await plannedFromWorkPage();
  if (planned.pages.length === 0) return 0;
  const result = await assemble({ pages: planned.pages, darkFromTheme: planned.darkFromTheme, onConflict: "replace" }, (d, t) =>
    report(`плитки ${d} из ${t}`),
  );
  return result.rows;
}
