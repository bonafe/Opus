import http.server
import ssl
import os

web_dir = os.path.join(os.path.dirname(__file__), '../web')
os.chdir(web_dir)

server_address = ('localhost', 4443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket,
                               server_side=True,
                               certfile='../python/cert.pem',
                               ssl_version=ssl.PROTOCOL_TLS)
httpd.serve_forever()
