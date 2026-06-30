---
destination: skills/_shared/
name: semantic-color-tokens-guide
metadata:
  version: "1.6.0"
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Semantic-слой цветовых токенов дизайн-системы. Описывает структуру
  bg/text/icon/line групп, нотацию -static/-staticwm/-ios/-android,
  состояния компонентов (bg-accent-states-*, bg-component-states-*),
  skeleton-токены и product/additional-группы. Компоненты ссылаются
  только на semantic-токены, никогда напрямую на Core.
---

# Semantic Color Tokens

> Статус: Stable · v1.6.0

<style>
/* =================================================================
   Semantic Color Guide — Illustration Styles v1.6.0
   All values via CSS custom properties. No hardcoded hex.
   ================================================================= */

:root {
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ── §2 Name decomposition ─────────────────────────────── */
.nd-wrap {
  margin: 20px 0;
  background: var(--bg-card-main);
  border: 1px solid var(--line-default);
  border-radius: 10px;
  overflow: hidden;
}
.nd-name {
  padding: 20px 20px 6px;
  font-family: 'JetBrains Mono', monospace;
  display: flex; flex-wrap: wrap; gap: 0; align-items: flex-end;
  border-bottom: 1px solid var(--line-default);
}
.nd-seg { display: flex; flex-direction: column; align-items: center; padding-bottom: 14px; }
.nd-seg-word { font-size: 14px; line-height: 1; font-weight: 500; }
.nd-seg-sep  { font-size: 14px; color: var(--text-disabled); }
.nd-seg-label {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: var(--text-secondary);
  white-space: nowrap; margin-top: 5px;
}
.nd-seg--cat  .nd-seg-word { color: var(--text-accent); }
.nd-seg--grp  .nd-seg-word { color: var(--text-success); }
.nd-seg--sub  .nd-seg-word { color: var(--text-error); }
.nd-seg--base .nd-seg-word { color: var(--text-primary); font-weight: 700; }
.nd-seg--mod  .nd-seg-word { color: var(--text-secondary); }
.nd-legend {
  display: flex; flex-wrap: wrap; gap: 8px 18px;
  padding: 10px 20px;
  background: var(--bg-base-main-secondary);
}
.nd-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary); }
.nd-legend-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* ── §3 Category cards ─────────────────────────────────── */
.cat-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0;
}
@media (max-width: 600px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
.cat-card {
  padding: 14px 14px 16px;
  border-radius: 10px; border: 1px solid var(--line-default);
  background: var(--bg-card-main);
  display: flex; flex-direction: column; gap: 10px;
  transition: box-shadow 0.2s var(--ease-spring), transform 0.2s var(--ease-spring);
  cursor: default;
}
.cat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
.cat-card__tag {
  font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
  padding: 3px 7px; border-radius: 5px;
  background: var(--bg-accent-ghost); color: var(--text-accent); width: fit-content;
}
.cat-card__sample { font-size: 20px; line-height: 1; padding: 4px 0; }
.cat-card__desc   { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }

/* ── §4 bg interactive tree ────────────────────────────── */
.bg-tree {
  border: 1px solid var(--line-default); border-radius: 10px;
  overflow: hidden; margin: 20px 0;
  font-family: 'JetBrains Mono', monospace; font-size: 12.5px;
}
.bg-tree details { border-bottom: 1px solid var(--line-default); }
.bg-tree details:last-child { border-bottom: none; }
.bg-tree summary {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 16px; cursor: pointer; list-style: none;
  background: var(--bg-card-main);
  transition: background 0.15s; user-select: none;
}
.bg-tree summary:hover { background: var(--bg-accent-ghost); }
.bg-tree summary::marker, .bg-tree summary::-webkit-details-marker { display: none; }
.bg-tree__chevron {
  width: 11px; height: 11px; flex-shrink: 0;
  border-right: 2px solid var(--text-secondary);
  border-bottom: 2px solid var(--text-secondary);
  transform: rotate(-45deg);
  transition: transform 0.22s var(--ease-spring);
}
details[open] .bg-tree__chevron { transform: rotate(45deg); }
.bg-tree__name  { color: var(--text-primary); font-weight: 600; }
.bg-tree__desc  { color: var(--text-secondary); font-size: 11px; margin-left: auto; }
.bg-tree__body  { background: var(--bg-base-main-secondary); }
.bg-tree__child {
  display: flex; align-items: baseline; gap: 8px;
  padding: 8px 16px 8px 42px;
  border-bottom: 1px solid var(--line-default); font-size: 12px;
}
.bg-tree__child:last-child { border-bottom: none; }
.bg-tree__child-name { color: var(--text-accent); }
.bg-tree__child-desc { color: var(--text-secondary); font-size: 11px; }

/* ── §5 Token text demo with tooltip ───────────────────── */
.token-text-demo__item {
  position: relative; cursor: default;
  padding: 2px 6px; border-radius: 4px;
  transition: background 0.12s;
}
.token-text-demo__item:hover { background: var(--bg-accent-ghost); }
.token-text-demo__item::after {
  content: attr(data-resolved);
  position: absolute; bottom: calc(100% + 6px); left: 50%;
  transform: translateX(-50%) translateY(4px) scale(0.95);
  background: var(--bg-card-main);
  border: 1px solid var(--line-default);
  color: var(--text-secondary); font-size: 11px;
  padding: 3px 8px; border-radius: 5px;
  white-space: nowrap; pointer-events: none;
  opacity: 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: opacity 0.15s, transform 0.2s var(--ease-spring);
  z-index: 10;
}
.token-text-demo__item:hover::after { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }

/* ── §6 Surface stack ──────────────────────────────────── */
.surface-stack {
  margin: 20px 0; padding: 16px;
  background: var(--bg-base-main);
  border: 1px solid var(--line-default); border-radius: 12px;
  display: flex; flex-direction: column; gap: 8px;
}
.surface-layer {
  border-radius: 9px; border: 1px solid var(--line-default);
  padding: 13px 16px;
  transition: box-shadow 0.2s var(--ease-spring), transform 0.2s var(--ease-spring);
  display: flex; align-items: center; justify-content: space-between;
}
.surface-layer:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); transform: translateY(-1px); }
.surface-layer__label {
  font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);
}
.surface-layer__token { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-accent); }
.surface-overlay {
  margin-top: 4px; border-radius: 9px;
  padding: 13px 16px;
  display: flex; align-items: center; justify-content: space-between;
}
.surface-overlay__label {
  font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.8);
}
.surface-overlay__token { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.6); }

