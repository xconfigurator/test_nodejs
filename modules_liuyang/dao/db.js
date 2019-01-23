var MongoClient = require('mongodb').MongoClient
var conf = require('./conf.js')
// const url = 'mongodb://localhost:27017/liuyang'
const isDebug = true // 是否输出调试信息

// 问题： 全局存在db关闭问题！！！

function _connectDB (callback) {
  MongoClient.connect(conf.url, function (err, db) {
    if (err) throw err
    if (isDebug) console.log('连接成功')
    // 调用定制逻辑完成功能
    callback(db)
  })
}

// exports.connectDB = _connectDB

// C
// https://docs.mongodb.com/v2.4/reference/method/db.collection.insert/
// http://mongodb.github.io/node-mongodb-native/2.2/reference/ecmascript6/crud/
exports.insertOne = function (collectionName, json, callback) {
  _connectDB(function (db) {
    db.collection(collectionName).insertOne(json, function (err, result) {
      callback(err, result)
      db.close()
    })
  })
}

// R
// https://docs.mongodb.com/v2.4/reference/method/db.collection.find/
// http://mongodb.github.io/node-mongodb-native/2.2/reference/ecmascript6/crud/
exports.findAll = function (collectionName, json, callback) {
  // TODO 需要参数判断
  if (arguments.length !== 3) {
    // callback('', null) // 这个咋写
  }

  if (isDebug) {
    console.log('#debug collectionName = ' + collectionName)
    console.log('#debug json = ' + JSON.stringify(json))
    console.log('#debug callback = ' + callback)
  }

  _connectDB(function (db) {
    var result = []
    var cursor = db.collection(collectionName).find(json)
    cursor.each(function (err, doc) {
      if (err) {
        callback(err, null)
      }
      if (doc !== null) {
        // console.dir(doc)
        result.push(doc)
      } else {
        // 遍历结束
        callback(null, result)
      }
    }) // end of cursor

    db.close()
  })
}

// https://docs.mongodb.com/v2.4/reference/method/db.collection.find/
// http://mongodb.github.io/node-mongodb-native/2.2/reference/ecmascript6/crud/
exports.find = function (collectionName, json, pageinfo, callback) {
  // TODO 需要判断参数

  _connectDB(function (db) {
    var page = pageinfo.page
    var pageSize = pageinfo.pageSize
    var offset = page * pageSize

    var result = []
    var cursor = db.collection(collectionName).find(json).skip(offset).limit(pageSize)
    // skip(0).limit(0)也是查询全部
    cursor.each(function (err, doc) {
      if (err) {
        callback(err, null)
      }
      if (doc !== null) {
        result.push(doc)
      } else {
        callback(null, result)
      }
    }) // end of cursor

    db.close()
  })
}

// 测试：查找
/*
_connectDB(function (db) {
  db.collection('test').find({}, function (err, result) {
    if (err) throw err
    console.log(result)
    db.close()
  })
})
*/

// 测试：查找 分页
// https://docs.mongodb.com/v2.4/core/single-purpose-aggregation/#count
// http://mongodb.github.io/node-mongodb-native/2.2/reference/ecmascript6/crud/
// limit() skip()
// 注：limit(pageSize) skip(offset)
// 注：查全部 skip(0).limit(0)
/*
_connectDB(function (db) {

  // collection总数
  var totalPages = db.collection('test').count()
  console.log('#debug totalPages = ' + totalPages)

  var page = 0
  var pageSize = 4
  var offset = page * pageSize

  // 页面接收一个page参数
  var result = [] // 缓存结果集
  var cursor = db.collection('test').find({}).skip(offset).limit(pageSize)
  // var cursor = db.collection('test').find({}).limit(pageSize).skip(offset)
  cursor.each(function (err, doc) {
    if (err) {
      callback(err, null)
    }
    if (doc != null) {
      result.push(doc)
    } else { // 遍历结束
      // callback(null, result)
      console.log(result)
      db.close()
    }
  }) // end of cursor
})
*/

// U
// https://docs.mongodb.com/v2.4/reference/method/db.collection.update/
// http://mongodb.github.io/node-mongodb-native/2.2/reference/ecmascript6/crud/
// 注：与选择类似，更新操作有许多变体，这里只做一个示例
exports.update = function (collectionName, jsonCondition, jsonAimValue, callback) {
  _connectDB(function (db) {
    db.collection(collectionName).updateMany(
      jsonCondition, jsonAimValue, function (err, result) {
        callback(err, result)
        db.close()
      }
    )
    // db.close()
  })
}

// D
// https://docs.mongodb.com/v2.4/reference/method/db.collection.remove/
// http://mongodb.github.io/node-mongodb-native/2.2/reference/ecmascript6/crud/
exports.delete = function (collectionName, json, callback) {
  _connectDB(function (db) {
    db.collection(collectionName).deleteMany(json, function (err, result) {
      // console.log(result)
      callback(err, result)
      // db.close() // ?
    })
    db.close()
  })
}
