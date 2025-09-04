<template>
  <div class="mail-container">
    <!-- 主体内容区 -->
    <div class="content-wrapper">
      <!-- 左侧边栏 -->
      <div class="sidebar">
        <!-- 顶部按钮区域 -->
        <div class="sidebar-top">
          <button class="compose-btn active">
            <span class="icon icon--compose">
              <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 14l8.5-8.5c.6-.6 1.6-.6 2.2 0l1.8 1.8c.6.6.6 1.6 0 2.2L7 18H3v-4z" fill="#f5a623"/>
                <path d="M12.3 3.7l4 4" stroke="#f5a623" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="btn-text">写信</span>
          </button>
          <div class="sidebar-divider"></div>
          <button class="inbox-btn">
            <span class="icon icon--inbox">
              <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="8" width="16" height="10" rx="2" fill="#FFB74D"/>
                <rect x="6" y="4" width="8" height="6" rx="1" fill="#E3F2FD" stroke="#64B5F6" stroke-width="1"/>
                <path d="M6 7l4 2 4-2" fill="none" stroke="#64B5F6" stroke-width="1"/>
              </svg>
            </span>
            <span class="btn-text">收信</span>
          </button>
        </div>

        <!-- 文件夹列表 -->
        <div class="folder-list">
          <div class="folder-item">
            <span class="folder-icon">
              <!-- 信箱SVG -->
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="12" rx="3" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M2 6l8 6 8-6" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
            </span>
            <span class="folder-name">收件箱</span><span class="folder-badge">1</span>
          </div>
          <div class="folder-item">
            <span class="folder-icon">
              <!-- 星标SVG -->
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="10,2 12,7.5 18,7.5 13,11.5 15,17 10,13.5 5,17 7,11.5 2,7.5 8,7.5" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
            </span>
            <span class="folder-name">星标邮件</span>
          </div>
          <div class="folder-item">
            <span class="folder-icon">
              <!-- 纸飞机SVG -->
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="2,18 18,10 2,2 5,10 2,18" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
            </span>
            <span class="folder-name">已发送</span>
          </div>
          <div class="folder-item">
            <span class="folder-icon">
              <!-- 文件夹SVG -->
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="10" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M2 6l6-4 4 4h6" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
            </span>
            <span class="folder-name">草稿箱</span><span class="folder-badge">4</span>
          </div>
          <div class="folder-item">
            <span class="folder-icon">
              <!-- 垃圾桶SVG -->
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="7" width="10" height="9" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M3 7h14" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M8 10v3" stroke="#ff9800" stroke-width="1.2"/><path d="M12 10v3" stroke="#ff9800" stroke-width="1.2"/></svg>
            </span>
            <span class="folder-name">已删除</span>
          </div>
          <div class="folder-item">
            <span class="folder-icon">
              <!-- 垃圾箱SVG -->
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="12" rx="3" stroke="#ff9800" stroke-width="1.5" fill="none"/><rect x="8" y="10" width="4" height="4" rx="1" stroke="#ff9800" stroke-width="1.2" fill="none"/></svg>
            </span>
            <span class="folder-name">垃圾箱</span><span class="folder-badge">8</span>
          </div>
          <div class="folder-item">
            <span class="folder-icon">
              <!-- 文件夹SVG -->
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="2,18 18,10 2,2 5,10 2,18" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
            </span>
            <span class="folder-name">我的文件夹</span>
          </div>
        </div>
      </div>
      
      <!-- 主内容区域 -->
      <div class="main-content">
        <div class="header">
      <div class="header-left">
        <img class="header-image" :src="topImage" alt="header" />
      </div>
      <div class="header-right">
        <div class="header-search">
    <span class="search-icon">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#bdbdbd" stroke-width="1.5" fill="none"/>
        <path d="M12 12l-2.5-2.5" stroke="#bdbdbd" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </span>
          <input class="search-input" type="text" placeholder="搜索" />
        </div>
      </div>
    </div>
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="tool-btn primary" @click="sendMailHandler">
              <el-icon><Position /></el-icon>
              <span>发送</span>
            </div>
            <div class="tool-btn">
              <el-icon><View /></el-icon>
              <span>预览</span>
            </div>
            <div class="tool-btn" @click="triggerFileUpload">
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
            <span class="time" style="min-width: 180px; white-space: nowrap;">已于{{ currentTime }}保存至草稿</span>
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
                allow-create
                default-first-option
                placeholder="请输入收件人姓名、工号或邮箱地址"
                :remote-method="remoteSearch"
                :loading="loading"
                class="recipient-select"
                @change="validateRecipients"
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
                allow-create
                default-first-option
                placeholder="请输入抄送人姓名、工号或邮箱地址"
                :remote-method="remoteSearch"
                :loading="loading"
                class="recipient-select"
                @change="validateCc"
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
                allow-create
                default-first-option
                placeholder="请输入密送人姓名、工号或邮箱地址"
                :remote-method="remoteSearch"
                :loading="loading"
                class="recipient-select"
                @change="validateBcc"
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
        <div class="editor-toolbar" style="background-color: #f5faff; border-bottom: 1px solid #e0e0e0; padding: 10px 20px;">
          <div class="toolbar-group">
            <div class="tool-btn">
              <el-icon><ArrowLeftBold /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><ArrowRightBold /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><PictureFilled /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><Link /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><Document /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><Avatar /></el-icon>
            </div>
          </div>
          
          <div class="toolbar-group">
            <div class="tool-select">
              <span>默认字体</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            
            <div class="tool-select">
              <span>字号</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
          </div>
          
          <div class="toolbar-group">
            <div class="tool-btn" @click="execFormatCommand('bold')" title="加粗">
              <font-awesome-icon :icon="['fas', 'bold']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('italic')" title="斜体">
              <font-awesome-icon :icon="['fas', 'italic']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('underline')" title="下划线">
              <font-awesome-icon :icon="['fas', 'underline']" />
            </div>
            <div class="tool-btn">
              <el-icon><Delete /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><Edit /></el-icon>
            </div>
          </div>
          
          <div class="toolbar-group">
            <div class="tool-btn" @click="execFormatCommand('insertUnorderedList')" title="无序列表">
              <font-awesome-icon :icon="['fas', 'list-ul']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('insertOrderedList')" title="有序列表">
              <font-awesome-icon :icon="['fas', 'list-ol']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('justifyLeft')" title="左对齐">
              <font-awesome-icon :icon="['fas', 'align-left']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('justifyCenter')" title="居中对齐">
              <font-awesome-icon :icon="['fas', 'align-center']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('justifyRight')" title="右对齐">
              <font-awesome-icon :icon="['fas', 'align-right']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('justifyFull')" title="两端对齐">
              <font-awesome-icon :icon="['fas', 'align-justify']" />
            </div>
          </div>
        </div>
        
        <!-- 编辑器内容区 -->
        <div class="editor-content" contenteditable="true" @input="handleEditorInput" style="flex: 1; padding: 20px; background-color: #ffffff; min-height: 300px; outline: none; border-radius: 0 0 4px 4px;">
          <p>请输入正文</p>
        </div>
        
        <!-- 隐藏的文件输入 -->
        <input 
          id="file-input" 
          type="file" 
          multiple 
          style="display: none" 
          @change="(e: Event) => handleFileUpload(((e.target as HTMLInputElement).files))"
        />
        
        <!-- 附件列表 -->
        <div v-if="mailForm.attachments.length > 0" class="attachments-list" style="padding: 10px 20px; border-top: 1px solid #e0e0e0;">
          <div class="attachment-item" v-for="(file, index) in mailForm.attachments" :key="index" style="display: inline-flex; align-items: center; margin-right: 10px; margin-bottom: 5px; padding: 6px 10px; background: #f0f0f0; border-radius: 6px; font-size: 12px;">
            <el-icon style="margin-right: 5px; color: #409eff;"><Files /></el-icon>
            <div style="display: flex; flex-direction: column;">
              <span>{{ file.name }}</span>
              <span style="color: #666; font-size: 10px;">{{ formatFileSize(file.size) }}</span>
            </div>
            <span @click="removeAttachment(index)" style="margin-left: 8px; cursor: pointer; color: #f56c6c; font-weight: bold;" title="删除附件">&times;</span>
          </div>
        </div>
        
        <!-- 发件人信息 -->
        <div class="sender-info">
          <span>发件人：</span>
          <span>{{ currentUser }}</span>
        </div>
      </div>
      
      <!-- 右侧联系人列表 -->
      <div class="contact-list" style="width: 220px; background-color: #ffffff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-left: 8px; overflow: hidden;">
        <div class="contact-header" style="padding: 12px 15px; font-size: 16px; font-weight: bold; border-bottom: 1px solid #e6e6e6; background-color: #f5faff;">
          <span>联系人</span>
        </div>
        
        <div class="contact-search" style="padding: 10px; border-bottom: 1px solid #e6e6e6;">
          <div class="header-search" style="width: 100%; height: 32px;">
            <span class="search-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#bdbdbd" stroke-width="1.5" fill="none"/>
                <path d="M12 12l-2.5-2.5" stroke="#bdbdbd" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            <input class="search-input" type="text" placeholder="搜索联系人" v-model="contactSearch" />
          </div>
        </div>
        
        <div class="contact-groups" style="flex: 1; overflow-y: auto; padding: 10px;">
          <div 
            v-for="(group, index) in contactGroups" 
            :key="index"
            class="contact-group"
            style="margin-bottom: 10px;"
          >
            <div 
              class="folder-item" 
              @click="toggleGroupExpand(index)"
              style="display: flex; align-items: center; padding: 6px 4px; cursor: pointer; font-size: 12px; color: #333; border-radius: 2px; margin-bottom: 2px;"
            >
              <span class="folder-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="#ff9800" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :transform="!group.expanded ? 'rotate(-90 8 8)' : ''"/>
                </svg>
              </span>
              <span class="folder-name">{{ group.name }}</span>
              <span class="folder-badge">{{ group.contacts.length }}</span>
            </div>
            
            <div class="group-contacts" v-if="group.expanded">
                          <div 
              v-for="contact in filteredContacts(group.contacts)" 
              :key="contact.id"
              class="contact-item"
              @click="addRecipient(contact)"
            >
              <el-avatar :size="24">{{ contact.name.substring(0, 1) }}</el-avatar>
              <div class="contact-info" style="flex: 1; min-width: 0; overflow: hidden;">
                <div class="contact-name" style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ contact.name }}</div>
                <div class="contact-email" style="font-size: 11px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ contact.email }}</div>
                <div v-if="contact.deptName" class="contact-dept" style="font-size: 10px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ contact.deptName }}</div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { sendMail, saveDraft, type CreateMailContentReqVO } from '@/api/system/mail/letter/index'
