/**
 * 测试告警声音设置服务 express版本
 * 声音文件存放方案：读本地声音文件
 * 可替代的声音文件存放方案: 使用MongoDB GridFS （暂时不采用）
 * @author liuyang
 * @since 2018/8/2
 */
const SERVER_PORT = '8081'
const LOG_OUPUT_NAME = '10_test_warn_audios_server.js'

var express = require('express')
var log4js = require('log4js')
// var bodyParser = require('body-parser')
// var qs = require('qs')
var path = require('path')
var url = require('url')

var log = log4js.getLogger(LOG_OUPUT_NAME)
log.level = 'debug'
var app = express()

// http://localhost:8081/audio
// http://localhost:8081/audio?fileName=WAVE0015.WAV
app.get('/audio', function (request, response) {
  const DEFAULT_AUDIO_FILE_NAME = 'WAVE0015.WAV'
  // 测试1 OK
  // response.sendFile(path.join(__dirname, '/') + 'audios/WAVE0015.WAV')

  // 测试2
  // http://localhost:8081/audio?fileName=WAVE0015.WAV
  // http://localhost:8081/audio?fileName=WAVE0033.WAV
  // 非法url测试：http://localhost:8081/audio?fileName=../00_test.js // 实测会抛出异常，虽然没有安全隐患但会出错。try catch不给力，pass！
  /*
  let params = url.parse(request.url, true).query
  let fileName = params.fileName
  log.debug('fileName = ' + fileName)
  try {
    response.sendFile(path.join(__dirname, '/') + 'audios/' + fileName)
  } catch (e) {
    response.sendFile(path.join(__dirname, '/') + 'audios/' + DEFAULT_AUDIO_FILE_NAME)
    // log.error(e)
    // log.error('Bad request. System return the default audio file = ' + DEFAULT_AUDIO_FILE_NAME)
  } //
  */

  // 测试3 最终方案
  let params = url.parse(request.url, true).query
  let fileCode = params.fileCode
  log.debug(' fileCode = ' + fileCode)

  let fileName = 'WAVE0015.WAV'

  switch (fileCode) {
    case '15':
      fileName = 'WAVE0015.WAV'
      break
    case '27':
      fileName = 'WAVE0027.WAV'
      break
    case '28':
      fileName = 'WAVE0028.WAV'
      break
    case '33':
      fileName = 'WAVE0033.WAV'
      break
    case '39':
      fileName = 'WAVE0039.WAV'
      break
    case '62':
      fileName = 'WAVE0062.WAV'
      break
    case '65':
      fileName = 'WAVE0065.WAV'
      break
    case '87':
      fileName = 'WAVE0087.WAV'
      break
    case '94':
      fileName = 'WAVE0094.WAV'
      break
    case '95':
      fileName = 'WAVE0095.WAV'
      break
    case '97':
      fileName = 'WAVE0097.WAV'
      break
    default:
      fileName = DEFAULT_AUDIO_FILE_NAME
  }
  log.debug('fileName = ' + fileName)
  let filePath = path.join(__dirname, '/') + 'audios/' + fileName
  log.debug('fileFullPath = ' + filePath)
  response.sendFile(filePath)
})

// 启动服务器并输出
app.set('port', process.env.PORT || SERVER_PORT)
var server = app.listen(app.get('port'), function () {
  log.info(LOG_OUPUT_NAME, ' server is listening on server ', server.address().address, ' on port ', server.address().port, ' with pid ', process.pid)
  log.info(path.join(__dirname, '/'))
  log.info(path.join(__dirname, '/') + 'audios/WAVE0015.WAV')
})
