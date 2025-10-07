<template>
  <div class="mail-container">
    <!-- 主体内容区 -->
    <div class="content-wrapper">
      <!-- 主内容区域 -->
      <div class="main-content">
        <!-- 头部图片 -->
        <div class="header">
          <div class="header-left">
            <img class="header-image" :src="topImage" alt="header" />
          </div>
        </div>
        
        <!-- 工具栏 -->
        <MailToolbar
          :sending="mailSendState.sending.value"
          :last-save-time="lastDraftSaveTime"
          @send="handleSend"
          @save-draft="handleSaveDraft"
        />
        
        <!-- 邮件表单区域 -->
        <div class="mail-form">
          <!-- 收件人 -->
          <RecipientSelector
            :model-value="mailForm.recipients"
            type="recipients"
            :user-options="contactsState.userOptions.value"
            :loading="contactsState.loading.value"
            :show-actions="true"
            @toggle-cc="showCc = !showCc"
            @toggle-bcc="showBcc = !showBcc"
            @focus="activeRecipientField = 'recipients'"
            @remote-search="contactsState.searchUsers"
            @update:model-value="(value) => handleRecipientUpdate('recipients', value)"
          />
          
          <!-- 抄送 -->
          <RecipientSelector
            v-if="showCc"
            :model-value="mailForm.cc"
            type="cc"
            :user-options="contactsState.userOptions.value"
            :loading="contactsState.loading.value"
            @focus="activeRecipientField = 'cc'"
            @remote-search="contactsState.searchUsers"
            @update:model-value="(value) => handleRecipientUpdate('cc', value)"
          />
          
          <!-- 密送 -->
          <RecipientSelector
            v-if="showBcc"
            :model-value="mailForm.bcc"
            type="bcc"
            :user-options="contactsState.userOptions.value"
            :loading="contactsState.loading.value"
            @focus="activeRecipientField = 'bcc'"
            @remote-search="contactsState.searchUsers"
            @update:model-value="(value) => handleRecipientUpdate('bcc', value)"
          />
          
          <!-- 主题行 -->
          <div class="form-row">
            <div class="form-label">主题：</div>
            <div class="form-field">
              <el-input v-model="mailForm.subject" placeholder="请输入邮件主题" />
            </div>
          </div>
        </div>
        
        <!-- 富文本编辑器 -->
        <div class="text-editor-container">
          <Editor
            ref="editorRef"
            v-model="mailForm.content"
            :height="'400px'"
            :toolbar-config="mailToolbarConfig"
            :editor-config="mailEditorConfig"
            @change="handleEditorChange"
          />
        </div>

        <!-- 原始邮件显示（回复/转发场景） -->
        <OriginalMailDisplay
          v-if="replyOriginal || replyOriginalList.length > 0"
          :original-mail="replyOriginal"
          :original-list="replyOriginalList"
          :original-html="replyOriginalHtml"
          @open-detail="openOriginalDetail"
          @remove-original="removeOriginalFromList"
          @download-attachment="handleDownloadAttachment"
        />
        
        <!-- 附件管理器 -->
        <AttachmentManager
          :attachment-list="attachmentState.attachmentList.value"
          :local-files="attachmentState.localFiles.value"
          :uploading="attachmentState.uploading.value"
          :upload-progress="attachmentState.uploadProgress.value"
          :is-drag-over="attachmentState.isDragOver.value"
          :formatted-total-size="attachmentState.formattedTotalSize.value"
          :is-warning="attachmentState.isWarning.value"
          :is-over-limit="attachmentState.isOverLimit.value"
          @upload="handleFileUpload"
          @remove-uploaded="handleRemoveUploadedAttachment"
          @remove-local="attachmentState.removeLocalAttachment"
          @batch-remove="handleBatchRemoveAttachments"
          @drag-over="attachmentState.handleDragOver"
          @drag-leave="attachmentState.handleDragLeave"
          @drop="attachmentState.handleDrop"
        />
      </div>
      
      <!-- 右侧联系人面板 -->
      <ContactPanel
        :filtered-recent-contacts="contactsState.filteredRecentContacts.value"
        :recent-contact-departments="contactsState.recentContactDepartments.value"
        :filtered-starred-contacts="contactsState.filteredStarredContacts.value"
        :starred-contact-display-names="contactsState.starredContactDisplayNames.value"
        :starred-contact-departments="contactsState.starredContactDepartments.value"
        v-model:contact-search="contactsState.contactSearch.value"
        @select-contact="handleSelectContact"
        @context-menu="handleContextMenu"
      />
    </div>
    
    <!-- 右键菜单 -->
    <ContextMenu
      v-model:visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :contact="contextMenu.contact"
      :type="contextMenu.type"
      :starred-contacts="contactsState.starredContacts.value"
      :starred-contact-display-names="contactsState.starredContactDisplayNames.value"
      @toggle-star="handleToggleStar"
    />
  </div>
  
  <!-- 原始邮件详情弹窗 -->
  <OriginalMailDetailDialog
    v-model="originalDetailDialogVisible"
    :loading="originalDetailLoading"
    :detail="originalDetail"
    :sender-avatar="originalSenderAvatar"
    :current-index="currentOriginalIndex"
    :total-count="replyOriginalList.length"
    @prev="switchToPrevOriginal"
    @next="switchToNextOriginal"
    @download-attachment="handleDownloadAttachment"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useTagsViewStore } from '@/store/modules/tagsView'

