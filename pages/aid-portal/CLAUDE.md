# Presentbook — чат портала

Витрина и среда ревью дизайн-системы AID: токены и компоненты продуктов,
гайды-стандарты, раздел «Инструменты» с плагином. Корневой `CLAUDE.md`
действует тоже — особенно разделы «Три продукта — три чата», «Стыки между
продуктами», «Гейты» и «Git-полномочия».

## Где работаю

- Папка чата — `~/Projects/aid-presentbook` (git worktree). Правлю только
  `pages/aid-portal/`. Всё остальное — чужие продукты: см. «Стыки» в
  корневом `CLAUDE.md`.
- Сайт — https://aid-ds.vercel.app, Vercel-проект `aid-ds`, Root Directory —
  `pages/aid-portal`. Мерж в `main` сразу становится production (Q-11).
  Push в ветку даёт Preview.
- Новую ветку — от свежего `origin/main`:
  `git fetch && git switch -c <ветка> origin/main`.

## Вход в контекст

1. этот файл;
2. `JOURNAL.md` рядом — состояние, история, что открыто;
3. по задаче: `skills/_shared/protocols/presentbook-guide.md`,
   `component-page-baseline.md` (страница компонента),
   `portal-table-standard.md` (таблицы).

## Как устроен портал

- Vite + React, маршруты в `App.tsx` без префикса продукта; `/driver/…`
  и `/rider/…` снимаются в `resolveProductRoute` (`productRegistry.ts`).
  Корень `/` — продукт `driver` по умолчанию (решение 2026-09-22).
- Вход на сайт: `middleware.ts` (Vercel Edge, cookie-сессия) и
  `api/login.ts`. Секреты `BASIC_AUTH_*`, `AUTH_COOKIE_SECRET` — только в
  переменных Vercel; не читать, не печатать, не коммитить. Локальный
  `npm run dev` middleware не выполняет.
- Гайды: `guide-registry.json` → `sourcePath` в `skills/_shared/`;
  `scripts/build-guides.mjs` собирает их при `dev` и `prebuild`.
  `generated/` — производное, в git не хранится.
- Токены и changelog: канон — корневые `tokens/`; `scripts/sync-token-changelogs.mjs`
  копирует их в `pages/aid-portal/tokens/`. Копию не править.
- Инструменты: `tools-registry.json`, страницы `ToolsHubPage.tsx` и
  `TokenComparatorPluginPage.tsx`.
- Версия плагина на кнопке «Скачать» — `api/plugin-version.ts`: спрашивает
  GitHub `releases/latest` и кэширует ответ на CDN 10 минут. Меняется сама
  при публикации плагина, без пересборки портала. Необязательная переменная
  Vercel `GITHUB_RELEASES_TOKEN` (read-only) — без неё лимит GitHub на общих
  IP Vercel может кончиться, и кнопка покажется без номера. Локальный
  `npm run dev` функций не выполняет — там кнопка всегда без номера.
- Когда Vercel пересобирает портал — `ignoreCommand` в `vercel.json`: при
  изменении `pages/aid-portal/` и всего, что сборка читает снаружи
  (`skills/_shared/`, `tokens/`, `components/`, `changes/driver/pending/`,
  `products/registry.json`). Новый вход сборки вне портала — добавить и туда,
  иначе его правки не дойдут до сайта.

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
`npx playwright install chromium`). В CI его пока нет, запуск руками.
Изменился вид намеренно — `npm run test:browser:update`, и новые снимки
смотрятся глазами до коммита.
