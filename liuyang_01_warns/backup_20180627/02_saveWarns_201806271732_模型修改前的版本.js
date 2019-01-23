/**
 * 描述：从设备信息devices集合中分离出告警信息保存进入warns集合
 * 参考：chenchen saveDevicePerform(deviceId) in db.js
 * 文档依据：《南向接口》 《概要设计文档》
 * 功能点：
 * 1. 告警信息抽取，从devices集合中抽取，插入warns集合   extractWarnsInfo
 * 2. 告警信息对比逻辑（按照设备上报最新信息更新状态）    mergeWarnsInfo
 *    2.1 如果该设备没有该类型以及该内容的告警，则增加到当前告警。
 *    2.2 如果该设备已经有该类型以及内容的告警，则更新当前告警的时间。
 *    2.3 如果该设备最新告警信息中已不存在之前的告警项目， 则将该设备相关告警信息归入历史告警。
 *    注：这部分预留通过WebSocke向前段推送告警信息的位置！
 *    计划创建两个集合，
 *    warns         存放设备当前告警
 *    warnsHistory  存放设备历史告警
 * 3. ...
 * 主要实现入库逻辑
 * 后续相关代码计划合并至工程的db.js中
 * @author liuyang
 * @since 2018/6/21
 */
var MongoClient = require('mongodb').MongoClient
var conf = require('./db.conf.js')
const isDebug = true // 是否输出debug级别的信息
const isTrace = false // 是否输出trace级别的信息

/**
 * 约定模型 warns
 * 按照extractWarnsInfo函数中约定的格式写明格式
 * 逻辑结构：warnsInfo/warnData{1,1}/warnItem*
 * 结构示例
 * 设计原则：在可以完成功能的前提下，最大限度保留与设备上报原始信息的结构。
 * {
 *  deviceId: deviceInfo._id              // 设备id
 *  deviceType: getDeviceType(deviceInfo._id).code     // 设备类型（代码)
 *  deviceTypeName: getDeviceType(deviceInfo._id).name // 设备类型（名称）
 *  timestamp: new Date()                 // 入库时间
 *  warnData: {
 *    '1': {
 *       'Id': warnObj[key].number._value,       // 告警码
 *       'Time': warnObj[key].time._value,       // 告警时间(设备上报的该告警信息的最新告警时间)
 *       'Level': warnObj[key].level._value,     // 告警级别
 *       'Description': warnObj[key].msg._value, // 告警信息
 *       'Action': DEFAULT_ACTION,               // 告警状态 发生告警\消除告警 0/1
 *                                               // 以下字段是为方便网管系统使用设计
 *       'TimeCreated':'',                       // 第一次告警时间   add 2018/6/26
 *       'TimeResolved': ''                      // 消警时间        add 2018/6/26
 *     },
 *     '2': {
 *       
 *     }
 *     ……
 *   }
 *  }
 * 
 * 
 * 
 */



/**
 * 约定模型 warnsHistory
 * // TODO
 */

// //////////////////////////////////////////////////////////////////////////////////////////
// 业务相关约定常量及方法 begin
const DEFAULT_ACTION = 0 // 发生告警\消除告警 0/1 默认入库的告警\消警值。默认为告警0。
// 设备信息代码表
const DIC_DEVICE_TYPE = {
  'TAU': 'Tracking Area Update', // 跟踪区域更新
  'CPE': 'Customer Premise Equipment', // 客户终端设备
  'CZT': '车载台',
  'GDT': '固定台',
  'FFF': '测试设备类型' // TODO 测试设备类型，上线后需要删除
}
// 告警级别代码表 TODO
const DIC_WARN_LEVEL = {
  'EVENT': '事件', // 事件， TODO 待沟通确认设备告警具体字段
  'ALARM': '警告', // 告警，
  'FATAL': '严重告警' // 严重告警， TODO 待沟通确认设备告警具体字段
}
// 设备告警状态(依据：TAU告警库_201806250849.docx)
const DIC_WARN_DESC_TAU = {
  '13': { 'description': 'lte module sys status is offline', 'comment': 'LTE模块未注册' },
  '11': { 'description': 'the temp of pa is over threshold', 'comment': 'PA模块温度过高' },
  '21': { 'description': 'unknown moderm, please check modem', 'comment': '无法识别4G模块' },
  '22': { 'description': 'unknown sd, please check sd', 'comment': 'SD卡故障' },
  '23': { 'description': 'the temp of mainboard is over threshold', 'comment': '主板温度过高' },
  '24': { 'description': 'the fun of mainboard is fault', 'comment': '风扇故障' }
}
const DIC_WARN_DESC_CPE = {// TODO

}
const DIC_WARN_DESC_CZT = {// TODO

}
const DIC_WARN_DESC_GDT = {// TODO

}

