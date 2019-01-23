/**
 * 描述：从设备信息devices集合中分离出告警信息保存进入warns集合
 * 依据：《南向接口》 《概要设计文档》
 *
 * 介绍：本脚本包含告警信息归并主流程
 *  第一步：抽取，分离出告警信息 - extractWarnsInfo （在函数extractWarnData中完成对设备的适配）
 *  第二步：去重，从设备上报的告警信息集合中筛选出由同种告警信息最新一次告警记录组成的告警信息集合 - extractTheLatestWarnInfoSet
 *  第三步：归并，利用设备上报信息更新网管系统告警信息集合 - mergeWarnsInfo
 *    1 如果该设备没有该类型以及该内容的告警，则增加到当前告警。
 *    2 如果该设备已经有该类型以及内容的告警，则更新当前告警的时间。
 *    3 如果该设备最新告警信息中已不存在之前的告警项目， 则将该设备相关告警信息归入历史告警。
 *    注：这部分预留通过WebSocke向前段推送告警信息的位置！
 *
 * MongoDB中的对应集合：(名称可配置，在warns-cfg.js中)
 *    warns          存放设备当前告警
 *    warnsHistories 存放设备历史告警
 *
 * 模型结构约定： 见脚本最上方的注释内容。
 *
 * @author liuyang
 * @since  2018/6/21
 * @update 2018/7/16  为融合进nbi，重命名为nbi-warns-service.js，并将配置分离至nbi-warns-cfg.js中
 *         2018/7/20  引入日志适配，通过logprovider中的开关可以切换日志提供产品。
 *                    注：主要目的是引入log4js方便本地测试，并适配目前genieacs无log4js依赖的环境(不打算把log4js依赖添加进genieacs环境)
 *         2018/7/23  1. 重命名为warns_merge.js。 文件名warns_service.js规划为保存界面交互相关的代码。
 *                    2. 将字典表、业务相关常量分离至warns_dictionary.js文件中
 *                    3. 将数据库操作相关代码分离至warns_merge_db.js文件中
 *                    4. 适配CPE1.0设备（测试设备一直给的是CPE告警格式）
 *         2018/7/24  1. 将告警信息判断规则分离至warns_merge_rules.js
 *                    2. 将在告警信息集合warnData上的操作函数分离至warns_warndata_operations.js （动因是发现该部函数可以被warns_service.js重用）
 *         2018/7/25  1. 分离出函数extractWarnData，专门适配不同设备，并增加相应设备的适配器。
 *                       区分设备：车载台主机，车载台控制盒，固定台主机，固定台控制盒，TAU, CPE
 *                    2. 修改模型，持久化增加告警码表内容（具体目的参考模型注释）
 *         2018/8/1   1. 使用陈晨封装方法增加WebSocket推送功能
 *                    修改下列方法签名以传递socket对象
 *                    processOneDevice, mergeWarnsInfo，processWarnsInsert，processWarnsMerge。
 *                    其中processOneDevice,mergeWarnsInfo作为前端仅做参数传递。processWarnsInsert，processWarnsMerge函数做实际推送操作
 *                    2. 拆分TAU，CPE解析器，将deviceTAUCPEExtractor，拆分为deviceTAUExtractor和deviceCPEExtractor
 */
let warnsConf = require('./warns_cfg') // 配置
let warnsDic = require('./warns_dictionary') // 告警信息合并模块设备字典，不同的设备配有不同的告警字典
let warnsDb = require('./warns_merge_db') // 数据库操作部分
let warnsUtil = require('./warns_util') // 工具类
let warnsRules = require('./warns_merge_rules') // 告警信息业务、设备相关的通用判断规则，如两条告警信息是否相等
let warnsWarnDataOperations = require('./warns_warndata_operations') // warnData数据集合上定义的工具类

// 业务逻辑相关
const isDeleteDeviceWarn = true // true: 从设备信息表中抽取告警信息后就会删除对应的告警内容
const isPushWarnsInfo = true // true: 利用WebSocket推送错误信息
const WEBSOCKET_MSG_NAME_WARNS_CHANGE = 'msgWarnsChanged' // 向WebSocket客户端推送告警信息发生改变的消息名称（即客户端需要处理的消息消息名称）

// //////////////////////////////////////////////////////////////////////////////////////////
// 日志相关 begin
// console和log4js通用的日志级别： DEBUG | INFO| WARN | ERRO
// 使用样例:
// if (isLogEnabled) log.debug()
// if (isLogEnabled) log.info()
// 对err的处理：
// 即在处理err的地方，不判断isLogEnabled标志，统一使用log.error(err)输出，方便后续收集、查看。
const isLogEnabled = true // 是否输出日志 注意：打印异常不受此标志控制。
const isTrace = true // 设置为true，配合日志级别为debug，可以查看告警合并信息的更详细的跟踪记录。(log4js支持trace级别，但console没有trace级别，为了兼容，故设置这个标志)
let logProvider = require('./warns_logprovider') // 适配console和log4js
let log = logProvider.getLogger('warns_merge.js')
// 日志相关 end

