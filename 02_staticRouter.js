var http = require('http')
var fs = require('fs')

var server = http.createServer(function (req, resp) {
  fs.readFile('./test.html', function (err, data) {
    // console.log(err)
    if (!(err == null)) console.error(err)
    console.log('服务器接收到了请求' + req.url)
    // resp.writeHead(200, { 'Content-type': 'text/html;charset=UTF-8' })
    resp.writeHead(200, { 'Content-type': 'text/plain;charset=UTF-8' })
    // resp.end('hello, node.js')
    resp.end(data)
  })
})

server.listen(8080, '127.0.0.1')