// TODO 还需要有一个字段

/**
 * 获得设备类型信息
 * 逻辑： 区分设备类型，当前约定规则是看设备Id中是否包含对应关键字
 * 规则:  定义在DIC_DEVICE_TYPE常量中
 * @param {string} deviceId 设备Id
 * @return {Object} 返回一个{ 'code': '', 'name': '' } 结构对象
 *  code：设备类型编码
 *  name：设备类型名称
 *  如果DIC_DEVICE_TYPE未定义该设备类型，则返回对象中相应字段为空字符串
 * @author liuyang
 * @since 2018/6/23
 */
function getDeviceType (deviceId) {
  var deviceType = { 'code': '', 'name': '' }
  if (deviceId == null) return deviceType

  for (var key in DIC_DEVICE_TYPE) { // 查码表
    if (deviceId.toUpperCase().includes(key)) { // includes ES6
      deviceType.code = key
      deviceType.name = DIC_DEVICE_TYPE[key]
      break
    }
  }
  return deviceType
}

/**
 * 获得告警级别
 * 规则：  定义在DIC_WARN_LEVEL中
 * @param {string} warnCode 告警代码
 * @return {string} 告警描述信息, 如果告警信息未定义则返回空字符串''
 * @author liuyang
 * @since 2018/6/25
 */
function getWarnLevel (warnCode) {
  if (warnCode == null) return ''
  return DIC_WARN_LEVEL[warnCode.toUpperCase().trim()] || ''
}

/**
 * 获得设备告警信息
 * @param {Object} dic 设备告警信息字典对象，
 * @param {string} key
 * @return {Object} 设备告警信息详情对象 结构 {'description': '英文描述', 'comment': '中文描述'}
 *                  若参数dic,key任意为null或未定义，则返回null
 *                  若设备告警信息未在字典对象中定义，则返回null
 * @author liuyang
 * @since 2018/6/25 
 */
function getWarnDesc (dic, key) {
  if (dic == null || key == null) return null
  return dic[key.toUpperCase().trim()] || null
}

// 业务相关约定常量及方法 end

// //////////////////////////////////////////////////////////////////////////////////////////
// 数据库操作公共方法 begin
function _connectDB (callback) {
  MongoClient.connect(conf.url, function (err, db) {
    if (err) throw err
    // if (isDebug) console.log('连接成功')
    callback(db)
  })
}

function findAll (collectionName, json, callback) {
  // TODO 需要参数判断
  if (arguments.length !== 3) {
    // callback('', null) // 这个咋写
  }

  /*
  if (isDebug) {
    console.log('#debug collectionName = ' + collectionName)
    console.log('#debug json = ' + JSON.stringify(json))
    console.log('#debug callback = ' + callback)
  }
  */

  _connectDB(function (db) {
    var result = []
    var cursor = db.collection(collectionName).find(json)
    cursor.each(function (err, doc) {
      if (err) {
        callback(err, null)
      }
      if (doc !== null) {
        // console.dir(doc)
        result.push(doc)
      } else {
        // 遍历结束
        callback(null, result)
      }
    }) // end of cursor

    db.close()
  })
}

// TODO 临时为当前告警信息定制一个按时间倒叙排序的方法
function findAllWithSort (collectionName, json, sortJson, callback) {
  // TODO 需要参数判断
  if (arguments.length !== 4) {
    // callback('', null) // 这个咋写
  }

  /*
  if (isDebug) {
    console.log('#debug collectionName = ' + collectionName)
    console.log('#debug json = ' + JSON.stringify(json))
    console.log('#debug sortJson = ' + JSON.stringify(sortJson))
    console.log('#debug callback = ' + callback)
  }
  */

  _connectDB(function (db) {
    var result = []
    var cursor = db.collection(collectionName).find(json).sort(sortJson)
    cursor.each(function (err, doc) {
      if (err) {
        callback(err, null)
      }
      if (doc !== null) {
        // console.dir(doc)
        result.push(doc)
      } else {
        // 遍历结束
        callback(null, result)
      }
    }) // end of cursor

    db.close()
  })
}

