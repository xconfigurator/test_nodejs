let log4js = require('log4js')
let log = log4js.getLogger('foo2.js')
log.level = 'debug'

function Pet (words) {
  this.words = words
  this.speak = function () {
    log.info(this.words)
  }
}

function Dog (words) {
  Pet.call(this, words)
  // Pet.apply(this, arguments)
}

var dog = new Dog('wang')
dog.speak()
