#!/usr/bin/env python3
"""
DS Guide Preview Server
Usage:
  python3 scripts/preview.py                          # all guides on :3333
  python3 scripts/preview.py semantic-color-tokens    # open specific guide directly
  python3 scripts/preview.py --port 4444              # custom port
"""

import http.server
import os
import sys
import urllib.parse
from pathlib import Path

PORT = 3333
GUIDES_DIR = Path(__file__).parent.parent / "skills" / "_shared"

HTML_SHELL = """<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>__TITLE__</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/swift.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/kotlin.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg-base: #f7f7f8;
      --bg-surface: #ffffff;
      --bg-sidebar: #fafafa;
      --border: #e5e5e7;
      --text-primary: #111111;
      --text-secondary: #6e6e73;
      --text-accent: #0057ff;
      --accent: #0057ff;
      --accent-fade: #eef3ff;
      --code-bg: #f4f4f5;
      --tag-stable: #dcfce7;
      --tag-stable-text: #166534;
      --tag-draft: #fef9c3;
      --tag-draft-text: #854d0e;
      --sidebar-w: 260px;
      --content-max: 760px;
      --radius: 8px;
    }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--bg-base);
      color: var(--text-primary);
      line-height: 1.6;
      display: flex;
      min-height: 100vh;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: var(--sidebar-w);
      min-height: 100vh;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border);
    }
    .sidebar-logo {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      letter-spacing: .06em;
      text-transform: uppercase;
    }
    .sidebar-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin-top: 4px;
    }

    .sidebar-nav { padding: 12px 10px; }
    .nav-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      letter-spacing: .07em;
      text-transform: uppercase;
      padding: 0 10px;
      margin: 12px 0 6px;
    }

    .nav-item {
      display: block;
      padding: 7px 10px;
      border-radius: 6px;
      font-size: 13.5px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: background .12s, color .12s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .nav-item:hover { background: var(--border); color: var(--text-primary); }
    .nav-item.active { background: var(--accent-fade); color: var(--accent); font-weight: 500; }

    /* ── Main ── */
    .main {
      margin-left: var(--sidebar-w);
      flex: 1;
      padding: 48px 48px 80px;
    }

    .content {
      max-width: var(--content-max);
      margin: 0 auto;
    }

    /* ── Frontmatter card ── */
    .fm-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 20px;
      margin-bottom: 36px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px 20px;
      align-items: center;
    }
    .fm-badge {
      font-size: 12px;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 99px;
      background: var(--tag-stable);
      color: var(--tag-stable-text);
    }
    .fm-badge.draft { background: var(--tag-draft); color: var(--tag-draft-text); }
    .fm-meta { font-size: 13px; color: var(--text-secondary); }
    .fm-meta strong { color: var(--text-primary); font-weight: 500; }
    .fm-desc { font-size: 13px; color: var(--text-secondary); width: 100%; line-height: 1.5; }

    /* ── Typography ── */
    .prose h1 { font-size: 28px; font-weight: 600; line-height: 1.25; margin-bottom: 8px; }
    .prose h2 { font-size: 18px; font-weight: 600; margin-top: 40px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    .prose h3 { font-size: 15px; font-weight: 600; margin-top: 24px; margin-bottom: 8px; }
    .prose p  { margin-bottom: 14px; font-size: 15px; }
    .prose ul, .prose ol { margin: 0 0 14px 20px; font-size: 15px; }
    .prose li { margin-bottom: 4px; }
    .prose blockquote {
      border-left: 3px solid var(--accent);
      padding: 2px 0 2px 16px;
      margin: 0 0 14px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    .prose hr { border: none; border-top: 1px solid var(--border); margin: 32px 0; }
    .prose a { color: var(--accent); text-decoration: none; }
    .prose a:hover { text-decoration: underline; }

    /* Code */
    .prose code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--code-bg);
      padding: 2px 6px;
      border-radius: 4px;
      color: #c7254e;
    }
    .prose pre {
      background: #1e1e2e;
      border-radius: var(--radius);
      padding: 18px 20px;
      overflow-x: auto;
      margin-bottom: 20px;
    }
    .prose pre code {
      background: none;
      padding: 0;
      color: #cdd6f4;
      font-size: 13.5px;
      line-height: 1.6;
    }

    /* Tables */
    .prose table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      margin-bottom: 20px;
      background: var(--bg-surface);
      border-radius: var(--radius);
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .prose th {
      background: var(--bg-base);
      font-weight: 600;
      font-size: 12.5px;
      text-transform: uppercase;
      letter-spacing: .04em;
      color: var(--text-secondary);
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .prose td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    .prose tr:last-child td { border-bottom: none; }
    .prose tr:hover td { background: var(--accent-fade); }

    /* Status line inside prose */
    .prose blockquote p { margin: 0; }

    /* ── Index page ── */
    .index-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 32px;
    }
    .index-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      text-decoration: none;
      color: inherit;
      transition: box-shadow .15s, border-color .15s;
      display: block;
    }
    .index-card:hover { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-fade); }
    .index-card-name { font-size: 15px; font-weight: 600; margin-bottom: 6px; color: var(--text-primary); }
    .index-card-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
    .index-card-meta { font-size: 12px; color: var(--text-secondary); margin-top: 12px; display: flex; gap: 10px; }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main { margin-left: 0; padding: 24px 20px; }
    }
  </style>
</head>
<body>
  __SIDEBAR__
  <main class="main">
    <div class="content" id="content">
      __BODY__
    </div>
  </main>
  <script>
    // Re-render any raw markdown injected server-side (unused here, kept for future)
    document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
  </script>
</body>
</html>"""


