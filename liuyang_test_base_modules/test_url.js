// https://nodejs.org/en/
let log4js = require('log4js')
let log = log4js.getLogger('url.js')
log.level = 'debug'

let url = require('url')

const URL = 'https://nodejs.org/en/'

log.info(url.parse(URL))
log.info(url.format(url.parse(URL)))
url.resolve('https://nodejs.org/', '/en/')
log.info('done')

function print (str) {
  log.info('setInterval called at ' + new Date())
}

function plus (callback) {
  setInterval(function () {
    // log.info('setInterval called at ' + new Date())
    callback()
  }, 1000)
}

plus(print)
log.info('!!!!!after plus but output before plus!!!!!')
