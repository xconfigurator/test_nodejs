// 同6 使用陈晨提供的axios的方法
var express = require('express')
var app = express()

var upgrades = require('./nbi-upgrade-devices')

// AJAX上传第一阶段 options
app.options('/upload', function (req, res) {
  upgrades.options(req, res)
})

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
app.post('/upload', function (request, response) {
  // let body = request.getBody()
  // upgrades.upload(request, response, body)
})

// 删除
// 示例url /delete?file=test_2018070910242897437.jpg
// http://localhost:8081/delete?file=test_2018070918061698865.jpg
app.get('/delete', function (req, res) {
  upgrades.deleteFile(req, res)
})

// 检索数据
// http://localhost:8081/query?deviceCode=0101
app.get('/query', function (req, res) {
  upgrades.query(req, res)
})

app.listen(8081)
