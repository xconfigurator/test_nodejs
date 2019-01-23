let log4js = require('log4js')
let log = log4js.getLogger('validate_file_name_test.js')
log.level = 'debug'

let validator = require('./validate_file_name')

let FIRMWARE_SUFFIX_HOST = '.bin' // 主机固件合法后缀名
let FIRMWARE_PREFIX_HOST = 'firmware-czt' // 主机固件合法前缀
let FIRMWARE_SUFFIX_CONTROLBOX = '.tar.gz' // 控制盒固件合法后缀名
let FIRMWARE_PREFIX_CONTROLBOX_APP = 'czt_app' // 车载台应用前缀
let FIRMWARE_PREFIX_CONTROLBOX_FIRMWARE = 'czt_update' // 车载台固件前缀

let fileNames = [
  'czt_APP.apk.tar.gz', // 后缀：true， APP前缀：true
  'czt_APP.apk.v01.00.01.tar.gz', // 后缀：true， APP前缀：true
  'czt_update.tar.gz', // 后缀：true， 固件前缀：true
  'czt_update.v01.00.01.tar.gz', // 后缀：true， 固件前缀：true
  '', // false
  ' ', // fase
  null, // false
  'a.zip', // false
  'b.doc', // false
  'czt_update.v01.00.01.tar.gz.doc', // false
  'gdt_APP.apk.tar.gz', // 后缀：true， 前缀：false
  'GDT_APP.apk.v01.00.01.tar.gz', // 后缀：true， 前缀：false
  'gdt_update.tar.gz', // 后缀：true， 前缀：false
  'gdt_update.v01.00.01.tar.gz' // 后缀：true， 前缀：false
]

// 车载台控制盒为例即可
// /////////////////////////////////////////////////
// 1. 控制盒 后缀
log.info('# 验控制盒后缀 ####################################################')
for (let idx in fileNames) {
  // log.info(fileNames[idx])
  log.info(validator.validateSuffix(fileNames[idx], FIRMWARE_SUFFIX_CONTROLBOX) + '\t\t <--' + fileNames[idx])
}

/*
log.info('#fileName = ' + fileName)
log.info(validator.validateSuffix(fileName, FIRMWARE_SUFFIX_CONTROLBOX))
*/

// 2. 控制盒 APP 前缀
log.info('# 验控制盒前缀 APP ####################################################')
for (let idx in fileNames) {
  // log.info(fileNames[idx])
  log.info(validator.validatePrefix(fileNames[idx], FIRMWARE_PREFIX_CONTROLBOX_APP) + '\t\t <--' + fileNames[idx])
}
// 3. 控制盒 固件 前缀
log.info('# 验控制盒前缀 固件 ####################################################')
for (let idx in fileNames) {
  // log.info(fileNames[idx])
  log.info(validator.validatePrefix(fileNames[idx], FIRMWARE_PREFIX_CONTROLBOX_FIRMWARE) + '\t\t <--' + fileNames[idx])
}
