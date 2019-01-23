/**
 * 测试nbi分模块
 * 第一次测试时间：2018/6/11
 */

var deviceManage = require('./modules_testbed/DeviceManage')
var devicePerform = require('./modules_testbed/DevicePerform')
var fileAndUpgrade = require('./modules_testbed/FileAndUpgrade')

console.log(deviceManage.msg)
console.log(devicePerform.msg)
console.log(fileAndUpgrade.msg)
