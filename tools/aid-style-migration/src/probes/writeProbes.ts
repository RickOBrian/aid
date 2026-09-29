/**
 * Проверки с записью. Всё создаётся во временном фрейме на странице
 * «AID Migration» и удаляется в конце; исходные страницы не трогаются.
 * Страница, созданная ради проверки, удаляется, если осталась пустой.
 */

import { findOrCreateWorkPage, removeIfCreatedAndEmpty } from "../lib/workPage";
import type { ProbeResult } from "./types";

type Report = (title: string) => void;

const TEMP_FRAME_NAME = "__aid-style-migration probe__";
const FONT: FontName = { family: "Inter", style: "Regular" };

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Сколько данных помещается в pluginData одной ноды. */
function probePluginDataLimit(host: FrameNode): ProbeResult {
  const sizes = [50_000, 99_000, 101_000, 200_000, 1_000_000];
  const notes: string[] = [];
  let maxOk = 0;
  for (const size of sizes) {
    try {
      host.setPluginData("probe-size", "x".repeat(size));
      const back = host.getPluginData("probe-size").length;
      if (back === size) {
        maxOk = size;
        notes.push(`${size / 1000} kB — ok`);
      } else {
        notes.push(`${size / 1000} kB — записалось ${back}`);
      }
    } catch (e) {
      notes.push(`${size / 1000} kB — ошибка: ${errorText(e)}`);
    }
  }
  host.setPluginData("probe-size", "");
  return {
    id: "plugin-data-limit",
    title: "Лимит pluginData на ноду",
    expected: "~100 kB (заметки Token Comparator), не 1 МБ (наработки агента)",
    actual: `максимум записанного: ${maxOk / 1000} kB; ${notes.join("; ")}`,
    status: maxOk < 1_000_000 ? "ok" : "fail",
  };
}

/** Копируется ли pluginData вместе с нодой при clone(). */
function probePluginDataClone(host: FrameNode): ProbeResult {
  const node = figma.createFrame();
  host.appendChild(node);
  node.setPluginData("probe", "marker");
  const copy = node.clone();
  const value = copy.getPluginData("probe");
  copy.remove();
  node.remove();
  return {
    id: "plugin-data-clone",
    title: "pluginData при клонировании",
    expected: "Копируется вместе с нодой — служебные метки надо чистить у копий",
    actual: value === "marker" ? "Скопировалось" : `Не скопировалось (получили «${value}»)`,
    status: value === "marker" ? "ok" : "fail",
  };
}

interface TestComponent {
  component: ComponentNode;
  titleKey: string;
}

function makeCard(name: string, host: FrameNode, icon: ComponentNode): TestComponent {
  const component = figma.createComponent();
  component.name = name;
  component.layoutMode = "HORIZONTAL";
  component.itemSpacing = 8;
  host.appendChild(component);

  const label = figma.createText();
  label.name = "Label";
  label.characters = "Default";
  component.appendChild(label);

  const iconInstance = icon.createInstance();
  iconInstance.name = "Icon";
  component.appendChild(iconInstance);

  const badge = figma.createRectangle();
  badge.name = "Badge";
  badge.resize(8, 8);
  component.appendChild(badge);

  const title = figma.createText();
  title.name = "Title";
  title.characters = "Title";
  component.appendChild(title);
  const titleKey = component.addComponentProperty("Title", "TEXT", "Title");
  title.componentPropertyReferences = { characters: titleKey };

  return { component, titleKey };
}

function makeIcon(name: string, host: FrameNode): ComponentNode {
  const icon = figma.createComponent();
  icon.name = name;
  icon.resize(24, 24);
  host.appendChild(icon);
  return icon;
}

/** Что swapComponent сохраняет из оверрайдов при совпадении имён слоёв. */
async function probeSwapOverrides(host: FrameNode): Promise<ProbeResult> {
  const base = {
    id: "swap-overrides",
    title: "swapComponent и оверрайды",
    expected: "Сохраняет по логике интерфейса Figma: текст, вложенный swap, видимость, свойства; id ноды не меняется",
  };
  try {
    await figma.loadFontAsync(FONT);
    const iconA = makeIcon("Icon A", host);
    const iconB = makeIcon("Icon B", host);
    const cardA = makeCard("Card A", host, iconA);
    const cardB = makeCard("Card B", host, iconA);

    const instance = cardA.component.createInstance();
    host.appendChild(instance);
    const idBefore = instance.id;
    (instance.findOne((n) => n.name === "Label") as TextNode).characters = "Override";
    (instance.findOne((n) => n.name === "Icon") as InstanceNode).swapComponent(iconB);
    (instance.findOne((n) => n.name === "Badge") as RectangleNode).visible = false;
    instance.setProperties({ [cardA.titleKey]: "Prop override" });

    instance.swapComponent(cardB.component);

    const label = (instance.findOne((n) => n.name === "Label") as TextNode).characters;
    const iconMain = await (instance.findOne((n) => n.name === "Icon") as InstanceNode).getMainComponentAsync();
    const badgeVisible = (instance.findOne((n) => n.name === "Badge") as RectangleNode).visible;
    const title = (instance.findOne((n) => n.name === "Title") as TextNode).characters;

    const checks = [
      { name: "текст слоя", ok: label === "Override", seen: label },
      { name: "вложенный swap", ok: iconMain?.name === "Icon B", seen: iconMain?.name ?? "null" },
      { name: "видимость", ok: badgeVisible === false, seen: badgeVisible ? "видим" : "скрыт" },
      { name: "TEXT-свойство", ok: title === "Prop override", seen: title },
      { name: "id ноды", ok: instance.id === idBefore, seen: instance.id === idBefore ? "тот же" : "новый" },
    ];
    return {
      ...base,
      status: checks.every((c) => c.ok) ? "ok" : "fail",
      actual: checks.map((c) => `${c.name}: ${c.ok ? "✓" : "✗"} (${c.seen})`).join("; "),
    };
  } catch (e) {
    return { ...base, status: "fail", actual: `Ошибка: ${errorText(e)}` };
  }
}

