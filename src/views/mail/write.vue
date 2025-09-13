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
      </div>
    </div>
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="tool-btn primary" :class="{ 'disabled': sending }" @click="sendMailHandler">
              <el-icon><Position /></el-icon>
              <span>{{ sending ? '发送中...' : '发送' }}</span>
            </div>
            <div class="tool-btn" @click="triggerFileUpload">
              <el-icon><Files /></el-icon>
              <span>附件</span>
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
                @focus="activeRecipientField = 'recipients'"
                @click="activeRecipientField = 'recipients'"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="user-option">
                    <el-avatar :size="24" :src="item.avatar">{{ item.name?.substring(0, 1) || '?' }}</el-avatar>
                    <div class="user-info">
                      <div class="user-name">{{ item.name }}</div>
                      <div class="user-details">
                        <span v-if="item.deptName" class="dept-info">{{ item.deptName }}</span>
                        <span v-if="item.workId" class="work-id">工号: {{ item.workId }}</span>
                        <span v-if="item.email" class="email-info">{{ item.email }}</span>
                      </div>
                    </div>
                  </div>
                </el-option>
              </el-select>
            </div>
            <div class="form-actions">
              <span class="action-link" @click="showCc = !showCc; if(showCc) activeRecipientField = 'cc'">抄送</span>
              <span class="action-link" @click="showBcc = !showBcc; if(showBcc) activeRecipientField = 'bcc'">密送</span>
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
                @focus="activeRecipientField = 'cc'"
                @click="activeRecipientField = 'cc'"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="user-option">
                    <el-avatar :size="24" :src="item.avatar">{{ item.name?.substring(0, 1) || '?' }}</el-avatar>
                    <div class="user-info">
                      <div class="user-name">{{ item.name }}</div>
                      <div class="user-details">
                        <span v-if="item.deptName" class="dept-info">{{ item.deptName }}</span>
                        <span v-if="item.workId" class="work-id">工号: {{ item.workId }}</span>
                        <span v-if="item.email" class="email-info">{{ item.email }}</span>
                      </div>
                    </div>
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
                @focus="activeRecipientField = 'bcc'"
                @click="activeRecipientField = 'bcc'"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="user-option">
                    <el-avatar :size="24" :src="item.avatar">{{ item.name?.substring(0, 1) || '?' }}</el-avatar>
                    <div class="user-info">
                      <div class="user-name">{{ item.name }}</div>
                      <div class="user-details">
                        <span v-if="item.deptName" class="dept-info">{{ item.deptName }}</span>
                        <span v-if="item.workId" class="work-id">工号: {{ item.workId }}</span>
                        <span v-if="item.email" class="email-info">{{ item.email }}</span>
                      </div>
                    </div>
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
        
        <!-- TextEditor 富文本编辑器 -->
        <div class="text-editor-container" style="flex: 1; padding: 20px; background-color: #ffffff;">
          <TextEditor
            v-model="mailForm.content"
            :height="'400px'"
            @change="handleEditorChange"
            @created="handleEditorCreated"
          />
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
        <div v-if="attachmentList.length > 0 || mailForm.attachments.length > 0" class="attachments-section" style="padding: 15px 20px; border-top: 1px solid #e0e0e0; background-color: #fafafa; max-height: 300px; overflow-y: auto;">
          <div class="attachments-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div class="attachments-title" style="font-size: 14px; font-weight: 500; color: #303133;">
              <el-icon style="margin-right: 5px; color: #409eff;"><Files /></el-icon>
              附件 ({{ attachmentList.length + mailForm.attachments.length }})
            </div>
            <div class="attachments-actions" style="display: flex; gap: 8px;">
              <el-button 
                v-if="attachmentList.length > 0" 
                size="small" 
                type="danger" 
                plain
                @click="batchRemoveAttachments(attachmentList.map(a => a.id))"
              >
                清空所有
              </el-button>
            </div>
          </div>
          
          <!-- 已上传的附件 -->
          <div v-if="attachmentList.length > 0" class="uploaded-attachments" style="margin-bottom: 10px;">
            <div 
              v-for="(attachment, index) in attachmentList" 
              :key="attachment.id"
              class="attachment-item uploaded"
              style="display: flex; flex-direction: column; align-items: flex-start; padding: 12px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 8px; transition: all 0.2s; min-height: 60px;"
            >
              <div class="attachment-info" style="flex: 1; min-width: 0; width: 100%; display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                <div class="attachment-name" style="font-size: 14px; font-weight: 500; color: #303133; flex: 1; min-width: 0; word-break: break-word; line-height: 1.4;">
                  {{ attachment.fileName }}
                </div>
                <div class="attachment-actions" style="flex-shrink: 0; margin-top: 2px; display: flex; gap: 5px;">
                  <el-button 
                    size="small" 
                    type="primary" 
                    plain
                    @click="downloadAttachmentFile(attachment)"
                    title="下载"
                  >
                    <el-icon><Download /></el-icon>
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    plain
                    @click="removeUploadedAttachment(attachment.id, index)"
                    title="删除"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
               <div class="attachment-details" style="display: flex; gap: 12px; font-size: 12px; color: #909399; width: 100%; margin-top: 4px;">
                 <span class="file-size" style="color: #606266;">{{ formatFileSize(attachment.fileSize) }}</span>
                 <span v-if="attachment.fileExtension" class="file-type">{{ attachment.fileExtension.toUpperCase() }}</span>
                 <span v-if="attachment.downloadCount > 0">下载 {{ attachment.downloadCount }} 次</span>
               </div>
            </div>
          </div>
          
          <!-- 本地文件（未上传） -->
          <div v-if="mailForm.attachments.length > 0" class="local-attachments" style="margin-bottom: 10px;">
            <div 
              v-for="(file, index) in mailForm.attachments" 
              :key="index"
              class="attachment-item local"
              style="display: flex; flex-direction: column; align-items: flex-start; padding: 12px; background: #fff7e6; border: 1px solid #ffd591; border-radius: 8px; margin-bottom: 8px; min-height: 60px;"
            >
              <div class="attachment-info" style="flex: 1; min-width: 0; width: 100%; display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                <div class="attachment-name" style="font-size: 14px; font-weight: 500; color: #303133; flex: 1; min-width: 0; word-break: break-word; line-height: 1.4;">
                  {{ file.name }}
                </div>
                <div class="attachment-actions" style="flex-shrink: 0; margin-top: 2px;">
                  <el-button 
                    size="small" 
                    type="danger" 
                    plain
                    @click="removeAttachment(index)"
                    title="删除"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="attachment-details" style="display: flex; gap: 12px; font-size: 12px; color: #909399; width: 100%; margin-top: 4px;">
                <span class="file-size" style="color: #606266;">{{ formatFileSize(file.size) }}</span>
                <span v-if="getFileExtension(file.name)" class="file-type">{{ getFileExtension(file.name).toUpperCase() }}</span>
                <span style="color: #fa8c16; background: #fff3cd; padding: 2px 6px; border-radius: 4px; font-weight: 500; font-size: 11px;">待上传</span>
              </div>
            </div>
          </div>
          
          <!-- 上传进度 -->
          <div v-if="uploading" class="upload-progress" style="margin-top: 10px;">
            <el-progress 
              :percentage="uploadProgress" 
              :show-text="true"
              :stroke-width="6"
              status="success"
            />
            <div style="text-align: center; font-size: 12px; color: #909399; margin-top: 5px;">
              正在上传附件...
            </div>
          </div>
          
          <!-- 附件统计信息 -->
          <div v-if="(attachmentList.length + mailForm.attachments.length) > 0" class="attachment-stats" :style="getAttachmentStatsStyle()">
            <el-icon style="margin-right: 5px;"><InfoFilled /></el-icon>
            <div class="stats-content">
              <div class="stats-main">
                当前邮件 {{ attachmentList.length + mailForm.attachments.length }} 个附件，大小 {{ formatCurrentAttachmentSize() }}
              </div>
              <div class="stats-limit">
                限制：单个文件 ≤ 50MB，总大小 ≤ 100MB
              </div>
              <div v-if="isAttachmentSizeWarning()" class="stats-warning">
                ⚠️ 附件总大小接近限制，建议减少附件数量
              </div>
            </div>
          </div>
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
import {useRoute, useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useUserStore} from '@/store/modules/user'
import {useTagsViewStore} from '@/store/modules/tagsView'
import TextEditor from '@/views/mail/components/TextEditor.vue'
import {
  createLetterContactStar,
  deleteLetterContactStar,
  getLetterContactStarPage,
  getSentMails,
  type LetterContactStarCreateReqVO,
  type LetterContactStarRespVO,
  type LetterSendReqVO,
  type MailListItemVO,
  sendLetter,
  // 附件相关API
  uploadAttachmentsBatchWithProgress,
  downloadFileToLocal,
  deleteAttachment,
  batchDeleteAttachments,
  getAttachmentInfo,
  getFileExtension,
  type AttachmentInfoRespVO
} from '@/api/system/mail/letter/index'
import { getDraft, createDraft, updateDraft, type LetterDraftRespVO, type LetterDraftCreateReqVO, type LetterDraftUpdateReqVO } from '@/api/system/mail/draft'
import {getSimpleUserList, getUserByIdCard} from '@/api/system/user'
import {getAccessToken} from '@/utils/auth'
import '@/views/mail/mail.css'
import topImage from '@/views/mail/image/top.png'

