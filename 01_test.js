var http = require('http')

var server = http.createServer(function (req, resp) {
  resp.writeHead(200, { 'Content-type': 'text/html;charset=UTF-8' })
  resp.end('hello, node.js')
})

server.listen(8080, '127.0.0.1')