function insertOne (collectionName, json, callback) {
  _connectDB(function (db) {
    db.collection(collectionName).insertOne(json, function (err, result) {
      callback(err, result)
      db.close()
    })
  })
}
// 数据库操作公共方法 end

// //////////////////////////////////////////////////////////////////////////////////////////
// 实验程序入口
// 检索设备信息
// var deviceInfo = {}
// findAll('devices', { '_id': 'FFFFFF-Generic-FFFFFF123461' }, function (err, result) {
function main () {
  findAll('devices', {}, function (err, result) {
    if (err) throw err

    // 遍历设备信息逐一操作
    for (var idx in result) {
      // 1. 抽取告警信息（每台设备）
      var warnsInfo = extractWarnsInfo(result[idx])
      if (isDebug && warnsInfo != null) console.log('#debug main 清洗前 warnsInfo = ' + JSON.stringify(warnsInfo))
      warnsInfo = extractTheLatestWarnInfoSet(warnsInfo)
      if (isDebug && warnsInfo != null) console.log('#debug main 清洗后 warnsInfo = ' + JSON.stringify(warnsInfo))
      // 其实可以写成 var warnsInfo = extractTheLatestWarnInfoSet(extractWarnsInfo(result[idx]))
      // 但为了方便排错，还是写成上面的形式。简化写法只表明两个函数之间的功能渐进增强关系。

      // 2. 持久化 测试分支 待后续更新为告警信息合并逻辑
      /*
      if (warnsInfo !== null) {
        persistWarnsInfo(warnsInfo) // 持久化
      }
      */

      // 2. 利用设备上报信息更新（根据约定业务逻辑）系统相应集合
      if (warnsInfo !== null) {
        mergeWarnsInfo(warnsInfo)
      }
    }
  })
}

// //////////////////////////////////////////////////////////////////////////////////////////

/**
 * 分离出告警信息(后续可能需要根据不同设备上传信息增加告警信息字段)
 * @param {Object} deviceInfo 设备信息JSON对象（单台设备）
 * @returns {Object} warnsInfo 返回设备告警信息JSON对象，如果设备信息中不存在告警信息则返回null
 * @author liuyang
 * @since 2018/6/21
 */
function extractWarnsInfo (deviceInfo) {
  // 1. 容错参数预处理
  // 设备信息中有可能不包含告警信息
  if (deviceInfo.InternetGatewayDevice.warn == null) return null
  if (deviceInfo.InternetGatewayDevice.warn.warn == null) return null
  // 若包含告警信息则暂存
  var warnObj = deviceInfo.InternetGatewayDevice.warn.warn

  // 2. 抽取告警信息。字段命名以南向接口为准。
  // 注：如果包含告警信息，有可能不止一条。
  var warn = {}
  var warnData = {}

  // 功能点识别：（后续可能根据设备类型不同适配多个解析器，或者增加warnItem的字段）
  // 待确认：不同设备的告警信息格式是否相同 (当前得知，TAU和CPE的格式不，后续可能需要定制)

  // 解析出设备上报的所有告警信息（包括同一告警信息的不同在不同时间的告警信息）
  for (var key in warnObj) {
    if (key === '_object') continue // 跳过_object属性
    var warnItem = {
      'Id': warnObj[key].number._value, // 告警码
      'Time': warnObj[key].time._value, // 告警时间 (设备上报的该告警信息的最新告警时间)
      'TimeCreated': '', // 第一次告警时间, 由后续判断逻辑填写
      'TimeResolved': '', // 消警时间, 由后续判断逻辑填写
      'Level': warnObj[key].level._value, // 告警级别
      'Description': warnObj[key].msg._value, // 告警信息
      'Action': DEFAULT_ACTION // 告警状态 发生告警\消除告警 0/1
    }
    warnData[key] = warnItem
  }
  if (isDebug) console.log('#debug extractWarnsInfo 抽取设备信息中的告警信息 warnData = ' + JSON.stringify(warnData))

  // 组装信息
  warn.deviceId = deviceInfo._id // 设备id
  warn.deviceType = getDeviceType(deviceInfo._id).code // 设备类型（代码)
  warn.deviceTypeName = getDeviceType(deviceInfo._id).name // 设备类型（名称）
  warn.timestamp = new Date() // 入库时间
  warn.warnData = warnData

  return warn
}

