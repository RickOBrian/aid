# persefona-1 (AID-48, #344) — черновик токенов Persefona

От: Designer · Persefona, 2026-10-23. Кому: Standards · Persefona (приёмка имён и
значений до сборки в Figma). Основание: аудит
`changes/persefona-1-audit-2026-10-23.md` (PR #350), ответы PD 2026-10-23
«1б 2а 3а 4а 5а 6а 8а», папка Figma `638447836`.

Статус: **черновик принят Standards · Persefona по §6 (2а 3а 4б 5а 6а 7а, комментарий
в PR #354), кроме вопроса 1 — цвет акцента у PD.** В Figma ничего не создано. Версий и
changelog нет — они появляются на `release-gate`.

Имена — те, что принял Standards · Persefona: Core `color-<palette>-<step>`,
`spacing-*`, `shape-corner-*`, `type-*`; Semantic `text-*`, `bg-*`, `line-*`,
`icon-*`, `radius-*`, `shadow-*`; статусы — по `semantic-color-tokens-guide` (§6, п. 4б).
Расхождение общих гайдов о Core-цвете Standards · Persefona передал в Standards (§6, п. 3).

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
| Семейство | `type-family-sans-1` = Google Sans; `type-family-mono-1` = Google Sans Code (§6, п. 2а) |
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
| `text-muted` | `neutral-400` | только несмысловое: плейсхолдер, разделитель «·» (§6, п. 6а) |
| `text-disabled` | `neutral-300` | отключённое |
| `text-inverse` | `neutral-0` | текст на `bg-inverse-main` и `bg-accent-main` (добавлен, п. 5а) |
| `text-accent` | `neutral-900` | ссылки (с подчёркиванием — цветом не отличаются, п. 1) |
| `icon-primary` | `neutral-900` | добавлен, п. 5а |
| `icon-secondary` | `neutral-500` | шевроны, меню (добавлен, п. 5а) |
| `icon-disabled` | `neutral-300` | добавлен, п. 5а |
| `icon-inverse` | `neutral-0` | добавлен, п. 5а |
| `icon-accent` | `neutral-900` | |
| `bg-surface-main` | `neutral-0` | страница, карточка |
| `bg-surface-muted` | `neutral-100` | шапка таблицы, превью |
| `bg-surface-zebra` | `neutral-50` | зебра, блок кода |
| `bg-inverse-main` | `neutral-900` | тост |
| `bg-accent-main` | `neutral-900` | метка «accent», активный сегмент |
| `line-default` | `neutral-150` | рамка 1px, разделитель |
| `line-hover` | `neutral-200` | рамка при наведении |

Статусы (PD 4а) — один набор на пять смыслов. Имена — по `semantic-color-tokens-guide`
(§6, п. 4б):

- фон — `bg-accent-status-<x>-main`, как в гайде;
- текст — `text-<x>`: гайд уже называет так `text-error` и `text-success`;
- рамка — `line-accent-status-<x>`: в гайде рамок статусов нет, имя повторяет ветку
  фона, без уровня `-main`, как `line-accent`. Это толкование «по той же логике» —
  на приёмке подтвердить.

**Расширение набора статусов гайда:** гайд знает `attention`, `success`, `warning`,
`error`. Persefona добавляет `info` и `neutral`; `attention` не использует.

| Смысл | Фон | Рамка | Текст | Метка в #344 | Changelog |
|---|---|---|---|---|---|
| `success` | `bg-accent-status-success-main` → `green-50` | `line-accent-status-success` → `green-200` | `text-success` → `green-700` | success | добавлено |
| `warning` | `bg-accent-status-warning-main` → `yellow-50` | `line-accent-status-warning` → `yellow-300` | `text-warning` → `yellow-800` | pending | исправлено |
| `error` | `bg-accent-status-error-main` → `red-50` | `line-accent-status-error` → `red-200` | `text-error` → `red-700` | error | удалено |
| `info` ⁺ | `bg-accent-status-info-main` → `blue-50` | `line-accent-status-info` → `blue-200` | `text-info` → `blue-700` | info | изменено |
| `neutral` ⁺ | `bg-accent-status-neutral-main` → `neutral-100` | `line-accent-status-neutral` → `neutral-150` | `text-neutral` → `neutral-600` | neutral | устарело |

⁺ — расширение. Точка changelog — цвет `text-<x>`. Сопоставление «вид значения» → смысл
уточню при сборке блоков, на имена токенов оно не влияет.

### 3.2 Радиусы

| Токен | → Core | Где |
|---|---|---|
| `radius-s` | `shape-corner-4` | метка, ячейка |
| `radius-m` | `shape-corner-8` | карточка, таблица |
| `radius-l` | `shape-corner-12` | крупный контейнер |
| `radius-xl` | `shape-corner-16` | модалка (добавлен, п. 5а) |
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
| `label-xs-caps` | 11/16 · 500 · 0_6 · ВЕРХНИЙ РЕГИСТР | 4 рецепта → один; в шапке таблицы — цвет `text-primary` (п. 7а) |
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
| `text-secondary` на `bg-surface-muted` | 4.23 | ✗ — поэтому подпись шапки таблицы — `text-primary` (п. 7а) |
| `text-muted` на `bg-surface-main` | 2.68 | ✗ — только несмысловое (п. 6а) |
| статусы, текст на своём фоне | 4.79 – 5.84 | ✓ |
| `text-neutral` на `bg-accent-status-neutral-main` | 5.68 | ✓ (поэтому `neutral-600`) |
| `text-inverse` на `bg-accent-main` | 13.9 | ✓ |

`text-disabled` по WCAG не проверяется.

**Правило (п. 6а, проверяется на приёмке сборки): `text-muted` не используется для
смыслового текста** — заголовков, подписей, значений, описаний, текста меток. Только
плейсхолдер, разделитель и другое, без чего смысл не теряется. Смысловой второстепенный
текст — `text-secondary`.

## 6. Вопросы и решения

Решения Standards · Persefona 2026-10-23: **2а 3а 4б 5а 6а 7а** (комментарий в PR #354).
Открыт только вопрос 1 — у PD через Standards · Persefona. Рекомендация отмечена ★.

1. **Цвет акцента Persefona** (PD 1б выбрал «свой акцент», значения нет).
   а) ★ графит `#2D2C2E` (`neutral-900`): цвета продуктов остаются единственными
   цветными метками и не спорят с акцентом; ссылка отличается подчёркиванием.
   Минус: `text-accent` = `text-primary`.
   б) свой цвет — бирюза `#0E7C7B` (5.0:1 на белом), далеко от синего Driver и
   фиолетового Rider; заводится палитра `teal` (50 / 600).
   **Открыт:** Standards · Persefona спрашивает PD, ответ передаст сюда.
2. **Моно-шрифт в Figma.** Системного стека в Figma нет.
   а) ★ Google Sans Code — та же семья, что 5а;
   б) JetBrains Mono; в) Roboto Mono (Roboto уже есть в портале).
   Портал при переводе на токены берёт тот же шрифт (задача Developer · Persefona).
   **Решено: 2а** — Google Sans Code (OFL).
