/**
 * 告警模块逻辑可配置信息
 * 1. 告警DAO需要 warns-db.js
 * 1. 告警合并逻辑需要 warns-merge.js
 * 2. 告警前端服务需要 warns-service.js
 */
module.exports = {
  // 'url': 'mongodb://127.0.0.1:27017/liuyang'
  // 'url': 'mongodb://127.0.0.1:27017/genieacs'
  'url': 'mongodb://192.168.61.25:27017/genieacs', // 数据库连接信息
  'COLLECTION_NAME_DEVICES': 'devices', // MongoDB中，存放设备信息的集合
  'COLLECTION_NAME_WARNS': 'warns', // MongoDB中，当前告警信息存放的集合名称
  'COLLECTION_NAME_WARNS_HISTORIES': 'warnsHistories' // MongoDB中，历史告警信息存放的集合名称
}
