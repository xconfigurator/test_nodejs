var express = require('express')
var app = express()
var dao = require('./modules_liuyang/dao/db.js')

var json = {
  'name': 'getParameterValues',
  'parameterNames': [
    'InternetGatewayDevice.configapp.hisoenable'
  ],
  'device': 'FFFFFF-Generic-FFFFFF123457',
  'timestamp': '2018-05-19T02:21:38.179Z',
  'state': 0
}

const COLLECTION_NAME = 'test'

// insert
app.get('/i', function (req, resp) {
  dao.insertOne(COLLECTION_NAME, json, function (err, result) {
    if (err) throw err
    resp.send(result)
  })
})

// find
app.get('/', function (req, resp) {
  // dao.find('test', {'name': 'LIUYANG'}, function (err, result) {
  dao.findAll(COLLECTION_NAME, {}, function (err, result) {
    if (err) {
      console.log(JSON.stringify(err))
      throw err
    }
    // resp.send(result) // OK
    resp.json({ 'result': result }) // OK
  })
})

// find
// 分页查询 URL模式 ip:port/q?page=0&&pageSize=4
// http://localhost:8081/q?page=0&&pageSize=4
app.get('/q', function (req, resp) {
  var page = parseInt(req.query.page) // express中读取get参数
  var pageSize = parseInt(req.query.pageSize)
  // var pageArr = [] // 页面数据
  // const pageSize = 4 // 每页记录条数
  console.log('#debug /q page = ' + page)
  console.log('#debug /q pageSize = ' + pageSize)

  /*
  // 分页方法1：Service层分页 (不推荐)
  dao.find(COLLECTION_NAME, {}, function (err, result) {
    if (err) {
      console.log(JSON.stringify(err))
      throw err
    }
    // Service层分页具体实现
    var offset = page * pageSize;
    for (var i = offset; i < offset + pageSize; i++) {
      if (!result[i]) break
      pageArr.push(result[i])
    }
    console.log(pageArr)
    resp.json({'resultPage': pageArr})
  })
  */

  // 分页方法2：数据库层分页
  dao.find(COLLECTION_NAME, {}, { 'page': page, 'pageSize': pageSize }, function (err, result) {
    if (err) {
      console.log(JSON.stringify(err))
      throw err
    }
    resp.json({ 'result_find_page': result })
  })
})

// update
app.get('/u', function (req, resp) {
  console.log('#debug /u')
  dao.update(COLLECTION_NAME, { 'name': 'LIUYANG' }, { $set: { 'name': 'crazyliuyang' } }, function (err, result) {
    if (err) {
      console.log(JSON.stringify(err))
      throw err
    }
    resp.json({ 'result update': result })
  })
  // resp.send('update ok')
})

// remove
app.get('/d', function (req, resp) {
  var name = req.query.name
  // 条件字符串
  var json = {
    'name': name
  }
  console.log('#debug /d name = ' + name)
  dao.delete(COLLECTION_NAME, json, function (err, result) {
    if (err) {
      console.log(JSON.stringify(err))
      throw err
    }
    resp.json({ 'result delete': result })
  })
  // resp.send('delete ok')
})

app.listen(8081)