/**
 * 从设备上报的告警信息集合中筛选出由同种告警信息最新一次告警记录组成的告警信息集合
 * 作用：对extractWarnsInfo函数抽取出来的设备原始告警信息进行清洗，仅保留同一类告警信息中带有最新告警时间的记录
 * 规则：判断是否是同种类型告警信息逻辑由isWarnsInfoHasSameContent定义
 * @param {Object} warnsInfo  由extractWarnsInfo函数抽取的设备告警信息集合
 * @return {Object} warnsInfo  由同种告警信息，最新一次告警记录组成的告警信息集合。如果参数为null，则返回null。
 * @author liuyang
 * @since 2018/6/26
 */
function extractTheLatestWarnInfoSet (warnsInfo) {
  if (warnsInfo == null) return null // 容错

  var warnsInfoLatest = {}
  warnsInfoLatest = warnsInfo

  // 待处理集合
  var warnDataArr = [] // 筛选算法操作的数组
  var warnDataArrLatest = [] // 筛选算法输出的数组
  var warnDataLatest = {} // 保存同一类型告警信息中具有最新告警时间的一条记录

  // 将warnData转化成数组
  for (var idx in warnsInfo.warnData) {
    let warnItem = warnsInfo.warnData[idx]
    warnItem.checked = false // 做一个未检测过的标记
    warnDataArr.push(warnItem)
  }
  if (isDebug) console.log('#debug extractTheLatestWarnInfoSet 筛选前 warnDataArr = ' + JSON.stringify(warnDataArr))

  // 下面算法也可处理数组仅含一个元素的情况
  for (let i = 0; i < warnDataArr.length; i++) {
    if (warnDataArr[i].checked === true) continue // 如果已经检查过则不再检查
    var warnItemLatest = warnDataArr[i]
    for (let j = 0; j < warnDataArr.length; j++) {
      if (warnDataArr[j].checked === true) continue // 如果已经检查过则不再检查
      // 从后面的记录中寻找是否是否有更近的告警，有则记录
      if (isWarnsInfoHasSameContent(warnItemLatest, warnDataArr[j])) {
        warnDataArr[j].checked = true // 标记已经检查过这个元素
        if (isWarnsInfoHasLatterTime(warnDataArr[j], warnItemLatest)) {
          warnItemLatest = warnDataArr[j]
        }
      }
    }
    warnDataArrLatest.push(warnItemLatest) // 记录同种告警信息中具有最新告警时间的记录
  }
  if (isDebug) console.log('#debug extractTheLatestWarnInfoSet 筛选后 warnDataArrLatest = ' + JSON.stringify(warnDataArrLatest))

  // 按照模型规则把晒出来的告警数据拼成对象
  for (let i = 0; i < warnDataArrLatest.length; i++) {
    var tmp = warnDataArrLatest[i]
    delete tmp.checked // 删除之前的标记
    warnDataLatest[i + 1] = tmp
  }
  if (isDebug) console.log('#debug extractTheLatestWarnInfoSet warnDataLatest = ' + JSON.stringify(warnDataLatest))

  warnsInfoLatest.warnData = warnDataLatest
  return warnsInfoLatest
}

/**
 * 告警信息入库 warns
 * @param {Object} 告警信息JSON对象
 * @author liuyang
 * @since 2018/6/21
 */
function persistWarnsInfo (warnsInfo) {
  insertOne('warns', warnsInfo, function (err, result) {
    if (err) throw err
    if (isDebug) console.log(JSON.stringify(result))
  })
}

/**
 * 利用设备上报信息更新（根据约定业务逻辑）系统相应集合
 * 告警信息对比逻辑（按照设备上报最新信息更新状态）
 *    1 如果该设备没有该类型以及该内容的告警，则增加到当前告警。
 *    2 如果该设备已经有该类型以及内容的告警，则更新当前告警的时间。
 *    3 如果该设备最新告警信息中已不存在之前的告警项目， 则将该设备相关告警信息归入历史告警。
 *    注：这部分预留通过WebSocke向前段推送告警信息的位置！
 *    计划创建两个集合，
 *    warns         存放设备当前告警
 *    warnsHistory  存放设备历史告警
 * @param {Object} warnsInfo extractWarnsInfo函数抽取出来的告警信息（依赖该函数返回的对象格式）
 *    约定在MongoDB中存放的也是相同格式的数据
 * @author liuyang
 * @since 2018/6/23
 */
