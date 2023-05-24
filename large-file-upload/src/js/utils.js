import { ElMessageBox, ElMessage } from 'element-plus'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'

// import { getToken } from '@/utils/authToken' // 与后端的协商，websocket请求需要带上token参数
let websock = null
let messageCallback = null
let errorCallback = null
let wsUrl = ''
// 接收ws后端返回的数据
function websocketonmessage (e) {
  let memData = JSON.parse(e.data);
  messageCallback(memData)
}
 
/**
 * 发起websocket连接
 * @param {Object} agentData 需要向后台传递的参数数据
 */
function websocketSend (agentData) {
  // 加延迟是为了尽量让ws连接状态变为OPEN
  setTimeout(() => {
    // 添加状态判断，当为OPEN时，发送消息
    if (websock.readyState === websock.OPEN) {
      // websock.OPEN = 1
      // 发给后端的数据需要字符串化
      websock.send(JSON.stringify(agentData))
    }
    if (websock.readyState === websock.CLOSED) {
      // websock.CLOSED = 3
      console.log("websock.readyState=3");
    //   Message.error("");
    ElMessage({
        type: 'error',  // 'success' | 'warning' | 'info' | 'error'
        message: '连接失败',
    })
      errorCallback();
    }
  }, 500)
}
 
// 关闭ws连接
function websocketclose (e) {
  // e.code === 1000  表示正常关闭。 无论为何目的而创建, 该链接都已成功完成任务。
  // e.code !== 1000  表示非正常关闭。
  if (e && e.code !== 1000) {
    // Message.error("");
    ElMessage({
        type: 'error',
        message: '连接失败',
    })
    errorCallback();
  }
}
// 建立ws连接
function websocketOpen (e) {
  // console.log('ws连接成功')
}
 
// 初始化weosocket
function initWebSocket () {
  if (typeof (WebSocket) === 'undefined') {
    Message.error('您的浏览器不支持WebSocket，无法获取数据')
    return false
  }
 
  // const token = 'JWT=' + getToken()
  // ws请求完整地址
  const requstWsUrl = wsUrl // + '?' + token
  websock = new WebSocket(requstWsUrl)
 
  websock.onmessage = function(e) {
    websocketonmessage(e);
  };
  websock.onopen = function() {
    websocketOpen();
  };
  websock.onerror = function() {
    // Message.error("");
    ElMessage({
        type: 'error',
        message: '连接失败',
    })
    errorCallback();
  };
  websock.onclose = function(e) {
    websocketclose(e);
  };
}
 
/**
 * 发起websocket请求函数
 * @param {string} url ws连接地址
 * @param {Object} agentData 传给后台的参数
 * @param {function} successCallback 接收到ws数据，对数据进行处理的回调函数
 * @param {function} errCallback ws连接错误的回调函数
 */
export function sendWebsocket (url, agentData, successCallback, errCallback) {
  wsUrl = url
  initWebSocket()
  messageCallback = successCallback
  errorCallback = errCallback
  websocketSend(agentData)
}
 
/**
 * 关闭websocket函数
 */
export function closeWebsocket () {
  if (websock) {
    websock.close() // 关闭websocket
    websock.onclose() // 关闭websocket
  }
}

// 显示当前时间
export const getTime = (data) => {
    // let timer = data.timer || null
    // let currentTime = data.currentTime || ''
    data.timer = setInterval(() => {
        let Hours =
        new Date().getHours() < 10
            ? "0" + new Date().getHours()
            : new Date().getHours();
        let Minutes =
        new Date().getMinutes() < 10
            ? "0" + new Date().getMinutes()
            : new Date().getMinutes();
        let Seconds =
        new Date().getSeconds() < 10
            ? "0" + new Date().getSeconds()
            : new Date().getSeconds();
        data.currentTime = Hours + ":" + Minutes + ":" + Seconds;
    }, 1000);
}