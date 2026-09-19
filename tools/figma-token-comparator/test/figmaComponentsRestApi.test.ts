/**
 * Загрузка иконок библиотеки через REST: компоненты, геометрия, отпечатки.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ICON_NODES_BATCH_SIZE,
  fetchLibraryIcons,
  formatLibraryIconName,
} from "../src/lib/figmaComponentsRestApi";
import { FigmaRestApiError } from "../src/lib/figmaRestApi";
import { shapeSimilarity, unpackFingerprint } from "../src/lib/iconShape";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function componentDocument(path: string) {
  return {
    type: "COMPONENT",
    fills: [],
    size: { x: 24, y: 24 },
    children: [{ type: "VECTOR", fills: [{ type: "SOLID" }], fillGeometry: [{ path, windingRule: "NONZERO" }] }],
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchLibraryIcons", () => {
  it("компонент и вариант набора — с именами, размером, рамкой рисунка и отпечатком", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/components")) {
        return json(200, {
          meta: {
            components: [
              { key: "k-close", node_id: "1:1", name: "controls/close" },
              {
                key: "k-arrow",
                node_id: "1:2",
                name: "Size=24",
                containing_frame: { containingComponentSet: { name: "arrow" } },
              },
              { key: "k-empty", node_id: "1:3", name: "empty" },
            ],
          },
        });
      }
      return json(200, {
        nodes: {
          "1:1": { document: componentDocument("M5 5L19 19M19 5L5 19V17L17 5Z") },
          "1:2": { document: componentDocument("M2 11H16V9L22 12L16 15V13H2Z") },
          "1:3": { document: { type: "COMPONENT", fills: [], size: { x: 24, y: 24 }, children: [] } },
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const icons = await fetchLibraryIcons("FILE", "token");
    expect(icons.map((icon) => icon.key)).toEqual(["k-close", "k-arrow"]);
    const arrow = icons[1];
    expect(formatLibraryIconName(arrow)).toBe("arrow / Size=24");
    expect(arrow).toMatchObject({ width: 24, height: 24, glyph: { x: 2, y: 9, width: 20, height: 6 }, opacities: [1] });
    expect(unpackFingerprint(arrow.fingerprint, 32).count).toBeGreaterThan(0);
    expect(
      shapeSimilarity(unpackFingerprint(icons[0].fingerprint, 32), unpackFingerprint(arrow.fingerprint, 32))
    ).toBeLessThan(0.9);

    const nodesCall = fetchMock.mock.calls.find(([input]) => String(input).includes("/nodes"));
    expect(String(nodesCall?.[0])).toContain("geometry=paths");
  });

  it("геометрия запрашивается пачками", async () => {
    const count = ICON_NODES_BATCH_SIZE + 3;
    const components = Array.from({ length: count }, (_, i) => ({ key: `k${i}`, node_id: `1:${i}`, name: `i${i}` }));
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/components")) return json(200, { meta: { components } });
      const ids = decodeURIComponent(url.split("ids=")[1].split("&")[0]).split(",");
      return json(200, {
        nodes: Object.fromEntries(ids.map((id) => [id, { document: componentDocument("M0 0H4V4H0Z") }])),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const icons = await fetchLibraryIcons("FILE", "token");
    expect(icons).toHaveLength(count);
    expect(fetchMock.mock.calls.filter(([input]) => String(input).includes("/nodes"))).toHaveLength(2);
  });

  it("библиотека без компонентов — пустой список, геометрию не запрашиваем", async () => {
    const fetchMock = vi.fn(async () => json(200, { meta: { components: [] } }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchLibraryIcons("FILE", "token")).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("компоненты есть, а формы ни у одного — ошибка с числом компонентов, а не пустая библиотека", async () => {
    const empty = { type: "COMPONENT", fills: [], size: { x: 24, y: 24 }, children: [] };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.includes("/components")
          ? json(200, { meta: { components: [{ key: "k1", node_id: "1:1", name: "a" }, { key: "k2", node_id: "1:2", name: "b" }] } })
          : json(200, { nodes: { "1:1": { document: empty }, "1:2": { document: empty } } })
      )
    );
    await expect(fetchLibraryIcons("FILE", "token")).rejects.toThrow(/компонентов 2/);
  });

  it("нет доступа — понятная ошибка про scope токена", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json(403, { message: "Forbidden" })));
    await expect(fetchLibraryIcons("FILE", "token")).rejects.toThrow(FigmaRestApiError);
    await expect(fetchLibraryIcons("FILE", "token")).rejects.toThrow(/library_content:read/);
  });
});
