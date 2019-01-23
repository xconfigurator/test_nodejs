console.log(new Date(1535675511230))
console.log(new Date(1535675511230).toLocaleDateString())

/*
toLocaleString() 根据本地时间格式，把 Date 对象转换为字符串。
toLocaleTimeString() 根据本地时间格式，把 Date 对象的时间部分转换为字符串。
toLocaleDateString() 根据本地时间格式，把 Date 对象的日期部分转换为字符串。
*/
console.log(new Date(1535675511230).toLocaleString())
console.log(new Date(1535675511230).toLocaleTimeString())
console.log(new Date(1535675511230).toLocaleDateString())

// 结论：用toLocaleString()
console.log(new Date(1535675511230).toLocaleString())

// 测试成功！ 201809071027
console.log('#测试日志输出日期' + new Date().toLocaleString())
let e = ['hello, error']
console.log('[error] ' + new Date().toLocaleString() + ' #mergeWarnInfo error = ' + JSON.stringify(e))

// 测试
console.log('###################################')
console.log('#2018-09-17T10:09:29.490Z')
console.log('#测试转化MongoDB日期时间 差8小时' + new Date('2018-09-17T10:09:29.490Z').toLocaleString())
