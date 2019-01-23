var mongodb = require('mongodb')
// var util = require('util')
var qs = require('qs')

var cfg = require('./pagination_cfg')

const isDebug = true
const MONGO_URL = cfg.MONGO_URL
// const QUERY_COLLECTION_NAME = cfg.QUERY_COLLECTION_NAME // 改为从界面传入

// Mongo
let MongoClient = mongodb.MongoClient

var total = function (req, resp, collectionName, queryStr) {
  // TODO 临时赋值
  queryStr = {}

  // 跨域处理
  resp.writeHead(200, {
    'content-type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  })

  // 查询总数
  MongoClient.connect(MONGO_URL, function (err, db) {
    if (err) console.log(err)

    db.collection(collectionName).count(queryStr, function (err, count) {
      if (err) console.log(err)
      if (isDebug) console.log('#debug count = ' + count)
      db.close()
      resp.end(qs.stringify(count))
    })
  })
}

var pagecontent = function (req, resp, collectionName, queryStr, currentPage, pageSize) {
  // TODO 临时赋值
  queryStr = {}

  // 跨域处理
  resp.writeHead(200, {
    'content-type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  })

  MongoClient.connect(MONGO_URL, function (err, db) {
    if (err) console.log(err)
    let offset = (currentPage - 1) * pageSize // vue pagination currentPage从1开始
    let result = []
    let cursor = db.collection(collectionName).find(queryStr).skip(offset).limit(pageSize)
    // let cursor = db.collection('fs.files').find({}).skip(offset).limit(pageSize)

    cursor.each(function (err, doc) {
      if (err) console.log(err)
      if (doc != null) {
        let docObj = {} // 不保存data属性（太大了）
        docObj._id = doc._id
        docObj.files_id = doc.files_id
        docObj.n = doc.n
        result.push(docObj)
      } else {
        db.close()
        if (isDebug) console.log('#debug service pagecontent result = ' + qs.stringify(result))
        resp.end(qs.stringify(result)) // 返回数据
      }
    })// end of cursor
  })// end of mongo
}

var pageinfo = function (req, resp, collectionName, queryStr, currentPage, pageSize) {
  // TODO 临时赋值
  queryStr = {}

  // 跨域处理
  resp.writeHead(200, {
    'content-type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  })

  // 模型：
  let pageinfo = {
    total: 0,
    data: []
  }

  // 第一步： 算总数
  MongoClient.connect(MONGO_URL, function (err, db) {
    if (err) console.log(err)
    db.collection(collectionName).count(queryStr, function (err, count) {
      if (err) console.log(err)
      if (isDebug) console.log('#debug pageinfo count = ' + count)
      pageinfo.total = count
      // 第二步: 查每页的数据
      let offset = (currentPage - 1) * pageSize // vue pagination currentPage从1开始
      let result = []
      let cursor = db.collection(collectionName).find(queryStr).skip(offset).limit(pageSize).sort({'n': -1})

      cursor.each(function (err, doc) {
        if (err) console.log(err)
        if (doc != null) {
          let docObj = {} // 不保存data属性（太大了）
          docObj._id = doc._id
          docObj.files_id = doc.files_id
          docObj.n = doc.n
          result.push(docObj)
        } else {
          db.close()
          pageinfo.data = result
          if (isDebug) console.log('#debug pageinfo = ' + qs.stringify(pageinfo))
          resp.end(qs.stringify(pageinfo)) // 返回数据
        }
      })// end of cursor
    })
  })
}

exports.total = total
exports.pagecontent = pagecontent
exports.pageinfo = pageinfo
