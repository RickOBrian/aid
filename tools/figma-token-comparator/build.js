/**
 * Сборка плагина: TypeScript -> JS через esbuild.
 *
 * Figma принимает `ui` в manifest.json как один самодостаточный HTML-файл
 * без внешних <script src>. Поэтому сборка в 3 шага:
 *   1. code.ts  -> dist/code.js        (главный поток, bundle iife)
 *   2. ui.ts    -> dist/ui.bundle.js   (UI-логика, bundle iife)
 *   3. src/ui.html + dist/ui.bundle.js -> dist/ui.html (инлайним <script>)
 *
 * PLUGIN_SHARED_SECRET читается из .env.local (gitignored) и инлайнится только
 * в dist/code.js через esbuild define — не попадает в git при коммите src/.
 *
 * Запуск: node build.js [--watch]
 */

const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const isWatch = process.argv.includes("--watch");
const srcDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");

function loadPluginSharedSecretFromEnvLocal() {
  const envPath = path.join(__dirname, ".env.local");
  if (!fs.existsSync(envPath)) {
    return process.env.PLUGIN_SHARED_SECRET ?? "";
  }
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^PLUGIN_SHARED_SECRET=(.*)$/);
    if (match) {
      const raw = match[1].trim();
      return raw.replace(/^["']|["']$/g, "");
    }
  }
  return process.env.PLUGIN_SHARED_SECRET ?? "";
}

const pluginSharedSecret = loadPluginSharedSecretFromEnvLocal();
if (!pluginSharedSecret && !isWatch) {
  console.warn(
    "[build] PLUGIN_SHARED_SECRET is empty — set tools/figma-token-comparator/.env.local before production build.",
  );
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

function inlineUiHtml() {
  const htmlPath = path.join(srcDir, "ui.html");
  const bundlePath = path.join(distDir, "ui.bundle.js");
  const html = fs.readFileSync(htmlPath, "utf8");
  const bundleJs = fs.readFileSync(bundlePath, "utf8");

  if (!html.includes("<!-- UI_BUNDLE -->")) {
    throw new Error('src/ui.html не содержит маркер "<!-- UI_BUNDLE -->" для инлайна скрипта.');
  }

  const inlined = html.replace("<!-- UI_BUNDLE -->", `<script>\n${bundleJs}\n</script>`);
  fs.writeFileSync(path.join(distDir, "ui.html"), inlined, "utf8");
}

const codeDefine = {
  __PLUGIN_SHARED_SECRET__: JSON.stringify(pluginSharedSecret),
};

const codeConfig = {
  entryPoints: [path.join(srcDir, "code.ts")],
  outfile: path.join(distDir, "code.js"),
  bundle: true,
  platform: "browser",
  target: "es2019",
  format: "iife",
  logLevel: "info",
  define: codeDefine,
};

const uiConfig = {
  entryPoints: [path.join(srcDir, "ui.ts")],
  outfile: path.join(distDir, "ui.bundle.js"),
  bundle: true,
  platform: "browser",
  target: "es2019",
  format: "iife",
  logLevel: "info",
};

async function buildOnce() {
  await esbuild.build(codeConfig);
  await esbuild.build(uiConfig);
  inlineUiHtml();
  console.log(`[build] dist/code.js + dist/ui.html готовы -> ${distDir}`);
}

async function watch() {
  const codeCtx = await esbuild.context(codeConfig);
  const uiCtx = await esbuild.context({
    ...uiConfig,
    plugins: [
      {
        name: "inline-ui-html-on-rebuild",
        setup(build) {
          build.onEnd(() => inlineUiHtml());
        },
      },
    ],
  });

  await codeCtx.watch();
  await uiCtx.watch();
  console.log("[build] watch-режим включён. Изменения в src/ пересобираются автоматически.");
}

async function main() {
  if (isWatch) {
    await watch();
  } else {
    await buildOnce();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
