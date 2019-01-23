/**
 * 为折线图生成随机测试数据
 * @author liuyang
 * @since 2018/9/20
 */
let log4js = require('log4js')
let log = log4js.getLogger('17_test_random.js')
log.level = 'debug'

log.info('#产生随机数')

const MAX_NUMBER = 20 // 随机数样本点个数
const MAX_RANGE = 40 // 随机数范围
const FULL_RANGE = 100

let xData = []
for (let i = 1; i <= MAX_NUMBER; i++) {
  xData.push(' ' + i)
}
log.info('xData = \n' + xData)
// log.info('xData = \n' + JSON.stringify(xData))

let r
let yData = []
for (let i = 0; i < MAX_NUMBER; i++) {
  r = Math.floor(Math.random() * MAX_RANGE)
  // log.info(r)
  yData.push(' ' + r)
}
log.info('yData = \n' + yData)
// log.info('yData = \n' + JSON.stringify(yData))

let yDataComplementary = []
for (let i = 0; i < MAX_NUMBER; i++) {
  r = FULL_RANGE - (Math.floor(Math.random() * MAX_RANGE))
  yDataComplementary.push(' ' + r)
}
log.info('yDataComplementary = \n' + yDataComplementary)
