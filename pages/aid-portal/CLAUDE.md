# Presentbook — чат портала

Витрина и среда ревью дизайн-системы AID: токены и компоненты продуктов,
гайды-стандарты, раздел «Инструменты» с плагином. Корневой `CLAUDE.md`
действует тоже — особенно разделы «Три продукта — три чата», «Стыки между
продуктами», «Гейты» и «Git-полномочия».

## Где работаю

- Папка чата — `~/Projects/aid-presentbook` (git worktree). Правлю только
  `pages/aid-portal/`. Всё остальное — чужие продукты: см. «Стыки» в
  корневом `CLAUDE.md`.
- Сайт — https://aidteam.pro, Яндекс Облако, каталог `presentbook` (ADR-038).
  Мерж в `main` выкладывает production: `.github/workflows/presentbook-yc.yml`.
  Каждый PR получает превью https://preview.aidteam.pro/pr-N/ (ссылка —
  комментарием в PR), при закрытии PR оно удаляется. Устройство, ресурсы и
  роли — `deploy/yc/README.md`.
- Ссылки и адрес страницы — только через `withBase()` и `currentAppPath()`
  (`base.ts`): превью живёт в `/pr-N/`, страж в `components/base.test.ts` не
  даст пропустить базу.
- Новую ветку — от свежего `origin/main`:
  `git fetch && git switch -c <ветка> origin/main`.
- Облако — только через `yc --profile presentbook`. Не выполнять
  `yc config list`, `yc config profile get`, `yc config get service-account-key`
  и не читать `~/.config/yandex-cloud/` — ни целиком, ни через `cut`/`grep`:
  закрытый ключ лежит в профиле многострочно. Если ключ всё же вывелся —
  сразу написать в Штаб. Секреты не выводить и не коммитить.
- Откат функции: `yc --profile presentbook serverless function version set-tag
  --id <версия> --tag prod` (метки `prod` и `pr-N` — `deploy/yc/README.md`).

## Вход в контекст

1. этот файл;
2. `JOURNAL.md` рядом — состояние, история, что открыто;
3. по задаче: `skills/_shared/protocols/presentbook-guide.md`,
   `component-page-baseline.md` (страница компонента),
   `portal-table-standard.md` (таблицы).

## Как устроен портал

- Vite + React, маршруты в `App.tsx` без префикса продукта; `/driver/…`
  и `/rider/…` снимаются в `resolveProductRoute` (`productRegistry.ts`).
  Хаб продукта — `/<продукт>` (`aidteam.pro/driver`). Старые адреса (`/`,
  `/tokens/colors`, `/driver/design-system`) при загрузке переписываются на
  канонические (`canonicalAppPath`, по умолчанию `driver`); внутренние ссылки
  строятся сразу канонически через `productPath`.
- Вход на сайт: `AuthGate.tsx` спрашивает `GET /api/session` и без сессии
  показывает форму; `api/login.ts` ставит подписанную cookie. Статика открыта,
  закрыт интерфейс (вариант 1а ADR-038). Секреты `BASIC_AUTH_*`,
  `AUTH_COOKIE_SECRET` — в Lockbox (`presentbook-auth`); не читать, не печатать,
  не коммитить. Локальный `npm run dev` функций не выполняет — вход там
  пропускается.
- Гайды: `guide-registry.json` → `sourcePath` в `skills/_shared/`;
  `scripts/build-guides.mjs` собирает их при `dev` и `prebuild`.
  `generated/` — производное, в git не хранится.
- Токены и changelog: канон — корневые `tokens/`; `scripts/sync-token-changelogs.mjs`
  копирует их в `pages/aid-portal/tokens/`. Копию не править.
- Инструменты: `tools-registry.json`, страницы `ToolsHubPage.tsx` и
  `TokenComparatorPluginPage.tsx`.
- Версия, дата и «Что нового» на странице плагина — `api/plugin-version.ts`:
  последний релиз спрашивает у GitHub `releases/latest`, историю всех версий
  читает из `data/plugin-history.json` в бакете (`PLUGIN_HISTORY_URL`) — её
  собирает CI (`deploy/yc/plugin-history.ts`, задача «Changelog плагина»):
  из Облака список релизов GitHub шёл дольше 9 с. Ответ 10 минут держит
  экземпляр функции (`cachedPluginVersion` в `deploy/yc/handler.ts`; неполный
  ответ — 1 минуту, CDN перед функцией нет). Changelog внизу страницы строит
  `pluginChangelog.ts`, описание релиза разбирает `releaseNotes.ts` — без HTML,
  раздел «Установка» пропускается. Read-only `GITHUB_RELEASES_TOKEN` — в
  Lockbox `presentbook-github`. Локальный `npm run dev` функций не выполняет —
  там кнопка без номера и без changelog.
- Когда портал пересобирается — `paths` в `.github/workflows/presentbook-yc.yml`:
  при изменении `pages/aid-portal/` и всего, что сборка читает снаружи
  (`skills/_shared/`, `tokens/`, `components/`, `changes/driver/pending/`,
  `products/registry.json`). Новый вход сборки вне портала — добавить туда
  (файл общий, через PD), иначе его правки не дойдут до сайта.

## Стыки — что здесь чужое

- **Кнопка «Скачать плагин»** (`tools-registry.json`, `downloadUrl`) —
  владелец Token Comparator. Ссылку не менять; если кнопка отдаёт не ту
  версию — чинит чат плагина релизом, не этот чат.
- **Текст гайдов** — владелец Стандарты. Правится в `skills/_shared/`, а не
  здесь. Добавить гайд в портал можно здесь — строкой в
  `guide-registry.json`, если источник уже есть.
- **Токены и changelog продуктов** — владелец Стандарты.

## Проверки перед тем, как считать работу готовой

```bash
npm run typecheck && npm test && npm run build
```

Для изменений интерфейса — ещё открыть страницу в браузере (`npm run dev`)
и проверить консоль. Те же шаги гоняет CI, задача «Портал».

Для изменений компонентов — ещё `npm run test:browser`: снимки матрицы
вариант × состояние и axe в Chromium (первый раз —
`npx playwright install chromium`). В CI — на каждом PR, эталоны macOS и Linux.
Изменился вид намеренно — `npm run test:browser:update`, и новые снимки
смотрятся глазами до коммита.