// 导入组件
import MailToolbar from './components/MailToolbar.vue'
import RecipientSelector from './components/RecipientSelector.vue'
import AttachmentManager from './components/AttachmentManager.vue'
import ContactPanel from './components/ContactPanel.vue'
import OriginalMailDisplay from './components/OriginalMailDisplay.vue'
import OriginalMailDetailDialog from './components/OriginalMailDetailDialog.vue'
import ContextMenu from './components/ContextMenu.vue'
import { Editor } from '@/components/Editor'

// 导入 Composables
import { useContacts } from './composables/useContacts'
import { useAttachments } from './composables/useAttachments'
import { useMailSend } from './composables/useMailSend'
import { useDraft } from './composables/useDraft'

// 导入类型
import type { MailForm, ContextMenuState, OriginalMailInfo } from './types/mail'
import { formatDateTimeCn, getAvatarText } from './utils/mailHelpers'

// 导入API
import { getLetterDetail } from '@/api/mail/letter'
import { formatFileSizeFromString, getFileExtension, downloadAttachment } from '@/api/mail/attachment'
import type { LetterAttachmentRespVO } from '@/api/mail/attachment'
import { getUserByIdCard } from '@/api/system/user'

// 导入图片
import topImage from './image/top.png'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const tagsViewStore = useTagsViewStore()

// 表单数据
const mailForm = ref<MailForm>({
  recipients: [],
  cc: [],
  bcc: [],
  subject: '',
  content: '',
  attachmentIds: []
})

// UI 状态
const showCc = ref(false)
const showBcc = ref(false)
const activeRecipientField = ref<'recipients' | 'cc' | 'bcc'>('recipients')

// 编辑器实例
const editorInstance = ref<any>(null)
const editorReady = ref(false)

// 邮件编辑器配置
const mailToolbarConfig = {
  toolbarKeys: [
    'headerSelect',
    'blockquote',
    '|',
    'bold',
    'underline',
    'italic',
    'through',
    'color',
    'bgColor',
    '|',
    'fontSize',
    'fontFamily',
    'lineHeight',
    '|',
    'bulletedList',
    'numberedList',
    'todo',
    '|',
    'emotion',
    'insertLink',
    'divider',
    '|',
    'undo',
    'clearStyle',
  ]
}

const mailEditorConfig = {
  placeholder: '请输入正文...',
  hoverbarKeys: {
    text: { menuKeys: [] }  // 关闭文本选择时的悬浮菜单
  },
  MENU_CONF: {
    fontFamily: {
      fontFamilyList: [
        '黑体',
        '楷体',
        '仿宋',
        '微软雅黑',
        'Arial',
        'Tahoma',
        'Verdana'
      ]
    },
    fontSize: {
      fontSizeList: ['12px', '13px', '14px', '15px', '16px', '19px', '22px', '24px', '29px', '32px']
    },
    color: {
      colors: [
        '#000000',
        '#333333',
        '#666666',
        '#999999',
        '#cccccc',
        '#ffffff',
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#ffff00',
        '#00ffff',
        '#ff00ff'
      ]
    }
  }
}

// 右键菜单状态
const contextMenu = ref<ContextMenuState>({
  visible: false,
  x: 0,
  y: 0,
  contact: null,
  type: 'recent'
})

// 原始邮件信息
const replyOriginal = ref<OriginalMailInfo | null>(null)
const replyOriginalHtml = ref('')
const replyOriginalList = ref<OriginalMailInfo[]>([])

// 原始邮件详情弹窗
const originalDetailDialogVisible = ref(false)
const originalDetailLoading = ref(false)
const originalDetail = ref<any>(null)
const originalSenderAvatar = ref<string>('')
const currentOriginalIndex = ref(0) // 当前查看的原始邮件在列表中的索引

// 上次保存草稿的时间
const lastDraftSaveTime = ref<string>('')

