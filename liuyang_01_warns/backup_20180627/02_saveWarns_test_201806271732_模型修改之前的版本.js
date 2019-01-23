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
// @deprecated 测试isWarnsInfoEquals(warnItem1, warnItem2) begin
// 状态：
//  OK 2018/6/23 10:28 初步功能完成 规则：告警等级、告警内容
//  OK 2018/6/23 10:55 比较时忽略大小写以及左右空格
//  OK 2018/6/25 16:04 规则变更为：告警等级、告警码
//  @deprecated since 2018/6/26 将函数重命名为isWarnsInfoHasSameContent，为了配合细化的另外一个判断时间的函数
/*
const WARN_ITEMS1 = data.WARN_ITEMS1
const WARN_ITEMS2 = data.WARN_ITEMS2
const WARN_ITEMS3 = data.WARN_ITEMS3
for (var idx1 in WARN_ITEMS1) { // 输出应该是全部为false，因为id没有相同的
  // console.log(WARN_ITEMS1[idx1])
  for (var idx2 in WARN_ITEMS2) {
    // console.log(WARN_ITEMS2[idx2])
    console.log('( idx1 = ' + idx1 + ', idx2 = ' + idx2 + ') 比较结果：' + app.isWarnsInfoEquals(WARN_ITEMS1[idx1], WARN_ITEMS2[idx2]))
  }
}
*/
/*
for (var idx3 in WARN_ITEMS3) { // 期望输出： 有三个true
  // console.log(WARN_ITEMS1[idx1])
  for (var idx2 in WARN_ITEMS2) {
    // console.log(WARN_ITEMS2[idx2])
    console.log('( idx3 = ' + idx3 + ', idx2 = ' + idx2 + ') 比较结果：' + app.isWarnsInfoEquals(WARN_ITEMS3[idx3], WARN_ITEMS2[idx2]))
  }
}
*/
// 测试isWarnsInfoEquals(warnItem1, warnItem2) end

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
/*
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
// 状态：
// 1. 该设备尚无告警信息、该设备已有告警信息，分支测试通过  ok 2018/06/23
// 2. 该设备尚无告警信息，带数据入库流程测试通过  即 processWarnsInsert 分支测试通过 ok 2018/6/25
// 3. 该设备已有告警信息，数据合并比较流程
//    2018/6/25 测出合并逻辑bug
//    2018/6/26 16:29 添加extractTheLatestWarnSet函数并通过单测
//    2018/6/26 20:05 合并流程（分支）测试通过，已识别WebSocket预留位置，待实现和测试。
// 4. 该设备已有告警信息。
// var warnsInfo = data.WARN_INFO_INIT
// var warnsInfo = data.WARN_INFO_CHANGE_TIME  // ok 2018/6/26 19:18
// var warnsInfo = data.WARN_INFO_INCREACE     // ok 2018/6/26 19:55
// var warnsInfo = data.WARN_INFO_DECREASE1    // ok 2018/6/26 20:03
/*
var warnsInfo = data.WARN_INFO_DECREASE2 // ok 2018/6/26 20:05
app.mergeWarnsInfo(warnsInfo)
*/
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
// 1.

// 测试 function warnDataInsert (warnData, newWarnItem) emd

// //////////////////////////////////////////////////////////////////////////////////////////
// 测试 function warnDataUpdateTime (warnData, warnItem, timeStr) begin

// 测试 function warnDataUpdateTime (warnData, warnItem, timeStr) end

// //////////////////////////////////////////////////////////////////////////////////////////
// 测试 function warnDataDelete (warnData, warnItem) begin

// 测试 function warnDataDelete (warnData, warnItem) end

// //////////////////////////////////////////////////////////////////////////////////////////
// 测试 function warnDataSort (warnData, warnItemComparator) begin

// 测试 function warnDataSort (warnData, warnItemComparator) end

// //////////////////////////////////////////////////////////////////////////////////////////
// 测试 function warnItemComparator (warnItem1, warnItem2) begin

// 测试 function warnItemComparator (warnItem1, warnItem2) end
