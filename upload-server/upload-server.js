const express = require('express'), 
    multer = require('multer');
// const fs = require("fs");
    path = require('path');
    PORT = 8888,
    HOST = 'http://127.0.0.1',
    HOSTNAME = `${HOST}:${PORT}`

// console.log(__dirname); // 返回当前模块的目录名
// console.log(__filename); // 返回当前模块的文件名
// console.log(path.dirname(__filename)); // __dirname 等同于 path.dirname(__filename)
// console.log(process.cwd()); // 当前Node.js进程执行时的文件夹地址——工作目录，保证了文件在不同的目录下执行时，路径始终不变

const app = express();
const upload = multer({ dest: process.cwd() + '\\public\\upload\\temp' });

// app.post('/upload_single', upload.single('file'), (req, res) => {
//   // console.log(req.file, req.body)
//   // req.file 是 `file` 文件的信息
//   // req.body 将具有文本域数据，如果有的话

//   // 设置响应头  设置允许跨域
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   // 设置响应头  * 表示所有类型的头信息都可以接受
//   // res.setHeader('Access-Control-Allow-Headers', '*');

//   //检查是否有文件
//   if (!req.file) {//如果req是空 返回400
//     res.send({
//         code: 400,
//         msg: '上传文件不能为空',
//     });
//     return;
//   }

//   let file = req.file;
//   let ret_files = []; //定义一个空数组
//   //获取名字后缀
//   let file_ext = file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
//   //将文件名改为时间戳
//   let file_name = new Date().getTime() + '.' + file_ext
//   /**
//    * 移动文件并且修改文件名字 fs.renameSync( oldPath, newPath )
//    * 将给定旧路径下的文件同步重命名为给定新路径
//    */
//   fs.renameSync(
//       process.cwd() + "/public/upload/temp/" + file.filename,//file.filename：文件最初名字、process.cwd()：工作目录
//       process.cwd() + "/public/upload/" + file_name, //file_name：时间戳新起的名字
//   );
//   //将改完的文件写进空数组
//   // ret_files.push(__dirname + "/public/upload/" + file_name);
//   ret_files.push(process.cwd() + "/public/upload/" + file_name)

//   res.send({
//       code: 200,
//       msg: 'OK',
//       data: ret_files //返回data给前端预览
//   })

//   // res.send('文件上传成功！');
//   console.log('文件上传成功！')
// });

//下载接口
// app.get('/download',async(req,res)=>{
//   let file_name = req.query.file_name;
//   let file_path = process.cwd()+'/public/upload/'+file_name;
//   res.download(file_path);
// })

// 注册multer中间件，设置所有接口都允许上传功能
app.use(upload.any())

/**
 * 若使用 app.xxx 路由形式，req.file 是 `file` 文件的信息
 * 若使用 router.xxx 路由形式，req.files 是 `file` 文件的信息（注意多了一个 s ）
 */
//引入路由--接入其他接口
app.use('/route', require("./router/fileRouter"))//通过路由的方式将上传和下载接口引入

// app.listen(port, () => console.log('服务器已启动...'));
app.listen(PORT, () => {
    //监听成功打印以下语句
    // console.log('服务器已启动...');
    console.log('【文件上传】服务器已启动...' + '\n' + `Example app listening on port ${PORT}`);
})

// -----------------------------------------
// const express = require('express');
// const router = express.Router();
// // 上传图片接口
// const fs = require('fs');
// const multer = require('multer')

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + file.originalname)
//     }
// })

// const createFolder = folder => {
//     try {
//         fs.accessSync(folder)
//     } catch (err) {
//         fs.mkdirSync(folder)
//     }
// }

// const uploadFolder = './uploads/'
// createFolder(uploadFolder)
// const upload = multer({
//     storage
// })

// router.post('/upload', upload.single('file'), (req, res) => {
//     const file = req.file
//     console.log('文件类型: %s', file.mimeType)
//     console.log('原始文件名: $s', file.originalname)
//     console.log('文件大小: %s', file.size)
//     console.log('文件保存路径: %s', file.path)
//     res.json({
//         res_code: 0,
//         name: file.originalname,
//         url: file.url
//     })
// })


// module.exports = router