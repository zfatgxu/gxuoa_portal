<template>
  <div class="login-page">
    <!-- 背景 -->
    <div class="login-bg"></div>

    <!-- 顶部 -->
    <header class="login-header">
      <div class="header-content">
        <div class="university-logo">
          <img src="@/assets/imgs/gxdx.png" alt="广西大学" class="gxdx-img" />
        </div>
        <div class="divider"></div>
        <p class="platform-title">文件管理平台</p>
      </div>
    </header>

    <!-- 登录表单容器 -->
    <div class="login-form-container">
      <div class="login-box">
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane label="账号登录" name="account">
            <!-- 账号登录表单 -->
            <el-form 
              ref="accountFormRef"
              :model="accountForm" 
              :rules="accountRules"
              @submit.prevent="handleAccountLogin"
              class="login-form">
              
              <el-form-item prop="username">
                <el-input
                  v-model="accountForm.username"
                  placeholder="用户名"
                  size="large"
                  :prefix-icon="User"
                  @keyup.enter="handleAccountLogin">
                </el-input>
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="accountForm.password"
                  type="password"
                  placeholder="密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleAccountLogin">
                </el-input>
              </el-form-item>

              <div class="form-options">
                <el-checkbox v-model="accountForm.remember">记住密码</el-checkbox>
                <el-link type="primary" :underline="false">忘记密码?</el-link>
              </div>

              <el-form-item>
                <el-button 
                  type="danger" 
                  size="large" 
                  class="login-btn"
                  :loading="loginLoading"
                  @click="handleAccountLogin">
                  账号登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="短信登录" name="sms">
            <!-- 短信登录表单 -->
            <el-form 
              ref="smsFormRef"
              :model="smsForm" 
              :rules="smsRules"
              @submit.prevent="handleSmsLogin"
              class="login-form">
              
              <el-form-item prop="mobile">
                <el-input
                  v-model="smsForm.mobile"
                  placeholder="手机号码"
                  size="large"
                  :prefix-icon="Phone"
                  @keyup.enter="handleSmsLogin">
                </el-input>
              </el-form-item>

              <el-form-item prop="code">
                <div class="code-input-group">
                  <el-input
                    v-model="smsForm.code"
                    placeholder="验证码"
                    size="large"
                    :prefix-icon="Message"
                    class="code-input"
                    @keyup.enter="handleSmsLogin">
                  </el-input>
                  <el-button 
                    :disabled="smsCountdown > 0"
                    @click="sendSmsCode"
                    size="large">
                    {{ smsCountdown > 0 ? `${smsCountdown}s` : '发送验证码' }}
                  </el-button>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button 
                  type="danger" 
                  size="large" 
                  class="login-btn"
                  :loading="loginLoading"
                  @click="handleSmsLogin">
                  短信登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <!-- 社交登录 -->
        <div class="social-login">
          <div class="social-buttons">
            <el-button type="primary" circle @click="socialLogin('qq')">
              <span style="font-size: 16px;">🐧</span>
            </el-button>
            <el-button type="success" circle @click="socialLogin('wechat')">
              <span style="font-size: 16px;">💬</span>
            </el-button>
            <el-button type="info" circle @click="socialLogin('work-wechat')">
              <span style="font-size: 16px;">🏢</span>
            </el-button>
          </div>
          <div class="social-labels">
            <span>QQ登录</span>
            <span>微信登录</span>
            <span>企业微信</span>
          </div>
        </div>

        <!-- 提示信息 -->
        <el-alert
          title="温馨提示"
          type="info"
          :closable="false"
          class="login-tips">
          <div class="tips-content">
            <p>1.用户名为"学工号/学号"，首次登录密码显示密码错误的，请点击重置密码重置方法。</p>
            <p>2.建议浏览器：
              <el-tag size="small" class="browser-tag">IE10+</el-tag>
              <el-tag size="small" type="warning" class="browser-tag">火狐</el-tag>
              <el-tag size="small" type="success">谷歌</el-tag>
            </p>
          </div>
        </el-alert>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="login-footer">
      <p>广西大学 版权所有 Copyright 2025 </p>
      <p>服务邮箱：</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Phone, Message } from '@element-plus/icons-vue'
