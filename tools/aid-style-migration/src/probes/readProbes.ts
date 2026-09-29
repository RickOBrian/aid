/**
 * Проверки только на чтение: документ не меняют.
 */

import type { ProbeResult } from "./types";

type Report = (title: string) => void;

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Синхронный mainComponent при documentAccess: dynamic-page. */
async function probeMainComponent(): Promise<ProbeResult> {
  const expected = "Синхронный mainComponent бросает; getMainComponentAsync работает";
  const base = { id: "main-component-access", title: "Доступ к главному компоненту инстанса", expected };
  const instance = figma.currentPage.findAllWithCriteria({ types: ["INSTANCE"] })[0];
  if (!instance) {
    return { ...base, status: "skip", actual: "На текущей странице нет инстансов — откройте страницу с макетами" };
  }
  let syncResult: string;
  try {
    const main = instance.mainComponent;
    syncResult = `синхронный не бросил (${main ? main.name : "null"})`;
  } catch (e) {
    syncResult = `синхронный бросил: ${errorText(e)}`;
  }
  try {
    const main = await instance.getMainComponentAsync();
    const threw = syncResult.startsWith("синхронный бросил");
    return {
      ...base,
      status: threw && main ? "ok" : "fail",
      actual: `${syncResult}; async: ${main ? `«${main.name}», remote=${main.remote}` : "null"}`,
    };
  } catch (e) {
    return { ...base, status: "fail", actual: `${syncResult}; async бросил: ${errorText(e)}` };
  }
}

/** Переменные подключённых библиотек через teamLibrary. */
async function probeLibraryVariables(): Promise<ProbeResult> {
  const expected = "Коллекции и переменные библиотек перечисляются";
  const base = { id: "library-variables", title: "Переменные библиотек (teamLibrary)", expected };
  const t0 = Date.now();
  try {
    const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    if (collections.length === 0) {
      return { ...base, status: "skip", actual: "Нет подключённых библиотек с переменными", ms: Date.now() - t0 };
    }
    const parts: string[] = [];
    for (const c of collections.slice(0, 12)) {
      const vars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(c.key);
      parts.push(`${c.libraryName} / ${c.name}: ${vars.length}`);
    }
    const more = collections.length > 12 ? `; и ещё ${collections.length - 12}` : "";
    return { ...base, status: "ok", actual: parts.join("; ") + more, ms: Date.now() - t0 };
  } catch (e) {
    return { ...base, status: "fail", actual: errorText(e), ms: Date.now() - t0 };
  }
}

/** Стили текста библиотек Plugin API не перечисляет. */
function probeLibraryTextStyles(): ProbeResult {
  const api = figma.teamLibrary as unknown as Record<string, unknown>;
  const has = typeof api["getAvailableLibraryTextStylesAsync"] === "function";
  return {
    id: "library-text-styles",
    title: "Стили текста библиотек через Plugin API",
    expected: "Метода перечисления нет — нужен REST или индексация открытого файла",
    actual: has ? "Метод есть" : "Метода нет",
    status: has ? "fail" : "ok",
  };
}

/** Локальные коллекции файла и их режимы — у исходника своя тема. */
async function probeLocalCollections(): Promise<ProbeResult> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const actual = collections.length
    ? collections.map((c) => `${c.name}: ${c.variableIds.length} перем., режимы ${c.modes.map((m) => m.name).join(" / ")}`).join("; ")
    : "Локальных коллекций нет";
  return {
    id: "local-collections",
    title: "Локальные коллекции файла",
    expected: "Видно собственную систему токенов исходника и её режимы",
    actual,
    status: "info",
  };
}

/** Скорость обхода: findAllWithCriteria и getMainComponentAsync. */
async function probeTraverseSpeed(): Promise<ProbeResult[]> {
  const page = figma.currentPage;
  let t0 = Date.now();
  const all = page.findAllWithCriteria({ types: ["INSTANCE"] });
  const msAll = Date.now() - t0;

  const prevSkip = figma.skipInvisibleInstanceChildren;
  figma.skipInvisibleInstanceChildren = true;
  t0 = Date.now();
  const visible = page.findAllWithCriteria({ types: ["INSTANCE"] });
  const msVisible = Date.now() - t0;
  figma.skipInvisibleInstanceChildren = prevSkip;

  const sample = all.slice(0, 300);
  t0 = Date.now();
  let remote = 0;
  let failed = 0;
  for (const inst of sample) {
    try {
      const main = await inst.getMainComponentAsync();
      if (main?.remote) remote++;
    } catch {
      failed++;
    }
  }
  const msMain = Date.now() - t0;

  return [
    {
      id: "traverse-instances",
      title: "Поиск всех инстансов на странице",
      expected: "Быстро и без исключений",
      actual: `${all.length} инстансов за ${msAll} мс; без скрытых внутри инстансов — ${visible.length} за ${msVisible} мс`,
      status: "info",
      ms: msAll,
    },
    {
      id: "main-component-bulk",
      title: "getMainComponentAsync пачкой",
      expected: "Сотни инстансов — секунды, без исключений",
      actual: sample.length
        ? `${sample.length} инстансов за ${msMain} мс (${(msMain / sample.length).toFixed(1)} мс/шт); из библиотек ${remote}; ошибок ${failed}`
        : "Инстансов нет",
      status: sample.length ? (failed ? "fail" : "info") : "skip",
      ms: msMain,
    },
  ];
}

export async function runReadProbes(report: Report): Promise<ProbeResult[]> {
  const results: ProbeResult[] = [];
  report("Доступ к главному компоненту");
  results.push(await probeMainComponent());
  report("Переменные библиотек");
  results.push(await probeLibraryVariables());
  results.push(probeLibraryTextStyles());
  report("Локальные коллекции");
  results.push(await probeLocalCollections());
  report("Скорость обхода");
  results.push(...(await probeTraverseSpeed()));
  return results;
}
