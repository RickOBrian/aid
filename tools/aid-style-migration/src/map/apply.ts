/**
 * Применение карты стиля (этап 3b): рядом с каждой секцией «ДО» —
 * «ПОСЛЕ» (перевод на токены и стили продукта) и «ПОСЛЕ · тёмная тема»
 * (он же в тёмном режиме продукта), с той же раскладкой.
 *
 * Исходники и «Было» не меняются. Структура макета не меняется: только
 * привязки цвета, стиля текста, радиусов и отступов. Внутри компонентов —
 * оверрайды инстанса, без отвязки (у агента отвязка уничтожила все 599
 * инстансов — спайк, п. 1). Откат — «Убрать «ПОСЛЕ»».
 */

import { afterSections, KEY_AFTER, KEY_AFTER_KIND, KEY_IMAGE, KEY_PAIR, KEY_ROLE, KEY_SOURCE, SECTION_GAP, sectionsOnWorkPage } from "../assemble/build";
import { isAnnotationName, outside } from "../lib/annotations";
import { isSystemName } from "../lib/system";
import { WORK_PAGE_NAME } from "../lib/workPage";
import * as store from "../profile/storage";
import { fillUse, visibleCase } from "../profile/usage";
import { THEME_ROLES } from "../lib/vocabulary";
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

/** Коллекция темы продукта и её тёмный режим — для «ПОСЛЕ · тёмная тема». */
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

export interface ApplyResultExtra {
  sections: number;
  unpairedDark: number;
}

function mirrorSection(work: PageNode, before: SectionNode, x: number, name: string, kind: string): SectionNode {
  const section = figma.createSection();
  section.name = name;
  work.appendChild(section);
  section.x = x;
  section.y = before.y;
  section.resizeWithoutConstraints(before.width, before.height);
  section.setPluginData(KEY_AFTER, before.id);
  section.setPluginData(KEY_AFTER_KIND, kind);
  return section;
}

function copyInto(section: SectionNode, source: SceneNode, at: SceneNode): SceneNode {
  const copy = source.clone();
  section.appendChild(copy);
  copy.x = at.x;
  copy.y = at.y;
  return copy;
}

/**
 * Для каждой секции «ДО» — «ПОСЛЕ» (перевод на продукт) и «ПОСЛЕ · тёмная
 * тема» (он же в тёмном режиме продукта) справа, с той же раскладкой.
 * Тёмная пара исходника в «ПОСЛЕ» — это её светлый двойник, переведённый
 * и показанный в тёмном режиме продукта: место то же, что у неё в «ДО».
 */
export async function applyStyle(decisions: Decisions, report: (title: string) => void): Promise<ApplyResult & ApplyResultExtra> {
  const t0 = Date.now();
  const work = figma.root.children.find((p) => p.name === WORK_PAGE_NAME);
  if (!work) throw new Error("Страницы «AID Migration» нет — сначала соберите макеты на шаге «Собрать»");
  await work.loadAsync();
  const befores = sectionsOnWorkPage(work);
  if (befores.length === 0) throw new Error("На «AID Migration» нет секций «ДО» — сначала «Собрать»");

  const dark = await productDarkMode();
  const applier = new Applier(decisions, await tokenAlpha());
  const setDark = (n: SceneNode) => {
    if (dark) n.setExplicitVariableModeForCollection(dark.collection, dark.modeId);
  };
  let screens = 0;
  let unpairedDark = 0;
  let first: SectionNode | null = null;

  const prevSkip = figma.skipInvisibleInstanceChildren;
  figma.skipInvisibleInstanceChildren = true;
  try {
    for (const before of befores) {
      for (const old of afterSections(work, before.id)) old.remove();
      const pageName = before.name.replace(/^ДО · /, "");
      const after = mirrorSection(work, before, before.x + before.width + SECTION_GAP, `ПОСЛЕ · ${pageName}`, THEME_ROLES.light);
      const night = mirrorSection(work, before, after.x + after.width + SECTION_GAP, `ПОСЛЕ · тёмная тема · ${pageName}`, THEME_ROLES.dark);
      first ??= after;

      const cells = before.children.filter((n) => n.getPluginData(KEY_ROLE));
      const translated = new Map<string, SceneNode>();
      // Сначала светлые и картинки: тёмные пары ссылаются на переведённого светлого двойника.
      for (const cell of cells.filter((n) => n.getPluginData(KEY_ROLE) === "before-light")) {
        report(`перевожу экран ${++screens}`);
        const copy = copyInto(after, cell, cell);
        if (!cell.getPluginData(KEY_IMAGE)) await applier.visit(copy, { width: copy.width, height: copy.height, box: copy.absoluteBoundingBox }, false, true);
        translated.set(cell.getPluginData(KEY_SOURCE), copy);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      for (const cell of cells.filter((n) => n.getPluginData(KEY_ROLE) === "before-dark")) {
        const twin = translated.get(cell.getPluginData(KEY_PAIR));
        if (twin) {
          setDark(copyInto(after, twin, cell));
          continue;
        }
        // Тёмный без пары: переводим как есть — его цвета тёмные, в карте их может не быть.
        report(`перевожу экран ${++screens}`);
        unpairedDark++;
        const copy = copyInto(after, cell, cell);
        await applier.visit(copy, { width: copy.width, height: copy.height, box: copy.absoluteBoundingBox }, false, true);
        setDark(copy);
      }
      // «ПОСЛЕ · тёмная тема» — всё «ПОСЛЕ» в тёмном режиме продукта; руками не правится.
      for (const n of [...after.children]) setDark(copyInto(night, n, n));
    }
  } finally {
    figma.skipInvisibleInstanceChildren = prevSkip;
  }

  if (!dark) applier.failures.unshift("у продукта не задан тёмный режим темы — «ПОСЛЕ · тёмная тема» совпадает со светлой");
  await figma.setCurrentPageAsync(work);
  if (first) figma.viewport.scrollAndZoomIntoView([first]);
  return { screens, ...applier.result, failures: applier.failures, ms: Date.now() - t0, sections: befores.length, unpairedDark };
}

/** Откат перевода: убрать «ПОСЛЕ». «ДО» и исходники не трогаются. */
export async function removeAfter(): Promise<number> {
  const work = figma.root.children.find((p) => p.name === WORK_PAGE_NAME);
  if (!work) return 0;
  await work.loadAsync();
  const all = afterSections(work);
  for (const s of all) s.remove();
  return all.length;
}
