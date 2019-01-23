// 演示MongoDB GridFS 写入
/*
Opens the file from the database and initialize this object. Also creates a
new one if file does not exist.
*/
// import mongodb from 'mongodb'
var mongodb = require('mongodb')

const MONGO_URL = 'mongodb://localhost:27017/liuyang_db'
/*
const FILE_NAME = 'TEST_FILE_NAME.jpg'
const FILE_PATH = 'E:/home/liuyang/workspace/mongodb_cmd_test/test.jpg'
*/
const FILE_NAME = 'TEST_FILE_NAME.docx'
const FILE_PATH = 'E:/home/liuyang/workspace/mongodb_cmd_test/test.docx'
let MongoClient = mongodb.MongoClient
let GridStore = mongodb.GridStore

MongoClient.connect(MONGO_URL, function (err, db) {
  if (err) throw err
  var gridStore = new GridStore(db, FILE_NAME, FILE_NAME, 'w')
  // Open a new File
  gridStore.open(function (err, gridStore) {
    if (err) throw err
    // Write the file to gridFS
    gridStore.writeFile(FILE_PATH, function (err, doc) {
      if (err) throw err
      console.log(doc)

      db.close()
    })
  })
})

/*
// A simple example showing how to write a file to Gridstore using file location path.

var MongoClient = require('mongodb').MongoClient,
  GridStore = require('mongodb').GridStore,
  ObjectID = require('mongodb').ObjectID,
  test = require('assert');
MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
  // Our file ID
  var fileId = new ObjectID();

  // Open a new file
  var gridStore = new GridStore(db, fileId, 'w');

  // Read the filesize of file on disk (provide your own)
  var fileSize = fs.statSync('./test/functional/data/test_gs_weird_bug.png').size;
  // Read the buffered data for comparision reasons
  var data = fs.readFileSync('./test/functional/data/test_gs_weird_bug.png');

  // Open the new file
  gridStore.open(function(err, gridStore) {

    // Write the file to gridFS
    gridStore.writeFile('./test/functional/data/test_gs_weird_bug.png', function(err, doc) {

      // Read back all the written content and verify the correctness
      GridStore.read(db, fileId, function(err, fileData) {
        test.equal(data.toString('base64'), fileData.toString('base64'))
        test.equal(fileSize, fileData.length);

        db.close();
      });
    });
  });
});
*/

/*
// 读本地文件
var request = require("request");
var fs = require("fs");
var data = fs.readFileSync('/root/chenchen/runlog-TAU-2017-08-28.tar.gz');
console.log(data);
var options = {
    url: 'http://localhost:7557/files/runlog-TAU-2017-08-28.tar.gz',
    body: data,
    headers: {
        fileType: "2",
        oui: "FFFFFF",
        productClass: "Generic",
        version: "22"
    }
};
*/
