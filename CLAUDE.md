# Design System

## Проект
Дизайн-система для Web (React), iOS (SwiftUI), Android (Compose).

## Правила токенов
@skills/_shared/token-rules.md

## Платформы
@skills/_shared/platforms.md

## Git workflow
@skills/_shared/git-workflow.md

## Скиллы
Скиллы находятся в `.claude/skills/`. Вызов: `/имя-скилла`.
Личные настройки каждого: `CLAUDE.local.md` в корне репо (не в Git).

## Важно
`skills/` — канонический source of truth. Редактировать только здесь.
`.claude/skills/` — рабочие копии для Claude Code. Не редактировать вручную.

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
- Read `skills/_shared/no-hardcode-color-protocol.md` before writing any color value
- No hardcoded colors allowed: no HEX, no rgba(), no named colors
- Every color must use var(--semantic-token), where semantic token references a core token
- If a needed token doesn't exist — create it following the protocol, then use it
- After creating new tokens — update `docs/tokens/color-tokens-registry.md`
  (create the file if it doesn't exist)
