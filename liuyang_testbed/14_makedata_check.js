// 目的：需要核查CPE设备的
let log4js = require('log4js')
let log = log4js.getLogger('14_makedata_check.js')
log.level = 'debug'

let mongodb = require('mongodb')
const MONGO_URL = 'mongodb://192.168.109.20:27017/genieacs'
const MONGO_DOCUMENT = 'devices'
let MongoClient = mongodb.MongoClient

MongoClient.connect(MONGO_URL, function (err, db) {
  if (err) {
    log.error(err)
  }
  let result = []
  var collection = db.collection(MONGO_DOCUMENT)
  let cursor = collection.find({'_id': 'FFFFFF-0801-FFFFFF0CEFAFC4E8A8'})
  cursor.each(function (err, doc) {
    if (err) log.error(err)
    if (doc != null) {
      result.push(doc)
    } else {
      db.close()
      log.info(JSON.stringify(result))
    }
  })
})