3. **Противоречие общих гайдов о Core-цвете.** `naming-conventions` (Alpha 1.3.1):
   `color-<palette>-<step>`, шаги 0–900, палитра `neutral` разрешена.
   `core-color-tokens-guide` (Stable 1.2): `<palette>-<step>` без `color-`, шаги
   0–100, имена палитр без смысла (`neutral` запрещено), альфа `<palette>-<step>-a<N>`.
   Черновик — по принятым именам (первое). а) ★ так и оставить, противоречие —
   в Standards; б) перейти на второе до сборки (переименование после релиза — MAJOR).
   **Решено: 3а.** Противоречие — в Standards. Если до первого релиза Standards выберет
   `core-color-tokens-guide`, переименуем без MAJOR.
4. **Статусы — имя.** Принято `bg-status-<x>`; `semantic-color-tokens-guide`
   кладёт статус в `bg-accent-status-<x>-main` и знает attention / success /
   warning / error (нет info, neutral). а) ★ оставить `bg-status-*` как отход
   Persefona, оформить через Standards; б) перейти на `bg-accent-status-*`.
   **Решено: 4б** — по стандарту, `info` и `neutral` — расширение (§3.1).
5. **Добавить в список имён:** `text-inverse`, `icon-primary`, `icon-secondary`,
   `icon-disabled`, `icon-inverse`, `radius-xl`. а) ★ да; б) другое имя — какое.
   **Решено: 5а.**
6. **`text-muted` не проходит AA** (2.68). Он светлее вторичного, а вторичный уже
   на границе (4.61), — поднять его без слияния нельзя.
   а) ★ оставить по PD 3а, но только для нетекстового и необязательного
   (плейсхолдер, разделитель «·»), смысловой текст — `text-secondary`; б) слить с
   `text-secondary` — нужен новый ответ PD на 3.
   **Решено: 6а** — правило записано в §5.
7. **Подпись в шапке таблицы** — `text-secondary` на `bg-surface-muted` даёт 4.23.
   а) ★ подпись шапки — `text-primary`, отличие держит `label-xs-caps`;
   б) шапка таблицы на `bg-surface-zebra` (4.4 — всё ещё ✗); в) принять как есть.
   **Решено: 7а.**

## 7. Что дальше

1. Ответ PD на вопрос 1 → окончательная приёмка Standards · Persefona.
2. Сборка в Figma: файл Persefona в папке `638447836`, коллекции → стили → 5 блоков.
3. Pending-записи и `figmaFiles` в `products/persefona/product.json` — с созданием
   файла (раскладка — PR Standards · Persefona).
