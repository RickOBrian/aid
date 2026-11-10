import { describe, expect, it } from "vitest";

import "./figmaStub";
import type { UnpublishedEntry } from "../src/lib/changelogRecord";
import { ChangelogTableError, UNPUBLISHED_LABEL, writeUnpublishedRow } from "../src/lib/changelogTable";

/**
 * Поддельные узлы Figma: ровно то, что трогает changelogTable.ts —
 * дерево, clone/remove/appendChild/insertChild, findOne, текст и бейдж.
 */
class FakeNode {
  parent: FakeNode | null = null;
  children: FakeNode[] = [];
  characters = "";
  fontName = { family: "Inter", style: "Regular" };
  componentProperties: Record<string, { type: string; value: string }> = {};

  constructor(
    public type: string,
    public name: string,
    children: FakeNode[] = [],
  ) {
    for (const child of children) this.appendChild(child);
  }

  appendChild(child: FakeNode): void {
    this.insertChild(this.children.length, child);
  }

  insertChild(index: number, child: FakeNode): void {
    child.parent?.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = this;
    this.children.splice(index, 0, child);
  }

  remove(): void {
    this.parent?.children.splice(this.parent.children.indexOf(this), 1);
    this.parent = null;
  }

  clone(): FakeNode {
    const copy = this.copy();
    this.parent?.appendChild(copy);
    return copy;
  }

  private copy(): FakeNode {
    const copy = new FakeNode(this.type, this.name, this.children.map((child) => child.copy()));
    copy.characters = this.characters;
    copy.componentProperties = structuredClone(this.componentProperties);
    return copy;
  }

  findOne(predicate: (node: FakeNode) => boolean): FakeNode | null {
    for (const child of this.children) {
      if (predicate(child)) return child;
      const found = child.findOne(predicate);
      if (found) return found;
    }
    return null;
  }

  getRangeAllFontNames(): unknown[] {
    return [this.fontName];
  }

  setProperties(values: Record<string, string>): void {
    for (const [key, value] of Object.entries(values)) this.componentProperties[key].value = value;
  }
}

function text(name: string, characters: string): FakeNode {
  const node = new FakeNode("TEXT", name);
  node.characters = characters;
  return node;
}

function badge(label: string): FakeNode {
  const node = new FakeNode("INSTANCE", "__Changelog Badge", [text("label", label)]);
  node.componentProperties = { Type: { type: "VARIANT", value: "Added" } };
  return node;
}

function cellText(value: string): FakeNode {
  return new FakeNode("FRAME", "cell", [text(value, value)]);
}

/** Строка таблицы; details: null — без значений под фразой. */
function row(version: string, description: string, details: string | null): FakeNode {
  const changes = [badge("Добавлено"), text("description", description)];
  if (details !== null) changes.push(text("details", details));
  return new FakeNode("FRAME", "Changes Row", [
    cellText(version),
    new FakeNode("FRAME", "changes", changes),
    cellText("2026-10-01"),
    cellText("Автор"),
  ]);
}

function table(...rows: FakeNode[]): { page: FakeNode; table: FakeNode; body: FakeNode } {
  const body = new FakeNode("FRAME", "Changelog Table Body", rows);
  const tableNode = new FakeNode("FRAME", "CHANGELOG", [body]);
  const page = new FakeNode("PAGE", "Page", [tableNode]);
  return { page, table: tableNode, body };
}

function entry(changes: UnpublishedEntry["changes"]): UnpublishedEntry {
  return { version: null, date: null, author: "Дизайнер", type: "minor", changes };
}

const write = (node: FakeNode, value: UnpublishedEntry) =>
  writeUnpublishedRow(node as unknown as FrameNode, value);

/** Тексты ячейки изменений по порядку: подпись бейджа, фраза, значения. */
function changesTexts(rowNode: FakeNode): string[] {
  return rowNode.children[1].children.map((child) =>
    child.type === "TEXT" ? child.characters : (child.findOne((c) => c.type === "TEXT")?.characters ?? ""),
  );
}

describe("writeUnpublishedRow", () => {
  it("пишет запись без значений в таблицу, где образец — строка без значений", async () => {
    const t = table(row("1.0.0", "Первая версия", null));
    await write(t.table, entry([{ kind: "added", description: "Новый вариант" }]));
    expect(t.body.children).toHaveLength(2);
    expect(t.body.children[0].children[0].children[0].characters).toBe(UNPUBLISHED_LABEL);
    expect(changesTexts(t.body.children[0])).toEqual(["Добавлено", "Новый вариант"]);
  });

  it("пересобирает собственную строку «Не опубликовано» без значений (AID-56)", async () => {
    const t = table(row("1.0.0", "Первая версия", null));
    await write(t.table, entry([{ kind: "added", description: "Первая запись" }]));
    await write(t.table, entry([{ kind: "fixed", description: "Вторая запись" }]));
    expect(t.body.children).toHaveLength(2);
    expect(changesTexts(t.body.children[0])).toEqual(["Исправлено", "Вторая запись"]);
    expect(t.page.children).toHaveLength(1);
  });

  it("берёт образец значений из любой строки, даже если первая — без них", async () => {
    const t = table(row("1.1.0", "Без значений", null), row("1.0.0", "Со значениями", "#fff → #000"));
    await write(t.table, entry([{ kind: "changed", description: "Цвет", details: "#111 → #222" }]));
    expect(changesTexts(t.body.children[0])).toEqual(["Изменено", "Цвет", "#111 → #222"]);
  });

  it("отказывает без правок, если записи нужны значения, а образца для них нет", async () => {
    const t = table(row("1.0.0", "Первая версия", null));
    await expect(
      write(t.table, entry([{ kind: "changed", description: "Цвет", details: "#111 → #222" }])),
    ).rejects.toBeInstanceOf(ChangelogTableError);
    expect(t.body.children).toHaveLength(1);
    expect(changesTexts(t.body.children[0])).toEqual(["Добавлено", "Первая версия"]);
  });

  it("отказывает, если в таблице нет бейджа с фразой", async () => {
    const empty = new FakeNode("FRAME", "Changes Row", [
      cellText("1.0.0"),
      new FakeNode("FRAME", "changes", [text("description", "Только текст")]),
      cellText("2026-10-01"),
      cellText("Автор"),
    ]);
    const t = table(empty);
    await expect(write(t.table, entry([{ kind: "added", description: "x" }]))).rejects.toBeInstanceOf(
      ChangelogTableError,
    );
  });
});
