var app = require('./02_saveWarns.js')
var data = require('./02_saveWarns_test_data.js')

// ////////////////////////////////////////////
// 测试完抽取报警信息功能
// 前提：启动本机MongoDB，且集合liuyang.devices中包含测试数据，
// 状态：编码中
// app.main()

// ////////////////////////////////////////////
// 测试getDeviceType(deviceId) begin
// 状态：OK 2018/6/22 14:59
// const DEVICE_ID = data.DEVICE_ID
/*
for (var idx in DEVICE_ID) {
  console.log(JSON.stringify(app.getDeviceType(DEVICE_ID[idx])))
}
*/
// 测试getDeviceType(deviceId) end

// ///////////////////////////////////////////
// 测试isWarnsInfoHasSameContent(warnItem1, warnItem2) begin
// 状态：
//    1.2018/06/26 ok 更名后重新测试通过
/*
const WARN_ITEMS1 = data.WARN_ITEMS1
const WARN_ITEMS2 = data.WARN_ITEMS2
const WARN_ITEMS3 = data.WARN_ITEMS3
*/
/*
for (var idx1 in WARN_ITEMS1) { // 输出应该是全部为false，因为id没有相同的
  // console.log(WARN_ITEMS1[idx1])
  for (var idx2 in WARN_ITEMS2) {
    // console.log(WARN_ITEMS2[idx2])
    console.log('( idx1 = ' + idx1 + ', idx2 = ' + idx2 + ') 比较结果：' + app.isWarnsInfoHasSameContent(WARN_ITEMS1[idx1], WARN_ITEMS2[idx2]))
  }
}
*/
/*
for (var idx3 in WARN_ITEMS3) { // 期望输出： 有三个true
  // console.log(WARN_ITEMS1[idx1])
  for (var idx2 in WARN_ITEMS2) {
    // console.log(WARN_ITEMS2[idx2])
    console.log('( idx3 = ' + idx3 + ', idx2 = ' + idx2 + ') 比较结果：' + app.isWarnsInfoHasSameContent(WARN_ITEMS3[idx3], WARN_ITEMS2[idx2]))
  }
}
*/
// 测试isWarnsInfoHasSameContent(warnItem1, warnItem2) end

// ///////////////////////////////////////////
// 测试isWarnsInfoHasSameTime(warnItem1, warnItem2) begin
// 状态：
//  1. 2018/2/26 OK
/*
const WARN_ITEMS1 = data.WARN_ITEMS1
const WARN_ITEMS2 = data.WARN_ITEMS2
const WARN_ITEMS3 = data.WARN_ITEMS3
for (var idx1 in WARN_ITEMS1) {
  for (var idx2 in WARN_ITEMS2) {
    console.log('(idx1 = ' + idx1 + ', idx2 = ' + idx2 + ') 比较结果:' + app.isWarnsInfoHasSameTime(WARN_ITEMS1[idx1], WARN_ITEMS2[idx2]))   
  }
}
*/
// 测试isWarnsInfoHasSameTime(warnItem1, warnItem2) end

// ///////////////////////////////////////////
// 测试 isWarnsInfoHasLatterTime(warnItem1, warnItem2) end
// 状态：
//  1. 2018/6/26 15：36 ok
/*
const WARN_ITEMS1 = data.WARN_ITEMS1
const WARN_ITEMS2 = data.WARN_ITEMS2
const WARN_ITEMS3 = data.WARN_ITEMS3
for (var idx1 in WARN_ITEMS1) {
  for (var idx2 in WARN_ITEMS2) {
    console.log('(Time1 = ' + WARN_ITEMS1[idx1].Time + ', Time2 = ' + WARN_ITEMS2[idx2].Time + ') 比较结果:' + app.isWarnsInfoHasLatterTime(WARN_ITEMS1[idx1], WARN_ITEMS2[idx2]))   
  }
}
*/
// 测试 isWarnsInfoHasLatterTime(warnItem1, warnItem2) end

