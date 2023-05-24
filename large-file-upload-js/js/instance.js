/* 把axios发送请求的公共信息进行提取 */
let instance = axios.create();  // 创建一个新的axios实例（避免与其他axios冲突）
instance.defaults.baseURL = 'http://127.0.0.1:8888';
instance.defaults.headers['Content-Type'] = 'multipart/form-data';  // 修改MIME类型的默认值，规定了form表单（上传文件）在发送到服务器时候编码方式
instance.defaults.transformRequest = (data, headers) => {  // 请求拦截修改
    const contentType = headers['Content-Type'];
    // if (contentType === 'application/json') return Qs.stringify(data); // 转换格式
    if (contentType === 'application/x-www-form-urlencoded') return Qs.stringify(data); // 转换格式
    return data
};
instance.interceptors.response.use(response => {
    return response.data;
}, reason => {
    // 统一做失败的提示处理即可
    // ...
    return Promise.reject(reason);
});