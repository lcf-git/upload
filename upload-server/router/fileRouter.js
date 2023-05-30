const express = require('express'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    // multiparty = require('multiparty'),
    SparkMD5 = require('spark-md5')
    router = express.Router();
const uploadDir = process.cwd() + '\\public\\upload';
console.log('文件存储路径:', uploadDir)

// 基于multiparty插件实现文件上传处理 & form-data解析
// const multiparty_upload = function multiparty_upload(req, auto) {
//     typeof auto !== "boolean" ? auto = false : null;  // auto为true 自动处理
//     let config = {
//         maxFieldsSize: 200 * 1024 * 1024,  // 图片大小
//     };
//     if (auto) config.uploadDir = uploadDir;  // 若选择自动上传（auto为true），则将文件传到upload目录下
//     return new Promise(async (resolve, reject) => {
//         // await delay();
//         new multiparty.Form(config)
//             .parse(req, (err, fields, files) => {
//                 if (err) {  // 若 err 存在，说明解析失败
//                     reject(err);
//                     return;
//                 }
//                 resolve({
//                     fields,
//                     files
//                 })
//             });
//     });
// };

// 清除temp文件夹缓存
const clearTemp = function clearTemp() {
    let cachePath = `${uploadDir}\\temp`,
        fileList = fs.readdirSync(cachePath);
    // while (fileList.length > 0) {
    //     fs.unlinkSync(`${cachePath}\\${fileList[0]}`)
    // }
    // let isExists = await exists(cachePath);
    if (fileList.length > 0) fileList.forEach(item => {fs.unlinkSync(`${cachePath}\\${item}`)})
}

/*-API-*/
// 延迟函数（测试使用：await delay();）
const delay = function delay(interval) {
    typeof interval !== "number" ? interval = 1000 : null;
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, interval);
    })
}

// 检测文件是否存在
const exists = function exists(path) {
    return new Promise(resolve => {
        fs.access(path, fs.constants.F_OK, err => {
            if (err) {
                resolve(false);
                return;
            }
            resolve(true);
            return;
        });
    });
}

// 创建文件并写入到指定的目录 & 返回客户端结果
const writeFile = function writeFile(res, path, file, filename, stream) {
    return new Promise((resolve, reject) => {
        if (stream) {
            // let [, HASH] = /^([^_]+)_(\d)/.exec(filename);
            // fs.renameSync(
            //     process.cwd() + "\\public\\upload\\temp\\" + file.filename,//file.filename：文件最初名字
            //     `${uploadDir}\\${HASH}\\` + filename, //file_name：新起的名字
            // );
            try {
                let oldPath = file.path,   // || (process.cwd() + "\\public\\upload\\temp\\" + file.filename),
                    newPath = path   // || (`${uploadDir}\\${HASH}\\` + filename)
                fs.renameSync(oldPath, newPath); // 原文件目录 -> 新目录
                resolve();
                res.send({
                    code: 200,
                    codeText: 'upload success',
                    originalFilename: filename,
                    // servicePath: path.replace(__dirname, HOSTNAME)
                    servicePath: path
                });
            } catch (err) {
                reject(err);
                res.send({
                    code: 400,
                    codeText: err
                });
            }
            return;

            // try {
            //     let readStream = fs.createReadStream(file.path),  // 读取一个可读的文件流，file.path multer文件的存放地址
            //     writeStream = fs.createWriteStream(path);  // 写入流（将可读文件或文件切片流通过.pipe通道写入为文件切片）
            //     readStream.pipe(writeStream);  // 读取readStream文件内容，并将内容写入到writeStream文件中(原内容会被替换)
            //     readStream.on('end', () => {
            //         resolve();
            //         fs.unlinkSync(file.path);  // 写入流（合并文件）后，从文件系统中同步删除文件或符号链接（或参与写入合并过的切片文件流）
            //         res.send({
            //             code: 200,
            //             codeText: 'upload success',
            //             originalFilename: filename,
            //             // servicePath: path.replace(__dirname, HOSTNAME),
            //             servicePath: path
            //         });
            //     });
            // } catch (err) {
            //     reject(err);
            //     res.send({
            //         code: 400,
            //         codeText: err
            //     });
            // }
            // return;
        }
        fs.writeFile(path, file, err => {
            if (err) {
                reject(err);
                res.send({
                    code: 400,
                    codeText: err
                });
                return;
            }
            resolve();
            res.send({
                code: 200,
                codeText: 'upload success',
                originalFilename: filename,
                // servicePath: path.replace(__dirname, HOSTNAME)
                servicePath: path
            });
        });
    });
};

