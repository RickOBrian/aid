# Token Rules

Трёхуровневая система токенов дизайн-системы.

---

## Три уровня

### Primitive
Сырые значения без смысловой нагрузки. Не используются в компонентах напрямую.

```
color.blue.500    → #0057FF
shape.corner.8    → 8px
spacing.16        → 16px
```

### Semantic
Назначение токена, не привязанное к конкретному компоненту.

```
color.action.primary   → color.blue.500
color.text.primary     → color.neutral.900
color.surface.default  → color.neutral.0
```

### Component
Токен конкретного компонента. Ссылается только на semantic, никогда на primitive напрямую.

```
button.background.default  → color.action.primary
button.corner              → shape.corner.8
button.padding.horizontal  → spacing.16
```

---

## Правила

- Цепочка: Component → Semantic → Primitive. Прыжок через уровень — блокер.
- Захардкоженное значение (`background: #0057FF`) вместо токена — блокер.
- Нет нужного semantic — отметить в спеке: ⚠️ нужно добавить токен: [предлагаемое имя].
