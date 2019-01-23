/**
 * 告警合并服务日志产品适配
 * 目的: 根据需要在console和log4js两种日志产品之间进行切换
 *   1. 使用console是为了在不引入log4js依赖库的前提下兼容genieacs环境
 *   2. 使用log4js是为了方便本地调试，以及应对后续可能独立该模块后将日志分级保存在文件中（该功能由log4js实现）
 * 使用须知：
 *   1. 可用日志级别 error | warn | info | debug
 *      经实测，console和log4js两种日志产品通用的日志级别为以上四种
 *   2. 调用处不要使用log4js特有的日志级别：不要使用fatal，不要使用trace, 以免造成日志产品切换回console后造成异常。
 * 背景介绍:
 *   1. 当前情况
 *      告警逻辑是嵌入进genieacs工程的，该工程中没有log4js的依赖，出于工程结构稳定性考虑也不打算向genieacs添加log4js依赖
 *      console的日志分级使用繁琐，输出到文件需要配合shell重定向。
 *   2. 远期考虑
 *      该合并逻辑比较复杂，不排除今后提出单独服务。届时只需要修改本文件，切换至log4js输出，并配置输出文件即可。不需要修改servcie的代码。
 * @author liuyang
 * @since  2018/7/20
 *         2018/7/26 适配服务器环境的console对象不存在debug对象的问题
 *         2018/7/27 适配服务器环境的console对象可能不存在其他级别对象的问题
 *
 */
const isLog4jsEnabled = false // 发布至nbi环境选择false，本地调试选择true
const DEFAULT_LOGGER_NAME = 'warns_merge'
const LOGGER_LEVEL = 'debug' // DEBUG | INFO| WARN | ERROR

let log = console // 默认使用console输出
let log4js = null // 存放log4js实例

function getLogger (loggerName) {
  if (isLog4jsEnabled) {
    log4js = require('log4js')
    loggerName = loggerName || DEFAULT_LOGGER_NAME
    log = log4js.getLogger(loggerName)
    log.level = LOGGER_LEVEL
  } else {
    log = console
    log.debug = console.log // 2018/7/26 服务器环境下的console对象竟然没有debug对象
    log.info = console.log
    log.warn = console.log
    log.error = console.log
  }
  return log
}

exports.getLogger = getLogger
