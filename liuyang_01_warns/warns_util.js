/**
* 描述：告警信息合并逻辑工具类
* 内容：
*   1. 获取当前系统（node.js server）当前时间
* @author liuyang
* @since  2018/7/23 从告警信息合并逻辑主程序中分离出来
*/

/**
 * 获得当前日期 格式为yyy-MM-dd hh:mi:ss的字符串，
 * @author liuyang
 * @since 2018/6/27
 */
function getCurrentDateTimeStr () {
  let date = new Date()
  let year = date.getFullYear() + ''
  let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : '' + (date.getMonth() + 1)
  let day = date.getDate() < 10 ? '0' + date.getDate() : '' + date.getDate()
  let hours = date.getHours() < 10 ? '0' + date.getHours() : '' + date.getHours()
  let minutes = date.getMinutes() < 10 ? '' + date.getMinutes() : '' + date.getMinutes()
  let seconds = date.getSeconds() < 10 ? '' + date.getSeconds() : '' + date.getSeconds()
  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
}

exports.getCurrentDateTimeStr = getCurrentDateTimeStr
