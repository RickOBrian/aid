---
destination: skills/_shared/standards/
name: no-hardcode-color-protocol
metadata:
  version: "1.1.0"
  kind: standard
---

# No-Hardcode Color Protocol

> Статус: Draft · v1.1.0 · обновлено 2026-09-21

---

Протокол для генерации HTML/CSS без единого захардкоженного цвета.
Используется при создании и редактировании любых HTML-файлов в docs/guides/.

---

## 1. Правило №1 — Абсолютный запрет

Запрещено писать в CSS/HTML:
- HEX-значения: `#f0f0f4`, `#1e1e2e`
- RGB/RGBA: `rgba(0,0,0,0.06)`, `rgb(255,255,255)`
- Именованные цвета: `white`, `black`, `transparent` (кроме `transparent` как значения без визуального цвета)
- HSL/OKLCH литералы напрямую в компонентах

Любой цвет — только через `var(--token-name)`.

---

## 2. Правило №2 — Два уровня токенов

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

## 3. Правило №3 — Алгоритм при создании/редактировании файла

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

## 4. Правило №4 — Структура :root в HTML-файле

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

## 5. Правило №5 — Реестр токенов

После каждого создания нового токена — обновить файл `docs/tokens/color-tokens-registry.md`:

```markdown
| Token | Level | Value (light) | Value (dark) | Used in |
|-------|-------|---------------|--------------|---------|
| --core-neutral-x-0 | core | #ffffff | — | bg-base-main |
| --bg-base-main | semantic | core-neutral-x-0 | core-neutral-x-90 | template.html |
```

Если файл не существует — создать его.

---

## 6. Стоп-правила и их уровни

Уровни — по `conformance-levels.md`. Цвет — единственная категория значений,
где литерал имеет уровень `must`: он не меняется при смене темы, и компонент
перестаёт быть переносимым между продуктами и режимами.

| Уровень | Правило | Нарушение | Правильно |
|---|---|---|---|
| `must` | Цвет задан токеном | `color: #333` | `color: var(--text-primary)` |
| `must` | Цвет задан токеном, включая прозрачность | `border: 1px solid rgba(0,0,0,0.06)` | `border: 1px solid var(--line-default)` |
| `must` | Semantic-токен назван по назначению | `--bg-white` | `--bg-base-main` |
| `must` | Semantic-токен ссылается на Core, а не на литерал | `--bg-card-main: #f7f7f7` | `--bg-card-main: var(--core-neutral-x-5)` |
| `should` | Компонент ссылается на Semantic, не на Core | `background: var(--core-jasper-55)` | `background: var(--bg-accent-main)` |
| `should` | Semantic-токен без числа в имени | `--text-14` | `--text-label` |

> Четыре правила из шести — `must`, и это исключение из общей картины
> корпуса. Причина в том, что все четыре ломают темизацию: литерал остаётся
> прежним в тёмном режиме, имя по значению начинает врать в первом же
> режиме с другим цветом, а semantic-токен со значением вместо ссылки не
> переключается вообще.
>
> Два оставшихся — про слоёность и именование. Они делают систему хуже, но
> не ломают её: компонент работает и переносится.

---

## 7. Самопроверка перед коммитом

Перед каждым коммитом, затрагивающим токены, — пройти чеклист:

- [ ] Все токены с цветовым значением → находятся в color-группе (`:root` Color section)
- [ ] Таблица типографики содержит только: font-family, font-size, font-weight, line-height, letter-spacing
- [ ] Ни один typography-токен не содержит значение цвета
- [ ] Ни один space-токен не содержит значение цвета
- [ ] Новые токены добавлены в `color-tokens-registry.md` (если цветовые)
- [ ] `[data-theme="dark"]` содержит только semantic-overrides, не core-токены
- [ ] Core palette step order: higher step number = darker color.  
      Если step 65 выглядит светлее step 55 — значения инвертированы, исправить до коммита.  
      Правило: step 0 = `#ffffff`, step 100 = `#000000`, монотонно темнее.
- [ ] Alpha token format в display/docs: показывать как `#HEX · N%`, никогда как `rgba()` syntax.  
      `rgba()` допустим только внутри `:root` как фактическое CSS-значение.  
      Любой UI, который показывает значение человеку, конвертирует в формат hex + percent.
- [ ] Typography tokens не содержат color values.  
      Если значение токена — HEX, `rgba`, или color keyword — он принадлежит color-группе, не typography.  
      Перенести до коммита.

Если хотя бы один пункт не выполнен — коммит не делать, исправить сначала.

---

## 8. Changelog

- **1.1.0** — 2026-09-21. Стоп-правила переведены на уровни соответствия.
  Четыре из шести — `must`: все они ломают темизацию. Слоёность и число в
  имени — `should`.
- **1.0.1** — 2026-09-20. guide-lint: нормализация формы — строка
  статуса, нумерация разделов, раздел Changelog.
- **1.0.0** — предыдущие версии до введения раздела; история — в git.
