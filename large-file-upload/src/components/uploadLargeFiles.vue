<template>

    <div class="item">
        <h3>大文件上传</h3>
        <section class="upload_box" id="upload7">
            <!-- 选择文件 -->
            <!-- accept=".png,.jpg,.jpeg" 限定上传文件的格式「方案二」、添加multiple 可以选择多文件 -->
            <input type="file" class="upload_inp">
            <div class="upload_button_box">
                <!-- <button class="upload_button select">选择文件</button> -->
                <!-- <button class="upload_button upload">上传到服务器</button> -->
                <el-button 
                    class="upload_button select" 
                    :type="Uploaded.item1.type" 
                    :loading="Uploaded.item1.loading" 
                >{{Uploaded.item1.text}}</el-button>
                <!-- <el-button class="upload_button upload" type="success" :loading="Uploaded.item1.loading">{{Uploaded.item1.text}}</el-button> -->
            </div>
            <div class="upload_tip">支持大文件、断点续传</div>
            <!-- 进度条 -->
            <div class="upload_progress">
                <!-- <div class="value"></div> -->
                <el-progress 
                    striped
                    :percentage="Uploaded.item1.percentage" 
                    :stroke-width="Uploaded.item1.strokeWidth" 
                    :striped-flow="Uploaded.item1.stripedFlow"
                    :status="Uploaded.item1.status"
                    :duration="10"
                    >
                    <!-- <el-button :icon="Check" size="small" circle></el-button> -->
                </el-progress>
            </div>
        </section>
    </div>

</template>

