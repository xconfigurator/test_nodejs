// npm install log4js
var log4js = require('log4js')
var log = log4js.getLogger('15_log4js.js')

// 可选级别： trace | debug | info | warn | error | fatal
// trace最详细， fatal最粗糙
log.level = 'trace' // default level is OFF - which means no logs at all.

// //////////////////////////////////////////////////////////////////////
// 使用
log.fatal('fatal') // log4js log4j only console没有这个日志级别
log.error('error')
log.warn('warn')
log.info('info')
log.debug('debug')
log.trace('trace') // log4js log4j only console没有这个日志级别
