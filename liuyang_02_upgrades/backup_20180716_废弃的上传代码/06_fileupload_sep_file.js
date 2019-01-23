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
var express = require('express')
var app = express()

var upgrades = require('./nbi-upgrade-devices-formidable')

// AJAX上传第一阶段 options
app.options('/upload', function (req, res) {
  upgrades.options(req, res)
})

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
app.post('/upload', function (req, res) {
  upgrades.upload(req, res)
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
