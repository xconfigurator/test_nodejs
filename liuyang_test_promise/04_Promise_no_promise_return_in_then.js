// 加入在.then()的函数里不返回Promise，会怎样？
let log4js = require('log4js')
let log = log4js.getLogger('04_Promise_no_promise_return_in_then.js')
log.level = 'debug'

const TIMEOUT = 2000

new Promise(resolve => {
  setTimeout(() => {
    resolve('hello')
  }, TIMEOUT)
}).then(value => {
  log.debug(value)
  log.debug('everyone')
  /*
  (function () {
    return new Promise(resolve => {
      setTimeout(() => {
        log.info('Mr.Laurence')
        resolve('Merry Xmas')
      }, TIMEOUT)
    })
  }())
  */
  // return true
  // return 88 // 并不会阻止后面的then运行
  // return false
  // 如果不返回则后面的then接收到的value就是undefined
}).then(value => {
  log.info(value + ', world')
})
