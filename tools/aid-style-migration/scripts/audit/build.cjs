// Собирает скрипт аудита для Figma MCP `use_figma`: движок плагина (esbuild,
// minify) + раннер. Запуск: node scripts/audit/build.mjs <pageId> > /tmp/audit.js
// Лимит `use_figma` — 50 000 символов кода; движок ~33 КБ.
const { buildSync } = require("esbuild");
const fs = require("fs");
const path = require("path");
const page = process.argv[2] || "2430:22084";
const out = buildSync({ entryPoints: [path.join(__dirname, "entry.ts")], bundle: true, minify: true, format: "iife", target: "es2019", charset: "utf8", write: false });
const runner = fs.readFileSync(path.join(__dirname, "runner.js"), "utf8").replace("__PAGE__", page);
process.stdout.write(out.outputFiles[0].text + runner);
