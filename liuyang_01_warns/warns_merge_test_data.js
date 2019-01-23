// ////////////////////////////////////////////
// 测试数据集合
// 告警信息合并逻辑测试数据

// ////////////////////////////////////////////
const DEVICE_ID = [
  'FFFFFF-Generic-FFFFFF123461',
  'TAUFFF-Generic-FFFFFF123461',
  'CPEFFF-Generic-FFFFFF123461',
  'CZTFFF-Generic-FFFFFF123461',
  'GDTFFF-Generic-FFFFFF123461',
  'EIOPQERJIWOFNSIOAPVHJNIXZKJISOxjvionxizoe'
]
exports.DEVICE_ID = DEVICE_ID

// ////////////////////////////////////////////
const WARN_ITEMS1 = [ // 同一告警信息在不同时间告警
  {
    "Id": "13",
    "Action": "0",
    "Level": "ALARM",
    "Description": "[LTE] lte module sys status is offline",
    "Time": "2017-09-03 05:22:15"
  },
  {
    "Id": "13",
    "Action": "0",
    "Level": "ALARM",
    "Description": "[LTE] lte module sys status is offline",
    "Time": "2017-09-03 05:22:29"
  },
  {
    "Id": "13",
    "Action": "0",
    "Level": "ALARM",
    "Description": "[LTE] lte module sys status is offline",
    "Time": "2017-09-03 05:22:30"
  }
]
const WARN_ITEMS2 = [ // 有新增告警信息
  {
    "Id": "11",// 相对ITEM1 有新告警信息
    "Action": "0",
    "Level": "ALARM",
    "Description": "the temp of pa is over threshold",
    "Time": "2017-09-03 05:22:15"
  },
  {
    "Id": "11",// 相对ITEM1 有新告警信息
    "Action": "0",
    "Level": "ALARM",
    "Description": "the temp of pa is over threshold",
    "Time": "2017-09-03 05:22:16"
  },
  {
    "Id": "13",
    "Action": "0",
    "Level": "EVENT",// ALARM -> EVENT
    "Description": "[LTE] lte module sys status is offline",
    "Time": "2017-09-03 05:22:29"
  },
  {
    "Id": "13",
    "Action": "0",
    "Level": " ALArM",// 带空格，有大小写差异 --> 应视为一致
    "Description": " [LTE] lte module sys status is OFFLINE ",// 带空格，以及有大小写差异 --> 应视为一致
    "Time": "2017-09-03 05:22:30"
  }
]
const WARN_ITEMS3 = [
  {
    "Id": "11",// 相对ITEM1 有新告警信息
    "Action": "0",
    "Level": "ALARM",
    "Description": "the temp of pa is over threshold",
    "Time": "2017-09-03 05:22:15"
  },
  {
    "Id": "11",// 相对ITEM1 有新告警信息
    "Action": "0",
    "Level": "ALARM",
    "Description": "the temp of pa is over threshold",
    "Time": "2017-09-03 05:22:16"
  },
  {
    "Id": "13",
    "Action": "0",
    "Level": "EVENT",// ALARM -> EVENT
    "Description": "[LTE] lte module sys status is offline",
    "Time": "2017-09-03 05:22:29"
  },
  {
    "Id": "13",
    "Action": "0",
    "Level": " ALArM",// 带空格，有大小写差异 --> 应视为一致
    "Description": " [LTE] lte module sys status is OFFLINE ",// 带空格，以及有大小写差异 --> 应视为一致
    "Time": "2017-09-03 05:22:30"
  }
]
exports.WARN_ITEMS1 = WARN_ITEMS1
exports.WARN_ITEMS2 = WARN_ITEMS2
exports.WARN_ITEMS3 = WARN_ITEMS3

// ////////////////////////////////////////////
// 可以从MongoDB中直接拷贝出来
// for merge测试
// merge函数的前置条件：已经执行了清洗，即相同告警信息只保存一条（具有最新告警时间的那条）
// 即本测试数据集格式是函数extractTheLatestWarnInfoSet的输出
// 模拟单台设备的上报告警信的变化，以测试相关功能点。
// 1. 模拟首次告警信息
// 注：找设备仅以来deviceId，故其他字段没有填写
const WARN_INFO_INIT = {
  /*"_id" : ObjectId("5b2c4d9dac0ed40c44212f02"),*/
  "deviceId" : "FFFFFF-Generic-FFFFFF123461",
  /*"timestamp" : ISODate("2018-06-22T01:15:09.481Z"),*/
  "warnData" : [
      {
          "Id" : "13",
          "Action" : "0",
          "Level" : "ALARM",
          "Description" : "[LTE] lte module sys status is offline",
          "Time" : "2017-09-03 05:22:15"
      }
  ]
}
exports.WARN_INFO_INIT = WARN_INFO_INIT

