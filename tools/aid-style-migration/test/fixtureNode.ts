/**
 * Компактная фикстура (выгрузка экрана через Figma MCP) → NNode.
 * Формат: n — имя, t — тип, b — [x, y, w, h] от угла экрана, f / s —
 * заливки / обводки «rrggbb[@alpha]|переменная|коллекция|r/l» или
 * img / grad, sw — толщина обводки, r — радиус, l — auto-layout
 * [H/V, top, right, bottom, left, gap, primary, counter], x — текст
 * [символы, «семейство начертание», кегль, регистр, выравнивание],
 * c — «набор :: вариант» главного компонента, k — дети.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NNode, NPaint } from "../src/core/node";

interface Compact {
  n: string;
  t: string;
  b: [number, number, number, number];
  f?: string[];
  s?: string[];
  sw?: number;
  r?: number;
  l?: [string, number, number, number, number, number, string, string];
  x?: [string, string, number, string, string];
  c?: string;
  /** Цвет переопределён в инстансе. */
  o?: number;
  k?: Compact[];
}

function paint(p: string): NPaint {
  if (p === "img") return { kind: "image" };
  if (p === "grad") return { kind: "gradient" };
  const [value, name, collection, remote] = p.split("|");
  const [hex, alpha] = value.split("@");
  const color = {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255,
    a: alpha ? Number(alpha) / 100 : 1,
  };
  return name ? { kind: "solid", color, variable: { id: name, key: name, name, collection, remote: remote === "r" } } : { kind: "solid", color };
}

let counter = 0;

function convert(c: Compact): NNode {
  const [family, ...style] = (c.x?.[1] ?? "").split(" ");
  const [setName, variant] = (c.c ?? "").split(" :: ");
  return {
    id: `n${counter++}`,
    name: c.n,
    type: c.t,
    x: c.b[0],
    y: c.b[1],
    width: c.b[2],
    height: c.b[3],
    fills: (c.f ?? []).map(paint),
    strokes: (c.s ?? []).map(paint),
    strokeWeight: c.sw ?? 0,
    radius: c.r ?? null,
    ...(c.l
      ? {
          layout: {
            mode: c.l[0] === "H" ? "HORIZONTAL" : "VERTICAL",
            padding: [c.l[1], c.l[2], c.l[3], c.l[4]] as [number, number, number, number],
            gap: c.l[5],
            primaryAlign: c.l[6],
            counterAlign: c.l[7],
          },
        }
      : {}),
    ...(c.x
      ? {
          text: {
            characters: c.x[0],
            fontFamily: family,
            fontStyle: style.join(" "),
            fontSize: c.x[2],
            textCase: c.x[3],
            textDecoration: "NONE",
            align: c.x[4],
          },
        }
      : {}),
    ...(c.c ? { component: { key: c.c, name: variant ?? setName, setName: variant ? setName : "" } } : {}),
    ...(c.o ? { colorOverride: true } : {}),
    children: (c.k ?? []).map(convert),
  };
}

export function loadFixture(name: string): NNode {
  const data = JSON.parse(readFileSync(join(__dirname, "fixtures", `${name}.json`), "utf8")) as { fixture: Compact };
  return convert(data.fixture);
}
