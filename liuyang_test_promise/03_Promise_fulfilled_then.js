// 演示一个Promise已经完成之后再次调用then
let log4js = require('log4js')
let log = log4js.getLogger('03_Promise_fulfilled_then.js')
log.level = 'debug'

log.info('03_promise_fulfilled_then.js')

let promise = new Promise(resolve => {
  setTimeout(() => {
    log.info('the promise fulfilled')
    resolve('hello, world')
  }, 1000)
})

log.info('####################################')

setTimeout(() => {
  promise.then(value => {
    log.debug(value)
  })
}, 3000)

setTimeout(() => {
  promise.then(value => {
    log.debug(value)
  })
}, 3000)

setTimeout(() => {
  promise.then(value => {
    log.debug(value)
  })
}, 3000)
