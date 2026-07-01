#!/usr/bin/env python3
"""
DS Docs Server — static file server from project root.
Usage: python3 scripts/docs-server.py [port]

Serves the whole project, so both URLs resolve correctly:
  /docs/index.html              → landing page
  /skills/_shared/*.md          → MD files fetched by search.js
  /docs/guides/template.html    → guide page
"""
import http.server
import json
import subprocess
import sys
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3335
ROOT = Path(__file__).parent.parent  # project root (…/aid/)
SAVE_TOKENS_SCRIPT = ROOT / 'docs' / 'tokens' / 'save-tokens.js'


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        # Redirect bare / to the docs landing page
        if self.path in ('/', ''):
            self.send_response(301)
            self.send_header('Location', '/docs/index.html')
            self.end_headers()
            return
        # Silently swallow favicon.ico — no file, no noise
        if self.path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        super().do_GET()

    def do_POST(self):
        if self.path.rstrip('/') in ('/docs/tokens/save-tokens', '/docs/tokens/save-tokens.js'):
            self._handle_save_tokens()
            return
        self.send_error(404, 'Not found')

    def _handle_save_tokens(self):
        length = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(length).decode('utf-8') if length else '{}'

        try:
            proc = subprocess.run(
                ['node', str(SAVE_TOKENS_SCRIPT)],
                input=raw,
                capture_output=True,
                text=True,
                cwd=str(ROOT),
                timeout=30,
            )
            body = proc.stdout.strip() or proc.stderr.strip() or '{"ok":false,"error":"empty response"}'
            data = json.loads(body)
            status = 200 if proc.returncode == 0 and data.get('ok') else 400
        except (json.JSONDecodeError, subprocess.TimeoutExpired, FileNotFoundError) as err:
            body = json.dumps({'ok': False, 'error': str(err)})
            status = 500

        encoded = body.encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(encoded)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(encoded)

    def do_OPTIONS(self):
        if self.path.rstrip('/') in ('/docs/tokens/save-tokens', '/docs/tokens/save-tokens.js'):
            self.send_response(204)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            return
        self.send_error(404)

    def log_message(self, fmt, *args):
        # One-line request log; args[0] may be an HTTPStatus object on errors
        try:
            first = str(args[0]) if args else '?'
            parts = first.split(' ')
            path = parts[1] if len(parts) > 1 else first
            code = args[1] if len(args) > 1 else '?'
            print(f'  {code}  {path}')
        except Exception:
            pass  # never crash the server on a log line


class ReusableServer(http.server.HTTPServer):
    allow_reuse_address = True


if __name__ == '__main__':
    url = f'http://localhost:{PORT}/docs/index.html'
    print(f'\n  DS Docs  →  {url}')
    print(f'  Root     →  {ROOT}')
    print(f'  Ctrl+C to stop\n')

    server = ReusableServer(('', PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
