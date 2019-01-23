let log4js = require('log4js')
let log = log4js.getLogger('00_dao_v_callback.js')
log.level = 'debug'

const MONGO_URL = 'mongodb://localhost:27017/genieacs'
// const MONGO_URL = 'mongodb://192.168.109.20:27017/genieacs'
const MongoClient = require('mongodb').MongoClient

MongoClient.connect(MONGO_URL, (err, db) => {
  if (err) {
    log.error(err)
    return
  }
  log.info(db)
  db.close()
})
