<template>

        <div class="item">
            <h3>多文件上传</h3>
            <section class="upload_box" id="upload5">
                <!-- 选择文件 -->
                <!-- accept=".png,.jpg,.jpeg" 限定上传文件的格式「方案二」 -->
                <input type="file" class="upload_inp" multiple>
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
                <div class="upload_tip">支持多文件上传，大小不能超过2MB</div>
                <ul class="upload_list">
                    <!-- <li>
                        <span>文件：...</span>
                        <span><em>移除</em></span>
                    </li> -->
                </ul>
            </section>
        </div>

</template>

<script setup>
  import {ref, reactive, onMounted} from 'vue'
  import { instance } from '../js/instance'
  import { ElButton } from 'element-plus'
  import 'element-plus/es/components/button/style/css'
  import { uploadMessage } from '../assets/js/message'

  const Uploaded = reactive({
    item1: {
        disabled: false,
        loading: false,
        text: '上传到服务器',
        type: 'success',  // 按钮颜色
    },
  })

  onMounted(() => {
    // 文件上传方法一
    (function () {
        let upload = document.querySelector('#upload5'),
            upload_inp = upload.querySelector('.upload_inp'),
            upload_button_select = upload.querySelector('.upload_button.select'),
            upload_button_upload = upload.querySelector('.upload_button.upload'),
            upload_tip = upload.querySelector('.upload_tip'),
            upload_list = upload.querySelector('.upload_list');
        let _files = [];  // 用于复制上传的文件信息

        // 上传按钮变化
        const changeDisable = flag => {
            if (flag) {
                Uploaded.item1.disabled = true;  // 禁用上传按钮
                Uploaded.item1.loading = true;  // 启用加载动画
                Uploaded.item1.text = 'loading...';  // 修改按钮字
                Uploaded.item1.type = 'info';  // 按钮颜色
                return
            }
            Uploaded.item1.disabled = false
            Uploaded.item1.loading = false
            Uploaded.item1.text = '上传到服务器';
            Uploaded.item1.type = 'success'
        }
        // 上传文件到服务器
        upload_button_upload.addEventListener('click', function() {
            // console.log(_file)
            if (Uploaded.item1.disabled || Uploaded.item1.loading) return;  // 按钮防抖处理
            if (_files.length === 0) {
                uploadMessage('请您先选择要上传的文件~~')
                return
            }

            changeDisable(true);

            // 循环发送请求
            let upload_list_arr = Array.from(upload_list.querySelectorAll('li')); // 获取所有生成的li标签（通过Array.from转为数组才可以使用数组方法）
            _files = _files.map(item => {
                // 把文件传递给服务器：FormData / BASE64
                let fm = new FormData(),
                    curLi = upload_list_arr.find(liBox => liBox.getAttribute('key') === item.key),  // 筛选相同的key的标签
                    curSpan = curLi ? curLi.querySelector('span:nth-last-child(1)') : null // 获取标签末尾的span
                fm.append('file', item.file);  // 需要传的参数
                fm.append('filename', item.filename);  // 需要传的参数
                return instance.post('/upload_single', fm, {
                    // 文件上传中的回调函数 xhr.upload.onprogress
                    onUploadProgress(ev) {
                        // 检测每一个的上传进度
                        if (curSpan) {
                            curSpan.innerHTML = `${(ev.loaded/ev.total*100).toFixed(2)}%`
                        }
                        // let {
                        //     loaded,
                        //     total
                        // } = ev;
                        // Uploaded.item1.percentage = `${(loaded/total*100).toFixed(2)}`;  // 进度条
                    }
                }).then(data => {
                    console.log('data', data.code)
                    // 成功
                    if(+data.code === 200) {  // + 把code 转换为数字
                        if (curSpan) curSpan.innerHTML = `100%`
                        // uploadMessage(`文件已经上传成功~~，您可以基于 ${data.servicePath} 访问这个资源~~`);
                        return;
                    }
                    return Promise.reject(data.codeText);
                });
            });

            // Promise.all会收集循环请求的所有的回调，并做节流处理（无论几次请求，都只执行一次成功或失败的回调）
            Promise.all(_files).then(() => {
                uploadMessage(`所有文件都已上传成功~~`);
            }).catch(() => {
                // 失败
                uploadMessage(`文件上传失败，请您稍后再试~~`);
            }).finally(() => {
                // 无论成功或失败都走这里
                // clearHandle(); // 清除展示标签
                changeDisable(false);  // 按钮变化控制
                _files = []
                upload_tip.style.display = 'block';  // 提示语
                upload_list.style.display = 'none';
                upload_list.innerHTML = ''
            });
        });

        // 基于事件委托实现移除的操作
        upload_list.addEventListener('click', function(ev) {  // 事件监听父元素
            let target = ev.target,  // 触发事件的标签
                curLi = null,
                key;
            if (target.tagName === "EM") {  // 判断点击的是否为子元素标签<em/>
                // 点击的是移除按钮
                // clearHandle();
                curLi = target.parentNode.parentNode;
                if(!curLi) return;
                key = curLi.getAttribute('key');  // 获取自定义属性
                upload_list.removeChild(curLi);  // 移除标签
                _files = _files.filter(item => item.key !== key);  // 移除多文件对象数组的元素
                console.log(_files);
                if(_files.length === 0) {
                    upload_list.style.display = 'none';
                    upload_tip.style.display = 'block';  // 提示语
                }
            }
        });

        // 获取唯一值（随机数）
        const createRandom = () => {
            let ran = Math.random() * new Date();  // 随机数 * 时间戳
            return ran.toString(16).replace('.', '')  // 转为16进制，去掉.
        }
        
        // 监听用户选择文件的操作
        upload_inp.addEventListener('change', function() {
            // upload_inp.files 获取用户选中的文件对象（object）
            //  + name：文件名
            //  + size：文件大小
            //  + type：文件的MIME类型
            _files = Array.from(upload_inp.files);  // 将获取的文件对象(类数组对象)，转为数组操作
            if (_files.length === 0) return; // 若没文件则返回

            // 限制文件上传的格式「方案一」
            // if (!/(PNG|JPG|JPEG)/i.test(file.type)) {
            //     uploadMessage('上传的文件只能是 PNG/JPG/JPEG 格式的~~');
            //     return
            // }

            // // 限制文件上传的大小
            // if (file.size > 2*1024*1024) {  // 2 bit * 1024(byte) * 1024(MB) = 2MB
            //     uploadMessage('上传的文件不能超过2MB~~');
            //     return;
            // }

            // 重构集合的数据结构（给每一项设置一个位置值，作为自定义属性存储到元素上，后期点击删除按钮的时候，基于这个自定义事件获取唯一值，再到集合中
            // 根据这个唯一值，删除集合中这一项）
            _files = _files.map(file => {
                return {
                    file,
                    filename: file.name,
                    key: createRandom()  // 制造一个唯一值
                };
            });
            // console.log(_files);

            // 绑定数据
            let str = ``;
            _files.forEach((item, index) => {
                str += `
                <li key="${item.key}">
                    <span>文件${index+1}：${item.filename}</span>
                    <span><em>移除</em></span>
                </li>`
            })
            upload_tip.style.display = 'none';  // 提示语
            upload_list.style.display = 'block';
            upload_list.innerHTML = str
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