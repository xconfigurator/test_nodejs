// 参考示例：https://www.npmjs.com/package/formidable
// 带测试代码
var formidable = require('formidable')
var http = require('http')
var util = require('util')
var path = require('path')
var fs = require('fs')
var sd = require('silly-datetime')

/* formidable 文件上传配置参数 */
// 完整参数API：https://www.npmjs.com/package/formidable
const FILE_UPLOAD_CFG = {
  // fileUploadDir: 'E:/home/liuyang/workspace/test_nodejs/upload' // ok
  uploadDir: './upload', // ok
  keepExtensions: true, // 保留扩展名
  encoding: 'utf-8'
}

http.createServer(function (req, res) {
  // if (req.url === '/upload' && req.method.toLowerCase() === 'post') {
  // 就这个问题，需要翻阅一下计算机网络的“Web应用和HTTP协议”一节
  // if (req.url === '/upload' && req.method.toLowerCase() === 'options') { // 配合表单提交使用
  if (req.url === '/upload') { // 测试上传和保留
    // parse a file upload
    var form = new formidable.IncomingForm()
    // 设置自定义的配置项
    form.uploadDir = FILE_UPLOAD_CFG.uploadDir
    form.keepExtensions = FILE_UPLOAD_CFG.keepExtensions
    form.encoding = FILE_UPLOAD_CFG.encoding
    form.parse(req, function (err, fields, files) {
      if (err) throw err

      // 上传文件改名 begin
      // 测试上传文件信息 for Demo FORM begin
      /*
      let timestamp = sd.format(new Date(), 'YYYYMMDDHHmmss')
      let randnum = parseInt(Math.random() * 89999 + 10000) + '' // 改成字符串是必须的，否则path做join操作的时候会报错
      let extname = path.extname(files.upload.name) // 抽取文件的扩展名
      let newFileName = timestamp + randnum + extname
      let oldpath = path.join(__dirname, '/', files.upload.path)
      let newpath = path.join(__dirname, '/upload/', newFileName)
      console.log('#debug oldpath = ' + oldpath)
      console.log('#debug newpath = ' + newpath)
      console.log('#debug newFileName = ' + newFileName)
      console.log('#debug files.upload.name = ' + files.upload.name)
      console.log('#debug extname = ' + extname)
      // 改名
      fs.rename(oldpath, newpath, function (err) {
        if (err) console.log(err)
      })
      */
      // 测试上传文件信息 for Demo FORM end

      // 测试上传文件信息 for element upload FORM begin
      // 与默认测试页面不同，
      /*
      let timestamp = sd.format(new Date(), 'YYYYMMDDHHmmss')
      let randnum = parseInt(Math.random() * 89999 + 10000) + '' // 改成字符串是必须的，否则path做join操作的时候会报错
      let extname = path.extname(files.file.name) // 抽取文件的扩展名
      let newFileName = timestamp + randnum + extname
      let oldpath = path.join(__dirname, '/', files.file.path)
      let newpath = path.join(__dirname, '/upload/', newFileName)
      console.log('#debug oldpath = ' + oldpath)
      console.log('#debug newpath = ' + newpath)
      console.log('#debug newFileName = ' + newFileName)
      console.log('#debug files.file.name = ' + files.file.name)
      console.log('#debug extname = ' + extname)
      // 改名
      fs.rename(oldpath, newpath, function (err) {
        if (err) console.log(err)
      })
      */

      res.writeHead(200, {
        'content-type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      })

      console.log('#debug files = ' + util.inspect(files))
      console.log('#debug files.file = ' + util.inspect(files.file))
      // console.log('#debug files.file.name = ' + util.inspect(files.file.name))
      // let heiheihei = files.file.name
      // console.log('#debug files.file.name = ' + heiheihei)
      // 呃， 竟然有一个空
      if (!files) {
        res.end() // OK 2018/7/6 是不是ajax方式的提交都会有这种问题？
        return
      }
      if (!files.file) {
        res.end()
        return
      }

      // 测试上传文件信息 for element upload FORM begin
      let timestamp = sd.format(new Date(), 'YYYYMMDDHHmmss')
      let randnum = parseInt(Math.random() * 89999 + 10000) + '' // 改成字符串是必须的，否则path做join操作的时候会报错
      let extname = path.extname(files.file.name) // 抽取文件的扩展名
      let newFileName = timestamp + randnum + extname
      let oldpath = path.join(__dirname, '/', files.file.path)
      let newpath = path.join(__dirname, '/upload/', newFileName)
      console.log('#debug oldpath = ' + oldpath)
      console.log('#debug newpath = ' + newpath)
      console.log('#debug newFileName = ' + newFileName)
      console.log('#debug files.file.name = ' + files.file.name)
      console.log('#debug extname = ' + extname)
      // 改名 TODO 尝试一下renameSync
      fs.rename(oldpath, newpath, function (err) {
        if (err) console.log(err)
      })
      // 测试上传文件信息 for element upload FORM end
      // 上传文件改名 end
      // res.writeHead(200, {'content-type': 'text/plain'})
      // liuyang begin
      res.writeHead(200, {
        'content-type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      })
      // liuyang end
      res.write('received upload:\n\n')
      res.end(util.inspect({fields: fields, files: files}))// util.inspect 是查看对象内部的信息
    })
    // return
  }

  // show a file upload form
  // 仅单独测试时使用，否则注释掉
  /*
  res.writeHead(200, {'content-type': 'text/html'})
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">' +
    '<input type="text" name="title"><br>' +
    '<input type="file" name="upload" multiple="multiple"><br>' +
    '<input type="submit" value="Upload">' +
    '</form>'
  )
  */
}).listen(8081)
