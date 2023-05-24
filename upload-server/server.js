const express = require('express'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    multiparty = require('multiparty'),
    SparkMD5 = require('spark-md5')

/*-CREATE SERVER-*/
const app = express(),
    PORT = 8888,
    HOST = 'http://127.0.0.1',
    HOSTNAME = `${HOST}:${PORT}`
app.listen(PORT, () => {
    console.log(`THE WEB SERVICE IS CREATED SUCCESSFULLY AND IS LISTENING TO THE PORT: ${PORT}, YOU CAN VISIT: ${HOSTNAME}`)
});

/*-中间件-*/
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    req.method === 'OPTIONS' ? res.send('CURRENT SERVICES SUPPORT CROSS DOMAIN REQUESTS!') : next();  // 客户端请求的method类型
});
// 限制请求内容
app.use(bodyParser.urlencoded({
    extended: false,  // 为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
    limit: '1024mb'  // 限制大小
}));

/*-API-*/
// 延迟函数
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
                // xxx
                resolve(false);
            }
            resolve(true);
        })
    })
}

// 创建文件并写入到指定的目录 & 返回客户端结果
const writeFile = function writeFile(res, path, file, filename, stream) {
    return new Promise((resolve, reject) => {
        if (stream) {
            // xxx
        }
        fs.writeFile(path, file, err => {
            if (err) {
                reject(err);
                res.send({
                    // xxx
                    code: 1,
                    codeText: err
                });
                return;
            }
            resolve();
            res.send({
                code: 0,
                codeText: 'upload success',
                originalFilename: filename,
                servicePath: path.replace(__dirname, HOSTNAME)
            });
        });
    });
};

// 基于multiparty插件实现文件上传处理 & form-data解析
const uploadDir = `${__dirname}/upload`;
const multiparty_upload = function multiparty_upload(req, auto) {
    typeof auto !== "boolean" ? auto = false : null;  // auto为true 自动处理
    let config = {
        maxFieldsSize: 200 * 1024 * 1024,  // 图片大小
    };
    if (auto) config.uploadDir = uploadDir;  // 若选择自动上传（auto为true），则将文件传到upload目录下
    return new Promise(async (resolve, reject) => {
        // await delay();
        new multiparty.Form(config)
            .parse(req, (err, fields, files) => {
                if (err) {  // 若 err 存在，说明解析失败
                    reject(err);
                    return;
                }
                resolve({
                    fields,
                    files
                })
            });
    });
};

// 单文件上传处理「FORM-DATA」
app.post('/upload_single', async (req, res) => {
    try {
        let {
            fields,
            files
        } = await multiparty_upload(req, true);
        let file = (files.file && files.file[0]) || {};
        res.send({
            code: 0,
            codeText: 'upload success',
            originalFilename: file.originalFilename,
            servicePath: file.path.replace(__dirname, HOSTNAME)
        });
    } catch (err) {
        res.send({
            code: 1,
            codeText: err
        });
    }
});

app.post('/upload_single_name', async (req, res) => {
    try {
        let {
            fields,
            files
        } = await multiparty_upload(req);
        let file = (files.file && files.file[0]) || {},
            filename = (fields.filename && fields.filename[0]) || "",
            path = `${uploadDir}/${filename}`,
            isExists = false;
        // 检测是否存在
        isExists = await exists(path);  // 通过保存路径判断文件
        if (isExists) {  // 若存在相同文件，则不覆盖，且给客户端返回一个提示信息。
            res.send({
                code: 0,
                codeText: 'file is exists',
                originalFilename: filename,
                servicePath: path.replace(__dirname, HOSTNAME)
            });
            return;
        }
        writeFile(res, path, file, filename, false);  // 写入目录
    } catch(err) {
        res.send({
            code: 1,
            codeText: err
        });
    }
});

// 单文件上传处理「BASE64」
app.post('/upload_single_base64', async (req, res) => {
    let file = req.body.file,
        filename = req.body.filename,
        spark = new SparkMD5.ArrayBuffer(),  // 根据文件内容，生成一个hash的名字（文件内容相同会覆盖相同文件）
        suffix = /\.([0-9a-zA-Z]+)$/.exec(filename)[1],  // 获取文件后缀名
        isExists = false,  // 判断文件是否存在
        path  // 上传路径
    file = decodeURIComponent(file);
    file = file.replace(/^data:image\/\w+;base64,/, "");
    // 返回一个被 array 的值初始化的新的 Buffer 实例（传入的 array 的元素只能是数字，不然就会自动被 0 覆盖）
    file = Buffer.from(file, 'base64');  // base64转Buffer格式
    spark.append(file);  // 将处理好的 file 文件添加进spark
    path = `${uploadDir}/${spark.end()}.${suffix}`;  // （通过spark.end()拿到生成的hash名字）
    await delay();
    // 检测是否存在
    isExists = await exists(path);  // 通过保存路径判断文件
    if (isExists) {  // 若存在相同文件，则不覆盖，且给客户端返回一个提示信息。
        res.send({
            code: 0,
            codeText: 'file is exists',
            originalFilename: filename,
            servicePath: path.replace(__dirname, HOSTNAME)
        });
        return;
    }
    writeFile(res, path, file, filename, false);  // 写入目录
});

// 大文件切片上传 & 合并切片
const merge = function merge(HASH, count) {};
app.post('/upload_chunk', async (req, res) => {});
app.post('/upload_merge', async (req, res) => {});
app.post('/upload_already', async (req, res) => {});

app.use(express.static('./'));
app.use((req, res) => {});