import axios from 'axios'
const service = axios.create({
 baseURL:'https://mtjk.maitianlife.com/',
  timeout: 5000
}) // 创建一个axios的实例
service.interceptors.request.use(
  (config) => {
    // 获取本地存储中的 token
    const token = localStorage.getItem('token');
    if (token) {
      // 如果有 token，将其添加到请求头 Authorization 中
      config.headers.Authorization = `MT ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 响应拦截器
service.interceptors.response.use(
  (response) => {
  if(response.data.code === 1000) {
    localStorage.removeItem('token');  // 清除本地存储的 token
    }else{
      return response.data;
    }   
   
  },
  (error) => {
    // 响应错误处理
    if (error.response) {
      const { status } = error.response;
      // 如果未授权 (401) 或登录过期 (403)，跳转到登录页
      if (status === 1000 || status === 403) {
        localStorage.removeItem('token');  // 清除本地存储的 token
        // router.push({ path: '/login' });    // 跳转到登录页
      }
    }
    return Promise.reject(error);
  }
);
export default service // 导出axios实例