import { createApp } from 'vue'
import '../src/assets/css/style.css'  // 布局文件
import '../src/assets/css/upload.css'  // 上传按钮、组件样式
import App from './App.vue'

const app = createApp(App)
app.mount('#app')