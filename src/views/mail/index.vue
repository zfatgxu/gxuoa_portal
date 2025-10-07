<template>
  <div class="mail-container">
    <!-- 顶部标题栏 -->
    <div class="content-wrapper">
      <!-- 左侧边栏 -->
      <MailSidebar
        :selected-folder="selectedFolder"
        :selected-folder-id="selectedFolderId"
        :custom-folders="customFolders"
        :mail-stats="mailStats"
        @select-folder="handleSelectFolder"
        @create-folder="handleCreateFolder"
        @folder-context-menu="showFolderContextMenu"
        @item-context-menu="onFolderContextMenu"
        @compose="goCompose"
      />

      <!-- 主内容区域 -->
      <MainContent 
        ref="mainContentRef"
        :folderName="getCurrentFolderName()" 
        :emails="getCurrentEmails()" 
        :isDeletedFolder="selectedFolder==='deleted'"
        :isTrashFolder="selectedFolder==='trash'"
        :isDraftFolder="selectedFolder==='drafts'"
        :isCustomFolder="selectedFolder==='custom'"
        :currentCustomFolderId="selectedFolderId || undefined"
        :mailStats="mailStats"
        :customFolders="customFolders"
        @delete-emails="handleDeleteEmails"
        @permanent-delete-emails="handlePermanentDeleteEmails"
        @restore-emails="handleRestoreEmails"
        @mark-emails="handleMarkEmails"
        @move-emails="handleMoveEmails"
        @remove-from-folder="handleRemoveFromFolder"
        @show-message="handleShowMessage"
        @toggle-star="handleToggleStar"
        @sync-mails="handleSyncMails"
        @view-email-detail="handleViewEmailDetail"
        @get-email-detail="handleGetEmailDetail"
        @delete-folder="handleDeleteFolder"
        @reply-email="handleReplyEmail"
        @forward-email="handleForwardEmail"
      />
    </div>

    <!-- 文件夹右键上下文菜单 -->
    <FolderContextMenu
      :visible="folderContextMenu.visible"
      :x="folderContextMenu.x"
      :y="folderContextMenu.y"
      :folder-id="folderContextMenu.folderId"
      @create-folder="handleCreateFolder"
      @rename-folder="handleRenameFolder"
      @delete-folder="confirmDeleteContextFolder"
      @close="hideFolderContextMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import '@/views/mail/mail.css'

// 导入组件
import MainContent from './components/MainContent.vue'
import MailSidebar from './components/MailSidebar.vue'
import FolderContextMenu from './components/FolderContextMenu.vue'

// 导入 Composables
import { useMailStats } from './composables/useMailStats'
import { useDataCache } from './composables/useDataCache'
import { useFolderManagement } from './composables/useFolderManagement'
import { useMailData } from './composables/useMailData'
import { useMailOperations } from './composables/useMailOperations'

// 导入API
import { setFolderMailsReadState } from '@/api/mail/folder'
import { getLetterDetail } from '@/api/mail/letter'
import { getLetterAttachmentsByLetterId } from '@/api/mail/attachment/index'

// 导入类型
import type { Email } from './utils/mailFormatter'

const router = useRouter()
const mainContentRef = ref<InstanceType<typeof MainContent> | null>(null)

// 当前选中的文件夹
const selectedFolder = ref('inbox')
const selectedFolderId = ref<number | null>(null)

// 文件夹右键菜单状态
const folderContextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  folderId: null as number | null
})

// 使用 Composables
const { mailStats, loadMailStats } = useMailStats()

const { getUserDetailByIdCard, emailDetailsCache, preloadEmailDetails } = useDataCache()

const {
  customFolders,
  loadCustomFolders,
  createNewFolder,
  renameFolder,
  deleteFolderById,
  getFolderName
} = useFolderManagement()

const {
  allEmails,
  folderEmails,
  loading,
  loadFolderEmails,
  loadFolderEmailsById,
  getCurrentEmails: getEmails,
  updateEmailStatusInAllFolders
} = useMailData(getUserDetailByIdCard)

const {
  deleteEmails,
  restoreEmails,
  permanentDeleteEmails,
  markEmails,
  moveEmails,
  removeFromFolder,
  toggleStar
} = useMailOperations({
  allEmails,
  folderEmails,
  updateEmailStatusInAllFolders,
  loadFolderEmails,
  loadFolderEmailsById
})

