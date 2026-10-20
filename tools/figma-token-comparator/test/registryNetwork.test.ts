/**
 * Сеть реестра решений: чтение (сервер, запасной путь — GitHub), отправка и
 * статусы. Проверяется то, что ломалось в Figma 2026-10-08: подвисший
 * запрос без предела ожидания и одна и та же «Не удалось отправить» на
 * неверный ключ и на обрыв связи.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FetchTimeoutError, fetchWithTimeout } from "../src/lib/fetchWithTimeout";
import { readRegistry } from "../src/lib/registryRead";
import {
  RegistryBackendError,
  fetchProposalStatuses,
  proposeDecisionsOnBackend,
} from "../src/lib/registryBackendApi";

const REGISTRY = {
  schemaVersion: "1.0",
  registryVersion: 3,
  updatedAt: "2026-10-07T00:00:00.000Z",
  entries: [{ signature: "s1", decision: "ignored", status: "approved" }],
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Запрос, который никогда не отвечает. */
function hanging(): Promise<Response> {
  return new Promise(() => {});
}

let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("fetchWithTimeout", () => {
  it("отдаёт ответ, если он успел", async () => {
    fetchMock.mockResolvedValue(json(200, {}));
    expect((await fetchWithTimeout("https://x", {}, 1000)).status).toBe(200);
  });

  it("по истечении предела — FetchTimeoutError", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(hanging);
    const pending = fetchWithTimeout("https://x", {}, 1000);
    const assertion = expect(pending).rejects.toBeInstanceOf(FetchTimeoutError);
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });
});

describe("readRegistry", () => {
  it("читает реестр с сервера", async () => {
    fetchMock.mockImplementation(async (input) => {
      if (String(input) === "https://api.aidteam.pro/api/registry") {
        return json(200, { exists: true, registry: REGISTRY, sha: "abc" });
      }
      throw new Error(`unexpected ${String(input)}`);
    });
    const result = await readRegistry();
    expect(result).toMatchObject({ registryVersion: 3, sha: "abc" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("сервер говорит, что файла нет, — notFound, без похода на GitHub", async () => {
    fetchMock.mockResolvedValue(json(200, { exists: false, registry: { ...REGISTRY, entries: [] } }));
    expect(await readRegistry()).toEqual({ notFound: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("сервер недоступен — берёт реестр с GitHub", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("https://api.aidteam.pro/")) throw new TypeError("Failed to fetch");
      if (url.startsWith("https://raw.githubusercontent.com/")) {
        return new Response(JSON.stringify(REGISTRY), { status: 200, headers: { etag: '"e1"' } });
      }
      throw new Error(`unexpected ${url}`);
    });
    expect(await readRegistry()).toMatchObject({ registryVersion: 3 });
  });

  it("сервер ответил ошибкой — тоже идёт на GitHub", async () => {
    fetchMock.mockImplementation(async (input) =>
      String(input).startsWith("https://api.aidteam.pro/")
        ? json(502, { error: "registry_unavailable" })
        : new Response(JSON.stringify(REGISTRY), { status: 200 })
    );
    expect(await readRegistry()).toMatchObject({ registryVersion: 3 });
  });

  it("оба пути подвисли — ошибка по таймауту, а не вечная загрузка", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(hanging);
    const pending = readRegistry();
    const assertion = expect(pending).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(60_000);
    await assertion;
  });
});

describe("proposeDecisionsOnBackend — причина сбоя", () => {
  const payload = { proposedBy: "Test", entries: [] };

  async function codeOf(promise: Promise<unknown>): Promise<string> {
    try {
      await promise;
    } catch (error) {
      if (error instanceof RegistryBackendError) return error.code;
      throw error;
    }
    return "ok";
  }

  it("401 — неверный ключ", async () => {
    fetchMock.mockResolvedValue(json(401, { error: "unauthorized" }));
    expect(await codeOf(proposeDecisionsOnBackend(payload, "k"))).toBe("invalid_key");
  });

  it("нет связи — network", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await codeOf(proposeDecisionsOnBackend(payload, "k"))).toBe("network");
  });

  it("подвисло — network по таймауту", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(hanging);
    const pending = codeOf(proposeDecisionsOnBackend(payload, "k"));
    await vi.advanceTimersByTimeAsync(60_000);
    expect(await pending).toBe("network");
  });

  it("отправка ждёт дольше чтения: на 20-й секунде ответ ещё принимается", async () => {
    // Сервер создаёт ветку, коммит и PR — с холодным стартом функции это
    // дольше 15 с. 2026-10-08 плагин сообщил «нет связи», а запрос #154 был
    // создан.
    vi.useFakeTimers();
    let respond: (response: Response) => void = () => {};
    fetchMock.mockImplementation(() => new Promise<Response>((resolve) => (respond = resolve)));
    const pending = codeOf(proposeDecisionsOnBackend(payload, "k"));
    await vi.advanceTimersByTimeAsync(20_000);
    respond(json(200, { success: true }));
    expect(await pending).toBe("ok");
  });

  it("ошибка сервера — submit_failed", async () => {
    fetchMock.mockResolvedValue(json(502, { success: false }));
    expect(await codeOf(proposeDecisionsOnBackend(payload, "k"))).toBe("submit_failed");
  });

  it("успех — ходит на api.aidteam.pro", async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }));
    await proposeDecisionsOnBackend(payload, "k");
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://api.aidteam.pro/api/registry/propose-decision");
  });
});

describe("fetchProposalStatuses", () => {
  it("подвисло — ошибка по таймауту, статусы вспомогательные", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(hanging);
    const pending = fetchProposalStatuses("k", ["s1"]);
    const assertion = expect(pending).rejects.toBeInstanceOf(RegistryBackendError);
    await vi.advanceTimersByTimeAsync(60_000);
    await assertion;
  });
});

describe("разбор реестра — записи в том виде, в каком их пишет сервер", () => {
  // Сервер не пишет status (согласовано = лежит в main), а парсер с 4 сентября
  // его требовал: с первого смёрженного запроса 2026-09-07 реестр не читался ни
  // одной версией плагина — «Не удалось загрузить реестр решений».
  const SERVER_SHAPED = {
    schemaVersion: "1.0",
    registryVersion: 2,
    updatedAt: "2026-09-08T10:10:54.185Z",
    entries: [
      {
        signature: "4qlpbs",
        decision: "mapped",
        targetVariableId: "VariableID:23:13",
        targetVariableName: "Text/Secondary Opposite",
        proposedBy: "Sergey AI",
        proposedAt: "2026-09-07T13:43:06.000Z",
      },
    ],
  };

  it("запись без status читается", async () => {
    fetchMock.mockResolvedValue(json(200, { exists: true, registry: SERVER_SHAPED, sha: "s" }));
    const result = await readRegistry();
    expect(result).toMatchObject({ registryVersion: 2 });
    expect("entries" in result && result.entries[0]).toMatchObject({
      signature: "4qlpbs",
      targetVariableId: "VariableID:23:13",
    });
  });

  it("status из реестра сохраняется, если он есть", async () => {
    fetchMock.mockResolvedValue(json(200, { exists: true, registry: REGISTRY, sha: "s" }));
    const result = await readRegistry();
    expect("entries" in result && result.entries[0].status).toBe("approved");
  });
});
