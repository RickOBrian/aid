# Token Rules

Трёхуровневая система токенов.

## Primitive
Сырые значения, не используются в компонентах напрямую.
color.blue.500 → #0057FF
shape.corner.8 → 8px
spacing.16 → 16px

## Semantic
Назначение токена, не привязан к компоненту.
color.action.primary → color.blue.500
color.text.primary → color.neutral.900
color.surface.default → color.neutral.0

## Component
Конкретный компонент. Ссылается только на semantic.
button.background.default → color.action.primary
button.corner → shape.corner.8
button.padding.horizontal → spacing.16

## Правила
- Component → Semantic → Primitive. Прыжок через уровень = блокер.
- Захардкоженное значение вместо токена = блокер.
- Нет нужного semantic — отметить: ⚠️ нужно добавить токен: [имя]