// 文件夹标签
const folderLabels: Record<string, string> = {
  inbox: '收件箱',
  starred: '星标邮件',
  sent: '已发送',
  drafts: '草稿箱',
  deleted: '已删除',
  trash: '垃圾箱',
  custom: '自定义文件夹'
}

// 计算属性 - 获取当前文件夹名称
function getCurrentFolderName(): string {
  if (selectedFolder.value === 'custom' && selectedFolderId.value) {
    return getFolderName(selectedFolderId.value)
  }
  return folderLabels[selectedFolder.value] || '未知文件夹'
}

// 计算属性 - 获取当前文件夹的邮件
function getCurrentEmails(): Email[] {
  return getEmails(selectedFolder.value, selectedFolderId.value)
}

// 事件处理器 - 选择文件夹
async function handleSelectFolder(folder: string | number) {
  // 重置文件夹ID
  selectedFolderId.value = null

  // 若当前在邮件详情界面，切换邮箱时直接退出详情视图
  if (mainContentRef.value && typeof (mainContentRef.value as any).closeEmailDetail === 'function') {
    ;(mainContentRef.value as any).closeEmailDetail()
  }
  
  if (typeof folder === 'string') {
    // 系统文件夹
    selectedFolder.value = folder
    await loadFolderEmails(folder)
  } else {
    // 自定义文件夹
    selectedFolder.value = 'custom'
    selectedFolderId.value = folder
    await loadFolderEmailsById(folder)
  }
  
  // 预加载当前分页的邮件详情（草稿箱除外，因为草稿不是正式邮件）
  if (selectedFolder.value !== 'drafts') {
    const currentEmails = getCurrentEmails()
    await preloadEmailDetails(currentEmails)
  }
}

// 显示文件夹右键上下文菜单
function showFolderContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  
  // 打开顶层菜单（不绑定具体文件夹）
  folderContextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    folderId: null
  }
  
  // 点击其他地方隐藏菜单
  setTimeout(() => {
    document.addEventListener('click', hideFolderContextMenu, { once: true })
  }, 0)
}

// 来自子项的右键事件：全局唯一——先关闭再打开
function onFolderContextMenu(payload: { x: number, y: number, folderId: number }) {
  hideFolderContextMenu()
  folderContextMenu.value = {
    visible: true,
    x: payload.x,
    y: payload.y,
    folderId: payload.folderId
  }
  setTimeout(() => {
    document.addEventListener('click', hideFolderContextMenu, { once: true })
    // 滚轮滚动时隐藏文件夹右键菜单（一次性）
    document.addEventListener('wheel', hideFolderContextMenu, { once: true })
  }, 0)
}

// 隐藏文件夹右键上下文菜单
function hideFolderContextMenu() {
  folderContextMenu.value.visible = false
  folderContextMenu.value.folderId = null
}

// 新建文件夹
async function handleCreateFolder() {
  hideFolderContextMenu()
  
  try {
    const { value: folderName } = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /^.{1,50}$/,
      inputErrorMessage: '文件夹名称长度应在1-50个字符之间'
    })
    
    if (folderName && folderName.trim()) {
      const loadingInstance = ElLoading.service({ text: '正在创建文件夹...' })
      
      try {
        await createNewFolder(folderName.trim())
        ElMessage.success(`文件夹"${folderName.trim()}"创建成功`)
      } catch (error: any) {
        const errorMsg = error?.response?.data?.msg || error?.message || '创建文件夹失败'
        ElMessage.error(errorMsg)
      } finally {
        loadingInstance.close()
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('创建文件夹失败')
    }
  }
}

