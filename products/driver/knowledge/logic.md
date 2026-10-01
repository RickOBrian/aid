# Driver — логика построения (знание о продукте v0, 2026-09-30)

Выведено из эталона библиотеки (`components/*.anatomy.txt`) и токенов
(`tokens/color-sem.tsv`), сверено со стандартами ДС
(`skills/_shared/standards/semantic-color-tokens.json`,
`component-states.json`). Цель — не привести Driver к идеальной системе, а
уметь для каждого элемента сказать, как он должен быть построен, и
отличить ошибку дизайнера от решения библиотеки.

Уровень уверенности: **эталон** — так в библиотеке; **вывод** — правило,
которое объясняет эталон во всех найденных случаях; **проверить** —
гипотеза, нужен взгляд Principal Designer.

---

## 1. Токены

### Семейства

| Семейство Driver | Что это | Стандарт ДС |
|---|---|---|
| `Bg/*` | поверхности (фон экрана, подложки, оверлей, служебные) | `bg-*` |
| `Texts/*` | текст | `text-*` |
| `Icons/*` | иконки **и мелкие цветные фигуры** (круги, точки, прогресс, фон аватара) — см. §3 | `icon-*` |
| `Strokes/*` | обводки и линии | `line-*` |
| `Buttons/*`, `Fields/*`, `Controls/*`, `Messages/*` | фоны компонентов | `bg-component-*` |
| `Pastels/*` (29) | декоративная палитра: иконки опций, аватары, плашки комментариев, тегов | нет прямого слота (декор / доп. палитра) |
| `Boosters/*` (8) | фоны карточек бустеров | нет прямого слота |
| градиенты (`Silver`, `Gold`, `Motivation`, `Bottom`) | стили заливки, скрытая коллекция | нет |

У токенов заданы **области применения** (`TEXT_FILL`, `SHAPE_FILL`,
`STROKE_COLOR`, `FRAME_FILL`) — это машинный признак семейства, плагин
может опираться на него, а не на имя. Исключение: `Controls/*` —
`ALL_SCOPES`.

### Модификаторы (эталон + вывод)

| Модификатор | Поведение по значениям | Где стоит в эталоне | Стандарт |
|---|---|---|---|
| — (без модификатора) | меняется вместе с темой, как фон | на `Bg/Primary`, `Buttons/Secondary`, `Buttons/Floating`, `Messages/Default` | базовый токен |
| `Inverted` | меняется **противоположно** теме | на **инверсных** плашках: `Buttons/Primary` (тёмная днём, светлая ночью), `Bg/Primary Inverted` | `-inverse` (§7) |
| `Light Ind` | всегда светлый (белый) | на плашках, **всегда тёмных или цветных**: `Buttons/Positive`, `Bg/Actions`, `Messages/Action`, `Messages/Push`, `Messages/Positive/Warning/Attention`, `Icons/Special` | `-static` (§9), по смыслу `-static-dm` |
| `Dark Ind` | всегда тёмный | на плашках, **всегда светлых**: `Pastels/Parchment`, `Pastels/Nebula`, `Pastels/Olive`, `Boosters/Custom` | `-static` (§9), по смыслу `-static-lm` |
| `Deep` | темнее базового, статичный | прогресс / нажатие акцентной кнопки (`Buttons/Positive Deep` — таймер) | состояние (pressed/progress) |
| `Disabled`, `Inactive` | приглушённый | неактивное состояние (см. §2 R2) | `-disabled` |

Итог: слово **Inverted у Driver = inverse стандарта**, **Ind = static**.
Это совпадает со словарём, который плагин вывел сам по значениям
(«Inverted» ≈ inverse, «Light/Dark Ind» ≈ static).

---

## 2. Правила построения

**R1. Цвет содержимого выбирается по поведению плашки под ним** (вывод,
держится во всех компонентах):

| Плашка | Текст / иконка на ней | Примеры эталона |
|---|---|---|
| меняется как фон | `Texts/Primary`, `Icons/Primary` | `default` Secondary, `fab/secondary`, `floating`, `alert`, чат `Left` |
| инверсная | `… Inverted` | `default`/`wide`/`big` Primary, `fab/primary`, `Tab` Active, выбранный день/неделя в `selector` |
| всегда тёмная / цветная | `… Light Ind` | `full` и `slider` (зелёные), `bar/slider` и `bar/button` Balance на `Bg/Actions`, чат `Right` на `Messages/Action`, `push`, `StatusInfo`, аватар-буквы на `Pastels/Azure` |
| всегда светлая | `… Dark Ind` | общий комментарий на `Pastels/Parchment`, `tag` на `Pastels/Nebula`, тариф в карточке `card`, бустер `Custom` |

Отсюда проверка для макета: **токен содержимого должен соответствовать
поведению плашки**. Это ровно то, что аудит ловил как «в другой теме
поменяет цвет, а плашка — нет».

**R2. Состояния** (эталон):
- Неактивно (`Active=False`): фон `Buttons/Disabled` (у зелёных —
  `Buttons/Positive Disabled`), текст `Texts/Disabled`, иконка
  `Icons/Inactive`.
- Ошибка: всё семейство `Warning` — обводка `Strokes/Warning`, текст и
  подсказка `Texts/Warning`, иконка `Icons/Warning`, курсор `Icons/Warning`.
- Фокус поля: обводка `Strokes/Primary`; неактивное поле —
  `Strokes/Secondary`, заблокированное — `Strokes/Tertiary`.
- Загрузка: лоадер `Controls/Checked`.
- Разрушительное действие: у Primary — фон `Buttons/Warning`; у Secondary и
  Transparent — фон свой, а текст и иконка `Texts/Warning`, `Icons/Warning`.

