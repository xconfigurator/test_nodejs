var service = require('./pagination_service')
var express = require('express')
var bodyParser = require('body-parser')
var qs = require('qs')
var app = express()

app.use(bodyParser.urlencoded({extended: false}))

// TEST 测试入口
app.get('/', function (req, resp) {
  resp.send('hello, pagination')
  console.log('#debug controller service.msg = ' + service.msg)
})

// TEST 总数
app.post('/pagination/total', function (req, resp) {
  console.log('#debug /pagination/total')
  let collectionName = req.body.collectionName // 需要字符串的
  let queryStr = qs.parse(req.body.queryStr) // 需要对象的
  console.log('#debug /pagination/pagecontent collectionName = ' + collectionName)
  console.log('#debug /pagination/total queryStr = ' + queryStr)
  service.total(req, resp, collectionName, queryStr)
  // resp.end('pagination total')
})

// TEST 页面数据
app.post('/pagination/pagecontent', function (req, resp) {
  console.log('#debug /pagination/pagecontent')
  let collectionName = req.body.collectionName // 需要字符串的
  let queryStr = qs.parse(req.body.queryStr) // 需要对象的
  let currentPage = parseInt(req.body.currentPage)
  let pageSize = parseInt(req.body.pageSize)

  console.log('#debug /pagination/pagecontent collectionName = ' + collectionName)
  console.log('#debug /pagination/pagecontent queryStr = ' + queryStr)
  console.log('#debug /pagination/pagecontent currentPage = ' + currentPage)
  console.log('#debug /pagination/pagecontent pageSize = ' + pageSize)
  service.pagecontent(req, resp, collectionName, queryStr, currentPage, pageSize)
  // resp.end('pagination pagecontent')
})

// for 正式环境
// 页面数据(将页面总数和页面数据融合在一次请求中返回)
app.post('/pagination/pageinfo', function (req, resp) {
  console.log('#debug /pagination/pageinfo')
  let collectionName = req.body.collectionName // 需要字符串的
  let queryStr = qs.parse(req.body.queryStr) // 需要对象的
  let currentPage = parseInt(req.body.currentPage)
  let pageSize = parseInt(req.body.pageSize)
  console.log('#debug /pagination/pagecontent collectionName = ' + collectionName)
  console.log('#debug /pagination/pagecontent queryStr = ' + queryStr)
  console.log('#debug /pagination/pagecontent currentPage = ' + currentPage)
  console.log('#debug /pagination/pagecontent pageSize = ' + pageSize)
  service.pageinfo(req, resp, collectionName, queryStr, currentPage, pageSize)
  /*
  // 跨域处理
  resp.writeHead(200, {
    'content-type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  })
  resp.end('pagination pageinfo')
  */
})

app.listen(8081)
