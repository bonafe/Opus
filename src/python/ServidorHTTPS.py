import http.server
import ssl
import os

#Para rodar no chrome localmente
#chrome --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https://localhost:4443

web_dir = os.path.join(os.path.dirname(__file__), '../web')
os.chdir(web_dir)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain('../python/cert.pem')
#context.load_cert_chain('../python/opus.alfvcp.rf08.srf.pem')

server_address = ('opus.alfvcp.rf08.srf', 443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = context.wrap_socket(httpd.socket,
                               server_side=True)
httpd.serve_forever()
