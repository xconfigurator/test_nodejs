
let fs = require('fs')

const path = './hello.txt'

let data = 'aGVsbG8sIHdvcmxk'
// let dataBuffer1 = new Buffer(data, 'base64') //把base64码转成buffer对象
let fileDataBuffer = Buffer.from(data, 'base64') // 把base64码转成buffer对象
console.log(fileDataBuffer)

fs.writeFileSync(path, fileDataBuffer, function (err) {
  if (err) console.log(err)
})