function mergeWarnsInfo (warnsInfo) {
  // TODO 需要考虑代码融合的部分 db.js

  // 伪码描述
  // 该设备尚无当前告警信息
  // var warnInfoFromDb = db.warns.find({'deviceId': warnsInfo.deviceId}) 
  // if (warnInfoFromDb == null) {
  //  db.warns.insert(warnsInfo)
  //  return
  // }

  // 该设备已经有当前告警信息
  // 如果该设备已经有该类型以及内容的告警，则更新当前告警的时间。
  /**
   * // 识别是否有新增告警
   * for (var idxDevice in warnsInfo.warnData) {// 以设备上报信息为基础进行比较
   *  for (var idxDb in warnsInfoFromDb.warnData) {
   *    if (isWarnsInfoEquals(warnsInfoFromDb.warnData[idxDb], warnsInfo.warnData[idxDevice])) {
   *      continue
   *    }
   *  }
   *  // 若执行到这里证明该条告警信息为新增信息
   *  向warns集合中的该设备告警信息中增加该告警条目(WebSocket通知)
   * }
   *
   * // 识别报警是否有更新，或者自动消警
   * for (var idxDb in warnsInfoFromDb.warnData) {// 以数据库中的记录为基础进行对比
   *  for (var idxDevice in warnsInfo.warnData) {
   *    if (isWarnsInfoEquals(warnsInfoFromDb.warnData[idxDb], warnsInfo.warnData[idxDevice])) {
   *      更新告警时间（WebSocket通知）
   *      continue
   *    }
   *  }
   *  // 若执行到这里证明设备新上报告警中已经不存在之前的告警信息，视为自动消警
   *  删除告警逻辑（WebSocket通知）
   *    1. 将该设备的该条告警信息归档至warnsHistory集合
   *    2. 从warns中删除该设备的该条告警信息
   * }
   *
   */

  // 1. 该设备尚无当前告警信息
  // 该设备尚无当前告警信息
  // var warnInfoFromDb = db.warns.find({'deviceId': warnsInfo.deviceId}) 
  // if (warnInfoFromDb == null) {
  //  db.warns.insert(warnsInfo)
  //  return
  // }

  // TODO 确定数据结构前先这样处理 (为啥要倒叙排一下，因为还没具体确定模型结构)

  // 如果传入的告警信息为空，则不做任何操作
  if (warnsInfo == null) return

  // 模拟该设备尚无当前告警信息的情况
  // findAllWithSort('warns', {'deviceId': warnsInfo.deviceId + 1}, {'timestamp': -1}, function (err, result) {
  // 模拟该设备已存在当前告警信息的情况
  // findAllWithSort('warns', {'deviceId': warnsInfo.deviceId}, {'timestamp': -1}, function (err, result) {// 没有确定模型前的临时做法
  // findAll('devices', {'deviceId': 'FFFFFF-Generic-FFFFFF123461'}, function (err, result) {// 当前告警模块，每台设备对应一个
  findAll('warns', { 'deviceId': warnsInfo.deviceId }, function (err, result) {
    if (err) throw err
    if (isDebug) console.log('#debug mergeWarnsInfo db result = ' + JSON.stringify(result))

    if (result === null || result.length === 0) {
      // 该设备尚无当前告警信息
      processWarnsInsert(warnsInfo)
    } else {
      // 该设备已存在当前告警信息
      processWarnsMerge(warnsInfo, result[0])
    }
  })
}

/**
 * 执行向当前告警信息集合插入告警文档操作
 * @param {Object} warnsInfo 设备告警信息 格式：extractWarnsInfo函数抽取出来的告警信息（依赖该函数返回的对象格式）
 * @author liuyang
 * @since 2018/6/23
 */
