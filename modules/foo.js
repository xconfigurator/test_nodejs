let msg = 'hello, world'
let msgPrivate = 'hello, private'

let myFunc01 = function () {
  console.log(msgPrivate)
}

exports.msg = msg
exports.myFunc011 = myFunc01 // 注意着俩名
