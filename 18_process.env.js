let util = require('util')
let log4js = require('log4js')

let log = log4js.getLogger('18_process.env.js')
log.level = 'debug'

log.debug('process.env = ', util.inspect(process.env))
log.debug('process.env.HOST = ', process.env.HOST)
log.debug('process.env.PORT = ', process.env.PORT)
