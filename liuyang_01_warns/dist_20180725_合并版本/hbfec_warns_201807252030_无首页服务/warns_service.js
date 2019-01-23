/**
 * 描述：为告警模块提供服务
 * 模块包括：当前告警/历史告警/告警设置/告警屏蔽
 * @author liuyang
 * @since  2018/7/23
 * @update 2018/7/26 历史告警增加时间维度
 */
let logProvider = require('./warns_logprovider') // 适配console和log4js
let log = logProvider.getLogger('warns_service.js')

let MongoClient = require('mongodb').MongoClient
let warnsConf = require('./warns_cfg')
let warnsUtil = require('./warns_util')
let warnsWarnDataOperations = require('./warns_warndata_operations')
let qs = require('qs')
// let util = require('util')

// 当前告警
/**
 * 当前告警检索逻辑
 * /warns/current/query
 * @param req reques对象
 * @param resp response对象
 * @param currentPage 当前页号
 * @param pageSize 每页显示的记录数
 * @param deviceId 设备ID
 * @param warnLevel 告警等级
 */
function currentWarnsQuery (req, resp, currentPage, pageSize, deviceId, warnLevel) {
  log.debug('currentWarnsQuery')
  resp.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  })

  // 查询字符串
  let queryStr = {}
  if (deviceId) queryStr['deviceId'] = deviceId
  if (warnLevel) queryStr['warnData.Level'] = warnLevel
  log.debug('queryStr = ' + qs.stringify(queryStr))
  log.debug('queryStr = ' + JSON.stringify(queryStr))
  log.debug('queryStr = ' + queryStr)

  // 模型：
  let pageInfo = {
    total: 0,
    data: []
  }

  // 检索
  // 第一步： 算总数
  MongoClient.connect(warnsConf.url, function (err, db) {
    if (err) log.error(err)
    db.collection(warnsConf.COLLECTION_NAME_WARNS).count(queryStr, function (err, count) {
      if (err) log.error(err)
      log.debug('pageInfo total = ' + count)
      pageInfo.total = count
      // 第二步: 查每页的数据
      let offset = (currentPage - 1) * pageSize // vue pagination currentPage从1开始
      let result = []
      // let cursor = db.collection(warnsConf.COLLECTION_NAME_WARNS).find(queryStr).skip(offset).limit(pageSize).sort({'n': -1})// 排序需要修改
      let cursor = db.collection(warnsConf.COLLECTION_NAME_WARNS).find(queryStr).skip(offset).limit(pageSize)

      cursor.each(function (err, doc) {
        if (err) log.error(err)
        if (doc != null) {
          let table = processWarnsForView(doc)
          for (let rownum in table) {
            result.push(table[rownum])
          }
          // result.push(doc)
        } else {
          db.close()
          pageInfo.data = result
          log.debug('pageInfo = ' + qs.stringify(pageInfo))
          resp.end(qs.stringify(pageInfo)) // 返回数据
        }
      }) // end of cursor
    })
  }) // end of query
}

