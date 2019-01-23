// 功能：上传、入库、删除
// @author liuyang
// @since 2018/7/9
// @update 2018/7/9 使用express重构了一下，明显思路更清晰了
//         2018/7/10 使用统一的metadata结构替代之前使用的单独建立集合（upgrades）的方案
//         2018/7/10 业务代码分离至nbi-upgrade-devices.js
// formidable 参考示例：https://www.npmjs.com/package/formidable
// npm install formidable
// npm install silly-datetime
// 目前问题：
//  1. 如果文件上传失败 （如超过允许上传最大值）之后就会发生异常，引起临时上传临时文件无法被删除（对策: 考虑try catch）
//  2. 上传300m级别附件已成功入库（eclipse.zip）可正常删除临时文件及解压缩文件， 但等待的时间略长，可考虑增加提示。(建议后续再添加)
// var http = require('http')
// var express = require('express')
// var app = express()

var mongodb = require('mongodb')
var formidable = require('formidable')
var sd = require('silly-datetime')
var util = require('util')
var path = require('path')
var fs = require('fs')

const isDebug = false
const MONGO_URL = 'mongodb://127.0.0.1:27017/genieacs' // 目标数据库
const DELETE_TMP_UPLOADED_FILE = true // true： 删除上传的临时文件 false: 保存上传的临时文件
const UPGRADE_COLLECTION_NAME = 'fs.files' // 升级记录集合名称
/* formidable 文件上传配置参数 */
// 完整参数API：https://www.npmjs.com/package/formidable
const FILE_UPLOAD_CFG = {
  // fileUploadDir: 'E:/home/liuyang/workspace/test_nodejs/upload' // ok
  uploadDir: './upload', // ok
  keepExtensions: true, // 保留扩展名
  encoding: 'utf-8',
  maxFileSize: 500 * 1024 * 1024 // 500M
}
// Mongo
let MongoClient = mongodb.MongoClient
let GridStore = mongodb.GridStore

