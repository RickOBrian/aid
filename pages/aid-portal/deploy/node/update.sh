#!/usr/bin/env bash
# Обновление копии Presentbook со свежего main (AID-18). Решение PD
# 2026-10-14: всё, что публикуется в Presentbook, сразу появляется и на копии.
#
# Запускает таймер presentbook-update.timer раз в 2 минуты (под root).
# Сборка идёт под непривилегированным пользователем pbbuild; root только
# раскладывает готовую сборку. Новый коммит в main — пересборка; упала —
# копия остаётся на прежней версии, этот коммит больше не собирается
# (до следующего коммита или `update.sh --force`).
set -Eeuo pipefail

SRC=/opt/presentbook/src
STATE=/opt/presentbook/state
WWW=/var/www/presentbook
REPO=https://github.com/RickOBrian/aid.git
BRANCH=main
ADAPTER_REF=$(cat /etc/presentbook/adapter-ref)
FORCE=${1:-}

exec 9>/run/presentbook-update.lock
flock -n 9 || { echo "уже идёт обновление"; exit 0; }
mkdir -p "$STATE"

# Node для сборки — с поддержкой TypeScript (скрипты сборки импортируют .ts).
ts_support() { "$@" -p 'process.features.typescript || ""' 2>/dev/null | grep -Eq '^(strip|transform)$'; }
BUILD_PATH=/usr/local/bin:/usr/bin:/bin
BUILD_NODE_OPTIONS=
if ts_support node; then
  :
elif ts_support node --experimental-strip-types; then
  BUILD_NODE_OPTIONS="--experimental-strip-types --disable-warning=ExperimentalWarning"
else
  if ! { [ -x /opt/presentbook/node/bin/node ] && ts_support /opt/presentbook/node/bin/node; }; then
    case "$(uname -m)" in x86_64) arch=x64 ;; aarch64) arch=arm64 ;; *) echo "Неизвестная архитектура $(uname -m)" >&2; exit 1 ;; esac
    base=https://nodejs.org/dist/latest-v24.x
    sums=$(curl -fsS "$base/SHASUMS256.txt")
    file=$(printf '%s\n' "$sums" | awk -v a="linux-$arch.tar.xz" '$2 ~ a"$" {print $2}' | head -1)
    tmp=$(mktemp -d)
    curl -fsS -o "$tmp/$file" "$base/$file"
    (cd "$tmp" && printf '%s\n' "$sums" | grep " $file\$" | sha256sum -c --quiet)
    rm -rf /opt/presentbook/node && mkdir -p /opt/presentbook/node
    tar -xJf "$tmp/$file" -C /opt/presentbook/node --strip-components=1
    rm -rf "$tmp"
  fi
  BUILD_PATH=/opt/presentbook/node/bin:$BUILD_PATH
fi

as_build() {
  runuser -u pbbuild -- env HOME=/var/lib/pbbuild PATH="$BUILD_PATH" NODE_OPTIONS="$BUILD_NODE_OPTIONS" "$@"
}

if [ ! -d "$SRC/.git" ]; then
  install -d -o pbbuild -g pbbuild "$SRC"
  as_build git clone -q --depth 1 --branch "$BRANCH" "$REPO" "$SRC"
fi
as_build git -C "$SRC" fetch -q --depth 1 origin "$BRANCH"
sha=$(as_build git -C "$SRC" rev-parse FETCH_HEAD)
stamp="$sha $ADAPTER_REF"

if [ "$FORCE" != "--force" ]; then
  [ "$(cat "$STATE/published" 2>/dev/null)" = "$stamp" ] && exit 0
  [ "$(cat "$STATE/failed" 2>/dev/null)" = "$stamp" ] && exit 0
fi

trap 'echo "$stamp" > "$STATE/failed"; echo "сборка ${sha:0:7} не удалась — копия осталась на прежней версии" >&2' ERR

echo "сборка ${sha:0:7}"
as_build git -C "$SRC" reset -q --hard "$sha"
as_build git -C "$SRC" fetch -q --depth 1 origin "$ADAPTER_REF"
as_build git -C "$SRC" checkout -q FETCH_HEAD -- pages/aid-portal/deploy/node
cd "$SRC/pages/aid-portal"
as_build npm ci --no-audit --no-fund --loglevel=error
as_build npm run build --silent -- --base=/ >/dev/null
as_build node deploy/node/build.mjs >/dev/null

# Раскладка: папка сайта подменяется целиком, без полусобранного состояния.
printf '{"sha":"%s","builtAt":"%s"}\n' "$sha" "$(date -u +%FT%TZ)" > dist/version.json
rm -rf "$WWW.new" && cp -r dist "$WWW.new" && chmod -R a+rX "$WWW.new"
rm -rf "$WWW.old" && { [ -d "$WWW" ] && mv "$WWW" "$WWW.old" || true; } && mv "$WWW.new" "$WWW" && rm -rf "$WWW.old"

if ! cmp -s deploy/node/dist/server.cjs /opt/presentbook/server.cjs; then
  install -m 644 deploy/node/dist/server.cjs /opt/presentbook/server.cjs
  systemctl try-restart presentbook-api
fi

trap - ERR
echo "$stamp" > "$STATE/published"
rm -f "$STATE/failed"
echo "копия обновлена до ${sha:0:7}"