// //////////////////////////////////////////////////////////////////////////////////////////
// 模型相关 begin
const COLLECTION_NAME_DEVICES = warnsConf.COLLECTION_NAME_DEVICES // MongoDB中，存放设备信息的集合
const COLLECTION_NAME_WARNS = warnsConf.COLLECTION_NAME_WARNS // MongoDB中，当前告警信息存放的集合名称
const COLLECTION_NAME_WARNS_HISTORIES = warnsConf.COLLECTION_NAME_WARNS_HISTORIES // MongoDB中，历史告警信息存放的集合名称
/**
 * 约定模型 warns
 * 按照extractWarnsInfo函数中约定的格式写明格式
 * 逻辑结构：warnsInfo/warnData{1,1}/warnItem*
 * 结构示例
 * 设计原则：在可以完成功能的前提下，方便程序操作
 * {
 *  deviceId: deviceInfo._id              // 设备id
 *  deviceType: getDeviceType(deviceInfo._id).code     // 设备类型（代码)
 *  deviceTypeName: getDeviceType(deviceInfo._id).name // 设备类型（名称）
 *  timestamp: new Date()                 // 入库时间
 *  warnData: [
 *     {
 *       'Id': warnObj[key].number._value,       // 告警码
 *       'Time': warnObj[key].time._value,       // 告警时间(设备上报的该告警信息的最新告警时间)
 *       'Level': warnObj[key].level._value,     // 告警级别
 *       'Description': warnObj[key].msg._value, // 告警信息
 *       'Action': DEFAULT_ACTION,               // 告警状态 发生告警\消除告警 0/1
 *                                               // 以下字段是为方便网管系统使用设计
 *       'TimeCreated':'',                       // 第一次告警时间   add 2018/6/26 用设备上报的告警时间填写
 *       'TimeResolved': ''                      // 消警时间        add 2018/6/26 用node.js所在系统时间填写
 *                                               // 以下字段是从设备告警字典中依据告警编码翻译出来的字段
 *       'DicWarnDescritpion': '',               // 告警描述（英文）  add 2018/7/25
 *       'DicWarnComment': '',                   // 告警描述（中文）  add 2018/7/25
 *       'DicWarnLevelCode': '',                 // 告警级别编码 （从字典中翻译过来，可以与设备上报的Level做对照） add 2018/7/25
 *       'DicWarnLevelDescriptione': ''          // 告警级别编码描述（中文） add 2018/7/25 方便界面展现
 *     },
 *     {
 *      ……
 *     }
 *     ……
 *   ] // warnData属性值改为使用数组，替换原来使用的对象。
 *  }
 *
 */

/**
 * 约定模型 warnsHistories
 * {
 *   "Id" : "21",
 *   "Time" : "2018-07-23 05:23:56",
 *   "TimeCreated" : "2018-07-23 05:23:56",
 *   "TimeResolved" : "2018-07-23 17:46:16",
 *   "Level" : "1",
 *   "Description" : "[SYS] lte module sys status is offline",
 *   "Action" : 0,
 *   'DicWarnDescritpion': '',               // 告警描述（英文）  add 2018/7/25
 *   'DicWarnComment': '',                   // 告警描述（中文）  add 2018/7/25
 *   'DicWarnLevelCode': '',                 // 告警级别编码 （从字典中翻译过来，可以与设备上报的Level做对照） add 2018/7/25
 *   'DicWarnLevelDescriptione': ''          // 告警级别编码描述（中文） add 2018/7/25
 *
 *   "deviceId" : "FFFFFF-Generic-FFFFFF123456",
 *   "deviceType" : "FFF",
 *   "deviceTypeName" : "测试设备类型",
 *   "status": "",                           // 在归档至历史告警时添加 《终端二代网管概要设计文档_liuyang_标注版本_20180613.doc》
 *   "isChecked": "",                        // 在归档至历史告警时添加 《终端二代网管概要设计文档_liuyang_标注版本_20180613.doc》
 * }
 */
// 模型相关 end

// //////////////////////////////////////////////////////////////////////////////////////////
// 业务相关约定常量
const DEFAULT_ACTION = warnsDic.DEFAULT_ACTION // 发生告警\消除告警 0/1 默认入库的告警\消警值。默认为告警0。
// 设备信息代码表
// 相关码表以提出至warns_dictionary.js,并通过该文件暴露的方法获取码表信息。

// //////////////////////////////////////////////////////////////////////////////////////////
// 单测程序入口 (也作为整个程序的调用示例))
// 功能描述：遍历devices集合中的所有记录，抽取其中的告警信息
function main () {
  // 检索设备信息
  // var deviceInfo = {}
  // findAll('devices', { '_id': 'FFFFFF-Generic-FFFFFF123461' }, function (err, result) {
  warnsDb.findAll(COLLECTION_NAME_DEVICES, {}, function (err, result) {
    if (err) log.error(err)

    // 遍历设备信息逐一操作
    for (var idx in result) {
      processOneDevice(result[idx], null) // 抽取每台告警信息
    }
  })
}

// //////////////////////////////////////////////////////////////////////////////////////////
/**
 * 处理一台设备
 * @param {Object} deviceInfo 设备信息JSON对象（单台设备）
 * @param {Object} socketIO 陈晨封装的websocket工具类实例，调用其中的发送方法即可完成消息推送。 2018/8/1 added
 *
 * @author liuyang
 * @since 2018/7/25 从main中分离，作为整个脚本的入口
 *        2018/8/1  增加socketIO参数，增加isPushWarnsInfo开关（全局常量）:true表示使用该对象推送，false表示不推送。
 */
function processOneDevice (deviceInfo, socketIO) {
  // 1. 抽取告警信息（每台设备）
  // 其实可以写成 var warnsInfo = extractTheLatestWarnInfoSet(extractWarnsInfo(result[idx]))
  // 但为了方便排错，还是写成下面的形式。简化写法只表明两个函数之间的功能渐进增强关系。
  var warnsInfo = extractWarnsInfo(deviceInfo)
  if (isLogEnabled && warnsInfo.warnData.length !== 0) log.debug('main 清洗前 warnsInfo = ' + JSON.stringify(warnsInfo))
  warnsInfo = extractTheLatestWarnInfoSet(warnsInfo)
  if (isLogEnabled && warnsInfo.warnData.length !== 0) log.debug('#main 清洗后 warnsInfo = ' + JSON.stringify(warnsInfo))

  // 2. 利用设备上报信息更新（根据约定业务逻辑）系统相应集合
  if (warnsInfo !== null) {
    if (!isPushWarnsInfo) socketIO = null // mergeWarnsInfo及其调用的函数统一约定如果socketIO为null则不推送
    mergeWarnsInfo(warnsInfo, socketIO)
  }

  // 3. 删除设备信息中的告警列表
  // if (isDeleteDeviceWarn) {
  if (warnsInfo !== null && isDeleteDeviceWarn && warnsInfo.deviceType !== '0701') { // DEBUG 2018/8/1 为适配TAU临时增加不删除TAU设备上报告警信息
    warnsDb.update(COLLECTION_NAME_DEVICES, {'_id': warnsInfo.deviceId}, {$unset: { 'InternetGatewayDevice.warn': '' }}, function (err, result) {
      if (err) log.error(err)
      if (isLogEnabled) log.debug('processWarnsMerge 更新 数据库更新返回结果 result = ' + JSON.stringify(result))
    })
  }
}

