/**
* 描述：告警信息合并逻辑需要的通用判断规则。与业务、设备相关。
* 1. 两条告警信息是否相等
* 2. 判断两条告警信息是否具有相同的时间
* 3. 仅判断告警信息是否具有更新（更接近现在）的告警时间（不判断告警内容是否一致）
* @author liuyang
* @since  2018/7/24 从告警信息合并逻辑主程序中分离出来
*/

/**
 * 判断两条告警信息是否相等
 * 规则：根据告警等级、告警来进行判断
 * 注：字段比较时忽略大小写以及首尾空格
 * @param {Object} warnItem1 告警信息1 格式参见 extractWarnsInfo约定的数据格式
 * @param {Object} warnItem2 告警信息2 格式参见 extractWarnsInfo约定的数据格式
 * @return {Boolean} 两条告警信息一致返回true，否则返回false。 任意参数及判断所需相关字段为空或未定义则返回false.
 * @author liuyang
 * @since 2018/6/23
 */
function isWarnsInfoHasSameContent (warnItem1, warnItem2) {
  var flag = true

  // 参数判断 只要含空值或未定义则认为不同（纯容错，与业务逻辑无关）
  if (warnItem1 == null) return false
  if (warnItem2 == null) return false
  if (warnItem1.Level == null) return false
  if (warnItem2.Level == null) return false
  if (warnItem1.Id == null) return false
  if (warnItem2.Id == null) return false
  /*
  if (warnItem1.Description == null) return false
  if (warnItem2.Description == null) return false
  */

  // 告警等级
  if (warnItem1.Level.toUpperCase().trim() !== warnItem2.Level.toUpperCase().trim()) {
    flag = false
  }
  // 告警码
  if (warnItem1.Id.toUpperCase().trim() !== warnItem2.Id.toUpperCase().trim()) {
    flag = false
  }

  /*
  if (isDebug) console.log('isWarnsInfoEquals isWarnsInfoEquals == ')
  if (isDebug) console.log('isWarnsInfoEquals flag = ' + flag)
  if (isDebug) console.log('isWarnsInfoEquals warnItem1 = ' + JSON.stringify(warnItem1))
  if (isDebug) console.log('isWarnsInfoEquals warnItem2 = ' + JSON.stringify(warnItem2))
  */

  // 告警内容
  /*
  if (warnItem1.Description.toUpperCase().trim()
     !== warnItem2.Description.toUpperCase().trim()) {
    flag = false
  }
  */

  return flag
}

/**
 * 仅判断告警信息是否具有相同的时间（不判断告警内容是否一致）
 * @param {Object} warnItem1 告警信息1 格式参见 extractWarnsInfo约定的数据格式
 * @param {Object} warnItem2 告警信息2 格式参见 extractWarnsInfo约定的数据格式
 * @return {Boolean} 如果具有相同的时间则返回true，否则返回false。任意参数及判断所需相关字段为空或未定义则返回false。
 *                   两个参数任意为空则返回false
 * @author liuyang
 * @since 2018/6/26
 */
function isWarnsInfoHasSameTime (warnItem1, warnItem2) {
  if (warnItem1 == null) return false
  if (warnItem2 == null) return false
  if (warnItem1.Time == null) return false
  if (warnItem2.Time == null) return false

  return warnItem1.Time.toUpperCase().trim() === warnItem2.Time.toUpperCase().trim()
}

/**
 * 仅判断告警信息是否具有更新（更接近现在）的告警时间（不判断告警内容是否一致）
 * 修改点识别：不同设备的告警信息中的时间戳格式可能不同。
 * 作用： 是否比较两个告警信息的时序关系
 * @param {Object} warnItem1 告警信息1 格式参见 extractWarnsInfo约定的数据格式
 * @param {Object} warnItem2 告警信息2 格式参见 extractWarnsInfo约定的数据格式
 * @return {Boolean} 如果warnItem1告警时间比warnItem2告警时间更接近当前时间，则返回true，否则返回false
 *                   两个参数任意为空则返回false
 * @author liuyang
 * @since 2018/6/26
 */
function isWarnsInfoHasLatterTime (warnItem1, warnItem2) {
  if (warnItem1 == null) return false
  if (warnItem2 == null) return false
  if (warnItem1.Time == null) return false
  if (warnItem2.Time == null) return false

  return new Date(warnItem1.Time) > new Date(warnItem2.Time)
}

// 判断规则 --> warns-merge-rules.js
// @deprecated exports.isWarnsInfoEquals = isWarnsInfoEquals
exports.isWarnsInfoHasSameContent = isWarnsInfoHasSameContent
exports.isWarnsInfoHasSameTime = isWarnsInfoHasSameTime
exports.isWarnsInfoHasLatterTime = isWarnsInfoHasLatterTime
