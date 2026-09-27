"""Local-only web server and Ollama relay. Python 3.10+, no dependencies."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from pathlib import Path
import json, os

ROOT = Path(__file__).resolve().parent
HOST = '127.0.0.1'
PORT = int(os.environ.get('PORT', '8080'))
OLLAMA = os.environ.get('OLLAMA_URL', 'http://127.0.0.1:11434').rstrip('/')
MAX_BODY = 100_000

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == '/api/health':
            try:
                with urlopen(OLLAMA + '/api/tags', timeout=4) as r:
                    models = json.load(r).get('models', [])
                self.send_json(200, {'connected': True, 'models': [m.get('name') for m in models]})
            except (URLError, TimeoutError, ValueError, OSError):
                self.send_json(200, {'connected': False, 'models': []})
        elif self.path.startswith('/api/'):
            self.send_json(404, {'error': 'Not found'})
        else:
            super().do_GET()

    def do_POST(self):
        if self.path != '/api/chat':
            return self.send_json(404, {'error': 'Not found'})
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if size < 1 or size > MAX_BODY:
                return self.send_json(413, {'error': 'Invalid request size'})
            payload = json.loads(self.rfile.read(size))
            model = payload.get('model', '')
            messages = payload.get('messages', [])
            if not isinstance(model, str) or not model or len(model) > 100 or not all(c.isalnum() or c in ':._/-' for c in model):
                return self.send_json(400, {'error': 'Invalid model'})
            if not isinstance(messages, list) or len(messages) > 35 or not all(isinstance(m, dict) and m.get('role') in ('system', 'user', 'assistant') and isinstance(m.get('content'), str) and len(m['content']) <= 14000 for m in messages):
                return self.send_json(400, {'error': 'Invalid messages'})
            req = Request(OLLAMA + '/api/chat', data=json.dumps({'model': model, 'messages': messages, 'stream': False, 'options': {'num_predict': 1200}}).encode(), headers={'Content-Type': 'application/json'}, method='POST')
            with urlopen(req, timeout=180) as response:
                result = json.load(response)
            self.send_json(200, {'message': result.get('message', {}).get('content', '')})
        except HTTPError as e:
            self.send_json(502, {'error': 'Ollama error', 'detail': e.read(500).decode('utf-8', 'replace')})
        except (URLError, TimeoutError, OSError):
            self.send_json(503, {'error': 'Ollama unavailable. Start Ollama and download a model.'})
        except (ValueError, TypeError, json.JSONDecodeError):
            self.send_json(400, {'error': 'Invalid request'})

if __name__ == '__main__':
    print(f'Infinite Realms: http://{HOST}:{PORT} | Ollama: {OLLAMA}')
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
