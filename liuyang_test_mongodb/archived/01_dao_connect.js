// 基本封装 _connect
let log4js = require('log4js')
let log = log4js.getLogger('02_dao.js')
log.level = 'debug'
// log.info('02_dao.js')

const MONGO_URL = 'mongodb://localhost:27017/genieacs'
const MongoClient = require('mongodb').MongoClient

const MONGO_COLLESTION_NAME = 'fs.chunks'

/*
MongoClient.connect(MONGO_URL, function (err, db) {
  if (err) log.error(err)
  log.info(db)
})
*/

class DAO {
  constructor (url, collectionName) {
    this.url = url
    this.collectionName = collectionName
  }
  // 连接数据库
  _connect () {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, (err, db) => {
        if (err) return reject(err)
        resolve(db)
      })
    })
  }
}

let dao = new DAO(MONGO_URL, MONGO_COLLESTION_NAME)
dao._connect().then((db) => {
  log.info(db)
})