// 模拟告警时间改变
// 测试点：告警级别\告警信息不变，告警时间发生改变，则对应文档中的告警时间发生变化
const WARN_INFO_CHANGE_TIME = {
  /*"_id" : ObjectId("5b2c4d9dac0ed40c44212f02"),*/
  "deviceId" : "FFFFFF-Generic-FFFFFF123461",
  /*"timestamp" : ISODate("2018-06-22T01:15:09.481Z"),*/
  "warnData" : [
      {
          "Id" : "13",
          "Action" : "0",
          "Level" : "ALARM",
          "Description" : "[LTE] lte module sys status is offline",
          "Time" : "2017-09-03 05:44:29" // 05:22:29 -> 05:44:29
      }
  ]
}
exports.WARN_INFO_CHANGE_TIME = WARN_INFO_CHANGE_TIME

// 模拟告警级别变化 // 目前的编码逻辑是按照不同类型的告警信息来处理。
const WARN_INFO_CHANGE_LEVEL = {

}

// 模拟告警信息变化
const WARN_INFO_CHANGE_DESCRIPTION = {

}

// 模拟告警信息条目增加
const WARN_INFO_INCREACE = {
  /*"_id" : ObjectId("5b2c4d9dac0ed40c44212f02"),*/
  "deviceId" : "FFFFFF-Generic-FFFFFF123461",
  /*"timestamp" : ISODate("2018-06-22T01:15:09.481Z"),*/
  "warnData" : [
      {
          "Id" : "13",
          "Action" : "0",
          "Level" : "ALARM",
          "Description" : "[LTE] lte module sys status is offline",
          "Time" : "2017-09-03 05:44:29"
      },
      { // 新增告警类型
        "Id" : "11",
        "Action" : "0",
        "Level" : "ALARM",
        "Description" : "the temp of pa is over threshold",
        "Time" : "2017-09-03 6:44:29"
      }
  ]
}
exports.WARN_INFO_INCREACE = WARN_INFO_INCREACE

// 模拟告警信息条目继续增加且已有告警信息上报时间更新
const WARN_INFO_INCREACE_CHANGE_TIME = {
  /*"_id" : ObjectId("5b2c4d9dac0ed40c44212f02"),*/
  "deviceId" : "FFFFFF-Generic-FFFFFF123461",
  /*"timestamp" : ISODate("2018-06-22T01:15:09.481Z"),*/
  "warnData" : [
      { // 上报时间变动
          "Id" : "13",
          "Action" : "0",
          "Level" : "ALARM",
          "Description" : "[LTE] lte module sys status is offline",
          "Time" : "2017-09-03 07:44:29" // 05:22:29 -> 05:44:29 --> 07:44:29
      },
      { // 上报时间变动
        "Id" : "11",
        "Action" : "0",
        "Level" : "ALARM",
        "Description" : "the temp of pa is over threshold",
        "Time" : "2017-09-03 8:44:29" // 6:44:29 --> 08:44:29
      },
      { // 新增告警信息
        "Id" : "22",
        "Action" : "0",
        "Level" : "ALARM",
        "Description" : "unknown sd, please check sd', 'comment",
        "Time" : "2017-09-03 8:44:29" // 6:44:29 --> 08:44:29
      }
  ]
}
exports.WARN_INFO_INCREACE_CHANGE_TIME = WARN_INFO_INCREACE_CHANGE_TIME

// 模拟告警信息条目减少
// 测试点：1. 更新warns集合中文档相关告警部分， 2. 自动消警的条目归档至历史告警信息
const WARN_INFO_DECREASE1 = {
  /*"_id" : ObjectId("5b2c4d9dac0ed40c44212f02"),*/
  "deviceId" : "FFFFFF-Generic-FFFFFF123461",
  /*"timestamp" : ISODate("2018-06-22T01:15:09.481Z"),*/
  "warnData" : [
    // 之前的两个告警消除
    { // 新增告警类型
      "Id" : "11",
      "Action" : "0",
      "Level" : "ALARM",
      "Description" : "the temp of pa is over threshold",
      "Time" : "2017-09-03 8:44:29"
    }
  ]
}
exports.WARN_INFO_DECREASE1 = WARN_INFO_DECREASE1

// 模拟设备最新上报告警信息已经不存在
// 这个值的约定参见函数extractTheLatestWarnInfoSet以及extractWarnsInfo
const WARN_INFO_DECREASE2 = {
  /*"_id" : ObjectId("5b2c4d9dac0ed40c44212f02"),*/
  "deviceId" : "FFFFFF-Generic-FFFFFF123461",
  /*"timestamp" : ISODate("2018-06-22T01:15:09.481Z"),*/
  "warnData" : []
}
exports.WARN_INFO_DECREASE2 = WARN_INFO_DECREASE2

// 模拟设备告警全部自动消警
// 场景：按照设备最新上报设备信息，不再包含告警信息。
// 测试点：
const WARN_INFO_NULL = {

}


