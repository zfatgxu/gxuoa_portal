<template>
  <div class="mail-container">
    <!-- 主体内容区 -->
    <div class="content-wrapper">
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
            <span class="time" style="min-width: 120px; white-space: nowrap;">已于{{ currentTime }}保存至草稿</span>
            <div class="tool-btn" @click="saveDraftHandler">
              <span>保存草稿</span>
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
                    <el-avatar :size="24" :src="item.avatar">{{ item.label?.substring(0, 1) || '?' }}</el-avatar>
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
                    <el-avatar :size="24" :src="item.avatar">{{ item.label?.substring(0, 1) || '?' }}</el-avatar>
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
                    <el-avatar :size="24" :src="item.avatar">{{ item.label?.substring(0, 1) || '?' }}</el-avatar>
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
            <el-dropdown trigger="click" @command="changeFont">
              <div class="tool-select" title="选择字体">
                <span :style="{ fontFamily: getFontFamily(selectedFont) }">{{ selectedFont }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-for="font in fontOptions"
                    :key="font.value"
                    :command="font.value"
                    :style="{ fontFamily: getFontFamily(font.value) }"
                  >
                    {{ font.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            
            <el-dropdown trigger="click" @command="changeFontSize">
              <div class="tool-select" title="选择字号">
                <span>{{ selectedFontSize }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-for="size in fontSizeOptions"
                    :key="size.value"
                    :command="size.value"
                    :style="{ fontSize: size.size }"
                  >
                    {{ size.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <div class="toolbar-group">
            <div 
              class="tool-btn" 
              :class="{ 'active': formatStates.bold }"
              @click="execFormatCommand('bold')" 
              title="加粗"
            >
              <font-awesome-icon :icon="['fas', 'bold']" />
            </div>
            <div 
              class="tool-btn" 
              :class="{ 'active': formatStates.italic }"
              @click="execFormatCommand('italic')" 
              title="斜体"
            >
              <font-awesome-icon :icon="['fas', 'italic']" />
            </div>
            <div 
              class="tool-btn" 
              :class="{ 'active': formatStates.underline }"
              @click="execFormatCommand('underline')" 
              title="下划线"
            >
              <font-awesome-icon :icon="['fas', 'underline']" />
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
        <div 
          class="editor-content" 
          contenteditable="true" 
          @input="handleEditorInput" 
          @mouseup="updateFormatStates"
          @keyup="updateFormatStates"
          @keydown="updateFormatStates"
          @focus="updateFormatStates"
          @blur="updateFormatStates"
          @selectionchange="updateFormatStates"
          data-placeholder="请输入正文" 
          style="flex: 1; padding: 20px; background-color: #ffffff; min-height: 300px; outline: none; border-radius: 0 0 4px 4px;"
        >
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
          <!-- 最近联系人分组 -->
          <div class="contact-group" style="margin-bottom: 10px;">
            <div 
              class="folder-item" 
              @click="toggleRecentContactsExpand"
              style="display: flex; align-items: center; padding: 6px 4px; cursor: pointer; font-size: 12px; color: #333; border-radius: 2px; margin-bottom: 2px;"
            >
              <span class="folder-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="#ff9800" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :transform="!recentContactsExpanded ? 'rotate(-90 8 8)' : ''"/>
                </svg>
              </span>
              <span class="folder-name">最近联系人</span>
              <span class="folder-badge">{{ filteredRecentContacts.length || 0 }}</span>
            </div>
            
            <div class="group-contacts" v-if="recentContactsExpanded">
              <div 
                v-for="contact in filteredRecentContacts" 
                :key="contact.name"
                class="contact-item"
                @click="addRecentRecipient(contact)"
                @contextmenu.prevent="showContextMenu($event, contact, 'recent')"
                style="display: flex; align-items: center; padding: 6px 12px 6px 25px; cursor: pointer; transition: background-color 0.2s; border-radius: 4px; margin: 2px 4px;"
              >
                <el-avatar :size="24" style="margin-right: 8px; background-color: #4e73df;">{{ contact.name?.substring(0, 1) || '?' }}</el-avatar>
                <div class="contact-info" style="flex: 1; min-width: 0; overflow: hidden;">
                  <div class="contact-name" style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 13px; color: #303133;">{{ contact.name }}</div>
                  <div class="contact-time" style="font-size: 11px; color: #909399; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ formatLastSendTime(contact.lastSendTime) }}
                  </div>
                </div>
              </div>
              <!-- 空状态提示 -->
              <div v-if="filteredRecentContacts.length === 0 && !contactSearch.trim()" style="padding: 20px 25px; text-align: center; color: #909399; font-size: 12px;">
                暂无最近联系人
              </div>
            </div>
          </div>
          
          <!-- 星标联系人分组 -->
          <div class="contact-group" style="margin-bottom: 10px;">
            <div 
              class="folder-item" 
              @click="toggleStarredContactsExpand"
              style="display: flex; align-items: center; padding: 6px 4px; cursor: pointer; font-size: 12px; color: #333; border-radius: 2px; margin-bottom: 2px;"
            >
              <span class="folder-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="#ff9800" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :transform="!starredContactsExpanded ? 'rotate(-90 8 8)' : ''"/>
                </svg>
              </span>
              <span class="folder-name">星标联系人</span>
              <span class="folder-badge">{{ filteredStarredContacts.length || 0 }}</span>
            </div>
            
            <div class="group-contacts" v-if="starredContactsExpanded">
              <div 
                v-for="contact in filteredStarredContacts" 
                :key="contact.id"
                class="contact-item"
                @click="addStarredRecipient(contact)"
                @contextmenu.prevent="showContextMenu($event, contact, 'starred')"
                style="display: flex; align-items: center; padding: 6px 12px 6px 25px; cursor: pointer; transition: background-color 0.2s; border-radius: 4px; margin: 2px 4px;"
              >
                <el-avatar :size="24" style="margin-right: 8px; background-color: #ff9800;">{{ (starredContactDisplayNames.get(contact.id) || '?').substring(0, 1) }}</el-avatar>
                <div class="contact-info" style="flex: 1; min-width: 0; overflow: hidden;">
                  <div class="contact-name" style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 13px; color: #303133;">{{ starredContactDisplayNames.get(contact.id) || '加载中...' }}</div>
                  <div class="contact-time" style="font-size: 11px; color: #909399; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ formatLastSendTime(contact.createTime) }}
                  </div>
                </div>
              </div>
              <!-- 空状态提示 -->
              <div v-if="filteredStarredContacts.length === 0 && !contactSearch.trim()" style="padding: 20px 25px; text-align: center; color: #909399; font-size: 12px;">
                暂无星标联系人
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <div 
      v-if="contextMenu.visible"
      :key="`context-menu-${contextMenu.contact?.name || 'unknown'}-${contextMenu.type}`"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="toggleContactStar">
        <el-icon><Star /></el-icon>
        <span>{{ isContactStarred ? '取消星标' : '添加星标' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useUserStore} from '@/store/modules/user'
import {useTagsViewStore} from '@/store/modules/tagsView'
import {
  createLetterContactStar,
  deleteLetterContactStar,
  getLetterContactStarPage,
  getSentMails,
  type LetterContactStarCreateReqVO,
  type LetterContactStarRespVO,
  type LetterSendReqVO,
  type MailListItemVO,
  saveDraft,
  sendLetter
} from '@/api/system/mail/letter/index'
import {getSimpleUserList, getUserByIdCard} from '@/api/system/user'
import {getAccessToken} from '@/utils/auth'
import '@/views/mail/mail.css'
import topImage from '@/views/mail/image/top.png'

// 导入Font Awesome组件和图标
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {
  faAlignCenter,
  faAlignJustify,
  faAlignLeft,
  faAlignRight,
  faBold,
  faItalic,
  faListOl,
  faListUl,
  faUnderline
} from '@fortawesome/free-solid-svg-icons'
import {
  ArrowDown,
  ArrowLeftBold,
  ArrowRightBold,
  Avatar,
  Clock,
  Document,
  Edit,
  Files,
  Link,
  PictureFilled,
  Position,
  Setting,
  Star,
  View
} from '@element-plus/icons-vue'

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


const router = useRouter()
const tagsViewStore = useTagsViewStore()

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

// 格式按钮状态
const formatStates = ref({
  bold: false,
  italic: false,
  underline: false
})

// 字体选择状态
const selectedFont = ref('宋体')
const fontOptions = [
  { value: '宋体', label: '宋体' },
  { value: '黑体', label: '黑体' },
  { value: '楷书', label: '楷书' },
  { value: '幼圆', label: '幼圆' }
]

// 字号选择状态
const selectedFontSize = ref('中')
const fontSizeOptions = [
  { value: '小', label: '小', size: '12px' },
  { value: '中', label: '中', size: '14px' },
  { value: '大', label: '大', size: '16px' },
  { value: '较大', label: '较大', size: '18px' },
  { value: '最大', label: '最大', size: '20px' }
]

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  contact: null as any,
  type: '' as 'recent' | 'starred'
})

// 用户选项数据
const userOptions = ref<any[]>([])

// 最近联系人数据
const recentContacts = ref<any[]>([])
const recentContactsExpanded = ref(true)

// 星标联系人数据
const starredContacts = ref<LetterContactStarRespVO[]>([])
const starredContactsExpanded = ref(true)

// 星标联系人显示名称映射
const starredContactDisplayNames = ref<Map<number, string>>(new Map())

// 当前用户信息
const userStore = useUserStore();
const currentUser = computed(() => userStore.getUser.nickname || '未登录用户');

// 过滤后的最近联系人（基于搜索关键词）
const filteredRecentContacts = computed(() => {
  if (!contactSearch.value.trim()) {
    return recentContacts.value
  }
  
  const searchTerm = contactSearch.value.toLowerCase().trim()
  return recentContacts.value.filter(contact => 
    contact.name && contact.name.toLowerCase().startsWith(searchTerm)
  )
})

// 过滤后的星标联系人（基于搜索关键词）
const filteredStarredContacts = computed(() => {
  if (!contactSearch.value.trim()) {
    return starredContacts.value
  }
  
  const searchTerm = contactSearch.value.toLowerCase().trim()
  return starredContacts.value.filter(contact => {
    const displayName = starredContactDisplayNames.value.get(contact.id)
    return displayName && displayName.toLowerCase().startsWith(searchTerm)
  })
})

// 当前时间
const currentTime = computed(() => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
})


// 预加载用户列表
const allUsers = ref<any[]>([])

// 星标联系人用户信息缓存
const starredContactUserCache = ref<Map<string, any>>(new Map())

// 获取星标联系人的显示名称
const getStarredContactDisplayName = async (contact: LetterContactStarRespVO): Promise<string> => {
  try {
    // 先检查缓存
    if (starredContactUserCache.value.has(contact.contactIdCard)) {
      const cachedUser = starredContactUserCache.value.get(contact.contactIdCard)
      return cachedUser.nickname || '未知用户'
    }
    
    // 从缓存中获取用户信息
    const user = await getUserByIdCard(contact.contactIdCard)
    if (user) {
      // 缓存用户信息
      starredContactUserCache.value.set(contact.contactIdCard, user)
      return user.nickname || '未知用户'
    }
    
    return '未知用户'
  } catch (error) {
    console.error('获取星标联系人用户信息失败:', error)
    return '未知用户'
  }
}


// 获取最近联系人
const loadRecentContacts = async () => {
  try {
    console.log('📡 开始加载最近联系人...')
    const response = await getSentMails({ pageNo: 1, pageSize: 50 })
    
    if (response && Array.isArray(response.list)) {
      console.log(`📊 获取到 ${response.list.length} 封已发送邮件`)
      
      // 提取收件人信息并去重
      const contactMap = new Map()
      
      response.list.forEach((mail: MailListItemVO) => {
        if (mail.toUserNames) {
          // 解析收件人姓名列表（可能是逗号分隔的字符串）
          const recipients = mail.toUserNames.split(',').map(name => name.trim()).filter(name => name)
          
          recipients.forEach(recipientName => {
            if (recipientName && !contactMap.has(recipientName)) {
              contactMap.set(recipientName, {
                name: recipientName,
                lastSendTime: mail.sendTime,
                sendCount: 1
              })
            } else if (contactMap.has(recipientName)) {
              // 更新发送次数和最新发送时间
              const existing = contactMap.get(recipientName)
              existing.sendCount += 1
              if (new Date(mail.sendTime) > new Date(existing.lastSendTime)) {
                existing.lastSendTime = mail.sendTime
              }
            }
          })
        }
      })
      
      // 转换为数组并按最后发送时间倒序排列
      recentContacts.value = Array.from(contactMap.values())
        .sort((a, b) => new Date(b.lastSendTime).getTime() - new Date(a.lastSendTime).getTime())
        .slice(0, 20) // 只显示最近20个联系人
      
      console.log(`✅ 最近联系人加载成功，共 ${recentContacts.value.length} 个联系人`)
    } else {
      console.log('⚠️ 已发送邮件响应格式异常')
      recentContacts.value = []
    }
  } catch (error: any) {
    console.error('❌ 加载最近联系人失败:', error)
    recentContacts.value = []
  }
}

// 获取星标联系人
const loadStarredContacts = async () => {
  try {
    console.log('📡 开始加载星标联系人...')
    const response = await getLetterContactStarPage({ pageNo: 1, pageSize: 50 })
    
    if (response && Array.isArray(response.list)) {
      console.log(`📊 获取到 ${response.list.length} 个星标联系人`)
      
      // 直接使用API返回的星标联系人数据
      starredContacts.value = response.list
        .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
        .slice(0, 20) // 只显示最近20个星标联系人
      
      console.log(`✅ 星标联系人加载成功，共 ${starredContacts.value.length} 个联系人`)
      
      // 异步加载每个联系人的显示名称
      for (const contact of starredContacts.value) {
        try {
          const displayName = await getStarredContactDisplayName(contact)
          starredContactDisplayNames.value.set(contact.id, displayName)
        } catch (error) {
          console.error(`获取联系人 ${contact.contactIdCard} 的显示名称失败:`, error)
          starredContactDisplayNames.value.set(contact.id, '未知用户')
        }
      }
    } else {
      console.log('⚠️ 星标联系人响应格式异常')
      starredContacts.value = []
    }
  } catch (error: any) {
    console.error('❌ 加载星标联系人失败:', error)
    starredContacts.value = []
  }
}

// 并发加载所有数据
const loadAllData = async () => {
  console.log('🚀 开始并发加载所有数据...')
  
  try {
    // 使用 Promise.allSettled 进行并发加载，即使某个请求失败也不会影响其他请求
    const results = await Promise.allSettled([
      // 加载用户列表
      (async () => {
        console.log('📡 并发加载用户列表...')
        const users = await getSimpleUserList()
        if (users && Array.isArray(users)) {
          console.log(`✅ 并发加载用户列表成功，共 ${users.length} 个用户`)
          allUsers.value = users
          
          // 转换为前端需要的格式，限制显示前20个用户
          userOptions.value = users.slice(0, 20).map((user: any) => ({
            value: user.id.toString(),
            label: `${user.nickname || '未知用户'} <${user.deptNames ? user.deptNames.join(', ') : ''}>`,
            avatar: user.avatar || '',
            name: user.nickname || '未知用户',
            userId: user.id,
            deptName: user.deptNames ? user.deptNames.join(', ') : ''
          }))
          
          console.log('🔄 并发初始化用户选项列表:', userOptions.value)
          return { type: 'users', data: users, success: true }
        } else {
          throw new Error('用户列表数据格式错误')
        }
      })(),
      
      // 加载最近联系人
      (async () => {
        console.log('📡 并发加载最近联系人...')
        await loadRecentContacts()
        return { type: 'recentContacts', success: true }
      })(),
      
      // 加载星标联系人
      (async () => {
        console.log('📡 并发加载星标联系人...')
        await loadStarredContacts()
        return { type: 'starredContacts', success: true }
      })(),
    ])
    
    // 处理并发加载结果
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ 并发加载任务 ${index + 1} 成功:`, result.value)
      } else {
        console.error(`❌ 并发加载任务 ${index + 1} 失败:`, result.reason)
      }
    })
    
    // 检查是否有任何任务失败
    const hasFailures = results.some(result => result.status === 'rejected')
    if (hasFailures) {
      console.warn('⚠️ 部分并发加载任务失败')
    }
    
    console.log('🏁 并发加载完成')
  } catch (error: unknown) {
    console.error('❌ 并发加载过程中发生错误:', error)
  }
}

// 搜索用户/联系人 - 基于预加载的用户列表进行过滤
const remoteSearch = async (query: string) => {
  console.log(`🔍 开始搜索联系人，关键词: "${query}"`)
  
  try {
    loading.value = true
    
    if (allUsers.value.length === 0) {
      // 如果还没有预加载用户列表，使用并发加载
      await loadAllData()
    }
    
    // 基于预加载的用户列表进行过滤
    let filteredUsers = allUsers.value
    if (query) {
      const searchTerm = query.toLowerCase().trim()
      
      // 如果搜索词太短，不进行过滤
      if (searchTerm.length < 1) {
        filteredUsers = allUsers.value.slice(0, 20) // 显示前20个用户
      } else {
        filteredUsers = allUsers.value.filter(user => {
          // 只支持姓名前缀匹配
          return user.nickname && user.nickname.toLowerCase().startsWith(searchTerm)
        })
        
        // 按姓名排序
        filteredUsers.sort((a, b) => {
          const aName = (a.nickname || '').toLowerCase()
          const bName = (b.nickname || '').toLowerCase()
          
          return aName.localeCompare(bName)
        })
      }
      
      console.log(`🔍 过滤后找到 ${filteredUsers.length} 个匹配用户`)
    }
    
    // 转换为前端需要的格式，显示部门名称
    userOptions.value = filteredUsers.slice(0, 50).map((user: any) => ({
      value: user.id.toString(), // 使用用户ID作为值
      label: `${user.nickname || '未知用户'} <${user.deptNames ? user.deptNames.join(', ') : ''}>`, // 显示格式：姓名 <部门名称>
      avatar: user.avatar || '',
      name: user.nickname || '未知用户',
      userId: user.id,
      deptName: user.deptNames ? user.deptNames.join(', ') : '' // 使用部门名称
    }))
    
    console.log('🔄 更新用户选项列表:', userOptions.value)
  } catch (error: unknown) {
    console.error('❌ 搜索联系人失败:', error)
    console.error('🔍 搜索错误详情:', {
      message: (error as any)?.message,
      response: (error as any)?.response,
      status: (error as any)?.response?.status
    })
    // 搜索失败时清空用户选项
    userOptions.value = []
  } finally {
    loading.value = false
    console.log('🏁 搜索完成，loading状态:', loading.value)
  }
}

// 切换最近联系人展开状态
const toggleRecentContactsExpand = () => {
  recentContactsExpanded.value = !recentContactsExpanded.value
}

// 切换星标联系人展开状态
const toggleStarredContactsExpand = () => {
  starredContactsExpanded.value = !starredContactsExpanded.value
}

// 格式化最后发送时间
const formatLastSendTime = (timeStr: string): string => {
  if (!timeStr) return ''
  
  const now = new Date()
  const sendTime = new Date(timeStr)
  const diffMs = now.getTime() - sendTime.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffDays > 0) {
    return `${diffDays}天前`
  } else if (diffHours > 0) {
    return `${diffHours}小时前`
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟前`
  } else {
    return '刚刚'
  }
}

// 添加最近联系人为收件人
const addRecentRecipient = (contact: any) => {
  if (contact.name && !mailForm.value.recipients.includes(contact.name)) {
    mailForm.value.recipients.push(contact.name)
    ElMessage.success(`已添加收件人: ${contact.name}`)
  }
}

// 添加星标联系人为收件人
const addStarredRecipient = (contact: LetterContactStarRespVO) => {
  const displayName = starredContactDisplayNames.value.get(contact.id)
  if (displayName && !mailForm.value.recipients.includes(displayName)) {
    mailForm.value.recipients.push(displayName)
    ElMessage.success(`已添加收件人: ${displayName}`)
  }
}

// 显示右键菜单
const showContextMenu = (event: MouseEvent, contact: any, type: 'recent' | 'starred') => {
  // 先关闭之前的菜单
  if (contextMenu.value.visible) {
    contextMenu.value.visible = false
  }
  
  // 使用 nextTick 确保 DOM 更新完成
  nextTick(() => {
    contextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      contact,
      type
    }
    
    // 点击其他地方关闭菜单
    const closeMenu = () => {
      if (contextMenu.value) {
        contextMenu.value.visible = false
      }
      document.removeEventListener('click', closeMenu)
    }
    
    // 延迟添加事件监听器，避免立即触发
    setTimeout(() => {
      document.addEventListener('click', closeMenu)
    }, 100)
  })
}

// 检查联系人是否已星标
const isContactStarred = computed(() => {
  if (!contextMenu.value || !contextMenu.value.contact || !contextMenu.value.type) {
    return false
  }
  
  const contact = contextMenu.value.contact
  if (contextMenu.value.type === 'starred') {
    // 如果是从星标联系人列表右键，说明已经是星标
    return true
  } else if (contextMenu.value.type === 'recent') {
    // 检查最近联系人是否在星标列表中
    return starredContacts.value.some(starred => {
      const starredDisplayName = starredContactDisplayNames.value.get(starred.id)
      return starredDisplayName === contact.name || starred.contactIdCard === contact.idCard
    })
  }
  return false
})

// 切换联系人星标状态
const toggleContactStar = async () => {
  if (!contextMenu.value || !contextMenu.value.contact) return
  
  const contact = contextMenu.value.contact
  const isStarred = isContactStarred.value
  
  try {
    if (isStarred) {
      // 取消星标
      let starredContact
      if (contextMenu.value.type === 'starred') {
        // 如果是从星标联系人列表右键，直接使用当前联系人
        starredContact = contact
      } else {
        // 如果是从最近联系人列表右键，需要查找对应的星标联系人
        starredContact = starredContacts.value.find(starred => {
          const starredDisplayName = starredContactDisplayNames.value.get(starred.id)
          return starredDisplayName === contact.name || starred.contactIdCard === contact.idCard
        })
      }
      
      if (starredContact) {
        await deleteLetterContactStar(starredContact.id)
        const displayName = starredContactDisplayNames.value.get(starredContact.id) || contact.name || '该联系人'
        ElMessage.success(`已取消 ${displayName} 的星标`)
      }
    } else {
      // 添加星标
      console.log('🔍 开始添加星标联系人...')
      console.log('📋 当前联系人信息:', contact)
      console.log('👤 当前用户信息:', userStore.getUser)
      
      // 需要获取联系人的身份证号
      let contactIdCard = contact.idCard
      if (!contactIdCard) {
        // 从用户列表中查找
        const user = allUsers.value.find((u: any) => 
          u.nickname === contact.name
        )
        if (user?.idCard) {
          contactIdCard = user.idCard
        } else {
          // 如果找不到身份证号，尝试使用用户ID作为标识
          contactIdCard = user?.id?.toString() || contact.name
        }
        console.log('🔍 从用户列表查找结果:', user)
        console.log('🆔 最终使用的身份证号:', contactIdCard)
      }
      
      // 验证必要字段
      const currentUser = userStore.getUser
      if (!currentUser.id) {
        throw new Error('用户ID不能为空，请重新登录')
      }
      if (!currentUser.nickname) {
        throw new Error('用户姓名不能为空，请重新登录')
      }
      if (!contactIdCard) {
        throw new Error('联系人身份证号不能为空')
      }
      
      const starData: LetterContactStarCreateReqVO = {
        userId: currentUser.id,
        userName: currentUser.nickname,
        contactIdCard: contactIdCard,
        remark: `从最近联系人添加`
      }
      
      console.log('📤 发送星标数据:', starData)
      
      await createLetterContactStar(starData)
      ElMessage.success(`已为 ${contact.name} 添加星标`)
    }
    
    // 重新加载星标联系人列表
    await loadStarredContacts()
    
    // 关闭右键菜单
    if (contextMenu.value) {
      contextMenu.value.visible = false
    }
  } catch (error: any) {
    console.error('❌ 切换星标状态失败:', error)
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      data: error?.response?.data
    })
    
    let errorMsg = '操作失败，请稍后重试'
    if (error?.response?.data?.message) {
      errorMsg = error.response.data.message
    } else if (error?.message) {
      errorMsg = error.message
    }
    
    // 特殊处理系统异常
    if (errorMsg === '系统异常') {
      errorMsg = '系统异常，可能是数据格式不正确或权限不足。请检查用户信息是否完整。'
    }
    
    ElMessage.error(`操作失败: ${errorMsg}`)
  }
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


// 更新格式按钮状态
const updateFormatStates = () => {
  try {
    // 确保编辑器有焦点
    const editor = document.querySelector('.editor-content') as HTMLElement
    if (editor && document.activeElement !== editor) {
      editor.focus()
    }
    
    // 更新格式状态
    formatStates.value.bold = document.queryCommandState('bold')
    formatStates.value.italic = document.queryCommandState('italic')
    formatStates.value.underline = document.queryCommandState('underline')
  } catch (error) {
    console.error('更新格式状态失败:', error)
  }
}

// 处理编辑器输入
const handleEditorInput = (e: Event) => {
  const target = e.target as HTMLElement
  // 使用textContent获取纯文本，或者使用innerHTML但需要进行XSS过滤
  mailForm.value.content = target.innerHTML
  
  // 应用列表样式
  applyListStyles()
  
  // 更新格式按钮状态
  updateFormatStates()
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
    editorContent.innerHTML = ''
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

// 处理收件人：将姓名转换为身份证号，使用预加载的用户列表
const processRecipients = async (recipients: string[]): Promise<string[]> => {
  const processedIdCards: string[] = []
  
  try {
    // 使用预加载的用户列表
    let users = allUsers.value
    if (users.length === 0) {
      // 如果预加载的用户列表为空，使用并发加载
      await loadAllData()
      users = allUsers.value
    }
    console.log('📋 使用用户列表处理收件人:', users)
    
    for (const recipient of recipients) {
      console.log(`🔍 处理收件人: "${recipient}"`)
      
      // 检查是否已经是身份证号格式（18位数字或带X）
      if (/^[0-9X]{15,18}$/.test(recipient)) {
        // 如果已经是身份证号格式，直接添加
        console.log(`✅ 身份证号格式，直接添加: ${recipient}`)
        processedIdCards.push(recipient)
      } else {
        // 如果是姓名或用户ID，尝试查找对应的身份证号
        const user = users.find((u: any) => 
          u.nickname === recipient || 
          u.id?.toString() === recipient ||
          (u.nickname && u.nickname.toLowerCase().includes(recipient.toLowerCase()))
        )
        if (user && user.idCard) {
          console.log(`✅ 通过姓名/ID找到用户身份证号: ${user.idCard}`)
          processedIdCards.push(user.idCard)
        } else {
          console.log(`⚠️ 通过姓名/ID未找到用户，使用原始值作为标识符: ${recipient}`)
          // 如果找不到用户，使用原始值作为标识符
          processedIdCards.push(recipient)
        }
      }
    }
    
    console.log('📤 处理后的收件人身份证号列表:', processedIdCards)
  } catch (error: unknown) {
    console.error('❌ 获取用户列表失败，使用原始收件人信息:', error)
    // 如果API调用失败，直接使用原始收件人信息
    return recipients
  }
  
  return processedIdCards
}

// 确保所有样式以内联方式保存
const ensureInlineStyles = () => {
  const editor = document.querySelector('.editor-content') as HTMLElement
  if (!editor) return
  
  // 应用列表样式
  applyListStyles()
  
  // 确保所有格式化元素都有内联样式
  const strongElements = editor.querySelectorAll('strong')
  strongElements.forEach(el => {
    const element = el as HTMLElement
    if (!element.style.fontWeight) {
      element.style.fontWeight = 'bold'
    }
  })
  
  const emElements = editor.querySelectorAll('em')
  emElements.forEach(el => {
    const element = el as HTMLElement
    if (!element.style.fontStyle) {
      element.style.fontStyle = 'italic'
    }
  })
  
  const uElements = editor.querySelectorAll('u')
  uElements.forEach(el => {
    const element = el as HTMLElement
    if (!element.style.textDecoration) {
      element.style.textDecoration = 'underline'
    }
  })
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
    
    // 确保所有样式以内联方式保存
    ensureInlineStyles()
    
    // 获取编辑器实际内容
    const editorContent = document.querySelector('.editor-content')?.innerHTML || ''
    
    // 处理收件人：转换为身份证号
    const processedRecipients = await processRecipients(mailForm.value.recipients)
    
    // 处理抄送人：转换为身份证号
    const processedCc = mailForm.value.cc.length > 0 ? await processRecipients(mailForm.value.cc) : []
    
    const sendData: LetterSendReqVO = {
      subject: mailForm.value.subject || '(无主题)',
      content: editorContent,
      recipientIdCards: processedRecipients, // 收件人身份证号列表
      ccIdCards: processedCc.length > 0 ? processedCc : undefined, // 抄送人身份证号列表
      priority: 1, // 默认普通优先级
      isDraft: false, // 不是草稿
      requestReadReceipt: false // 默认不请求已读回执
    }
    
    console.log('发送邮件数据:', sendData)
    console.log('📧 邮件HTML内容预览:', editorContent)
    
    // 检查用户登录状态
    const currentToken = getAccessToken()
    console.log('🔑 当前 accessToken:', currentToken ? '已设置' : '未设置')
    console.log('👤 用户信息:', userStore.getUser)
    
    if (!currentToken) {
      ElMessage.error('用户未登录，请先登录')
      router.push('/login')
      return
    }
    
    // 直接调用发送信件API，axios拦截器会自动携带token
    await sendLetter(sendData)
    ElMessage.success('邮件发送成功')
    
    // 清空表单
    resetForm()
    
    // 关闭当前标签页
    const currentRoute = router.currentRoute.value
    tagsViewStore.delView(currentRoute)
    
    // 跳转到邮件列表页面
    router.push('/mail/index')
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
    // 确保所有样式以内联方式保存
    ensureInlineStyles()
    
    // 获取编辑器实际内容
    const editorContent = document.querySelector('.editor-content')?.innerHTML || ''
    
    // 处理收件人：转换为身份证号
    const processedRecipients = await processRecipients(mailForm.value.recipients)
    
    // 处理抄送人：转换为身份证号
    const processedCc = mailForm.value.cc.length > 0 ? await processRecipients(mailForm.value.cc) : []
    
    const draftData: LetterSendReqVO = {
      subject: mailForm.value.subject,
      content: editorContent,
      recipientIdCards: processedRecipients.length > 0 ? processedRecipients : [], // 收件人身份证号列表（草稿可以为空）
      ccIdCards: processedCc.length > 0 ? processedCc : undefined, // 抄送人身份证号列表
      priority: 1,
      isDraft: true, // 是草稿
      requestReadReceipt: false
    }
    
    console.log('保存草稿数据:', draftData)
    console.log('📝 草稿HTML内容预览:', editorContent)
    
    await saveDraft(draftData)
    ElMessage.success('草稿保存成功')
  } catch (error: any) {
    console.error('保存草稿失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '网络错误，请稍后重试'
    ElMessage.error(`保存失败: ${errorMsg}`)
  }
}

// 应用列表样式 - 确保所有样式以内联方式保存
const applyListStyles = () => {
  const editor = document.querySelector('.editor-content') as HTMLElement
  if (!editor) return
  
  // 统一处理所有列表元素
  const allLists = editor.querySelectorAll('ol, ul')
  
  allLists.forEach(list => {
    const listElement = list as HTMLElement
    
    // 使用 cssText 确保样式被完整保存到HTML中
    listElement.style.cssText = 'margin: 0; padding-left: 30px; list-style-position: outside;'
    
    // 为有序列表设置样式类型
    if (list.tagName.toLowerCase() === 'ol') {
      listElement.style.listStyleType = 'decimal'
    } else {
      listElement.style.listStyleType = 'disc'
    }
    
    // 应用列表项样式
    const listItems = list.querySelectorAll('li')
    listItems.forEach(li => {
      const liElement = li as HTMLElement
      // 使用 cssText 确保样式被完整保存
      liElement.style.cssText = 'margin: 4px 0; padding-left: 8px; line-height: 1.5;'
    })
  })
  
  // 处理段落样式
  const paragraphs = editor.querySelectorAll('p')
  paragraphs.forEach(p => {
    const pElement = p as HTMLElement
    // 确保段落样式也被保存
    if (!pElement.style.margin) {
      pElement.style.margin = '8px 0'
    }
    if (!pElement.style.lineHeight) {
      pElement.style.lineHeight = '1.5'
    }
  })
}

// 获取字体族名称
const getFontFamily = (fontName: string): string => {
  const fontMap: { [key: string]: string } = {
    '宋体': 'SimSun, "宋体", serif',
    '黑体': 'SimHei, "黑体", sans-serif',
    '楷书': 'KaiTi, "楷体", serif',
    '幼圆': 'YouYuan, "幼圆", sans-serif'
  }
  return fontMap[fontName] || 'SimSun, "宋体", serif'
}

// 获取字号大小
const getFontSize = (sizeName: string): string => {
  const sizeMap: { [key: string]: string } = {
    '小': '12px',
    '中': '14px',
    '大': '16px',
    '较大': '18px',
    '最大': '20px'
  }
  return sizeMap[sizeName] || '14px'
}

// 切换字体
const changeFont = (fontName: string) => {
  // 更新选中的字体
  selectedFont.value = fontName
  
  const editor = document.querySelector('.editor-content') as HTMLElement
  if (!editor) return
  
  // 确保编辑器获得焦点
  editor.focus()
  
  // 获取当前选择
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    // 如果没有选择文本，设置整个编辑器的字体
    editor.style.fontFamily = getFontFamily(fontName)
    return
  }
  
  const range = selection.getRangeAt(0)
  const selectedText = range.toString()
  
  if (selectedText) {
    // 如果有选中的文本，只对选中文本应用字体
    const span = document.createElement('span')
    span.style.fontFamily = getFontFamily(fontName)
    span.textContent = selectedText
    range.deleteContents()
    range.insertNode(span)
    
    // 清除选择
    selection.removeAllRanges()
  } else {
    // 如果没有选中文本，设置整个编辑器的字体
    editor.style.fontFamily = getFontFamily(fontName)
  }
  
  // 更新编辑器内容
  handleEditorInput({ target: editor } as any)
}

// 切换字号
const changeFontSize = (sizeName: string) => {
  // 更新选中的字号
  selectedFontSize.value = sizeName
  
  const editor = document.querySelector('.editor-content') as HTMLElement
  if (!editor) return
  
  // 确保编辑器获得焦点
  editor.focus()
  
  // 获取当前选择
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    // 如果没有选择文本，设置整个编辑器的字号
    editor.style.fontSize = getFontSize(sizeName)
    return
  }
  
  const range = selection.getRangeAt(0)
  const selectedText = range.toString()
  
  if (selectedText) {
    // 如果有选中的文本，只对选中文本应用字号
    const span = document.createElement('span')
    span.style.fontSize = getFontSize(sizeName)
    span.textContent = selectedText
    range.deleteContents()
    range.insertNode(span)
    
    // 清除选择
    selection.removeAllRanges()
  } else {
    // 如果没有选中文本，设置整个编辑器的字号
    editor.style.fontSize = getFontSize(sizeName)
  }
  
  // 更新编辑器内容
  handleEditorInput({ target: editor } as any)
}

// 文本格式化命令
const execFormatCommand = (command: string) => {
  // 获取编辑器元素
  const editor = document.querySelector('.editor-content') as HTMLElement
  if (!editor) {
    return
  }
  
  // 确保编辑器获得焦点
  editor.focus()
  
  // 获取当前选择
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    return
  }
  
  // 使用现代方法处理格式化
  try {
    // 执行格式化命令
    const success = document.execCommand(command, false, '')
    
    // 如果 execCommand 失败，尝试使用 Selection API
    if (!success) {
      const range = selection.getRangeAt(0)
      const selectedText = range.toString()
      
      if (selectedText) {
        // 创建格式化元素
        let formatElement: HTMLElement
        switch (command) {
          case 'bold':
            formatElement = document.createElement('strong')
            formatElement.style.fontWeight = 'bold'
            break
          case 'italic':
            formatElement = document.createElement('em')
            formatElement.style.fontStyle = 'italic'
            break
          case 'underline':
            formatElement = document.createElement('u')
            formatElement.style.textDecoration = 'underline'
            break
          default:
            return
        }
        
        // 应用格式化
        formatElement.textContent = selectedText
        range.deleteContents()
        range.insertNode(formatElement)
        
        // 清除选择
        selection.removeAllRanges()
      }
    }
    
    // 如果是列表命令，直接应用样式
    if (command === 'insertOrderedList' || command === 'insertUnorderedList') {
      setTimeout(() => {
        applyListStyles()
      }, 50)
    }
    
    // 格式应用完成后，延迟更新状态确保DOM已更新
    setTimeout(() => {
      updateFormatStates()
    }, 100)
    
  } catch (error) {
    console.error('格式化命令执行失败:', error)
  }
}