import {
  ArrowDown,
  Delete,
  Download,
  Files,
  InfoFilled,
  Position,
  Setting,
  Star
} from '@element-plus/icons-vue'


const router = useRouter()
const route = useRoute()
const tagsViewStore = useTagsViewStore()

// 表单数据
const mailForm = ref<{
  recipients: string[]
  cc: string[]
  bcc: string[]
  subject: string
  content: string
  attachments: File[]
  attachmentIds: number[] // 已上传的附件ID列表
}>({
  recipients: [],
  cc: [],
  bcc: [],
  subject: '',
  content: '',
  attachments: [],
  attachmentIds: []
})

// UI状态
const showCc = ref(false)
const showBcc = ref(false)
const contactSearch = ref('')
const loading = ref(false)
const activeRecipientField = ref<'recipients' | 'cc' | 'bcc'>('recipients') // 当前激活的收件人字段
const sending = ref(false) // 发送状态，防止重复发送

// 附件相关状态
const uploading = ref(false)
const uploadProgress = ref(0)
const attachmentList = ref<AttachmentInfoRespVO[]>([]) // 已上传的附件信息列表
const tempAttachmentList = ref<AttachmentInfoRespVO[]>([]) // 临时附件列表

// TextEditor 相关状态
const editorInstance = ref<any>(null)
const editorReady = ref(false)

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


