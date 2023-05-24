import { h } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'
import '../css/message.css'
// 目的： 改造封装一个 uploadMessage 函数，可以传数组和字符串内容进去
export function uploadMessage(str, title) {
    let newArr
    if (Array.isArray(str)) { // 如果str传进来是数组，就遍历
        newArr = []
        for (let i = 0; i < str.length; i++) {
            newArr.push(h('h2', null, str[i]))
        }
    } else {
        newArr = h('span', null, str)
        // <a href=""></a>
        // #6795b5
    }
    ElMessageBox({
        title: title || '消息提示',
        message: h('h4', { style: 'color: #50a14f;word-wrap: break-word' }, newArr),
        showCancelButton: false,  // 不显示取消按钮
        confirmButtonText: '好的',
        confirmButtonClass: 'messageButtonOk',
    })
}

export function uploadMessage2(str, title, callback) {
    var newArr
    if (Array.isArray(str)) { // 如果str传进来是数组，就遍历
        newArr = []
        for (let i = 0; i < str.length; i++) {
            newArr.push(h('h2', null, str[i]))
        }
    } else {
        newArr = h('span', null, str)
    }
     ElMessageBox({
        title: title || '消息提示',
        message: h('h1', null, newArr),
        showCancelButton: true,
        confirmButtonText: '确定',
        confirmButtonClass: 'messageButtonOk',
        cancelButtonText: '取消',
        cancelButtonClass: 'messageButtonNo',
        // { style: 'color: #FF6699' }
    })
    .then(() => {
        callback && callback();
        ElMessage({
          type: 'success',
          message: '继续上传',
        })
      })
    .catch(() => {
        ElMessage({
            type: 'info',
            message: '已取消',
        })
    })
}
