/**
 * 设备升级 控制器
 * 【功能】上传、入库、删除
 * formidable 参考示例：https://www.npmjs.com/package/formidable
 * 【依赖】
 * npm install formidable
 * npm install silly-datetime
 * 【目前问题】
 *  1. 如果文件上传失败 （如超过允许上传最大值）之后就会发生异常，引起临时上传临时文件无法被删除（对策: 考虑try catch）
 *  2. 上传300m级别附件已成功入库（eclipse.zip）可正常删除临时文件及解压缩文件， 但等待的时间略长，可考虑增加提示。(建议后续再添加)
 * @author liuyang
 * @since 2018/7/9
 */
var http = require('http')
var util = require('util')
var path = require('path')
var fs = require('fs')
var formidable = require('formidable')
var sd = require('silly-datetime')
var mongodb = require('mongodb')

// ///////////////////////////////////////////////////////
// 可配置项 begin
const isDebug = false
const MONGO_URL = 'mongodb://localhost:27017/liuyang_db' // 目标数据库
const DELETE_TMP_UPLOADED_FILE = true // true： 删除上传的临时文件 false: 保存上传的临时文件
/* formidable 文件上传配置参数 */
// 完整参数API：https://www.npmjs.com/package/formidable
const FILE_UPLOAD_CFG = {
  // fileUploadDir: 'E:/home/liuyang/workspace/test_nodejs/upload' // ok
  uploadDir: './upload', // ok
  keepExtensions: true, // 保留扩展名
  encoding: 'utf-8',
  maxFileSize: 500 * 1024 * 1024 // 500M
}
// 可配置项 end

// Mongo
let MongoClient = mongodb.MongoClient
let GridStore = mongodb.GridStore

http.createServer(function (req, res) {
  if (req.url === '/upload') { // 测试上传和保留
    // parse a file upload
    var form = new formidable.IncomingForm()
    // 设置自定义的配置项
    form.uploadDir = FILE_UPLOAD_CFG.uploadDir
    form.keepExtensions = FILE_UPLOAD_CFG.keepExtensions
    form.encoding = FILE_UPLOAD_CFG.encoding
    form.maxFileSize = FILE_UPLOAD_CFG.maxFileSize
    // 处理上传文件
    form.parse(req, function (err, fields, files) {
      if (err) throw err

      res.writeHead(200, {// 跨域处理
        'content-type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      })

      if (isDebug) console.log('#debug files = ' + util.inspect(files))
      if (isDebug) console.log('#debug files.file = ' + util.inspect(files.file))
      if (!files) { // 容错 for element-ui
        res.end() // OK 2018/7/6 是不是ajax方式的提交都会有这种问题？
        return
      }
      if (!files.file) { // 容错 for element-ui
        res.end()
        return
      }

      let timestamp = sd.format(new Date(), 'YYYYMMDDHHmmss')
      let randnum = parseInt(Math.random() * 89999 + 10000) + '' // 改成字符串是必须的，否则path做join操作的时候会报错
      let extname = path.extname(files.file.name) // 抽取文件的扩展名
      let basename = path.basename(files.file.name, extname)
      // newpath 格式(新文件名格式) ：上传文件名称_时间戳.文件后缀
      let newFileName = basename + '_' + timestamp + randnum + extname
      let oldpath = path.join(__dirname, '/', files.file.path)
      let newpath = path.join(__dirname, '/upload/', newFileName)
      console.log('#debug newpath = ' + newpath)
      // 第一步 上传完成后重命名
      fs.rename(oldpath, newpath, function (err) {
        if (err) console.log(err)
        // 第二步 文件入库
        MongoClient.connect(MONGO_URL, function (err, db) {
          if (err) console.log(err)
          // var gridStore = new GridStore(db, FILE_NAME, FILE_NAME, 'w')
          var gridStore = new GridStore(db, newFileName, newFileName, 'w')
          gridStore.open(function (err, gridStore) { // 在GridFS中打开一个文件
            if (err) console.log(err)
            // gridStore.writeFile(FILE_PATH, function (err, doc) {
            gridStore.writeFile(newpath, function (err, doc) { // 向GridF中写文件(从上传的临时路径到MongoDB)
              if (err) console.log(err)
              if (isDebug) console.log(doc)
              // 第三步 删除上传文件文件
              if (DELETE_TMP_UPLOADED_FILE) {
                console.log('#debug newpath (删除文件前)) = ' + newpath)
                fs.unlink(newpath, function (err) {
                  if (err) console.log(err)
                })
              }
              db.close()
              res.end('upload success.') // HTTP Response Body
            })
          })
        })// end of MongoDB
      })// end of fs rename
      // res.end('upload success.') // HTTP Response Body
    })// end of process '/upload'
  }
}).listen(8081)