/* ── §7 Accent variants strip ─────────────────────────── */
.accent-strip {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0;
}
@media (max-width: 600px) { .accent-strip { grid-template-columns: repeat(2, 1fr); } }
.accent-tile {
  padding: 18px 14px; border-radius: 10px; border: 1px solid var(--line-default);
  display: flex; flex-direction: column; gap: 8px;
  transition: transform 0.22s var(--ease-spring), box-shadow 0.22s var(--ease-spring);
  cursor: default;
}
.accent-tile:hover { transform: scale(1.04); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.accent-tile__name  { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; }
.accent-tile__text  { font-size: 22px; font-weight: 700; line-height: 1; }
.accent-tile__usage { font-size: 11px; color: var(--text-secondary); line-height: 1.4; }

/* ── §8 Hierarchy levels ───────────────────────────────── */
.hier-grid { display: flex; flex-direction: column; gap: 8px; margin: 20px 0; }
.hier-row {
  display: flex; align-items: center; gap: 14px; padding: 13px 16px;
  border-radius: 8px; border: 1px solid var(--line-default);
  background: var(--bg-card-main);
  transition: transform 0.18s var(--ease-spring);
}
.hier-row:hover { transform: translateX(4px); }
.hier-row__rank  { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); min-width: 72px; }
.hier-row__name  { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: var(--text-primary); }
.hier-row__desc  { font-size: 12px; color: var(--text-secondary); margin-left: auto; }

/* ── §9 States grid ────────────────────────────────────── */
.states-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0;
}
@media (max-width: 600px) { .states-grid { grid-template-columns: repeat(2, 1fr); } }
.state-tile {
  padding: 14px; border-radius: 10px; border: 1px solid var(--line-default);
  background: var(--bg-card-main); display: flex; flex-direction: column; gap: 10px;
}
.state-tile__dot   { width: 36px; height: 36px; border-radius: 8px; }
.state-tile__name  { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-secondary); font-weight: 600; }
.state-tile__token { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-disabled); }

/* ── §9 Do/Don't ───────────────────────────────────────── */
.do-dont {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;
}
@media (max-width: 560px) { .do-dont { grid-template-columns: 1fr; } }
.do-dont__item { border-radius: 10px; overflow: hidden; border: 1px solid var(--line-default); }
.do-dont__header {
  padding: 8px 14px; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; gap: 6px;
}
.do-dont__header--do   { background: var(--bg-accent-status-success); color: var(--text-success); }
.do-dont__header--dont { background: var(--bg-accent-status-error);   color: var(--text-error); }
.do-dont__body {
  padding: 14px; background: var(--bg-card-main);
  font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.65;
  color: var(--text-primary);
}
.do-dont__body em   { color: var(--text-success); font-style: normal; }
.do-dont__body mark { background: var(--bg-accent-status-error); color: var(--text-error); padding: 0 2px; border-radius: 2px; }

/* ── §9 Platform columns ───────────────────────────────── */
.platform-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0; }
@media (max-width: 600px) { .platform-grid { grid-template-columns: 1fr; } }
.platform-card { border-radius: 10px; border: 1px solid var(--line-default); overflow: hidden; }
.platform-card__label {
  padding: 8px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--text-secondary);
  background: var(--bg-base-main-secondary); border-bottom: 1px solid var(--line-default);
}
.platform-card__body {
  padding: 12px 14px; font-family: 'JetBrains Mono', monospace;
  font-size: 12px; line-height: 1.65; color: var(--text-primary);
  background: var(--bg-card-main);
}
.platform-card__body code { color: var(--text-accent); background: var(--bg-accent-ghost); padding: 1px 4px; border-radius: 3px; }
.platform-card__note { font-size: 11px; color: var(--text-disabled); margin-top: 6px; font-style: italic; }