// //////////////////////////////////////////////////////////////////////////////////////////
/**
 * 分离出告警信息
 * @param {Object} deviceInfo 设备信息JSON对象（单台设备）
 * @returns {Object} warnsInfo 返回设备告警信息JSON对象，如果设备信息中不存在告警信息则返回对象中warnData值为[]
 * @author liuyang
 * @since 2018/6/21
 */
function extractWarnsInfo (deviceInfo) {
  // 1. 抽取设备一般信息
  // 设备信息中有可能不包含告警信息
  var warnInfo = {
    'deviceId': deviceInfo._id, // 设备id
    'deviceType': warnsDic.getDeviceType(deviceInfo._id).code, // 设备类型（代码)
    'deviceTypeName': warnsDic.getDeviceType(deviceInfo._id).name, // 设备类型（名称）
    'timestamp': warnsUtil.getCurrentDateTimeStr(), // 入库时间
    'warnData': []
  }
  // 设备上报数据可能不包含告警信息
  if (deviceInfo.InternetGatewayDevice.warn == null) return warnInfo
  if (deviceInfo.InternetGatewayDevice.warn.warn == null) return warnInfo

  // 2. 抽取设备告警信息。字段命名以南向接口为准。
  // 注：如果包含告警信息，有可能不止一条。
  var warnObj = deviceInfo.InternetGatewayDevice.warn.warn
  var warnData = extractWarnData(warnObj, warnInfo.deviceType) // 适配不同的设备
  if (isLogEnabled) log.debug('extractWarnsInfo 抽取设备信息中的告警信息 warnData = ' + JSON.stringify(warnData))

  // 3. 组装信息
  warnInfo.warnData = warnData
  return warnInfo
}

/**
 * 适配不同类型设备，抽取出告警信息
 * @param {Object} warnObj 设备告警信息解析前的结构（根据各种设备不同而不同）
 * @param {string} deviceType 设备编号 文档《软件中的设备名称及编号_201807031320_from_chenchen.docx》中的“设备编号”，如0101
 * @returns {Array} warnData 网管系统告警模块约定的告警信息结构（见本脚本上方元注释）
 * @author liuyang
 * @since 2018/7/25
 */
function extractWarnData (warnObj, deviceType) {
  let warnData = []
  if (!deviceType) return warnData
  if (!warnObj) return warnData

  // 车载台主机
  if (deviceType === '0101') {
    warnData = deviceCZTMasterExtractor(warnObj)
  }

  // 车载台控制盒
  if (deviceType === '0201') {
    warnData = deviceCZTControlExtractor(warnObj)
  }

  // 固定台主机
  if (deviceType === '0301') {
    warnData = deviceGDTMasterExtractor(warnObj)
  }

  // 固定台控制盒
  if (deviceType === '0401') {
    warnData = deviceGDTControlExtractor(warnObj)
  }

  // TAU 1.0
  if (deviceType === '0701') {
    // warnData = deviceTAUCPEExtractor(warnObj)
    // warnData = deviceTAUExtractor(warnObj)
    warnData = [] // DEBUG 2018/8/1 为适配TAU设备临时增加
  }

  // CPE 1.0
  if (deviceType === '0801') {
    // warnData = deviceTAUCPEExtractor(warnObj)
    warnData = deviceCPEExtractor(warnObj)
  }

  return warnData
}

/**
 * 车载台主机告警信息抽取
 * @param {Object} warnObj 设备告警信息解析前的结构（根据各种设备不同而不同）
 * @returns {Array} warnData 网管系统告警模块约定的告警信息结构（见本脚本上方元注释）
 */
function deviceCZTMasterExtractor (warnObj) {
  log.debug('deviceCZTMasterExtractor')
  let warnData = []
  // 解析出设备上报的所有告警信息（注：设备可能将同一告警信息上报多次）
  for (var key in warnObj) {
    // 设备差异点1：设备上报信息原始结构可能不同
    if (key === '_object') continue // 跳过_object属性
    if (key === '_writable') continue // 跳过_writable属性

    // 设备差异点2：设备告警字典不同
    // 根据告警编码从告警字典中找到告警信息的相关描述 方便后续持久化到文档中
    let dicDesc = warnsDic.getWarnDesc(warnsDic.DIC_WARN_DESC_CZT_MASTER, warnObj[key].id._value)

    // 设备差异点3：上报信息的字段名不同
    let warnItem = {
      'Id': warnObj[key].id._value, // 告警码
      'Time': warnObj[key].time._value, // 告警时间 (设备上报的该告警信息的最新告警时间)
      'TimeCreated': '', // 第一次告警时间, 由后续判断逻辑填写
      'TimeResolved': '', // 消警时间, 由后续判断逻辑填写
      'Level': warnObj[key].level._value, // 告警级别
      'Description': warnObj[key].description._value, // 告警信息
      'Action': DEFAULT_ACTION, // 告警状态 发生告警\消除告警 0/1
      // 下面的部分根据告警码从设备告警字典中查出
      'DicWarnDescritpion': dicDesc.description || '', // 告警描述（英文）  add 2018/7/25
      'DicWarnComment': dicDesc.comment || '', // 告警描述（中文）  add 2018/7/25
      'DicWarnLevelCode': dicDesc.levelCode || '', // 告警级别编码 （从字典中翻译过来，可以与设备上报的Level做对照） add 2018/7/25
      'DicWarnLevelDescription': dicDesc.levelDescription || '' // 告警级别编码描述（中文） add 2018/7/25
    }
    warnData.push(warnItem)
  }
  return warnData
}

/**
 * 车载台控制盒告警信息抽取
 * @param {Object} warnObj 设备告警信息解析前的结构（根据各种设备不同而不同）
 * @returns {Array} warnData 网管系统告警模块约定的告警信息结构（见本脚本上方元注释）
 */