// 模拟已经在模型中的warnData属性值
const WARN_DATA1 = [
  {
      "Id" : "13",
      "Time" : "2017-09-03 05:22:29",
      "TimeCreated" : "",
      "TimeResolved" : "",
      "Level" : "ALARM",
      "Description" : "[LTE] lte module sys status is offline",
      "Action" : 0
  },
  {
      "Id" : "11",
      "Time" : "2017-09-03 05:22:29",
      "TimeCreated" : "",
      "TimeResolved" : "",
      "Level" : "ALARM",
      "Description" : "the temp of pa is over threshold",
      "Action" : 0
  }
]
exports.WARN_DATA1 = WARN_DATA1

const CPE_DEVICE_INFO = {
  "_id" : "FFF001-0801-0CEFAF00030A",
  "InternetGatewayDevice" : {
      "DeviceInfo" : {
          "HardwareVersion" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "LDC-V01A",
              "_writable" : true
          },
          "Mac" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "",
              "_writable" : true
          },
          "ModemHardwareVersion" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "ME3760",
              "_writable" : true
          },
          "ModemSoftwareVersion" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "LTCPGD115V8.20.20B01P06win",
              "_writable" : true
          },
          "SoftwareVersion" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "989581-cpe",
              "_writable" : true
          },
          "UpTime" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:unsignedInt",
              "_value" : 63,
              "_writable" : true
          },
          "WanIP" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "192.168.20.42",
              "_writable" : true
          },
          "_object" : true,
          "_writable" : true,
          "imsi" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "",
              "_writable" : true
          }
      },
      "_object" : true,
      "_writable" : true,
      "gps" : {
          "Altitude" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "0.0m",
              "_writable" : true
          },
          "Date" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "0000/00/00",
              "_writable" : true
          },
          "Latitue" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "",
              "_writable" : true
          },
          "Longitude" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "0.00000",
              "_writable" : true
          },
          "Time" : {
              "_object" : false,
              // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
              "_type" : "xsd:string",
              "_value" : "08:00:01",
              "_writable" : true
          },
          "_object" : true,
          "_writable" : true
      },
      "system" : {
          "_object" : true,
          "_writable" : true,
          "cell" : {
              "_object" : true,
              "_writable" : true,
              "cellFrequency" : {
                  "_object" : false,
                  // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                  "_type" : "xsd:string",
                  "_value" : "",
                  "_writable" : true
              },
              "cellId" : {
                  "_object" : false,
                  // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                  "_type" : "xsd:string",
                  "_value" : "",
                  "_writable" : true
              },
              "cellRSRP" : {
                  "_object" : false,
                  // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                  "_type" : "xsd:string",
                  "_value" : "",
                  "_writable" : true
              },
              "cellRSRQ" : {
                  "_object" : false,
                  // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                  "_type" : "xsd:string",
                  "_value" : "",
                  "_writable" : true
              },
              "cellRSSI" : {
                  "_object" : false,
                  // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                  "_type" : "xsd:string",
                  "_value" : "",
                  "_writable" : true
              },
              "cellSNR" : {
                  "_object" : false,
                  // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                  "_type" : "xsd:string",
                  "_value" : "",
                  "_writable" : true
              },
              "celltype" : {
                  "_object" : false,
                  // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                  "_type" : "xsd:string",
                  "_value" : "",
                  "_writable" : true
              }
          },
          "systemstate" : {
              "_object" : true,
              "_writable" : true,
              "diskPerc" : {
                  "_object" : false,
                  // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                  "_type" : "xsd:string",
                  "_value" : "38.5159 %",
                  "_writable" : true
              }
          }
      },
      "warn" : {
          "_object" : true,
          "_writable" : true,
          "warn" : {
              "1" : {
                  "_object" : true,
                  "_writable" : true,
                  "level" : {
                      "_object" : false,
                      // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                      "_type" : "xsd:string",
                      "_value" : "ALARM",
                      "_writable" : true
                  },
                  "msg" : {
                      "_object" : false,
                      // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                      "_type" : "xsd:string",
                      "_value" : "[SYS] user update the device",
                      "_writable" : true
                  },
                  "number" : {
                      "_object" : false,
                      // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                      "_type" : "xsd:string",
                      "_value" : "23",
                      "_writable" : true
                  },
                  "time" : {
                      "_object" : false,
                      // "_timestamp" : ISODate("2018-08-07T09:06:27.728Z"),
                      "_type" : "xsd:string",
                      "_value" : "2018-07-11 13:37:01",
                      "_writable" : true
                  }
              },
              "_object" : true,
              "_writable" : true
          }
      }
  },
  "_deviceId" : {
      "_Manufacturer" : "HBFEC",
      "_OUI" : "FFF001",
      "_ProductClass" : "0801",
      "_SerialNumber" : "0CEFAF00030A"
  }
}
exports.CPE_DEVICE_INFO = CPE_DEVICE_INFO
