/**
 * Изучение образцов в открытом файле (шаг 4, Я3): экраны → нормализованные
 * узлы → роли → наблюдения языка продукта. Документ не меняет.
 *
 * Где образцы — выделение или несколько страниц (как в «1 · Собрать»).
 * Экраны — тем же распознавателем, не больше LEARN_LIMIT, равномерно.
 * В отличие от статистики образцов, внутрь инстансов идём: подпись и
 * иконка кнопки — тоже решения продукта.
 */

import { FigmaReader } from "../adapters/figmaNode";
import { isDark } from "../assemble/darkPairs";
import { classify } from "../assemble/screens";
import { LanguageLearner, type LanguageSource } from "../core/language";
import type { ThemedToken } from "../core/exemplarQuality";
import { collectRoots, facts as screenFacts } from "../assemble/collect";
import type { ScanScope } from "../assemble/types";
import { sample } from "./usage";

/**
 * Экранов за одно изучение. Образцы — несколько страниц флоу; берём
 * равномерно по всем выбранным страницам, в порядке страниц.
 */
const LEARN_LIMIT = 200;

export async function learnOpenFile(
  scope: ScanScope,
  report: (title: string) => void,
  /** Токены библиотеки со значениями обеих тем — узнать случаи, которые разъедутся в другой теме. */
  tokens: ThemedToken[] = [],
): Promise<{ source: LanguageSource }> {
  const screens: Array<{ node: SceneNode; dark: boolean }> = [];
  for (const { node, page } of await collectRoots(scope)) {
    const f = await screenFacts(node, page);
    if (classify(f).kind === "screen") screens.push({ node, dark: isDark(f) });
  }
  const chosen = sample(screens, LEARN_LIMIT);
  const learner = new LanguageLearner(tokens);
  const reader = new FigmaReader();

  const prevSkip = figma.skipInvisibleInstanceChildren;
  figma.skipInvisibleInstanceChildren = true;
  try {
    for (let i = 0; i < chosen.length; i++) {
      const { node, dark } = chosen[i];
      const tree = await reader.read(node);
      if (tree) learner.add(tree, { screenId: node.id, screenName: node.name, dark, file: figma.root.name });
      report(`экран ${i + 1} из ${chosen.length}`);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    figma.skipInvisibleInstanceChildren = prevSkip;
  }
  const source = learner.source(figma.root.name, new Date().toISOString(), screens.length);
  return { source };
}
