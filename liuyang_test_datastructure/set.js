/**
 * 集合
 * 用JavaScript数组实现一个简单集合
 * @author liuyang
 * @since 2018/10/26
 */
let data = []

function add (id) {
  data.push(id)
}

function remove (id) {
  if (isEmpty()) return
  let idx = data.indexOf(id)
  if (idx === -1) return
  data.splice(idx, 1)
}

function contains (id) {
  return data.includes(id)
}

function isEmpty () {
  return data.length === 0 ? true : false
}

function size () {
  return data.length
}

function toString () {
  return JSON.stringify(data)
}

exports.add = add
exports.remove = remove
exports.contains = contains
exports.isEmpty = isEmpty
exports.size = size
exports.toString = toString
