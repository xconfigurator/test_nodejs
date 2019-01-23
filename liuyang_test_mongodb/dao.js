/**
 * MongoDB操作简单封装
 * 注：
 * 1. 基于Promise
 * 2. 基于mongodb node.js driver 2.2
 * 注：告警逻辑本身就很复杂，掺杂数据库操作之后更加复杂，这样封装一下方便与业务代码清晰分离。
 * @author liuyang
 * @since 2018/10/29
 */
let log4js = require('log4js')
let log = log4js.getLogger('dao.js')
log.level = 'debug'

let MongoClient = require('mongodb').MongoClient

// const MONGO_URL = 'mongodb://192.168.109.20:27017/genieacs'
const MONGO_URL = 'mongodb://localhost:27017/liuyang'
const COLLECTION_NAME = 'test'

class DAO {
  constructor (url, collectionName) {
    this.url = url
    this.collectionName = collectionName
  }

  // 获得数据库连接
  getConnection () {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, (err, db) => {
        if (err) {
          log.error(err)
          if (db) db.close()
          return reject(err)
        }
        resolve(db)
      })
    })
  }

  /**
   * insert::insertOne
   * 插入一个文档
   * @param {Object} document 待插入文档
   * @returns promise
   */
  insertOne (document) {
    return new Promise((resolve, reject) => {
      this.getConnection().then(db => {
        // insertOne begin
        db.collection(this.collectionName).insertOne(document).then(res => {
          db.close()
          resolve(res)
        }).catch(err => {
          log.error(err)
          if (db) db.close()
          reject(err)
        })
        // insertOne end
      }).catch(err => {
        log.error(err)
        reject(err)
      })
    })
  }

  /**
   * insert::insertMany
   * 插入一组文档
   * @param documents [document, document, ...]
   * @returns promise
   */
  insertMany (documents) {
    return new Promise((resolve, reject) => {
      this.getConnection().then(db => {
        // insertMany begin
        db.collection(this.collectionName).insertMany(documents).then(res => {
          db.close()
          resolve(res)
        }).catch(err => {
          log.error(err)
          if (db) db.close()
          reject(err)
        })
        // insertMany end
      }).catch(err => {
        log.error(err)
        reject(err)
      })
    })
  }

  /**
   * delete::deleteOne
   * 删除一个文档
   * @param {Object} filter 选择条件
   * @returns promise
   */
  deleteOne (filter) {
    return new Promise((resolve, reject) => {
      this.getConnection().then(db => {
        db.collection(this.collectionName).deleteOne(filter).then(res => {
          db.close()
          resolve(res)
        }).catch(err => {
          log.error(err)
          if (db) db.close()
          reject(err)
        })
      }).catch(err => {
        log.error(err)
        reject(err)
      })
    })
  }

  /**
   * delete::deleteMany
   * 删除一组文档
   * @param {Object} filter 过滤条件
   * @returns promise
   */
  deleteMany (filter) {
    return new Promise((resolve, reject) => {
      this.getConnection().then(db => {
        db.collection(this.collectionName).deleteMany(filter).then(res => {
          db.close()
          resolve(res)
        }).catch(err => {
          log.error(err)
          if (db) db.close()
          reject(err)
        })
      }).catch(err => {
        log.error(err)
        reject(err)
      })
    })
  }

  /**
   * update::updateOne
   * 更新一个文档
   * @param {Object} filter 过滤条件
   * @param {Object} update 修改语句
   * @return promise
   */
  updateOne (filter, update) {
    return new Promise((resolve, reject) => {
      this.getConnection().then(db => {
        db.collection(this.collectionName).updateOne(filter, update).then(res => {
          db.close()
          resolve(res)
        }).catch(err => {
          log.error(err)
          if (db) db.close()
          reject(err)
        })
      }).catch(err => {
        log.error(err)
        reject(err)
      })
    })
  }

  /**
   * update::updateMany
   * 更新多个文档
   * @param {Object} filter 过滤条件
   * @param {Object} update 修改语句
   */
  updateMany (filter, update) {
    return new Promise((resolve, reject) => {
      this.getConnection().then(db => {
        db.collection(this.collectionName).updateMany(filter, update).then(res => {
          db.close()
          resolve(res)
        }).catch(err => {
          log.error(err)
          if (db) db.close()
          reject(err)
        })
      }).catch(err => {
        log.error(err)
        reject(err)
      })
    })
  }

  /**
   * query 查询
   * @param {Object} querystr 检索语句
   * @return {array} resultList 结果集列表（数组），如果结果集为空则返回空数组[]，即length === 0
   */
  query (querystr) {
    querystr = querystr || {}
    let resData = []
    return new Promise((resolve, reject) => {
      this.getConnection().then(db => {
        // cursor begin
        let cursor = db.collection(this.collectionName).find(querystr)
        cursor.each((err, data) => {
          if (err) {
            log.error(err)
            if (db) db.close()
            reject(err)
          }
          if (data != null) {
            resData.push(data)
          } else {
            db.close()
            resolve(resData)
          }
        }) // end of each
        // cursor end
      }).catch(err => {
        log.error(err)
        reject(err)
      }) // end of then
    }) // end of Promise
  }

  /**
   * query pagination 查询（分页）
   * 注：如果页面大小为0则为查询所有记录
   * @param {Object} querystr 检索语句
   * @param {number} pageSize 页面大小
   * @param {number} pageNumber 页号
   * @return {array} resultList 结果集列表（数组），如果结果集为空则返回空数组[]，即length === 0
   */
  queryPagination (querystr, pageSize, currentPage) {
    querystr = querystr || {}
    pageSize = pageSize || 0
    currentPage = currentPage || 0
    let offset = pageSize * (currentPage - 1) // vue pagination currentPage从1开始
    let resData = []
    return new Promise((resolve, reject) => {
      this.getConnection().then(db => {
        // cursor begin
        let cursor = db.collection(this.collectionName).find(querystr).skip(offset).limit(pageSize)
        cursor.each((err, data) => {
          if (err) {
            log.error(err)
            if (db) db.close()
            reject(err)
          }
          if (data != null) {
            resData.push(data)
          } else {
            db.close()
            resolve(resData)
          }
        })// end of each
        // cursor end
      }).catch(err => {
        log.error(err)
        reject(err)
      })
    })
  }
}

