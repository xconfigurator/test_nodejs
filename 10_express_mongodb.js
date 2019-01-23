var express = require('express')
var app = express()

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/liuyang'
// 如果数据库不存在，系统会自动创建一个指定名称的数据库

app.get('/', function (req, resp) {
  MongoClient.connect(url, function (err, db) {
    if (err) {
      resp.send('Connection failed')
      throw err
    }
    // resp.send('Connected correctly to server. Powered By modules: express, mongodb ')
    console.log(db)
    db.collection('test').insertOne({
      'name': 'getParameterValues',
      'parameterNames': [
        'InternetGatewayDevice.configapp.hisoenable'
      ],
      'device': 'FFFFFF-Generic-FFFFFF123457',
      'timestamp': '2018-05-19T02:21:38.179Z',
      'state': 0
    }, function (err, result) {
      if (err) throw err
      console.log(result)
      resp.send('opt result = ' + result)
    })
    db.close()
  })
})

app.listen(8080)
