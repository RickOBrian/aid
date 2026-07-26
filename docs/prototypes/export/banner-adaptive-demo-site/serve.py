#!/usr/bin/env python3
"""
Resilient static server for banner-adaptive-demo.html.

Usage:
  python3 docs/prototypes/serve.py [port]

Default port: 9876
URL: http://localhost:9876/banner-adaptive-demo.html
"""
import http.server
import socketserver
import sys
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 9876
ROOT = Path(__file__).resolve().parent
DEMO_URL = '/banner-adaptive-demo.html'

# Client disconnects while streaming ~700 KB inline HTML must not kill the process.
_CLIENT_ERRORS = (BrokenPipeError, ConnectionResetError, ConnectionAbortedError)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path in ('/', ''):
            self.send_response(302)
            self.send_header('Location', DEMO_URL)
            self.end_headers()
            return
        if self.path.split('?', 1)[0] == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        try:
            super().do_GET()
        except _CLIENT_ERRORS:
            pass

    def end_headers(self):
        path = self.path.split('?', 1)[0]
        if path.endswith('.html'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
        super().end_headers()

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except _CLIENT_ERRORS:
            pass

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except _CLIENT_ERRORS:
            pass

    def log_message(self, fmt, *args):
        try:
            first = str(args[0]) if args else '?'
            parts = first.split(' ')
            path = parts[1] if len(parts) > 1 else first
            code = args[1] if len(args) > 1 else '?'
            print(f'  {code}  {path}')
        except Exception:
            pass


class ThreadedServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    url = f'http://localhost:{PORT}{DEMO_URL}'
    print(f'\n  Banner demo  →  {url}')
    print(f'  Root         →  {ROOT}')
    print('  Ctrl+C to stop\n')

    server = ThreadedServer(('', PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
