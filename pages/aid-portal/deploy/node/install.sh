#!/usr/bin/env bash
# Копия Presentbook на отдельном сервере (AID-18): https://<IP>.sslip.io.
# Ubuntu 22.04/24.04 или Debian 12. Запуск на сервере под root:
#   sudo bash install.sh
# Повторный запуск обновляет сборку из ветки и не трогает файл секретов.
#
# Секреты: логин и пароль входа вводятся со скрытым вводом, ключ cookie
# генерируется здесь же. Всё пишется в /etc/presentbook/api.env (права 600)
# и никуда не выводится.
set -euo pipefail

BRANCH=${BRANCH:-infra/selectel-mirror}
REPO=https://github.com/RickOBrian/aid.git
SRC=/opt/presentbook/src
WWW=/var/www/presentbook
ENV_FILE=/etc/presentbook/api.env

if [ "$(id -u)" -ne 0 ]; then
  echo "Запустите под root: sudo bash install.sh" >&2
  exit 1
fi

IP=${IP:-$(curl -fsS4 https://ipv4.icanhazip.com | tr -d '[:space:]')}
DOMAIN=${DOMAIN:-$IP.sslip.io}
echo "== Адрес копии: https://$DOMAIN"

echo "== 1/7 Пакеты: nginx, certbot, git, Node 22"
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx git curl ca-certificates openssl >/dev/null
if ! node --version 2>/dev/null | grep -q '^v22\.'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
echo "   node $(node --version), nginx $(nginx -v 2>&1 | cut -d/ -f2)"

echo "== 2/7 Код из ветки $BRANCH"
if [ -d "$SRC/.git" ]; then
  git -C "$SRC" fetch -q --depth 1 origin "$BRANCH"
  git -C "$SRC" reset -q --hard FETCH_HEAD
else
  mkdir -p "$(dirname "$SRC")"
  git clone -q --depth 1 --branch "$BRANCH" "$REPO" "$SRC"
fi
echo "   $(git -C "$SRC" log --oneline -1)"

echo "== 3/7 Сборка сайта и сервера API"
cd "$SRC/pages/aid-portal"
npm ci --no-audit --no-fund --loglevel=error
npm run build --silent -- --base=/ >/dev/null
node deploy/node/build.mjs >/dev/null
mkdir -p "$WWW" /opt/presentbook
rm -rf "$WWW.new" && cp -r dist "$WWW.new" && rm -rf "$WWW" && mv "$WWW.new" "$WWW"
install -m 644 deploy/node/dist/server.cjs /opt/presentbook/server.cjs

echo "== 4/7 Секреты входа ($ENV_FILE)"
if [ -f "$ENV_FILE" ]; then
  echo "   файл уже есть — не трогаю"
else
  mkdir -p "$(dirname "$ENV_FILE")"
  read -r -p "   Логин входа на сайт: " auth_user
  read -r -s -p "   Пароль входа на сайт (не отображается): " auth_password; echo
  case "$auth_user$auth_password" in *"'"*) echo "   В логине или пароле есть одинарная кавычка — systemd её не примет" >&2; exit 1 ;; esac
  ( umask 077
    {
      printf "BASIC_AUTH_USER='%s'\n" "$auth_user"
      printf "BASIC_AUTH_PASSWORD='%s'\n" "$auth_password"
      printf "AUTH_COOKIE_SECRET='%s'\n" "$(openssl rand -base64 32)"
    } > "$ENV_FILE" )
  unset auth_user auth_password
  echo "   записано, права $(stat -c %a "$ENV_FILE")"
fi

echo "== 5/7 Сервис API"
install -m 644 deploy/node/presentbook-api.service /etc/systemd/system/presentbook-api.service
systemctl daemon-reload
systemctl enable -q presentbook-api
systemctl restart presentbook-api
sleep 1
systemctl is-active --quiet presentbook-api && echo "   presentbook-api работает"

echo "== 6/7 nginx"
sed -e "s|__DOMAIN__|$DOMAIN|g" -e "s|__ROOT__|$WWW|g" deploy/node/nginx.conf > /etc/nginx/sites-available/presentbook
ln -sf /etc/nginx/sites-available/presentbook /etc/nginx/sites-enabled/presentbook
nginx -t -q
systemctl reload nginx

echo "== 7/7 Сертификат"
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "   certbot спросит почту и согласие с условиями Let's Encrypt"
  certbot --nginx -d "$DOMAIN" --redirect
else
  echo "   сертификат уже есть"
fi

echo "== Проверка"
check() { printf '   %-28s %s (ждали %s)\n' "$1" "$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN$1")" "$2"; }
check / 200
check /driver/tokens/colors 200
check /api/session 401
check /api/plugin-version 200
check /api/ttm 401
echo "Готово: https://$DOMAIN — войдите текущим логином и паролем."