// 当前草稿ID（用于判断创建还是更新）
const currentDraftId = ref<number | null>(null)

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
    
    // 如果输入为空或只有空格，不进行联想搜索
    if (!query || !query.trim()) {
      console.log('🔍 输入为空，清空联想选项')
      userOptions.value = []
      return
    }
    
    if (allUsers.value.length === 0) {
      // 如果还没有预加载用户列表，使用并发加载
      await loadAllData()
    }
    
    const searchTerm = query.toLowerCase().trim()
    
    // 如果搜索词太短，不进行过滤
    if (searchTerm.length < 1) {
      console.log('🔍 搜索词太短，清空联想选项')
      userOptions.value = []
      return
    }
    
    // 基于预加载的用户列表进行过滤
    const filteredUsers = allUsers.value.filter(user => {
      // 姓名使用模糊匹配，工号和邮箱使用前缀匹配
      const nickname = (user.nickname || '').toLowerCase()
      const workId = (user.workId || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      
      return nickname.includes(searchTerm) || 
             workId.startsWith(searchTerm) || 
             email.startsWith(searchTerm)
    })
    
    // 按姓名排序
    filteredUsers.sort((a, b) => {
      const aName = (a.nickname || '').toLowerCase()
      const bName = (b.nickname || '').toLowerCase()
      
      return aName.localeCompare(bName)
    })
    
    console.log(`🔍 过滤后找到 ${filteredUsers.length} 个匹配用户`)
    
    // 转换为前端需要的格式，显示部门名称、工号和邮箱
    userOptions.value = filteredUsers.slice(0, 50).map((user: any) => {
      const nickname = user.nickname || '未知用户'
      const deptName = user.deptNames ? user.deptNames.join(', ') : ''
      const workId = user.workId || ''
      const email = user.email || ''
      
      // 构建显示标签，包含姓名、部门、工号和邮箱信息
      let label = nickname
      if (deptName) label += ` <${deptName}>`
      if (workId) label += ` <工号:${workId}>`
      if (email) label += ` <${email}>`
      
      return {
        value: user.id.toString(), // 使用用户ID作为值
        label: label, // 显示格式：姓名 <部门名称> <工号:xxx> <邮箱>
        avatar: user.avatar || '',
        name: nickname,
        userId: user.id,
        deptName: deptName,
        workId: workId,
        email: email
      }
    })
    
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
  if (!contact.name) return
  
  // 根据当前激活的字段决定添加到哪个列表
  switch (activeRecipientField.value) {
    case 'cc':
      if (!mailForm.value.cc.includes(contact.name)) {
        mailForm.value.cc.push(contact.name)
        ElMessage.success(`已添加抄送人: ${contact.name}`)
      }
      break
    case 'bcc':
      if (!mailForm.value.bcc.includes(contact.name)) {
        mailForm.value.bcc.push(contact.name)
        ElMessage.success(`已添加密送人: ${contact.name}`)
      }
      break
    case 'recipients':
    default:
      if (!mailForm.value.recipients.includes(contact.name)) {
        mailForm.value.recipients.push(contact.name)
        ElMessage.success(`已添加收件人: ${contact.name}`)
      }
      break
  }
}

