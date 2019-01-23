var fs = require('fs')

fs.readFile('./static/1.txt', function (err, data) {
  if (err) throw err
  console.log(data)
})
