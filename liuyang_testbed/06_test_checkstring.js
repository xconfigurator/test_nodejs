var log4js = require('log4js')
var log = log4js.getLogger('06_test_checkstring.js')
log.level = 'info'

var checkstring = function (data) {
  /*
  data = data + ''
  data = data.replace('K', '')
  data = data.replace('%', '')
  data = data.replace('\n', '')
  */
  if (typeof data === 'string') {
    log.debug('debug string')
    data = data.trim()
  } else {
    log.debug('debug non string')
    // nop
  }
  return data
}

var str = 'hello, world\n\r'
// var str = 'hello'

console.log('###########################')
console.log(checkstring(str))
console.log('###########################')
console.log('###########################')
console.log(str)
console.log('###########################')