function processWarnsInsert (warnsInfo) {
  if (isDebug) console.log('#debug processWarnsInsert')
  if (isDebug) console.log('#debug processWarnsInsert warnsInfo = ' + JSON.stringify(warnsInfo))
  // TODO 后续需要换成genieacs项目中的db.js方法，目前只是模拟插入本地数据库。
  insertOne('warns', warnsInfo, function (err, result) {
    if (err) throw err
    if (isDebug) console.log('#debug processWarnsInsert result = ' + JSON.stringify(result))
  })
}

/**
 * 根据设备告警信息
 * 注：格式均遵循extractWarnsInfo函数抽取出来的告警信息（依赖该函数返回的对象格式：
 * @param {Object} warnsInfo 设备告警信息
 * @param {Object} warnsInfoFromDB 系统保存的上一个时段该设备告警信息
 * @author liuyang
 * @since 2018/6/23
 */
function processWarnsMerge (warnsInfo, warnsInfoFromDB) {
  // 两个参数任意为空则程序什么都不做
  if (warnsInfo == null) return
  if (warnsInfoFromDB == null) return

  if (isTrace) console.log('#trace processWarnsMerge')
  if (isTrace) console.log('#trace processWarnsMerge warnsInfo = ' + JSON.stringify(warnsInfo))
  if (isTrace) console.log('#trace processWarnsMerge warnsInfoFromDB = ' + JSON.stringify(warnsInfoFromDB))
  if (isTrace) console.log('#trace processWarnsMerge warnsInfo.warnData = ' + JSON.stringify(warnsInfo.warnData))
  if (isTrace) console.log('#trace processWarnsMerge warnsInfoFromDB.warnData = ' + JSON.stringify(warnsInfoFromDB.warnData))

  // TODO 后续要换genieacs项目中的db.js方法，目前只是模拟插入本地数据库

  // 第一遍遍历
  // 目的：识别是否有新增告警, 是否有告警时间更新
  // 操作：以设备上报信息为基础进行比较
  var flagWarnItemHasTheSameContent = false // 告警信息拥有相同内容标志 false：没有相同内容记录, true：有相同内容记录
  for (let idxDevice in warnsInfo.warnData) { // 遍历设备上报信息的每一条记录，看数据库中是否已有相关告警
    flagWarnItemHasTheSameContent = false // 恢复标记
    for (let idxDb in warnsInfoFromDB.warnData) {
      /*
      if (isDebug) console.log('#debug processWarnsMerge isWarnsInfoHasSameContent result = ' + isWarnsInfoHasSameContent(warnsInfoFromDB.warnData[idxDb], warnsInfo.warnData[idxDevice]))
      if (isDebug) console.log('#debug processWarnsMerge warnsInfoFromDB.warnData[idxDb] =' + JSON.stringify(warnsInfoFromDB.warnData[idxDb]))
      if (isDebug) console.log('#debug processWarnsMerge warnsInfo.warnData[idxDevice] =' + JSON.stringify(warnsInfo.warnData[idxDevice]))
      */

      if (isWarnsInfoHasSameContent(warnsInfoFromDB.warnData[idxDb], warnsInfo.warnData[idxDevice])) {
        flagWarnItemHasTheSameContent = true // 标记找到了同样的告警信息
        // 更新告警时间处理逻辑: 如果上报的相同内容的告警信时间更接近当前时间, 则更新相关告警的时间
        if (isWarnsInfoHasLatterTime(warnsInfo.warnData[idxDevice], warnsInfoFromDB.warnData[idxDb])) {
          // TODO 更新数据库中相关记录的告警时间
          // TODO WebSocket通知
          if (isDebug) console.log('#debug processWarnsMerge 更新 更新数据库中相关记录的告警时间')
          if (isDebug) console.log('#debug processWarnsMerge 更新 WebSocket通知')
          if (isDebug) console.log('#debug processWarnsMerge 更新 old warnItem.Time = ' + JSON.stringify(warnsInfoFromDB.warnData[idxDb].Time))
          if (isDebug) console.log('#debug processWarnsMerge 更新 new warnItem.Time = ' + JSON.stringify(warnsInfo.warnData[idxDevice].Time))
          // TODO Coding...
          // 问题分解：技术点——如何去更新？ 修改
          // 问题分解：技术点——如何io.emit()？
        }
        break // 找到了相同的告警信息，不需要再向后遍历（基于目前当前告警信息模型：每个设备的每类告警信息仅保存告警时间最新的一条）
      }
    }
    // 新增告警信息处理逻辑
    if (!flagWarnItemHasTheSameContent) { // 数据库中尚无该告警信息
      // 若执行到这里证明该条告警信息为新增信息
      // TODO 向warns集合中的该设备告警信息中增加该告警条目
      // TODO 注意，新增告警的时候需要填写warnItem.TimeCreated字段！！！
      // TODO WebSocket通知
      if (isDebug) console.log('#debug processWarnsMerge 新增 向warns集合中的该设备告警信息中增加该告警条目(WebSocket通知)')
      if (isDebug) console.log('#debug processWarnsMerge 新增 WebSocket通知')
      if (isDebug) console.log('#debug processWarnsMerge 新增 warnItem = ' + JSON.stringify(warnsInfo.warnData[idxDevice]))
      // TODO Coding...
      // 问题分解：技术点——如何去更新？
      // 问题分解：技术点——如何io.emit()？
    }
  }

  // 第二遍遍历
  // 目的：识别自动消警（如果设备上报信息中不再存在相同内容的告警信息则视为自动消警）
  // 操作：以数据库中的记录为基础进行比较
  flagWarnItemHasTheSameContent = false // 告警信息拥有相同内容标志 false：没有相同内容记录, true：有相同内容记录
  for (let idxDb in warnsInfoFromDB.warnData) { // 遍历从数据库中拿出的每条告警信息，看设备新上报的告警信息中是否还存在原有告警信息
    for (let idxDevice in warnsInfo.warnData) {
      if (isWarnsInfoHasSameContent(warnsInfoFromDB.warnData[idxDb], warnsInfo.warnData[idxDevice])) {
        flagWarnItemHasTheSameContent = true
        break
      }
    }
    // 消警处理逻辑
    if (!flagWarnItemHasTheSameContent) { // 设备上报信息中已经没有库中记录的告警
      // 若执行到这里证明设备新上报告警中已经不存在之前的告警信息，视为自动消警
      // 删除告警逻辑
      //  1. 将该设备的该条告警信息归档至warnsHistory集合
      //  2. 从warns中删除该设备的该条告警信息
      // TODO 删除告警
      // TODO 注意，删除告警的时候要填写warnItem.TimeResolved字段！！！
      // TODO WebSocket通知
      if (isDebug) console.log('#debug processWarnsMerge 消警 将该条告警信息归档至warnsHistory集合')
      if (isDebug) console.log('#debug processWarnsMerge 消警 从warns集合中该设备告警信息文档中删除对应的告警信息')
      if (isDebug) console.log('#debug processWarnsMerge 消警 WebSocket通知')
      if (isDebug) console.log('#debug processWarnsMerge 消警 warnItem = ' + JSON.stringify(warnsInfoFromDB.warnData[idxDb]))
      // TODO Coding...
    }
  }
}

