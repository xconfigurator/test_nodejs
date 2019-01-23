let log4js = require('log4js')
let log = log4js.getLogger('16_test_promise.js')
log.level = 'debug'
// let util = require('util')

// let promisei = new Promise()
// log.info(util.inspect(promisei))
log.info(Promise)

function runAsync () {
  var p = new Promise(function (resolve, reject) {
    // 做一些异步操作
    setTimeout(function () {
      log.info('执行完成')
      resolve('随便什么数据')
    }, 2000)
  })
  return p
}

// runAsync()
runAsync().then(function (data) {
  log.info(data)
})

function getNumber () {
  var p = new Promise(function (resolve, reject) {
    // 做一些异步操作
    setTimeout(function () {
      var num = Math.ceil(Math.random() * 10) // 生成1-10的随机数
      if (num <= 5) {
        resolve(num)
      } else {
        reject('数字太大了')
      }
    }, 2000)
  })
  return p
}

getNumber().then(
  function (data) {
    log.info('resolved')
    log.info(data)
  },
  function (reason, data) {
    log.error('rejected')
    log.error(data)
    log.error(reason)
  }
)
