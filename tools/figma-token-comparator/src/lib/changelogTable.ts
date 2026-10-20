/**
 * Строка «Не опубликовано» в таблице чейнжлога на странице Figma
 * (changelog-guide §5 «Таблица в Figma»).
 *
 * Таблицу плагин не рисует с нуля: он берёт её собственные строки за образец.
 * Структура таблицы (как в файлах Rider):
 *
 *   CHANGELOG → … → «Changelog Table Body» → «Changes Row» × N
 *   «Changes Row»: [ячейка версии] [ячейка изменений] [ячейка даты] [ячейка автора]
 *   ячейка изменений: бейдж «__Changelog Badge», фраза, details, «{separator}», …
 *
 * Если первая строка уже «Не опубликовано», она пересобирается; иначе первая
 * строка копируется и встаёт сверху.
 */

import { KIND_LABELS, type ChangeKind, type UnpublishedEntry } from "./changelogRecord";

export const UNPUBLISHED_LABEL = "Не опубликовано";

const BODY_NAME = "Changelog Table Body";
const ROW_NAME = "Changes Row";
const BADGE_NAME = "__Changelog Badge";
const SEPARATOR_NAME = "{separator}";

/** Варианты бейджа в библиотеке: Added / Removed / Edited. */
const BADGE_VARIANT: Record<ChangeKind, string> = {
  added: "Added",
  removed: "Removed",
  changed: "Edited",
  fixed: "Edited",
  deprecated: "Edited",
};

export class ChangelogTableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChangelogTableError";
  }
}

function pageOf(node: BaseNode): PageNode | null {
  let current: BaseNode | null = node;
  while (current && current.type !== "PAGE") current = current.parent;
  return current as PageNode | null;
}

/** Узел таблицы по `figmaTable.nodeId`; null — в этом файле такой таблицы нет. */
export async function findChangelogTable(nodeId: string): Promise<FrameNode | null> {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || node.type !== "FRAME") return null;
  const page = pageOf(node);
  if (page) await page.loadAsync();
  // id узлов в разных файлах совпадают — проверяем, что это и правда таблица чейнжлога.
  return node.findOne((child) => child.name === BODY_NAME) ? node : null;
}

function firstText(node: SceneNode): TextNode | null {
  if (node.type === "TEXT") return node;
  if ("findOne" in node) return node.findOne((child) => child.type === "TEXT") as TextNode | null;
  return null;
}

async function setText(node: TextNode, text: string): Promise<void> {
  const fonts =
    node.characters.length > 0 ? node.getRangeAllFontNames(0, node.characters.length) : [node.fontName as FontName];
  await Promise.all(fonts.map((font) => figma.loadFontAsync(font)));
  node.characters = text;
}

interface CellTemplates {
  badge: InstanceNode;
  description: TextNode;
  details: TextNode;
  separator: FrameNode | null;
}

/** Образцы для ячейки изменений — из любой строки таблицы, где они есть. */
function findTemplates(rows: FrameNode[]): CellTemplates {
  let separator: FrameNode | null = null;
  for (const row of rows) {
    const cell = row.children[1];
    if (!cell || !("children" in cell)) continue;
    const found = cell.children.find((child) => child.name === SEPARATOR_NAME);
    if (found && found.type === "FRAME") {
      separator = found;
      break;
    }
  }
  for (const row of rows) {
    const cell = row.children[1];
    if (!cell || !("children" in cell)) continue;
    const children = cell.children;
    const badgeIndex = children.findIndex((child) => child.name === BADGE_NAME && child.type === "INSTANCE");
    const description = children[badgeIndex + 1];
    const details = children[badgeIndex + 2];
    if (badgeIndex >= 0 && description?.type === "TEXT" && details?.type === "TEXT") {
      return { badge: children[badgeIndex] as InstanceNode, description, details, separator };
    }
  }
  throw new ChangelogTableError("В таблице чейнжлога нет строки-образца с бейджем, фразой и значениями.");
}

async function setBadge(badge: InstanceNode, kind: ChangeKind): Promise<void> {
  const property = Object.entries(badge.componentProperties).find(([, value]) => value.type === "VARIANT");
  if (property) badge.setProperties({ [property[0]]: BADGE_VARIANT[kind] });
  // У бейджа три варианта; «Исправлено» и «Устарело» — подпись поверх «Edited».
  const label = badge.findOne((child) => child.type === "TEXT") as TextNode | null;
  if (label && label.characters !== KIND_LABELS[kind]) await setText(label, KIND_LABELS[kind]);
}

async function fillChangesCell(cell: FrameNode, entry: UnpublishedEntry, templates: CellTemplates): Promise<void> {
  // clone() кладёт копию к тому же родителю. Образцы могут лежать в самой
  // пересобираемой ячейке, поэтому их копии сначала уходят на страницу.
  const holder = pageOf(cell) ?? figma.currentPage;
  const detach = <T extends SceneNode>(node: T): T => {
    holder.appendChild(node);
    return node;
  };
  const badge = detach(templates.badge.clone());
  const description = detach(templates.description.clone());
  const details = detach(templates.details.clone());
  const separator = templates.separator ? detach(templates.separator.clone()) : null;

  for (const child of [...cell.children]) child.remove();

  for (const [index, change] of entry.changes.entries()) {
    if (index > 0 && separator) cell.appendChild(separator.clone());
    const changeBadge = badge.clone();
    cell.appendChild(changeBadge);
    await setBadge(changeBadge, change.kind);
    const changeDescription = description.clone();
    cell.appendChild(changeDescription);
    await setText(changeDescription, change.description);
    if (change.details) {
      const changeDetails = details.clone();
      cell.appendChild(changeDetails);
      await setText(changeDetails, change.details);
    }
  }

  for (const node of [badge, description, details, separator]) node?.remove();
}

export async function writeUnpublishedRow(table: FrameNode, entry: UnpublishedEntry): Promise<void> {
  const body = table.findOne((child) => child.name === BODY_NAME);
  if (!body || body.type !== "FRAME") throw new ChangelogTableError("Не найдена часть таблицы «Changelog Table Body».");
  const rows = body.children.filter((child): child is FrameNode => child.type === "FRAME" && child.name === ROW_NAME);
  if (rows.length === 0) throw new ChangelogTableError("В таблице чейнжлога нет ни одной строки — не с чего взять образец.");

  const templates = findTemplates(rows);
  const first = rows[0];
  const firstVersion = first.children[0] ? firstText(first.children[0]) : null;
  let row: FrameNode;
  if (firstVersion?.characters.trim() === UNPUBLISHED_LABEL) {
    row = first;
  } else {
    row = first.clone();
    body.insertChild(body.children.indexOf(first), row);
  }

  const [versionCell, changesCell, dateCell, authorCell] = row.children;
  if (!versionCell || !changesCell || changesCell.type !== "FRAME" || !dateCell || !authorCell) {
    throw new ChangelogTableError("Строка таблицы устроена не так, как ждёт плагин: нужны четыре ячейки.");
  }

  const versionText = firstText(versionCell);
  const dateText = firstText(dateCell);
  const authorText = firstText(authorCell);
  if (versionText) {
    await setText(versionText, UNPUBLISHED_LABEL);
    versionText.name = UNPUBLISHED_LABEL;
  }
  if (dateText) {
    await setText(dateText, "");
    dateText.name = "—";
  }
  if (authorText) {
    await setText(authorText, entry.author);
    authorText.name = entry.author;
  }
  row.name = ROW_NAME;
  await fillChangesCell(changesCell, entry, templates);
}
