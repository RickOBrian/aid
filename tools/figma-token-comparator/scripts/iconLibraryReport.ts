/**
 * Отчёт по иконочной библиотеке Figma — тем же кодом, что в плагине.
 *
 *   FIGMA_TOKEN=figd_… npm run icons:report -- <ссылка на файл библиотеки> [--out report.md]
 *
 * Зачем:
 * - проверить пороги подбора по форме на настоящей геометрии из Figma API
 *   (этап 1 плана иконок; этап 0 был на SVG-экспорте —
 *   docs/icons-spike-2026-09-19.md);
 * - список «спорных вариантов» для владельца библиотеки: иконки, неразличимые
 *   по форме — состояния, размеры, полные дубликаты.
 *
 * Токен читается только из окружения и никуда, кроме api.figma.com, не уходит.
 */

import { writeFileSync } from "node:fs";

import { fetchLibraryIcons, formatLibraryIconName } from "../src/lib/figmaComponentsRestApi";
import { parseFigmaFileKey } from "../src/lib/figmaUrl";
import { shapeSimilarity, unpackFingerprint, type Fingerprint } from "../src/lib/iconShape";
import type { LibraryIcon } from "../src/comparators/types";

/** Пороги из этапа 0 — их и проверяем. */
const SAME = 0.97;
const SIMILAR = 0.85;
const MARGIN = 0.05;
const TWIN = 0.99;

function percentile(values: number[], p: number): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

const f3 = (value: number) => (Number.isNaN(value) ? "—" : value.toFixed(3));

function twinKind(a: LibraryIcon, b: LibraryIcon): "состояние" | "размер" | "дубликат" {
  if (a.glyph && b.glyph) {
    const ratio = Math.max(a.glyph.width, a.glyph.height) / Math.max(b.glyph.width, b.glyph.height);
    if (Math.abs(1 - ratio) > 0.1) return "размер";
  }
  if (a.opacities.join(",") !== b.opacities.join(",")) return "состояние";
  return "дубликат";
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf("--out");
  const outFile = outIndex >= 0 ? args[outIndex + 1] : undefined;
  const input = args.find((arg, index) => !arg.startsWith("--") && (outIndex < 0 || index !== outIndex + 1));
  const token = process.env.FIGMA_TOKEN;
  if (!input || !token) {
    console.error("Использование: FIGMA_TOKEN=figd_… npm run icons:report -- <ссылка на файл> [--out report.md]");
    process.exit(1);
  }
  const fileKey = parseFigmaFileKey(input) || input;

  const started = Date.now();
  const icons = await fetchLibraryIcons(fileKey, token);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  const prints: Fingerprint[] = icons.map((icon) => unpackFingerprint(icon.fingerprint, 32));

  const lines: string[] = [];
  const log = (line = "") => {
    lines.push(line);
    console.log(line);
  };

  log(`# Иконки библиотеки ${fileKey}`);
  log("");
  log(`Иконок: **${icons.length}**, загрузка с отпечатками — ${seconds} с.`);

  // Похожесть каждой на каждую.
  const best: number[] = [];
  const twins: Array<[number, number, number]> = [];
  const near: Array<[number, number, number]> = [];
  for (let i = 0; i < icons.length; i += 1) {
    let b1 = 0;
    for (let j = 0; j < icons.length; j += 1) {
      if (i === j) continue;
      const s = shapeSimilarity(prints[i], prints[j]);
      if (s > b1) b1 = s;
      if (j > i && s >= TWIN) twins.push([s, i, j]);
      else if (j > i && s >= 0.9) near.push([s, i, j]);
    }
    best.push(b1);
  }

  const inTwin = new Set(twins.flatMap(([, i, j]) => [i, j]));
  const clean = best.filter((_, i) => !inTwin.has(i));
  log("");
  log("## Различимость");
  log("");
  log("| | Все | Без неразличимых |");
  log("|---|---|---|");
  log(`| Иконок | ${icons.length} | ${clean.length} |`);
  log(`| Лучшая похожесть на другую — медиана | ${f3(percentile(best, 50))} | ${f3(percentile(clean, 50))} |`);
  log(`| p90 | ${f3(percentile(best, 90))} | ${f3(percentile(clean, 90))} |`);
  log(`| p99 | ${f3(percentile(best, 99))} | ${f3(percentile(clean, 99))} |`);

  // Что сказал бы плагин, если бы в макете стояла точная копия каждой иконки.
  const sure = icons.filter((_, i) => best[i] < TWIN).length;
  const disputed = icons.filter((_, i) => best[i] >= TWIN).length;
  const closeCall = icons.filter((_, i) => best[i] < TWIN && best[i] >= SAME - MARGIN).length;
  log("");
  log("## Пороги этапа 0 на этой библиотеке");
  log("");
  log(`Пороги: ≥ ${SAME} «Совпала форма», ${SIMILAR}–${SAME} «Похожая форма» при отрыве ≥ ${MARGIN}, неразличимые — ≥ ${TWIN}.`);
  log("");
  log(`- Копия иконки узнаётся однозначно: **${sure}** из ${icons.length}.`);
  log(`- Узнаётся, но попадает в «Спорный вариант» (есть неразличимые по форме): **${disputed}**.`);
  log(`- Узнаётся, но есть другая похожая на ${(SAME - MARGIN).toFixed(2)} и больше — отрыв мал: **${closeCall}**.`);

  const kinds = { состояние: 0, размер: 0, дубликат: 0 };
  for (const [, i, j] of twins) kinds[twinKind(icons[i], icons[j])] += 1;
  log("");
  log(`## Спорные варианты — неразличимые по форме пары (≥ ${TWIN}): ${twins.length}`);
  log("");
  log(`Состояния (разная прозрачность слоёв): ${kinds.состояние}, размеры: ${kinds.размер}, полные дубликаты: ${kinds.дубликат}.`);
  log("");
  log("| Похожесть | Иконка | Иконка | Чем отличаются |");
  log("|---|---|---|---|");
  for (const [s, i, j] of twins.sort((a, b) => b[0] - a[0])) {
    log(`| ${f3(s)} | ${formatLibraryIconName(icons[i])} | ${formatLibraryIconName(icons[j])} | ${twinKind(icons[i], icons[j])} |`);
  }

  log("");
  log(`## Близкие, но различимые пары (0.90–${TWIN}): ${near.length}`);
  log("");
  for (const [s, i, j] of near.sort((a, b) => b[0] - a[0]).slice(0, 30)) {
    log(`- ${f3(s)} — ${formatLibraryIconName(icons[i])} ↔ ${formatLibraryIconName(icons[j])}`);
  }

  if (outFile) {
    writeFileSync(outFile, lines.join("\n") + "\n");
    console.log(`\nОтчёт записан: ${outFile}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
