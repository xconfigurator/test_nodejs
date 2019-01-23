var MongoClient = require('mongodb').MongoClient
// var assert = require('assert')

var url = 'mongodb://localhost:27017/liuyang'

MongoClient.connect(url, function (err, db) {
  if (err) throw err
  // assert.equal(null, err);
  console.log('Connected correctly to server.')
  var collection = db.collection('test')
  collection.insertOne({
    'name': 'getParameterValues',
    'parameterNames': [
      'InternetGatewayDevice.configapp.hisoenable'
    ],
    'device': 'FFFFFF-Generic-FFFFFF123457',
    'timestamp': '2018-05-19T02:21:38.179Z',
    'state': 0
  }, function (err, result) {
    if (err) throw err
    // console.log(result)
  })
  db.close()
})
