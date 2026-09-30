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

/** Картинок примеров за одно изучение — хватает на доски вопросов, не раздувая хранилище. */
const THUMB_LIMIT = 150;
/** Длинная сторона картинки примера, px. */
const THUMB_SIZE = 240;

export interface Thumb {
  nodeId: string;
  png: Uint8Array;
}

/**
 * Что показать как пример: заливку — сам элемент; подпись и иконку —
 * элемент, которому они принадлежат (кнопку, чип), чтобы было видно
 * контекст. Поднимаемся не выше трёх уровней и не до экрана.
 */
function context(node: SceneNode, screenIds: Set<string>): SceneNode {
  let n: SceneNode = node;
  for (let i = 0; i < 3 && (n.type === "TEXT" || n.width < 40 || n.height < 24); i++) {
    const p = n.parent;
    if (!p || p.type === "PAGE" || p.type === "DOCUMENT" || p.type === "SECTION" || screenIds.has(p.id)) break;
    n = p as SceneNode;
  }
  return n;
}

async function thumbs(source: LanguageSource, screenIds: Set<string>, report: (done: number, total: number) => void): Promise<Thumb[]> {
  const ids: string[] = [];
  for (const r of source.rules) for (const v of r.values) if (v.examples[0] && !ids.includes(v.examples[0].nodeId)) ids.push(v.examples[0].nodeId);
  const chosen = ids.slice(0, THUMB_LIMIT);
  const out: Thumb[] = [];
  for (let i = 0; i < chosen.length; i++) {
    const node = await figma.getNodeByIdAsync(chosen[i]);
    if (node && "exportAsync" in node && node.type !== "PAGE") {
      const target = context(node as SceneNode, screenIds);
      const long = Math.max(target.width, target.height);
      try {
        const png = await target.exportAsync({
          format: "PNG",
          constraint: long > THUMB_SIZE ? { type: target.width >= target.height ? "WIDTH" : "HEIGHT", value: THUMB_SIZE } : { type: "SCALE", value: 1 },
        });
        out.push({ nodeId: chosen[i], png });
      } catch {
        // Не отрисовалось (пустая группа, огромный узел) — пример останется без картинки.
      }
    }
    report(i + 1, chosen.length);
  }
  return out;
}

export async function learnOpenFile(
  scope: ExemplarScope,
  report: (title: string) => void,
): Promise<{ source: LanguageSource; thumbs: Thumb[] }> {
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
  const screenIds = new Set(chosen.map((c) => c.node.id));
  return { source, thumbs: await thumbs(source, screenIds, (done, total) => report(`примеры ${done} из ${total}`)) };
}
