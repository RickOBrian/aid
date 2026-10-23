# persefona-1 (AID-48, #344) — черновик токенов Persefona

От: Designer · Persefona, 2026-10-23. Кому: Standards · Persefona (приёмка имён и
значений до сборки в Figma). Основание: аудит
`changes/persefona-1-audit-2026-10-23.md` (PR #350), ответы PD 2026-10-23
«1б 2а 3а 4а 5а 6а 8а», папка Figma `638447836`.

Статус: **черновик, в Figma ничего не создано.** Версий и changelog нет — они
появляются на `release-gate`.

Имена — те, что принял Standards · Persefona: Core `color-<palette>-<step>`,
`spacing-*`, `shape-corner-*`, `type-*`; Semantic `text-*`, `bg-*`, `line-*`,
`icon-*`, `radius-*`, `shadow-*`. Где принятые имена расходятся с общими гайдами
AID — раздел 6, решать до сборки.

## 1. Коллекции Figma

| Коллекция | Уровень | Режимы | Что внутри |
|---|---|---|---|
| `persefona-core` | Core | нет | цвет, отступы, радиусы, типографика |
| `persefona-semantic` | Semantic | один режим `light` (PD 6а) | цвет, радиусы, ссылки только на Core |
| Текстовые стили `persefona/*` | Semantic | — | собраны из Core-типографики |
| Стили эффектов `persefona/*` | Semantic | — | `shadow-1`, `shadow-2` |

Режим `light` заведён явно, чтобы ночь позже добавлялась режимом, а не новой
коллекцией.

## 2. Core

### 2.1 Цвет

Непрозрачные значения вместо `rgba(0,0,0,.N)`: на белом они совпадают с порталом
пиксель в пиксель, на `#F5F5F5` чуть светлее альфы. Так снимается вопрос имени
альфа-токенов (раздел 6, п. 3), а контраст считается заранее.

| Токен | Значение | Откуда |
|---|---|---|
| `color-neutral-0` | `#FFFFFF` | поверхность |
| `color-neutral-50` | `#FAFAFA` | зебра, код |
| `color-neutral-100` | `#F5F5F5` | приглушённая поверхность |
| `color-neutral-150` | `#EBEDF0` | рамка |
| `color-neutral-200` | `#D0D4DC` | рамка hover (из двух `#D0D4DC` / `#D7DADE` — более заметная) |
| `color-neutral-300` | `#BDBDBD` | = `rgba(0,0,0,.26)` на белом, отключённый |
| `color-neutral-400` | `#9E9E9E` | = `.38`, приглушённый |
| `color-neutral-500` | `#757575` | = `.54`, вторичный |
| `color-neutral-600` | `#616161` | **новое**: текст нейтральной плашки (контраст, §5) |
| `color-neutral-900` | `#2D2C2E` | основной текст, инверсная поверхность, акцент (★ п. 1) |
| `color-green-50` | `#EEF8F1` | «Выпущено», фон |
| `color-green-200` | `#B9E6C9` | «Выпущено», рамка |
| `color-green-700` | `#1F7A3F` | «Выпущено», текст |
| `color-yellow-50` | `#FFF8E6` | «Ждёт», фон |
| `color-yellow-300` | `#F0D48A` | «Ждёт», рамка |
| `color-yellow-800` | `#8A6A00` | «Ждёт», текст |
| `color-red-50` | `#FDEFEF` | **новое**, по рецепту мягких плашек |
| `color-red-200` | `#F3C1C1` | **новое** |
| `color-red-700` | `#B3261E` | **новое** (вместо `#C62828` / `#D62347`) |
| `color-blue-50` | `#EEF4FF` | **новое** |
| `color-blue-200` | `#BCD0F7` | **новое** |
| `color-blue-700` | `#1F5BC4` | **новое** (вместо `#1565C0` / `#005AFF`); не синий Driver |

Палитр Driver и Rider нет. Шагов «про запас» нет: каждый шаг занят Semantic-токеном.

### 2.2 Отступы

`spacing-0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64` — все шаги из
`core-space-tokens-guide` (6 и 10 там разрешены в микрозоне, поэтому остаются).
`spacing-80` не нужен порталу — не заводится. Semantic-отступов в первой сборке нет:
блоки ссылаются на Core.

### 2.3 Радиусы (PD 2а)

`shape-corner-4`, `-8`, `-12`, `-16`, `-full` (9999). Значения 2, 3, 6, 10 уходят.

### 2.4 Типографика (PD 5а)

| Группа | Токены |
|---|---|
| Семейство | `type-family-sans-1` = Google Sans; `type-family-mono-1` — вопрос п. 2 |
| Размер | `type-size-11, 12, 13, 14, 16, 18, 28, 48` |
| Интерлиньяж | `type-lh-16, 20, 24, 36, 56` |
| Вес | `type-weight-400, 500, 600` (700 порталу не нужен в стилях первой сборки) |
| Трекинг | `type-tracking--1` (**новый** шаг, = −0.02em у 48), `type-tracking-0`, `type-tracking-0_6` (= .06em у 11) |

## 3. Semantic

### 3.1 Цвет

| Токен | → Core | Где |
|---|---|---|
| `text-primary` | `neutral-900` | основной текст |
| `text-secondary` | `neutral-500` | описания, мета |
| `text-muted` | `neutral-400` | подсказки (контраст — §5) |
| `text-disabled` | `neutral-300` | отключённое |
| `text-inverse` | `neutral-0` | **добавить**: текст на `bg-inverse-main` и `bg-accent-main` |
| `text-accent` | `neutral-900` | ссылки (с подчёркиванием — цветом не отличаются, п. 1) |
| `icon-primary` | `neutral-900` | **добавить** |
| `icon-secondary` | `neutral-500` | **добавить**: шевроны, меню |
| `icon-disabled` | `neutral-300` | **добавить** |
| `icon-inverse` | `neutral-0` | **добавить** |
| `icon-accent` | `neutral-900` | |
| `bg-surface-main` | `neutral-0` | страница, карточка |
| `bg-surface-muted` | `neutral-100` | шапка таблицы, превью |
| `bg-surface-zebra` | `neutral-50` | зебра, блок кода |
| `bg-inverse-main` | `neutral-900` | тост |
| `bg-accent-main` | `neutral-900` | метка «accent», активный сегмент |
| `line-default` | `neutral-150` | рамка 1px, разделитель |
| `line-hover` | `neutral-200` | рамка при наведении |

Статусы (PD 4а) — один набор на пять смыслов, `bg-status-<x>` / `line-status-<x>` /
`text-status-<x>`:

| Смысл | bg | line | text | Метка в #344 | Changelog | Вид значения |
|---|---|---|---|---|---|---|
| `success` | `green-50` | `green-200` | `green-700` | success | добавлено | число / цвет |
| `warning` | `yellow-50` | `yellow-300` | `yellow-800` | pending | исправлено | — |
| `error` | `red-50` | `red-200` | `red-700` | error | удалено | — |
| `info` | `blue-50` | `blue-200` | `blue-700` | info | изменено | ссылка |
| `neutral` | `neutral-100` | `neutral-150` | `neutral-600` | neutral | устарело | строка |

Точка changelog — цвет `text-status-<x>`. Сопоставление «вид значения» → смысл
уточню при сборке блоков, на имена токенов оно не влияет.

### 3.2 Радиусы

| Токен | → Core | Где |
|---|---|---|
| `radius-s` | `shape-corner-4` | метка, ячейка |
| `radius-m` | `shape-corner-8` | карточка, таблица |
| `radius-l` | `shape-corner-12` | крупный контейнер |
| `radius-xl` | `shape-corner-16` | **добавить**: модалка (PD 2а назвал 16, имени в списке нет) |
| `radius-pill` | `shape-corner-full` | плашка статуса |

### 3.3 Текстовые стили

| Стиль | Размер / lh · вес · трекинг | Было в портале |
|---|---|---|
| `display-l` | 48/56 · 500 · −1 | 48/56 · 500 · −0.02em |
| `heading-l` | 28/36 · 500 · 0 | 28/36 (32/40 на страницах управления — уходит) |
| `heading-m` | 18/24 · 500 · 0 | 18/24 (20/28, 22/28 · 600 в гайде — уходят) |
| `heading-s` | 16/24 · 500 · 0 | 16/24 (18/24 в хабе — уходит) |
| `body-m` | 14/20 · 400 · 0 | 14/20 (14/22 в гайде — уходит) |
| `body-s` | 13/20 · 400 · 0 | 13/20 и 13/16 |
| `label-s` | 12/16 · 500 · 0 | 12/16, 12/18, 11/14 |
| `label-xs-caps` | 11/16 · 500 · 0_6 · ВЕРХНИЙ РЕГИСТР | 4 рецепта → один |
| `code-m` | mono 13/20 · 500 · 0 | блоки кода |
| `code-s` | mono 12/16 · 500 · 0 | версии, инлайн-код |

Регистр — свойство стиля, не токен.

### 3.4 Тени

| Стиль | Значение | Заменяет |
|---|---|---|
| `shadow-1` | `0 8 24` чёрный 12% | меню, тост (16%) |
| `shadow-2` | `0 12 40` чёрный 14% | всплывающее, модалка, карточка входа (8%) |

## 4. Анкета `token-change-gate`

1. Артефакты: Persefona Colors/Core, Colors/Semantic, Spacing/Core, Radius/Core,
   Radius/Semantic, Typography/Core, Typography/Semantic, Effects/Shadows.
2. Тип: первый выпуск новых коллекций — по моей оценке 1.0.0 на `release-gate`.
3. Changelog: да, `tokens/persefona-<collection>-changelog.json` при первом релизе.
4. Черновик записи: `{ "kind": "added", "description": "Первая коллекция токенов Persefona из стилей Presentbook" }`.
5. Зависимости: Semantic ссылается только на Core Persefona; на Driver и Rider — нет.

Pending-записи в `changes/persefona/pending/` заведу при сборке, после приёмки
черновика.

## 5. Контраст (WCAG AA, текст 4.5:1)

| Пара | Контраст | |
|---|---|---|
| `text-primary` на `bg-surface-main` | 13.9 | ✓ |
| `text-secondary` на `bg-surface-main` | 4.61 | ✓ |
| `text-secondary` на `bg-surface-muted` | 4.23 | ✗ — подпись в шапке таблицы |
| `text-muted` на `bg-surface-main` | 2.68 | ✗ |
| статусы, текст на своём фоне | 4.79 – 5.84 | ✓ |
| `text-status-neutral` на `bg-status-neutral` | 5.68 | ✓ (поэтому `neutral-600`) |
| `text-inverse` на `bg-accent-main` | 13.9 | ✓ |

`text-disabled` по WCAG не проверяется.

## 6. Вопросы — одним списком

Ответ вида «1а, 2а, 3а…». Рекомендация отмечена ★.

1. **Цвет акцента Persefona** (PD 1б выбрал «свой акцент», значения нет).
   а) ★ графит `#2D2C2E` (`neutral-900`): цвета продуктов остаются единственными
   цветными метками и не спорят с акцентом; ссылка отличается подчёркиванием.
   Минус: `text-accent` = `text-primary`.
   б) свой цвет — бирюза `#0E7C7B` (5.0:1 на белом), далеко от синего Driver и
   фиолетового Rider; заводится палитра `teal` (50 / 600).
   Решение о цвете — PD; передать через Штаб или ответить здесь.
