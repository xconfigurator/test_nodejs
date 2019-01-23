require('./hello2.js')

console.log('hello, world')

let funcHello = function () {
  console.log('hello, function')
}

exports.funcHello = funcHello