// 添加星标联系人为收件人
const addStarredRecipient = (contact: LetterContactStarRespVO) => {
  const displayName = starredContactDisplayNames.value.get(contact.id)
  if (!displayName) return
  
  // 根据当前激活的字段决定添加到哪个列表
  switch (activeRecipientField.value) {
    case 'cc':
      if (!mailForm.value.cc.includes(displayName)) {
        mailForm.value.cc.push(displayName)
        ElMessage.success(`已添加抄送人: ${displayName}`)
      }
      break
    case 'bcc':
      if (!mailForm.value.bcc.includes(displayName)) {
        mailForm.value.bcc.push(displayName)
        ElMessage.success(`已添加密送人: ${displayName}`)
      }
      break
    case 'recipients':
    default:
      if (!mailForm.value.recipients.includes(displayName)) {
        mailForm.value.recipients.push(displayName)
        ElMessage.success(`已添加收件人: ${displayName}`)
      }
      break
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
      document.removeEventListener('wheel', closeMenu)
    }
    
    // 延迟添加事件监听器，避免立即触发
    setTimeout(() => {
      document.addEventListener('click', closeMenu)
      // 鼠标滚轮滚动时关闭菜单
      document.addEventListener('wheel', closeMenu)
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

// TextEditor 相关方法
// 编辑器创建完成回调
const handleEditorCreated = (editor: any) => {
  editorInstance.value = editor
  editorReady.value = true
  console.log('TextEditor 创建完成:', editor)
  // 若已有内容，延迟注入到编辑器，避免 Slate DOM 映射错误
  if (mailForm.value.content) {
    nextTick(() => {
      try {
        editorInstance.value?.setHtml?.(mailForm.value.content)
      } catch (e) {
        console.warn('延迟设置编辑器内容失败:', e)
      }
    })
  }
}

// 编辑器内容变化回调
const handleEditorChange = (editor: any) => {
  // 内容变化时的处理逻辑
  console.log('编辑器内容变化:', editor.getHtml())
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

// 计算当前邮件的附件总大小
const formatCurrentAttachmentSize = (): string => {
  let totalSize = 0
  
  // 计算已上传附件的大小
  attachmentList.value.forEach(attachment => {
    totalSize += attachment.fileSize || 0
  })
  
  // 计算本地文件的大小
  mailForm.value.attachments.forEach(file => {
    totalSize += file.size
  })
  
  return formatFileSize(totalSize)
}

// 获取当前附件总大小（字节）
const getCurrentAttachmentSizeBytes = (): number => {
  let totalSize = 0
  
  // 计算已上传附件的大小
  attachmentList.value.forEach(attachment => {
    totalSize += attachment.fileSize || 0
  })
  
  // 计算本地文件的大小
  mailForm.value.attachments.forEach(file => {
    totalSize += file.size
  })
  
  return totalSize
}

// 检查是否显示附件大小警告
const isAttachmentSizeWarning = (): boolean => {
  const currentSize = getCurrentAttachmentSizeBytes()
  const totalMaxSize = 100 * 1024 * 1024 // 100MB
  const warningThreshold = totalMaxSize * 0.8 // 80%时显示警告
  
  return currentSize > warningThreshold
}

// 获取附件统计信息的样式
const getAttachmentStatsStyle = () => {
  const currentSize = getCurrentAttachmentSizeBytes()
  const totalMaxSize = 100 * 1024 * 1024 // 100MB
  
  if (currentSize > totalMaxSize) {
    // 超过限制，显示错误样式
    return {
      marginTop: '10px',
      padding: '8px 12px',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#dc2626'
    }
  } else if (isAttachmentSizeWarning()) {
    // 接近限制，显示警告样式
    return {
      marginTop: '10px',
      padding: '8px 12px',
      background: '#fffbeb',
      border: '1px solid #fed7aa',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#d97706'
    }
  } else {
    // 正常状态
    return {
      marginTop: '10px',
      padding: '8px 12px',
      background: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#0369a1'
    }
  }
}

// 删除附件（从本地文件列表）
const removeAttachment = (index: number) => {
  const fileName = mailForm.value.attachments[index].name
  mailForm.value.attachments.splice(index, 1)
  ElMessage.success(`已删除附件: ${fileName}`)
}

// 删除已上传的附件
const removeUploadedAttachment = async (attachmentId: number, index: number) => {
  try {
    await deleteAttachment(attachmentId)
    
    // 从表单中移除附件ID
    const idIndex = mailForm.value.attachmentIds.indexOf(attachmentId)
    if (idIndex > -1) {
      mailForm.value.attachmentIds.splice(idIndex, 1)
    }
    
    // 从附件列表中移除
    attachmentList.value.splice(index, 1)
    
    ElMessage.success('附件删除成功')
  } catch (error: any) {
    console.error('删除附件失败:', error)
    ElMessage.error(`删除失败: ${error.message || '网络错误'}`)
  }
}

// 下载附件
const downloadAttachmentFile = async (attachment: AttachmentInfoRespVO) => {
  try {
    await downloadFileToLocal(attachment.id, attachment.fileName)
    ElMessage.success('下载开始')
  } catch (error: any) {
    console.error('下载附件失败:', error)
    ElMessage.error(`下载失败: ${error.message || '网络错误'}`)
  }
}

// 批量删除附件
const batchRemoveAttachments = async (attachmentIds: number[]) => {
  try {
    await batchDeleteAttachments({ attachmentIds })
    
    // 从表单中移除附件ID
    mailForm.value.attachmentIds = mailForm.value.attachmentIds.filter(id => !attachmentIds.includes(id))
    
    // 从附件列表中移除
    attachmentList.value = attachmentList.value.filter(attachment => !attachmentIds.includes(attachment.id))
    
    ElMessage.success(`成功删除 ${attachmentIds.length} 个附件`)
  } catch (error: any) {
    console.error('批量删除附件失败:', error)
    ElMessage.error(`删除失败: ${error.message || '网络错误'}`)
  }
}

// 重置表单
const resetForm = () => {
  mailForm.value = {
    recipients: [],
    cc: [],
    bcc: [],
    subject: '',
    content: '',
    attachments: [],
    attachmentIds: []
  }
  
  // 重置编辑器内容
  if (editorInstance.value) {
    editorInstance.value.clear()
  }
  
  // 重置附件相关状态
  attachmentList.value = []
  tempAttachmentList.value = []
  uploading.value = false
  uploadProgress.value = 0
  
  // 重置发送状态
  sending.value = false
  
  // 隐藏抄送和密送
  showCc.value = false
  showBcc.value = false
}

// 处理文件上传
const handleFileUpload = async (files: FileList | null) => {
  if (!files || files.length === 0) return
  
  const newFiles = Array.from(files)
  
  try {
    // 验证文件
    const validationResult = validateFiles(newFiles)
    if (!validationResult.valid) {
      ElMessage.error(validationResult.message)
      return
    }
    
    uploading.value = true
    uploadProgress.value = 0
    
    // 使用批量上传API
    const attachmentIds = await uploadAttachmentsBatchWithProgress(
      newFiles,
      (completed, total) => {
        uploadProgress.value = Math.round((completed / total) * 100)
      }
    )
    
    // 添加到表单的附件ID列表
    console.log('📎 上传前 attachmentIds:', mailForm.value.attachmentIds)
    console.log('📎 新上传的 attachmentIds:', attachmentIds)
    mailForm.value.attachmentIds.push(...attachmentIds)
    console.log('📎 上传后 attachmentIds:', mailForm.value.attachmentIds)
    
    // 获取上传后的附件信息
    await loadAttachmentInfo(attachmentIds)
    
    ElMessage.success(`成功上传 ${newFiles.length} 个附件`)
    
  } catch (error: any) {
    console.error('文件上传失败:', error)
    ElMessage.error(`上传失败: ${error.message || '网络错误'}`)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// 验证文件
const validateFiles = (files: File[]) => {
  const singleFileMaxSize = 50 * 1024 * 1024 // 50MB
  const totalMaxSize = 100 * 1024 * 1024 // 100MB
  
  // 计算当前已上传附件的大小
  let currentTotalSize = 0
  attachmentList.value.forEach(attachment => {
    currentTotalSize += attachment.fileSize || 0
  })
  
  // 计算当前本地文件的大小
  mailForm.value.attachments.forEach(file => {
    currentTotalSize += file.size
  })
  
  // 计算新文件的总大小
  let newFilesTotalSize = 0
  for (const file of files) {
    newFilesTotalSize += file.size
  }
  
  // 检查单个文件大小限制
  for (const file of files) {
    if (file.size > singleFileMaxSize) {
      return {
        valid: false,
        message: `文件 "${file.name}" 超过单个文件50MB大小限制（当前大小：${formatFileSize(file.size)}）`
      }
    }
  }
  
  // 检查总附件大小限制
  if (currentTotalSize + newFilesTotalSize > totalMaxSize) {
    return {
      valid: false,
      message: `附件总大小超过100MB限制。当前已使用：${formatFileSize(currentTotalSize)}，新增：${formatFileSize(newFilesTotalSize)}，总计：${formatFileSize(currentTotalSize + newFilesTotalSize)}`
    }
  }
  
  return { valid: true, message: '' }
}

// 加载附件信息
const loadAttachmentInfo = async (attachmentIds: number[]) => {
  try {
    for (const id of attachmentIds) {
      const info = await getAttachmentInfo(id)
      attachmentList.value.push(info)
    }
  } catch (error) {
    console.error('加载附件信息失败:', error)
  }
}


// 加载临时附件列表
const loadTempAttachments = async () => {
  try {
    // 临时附件列表功能已被移除，设置为空数组
    tempAttachmentList.value = []
    console.log('临时附件列表功能已禁用')
  } catch (error) {
    console.error('加载临时附件失败:', error)
  }
}

// 发送邮件
const sendMailHandler = async () => {
  // 防止重复发送
  if (sending.value) {
    ElMessage.warning('正在发送中，请稍候...')
    return
  }
  
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

// 执行发送邮件
const doSendMail = async () => {
  try {
    sending.value = true
    loading.value = true
    
    // 验证必填字段
    if (!mailForm.value.recipients.length) {
      ElMessage.warning('请选择收件人')
      return
    }
    
    // 验证附件大小限制
    const currentSize = getCurrentAttachmentSizeBytes()
    const totalMaxSize = 100 * 1024 * 1024 // 100MB
    if (currentSize > totalMaxSize) {
      ElMessage.error(`附件总大小超过100MB限制，当前大小：${formatCurrentAttachmentSize()}`)
      return
    }
    
    // 获取编辑器内容
    const editorContent = editorInstance.value?.getHtml() || mailForm.value.content
    
    // 处理收件人：转换为身份证号
    const processedRecipients = await processRecipients(mailForm.value.recipients)
    
    // 处理抄送人：转换为身份证号
    const processedCc = mailForm.value.cc.length > 0 ? await processRecipients(mailForm.value.cc) : []
    
    // 处理密送人：转换为身份证号
    const processedBcc = mailForm.value.bcc.length > 0 ? await processRecipients(mailForm.value.bcc) : []
    
    // 后端在发送邮件时会自动处理附件转换
    if (mailForm.value.attachmentIds.length > 0) {
      console.log('📎 邮件包含附件，将由后端自动处理:')
      console.log('📎 附件ID列表:', mailForm.value.attachmentIds)
      console.log('📎 附件数量:', mailForm.value.attachmentIds.length)
    } else {
      console.log('📎 邮件不包含附件')
    }
    
    const sendData: LetterSendReqVO = {
      subject: mailForm.value.subject || '(无主题)',
      content: editorContent,
      recipientIdCards: processedRecipients, // 收件人身份证号列表
      ccIdCards: processedCc.length > 0 ? processedCc : undefined, // 抄送人身份证号列表
      bccIdCards: processedBcc.length > 0 ? processedBcc : undefined, // 密送人身份证号列表
      priority: 1, // 默认普通优先级
      requestReadReceipt: false, // 默认不请求已读回执
      attachmentIds: mailForm.value.attachmentIds.length > 0 ? mailForm.value.attachmentIds : undefined // 附件ID列表
    }
    
    console.log('发送邮件数据:', sendData)
    console.log('📧 邮件HTML内容预览:', editorContent)
    console.log('📎 发送时的附件ID列表:', mailForm.value.attachmentIds)
    console.log('📎 发送时的附件ID数量:', mailForm.value.attachmentIds.length)
    console.log('📎 当前显示的附件列表:', attachmentList.value)
    console.log('📎 当前显示的附件数量:', attachmentList.value.length)
    
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
    sending.value = false
    loading.value = false
  }
}

// 保存草稿：存在则更新，否则创建
const saveDraftHandler = async () => {
  try {
    // 获取编辑器内容
    const editorContent = editorInstance.value?.getHtml() || mailForm.value.content
    
    // 处理收件人：转换为身份证号
    const processedRecipients = await processRecipients(mailForm.value.recipients)
    
    // 处理抄送人：转换为身份证号
    const processedCc = mailForm.value.cc.length > 0 ? await processRecipients(mailForm.value.cc) : []
    
    // 处理密送人：转换为身份证号
    const processedBcc = mailForm.value.bcc.length > 0 ? await processRecipients(mailForm.value.bcc) : []

    // 组装 recipients 数组
    const recipients: { recipientIdCard: string; recipientType: number }[] = []
    processedRecipients.forEach(idCard => recipients.push({ recipientIdCard: idCard, recipientType: 1 }))
    processedCc.forEach(idCard => recipients.push({ recipientIdCard: idCard, recipientType: 2 }))
    processedBcc.forEach(idCard => recipients.push({ recipientIdCard: idCard, recipientType: 3 }))

    const baseDraftData: LetterDraftCreateReqVO = {
      subject: mailForm.value.subject || '',
      content: editorContent || '',
      priority: 1,
      requestReadReceipt: false,
      draftStatus: 1,
      scheduledSendTime: null,
      isStarred: false,
      recipients
    }

    console.log('保存草稿数据(create/update):', baseDraftData)
    console.log('📝 草稿HTML内容预览:', editorContent)
    console.log('📎 草稿附件ID列表:', mailForm.value.attachmentIds)

    if (currentDraftId.value) {
      const updateData: LetterDraftUpdateReqVO = { id: currentDraftId.value, ...baseDraftData }
      const ok = await updateDraft(updateData)
      if (ok) {
        ElMessage.success('草稿已更新')
      } else {
        ElMessage.warning('草稿未更新')
      }
    } else {
      const newId = await createDraft(baseDraftData)
      currentDraftId.value = newId
      // 保持当前界面状态，不进行路由跳转或刷新
      ElMessage.success('草稿已创建并保存')
    }
    
    // 草稿保存时，附件保持临时状态，不进行转换
  } catch (error: any) {
    console.error('保存草稿失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '网络错误，请稍后重试'
    ElMessage.error(`保存失败: ${errorMsg}`)
  }
}

onMounted(async () => {
  console.log('🚀 页面初始化开始')
  console.log('📎 初始化时 attachmentIds:', mailForm.value.attachmentIds)
  console.log('📎 初始化时 attachmentList:', attachmentList.value)
  
  // 强制重置附件相关状态，确保页面初始化时是干净的状态
  console.log('🔄 开始强制重置附件状态...')
  console.log('📎 重置前 attachmentIds:', mailForm.value.attachmentIds)
  console.log('📎 重置前 attachmentList:', attachmentList.value)
  
  // 完全重置表单状态
  mailForm.value = {
    recipients: [],
    cc: [],
    bcc: [],
    subject: '',
    content: '',
    attachments: [],
    attachmentIds: []
  }
  
  // 重置附件列表
  attachmentList.value = []
  tempAttachmentList.value = []
  
  console.log('🔄 强制重置后的状态:')
  console.log('📎 重置后 attachmentIds:', mailForm.value.attachmentIds)
  console.log('📎 重置后 attachmentList:', attachmentList.value)
  
  // 并发加载所有数据
  await loadAllData()
  
  // 加载附件相关数据
  await Promise.all([
    loadTempAttachments()
  ])
  
  // 检查路由参数中是否有附件ID
  console.log('🔍 检查路由参数:', route.query)
  if (route.query.attachmentIds) {
    console.log('⚠️ 发现路由参数中的附件ID:', route.query.attachmentIds)
  }
  
  // 如果带有 draftId，则加载草稿内容
  const draftIdParam = route.query.draftId
  if (draftIdParam) {
    const draftId = Number(draftIdParam)
    if (!Number.isNaN(draftId)) {
      try {
        const draft: LetterDraftRespVO = await getDraft(draftId)
        currentDraftId.value = draft.id
        // 填充主题与正文
        mailForm.value.subject = draft.subject || ''
        mailForm.value.content = draft.content || ''
        // 如果编辑器已创建，同步到编辑器（延迟到 nextTick，避免 DOM 尚未就绪）
        if (editorReady.value && editorInstance.value && mailForm.value.content) {
          await nextTick()
          try {
            editorInstance.value.setHtml(mailForm.value.content)
          } catch (e) {
            console.warn('设置编辑器内容失败:', e)
          }
        }
        // 收件人/抄送/密送：后端提供身份证号与可选名称，这里优先显示名称，缺失则显示身份证号
        const toList: string[] = []
        const ccList: string[] = []
        const bccList: string[] = []
        if (Array.isArray(draft.recipients)) {
          draft.recipients.forEach(r => {
            const display = r.recipientName || r.recipientIdCard
            if (r.recipientType === 1) toList.push(display)
            else if (r.recipientType === 2) ccList.push(display)
            else if (r.recipientType === 3) bccList.push(display)
          })
        }
        mailForm.value.recipients = toList
        mailForm.value.cc = ccList
        mailForm.value.bcc = bccList
        // 如果有抄送/密送数据，则展开对应区域
        showCc.value = ccList.length > 0
        showBcc.value = bccList.length > 0
        
        // 加载草稿的附件信息（如果有的话）
        console.log('📝 草稿数据:', draft)
        // 注意：草稿类型中可能没有 attachmentIds 字段，需要根据实际API调整
        const draftAttachmentIds = (draft as any).attachmentIds
        console.log('📎 草稿中的 attachmentIds:', draftAttachmentIds)
        if (draftAttachmentIds && Array.isArray(draftAttachmentIds)) {
          console.log('📎 设置草稿附件ID前:', mailForm.value.attachmentIds)
          mailForm.value.attachmentIds = draftAttachmentIds
          console.log('📎 设置草稿附件ID后:', mailForm.value.attachmentIds)
          await loadAttachmentInfo(draftAttachmentIds)
        }
        
        ElMessage.success('已加载草稿')
      } catch (error: any) {
        console.error('加载草稿失败:', error)
        ElMessage.error(error?.response?.data?.message || error?.message || '加载草稿失败')
      }
    }
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

.tool-btn.disabled {
  background-color: #c0c4cc !important;
  border-color: #c0c4cc !important;
  color: #a8abb2 !important;
  cursor: not-allowed !important;
}

.tool-btn.disabled:hover {
  background-color: #c0c4cc !important;
  border-color: #c0c4cc !important;
  color: #a8abb2 !important;
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
  width: 100%;
  min-height: 40px;
  padding: 4px 0;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.user-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
}

.user-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}

.dept-info {
  color: #909399;
  white-space: nowrap;
}

.work-id {
  color: #909399;
  white-space: nowrap;
}

.email-info {
  color: #909399;
  white-space: nowrap;
}

/* TextEditor 容器样式 */
.text-editor-container {
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 0 0 4px 4px;
}


/* 自定义 wangEditor 样式以匹配现有设计 */
.text-editor-container :deep(.w-e-toolbar) {
  background-color: #f5faff;
  border-bottom: 1px solid #e0e0e0;
}

.text-editor-container :deep(.w-e-text-container) {
  background-color: #ffffff;
}

.text-editor-container :deep(.w-e-text) {
  padding: 20px;
  font-family: SimSun, "宋体", serif;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
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

/* 附件区域滚动条样式 */
.attachments-section::-webkit-scrollbar {
  width: 6px;
}

.attachments-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.attachments-section::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.attachments-section::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 附件统计信息样式 */
.attachment-stats {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.stats-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stats-main {
  font-weight: 500;
  line-height: 1.4;
}

.stats-limit {
  font-size: 11px;
  opacity: 0.8;
  line-height: 1.3;
}

.stats-warning {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
  margin-top: 2px;
}

/* 附件网格布局 */
.uploaded-attachments,
.local-attachments {
  display: grid;
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .uploaded-attachments,
  .local-attachments {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 480px) {
  .uploaded-attachments,
  .local-attachments {
    grid-template-columns: 1fr;
  }
}
</style>