function deviceCZTControlExtractor (warnObj) {
  log.debug('deviceCZTControlExtractor')
  let warnData = []
  // 解析出设备上报的所有告警信息（注：设备可能将同一告警信息上报多次）
  for (var key in warnObj) {
    // 设备差异点1：设备上报信息原始结构可能不同
    if (key === '_object') continue // 跳过_object属性
    if (key === '_writable') continue // 跳过_writable属性

    // 设备差异点2：设备告警字典不同
    // 根据告警编码从告警字典中找到告警信息的相关描述 方便后续持久化到文档中
    let dicDesc = warnsDic.getWarnDesc(warnsDic.DIC_WARN_DESC_CZT_CONTROL, warnObj[key].id._value)

    // 设备差异点3：上报信息的字段名不同
    let warnItem = {
      'Id': warnObj[key].id._value, // 告警码
      'Time': warnObj[key].time._value, // 告警时间 (设备上报的该告警信息的最新告警时间)
      'TimeCreated': '', // 第一次告警时间, 由后续判断逻辑填写
      'TimeResolved': '', // 消警时间, 由后续判断逻辑填写
      'Level': warnObj[key].level._value, // 告警级别
      'Description': warnObj[key].description._value, // 告警信息
      'Action': DEFAULT_ACTION, // 告警状态 发生告警\消除告警 0/1
      // 下面的部分根据告警码从设备告警字典中查出
      'DicWarnDescritpion': dicDesc.description || '', // 告警描述（英文）  add 2018/7/25
      'DicWarnComment': dicDesc.comment || '', // 告警描述（中文）  add 2018/7/25
      'DicWarnLevelCode': dicDesc.levelCode || '', // 告警级别编码 （从字典中翻译过来，可以与设备上报的Level做对照） add 2018/7/25
      'DicWarnLevelDescription': dicDesc.levelDescription || '' // 告警级别编码描述（中文） add 2018/7/25
    }
    warnData.push(warnItem)
  }
  return warnData
}

/**
 * 固定台控制盒告警信息抽取
 * @param {Object} warnObj 设备告警信息解析前的结构（根据各种设备不同而不同）
 * @returns {Array} warnData 网管系统告警模块约定的告警信息结构（见本脚本上方元注释）
 */
function deviceGDTMasterExtractor (warnObj) {
  log.debug('deviceGDTMasterExtractor')
  return deviceCZTMasterExtractor(warnObj)
}

/**
 * 固定台控制盒告警信息抽取
 * @param {Object} warnObj 设备告警信息解析前的结构（根据各种设备不同而不同）
 * @returns {Array} warnData 网管系统告警模块约定的告警信息结构（见本脚本上方元注释）
 */
function deviceGDTControlExtractor (warnObj) {
  log.debug('deviceGDTControlExtractor')
  return deviceCZTControlExtractor(warnObj)
}

/**
 * TAU1.0设备
 * 注：目前TAU CPE设备的抽取策略
 * @param {Object} warnObj 设备告警信息解析前的结构（根据各种设备不同而不同）
 * @returns {Array} warnData 网管系统告警模块约定的告警信息结构（见本脚本上方元注释）
 * @author liuyang
 * @since 2018/6/21
 *        2018/7/25 从extractWarnInfo函数中分离出来
 *        2018/8/1  从deviceTAUCPEExtractor函数拆分出来
 *        // TODO 待适配
 */
function deviceTAUExtractor (warnObj) {
  log.debug('deviceTAUExtractor')
  let warnData = []
  // 解析出设备上报的所有告警信息（注：设备可能将同一告警信息上报多次）
  for (var key in warnObj) {
    // 设备差异点1：设备上报信息原始结构可能不同
    if (key === '_object') continue // 跳过_object属性
    if (key === '_writable') continue // 跳过_writable属性 适配CPE1.0设备告警报文

    // 设备差异点2：设备告警字典不同
    // 根据告警编码从告警字典中找到告警信息的相关描述 方便后续持久化到文档中
    let dicDesc = warnsDic.getWarnDesc(warnsDic.DIC_WARN_DESC_TAU, warnObj[key].id._value)

    // 设备差异点3：上报信息的字段名不同
    let warnItem = {
      'Id': warnObj[key].number._value, // 告警码
      'Time': warnObj[key].time._value, // 告警时间 (设备上报的该告警信息的最新告警时间)
      'TimeCreated': '', // 第一次告警时间, 由后续判断逻辑填写
      'TimeResolved': '', // 消警时间, 由后续判断逻辑填写
      'Level': warnObj[key].level._value, // 告警级别
      'Description': warnObj[key].msg._value, // 告警信息
      'Action': DEFAULT_ACTION, // 告警状态 发生告警\消除告警 0/1
      // 下面的部分根据告警码从设备告警字典中查出
      'DicWarnDescritpion': dicDesc.description || '', // 告警描述（英文）  add 2018/7/25
      'DicWarnComment': dicDesc.comment || '', // 告警描述（中文）  add 2018/7/25
      'DicWarnLevelCode': dicDesc.levelCode || '', // 告警级别编码 （从字典中翻译过来，可以与设备上报的Level做对照） add 2018/7/25
      'DicWarnLevelDescription': dicDesc.levelDescription || '' // 告警级别编码描述（中文） add 2018/7/25
    }
    warnData.push(warnItem)
  }
  return warnData
}

/**
 * CPE1.0设备
 * 注：目前TAU CPE设备的抽取策略
 * @param {Object} warnObj 设备告警信息解析前的结构（根据各种设备不同而不同）
 * @returns {Array} warnData 网管系统告警模块约定的告警信息结构（见本脚本上方元注释）
 * @author liuyang
 * @since 2018/6/21
 *        2018/7/25 从extractWarnInfo函数中分离出来
 *        2018/8/1  从deviceTAUCPEExtractor函数拆分出来
 */
function deviceCPEExtractor (warnObj) {
  log.debug('deviceCPEExtractor')
  let warnData = []
  // 解析出设备上报的所有告警信息（注：设备可能将同一告警信息上报多次）
  for (var key in warnObj) {
    // 设备差异点1：设备上报信息原始结构可能不同
    if (key === '_object') continue // 跳过_object属性
    if (key === '_writable') continue // 跳过_writable属性 适配CPE1.0设备告警报文

    // 设备差异点2：设备告警字典不同
    // 根据告警编码从告警字典中找到告警信息的相关描述 方便后续持久化到文档中
    let dicDesc = warnsDic.getWarnDesc(warnsDic.DIC_WARN_DESC_TAU, warnObj[key].id._value)

    // 设备差异点3：上报信息的字段名不同
    let warnItem = {
      'Id': warnObj[key].number._value, // 告警码
      'Time': warnObj[key].time._value, // 告警时间 (设备上报的该告警信息的最新告警时间)
      'TimeCreated': '', // 第一次告警时间, 由后续判断逻辑填写
      'TimeResolved': '', // 消警时间, 由后续判断逻辑填写
      'Level': warnObj[key].level._value, // 告警级别
      'Description': warnObj[key].msg._value, // 告警信息
      'Action': DEFAULT_ACTION, // 告警状态 发生告警\消除告警 0/1
      // 下面的部分根据告警码从设备告警字典中查出
      'DicWarnDescritpion': dicDesc.description || '', // 告警描述（英文）  add 2018/7/25
      'DicWarnComment': dicDesc.comment || '', // 告警描述（中文）  add 2018/7/25
      'DicWarnLevelCode': dicDesc.levelCode || '', // 告警级别编码 （从字典中翻译过来，可以与设备上报的Level做对照） add 2018/7/25
      'DicWarnLevelDescription': dicDesc.levelDescription || '' // 告警级别编码描述（中文） add 2018/7/25
    }
    warnData.push(warnItem)
  }
  return warnData
}

