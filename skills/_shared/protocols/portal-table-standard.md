---
destination: skills/_shared/protocols/
name: portal-table-standard
metadata:
  version: "1.0.0"
  kind: protocol
  status: stable
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Стандарт таблиц и layout-токенов веб-портала aid-ds.
---


# Portal Table Standard

> Статус: Stable · v1.0.0 · обновлено 2026-09-20

---

Портал: `pages/driver-color-tokens/`. Канон стилей — `dsChangelogTable.ts`.

## 1. Обязательно для нового table-раздела токенов

> **Исключение:** `IconsPage.tsx` — grid UX; чеклист ниже **не применяется** (см. раздел «IconsPage»).

1. **Таблица данных**
   - Импорт: `DS_TOKEN_TABLE_STYLE` из `./dsChangelogTable`
   - Разметка: `<div className="…-table-wrap ds-token-table-wrap">` + `<table className="ds-token-table">`
   - Заголовки колонок — на русском; регистр задаёт CSS (`text-transform: uppercase`), не пиши CAPS в JSX
   - **Запрещено** задавать для `thead th` локальные `font-size`, `color`, `letter-spacing`, `text-transform` — только через `DS_TOKEN_TABLE_STYLE`

2. **Changelog**
   - `DS_CHANGELOG_TABLE_STYLE` + `<ChangelogTable />` (см. `protocols/gates/token-change-gate.md`)
   - Таблица changelog: классы `ds-token-table dctp-table dctp-changelog-table`

3. **Интерактив**
   - Копирование: `DS_COPYABLE_STYLE`, класс `ds-copyable`
   - Toast: `DS_TOAST_STYLE`, класс `ds-toast`

4. **Layout-токены**
   - Цвета, отступы, радиусы — из `DS_PORTAL_LAYOUT_TOKENS`; не хардкодить `#ebedf0`, `#f5f5f5` и т.п. в новых стилях без причины
   - Шапка страницы: `<DsPageHeader />` + `DS_PAGE_HEADER_STYLE`

## 2. Эталонные страницы

| Раздел | Файл | Таблица |
|--------|------|---------|
| Colors | `DriverColorTokensPage.tsx` | `ds-token-table` + col-классы |
| Typography | `TypographyPage.tsx` | nested `ds-token-table` |
| Shadows | `ShadowsPage.tsx` | nested `ds-token-table` |
| Radius | `RadiusPage.tsx` | flat `ds-token-table` |
| Spacing | `SpacingPage.tsx` | flat `ds-token-table` |
| Icons | `IconsPage.tsx` | grid UX — **не** table-page |

## 3. IconsPage (grid UX)

`IconsPage.tsx` — grid UX (сетка иконок, context menu, selection). Страница **не обязана**
соответствовать table-page checklist (`DS_TOKEN_TABLE_STYLE`, `ds-token-table-wrap`,
`ds-token-table`). Обязательны changelog и header по `protocols/gates/token-change-gate.md`:
`ChangelogTable`, `loadTokenChangelog`, `DS_CHANGELOG_TABLE_STYLE`, `<DsPageHeader />`.

## 4. Чеклист агента (таблицы)

> Только для table-страниц. Для `IconsPage.tsx` — см. «IconsPage (grid UX)».

- [ ] `DS_TOKEN_TABLE_STYLE` в `PAGE_STYLE`
- [ ] `ds-token-table-wrap` / `ds-token-table` в JSX
- [ ] Нет дублирующих правил `thead th` в page-local CSS
- [ ] `DS_COPYABLE_STYLE` / `DS_TOAST_STYLE` (или алиасы через shared-файл)
- [ ] Колонки названы по смыслу: «Название», «Значение», «Токен», «Превью» и т.д.

---

## 5. Changelog

- **1.0.0** — 2026-09-20. Перенесено из .cursor/rules/ds-portal-table-standard.mdc. Cursor объявлен легаси; правило переписано инструмент-нейтрально и живёт теперь там, где его читает рабочий агент. Прежний файл оставлен указателем.
