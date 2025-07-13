<template>
    <div class="email-container">
      <!-- Header -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="mail-icon"><Message /></el-icon>
          <span class="title">内部邮</span>
        </div>
        <div class="header-right">
          <el-input
            v-model="searchText"
            placeholder="搜索"
            class="search-input"
            :prefix-icon="Search"
          />
        </div>
      </el-header>
  
      <el-container class="main-container">
        <!-- Left Sidebar -->
        <el-aside width="200px" class="sidebar">
          <div class="compose-section">
            <el-button type="primary" class="compose-btn" @click="handleCompose">
              <el-icon><Edit /></el-icon>
              写信
            </el-button>
            <el-button class="inbox-btn" @click="handleInbox">
              <el-icon><Box /></el-icon>
              收信
            </el-button>
          </div>
  
          <el-menu
            default-active="drafts"
            class="sidebar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="drafts">
              <el-icon><Document /></el-icon>
              <span>草稿</span>
            </el-menu-item>
            <el-menu-item index="inbox">
              <el-icon><Folder /></el-icon>
              <span>收件箱(1)</span>
            </el-menu-item>
            <el-menu-item index="starred">
              <el-icon><Star /></el-icon>
              <span>星标邮件</span>
            </el-menu-item>
            <el-menu-item index="sent">
              <el-icon><Promotion /></el-icon>
              <span>已发送</span>
            </el-menu-item>
            <el-menu-item index="draft-box">
              <el-icon><Document /></el-icon>
              <span>草稿箱(4)</span>
            </el-menu-item>
            <el-menu-item index="deleted">
              <el-icon><Delete /></el-icon>
              <span>已删除</span>
            </el-menu-item>
            <el-menu-item index="trash">
              <el-icon><Delete /></el-icon>
              <span>垃圾箱(8)</span>
            </el-menu-item>
            <el-menu-item index="my-folders">
              <el-icon><FolderOpened /></el-icon>
              <span>我的文件夹</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
  
        <!-- Main Content -->
        <el-main class="main-content">
          <!-- Toolbar -->
          <div class="toolbar">
            <div class="toolbar-left">
              <el-button type="warning" :icon="Promotion">发送</el-button>
              <el-button :icon="View">预览</el-button>
              <el-button :icon="Paperclip">附件</el-button>
              <el-button>超大附件</el-button>
              <el-button>发信设置</el-button>
            </div>
            <div class="toolbar-right">
              <span class="draft-info">已于 17: 00 保存至草稿</span>
              <el-icon class="minimize-icon"><Minus /></el-icon>
              <el-icon class="close-icon"><Close /></el-icon>
            </div>
          </div>
  
          <!-- Email Form -->
          <div class="email-form">
            <div class="form-row">
              <label class="form-label">收件人：</label>
              <el-input
                v-model="emailForm.recipients"
                class="form-input"
                placeholder=""
              />
              <div class="recipient-actions">
                <el-button text>抄送</el-button>
                <el-button text>密送</el-button>
                <el-button text>分别发送</el-button>
              </div>
            </div>
  
            <div class="form-row">
              <label class="form-label">主题：</label>
              <el-input
                v-model="emailForm.subject"
                class="form-input"
                placeholder=""
              />
            </div>
  
            <!-- Rich Text Editor Toolbar -->
            <div class="editor-toolbar">
              <div class="toolbar-group">
                <el-button text :icon="RefreshLeft" />
                <el-button text :icon="RefreshRight" />
                <el-button text :icon="Picture" />
                <el-button text>图片</el-button>
                <el-button text :icon="Plus" />
                <el-button text>插入</el-button>
                <el-button text :icon="Document" />
                <el-button text>导入文档</el-button>
                <el-button text :icon="Calendar" />
                <el-button text>日程</el-button>
                <el-button text :icon="Clock" />
                <el-button text>表情</el-button>
                <el-button text class="format-btn">Aa</el-button>
                <el-button text>格式</el-button>
              </div>
            </div>
  
            <div class="format-toolbar">
              <div class="format-group">
                <el-button text :icon="Brush" />
                <el-button text :icon="Crop" />
                <el-select v-model="fontFamily" placeholder="默认字体" size="small" style="width: 100px;">
                  <el-option label="默认字体" value="default" />
                </el-select>
                <el-select v-model="fontSize" placeholder="字号" size="small" style="width: 80px;">
                  <el-option label="字号" value="default" />
                </el-select>
                <el-button text><strong>B</strong></el-button>
                <el-button text><em>I</em></el-button>
                <el-button text><u>U</u></el-button>
                <el-button text><s>S</s></el-button>
                <el-button text>A</el-button>
                <el-button text :icon="Edit" />
              </div>
              <div class="format-group">
                <el-button text :icon="List" />
                <el-button text :icon="List" />
                <el-button text :icon="Sort" />
                <el-button text :icon="SortUp" />
                <el-button text :icon="SortDown" />
                <el-button text :icon="Menu" />
                <el-button text>引用</el-button>
                <el-button text>代码</el-button>
              </div>
            </div>
  
            <!-- Email Content -->
            <div class="email-content">
              <el-input
                v-model="emailForm.content"
                type="textarea"
                placeholder="输入正文"
                :rows="15"
                class="content-textarea"
              />
            </div>
  
            <!-- Sender Info -->
            <div class="sender-info">
              <span class="sender-label">发件人：</span>
              <span class="sender-name">管理员</span>
            </div>
          </div>
        </el-main>
  
        <!-- Right Sidebar -->
        <el-aside width="300px" class="right-sidebar">
          <div class="contact-search">
            <el-input
              v-model="contactSearch"
              placeholder="搜索联系人"
              :prefix-icon="Search"
              size="small"
            />
          </div>
          
          <div class="contact-sections">
            <div class="contact-section">
              <div class="section-header">
                <el-icon><User /></el-icon>
                <span>最近联系人</span>
              </div>
            </div>
            
            <div class="contact-section">
              <div class="section-header">
                <el-icon><Star /></el-icon>
                <span>星标联系人</span>
              </div>
            </div>
          </div>
        </el-aside>
      </el-container>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import {
    Message,
    Search,
    Edit,
    Box, // 替换 Inbox
    Document,
    Folder,
    Star,
    Promotion,
    Delete,
    FolderOpened,
    View,
    Paperclip,
    Minus,
    Close,
    RefreshLeft,
    RefreshRight,
    Picture,
    Plus,
    Calendar,
    Clock,
    Brush,
    Crop,
    List,
    Sort,
    SortUp,
    SortDown,
    Menu,
    User
  } from '@element-plus/icons-vue'
  
  const searchText = ref('')
  const contactSearch = ref('')
  const fontFamily = ref('default')
  const fontSize = ref('default')
  
  const emailForm = ref({
    recipients: '',
    subject: '',
    content: ''
  })
  
  const handleCompose = () => {
    console.log('Compose email')
  }
  
  const handleInbox = () => {
    console.log('Go to inbox')
  }
  
  const handleMenuSelect = (index) => {
    console.log('Menu selected:', index)
  }
  </script>
  
  <style scoped>
  .email-container {
    height: 100vh;
    background-color: #f5f7fa;
  }
  
  .header {
    background: white;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 60px;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .mail-icon {
    color: #409eff;
    font-size: 24px;
  }
  
  .title {
    font-size: 24px;
    font-weight: bold;
    color: #409eff;
  }
  
  .search-input {
    width: 300px;
  }
  
  .main-container {
    height: calc(100vh - 60px);
  }
  
  .sidebar {
    background: white;
    border-right: 1px solid #e4e7ed;
    padding: 20px 10px;
  }
  
  .compose-section {
    margin-bottom: 20px;
  }
  
  .compose-btn {
    width: 100%;
    margin-bottom: 10px;
    background: #ff9500;
    border-color: #ff9500;
  }
  
  .inbox-btn {
    width: 100%;
    background: #ff9500;
    border-color: #ff9500;
    color: white;
  }
  
  .sidebar-menu {
    border: none;
  }
  
  .sidebar-menu .el-menu-item {
    padding-left: 10px;
    margin-bottom: 5px;
    border-radius: 4px;
  }
  
  .main-content {
    background: white;
    padding: 0;
  }
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid #e4e7ed;
    background: #f8f9fa;
  }
  
  .toolbar-left {
    display: flex;
    gap: 10px;
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .draft-info {
    font-size: 12px;
    color: #909399;
  }
  
  .minimize-icon,
  .close-icon {
    cursor: pointer;
    color: #909399;
  }
  
  .email-form {
    padding: 20px;
  }
  
  .form-row {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .form-label {
    width: 80px;
    text-align: right;
    margin-right: 10px;
    color: #606266;
  }
  
  .form-input {
    flex: 1;
    margin-right: 10px;
  }
  
  .recipient-actions {
    display: flex;
    gap: 5px;
  }
  
  .editor-toolbar {
    margin: 20px 0 10px 0;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
  }
  
  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .format-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  
  .format-group {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .format-btn {
    font-weight: bold;
  }
  
  .email-content {
    margin-bottom: 20px;
  }
  
  .content-textarea {
    border-radius: 4px;
  }
  
  .content-textarea :deep(.el-textarea__inner) {
    min-height: 300px;
    resize: vertical;
  }
  
  .sender-info {
    display: flex;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid #e4e7ed;
  }
  
  .sender-label {
    color: #606266;
    margin-right: 10px;
  }
  
  .sender-name {
    color: #303133;
  }
  
  .right-sidebar {
    background: white;
    border-left: 1px solid #e4e7ed;
    padding: 20px;
  }
  
  .contact-search {
    margin-bottom: 20px;
  }
  
  .contact-sections {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .contact-section {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 15px;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;
    font-weight: 500;
  }
  </style>