/**
* 描述：下面的一组函数定义在数据集合warnData上的一套操作（增、删、排序、更新时间）
* 存储结构： warnData: [warnItem, warnItem, warnItem ...]
* 注：
*   最开始是在告警合并逻辑中定义的。
*   但后来发现不但抽取合并逻辑需要这部分公用操作，为界面服务的warns-service.js也需要。
* @author liuyang
* @since  2018/7/24 从告警信息合并逻辑主程序中分离出来
*/
let warnsRules = require('./warns_merge_rules')

/**
 * 向告警数据集中加入新的告警条目
 * 注：仅向告警集合中增加具有不用于告警数据集中所有记录的告警条目。
 * @param {Array} warnData 告警数据集
 * @param {Object} newWarnItem 新的告警信息标目
 * @return {Array} warnData 增加了新告警条目的告警数据集，并按照指定排序策略排序
 * @author liuyang
 * @since 2018/6/27
 */
function warnDataInsert (warnData, newWarnItem) {
  if (newWarnItem == null) return warnData // 容错
  if (warnData == null && newWarnItem != null) warnData = [] // 容错
  for (let idx in warnData) {
    if (warnsRules.isWarnsInfoHasSameContent(warnData[idx], newWarnItem)) {
      return warnData // 告警数据集中已包含要添加的告警信息，则不做任何操作，直接返回原告警数据集
    }
  }
  // 新增的告警信息在告警数据集中不存在，则将告警信息加入告警数据集
  warnData.push(newWarnItem)
  return warnDataSort(warnData, warnItemComparator)
}

/**
 * 从告警数据集中更新指定告警条目的告警时间
 * 注：仅当warnItem中的对应
 * @param {Array} warnData 告警数据集
 * @param {Object} warnItem 待更新的告警条目
 * @return {Array} warnData 更新了相应告警条目后的告警数据集
 * @author liuyang
 * @since 2018/6/27
 */
function warnDataUpdateTime (warnData, warnItem) {
  if (warnData == null) return [] // 容错
  if (warnData.length === 0) return [] // 容错
  for (let idx in warnData) {
    if (warnsRules.isWarnsInfoHasSameContent(warnData[idx], warnItem)) {
      warnData[idx].Time = warnItem.Time // 若是同样一条告警信息，则按指定上报时间更新Time字段
      break // 相同告警信息只保留一次，故无需继续遍历
    }
  }
  // return warnDataSort(warnData, warnItemComparator)
  return warnData // 没有新增数据，无需重新排序。
}

/**
 * 从告警数据集中删除指定告警条目
 * @param {Array} warnData 告警数据集
 * @param {Object} warnItem 待删除告警条目
 * @return {Array} warnData 删除指定告警条目后的告警集合， 如果删除结束后告警集合为空，则返回空数组。
 * @author liuyang
 * @since 2018/6/27
 */
function warnDataDelete (warnData, warnItem) {
  if (warnData == null) return [] // 容错
  if (warnData.length === 0) return [] // 容错
  if (warnItem == null) return warnData // 容错
  for (let idx in warnData) {
    if (warnsRules.isWarnsInfoHasSameContent(warnData[idx], warnItem)) {
      warnData.splice(idx, 1) // 删除指定位置的一个元素
      break
    }
  }
  // return warnDataSort(warnData, warnItemComparator)
  return warnData // 仅删除数据，不影响数组内剩下数据的顺序，无需重新排序
}

/**
 * 告警数据排序
 * @param {Array} warnData 告警数据集
 * @param {Function} warnItemComparator 告警信息条目排序规则比较器
 * @return {Array} warnData 按照指定规则排好序的告警数据集
 * @author liuyang
 * @since 2018/6/27
 */
function warnDataSort (warnData, warnItemComparator) {
  if (warnData == null) return null // 容错
  if (warnData.length === 0) return [] // 容错
  return warnData.sort(warnItemComparator)
}

/**
 * 告警信息条目排序规则比较器
 * 告警信息排序规则在这里指定
 * @param {*} warnItem1 告警条目1
 * @param {*} warnItem2 告警条目2
 * @return -1 warnItem1会被排到warnItem2前
 *         0  warnItem1和warnItem2相对位置不变
 *         1  warnItem2会被排到warnItem1前
 *         返回值参考Array.prototype.sotr()函数的参考手册
 * @author liuyang
 * @since 2018/6/27
 */
function warnItemComparator (warnItem1, warnItem2) {
  // TODO 待实现
  return 0
}

// warnData操作函数
exports.warnDataInsert = warnDataInsert
exports.warnDataUpdateTime = warnDataUpdateTime
exports.warnDataDelete = warnDataDelete
exports.warnDataSort = warnDataSort // TODO
exports.warnItemComparator = warnItemComparator // TODO
