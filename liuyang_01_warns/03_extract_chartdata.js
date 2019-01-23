// 测试一下抽取数据的问题
let log4js = require('log4js')
let log = log4js.getLogger('10_test_extract_mongodata.js')
log.level = 'debug'
let MongoClient = require('mongodb').MongoClient
let util = require('util')

const URL = 'mongodb://192.168.61.25:27017/genieacs'

// let MongoClient = require('mongodb').MongoClient
// let warnsConf = require('./warns_cfg')
// let warnsUtil = require('./warns_util')
// let warnsWarnDataOperations = require('./warns_warndata_operations')
// let qs = require('qs')
// let util = require('util')

// 1. 饼状图， 按设备分类
// 依据：《软件中的设备名称及编号_201807031320_from_chenchen.docx》
function getPieChartData () {
  // let pieChartData = {}
  getAllCurrentWarnsData(function (result) {
    // 1. 分析每台设备的告警数(输入 result, 输出dataDeviceList)
    let dataDeviceList = []
    for (let idx in result) {
      let warnsPerDevice = result[idx] // 每台设备的告警信息
      // log.debug('warnsPerDevice = ' + util.inspect(warnsPerDevice))
      let dataPerDevice = {
        'deviceType': warnsPerDevice.deviceType,
        'deviceTypeName': warnsPerDevice.deviceTypeName,
        // 其实模型设计时约定，如果仅在设备具有告警信息的时候即warnData数组的长度不为0时才在warns集合中记录该设备的告警信息
        // 也就是说只要有warnsPerDevice，那么其warnData数组的长度就不为0
        'warnsCount': warnsPerDevice.warnData.length
      }
      dataDeviceList.push(dataPerDevice)
      // log.debug('getPieChartData dataPerDevice = ' + util.inspect(dataPerDevice))
    }
    // 2. 汇总(输入 dataDeviceList, 输出 data)
    // 20180728版本中 车载台和固定台 不区分主机和控制盒
    let cztCount = 0 // 车载台计数器
    let gdtCount = 0 // 固定台计数器
    for (let idx in dataDeviceList) {
      switch (dataDeviceList[idx].deviceType) {
        case '0101': // 车载台主机
        case '0201': // 车载台控制盒
          cztCount += dataDeviceList[idx].warnsCount
          break
        case '0301': // 固定台主机
        case '0401': // 固定台控制盒
          gdtCount += dataDeviceList[idx].warnsCount
          break
        default:
          break
      }
    }
    // 返回数据：参考ECharts的饼图接收范例
    let data = []
    if (cztCount) data.push({'name': '车载台', 'value': cztCount})
    if (gdtCount) data.push({'name': '固定台', 'value': gdtCount})
    log.debug('getPieChartData data = ' + util.inspect(data))
    // response.end(data)
  }) // end of getAllCurrentWarnsData
}

// 2. 柱状图， 按告警等级分类， 然后再按设备分类
function getBarChartData () {
  log.debug('getBarChartData enter')
  getAllCurrentWarnsData(function (result) {
    // 1. 分析每台设备不同告警等级的告警数 (输入 result, 输出dataDeviceList)
    let dataDeviceList = []
    for (let idx in result) {
      let warnsPerDevice = result[idx] // 每台设备的告警信息
      // log.debug('warnsPerDevice = ' + util.inspect(warnsPerDevice))
      let level0Count = 0
      let level1Count = 0
      let level2Count = 0
      for (let i in warnsPerDevice.warnData) {
        switch (warnsPerDevice.warnData[i].Level) {
          case '0':
            level0Count++
            break
          case '1':
            level1Count++
            break
          case '2':
            level2Count++
            break
          default:
            break
        }
      }
      let dataPerDevice = {
        'deviceType': warnsPerDevice.deviceType,
        'deviceTypeName': warnsPerDevice.deviceTypeName,
        // 其实模型设计时约定，如果仅在设备具有告警信息的时候即warnData数组的长度不为0时才在warns集合中记录该设备的告警信息
        // 也就是说只要有warnsPerDevice，那么其warnData数组的长度就不为0
        'level0Count': level0Count,
        'level1Count': level1Count,
        'level2Count': level2Count
      }
      dataDeviceList.push(dataPerDevice)
      // log.debug('getPieChartData dataPerDevice = ' + util.inspect(dataPerDevice))
    }
    // 2. 汇总(输入 dataDeviceList, 输出 data)
    let series = []
    let cztLevel0CountSum = 0
    let cztLevel1CountSum = 0
    let cztLevel2CountSum = 0
    let gdtLevel0CountSum = 0
    let gdtLevel1CountSum = 0
    let gdtLevel2CountSum = 0
    for (let idx in dataDeviceList) {
      switch (dataDeviceList[idx].deviceType) {
        case '0101': // 车载台主机
        case '0201': // 车载台控制盒
          cztLevel0CountSum += dataDeviceList[idx].level0Count
          cztLevel1CountSum += dataDeviceList[idx].level1Count
          cztLevel2CountSum += dataDeviceList[idx].level2Count
          break
        case '0301': // 固定台主机
        case '0401': // 固定台控制盒
          gdtLevel0CountSum += dataDeviceList[idx].level0Count
          gdtLevel1CountSum += dataDeviceList[idx].level1Count
          gdtLevel2CountSum += dataDeviceList[idx].level2Count
          break
        default:
          break
      }
    }
    // 返回数据：参考ECharts的BarCharts接收数据格式示例
    if (cztLevel0CountSum || cztLevel1CountSum || cztLevel2CountSum) { // 车载台告警汇总
      series.push({
        'name': '车载台',
        'data': [cztLevel0CountSum, cztLevel1CountSum, cztLevel2CountSum]
      })
    }
    if (gdtLevel0CountSum || gdtLevel1CountSum || gdtLevel2CountSum) { // 固定台告警汇总
      series.push({
        'name': '固定台',
        'data': [gdtLevel0CountSum, gdtLevel1CountSum, gdtLevel2CountSum]
      })
    }

    let data = {
      'xAxis': {
        'data': ['一般', '严重', '重要'] // 告警等级列表
      },
      'series': series
    }
    log.debug('getBarChartData data = ' + util.inspect(data))
    // response.end(data)
  }) // end of getAllCurrentWarnsData
}

/**
 * 当前告警查询私有方法
 * @param {Fucntion} callback 本函数给callback传递一个参数，即warns的所有告警数据
 */
function getAllCurrentWarnsData (callback) {
  let result = []
  let collectionName = 'warns'
  let json = {}
  let sortJson = {'timestamp': -1} // 模型中timestamp意思是网管系统第一次接到该设备的告警时间

  MongoClient.connect(URL, function (err, db) {
    if (err) log.error(err)
    // 检索所有的当前告警数据
    var cursor = db.collection(collectionName).find(json).sort(sortJson)
    cursor.each(function (err, doc) {
      if (err) log.error(err)
      if (doc !== null) {
        result.push(doc)
      } else { // 遍历结束
        db.close()
        callback(result)
      }
    })
  }) // end of query
}

getPieChartData()
getBarChartData()
