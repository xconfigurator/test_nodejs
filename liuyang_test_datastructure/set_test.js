let log4js = require('log4js')
let log = log4js.getLogger('set_test.js')
log.level = 'debug'
let set = require('./set')

set.add('aaa')
set.add('bbb')
set.add('ccc')
log.debug(set.toString())

set.add('ddd')
log.debug(set.toString())
log.debug(set.isEmpty())
log.debug(set.contains('aaa'))
log.debug(set.contains('bbb'))

set.remove('aaa')
log.debug(set.toString())
set.remove('aaa')
log.debug(set.toString())
set.remove('bbb')
set.remove('ccc')
set.remove('ddd')
log.debug(set.toString())

set.remove('xxxxxxxx')
log.debug(set.toString())
log.debug('end of test')
