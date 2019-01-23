// liuyang
// since 2018/10/17
// demonstrate http module
let log4js = require('log4js')
let log = log4js.getLogger('test_http_web_crawlers.js')
log.level = 'debug'

let http = require('http')
// let cheerio = require('cheerio')

const AIM_URL = 'http://www.imooc.com/learn/348'

log.info('begin')

/*
function filterChapters (html) {
  // npm install cheerio // 一个类似jQuery的工具
  // var $ = cheerio.load(html)
  // var chapters = $('.')
}
*/

http.get(AIM_URL, function (res) {
  let html = ''

  res.on('data', function (data) {
    html += data
  })

  res.on('end', function () {
    log.info(html)
    // filterChapters(html)
  })
}).on('error', function () {
  log.error('获取课程出错')
})

// 从这句话的输出次序来看，可以明显看出http.get是一个异步处理函数。
log.info('end')
