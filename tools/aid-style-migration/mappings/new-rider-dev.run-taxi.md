# Прогон: «✅ Taxi for friends» (2026-11-02)

Маппинг — `new-rider-dev.final.md` (с ответами §8). Правки в Figma — по «да» arturuxui
(«да, с дубликатом»).

- Оригинал `2314:16494` не тронут.
- Перенос сделан на копии **«✅ Taxi for friends — Switched Styles»** `4770:4437`
  (секция `4770:4438`), как у пар GEO / Service / Where.
- Не тронуты (в копии): Sender 372 `4770:4698`, 427 `4770:5024`, Alert `4770:4686` и
  `4770:5234`, Push `4770:5023`, Bottom sheet `4770:4685` (бывший мастер: при
  клонировании страницы он стал экземпляром оригинала), аннотации `description` и
  стрелки секции, а также status bar, home indicator, клавиатуры, Map и Car внутри экранов.
- Обработано 18 экранов, 2244 узла. Пробный прогон и боевой совпали по счётчикам.

## Что заменено (сводно)

| Группа | Замен |
|---|---|
| Цвет: стили `[… [day]/…]`, Pastel, `Day / …` → color-sem | ≈ 330 |
| Цвет: старые переменные (Theme, Color, Variable collection) → color-sem | ≈ 190 |
| Цвет: сырые hex по §1.4 (фон фрейма, NavBar, Tab, пины, Divider) | 47 |
| Текстовые стили: старые копии → новые с тем же именем | ≈ 130 |
| Текстовые стили: Caption/caption → Captions/Caption 2; Title/title2 → Outstanding/Title-title2 (NRD) | 23 |
| Сырые шрифты → стили (NRD - Body, Caption 1 CAP, Body 3, Title 4) | 34 |
| Эффекты: [day] Medium/Large → Shadows/*; Shadow 6 → Bottom Sheet; Brand button снята | 28 |
| Отступы: Gaps/SPx2 → space-8; Gaps/SPx3, Отступы/SPx3 → space-12 | 117 |

Скриншоты после каждой группы экранов — вид совпадает с оригиналом; круг Radius
в пине — Icon/Accent со слоем 12 %.

## Оставлено — список на решение

| Что | Кол-во | Почему |
|---|---|---|
| [Background [day]/Secondary] на векторах | 6 | пробел, правило 1 (§8.2) |
| [Background [day]/Attention] на векторе | 1 | Icon/Attention не сверен |
| [Background [day]/Constant Dark Secondary] на векторе | 1 | пробел |
| {Color/tx-bg/level −1 muted} на векторе | 1 | правило 1 |
| {Color/tx-accent/grey/primary} на «Shadow» | 5 | пробел (§8.2) |
| [Icons day/Secondary Pressed] на обводке | 2 | Icon/Secondary без скоупа STROKE |
| Текст со смешанными заливками | 8 | разные цвета в одном тексте, руками |
| SF Pro Text Regular 17/24 | 4 | нет в маппинге |
| SF Pro Text Regular 12/16 | 4 | нет в маппинге |
| Google Sans Regular 17/20 — «3 заказа» в Selector | 4 | нет в маппинге (и его белый текст сырым) |
| SF Pro Text Semibold 17/20 капителью — «поиск», «2 заказа» | 2 | стиль сбросил бы капитель |
| Сырые #100f25 / #2f2e43 | 25+25 | они внутри Car Class / Car Icon — Car не трогаем |
| Overlay #000@0.3 на прямоугольнике | 1 | пробел (§8.2) |
| [.blur tiny], [Shadows/Large Air] | 15, 2 | вне маппинга / уже новый |

## Дальше

- Решить строки списка выше (кандидаты — в ответе чата).
- Проверить копию глазами в Figma; если всё хорошо — решить, оставлять пару
  «оригинал ↔ Switched» или заменить оригинал.