// 获取唯一值（随机数）
const createRandom = () => {
    let ran = Math.random() * new Date();  // 随机数 * 时间戳
    return ran.toString(16).replace('.', '')  // 转为16进制，去掉.
}

// 响应头
router.use((req, res, next) => {
    // 设置响应头  设置允许跨域
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // 设置响应头  * 表示所有类型的头信息都可以接受
    // res.setHeader('Access-Control-Allow-Headers', '*');
    // 为了防止中文乱码问题，需要设置响应头，
    // res.setHeader('Content-Type', 'text/html; charset=utf-8')
    req.method === 'OPTIONS' ? res.send('CURRENT SERVICES SUPPORT CROSS DOMAIN REQUESTS!') : next();  // 客户端请求的method类型
})

// 限制请求内容
router.use(bodyParser.urlencoded({
    extended: false,  // 为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
    limit: '1024mb'  // 限制大小
}));

// 单一文件上传「FORM-DATA」 -- 时间戳区分（不去重）
router.post('/upload_single', async (req, res) => {
//   console.log(req.files, req.body)
  // req.files 是 `file` 文件的信息（router形式）
  // req.body 将具有文本域数据，如果有的话
  /**
   * req.files具有以下参数：
   * fieldname: 表单name名
   * originalname: 上传的文件名
   * encoding： 编码方式
   * mimetype: 文件类型
   * destination: 保存路径
   * filename： 保存后的文件名 不含后缀
   * path： 保存磁盘路径+保存后的文件名 不含后缀
   * size：尺寸
   */

  // 设置响应头  设置允许跨域
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // 设置响应头  * 表示所有类型的头信息都可以接受
  // res.setHeader('Access-Control-Allow-Headers', '*');

  //检查是否有文件
  if (!req.files) {//如果req是空 返回400
    res.send({
        code: 400,
        codeText: '上传文件不能为空',
    });
    return;
  }

  //保存文件
  let files = req.files; //将获取的文件放到files
  let ret_files = []; //定义一个空数组
  let file_name; // 获取文件名
  let file_ext;  // 获取名字后缀
  for (let file of files) {//将files循环成单个
      file_ext = file.originalname.substring(file.originalname.lastIndexOf('.') + 1);  // 获取名字后缀
      file_name = req.body.filename.split('.')[0] + '[' + new Date().getTime() + ']' + '.' + file_ext;  // 将文件名改为 文件名[时间戳].xxx 格式
    //   file_name = req.body.filename.split('.')[0] + '[' + createRandom() + ']' + '.' + file_ext;  // 将文件名改为 文件名[随机数唯一值].xxx 格式
      // 移动文件并且修改文件名字
      fs.renameSync(
          process.cwd() + "\\public\\upload\\temp\\" + file.filename,//file.filename：文件最初名字
          process.cwd() + "\\public\\upload\\" + file_name, //file_name：时间戳新起的名字
      );
      //将改完的文件写进空数组
      ret_files.push(process.cwd() + "\\public\\upload\\" + file_name);
  }

  await delay();  // 延迟函数

  res.send({
      code: 200,
      codeText: '文件上传成功！',
      servicePath: ret_files //返回data给前端预览
  })

  // res.send('文件上传成功！');
  console.log(req.body.filename, '文件上传成功！' + '\n' + '名称修改为：', file_name ? file_name : req.body.filename, '\n--------------------');
});

