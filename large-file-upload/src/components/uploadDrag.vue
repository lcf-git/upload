<template>

    <div class="item">
        <h3>拖拽上传</h3>
        <section class="upload_box" id="upload6">
            <!-- 选择文件 -->
            <!-- accept=".png,.jpg,.jpeg" 限定上传文件的格式「方案二」 -->
            <input type="file" class="upload_inp">
            <div class="upload_drag">
                <el-icon 
                    class="icon"
                    :size="110"
                    color="#60acfc"
                >
                    <UploadFilled />
                </el-icon>
                <span class="text">将文件拖到此处，或<a href="javascript:;" class="upload_submit"> 点击上传<div class="effect"></div></a></span>
                <div class="upload_tip">（支持拖拽上传，且文件大小不能超过2MB）</div>
            </div>
            <div class="upload_mark" v-show="Uploaded.item1.uploadShow">{{ Uploaded.item1.text }}</div>
            <!-- <div class="upload_button_box">
                <el-button class="upload_button select" type="primary" :disabled="Uploaded.item1.disabled" >选择文件</el-button>
                <el-button class="upload_button upload" type="success" :loading="Uploaded.item1.loading">{{Uploaded.item1.text}}</el-button>
            </div>
            <div class="upload_tip">支持拖拽上传，且文件大小不能超过2MB</div>
            <ul class="upload_list">
            </ul> -->
        </section>
    </div>

</template>

<script setup>
  import {ref, reactive, onMounted} from 'vue'
  import { instance } from '../js/instance'
  import { ElIcon } from 'element-plus'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { uploadMessage } from '../assets/js/message'

  const Uploaded = reactive({
    item1: {
        text: '正在上传中，请稍后...',
        uploadShow: false  // 显示遮罩层和上传提示语
    },
  });

  onMounted(() => {
    // 文件上传方法一
    (function () {
        let upload = document.querySelector('#upload6'),
            upload_inp = upload.querySelector('.upload_inp'),
            upload_submit = upload.querySelector('.upload_submit'),
            upload_mark = upload.querySelector('.upload_mark');
        let file = null;  // 用于复制上传的文件信息

        // 上传按钮变化
        const changeDisable = flag => {
            if (flag) {
                // upload_mark.style.display = 'block';  // 显示遮罩层和上传提示语
                Uploaded.item1.uploadShow = true;  // 显示遮罩层和上传提示语（新）
                return
            }
            // upload_mark.style.display = 'none';
            Uploaded.item1.uploadShow = false;
        }

        // 实现文件上传
        const uploadFile = async file => {
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
            changeDisable(true)

            try {
                // 把文件传递给服务器：FormData / BASE64
                let formData = new FormData(),
                    data;  // 获取文件对象中的最新上传的文件
                formData.append('file', file);  // 需要传的参数
                formData.append('filename', file.name);  // 需要传的参数
                // 用axios发post请求
                data = await instance.post('/upload_single', formData, {
                    // 文件上传中的回调函数 xhr.upload.onprogress
                    onUploadProgress(ev) {
                        // console.log(ev)
                        let {
                            loaded,
                            total
                        } = ev;
                        // upload_mark.innerHTML = `正在上传中，请稍后... ${loaded/total*100}%`;  // 进度条
                        Uploaded.item1.text = `正在上传中，请稍后... ${loaded/total*100}%`;
                    }
                });
                console.log('data', data.code)
                // 成功
                if(+data.code === 200) {  // + 把code 转换为数字
                    // upload_mark.innerHTML = `正在上传中，请稍后... 100%`
                    Uploaded.item1.text = `正在上传中，请稍后... 100%`;
                    uploadMessage(`文件已经上传成功~~，您可以基于 ${data.servicePath} 访问这个资源~~`);
                    return;
                }
                throw data.codeText;
            } catch (err) {
                // 失败
                // Uploaded.item1.status = 'exception'  // 进度条状态
                uploadMessage(`文件上传失败，请您稍后再试~~（错误信息：${reason}）`);
            } finally {
                // 无论成功或失败都走这里
                changeDisable(false);  // 按钮变化控制
                upload_inp.value = null; // 清空本地缓存文件（若不清空，则无法选择重复文件）
            }
        }

        // 拖拽获取 dragenter dragleave dragover drop（进入容器、离开容器、在容器中移动、放到容器里面）
        // upload.addEventListener('dragenter', function() {
        //     upload.classList.add('enter-upload');  // 
        //     console.log('进入')
        // })
        upload.addEventListener('dragleave', function() {
            upload.classList.remove('enter-upload');
            // console.log('离开')
        })
        upload.addEventListener('dragover', function(ev) {
            ev.preventDefault();  // 阻止默认行为
            upload.classList.add('enter-upload'); // 显示进入容器高亮样式
            // console.log('区域内移动')
        })
        upload.addEventListener('drop', async function(ev) {
            ev.preventDefault();  // 阻止默认行为
            upload.classList.remove('enter-upload');
            // console.log('放置到容器中', ev)
            // if (Uploaded.item1.uploadShow) return;  // 拖拽防抖处理
            file = ev.dataTransfer.files[0];  // 从拖拽事件中获取文件对象
            if (!file || Uploaded.item1.uploadShow) return; // 若没文件则返回空 + 拖拽防抖处理（合并）
            console.log(file)
            uploadFile(file)
        })

        // 手动选择（上传）
        upload_inp.addEventListener('change', async function() {
            // upload_inp.files 获取用户选中的文件对象（object）
            //  + name：文件名
            //  + size：文件大小
            //  + type：文件的MIME类型
            file = upload_inp.files[0];
            if (!file) return; // 若没文件则返回空
            // _file = file;  // 复制一份上传文件
            console.log(file)
            uploadFile(file)               
        });

        //  点击选择文件按钮，触发上传文件INPUT框选择文件的行为
        upload_submit.addEventListener('click', function() {
            if (Uploaded.item1.uploadShow) return;  // 按钮防抖处理
            upload_inp.click();
        })
    })();
  });
