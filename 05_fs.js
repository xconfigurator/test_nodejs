var fs = require('fs')

const PATH = 'E:/home/liuyang/workspace/test_nodejs/liuyang_testbed/upload/axios.min_2018070909533798436.js'

fs.unlink(PATH, function (err) {
  if (err) console.log(err)
})