<script setup>
  import {ref, reactive, onMounted} from 'vue'
  import SparkMD5 from 'spark-md5';
  import { instance } from '../js/instance'
  import { ElButton, ElProgress } from 'element-plus'
  import 'element-plus/es/components/button/style/css'
  import 'element-plus/es/components/progress/style/css'
  import { uploadMessage } from '../assets/js/message'

  const Uploaded = reactive({
    item1: {
        disabled: false,  // 按钮禁用状态
        loading: false,  // 按钮上传动画
        type: 'primary',  // 按钮颜色
        text: '上传文件',  // 按钮文字
        percentage: 0,  // 进度值
        strokeWidth: 10,  // 进度条长度
        stripedFlow: false,  // 进度条样式
        status: null,  // 进度条状态
    },
  })

  onMounted(() => {
    // 文件上传方法一
    (function () {
        let upload = document.querySelector('#upload7'),
            upload_inp = upload.querySelector('.upload_inp'),
            upload_button_select = upload.querySelector('.upload_button.select'),
            upload_progress = upload.querySelector('.upload_progress');
            // upload_progress_value = upload_progress.querySelector('.value')
            // upload_list = upload.querySelector('.upload_list');
        let total_chunk = [];  // 用于 promise.all 收集请求数据
        let total_pace = [];  // promise.all

        // 上传按钮变化
        const changeDisable = flag => {
            if (flag) {
                // upload_button_select.classList.add('disable');
                // upload_button_upload.classList.add('loading');
                Uploaded.item1.disabled = true;  // 禁用上传按钮
                Uploaded.item1.loading = true;  // 启用上传加载动画
                Uploaded.item1.text = 'loading...';  // 修改按钮字
                Uploaded.item1.type = 'info';
                Uploaded.item1.stripedFlow = true;  // 开启进度条动画
                upload_progress.style.display = 'block';  // 显示进度条
                Uploaded.item1.percentage = 0  // 初始化进度值
                Uploaded.item1.status = null  // 初始化进度条状态
                return
            }
            upload_inp.value = null; // 清空文件对象中的文件
            Uploaded.item1.disabled = false
            Uploaded.item1.loading = false
            Uploaded.item1.text = '选择文件'; 
            Uploaded.item1.type = 'primary'
            Uploaded.item1.stripedFlow = false;  // （进度条）关闭动画
            Uploaded.item1.percentage = 0  // 初始化进度值
            Uploaded.item1.status = null  // 初始化进度条状态
            // upload_progress.style.display = 'none';
        }

        // 把选择的文件读取成为BASE64
        const changeBASE64 = file => {
            return new Promise(resolve => {
                // 将图片转为base64码格式
                let fileReader = new FileReader(); // 异步操作，完成后会通过onload返回数据
                fileReader.readAsDataURL(file);  // 将文件解析为base64（二进制）
                fileReader.onload = ev => {  // 在解析完成后调用 resolve 返回数据
                    resolve(ev.target.result); // 若不调用resolve(), 则Promise没有返回值
                    // console.log('文件转码为BASE64：', ev.target.result);
                };
                // this.result 就是我们的读取的结果 是一个base64
                // 可以把base64放到图片的src中，就可以在img上显示图片
            });
        };

        // 把选择的文件读取成为Buffer
        const changeBuffer = file => {
            return new Promise(resolve => {
                // 将图片转为Buffer格式
                let fileReader = new FileReader(); // 异步操作
                fileReader.readAsArrayBuffer(file);  // 将文件解析为Buffer
                fileReader.onload = ev => {  // 在解析完成后调用 resolve 返回数据
                    let buffer = ev.target.result,  // 获取换成buffer编码的文件
                        spark = new SparkMD5.ArrayBuffer(), // 使用hash修改文件名字
                        HASH,
                        suffix;

                    spark.append(buffer);  // 通过文件内容生成hash名
                    HASH = spark.end(); // 获取修改好的名称
                    suffix = /\.([a-zA-z0-9]+)$/.exec(file.name)[1];  // 获取文件后缀名（以 .xxx 为结尾的 ）
                    // console.log('HASH: ', HASH);
                    // console.log('suffix: ', suffix);

                    resolve({
                        buffer, // 转换成buffer编码的文件
                        HASH,  // 修改好的名称
                        suffix, // 文件后缀名
                        filename: `${HASH}.${suffix}`  // 带后缀的文件名
                    }); // 若不调用resolve(), 则Promise没有返回值
                    // console.log('文件转码为Buffer：', buffer);
                };
                // this.result 就是我们的读取的结果 是一个base64
                // 可以把base64放到图片的src中，就可以在img上显示图片
            });
        };
        
        // 监听用户选择文件的操作
        upload_inp.addEventListener('change', async function() {
            // upload_inp.files 获取用户选中的文件对象（object）
            //  + name：文件名
            //  + size：文件大小
            //  + type：文件的MIME类型
            console.time('time')
            var file = upload_inp.files[0]
            if (!file) return; // 若没文件则返回
            console.log(file)

            // 限制文件上传的格式「方案一」
            // if (!/(PNG|JPG|JPEG)/i.test(file.type)) {
            //     uploadMessage('上传的文件只能是 PNG/JPG/JPEG 格式的~~');
            //     return
            // }

            // 限制文件上传的大小
            // if (file.size > 2*1024*1024) {  // 2 bit * 1024(byte) * 1024(MB) = 2MB
            //     uploadMessage('上传的文件不能超过2MB~~');
            //     return;
            // }

            // BASE64 = await changeBASE64(file); // 转为base64

            // 获取文件的HASH
            changeDisable(true); // 上传按钮变化
            Uploaded.item1.text = '文件解析中...';  // 修改按钮字
            let already = [],
                data = null,  // 获取文件对象中的最新上传的文件
                {
                    HASH,
                    suffix
                } = await changeBuffer(file);

            Uploaded.item1.text = '获取切片...';  // 修改按钮字
            // 获取已经上传的切片信息
            try {
                data = await instance.get('/upload_already', {
                    params: {
                        HASH
                    }
                });
                console.log(data)
                if (+data.code === 200) {
                    already = data.fileList;  // 获取切片的集合
                    // console.log('获取到切片', already)
                    // Uploaded.item1.percentage = 10  // 进度条
                    // Uploaded.item1.status = 'success'  // 进度条状态
                    // uploadMessage(`恭喜您，文件上传成功，您可以基于 ${data.servicePath}地址去访问~~`);
                    // return;
                }
            } catch (err) {}

            // 实现文件切片处理（固定数量 & 固定大小）
            let max = 1024*100,  // 100kb
                count = Math.ceil(file.size / max),
                index = 0,
                chunks = [];
            // if(count > 100) {  // 切片数量大于200，固定为100
            //     max = file.size / 100;
            //     count = 150;
            // }
            if(count > 100) {  // 切片数量大于200，固定为100
                max = file.size / 100;
                count = 150;
            } 
            // else if (10000 < count) {
            //     max = file.size / 250;
            //     count = 300;
            // }
            // reduce
            while (index < count) {
                // index 0 -> 0~max
                // index 1 -> max~max*2
                // index 2 -> max*2~max*3
                // index*max ~ (index+1)*max
                chunks.push({
                    file: file.slice(index*max, (index+1) * max),
                    filename: `${HASH}_${index+1}.${suffix}`
                });
                index++;
            }
            // console.log('chunks', chunks)

            // 上传成功的处理
            const clear = () => {
                // remove loading...
                upload_inp.value = null; // 清空文件对象中的文件
                Uploaded.item1.disabled = false  // 按钮解除禁用
                Uploaded.item1.loading = false  // 初始化按钮
                Uploaded.item1.text = '选择文件';
                Uploaded.item1.type = 'primary'

                Uploaded.item1.stripedFlow = false;  // （进度条）关闭动画
                Uploaded.item1.percentage = 0  // 初始化进度值
                Uploaded.item1.status = null  // 初始化进度条状态
                // upload_progress.style.display = 'none';
            };
            const complate = async () => {
                // 管控进度条
                index++;
                Uploaded.item1.percentage = parseFloat((index/count*50).toFixed(2))  // 进度条

                // console.log(index, count)
                // 当所有切片都上传成功，我们合并切片
                if (index < count) return;
                // Uploaded.item1.percentage = 100
                try {
                    data = await instance.post('/upload_merge', {
                        HASH,
                        count
                    },{
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });
                    if (+data.code === 200) {
                        // already = data.fileList;  // 获取切片的集合
                        Uploaded.item1.percentage = 100  // 进度条
                        uploadMessage(`恭喜您，文件上传成功，您可以基于 ${data.servicePath}地址去访问~~`);
                        changeDisable(false);
                        // clear();
                        return;
                    }
                    // throw data.codeText; // 抛出错误
                } catch (err) {
                    uploadMessage(`切片合并失败，请您稍后再试~~`);
                    changeDisable(false);
                    // clear();
                    return;
                }
                console.timeEnd('time')
                // instance.post('/upload_merge', {
                //     HASH,
                //     count
                // },{
                //     headers: {
                //         'Content-Type': 'application/x-www-form-urlencoded'
                //     }
                // }).then(data => {
                //     if (+data.code === 200) {
                //         // already = data.fileList;  // 获取切片的集合
                //         Uploaded.item1.percentage = 100  // 进度条
                //         // Uploaded.item1.status = 'success'  // 进度条状态
                //         uploadMessage(`恭喜您，文件上传成功，您可以基于 ${data.servicePath}地址去访问~~`);
                //         // changeDisable();
                //         return;
                //     }
                // }).catch(() => {
                //     // 失败
                //     uploadMessage(`切片合并失败，请您稍后再试~~`);
                // }).finally(() => {
                //     changeDisable(false);
                //     total_pace = []
                // });
            };

            Uploaded.item1.text = 'loading...';  // 修改按钮字
            //  把每一个切片都上传到服务器上
            // for (let chunk of chunks) {
            //     // 已经上传的无需再上传
            //     if(already.length > 0 && already.includes(chunk.filename)) {
            //         complate();  // 上传进度
            //         // return;
            //     }
            //     // console.log(chunk.filename)
            //     let fm = new FormData;
            //     fm.append('file', chunk.file);
            //     fm.append('filename', chunk.filename);
            //     instance.post('/upload_chunk', fm).then(async data => {
            //         if(+data.code === 200) {
            //             await complate();  // 上传进度
            //             return;
            //         }
            //         return Promise.reject(data.codeText);
            //     }).catch(() => {
            //         uploadMessage(`当前切片上传失败，请您稍后再试~~`);
            //         changeDisable(false);
            //         // clear();
            //     });
            // }

            total_chunk = chunks.map(chunk => {
                // 已经上传的无需再上传
                if(already.length > 0 && already.includes(chunk.filename)) {
                    // console.log(chunk.filename)
                    complate();  // 上传进度
                    return;
                }
                // console.log(chunk.filename)
                let fm = new FormData;
                fm.append('file', chunk.file);
                fm.append('filename', chunk.filename);
                return instance.post('/upload_chunk', fm).then(data => {
                    if(+data.code === 200) {
                        complate();  // 上传进度
                        return;
                    }
                    return Promise.reject(data.codeText);
                })
                // .catch(() => {
                //     uploadMessage(`当前切片上传失败，请您稍后再试~~`);
                //     clear();
                // });
            })

            // Promise.all会收集循环请求的所有的回调，并做节流处理（无论几次请求，都只执行一次成功或失败的回调）
            Promise.all(total_chunk).catch(() => {
                // 失败
                uploadMessage(`当前切片上传失败，请您稍后再试~~`);
                changeDisable(false);
                return;
            })
            // Promise.all(total_pace).catch(() => {
            //     // 失败
            //     uploadMessage(`切片合并失败，请您稍后再试~~`);
            // }).finally(() => {
            //     changeDisable(false);
            //     total_pace = []
            // })
        });

        //  点击选择文件按钮，触发上传文件INPUT框选择文件的行为
        upload_button_select.addEventListener('click', function() {
            if (Uploaded.item1.disabled || Uploaded.item1.loading) return;  // 按钮防抖处理
            upload_inp.click();
        })
    })();
  });
</script>

<style scoped>
    /* @import url(../assets/css/upload.css); */
</style>