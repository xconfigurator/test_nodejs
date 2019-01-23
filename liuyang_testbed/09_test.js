let logProvider = require('../liuyang_01_warns/warns_logprovider') // 适配console和log4js
let log = logProvider.getLogger('09_test.js')

let MongoClient = require('mongodb').MongoClient
let warnsConf = require('../liuyang_01_warns/warns_cfg')

// let util = require('util')

// 第一步查询设备的告警信息
MongoClient.connect(warnsConf.url, function (err, db) {
  if (err) log.error(err)
  let findStrGetWarnInfo = {'deviceId': 'FFFFFF-0301-FFFFFF303233311C4D0230B8D812679111'}
  log.debug('findStrGetWarnInfo = ' + findStrGetWarnInfo)
  let cursor = db.collection(warnsConf.COLLECTION_NAME_WARNS).find(findStrGetWarnInfo)
  cursor.each(function (err, doc) {
    if (err) log.error(err)
    if (doc != null) {
      log.debug('doc = ' + JSON.stringify(doc))
    } else {
      // 第二步 删除设备告警列表中的指定项目

      // 第三步 更新告警集合

      db.close()
      // db.close()
      // resp.end(qs.stringify(pageInfo)) // 返回数据
    }
  }) // end of cursor
})// end of warns
