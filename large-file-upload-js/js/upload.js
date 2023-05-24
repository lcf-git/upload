(function () {
    // 请求主体传递给服务器的数据格式：FormData/x-www-form-urlencoded/json字符串/普通文本字符串/Buffer...
    let fm = new FormData;
    fm.append('file', '');
    fm.append('filename', '');
    axios.post('/upload_single', fm).then(data => {

    }).catch(reason => {

    });

    // xxx=xxx&xxx=xxx
    axios.post('/upload_single_base64', {
        file: '',
        filename: ''
    }, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
});

// 文件上传方法一
(function () {
    let upload = document.querySelector('#upload1'),
        upload_inp = upload.querySelector('.upload_inp'),
        upload_button_select = upload.querySelector('.upload_button.select'),
        upload_button_upload = upload.querySelector('.upload_button.upload'),
        upload_tip = upload.querySelector('.upload_tip'),
        upload_list = upload.querySelector('.upload_list');
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
    // 上传文件到服务器
    upload_button_upload.addEventListener('click', function() {
        // console.log(_file)
        if (!_file) {
            alert('请您先选择要上传的文件~~')
            return
        }

        // 判断文件名是否包含中文
        // if(isChina(_file.name)) {
        //     let [file_name, file_ext] = _file.name.split('.')
        //     file_name = encodeURI(file_name);
        //     _file.name = file_name + '.' + file_ext;  // 无法修改 _file.name
        //     console.log(_file.name)
        // };

        // 把文件传递给服务器：FormData / BASE64
        let formData = new FormData();
        formData.append('file', _file);  // 需要传的参数
        formData.append('filename', _file.name);  // 需要传的参数
        // 用axios发post请求
        instance.post('/route/upload_single', formData).then(data => {
            console.log('data', data.code)
            // 成功
            if(+data.code === 200) {  // + 把code 转换为数字
                alert(`文件已经上传成功~~，您可以基于 ${data.data} 访问这个资源~~`);
                // console.log(`文件已经上传成功~~，您可以基于 ${data.data} 访问这个资源~~`)
                clearHandle();
                return;
            }
            return Promise.reject(data.codeText);
        }).catch(reason => {
            // 失败
            alert(`文件上传失败，请您稍后再试~~（错误信息${reason}）`);
            // console.log(`文件上传失败，请您稍后再试~~（错误信息${reason}）`)
            clearHandle();
        })
    })

    // 移除文件逻辑
    const clearHandle = () => {
        _file = null;  // 删除文件后置空复制的信息
        upload_tip.style.display = 'block';
        upload_list.style.display = 'none';
        upload_list.innerHTML = ``;  // 清除删除等标签
        upload_inp.value = null; // 清空文件对象中的文件
        console.log(upload_inp.files)
    };
    // 移除按钮的点击处理
    upload_list.addEventListener('click', function(ev) {  // 事件监听父元素
        // console.log(ev.target);  // 触发事件的标签
        let target = ev.target;
        if (target.tagName==="EM") {  // 判断点击的是否为子元素标签<em/>
            // 点击的是移除按钮
            clearHandle();
        }
    });
    
    // 监听用户选择文件的操作
    upload_inp.addEventListener('change', function() {
        // upload_inp.files 获取用户选中的文件对象（object）
        //  + name：文件名
        //  + size：文件大小
        //  + type：文件的MIME类型
        var file = upload_inp.files[0];  // 获取文件对象中的最新上传的文件
        if (!file) return; // 若没文件则返回
        console.log(file)

        // 限制文件上传的格式「方案一」
        // if (!/(PNG|JPG|JPEG)/i.test(file.type)) {
        //     alert('上传的文件只能是 PNG/JPG/JPEG 格式的~~');
        //     return
        // }

        // 限制文件上传的大小
        if (file.size > 2*1024*1024) {  // 2 bit * 1024(byte) * 1024(MB) = 2MB
            alert('上传的文件不能超过2MB~~');
            return;
        }

        _file = file;  // 复制一份上传文件

        // 显示上传的文件
        upload_tip.style.display = 'none';
        upload_list.style.display = 'block';
        upload_list.innerHTML = `
        <li>
            <span>文件：${file.name}</span>
            <span><em>移除</em></span>
        </li>`
        ;
    });

    //  点击选择文件按钮，触发上传文件INPUT框选择文件的行为
    upload_button_select.addEventListener('click', function() {
        upload_inp.click();
    })
})();