/**
 * 从设备上报的告警信息集合中筛选出由同种告警信息最新一次告警记录组成的告警信息集合
 * 作用：对extractWarnsInfo函数抽取出来的设备原始告警信息进行清洗，仅保留同一类告警信息中带有最新告警时间的记录
 * 规则：判断是否是同种类型告警信息逻辑由isWarnsInfoHasSameContent定义
 * @param {Object} warnsInfo  由extractWarnsInfo函数抽取的设备告警信息集合
 * @return {Object} warnsInfo  由同种告警信息，最新一次告警记录组成的告警信息集合。如果参数为null，则返回null。
 * @author liuyang
 * @since 2018/6/26
 * @update 2018/7/23
 */
function extractTheLatestWarnInfoSet (warnsInfo) {
  if (warnsInfo == null) return null // 容错

  var warnsInfoLatest = {}
  warnsInfoLatest = warnsInfo

  // 待处理集合
  var warnDataArr = [] // 筛选算法操作的数组
  var warnDataArrLatest = [] // 筛选算法输出的数组
  warnDataArr = warnsInfo.warnData.slice() // 复制一份

  // 下面算法也可处理数组仅含一个元素的情况
  for (let i = 0; i < warnDataArr.length; i++) {
    if (warnDataArr[i].checked === true) continue // 如果已经检查过则不再检查
    var warnItemLatest = warnDataArr[i]
    for (let j = 0; j < warnDataArr.length; j++) {
      if (warnDataArr[j].checked === true) continue // 如果已经检查过则不再检查
      // 从后面的记录中寻找是否是否有更近的告警，有则记录
      if (warnsRules.isWarnsInfoHasSameContent(warnItemLatest, warnDataArr[j])) {
        warnDataArr[j].checked = true // 标记已经检查过这个元素
        if (warnsRules.isWarnsInfoHasLatterTime(warnDataArr[j], warnItemLatest)) {
          warnItemLatest = warnDataArr[j]
        }
      }
    }
    warnDataArrLatest.push(warnItemLatest) // 记录同种告警信息中具有最新告警时间的记录
  }
  if (isLogEnabled) log.debug('extractTheLatestWarnInfoSet 筛选后 warnDataArrLatest = ' + JSON.stringify(warnDataArrLatest))

  // 删除checked标记
  var warnDataArrLatestTmp = []
  for (let i = 0; i < warnDataArrLatest.length; i++) {
    var tmp = warnDataArrLatest[i]
    delete tmp.checked // 删除之前的标记
    warnDataArrLatestTmp.push(tmp)
  }
  warnsInfoLatest.warnData = warnDataArrLatestTmp
  return warnsInfoLatest
}

/**
 * 利用设备上报信息更新网管系统告警信息集合
 * 告警信息对比逻辑（按照设备上报最新信息更新状态）
 *    1 如果该设备没有该类型以及该内容的告警，则增加到当前告警。
 *    2 如果该设备已经有该类型以及内容的告警，则更新当前告警的时间。
 *    3 如果该设备最新告警信息中已不存在之前的告警项目， 则将该设备相关告警信息归入历史告警。
 *    注：这部分预留通过WebSocke向前段推送告警信息的位置！
 *    计划创建两个集合，
 *    warns         存放设备当前告警
 *    warnsHistories 存放设备历史告警
 * @param {Object} warnsInfo extractWarnsInfo函数抽取出来的告警信息（依赖该函数返回的对象格式）
 *    约定在MongoDB中存放的也是相同格式的数据
 * @param {Object} socketIO 陈晨封装的websocket工具类，调用其中的发送方法即可完成消息推送。 2018/8/1 added
 *    约定若socketIO为null或者undefined则不推送消息
 * @author liuyang
 * @since 2018/6/23
 * @update 2018/8/1 增加socketIO
 */
function mergeWarnsInfo (warnsInfo, socketIO) {
  // 如果传入的告警信息为空，则不做任何操作
  // if (warnsInfo == null) return // 2018/6/28识别，根据前置两个抽取函数约定，返回null则意为消警。

  // 模拟该设备尚无当前告警信息的情况
  // findAllWithSort('warns', {'deviceId': warnsInfo.deviceId + 1}, {'timestamp': -1}, function (err, result) {
  // 模拟该设备已存在当前告警信息的情况
  // findAllWithSort('warns', {'deviceId': warnsInfo.deviceId}, {'timestamp': -1}, function (err, result) {// 没有确定模型前的临时做法
  // findAll('devices', {'deviceId': 'FFFFFF-Generic-FFFFFF123461'}, function (err, result) {// 当前告警模块，每台设备对应一个
  warnsDb.findAll(COLLECTION_NAME_WARNS, { 'deviceId': warnsInfo.deviceId }, function (err, result) {
    if (err) log.error(err)
    if (isLogEnabled) log.debug('mergeWarnsInfo db result = ' + JSON.stringify(result))

    if (result === null || result.length === 0) {
      // 该设备尚无当前告警信息
      // 如果是尚无该设备告警信息，则需要填写所有告警信息的TimeCreated字段
      for (let idx in warnsInfo.warnData) {
        warnsInfo.warnData[idx]['TimeCreated'] = warnsInfo.warnData[idx].Time // 用设备上报的告警时间填写
      }
      // 设备告警信息保存入数据库
      processWarnsInsert(warnsInfo, socketIO)
    } else {
      // 该设备已存在当前告警信息
      processWarnsMerge(warnsInfo, result[0], socketIO)
    }
  })
}

