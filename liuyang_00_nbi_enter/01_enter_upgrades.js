/**
 * 测试整个入口
 */
// const QUERY_REGEX = /^\/query\/([a-zA-Z0-9_]+s)\/([a-zA-Z0-9_]+)\/?$/
// const DEVICE_TASKS_REGEX = /^\/devices\/([a-zA-Z0-9\-\_\%]+)\/tasks\/?$/
// const URL = 'http://192.168.192.3:7557/devices?query=' // 来自晨晨示例代码
// const URL = 'http://192.168.192.3:7557/devices?query=' // 来自晨晨示例代码

// const URL = '/query/warns/insert' // 来自晨晨示例代码 true
// const URL = '/query/warns/insert/' // 来自晨晨示例代码 true
/*
const URL = '/query/warns/insert/xx' // 来自晨晨示例代码 false
console.log(QUERY_REGEX.test(URL))
console.log(QUERY_REGEX.exec(URL))
*/
var querystring = require('querystring')

const UPGRADES_REGEX = /^\/upgrades\/([a-zA-Z0-9\%\!\*\'\(\)\;\:\@\&\=\+\$\,\?\#\[\]\-\_\.\~]+)\/?$/;
// const UPGRADES_REGEX = /^\/upgrades\/([a-zA-Z0-9_]+s)\/([a-zA-Z0-9_]+)\/+$/;
const URL = '/upgrades/query'                  // POST 查询固件信息，按照deviceCode来检索
// const URL = '/upgrades/getdevicelist'       // 获取
// const URL = '/upgrades/upload'              // OPTIONS, POST
// const URL = '/upgrades/upgrade'             // POST
// const URL = '/upgrades/delete'              // GET
// const URL = '/upgrades/delete/test_2018071012170451943.docx'

// http://192.168.61.25:7557/upgrades/query

console.log(UPGRADES_REGEX.test(URL))
console.log(UPGRADES_REGEX.exec(URL))

if (UPGRADES_REGEX.test(URL)) {
  let operationName = querystring.unescape(UPGRADES_REGEX.exec(URL)[1])
  console.log('#debug operationName = ' + operationName)

  // 跨域
  // 在nbi中添加
  /**
  response.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
   */

  // 查询： 按照设备编码查询固件信息
  // 注： HTTP方法 if (request.method === 'POST') {}
  if (operationName === 'query') {
    console.log('#debug query')
  }

  // 查询： 获取目标设备列表
  if (operationName === 'getdevicelist') {
    console.log('#debug getdevicelist')
  }

  // 上传
  if (operationName === 'upload') {
    console.log('#debug upload')
  }

  // 升级设备
  if (operationName === 'upgrade') {
    console.log('#debug upgrade')
  }

  // 删除固件
  if (operationName === 'delete') {
    console.log('#debug delete')
  }
}
