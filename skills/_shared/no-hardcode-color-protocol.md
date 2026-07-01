---
destination: skills/_shared/
name: no-hardcode-color-protocol
---

# No-Hardcode Color Protocol

Протокол для генерации HTML/CSS без единого захардкоженного цвета.
Используется при создании и редактировании любых HTML-файлов в docs/guides/.

---

## Правило №1 — Абсолютный запрет

Запрещено писать в CSS/HTML:
- HEX-значения: `#f0f0f4`, `#1e1e2e`
- RGB/RGBA: `rgba(0,0,0,0.06)`, `rgb(255,255,255)`
- Именованные цвета: `white`, `black`, `transparent` (кроме `transparent` как значения без визуального цвета)
- HSL/OKLCH литералы напрямую в компонентах

Любой цвет — только через `var(--token-name)`.

---

## Правило №2 — Два уровня токенов

### Core-токен (только HEX, только в :root)

Формат имени: `--core-[palette-name]-[step]`

```css
/* Примеры Core */
--core-neutral-x-0: #ffffff;
--core-neutral-x-5: #f7f7f7;
--core-neutral-x-90: #1e1e2e;
--core-jasper-55: #2C64E3;
--core-jasper-55-a06: rgba(44, 100, 227, 0.06);  /* alpha-вариант */
```

Правила Core:
- Имя палитры строчными, через дефис, нейтральное (камень, город) — без слов brand/primary/error
- Ступени 0–100, шаг 5 (0 = белый, 100 = чёрный)
- Alpha-ступени: `[palette]-[step]-a[opacity%]`
- Core-токены НЕ используются в компонентах напрямую

### Semantic-токен (назначение, ссылается на Core)

Формат имени: `--[category]-[group]-[subgroup]-[variant]`

```css
/* Примеры Semantic */
--bg-base-main: var(--core-neutral-x-0);
--bg-card-main: var(--core-neutral-x-5);
--text-primary: var(--core-neutral-x-90);
--text-secondary: var(--core-neutral-x-60);
--line-default: var(--core-neutral-x-10);
```

Правила Semantic:
- Категории: `bg`, `text`, `icon`, `line`
- Имя описывает назначение, НЕ цвет: `bg-card-main`, не `bg-white`
- Числа в semantic-имени запрещены: `text-primary`, не `text-18`
- Работает в light и dark mode — имя остаётся, значение меняется

---

## Правило №3 — Алгоритм при создании/редактировании файла

```
ДЛЯ КАЖДОГО цветового значения:

1. Нужен ли новый Core-токен?
   - Если HEX уже есть в :root как --core-* → использовать существующий
   - Если нового HEX нет → добавить в :root блок Core

2. Нужен ли новый Semantic-токен?
   - Если назначение уже покрыто существующим semantic → использовать его
   - Если нового назначения нет → добавить в :root блок Semantic

3. В компоненте → только var(--semantic-token-name)

НИКОГДА не писать шаг 1 или 2 напрямую в компоненте.
```

---

## Правило №4 — Структура :root в HTML-файле

```css
:root {
  /* ═══════════════════════════════════════
     CORE COLOR TOKENS — raw values only
     ═══════════════════════════════════════ */
  --core-neutral-x-0:   #ffffff;
  --core-neutral-x-5:   #f7f6f2;
  /* ... */

  /* Alpha */
  --core-neutral-x-100-a06: rgba(0, 0, 0, 0.06);
  --core-neutral-x-100-a12: rgba(0, 0, 0, 0.12);

  /* ═══════════════════════════════════════
     SEMANTIC COLOR TOKENS — purpose aliases
     ═══════════════════════════════════════ */
  --bg-base-main:       var(--core-neutral-x-0);
  --bg-card-main:       var(--core-neutral-x-5);
  --text-primary:       var(--core-neutral-x-90);
  --line-default:       var(--core-neutral-x-10);
}

[data-theme="dark"] {
  /* ═══════════════════════════════════════
     SEMANTIC OVERRIDES for dark mode
     Core-токены НЕ переопределяются
     ═══════════════════════════════════════ */
  --bg-base-main:       var(--core-neutral-x-90);
  --bg-card-main:       var(--core-neutral-x-85);
  --text-primary:       var(--core-neutral-x-5);
}
```

---

## Правило №5 — Реестр токенов

После каждого создания нового токена — обновить файл `docs/tokens/color-tokens-registry.md`:

```markdown
| Token | Level | Value (light) | Value (dark) | Used in |
|-------|-------|---------------|--------------|---------|
| --core-neutral-x-0 | core | #ffffff | — | bg-base-main |
| --bg-base-main | semantic | core-neutral-x-0 | core-neutral-x-90 | template.html |
```

Если файл не существует — создать его.

---

## Блокеры (стоп-правила)

| Нарушение | Запрещено | Правильно |
|-----------|-----------|-----------|
| HEX в компоненте | `color: #333` | `color: var(--text-primary)` |
| RGBA в компоненте | `border: 1px solid rgba(0,0,0,0.06)` | `border: 1px solid var(--line-default)` |
| Core напрямую в компоненте | `background: var(--core-jasper-55)` | `background: var(--bg-accent-main)` |
| Semantic с числом в имени | `--text-14` | `--text-label` |
| Semantic с цветом в имени | `--bg-white` | `--bg-base-main` |
| Семантика без Core | `--bg-card-main: #f7f7f7` | `--bg-card-main: var(--core-neutral-x-5)` |