/**
 * 执行向当前告警信息集合插入告警文档操作
 * @param {Object} warnsInfo 设备告警信息 格式：extractWarnsInfo函数抽取出来的告警信息（依赖该函数返回的对象格式）
 * @param {Object} socketIO 陈晨封装的websocket工具类，调用其中的发送方法即可完成消息推送。 2018/8/1 added
 *    约定若socketIO为null或者undefined则不推送消息
 * @author liuyang
 * @since 2018/6/23
 * @update 2018/8/1 增加socketIO
 */
function processWarnsInsert (warnsInfo, socketIO) {
  if (warnsInfo.warnData.length === 0) return

  if (isLogEnabled) log.debug('processWarnsInsert warnsInfo = ' + JSON.stringify(warnsInfo))
  warnsDb.insertOne('warns', warnsInfo, function (err, result) {
    if (err) log.error(err)
    if (isLogEnabled) log.debug('processWarnsInsert result = ' + JSON.stringify(result))
    // WebSocket推送新增告警消息
    if (!socketIO) {
      socketIO.SendDatasToInterface('', WEBSOCKET_MSG_NAME_WARNS_CHANGE, '', '', '')
    }
  })
}

/**
 * 根据设备告警信息
 * 注：格式均遵循extractWarnsInfo函数抽取出来的告警信息（依赖该函数返回的对象格式：
 * @param {Object} warnsInfo 设备告警信息
 * @param {Object} warnsInfoFromDB 系统保存的上一个时段该设备告警信息
 * @param {Object} socketIO 陈晨封装的websocket工具类，调用其中的发送方法即可完成消息推送。 2018/8/1 added
 *    约定若socketIO为null或者undefined则不推送消息
 * @author liuyang
 * @since 2018/6/23
 * @update 2018/8/1 增加socketIO
 */