// 单文件上传处理「BASE64」 -- 去重
router.post('/upload_single_base64', async (req, res) => {
    // console.log(req.body)
    let file = req.body.file,
        filename = req.body.filename,  // 获取文件名
        spark = new SparkMD5.ArrayBuffer(),  // 根据文件内容，生成一个hash的名字（文件内容相同会覆盖相同文件）
        suffix = /\.([0-9a-zA-Z]+)$/.exec(filename)[1],  // 获取文件后缀名
        isExists = false,  // 判断文件是否存在
        path  // 上传路径
    file = decodeURIComponent(file);  // 对encodeURIComponent()函数编码的文件进行解码
    file = file.replace(/^data:image\/\w+;base64,/, "");
    // 返回一个被 array 的值初始化的新的 Buffer 实例（传入的 array 的元素只能是数字，不然就会自动被 0 覆盖）
    file = Buffer.from(file, 'base64');  // base64转Buffer格式
    spark.append(file);  // 将处理好的 file 文件添加进spark
    path = `${uploadDir}\\${spark.end()}.${suffix}`;  // （通过spark.end()拿到生成的hash名字）
    await delay();  // 延时函数
    // 检测是否存在
    isExists = await exists(path);  // 通过保存路径判断文件是否存在（已上传过）
    if (isExists) {
        res.send({
            code: 200,
            codeText: 'file is exists',
            originalFilename: filename,
            // servicePath: path.replace(__dirname, HOSTNAME)
            servicePath: path
        });
        console.log(req.body.filename, '文件已存在！' + '\n' + '名称为：', `${spark.end()}.${suffix}`, '\n--------------------');
        return;
    };
    writeFile(res, path, file, filename, false);  // 写入目录
    console.log(req.body.filename, '文件上传成功！' + '\n' + '名称修改为：', `${spark.end()}.${suffix}`, '\n--------------------');
});

// 单一文件上传「缩略图处理」 -- 去重
router.post('/upload_single_name', async (req, res) => {
    // console.log(req.files, req.body)
    // req.files 是 `file` 文件的信息（router形式）
    // req.body 将具有文本域数据，如果有的话
    /**
     * req.files具有以下参数：
     * fieldname: 表单name名
     * originalname: 上传的文件名
     * encoding： 编码方式
     * mimetype: 文件类型
     * destination: 保存路径
     * filename： 保存后的文件名 不含后缀
     * path： 保存磁盘路径+保存后的文件名 不含后缀
     * size：尺寸
     */

    //检查是否有文件
    if (!req.files) {//如果req是空 返回400
        res.send({
            code: 400,
            codeText: '上传文件不能为空',
        });
        return;
    }
    await delay();  // 延迟函数

    //保存文件
    let files = req.files; //将获取的文件放到files
    let path = process.cwd() + "\\public\\upload\\" + req.body.filename;  // 路径
    let filename = req.body.filename;  // 文件名
    let isExists;  // 判断文件是否为空
    for (let file of files) {//将files循环成单个
        isExists = await exists(path);  // 通过保存路径判断文件是否存在（已上传过）
        if (isExists) {
            res.send({
                code: 200,
                codeText: 'file is exists',
                originalFilename: filename,
                // servicePath: path.replace(__dirname, HOSTNAME)
                servicePath: path
            });
            console.log(filename, '文件已存在！' + '\n' + '名称为：', filename, '\n--------------------');
            // return;
        } else {
            res.send({
                code: 200,
                codeText: '文件上传成功！',
                servicePath: path //返回data给前端预览
            })
        
            // res.send('文件上传成功！');
            console.log(req.body.filename, '文件上传成功！' + '\n' + '名称为：', filename, '\n--------------------');
        };
        // 移动文件并且修改文件名字
        fs.renameSync(
            process.cwd() + "\\public\\upload\\temp\\" + file.filename,//file.filename：文件最初名字
            process.cwd() + "\\public\\upload\\" + filename, //file_name：新起的名字
        );
    }
});

