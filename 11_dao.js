var dao = require('./modules_liuyang/dao/db.js')

var json = {
  'name': 'getParameterValues',
  'parameterNames': [
    'InternetGatewayDevice.configapp.hisoenable'
  ],
  'device': 'FFFFFF-Generic-FFFFFF123457',
  'timestamp': '2018-05-19T02:21:38.179Z',
  'state': 0
}

dao.insertOne('test', json, function (err, result) {
  if (err) throw err
  console.log(result)
})
