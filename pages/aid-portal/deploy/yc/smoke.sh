#!/usr/bin/env bash
# Смоук-тест выкладки Presentbook в Яндекс Облако (ADR-038).
# Использование: deploy/yc/smoke.sh https://<адрес-сайта>[/pr-N]
# Проверяет то, на чём держится схема шлюза: типы файлов, SPA-пути, API.
set -uo pipefail
base="${1%/}"
fail=0

check() { # url ожидаемый_код ожидаемый_тип(подстрока)
  local url="$1" code_want="$2" type_want="$3" out code type
  out=$(curl -s -o /dev/null -w '%{http_code} %{content_type}' --retry 3 --retry-delay 2 "$url")
  code=${out%% *}; type=${out#* }
  if [ "$code" = "$code_want" ] && [[ "$type" == *"$type_want"* ]]; then
    echo "ok   $code $type  $url"
  else
    echo "FAIL $code $type  $url (ждали $code_want, $type_want)"; fail=1
  fi
}

index=$(curl -s --retry 3 "$base/")
asset=$(printf '%s' "$index" | grep -o '/[^"]*assets/[^"]*\.js' | head -1)
origin=$(printf '%s' "$base" | grep -oE '^https?://[^/]+')

check "$base/" 200 text/html
check "$base/driver/tokens/colors" 200 text/html
if [ -n "$asset" ]; then
  check "$origin$asset" 200 javascript
else
  echo "FAIL в index.html не найден скрипт из assets/"; fail=1
fi
check "$base/assets/does-not-exist.js" 404 ''
# Шрифты — локально (fonts.ts): файл из CSS-бандла должен отдаваться.
css=$(printf '%s' "$index" | grep -o '/[^"]*assets/[^"]*\.css' | head -1)
font=$([ -n "$css" ] && curl -s --retry 3 "$origin$css" | grep -o '[^()"]*\.woff2' | head -1)
if [ -n "$font" ]; then
  case "$font" in /*) font_url="$origin$font" ;; *) font_url="$origin${css%/*}/$font" ;; esac
  check "$font_url" 200 ''
else
  echo "FAIL в CSS-бандле не найден шрифт woff2"; fail=1
fi
# API — через базу: на превью /pr-N/api/... идёт в версию функции этого PR.
check "$base/api/session" 401 application/json
check "$base/api/plugin-version" 200 application/json
# Данные страницы /ttm закрытые (AID-13): без сессии — 401, на превью — 404
# даже с сессией. Сама страница — обычный маршрут SPA.
check "$base/ttm" 200 text/html
case "$base" in
  */pr-[0-9]*) check "$base/api/ttm" 404 application/json ;;
  *) check "$base/api/ttm" 401 application/json ;;
esac

exit $fail
