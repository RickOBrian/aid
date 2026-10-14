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

## Установка одной командой (Ubuntu 22.04/24.04, Debian 12)

PD заходит на сервер по SSH сам и запускает под root:

```bash
curl -fsSLO https://raw.githubusercontent.com/RickOBrian/aid/infra/selectel-mirror/pages/aid-portal/deploy/node/install.sh
sudo bash install.sh
```

Скрипт:

1. ставит nginx, certbot, git и Node 22;
2. берёт код из ветки `infra/selectel-mirror`;
3. собирает статику (`npm run build -- --base=/`) и `server.cjs`;
4. спрашивает текущие логин и пароль входа со скрытым вводом, а ключ
   cookie генерирует заново (`openssl rand -base64 32`). Всё уходит в
   `/etc/presentbook/api.env` с правами 600 и на экран не выводится;
5. включает сервис `presentbook-api`;
6. настраивает nginx на `<IP>.sslip.io`;
7. выпускает сертификат: certbot спросит почту и согласие с условиями;

и в конце проверяет адреса. Повторный запуск обновляет сборку и файл
секретов не трогает.

## Проверка

- `https://<домен>/` — форма входа; после входа — страницы портала.
- `https://<домен>/api/session` без cookie → 401.
- `https://<домен>/api/plugin-version` → 200.
- `https://<домен>/api/ttm`: без входа → 401, после входа → 503 — так и
  задумано: закрытые данные КПД лежат в Lockbox, копия их не отдаёт.

## Когда Облако поднимется

Зеркало выключается (`systemctl disable --now presentbook-api`, сайт из
nginx убирается), ветка удаляется после «да» PD.
