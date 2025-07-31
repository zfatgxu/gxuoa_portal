<template>
  <div class="login-page">
    <!-- 背景轮播图 -->
    <div class="login-bg-carousel">
      <div 
        v-for="(img, index) in carouselImages" 
        :key="index"
        class="carousel-item"
        :class="{ active: currentImageIndex === index }"
        :style="{ backgroundImage: `url(${img})` }">
      </div>
    </div>
    
    <!-- 背景遮罩 -->
    <div class="login-bg"></div>

    <!-- 顶部 -->
    <header class="login-header">
      <div class="header-content">
        <div class="university-logo">
          <img src="@/assets/imgs/gxdx.png" alt="广西大学" class="gxdx-img" />
        </div>
        <div class="divider"></div>
        <p class="platform-title">文件管理系统</p>
      </div>
    </header>

    <!-- 右侧登录区域 -->
    <div class="login-right">
      <div class="login-form-container">
        <div class="login-box">
          <div class="corner-decoration" @click="setLoginState(LoginStateEnum.QR_CODE)">
            <img src="@/assets/svgs/qrcode.svg" alt="二维码" class="qrcode-icon" />
          </div>
          <div class="login-tabs">
            <el-tabs v-model="activeTab" class="login-tab-component" @tab-click="handleTabClick">
              <el-tab-pane label="密码登录" name="account">
                <LoginForm v-show="getLoginState === LoginStateEnum.LOGIN" />
              </el-tab-pane>
              <el-tab-pane label="验证码登录" name="mobile">
                <MobileForm v-show="getLoginState === LoginStateEnum.MOBILE" />
              </el-tab-pane>
            </el-tabs>
          </div>
          
          <ForgetPasswordForm />
          <RegisterForm />
          
          <!-- 二维码登录组件 -->
          <QrCodeForm v-show="getLoginState === LoginStateEnum.QR_CODE" />
          
          <!-- <el-alert
            title="温馨提示"
            type="info"
            :closable="false"
            class="login-tips">
            <div class="tips-content">
              <p>1.用户名为“学工号/学号”，首次登录密码显示密码错误的，请点击重置密码重置方法。</p>
              <p>2.建议浏览器：
                <el-tag size="small" type="warning" class="browser-tag">火狐</el-tag>
                <el-tag size="small" type="success">谷歌</el-tag>
              </p>
            </div>
          </el-alert> -->
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="login-footer">
      <p>广西大学 版权所有 Copyright 2025 </p>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { LoginForm, MobileForm, ForgetPasswordForm, QrCodeForm, RegisterForm } from './components'
import { LoginStateEnum, useLoginState } from './components/useLogin'

// 导入轮播图图片
import bg1 from '@/assets/imgs/bg/cycle/bg1.jpg'
import bg2 from '@/assets/imgs/bg/cycle/bg2.png'
import bg3 from '@/assets/imgs/bg/cycle/bg3.jpg'
import bg4 from '@/assets/imgs/bg/cycle/bg4.jpg'
import bg5 from '@/assets/imgs/bg/cycle/bg5.jpg'
import bg6 from '@/assets/imgs/bg/cycle/bg6.jpg'

defineOptions({ name: 'Login' })
const { setLoginState, getLoginState } = useLoginState()
const activeTab = ref('account')

// 轮播图相关变量
const carouselImages = [bg1, bg2, bg3, bg4, bg5, bg6]
const currentImageIndex = ref(0)
let carouselInterval: number | null = null

// 初始化轮播图
const startCarousel = () => {
  carouselInterval = window.setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % carouselImages.length
  }, 5000)
}

onMounted(() => {
  startCarousel()
})

onBeforeUnmount(() => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
  }
})

// 处理标签页切换
const handleTabClick = (tab) => {
  if (tab.props.name === 'account') {
    setLoginState(LoginStateEnum.LOGIN)
  } else if (tab.props.name === 'mobile') {
    setLoginState(LoginStateEnum.MOBILE)
  }
}
</script>

