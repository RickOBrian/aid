# Design System

## Проект
Дизайн-система для Web (React), iOS (SwiftUI), Android (Compose).

## Правила токенов
@skills/_shared/standards/token-rules.md

## Платформы
@skills/_shared/standards/platforms.md

## Git workflow
@skills/_shared/protocols/git-workflow.md

## Скиллы
Скиллы живут в `skills/<имя-скилла>/SKILL.md`. Вызов: `/имя-скилла`.
Личные настройки каждого: `CLAUDE.local.md` в корне репо (не в Git).

## Раскладка документов
`skills/_shared/` — канонический source of truth, разложен по жанрам:

| Папка | Что внутри | Публикуется |
|---|---|---|
| `standards/` | Правила для артефактов дизайн-системы | да |
| `protocols/` | Как работаем мы: git, скиллы, импорт, форма гайдов | нет |
| `architecture/` | Технические описания конкретных фич | нет |
| `notes/` | Черновики и заметки | нет |

Жанр каждого файла продублирован во frontmatter полем `metadata.kind` —
инструменты отбирают документы по нему, не по пути.

Версии и статусы всех стандартов: `standards-registry.json`.
Форма документа: `skills/_shared/protocols/guide-template.md`.
Проверка корпуса: `node scripts/check-docs.mjs`.

## Design System vs UI Kit

This repository defines **standards**, not a specific UI Kit.
Token values (hex colors, spacing numbers, radii) in guides and examples
are illustrative — they show valid structure, not required values.
A UI Kit built on this DS may use any values, provided it follows
the naming conventions, hierarchy rules, and architecture defined here.

Never treat a concrete value from a guide as a constraint on implementation.
Treat it as a valid example of the pattern.

## Language

Always respond in Russian, regardless of the language used in the prompt or file content.
Exception: respond in another language only if the user explicitly requests it in that message.

## Color token rules (auto-applied)

When working with any *.html, *.css, or *.scss file:
- Read `skills/_shared/standards/no-hardcode-color-protocol.md` before writing any color value
- No hardcoded colors allowed: no HEX, no rgba(), no named colors
- Every color must use var(--semantic-token), where semantic token references a core token
- If a needed token doesn't exist — create it following the protocol, then use it
- After creating new tokens — update `docs/tokens/color-tokens-registry.md`
  (create the file if it doesn't exist)
