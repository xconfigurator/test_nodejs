// param 服务返回的实例数据
var arr =  [{"value":"TAU","label":"TAU","children":[{"value":"FFF001-0701-FFF00112346312","label":"FFF001-0701-FFF00112346312"}]}
,{"value":"CPE","label":"CPE","children":[]}
,{"value":"CZT","label":"车载台","children":[{"value":"-01","label":"车载台主机","children":[{"value":"FFFFFF-0101-FFFFFF303233311C4D0230B8D812679111","label":"FFFFFF-0101-FFFFFF303233311C4D0230B8D812679111"}]},{"value":"-02","label":"车载台控制盒","children":[]}]},{"value":"GDT","label":"固定台","children":[{"value":"-03","label":"固定台主机","children":[]}
,{"value":"-04","label":"固定台控制盒","children":[]}]}]

/////////////////////////////////////////////////
// param 设备类型和设备编码
var deviceType = 'CZT'  // CZT, GDT, TAU, CPE
var deviceCode = '0101' // 0101 0201

const isDebug = false

/**
 * 从设备服务中获取设备ID列表
 * 注：如果传入映射关系不支持的类型和编号则返回空数组
 * @param {Array} arr 服务/query/devices/devicesNameList返回的数据
 * @param {string} deviceType 设备类型 可选类型：TAU | CPE | CZT | GDT
 * @param {string} deviceCode 设备编码 参考文档《软件中的设备名称及编号》
 * @return 返回指定设备类型的设备ID列表
 * @author liuyang
 * @since 2018/7/11
 */
var extractSpecificDeviceList = function (arr, deviceType, deviceCode) {
  let result = []
  // 这是一个设备编号与服务返回数据代码之间的对应关系
  // 设备编号：参考文档《软件中的设备名称及编号》
  // 设备服务：/query/devices/devicesNameList
  const dic = {
    '0101': '-01', // 车载台主机
    '0201': '-02', // 车载台控制盒
    '0301': '-03', // 固定台主机
    '0401': '-04' // 车载台控制盒
  }

  // 第一步： 选出一级分类
  // 抽取数据一级数据
  let deviceList = []
  for (let idx in arr) {
    if (arr[idx].value === deviceType) {
      deviceList = arr[idx].children
      break
    }
  }
  if (isDebug) console.log('#################################')
  if (isDebug) console.log('#debug deviceList = ' + deviceList)
  if (deviceList.length === 0) return deviceList // 大类都没有就没必要再看了

  if (isDebug) console.log('#debug ' + dic[deviceCode])
  // 根据映射字典，选出二级分类
  for (let idx in deviceList) {
    if (isDebug) console.log('#debug deviceList[idx].value = ' + deviceList[idx].value)
    if (deviceList[idx].value === dic[deviceCode]) {
      if (isDebug) console.log('#debug equals !!!!')
      result = deviceList[idx].children
      break
    }
  }

  // 按需返回
  return result
}

// extractSpecificDeviceList(arr, 'CZT', '0101')
// extractSpecificDeviceList(arr, 'CZT', '0201')
console.log('' + JSON.stringify(extractSpecificDeviceList(arr, 'CZT', '0101')))
console.log('' + JSON.stringify(extractSpecificDeviceList(arr, 'CZT', '0201')))
console.log('' + JSON.stringify(extractSpecificDeviceList(arr, 'GDT', '0301')))
console.log('' + JSON.stringify(extractSpecificDeviceList(arr, 'GDT', '0401')))
