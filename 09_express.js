var express = require('express')
var app = express()

app.get('/', function (req, resp) {
  resp.send('hello, express')
})

app.listen(8080)