// 重命名文件夹
async function handleRenameFolder(folderId: number) {
  hideFolderContextMenu()
  
  try {
    // 获取当前文件夹信息
    const folder = customFolders.value.find(f => f.id === folderId)
    if (!folder) {
      ElMessage.error('文件夹不存在')
      return
    }
    
    const { value: newFolderName } = await ElMessageBox.prompt('请输入新的文件夹名称', '重命名文件夹', {
      confirmButtonText: '重命名',
      cancelButtonText: '取消',
      inputValue: folder.folderName,
      inputPattern: /^.{1,50}$/,
      inputErrorMessage: '文件夹名称长度应在1-50个字符之间'
    })
    
    if (newFolderName && newFolderName.trim() && newFolderName.trim() !== folder.folderName) {
      const loadingInstance = ElLoading.service({ text: '正在重命名文件夹...' })
      
      try {
        await renameFolder(folderId, newFolderName.trim())
        ElMessage.success(`文件夹重命名为"${newFolderName.trim()}"成功`)
      } catch (error: any) {
        const errorMsg = error?.response?.data?.msg || error?.message || '重命名文件夹失败'
        ElMessage.error(errorMsg)
      } finally {
        loadingInstance.close()
      }
    } else if (newFolderName && newFolderName.trim() === folder.folderName) {
      ElMessage.info('文件夹名称未发生变化')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('重命名文件夹失败')
    }
  }
}

// 删除文件夹
async function handleDeleteFolder(folderId: number) {
  try {
    // 获取文件夹信息
    const folder = customFolders.value.find(f => f.id === folderId)
    if (!folder) {
      throw new Error('文件夹不存在')
    }

    // 如果文件夹内仍有邮件，禁止删除并提示
    if ((folder.mailCount || 0) > 0) {
      ElMessage.warning('该文件夹内仍有邮件，无法删除')
      return
    }
    
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要删除文件夹"${folder.folderName}"吗？`,
      '删除文件夹',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    const loadingInstance = ElLoading.service({ text: '正在删除文件夹...' })
    
    try {
      await deleteFolderById(folderId)
      
      // 如果当前正在查看被删除的文件夹，切换到收件箱
      if (selectedFolder.value === 'custom' && selectedFolderId.value === folderId) {
        await handleSelectFolder('inbox')
      }
      
      await loadMailStats()
      ElMessage.success(`文件夹"${folder.folderName}"删除成功`)
    } catch (error: any) {
      const errorMsg = error?.response?.data?.msg || error?.message || '删除文件夹失败'
      ElMessage.error(`删除文件夹失败: ${errorMsg}`)
    } finally {
      loadingInstance.close()
    }
  } catch (error: any) {
    if (error === 'cancel') {
      return
    }
    ElMessage.error('删除文件夹失败')
  }
}

// 顶层菜单中的"删除文件夹"动作
async function confirmDeleteContextFolder(folderId: number) {
    hideFolderContextMenu()
  await handleDeleteFolder(folderId)
}

// 处理删除邮件
async function handleDeleteEmails(emailIds: number[]) {
  try {
    loading.value = true
    await deleteEmails(emailIds, selectedFolder.value, selectedFolderId.value)
    
    await loadCustomFolders()    
    await loadMailStats()
    
    ElMessage.success(`成功删除 ${emailIds.length} 封邮件`)
  } catch (error: any) {
    ElMessage.error('删除邮件失败')
  } finally {
    loading.value = false
  }
}

// 处理恢复邮件
async function handleRestoreEmails(emailIds: number[]) {
  try {
    loading.value = true
    await restoreEmails(emailIds)
    
    await loadMailStats()
    ElMessage.success(`成功恢复 ${emailIds.length} 封邮件`)
  } catch (error: any) {
    ElMessage.error('恢复邮件失败')
  } finally {
    loading.value = false
  }
}

// 处理彻底删除邮件
async function handlePermanentDeleteEmails(emailIds: number[]) {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要彻底删除这 ${emailIds.length} 封邮件吗？此操作不可恢复！`,
      '彻底删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    loading.value = true
    await permanentDeleteEmails(emailIds, selectedFolder.value, selectedFolderId.value)
    
    await loadCustomFolders()
    await loadMailStats()
    
    ElMessage.success(`成功彻底删除 ${emailIds.length} 封邮件`)
  } catch (error: any) {
    if (error === 'cancel') {
      return
    }
    ElMessage.error('彻底删除邮件失败')
  } finally {
    loading.value = false
  }
}

// 处理显示消息
function handleShowMessage(data: { type: string, message: string }) {
  const { type, message } = data
  if (type === 'warning') {
    ElMessage.warning(message)
  } else if (type === 'error') {
    ElMessage.error(message)
  } else if (type === 'success') {
    ElMessage.success(message)
  } else {
    ElMessage.info(message)
  }
}

