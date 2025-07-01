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
        <!-- 账号登录表单 -->
        <LoginForm />
        <!-- 手机登录表单 -->
        <MobileForm v-show="getLoginState === LoginStateEnum.MOBILE" />
        <!-- 提示信息 -->
        <el-alert
          title="温馨提示"
          type="info"
          :closable="false"
          class="login-tips">
          <div class="tips-content">
            <p>1.用户名为"学工号/学号"，首次登录密码显示密码错误的，请点击重置密码重置方法。</p>
            <p>2.建议浏览器：
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

<script lang="ts" setup>
import { ref } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { ThemeSwitch } from '@/layout/components/ThemeSwitch'
import { LocaleDropdown } from '@/layout/components/LocaleDropdown'

import { LoginForm, MobileForm, QrCodeForm, RegisterForm, SSOLoginVue, ForgetPasswordForm } from './components'
import { LoginStateEnum, useLoginState } from './components/useLogin'

defineOptions({ name: 'Login' })

const { t } = useI18n()
const appStore = useAppStore()
const { getLoginState } = useLoginState()

// Active tab
const activeTab = ref('account')

// 社交登录方法
const socialLogin = (type) => {
  const typeMap = {
    qq: 'QQ',
    wechat: '微信',
    'work-wechat': '企业微信'
  }
  ElMessage.warning(`${typeMap[type]}登录功能演示`)
}
</script>

<style>
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