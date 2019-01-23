// 功能：上传、入库、删除
// @author liuyang
// @since 2018/7/9
// @update 2018/7/9 使用express重构了一下，明显思路更清晰了
//         2018/7/10 使用统一的metadata结构替代之前使用的单独建立集合（upgrades）的方案
//         2018/7/10 业务代码分离至nbi-upgrade-devices.js
//         2018/7/10 20:07 使用陈晨提供的axios解决方案, 这个版本代码需要融合进nbi才能正常运行，调试需要服务器环境。
// formidable 参考示例：https://www.npmjs.com/package/formidable
// npm install formidable
// npm install silly-datetime
// 目前问题：
//  1. 如果文件上传失败 （如超过允许上传最大值）之后就会发生异常，引起临时上传临时文件无法被删除（对策: 考虑try catch）
//  2. 上传300m级别附件已成功入库（eclipse.zip）可正常删除临时文件及解压缩文件， 但等待的时间略长，可考虑增加提示。(建议后续再添加)

var mongodb = require('mongodb')
var sd = require('silly-datetime')
var util = require('util')
var path = require('path')
var fs = require('fs')

const isDebug = true
const MONGO_URL = 'mongodb://127.0.0.1:27017/genieacs' // 目标数据库
const DELETE_TMP_UPLOADED_FILE = true // true： 删除上传的临时文件 false: 保存上传的临时文件
const UPGRADE_COLLECTION_NAME = 'fs.files' // 升级记录集合名称
const TMP_FILE_PATH = '/tmp/genieacs/upload' // 上传文件临时目录

// Mongo
let MongoClient = mongodb.MongoClient
let GridStore = mongodb.GridStore

