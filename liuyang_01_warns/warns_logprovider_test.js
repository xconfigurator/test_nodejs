
/**
 * nbi-warns-service-logprovider测试，以及典型使用场景
 * @author liuyang
 * @since  2018/7/20
 */

// let isLog4jsEnabled = false // 这个标志在nbi-warns-service-logprovider.js中调整 true：使用log4js输出日志， false： 使用console输出日志
let isLogEnabled = true // true： 输出日志， false： 关闭日志
// console和log4js通用的日志级别如下(实测)： DEBUG | INFO| WARN | ERRO
let logProvider = require('./warns_logprovider')
let log = logProvider.getLogger('warns_logprovider_test.js')

// 测试：基本使用场景
if (isLogEnabled) log.error('error')
if (isLogEnabled) log.warn('warn')
if (isLogEnabled) log.info('info')
if (isLogEnabled) log.debug('debug')

// 测试：抛出异常时的使用场景
let MongoClient = require('mongodb').MongoClient
// var conf = require('./db.conf.js')
let conf = require('./warns_cfg')
let util = require('util')

function _connectDB (callback) {
  MongoClient.connect(conf.url, function (err, db) {
    if (err) log.err(err)
    // if (isDebug) console.log('连接成功')
    callback(db)
  })
}

_connectDB(function (db) {
  if (isLogEnabled) log.info(db) // 示例1
  if (isLogEnabled) log.debug(util.inspect(db)) // 示例2
  db.close()
})
