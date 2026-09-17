# Design System

## Проект
Дизайн-система для iOS, Android и Web — единая кодовая база на Kotlin,
Compose Multiplatform (CMP). Раздельные нативные стеки (SwiftUI/UIKit,
React/TypeScript) не используются.

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

## Границы продуктов — обязательно к соблюдению

Репозиторий содержит ДВА независимых продукта. Не смешивай их код, ветки, коммиты, зависимости и деплой.

### Token Comparator
- Назначение: Figma-плагин для scan, comparison, принятия решений и proposal в общий registry
- Расположение: tools/figma-token-comparator/
- Backend: standalone Vercel-проект aid-registry-api (Root Directory: tools/figma-token-comparator/server)
- Production URL: https://aid-registry-api.vercel.app

### Presentbook
- Назначение: web-витрина и review-среда токенов/компонентов
- Расположение: pages/driver-color-tokens/
- Vercel-проект: aid-ds

### Жёсткая граница
Изменения в Token Comparator и aid-registry-api НЕ должны требовать инфраструктуру Presentbook и НЕ должны иметь возможность случайно сломать production Presentbook. Контуры физически и инфраструктурно разделены.

### Правила веток и деплоя
- Push в feature branch → Vercel Preview deployment, production alias не меняется
- Merge/push в main → Vercel Production deployment
- npm run build обновляет только локальный dist/ — это НЕ равно production deployment backend

### Роли и git-полномочия

Principal Designer (человек) принимает design-, mapping-, review- и release-решения.

Claude сам решает, что и когда коммитить и как разложить работу по веткам —
но только если уверен, что не заденет другую задачу и другой продукт.
При любом сомнении — останавливается и спрашивает.

Claude делает сам, без спроса:
- коммиты и выбор, что попадает в какой коммит
- создание веток и разнесение работы по веткам
- push в feature-ветку (это Preview deployment, production не затрагивается)
- откат собственных незакоммиченных правок

Claude обязан спросить до действия:
- merge или push в `main` — это production deployment
- production promote любого продукта
- force-push, удаление веток и worktree
- откат или перезапись незакоммиченной работы, которую Claude не создавал
- изменение Vercel-конфигов, зависимостей, CI
- задача, которая задевает оба продукта сразу

Если изменение подходит к границе между продуктами — остановиться и спросить,
даже если на вид всё безопасно.

### Источники истины
- decisions-registry.json — canonical registry решений
- GitHub PR body — ТОЛЬКО human-readable review-проекция, не источник истины
- main — source of truth для Presentbook, но не равно production автоматически

### Обязательная проверка перед любым изменением
Перед тем как трогать файлы, ветки или деплой, подтверди явно:
1. К какому из двух продуктов относится задача
2. Какую ветку и какой Vercel-проект это затрагивает
3. Что изменение не пересекает границу между контурами
Если задача выглядит так, что затрагивает оба продукта — остановись и спроси Principal Designer.