// ///////////////////////////////////////////
// 测试 extractTheLatestWarnInfoSet(warnsInfo) begin
// 状态：
// 1. 2018/6/26 16:37 OK
// 说明：为了形成装饰设计模式调用，参数设计为warnsInfo，由于初期各种情况的设备信息数据不太好搞，实际上该函数仅关注warnData属性部分的值
// 为方便测试，做了一点适配，以利用自行编写的测试数据集中的相关数据。后期待有大量设备信息后，则可直接使用原始数据集测试。
// 2. 2018/6/27 20:11 OK
// 说明：使用新模型（即把{}改为了[]）测试数据集
//      修改 extractTheLatestWarnInfoSet 后测试
/*
// @deprecated 旧模型 适配版测试数据集
const WARN_ITEMS1 = data.WARN_ITEMS1
const WARN_ITEMS2 = data.WARN_ITEMS2
const WARN_ITEMS3 = data.WARN_ITEMS3
// 适配 begin
var warnsInfo1 = {'warnData':{}}
var warnsInfo2 = {'warnData':{}}
var warnsInfo3 = {'warnData':{}}
for (var i = 0; i < WARN_ITEMS1.length; i++ ) {
  warnsInfo1.warnData[i + 1] = WARN_ITEMS1[i]
}
for (var i = 0; i < WARN_ITEMS2.length; i++ ) {
  warnsInfo2.warnData[i + 1] = WARN_ITEMS2[i]
}
for (var i = 0; i < WARN_ITEMS3.length; i++ ) {
  warnsInfo3.warnData[i + 1] = WARN_ITEMS3[i]
}
// 适配 end
*/
/*
// 新模型版测试数据集
const WARN_ITEMS1 = data.WARN_ITEMS1
const WARN_ITEMS2 = data.WARN_ITEMS2
const WARN_ITEMS3 = data.WARN_ITEMS3
// 适配 begin
var warnsInfo1 = {'warnData': WARN_ITEMS1}
var warnsInfo2 = {'warnData': WARN_ITEMS2}
var warnsInfo3 = {'warnData': WARN_ITEMS3}
// 适配 end

console.log('################################################')
console.log('#TEST 处理前 ' + JSON.stringify(warnsInfo1))
console.log('#TEST 处理后 ' + JSON.stringify(app.extractTheLatestWarnInfoSet(warnsInfo1))) // 测同种告警信息 期待返回一条 ok
console.log('\n\n')
console.log('################################################')
console.log('#TEST 处理前 ' + JSON.stringify(warnsInfo2))
console.log('#TEST 处理后 ' + JSON.stringify(app.extractTheLatestWarnInfoSet(warnsInfo2))) // 测有不同种告警信息情况
console.log('\n\n')
console.log('################################################')
console.log('#TEST 处理前 ' + JSON.stringify(warnsInfo3))
console.log('#TEST 处理后 ' + JSON.stringify(app.extractTheLatestWarnInfoSet(warnsInfo3))) // 测有不同种告警信息情况
console.log('\n\n')
*/
// 测试 extractTheLatestWarnInfoSet(warnsInfo) end

// ///////////////////////////////////////////
// 测试 mergeWarnsInfo(warnsInfo) begin
// 测试数据说明：单测这个方法mergeWarnsInfo方法仅涉及MongoDB中的warns集合以及模拟测试数据集（例举各种情况）
// 状态：
// 1. 该设备尚无告警信息、该设备已有告警信息，分支测试通过  ok 2018/06/23
// 2. 该设备尚无告警信息，带数据入库流程测试通过  即 processWarnsInsert 分支测试通过 ok 2018/6/25
// 3. 该设备已有告警信息，数据合并比较流程
//    2018/6/25 测出合并逻辑bug
//    2018/6/26 16:29 添加extractTheLatestWarnSet函数并通过单测
//    2018/6/26 20:05 合并流程（分支）测试通过，已识别WebSocket预留位置，待实现和测试。
// 4. 修改模型后对1、2、3点重新测试
// 5. 该设备已有告警信息。// TODO
//
// 1. 该设备尚无告警信息
// 前置条件：测试该设备尚无告警信息的时候应删除warns集合中测试设备的告警文档
// 预期效果: 程序将测试数据集的数据data.WARN_INFO_INIT插入warns集合
// var warnsInfo = data.WARN_INFO_INIT
// 2. 该设备已有告警信息
// 前置条件：集合中应已经存在该设备的告警集合。 当没有之前的告警记录时执行的就是新增逻辑（2018/6/28 已测 OK）。
// 预期效果：指定告警条目的告警时间发生改变（仅当新告警条目的时间更近时更新）
// var warnsInfo = data.WARN_INFO_CHANGE_TIME // ok 2018/6/26 19:18  // 2018/6/28 09:58 更新模型后重新测试 OK // 2018/6/28 10:20 TimeCreated不变，Time改变成新值 ok
// 预期效果：增加一条告警条目, 且有TimeCreated字段，与Time字段相同
// var warnsInfo = data.WARN_INFO_INCREACE // ok 2018/6/26 19:55 // 2018/6/28 10:42 ok
// 预期效果：再增加一条告警条目，同时更新两条已有告警条目的上报时间。
// var warnsInfo = data.WARN_INFO_INCREACE_CHANGE_TIME // 2018/6/28 OK
// 预期效果：1. 自动消警的消息被归档至warnsHistory集合。2. warnData数据集合中删除相关的告警。
// var warnsInfo = data.WARN_INFO_DECREASE1 // ok 2018/6/26 20:03 // 2018/6/28 10:49 新数据集分支测试 ok // 功能 2018-06-28 14:42:23 解决
// 预期效果：1. 该设备告警信息全部归档至。 2. 该设备的告警信息从当前告警集合（warns）中删除
var warnsInfo = data.WARN_INFO_DECREASE2 // ok 2018/6/26 20:05 // 2018/0628 16:44 告警归档，告警集删除功能完成
app.mergeWarnsInfo(warnsInfo)
// 测试 mergeWarnsInfo(warnsInfo) end

