# Platforms

## Web (React)
Токены через CSS-переменные: background: var(--button-background-default)
Слоты: <Button leading={<Icon />}>Label</Button>

## iOS (SwiftUI)
Токены: .background(DSTokens.button.background.default)
Touch target: минимум 44×44pt

## Android (Compose)
Токены: background = DSTheme.tokens.button.background.default
Touch target: минимум 48×48dp

## Кросс-платформенно
Слоты: leading, trailing, content, header, footer, title, subtitle, action
Disabled: opacity 40%, неинтерактивен на всех платформах
Варианты: .primary, .secondary, .ghost — одинаково на всех платформах

## Статус
⚠️ Замени заглушки на реальные соглашения проекта.