import { getSimpleUserList } from '@/api/system/user'
import { getAccessToken } from '@/utils/auth'
import '@/views/mail/mail.css'
import topImage from '@/views/mail/image/top.png'

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
  Position,
  Files,
  Delete,
  ArrowDown,
  Setting,
  Clock,
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
  userOptions as mockUserOptions, 
  contactGroups as mockContactGroups
} from './mock/write.js'

const router = useRouter()

// 表单数据
const mailForm = ref<{
  recipients: string[]
  cc: string[]
  bcc: string[]
  subject: string
  content: string
  attachments: File[]
}>({
  recipients: [],
  cc: [],
  bcc: [],
  subject: '',
  content: '',
  attachments: []
})

// UI状态
const showCc = ref(false)
const showBcc = ref(false)
const contactSearch = ref('')
const loading = ref(false)

// 使用mock数据，更新userOptions以包含邮箱地址
const userOptions = ref(mockUserOptions.map(user => ({
  ...user,
  value: user.value.includes('@') ? user.value : `${user.value}@example.com`,
  label: user.value.includes('@') ? user.label : `${user.label} <${user.value}@example.com>`
})))
const contactGroups = ref(mockContactGroups.map(group => ({ ...group, expanded: true })))

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



// 邮箱格式验证 - 修改为可选验证
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 搜索用户/联系人 - 使用getSimpleUserList获取真实用户数据
const remoteSearch = async (query: string) => {
  console.log(`🔍 开始搜索联系人，关键词: "${query}"`)
  
  try {
    loading.value = true
    console.log('📡 调用后端用户列表API...')
    
    // 调用getSimpleUserList获取所有用户
    const users = await getSimpleUserList()
    for (const user of users) {
      console.log(user.deptNames)
    }
    
    if (users && Array.isArray(users)) {
      console.log(`✅ 获取用户列表成功，共 ${users.length} 个用户`)
      
      // 如果有搜索关键词，进行过滤
      let filteredUsers = users
      if (query) {
        filteredUsers = users.filter(user => 
          (user.nickname && user.nickname.toLowerCase().includes(query.toLowerCase())) ||
          (user.username && user.username.toLowerCase().includes(query.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(query.toLowerCase()))
        )
        console.log(`🔍 过滤后找到 ${filteredUsers.length} 个匹配用户`)
      }
      
      // 转换为前端需要的格式
      userOptions.value = filteredUsers.slice(0, 50).map((user: any) => ({
        value: user.id.toString(), // 使用用户ID作为值
        label: `${user.nickname || user.username} <${user.deptNames ? user.deptNames.join(', ') : ''}>`, // 显示格式：姓名 <部门名称>
        avatar: user.avatar || '',
        name: user.nickname || user.username,
        email: user.username, // 用户名作为邮箱标识
        userId: user.id,
        deptName: user.deptNames ? user.deptNames.join(', ') : '' // 使用部门名称
      }))
      
      console.log('🔄 更新用户选项列表:', userOptions.value)
    } else {
      console.warn('⚠️ API没有返回数据，使用mock数据')
      // 如果API没有返回数据，使用mock数据
      const filteredMockUsers = mockUserOptions.filter(user => 
        user.label.toLowerCase().includes(query.toLowerCase()) ||
        user.value.toLowerCase().includes(query.toLowerCase())
      )
      userOptions.value = filteredMockUsers
      console.log('📋 使用过滤后的mock数据:', userOptions.value)
    }
  } catch (error: unknown) {
    console.error('❌ 搜索联系人失败:', error)
    console.error('🔍 搜索错误详情:', {
      message: (error as any)?.message,
      response: (error as any)?.response,
      status: (error as any)?.response?.status
    })
    // 降级使用mock数据
    const filteredMockUsers = mockUserOptions.filter(user => 
      user.label.toLowerCase().includes(query.toLowerCase()) ||
      user.value.toLowerCase().includes(query.toLowerCase())
    )
    userOptions.value = filteredMockUsers
    console.log('📋 降级使用mock数据:', userOptions.value)
  } finally {
    loading.value = false
    console.log('🏁 搜索完成，loading状态:', loading.value)
  }
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

// 验证收件人 - 修改为支持姓名输入
const validateRecipients = () => {
  // 对于OA内部人员，允许输入姓名，不需要强制邮箱格式
  // 这里可以添加其他验证逻辑，比如检查姓名是否在联系人列表中
  console.log('收件人验证通过:', mailForm.value.recipients)
}

// 验证抄送人 - 修改为支持姓名输入
const validateCc = () => {
  // 对于OA内部人员，允许输入姓名，不需要强制邮箱格式
  console.log('抄送人验证通过:', mailForm.value.cc)
}

// 验证密送人 - 修改为支持姓名输入
const validateBcc = () => {
  // 对于OA内部人员，允许输入姓名，不需要强制邮箱格式
  console.log('密送人验证通过:', mailForm.value.bcc)
}

// 添加收件人 - 修改为支持姓名输入
const addRecipient = (contact: any) => {
  const identifier = contact.email || contact.name
  if (identifier && !mailForm.value.recipients.includes(identifier)) {
    mailForm.value.recipients.push(identifier)
  }
}

// 处理编辑器输入
const handleEditorInput = (e: Event) => {
  const target = e.target as HTMLElement
  // 使用textContent获取纯文本，或者使用innerHTML但需要进行XSS过滤
  mailForm.value.content = target.innerHTML
}

// 触发文件选择
const triggerFileUpload = () => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement
  if (fileInput) {
    fileInput.click()
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 删除附件
const removeAttachment = (index: number) => {
  const fileName = mailForm.value.attachments[index].name
  mailForm.value.attachments.splice(index, 1)
  ElMessage.success(`已删除附件: ${fileName}`)
}

// 重置表单
const resetForm = () => {
  mailForm.value = {
    recipients: [],
    cc: [],
    bcc: [],
    subject: '',
    content: '',
    attachments: []
  }
  
  // 重置编辑器内容
  const editorContent = document.querySelector('.editor-content')
  if (editorContent) {
    editorContent.innerHTML = '<p>请输入正文</p>'
  }
  
  // 隐藏抄送和密送
  showCc.value = false
  showBcc.value = false
}

// 处理文件上传
const handleFileUpload = (files: FileList | null) => {
  if (files) {
    const newFiles = Array.from(files)
    // 验证文件大小（限制每个文件最大25MB）
    const oversizedFiles = newFiles.filter(file => file.size > 25 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      ElMessage.warning(`文件 ${oversizedFiles.map(f => f.name).join(', ')} 超过25MB限制`)
      return
    }
    
    mailForm.value.attachments = [...mailForm.value.attachments, ...newFiles]
    ElMessage.success(`成功添加 ${newFiles.length} 个附件`)
  }
}

// 发送邮件
const sendMailHandler = async () => {
  if (!mailForm.value.recipients.length) {
    ElMessage.warning('请选择收件人')
    return
  }
  
  if (!mailForm.value.subject) {
    try {
      await ElMessageBox.confirm('是否确认发送无主题邮件？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }
  }
  
  await doSendMail()
}

// 处理收件人：将姓名转换为用户ID，使用getSimpleUserList获取真实用户数据
const processRecipients = async (recipients: string[]): Promise<string[]> => {
  const processedUserIds: string[] = []
  
  try {
    // 获取所有用户列表
    const users = await getSimpleUserList()
    
    for (const recipient of recipients) {
      // 检查是否已经是用户ID（数字格式）
      if (/^\d+$/.test(recipient)) {
        // 如果已经是用户ID格式，直接添加
        processedUserIds.push(recipient)
      } else if (isValidEmail(recipient)) {
        // 如果是邮箱格式，需要查找对应的用户ID
        const user = users.find((u: any) => 
          u.username === recipient || u.email === recipient
        )
        if (user && user.id) {
          processedUserIds.push(user.id.toString())
        } else {
          // 如果找不到用户，使用邮箱作为标识符
          processedUserIds.push(recipient)
        }
      } else {
        // 如果是姓名，尝试查找对应的用户ID
        const user = users.find((u: any) => 
          u.nickname === recipient || 
          u.username === recipient ||
          (u.nickname && u.nickname.toLowerCase().includes(recipient.toLowerCase())) ||
          (u.username && u.username.toLowerCase().includes(recipient.toLowerCase()))
        )
        if (user && user.id) {
          processedUserIds.push(user.id.toString())
        } else {
          // 如果找不到用户，使用姓名作为标识符
          processedUserIds.push(recipient)
        }
      }
    }
  } catch (error: unknown) {
    console.error('❌ 获取用户列表失败，使用原始收件人信息:', error)
    // 如果API调用失败，直接使用原始收件人信息
    return recipients
  }
  
  return processedUserIds
}

// 执行发送邮件
const doSendMail = async () => {
  try {
    loading.value = true
    
    // 验证必填字段
    if (!mailForm.value.recipients.length) {
      ElMessage.warning('请选择收件人')
      return
    }
    
    // 获取编辑器实际内容
    const editorContent = document.querySelector('.editor-content')?.innerHTML || ''
    
    // 处理收件人：转换为用户ID
    const processedRecipients = await processRecipients(mailForm.value.recipients)
    
    // 处理抄送人：转换为用户ID
    const processedCc = mailForm.value.cc.length > 0 ? await processRecipients(mailForm.value.cc) : []
    
    const sendData: CreateMailContentReqVO = {
      subject: mailForm.value.subject || '(无主题)',
      content: editorContent,
      senderId: userStore.getUser.id, // 发件人ID
      receiverIds: processedRecipients.join(','), // 收件人ID列表，逗号分隔
      ccUserIds: processedCc.length > 0 ? processedCc.join(',') : undefined, // 抄送人ID列表，逗号分隔
      priority: 1, // 默认普通优先级
      isDraft: false, // 不是草稿
      requestReadReceipt: false, // 默认不请求已读回执
      status: 0, // 正常状态
      folder: 'sent' // 已发送文件夹
    }
    
    console.log('发送邮件数据:', sendData)
    
    // 检查用户登录状态
    const currentToken = getAccessToken()
    console.log('🔑 当前 accessToken:', currentToken ? '已设置' : '未设置')
    console.log('👤 用户信息:', userStore.getUser)
    
    if (!currentToken) {
      ElMessage.error('用户未登录，请先登录')
      router.push('/login')
      return
    }
    
    // 直接调用发送邮件API，axios拦截器会自动携带token
    await sendMail(sendData)
    ElMessage.success('邮件发送成功')
    
    // 清空表单
    resetForm()
    router.push('/mail')
  } catch (error: any) {
    console.error('发送邮件失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '网络错误，请稍后重试'
    ElMessage.error(`发送失败: ${errorMsg}`)
  } finally {
    loading.value = false
  }
}

// 保存草稿 - 修复类型错误
const saveDraftHandler = async () => {
  try {
    // 获取编辑器实际内容
    const editorContent = document.querySelector('.editor-content')?.innerHTML || ''
    
    // 处理收件人：转换为用户ID
    const processedRecipients = await processRecipients(mailForm.value.recipients)
    
    // 处理抄送人：转换为用户ID
    const processedCc = mailForm.value.cc.length > 0 ? await processRecipients(mailForm.value.cc) : []
    
    const draftData: CreateMailContentReqVO = {
      subject: mailForm.value.subject,
      content: editorContent,
      senderId: userStore.getUser.id, // 发件人ID
      receiverIds: processedRecipients.join(','), // 收件人ID列表，逗号分隔
      ccUserIds: processedCc.length > 0 ? processedCc.join(',') : undefined, // 抄送人ID列表，逗号分隔
      priority: 1,
      isDraft: true, // 是草稿
      requestReadReceipt: false,
      status: 0, // 正常状态
      folder: 'drafts' // 草稿文件夹
    }
    
    console.log('保存草稿数据:', draftData)
    
    await saveDraft(draftData)
    ElMessage.success('草稿保存成功')
    router.push('/mail')
  } catch (error: any) {
    console.error('保存草稿失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '网络错误，请稍后重试'
    ElMessage.error(`保存失败: ${errorMsg}`)
  }
}

// 关闭编辑器
const closeEditor = async () => {
  try {
    await ElMessageBox.confirm('是否保存草稿？', '提示', {
      confirmButtonText: '保存',
      cancelButtonText: '不保存',
      distinguishCancelAndClose: true,
      closeOnClickModal: false
    })
    
    // 保存草稿
    await saveDraftHandler()
  } catch (action) {
    if (action === 'cancel') {
      // 不保存，直接返回
      router.push('/mail')
    }
  }
}



// 文本格式化命令
const execFormatCommand = (command: string) => {
  document.execCommand(command, false, '')
}

onMounted(async () => {
  // 初始化编辑器
  console.log('🚀 组件挂载完成，开始初始化用户列表...')
  
  try {
    // 获取初始用户列表
    const users = await getSimpleUserList()
    if (users && Array.isArray(users)) {
      console.log(`✅ 初始化获取用户列表成功，共 ${users.length} 个用户`)
      
      // 转换为前端需要的格式，限制显示前20个用户
      userOptions.value = users.slice(0, 20).map((user: any) => ({
        value: user.id.toString(),
        label: `${user.nickname || user.username} <${user.deptNames ? user.deptNames.join(', ') : ''}>`,
        avatar: user.avatar || '',
        name: user.nickname || user.username,
        email: user.username,
        userId: user.id,
        deptName: user.deptNames ? user.deptNames.join(', ') : ''
      }))
      
      console.log('🔄 初始化用户选项列表:', userOptions.value)
    } else {
      console.warn('⚠️ 初始化时API没有返回数据，使用mock数据')
      userOptions.value = mockUserOptions
    }
  } catch (error: unknown) {
    console.error('❌ 初始化用户列表失败:', error)
    console.log('📋 使用mock数据作为初始选项')
    userOptions.value = mockUserOptions
  }
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

/* 使用:deep选择器来正确应用按钮样式 */
.sidebar :deep(.sidebar-top) {
  margin: 0 -8px 20px -8px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  padding: 12px 8px 8px 8px;
  border-bottom: 2px solid #e3f2fd;
}

.sidebar :deep(.compose-btn), .sidebar :deep(.inbox-btn) {
  width: 100%;
  padding: 8px 6px;
  margin: 8px 0;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  color: #0b2a5a;
  font-weight: 800;
}

.sidebar :deep(.sidebar-divider) {
  height: 1px;
  background: #e5e7eb;
  margin: 6px 2px;
}

.sidebar :deep(.compose-btn.active) { color: #0b2a5a; }

.sidebar :deep(.compose-btn:hover), .sidebar :deep(.inbox-btn:hover) { opacity: 0.9; }

.sidebar :deep(.compose-btn.active:hover) {
  background-color: #3367d6;
}

.folder-list {
  flex: 1;
  background: #fff;
  margin: 0 -8px -8px -8px;
  padding: 8px;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 8px 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  border-radius: 12px;
  margin-bottom: 3px;
}

.folder-icon {
  margin-right: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.folder-name {
  flex: 1;
  font-size: 13px;
}

.folder-badge {
  background-color: #e0e0e0;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 11px;
  color: #666;
  margin-left: 4px;
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
.content-wrapper {
  display: flex;
  flex: 1;
  background-color: #f5f7f9;
  padding: 0 8px 8px 8px;
  gap: 8px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  background-color: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);
  margin: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  height: 66px;
  background-color: #fff;
  border-bottom: 2px solid #e3f2fd;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tool-btn {
  height: 33px;
  padding: 0 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 15px;
  color: #222;
  display: flex;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
}

.tool-btn:hover {
  background-color: #f0f0f0;
}

.tool-btn.primary {
  background-color: #4285f4;
  color: white;
  border-color: #4285f4;
}

.tool-btn.primary:hover {
  background-color: #3367d6;
}

.tool-btn .el-icon {
  margin-right: 5px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.time {
  font-size: 12px;
  color: #666;
  margin-right: 10px;
}

/* 邮件表单 */
.mail-form {
  padding: 10px 15px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
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
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background-color: #f5faff;
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
  border-top: 1px solid #e0e0e0;
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
  width: 220px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-left: 8px;
  overflow: hidden;
}

.contact-header {
  padding: 12px 15px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4e73df;
  background-color: #f5faff;
}

.contact-search {
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
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
  border-radius: 4px;
  margin: 2px 4px;
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
  border-radius: 4px;
  margin: 2px 4px;
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
