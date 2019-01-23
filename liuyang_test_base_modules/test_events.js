// Event
let log4js = require('log4js')
let log = log4js.getLogger('test_events.js')
log.level = 'debug'

const EventEmitter = require('events').EventEmitter

var life = new EventEmitter()
log.info('default max listerners = ' + life.getMaxListeners()) // 默认值为10 （实测环境：v8.11.2）
life.setMaxListeners(3) // 修改默认值

// 注册事件的回调函数
// 1. 官方建议对“同一个事件”（如：‘eventA’）不要创建超过10个监听器（默认上限也是10）。
// 超过控制台会给出警告，但扔可执行代码。 通过getMaxListeners()查看
// 2. 通过setMaxListeners()设定上限
life.on('eventA', function (str) {
  str = str || ''
  log.info('process eventA function 1:  ' + str)
})
life.on('eventA', function (str) {
  str = str || ''
  log.info('process eventA function 2:  ' + str)
})
// ...
life.on('eventA', function (str) {
  str = str || ''
  log.info('process eventA function 3: ' + str)
})

life.on('eventB', function (str) {
  str = str || ''
  log.info('process eventB ' + str)
})

// 触发事件
log.info('########################################')
log.info('result = ' + life.emit('eventA', 'trigger 1'))
log.info('result = ' + life.emit('eventA', 'trigger 2'))
log.info('result = ' + life.emit('eventA', 'trigger 3'))
log.info('result = ' + life.emit('eventA'))
log.info('result = ' + life.emit('eventB', 'trigger B hello eventB'))
log.info('result = ' + life.emit('eventC')) // 并没有注册eventC的监听函数
