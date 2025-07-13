<template>
  <div class="mail-container">
    <!-- 顶部标题栏 -->
    <div class="mail-header">
      <div class="mail-logo">
        <span class="logo-text">内部邮件</span>
      </div>
      <div class="search-box">
        <el-input placeholder="搜索" prefix-icon="Search" clearable />
      </div>
    </div>
    
    <!-- 主体内容区 -->
    <div class="mail-layout">
      <!-- 左侧菜单 -->
      <div class="mail-sidebar">
        <div class="sidebar-top">
          <div class="write-btn">
            <font-awesome-icon :icon="['fas', 'pen-to-square']" />
            <span>写信</span>
          </div>
          <div class="inbox-btn">
            <font-awesome-icon :icon="['fas', 'envelope']" />
            <span>收信</span>
          </div>
          <div class="inbox-btn">
            <font-awesome-icon :icon="['fas', 'file']" />
            <span>草稿</span>
          </div>
        </div>
        <div class="sidebar-menu">
          <div v-for="(item, index) in sidebarItems" :key="index" class="menu-item">
            <font-awesome-icon :icon="getMenuIcon(item.icon)" />
            <span>{{ item.name }}</span>
            <span v-if="item.count" class="count">({{ item.count }})</span>
          </div>
        </div>
      </div>
      
      <!-- 中间内容区 -->
      <div class="mail-content">
        <!-- 写信工具栏 -->
        <div class="mail-toolbar">
          <div class="toolbar-left">
            <div class="tool-btn primary" @click="sendMail">
              <el-icon><Position /></el-icon>
              <span>发送</span>
            </div>
            <div class="tool-btn">
              <el-icon><View /></el-icon>
              <span>预览</span>
            </div>
            <div class="tool-btn">
              <el-icon><Files /></el-icon>
              <span>附件</span>
            </div>

            <div class="tool-btn">
              <el-icon><Files /></el-icon>
              <span>超大附件</span>
            </div>
            <el-dropdown trigger="click">
              <div class="tool-btn">
                <el-icon><Setting /></el-icon>
                <span>发信设置</span>
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>定时发送</el-dropdown-item>
                  <el-dropdown-item>请求已读回执</el-dropdown-item>
                  <el-dropdown-item>设置优先级</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="toolbar-right">
            <span class="time">已于{{ currentTime }}保存至草稿</span>
            <div class="tool-btn" @click="closeEditor">
              <el-icon><Close /></el-icon>
            </div>
          </div>
        </div>
        
        <!-- 邮件表单区域 -->
        <div class="mail-form">
          <!-- 收件人行 -->
          <div class="form-row">
            <div class="form-label">收件人：</div>
            <div class="form-field">
              <el-select
                v-model="mailForm.recipients"
                multiple
                filterable
                remote
                reserve-keyword
                placeholder="请输入收件人"
                :remote-method="searchUsers"
                :loading="loading"
                class="recipient-select"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="user-option">
                    <el-avatar :size="24" :src="item.avatar">{{ item.label.substring(0, 1) }}</el-avatar>
                    <span>{{ item.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
            <div class="form-actions">
              <span class="action-link" @click="showCc = !showCc">抄送</span>
              <span class="action-link" @click="showBcc = !showBcc">密送</span>
              <span>|</span>
              <span class="action-link">分别发送</span>
            </div>
          </div>
          
          <!-- 抄送行 -->
          <div class="form-row" v-if="showCc">
            <div class="form-label">抄送：</div>
            <div class="form-field">
              <el-select
                v-model="mailForm.cc"
                multiple
                filterable
                remote
                reserve-keyword
                placeholder="请输入抄送人"
                :remote-method="searchUsers"
                :loading="loading"
                class="recipient-select"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="user-option">
                    <el-avatar :size="24" :src="item.avatar">{{ item.label.substring(0, 1) }}</el-avatar>
                    <span>{{ item.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>
          
          <!-- 密送行 -->
          <div class="form-row" v-if="showBcc">
            <div class="form-label">密送：</div>
            <div class="form-field">
              <el-select
                v-model="mailForm.bcc"
                multiple
                filterable
                remote
                reserve-keyword
                placeholder="请输入密送人"
                :remote-method="searchUsers"
                :loading="loading"
                class="recipient-select"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="user-option">
                    <el-avatar :size="24" :src="item.avatar">{{ item.label.substring(0, 1) }}</el-avatar>
                    <span>{{ item.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>
          
          <!-- 主题行 -->
          <div class="form-row">
            <div class="form-label">主题：</div>
            <div class="form-field">
              <el-input placeholder="请输入邮件主题" v-model="mailForm.subject" />
            </div>
          </div>
        </div>
        
        <!-- 编辑器工具栏 -->
        <div class="editor-toolbar">
          <div class="toolbar-group">
            <div class="tool-icon">
              <el-icon><ArrowLeftBold /></el-icon>
            </div>
            <div class="tool-icon">
              <el-icon><ArrowRightBold /></el-icon>
            </div>
            <div class="tool-icon">
              <el-icon><PictureFilled /></el-icon>
            </div>
            <div class="tool-icon">
              <el-icon><Link /></el-icon>
            </div>
            <div class="tool-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="tool-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="tool-icon">
              <el-icon><Avatar /></el-icon>
            </div>
          </div>
          
          <div class="toolbar-group">
            <div class="format-btn">
              <span>默认字体</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            
            <div class="format-btn">
              <span>字号</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
          </div>
          
          <div class="toolbar-group">
            <div class="tool-icon" @click="execFormatCommand('bold')" title="加粗">
              <font-awesome-icon :icon="['fas', 'bold']" />
            </div>
            <div class="tool-icon" @click="execFormatCommand('italic')" title="斜体">
              <font-awesome-icon :icon="['fas', 'italic']" />
            </div>
            <div class="tool-icon" @click="execFormatCommand('underline')" title="下划线">
              <font-awesome-icon :icon="['fas', 'underline']" />
            </div>
            <div class="tool-icon">
              <el-icon><Delete /></el-icon>
            </div>
            <div class="tool-icon">
              <el-icon><Edit /></el-icon>
            </div>
          </div>
          
          <div class="toolbar-group">
            <div class="tool-icon" @click="execFormatCommand('insertUnorderedList')" title="无序列表">
              <font-awesome-icon :icon="['fas', 'list-ul']" />
            </div>
            <div class="tool-icon" @click="execFormatCommand('insertOrderedList')" title="有序列表">
              <font-awesome-icon :icon="['fas', 'list-ol']" />
            </div>
            <div class="tool-icon" @click="execFormatCommand('justifyLeft')" title="左对齐">
              <font-awesome-icon :icon="['fas', 'align-left']" />
            </div>
            <div class="tool-icon" @click="execFormatCommand('justifyCenter')" title="居中对齐">
              <font-awesome-icon :icon="['fas', 'align-center']" />
            </div>
            <div class="tool-icon" @click="execFormatCommand('justifyRight')" title="右对齐">
              <font-awesome-icon :icon="['fas', 'align-right']" />
            </div>
            <div class="tool-icon" @click="execFormatCommand('justifyFull')" title="两端对齐">
              <font-awesome-icon :icon="['fas', 'align-justify']" />
            </div>
          </div>
        </div>
        
        <!-- 编辑器内容区 -->
        <div class="editor-content" contenteditable="true" @input="onEditorInput">
          <p>请输入正文</p>
        </div>
        
        <!-- 发件人信息 -->
        <div class="sender-info">
          <span>发件人：</span>
          <span>{{ currentUser }}</span>
        </div>
      </div>
      
      <!-- 右侧联系人列表 -->
      <div class="contact-list">
        <div class="contact-header">
          <span>联系人</span>
        </div>
        
        <div class="contact-search">
          <el-input
            v-model="contactSearch"
            placeholder="搜索联系人"
            prefix-icon="Search"
          />
        </div>
        
        <div class="contact-groups">
          <div 
            v-for="(group, index) in contactGroups" 
            :key="index"
            class="contact-group"
          >
            <div 
              class="group-header" 
              @click="toggleGroupExpand(index)"
            >
              <el-icon>
                <component :is="!group.expanded ? ArrowRight : ArrowDown" />
              </el-icon>
              <span>{{ group.name }}</span>
              <span class="count">({{ group.contacts.length }})</span>
            </div>
            
            <div class="group-contacts" v-if="group.expanded">
              <div 
                v-for="contact in filteredContacts(group.contacts)" 
                :key="contact.id"
                class="contact-item"
                @click="addRecipient(contact)"
              >
                <el-avatar :size="24">{{ contact.name.substring(0, 1) }}</el-avatar>
                <div class="contact-info">
                  <div class="contact-name">{{ contact.name }}</div>
                  <div class="contact-email">{{ contact.email }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

// 导入Font Awesome组件和图标
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faListUl,
  faListOl,
  faBold,
  faItalic,
  faUnderline
} from '@fortawesome/free-solid-svg-icons'

// 添加图标到库
library.add(
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faListUl,
  faListOl,
  faBold,
  faItalic,
  faUnderline
)
import {
  Document,
  Edit,
  Star,
  Position,
  Files,
  Delete,
  Folder,
  Search,
  Plus,
  ArrowDown,
  ArrowRight,
  Setting,
  Back,
  Paperclip,
  Clock,
  CaretTop,
  CaretBottom,
  Avatar,
  PictureFilled,
  Link,
  ArrowRightBold,
  ArrowLeftBold,
  View,
  Close
} from '@element-plus/icons-vue'

// 导入mock数据
import { 
  sidebarItems as mockSidebarItems, 
  userOptions as mockUserOptions, 
  contactGroups as mockContactGroups,
  sendingOptions as mockSendingOptions,
  searchUsers
} from './mock/index.js'

const router = useRouter()

// 表单数据
const mailForm = ref({
  recipients: [],
  cc: [],
  bcc: [],
  subject: '',
  content: ''
})

// UI状态
const showCc = ref(false)
const showBcc = ref(false)
const contactSearch = ref('')
const loading = ref(false)

// 使用mock数据
const sidebarItems = ref(mockSidebarItems)
const userOptions = ref(mockUserOptions)
const contactGroups = ref(mockContactGroups.map(group => ({ ...group, expanded: true })))
const sendingOptions = mockSendingOptions

// 当前用户信息
const userStore = useUserStore();
const currentUser = computed(() => userStore.getUser.nickname || '未登录用户');

// 当前时间
const currentTime = computed(() => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

// 菜单图标映射
const getMenuIcon = (iconName) => {
  const iconMap = {
    'Edit': ['fas', 'pen-to-square'],
    'Document': ['fas', 'envelope'],
    'Star': ['fas', 'star'],
    'Position': ['fas', 'paper-plane'],
    'Files': ['fas', 'file'],
    'Delete': ['fas', 'trash'],
    'Folder': ['fas', 'folder'],
    'Search': ['fas', 'search'],
    'Plus': ['fas', 'plus'],
    'Folder-Delete': ['fas', 'dumpster']
  }
  
  return iconMap[iconName] || ['fas', 'envelope'] // 默认图标
}

// 模拟搜索用户
const remoteSearch = (query) => {
  if (query) {
    loading.value = true
    searchUsers(query).then(results => {
      userOptions.value = results
      loading.value = false
    })
  } else {
    userOptions.value = mockUserOptions
  }
}

// 切换联系人列表显示 - 已移除折叠功能
const toggleContactList = () => {
  // 不再需要
}

// 切换分组展开状态
const toggleGroupExpand = (index) => {
  contactGroups.value[index].expanded = !contactGroups.value[index].expanded
}

// 过滤联系人
const filteredContacts = (contacts) => {
  if (!contactSearch.value) return contacts
  return contacts.filter(contact => 
    contact.name.toLowerCase().includes(contactSearch.value.toLowerCase()) || 
    contact.email.toLowerCase().includes(contactSearch.value.toLowerCase())
  )
}

// 添加收件人
const addRecipient = (contact) => {
  const recipient = {
    value: contact.id,
    label: `${contact.name} <${contact.email}>`
  }
  if (!mailForm.value.recipients.some(item => item.value === recipient.value)) {
    mailForm.value.recipients.push(recipient)
  }
}

// 处理编辑器输入
const handleEditorInput = (e) => {
  mailForm.value.content = e.target.innerHTML
}

// 发送邮件
const sendMail = () => {
  if (!mailForm.value.recipients.length) {
    ElMessage.warning('请选择收件人')
    return
  }
  if (!mailForm.value.subject) {
    ElMessageBox.confirm('是否确认发送无主题邮件？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      doSendMail()
    }).catch(() => {})
    return
  }
  doSendMail()
}

// 执行发送邮件
const doSendMail = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('邮件发送成功')
    router.push('/mail/inbox')
  }, 1000)
}

// 关闭编辑器
const closeEditor = () => {
  ElMessageBox.confirm('是否保存草稿？', '提示', {
    confirmButtonText: '保存',
    cancelButtonText: '不保存',
    distinguishCancelAndClose: true,
    closeOnClickModal: false
  }).then(() => {
    // 保存草稿
    console.log('保存草稿:', mailForm.value)
    ElMessage.success('草稿保存成功')
    router.push('/mail/inbox')
  }).catch((action) => {
    if (action === 'cancel') {
      // 不保存，直接返回
      router.push('/mail/inbox')
    }
  })
}

// 上传附件
const uploadAttachment = () => {
  console.log('上传附件')
}

// 插入图片
const insertImage = () => {
  console.log('插入图片')
}

// 插入表格
const insertTable = () => {
  console.log('插入表格')
}

// 文本格式化命令
const execFormatCommand = (command) => {
  document.execCommand(command, false, null)
}

onMounted(() => {
  // 初始化编辑器
})
</script>

<style scoped>
/* 整体布局 */
.mail-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  color: #303133;
  overflow: hidden; /* 防止溢出出现滚动条 */
}

/* 顶部标题栏 */
.mail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 50px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.mail-logo {
  display: flex;
  align-items: center;
}

.logo-icon {
  width: 30px;
  height: 30px;
  background-color: #4e73df;
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #4e73df;
}

.search-box {
  width: 240px;
}

/* 主体布局 */
.mail-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  background-color: #fff;
  border-radius: 4px;
  margin: 10px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

/* 左侧菜单 */
.mail-sidebar {
  width: 150px;
  border-right: 1px solid #e6e6e6;
  background-color: #fff;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-top {
  padding: 15px 0;
  border-bottom: 1px solid #e6e6e6;
}

.write-btn, .inbox-btn {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: bold;
  gap: 8px;
}

.write-btn {
  color: #ff6b6b;
}

.inbox-btn {
  color: #4e73df;
}

.sidebar-menu {
  padding: 10px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #606266;
  gap: 8px;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

.menu-item svg {
  width: 16px;
  height: 16px;
}

.menu-item .count {
  margin-left: 5px;
  font-size: 12px;
  color: #909399;
}

/* 中间内容区 */
.mail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* 防止内容溢出 */
}

/* 写信工具栏 */
.mail-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #f8f9fa;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 5px;
}

.tool-btn {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #606266;
  font-size: 14px;
}

.tool-btn:hover {
  background-color: #ecf5ff;
}

.tool-btn.primary {
  background-color: #4e73df;
  color: white;
}

.tool-btn .el-icon {
  margin-right: 5px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 5px;
}

.time {
  font-size: 14px;
  color: #909399;
  margin-right: 10px;
}

/* 邮件表单 */
.mail-form {
  padding: 10px 15px;
  border-bottom: 1px solid #e6e6e6;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.form-label {
  width: 70px;
  text-align: right;
  padding-right: 10px;
  font-size: 14px;
  color: #606266;
}

.form-field {
  flex: 1;
}

.form-actions {
  margin-left: 10px;
  display: flex;
  gap: 10px;
}

.action-link {
  color: #4e73df;
  cursor: pointer;
  font-size: 14px;
}

.action-link:hover {
  text-decoration: underline;
}

.recipient-select {
  width: 100%;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 编辑器工具栏 */
.editor-toolbar {
  padding: 8px 15px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background-color: #f8f9fa;
  align-items: center;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: 10px;
  flex-wrap: wrap;
}

.tool-icon {
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  padding: 0 5px;
  font-size: 12px;
}

.tool-icon:hover {
  background-color: #ecf5ff;
}

.format-btn {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.format-btn:hover {
  background-color: #ecf5ff;
}

.format-btn .el-icon {
  margin-left: 5px;
}

/* 编辑器内容区 */
.editor-content {
  flex: 1;
  padding: 15px 20px;
  overflow-y: auto;
  min-height: 250px;
  outline: none;
  color: #303133;
  font-size: 14px;
}

/* 发件人信息 */
.sender-info {
  padding: 10px 15px;
  border-top: 1px solid #e6e6e6;
  font-size: 14px;
  color: #606266;
  background-color: #f8f9fa;
}

.sender-name {
  color: #409eff;
  margin-left: 5px;
  cursor: pointer;
}

/* 联系人列表 */
.contact-list {
  width: 240px;
  background-color: #fff;
  border-left: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.contact-header {
  padding: 12px 15px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4e73df;
  background-color: #f8f9fa;
}

.contact-search {
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.contact-groups {
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 120px); /* 调整高度以适应滚动 */
}

.contact-group {
  margin-bottom: 2px;
}

.group-header {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: #f5f7fa;
  font-size: 14px;
  color: #606266;
}

.group-header .el-icon {
  margin-right: 5px;
  font-size: 12px;
  color: #909399;
}

.group-header .count {
  margin-left: 5px;
  font-size: 12px;
  color: #909399;
}

.group-contacts {
  padding: 2px 0;
}

.contact-item {
  padding: 6px 12px 6px 25px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.contact-item:hover {
  background-color: #f5f7fa;
}

.contact-item .el-avatar {
  margin-right: 8px;
  background-color: #4e73df;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 13px;
  color: #303133;
}

.contact-email {
  font-size: 12px;
  color: #909399;
}
</style>