onMounted(async () => {
  // 添加全局选择变化监听器
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const editor = document.querySelector('.editor-content')
      if (editor && editor.contains(range.commonAncestorContainer)) {
        updateFormatStates()
      }
    }
  })
  
  // 设置编辑器默认字体和字号
  const editor = document.querySelector('.editor-content') as HTMLElement
  if (editor) {
    editor.style.fontFamily = getFontFamily(selectedFont.value)
    editor.style.fontSize = getFontSize(selectedFontSize.value)
  }
  
  // 并发加载所有数据
  await loadAllData()
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
.content-wrapper {
  display: flex;
  flex: 1;
  background-color: #f5f7f9;
  padding: 8px;
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
  width: 100%;
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

.tool-btn.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.tool-btn.active:hover {
  background-color: #337ecc;
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

.tool-select {
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

.tool-select:hover {
  background-color: #f0f0f0;
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

/* 编辑器内容区 */
.editor-content {
  flex: 1;
  padding: 15px 20px;
  overflow-y: auto;
  min-height: 250px;
  outline: none;
  color: #303133;
  font-size: 14px;
  font-family: SimSun, "宋体", serif; /* 默认宋体 */
}

/* 字体选择器样式 */
.font-select {
  margin-right: 8px;
}

.font-select .el-input__inner {
  font-size: 12px;
  height: 28px;
  line-height: 28px;
}

/* 字体样式定义 */
.font-songti {
  font-family: SimSun, "宋体", serif;
}

.font-heiti {
  font-family: SimHei, "黑体", sans-serif;
}

.font-kaishu {
  font-family: KaiTi, "楷体", serif;
}

.font-youyuan {
  font-family: YouYuan, "幼圆", sans-serif;
}

/* 字号样式定义 */
.font-size-small {
  font-size: 12px;
}

.font-size-medium {
  font-size: 14px;
}

.font-size-large {
  font-size: 16px;
}

.font-size-larger {
  font-size: 18px;
}

.font-size-largest {
  font-size: 20px;
}


/* 列表样式 */
.mail-container .editor-content ol,
.mail-container .editor-content ul {
  margin: 0 !important;
  padding-left: 30px !important;
  list-style-position: outside !important;
}

.mail-container .editor-content ol {
  list-style-type: decimal !important;
}

.mail-container .editor-content ul {
  list-style-type: disc !important;
}

.mail-container .editor-content ol li,
.mail-container .editor-content ul li {
  margin: 4px 0 !important;
  padding-left: 8px !important;
  line-height: 1.5 !important;
}

/* 嵌套列表样式 */
.mail-container .editor-content ol ol,
.mail-container .editor-content ul ul,
.mail-container .editor-content ol ul,
.mail-container .editor-content ul ol {
  padding-left: 20px !important;
}

/* 段落样式 */
.mail-container .editor-content p {
  margin: 8px 0 !important;
  line-height: 1.5 !important;
}

/* 编辑器placeholder样式 */
.editor-content:empty:before {
  content: attr(data-placeholder);
  color: #c0c4cc;
  pointer-events: none;
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

/* 星标联系人特殊样式 */
.folder-badge {
  margin-left: auto;
  background-color: #909399;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 6px 4px;
  cursor: pointer;
  font-size: 12px;
  color: #333;
  border-radius: 2px;
  margin-bottom: 2px;
  transition: background-color 0.2s;
}

.folder-item:hover {
  background-color: #f5f5f5;
}

.folder-icon {
  margin-right: 6px;
  transition: transform 0.2s;
}

.folder-name {
  flex: 1;
  font-weight: 500;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 120px;
  overflow: hidden;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f5f7fa;
}

.context-menu-item .el-icon {
  margin-right: 8px;
  font-size: 16px;
}
</style>
