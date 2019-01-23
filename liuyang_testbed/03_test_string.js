let str = 'CZT,-01,FFFFFF-0101-FFFFFF303233311C4D0230B8D812679111'
let result = str.substr(str.lastIndexOf(',') + 1)
console.log("截取最后： " + result)
console.log("截取最前面1000个字符： " + str.substring(0, 1000))
