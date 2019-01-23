/**
* 描述：告警信息合并逻辑需要的各种码表及码表相关操作方法
* 依据：
* 1. 《201807241348_固定台、车载台告警表.docx》 from 徐晓波
* 2. 《终端二代网管概要设计文档_liuyang_标注版本_20180613.doc》 from 陈晨
* 内容：
*   1. 各设备告警信息码表
*   2. 网管系统约定常量（如告警/消警标志）
*   3. ...
* @author liuyang
* @since  2018/7/23 从告警信息合并逻辑主程序中分离出来
*         2018/7/25 按照徐晓波提供的文档，添加相应的码表
*/

// //////////////////////////////////////////////////////////////////////////////////////////
// 业务相关约定常量及方法 begin

// 网管系统约定业务常量 begin
const DEFAULT_ACTION = 0 // 发生告警/消除告警 0/1 默认入库的告警/消警值。默认为告警0。

// 告警状态标志
// 依据：《终端二代网管概要设计文档_liuyang_标注版本_20180613.doc》 from 陈晨
const DIC_WARN_STATUS = {
  '0': '告警',
  '1': '消警',
  '2': '忽略',
  '3': '屏蔽'
}

// 告警确认标志
// 依据： 《终端二代网管概要设计文档_liuyang_标注版本_20180613.doc》 from 陈晨
// 1. 只要进行了操作 消警 | 忽略 | 确认 就设置为已确认
// 2. 设备自动消警的时候置为未确认
const DIC_WARN_ISCHECKED = {
  '0': '未确认',
  '1': '已确认'
}
// 管理系统约定业务相关常量 end

// 各设备告警信息码表
// 设备信息代码表
const DIC_DEVICE_TYPE = {
  '0701': {'description': 'Tracking Area Update', 'comment': 'TAU'}, // 跟踪区域更新
  '0801': {'description': 'Customer Premise Equipment', 'comment': 'CPE'}, // 客户终端设备
  '0101': {'description': '', 'comment': '车载台主机'},
  '0201': {'description': '', 'comment': '车载台控制盒'},
  '0301': {'description': '', 'comment': '固定台主机'},
  '0401': {'description': '', 'comment': '固定台控制盒'}
}

// 告警级别代码表
// 网管系统内部级别告警级别，与chenchen讨论后确定 20180723 liuyang
const DIC_WARN_LEVEL = {
  '0': {'description': '', 'comment': '一般'},
  '1': {'description': '', 'comment': '严重'},
  '2': {'description': '', 'comment': '重要'}
}
/*
const DIC_WARN_LEVEL = {
  'NOTICE': '通知',
  'GENERAL': '一般',
  'IMPORTANT': '重要',
  'FATAL': '致命'
}
*/

// TAU 设备告警状态(依据：TAU告警库_201806250849.docx)
const DIC_WARN_DESC_TAU = {
  '11': {
    'description': 'the temp of pa is over threshold',
    'comment': 'PA模块温度过高',
    'levelCode': '1',
    'levelDescription': '严重'
  },
  '13': {
    'description': 'lte module sys status is offline',
    'comment': 'LTE模块未注册',
    'levelCode': '1',
    'levelDescription': '严重'
  },
  '21': {
    'description': 'unknown moderm, please check modem',
    'comment': '无法识别4G模块',
    'levelCode': '1',
    'levelDescription': '严重'
  },
  '22': {
    'description': 'unknown sd, please check sd',
    'comment': 'SD卡故障',
    'levelCode': '1',
    'levelDescription': '严重'
  },
  '23': {
    'description': 'the temp of mainboard is over threshold',
    'comment': '主板温度过高',
    'levelCode': '2',
    'levelDescription': '重要'
  },
  '24': {
    'description': 'the fun of mainboard is fault',
    'comment': '风扇故障',
    'levelCode': '2',
    'levelDescription': '重要'
  },
  '25': {
    'description': 'user update the device',
    'comment': '设备升级',
    'levelCode': '0',
    'levelDescription': '一般'
  },
  '26': {
    'description': 'user reboot the device',
    'comment': '设备重启',
    'levelCode': '0',
    'levelDescription': '一般'
  },
  '27': {
    'description': 'user update the modem',
    'comment': 'Modem 升级',
    'levelCode': '0',
    'levelDescription': '一般'
  },
  '28': {
    'description': 'the device is out of memory',
    'comment': '内存使用率过高',
    'levelCode': '2',
    'levelDescription': '重要'
  }
}

// CPE 1.0
const DIC_WARN_DESC_CPE = DIC_WARN_DESC_TAU // 2018/7/25

