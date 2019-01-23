// 分两次顺序执行
let log4js = require('log4js')
let log = log4js.getLogger('02_Promise_sequence.js')
log.level = 'debug'

log.info('promise sequence process!')

new Promise(resolve => {
  setTimeout(() => {
    resolve('hello')
  }, 2000)
}).then(value => {
  log.debug(value + ' at middle then')
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('WORLD')
    }, 2000)
  })
}).then(value => {
  log.info(value + ' ,world')
})
