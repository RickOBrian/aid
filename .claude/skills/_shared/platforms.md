# Platforms

Особенности реализации компонентов на каждой платформе.

---

## Web (React)

- API компонента — Props interface в TypeScript
- Токены через CSS-переменные: `background: var(--button-background-default)`
- Слоты: `<Button leading={<Icon />}>Label</Button>`
- Touch target: минимум 44×44px

## iOS (SwiftUI)

- API: `struct [ComponentName]View: View`
- Токены через DSTokens extension: `.background(DSTokens.button.background.default)`
- Слоты через `@ViewBuilder` closure или параметр типа `AnyView`
- Touch target: минимум 44×44pt

## Android (Compose)

- API: `@Composable fun [ComponentName](...)`
- Токены через DSTheme: `background = DSTheme.tokens.button.background.default`
- Слоты через `@Composable` lambda параметры
- Touch target: минимум 48×48dp

---

## Кросс-платформенные правила

- Имена слотов одинаковы на всех платформах: `leading`, `trailing`, `content`, `header`, `footer`, `title`, `subtitle`, `action`
- Варианты одинаковы: `.primary`, `.secondary`, `.ghost` — на всех платформах
- Disabled: opacity 40%, неинтерактивен на всех платформах

---

> ⚠️ Замени заглушки на реальные соглашения проекта перед мержем первого скилла.
