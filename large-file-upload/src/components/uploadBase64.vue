<template>
    <div class="item">
        <h3>单一文件上传「BASE64」，只适合图片</h3>
        <section class="upload_box" id="upload2">
            <!-- 选择文件 -->
            <!-- accept=".png,.jpg,.jpeg" 限定上传文件的格式「方案二」 -->
            <input type="file" class="upload_inp" accept=".jpg,.jpeg,.png">
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
            <div class="upload_tip">只能上传 PNG/JPG/JPEG 格式图片，且大小不能超过2MB</div>
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
  import 'element-plus/es/components/button/style/css'
  import 'element-plus/es/components/progress/style/css'
  import { uploadMessage } from '../assets/js/message'

  const Uploaded = reactive({
    item1: {
        disabled: false,
        loading: false,
        type: 'primary',
        text: '选择文件',
        percentage: 0,  // 进度值
        strokeWidth: 10,  // 进度条长度
        stripedFlow: false,  // 进度条样式
        status: null,  // 进度条状态
    }
  })

  onMounted(() => {
    // 文件上传方法一
    (function () {
        let upload = document.querySelector('#upload2'),
            upload_inp = upload.querySelector('.upload_inp'),
            upload_button_select = upload.querySelector('.upload_button.select'),
            upload_progress = upload.querySelector('.upload_progress');
        //     upload_button_upload = upload.querySelector('.upload_button.upload'),
            // upload_tip = upload.querySelector('.upload_tip');
        // let _file = null;  // 用于复制上传的文件信息

        // const checkIsDisable = Uploaded.item1.disabled || Uploaded.item1.loading

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
                // upload_button_select.classList.add('disable');
                // upload_button_upload.classList.add('loading');
                Uploaded.item1.disabled = true;  // 禁用上传按钮
                Uploaded.item1.loading = true;  // 启用加载动画
                Uploaded.item1.text = 'loading...';  // 修改按钮字
                Uploaded.item1.type = 'info';
                Uploaded.item1.stripedFlow = true;  // 开启进度条动画
                upload_progress.style.display = 'block';  // 显示进度条
                Uploaded.item1.percentage = 0  // 初始化进度值
                Uploaded.item1.status = null  // 初始化进度条状态
                return
            }
            Uploaded.item1.disabled = false
            Uploaded.item1.loading = false
            Uploaded.item1.text = '选择文件'; 
            Uploaded.item1.type = 'primary'
            Uploaded.item1.stripedFlow = false;  // 关闭动画
            // upload_progress.style.display = 'none';
        }
        // 上传文件到服务器
        // upload_button_upload.addEventListener('click', function() {
        //     // console.log(_file)
        //     if (Uploaded.item1.disabled || Uploaded.item1.loading) return;  // 按钮防抖处理
        //     if (!_file) {
        //         uploadMessage('请您先选择要上传的文件~~')
        //         return
        //     }

        //     // 判断文件名是否包含中文
        //     // if(isChina(_file.name)) {
        //     //     let [file_name, file_ext] = _file.name.split('.')
        //     //     file_name = encodeURI(file_name);
        //     //     _file.name = file_name + '.' + file_ext;  // 无法修改 _file.name
        //     //     console.log(_file.name)
        //     // };

        //     changeDisable(true);
        //     // 把文件传递给服务器：FormData / BASE64
        //     let formData = new FormData();
        //     formData.append('file', _file);  // 需要传的参数
        //     formData.append('filename', _file.name);  // 需要传的参数
        //     // 用axios发post请求
        //     instance.post('/route/upload_single', formData).then(data => {
        //         console.log('data', data.code)
        //         // 成功
        //         if(+data.code === 200) {  // + 把code 转换为数字
        //             uploadMessage(`文件已经上传成功~~，您可以基于 ${data.servicePath} 访问这个资源~~`);
        //             return;
        //         }
        //         return Promise.reject(data.codeText);
        //     }).catch(reason => {
        //         // 失败
        //         uploadMessage(`文件上传失败，请您稍后再试~~（错误信息：${reason}）`);
        //     }).finally(() => {
        //         // 无论成功或失败都走这里
        //         clearHandle(); // 清除展示标签
        //         changeDisable(false);  // 按钮变化控制
        //     })
        // })

        // // 移除文件逻辑
        // const clearHandle = () => {
        //     _file = null;  // 删除文件后置空复制的信息
        //     upload_tip.style.display = 'block';
        //     upload_list.style.display = 'none';
        //     upload_list.innerHTML = ``;  // 清除删除等标签
        //     upload_inp.value = null; // 清空文件对象中的文件
        //     console.log(upload_inp.files)
        // };
        // // 移除按钮的点击处理
        // upload_list.addEventListener('click', function(ev) {  // 事件监听父元素
        //     // console.log(ev.target);  // 触发事件的标签
        //     let target = ev.target;
        //     if (target.tagName==="EM") {  // 判断点击的是否为子元素标签<em/>
        //         // 点击的是移除按钮
        //         clearHandle();
        //     }
        // });

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
        
        // 监听用户选择文件的操作
        upload_inp.addEventListener('change', async function() {
            // upload_inp.files 获取用户选中的文件对象（object）
            //  + name：文件名
            //  + size：文件大小
            //  + type：文件的MIME类型
            var file = upload_inp.files[0],
                BASE64,
                data;  // 获取文件对象中的最新上传的文件
            if (!file) return; // 若没文件则返回
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

            changeDisable(true); // 上传按钮变化

            BASE64 = await changeBASE64(file); // 转为base64
            // console.log(BASE64);

            try {
                data = await instance.post('/route/upload_single_base64', {
                    file: encodeURIComponent(BASE64),
                    filename: file.name
                },{
                    headers: {
                        'Content-Type' : 'application/x-www-form-urlencoded'
                    }
                },{
                    // 文件上传中的回调函数 xhr.upload.onprogress
                    onUploadProgress(ev) {
                        // console.log(ev)
                        let {
                            loaded,
                            total
                        } = ev;
                        Uploaded.item1.percentage = ` ${loaded/total*100}`;  // 进度条
                    }
                });
                console.log(data)
                if (+data.code === 200) {
                    Uploaded.item1.percentage = 100  // 进度条
                    Uploaded.item1.status = 'success'  // 进度条状态
                    uploadMessage(`恭喜您，文件上传成功，您可以基于 ${data.servicePath}地址去访问~~`);
                    return
                }
                throw data.codeText
            } catch (err) {
                // 失败
                Uploaded.item1.status = 'exception'  // 进度条状态
                uploadMessage('很遗憾，文件上传失败，请您稍后再试~~');
            } finally {
                // console.log('执行finally')
                changeDisable(false); // 上传按钮变化
                upload_inp.value = null; // 清空本地缓存文件（若不清空，则无法选择重复文件）
            }

            // _file = file;  // 复制一份上传文件

            // // 显示上传的文件
            // upload_tip.style.display = 'none';
            // upload_list.style.display = 'block';
            // upload_list.innerHTML = `
            // <li>
            //     <span>文件：${file.name}</span>
            //     <span><em>移除</em></span>
            // </li>`
            // ;
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