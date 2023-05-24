import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      // dev 独有配置
      plugins: [vue()],
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url))
        }
      },
      lintOnSave:false,  // 关闭语法检查
      server:{
        port: 5757, // 服务器端口号
        open:true,  // 编译后自动打开浏览器
        // host: '0.0.0.0',  // 服务器主机名，如果允许外部访问，可设置为"0.0.0.0"
        // proxy: {
        //   // 字符串简写写法
        //   '/foo': 'http://localhost:4567',
        //   // 选项写法
        //   '/api': {
        //     target: 'http://xxx.xxx.xx',
        //     target: 'http://jsonplaceholder.typicode.com',
        //     changeOrigin: true,
        //     rewrite: (path) => path.replace(/^\/api/, '')
        //   },
        //   // 正则表达式写法
        //   '^/fallback/.*': {
        //     target: 'http://jsonplaceholder.typicode.com',
        //     changeOrigin: true,
        //     rewrite: (path) => path.replace(/^\/fallback/, '')
        //   },
        //   // 使用 proxy 实例
        //   '/api': {
        //     target: 'http://jsonplaceholder.typicode.com',
        //     changeOrigin: true,
        //     configure: (proxy, options) => {
        //       // proxy 是 'http-proxy' 的实例
        //     }
        //   },
        //   // 代理 WebSocket 或 socket
        //   '/socket.io': {
        //     target: 'ws://localhost:3000',
        //     ws: true
        //   }
        // }
      },
    }
  } else {
    // command === 'build'
    return {
      // build 独有配置
      plugins: [vue()],
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url))
        }
      },
      lintOnSave:false,  // 关闭语法检查
      server:{
        port: 5757, // 服务器端口号
        open:true,  // 编译后自动打开浏览器
        // host: '0.0.0.0',  // 服务器主机名，如果允许外部访问，可设置为"0.0.0.0"
        // proxy: {
        //   // 字符串简写写法
        //   '/foo': 'http://localhost:4567',
        //   // 选项写法
        //   '/api': {
        //     target: 'http://xxx.xxx.xx',
        //     target: 'http://jsonplaceholder.typicode.com',
        //     changeOrigin: true,
        //     rewrite: (path) => path.replace(/^\/api/, '')
        //   },
        //   // 正则表达式写法
        //   '^/fallback/.*': {
        //     target: 'http://jsonplaceholder.typicode.com',
        //     changeOrigin: true,
        //     rewrite: (path) => path.replace(/^\/fallback/, '')
        //   },
        //   // 使用 proxy 实例
        //   '/api': {
        //     target: 'http://jsonplaceholder.typicode.com',
        //     changeOrigin: true,
        //     configure: (proxy, options) => {
        //       // proxy 是 'http-proxy' 的实例
        //     }
        //   },
        //   // 代理 WebSocket 或 socket
        //   '/socket.io': {
        //     target: 'ws://localhost:3000',
        //     ws: true
        //   }
        // }
      },
    }
  }
})
