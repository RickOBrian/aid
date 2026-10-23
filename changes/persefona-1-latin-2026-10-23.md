# persefona-1 — латиница в файле Kit: таблица «было → станет»

- Дата: 2026-10-23
- Задача: persefona-1 (AID-48), шаг 1 §10.3 `products/persefona/rules/persefona-figma-pages.md` 0.4.1 (87690db)
- Файл: Persefona `YDjPxFrW1yXqm9RzBGQXuc` (папка `638447836`)
- Исполнитель: Designer · Persefona; приёмка — Standards · Persefona
- Статус: **на приёмку. В файле ничего не переименовано.**

Снято из файла 2026-10-23 скриптом (только чтение): 13 страниц, 9 секций,
6 компонентов, 4 свойства-варианта и 10 текстовых и булевых свойств,
слои внутри компонентов. Экземпляров в файле: Метка 52, Заголовок раздела
35, Шапка страницы 14, Ячейка таблицы 12.

## 1. По какому стандарту сверено

| Что | Правило | Источник |
|---|---|---|
| Имя компонента | Role + Entity + Qualifier, Role первым; `Badge` — исключение; `TableCell` — канон | `naming-conventions` §4, `ds-component-architecture-guide` §9 |
| Свойство-вариант | Имя свойства — с заглавной (`Variant=Primary` → prop `variant="primary"`); значение в Figma — с заглавной, в коде — lowercase | `naming-conventions` §4 «Variants, states, slots» |
| Имя свойства-варианта | Концепт из таблицы: `Variant`, `State`, `Size`; иное — своё имя, если концепта нет | там же |
| Текстовое свойство, слой-слот | Имя из канона слотов: `title`, `subtitle`, `content`, `header`, `footer`, `action`, … | `ds-component-architecture-guide` §9 «Слоты Structural View» |
| Item-level | `Text`, `Icon`, `Image` без `Item` | `naming-conventions` §4 |

Булевых свойств стандарт не называет — предложение ниже, вопрос 3.

## 2. Компоненты

Ключи компонентов при переименовании не меняются (переименование узла
ключ не трогает).

| Узел | Было | Станет | Сейчас |
|---|---|---|---|
| 4:19 | `Метка` | `Badge` | можно |
| 4:31 | `Ячейка таблицы` | `TableCell` | можно |
| 4:32 | `Таблица сравнения` | `TableComparison` | можно |
| 4:20 | `Заголовок раздела` | `HeaderSection` ¹ | ждёт Standards |
| 4:61 | `Карточка блока` | `CardBlock` ¹ | ждёт Standards |
| 4:70 | `Шапка страницы` | `HeaderPage` ¹ | ждёт Standards |