/**
 * 判断两条告警信息是否相等
 * 规则：根据告警等级、告警来进行判断
 * 注：字段比较时忽略大小写以及首尾空格
 * @param {*} warnItem1 告警信息1 格式参见 extractWarnsInfo约定的数据格式
 * @param {*} warnItem2 告警信息2 格式参见 extractWarnsInfo约定的数据格式
 * @return {Boolean} 两条告警信息一致返回true，否则返回false。 任意参数及判断所需相关字段为空或未定义则返回false.
 * @author liuyang
 * @since 2018/6/23
 */
function isWarnsInfoHasSameContent (warnItem1, warnItem2) {
  var flag = true

  // 参数判断 只要含空值或未定义则认为不同（纯容错，与业务逻辑无关）
  if (warnItem1 == null) return false
  if (warnItem2 == null) return false
  if (warnItem1.Level == null) return false
  if (warnItem2.Level == null) return false
  if (warnItem1.Id == null) return false
  if (warnItem2.Id == null) return false
  /*
  if (warnItem1.Description == null) return false
  if (warnItem2.Description == null) return false
  */

  // 告警等级
  if (warnItem1.Level.toUpperCase().trim() !== warnItem2.Level.toUpperCase().trim()) {
    flag = false
  }
  // 告警码
  if (warnItem1.Id.toUpperCase().trim() !== warnItem2.Id.toUpperCase().trim()) {
    flag = false
  }

  /*
  if (isDebug) console.log('isWarnsInfoEquals isWarnsInfoEquals == ')
  if (isDebug) console.log('isWarnsInfoEquals flag = ' + flag)
  if (isDebug) console.log('isWarnsInfoEquals warnItem1 = ' + JSON.stringify(warnItem1))
  if (isDebug) console.log('isWarnsInfoEquals warnItem2 = ' + JSON.stringify(warnItem2))
  */

  // 告警内容
  /*
  if (warnItem1.Description.toUpperCase().trim()
     !== warnItem2.Description.toUpperCase().trim()) {
    flag = false
  }
  */

  return flag
}

