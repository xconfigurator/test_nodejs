/** WebSocket Demo */
var http = require('http')
var fs = require('fs')
var path = require('path')

var server = http.createServer(function (req, resp) {
  if (req.url === '/websocket') {
    fs.readFile(path.join(__dirname, 'static/test_websocket.html'), function (err, data) {
      if (err) throw err
      resp.end(data)
    })
  }
})

// var io = require('socket.io')(server)
// 等价于以下两句话
var socketIO = require('socket.io')
var io = socketIO(server)
// 访问/socket.io/socket.io.js <-- 这是个客户端脚本  <==========
// 客户端引入这个脚本
// var socket = io();

// 在服务器上些IO的监听
io.on('connection', function (socket) {
  console.log('一个新客户端连接上来')

  socket.on('tiwen', function (msg) {
    console.log('服务器收到提问：' + msg)
    /* 点对点 */
    // socket.emit('huida', '服务器应答 tiwen ' + msg)
    /* 广播 */
    // socket.broadcast.emit('huida ', '服务器应答 tiwen' + msg) // 自己收不到
    io.emit('huida', '服务器应答 tiwen ' + msg) // 客户端包括自己也能收到
  })
})

// 客户端、服务端都有socket对象
// 客户端、服务端都有emit、on方法
// 从而实现全双工通信
// emit：用于发送一个自定义事件
// on: 用于监听对方发送给自己的自定义事件

server.listen(8080, 'localhost')