// ///////////////////////////////////////////
// 测试 getWarnLevel(warnCode) begin
// 状态：
//      1. 按照测试编码验证功能 OK 2018/6/25 11:23
//      2. 待逻辑确认后，按照正式字典值测试 // TODO
/*
console.log(app.getWarnLevel('ALARM'))
console.log(app.getWarnLevel('FATAL'))
console.log(app.getWarnLevel('EVENT'))

console.log(app.getWarnLevel(' alArm')) // 测大小写，前后空格
console.log(app.getWarnLevel('Fatal '))
console.log(app.getWarnLevel(' event '))
*/
// 测试 getWarnLevel(warnCode) end

// ///////////////////////////////////////////
// 测试 function getWarnDesc(dic, key)  begin
// 状态：
// 1. 测试函数在DIC_WARN_DESC_TAU字典上运行 ok 2018/6/25
// var WARN_DESC_TAU_CODE = ['13', '11', '21', ' 22 ', ' 23', '24 '] // 测试序列1
/*
var WARN_DESC_TAU_CODE = [' 22 ', ' 23', '24 ', '13', '11', '21'] // 测试序列2
for (var idx in WARN_DESC_TAU_CODE) {
  console.log(WARN_DESC_TAU_CODE[idx] + ' = ' + JSON.stringify(app.getWarnDesc(app.DIC_WARN_DESC_TAU, WARN_DESC_TAU_CODE[idx])))  
}
*/
// 2. TODO CPE

// 3. TODO CZT

// 4. TODO GDT

// 测试 function getWarnDesc(dic, key)  begin

// //////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////
// 下面的一组函数定义在数据集合warnData上的一套操作
// warnData: [warnItem, warnItem, warnItem ...]

// //////////////////////////////////////////////////////////////////////////////////////////
// 测试 function warnDataInsert (warnData, newWarnItem) begin
// 状态
// 1. 2018/6/27 19:32 OK
/*
const WARN_DATA1 = data.WARN_DATA1
const WARN_ITEM1 = { // 与WARN_DATA1中的一条告警记录相同，期待返回warnData中与WARN_DATA1相同
  "Id" : "13",
  "Time" : "2017-09-03 05:22:29",
  "TimeCreated" : "",
  "TimeResolved" : "",
  "Level" : "ALARM",
  "Description" : "[LTE] lte module sys status is offline",
  "Action" : 0
}
const WARN_ITEM2 = { // 与WARN_DATA1中的所有告警记录都不同，期待返回warnData中有三条记录
  "Id" : "21",// 不同于WARN_DATA1的记录
  "Time" : "2017-09-03 05:22:29",
  "TimeCreated" : "",
  "TimeResolved" : "",
  "Level" : "ALARM",
  "Description" : "unknown moderm, please check modem",// 
  "Action" : 0
}
console.log('#test warnDataInsert WARN_DATA1 = ' + JSON.stringify(WARN_DATA1))
console.log('#test warnDataInsert 增加WARN_ITEM1, 返回应与WARN_DATA1相同 = ' + JSON.stringify(app.warnDataInsert(WARN_DATA1, WARN_ITEM1)))
console.log('#test warnDataInsert 增加WARN_ITEM2, 返回应该是增加了WARN_ITEM2的集合 = ' + JSON.stringify(app.warnDataInsert(WARN_DATA1, WARN_ITEM2)))
*/
// 测试 function warnDataInsert (warnData, newWarnItem) emd

