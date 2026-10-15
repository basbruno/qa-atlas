"""API mock de estudo: py api_local.py. Encerre com Ctrl+C.
GET http://127.0.0.1:8765/health => 200, {"status":"ok"}
GET /pedidos => 200, dados sintéticos. Outras rotas => 404.
Não tem autenticação, persistência ou implementação de regras de negócio.
Use para começar com requests/Robot/k6; não comprova segurança de uma API real.
"""
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        data={'/health':{'status':'ok'},'/pedidos':{'pedidos':[{'id':1,'valor_centavos':2000},{'id':2,'valor_centavos':4000}]}}
        status=200 if self.path in data else 404
        body=json.dumps(data.get(self.path,{'error':'not_found'})).encode()
        self.send_response(status)
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Content-Length',str(len(body)))
        self.end_headers()
        self.wfile.write(body)
if __name__=='__main__':
    server=ThreadingHTTPServer(('127.0.0.1',8765),Handler)
    print('QA Atlas: http://127.0.0.1:8765/health — Ctrl+C para encerrar')
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
