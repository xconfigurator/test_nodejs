var querystring = require('querystring')
const WARNS_REGEX = /^\/warns\/([a-zA-Z0-9\%\!\*\'\(\)\;\:\@\&\=\+\$\,\?\#\[\]\-\_\.\~]+)\/?\/([a-zA-Z0-9\%\!\*\'\(\)\;\:\@\&\=\+\$\,\?\#\[\]\-\_\.\~]+)\/?$/;

/*
let log4js = require('log4js')
let log = log4js.getLogger('02_enter_warns.js')
log.level = 'debug'
*/

// RESTful规划(统一使用post请求) begin
// 当前告警
// /warns/current/query       // 查询
// /warns/current/eliminate   // 消警
// /warns/current/confirm     // 确认 <-- 状态还是告警，显示在当前告警列表
// /warns/current/ignore      // 忽略 <--
// 历史告警
// /warns/histories/query     // 查询
// 在告警合并逻辑中实现-->屏蔽 <-- 状态：屏蔽, 已确认 --> 历史， 依据
// 告警设置
// /warns/set
// 告警屏蔽
// /warns/sheild
// 首页
// /warns/dashboard/piechart // 按设备分类 // TODO
// /warns/dashboard/barchart // 按告警级别分类 // TODO
// RESTful规划(统一使用post请求) end

// 测试！
// 当前告警
const URLs = [
  '/warns/current/query', // 查询
  '/warns/current/eliminate',// 消警
  '/warns/current/confirm', // 确认 <-- 状态还是告警，显示在当前告警列表
  '/warns/current/ignore', // 忽略 <--
  // 历史告警
  '/warns/histories/query',    // 查询
  // 在告警合并逻辑中实现-->屏蔽 <-- 状态：屏蔽, 已确认 --> 历史， 依据
  // 告警设置
  // /warns/set
  // 告警屏蔽
  // /warns/sheild
  // 首页
  '/warns/dashboard/piechart', // 按设备分类 // TODO
  '/warns/dashboard/barchart' // 按告警级别分类 // TODO
]
/*
const URL = '/warns/current/query'       // 查询
const URL = '/warns/current/eliminate'   // 消警
const URL = '/warns/current/confirm'     // 确认 <-- 状态还是告警，显示在当前告警列表
const URL = '/warns/current/ignore'      // 忽略 <--
// 历史告警
const URL = '/warns/histories/query'    // 查询
// 在告警合并逻辑中实现-->屏蔽 <-- 状态：屏蔽, 已确认 --> 历史， 依据
// 告警设置
// /warns/set
// 告警屏蔽
// /warns/sheild
// 首页
const URL = '/warns/dashborad/piechart' // 按设备分类 // TODO
const URL = '/warns/dashboard/barchart' // 按告警级别分类 // TODO
*/

// adapter begin
let urlParts = {}
urlParts.pathname = null
// adapter end

// console.log(WARNS_REGEX.test(URL))
// console.log(WARNS_REGEX.exec(URL))

function testDispatcher(url) {
  urlParts.pathname = url // adapter
  if (WARNS_REGEX.test(urlParts.pathname)) { // 告警服务 add by liuyang 2018/7/26
    console.log('#debug urlParts.pathname = ' + urlParts.pathname)
    let moduleName = querystring.unescape(WARNS_REGEX.exec(urlParts.pathname)[1]) // current | histories | dashborad
    let operationName = querystring.unescape(WARNS_REGEX.exec(urlParts.pathname)[2]) // 模块下的操作名称
    // console.log('#trace moduleName = ' + moduleName)
    // console.log('#trace operationName = ' + operationName)
    // console.log('#trace flag = ' + (moduleName === 'dashboard' && operationName === 'barchart'))

    // 当前告警
    if (moduleName === 'current' && operationName === 'query') { // 查询
      console.log('#debug enter /warns/current/query')
    }
    if (moduleName === 'current' && operationName === 'eliminate') { // 消警
      console.log('#debug enter /warns/current/eliminate')
    }
    if (moduleName === 'current' && operationName === 'confirm') { // 确认
      console.log('#debug enter /warns/current/confirm')
    }
    if (moduleName === 'current' && operationName === 'ignore') { // 忽略
      console.log('#debug enter /warns/current/ignore')
    }

    // 历史告警
    if (moduleName === 'histories' && operationName === 'query') { // 查询
      console.log('#debug enter /warns/histories/query')
    }

    // 告警设置

    // 告警屏蔽

    // 首页告警
    if (moduleName === 'dashboard' && operationName === 'piechart') { // 首页饼图(按设备分)
      console.log('#debug enter /warns/dashboard/piechart')
    }
    if (moduleName === 'dashboard' && operationName === 'barchart') { // 首页柱状图（按告警等级分）
      console.log('#debug enter /warns/dashboard/barchart')
    }
  } // end of 告警服务
}

// 入口逐个测试
for (let idx in URLs) {
  testDispatcher(URLs[idx])
}