2. **Моно-шрифт в Figma.** Системного стека в Figma нет.
   а) ★ Google Sans Code — та же семья, что 5а;
   б) JetBrains Mono; в) Roboto Mono (Roboto уже есть в портале).
   Портал при переводе на токены берёт тот же шрифт (задача Developer · Persefona).
3. **Противоречие общих гайдов о Core-цвете.** `naming-conventions` (Alpha 1.3.1):
   `color-<palette>-<step>`, шаги 0–900, палитра `neutral` разрешена.
   `core-color-tokens-guide` (Stable 1.2): `<palette>-<step>` без `color-`, шаги
   0–100, имена палитр без смысла (`neutral` запрещено), альфа `<palette>-<step>-a<N>`.
   Черновик — по принятым именам (первое). а) ★ так и оставить, противоречие —
   в Standards; б) перейти на второе до сборки (переименование после релиза — MAJOR).
4. **Статусы — имя.** Принято `bg-status-<x>`; `semantic-color-tokens-guide`
   кладёт статус в `bg-accent-status-<x>-main` и знает attention / success /
   warning / error (нет info, neutral). а) ★ оставить `bg-status-*` как отход
   Persefona, оформить через Standards; б) перейти на `bg-accent-status-*`.
5. **Добавить в список имён:** `text-inverse`, `icon-primary`, `icon-secondary`,
   `icon-disabled`, `icon-inverse`, `radius-xl`. а) ★ да; б) другое имя — какое.
6. **`text-muted` не проходит AA** (2.68). Он светлее вторичного, а вторичный уже
   на границе (4.61), — поднять его без слияния нельзя.
   а) ★ оставить по PD 3а, но только для нетекстового и необязательного
   (плейсхолдер, разделитель «·»), смысловой текст — `text-secondary`; б) слить с
   `text-secondary` — нужен новый ответ PD на 3.
7. **Подпись в шапке таблицы** — `text-secondary` на `bg-surface-muted` даёт 4.23.
   а) ★ подпись шапки — `text-primary`, отличие держит `label-xs-caps`;
   б) шапка таблицы на `bg-surface-zebra` (4.4 — всё ещё ✗); в) принять как есть.

## 7. Что дальше

1. Приёмка черновика Standards · Persefona; вопрос 1 — у PD.
2. Сборка в Figma: файл Persefona в папке `638447836`, коллекции → стили → 5 блоков.
3. Pending-записи и `figmaFiles` в `products/persefona/product.json` — с созданием
   файла (раскладка — PR Standards · Persefona).
