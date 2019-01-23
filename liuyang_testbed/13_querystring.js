let log4js = require('log4js')
let log = log4js.getLogger('13_querystring.js')
log.level = 'debug'

let querystring = require('querystring')

log.debug('test querystring')

let str = 'https://baike.baidu.com/item/HTTP%E7%8A%B6%E6%80%81%E7%A0%81/5053660'

log.info('str (before unescape) = \n' + str)
log.info('str (after unescape) = \n' + querystring.unescape(str)) // 可以翻译回汉语
log.info('str (re escape) = \n' + querystring.escape(querystring.unescape(str))) // 和str有所不同
log.info('str (after unescape) = \n' + querystring.unescape(querystring.escape(querystring.unescape(str)))) // 可以翻译回与第二句相同的URL
