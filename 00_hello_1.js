var http = require('http')

http.createServer(function (req, resp) {
  console.log('server log => ' + req.url)

  resp.writeHeader(200, { 'Content-type': 'text/html;charset=UTF-8' })
  resp.write('hello, world')

  resp.write('<br>')
  resp.write(req.url)

  resp.end()
}).listen(8080, '127.0.0.1')