<style lang="scss" scoped>
/* 登录页专用变量，只在登录页生效 */
.login-page {
  --login-primary-color: #0061B1;
  --login-primary-light: #3384c5;
  --login-primary-dark: #004e8f;
  
  /* 登录页按钮样式覆盖 */
  :deep(.el-button--primary) {
    --el-button-bg-color: var(--login-primary-color) !important;
    --el-button-border-color: var(--login-primary-color) !important;
    --el-button-hover-bg-color: var(--login-primary-light) !important;
    --el-button-hover-border-color: var(--login-primary-light) !important;
    --el-button-active-bg-color: var(--login-primary-dark) !important;
    --el-button-active-border-color: var(--login-primary-dark) !important;
  }
  
  /* 登录页链接样式覆盖 */
  :deep(.el-link.el-link--primary) {
    --el-link-text-color: var(--login-primary-color) !important;
    --el-link-hover-text-color: var(--login-primary-light) !important;
  }
  
  /* 登录页复选框样式覆盖 */
  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: var(--login-primary-color) !important;
    border-color: var(--login-primary-color) !important;
  }
}

/* 全局覆盖Element Plus标签样式 */
.el-tabs__item {
  font-size: 20px !important;
}

/* login page */
.login-page {
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #fff;
}

/* 背景轮播图 */
.login-bg-carousel {
  position: absolute;
  left: 0;
  top: 0;
  width: 70%;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
}

/* 轮播图项 */
.carousel-item {
  position: absolute;
  left: 2%;
  top: 15%;
  width: 90%;
  height: 70%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1s ease;
}

.carousel-item.active {
  opacity: 1;
}

/* background */
.login-bg {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/imgs/bg/mask.png') no-repeat center;
  background-size: cover;
  opacity: 1;
  z-index: 1;
}

/* 右侧区域 */
.login-right {
  position: absolute;
  right: 0;
  top: 0;
  width: 35%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 顶部遮罩 */
.login-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background-color: #0061B1;
  z-index: -1;
}

/* 顶部遮罩图片 */
.login-header::after {
  content: '';
  position: absolute;
  top: 0;
  right: 2%;
  width: 28%;
  height: 80px;
  background-image: url('@/assets/imgs/bg/headerbg.png');
  background-position: right center;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.5;
  mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%);
  -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%);
  z-index: -1;
}

/* 底部遮罩 */
.login-page::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #0061B1;
  pointer-events: none;
  z-index: 1;
}

/* 头部样式 */
.login-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  padding: 0 40px;
  z-index: 10;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.university-logo {
  margin-right: 25px;
  display: flex;
  align-items: center;
}

.gxdx-img {
  height: 70px;
  display: block;
}

.divider {
  width: 2px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.6);
  margin: 0 25px;
  align-self: center;
}

.platform-title {
  font-family: '华文行楷', sans-serif;
  color: white;
  font-size: 40px;
  font-weight: 500;
  letter-spacing: 1px;
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

@media (max-width: 1200px) {
  .login-form-container {
    right: 100px;
  }
}

@media (max-width: 992px) {
  .login-bg {
    width: 100%;
    opacity: 0.8;
  }
  
  .login-form-container {
    right: 50%;
    transform: translate(50%, -50%);
  }
}

@media (max-width: 768px) {
  .login-header {
    padding: 15px;
    height: 50px;
  }
  
  .gxdx-img {
    height: 30px;
  }
  
  .platform-title {
    font-size: 20px;
  }
  
  .login-form-container {
    width: 90%;
    max-width: 360px;
  }
  
  .login-box {
    width: 100%;
    padding: 20px;
  }
  
  .bottom-icons {
    bottom: 15px;
    right: 15px;
    gap: 10px;
  }
  
  .icon-item {
    width: 35px;
    height: 35px;
  }
  
  .icon-item .el-icon {
    font-size: 18px;
  }
}

/* 登录表单容器 */
.login-form-container {
  width: 100%;
  max-width: 550px;
  padding: 0 20px;
  z-index: 10;
}

.login-box {
  position: relative;
  width: 100%;
  padding: 20px 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.corner-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-top-right-radius: 8px;
  cursor: pointer;
  background-color: rgba(0, 120, 212, 0.05);
}

.corner-decoration::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #fff 50%, transparent 50%);
  z-index: 1;
}

.qrcode-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 60px;
  height: 60px;
  z-index: 0;
  opacity: 0.8;
}

/* 登录选项卡 */
.login-tabs {
  margin-bottom: 20px;
}

/* 标签文字大小 */
.login-tab-component :deep(.el-tabs__item) {
  font-size: 20px;
}

