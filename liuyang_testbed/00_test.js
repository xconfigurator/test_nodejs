let log4js = require('log4js')
let log = log4js.getLogger('00_test.js')
log.level = 'debug'

// 下线设备ID的集合。 仅记录已下线设备ID
let ID1 = 'FFFFFF-0301-FFFFFF303233311C4D0230B8D812679111'
let downDevicesSet = []
log.debug(downDevicesSet.includes(ID1))
downDevicesSet.push(ID1)
log.debug(downDevicesSet.includes())

log.info(ID1.substr(ID1.indexOf('-') + 1, 4))

log.info("hello, GitHub")

/*
let str = '宁波3车头:FFFFFF-0301-FFFFFF303233311C4D0230B8D812679111'
// let str = 'FFFFFF-0301-FFFFFF303233311C4D0230B8D812679111'
// let str = ''

log.info(str == null ? '' : str.split(':')[0])
*/

/*
// 上传返回状态
// 具体能够识别出来的错误以bin/check_firmware.sh为基础，参考脚本注释。
// const RESPONSE_UPLOAD_SUCCESS = 'success' // 文件上传
const RESPONSE_UPLOAD_CHECK_FAILURE_1 = '校验失败:固件已损坏或提供了错误的md5值。' // check_firmware.sh返回值是1的提示
const RESPONSE_UPLOAD_CHECK_FAILURE_2 = '校验失败:升级包格式不正确，有md5值文件或固件文件缺失。' // check_firmware.sh返回值是2的提示
const RESPONSE_UPLOAD_CHECK_FAILURE_3 = '校验失败:您上传了非法文件。' // check_firmware.sh返回值是3的提示

const result = 3

// 反馈校验提示信息
let responseMessage = ''
switch (result) {
  case 1:
    responseMessage = RESPONSE_UPLOAD_CHECK_FAILURE_1
    break
  case 2:
    responseMessage = RESPONSE_UPLOAD_CHECK_FAILURE_2
    break
  default:
    responseMessage = RESPONSE_UPLOAD_CHECK_FAILURE_3
}
log.info('校验固件完整性  向前端返回校验提示信息：' + responseMessage)
*/

/*
let message = 'hello'
function getReverse (str) {
  return str.split('').reverse().join('')
}

console.log(message)
console.log(getReverse(message))
*/

/*
console.log('#############################################')
const STR = '.gz'
console.log(STR)
console.log(STR.toUpperCase())
*/

/*
var date1 = new Date('2017-09-03 05:22:29')
var date2 = new Date('2017-09-03 05:22:15')

var date3 = new Date('2017-9-3 7:44:29')
var date4 = new Date('2017-09-03 07:44:29')

console.log(date1)
console.log(date2)
console.log(date1 > date2)
console.log('date3 = ' + date3)
console.log('date4 = ' + date4)
console.log(date3 === date4)
console.log(date3 > date4)
console.log(date3 < date4)
*/

// var util = require('util')
/*
var mongodb = require('mongodb')
let MongoClient = mongodb.MongoClient

const MONGO_URL = 'mongodb://localhost:27017/liuyang_db'
const UPGRADE_COLLECTION_NAME = 'upgrades'

let result = []

MongoClient.connect(MONGO_URL, function (err, db) {
  if (err) console.log(err)

  // findAll
  var queryCondition = {
    deviceCode: '0101'
  }
  console.log('#debug query queryCondition = ' + JSON.stringify(queryCondition))
  var cursor = db.collection(UPGRADE_COLLECTION_NAME).find(queryCondition)
  // console.log('#debug query curor = ' + util.inspect(cursor))
  cursor.each(function (err, doc) {
    if (err) console.log(err)
    if (doc !== null) {
      result.push(doc)
      console.log(JSON.stringify(doc))
    } else {
      console.log(JSON.stringify(result))
    }
  }) // end of cursor

  db.close()
})
*/