/** Явный режим темы на фрейме меняет разрешённое значение переменной. */
async function probeExplicitMode(host: FrameNode): Promise<ProbeResult> {
  const base = {
    id: "explicit-mode",
    title: "Явный режим темы на фрейме",
    expected: "setExplicitVariableModeForCollection переключает значение привязанного цвета — основа колонки Night и подсчёта контраста по режимам",
  };
  try {
    let variable: Variable | null = null;
    const libraryCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    for (const lc of libraryCollections) {
      const vars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(lc.key);
      const color = vars.find((v) => v.resolvedType === "COLOR");
      if (!color) continue;
      const imported = await figma.variables.importVariableByKeyAsync(color.key);
      const collection = await figma.variables.getVariableCollectionByIdAsync(imported.variableCollectionId);
      if (collection && collection.modes.length >= 2) {
        variable = imported;
        break;
      }
    }
    if (!variable) {
      for (const local of await figma.variables.getLocalVariableCollectionsAsync()) {
        if (local.modes.length < 2) continue;
        for (const id of local.variableIds) {
          const v = await figma.variables.getVariableByIdAsync(id);
          if (v?.resolvedType === "COLOR") {
            variable = v;
            break;
          }
        }
        if (variable) break;
      }
    }
    if (!variable) {
      return { ...base, status: "skip", actual: "Нет цветовой переменной в коллекции с двумя и более режимами" };
    }
    const collection = await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
    if (!collection) return { ...base, status: "fail", actual: "Коллекция переменной не найдена" };

    const frame = figma.createFrame();
    host.appendChild(frame);
    frame.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", variable)];
    const before = JSON.stringify(variable.resolveForConsumer(frame).value);
    const [first, second] = collection.modes;
    frame.setExplicitVariableModeForCollection(collection, second.modeId);
    const after = JSON.stringify(variable.resolveForConsumer(frame).value);
    const explicit = frame.explicitVariableModes[collection.id];
    frame.remove();

    const switched = before !== after && explicit === second.modeId;
    return {
      ...base,
      status: switched ? "ok" : "fail",
      actual: `«${collection.name}» / ${variable.name}: ${first.name} → ${second.name}; значение ${switched ? "сменилось" : "не сменилось"} (${before} → ${after})`,
    };
  } catch (e) {
    return { ...base, status: "fail", actual: `Ошибка: ${errorText(e)}` };
  }
}

/** Скорость копирования выделенных экранов на рабочую страницу. */
function probeCloneSpeed(host: FrameNode, selection: readonly SceneNode[]): ProbeResult {
  const base = {
    id: "clone-speed",
    title: "Копирование экранов на рабочую страницу",
    expected: "Десятки экранов — секунды",
  };
  const screens = selection.slice(0, 5);
  if (screens.length === 0) {
    return { ...base, status: "skip", actual: "Ничего не выделено — выделите 1–5 экранов и повторите" };
  }
  const t0 = Date.now();
  let nodes = 0;
  const copies: SceneNode[] = [];
  for (const screen of screens) {
    const copy = screen.clone();
    host.appendChild(copy);
    copies.push(copy);
    nodes += 1 + ("findAll" in copy ? copy.findAll().length : 0);
  }
  const ms = Date.now() - t0;
  for (const copy of copies) copy.remove();
  return {
    ...base,
    status: "info",
    actual: `${screens.length} экр., ${nodes} нод за ${ms} мс (${Math.round(ms / screens.length)} мс/экран)`,
    ms,
  };
}

export async function runWriteProbes(report: Report): Promise<ProbeResult[]> {
  const selection = [...figma.currentPage.selection];
  const work = await findOrCreateWorkPage();
  const host = figma.createFrame();
  host.name = TEMP_FRAME_NAME;
  host.fills = [];
  work.page.appendChild(host);

  const results: ProbeResult[] = [];
  try {
    report("Лимит pluginData");
    results.push(probePluginDataLimit(host));
    results.push(probePluginDataClone(host));
    report("swapComponent и оверрайды");
    results.push(await probeSwapOverrides(host));
    report("Явный режим темы");
    results.push(await probeExplicitMode(host));
    report("Копирование экранов");
    results.push(probeCloneSpeed(host, selection));
  } finally {
    host.remove();
    removeIfCreatedAndEmpty(work);
  }
  return results;
}