import { login, smsLogin, sendSmsCode as apiSendSmsCode ,getPermissions} from '@/api/login'
import { setToken, setLoginForm, removeLoginForm, getLoginForm } from '@/utils/auth'
import { useUserStore } from '@/store/modules/user'
import { useMessage } from '@/hooks/web/useMessage'

// 导入Element Plus样式
import 'element-plus/dist/index.css'

// 路由实例
const router = useRouter()
// 消息提示
const message = useMessage()

// Active tab
const activeTab = ref('account')
const loginLoading = ref(false)
const accountFormRef = ref()
const smsFormRef = ref()
const smsCountdown = ref(0)

// 表单数据
const accountForm = reactive({
  username: '', // 用户名
  password: '',
  remember: false
})

const smsForm = reactive({
  mobile: '', // 手机号码
  code: ''
})

// 验证规则
const accountRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, message: '密码长度不能少于 5 个字符', trigger: 'blur' }
  ]
}

const smsRules = {
  mobile: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 账号登录方法
const handleAccountLogin = async () => {
  if (!accountFormRef.value) return
  
  try {
    // 表单验证
    const valid = await accountFormRef.value.validate()
      .then(() => true)
      .catch(err => {
        console.error('表单验证失败:', err)
        return false
      })
    
    // 如果验证失败，不继续执行
    if (!valid) {
      message.error('请正确填写用户名和密码')
      return
    }
    
    loginLoading.value = true
    
    // 调用后端API
    try {
      const res = await login({
        username: accountForm.username,
        password: accountForm.password
      })
      
      // 处理响应
      console.log('登录响应：', res)
      
      // 检查是否有错误信息
      if (res.code !== 0) {
        // 登录失败，显示错误信息
        message.error(res.msg || '登录失败，账号密码不正确')
        return
      }
      
      // 登录成功
      if (res.data && res.data.accessToken) {
        const token = {
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken
        }
        
        // 存储令牌
        setToken(token)
        
        // 设置令牌过期时间
        if (res.data.expiresTime) {
          localStorage.setItem('tokenExpiresTime', res.data.expiresTime.toString())
        }
        
        // 如果勾选了记住密码，将用户名和密码保存到登录表单缓存
        if (accountForm.remember) {
          // 使用加密方式保存登录表单
          setLoginForm({
            tenantName: '',
            username: accountForm.username,
            password: accountForm.password,
            rememberMe: true
          })
          console.log('已保存用户名和密码')
        } else {
          // 如果取消勾选，删除保存的登录表单
          removeLoginForm()
          console.log('已清除保存的用户名和密码')
        }
        
        // 打印存储的令牌信息
        console.log('已存储令牌：', localStorage.getItem('token'))
        
        // 设置登录状态
        localStorage.setItem('isLoggedIn', 'true')
        
        // 获取用户信息并存储到状态管理中
        const userStore = useUserStore()
        await userStore.setUserInfoAction()
        
        // 提示成功
        message.success('登录成功！')

         // 查询用户权限
         try {
          console.log('正在查询用户权限...')
          const permissionRes = await getPermissions()
          if (permissionRes.code === 0 && permissionRes.data) {
            // 存储用户权限
            localStorage.setItem('userPermissions', JSON.stringify(permissionRes.data))
            console.log('用户权限查询成功：', permissionRes.data)
          } else {
            console.error('用户权限查询失败：', permissionRes)
          }
        } catch (permError) {
          console.error('查询用户权限出错：', permError)
        }
        
        // 跳转到首页
        console.log('准备跳转到首页...')
        router.push('/home')
      } else {
        // 登录失败
        message.error(res.msg || '登录失败，请检查用户名和密码')
      }
    } catch (error) {
      // 处理API调用错误
      message.error('登录失败，网络错误')
      console.error('Login API error:', error)
    } finally {
      loginLoading.value = false
    }
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 页面加载时检查是否有已保存的用户名和密码
onMounted(() => {
  console.log('检查是否有已保存的登录信息')
  
  // 使用新的认证工具获取记住的登录信息
  const loginForm = getLoginForm()
  
  if (loginForm && loginForm.rememberMe) {
    try {
      // 填充用户名和密码
      accountForm.username = loginForm.username
      accountForm.password = loginForm.password
      // 设置记住密码勾选状态
      accountForm.remember = true
      
      console.log('已自动填充保存的用户名和密码')
    } catch (error) {
      console.error('获取登录表单出错:', error)
      // 如果出错，清除存储的信息
      removeLoginForm()
    }
  }
  
  // 兼容旧版本的记住密码方式，如果有旧版本的数据，进行迁移
  const rememberedUsername = localStorage.getItem('rememberedUsername')
  const rememberedPassword = localStorage.getItem('rememberedPassword')
  const rememberPassword = localStorage.getItem('rememberPassword') === 'true'
  
  if (rememberPassword && rememberedUsername && rememberedPassword && !loginForm) {
    try {
      // 填充用户名
      accountForm.username = rememberedUsername
      // 解密并填充密码
      accountForm.password = window.atob(rememberedPassword)
      // 设置记住密码勾选状态
      accountForm.remember = true
      
      // 迁移到新的存储方式
      setLoginForm({
        tenantName: '',
        username: rememberedUsername,
        password: window.atob(rememberedPassword),
        rememberMe: true
      })
      
      // 清除旧的存储
      localStorage.removeItem('rememberedUsername')
      localStorage.removeItem('rememberedPassword')
      localStorage.removeItem('rememberPassword')
      
      console.log('已将旧版本的登录信息迁移到新版本')
    } catch (error) {
      console.error('迁移旧版本登录信息出错:', error)
      // 如果出错，清除存储的信息
      localStorage.removeItem('rememberedUsername')
      localStorage.removeItem('rememberedPassword')
      localStorage.removeItem('rememberPassword')
    }
  }
})

// 短信登录方法
const handleSmsLogin = async () => {
  if (!smsFormRef.value) return
  
  try {
    // 表单验证
    const valid = await smsFormRef.value.validate()
      .then(() => true)
      .catch(err => {
        console.error('短信登录表单验证失败:', err)
        return false
      })
    
    // 如果验证失败，不继续执行
    if (!valid) {
      message.error('请正确填写手机号和验证码')
      return
    }
    
    loginLoading.value = true
    
    // 调用后端API
    try {
      const res = await smsLogin({
        mobile: smsForm.mobile,
        code: smsForm.code
      })
      
      // 处理响应
      console.log('短信登录响应：', res)
      
      // 检查是否有错误信息
      if (res.code !== 0) {
        // 登录失败，显示错误信息
        message.error(res.msg || '登录失败，请检查手机号和验证码')
        return
      }
      
      // 登录成功
      if (res.data && res.data.accessToken) {
        const token = {
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken
        }
        // 存储令牌
        setToken(token)
        
        // 提示成功
        message.success('登录成功！')
        
        // 跳转到首页
        router.push('/home')
      }
    } catch (error) {
      // 处理API调用错误
      message.error('登录失败，网络错误')
      console.error('短信登录API错误:', error)
    } finally {
      loginLoading.value = false
    }
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 发送短信验证码方法
const sendSmsCode = async () => {
  // 验证手机号
  if (!smsForm.mobile || !/^1[3-9]\d{9}$/.test(smsForm.mobile)) {
    message.error('请输入正确的手机号码')
    return
  }
  
  try {
    // 调用发送验证码API
    const res = await sendSmsCode(smsForm.mobile)
    
    if (res.code === 0) {
      // 发送成功，开始倒计时
      smsCountdown.value = 60
      const timer = setInterval(() => {
        smsCountdown.value--
        if (smsCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
      
      message.success('验证码已发送，请注意查收')
    } else {
      // 发送失败
      message.error(res.msg || '验证码发送失败')
    }
  } catch (error) {
    // 处理API调用错误
    message.error('验证码发送失败，网络错误')
    console.error('发送验证码API错误:', error)
  }
}

const socialLogin = (type) => {
  const typeMap = {
    qq: 'QQ',
    wechat: '微信',
    'work-wechat': '企业微信'
  }
  message.warning(`${typeMap[type]}登录功能演示`)
}
</script>

<style >
/* 登录页面整体样式 */
.login-page {
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* 背景样式 */
.login-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url('@/assets/imgs/login-bg.png') center/cover;
}

/* 头部样式 */
.login-header {
  position: relative;
  padding: 40px 60px;
  z-index: 10;
  margin-left: 100px; /* 向右移动 */
}

.header-content {
  display: flex;
  align-items: center;
}

.university-logo {
  margin-right: 25px;
}

.gxdx-img {
  height: 120px; /* 增大图片尺寸 */
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.5));
}

.divider {
  width: 3px; /* 增加宽度 */
  height: 70px; /* 进一步增加高度 */
  background-color: white; /* 改为纯白色，增强对比度 */
  margin: 0 30px; /* 增加间距 */
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); /* 添加发光效果 */
  border-radius: 1.5px; /* 添加圆角 */
}

.platform-title {
  font-size: 50px; /* 进一步增大字体 */
  margin: 0;
  font-weight: 600; /* 增加字重 */
  letter-spacing: 2px; /* 增加字间距 */
  color: white; /* 文字颜色保持白色 */
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.4); /* 增强发光效果 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .login-header {
    padding: 20px;
    margin-left: 0; /* 移动端不需要左边距 */
    text-align: center; /* 居中显示 */
  }
  
  .header-content {
    flex-direction: column; /* 在移动端上垂直排列 */
    align-items: center;
  }
  
  .university-logo {
    margin-right: 0;
    margin-bottom: 15px; /* 添加底部间距 */
  }
  
  .gxdx-img {
    height: 80px; /* 移动端上缩小图片 */
  }
  
  .divider {
    width: 80%; /* 在移动端上变为水平分隔线 */
    height: 2px;
    margin: 15px 0; /* 上下间距 */
  }
  
  .platform-title {
    font-size: 30px; /* 移动端上缩小字体 */
  }
}

/* 登录表单容器 */
.login-form-container {
  position: absolute;
  right: 250px;
  left: auto;
  top: 150px;
  transform: none;
  z-index: 10;
}

.login-box {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 40px; /* 增加内边距 */
  width: 550px; /* 增大宽度 */
}

/* 表单样式 */
.login-form {
  margin-top: 20px; /* 增加上边距 */
}

/* 增大表单元素尺寸 */
:deep(.login-form .el-input__wrapper) {
  padding: 4px 15px; /* 增加输入框内边距 */
}

:deep(.login-form .el-input__inner) {
  font-size: 16px; /* 增大输入框字体 */
  height: 48px; /* 增加输入框高度 */
}

:deep(.login-form .el-checkbox__label) {
  font-size: 16px; /* 增大复选框文字大小 */
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.login-btn {
  width: 100%;
  height: 50px !important; /* 增大按钮高度 */
  font-size: 18px !important; /* 增大按钮文字 */
  font-weight: bold; /* 加粗文字 */
}

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-input {
  flex-grow: 1;
}

/* 社交登录 */
.social-login {
  text-align: center;
  margin-top: 20px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
}

.social-labels {
  display: flex;
  justify-content: center;
  gap: 15px;
  font-size: 12px;
  color: #909399;
}

/* 提示信息 */
.login-tips {
  margin-top: 20px;
}

.tips-content {
  font-size: 12px;
  color: #909399;
}

.tips-content p {
  margin-bottom: 5px;
}

.browser-tag {
  margin-right: 5px;
}

.warning-text {
  color: var(--el-color-danger);
}

/* 页脚 */
.login-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  color: white;
  padding: 25px; /* 保持内边距 */
  z-index: 10;
  font-size: 18px; /* 保持字体大小 */
  opacity: 1; /* 保持不透明度 */
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); /* 保持发光效果 */
  font-weight: 500; /* 保持字重 */
  letter-spacing: 1px; /* 保持字间距 */
}

.login-footer p {
  margin: 0 0 8px 0; /* 保持段落间距 */
  text-align: left; /* 文字左对齐 */
}

/* Element Plus组件样式覆盖 */
:deep(.login-tabs .el-tabs__header) {
  margin: 0;
}

:deep(.login-tabs .el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.login-tabs .el-tabs__active-bar) {
  background-color: #dc3545;
}

:deep(.login-tabs .el-tabs__item.is-active) {
  color: #dc3545;
}

:deep(.login-tabs .el-tabs__item:hover) {
  color: #dc3545;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .login-form-container {
    position: relative;
    right: auto;
    top: auto;
    transform: none;
    margin: 30px auto;
    max-width: 90%;
  }
  
  .login-box {
    width: 100%;
  }
}
</style>