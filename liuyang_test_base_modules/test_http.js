let log4js = require('log4js')
let log = log4js.getLogger('test_http.js')
log.level = 'debug'

let http = require('http')

log.info('test http module')
log.info('http.METHODS: ' + http.METHODS)
