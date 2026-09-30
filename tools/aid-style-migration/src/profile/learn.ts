/**
 * Изучение образцов в открытом файле (шаг 4, Я3): экраны → нормализованные
 * узлы → роли → наблюдения языка продукта. Документ не меняет.
 *
 * Экраны выбираются так же, как для статистики образцов: только экраны,
 * не больше EXEMPLAR_LIMIT, равномерно. В отличие от статистики, внутрь
 * инстансов идём: подпись и иконка кнопки — тоже решения продукта.
 */

import { FigmaReader } from "../adapters/figmaNode";
import { facts } from "../assemble/collect";
import { isDark } from "../assemble/darkPairs";
import { classify } from "../assemble/screens";
import { LanguageLearner, type LanguageSource } from "../core/language";
import { roots } from "./exemplars";
import { EXEMPLAR_LIMIT, sample, type ExemplarScope } from "./usage";

/**
 * Картинки примеров для досок вопросов (замечание Principal Designer:
 * цветной прямоугольник решения не даёт — нужен элемент в окружении и
 * экран). Сначала — примеры спорных правил и отступлений, потом по одному
 * на остальные значения. Лимиты держат хранилище плагина в пределах.
 */
const CROP_LIMIT = 200;
const SHOT_LIMIT = 80;
/** Длинная сторона картинки окружения, px; мельче — текст не читается. */
const CROP_SIZE = 320;
/** Ширина мини-экрана, px. */
const SHOT_WIDTH = 120;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Элемент в окружении: картинка и где на ней сам элемент (для рамки). */
export interface Thumb {
  nodeId: string;
  screenId: string;
  png: Uint8Array;
  box: Box;
  /** Где элемент на мини-экране. */
  screenBox: Box;
}

export interface Shot {
  screenId: string;
  jpg: Uint8Array;
}

/**
 * Окружение элемента: поднимаемся, пока он мельче строки или карточки
 * (160×48), но не выше пяти уровней и не до самого экрана.
 */
function context(node: SceneNode, screenId: string): SceneNode {
  let n: SceneNode = node;
  for (let i = 0; i < 5 && (n.width < 160 || n.height < 48); i++) {
    const p = n.parent;
    if (!p || p.type === "PAGE" || p.type === "DOCUMENT" || p.type === "SECTION" || p.id === screenId) break;
    n = p as SceneNode;
  }
  return n;
}

function pickExamples(source: LanguageSource): Array<{ nodeId: string; screenId: string }> {
  const out: Array<{ nodeId: string; screenId: string }> = [];
  const add = (e: { nodeId: string; screenId: string } | undefined) => {
    if (e && !out.some((x) => x.nodeId === e.nodeId)) out.push({ nodeId: e.nodeId, screenId: e.screenId });
  };
  // Спор и отступления — всё, что будет на досках вопросов.
  for (const r of source.rules) {
    if (r.values.length < 2) continue;
    for (const v of r.values) for (const e of v.examples) add(e);
  }
  for (const r of source.rules) for (const v of r.values) add(v.examples[0]);
  return out.slice(0, CROP_LIMIT);
}

function rel(inner: Rect, outer: Rect, scale: number): Box {
  return { x: (inner.x - outer.x) * scale, y: (inner.y - outer.y) * scale, w: inner.width * scale, h: inner.height * scale };
}

async function thumbs(source: LanguageSource, report: (title: string) => void): Promise<{ thumbs: Thumb[]; shots: Shot[] }> {
  const chosen = pickExamples(source);
  const out: Thumb[] = [];
  const shotIds: string[] = [];
  for (let i = 0; i < chosen.length; i++) {
    report(`примеры ${i + 1} из ${chosen.length}`);
    const { nodeId, screenId } = chosen[i];
    const node = await figma.getNodeByIdAsync(nodeId);
    const screen = await figma.getNodeByIdAsync(screenId);
    if (!node || !screen || !("exportAsync" in node) || node.type === "PAGE" || !("absoluteBoundingBox" in screen)) continue;
    const el = node as SceneNode;
    const target = context(el, screenId);
    const bounds = ("absoluteRenderBounds" in target ? target.absoluteRenderBounds : null) ?? target.absoluteBoundingBox;
    const own = el.absoluteBoundingBox;
    const screenBounds = (screen as SceneNode).absoluteBoundingBox;
    if (!bounds || !own || !screenBounds) continue;
    const scale = Math.min(1.5, CROP_SIZE / Math.max(bounds.width, bounds.height));
    try {
      const png = await target.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: scale } });
      out.push({ nodeId, screenId, png, box: rel(own, bounds, scale), screenBox: rel(own, screenBounds, SHOT_WIDTH / screenBounds.width) });
      if (!shotIds.includes(screenId) && shotIds.length < SHOT_LIMIT) shotIds.push(screenId);
    } catch {
      // Не отрисовалось (пустая группа, огромный узел) — пример останется без картинки.
    }
  }
  const shots: Shot[] = [];
  for (let i = 0; i < shotIds.length; i++) {
    report(`экраны примеров ${i + 1} из ${shotIds.length}`);
    const screen = (await figma.getNodeByIdAsync(shotIds[i])) as SceneNode | null;
    if (!screen || !("exportAsync" in screen)) continue;
    try {
      shots.push({ screenId: shotIds[i], jpg: await screen.exportAsync({ format: "JPG", constraint: { type: "WIDTH", value: SHOT_WIDTH } }) });
    } catch {
      // экран без картинки — пример покажется без мини-экрана
    }
  }
  return { thumbs: out, shots };
}

export async function learnOpenFile(
  scope: ExemplarScope,
  report: (title: string) => void,
): Promise<{ source: LanguageSource; thumbs: Thumb[]; shots: Shot[] }> {
  const screens: Array<{ node: SceneNode; dark: boolean }> = [];
  for (const { node, page } of roots(scope)) {
    const f = await facts(node, page);
    if (classify(f).kind === "screen") screens.push({ node, dark: isDark(f) });
  }
  const chosen = sample(screens, EXEMPLAR_LIMIT);
  const learner = new LanguageLearner();
  const reader = new FigmaReader();

  const prevSkip = figma.skipInvisibleInstanceChildren;
  figma.skipInvisibleInstanceChildren = true;
  try {
    for (let i = 0; i < chosen.length; i++) {
      const { node, dark } = chosen[i];
      const tree = await reader.read(node);
      if (tree) learner.add(tree, { screenId: node.id, screenName: node.name, dark });
      report(`экран ${i + 1} из ${chosen.length}`);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    figma.skipInvisibleInstanceChildren = prevSkip;
  }
  const source = learner.source(figma.root.name, new Date().toISOString(), screens.length);
  return { source, ...(await thumbs(source, report)) };
}
