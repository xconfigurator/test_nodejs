let log = null
const isLog4jsEnabled = false // true: 使用log4js, false: 使用console

/**
 * log4js
 */
if (isLog4jsEnabled) {
  let log4js = require('log4js')
  log4js.configure('./conf/log4js.json')
  log = log4js.getLogger('16_log_adapter.js')
  // log.level = 'debug'
}

/**
* console
*/
if (!isLog4jsEnabled) {
  log = console
}

/**
 * 容错，默认使用console
 */
log = log || console

// //////////////////////////////////////////////////////////////////////
// 使用
if (isLog4jsEnabled) log.fatal('fatal') // log4js log4j only
log.error('error')
log.warn('warn')
log.info('info')
log.debug('debug')
if (isLog4jsEnabled) log.trace('trace') // log4js log4j only