function processWarnsMerge (warnsInfo, warnsInfoFromDB, socketIO) {
  // 两个参数任意为空则程序什么都不做
  // if (warnsInfo == null) return // 2018/6/28 识别 warnsInfo == null根据前置抽取函数约定，语义为“消警”
  if (warnsInfo == null && warnsInfoFromDB == null) return // 库中没有告警，待归并告警集合也是空，则直接返回，不做操作。
  // if (warnsInfo.warnData.length == 0) return

  // 在极端情况下，如果难以看出合并逻辑问题，可以输出以下日志获得处理之前的原始数据集 begin
  // 为了适配console，没有直接采用log4js的trace日志级别，而采用了下面的变通方法获得同样的效果。
  if (isLogEnabled && isTrace) log.debug('#trace processWarnsMerge')
  if (isLogEnabled && isTrace) log.debug('#trace processWarnsMerge warnsInfo = ' + JSON.stringify(warnsInfo))
  if (isLogEnabled && isTrace) log.debug('#trace processWarnsMerge warnsInfoFromDB = ' + JSON.stringify(warnsInfoFromDB))
  if (isLogEnabled && isTrace) log.debug('#trace processWarnsMerge warnsInfo.warnData = ' + JSON.stringify(warnsInfo.warnData))
  if (isLogEnabled && isTrace) log.debug('#trace processWarnsMerge warnsInfoFromDB.warnData = ' + JSON.stringify(warnsInfoFromDB.warnData))
  // 在极端情况下，如果难以看出合并逻辑问题，可以输出以下日志获得处理之前的原始数据集 end

  // 情况1 设备新上报告警集合warnsInfo为空，数据库记录的告警集合warnsInfoFromDB不为空
  if (warnsInfo == null && warnsInfoFromDB != null) {
    // 1. 将warnsInfoFromDB中所有信息归档至warnsHistories
    for (let idxDb in warnsInfoFromDB.warnData) {
      dbSaveWarnItemToWarnsHistories(warnsInfoFromDB.warnData[idxDb], warnsInfoFromDB)
    }
    // 2. 将该设备的告警信息文档从当前告警信息集合（warns）中删除
    dbDeleteWarnInfoFromWarns(warnsInfoFromDB)
    return
  }

  // 情况2 设备新上报告警集合warnsInfo、数据库中记录的告警集合warnsInfoFromDB均不为空，则需要对比
  // 第一遍遍历
  // 目的：识别是否有新增告警, 是否有告警时间更新
  // 操作：以设备上报信息为基础进行比较
  var flagWarnItemHasTheSameContent = false // 告警信息拥有相同内容标志 false：没有相同内容记录, true：有相同内容记录
  for (let idxDevice in warnsInfo.warnData) { // 遍历设备上报信息的每一条记录，看数据库中是否已有相关告警
    flagWarnItemHasTheSameContent = false // 恢复标记
    for (let idxDb in warnsInfoFromDB.warnData) {
      if (warnsRules.isWarnsInfoHasSameContent(warnsInfoFromDB.warnData[idxDb], warnsInfo.warnData[idxDevice])) {
        flagWarnItemHasTheSameContent = true // 标记找到了同样的告警信息
        // 更新告警时间处理逻辑: 如果上报的相同内容的告警信时间更接近当前时间, 则更新相关告警的时间
        if (warnsRules.isWarnsInfoHasLatterTime(warnsInfo.warnData[idxDevice], warnsInfoFromDB.warnData[idxDb])) {
          if (isLogEnabled) log.debug('processWarnsMerge 更新 更新数据库中相关记录的告警时间')
          if (isLogEnabled) log.debug('processWarnsMerge 更新 WebSocket通知')
          if (isLogEnabled) log.debug('processWarnsMerge 更新 old warnItem.Time = ' + JSON.stringify(warnsInfoFromDB.warnData[idxDb].Time))
          if (isLogEnabled) log.debug('processWarnsMerge 更新 new warnItem.Time = ' + JSON.stringify(warnsInfo.warnData[idxDevice].Time))

          // 1. 更新数据库中相关记录的告警时间（通过更新warnData字段值来实现）
          let warnDataNew = warnsWarnDataOperations.warnDataUpdateTime(warnsInfoFromDB.warnData, warnsInfo.warnData[idxDevice])
          warnsInfoFromDB.warnData = warnDataNew
          if (isLogEnabled) log.debug('processWarnsMerge 更新 更新后 warnItemFromDB.warnData[idxDb] = ' + JSON.stringify(warnsInfoFromDB.warnData[idxDb]))
          if (isLogEnabled) log.debug('processWarnsMerge 更新 更新后 warnItemFromDB.warnData = ' + JSON.stringify(warnsInfoFromDB.warnData))
          if (isLogEnabled) log.debug('processWarnsMerge 更新 更新后 warnItemFromDB = ' + JSON.stringify(warnsInfoFromDB))
          warnsDb.update(COLLECTION_NAME_WARNS, {'deviceId': warnsInfoFromDB.deviceId}, {$set: {'warnData': warnsInfoFromDB.warnData}}, function (err, result) {
            if (err) log.error(err)
            if (isLogEnabled) log.debug('processWarnsMerge 更新 数据库更新返回结果 result = ' + JSON.stringify(result))
          })
          // 2. WebSocket通知
          if (!socketIO) {
            socketIO.SendDatasToInterface('', WEBSOCKET_MSG_NAME_WARNS_CHANGE, '', '', '')
          }
        }
        break // 找到了相同的告警信息，不需要再向后遍历（基于目前当前告警信息模型：每个设备的每类告警信息仅保存告警时间最新的一条）
      }
    }
    // 新增告警信息处理逻辑
    if (!flagWarnItemHasTheSameContent) { // 数据库中尚无该告警信息
      if (isLogEnabled) log.debug('processWarnsMerge 新增 向warns集合中的该设备告警信息中增加该告警条目(WebSocket通知)')
      if (isLogEnabled) log.debug('processWarnsMerge 新增 WebSocket通知')
      if (isLogEnabled) log.debug('processWarnsMerge 新增 warnItem = ' + JSON.stringify(warnsInfo.warnData[idxDevice]))
      // 1. 插入新的告警信息（通过更新warnData字段值来实现） 即操作MongoDB动作均是通过更新warnData整个字段实现。
      // 注意：新增告警的时候需要填写warnItem.TimeCreated字段！！！
      warnsInfo.warnData[idxDevice]['TimeCreated'] = warnsInfo.warnData[idxDevice].Time // 用设备上报的告警时间填写
      let warnDataNew = warnsWarnDataOperations.warnDataInsert(warnsInfoFromDB.warnData, warnsInfo.warnData[idxDevice])
      warnsInfoFromDB.warnData = warnDataNew
      warnsDb.update(COLLECTION_NAME_WARNS, {'deviceId': warnsInfoFromDB.deviceId}, {$set: {'warnData': warnsInfoFromDB.warnData}}, function (err, result) {
        if (err) log.error(err)
        if (isLogEnabled) log.debug('processWarnsMerge 新增 数据库更新返回结果 result = ' + JSON.stringify(result))
      })
      // 2. WebSocket通知
      if (!socketIO) {
        socketIO.SendDatasToInterface('', WEBSOCKET_MSG_NAME_WARNS_CHANGE, '', '', '')
      }
    }
  }

  // 第二遍遍历
  // 目的：识别自动消警（如果设备上报信息中不再存在相同内容的告警信息则视为自动消警）
  // 操作：以数据库中的记录为基础进行比较
  flagWarnItemHasTheSameContent = false // 告警信息拥有相同内容标志 false：没有相同内容记录, true：有相同内容记录
  let warnDataNew = warnsInfoFromDB.warnData.slice() // 复制一份告警列表， 一会的删除操作需要在这个集合上进行
  for (let idxDb in warnsInfoFromDB.warnData) { // 遍历从数据库中拿出的每条告警信息，看设备新上报的告警信息中是否还存在原有告警信息
    flagWarnItemHasTheSameContent = false // 恢复标记
    for (let idxDevice in warnsInfo.warnData) {
      if (warnsRules.isWarnsInfoHasSameContent(warnsInfoFromDB.warnData[idxDb], warnsInfo.warnData[idxDevice])) {
        flagWarnItemHasTheSameContent = true
        break
      }
    }
    // 自动消警处理逻辑
    // 注意这部分操作都应该是在之前复制出来的warnDataNew数组上进行操作的
    if (!flagWarnItemHasTheSameContent) { // 设备上报信息中已经没有库中记录的告警
      // 若执行到这里证明设备新上报告警中已经不存在之前的告警信息，视为自动消警
      if (isLogEnabled) log.debug('processWarnsMerge 消警 将该条告警信息归档至warnsHistories集合')
      if (isLogEnabled) log.debug('processWarnsMerge 消警 从warns集合中该设备告警信息文档中删除对应的告警信息')
      if (isLogEnabled) log.debug('processWarnsMerge 消警 WebSocket通知')
      if (isLogEnabled) log.debug('processWarnsMerge 消警 warnItem = ' + JSON.stringify(warnsInfoFromDB.warnData[idxDb]))

      // 归档至warnsHistories集合
      dbSaveWarnItemToWarnsHistories(warnsInfoFromDB.warnData[idxDb], warnsInfoFromDB)

      // 从warns集合中的该设备对应文档里删除该条告警信息
      warnDataNew = warnsWarnDataOperations.warnDataDelete(warnDataNew, warnsInfoFromDB.warnData[idxDb])

      // console.log('#trace warnDataNew = \n' + JSON.stringify(warnDataNew))
      // warnsInfoFromDB.warnData = warnDataNew // error
      // WebSocket通知
      if (!socketIO) {
        socketIO.SendDatasToInterface('', WEBSOCKET_MSG_NAME_WARNS_CHANGE, '', '', '')
      }
    }
  }

  if (isLogEnabled) log.debug('processWarnsMerge 第二遍遍历后 warnsInfoFromDB.warnData = \n' + JSON.stringify(warnsInfoFromDB.warnData))
  if (isLogEnabled) log.debug('processWarnsMerge 第二遍遍历后 warnDataNew = \n' + JSON.stringify(warnDataNew))

  //  1. 删除告警逻辑
  //  1.1. 将该设备的该条告警信息归档至warnsHistories集合
  //       注意，删除告警的时候要填写warnItem.TimeResolved字段！！！（在上面遍历操作中已经进行）
  //  1.2. 从warns集合中的该设备对应文档里删除该条告警信息
  //       注意，如果该条告警信息删除之后对应设备的告警集合已经为空数组，则从warns集合中删除该设备对应的告警文档。
  if (warnDataNew == null || warnDataNew.length === 0) {
    // 如果告警集已经为空，则删除warns集合中对应设备的告警文档。
    /*
    deleteOne('warns', {'deviceId': warnsInfoFromDB.deviceId}, function (err, result) {
      if (err) throw err
      if (isDebug) console.log('#debug processWarnsMerge 消警 告警集合已空 删除warns中该设备的告警文档 db result = ' + JSON.stringify(result))
    })
    */
    dbDeleteWarnInfoFromWarns(warnsInfoFromDB)
  } else {
    // 如果告警集合不为空，则更新warns集合中对应设备告警文档的warnData属性
    warnsDb.update(COLLECTION_NAME_WARNS, {'deviceId': warnsInfoFromDB.deviceId}, {$set: {'warnData': warnDataNew}}, function (err, result) {
      if (err) log.error(err)
      if (isLogEnabled) log.debug('processWarnsMerge 告警集合仍有告警信息 更新至数据库 db result = ' + JSON.stringify(result))
    })
  }
  // 2. WebSocket通知
  if (!socketIO) {
    socketIO.SendDatasToInterface('', WEBSOCKET_MSG_NAME_WARNS_CHANGE, '', '', '')
  }
}