/* ── §10 Form demo ─────────────────────────────────────── */
.form-demo {
  display: flex; flex-direction: column; gap: 16px; padding: 20px;
  background: var(--bg-card-main); border: 1px solid var(--line-default);
  border-radius: 12px; margin: 20px 0; max-width: 400px;
}
.form-demo__field { display: flex; flex-direction: column; gap: 5px; }
.form-demo__label { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
.form-demo__input {
  padding: 10px 12px; border-radius: 8px;
  border: 1.5px solid var(--line-default);
  background: var(--bg-base-main-secondary);
  color: var(--text-primary); font-size: 14px; font-family: inherit;
  outline: none;
  transition: border-color 0.2s var(--ease-spring), box-shadow 0.2s var(--ease-spring), background 0.2s;
}
.form-demo__input:focus {
  border-color: var(--line-accent);
  background: var(--bg-card-main);
  box-shadow: 0 0 0 3px var(--bg-accent-states-focused);
}
.form-demo__input--error {
  border-color: var(--text-error);
  background: var(--bg-accent-status-error);
  box-shadow: 0 0 0 3px rgba(217,48,37,0.12);
}
.form-demo__input--error:focus {
  box-shadow: 0 0 0 3px rgba(217,48,37,0.2);
}
.form-demo__input:disabled {
  opacity: 0.45; cursor: not-allowed;
}
.form-demo__hint        { font-size: 11px; color: var(--text-secondary); }
.form-demo__hint--error { font-size: 11px; color: var(--text-error); }

/* ── §11 Skeleton shimmer ──────────────────────────────── */
@keyframes skel-shimmer {
  0%   { transform: translateX(-150%); }
  100% { transform: translateX(200%);  }
}
.skel-card {
  padding: 20px; border-radius: 12px;
  border: 1px solid var(--line-default);
  background: var(--bg-card-main); margin: 20px 0; max-width: 360px;
  display: flex; flex-direction: column; gap: 16px;
}
.skel-row   { display: flex; align-items: center; gap: 12px; }
.skel-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--bg-component-skeleton-default);
  position: relative; overflow: hidden; flex-shrink: 0;
}
.skel-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.skel-line  {
  height: 11px; border-radius: 6px;
  background: var(--bg-component-skeleton-default);
  position: relative; overflow: hidden;
}
.skel-line--s  { width: 55%; }
.skel-line--m  { width: 80%; }
.skel-block {
  height: 110px; border-radius: 8px;
  background: var(--bg-component-skeleton-default);
  position: relative; overflow: hidden;
}
.skel-avatar::after, .skel-line::after, .skel-block::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 0%, var(--bg-component-skeleton-shimmer) 40%, var(--bg-component-skeleton-shimmer) 60%, transparent 100%);
  animation: skel-shimmer 1.6s ease-in-out infinite;
}

