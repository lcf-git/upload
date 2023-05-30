<template>

    <div class="item">
        <h3>单一文件上传「缩略图处理」</h3>
        <section class="upload_box" id="upload3">
            <!-- 选择文件 -->
            <!-- accept=".png,.jpg,.jpeg" 限定上传文件的格式「方案二」 -->
            <input type="file" class="upload_inp" accept=".png,.jpg,.jpeg">
            <div class="upload_button_box">
                <!-- <button class="upload_button select">选择文件</button> -->
                <!-- <button class="upload_button upload">上传到服务器</button> -->
                <el-button class="upload_button select" type="primary" :disabled="Uploaded.item1.disabled" >选择文件</el-button>
                <el-button 
                    class="upload_button upload" 
                    :type="Uploaded.item1.type" 
                    :loading="Uploaded.item1.loading"
                >{{Uploaded.item1.text}}</el-button>
            </div>
            <div class="upload_tip">只能上传 PNG/JPG/JPEG 格式图片，且大小不能超过2MB</div>
            <!-- 缩略图 -->
            <div class="upload_abbre">
                <img style="width: 30%;" src="" alt="">
                <span><em>移除</em></span>
            </div>
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
  import { instance } from '../js/instance'
  import { ElButton, ElProgress } from 'element-plus'
  import '../../node_modules/spark-md5/spark-md5.min.js'
  import 'element-plus/es/components/button/style/css'
  import 'element-plus/es/components/progress/style/css'
  import { uploadMessage } from '../assets/js/message'

  const Uploaded = reactive({
    item1: {
        disabled: false,
        loading: false,
        text: '上传到服务器',
        type: 'success',  // 按钮颜色
        percentage: 0,  // 进度值
        strokeWidth: 10,  // 进度条长度
        stripedFlow: false,  // 进度条样式
        status: null,  // 进度条状态
    },
  })

  onMounted(() => {
    // 文件上传方法
    (function () {
        let upload = document.querySelector('#upload3'),
            upload_inp = upload.querySelector('.upload_inp'),
            upload_button_select = upload.querySelector('.upload_button.select'),
            upload_button_upload = upload.querySelector('.upload_button.upload'),
            upload_abbre = upload.querySelector('.upload_abbre'),
            upload_abbre_img = upload_abbre.querySelector('#upload3 img'),
            upload_progress = upload.querySelector('.upload_progress'),
            upload_tip = upload.querySelector('.upload_tip');
            // upload_list = upload.querySelector('.upload_list');
        let _file = null;  // 用于复制上传的文件信息

        // 判断中文
        // const isChina = (s) => {
        //     var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        //     if (reg.test(s)) {
        //         console.log("包含汉字！");
        //         return true
        //     } else {
        //         console.log("没有包含汉字！");
        //         return false
        //     }
        // }

        // 上传按钮变化
        const changeDisable = flag => {
            if (flag) {
                Uploaded.item1.disabled = true;  // 禁用上传按钮
                Uploaded.item1.loading = true;  // 启用加载动画
                Uploaded.item1.text = 'loading...';  // 修改按钮字
                Uploaded.item1.type = 'info';  // 按钮颜色
                Uploaded.item1.stripedFlow = true;  // 开启进度条动画
                upload_progress.style.display = 'block';  // 显示进度条
                Uploaded.item1.percentage = 0  // 初始化进度值
                Uploaded.item1.status = null  // 初始化进度条状态
                return
            }
            Uploaded.item1.disabled = false
            Uploaded.item1.loading = false
            Uploaded.item1.text = '上传到服务器';
            Uploaded.item1.type = 'success'
            Uploaded.item1.stripedFlow = false;  // 关闭动画
            // upload_progress.style.display = 'none';  //  隐藏上传进度条
        }

        // 把选择的文件读取成为BASE64
        const changeBASE64 = file => {
            return new Promise(resolve => {
                // 将图片转为base64码格式
                let fileReader = new FileReader(); // 异步操作
                fileReader.readAsDataURL(file);  // 将文件解析为base64
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
                    let buffer = ev.target.result,  // 获取由base64转换成的buffer编码
                        spark = new SparkMD5.ArrayBuffer(), // 使用hash修改文件名字
                        HASH,
                        suffix;

                    spark.append(buffer);  // 通过文件内容生成hash名
                    HASH = spark.end(); // 获取修改好的名称
                    suffix = /\.([a-zA-z0-9]+)/.exec(file.name)[1];  // 获取文件后缀名（以 .xxx 为结尾的 ）
                    // console.log('HASH: ', HASH);
                    // console.log('suffix: ', suffix);

                    resolve({
                        buffer,
                        HASH,
                        suffix,
                        filename: `${HASH}.${suffix}`
                    }); // 若不调用resolve(), 则Promise没有返回值
                    // console.log('文件转码为Buffer：', buffer);
                };
                // this.result 就是我们的读取的结果 是一个base64
                // 可以把base64放到图片的src中，就可以在img上显示图片
            });
        };

        // 上传文件到服务器
        upload_button_upload.addEventListener('click', async function() {
            // console.log(_file)
            if (Uploaded.item1.disabled || Uploaded.item1.loading) return;  // 按钮防抖处理
            if (!_file) {
                uploadMessage('请您先选择要上传的文件~~');
                return;
            }

            changeDisable(true);  // 上传按钮变化
            // 生成文件的HASH名字
            let {
                filename
            } = await changeBuffer(_file);
            // return;

            // console.log(_file, filename)
            // 把文件传递给服务器：FormData / BASE64
            let formData = new FormData();
            formData.append('file', _file);  // 需要传的参数
            formData.append('filename', filename);  // 需要传的参数
            // 用axios发post请求
            instance.post('/upload_single_name', formData, {
                // 文件上传中的回调函数 xhr.upload.onprogress
                onUploadProgress(ev) {
                    // console.log(ev)
                    let {
                        loaded,
                        total
                    } = ev;
                    Uploaded.item1.percentage = `${loaded/total*100}`;  // 进度条
                }
            }).then(data => {
                console.log('data', data.code)
                // 成功
                if(+data.code === 200) {  // + 把code 转换为数字
                    Uploaded.item1.percentage = 100  // 进度条
                    Uploaded.item1.status = 'success'  // 进度条状态
                    uploadMessage(`文件已经上传成功~~，您可以基于 ${data.servicePath} 访问这个资源~~`);
                    return;
                }
                return Promise.reject(data.codeText);
            }).catch(reason => {
                // 失败
                Uploaded.item1.status = 'exception'  // 进度条状态
                uploadMessage(`文件上传失败，请您稍后再试~~（错误信息：${reason}）`);
            }).finally(() => {
                // 无论成功或失败都走这里
                changeDisable(false);  // 按钮变化控制
                clearHandle()
            })
        })

        // upload_abbre
        // 移除文件逻辑
        const clearHandle = () => {
            upload_abbre.style.display = 'none';  // 隐藏图片标签
            upload_abbre_img.src = '';  // 清空图片
            Uploaded.item1.disabled = false;  // 启用按钮
            _file = null;  // 复制文件置空
            upload_inp.value = null; // 清空本地缓存文件（若不清空，则无法选择重复文件）
            // console.log(upload_inp.files)
        };
        // 移除按钮的点击处理
        upload_abbre.addEventListener('click', function(ev) {  // 事件监听父元素
            // console.log(ev.target);  // 触发事件的标签
            let target = ev.target;
            if (target.tagName==="EM") {  // 判断点击的是否为子元素标签<em/>
                // 点击的是移除按钮
                clearHandle();
            }
        });
        
        // 文件预览，就是把文件对象转换为BASE64，赋值给图片的SRC属性即可
        upload_inp.addEventListener('change', async function() {
            // upload_inp.files 获取用户选中的文件对象（object）
            //  + name：文件名
            //  + size：文件大小
            //  + type：文件的MIME类型
            var file = upload_inp.files[0],
                BASE64;
                // data;  // 获取文件对象中的最新上传的文件
            if (!file) return; // 若没文件则返回空
            _file = file;  // 复制一份上传文件
            console.log(file)

            // 限制文件上传的格式「方案一」
            // if (!/(PNG|JPG|JPEG)/i.test(file.type)) {
            //     uploadMessage('上传的文件只能是 PNG/JPG/JPEG 格式的~~');
            //     return
            // }

            // 限制文件上传的大小
            if (file.size > 2*1024*1024) {  // 2 bit * 1024(byte) * 1024(MB) = 2MB
                uploadMessage('上传的文件不能超过2MB~~');
                return;
            }
            Uploaded.item1.disabled = true;  // 上传按钮禁用
            BASE64 = await changeBASE64(file); // 转为base64

            // upload_tip.style.display = 'none';  // 提示语
            upload_abbre.style.display = 'block';  // 显示图片标签
            upload_abbre_img.src = BASE64;  // 展示图片
            Uploaded.item1.disabled = false;  // 启用
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