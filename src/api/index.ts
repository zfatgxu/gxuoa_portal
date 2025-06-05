import axios from 'axios';

// 创建一个事件总线，用于跨组件通信
export const apiEvents = {
  // 自定义事件列表
  AUTH_ERROR: 'auth-error',
  // 触发事件的方法
  emit(event, ...args) {
    window.dispatchEvent(new CustomEvent(event, { detail: args }));
  },
  // 监听事件的方法
  on(event, callback) {
    const listener = (e) => callback(...(e.detail || []));
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }
};

// 创建axios实例
const api = axios.create({
  // 使用相对路径，由Vue CLI的代理处理
  baseURL: '/app-api', // 恢复/api前缀，
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('发送请求：', config.url);
    
    try {
      // 强制从浏览器存储中获取最新的token
      const token = localStorage.getItem('token');
      console.log('当前令牌：', token);
      
      if (token) {
        // 检查token是否过期
        const tokenExpiresTime = localStorage.getItem('tokenExpiresTime');
        if (tokenExpiresTime) {
          const expiresTime = parseInt(tokenExpiresTime);
          const now = Date.now();
          console.log('令牌过期时间：', new Date(expiresTime).toLocaleString(), '当前时间：', new Date(now).toLocaleString());
  
          // 如果token已过期，清除所有令牌并触发认证错误事件
          if (now >= expiresTime) {
            console.log('令牌已过期，需要重新登录');
            
            // 清除所有令牌和认证相关数据
            localStorage.removeItem('token');
            localStorage.removeItem('tokenExpiresTime');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('ACCESS_TOKEN');
            localStorage.removeItem('REFRESH_TOKEN');
            
            // 清除可能存在的会话存储
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            
            // 删除可能存在的cookie
            document.cookie.split(";").forEach(function(c) {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            console.log('所有令牌和登录状态已清除');
            
            // 立即触发认证错误事件
            apiEvents.emit(apiEvents.AUTH_ERROR, { message: '登录已过期，请重新登录' });
            // 立即重定向到登录页
            window.location.href = '/';
  
            return Promise.reject(new Error('登录已过期，请重新登录'));
          }
        }
  
        // 确俜token格式正确（Bearer + 空格 + token）
        if (!config.headers) {
          config.headers = {};
        }
        
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('添加认证头：', config.headers['Authorization']);
      } else {
        console.log('未找到令牌，发送未认证请求');
      }
    } catch (error) {
      console.error('在请求拦截器中处理令牌时出错：', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('请求错误:', error);

    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      console.log('检测到401错误，可能是token无效或已过期');

      // 清除所有令牌和认证相关数据
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiresTime');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('REFRESH_TOKEN');
      
      // 清除可能存在的会话存储
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // 删除可能存在的cookie
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      console.log('所有令牌和登录状态已清除');

      // 触发认证错误事件，通知需要重新登录
      apiEvents.emit(apiEvents.AUTH_ERROR, error.response.data);
      
      // 立即重定向到登录页
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default api;