def parse_frontmatter(text):
    """Extract YAML-like frontmatter between --- delimiters."""
    if not text.startswith('---'):
        return {}, text
    end = text.find('\n---', 3)
    if end == -1:
        return {}, text
    fm_raw = text[4:end]
    body = text[end + 4:].lstrip('\n')
    fm = {}
    for line in fm_raw.splitlines():
        if ':' in line and not line.startswith(' '):
            key, _, val = line.partition(':')
            fm[key.strip()] = val.strip()
    # nested metadata.version
    for line in fm_raw.splitlines():
        line = line.strip()
        if line.startswith('version:'):
            fm['version'] = line.split(':', 1)[1].strip().strip('"')
        if line.startswith('owner:'):
            fm['owner'] = line.split(':', 1)[1].strip()
        if line.startswith('platforms:'):
            fm['platforms'] = line.split(':', 1)[1].strip()
    # multiline description
    lines = fm_raw.splitlines()
    desc_lines = []
    in_desc = False
    for line in lines:
        if line.startswith('description:'):
            in_desc = True
            continue
        if in_desc:
            if line.startswith(' ') or line.startswith('\t'):
                desc_lines.append(line.strip())
            else:
                break
    if desc_lines:
        fm['description'] = ' '.join(desc_lines)
    return fm, body


def build_sidebar(guides, active=None):
    items = ''
    for g in sorted(guides):
        name = g.stem
        label = name.replace('-', ' ').title()
        cls = 'nav-item active' if name == active else 'nav-item'
        items += f'<a class="{cls}" href="/{name}" title="{name}">{label}</a>\n'
    return f'''<aside class="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo">Design System</div>
    <div class="sidebar-title">Guides</div>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-label">_shared</div>
    <a class="nav-item{'  active' if not active else ''}" href="/">All guides</a>
    {items}
  </nav>
</aside>'''


def render_guide(path):
    text = path.read_text(encoding='utf-8')
    fm, body = parse_frontmatter(text)

    version = fm.get('version', '')
    owner = fm.get('owner', '')
    platforms = fm.get('platforms', '[web, ios, android]')
    description = fm.get('description', '')

    # Detect status from body
    status = 'Stable'
    if '> Статус: Draft' in body:
        status = 'Draft'

    badge_cls = 'fm-badge draft' if status == 'Draft' else 'fm-badge'

    fm_card = f'''<div class="fm-card">
      <span class="{badge_cls}">{status}</span>
      <span class="fm-meta"><strong>v{version}</strong></span>
      <span class="fm-meta">Platforms: <strong>{platforms}</strong></span>
      <span class="fm-meta">Owner: <strong>{owner}</strong></span>
      {'<span class="fm-desc">' + description + '</span>' if description else ''}
    </div>'''

    # Escape for JS string
    body_escaped = body.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

    prose = f'''
    {fm_card}
    <div class="prose" id="prose"></div>
    <script>
      marked.setOptions({{ breaks: false, gfm: true }});
      const md = `{body_escaped}`;
      document.getElementById('prose').innerHTML = marked.parse(md);
      document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    </script>'''

    return fm.get('name', path.stem), prose


def render_index(guides):
    cards = ''
    for g in sorted(guides):
        text = g.read_text(encoding='utf-8')
        fm, _ = parse_frontmatter(text)
        name = fm.get('name', g.stem)
        version = fm.get('version', '—')
        desc = fm.get('description', '')[:120]
        if desc and len(fm.get('description', '')) > 120:
            desc += '…'
        cards += f'''<a class="index-card" href="/{g.stem}">
      <div class="index-card-name">{name}</div>
      <div class="index-card-desc">{desc}</div>
      <div class="index-card-meta"><span>v{version}</span></div>
    </a>\n'''

    return f'''<div class="prose"><h1>Design System Guides</h1></div>
    <div class="index-grid">{cards}</div>'''


class ReusableHTTPServer(http.server.HTTPServer):
    allow_reuse_address = True


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # silent

    def do_GET(self):
        path = urllib.parse.unquote(self.path.split('?')[0]).lstrip('/')
        guides = list(GUIDES_DIR.glob('*-guide.md')) + list(GUIDES_DIR.glob('git-workflow.md')) + \
                 list(GUIDES_DIR.glob('token-rules.md')) + list(GUIDES_DIR.glob('platforms.md'))
        guides = list({g.stem: g for g in guides}.values())  # dedupe

        def build_html(title, sidebar, body):
            return (HTML_SHELL
                    .replace('__TITLE__', title)
                    .replace('__SIDEBAR__', sidebar)
                    .replace('__BODY__', body))

        if not path:
            sidebar = build_sidebar(guides)
            body = render_index(guides)
            html = build_html('DS Guides', sidebar, body)
        else:
            target = next((g for g in guides if g.stem == path or g.name == path), None)
            if not target:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'Not found')
                return
            sidebar = build_sidebar(guides, active=target.stem)
            name, body = render_guide(target)
            html = build_html(name, sidebar, body)

        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))


if __name__ == '__main__':
    args = sys.argv[1:]
    port = PORT
    open_path = ''

    skip_next = False
    for i, arg in enumerate(args):
        if skip_next:
            skip_next = False
            continue
        if arg.startswith('--port='):
            port = int(arg.split('=', 1)[1])
        elif arg == '--port':
            port = int(args[i + 1])
            skip_next = True
        elif not arg.startswith('--'):
            open_path = arg.replace('.md', '')

    url = f'http://localhost:{port}'
    if open_path:
        url += f'/{open_path}'

    print(f'  DS Guide Preview → {url}')
    print(f'  Serving: {GUIDES_DIR}')
    print(f'  Ctrl+C to stop\n')

    server = ReusableHTTPServer(('', port), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