// 车载台控制盒
const DIC_WARN_DESC_CZT_CONTROL = {
  '51': {
    'description': 'the signal of the device is too weak',
    'comment': '电台信号弱',
    'levelCode': '1',
    'levelDescription': '严重'
  },
  '52': {
    'description': 'there is no signal for the device',
    'comment': '电台无信号',
    'levelCode': '2',
    'levelDescription': '重要'
  },
  '53': {
    'description': 'disconnect with the broadcast system',
    'comment': '与广播系统失去连接',
    'levelCode': '1',
    'levelDescription': '严重'
  },
  '54': {
    'description': 'the control box is disconnected with the radio',
    'comment': '控制盒和电台连接断开',
    'levelCode': '1',
    'levelDescription': '严重'
  },
  '28': {
    'description': 'the device is out of memory',
    'comment': '运行内存满',
    'levelCode': '1',
    'levelDescription': '严重'
  },
  '55': {
    'description': '[internal storage full]',
    'comment': '内部存储满',
    'levelCode': '1',
    'levelDescription': '严重'
  },
  '56': {
    'description': '[external storage full ]',
    'comment': '外部存储满',
    'levelCode': '2',
    'levelDescription': '重要'
  },
  '23': {
    'description': 'the temp of mainboard is over threshold',
    'comment': '温度过高',
    'levelCode': '1',
    'levelDescription': '严重'
  }
}

// 车载台主机
const DIC_WARN_DESC_CZT_MASTER = {
  '26': {
    'description': 'user reboot the device',
    'comment': '重启',
    'levelCode': '0',
    'levelDescription': '一般'
  },
  '25': {
    'description': 'user update the device',
    'comment': '设备升级',
    'levelCode': '0',
    'levelDescription': '一般'
  },
  '28': {
    'description': 'the device is out of memory',
    'comment': '内存使用率过高',
    'levelCode': '1',
    'levelDescription': '严重'
  }
}

// 固定台控制盒
const DIC_WARN_DESC_GDT_CONTROL = DIC_WARN_DESC_CZT_CONTROL

// 固定台主机
const DIC_WARN_DESC_GDT_MASTER = DIC_WARN_DESC_CZT_MASTER

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
    // if (deviceId.toUpperCase().includes(key)) { // includes ES6
    if (deviceId.substring(7, 11) === key) {
      deviceType.code = key
      deviceType.name = DIC_DEVICE_TYPE[key].comment
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
 * 获得设备告警信息（根据告警编码获得告警描述）
 * @param {Object} dic 设备告警信息字典对象，
 * @param {string} key 告警编码
 * @return {Object} 设备告警信息详情对象 结构 {'description': '英文描述', 'comment': '中文描述'} 这个结构还会随需求不断发生变化
 *                  若参数dic,key任意为null或未定义，则返回{}
 *                  若设备告警信息未在字典对象中定义，则返回{}
 * @author liuyang
 * @since 2018/6/25
 *        2018/7/25 为方便调用处容错，修改返回值，将null改为{}。
 */
function getWarnDesc (dic, key) {
  if (dic == null || key == null) return {}
  return dic[key.toUpperCase().trim()] || {}
}
// 业务相关约定常量及方法 end

// //////////////////////////////////////////////////////////////////////////////////////////
exports.DEFAULT_ACTION = DEFAULT_ACTION
exports.DIC_DEVICE_TYPE = DIC_DEVICE_TYPE // 设备类型
exports.DIC_WARN_LEVEL = DIC_WARN_LEVEL // 告警等级
exports.DIC_WARN_DESC_TAU = DIC_WARN_DESC_TAU // TAU设备告警码表
exports.DIC_WARN_DESC_CPE = DIC_WARN_DESC_CPE // CPE设备告警码表
// exports.DIC_WARN_DESC_CZT = DIC_WARN_DESC_CZT // 车载台设备告警码表
exports.DIC_WARN_DESC_CZT_CONTROL = DIC_WARN_DESC_CZT_CONTROL // 车载台控制盒告警码表
exports.DIC_WARN_DESC_CZT_MASTER = DIC_WARN_DESC_CZT_MASTER // 车载台控制盒告警码表
// exports.DIC_WARN_DESC_GDT = DIC_WARN_DESC_GDT // 固定台设备告警码表
exports.DIC_WARN_DESC_GDT_CONTROL = DIC_WARN_DESC_GDT_CONTROL // 固定台控制盒告警码表
exports.DIC_WARN_DESC_GDT_MASTER = DIC_WARN_DESC_GDT_MASTER // 固定台控制盒告警码表
// 在字典上的操作
exports.getDeviceType = getDeviceType // 在集合DIC_DEVICE_TYPE上的操作
exports.getWarnLevel = getWarnLevel // 在集合DIC_WARN_LEVEL上的操作
// 通用的设备告警信息字典上的操作
exports.getWarnDesc = getWarnDesc // 在各设备告警码表上的操作
exports.DIC_WARN_STATUS = DIC_WARN_STATUS // 告警信息状态
exports.DIC_WARN_ISCHECKED = DIC_WARN_ISCHECKED // 告警信息是否被确认标志
