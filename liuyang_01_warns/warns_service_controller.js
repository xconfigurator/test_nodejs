// 集成进nbi前的临时入口
// 计划集成进工程的时候使用nbi的统一入口，而不使用本文件提供的方式
// @author liuyang
// @since 2018/7/16
// @update 2018/7/16
//         2018/7/27 增加首页分析图数据请求入口
// 规划：
// 1. 通用在express和nbi之间做适配的时候采取以下通用配置策略
//    在控制器中将能解析出来的参数都解析出来，并将request和response对象传递给service
// 2. 当前告警合并模块的特殊点：
//    只需要传递设备ID给service，nbi-warns-merge与主控脚本可并行执行，且主控脚本不需要等待nbi-warns-merge返回
const SERVER_PORT = 8081

let express = require('express')
let app = express()
let bodyParser = require('body-parser')
let util = require('util')
let qs = require('qs')

// let warnsConf = require('./warns-cfg')
let warnsService = require('./warns_service')

// 日志
// const isLogEnabled = true // 是否输出日志 注意：打印异常不受此标志控制。
// const isTrace = true // 设置为true，配合日志级别为debug，可以查看告警合并信息的更详细的跟踪记录。(log4js支持trace级别，但console没有trace级别，为了兼容，故设置这个标志)
let logProvider = require('./warns_logprovider') // 适配console和log4js
let log = logProvider.getLogger('warns_service_controller.js')

app.use(bodyParser.urlencoded({ extended: false }))

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
// /warns/set/
// 告警屏蔽
// /warns/sheild/
// 首页
// /warns/dashboard/piechart // 按设备分类
// /warns/dashboard/barchart // 按时间分类
// RESTful规划(统一使用post请求) end

// 当前告警
// /warns/current/query       // 查询
// http://localhost:8081/warns/current/query
app.post('/warns/current/query', function (req, resp) {
  log.debug('/warns/current/query')

  let currentPage = parseInt(req.body.currentPage)
  let pageSize = parseInt(req.body.pageSize)
  let deviceId = req.body['deviceId[2]'] // 使用多维度的选择框需要时使用req.body.deviceId[2]来接收
  let warnLevel = req.body.warnLevel

  log.debug('body = ' + util.inspect(req.body))
  log.debug('currentPage = ' + currentPage)
  log.debug('pageSize = ' + pageSize)
  log.debug('deviceId = ' + deviceId)
  log.debug('warnLevel = ' + warnLevel)

  warnsService.currentWarnsQuery(req, resp, currentPage, pageSize, deviceId, warnLevel)
})

// /warns/current/eliminate   // 消警 状态是消警，归档到历史告警中
// http://localhost:8081/warns/current/eliminate
app.post('/warns/current/eliminate', function (req, resp) {
  log.debug('/warns/current/eliminate')

  let warnItem = qs.parse(req.body.warnItem)
  log.debug('warnItem = ' + util.inspect(warnItem))

  warnsService.currentWarnsEliminate(req, resp, warnItem) // 注意warnItem已经是warns_service.js处理过的二维化的告警记录，包含deviceId
})

// /warns/current/confirm     // 确认 <-- 状态还是告警，显示在当前告警列表
// http://localhost:8081/warns/current/confirm
// 目前（20180724这个版本不需要这个功能，界面暂时隐藏即可）
app.post('/warns/current/confirm', function (req, resp) {
  log.debug('/warns/current/confirm')
  resp.end('/warns/current/confirm')
})

// /warns/current/ignore      // 忽略 状态是忽略，归档到历史告警中
// http://localhost:8081/warns/current/ignore
app.post('/warns/current/ignore', function (req, resp) {
  log.debug('/warns/current/ignore')

  let warnItem = qs.parse(req.body.warnItem)
  log.debug('warnItem = ' + util.inspect(warnItem))

  warnsService.currentWarnsIgnore(req, resp, warnItem)
})

// 历史告警
// /warns/histories/query     // 查询
// http://localhost:8081/warns/histories/query
app.post('/warns/histories/query', function (req, resp) {
  log.debug('/warns/histories/query')

  let currentPage = parseInt(req.body.currentPage)
  let pageSize = parseInt(req.body.pageSize)
  let deviceId = req.body['deviceId[2]'] // 使用多维度的选择框需要时使用req.body.deviceId[2]来接收
  let warnLevel = req.body.warnLevel
  let timeFrom = req.body.timeFrom
  let timeTo = req.body.timeTo

  log.debug('body = ' + util.inspect(req.body))
  log.debug('currentPage = ' + currentPage)
  log.debug('pageSize = ' + pageSize)
  log.debug('deviceId = ' + deviceId)
  log.debug('warnLevel = ' + warnLevel)
  log.debug('timeFrom = ' + timeFrom)
  log.debug('timeTo = ' + timeTo)

  warnsService.historiesWarnsQuery(req, resp, currentPage, pageSize, deviceId, warnLevel, timeFrom, timeTo) // 注意warnItem已经是warns_service.js处理过的二维化的告警记录，包含deviceId
})

// /warns/dashboard/piechart
// http://localhost:8081/warns/dashboard/piechart
// 按设备分类告警数据
app.get('/warns/dashboard/piechart', function (request, response) {
  log.debug('/warns/dashboard/piechart')
  warnsService.getDashboardPieChartData(request, response)
})

// /warns/dashboard/barchart
// http://localhost:8081/warns/dashboard/barchart
app.get('/warns/dashboard/barchart', function (request, response) {
  log.debug('/warns/dashboard/barchart')
  warnsService.getDashboradBarChartData(request, response)
})

// 启动服务器并输出日志
app.set('port', process.env.PORT || SERVER_PORT)
var server = app.listen(app.get('port'), function () {
  log.info('warns_service_controller listening on server', server.address().address, ' on port ', server.address().port, ' with pid ', process.pid)
})