// 大文件切片上传 & 合并切片
const merge = function merge(HASH, count) {
    return new Promise(async (resolve, reject) => {
        let path = `${uploadDir}\\${HASH}`,
            fileList = [],
            suffix,
            isExists;
        isExists = await exists(path);
        // console.log('merge', path, isExists)
        if(!isExists) {
            reject('HASH path is not found!');
            return;
        }
        fileList = fs.readdirSync(path);
        // console.log('merge', HASH, isExists)
        if (fileList.length < count) {
            reject('the clice has not been upload!');
            return;
        }
        fileList.sort((a, b) => {
            let reg = /_(\d+)/;
            return reg.exec(a)[1] - reg.exec(b)[1];
        }).forEach(item => {
            !suffix ? suffix = /\.([0-9a-zA-Z]+)$/.exec(item)[1] : null;
            fs.appendFileSync(`${uploadDir}\\${HASH}.${suffix}`, fs.readFileSync(`${path}\\${item}`));
            fs.unlinkSync(`${path}\\${item}`);
        })
        fs.rmdirSync(path);
        // clearTemp();  // 若断点续传时temp文件夹缓存过多，则清除
        console.log('文件上传完毕~~');
        resolve({
            path: `${uploadDir}\\${HASH}.${suffix}`,
            filename: `${HASH}.${suffix}`
        });
    })
};
router.post('/upload_chunk', async (req, res) => {
    // console.log(req.files[0], req.body.filename)
    try {
        // let {
        //     fields,
        //     files
        // } = await multiparty_upload(req);
        // let fields,
        //     files

        // let file = (file.file && files.file[0]) || {},
        //     filename = (fields.filename && fields.filename[0]) || "",
        let file = req.files[0] || {},
            filename = req.body.filename || "",
            path = '',
            isExists = false;
        // 创建存放切片的临时目录
        let [, HASH] = /^([^_]+)_(\d)/.exec(filename);
        path = `${uploadDir}\\${HASH}`;
        !fs.existsSync(path) ? fs.mkdirSync(path) : null;
        // 把切片存储到临时目录中
        path = `${uploadDir}\\${HASH}\\${filename}`;
        // console.log(path)
        isExists = await exists(path);
        if (isExists) {
            res.send({
                code: 200,
                codeText: 'file is exists',
                originalFilename: filename,
                // servicePath: path.replace(__dirname, HOSTNAME),
                servicePath: path
            });
            return;
        }
        // console.log('写入目录----------')
        writeFile(res, path, file, filename, true);  // 写入目录
        // console.log(process.cwd() + "\\public\\upload\\temp\\" + file.filename)
        // console.log(`${uploadDir}\\${HASH}\\` + filename)
        // 移动文件并且修改文件名字
        // fs.renameSync(
        //     process.cwd() + "\\public\\upload\\temp\\" + file.filename,//file.filename：文件最初名字
        //     `${uploadDir}\\${HASH}\\` + filename, //file_name：新起的名字
        // );
    } catch (err) {
        res.send({
            code: 400,
            codeText: err
        })
    }
});
router.post('/upload_merge', async (req, res) => {
    let {
        HASH,
        count
    } = req.body;
    // console.log(req.body)
    // console.log(HASH)
    try {
        let {
            filename,
            path
        } = await merge(HASH, count);
        // console.log('upload_merge', filename, path)
        res.send({
            code: 200,
            codeText: 'merge success',
            originalFilename: filename,
            // servicePath: path.replace(__dirname, HOSTNAME),
            servicePath: path
        });
    } catch (err) {
        res.send({
            code: 400,
            codeText: err
        });
    }
});
router.get('/upload_already', async (req, res) => {
    let {
        HASH
    } = req.query;
    let path = `${uploadDir}\\${HASH}`,
        fileList = [];
        // tempPath = `${uploadDir}\\temp`,
        // isExists,
        // oFileList,
        // newPath;
    // console.log('upload_already', path)
    try {
        fileList = fs.readdirSync(path);
        fileList = fileList.sort((a,b) => {
            let reg = /_(\d+)/;
            return reg.exec(a)[1] - reg.exec(b)[1];
        });
        // console.log('upload_already', fileList[fileList.length-1])
        // isExists = await exists(tempPath);
        // if(isExists) {
        //     oFileList = fs.readdirSync(tempPath);
        //     let index = /_(\d+)/.exec(fileList[fileList.length-1])[1],
        //         suffix = fileList[fileList.length-1].split('.')[1]
        //     let file = {}
        //     file.path = tempPath + '\\' + oFileList[0]
        //     newPath = path + `\\${HASH}_${+index+1}.${suffix}`
        //     console.log(newPath, file.path)
        //     writeFile(null, newPath, file, null, true);  // 写入目录
        // }
        res.send({
            code: 200,
            codeText: '',
            fileList: fileList
        });
    } catch (err) {
        res.send({
            code: 200,
            codeText: '',
            fileList: fileList
        });
    }
});

//下载接口
router.get('/download',async(req,res)=>{
    let file_name = req.query.file_name;
    let file_path = process.cwd()+'\\public\\upload\\'+file_name;
    res.download(file_path);
})


//3、把它加到模块上
module.exports = router;