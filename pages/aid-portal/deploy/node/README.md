# Временное зеркало Presentbook (AID-18)

Разовая мера на время сбоя Яндекс Облака 2026-10-14. ADR-038 не меняет,
ветка в `main` не мержится. IP сервера и доступы в репозиторий не пишутся.

## Как устроено

- nginx отдаёт статику (`npm run build -- --base=/`) и проксирует `/api/*`
  на Node-сервер `127.0.0.1:8787`.
- Node-сервер (`server.ts`) вызывает те же обработчики `api/*.ts`, что и
  функция Облака, через `route()` из `deploy/yc/handler.ts`.
- Работают вход (`/api/login`, `/api/session`) и версия плагина
  (`/api/plugin-version`, напрямую из GitHub). Закрытые данные `/ttm` и
  задачи зеркало не отдаёт: без Облака нет Lockbox — страница пишет
  «данные недоступны».
- Cookie входа с флагом `Secure` — нужен HTTPS (certbot).

## Сборка (локально или на сервере, из `pages/aid-portal`)

```bash
npm ci
npm run build -- --base=/
node deploy/node/build.mjs
```

На сервер: содержимое `dist/` → папка статики, `deploy/node/dist/server.cjs`
→ `/opt/presentbook/server.cjs`.

## Сервер (Node 22, nginx)

1. `/etc/presentbook/api.env` (права 600) — PD сам вписывает
   `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`, `AUTH_COOKIE_SECRET`.
2. `presentbook-api.service` → `/etc/systemd/system/`, затем
   `systemctl daemon-reload && systemctl enable --now presentbook-api`.
3. `nginx.conf` → `/etc/nginx/sites-available/presentbook` с подстановкой
   домена и папки, ссылка в `sites-enabled`, `nginx -t && systemctl reload nginx`.
4. `certbot --nginx -d <домен>`.

## Проверка

- `https://<домен>/` — форма входа; после входа — страницы портала.
- `https://<домен>/api/session` без cookie → 401.
- `https://<домен>/api/plugin-version` → 200.

## Когда Облако поднимется

Зеркало выключается (`systemctl disable --now presentbook-api`, сайт из
nginx убирается), ветка удаляется после «да» PD.
