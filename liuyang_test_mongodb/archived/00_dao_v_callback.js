// 测试MongoDB使用node.js来连接的代码。
// 最基本的使用方式
let log4js = require('log4js')
let log = log4js.getLogger('dao.js')
log.level = 'debug'
// log.debug('test.mongo.dao.js')

const MONGO_URL = 'mongodb://localhost:27017/genieacs'
const MongoClient = require('mongodb').MongoClient
MongoClient.connect(MONGO_URL, function (err, db) {
  if (err) return log.error(err) // 可以这样写？
  log.info(db)
})
