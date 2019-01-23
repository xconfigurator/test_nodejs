// test node-schedule
let schedule = require('node-schedule')

schedule.scheduleJob('*/1 * * * * *', function () {
  console.log('The answer to life, the universe, and everything!')
})
