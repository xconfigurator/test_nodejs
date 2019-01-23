let log4js = require('log4js')
let log = log4js.getLogger('12_test_regex_validator.js')
log.level = 'debug'

// log.info('Yo.')

// log.info(Number.isInteger(123))
// log.info(Number.isInteger(123xxx)) // vue的v-model.number会自动把非数字去掉

let reg = /^[-+]?[0-9]+$/
// let reg = /^[-+]?[0-9]+$/
log.info(reg.test('-12'))
log.info(reg.test('+14'))
log.info(reg.test('-132324abc'))
log.info(reg.test('+abc32414314'))
log.info(reg.test('+中文测试'))
