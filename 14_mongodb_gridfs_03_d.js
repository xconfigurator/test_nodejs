// 演示MongoDB GridFS操作 删除
var mongodb = require('mongodb')
var util = require('util')
// var test = require('assert')

const MONGO_URL = 'mongodb://localhost:27017/liuyang_db'
// const FILE_NAME = 'TEST_FILE_NAME.docx'
// const FILE_NAME = 'TEST_FILE_NAME.jpg'
// const FILE_NAME = 'test.docx' // 这俩是通过ObjectId搞进去的
const FILE_NAME = 'test.jpg' // 这俩是通过ObjectId搞进去的

let MongoClient = mongodb.MongoClient
let GridStore = mongodb.GridStore

MongoClient.connect(MONGO_URL, function (err, db) {
  if (err) throw err
  var gridStore = new GridStore(db, FILE_NAME, FILE_NAME, 'w')
  gridStore.unlink(function (err, result) {
    if (err) throw err
    // test.equal(err, null)
    console.log(util.inspect(result))
    db.close()
  })
})
