---
destination: skills/_shared/
name: ds-import-json
metadata:
  version: "1.4.0"
---

# Скилл: ds-import-json

Импорт JSON-файлов с токенами из папки `ds-import/json/` в структуру продукта.
Один раунд уточняющих вопросов — на файл целиком, не на каждый токен внутри.

---

## Запуск

Триггер: пользователь вызывает скилл `ds-import-json`.

1. Открыть папку `ds-import/json/`.
2. Если файлов нет — сообщить об этом и завершить.
3. Если файлов несколько — обработать по очереди, один файл = один раунд вопросов.

---

## Шаг 1 — превью файла

Перед вопросами показать пользователю краткое превью:
- имя файла
- количество токенов внутри
- первые 3-5 имён токенов как пример

Это нужно, чтобы пользователь отвечал на вопросы про файл осознанно, а не вслепую.

---

## Шаг 2 — вопросы по файлу (один раунд)

Задать все вопросы сразу, не по одному:

1. Тип токенов: Core (цвета/spacing/typography) или Semantic? Если структура файла явно смешанная (есть и raw hex, и семантические имена) — предупредить об этом отдельно и предложить разделить на два импорта.
2. Статус: stable (соответствует правилам token-rules.md) или legacy (перенос как есть, без валидации)?
3. Продукт: показать список существующих продуктов (папок в tokens/) + опцию "новый продукт".

Если пользователь выбрал legacy — не спрашивать deviation вручную. Скилл сам должен прогнать токены из файла против правил skills/_shared/token-rules.md (дефисная нотация, отсутствие чисел в Semantic-именах, отсутствие прямого hex в Core и т.п.) и предзаполнить поле deviation для каждого токена, где нарушение найдено.

---

## Шаг 3 — обработка конфликтов имён

Перед записью проверить, существуют ли токены с такими же именами в целевой папке продукта (core/, semantic/ или legacy/).

Если конфликт найден — показать список конфликтующих имён (старое значение vs новое) и спросить один раз для всего файла:
- обновить все существующие значения новыми
- оставить старые, пропустить конфликтующие
- решить по каждому конфликту отдельно (только если конфликтов немного, до 5)

---

## Шаг 4 — создание продукта (если новый)

Если выбран "новый продукт":
1. Запросить имя продукта.
2. Создать структуру:
tokens/{product}/
core/
semantic/
legacy/
stories/{product}/
tokens/
components/
3. Создать заглушку stories/{product}/components/Welcome.stories.tsx с текстом "Компоненты появятся здесь" — чтобы раздел продукта не выглядел пустым в React Storybook (:6006) до первого компонента.
4. Добавить продукт в `docs/storybook/_products.json` и секцию в `docs/storybook/_storybook-nav.json` (Tokens + Components).

---

## Шаг 5 — запись токенов

Записать токены в целевой файл (core/colors.json, semantic/colors.json, legacy/legacy-tokens.json — в зависимости от ответов шага 2) в формате:

[
{
"name": "color-blue-500",
"value": "#0057FF",
"valueDark": "#0033AA",
"status": "stable",
"refactorNeeded": false,
"deviation": ""
}
]

Для Figma-экспорта с секциями `Light` / `Dark` (как `color-sem.json`):
- `value` — Light-режим
- `valueDark` — Dark-режим (обязательно, даже если совпадает с Light)
- Не складывать Dark в `deviation` — только структурные нарушения DS

Частичный сбой: если часть токенов в файле невалидна (пустое значение, битый JSON-объект) — не блокировать импорт всего файла. Пропустить битые записи, продолжить с валидными, и отчитаться в конце (см. Шаг 8).

---

## Шаг 6 — очистка исходного файла

После успешной записи — удалить обработанный файл из ds-import/json/.

Перед удалением — закоммитить изменения в git:
git add tokens/{product}/... stories/{product}/...
git commit -m "import: add {N} tokens to {product} ({type}, {status})"

Коммит обязателен до удаления исходника — иначе при ошибке импорта нет возможности восстановить исходные данные.

---

## Шаг 7 — обновление таблицы токенов в Storybook

**Канонический вывод — static System Storybook** (docs-server, порт **8000**):

1. Обновить запись продукта в `docs/storybook/_products.json` (пути к JSON-файлам core/semantic/legacy).
2. Убедиться, что секция продукта есть в `docs/storybook/_storybook-nav.json` (Overview, Tokens → Colors / Typography, Components → Overview).
3. Страницы подхватят изменения автоматически:
   - `docs/storybook/product.html?product={product}` — хаб продукта
   - `docs/storybook/product-colors.html?product={product}` — таблица цветовых токенов
   - `docs/storybook/product-typography.html?product={product}` — витрина типографики (если есть `tokens/{product}/legacy/typography-styles.json`)
   - `docs/storybook/product-components.html?product={product}` — хаб компонентов

Токены со статусом legacy — с бейджем LEGACY и tooltip из поля deviation.

**React Storybook (:6006)** — опционально, только если уже есть `stories/{product}/tokens/*.stories.tsx`. Не создавать новый Storybook и не дублировать конфигурацию.

Перед импортом проверить наличие единственной конфигурации:
- `.storybook/main.ts`, `.storybook/preview.tsx` в корне репо
- `package.json` → `"storybook": "storybook dev -p 6006"`
- Кастомный аддон `.storybook/addons/ui-kit-sidebar/register.ts` не трогать без явного запроса.

---

## Шаг 8 — отчёт пользователю

В конце обработки всех файлов вывести:
- сколько файлов обработано
- сколько токенов залито по каждому продукту, с разбивкой stable/legacy
- список пропущенных невалидных записей с причиной (если были)
- ссылки на localhost для каждой изменённой страницы (по одной на продукт):
  - `http://localhost:8000/docs/storybook/product.html?product={product}`
  - `http://localhost:8000/docs/storybook/product-colors.html?product={product}`
  - `http://localhost:8000/docs/storybook/product-typography.html?product={product}` (если импортирована типографика)
  - `http://localhost:8000/docs/storybook/product-components.html?product={product}`

Запуск static Storybook: `./scripts/start-docs.sh 8000` или `python3 scripts/docs-server.py 8000`.

---

## Лог импорта

Каждый импорт логировать в memory/ds-import-log.jsonl (append, одна строка — один файл):

{"date": "2026-07-16", "file": "colors-export.json", "product": "ui-kit-a", "type": "semantic", "status": "legacy", "tokensImported": 24, "tokensSkipped": 1, "owner": "user"}

---

## Changelog

- 1.4.0 — dual-mode импорт: поле `valueDark` для Light/Dark Figma-экспорта; не писать Dark в `deviation`.
- 1.3.0 — Typography: `typography-styles.json`, `product-typography.html`, пункт Tokens → Typography в nav.
- 1.2.0 — продукт Storybook: `_products.json`, хаб `product.html`, Components `product-components.html`, секции продуктов в nav.
- 1.1.0 — вывод токенов в static System Storybook (:8000): `product-colors.html`, `_product-tokens.json`, секция Products в nav.
- 1.0.0 — первая версия: импорт JSON по одному раунду вопросов на файл, обработка конфликтов, создание продукта, git-коммит перед очисткой, лог импорта.
