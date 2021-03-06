/*
本脚本仅适用于京东来客有礼每日获取京豆，测试版!!!
获取Cookie方法:
1.将下方[rewrite_local]和[MITM]地址复制的相应的区域
下，
2.微信搜索'来客有礼'小程序,登陆京东账号，点击'领京豆->翻牌',即可获取Cookie. 
3.当日签过到需次日获取Cookie.

仅测试Quantumult x，Surge 无效
by Macsuny

~~~~~~~~~~~~~~~~
Surge 4.0 :❌❌
[Script]
cron "0 9 * * *" script-path=https://raw.githubusercontent.com/Sunert/Scripts/master/Task/JDLK_sign.js
# 来客有礼 Cookie.
http-request https:\/\/draw\.jdfcloud\.com\/\/api\/turncard\/sign\? script-path=https://raw.githubusercontent.com/Sunert/Scripts/master/Task/JDLK_cookie.js
~~~~~~~~~~~~~~~~
QX 1.0.5+ :
[task_local]
0 9 * * * JDLK_sign.js

[rewrite_local]
https:\/\/draw\.jdfcloud\.com\/\/api\/turncard\/sign\? url script-request-header JDLK_cookie.js
~~~~~~~~~~~~~~~~
[MITM]
hostname = draw.jdfcloud.com
~~~~~~~~~~~~~~~~

*/
const cookieName = '京东来客有礼'
const signurlKey = 'sy_signurl_lkyl'
const signheaderKey = 'sy_signheader_lkyl'
const sy = init()
const signurlVal = sy.getdata(signurlKey)
const signheaderVal = sy.getdata(signheaderKey)

sign()

function sign() {
	  let signurl = {
		url: signurlVal,
		headers: JSON.parse(signheaderVal)
	}
    sy.post(signurl, (error, response, data) => {
      sy.log(`${cookieName}, data: ${data}`)
      let result = JSON.parse(data)
      const title = `${cookieName}`
      let detail = ``
      let subTitle = ``
   
     if (result.success == true) {
      subTitle = `签到结果: 成功🎉`
      detail = `${result.data.topLine},${result.data.rewardName},获得京豆: ${result.data.jdBeanQuantity}`
      } else if (result.errorMessage == `今天已经签到过了哦`) {
      subTitle = `签到结果: 重复`
      detail = `说明: ${result.errorMessage}!`
      } else  {
      subTitle = `签到结果: 失败`
      detail = `说明: ${result.errorMessage}`
      }
      sy.msg(title, subTitle, detail)
     })
  }


function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subTitle, body) => {
    if (isSurge()) $notification.post(title, subTitle, body)
    if (isQuanX()) $notify(title, subTitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
