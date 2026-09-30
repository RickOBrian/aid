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

export async function learnOpenFile(scope: ExemplarScope, report: (done: number, total: number) => void): Promise<LanguageSource> {
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
      report(i + 1, chosen.length);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    figma.skipInvisibleInstanceChildren = prevSkip;
  }
  return learner.source(figma.root.name, new Date().toISOString(), screens.length);
}