// 处理移动邮件操作
async function handleMoveEmails(data: { folderId: number, emailIds: number[] }) {
  const { folderId, emailIds } = data
  
  try {
    loading.value = true
    
    // 获取目标文件夹信息
    const targetFolder = customFolders.value.find(f => f.id === folderId)
    if (!targetFolder) {
      throw new Error('目标文件夹不存在')
    }
    const targetFolderName = targetFolder.folderName
    
    // 调用移动邮件API
    await moveEmails(folderId, emailIds)
    
    // 移动成功后刷新自定义文件夹树状态
    await loadCustomFolders()
    
    // 根据源文件夹类型处理本地状态
    if (selectedFolder.value === 'custom' && selectedFolderId.value) {
      // 自定义文件夹 → 自定义文件夹：真正移动（移除）
      const currentEmails = folderEmails[selectedFolderId.value]
      if (currentEmails) {
        emailIds.forEach(emailId => {
          const emailIndex = currentEmails.findIndex(email => email.id === emailId)
          if (emailIndex !== -1) {
            currentEmails.splice(emailIndex, 1)
          }
        })
      }
    }
    
    // 重新加载目标文件夹的邮件（如果当前正在查看该文件夹）
    if (selectedFolder.value === 'custom' && selectedFolderId.value === folderId) {
      await loadFolderEmailsById(folderId)
    }
    
    await loadMailStats()
    ElMessage.success(`成功移动 ${emailIds.length} 封邮件到文件夹"${targetFolderName}"`)
  } catch (error: any) {
    const errorMsg = error?.response?.data?.msg || error?.message || '移动邮件失败'
    ElMessage.error(`移动邮件失败: ${errorMsg}`)
  } finally {
    loading.value = false
  }
}

// 处理从当前自定义文件夹移除邮件
async function handleRemoveFromFolder(data: { folderId: number, emailIds: number[] }) {
  const { folderId, emailIds } = data
  
  try {
    loading.value = true
    await removeFromFolder(folderId, emailIds)

    await loadMailStats()
    await loadCustomFolders()

    ElMessage.success(`已从当前文件夹移除 ${emailIds.length} 封邮件`)
  } catch (error: any) {
    ElMessage.error('从文件夹移除失败')
  } finally {
    loading.value = false
  }
}

// 处理标记邮件操作
async function handleMarkEmails(data: { action: string, emailIds: number[] }) {
  const { action, emailIds } = data
  
  try {
    loading.value = true
    
    let successMessage = ''
    
    switch (action) {
      case 'read':
        successMessage = `成功标记 ${emailIds.length} 封邮件为已读`
        break
      case 'unread':
        successMessage = `成功标记 ${emailIds.length} 封邮件为未读`
        break
      case 'star':
        successMessage = `成功为 ${emailIds.length} 封邮件添加星标`
        break
      case 'unstar':
        successMessage = `成功取消 ${emailIds.length} 封邮件的星标`
        break
      case 'spam':
        successMessage = `成功将 ${emailIds.length} 封邮件标记为垃圾邮件`
        break
      case 'unspam':
        successMessage = `成功取消 ${emailIds.length} 封邮件的垃圾邮件标记`
        break
      default:
        ElMessage.error('未知的标记操作')
        return
    }
    
    await markEmails(action, emailIds, selectedFolder.value, selectedFolderId.value)
    
    // 对于需要重新加载自定义文件夹的操作
    if (['spam', 'unspam'].includes(action)) {
      await loadCustomFolders()
    }
    
    await loadMailStats()
    ElMessage.success(successMessage)
  } catch (error: any) {
    ElMessage.error('标记邮件失败')
  } finally {
    loading.value = false
  }
}

// 处理星标切换
async function handleToggleStar(emailId: number) {
  try {
    await toggleStar(emailId)
    await loadMailStats()
  } catch (error: any) {
    ElMessage.error('操作失败')
  }
}

// 同步邮件方法
async function handleSyncMails() {
  try {
    const loadingInstance = ElLoading.service({ text: '正在同步邮件...' })
    
    // 根据当前选中的文件夹类型选择正确的加载方法
    if (selectedFolder.value === 'custom' && selectedFolderId.value) {
      await loadFolderEmailsById(selectedFolderId.value)
        } else {
      await loadFolderEmails(selectedFolder.value)
        }
    
    await loadMailStats()
    ElMessage.success('邮件同步成功')
    loadingInstance.close()
  } catch (error: any) {
    ElMessage.error('同步邮件失败')
  }
}