// 格式化草稿保存时间：今天显示时间，其他显示日期
const formatDraftSaveTime = (dateTimeStr: string): string => {
  try {
    const saveTime = new Date(dateTimeStr)
    const now = new Date()
    
    // 判断是否是今天
    const isToday = saveTime.getFullYear() === now.getFullYear() &&
                    saveTime.getMonth() === now.getMonth() &&
                    saveTime.getDate() === now.getDate()
    
    if (isToday) {
      // 今天：显示时间 "20:47"
      const hours = saveTime.getHours().toString().padStart(2, '0')
      const minutes = saveTime.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    } else {
      // 判断是否是昨天
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const isYesterday = saveTime.getFullYear() === yesterday.getFullYear() &&
                          saveTime.getMonth() === yesterday.getMonth() &&
                          saveTime.getDate() === yesterday.getDate()
      
      if (isYesterday) {
        // 昨天：显示 "昨天"
        return '昨天'
      } else {
        // 更早：显示日期
        const year = saveTime.getFullYear()
        const month = (saveTime.getMonth() + 1).toString().padStart(2, '0')
        const day = saveTime.getDate().toString().padStart(2, '0')
        
        // 如果是今年，只显示月-日
        if (year === now.getFullYear()) {
          return `${month}-${day}`
        } else {
          // 如果是往年，显示完整日期
          return `${year}-${month}-${day}`
        }
      }
    }
    } catch (e) {
    // 如果解析失败，尝试直接从字符串中提取时间部分
    const timeMatch = dateTimeStr.match(/(\d{2}):(\d{2})/)
    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]}`
    }
    return ''
  }
}

// 原始邮件ID列表（用于草稿保存）
const replyOriginalIds = computed(() => {
  return replyOriginalList.value.map(item => item.id)
})

// 关系类型（1-回复，2-转发）
const relationType = ref<number | null>(null)

// 使用 Composables
const contactsState = useContacts()
const attachmentState = useAttachments()

// 创建一个共享的 currentDraftId ref
const sharedCurrentDraftId = ref<number | null>(null)

// 先初始化 mailSendState（它包含真正的 processRecipients 函数）
const mailSendState = useMailSend({
  mailForm,
  editorInstance,
  attachmentIds: computed(() => mailForm.value.attachmentIds),
  allUsers: contactsState.allUsers,
  currentDraftId: sharedCurrentDraftId
})

// 然后初始化 draftState，直接使用 mailSendState 的 processRecipients 和共享的 currentDraftId
const draftState = useDraft({
  mailForm,
  editorInstance,
  processRecipients: mailSendState.processRecipients, // 使用真正的函数
  replyOriginalIds,
  relationType,
  sharedCurrentDraftId // 传入共享的 ref
})

// 事件处理器
const handleEditorChange = async (editor: any) => {
  if (!editorReady.value) {
    editorInstance.value = editor
    editorReady.value = true
  }
}

const handleSend = async () => {
  if (mailSendState.sending.value) {
    ElMessage.warning('正在发送中，请稍候...')
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
  
  const typeParam = (route.query.type || '').toString() as 'reply' | 'forward' | undefined
  const replyIdParam = route.query.replyId ? Number(route.query.replyId) : undefined
  
  const success = await mailSendState.sendMail(typeParam, replyIdParam)
  if (success) {
    const currentRoute = router.currentRoute.value
    // 清除草稿状态
    draftState.clearDraft()
    resetForm()
    await nextTick()
    await nextTick()
    tagsViewStore.delView(currentRoute)
    await nextTick()
    router.push('/mail/index')
  }
}

const handleSaveDraft = async () => {
  const result = await draftState.saveDraft()
  if (result.success && result.lastSaveTime) {
    // 使用从数据库返回的真实保存时间，并根据日期智能格式化
    lastDraftSaveTime.value = formatDraftSaveTime(result.lastSaveTime)
  }
}

const handleRecipientUpdate = (field: 'recipients' | 'cc' | 'bcc', newValue: string[]) => {
  const oldValue = mailForm.value[field]
  
  // 找出新增的联系人（在 newValue 中但不在 oldValue 中）
  const addedContacts = newValue.filter(name => !oldValue.includes(name))
  
  // 找出删除的联系人（在 oldValue 中但不在 newValue 中）
  const removedContacts = oldValue.filter(name => !newValue.includes(name))
  
  // 如果只是删除操作，直接更新
  if (addedContacts.length === 0) {
    mailForm.value[field] = newValue
    return
  }
  
  // 检查新增的联系人是否在其他字段中已存在
  const duplicates: string[] = []
  const validContacts: string[] = []
  
  addedContacts.forEach(name => {
    let existsInOtherField = false
    let existingFieldName = ''
    
    if (field !== 'recipients' && mailForm.value.recipients.includes(name)) {
      existsInOtherField = true
      existingFieldName = '收件人'
    } else if (field !== 'cc' && mailForm.value.cc.includes(name)) {
      existsInOtherField = true
      existingFieldName = '抄送人'
    } else if (field !== 'bcc' && mailForm.value.bcc.includes(name)) {
      existsInOtherField = true
      existingFieldName = '密送人'
    }
    
    if (existsInOtherField) {
      duplicates.push(`${name}（已在${existingFieldName}中）`)
    } else {
      validContacts.push(name)
    }
  })
  
  // 构建最终的值：保留旧值中未被删除的项，加上有效的新增项
  const keptContacts = oldValue.filter(name => !removedContacts.includes(name))
  const finalValue = [...keptContacts, ...validContacts]
  
  // 更新表单值
  mailForm.value[field] = finalValue
  
  // 如果有重复项，显示警告
  if (duplicates.length > 0) {
    ElMessage.warning(`以下联系人已存在，不能重复添加：${duplicates.join('、')}`)
  }
}

const handleSelectContact = (data: any) => {
  const field = activeRecipientField.value
  const name = data.name
  
  if (!name) return
  
  // 检查是否在所有字段中已存在
  const existsInRecipients = mailForm.value.recipients.includes(name)
  const existsInCc = mailForm.value.cc.includes(name)
  const existsInBcc = mailForm.value.bcc.includes(name)
  
  if (existsInRecipients || existsInCc || existsInBcc) {
    let existingFieldName = ''
    if (existsInRecipients) existingFieldName = '收件人'
    else if (existsInCc) existingFieldName = '抄送人'
    else if (existsInBcc) existingFieldName = '密送人'
    
    ElMessage.warning(`${name} 已在${existingFieldName}中，不能重复添加`)
    return
  }
  
  // 添加到当前字段
  mailForm.value[field].push(name)
  
  // 将联系人添加到 userOptions 列表，以便能够正常删除
  const existsInOptions = contactsState.userOptions.value.some(opt => opt.name === name)
  if (!existsInOptions) {
    const user = contactsState.allUsers.value.find((u: any) => u.nickname === name)
    if (user) {
      contactsState.userOptions.value.push({
        value: user.id.toString(),
        label: name,
        avatar: user.avatar || '',
        name: user.nickname || name,
        userId: user.id,
        deptName: user.deptNames ? user.deptNames.join(', ') : '',
        workId: user.workId || '',
        email: user.email || ''
      })
    }
  }
  
  const fieldName = field === 'recipients' ? '收件人' : field === 'cc' ? '抄送人' : '密送人'
  ElMessage.success(`已添加${fieldName}: ${name}`)
}

const handleContextMenu = (event: MouseEvent, contact: any, type: 'recent' | 'starred') => {
  if (contextMenu.value.visible) {
    contextMenu.value.visible = false
  }
  
  nextTick(() => {
    contextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      contact,
      type
    }
    
    const closeMenu = () => {
      if (contextMenu.value) {
        contextMenu.value.visible = false
      }
      document.removeEventListener('click', closeMenu)
      document.removeEventListener('wheel', closeMenu)
    }
    
    setTimeout(() => {
      document.addEventListener('click', closeMenu)
      document.addEventListener('wheel', closeMenu)
    }, 100)
  })
}

const handleToggleStar = async () => {
  if (!contextMenu.value.contact) return
  
  const isStarred = computed(() => {
    if (!contextMenu.value.contact || !contextMenu.value.type) return false
    
    if (contextMenu.value.type === 'starred') return true
    
    return contactsState.starredContacts.value.some(starred => {
      const starredDisplayName = contactsState.starredContactDisplayNames.value.get(starred.id)
      return starredDisplayName === contextMenu.value.contact.name || 
             starred.contactIdCard === contextMenu.value.contact.idCard
    })
  })
  
  const currentUser = userStore.getUser
  const success = await contactsState.toggleContactStar(
    contextMenu.value.contact,
    isStarred.value,
    contextMenu.value.type,
    currentUser.id,
    currentUser.nickname
  )
  
  if (success) {
    contextMenu.value.visible = false
  }
}

const handleFileUpload = async (files: FileList) => {
  const attachmentIds = await attachmentState.handleFileUpload(files)
  if (attachmentIds.length > 0) {
    mailForm.value.attachmentIds.push(...attachmentIds)
  }
}

const handleRemoveUploadedAttachment = async (id: number, index: number) => {
  const success = await attachmentState.removeUploadedAttachment(id, index)
  if (success) {
    const idIndex = mailForm.value.attachmentIds.indexOf(id)
    if (idIndex > -1) {
      mailForm.value.attachmentIds.splice(idIndex, 1)
    }
  }
}

const handleBatchRemoveAttachments = async (ids: number[]) => {
  const success = await attachmentState.batchRemoveAttachments(ids)
  if (success) {
    mailForm.value.attachmentIds = mailForm.value.attachmentIds.filter(id => !ids.includes(id))
  }
}

const handleDownloadAttachment = async (att: LetterAttachmentRespVO) => {
  try {
    await downloadAttachment(att.id, att.fileName)
  } catch (error: any) {
    ElMessage.error(`下载失败: ${error?.message || '网络错误'}`)
  }
}

const openOriginalDetail = async (id: number) => {
    try {
      const numericId = Number(id)
      if (!id || Number.isNaN(numericId)) {
        ElMessage?.warning?.('无法打开原始邮件：ID 无效')
        return
      }

    // 如果是多封邮件转发，找到当前邮件在列表中的索引
    if (replyOriginalList.value.length > 0) {
      const index = replyOriginalList.value.findIndex(item => item.id === numericId)
      if (index !== -1) {
        currentOriginalIndex.value = index
      }
    }

    originalDetailDialogVisible.value = true
    originalDetailLoading.value = true
    originalSenderAvatar.value = ''
    originalDetail.value = null

    const detail: any = await getLetterDetail(numericId)
    if (detail) {
      const subject = (detail?.content?.subject) || detail.subject || '无主题'
      const sendTime = formatDateTimeCn(detail?.content?.sendTime || detail.sendTime)

      let senderName = ''
      let senderIdCard = ''
      if (Array.isArray(detail?.senders) && detail.senders.length > 0) {
        senderIdCard = (detail.senders[0]?.senderIdCard || '').toString().trim()
      }
      if (!senderIdCard) {
        senderIdCard = (detail as any).fromUserIdCard || (detail as any).fromIdCard || ''
      }
      if (senderIdCard) {
        try {
          const u = await getUserByIdCard(senderIdCard)
          senderName = (u && u.nickname) ? u.nickname : ''
          originalSenderAvatar.value = u?.avatar || ''
        } catch {}
      }

      let toUserNames = ''
      let ccUserNames = ''
      let bccUserNames = ''
      try {
        const recipientsArr = (detail as any)?.recipients
        if (Array.isArray(recipientsArr) && recipientsArr.length > 0) {
          const toNames: string[] = []
          const ccNames: string[] = []
          const bccNames: string[] = []
          
          for (const r of recipientsArr) {
            const idCard = (r?.recipientIdCard || '').toString().trim()
            const recipientType = r?.recipientType || 1
            if (idCard) {
              try {
                const u = await getUserByIdCard(idCard)
                const displayName = u?.nickname || idCard
                
                if (recipientType === 1) {
                  toNames.push(displayName)
                } else if (recipientType === 2) {
                  ccNames.push(displayName)
                } else if (recipientType === 3) {
                  bccNames.push(displayName)
                }
              } catch {
                const displayName = idCard
                if (recipientType === 1) {
                  toNames.push(displayName)
                } else if (recipientType === 2) {
                  ccNames.push(displayName)
                } else if (recipientType === 3) {
                  bccNames.push(displayName)
                }
              }
            }
          }
          toUserNames = toNames.join('、')
          ccUserNames = ccNames.join('、')
          bccUserNames = bccNames.join('、')
        }
      } catch {}

      let html = ''
      try {
        const c = detail?.content
        html = (c && (c.content || c.html)) ? (c.content || c.html) : (typeof c === 'string' ? c : '')
      } catch { html = '' }

      const atts = Array.isArray(detail.attachments) ? detail.attachments : []

      originalDetail.value = {
        id,
        subject,
        sender: senderName || '未知',
        toMail: toUserNames || '无',
        toRecipients: toUserNames || undefined,
        ccRecipients: ccUserNames || undefined,
        bccRecipients: bccUserNames || undefined,
        originalSendTime: sendTime,
        attachments: atts,
        content: html
      }
    }
  } catch (e) {
    originalDetail.value = null
  } finally {
    originalDetailLoading.value = false
  }
}

const removeOriginalFromList = (id: number) => {
  const index = replyOriginalList.value.findIndex(item => item.id === id)
  if (index > -1) {
    replyOriginalList.value.splice(index, 1)
  }
}

// 切换到上一封原始邮件
const switchToPrevOriginal = () => {
  if (replyOriginalList.value.length === 0) return
  
  if (currentOriginalIndex.value > 0) {
    currentOriginalIndex.value--
  } else {
    // 循环到最后一封
    currentOriginalIndex.value = replyOriginalList.value.length - 1
  }
  
  const emailId = replyOriginalList.value[currentOriginalIndex.value].id
  openOriginalDetail(emailId)
}

// 切换到下一封原始邮件
const switchToNextOriginal = () => {
  if (replyOriginalList.value.length === 0) return
  
  if (currentOriginalIndex.value < replyOriginalList.value.length - 1) {
    currentOriginalIndex.value++
  } else {
    // 循环到第一封
    currentOriginalIndex.value = 0
  }
  
  const emailId = replyOriginalList.value[currentOriginalIndex.value].id
  openOriginalDetail(emailId)
}

const resetForm = () => {
  mailForm.value = {
    recipients: [],
    cc: [],
    bcc: [],
    subject: '',
    content: '',
    attachmentIds: []
  }
  
  if (editorInstance.value) {
    try {
      if (typeof editorInstance.value.clear === 'function') {
        editorInstance.value.clear()
      } else if (typeof editorInstance.value.setHtml === 'function') {
        editorInstance.value.setHtml('')
      }
    } catch (e) {
      // 忽略清空失败
    }
  }
  
  attachmentState.resetAttachments()
  mailSendState.sending.value = false
  showCc.value = false
  showBcc.value = false
}

// 生命周期
onMounted(async () => {
  // 强制重置状态
  mailForm.value = {
    recipients: [],
    cc: [],
    bcc: [],
    subject: '',
    content: '',
    attachmentIds: []
  }
  attachmentState.resetAttachments()
  
  // 初始化联系人数据
  await contactsState.initContacts()
  
  // 加载草稿
  const draftIdParam = route.query.draftId
  if (draftIdParam) {
    const draftId = Number(draftIdParam)
    if (!Number.isNaN(draftId)) {
      try {
        // 使用 draftState.loadDraft() 方法加载草稿
        const result = await draftState.loadDraft(draftId)
        
        if (result.success) {
          // 设置上次保存时间，根据日期智能格式化
          if (result.lastSaveTime) {
            lastDraftSaveTime.value = formatDraftSaveTime(result.lastSaveTime)
          }
          
          // 处理显示抄送和密送
          showCc.value = mailForm.value.cc.length > 0
          showBcc.value = mailForm.value.bcc.length > 0
          
          // 将草稿中的收件人添加到 userOptions，确保能够通过 backspace 删除
          const allRecipientNames = [...mailForm.value.recipients, ...mailForm.value.cc, ...mailForm.value.bcc]
          for (const recipientName of allRecipientNames) {
            const existsInOptions = contactsState.userOptions.value.some(opt => opt.name === recipientName)
            if (!existsInOptions) {
              const user = contactsState.allUsers.value.find((u: any) => u.nickname === recipientName)
              if (user) {
                contactsState.userOptions.value.push({
                  value: user.id.toString(),
                  label: recipientName,
                  avatar: user.avatar || '',
                  name: user.nickname || recipientName,
                  userId: user.id,
                  deptName: user.deptNames ? user.deptNames.join(', ') : '',
                  workId: user.workId || '',
                  email: user.email || ''
                })
              }
            }
          }
          
          // 加载附件信息
          if (mailForm.value.attachmentIds.length > 0) {
            await attachmentState.loadAttachmentInfo(mailForm.value.attachmentIds)
          }
          
          // 如果草稿中保存了原始邮件ID列表（多选转发场景），重新加载这些邮件
          if (result.replyOriginalIds && result.replyOriginalIds.length > 0) {
            // 恢复关系类型
            if (result.relationType) {
              relationType.value = result.relationType
            }
            
            replyOriginalList.value = []
            
            const details = await Promise.allSettled(result.replyOriginalIds.map(id => getLetterDetail(id)))
            for (let i = 0; i < details.length; i++) {
              const res = details[i]
              if (res.status === 'fulfilled' && res.value) {
                const d: any = res.value
                const item: OriginalMailInfo = {
                  id: Number(result.replyOriginalIds[i]),
                  subject: (d?.content?.subject) || d.subject || '',
                  fromUserName: '',
                  toUserNames: '',
                  sendTime: formatDateTimeCn(d?.content?.sendTime),
                  attachments: Array.isArray(d.attachments) ? d.attachments : []
                }
                
                // 获取发件人信息
                try {
                  let firstSenderIdCard = ''
                  if (Array.isArray((d as any).senders)) {
                    firstSenderIdCard = (d as any).senders
                      .map((s: any) => (s?.senderIdCard || '').toString().trim())
                      .find((v: string) => !!v) || ''
                  }
                  if (!firstSenderIdCard) {
                    firstSenderIdCard = (d as any).fromUserIdCard || (d as any).fromIdCard || ''
                  }
                  if (firstSenderIdCard) {
                    const u = await getUserByIdCard(firstSenderIdCard)
                    item.fromUserName = (u && u.nickname) ? u.nickname : ''
                  }
                } catch (e) {}
                
                // 获取收件人信息
                try {
                  const recipientsArr = (d as any)?.recipients
                  if (Array.isArray(recipientsArr) && recipientsArr.length > 0) {
                    const toNames: string[] = []
                    const ccNames: string[] = []
                    const bccNames: string[] = []
                    
                    for (const r of recipientsArr) {
                      const idCard = (r?.recipientIdCard || '').toString().trim()
                      const recipientType = r?.recipientType || 1
                      if (idCard) {
                        const u = await getUserByIdCard(idCard)
                        const displayName = u?.nickname || idCard
                        
                        if (recipientType === 1) {
                          toNames.push(displayName)
                        } else if (recipientType === 2) {
                          ccNames.push(displayName)
                        } else if (recipientType === 3) {
                          bccNames.push(displayName)
                        }
                      }
                    }
                    item.toUserNames = toNames.join('、')
                    item.toRecipients = toNames.join('、') || undefined
                    item.ccRecipients = ccNames.join('、') || undefined
                    item.bccRecipients = bccNames.join('、') || undefined
                  }
                } catch (e) {}
                
              replyOriginalList.value.push(item)
            }
          }
        }
      }
      } catch (error: any) {
        ElMessage.error(error?.response?.data?.message || error?.message || '加载草稿失败')
      }
    }
  }
  
  // 处理回复/转发场景
  const replyIdsParam = (route.query.replyIds || '').toString()
  const replyIdParam = route.query.replyId
  if ((replyIdsParam || replyIdParam) && !draftIdParam) {
    const ids: number[] = replyIdsParam
      ? replyIdsParam.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n))
      : [Number(replyIdParam)].filter(n => !Number.isNaN(n))
      
    if (ids.length > 0) {
      try {
        if (ids.length === 1) {
          const detail: any = await getLetterDetail(ids[0])
          if (detail) {
            replyOriginal.value = {
              id: detail.id,
              subject: (detail?.content?.subject) || detail.subject || '',
              fromUserName: '',
              toUserNames: '',
              sendTime: formatDateTimeCn(detail?.content?.sendTime),
              content: detail.content || ''
            }

            try {
              const c = detail?.content
              const html = (c && (c.content || c.html)) ? (c.content || c.html) : (typeof c === 'string' ? c : '')
              replyOriginalHtml.value = html || ''
            } catch (e) {
              replyOriginalHtml.value = ''
            }

            if (replyOriginal.value) {
              replyOriginal.value.attachments = Array.isArray(detail.attachments) ? detail.attachments : []
            }

            const typeParam = (route.query.type || '').toString()
            // 设置关系类型：1-回复，2-转发
            relationType.value = typeParam === 'reply' ? 1 : 2
            
            if (typeParam === 'reply') {
              let replySenderIdCards: string[] = []
              if (Array.isArray((detail as any).senders)) {
                const firstSenderIdCard = (detail as any).senders
                  .map((s: any) => (s?.senderIdCard || '').toString().trim())
                  .find((v: string) => !!v)
                if (firstSenderIdCard) {
                  replySenderIdCards = [firstSenderIdCard]
                }
              }
              try {
                const names: string[] = []
                for (const id of replySenderIdCards) {
                  const user = await getUserByIdCard(id)
                  if (user && user.nickname) {
                    names.push(user.nickname)
                  }
                }
                mailForm.value.recipients = names
                if (replyOriginal.value) {
                  replyOriginal.value.fromUserName = names[0] || ''
                }
              } catch (e) {
                mailForm.value.recipients = []
              }
            } else {
              mailForm.value.recipients = []
              try {
                let firstSenderIdCard = ''
                if (Array.isArray((detail as any).senders)) {
                  firstSenderIdCard = (detail as any).senders
                    .map((s: any) => (s?.senderIdCard || '').toString().trim())
                    .find((v: string) => !!v) || ''
                }
                if (!firstSenderIdCard) {
                  firstSenderIdCard = (detail as any).fromUserIdCard || (detail as any).fromIdCard || ''
                }
                if (firstSenderIdCard) {
                  const u = await getUserByIdCard(firstSenderIdCard)
                  if (replyOriginal.value) replyOriginal.value.fromUserName = (u && u.nickname) ? u.nickname : ''
                }
              } catch (e) {}
            }

            try {
              const recipientsArr = (detail as any)?.recipients
              if (Array.isArray(recipientsArr) && recipientsArr.length > 0) {
                const toNames: string[] = []
                const ccNames: string[] = []
                const bccNames: string[] = []
                
                for (const r of recipientsArr) {
                  const idCard = (r?.recipientIdCard || '').toString().trim()
                  const recipientType = r?.recipientType || 1
                  if (idCard) {
                    const u = await getUserByIdCard(idCard)
                    const displayName = u?.nickname || idCard
                    
                    if (recipientType === 1) {
                      toNames.push(displayName)
                    } else if (recipientType === 2) {
                      ccNames.push(displayName)
                    } else if (recipientType === 3) {
                      bccNames.push(displayName)
                    }
                  }
                }
                if (replyOriginal.value) {
                  replyOriginal.value.toUserNames = toNames.join('、')
                  replyOriginal.value.toRecipients = toNames.join('、') || undefined
                  replyOriginal.value.ccRecipients = ccNames.join('、') || undefined
                  replyOriginal.value.bccRecipients = bccNames.join('、') || undefined
                }
              }
            } catch (e) {}

            const originalSubject = (detail?.content?.subject) || ''
            const typeParam2 = (route.query.type || '').toString()
            if (typeParam2 === 'forward') {
              mailForm.value.subject = originalSubject ? `转发：${originalSubject}` : '转发：'
            } else {
              mailForm.value.subject = originalSubject ? `回复：${originalSubject}` : '回复：'
            }

            try {
              mailForm.value.content = ''
              if (editorReady.value && editorInstance.value && typeof editorInstance.value.clear === 'function') {
                editorInstance.value.clear()
              } else if (editorReady.value && editorInstance.value && typeof editorInstance.value.setHtml === 'function') {
                editorInstance.value.setHtml('<p><br/></p>')
              }
            } catch (e) {}
          }
        } else {
          // 多封转发
          // 设置关系类型为转发
          relationType.value = 2
          
          const details = await Promise.allSettled(ids.map(id => getLetterDetail(id)))
          replyOriginalList.value = []
          for (let i = 0; i < details.length; i++) {
            const res = details[i]
            if (res.status === 'fulfilled' && res.value) {
              const d: any = res.value
              const item: OriginalMailInfo = {
                id: Number(ids[i]),
                subject: (d?.content?.subject) || d.subject || '',
                fromUserName: '',
                toUserNames: '',
                sendTime: formatDateTimeCn(d?.content?.sendTime),
                attachments: Array.isArray(d.attachments) ? d.attachments : []
              }
              
              try {
                let firstSenderIdCard = ''
                if (Array.isArray((d as any).senders)) {
                  firstSenderIdCard = (d as any).senders
                    .map((s: any) => (s?.senderIdCard || '').toString().trim())
                    .find((v: string) => !!v) || ''
                }
                if (!firstSenderIdCard) {
                  firstSenderIdCard = (d as any).fromUserIdCard || (d as any).fromIdCard || ''
                }
                if (firstSenderIdCard) {
                  const u = await getUserByIdCard(firstSenderIdCard)
                  item.fromUserName = (u && u.nickname) ? u.nickname : ''
                }
              } catch (e) {}
              
              try {
                const recipientsArr = (d as any)?.recipients
                if (Array.isArray(recipientsArr) && recipientsArr.length > 0) {
                  const toNames: string[] = []
                  const ccNames: string[] = []
                  const bccNames: string[] = []
                  
                  for (const r of recipientsArr) {
                    const idCard = (r?.recipientIdCard || '').toString().trim()
                    const recipientType = r?.recipientType || 1
                    if (idCard) {
                      const u = await getUserByIdCard(idCard)
                      const displayName = u?.nickname || idCard
                      
                      if (recipientType === 1) {
                        toNames.push(displayName)
                      } else if (recipientType === 2) {
                        ccNames.push(displayName)
                      } else if (recipientType === 3) {
                        bccNames.push(displayName)
                      }
                    }
                  }
                  item.toUserNames = toNames.join('、')
                  item.toRecipients = toNames.join('、') || undefined
                  item.ccRecipients = ccNames.join('、') || undefined
                  item.bccRecipients = bccNames.join('、') || undefined
                }
              } catch (e) {}
              
              replyOriginalList.value.push(item)
            }
          }
          
          mailForm.value.content = ''
          if (editorReady.value && editorInstance.value && typeof editorInstance.value.clear === 'function') {
            editorInstance.value.clear()
          } else if (editorReady.value && editorInstance.value && typeof editorInstance.value.setHtml === 'function') {
            editorInstance.value.setHtml('<p><br/></p>')
          }
        }
      } catch (e) {
        ElMessage.error('加载回复原邮件失败')
      }
    }
  }
})

onBeforeUnmount(() => {
  try {
    if (editorInstance.value) {
      try {
        if (typeof editorInstance.value.clear === 'function') {
          editorInstance.value.clear()
        }
      } catch (e) {
        // 忽略清空失败
      }
      
      nextTick(() => {
        try {
          if (typeof editorInstance.value.destroy === 'function') {
            editorInstance.value.destroy()
          }
        } catch (e) {
          // 忽略销毁失败
        } finally {
          editorInstance.value = null
          editorReady.value = false
        }
      })
    } else {
      editorReady.value = false
    }
  } catch (e) {
    editorInstance.value = null
    editorReady.value = false
  }
})
</script>

<style scoped>
/* 整体布局 */
.mail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
  color: #303133;
  overflow: hidden;
}

/* 主体布局 */
.content-wrapper {
  display: flex;
  flex: 1;
  background-color: #f5f7f9;
  padding: 8px;
  gap: 8px;
  min-height: 0;
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
  min-height: 0;
  width: 100%;
}

/* 头部 */
.header {
  padding: 12px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-image {
  max-width: 200px;
  height: auto;
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

/* TextEditor 容器样式 */
.text-editor-container {
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 0 0 4px 4px;
}

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
</style>
