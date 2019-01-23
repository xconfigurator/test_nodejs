// 演示MongoDB GridFS 读取
var mongodb = require('mongodb')
// var test = require('assert')
var util = require('util')

const MONGO_URL = 'mongodb://localhost:27017/liuyang_db'
const FILE_NAME = 'TEST_FILE_NAME.docx'

let MongoClient = mongodb.MongoClient
let GridStore = mongodb.GridStore

MongoClient.connect(MONGO_URL, function (err, db) {
  if (err) throw err
  // Read back all the written content and verify the correctness
  GridStore.read(db, FILE_NAME, function (err, fileData) {
    if (err) throw err
    console.log(util.inspect(fileData))
    /*
    test.equal(data.toString('base64'), fileData.toString('base64'))
    test.equal(fileSize, fileData.length)
    */
    db.close()
  })
})