// /////////////////////////////////////////////////////
// /////////////////////////////////////////////////////
// /////////////////////////////////////////////////////
// /////////////////////////////////////////////////////
let dao = new DAO(MONGO_URL, COLLECTION_NAME)

// Test getConnection()
/*
dao.getConnection().then(db => {
  log.info(db)
  db.close()
})
*/

// Test insertOne ok
// {'name': 'liuyang'}
// {'name': 'xconfigurator'}
/*
dao.insertOne({'name': 'liuyang'}).then(res => {
  // log.info(res)
}).catch(err => {
  log.info(err)
})
*/

// Test insertMany ok
// [{'email': 'xconfigurator@163.com'}, {'email': 'xconfigurator@sina.com'}, {'email': 'xconfigurator@hotmail.com'}]
/*
dao.insertMany([{'email': 'xconfigurator@163.com'}, {'email': 'xconfigurator@sina.com'}, {'email': 'xconfigurator@hotmail.com'}]).then(res => {
  // log.info(res)
}).catch(err => {
  log.info(err)
})
*/

// Test deleteOne
// dao.deleteOne({'email': 'xconfigurator@163.com'}).then(res => {}).catch(err => { log.info(err) })

// Test deleteMany
// 虽然调用错误但指定了catch，代码仍然可以继续。
// 注意deleteMany的语义，deleteMany并不支持参数是数组，应该与insertMany区别开来。
// dao.deleteMany([{'email': 'xconfigurator@163.com'}, {'email': 'xconfigurator@sina.com'}, {'email': 'xconfigurator@hotmail.com'}]).catch(err => log.error(err))
// dao.deleteMany([{'name': 'liuyang'}]).catch(err => { log.error(err) })
// 正确的语法
// dao.deleteMany({'name': 'liuyang'})
// dao.deleteMany({}) // delete all

// Test updateOne ok
// Test updateMany ok
// 构建队列，让实现promoise的方法顺序执行
// https://blog.csdn.net/u011500781/article/details/73883903
// 实测这个异步执行顺序化的方法貌似不太稳定啊！ // TODO 需要看一下Promise的讲解课程。
/*
function sequenceMethods (arr) {
  let sequence = Promise.resolve()
  arr.forEach(function (item) {
    sequence = sequence.then(item)
  })
  return sequence
}
sequenceMethods([
  dao.deleteMany({}),
  dao.insertMany([{'name': 'liuyang'}, {'name': 'liuyang'}, {'name': 'liuyang'}]),
  dao.updateOne({'name': 'liuyang'}, {$set: {'name': 'crazyliuyang'}}),
  dao.updateMany({'name': 'liuyang'}, {$set: {'name': 'xconfigurator'}})
]).then(res => {
  dao.query({}).then(resultList => {
    log.info(resultList)
  })
})
*/

// Test query ok
// dao.query({'_id': '2018080616513274672_data.json'}).then(resultSet => {
/*
dao.query({}).then(resultList => {
  // log.info(resultList)
  log.info(resultList.length)
}).catch(err => {
  log.error(err)
})
*/

// Test queryPagination
dao.queryPagination({}, 0, 0).then(resultList => {
  log.info(resultList.length)
  log.info(resultList)
}).catch(err => {
  log.error(err)
})
