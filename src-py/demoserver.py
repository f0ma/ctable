from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json

import multipart
from pypika import Query, Table, Field, Order
from pypika import functions as fn

from Tables import proc_classes

hostName = "localhost"
serverPort = 8000

class DemoServer(BaseHTTPRequestHandler):

    def do_GET(self):
        args = urlparse(self.path)

        if args.path == "/":
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            with open('index.html', 'rb') as f:
                self.wfile.write(f.read())

        elif args.path == "/favicon.ico":
            self.send_response(404)

        elif args.path == "/ctable.js":
            self.send_response(200)
            self.send_header("Content-type", "text/javascript")
            self.end_headers()
            with open('ctable.js', 'rb') as f:
                self.wfile.write(f.read())

        elif args.path == "/ctable.css":
            self.send_response(200)
            self.send_header("Content-type", "text/css")
            self.end_headers()
            with open('ctable.css', 'rb') as f:
                self.wfile.write(f.read())

        elif args.path == "/material-icons.woff2":
            self.send_response(200)
            self.send_header("Content-type", "font/woff2")
            self.end_headers()
            with open('material-icons.woff2', 'rb') as f:
                self.wfile.write(f.read())

        elif args.path in proc_classes.keys():
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            tbl = proc_classes[args.path]()
            self.wfile.write(json.dumps(tbl.process(parse_qs(args.query)).get_result(), ensure_ascii=False).encode('utf8'))

    def do_POST(self):
        args = urlparse(self.path)

        if args.path in proc_classes.keys():
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            content_length = int(self.headers['Content-Length'])
            content_type, options = multipart.parse_options_header(self.headers['Content-Type'])
            boundary = options.get("boundary", "")

            params = {}
            for part in multipart.MultipartParser(self.rfile, boundary, content_length):
                params[part.name] = [part.value]

            tbl = proc_classes[args.path]()
            self.wfile.write(json.dumps(tbl.process(params).get_result(), ensure_ascii=False).encode('utf8'))


if __name__ == "__main__":
    webServer = HTTPServer((hostName, serverPort), DemoServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")