/* ── §12 Chart colors ──────────────────────────────────── */
.chart-strip { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0; }
.chart-swatch {
  width: 68px; height: 68px; border-radius: 10px;
  display: flex; align-items: flex-end; padding: 6px 8px;
  transition: transform 0.22s var(--ease-spring); cursor: default;
}
.chart-swatch:hover { transform: scale(1.1); }
.chart-swatch__label {
  font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700;
  color: var(--text-inverse); text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

/* ── §13 Step list ─────────────────────────────────────── */
.steps-list { margin: 20px 0; display: flex; flex-direction: column; gap: 4px; }
.step-row {
  display: flex; align-items: flex-start; gap: 14px; padding: 12px 16px;
  border-radius: 8px; background: var(--bg-card-main); border: 1px solid var(--line-default);
  transition: background 0.15s, transform 0.2s var(--ease-spring);
}
.step-row:hover { background: var(--bg-accent-ghost); transform: translateX(3px); }
.step-num {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  background: var(--bg-accent-main); color: var(--text-inverse);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}
.step-text { font-size: 13px; color: var(--text-primary); line-height: 1.5; padding-top: 2px; }
.step-text code {
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  color: var(--text-accent); background: var(--bg-accent-ghost);
  padding: 1px 5px; border-radius: 4px;
}
</style>

---

Semantic-токены — это смысловой слой поверх Core Color Tokens.
Компоненты ссылаются только на semantic-токены, никогда напрямую на Core.
Governance-правила — в `token-rules.md`.

---

## 1. Принцип

Semantic-токен ссылается на Core Color Token — не хранит HEX напрямую.

<div class="arch-diagram">
  <div class="arch-diagram__row">
    <span class="arch-diagram__layer">Core</span>
    <code class="arch-diagram__name">jasper-65</code>
    <span class="arch-diagram__note">#ef3124</span>
  </div>
  <div class="arch-diagram__connector">semantic ссылается на core</div>
  <div class="arch-diagram__row">
    <span class="arch-diagram__layer">Semantic</span>
    <code class="arch-diagram__name">bg-accent-main</code>
    <span class="arch-diagram__note">→ jasper-65</span>
  </div>
  <div class="arch-diagram__connector">компонент использует semantic</div>
  <div class="arch-diagram__row">
    <span class="arch-diagram__layer">Component</span>
    <code class="arch-diagram__name">background: var(--bg-accent-main)</code>
    <span class="arch-diagram__note"></span>
  </div>
</div>

Core → Semantic. Semantic → Core HEX.
Core-токены называются по цвету (jasper, citrine); semantic — по назначению (brand, status, product).

### Figma-реализация

Semantic-токены — это Figma Variables.
Хранятся в отдельной Variable Collection.
Связываются со Style Dictionary.
Экспортируются на все платформы автоматически.

---

## 2. Структура имён

<div class="nd-wrap">
  <div class="nd-name">
    <div class="nd-seg nd-seg--cat">
      <span class="nd-seg-word">bg</span>
      <span class="nd-seg-label">Категория</span>
    </div>
    <div class="nd-seg"><span class="nd-seg-sep">-</span></div>
    <div class="nd-seg nd-seg--grp">
      <span class="nd-seg-word">accent</span>
      <span class="nd-seg-label">Группа</span>
    </div>
    <div class="nd-seg"><span class="nd-seg-sep">-</span></div>
    <div class="nd-seg nd-seg--sub">
      <span class="nd-seg-word">product</span>
      <span class="nd-seg-label">Подгруппа</span>
    </div>
    <div class="nd-seg"><span class="nd-seg-sep">-</span></div>
    <div class="nd-seg nd-seg--sub">
      <span class="nd-seg-word">marketplace</span>
      <span class="nd-seg-label">Вариант</span>
    </div>
    <div class="nd-seg"><span class="nd-seg-sep">-</span></div>
    <div class="nd-seg nd-seg--base">
      <span class="nd-seg-word">main</span>
      <span class="nd-seg-label">База</span>
    </div>
    <div class="nd-seg"><span class="nd-seg-sep">-</span></div>
    <div class="nd-seg nd-seg--mod">
      <span class="nd-seg-word">secondary</span>
      <span class="nd-seg-label">Иерархия</span>
    </div>
    <div class="nd-seg"><span class="nd-seg-sep">-</span></div>
    <div class="nd-seg nd-seg--mod">
      <span class="nd-seg-word">static</span>
      <span class="nd-seg-label">Модификатор</span>
    </div>
  </div>
  <div class="nd-legend">
    <div class="nd-legend-item"><span class="nd-legend-dot" style="background:var(--text-accent)"></span>Категория</div>
    <div class="nd-legend-item"><span class="nd-legend-dot" style="background:var(--text-success)"></span>Группа</div>
    <div class="nd-legend-item"><span class="nd-legend-dot" style="background:var(--text-error)"></span>Подгруппа / Вариант</div>
    <div class="nd-legend-item"><span class="nd-legend-dot" style="background:var(--text-primary)"></span>База</div>
    <div class="nd-legend-item"><span class="nd-legend-dot" style="background:var(--text-secondary)"></span>Иерархия / Модификатор</div>
  </div>
</div>

Имя читается слева направо: категория → группа → подгруппа → вариант → модификатор.
Semantic-токены не содержат числа и не называются цветами.
Semantic — это назначение, не цвет.
Core-токены называются по цвету (jasper, citrine).

---

## 3. Категории

<div class="cat-grid">
  <div class="cat-card">
    <span class="cat-card__tag">bg</span>
    <div class="cat-card__sample">
      <div style="width:36px;height:36px;border-radius:8px;background:var(--bg-accent-main)"></div>
    </div>
    <span class="cat-card__desc">Фоны — экраны, зоны, компоненты</span>
  </div>
  <div class="cat-card">
    <span class="cat-card__tag">text</span>
    <div class="cat-card__sample" style="font-size:26px;font-weight:700;color:var(--text-primary);line-height:1;padding:4px 0">Aa</div>
    <span class="cat-card__desc">Цвет текста</span>
  </div>
  <div class="cat-card">
    <span class="cat-card__tag">icon</span>
    <div class="cat-card__sample">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--icon-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
    </div>
    <span class="cat-card__desc">Цвет иконок</span>
  </div>
  <div class="cat-card">
    <span class="cat-card__tag">line</span>
    <div class="cat-card__sample">
      <div style="height:2px;background:var(--line-default);border-radius:1px;margin:10px 0 6px"></div>
      <div style="height:2px;background:var(--line-strong);border-radius:1px;margin-bottom:6px"></div>
      <div style="height:2px;background:var(--line-accent);border-radius:1px"></div>
    </div>
    <span class="cat-card__desc">Разделители и бордеры</span>
  </div>
</div>

| Категория | Назначение                              |
|-----------|----------------------------------------|
| `bg`      | Фоны — экраны, зоны, компоненты        |
| `text`    | Цвет текста                             |
| `icon`    | Цвет иконок                             |
| `line`    | Разделители и бордеры                   |

Внутри каждой категории — группы по назначению.

---

## 4. Карта групп bg

<div class="bg-tree">
  <details>
    <summary>
      <span class="bg-tree__chevron"></span>
      <span class="bg-tree__name">base</span>
      <span class="bg-tree__desc">базовые фоны экрана</span>
    </summary>
    <div class="bg-tree__body">
      <div class="bg-tree__child"><span class="bg-tree__child-name">bg-base-main</span><span class="bg-tree__child-desc">первичный фон экрана</span></div>
      <div class="bg-tree__child"><span class="bg-tree__child-name">bg-base-main-secondary</span><span class="bg-tree__child-desc">вторичный фон</span></div>
    </div>
  </details>
  <details>
    <summary>
      <span class="bg-tree__chevron"></span>
      <span class="bg-tree__name">card</span>
      <span class="bg-tree__desc">фоны карточек</span>
    </summary>
    <div class="bg-tree__body">
      <div class="bg-tree__child"><span class="bg-tree__child-name">bg-card-main</span><span class="bg-tree__child-desc">фон карточки</span></div>
      <div class="bg-tree__child"><span class="bg-tree__child-name">bg-card-main-secondary</span><span class="bg-tree__child-desc">вторичный фон карточки</span></div>
    </div>
  </details>
  <details>
    <summary>
      <span class="bg-tree__chevron"></span>
      <span class="bg-tree__name">overlay / modal</span>
      <span class="bg-tree__desc">полупрозрачные и модальные фоны</span>
    </summary>
    <div class="bg-tree__body">
      <div class="bg-tree__child"><span class="bg-tree__child-name">bg-overlay-main</span><span class="bg-tree__child-desc">затемнение поверх контента</span></div>
      <div class="bg-tree__child"><span class="bg-tree__child-name">bg-modal-main</span><span class="bg-tree__child-desc">фон модального окна</span></div>
      <div class="bg-tree__child"><span class="bg-tree__child-name">bg-modal-main-secondary</span><span class="bg-tree__child-desc">вторичный фон модала</span></div>
    </div>
  </details>
  <details open>
    <summary>
      <span class="bg-tree__chevron"></span>
      <span class="bg-tree__name">accent</span>
      <span class="bg-tree__desc">акцентные фоны, состояния, статусы</span>
    </summary>
    <div class="bg-tree__body">
      <div class="bg-tree__child"><span class="bg-tree__child-name">main / fade / ghost / inverse</span><span class="bg-tree__child-desc">базовые акценты</span></div>
      <div class="bg-tree__child"><span class="bg-tree__child-name">states-hover / pressed / active…</span><span class="bg-tree__child-desc">интерактивные состояния</span></div>
      <div class="bg-tree__child"><span class="bg-tree__child-name">status-success / warning / error</span><span class="bg-tree__child-desc">статусные фоны</span></div>
      <div class="bg-tree__child"><span class="bg-tree__child-name">product-loyalty / marketplace…</span><span class="bg-tree__child-desc">продуктовые цвета</span></div>
      <div class="bg-tree__child"><span class="bg-tree__child-name">additional-chart-a / b / c…</span><span class="bg-tree__child-desc">чарты и кастомные</span></div>
    </div>
  </details>
  <details>
    <summary>
      <span class="bg-tree__chevron"></span>
      <span class="bg-tree__name">component</span>
      <span class="bg-tree__desc">контролы, skeleton, floating</span>
    </summary>
    <div class="bg-tree__body">
      <div class="bg-tree__child"><span class="bg-tree__child-name">states-form-focused / error</span><span class="bg-tree__child-desc">поля ввода, дропдауны</span></div>
      <div class="bg-tree__child"><span class="bg-tree__child-name">states-control-accent-active</span><span class="bg-tree__child-desc">чекбоксы, радио, тоглы</span></div>
      <div class="bg-tree__child"><span class="bg-tree__child-name">skeleton-default / shimmer</span><span class="bg-tree__child-desc">заглушки при загрузке</span></div>
    </div>
  </details>
</div>

---

## 5. text, icon, line

<div class="token-text-demo">
  <span class="token-text-demo__item" data-token="text-primary"   style="color:var(--text-primary)">text-primary</span>
  <span class="token-text-demo__item" data-token="text-secondary" style="color:var(--text-secondary)">text-secondary</span>
  <span class="token-text-demo__item" data-token="text-disabled"  style="color:var(--text-disabled)">text-disabled</span>
  <span class="token-text-demo__item token-text-demo__item--on-accent" data-token="text-inverse" style="color:var(--text-inverse)">text-inverse</span>
  <span class="token-text-demo__item" data-token="text-accent"  style="color:var(--text-accent)">text-accent</span>
  <span class="token-text-demo__item" data-token="text-error"   style="color:var(--text-error)">text-error</span>
  <span class="token-text-demo__item" data-token="text-success" style="color:var(--text-success)">text-success</span>
</div>

<script>
(function() {
  var cs = getComputedStyle(document.documentElement);
  document.querySelectorAll('.token-text-demo__item[data-token]').forEach(function(el) {
    var v = cs.getPropertyValue('--' + el.dataset.token).trim();
    if (v) el.setAttribute('data-resolved', v);
  });
})();
</script>

```token-color
text-primary   | rgba(3, 3, 6, 0.88)   | Основной текст
text-secondary | rgba(4, 4, 19, 0.55)  | Второстепенный текст
text-disabled  | rgba(5, 11, 44, 0.18) | Неактивный текст
text-inverse   | #ffffff               | Текст на акцентном фоне
text-accent    | #ef3124               | Акцентный текст и ссылки
text-error     | #ec2d20               | Текст ошибки
text-success   | #0d9336               | Текст успеха
```

```token-color
icon-primary   | #212124 | Основная иконка
icon-secondary | #898991 | Второстепенная иконка
icon-accent    | #ef3124 | Акцентная иконка
icon-inverse   | #ffffff | Иконка на акцентном фоне
icon-disabled  | #d2d3d9 | Неактивная иконка
```

```token-color
line-default | #e7e8eb | Стандартный разделитель и бордер
line-strong  | #d2d3d9 | Усиленный разделитель
line-accent  | #ef3124 | Акцентный бордер (фокус, активное поле)
```

`text` и `icon` — параллельные структуры.
`line` — отдельная ветка, не подгруппа `bg`.

---

## 6. bg-base, bg-card, bg-overlay, bg-modal

<div class="surface-stack">
  <div class="surface-layer" style="background:var(--bg-base-main)">
    <span class="surface-layer__label">base</span>
    <span class="surface-layer__token">bg-base-main</span>
  </div>
  <div class="surface-layer" style="background:var(--bg-card-main)">
    <span class="surface-layer__label">card</span>
    <span class="surface-layer__token">bg-card-main</span>
  </div>
  <div class="surface-layer" style="background:var(--bg-modal-main)">
    <span class="surface-layer__label">modal</span>
    <span class="surface-layer__token">bg-modal-main</span>
  </div>
  <div class="surface-overlay" style="background:var(--bg-overlay-main)">
    <span class="surface-overlay__label">overlay</span>
    <span class="surface-overlay__token">bg-overlay-main</span>
  </div>
</div>

```token-color
bg-base-main            | #ffffff             | Основной фон экрана
bg-base-main-secondary  | #f2f3f5             | Вторичный фон экрана
bg-card-main            | #ffffff             | Фон карточки
bg-card-main-secondary  | #edeef0             | Вторичный фон карточки
bg-overlay-main         | rgba(0, 0, 0, 0.60) | Оверлей (полупрозрачный)
bg-modal-main           | #ffffff             | Фон модального окна
bg-modal-main-secondary | #f2f3f5             | Вторичный фон модального окна
```

`bg-base-main` — первичный фон. `bg-base-main-secondary` — вторичный.

### product и additional внутри accent

| Подгруппа    | Назначение                                      |
|--------------|-------------------------------------------------|
| `product`    | Продуктовые цвета: marketplace, loyalty, premium |
| `additional` | Кастомные цвета: чарты, специальные             |
| `status`     | Статусы: attention, success, warning, error     |

- `product` — цвета конкретных продуктовых направлений.
- `additional` — не системные цвета; используются точечно.

---

## 7. bg-accent-* variants

<div class="accent-strip">
  <div class="accent-tile" style="background:var(--bg-accent-main)">
    <span class="accent-tile__name" style="color:var(--text-inverse)">main</span>
    <span class="accent-tile__text" style="color:var(--text-inverse)">Aa</span>
    <span class="accent-tile__usage" style="color:rgba(255,255,255,0.7)">Основной акцент — кнопки, ссылки</span>
  </div>
  <div class="accent-tile" style="background:var(--bg-accent-fade)">
    <span class="accent-tile__name" style="color:var(--text-accent)">fade</span>
    <span class="accent-tile__text" style="color:var(--text-accent)">Aa</span>
    <span class="accent-tile__usage">Приглушённый — бейджи, фон чипов</span>
  </div>
  <div class="accent-tile" style="background:var(--bg-accent-ghost)">
    <span class="accent-tile__name" style="color:var(--text-accent)">ghost</span>
    <span class="accent-tile__text" style="color:var(--text-accent)">Aa</span>
    <span class="accent-tile__usage">Еле заметный — ховер по строке</span>
  </div>
  <div class="accent-tile" style="background:var(--bg-accent-inverse);border-color:var(--line-default)">
    <span class="accent-tile__name" style="color:var(--text-primary)">inverse</span>
    <span class="accent-tile__text" style="color:var(--text-primary)">Aa</span>
    <span class="accent-tile__usage">Белый фон для инверсного текста</span>
  </div>
</div>

```token-color
bg-accent-main    | #ef3124 | Основной акцентный фон
bg-accent-fade    | #ffdfdf | Приглушённый акцент (main с alpha)
bg-accent-ghost   | #ffebeb | Еле заметный акцент (тише fade)
bg-accent-inverse | #121213 | Инверсный фон (текст поверх — инверсный)
```

`fade` и `ghost` — это `main` с уменьшенной прозрачностью через Core alpha-нотацию.
`inverse` — фон, на котором используется `color-text-inverse` или `color-icon-inverse`.

### Inverse

`inverse` нужен когда элемент отображается на акцентном фоне.

```
Core: jasper-0, jasper-60
Semantic: brand-main → jasper-60, brand-inverse → jasper-0
```

Core white и black — это Core `0` и `100`, не отдельные токены.

---

## 8. -primary, -secondary, -tertiary

<div class="hier-grid">
  <div class="hier-row">
    <span class="hier-row__rank">main</span>
    <code class="hier-row__name">bg-base-main</code>
    <span class="hier-row__desc">первый уровень — входная точка</span>
  </div>
  <div class="hier-row">
    <span class="hier-row__rank">secondary</span>
    <code class="hier-row__name">bg-base-main-secondary</code>
    <span class="hier-row__desc">вложенный уровень внутри main</span>
  </div>
  <div class="hier-row">
    <span class="hier-row__rank">tertiary</span>
    <code class="hier-row__name">bg-base-main-tertiary</code>
    <span class="hier-row__desc">третий уровень, редко используется</span>
  </div>
</div>

Суффиксы `-primary`, `-secondary`, `-tertiary` обозначают иерархию внутри группы.
Не путать с `bg-base-main` — это не primary.
`bg-base-main` — первый уровень. `bg-base-main-secondary` и `bg-base-main-tertiary` — вложенные уровни.
`-primary` не дублирует `main`; `-primary` — это иерархия внутри secondary-уровня.

---

## 9. Модификаторы

### -static

<div class="do-dont">
  <div class="do-dont__item">
    <div class="do-dont__header do-dont__header--do">✓ Правильно</div>
    <div class="do-dont__body">
      bg-accent-product-marketplace-<em>main-static</em><br><br>
      Цвет одинаков в light и dark.
      Используй когда брендовый цвет
      не должен меняться при смене темы.
    </div>
  </div>
  <div class="do-dont__item">
    <div class="do-dont__header do-dont__header--dont">✗ Неправильно</div>
    <div class="do-dont__body">
      bg-accent-product-marketplace-<mark>main</mark><br><br>
      Без -static цвет адаптируется к теме.
      Если дизайн требует постоянного цвета —
      это неверный токен.
    </div>
  </div>
</div>

Токен с `-static` одинаковый в light и dark mode.

```
bg-accent-product-marketplace-main         → light: jasper-55, dark: jasper-75
bg-accent-product-marketplace-main-static  → light: jasper-55, dark: jasper-55
```

Используй `-static` когда цвет не должен меняться между режимами.

### -staticwm (White Label / Wealth Management)

WM — отдельный визуальный режим поверх light/dark.
`-staticwm` зафиксирован для WM, независимо от light/dark.

### -static-lm / -static-dm

| Суффикс      | Значение                              |
|--------------|---------------------------------------|
| `-static-lm` | Зафиксирован в light mode             |
| `-static-dm` | Зафиксирован в dark mode              |

```
bg-base-main light → jasper-5, dark → jasper-90
static-lm bg-base-main → jasper-5 в light
static-dm bg-base-main → jasper-90 в dark
```

### -states: визуальные состояния компонентов

<div class="states-grid">
  <div class="state-tile">
    <div class="state-tile__dot" style="background:var(--bg-accent-states-hover)"></div>
    <span class="state-tile__name">hover</span>
    <span class="state-tile__token">bg-accent-states-hover</span>
  </div>
  <div class="state-tile">
    <div class="state-tile__dot" style="background:var(--bg-accent-states-pressed)"></div>
    <span class="state-tile__name">pressed</span>
    <span class="state-tile__token">bg-accent-states-pressed</span>
  </div>
  <div class="state-tile">
    <div class="state-tile__dot" style="background:var(--bg-accent-states-active)"></div>
    <span class="state-tile__name">active</span>
    <span class="state-tile__token">bg-accent-states-active</span>
  </div>
  <div class="state-tile">
    <div class="state-tile__dot" style="background:var(--bg-accent-states-focused)"></div>
    <span class="state-tile__name">focused</span>
    <span class="state-tile__token">bg-accent-states-focused</span>
  </div>
  <div class="state-tile">
    <div class="state-tile__dot" style="background:var(--bg-accent-states-disable)"></div>
    <span class="state-tile__name">disabled</span>
    <span class="state-tile__token">bg-accent-states-disable</span>
  </div>
</div>

Состояния компонентов. Нейминг в Figma, маппинг платформ и правила комбинирования —
в `component-states-guide.md`.

### Платформенный маппинг

<div class="platform-grid">
  <div class="platform-card">
    <div class="platform-card__label">Web</div>
    <div class="platform-card__body">
      <code>:hover</code> → <code>states-hover</code><br>
      <code>:active</code> → <code>states-pressed</code><br>
      <code>:focus-visible</code> → <code>states-focused</code><br>
      <code>[disabled]</code> → <code>states-disable</code>
      <p class="platform-card__note">-ios и -android токены не используются</p>
    </div>
  </div>
  <div class="platform-card">
    <div class="platform-card__label">iOS</div>
    <div class="platform-card__body">
      нет <code>hover</code><br>
      <code>.highlighted</code> → <code>states-pressed</code><br>
      <code>.selected</code> → <code>states-active</code><br>
      focus → <code>states-focused-ios</code>
      <p class="platform-card__note">-ios суффикс только для iOS-токенов</p>
    </div>
  </div>
  <div class="platform-card">
    <div class="platform-card__label">Android</div>
    <div class="platform-card__body">
      нет <code>hover</code><br>
      ripple → <code>states-ripple-android</code><br>
      <code>pressed</code> → <code>states-pressed</code><br>
      нет <code>focused</code>
      <p class="platform-card__note">-android суффикс только для Android</p>
    </div>
  </div>
</div>

### -ios, -android

`-ios` — токен используется только в iOS-реализации.
`-android` — только в Android.
Web не использует `-ios` и `-android` токены.
Figma содержит все варианты; платформа берёт только свой столбец.

---

## 10. bg-component-states-*

`bg-component-states-*` — состояния конкретных типов компонентов.
Это не дублирование `bg-accent-states-*` — у них разная семантика:
- `bg-accent-states-*` — универсальные состояния для акцентных компонентов
- `bg-component-states-*` — состояния специфичных контролов (форм, переключателей)

<div class="form-demo">
  <div class="form-demo__field">
    <label class="form-demo__label">Default</label>
    <input class="form-demo__input" type="text" placeholder="Введите значение…" readonly>
    <span class="form-demo__hint">bg-base-main-secondary, line-default</span>
  </div>
  <div class="form-demo__field">
    <label class="form-demo__label">Focused — кликни</label>
    <input class="form-demo__input" type="text" placeholder="Кликни для фокуса…">
    <span class="form-demo__hint">bg-card-main, line-accent, bg-accent-states-focused (ring)</span>
  </div>
  <div class="form-demo__field">
    <label class="form-demo__label">Error</label>
    <input class="form-demo__input form-demo__input--error" type="text" value="Неверное значение">
    <span class="form-demo__hint form-demo__hint--error">bg-accent-status-error, text-error</span>
  </div>
  <div class="form-demo__field">
    <label class="form-demo__label">Disabled</label>
    <input class="form-demo__input" type="text" value="Недоступно" disabled>
    <span class="form-demo__hint">opacity 0.45 + cursor not-allowed</span>
  </div>
</div>

Структура:
- `control` — переключатели, чекбоксы, радио-кнопки
- `form` — поля ввода, дропдауны

```
bg-component-states-control-accent-active
bg-component-states-form-focused
bg-component-states-form-error
```

Для chart-фонов используется отдельная нотация:
`...-accent-additional-chart-fade` → `...-chart-fade`

---

## 11. bg-component-skeleton-*

Skeleton — двуслойная анимация ожидания данных.
Токены живут в группе `bg-component-*`: это состояние отображения компонента,
а не акцентный или базовый фон экрана.

<div class="skel-card">
  <div class="skel-row">
    <div class="skel-avatar"></div>
    <div class="skel-lines">
      <div class="skel-line skel-line--m"></div>
      <div class="skel-line skel-line--s"></div>
    </div>
  </div>
  <div class="skel-block"></div>
  <div class="skel-lines">
    <div class="skel-line"></div>
    <div class="skel-line skel-line--m"></div>
    <div class="skel-line skel-line--s"></div>
  </div>
</div>

| Токен                             | Назначение                                      | Core (light)        | Light value | Core (dark)         |
|-----------------------------------|-------------------------------------------------|---------------------|-------------|---------------------|
| `bg-component-skeleton-default`   | Базовый фон заглушки                            | `color-neutral-100` | `#f2f3f5`   | `color-neutral-800` |
| `bg-component-skeleton-shimmer`   | Светлая волна поверх default (shimmer-анимация) | `color-neutral-0`   | `#ffffff`   | `color-neutral-700` |

**Правила использования:**
- `bg-component-skeleton-default` — фон всей области-заглушки
- `bg-component-skeleton-shimmer` — движущаяся полоса поверх default (gradient или отдельный слой)
- Оба токена адаптируются к light/dark mode
- Не используй `bg-base-*` для скелетонов — это разные семантики

---

## 12. Additional

`additional` — нестандартные цвета, используемые точечно.

<div class="chart-strip">
  <div class="chart-swatch" style="background:var(--bg-accent-main)">
    <span class="chart-swatch__label">chart-a</span>
  </div>
  <div class="chart-swatch" style="background:var(--text-success)">
    <span class="chart-swatch__label">chart-b</span>
  </div>
  <div class="chart-swatch" style="background:var(--text-error)">
    <span class="chart-swatch__label">chart-c</span>
  </div>
  <div class="chart-swatch" style="background:var(--text-accent)">
    <span class="chart-swatch__label">chart-d</span>
  </div>
  <div class="chart-swatch" style="background:var(--bg-accent-status-warning);border:1px solid var(--line-default)">
    <span class="chart-swatch__label" style="color:var(--text-primary);text-shadow:none">chart-e</span>
  </div>
  <div class="chart-swatch" style="background:var(--text-secondary)">
    <span class="chart-swatch__label">chart-f</span>
  </div>
</div>

```
bg-accent-additional-chart-a-main
bg-accent-additional-chart-b-main
bg-accent-additional-chart-c-fade
```

`product` — цвета продуктовых направлений:

```
bg-accent-product-loyalty-main
bg-accent-product-insurance-fade
bg-accent-product-marketplace-main
```

Все product-токены ссылаются на Core Color Tokens.

---

## 13. static-lm / static-dm в Figma

<div class="steps-list">
  <div class="step-row">
    <span class="step-num">1</span>
    <span class="step-text">Открой панель <code>Variables</code> в Figma (правая панель → Variables)</span>
  </div>
  <div class="step-row">
    <span class="step-num">2</span>
    <span class="step-text">Выбери нужную Variable Collection из списка коллекций</span>
  </div>
  <div class="step-row">
    <span class="step-num">3</span>
    <span class="step-text">Переключи mode через <code>Mode switcher</code> в шапке коллекции</span>
  </div>
  <div class="step-row">
    <span class="step-num">4</span>
    <span class="step-text">Смени тему через <code>Appearance → light/dark</code> чтобы сравнить значения</span>
  </div>
</div>

---

## Changelog

- **1.6.0** — Illustration Logic применён ко всем секциям (13/13): arch-diagram §1,
  name-decompose §2, cat-grid §3, interactive bg-tree §4, token-text-demo + tooltip §5,
  surface-stack §6, accent-strip §7, hier-grid §8, do-dont + states-grid + platform-grid §9,
  form-demo §10, skeleton-shimmer §11, chart-strip §12, steps-list §13.
  Добавлена поддержка `<script>` re-execution в template.html.
- **1.5.0** — Illustration Logic: секция 1 (Принцип) — arch-diagram Core→Semantic→Component
  (Rule 5); секция 5 (text/icon/line) — live token-text-demo (Rule 1).
  Добавлены CSS-классы `.arch-diagram` и `.token-text-demo` в `style.css`.
- **1.4.0** — секции 5, 6, 7: CSS-переменные заменены на реальные hex/rgba значения в
  `token-color`-блоках — свотчи теперь рендерятся без подключённой theme CSS.
  Секция 11: таблица skeleton дополнена колонкой `Light value` с фактическими значениями
  (`#f2f3f5`, `#ffffff`). Маппинг на основе извлечённых токенов публичной UI-библиотеки (light theme).
- **1.3.0** — секции 5, 6, 7: таблицы заменены на `token-color`-блоки с live-свотчами
  (token-viz.js). Убраны raw HEX-значения из prose-блоков секций 1 и 7 (Inverse).
- **1.2.0** — добавлены skeleton-токены: `bg-component-skeleton-default` и
  `bg-component-skeleton-shimmer` в группу `bg-component-*`
  (раздел 11). Обновлена карта групп bg (раздел 4).
- **1.1.0** — добавлены Core Color Tokens (jasper, citrine); убраны Core-токены
  white/black; добавлен ghost-вариант.
- **1.0.0** — первая версия: Space-токены, dark mode, product и additional,
  static-суффиксы, states.