// 处理查看邮件详情
async function handleViewEmailDetail(emailId: number) {
  // 首先检查邮件是否是草稿
  // 在系统文件夹中查找邮件
  let currentEmail = Object.values(allEmails).flat().find(email => email.id === emailId)
  
  // 如果在系统文件夹中没找到，在自定义文件夹中查找
  if (!currentEmail) {
    currentEmail = Object.values(folderEmails).flat().find(email => email.id === emailId)
  }
  
  // 如果是草稿邮件，跳转到写信界面编辑
  if (currentEmail?.isDraft || selectedFolder.value === 'drafts') {
    await router.push({ path: '/mail/write', query: { draftId: String(emailId) } })
    return
  }
  
  // 正式邮件：检查是否已读，如果未读则标记为已读
  if (currentEmail && !currentEmail.isRead) {
    try {
      await setFolderMailsReadState([emailId], true)
      
      // 更新本地状态
      updateEmailStatusInAllFolders([emailId], (email) => {
        email.isRead = true
      })
      
      // 重新加载邮件统计
      await loadMailStats()
    } catch (markError: any) {
      // 标记失败不影响邮件详情显示
    }
  }
}

// 处理获取邮件详情
async function handleGetEmailDetail(emailId: number) {
  try {
    let emailDetail: any = null
    
    // 优先从缓存中获取
    if (emailDetailsCache.value[emailId]) {
      emailDetail = emailDetailsCache.value[emailId]
    } else {
      emailDetail = await getLetterDetail(emailId)
      
      // 缓存邮件详情
      if (emailDetail) {
        emailDetailsCache.value[emailId] = emailDetail
      }
    }
    
    // 验证返回的数据结构
    if (!emailDetail) {
      throw new Error(`邮件详情数据为空，邮件ID: ${emailId}`)
    }
    
    // 获取邮件附件列表
    try {
      const attachments = await getLetterAttachmentsByLetterId(emailId)
      emailDetail.attachments = attachments || []
    } catch (attachmentError: any) {
      emailDetail.attachments = []
    }
    
    // 将详细数据传递给子组件
    if (mainContentRef.value) {
      mainContentRef.value.updateEmailDetail(emailDetail)
    }
  } catch (error: any) {
    let errorMsg = '获取邮件详情失败'
    
    if (error?.response?.status === 404) {
      errorMsg = `邮件不存在或已被删除 (ID: ${emailId})`
    } else if (error?.response?.status === 403) {
      errorMsg = '没有权限查看此邮件'
    } else if (error?.response?.status === 401) {
      errorMsg = '用户未登录，请重新登录'
    } else if (error?.response?.data?.msg) {
      errorMsg = error.response.data.msg
    } else if (error?.message) {
      errorMsg = error.message
    }
    
    ElMessage.error(`查看邮件详情失败: ${errorMsg}`)
  }
}

// 处理回复邮件
function handleReplyEmail(emailId: number) {
  router.push({ 
    path: '/mail/write', 
    query: { 
      replyId: String(emailId),
      type: 'reply'
    } 
  })
}

// 处理转发邮件（支持单封或多封）
function handleForwardEmail(emailIdOrIds: number | number[]) {
  const isArray = Array.isArray(emailIdOrIds)
  const query: any = { type: 'forward' }
  if (isArray) {
    query.replyIds = (emailIdOrIds as number[]).join(',')
  } else {
    query.replyId = String(emailIdOrIds)
  }
  router.push({ path: '/mail/write', query })
}

// 写信
function goCompose() {
  router.push('/mail/write')
}

// 组件挂载时初始化数据
onMounted(async () => {
  try {
    await loadMailStats()
    await loadCustomFolders()
    await loadFolderEmails('inbox')
  } catch (error: any) {
    ElMessage.error('邮件组件初始化失败')
  }
})

</script>

<style scoped>
/* 主文件只保留布局相关样式 */
.mail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}

.content-wrapper {
  display: flex;
  height: calc(100vh - 80px);
  gap: 8px;
  padding: 8px;
  overflow: hidden;
}
</style>