¹ Role `Header` и `Card` нет в таблице Role-семей — до ответа Standards
не переименовываются (#362 0.4.1 §10.3). Их свойства — тоже: свойства
переименовываю тем же проходом, что и компонент, чтобы не делать два
прохода по экземплярам.

## 3. Свойства и значения

### 3.1 Badge (4:19)

| Было | Станет | Тип | Код |
|---|---|---|---|
| `Тон` | `Tone` | вариант | `tone` |
| `neutral` | `Neutral` | значение | `neutral` |
| `warning` | `Warning` | значение | `warning` |
| `success` | `Success` | значение | `success` |
| `error` | `Error` | значение | `error` |
| `info` | `Info` | значение | `info` |
| `vivid-soft` | `Vivid Soft` ★ | значение | `vivid-soft` |
| `vivid` | `Vivid` | значение | `vivid` |
| `accent` | `Accent` | значение | `accent` |
| `Текст` | `Text` | текст | `text` |

`Tone`, а не `Variant`: тон — статус и акцент, а не вид оформления
кнопки; у Badge нет второго вида. Вопрос 1.

### 3.2 TableCell (4:31)

| Было | Станет | Тип | Код |
|---|---|---|---|
| `Тип` | `Variant` | вариант | `variant` |
| `шапка` | `Header` | значение | `header` |
| `обычная` | `Default` | значение | `default` |
| `было` | `Before` | значение | `before` |
| `стало` | `After` | значение | `after` |
| `Текст` | `Text` | текст | `text` |

`Тип` — по смыслу вид ячейки, концепт `Variant`. Вопрос 2.

### 3.3 TableComparison (4:32)

Свойств нет.

### 3.4 HeaderSection (4:20) — ждёт Standards

| Было | Станет | Тип | Код |
|---|---|---|---|
| `Заголовок` | `Title` | текст | `title` (слот) |
| `Подзаголовок` | `Subtitle` | текст | `subtitle` (слот) |
| `Есть подзаголовок` | `Show Subtitle` ★ | булево | `showSubtitle` |

### 3.5 CardBlock (4:61) — ждёт Standards

| Было | Станет | Тип | Код |
|---|---|---|---|
| `Для инженера` | `Show Footer` ★ | булево | `showFooter` |
| `Текст для инженера` | `Footer Text` ★ | текст | `footer` (слот) |

Зона «Для инженера» — нижняя зона карточки, слот `footer`. Смысл «для
инженера» остаётся в подписи слоя `Label` («Для инженера», по-русски).
Вопрос 4.

### 3.6 HeaderPage (4:70) — ждёт Standards

| Было | Станет | Тип | Код |
|---|---|---|---|
| `Заголовок` | `Title` | текст | `title` (слот) |
| `Описание` | `Subtitle` ★ | текст | `subtitle` (слот) |
| `Как читать` | `How to Read` | текст | `howToRead` |
| `Содержание` | `Contents` | текст | `contents` |
| `Есть «как читать»` | `Show How to Read` | булево | `showHowToRead` |

`How to Read` и `Contents` — не слоты канона, а содержимое шапки
служебной страницы (#362 §5). Вопрос 5.

## 4. Слои внутри компонентов

Имена слоёв — латиницей, текст в слоях — по-русски.

| Компонент | Было | Станет |
|---|---|---|
| Badge, TableCell | `Текст` | `Text` |
| TableComparison | `Строка` | `Row` |
| HeaderSection, CardBlock, HeaderPage | `Заголовок` (текст) | `Title` |
| HeaderSection, CardBlock | `Подзаголовок` | `Subtitle` |
| CardBlock | `Содержимое` | `Content` |
| CardBlock | `Заглушка` | `Placeholder` |
| CardBlock | `Для инженера` (рамка) | `Footer` |
| CardBlock | `Метка строки` | `Label` |
| CardBlock | `Текст` | `Text` |
| HeaderPage | `Метки` | `Badges` |
| HeaderPage | `Заголовок` (рамка) | `Header` |
| HeaderPage | `Описание` | `Subtitle` |
| HeaderPage | `Как читать` | `How to Read` |
| HeaderPage | `Содержание` | `Contents` |
| HeaderPage | `Заголовок содержания` | `Contents Title` |
| HeaderPage | `Пункты` | `Contents Items` |

Имя слоя-экземпляра совпадает с компонентом (`Заголовок раздела` в
CardBlock, `Метка` в HeaderPage, `Ячейка таблицы` в TableComparison) —
меняется вместе с компонентом.

## 5. Страницы и секции

| Узел | Было | Станет | Сейчас |
|---|---|---|---|
| стр. 4:2 | `Обложка` | `Cover` | можно |
| стр. 23:22 | `Цвет` | `Colors` | можно |
| секция 45:92 | `Цвет Core` | `Colors Core` | можно |
| секция 45:111 | `Цвет Semantic` | `Colors Semantic` | можно |
| стр. 24:313, секция 31:124 | `Отступы и радиусы` | `Space and Radius` | можно |
| стр. 24:459, секция 31:186 | `Типографика` | `Typography` | можно |
| стр. 24:614, секция 31:225 | `Тени` | `Shadows` | можно |
| стр. 29:164, секция 30:22 | `Метка` | `Badge` | можно |
| стр. 29:165, секция 31:296 | `Таблица сравнения` | `TableComparison` | можно |
| стр. 0:1, секция 31:244 | `Заголовок раздела` | `HeaderSection` | с компонентом |
| стр. 29:163, секция 31:265 | `Карточка блока` | `CardBlock` | с компонентом |
| стр. 29:166, секция 31:315 | `Шапка страницы` | `HeaderPage` | с компонентом |
| стр. 7:22 | `Архив` | `Archive` | можно |
| секция 31:334 | `Арт-дирекция · предложения · 2026-10-23` | `Art direction · proposals · 2026-10-23` | вопрос 6 |
| секция 43:74 | `Пример · Справочник цветов (Driver) · 2026-10-23` | `Example · Color reference (Driver) · 2026-10-23` | вопрос 6 |
| секция 31:42 | `Цвет Core · плитки · до 2026-10-23` | `Colors Core · tiles · before 2026-10-23` | вопрос 6 |
| секция 31:85 | `Цвет Semantic · плитки · до 2026-10-23` | `Colors Semantic · tiles · before 2026-10-23` | вопрос 6 |
| стр. 29:167, 29:168 | `---` | без изменений | — |

Содержание обложки (гиперссылки на секции) и подписи «← Обложка» в шапках
обновляю тем же проходом: это тексты-навигация, они называют страницы.

## 6. Связанные места

- `changes/persefona/pending/component-persefona-1-blocks.json` —
  `artifact` и `figma.components`: новые имена тем же PR; там же
  `Таблица · было | стало` → `TableComparison`, `Обложка` → `HeaderPage`,
  `componentsPage` 0:1 устарел (страница на компонент) — заменю на
  `componentPages`.
- Док ChangelogTable (ветка `persefona/1-changelog-table`): `ChangelogTable`
  → `TableChangelog`, `ChangelogBadge` → `BadgeChangelog` (Role первым),
  свойство `Change` и значения `Added`, `Removed`, `Edited` — без
  изменений; вопрос 4 там снят решением PD; ссылки `Метка/Ячейка
  таблицы/Заголовок раздела` → `Badge/TableCell/HeaderSection`.
- Слои-контракт плагина (`Changelog Table Body`, `Changes Row`,
  `__Changelog Badge`, `{separator}`) — не трогаю.

## 7. Как проверю после переименования

1. Ключи 6 компонентов — те же, что в §2 до прохода.
2. Все 113 экземпляров: значения свойств и тексты-переопределения до и
   после совпадают (снимок скриптом до, сверка после).
3. Ни одного слоя с кириллицей в имени внутри компонентов; ни одной
   страницы и секции с кириллицей, кроме отложенных ¹.

## 8. Вопросы на приёмку

1. Имя свойства тона у Badge: ★а `Tone` · б `Variant`.
2. Свойство ячейки: ★а `Variant` (`Header/Default/Before/After`) · б
   `Type` (как было по смыслу).
3. Булевы свойства: ★а `Show <Слот>` (`Show Subtitle`) · б `Has <Слот>`.
4. CardBlock: ★а слот `Footer` (`Show Footer`, `Footer Text`) · б по
   смыслу `Show Engineer Note`, `Engineer Note`.
5. HeaderPage, «Описание»: ★а `Subtitle` (слот канона) · б `Description`.
6. Секции архива: ★а латиницей, как в §5 · б оставить: архив не читает
   никто, и это следы решений с датой.
7. Значение `vivid-soft` в Figma: ★а `Vivid Soft` · б `VividSoft` · в
   lowercase для всех значений, как в токенах (тогда расходится с
   `Variant=Primary` из стандарта).
