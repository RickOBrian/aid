---
name: token-comparator-typography-feature
scope: perplexity-internal
metadata:
  version: "0.9.0"
  owner: design-system-team
  status: active
  updated: "2026-09-11"
description: >
  ВНУТРЕННИЙ рабочий контекст Perplexity для задачи добавления текстовых
  стилей (типографики) в Figma-плагин Token Comparator (продукт Driver).
  НЕ выгружать в репозиторий, НЕ отдавать Cursor напрямую.
---

# Token Comparator — Typography Feature Context (internal)

> **Статус: active · Phase 3 завершена · найден regression-риск, требует фикса перед Phase 4 · 2026-09-11**

---

## 0. Назначение задачи

Продукт: **Driver**. Категория **Typography** добавляется к **Colors**
без потери функционала. Переключение категорий — на вкладке сканирования,
результаты — раздельные таблицы.

---

## 1. Принятые решения — без изменений с версии 0.8.0 (#1–17). См. предыдущие версии для полного списка.

---

## 2. Implementation — статус фаз

| Фаза | Статус |
|---|---|
| Phase 1 (Data layer) | Готово. PAT-тест не выполнен |
| Phase 1b (Settings copy) | Готово |
| Phase 2 (Comparator) | Готово. Typecheck OK |
| Phase 3 (UI + wiring) | **Готово 2026-09-11. Typecheck OK. НАЙДЕН REGRESSION-РИСК — см. §3** |
| **Phase 3.5 (URGENT FIX)** | **Требуется перед Phase 4 — см. §3** |
| Phase 4 (Propose + backend) | не начата, ждёт Phase 3.5 |
| Phase 5 (Verification) | не начата — блокирована PAT |
| Phase 6 (Release) | не начата |

### Файлы Phase 3

`src/comparators/types.ts` (structuralDriftDetected, category? на
StoredDecision), `src/lib/scanner.ts`, `src/lib/storage.ts`
(LIBRARY_TEXT_STYLES_CACHE, countPendingProposalsByCategory,
clearPendingProposalsForCategory), `src/messages.ts`, `src/code.ts` (wiring),
`src/ui.html` (#tc-category-segment, два results-блока), `src/ui.ts`
(category toggle, confirm-диалог, typography table + сортировка).

Таблицы разделены через toggle двух независимых DOM-блоков
(`#tc-results-block-colors` / `#tc-results-block-typography`), не
общий re-render schema. mappingHistory hash — новый префикс
`typography|text-style|…` у типографики, коллизий с цветом нет.
`clearPendingProposalsForCategory()` удаляет только pending, не submitted.

---

## 3. КРИТИЧНЫЙ REGRESSION-РИСК — требует фикса перед Phase 4

**Обнаружено в Открытых вопросах Phase 3:** `handleLoadLibrary()` тянет
Variables (цвет) и Text Styles (типографика) в одном `Promise.all()`. Если
запрос Text Styles упадёт (а он **сейчас реально падает** — PAT не имеет
нужных scope, см. §4), **упадёт весь `handleLoadLibrary()`, включая цвет**.

Это ломает уже работающую функцию Colors для всех текущих пользователей.

**Решение: Phase 3.5 — отдельный quick-fix до Phase 4.**
Fetch цвета и Text Styles должны быть изолированы. При недоступности
Text Styles: Typography scanning корректно отключается с понятным
сообщением об ошибке, Colors продолжает работать.

---

## 4. Действующий операционный блокер

PAT в окружении не обновлён. Нужны `file_content:read` +
`library_content:read` в дополнение к `file_variables:read`. Три независимых scope.

Это прямая причина regression-риска (§3): без фикса в §3
отсутствие PAT будет ронять весь плагин для цвета тоже.

---

## 5. Решения по открытым вопросам Phase 3

| # | Вопрос Cursor | Решение |
|---|---|---|
| Q(p3)1 | Префикс `typography\|` в hash — риск несовпадения при будущих pending | Не проблема — propose для типографики не подключён (Phase 4) |
| Q(p3)2 | Propose/apply для typography — Phase 4 | Подтверждено |
| Q(p3)3 | Export/Print для typography | **Вынесено за scope этой фичи** |
| Q(p3)4 | structuralDriftDetected не отображается в UI | Остаётся метаданным без UI |
| Q(p3)5 | handleLoadLibrary падает целиком | **Phase 3.5, обязателен перед Phase 4** |

---

## 6. Ограничения и non-goals

- Export/Print для типографики — вне scope этой фичи.
- `handleLoadLibrary()` не должен иметь общей точки отказа между Colors и Typography.

---

## Changelog

- **0.9.0 — 2026-09-11.** Phase 3 отчёт. Регрессион-риск по `Promise.all()`. Phase 3.5 до Phase 4. Export/Print — за scope.
- **0.8.0 — 2026-09-11.** Phase 2 отчёт.
- **0.7.0 — 2026-09-11.** Phase 1 отчёт, PAT-блокер.
- **0.6.1 — 2026-09-10.** Файл помечен как внутренний.
- **0.1.0–0.6.0 — 2026-09-10.** Инициализация, Discovery, design review.