// //////////////////////////////////////////////////////////////////////////////////////////
// 测试 function warnDataUpdateTime (warnData, warnItem, timeStr) begin
// 状态
// 1. 2018/6/27 19:52 ok
/*
const WARN_DATA1 = data.WARN_DATA1
const WARN_ITEM1 = { // 与WARN_DATA1中的一条告警记录相同，期待返回warnData中与WARN_DATA1相同(即不更新) 
  "Id" : "13",
  "Time" : "2017-09-03 05:22:29",
  "TimeCreated" : "",
  "TimeResolved" : "",
  "Level" : "ALARM",
  "Description" : "[LTE] lte module sys status is offline",
  "Action" : 0
}
const WARN_ITEM2 = {// 与WARN_DATA1中的一条告警记录相同，但具有更近的告警时间，期待返回warnData中对应记录的告警时间按WARN_ITEM2的进行更新
  "Id" : "13",
  "Time" : "2018-09-03 05:22:29",
  "TimeCreated" : "",
  "TimeResolved" : "",
  "Level" : "ALARM",
  "Description" : "[LTE] lte module sys status is offline",
  "Action" : 0
}
console.log('#test warnDataUpdateTime WARN_DATA1 = ' + JSON.stringify(WARN_DATA1))
console.log('#test warnDataUpdateTime 更新WARN_ITEM1, 返回应与WARN_DATA1相同 = ' + JSON.stringify(app.warnDataUpdateTime(WARN_DATA1, WARN_ITEM1)))
console.log('#test warnDataUpdateTime 更新WARN_ITEM2, 返回应该是按WARN_ITEM2告警时间更新过的 = ' + JSON.stringify(app.warnDataUpdateTime(WARN_DATA1, WARN_ITEM2)))
*/
// 测试 function warnDataUpdateTime (warnData, warnItem, timeStr) end

// //////////////////////////////////////////////////////////////////////////////////////////
// 测试 function warnDataDelete (warnData, warnItem) begin
// 状态
// 1. 2018/6/27 19:58 OK
/*
const WARN_DATA1 = data.WARN_DATA1
const WARN_ITEM1 = { // 与WARN_DATA1中的一条告警记录相同，期待返回warnData中已经不再包含WARN_ITEM1
  "Id" : "13",
  "Time" : "2017-09-03 05:22:29",
  "TimeCreated" : "",
  "TimeResolved" : "",
  "Level" : "ALARM",
  "Description" : "[LTE] lte module sys status is offline",
  "Action" : 0
}
const WARN_ITEM2 = { // 与WARN_DATA1中的所有告警记录都不同，期待返回warnData与WARN_DATA1中数据相同
  "Id" : "21",// 不同于WARN_DATA1的记录
  "Time" : "2017-09-03 05:22:29",
  "TimeCreated" : "",
  "TimeResolved" : "",
  "Level" : "ALARM",
  "Description" : "unknown moderm, please check modem",// 
  "Action" : 0
}
console.log('#test warnDataDelete WARN_DATA1 = ' + JSON.stringify(WARN_DATA1))
console.log('#test warnDataDelete 删除WARN_ITEM2, 返回应与WARN_DATA1相同（即没有删除不存在的条目） = ' + JSON.stringify(app.warnDataDelete(WARN_DATA1, WARN_ITEM2)))
console.log('#test warnDataDelete 删除WARN_ITEM1, 返回应是一删除了WARN_ITEM1的条目 = ' + JSON.stringify(app.warnDataDelete(WARN_DATA1, WARN_ITEM1)))
*/
// 测试 function warnDataDelete (warnData, warnItem) end

// //////////////////////////////////////////////////////////////////////////////////////////
// 测试 function warnDataSort (warnData, warnItemComparator) begin
// TODO
// 测试 function warnDataSort (warnData, warnItemComparator) end

// //////////////////////////////////////////////////////////////////////////////////////////
// 测试 function warnItemComparator (warnItem1, warnItem2) begin
// TODO
// 测试 function warnItemComparator (warnItem1, warnItem2) end

// //////////////////////////////////////////////////////////////////////////////////////////
// 测试 function getCurrentDateTimeStr begin
// 状态：
// 1. ok 2018-06-28 13:34:19
// console.log('#test currentDateTimeStr = ' + app.getCurrentDateTimeStr())
// 测试 function getCurrentDateTimeStr  end
