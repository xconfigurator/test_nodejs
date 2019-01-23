let MongoClient = require('mongodb').MongoClient
let conf = require('./08_test_warn_length_cfg.js')
// let util = require('util')

const isLogEnabled = true // 是否输出日志 注意：打印异常不受此标志控制。
const isTrace = true // 设置为true，配合日志级别为debug，可以查看告警合并信息的更详细的跟踪记录。(log4js支持trace级别，但console没有trace级别，为了兼容，故设置这个标志)

let log4js = require('log4js')
let log = log4js.getLogger('08_test_warn_length.js')
log.level = 'debug'

const COLLECTION_NAME_DEVICES = 'devices'

// //////////////////////////////////////////////////////////////////////////////////////////
// 数据库操作公共方法 begin
function _connectDB (callback) {
  MongoClient.connect(conf.url, function (err, db) {
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

findAll(COLLECTION_NAME_DEVICES, {'_id': 'FFFFFF-Generic-FFFFFF123456'}, function (err, result) {
  if (err) log.error(err)
  // log.info(util.inspect(result[0].InternetGatewayDevice.warn))
  if (!result[0].InternetGatewayDevice.warn) return
  if (!result[0].InternetGatewayDevice.warn.warn) return

  let warnObj = result[0].InternetGatewayDevice.warn.warn
  let num = 0
  for (var key in warnObj) {
    if (key === '_object') continue // 跳过_object属性
    if (key === '_writable') continue // 跳过_writable属性 适配CPE1.0设备告警报文
    num++
  }
  log.info('warnData.length = ' + num)
})
