const { resolve } = require('path');

// 定义nodejs环境变量：决定使用browserslist的哪个环境
process.env.NODE_ENV = 'production';

module.exports = {
  // 入口
  entry: './upload-server.js',
  // 输出
  output: {
    filename: './server_build.js',
    path: resolve(__dirname, 'build')
  },
  target: 'node', // 处理node文件（这是最关键的）
  node: {
      __dirname: false
  },
  // 模式
  mode: 'production',  // 生产模式
  // mode: 'development'  // 开发模式
};