// /warns/current/eliminate   // 消警
// 注意warnItem已经是warns_service.js处理过的二维化的告警记录，包含deviceId
function currentWarnsEliminate (req, resp, warnItem) {
  log.debug('currentWarnsEliminate')
  resp.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  })

  // 向待归档至历史告警的信息中添加状态字段
  warnItem['status'] = '1' // 设备自动消警的情况 状态改为消警告 参见文档《终端二代网管概要设计文档_liuyang_标注版本_20180613.doc》 2018/7/25 add
  warnItem['isChecked'] = '1' // 设备自动消警的情况 状态设置为未确认 参见文档《终端二代网管概要设计文档_liuyang_标注版本_20180613.doc》 2018/7/25 add
  warnItem.TimeResolved = warnsUtil.getCurrentDateTimeStr()

  // 1. 归档该信息至warnsHistories集合
  MongoClient.connect(warnsConf.url, function (err, db) {
    if (err) log.error(err)
    db.collection(warnsConf.COLLECTION_NAME_WARNS_HISTORIES).insertOne(warnItem, function (err, result) {
      if (err) log.error(err)
      log.debug('currentWarnsEliminate archived to warnsHistories result = ' + JSON.stringify(result))
      db.close()
    })
  }) // end of warnsHistories

  // 2. 操作warns集合，删掉设备信息中的相应告警条目
  // 第一步 查询设备的告警信息
  MongoClient.connect(warnsConf.url, function (err, db) {
    if (err) log.error(err)
    let findStrGetWarnInfo = {'deviceId': warnItem.deviceId}
    log.debug('findStrGetWarnInfo = ' + findStrGetWarnInfo)
    let result = []
    let cursor = db.collection(warnsConf.COLLECTION_NAME_WARNS).find(findStrGetWarnInfo)
    cursor.each(function (err, doc) {
      if (err) log.error(err)
      if (doc != null) {
        result.push(doc)
      } else {
        // 第二步 删除设备告警列表中的指定项目
        let warnsInfo = result[0]
        warnsInfo.warnData = warnsWarnDataOperations.warnDataDelete(warnsInfo.warnData, warnItem)
        // 第三步 更新告警集合
        if (warnsInfo.warnData.length === 0) { // 该设备已无告警信息，则从数据库中删除该设备的告警文档
          db.collection(warnsConf.COLLECTION_NAME_WARNS).deleteMany({'deviceId': warnsInfo.deviceId}, function (err, result) {
            if (err) log.error(err)
            log.debug('currentWarnsEliminate 删除该设备告警记录 deviceId =' + warnsInfo.deviceId)
            db.close()
            resp.end('success')
          })
        } else { // 如果该设备仍然有告警信息，则更新数据库中的告警文档
          db.collection(warnsConf.COLLECTION_NAME_WARNS).updateMany({'deviceId': warnsInfo.deviceId}, {$set: {'warnData': warnsInfo.warnData}}, function (err, result) {
            if (err) log.error(err)
            log.debug('currentWarnsEliminate 更新 数据库更新返回结果 result = ' + JSON.stringify(result))
            db.close()
            resp.end('success')
          })
        }//
      }
    }) // end of cursor
  })// end of warns
}

// /warns/current/confirm     // 确认 <-- 状态还是告警，显示在当前告警列表
function currentWarnsConfirm (req, resp, deviceId, warnItem) {
  //
}

// /warns/current/ignore      // 忽略 <--
function currentWarnsIgnore (req, resp, warnItem) {
  log.debug('currentWarnsIgnore')
  resp.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  })
  // 向待归档至历史告警的信息中添加状态字段
  warnItem['status'] = '2' // 设备自动消警的情况 状态改为消警告 参见文档《终端二代网管概要设计文档_liuyang_标注版本_20180613.doc》 2018/7/25 add
  warnItem['isChecked'] = '1' // 设备自动消警的情况 状态设置为未确认 参见文档《终端二代网管概要设计文档_liuyang_标注版本_20180613.doc》 2018/7/25 add
  warnItem.TimeResolved = warnsUtil.getCurrentDateTimeStr()

  // 1. 归档该信息至warnsHistories集合
  MongoClient.connect(warnsConf.url, function (err, db) {
    if (err) log.error(err)
    db.collection(warnsConf.COLLECTION_NAME_WARNS_HISTORIES).insertOne(warnItem, function (err, result) {
      if (err) log.error(err)
      log.debug('currentWarnsEliminate archived to warnsHistories result = ' + JSON.stringify(result))
      db.close()
    })
  }) // end of warnsHistories

  // 2. 操作warns集合，删掉设备信息中的相应告警条目
  // 第一步 查询设备的告警信息
  MongoClient.connect(warnsConf.url, function (err, db) {
    if (err) log.error(err)
    let findStrGetWarnInfo = {'deviceId': warnItem.deviceId}
    log.debug('findStrGetWarnInfo = ' + findStrGetWarnInfo)
    let result = []
    let cursor = db.collection(warnsConf.COLLECTION_NAME_WARNS).find(findStrGetWarnInfo)
    cursor.each(function (err, doc) {
      if (err) log.error(err)
      if (doc != null) {
        result.push(doc)
      } else {
        // 第二步 删除设备告警列表中的指定项目
        let warnsInfo = result[0]
        warnsInfo.warnData = warnsWarnDataOperations.warnDataDelete(warnsInfo.warnData, warnItem)
        // 第三步 更新告警集合
        if (warnsInfo.warnData.length === 0) { // 该设备已无告警信息，则从数据库中删除该设备的告警文档
          db.collection(warnsConf.COLLECTION_NAME_WARNS).deleteMany({'deviceId': warnsInfo.deviceId}, function (err, result) {
            if (err) log.error(err)
            log.debug('currentWarnsEliminate 删除该设备告警记录 deviceId =' + warnsInfo.deviceId)
            db.close()
            resp.end('success')
          })
        } else { // 如果该设备仍然有告警信息，则更新数据库中的告警文档
          db.collection(warnsConf.COLLECTION_NAME_WARNS).updateMany({'deviceId': warnsInfo.deviceId}, {$set: {'warnData': warnsInfo.warnData}}, function (err, result) {
            if (err) log.error(err)
            log.debug('currentWarnsEliminate 更新 数据库更新返回结果 result = ' + JSON.stringify(result))
            db.close()
            resp.end('success')
          })
        }//
      }
    }) // end of cursor
  })// end of warns
}