</script>

<style scoped>
    /* @import url(../assets/css/upload.css); */
    /* 进入拖拽区 */
    .enter-upload {
        border-color: #409eff;
        /* background-color: rgba(64, 158, 255, .1); */
        background-color: #ecf5ff;
    }

    /* （拖拽上传）文本盒子 */
    #upload6 .upload_drag {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: default;
    }
    /* （拖拽上传）a标签 */
    #upload6 a {
        text-decoration: none;
        color: #60acfc;
    }
    /* （拖拽上传）父元素 */
    #upload6 {
        position: relative;
        font-family: "微软雅黑";
    }
    /* （拖拽上传）提示语 */
    #upload6 .upload_mark {
        /* display: none; */
        background-color: rgba(0,0,0,0.7);
        /* 使用固定定位让元素撑满全屏 */
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        text-align: center;
        line-height: 220px;
        font-size: 18px;
        color: #fff;
        letter-spacing: 2px;
    }
    /* （拖拽上传）提示文本2 */
    #upload6 .upload_drag {
        font-size: 20px;
        color: #808080;
    }

    /* 提示语 */
    #upload6 .upload_tip{
        font-size: 10px;
    }

    /* 玻璃反光特效 */
    .upload_submit{
        /* width: 100px;
        height: 20px; */
        /* left: 20px; */
        /* top: 20px; */
        /* background: rgb(0, 0, 0); */
        /* border-radius: 3px; */
        /* box-shadow: 0px 0px 1px 1px gray; */
        position: relative;
        overflow: hidden;
        color: #60acfc;
    }
    .effect{
        width: 50%;
        height: 50%;
        transform: rotate(70deg);
        background:rgba(255, 255, 255, 0.856);
        position: absolute;
        /* left: 0px; */
        top: 0px;
        animation: move 1.5s infinite;
        /* animation-delay: 3s;
        -webkit-animation-delay: 3s; */
    }
    @keyframes move{
        /* from{left:-150px;}
        to{left:350px;} */
        from{left:-15px;}
        to{left:125px;}
    }
    @-webkit-keyframes move{
        /* from{left:-150px;}
        to{left:350px;} */
        from{left:-15px;}
        to{left:125px;}
    }
</style>