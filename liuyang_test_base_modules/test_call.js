//
let log4js = require('log4js')
let log = log4js.getLogger('foo2.js')
log.level = 'debug'

let pet = {
  words: '...',
  speak: function (say) {
    log.info(say + ' ' + this.words)
  }
}
pet.speak('Speak')

let dog = {
  words: 'wang'
}
// call改变了speak的上下文（this）
pet.speak.call(dog, 'Speak')
