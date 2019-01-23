// timeout Promise
let log4js = require('log4js')
let log = log4js.getLogger('01_Promise_timeout.js')
log.level = 'debug'

log.info('promise timeout begin')

new Promise(resolve => {
  setTimeout(() => {
    resolve('hello')
  }, 2000)
}).then(value => {
  log.info(value + ', world')
})