:deep(.demo-tabs .el-tabs__item) {
  font-size: 16px;
  padding: 0 15px 15px;
  color: #606266;
}

:deep(.demo-tabs .el-tabs__item.is-active) {
  color: #0078d4;
  font-weight: 500;
}

:deep(.demo-tabs .el-tabs__active-bar) {
  background-color: #0078d4;
  height: 3px;
}

:deep(.demo-tabs .el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e4e7ed;
}

/* 表单样式 */
.login-form {
  margin-top: 15px;
}

/* 表单元素样式 */
:deep(.login-form .el-input__wrapper) {
  padding: 1px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.2s;
}

:deep(.login-form .el-input__wrapper:hover) {
  border-color: #0078d4;
}

:deep(.login-form .el-input__wrapper.is-focus) {
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
}

:deep(.login-form .el-input__inner) {
  font-size: 14px;
  height: 38px;
  color: #606266;
}

:deep(.login-form .el-checkbox__label) {
  font-size: 14px;
  color: #606266;
}

:deep(.login-form .el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #0078d4;
  border-color: #0078d4;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
}

.login-btn {
  width: 100%;
  height: 40px !important;
  font-size: 16px !important;
  font-weight: 500;
  background-color: #0078d4 !important;
  border-color: #0078d4 !important;
  transition: all 0.3s;
}

.login-btn:hover {
  background-color: #106ebe !important;
  border-color: #106ebe !important;
}

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-input {
  flex-grow: 1;
}

/* 底部图标 */
.bottom-icons {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  gap: 12px;
  z-index: 10;
}

.icon-item {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.icon-item:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.icon-item .el-icon {
  font-size: 18px;
  color: white;
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
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  color: white;
  padding: 18px;
  z-index: 10;
  font-size: 14px;
  text-align: center;
  font-weight: normal;
  letter-spacing: 0.5px;
}

.login-footer p {
  margin: 0;
}

/* Element Plus组件样式覆盖 */
:deep(.login-tabs .el-tabs__header) {
  margin: 0;
  border-bottom: none;
}

:deep(.login-tabs .el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.login-tabs .el-tabs__active-bar) {
  background-color: var(--login-primary-color) !important;
  height: 3px;
}

:deep(.login-tabs .el-tabs__item) {
  font-size: 16px;
  color: #606266;
  padding: 0 32px 12px;
}

:deep(.login-tabs .el-tabs__item.is-active) {
  color: var(--login-primary-color) !important;
  font-weight: 500;
}

:deep(.login-tabs .el-tabs__item:hover) {
  color: var(--login-primary-color) !important;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .login-form-container {
    right: 100px;
  }
  
  .login-bg-carousel {
    width: 70%;
  }
  
  .carousel-item {
    left: 5%;
    top: 15%;
    width: 80%;
    height: 70%;
  }
}

@media (max-width: 992px) {
  .login-bg {
    width: 100%;
    opacity: 0.8;
  }
  
  .login-right {
    position: absolute;
    right: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .login-form-container {
    position: relative;
    right: auto;
    top: 25%;
    transform: translateY(-50%);
  }
  
  .login-bg-carousel {
    width: 100%;
    z-index: -1;
  }
  
  .carousel-item {
    left: 10%;
    top: 15%;
    width: 80%;
    height: 70%;
  }
}

@media (max-width: 768px) {
  .login-bg-carousel {
    width: 100%;
  }
  
  .carousel-item {
    left: 0;
    top: 10%;
    width: 100%;
    height: 80%;
  }
}

@media (max-width: 768px) {
  .login-header {
    padding: 15px;
    height: 50px;
  }
  
  .gxdx-img {
    height: 30px;
  }
  
  .platform-title {
    font-size: 20px;
  }
  
  .login-form-container {
    width: 90%;
    max-width: 360px;
  }
  
  .login-box {
    width: 100%;
    padding: 20px;
  }
  
  .bottom-icons {
    bottom: 15px;
    right: 15px;
    gap: 10px;
  }
  
  .icon-item {
    width: 35px;
    height: 35px;
  }
  
  .icon-item .el-icon {
    font-size: 18px;
  }
  
  .login-footer {
    padding: 15px;
    font-size: 12px;
  }
}
</style>