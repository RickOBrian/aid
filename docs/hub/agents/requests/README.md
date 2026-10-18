# AID · AI Ops · Requests — путь запроса и типовые вопросы

> Черновик · AID-19 · 2026-10-18. Приложение к карточке `../requests.md`.
> Полная работа — после канала бота (AID-22) и входящих сервиса задач (AID-16).

## Путь запроса

1. **Приём.** Дизайнер пишет боту: продукт, тип (вопрос, баг, правка, новый компонент), текст, ссылка на Figma.
2. **Доставка.** Бот кладёт запрос во входящие Requests в сервисе задач, не в публичный GitHub.
3. **Захват.** Один экземпляр отмечает «взял» в журнале; второй не отвечает.
4. **Разбор.**
   - вопрос по стандартам — отвечаю сам по гайду со ссылкой на раздел; ответа в гайде нет — так и говорю и передаю пробел в Standards;
   - баг или правка библиотеки — задача в Tasks;
   - предложение токена или компонента — передаю в Standards, решение не обещаю;
   - вопрос к PD — в `/plan` Штаба.
5. **Передача.** В Tasks: продукт, предложенный исполнитель, ссылка на запрос, суть без личных данных.
6. **Ответ и закрытие.** Автору — ответ или «передано, задача <имя>»; когда задача «готово» — второй ответ и закрытие. Сроков не называю.

## Чего не хватает

- От бота (AID-22): контракт приёма, структурные поля запроса (Q-09), канал ответа автору, статусы запроса.
- От сервиса задач (AID-16): входящие, журнал, «взял» без двойного захвата, связь «задача ↔ запрос», ключ AI-инженера (#200).
- От стандартов: знания о продуктах на `main` нет (см. ниже).

## Токены, общее
- Какие уровни токенов, можно ли брать Core в компоненте? → `token-rules.md` §1–4, §6
- Нужного semantic-токена нет — что делать? → `token-rules.md` §8; процесс — `protocols/gates/token-change-gate.md`
- Как назвать токен, дефис или точка? → `naming-conventions.md` §3; `token-rules.md` §2–3
- Что значат `-static`, `-staticwm`, `-ios`, `-android`? → `token-rules.md` §3; `semantic-color-tokens-guide.md` §9
- Day/Night у Driver = light/dark? → `token-rules.md` §10
- Что блокирует, а что «дистанция» (must/should)? → `conformance-levels.md`; `token-rules.md` §6

## Цвет
- Можно ли HEX/rgba в вёрстке? → `no-hardcode-color-protocol.md` §1, §6
- Какой bg: base / card / overlay / modal / accent? → `semantic-color-tokens-guide.md` §4, §6–7
- primary / secondary / tertiary для text и icon? → `semantic-color-tokens-guide.md` §5, §8
- Палитра Core, прозрачные ступени → `core-color-tokens-guide.md` §3–7
- Цвет текста — это типографика? → `token-rules.md` §7

## Пространство и радиусы
- padding или inset, оси `-h-`/`-v-` → `semantic-space-tokens-guide.md` §3
- Какой gap между элементами → `semantic-space-tokens-guide.md` §4
- `radius-*` или `shape-corner-N` → `semantic-space-tokens-guide.md` §5; `core-space-tokens-guide.md` §4
- `spacing-N` или `size-N` → `core-space-tokens-guide.md` §2–3, §3.4

## Типографика
- Body или Label → `semantic-typography-tokens-guide.md` §8
- Состав стиля, обязателен ли трекинг → `token-rules.md` §5; `semantic-typography-tokens-guide.md` §11
- Bold в label → `semantic-typography-tokens-guide.md` §7.1; `token-rules.md` §5
- Стиль ссылки → `semantic-typography-tokens-guide.md` §13
- Шкалы size / lh / weight / tracking, единицы платформ → `core-typography-tokens-guide.md` §3–8

## Компоненты
- Уровень компонента (Item / Surface View / Structural View / Layout) → `ds-component-architecture-guide.md` §1–7
- Категория компонента → `component-categories-guide.md` §2–4
- Имя компонента, варианты, слоты → `naming-conventions.md` §4; `ds-component-architecture-guide.md` (слоты)
- Обязательное в API и составе → `component-standards.md` §5–7
- Состояния и их комбинации → `component-states-guide.md` §1–5
- Hover на мобиле, focused, loading vs skeleton → `component-states-guide.md` §6–7
- Хочу новый компонент → lookup, `protocols/gates/component-gate.md`; не обещаю, передаю в Standards

## Платформы и доступность
- Имена пропов React / SwiftUI / Compose → `platforms.md` §2–5
- Минимальный touch target и исключения продукта → `platforms.md` §6
- Контраст, фокус, клавиатура → `accessibility.md` §3–5

## Версии и changelog
- patch / minor / major → `semver-guide.md` §3; `versioning-strategy.md` §3–5 (пересекаются — канон уточняется в Standards)
- Как писать changelog → `changelog-guide.md`
- Как тестировать токены и компоненты → `testing-strategy.md` §4–5

## Не для дизайнеров
`anatomy-annotation-standard.md`, `radius-preview-standard.md` — внутреннее Presentbook.

## «Как принято в продукте» (Rider, Driver)
Ответ Standards 2026-10-14: канонического знания о продуктах нет. У Driver
оно в ветке Style Migration, не на `main`, ждёт решения PD; у Rider нет
вовсе. Ответ автору: «канона по продукту нет» + ссылка на нужный стандарт
AID из списка выше. Своё не додумывать, ветку Style Migration как источник
не использовать. Пересмотреть, когда `products/<id>/knowledge/` появится
на `main`.
