let log4js = require('log4js')
let log = log4js.getLogger('validate_file_name.js')
log.level = 'debug'
/*
// 车载台
CZT_APP.apk.tar.gz
czt_update.tar.gz
firmware-czt_nb3-v01.00.01.bin

// 固定台
GDT_APP.apk.tar.gz
gdt_update.tar.gz
firmware-gdt_nb3-v01.00.01.bin
*/

/**
 * 验证后缀合法性
 * @param {String} fileName
 * @param {String} rule
 */
function validateSuffix (fileName, rule) {
  if (fileName == null || fileName.length == 0) return false // 应对情况：null | ""
  let lastIdx = fileName.toUpperCase().lastIndexOf(rule.toUpperCase())
  if (lastIdx === -1) return false // 应对情况：" " | a.zip (根本就不够长) | GDT_APP.apk.zip | GDT_APP.apk.tar | GDT_APP.apk.gz | GDT_APP.apk.doc
  // if (fileName.toUpperCase().substr(lastIdx, rule.length) != rule.toUpperCase()) return false // 应对情况：GDT_APP.apk.tar.gz.xxxx.zip
  if (fileName.toUpperCase().substring(fileName.length - rule.length, fileName.length) != rule.toUpperCase()) return false
  return true
}

/**
 * 验证前缀合法性
 * @param {String} fileName
 * @param {String} rule
 */
function validatePrefix (fileName, rule) {
  if (fileName == null || fileName.length === 0) return false // 应对情况：null | ""
  let firstIdx = fileName.toUpperCase().indexOf(rule.toUpperCase())
  if (firstIdx !== 0) return false // 应对情况： " " | a.zip (根本就不够长) | 应传GDT_APP.apk.tar.gz 实传 CZT_APP.apk.tar.gz
  return true
}

exports.validatePrefix = validatePrefix
exports.validateSuffix = validateSuffix