// AJAX上传第一阶段 options
var options = function (req, res) {
  res.writeHead(200, {// 跨域处理
    'content-type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  })
  res.end()
}

// AJAX上传第二阶段 post
// 1. 向GridFS中保存升级文件
// 2. 向GridFS中保存升级文件的元信息中保存升级文件的元数据
/*
{
  fileType: 'ForDeviceUpgrade', // 标记这个文件是供设备升级使用的, 陈晨使用的是这个字段，这里为统一队形使用同一字段。值是各自约定，只要能区分开就可以。
  deviceTypeName:'', // 设备类型名称
  deviceCode:'', // 设备编码
  firmwareName:'', // 固件文件名（全局唯一的，在上传模块中加了时间戳和随机数）
  uploadTime:'' // 上传时间 （与陈晨保持一致，使用new Date()的方式保存）
}
*/
var upload = function (req, res) {
  // parse a file upload
  var form = new formidable.IncomingForm()
  // 设置自定义的配置项
  form.uploadDir = FILE_UPLOAD_CFG.uploadDir
  form.keepExtensions = FILE_UPLOAD_CFG.keepExtensions
  form.encoding = FILE_UPLOAD_CFG.encoding
  form.maxFileSize = FILE_UPLOAD_CFG.maxFileSize
  // 处理上传文件
  // if (isDebug) console.log('#debug req = ' + util.inspect(req))
  form.parse(req, function (err, fields, files) {
    if (err) throw err

    res.writeHead(200, {// 跨域处理
      'content-type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    })

    // if (isDebug) console.log('#debug files = ' + util.inspect(files))
    // if (isDebug) console.log('#debug files.file = ' + util.inspect(files.file))
    if (!files) { // 容错 for element-ui
      res.end() // OK 2018/7/6 是不是ajax方式的提交都会有这种问题？
      return
    }
    if (!files.file) { // 容错 for element-ui
      res.end()
      return
    }

    console.log('## fields = ' + util.inspect(fields))

    // 处理上传字段
    let deviceTypeName = '主机' // 设备类型名称
    let deviceCode = '0101' // 设备代码

    // 处理上传文件
    let timestamp = sd.format(new Date(), 'YYYYMMDDHHmmss')
    let randnum = parseInt(Math.random() * 89999 + 10000) + '' // 改成字符串是必须的，否则path做join操作的时候会报错
    let extname = path.extname(files.file.name) // 抽取文件的扩展名
    let basename = path.basename(files.file.name, extname)
    // newpath 格式(新文件名格式) ：上传文件名称_时间戳.文件后缀
    let newFileName = basename + '_' + timestamp + randnum + extname
    let oldpath = path.join(__dirname, '/', files.file.path)
    let newpath = path.join(__dirname, '/upload/', newFileName)
    if (isDebug) console.log('#debug newpath = ' + newpath)
    // 第一步 上传完成后重命名
    fs.rename(oldpath, newpath, function (err) {
      if (err) console.log(err)
      // 第二步 文件入库
      MongoClient.connect(MONGO_URL, function (err, db) {
        if (err) console.log(err)
        // 升级文件元数据
        let metadata = {
          fileType: 'ForDeviceUpgrade', // 标记这个文件是供设备升级使用的
          deviceTypeName: deviceTypeName, // 设备类型名称
          deviceCode: deviceCode, // 设备编码
          firmwareName: newFileName, // 固件文件名（全局唯一的，在上传模块中加了时间戳和随机数）
          uploadTime: new Date() // 上传时间 timestamp
        }
        var gridStore = new GridStore(db, newFileName, newFileName, 'w', {metadata: metadata})
        gridStore.open(function (err, gridStore) { // 在GridFS中打开一个文件
          if (err) console.log(err)
          // gridStore.writeFile(FILE_PATH, function (err, doc) {
          gridStore.writeFile(newpath, function (err, doc) { // 向GridF中写文件(从上传的临时路径到MongoDB)
            if (err) console.log(err)
            if (isDebug) console.log(doc)
            // 第三步 删除上传文件文件
            if (DELETE_TMP_UPLOADED_FILE) {
              fs.unlink(newpath, function (err) {
                if (err) console.log(err)
              })
            }
            db.close()
            res.end('upload success.') // HTTP Response Body
            /*
            // 第四步 向Upgrades文档中写入设备升级记录
            let upgradeDoc = {
              deviceTypeName: deviceTypeName, // 设备类型名称
              deviceCode: deviceCode, // 设备编码
              firmwareName: newFileName, // 固件文件名（全局唯一的，在上传模块中加了时间戳和随机数）
              uploadTime: timestamp // 上传时间
            }
            if (isDebug) console.log('#debug upgradeDoc = ' + JSON.stringify(upgradeDoc))
            db.collection(UPGRADE_COLLECTION_NAME).insertOne(upgradeDoc, function (err, result) {
              if (err) console.log(err)
              db.close()
              res.end('upload success.') // HTTP Response Body
            })
            */
          })// end of gridStore.writeFile
        })
      })// end of MongoDB
    })// end of fs rename
  })// end of process '/upload'
}

// 删除
// 示例url /delete?file=test_2018070910242897437.jpg
// http://localhost:8081/delete?file=test_2018070918061698865.jpg
var deleteFile = function (req, res) {
  if (isDebug) console.log('#debug /delete 删除文件')
  if (isDebug) console.log('#debug req.url = ' + req.url)
  if (isDebug) console.log('#debug /delete fileName = ' + req.param('file'))

  let fileName = req.param('file') // 获得参数这个地方需要和目标环境适配
  MongoClient.connect(MONGO_URL, function (err, db) {
    if (err) console.log(err)
    // var gridStore = new GridStore(db, FILE_NAME, FILE_NAME, 'w')
    // 第一步 删除固件文件
    var gridStore = new GridStore(db, fileName, fileName, 'w')
    gridStore.unlink(function (err, result) {
      if (err) console.log(err)
      // test.equal(err, null)
      if (isDebug) console.log(util.inspect(result))
      db.close()
      res.writeHead(200, {// 跨域处理
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
      res.end('delete success')
      /*
      // 第二步 删除
      var upgradeDoc = {
        firmwareName: fileName
      }
      db.collection(UPGRADE_COLLECTION_NAME).deleteOne(upgradeDoc, function (err, result) {
        if (err) console.log(err)
        db.close()
        res.end('delete success')
      })
      */
    })
  })
}

// 检索数据
// http://localhost:8081/query?deviceCode=0101
var query = function (req, res) {
  let result = []
  if (isDebug) console.log('#debug /query 设备编码')
  if (isDebug) console.log('#debug req.url = ' + req.url)
  if (isDebug) console.log('#debug /query deviceCode = ' + req.param('deviceCode'))

  let deviceCode = req.param('deviceCode') // 这个地方需要适配
  MongoClient.connect(MONGO_URL, function (err, db) {
    if (err) console.log(err)

    // findAll begin
    var queryCondition = {
      'metadata.fileType': { $eq: 'ForDeviceUpgrade' }
    }
    if (deviceCode !== '') {
      queryCondition = {
        'metadata.fileType': { $eq: 'ForDeviceUpgrade' },
        'metadata.deviceCode': deviceCode
      }
    }
    // findAll end
    if (isDebug) console.log('#debug query queryCondition = ' + JSON.stringify(queryCondition))
    var cursor = db.collection(UPGRADE_COLLECTION_NAME).find(queryCondition)
    cursor.each(function (err, doc) {
      if (err) console.log(err)
      if (doc !== null) {
        result.push(doc)
      } else {
        db.close()
        res.writeHead(200, {// 跨域处理
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        })
        if (isDebug) console.log(JSON.stringify(result))
        res.end(JSON.stringify(result))
      }
    }) // end of cursor
  })
}

exports.options = options
exports.upload = upload
exports.deleteFile = deleteFile
exports.query = query
// exports.getDeviceList = getDeviceList // TODO
// exports.doUpgrade = doUpgrade // TODO
