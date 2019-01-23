// liuyang
// 2018/10/16
// API: https://nodejs.org/docs/latest-v7.x/api/fs.html
let log4js = require('log4js')
let log = log4js.getLogger('01_fs.js')
log.level = 'debug'

let fs = require('fs')
let path = require('path')
let util = require('util')

const TEST_PATH = 'E:/home/liuyang/workspace_dev/test_fs'

// fs.mkdir(TEST_PATH)
try {
  if (!fs.existsSync(TEST_PATH)) fs.mkdirSync(TEST_PATH)
  if (!fs.existsSync(path.join(TEST_PATH, '/aaa.txt'))) fs.mkdirSync(path.join(TEST_PATH, '/aaa.txt'))
} catch (e) {
  log.error(e)
}

/*
log.info('hey!')
log.info('hey!')
log.info('hey!')
log.info('hey!')
*/

// fs.stat(TEST_PATH)
try {
  fs.stat(TEST_PATH, function (err, stat) {
    if (err) log.error(util.inspect(err))
    log.info('isDirectory(): ' + stat.isDirectory())
    log.info('isSymbolicLink():' + stat.isSymbolicLink())
  })
} catch (e) {
  log.error(e)
}

// fs.readFile()
