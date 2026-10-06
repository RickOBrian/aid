#!/usr/bin/env bash
# Создаёт или обновляет шлюзы presentbook-site и presentbook-preview из
# site.yaml и preview.yaml (ADR-038). Запуск вручную, не из CI:
#   YC="yc --profile presentbook" ./apply-gateways.sh
set -euo pipefail
cd "$(dirname "$0")"
YC=${YC:-yc}
FUNCTION_ID=$($YC serverless function get --name presentbook-api --format json | python3 -c 'import json,sys;print(json.load(sys.stdin)["id"])')
GATEWAY_SA_ID=$($YC iam service-account get --name presentbook-runtime --format json | python3 -c 'import json,sys;print(json.load(sys.stdin)["id"])')
SITE_BUCKET=presentbook-site
tmp=$(mktemp -d)
for name in site preview; do
  sed -e "s|\${FUNCTION_ID}|$FUNCTION_ID|g" -e "s|\${GATEWAY_SA_ID}|$GATEWAY_SA_ID|g" -e "s|\${SITE_BUCKET}|$SITE_BUCKET|g" "$name.yaml" > "$tmp/$name.yaml"
  if $YC serverless api-gateway get --name "presentbook-$name" >/dev/null 2>&1; then
    $YC serverless api-gateway update --name "presentbook-$name" --spec "$tmp/$name.yaml" >/dev/null
  else
    $YC serverless api-gateway create --name "presentbook-$name" --spec "$tmp/$name.yaml" >/dev/null
  fi
  echo "presentbook-$name: $($YC serverless api-gateway get --name "presentbook-$name" --format json | python3 -c 'import json,sys;print(json.load(sys.stdin)["domain"])')"
done
rm -rf "$tmp"