// 历史告警
// 在告警合并逻辑中实现-->屏蔽 <-- 状态：屏蔽, 已确认 --> 历史， 依据
/**
 * 历史告警查询
 * /warns/histories/query
 *
 * @param req reques对象
 * @param resp response对象
 * @param currentPage 当前页号
 * @param pageSize 每页显示的记录数
 * @param deviceId 设备ID
 * @param warnLevel 告警等级
 * @param timeFrom 起始时间
 * @param timeTo 终止时间
 */
function historiesWarnsQuery (req, resp, currentPage, pageSize, deviceId, warnLevel, timeFrom, timeTo) {
  log.debug('historiesWarnsQuery')
  resp.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  })

  // 查询字符串
  let queryStr = {}
  if (deviceId) queryStr['deviceId'] = deviceId
  if (warnLevel) queryStr['Level'] = warnLevel // 注意与当前告警模型不同
  let queryTime = {}
  if (timeFrom) queryTime['$gte'] = timeFrom
  if (timeTo) queryTime['$lte'] = timeTo
  if (timeFrom || timeTo) queryStr['TimeCreated'] = queryTime

  log.debug('queryStr qs.stringify = ' + qs.stringify(queryStr))
  log.debug('queryStr JSON.stringify = ' + JSON.stringify(queryStr))
  log.debug('queryStr = ' + queryStr)

  // 模型：
  let pageInfo = {
    total: 0,
    data: []
  }

  // 检索
  // 第一步： 算总数
  MongoClient.connect(warnsConf.url, function (err, db) {
    if (err) log.error(err)
    db.collection(warnsConf.COLLECTION_NAME_WARNS_HISTORIES).count(queryStr, function (err, count) {
      if (err) log.error(err)
      log.debug('pageInfo total = ' + count)
      pageInfo.total = count
      // 第二步: 查每页的数据
      let offset = (currentPage - 1) * pageSize // vue pagination currentPage从1开始
      let result = []
      // let cursor = db.collection(warnsConf.COLLECTION_NAME_WARNS).find(queryStr).skip(offset).limit(pageSize).sort({'n': -1})// 排序需要修改
      let cursor = db.collection(warnsConf.COLLECTION_NAME_WARNS_HISTORIES).find(queryStr).skip(offset).limit(pageSize).sort({'TimeResolved': -1})

      cursor.each(function (err, doc) {
        if (err) log.error(err)
        if (doc != null) {
          result.push(doc) // 注意历史告警记录的模型与当前告警不同
        } else {
          db.close()
          pageInfo.data = result
          log.debug('pageInfo = ' + qs.stringify(pageInfo))
          resp.end(qs.stringify(pageInfo)) // 返回数据
        }
      }) // end of cursor
    })
  }) // end of query
}

//
/**
 * 将单条设备告警信息二维化，以方便前端表格展现
 * 当前告警查询私有方法
 * @param {Object} deviceWarnInfo
 * @return {Array} 二维化后的设备告警信息
 * 命名结构约定
 * deviceWarnInfo {
 *  warnData: {
 *    warnItem,
 *    warnItem,
 *    ...
 *  }
 * }
 */
function processWarnsForView (deviceWarnInfo) {
  let result = []
  if (!deviceWarnInfo) return result
  if (!deviceWarnInfo.warnData) return result

  let deviceId = deviceWarnInfo.deviceId
  let deviceType = deviceWarnInfo.deviceType
  let deviceTypeName = deviceWarnInfo.deviceTypeName
  let timestamp = deviceWarnInfo.timestamp

  let record = {}
  for (let idx in deviceWarnInfo.warnData) {
    record = deviceWarnInfo.warnData[idx]
    record.deviceId = deviceId
    record.deviceType = deviceType
    record.deviceTypeName = deviceTypeName
    record.timestamp = timestamp
    result.push(record)
  }

  return result
}

exports.currentWarnsQuery = currentWarnsQuery
exports.currentWarnsEliminate = currentWarnsEliminate
exports.currentWarnsConfirm = currentWarnsConfirm
exports.currentWarnsIgnore = currentWarnsIgnore
exports.historiesWarnsQuery = historiesWarnsQuery