// AJAX上传第一阶段 options
var options = function (req, res) {
  console.log('#debug ')
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
  forUpgradeDevice: 'CZT' // 本升级模块标记，值为设备大类  TAU | CAE | CZT | GDT
  fileName:'', // 固件文件名（全局唯一的，在上传模块中加了时间戳和随机数）
  uploadTime:'' // 上传时间 （与陈晨保持一致，使用new Date()的方式保存）
  deviceCode:'', // 设备编码
  deviceTypeName:'', // 设备类型名称(deviceCode在码表中的名称))
  fileType: '', // 设备类型 （参考“系统功能_201806270921_from_chenchen.docx”）
  fileTypeName: '' // 文件类型名称（fileType在码表中的名称）
}
*/
var upload = function (req, res, body) {
  // if (isDebug) console.log('#debug upload body = ' + util.inspect(body))
  let bodyParsed = JSON.parse(body)

  // 文件:1. 获取文件base64字符串
  let data = bodyParsed.data
  // if (isDebug) console.log('#debug upload data before split = ' + data)
  data = data.split('base64,')[1] || ''// 文件具体数据 20180712 大文件有可能接收不到
  if (isDebug) console.log('#debug upload data (first 1000 characters)= ' + data.substring(0, 1000)) // 看前1000个字符

  // 文件: 2. 保存到放到本地临时目录下( TMP_FILE_PATH )
  // 2.1 改名，使用带时间戳的策略（genieacs中使用文件名做唯一标志）
  let timestamp = sd.format(new Date(), 'YYYYMMDDHHmmss')
  let randnum = parseInt(Math.random() * 89999 + 10000) + '' // 改成字符串是必须的，否则path做join操作的时候会报错
  let extname = path.extname(bodyParsed.fileName) // 抽取文件的扩展名
  let basename = path.basename(bodyParsed.fileName, extname)
  // newpath 格式(新文件名格式) ：上传文件名称_时间戳.文件后缀
  let newFileName = basename + '_' + timestamp + randnum + extname
  // let oldpath = path.join(__dirname, '/', files.file.path)
  // let newpath = path.join(__dirname, '/upload/', newFileName)
  let newpath = path.join(TMP_FILE_PATH, newFileName)
  if (isDebug) console.log('#debug upload newpath = ' + newpath)
  // 2.2 用新文件名写到本地指定目录
  let fileDataBuffer = Buffer.from(data, 'base64') // 把base64码转成buffer对象
  // if (isDebug) console.log('#debug upload fileDataBuffer = ' + fileDataBuffer)
  fs.writeFileSync(newpath, fileDataBuffer, function (err) {
    if (err) console.log(err)
  })

  // 表单字段
  // if (isDebug) console.log('#debug upload bodyParsed = ' + util.inspect(bodyParsed))
  let metadata = {
    forUpgradeDevice: bodyParsed.forUpgradeDevice,
    fileName: newFileName, // 固件文件名（全局唯一的，在上传模块中加了时间戳和随机数）
    uploadTime: new Date(), // 上传时间 timestamp
    deviceCode: bodyParsed.deviceCode,
    deviceTypeName: bodyParsed.deviceTypeName,
    fileType: bodyParsed.fileType,
    fileTypeName: bodyParsed.fileTypeName
  }
  if (isDebug) console.log('#debug upload metadata = ' + JSON.stringify(metadata))

  // 文件入库，并删除临时文件 （DELETE_TMP_UPLOADED_FILE）
  // processFile(newpath, metadata, res)
  res.writeHead(200, {// 跨域处理
    'content-type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  })
  // for debug ...
  res.end('upload success.')
  // for debug ...

  // 文件入库
  MongoClient.connect(MONGO_URL, function (err, db) {
    if (err) console.log(err)
    var gridStore = new GridStore(db, newFileName, newFileName, 'w', { metadata: metadata })
    gridStore.open(function (err, gridStore) { // 在GridFS中打开一个文件
      if (err) console.log(err)
      gridStore.writeFile(newpath, function (err, doc) { // 向GridF中写文件(从上传的临时路径到MongoDB)
        if (err) console.log(err)
        // if (isDebug) console.log(doc)
        // 删除上传文件文件
        if (DELETE_TMP_UPLOADED_FILE) {
          fs.unlink(newpath, function (err) {
            if (err) console.log(err)
          })
        }
        db.close()
        res.end('upload success.') // HTTP Response Body
      })// end of gridStore.writeFile
    })
  })// end of MongoDB
}

// 删除
// 示例url /delete?file=test_2018070910242897437.jpg
// http://localhost:8081/delete?file=test_2018070918061698865.jpg
var deleteFile = function (req, res, body) {
  if (isDebug) console.log('#debug deleteFile /delete 删除文件')
  if (isDebug) console.log('#debug deleteFile req.url = ' + req.url)
  // if (isDebug) console.log('#debug deleteFile /delete fileName = ' + req.param('file'))

  // let fileName = req.param('file') // 获得参数这个地方需要和目标环境适配
  let bodyParsed = JSON.parse(body)
  let fileName = bodyParsed.fileName
  if (isDebug) console.log('#debug deleteFile fileName = ' + fileName)

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
    })
  })
}

// 检索数据
// http://localhost:8081/query?deviceCode=0101
var query = function (req, res, body) {
  let result = []
  let bodyParsed = JSON.parse(body)
  // let deviceCode = req.param('deviceCode') // TODO 这个地方需要适配
  let deviceCode = bodyParsed.deviceCode
  let forUpgradeDevice = bodyParsed.forUpgradeDevice

  if (isDebug) console.log('#debug query req.url = ' + req.url)
  if (isDebug) console.log('#debug query /query deviceCode = ' + deviceCode)
  if (isDebug) console.log('#debug query /query forUpgradeDevice = ' + forUpgradeDevice)

  MongoClient.connect(MONGO_URL, function (err, db) {
    if (err) console.log(err)

    // findAll begin
    /*
    var queryCondition = {
      'metadata.forUpgradeDevice': { $eq: 'CZT' } // TODO 后续改成传参
    }
    if (deviceCode !== '') {
      queryCondition = {
        'metadata.forUpgradeDevice': { $eq: 'CZT' }, // TODO 后续改成传参
        'metadata.deviceCode': deviceCode
      }
    }
    */
    var queryCondition = {
      'metadata.forUpgradeDevice': forUpgradeDevice // TODO 后续改成传参
    }
    if (deviceCode !== '') {
      queryCondition = {
        'metadata.forUpgradeDevice': forUpgradeDevice, // TODO 后续改成传参
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

exports.options = options // 不知道有没有用
exports.upload = upload // OK
exports.deleteFile = deleteFile // OK
exports.query = query // OK
// exports.getDeviceList = getDeviceList // TODO
// exports.doUpgrade = doUpgrade // TODO
