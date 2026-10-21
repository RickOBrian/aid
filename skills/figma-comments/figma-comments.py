#!/usr/bin/env python3
"""Комментарии к макету Figma через REST API — /figma-comments.

  figma-comments <ссылка или ключ файла>            все треды файла
  figma-comments <ссылка с ?node-id=…>               треды на узле и внутри него
  figma-comments <ключ> --node 2038:6723             то же, узел явно
  figma-comments <…> --open                          только нерешённые
  figma-comments <…> --json                          сырой JSON тредов
  figma-comments --check [<ссылка>]                  есть ли токен; со ссылкой — читается ли файл

Токен — личный токен Figma PD (права File content: Read, Comments: Read),
лежит в связке ключей macOS, сервис aid-figma-token. Скрипт читает его
через `security` и передаёт только в заголовке запроса к api.figma.com;
не печатает, не пишет в файлы и не принимает аргументом. Нужен только
python3.
"""

import argparse
import json
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.figma.com/v1"
SERVICE = "aid-figma-token"
ADD_CMD = f'security add-generic-password -U -a "$USER" -s {SERVICE} -w'
KEY_RE = re.compile(r"^[0-9A-Za-z]{22,128}$")
URL_RE = re.compile(r"figma\.com/(?:design|file|board|proto)/([0-9A-Za-z]{22,128})")
NODE_RE = re.compile(r"^\d+[:-]\d+$")


def token():
    try:
        r = subprocess.run(
            ["security", "find-generic-password", "-s", SERVICE, "-w"],
            capture_output=True, text=True,
        )
    except FileNotFoundError:
        sys.exit("Нет команды security: скрипт работает только на macOS.")
    value = r.stdout.strip()
    if r.returncode != 0 or not value:
        sys.exit(
            "Токена Figma нет в связке ключей. PD выполняет в терминале "
            f"(спросит значение, на экран не выводит):\n  {ADD_CMD}"
        )
    if not value.startswith("figd_") or len(value) < 40:
        sys.exit(
            f"В связке не токен Figma: {len(value)} символов, ожидается "
            "figd_… длиной 40+. Скорее всего, при вводе не сработала вставка. "
            f"PD кладёт заново:\n  {ADD_CMD}"
        )
    return value


def get(path, tok, params=None):
    url = f"{API}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"X-Figma-Token": tok})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        hint = {
            400: "неверный ключ файла или node-id",
            401: f"Figma не приняла токен (опечатка, отозван или истёк); PD кладёт новый:\n  {ADD_CMD}",
            403: "у токена нет доступа к файлу или прав File content / Comments: Read; "
                 f"новый токен PD кладёт той же командой:\n  {ADD_CMD}",
            404: "файл не найден или ключ с ошибкой",
            429: "лимит запросов Figma, повторить через минуту",
        }.get(e.code, "ошибка Figma API")
        sys.exit(f"Figma API {e.code} на {path}: {hint}")
    except urllib.error.URLError as e:
        sys.exit(f"Нет связи с api.figma.com: {e.reason}")


def parse_target(target, node):
    m = URL_RE.search(target)
    if m:
        key = m.group(1)
        q = urllib.parse.parse_qs(urllib.parse.urlparse(target).query)
        node = node or (q.get("node-id") or [None])[0]
    elif KEY_RE.match(target):
        key = target
    else:
        sys.exit(f"Не похоже на ссылку или ключ файла Figma: {target!r}")
    if node:
        if not NODE_RE.match(node):
            sys.exit(f"node-id вида 2038:6723 или 2038-6723, получено {node!r}")
        node = node.replace("-", ":")
    return key, node


def subtree_ids(key, node, tok):
    """Узел и все его потомки — комментарий на вложенном слое тоже про этот узел."""
    data = get(f"/files/{key}/nodes", tok, {"ids": node})
    entry = (data.get("nodes") or {}).get(node)
    if not entry:
        sys.exit(f"Узла {node} нет в файле {key}")
    ids, stack = set(), [entry["document"]]
    while stack:
        n = stack.pop()
        ids.add(n["id"])
        stack.extend(n.get("children", []))
    return ids


def threads(comments):
    roots = [c for c in comments if not c.get("parent_id")]
    replies = {}
    for c in comments:
        if c.get("parent_id"):
            replies.setdefault(c["parent_id"], []).append(c)
    for r in roots:
        r["replies"] = sorted(replies.get(r["id"], []), key=lambda c: c["created_at"])
    return sorted(roots, key=lambda c: c["created_at"])


def node_of(c):
    meta = c.get("client_meta") or {}
    return meta.get("node_id")


def render(key, node, items):
    scope = f"узел {node}" if node else "весь файл"
    out = [f"# Комментарии Figma · {key} · {scope}", "", f"Тредов: {len(items)}", ""]
    for c in items:
        status = "решён" if c.get("resolved_at") else "открыт"
        where = node_of(c) or "на холсте"
        link = f"https://www.figma.com/design/{key}?node-id={where.replace(':', '-')}" if node_of(c) else ""
        out.append(f"## #{c.get('order_id', '?')} · {status} · {where}")
        if link:
            out.append(link)
        out.append(f"**{c['user']['handle']}**, {c['created_at'][:10]}: {c['message'].strip()}")
        for r in c["replies"]:
            out.append(f"- **{r['user']['handle']}**, {r['created_at'][:10]}: {r['message'].strip()}")
        out.append("")
    return "\n".join(out)


def main():
    p = argparse.ArgumentParser(description="Комментарии к макету Figma")
    p.add_argument("target", nargs="?", help="ссылка на файл/узел Figma или ключ файла")
    p.add_argument("--node", help="node-id, если его нет в ссылке")
    p.add_argument("--open", action="store_true", help="только нерешённые треды")
    p.add_argument("--json", action="store_true", help="вывести JSON тредов")
    p.add_argument("--check", action="store_true", help="проверить, что токен есть")
    a = p.parse_args()

    tok = token()
    if a.check and not a.target:
        # /v1/me требует отдельного права current_user:read — у токена его нет
        print("Токен есть в связке ключей. Доступ к файлу: --check <ссылка>")
        return
    if not a.target:
        p.error("нужна ссылка или ключ файла")

    key, node = parse_target(a.target, a.node)
    items = threads(get(f"/files/{key}/comments", tok, {"as_md": "true"}).get("comments", []))
    if a.check:
        print(f"Токен есть, комментарии файла {key} читаются: тредов {len(items)}")
        return
    if node:
        ids = subtree_ids(key, node, tok)
        items = [c for c in items if node_of(c) in ids]
    if a.open:
        items = [c for c in items if not c.get("resolved_at")]

    if a.json:
        json.dump(items, sys.stdout, ensure_ascii=False, indent=2)
        print()
    else:
        print(render(key, node, items))


if __name__ == "__main__":
    main()
