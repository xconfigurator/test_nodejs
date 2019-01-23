/**
 * MongoDB dao测试
 */
let log4js = require('log4js')
let log = log4js.getLogger('dao_test.js')
log.level = 'debug'

 // const MONGO_URL = 'mongodb://192.168.109.20:27017/genieacs'
const MONGO_URL = 'mongodb://localhost:27017/genieacs'
const COLLECTION_NAME = 'fs.files'

// TODO
