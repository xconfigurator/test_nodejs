/**
* 描述：告警信息合并逻辑需要的数据库操作
*
* @author liuyang
* @since  2018/7/23 从告警信息合并逻辑主程序中分离出来
*/
let MongoClient = require('mongodb').MongoClient
let warnsConf = require('./warns_cfg')

// //////////////////////////////////////////////////////////////////////////////////////////
// 日志相关 begin
// console和log4js通用的日志级别： DEBUG | INFO| WARN | ERRO
// 使用样例:
// if (isLogEnabled) log.debug()
// if (isLogEnabled) log.info()
// 对err的处理：
// 即在处理err的地方，不判断isLogEnabled标志，统一使用log.error(err)输出，方便后续收集、查看。
const isLogEnabled = false // 是否输出日志 注意：打印异常不受此标志控制。
const isTrace = true // 设置为true，配合日志级别为debug，可以查看告警合并信息的更详细的跟踪记录。(log4js支持trace级别，但console没有trace级别，为了兼容，故设置这个标志)
let logProvider = require('./warns_logprovider') // 适配console和log4js
let log = logProvider.getLogger('warns_merge_db.js')
// 日志相关 end

// //////////////////////////////////////////////////////////////////////////////////////////
// 数据库操作公共方法 begin
function _connectDB (callback) {
  MongoClient.connect(warnsConf.url, function (err, db) {
    if (err) log.error(err)
    if (isLogEnabled && isTrace) log.debug('mongodb connect success')
    callback(db)
  })
}

function findAll (collectionName, json, callback) {
  /*
  // TODO 需要参数判断
  if (arguments.length !== 3) {
    // callback('', null) // 这个咋写
  }
  */

  if (isLogEnabled) {
    log.debug('collectionName = ' + collectionName)
    log.debug('json = ' + JSON.stringify(json))
    // log.debug('callback = ' + callback)
  }

  _connectDB(function (db) {
    var result = []
    var cursor = db.collection(collectionName).find(json)
    cursor.each(function (err, doc) {
      if (err) {
        callback(err, null)
      }
      if (doc !== null) {
        result.push(doc)
      } else { // 遍历结束
        callback(null, result)
      }
    }) // end of cursor

    db.close()
  })
}

/*
// TODO 临时为当前告警信息定制一个按时间倒叙排序的方法
function findAllWithSort (collectionName, json, sortJson, callback) {
  // TODO 需要参数判断
  // if (arguments.length !== 4) {
    // callback('', null) // 这个咋写
  // }

  if (isLogEnabled) {
    log.debug('collectionName = ' + collectionName)
    log.debug('json = ' + JSON.stringify(json))
    log.debug('sortJson = ' + JSON.stringify(sortJson))
    log.debug('callback = ' + callback)
  }

  _connectDB(function (db) {
    var result = []
    var cursor = db.collection(collectionName).find(json).sort(sortJson)
    cursor.each(function (err, doc) {
      if (err) {
        callback(err, null)
      }
      if (doc !== null) {
        result.push(doc)
      } else {
        // 遍历结束
        callback(null, result)
      }
    }) // end of cursor

    db.close()
  })
}
*/

function insertOne (collectionName, json, callback) {
  _connectDB(function (db) {
    db.collection(collectionName).insertOne(json, function (err, result) {
      callback(err, result)
      db.close()
    })
  })
}

function update (collectionName, jsonCondition, jsonAimValue, callback) {
  _connectDB(function (db) {
    db.collection(collectionName).updateMany(
      jsonCondition, jsonAimValue, function (err, result) {
        callback(err, result)
        db.close()
      }
    )
  })
}

function deleteOne (collectionName, json, callback) {
  _connectDB(function (db) {
    db.collection(collectionName).deleteMany(json, function (err, result) {
      callback(err, result)
      db.close()
    })
  })
}
// 数据库操作公共方法 end

exports.findAll = findAll
exports.insertOne = insertOne
exports.update = update
exports.deleteOne = deleteOne