/**
 * 仅判断告警信息是否具有相同的时间（不判断告警内容是否一致）
 * @param {Object} warnItem1 告警信息1 格式参见 extractWarnsInfo约定的数据格式
 * @param {Object} warnItem2 告警信息2 格式参见 extractWarnsInfo约定的数据格式
 * @return {Boolean} 如果具有相同的时间则返回true，否则返回false。任意参数及判断所需相关字段为空或未定义则返回false。
 *                   两个参数任意为空则返回false
 * @author liuyang
 * @since 2018/6/26
 */
function isWarnsInfoHasSameTime (warnItem1, warnItem2) {
  if (warnItem1 == null) return false
  if (warnItem2 == null) return false
  if (warnItem1.Time == null) return false
  if (warnItem2.Time == null) return false

  return warnItem1.Time.toUpperCase().trim() === warnItem2.Time.toUpperCase().trim()
}

/**
 * 仅判断告警信息是否具有更新的告警时间（不判断告警内容是否一致）
 * 修改点识别：不同设备的告警信息中的时间戳格式可能不同。
 * 作用： 是否比较两个告警信息的时序关系
 * @param {Object} warnItem1 告警信息1 格式参见 extractWarnsInfo约定的数据格式
 * @param {Object} warnItem2 告警信息2 格式参见 extractWarnsInfo约定的数据格式
 * @return {Boolean} 如果warnItem1告警时间比warnItem2告警时间更接近当前时间，则返回true，否则返回false
 *                   两个参数任意为空则返回false
 * @author liuyang
 * @since 2018/6/26
 */
function isWarnsInfoHasLatterTime (warnItem1, warnItem2) {
  if (warnItem1 == null) return false
  if (warnItem2 == null) return false
  if (warnItem1.Time == null) return false
  if (warnItem2.Time == null) return false

  return new Date(warnItem1.Time) > new Date(warnItem2.Time)
}


// //////////////////////////////////////////////////////////////////////////////////////////
// 下面的一组函数定义在数据集合warnData上的一套操作
// warnData: [warnItem, warnItem, warnItem ...]
function warnDataInsert (warnData, newWarnItem) { 
  // TODO
  // 返回按照规则排好序的数组
  return warnDataSort(warnData, warnItemComparator)
}
function warnDataUpdateTime (warnData, warnItem, timeStr) { 
  // TODO
  return [] 
}

function warnDataDelete (warnData, warnItem) { 
  // TODO
  return [] 
}

/**
 * 告警数据排序
 * @param {Object} warnData 
 * @param {Function} warnItemComparator 告警信息条目排序规则比较器
 */
function warnDataSort (warnData, warnItemComparator) {
  // 待实现
  return warnData 
}

// 告警信息条目排序规则比较器
// 告警信息排序规则在这里指定
function warnItemComparator (warnItem1, warnItem2) {
  // TODO 待实现
  return 1
}

// //////////////////////////////////////////////////////////////////////////////////////////
// for unit test
exports.main = main // 这个流程包含了核心的extractWarnsInfo、extractTheLatestWarnInfoSet的测试
exports.extractTheLatestWarnInfoSet = extractTheLatestWarnInfoSet // 适配一下参数，也可以进行单测
exports.getDeviceType = getDeviceType
// @deprecated exports.isWarnsInfoEquals = isWarnsInfoEquals
exports.isWarnsInfoHasSameContent = isWarnsInfoHasSameContent
exports.isWarnsInfoHasSameTime = isWarnsInfoHasSameTime
exports.isWarnsInfoHasLatterTime = isWarnsInfoHasLatterTime
exports.mergeWarnsInfo = mergeWarnsInfo
exports.getWarnLevel = getWarnLevel
exports.DIC_WARN_DESC_TAU = DIC_WARN_DESC_TAU
exports.getWarnDesc = getWarnDesc