**R3. Выбор** (эталон): выбранный сегмент, день, неделя —
`Buttons/Primary` + `Texts/Primary Inverted`; невыбранный —
`Buttons/Disabled` + `Texts/Primary`. Сегментированные табы — трек
`Bg/Secondary`, активный сегмент `Buttons/Floating`. Чекбокс и
переключатель — только `Controls/*`.

**R4. Иконки по смыслу** (эталон + описания токенов):
- `Icons/Informative` — справочные (подъезд, шеврон в строке, «закрыть» в инструкции);
- `Icons/Accent` — сёрдж, мотивация, заголовочные иконки;
- `Icons/Special` — очередь, аэропорт;
- `Icons/Positive` — «готово», стрелка слайдера, пройденный шаг;
- **иконки опций** (детское кресло, животные, некурящий, оплата картой,
  автобусная полоса) — цветные `Pastels/*`, одна пастель на иконке и на
  обводке бейджа (`medium/color`). Это не статус.

**R5. Бейджи** (эталон):
- `small` (подъезд) — обводка `Strokes/Secondary`, иконка `Icons/Informative`, текст `Texts/Tertiary`;
- `reward` (мотивация, сёрдж) — обводка `Strokes/Informative`, иконка `Icons/Accent`, текст `Texts/Primary`;
- `medium/mono` — `Strokes/Primary`, `Icons/Primary`;
- `notification`, `Counter`, `mini_notification` — красные (`Icons/Warning`, `Fields/Warning`) с `Light Ind` содержимым.

**R6. Комментарии** (эталон): комментарий к адресу — `Messages/Default` +
`Texts/Primary`; общий комментарий к заказу — `Pastels/Parchment` +
`Texts/Primary Dark Ind` (подпись над ним — `Texts/Secondary`).

**R7. Линии** (эталон): разделители — `Strokes/Separator`; линия маршрута
между адресами — `Strokes/Informative`.

---

## 3. Эталон против стандарта — находки для библиотеки

Это решения библиотеки, **не ошибки дизайнеров**: макет, повторяющий
эталон, прав. Плагин показывает их как «предложение библиотеке».

1. **Иконные токены как заливки фигур**: фон `counter`, `done`, `amount`,
   фон аватара в `bar/slider`, `notification`, `progress`, фон
   `Tooltips` (`Icons/Secondary`), указатель `Demand`, круг «не отмечено» в
   `Selection Control`. По стандарту фон — `bg-*`.
2. **Текстовые токены не на тексте**: трек переключателя в `tariff` —
   `Texts/Secondary Dark Ind`; обводки кнопок `bottombar` —
   `Texts/Primary Inverted`.
3. **`Buttons/Disabled` как фон невыбранного** сегмента, дня, тарифа — по
   смыслу это не «недоступно», а «не выбрано».
4. **`Messages/Action` как фон выбранного `selector`** — токен сообщений на
   кнопке выбора.
5. **Проверить:** заголовок `center` с `Color=Dark` и `bar/button`
   `Type=Main` — плашка `Bg/Actions` (тёмная в обеих темах), а текст и
   иконка `… Inverted`. Ночью `Texts/Primary Inverted` = `#000000de` на
   `#1f1f23` — контраст ≈ 1,2, не читается. По R1 должно быть `Light Ind`
   (как в `bar/button` `Type=Balance`).
6. **Дубль компонента**: в `tariff` переключатель «до двери» нарисован
   внутри карточки (`Switch / ON`) со своими токенами, а не взят из
   компонента `switch` (`Controls/*`).
7. **Цвета без токена**: `statusbar` и `StatusInfo` (`#00000026`,
   `#ffffff47`), `bottombar` (`#000000`) — системные элементы, вероятно,
   допустимо.
8. **Документация**: у компонентов почти нет описаний; имена наборов
   неуникальны (`default`, `small`, `big`, два `Tabs`, два `pin_round`).
   Для плагина это значит: опознавать компонент по ключу, а не по имени.

---

## 4. Что уже подтверждено эталоном из аудита макетов

| Находка аудита | Эталон | Вердикт |
|---|---|---|
| Стрелка слайдера `Buttons/Positive` (30) и `Icons/Positive` (30) | `slider` → `Icons/Positive` | `Buttons/Positive` — **ошибка дизайнера** (переопределение) |
| Подпись зелёной кнопки `Texts/Primary Inverted` / `primary widget white` | `full`, `slider` → `Texts/Primary Light Ind` | **ошибка дизайнера** (R1) |
| Иконка чипа Secondary / Informative | `small` → `Icons/Informative` + `Strokes/Secondary` | в макетах оба вида отступают: `Icons/Secondary` + `Strokes/Secondary` (перекрашена иконка) и `Icons/Informative` + `Strokes/Tertiary` (перекрашена обводка). **Проверить**: это два задуманных вида (тогда их нет в библиотеке) или ошибки |
| Плитки «Мотивация», «Рейтинг» залиты `Buttons/Secondary` | в библиотеке нет — нарисовано в макете | нужен компонент или правило |
| Круг чекбокса `Icons/Primary Inverted`, галочка — токен кнопки | `Selection Control`, `tariff` — так и есть | **решение библиотеки** (§3.1) |

---

## 5. Что дальше

1. **Макеты против эталона**: для каждого инстанса — чем он отличается от
   эталона своего варианта (переопределённый цвет, скрытые или добавленные
   части), что нарисовано вручную вместо существующего компонента.
   Результат — каталог отступлений с частотой.
2. **Машинный слой**: `rules.json` из этого документа (R1–R7, §3) и
   `components/*.json` (анатомия) — плагин сверяет макет с эталоном.
3. **Карты** (страницы Pins, Layers) и **иконки** (Driver Icons) — позже.
4. **Presentbook**: показ знания о продукте — вместе с миграцией токенов.