/**
 * 将指定设备的指定告警信息保存至warnsHistories集合
 * @param {Object} warnItem 待保存到warnsHistories的告警项
 * @param {Object} warnsInfo 设备告警信息（勇于获得设备信息）
 * @author liuyang
 * @since 2018/6/28
 */
function dbSaveWarnItemToWarnsHistories (warnItem, warnsInfo) {
  let warnItemHistory = warnItem
  warnItemHistory['TimeResolved'] = warnsUtil.getCurrentDateTimeStr() // 按照系统（脚本运行服务器即node.js运行服务器时间）来处理
  warnItemHistory['deviceId'] = warnsInfo.deviceId
  warnItemHistory['deviceType'] = warnsInfo.deviceType
  warnItemHistory['deviceTypeName'] = warnsInfo.deviceTypeName
  warnItemHistory['status'] = '1' // 设备自动消警的情况 状态改为消警告 参见文档《终端二代网管概要设计文档_liuyang_标注版本_20180613.doc》 2018/7/25 add
  warnItemHistory['isChecked'] = '0' // 设备自动消警的情况 状态设置为未确认 参见文档《终端二代网管概要设计文档_liuyang_标注版本_20180613.doc》 2018/7/25 add
  if (isLogEnabled) log.debug('dbSaveWarnItemToWarnsHistories 归档 待归档记录 warnItemHistory = \n' + JSON.stringify(warnItemHistory))

  warnsDb.insertOne(COLLECTION_NAME_WARNS_HISTORIES, warnItemHistory, function (err, result) {
    if (err) log.error(err)
    if (isLogEnabled) log.debug('dbSaveWarnItemToWarnsHistories 归档 归档至warnsHistories 集合 db result = ' + JSON.stringify(result))
  })
}

/**
 * 从warns集合中删除指定设备的告警文档
 * @param {Object} warnsInfo
 * @author liuyang
 * @since 2018/6/28
 */
function dbDeleteWarnInfoFromWarns (warnsInfo) {
  warnsDb.deleteOne(COLLECTION_NAME_WARNS, {'deviceId': warnsInfo.deviceId}, function (err, result) {
    if (err) log.error(err)
    if (isLogEnabled) log.debug('dbDeleteWarnInfoFromWarns 删除warns中该设备的告警文档 db result = ' + JSON.stringify(result))
  })
}

// //////////////////////////////////////////////////////////////////////////////////////////
// 核心流程
exports.processOneDevice = processOneDevice // 外部调用入口
// 为单元测试暴露以下方法
// main 是为单元测试准备的一个入口
exports.main = main // 这个流程包含了核心的extractWarnsInfo、extractTheLatestWarnInfoSet的测试
exports.extractWarnsInfo = extractWarnsInfo // 抽取
exports.extractWarnData = extractWarnData // 适配不同设备
exports.deviceCZTMasterExtractor = deviceCZTMasterExtractor // 车载台主机告警信息抽取器
exports.deviceCZTControlExtractor = deviceCZTControlExtractor // 车载台控制盒告警信息抽取器
exports.deviceGDTMasterExtractor = deviceGDTMasterExtractor // 固定台主机告警信息抽取器
exports.deviceGDTControlExtractor = deviceGDTControlExtractor // 固定台控制盒告警信息抽取器
// exports.deviceTAUCPEExtractor = deviceTAUCPEExtractor // TAU, CPE设备告警信息抽取器
exports.deviceTAUExtractor = deviceTAUExtractor // TAU设备警信息抽取器
exports.deviceCPEExtractor = deviceCPEExtractor // CPE设备告警信息抽取器
exports.extractTheLatestWarnInfoSet = extractTheLatestWarnInfoSet // 清洗
exports.mergeWarnsInfo = mergeWarnsInfo // 归并
// 判断规则 --> warns_merge_rules.js 2018/7/24
// @deprecated exports.isWarnsInfoEquals = isWarnsInfoEquals
// exports.isWarnsInfoHasSameContent = isWarnsInfoHasSameContent
// exports.isWarnsInfoHasSameTime = isWarnsInfoHasSameTime
// exports.isWarnsInfoHasLatterTime = isWarnsInfoHasLatterTime
// warnData操作函数 --> warns_merge_warnsdata_operations.js 2018/7/24
// exports.warnDataInsert = warnDataInsert
// exports.warnDataUpdateTime = warnDataUpdateTime
// exports.warnDataDelete = warnDataDelete
// exports.warnDataSort = warnDataSort // TODO
// exports.warnItemComparator = warnItemComparator // TODO
// 字典表及相关操作 --> warns_merge_dictionary.js 2018/7/23
// exports.getDeviceType = getDeviceType // --> warns_merge_dictionary.js
// exports.getWarnLevel = getWarnLevel // --> warns_merge_dictionary.js
// exports.getWarnDesc = getWarnDesc // --> warns_merge_dictionary.js
// exports.DIC_WARN_DESC_TAU = DIC_WARN_DESC_TAU // --> warns_merge_dictionary.js
// 通用工具 --> warns_util.js
// exports.getCurrentDateTimeStr = getCurrentDateTimeStr // --> warns_util.js
