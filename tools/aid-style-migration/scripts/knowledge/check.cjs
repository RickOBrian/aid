#!/usr/bin/env node
// Проверка черновика формата знания о продукте (docs/knowledge-format.md):
// словари, обязательные поля находки, ссылки между файлами.
// Запуск: node tools/aid-style-migration/scripts/knowledge/check.cjs <product>
const fs = require("fs");
const path = require("path");

const product = process.argv[2] || "driver";
const root = path.resolve(__dirname, "../../../../products", product, "knowledge");

const ENUM = {
  confidence: ["reference", "inferred", "verify"],
  source: ["library", "local", "should-be-component", "wrong-architecture", "detached", "none"],
  level: ["pattern", "component", "variant", "content", "style"],
  kind: ["designer-error", "author-question", "build-debris", "library-gap", "component-architecture", "library-error", "library-source"],
  addressee: ["aid-owner", "author"],
  interaction: ["action", "input", "display", "container"],
  status: ["open", "answered", "deferred", "ask-only"],
  placement: ["in-container-last", "pinned-over-container", "on-map"],
  relation: ["matches", "deviates", "product-only", "unknown"],
};
const LIBRARY_PAGES = ["Badges", "Buttons", "Cards", "Chat", "Controls", "Dialogues", "Fields", "Headers", "Layers", "Pins", "Rows", "System", "Tabs", "Widgets"];

const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const read = (dir) =>
  fs.existsSync(path.join(root, dir))
    ? fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith(".json")).map((f) => {
        const rel = `${dir}/${f}`;
        try { return { rel, data: JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")) }; }
        catch (e) { err(rel, `не JSON: ${e.message}`); return null; }
      }).filter(Boolean)
    : [];

const inEnum = (file, field, value, nullable) => {
  if (value === null || value === undefined) { if (!nullable) err(file, `${field}: пусто`); return; }
  if (!ENUM[field].includes(value)) err(file, `${field}: «${value}» нет в словаре`);
};
const componentRef = (file, ref) => {
  if (!ref || typeof ref !== "string" || ref.includes(",")) return;
  const page = ref.split("/")[0];
  if (!LIBRARY_PAGES.includes(page)) err(file, `ссылка на компонент «${ref}»: нет страницы библиотеки «${page}»`);
};

// Номера правил: метод (M…, MR… в method.md) и продукт (rules.json).
const methodFile = path.resolve(__dirname, "../../docs/method.md");
const ruleIds = new Set([...fs.readFileSync(methodFile, "utf8").matchAll(/\*\*(M[\w.]+)\b/g)].map((m) => m[1]));
const rulesPath = path.join(root, "rules.json");
if (fs.existsSync(rulesPath)) {
  const rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
  for (const r of rules.rules || []) {
    const at = `rules.json ${r.id}`;
    if (ruleIds.has(r.id)) err(at, "повтор номера");
    ruleIds.add(r.id);
    inEnum(at, "level", r.level);
    inEnum(at, "confidence", r.confidence);
    inEnum(at, "relation", r.standard && r.standard.relation);
    if (!r.author) err(at, "author: пусто");
    if (r.decision && !r.decision.by) err(at, "decision без by");
  }
} else err("rules.json", "нет файла");
const checkRuleRef = (file, id) => { if (id && !ruleIds.has(id)) err(file, `нет правила ${id}`); };

const patterns = read("patterns");
const components = read("components");
const findingFiles = read("findings");

const findingIds = new Map();
for (const { rel, data } of findingFiles) {
  if (data.format !== "aid-knowledge/0") err(rel, "format");
  for (const f of data.findings || []) {
    const at = `${rel} ${f.id}`;
    if (findingIds.has(f.id)) err(at, "повтор id");
    findingIds.set(f.id, f);
    inEnum(at, "level", f.level);
    inEnum(at, "kind", f.kind);
    inEnum(at, "addressee", f.addressee);
    inEnum(at, "confidence", f.confidence);
    inEnum(at, "status", f.status);
    if (!f.what) err(at, "what: пусто");
    if (!f.expected) err(at, "expected: пусто");
    if (f.scope !== "file") {
      if (!f.element) err(at, "element: пусто (у находки экрана)");
      else {
        inEnum(at, "source", f.element.source);
        inEnum(at, "interaction", f.element.interaction, true);
        componentRef(at, f.element.component);
      }
    }
    if (f.status === "answered" && !f.decision && !f.sameAs) err(at, "answered без decision");
    (f.rule || []).forEach((r) => checkRuleRef(at, r));
  }
}

const checkFindingRef = (file, id) => { if (id && !findingIds.has(id)) err(file, `нет находки ${id}`); };
for (const [id, f] of findingIds) {
  (f.related || []).forEach((r) => checkFindingRef(id, r));
  checkFindingRef(id, f.sameAs);
}

for (const { rel, data } of patterns) {
  if (data.format !== "aid-knowledge/0" || data.kind !== "pattern") err(rel, "format/kind");
  inEnum(rel, "confidence", data.confidence);
  (data.layers || []).forEach((l) => { inEnum(rel, "confidence", l.confidence); componentRef(rel, l.component); });
  if (data.container) {
    inEnum(rel, "source", data.container.source);
    (data.container.blocks || []).forEach((b) => { inEnum(rel, "confidence", b.confidence); componentRef(rel, b.component); });
  }
  if (data.primaryAction) { inEnum(rel, "placement", data.primaryAction.placement); componentRef(rel, data.primaryAction.component); }
  (data.findings || []).forEach((id) => checkFindingRef(rel, id));
}
const patternIds = new Set(patterns.map((p) => p.data.id));
for (const { rel, data } of patterns) (data.distinguishedFrom || []).forEach((d) => { if (!patternIds.has(d.pattern)) err(rel, `нет паттерна ${d.pattern}`); });

for (const { rel, data } of components) {
  if (data.format !== "aid-knowledge/0" || data.kind !== "component") err(rel, "format/kind");
  if (!data.library || `${data.library.page}/${data.library.set}` !== data.id) err(rel, "id ≠ library.page/library.set");
  componentRef(rel, data.id);
  if (data.purpose) { inEnum(rel, "interaction", data.purpose.interaction); inEnum(rel, "confidence", data.purpose.confidence); }
  (data.variants || []).forEach((v) => inEnum(rel, "confidence", v.confidence));
  (data.style || []).forEach((s) => { inEnum(rel, "confidence", s.confidence); checkRuleRef(rel, s.rule); });
  (data.notThis || []).forEach((n) => componentRef(rel, n.looksLike));
  (data.states?.missing || []).forEach((m) => checkFindingRef(rel, m.finding));
  (data.deviations || []).forEach((d) => checkFindingRef(rel, d.finding));
  (data.usedIn || []).forEach((p) => { if (!patternIds.has(p)) err(rel, `нет паттерна ${p}`); });
}

const byKind = {};
const byAddressee = {};
for (const f of findingIds.values()) {
  byKind[f.kind] = (byKind[f.kind] || 0) + 1;
  byAddressee[f.addressee] = (byAddressee[f.addressee] || 0) + 1;
}
console.log(`${product}: правил ${ruleIds.size} (метод + продукт), паттернов ${patterns.length}, компонентов ${components.length}, находок ${findingIds.size}`);
console.log("по виду:", byKind);
console.log("по адресату:", byAddressee);
if (errors.length) { console.log(`\nОшибок: ${errors.length}`); errors.forEach((e) => console.log(" - " + e)); process.exit(1); }
console.log("ошибок нет");
