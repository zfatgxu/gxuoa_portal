import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  uploadLetterAttachment,
  deleteLetterAttachment,
  getLetterAttachment,
  FILE_TYPE,
  formatFileSize,
  validateFileBeforeUpload,
  type LetterAttachmentRespVO
} from '@/api/mail/attachment'
import type { FileValidationResult } from '../types/mail'

/**
 * 附件管理 Composable
 * 负责附件上传、删除、验证等功能
 */
export function useAttachments() {
  // 状态
  const attachmentList = ref<LetterAttachmentRespVO[]>([])
  const tempAttachmentList = ref<LetterAttachmentRespVO[]>([])
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const isDragOver = ref(false)
  const localFiles = ref<File[]>([])
  
  // 配置
  const config = {
    maxFileSize: 50 * 1024 * 1024,      // 50MB
    maxTotalSize: 100 * 1024 * 1024,    // 100MB
    maxFileCount: 20
  }
  
  // 允许的文件类型
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'video/x-msvideo',
    'audio/mpeg',
    'audio/wav',
    'audio/flac',
    'audio/aac'
  ]
  
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg',
    '.zip', '.rar', '.7z',
    '.mp4', '.avi', '.mov', '.wmv',
    '.mp3', '.wav', '.flac', '.aac'
  ]
  
  /**
   * 获取当前附件总大小（字节）
   */
  const getCurrentAttachmentSizeBytes = (): number => {
    let totalSize = 0
    
    // 计算已上传附件的大小
    attachmentList.value.forEach(attachment => {
      const sizeStr = attachment.fileSize
      if (sizeStr) {
        const bytes = parseInt(sizeStr, 10)
        if (!isNaN(bytes)) {
          totalSize += bytes
        }
      }
    })
    
    // 计算本地文件的大小
    localFiles.value.forEach(file => {
      totalSize += file.size
    })
    
    return totalSize
  }
  
  // 计算属性
  const totalSize = computed(() => getCurrentAttachmentSizeBytes())
  const formattedTotalSize = computed(() => formatFileSize(totalSize.value))
  const isWarning = computed(() => totalSize.value > config.maxTotalSize * 0.8)
  const isOverLimit = computed(() => totalSize.value > config.maxTotalSize)
  
  /**
   * 验证文件
   */
  const validateFiles = (files: File[]): FileValidationResult => {
    // 检查文件数量限制
    const currentFileCount = attachmentList.value.length + localFiles.value.length
    if (currentFileCount + files.length > config.maxFileCount) {
      return {
        valid: false,
        message: `附件数量超过限制。当前已有 ${currentFileCount} 个附件，最多支持 ${config.maxFileCount} 个附件`
      }
    }
    
    // 计算当前已上传附件的大小
    const currentTotalSize = getCurrentAttachmentSizeBytes()
    
    // 计算新文件的总大小
    let newFilesTotalSize = 0
    for (const file of files) {
      newFilesTotalSize += file.size
    }
    
    // 检查单个文件大小限制
    for (const file of files) {
      if (file.size > config.maxFileSize) {
        return {
          valid: false,
          message: `文件 "${file.name}" 超过单个文件50MB大小限制（当前大小：${formatFileSize(file.size)}）`
        }
      }
    }
    
    // 检查总附件大小限制
    if (currentTotalSize + newFilesTotalSize > config.maxTotalSize) {
      return {
        valid: false,
        message: `附件总大小超过100MB限制。当前已使用：${formatFileSize(currentTotalSize)}，新增：${formatFileSize(newFilesTotalSize)}，总计：${formatFileSize(currentTotalSize + newFilesTotalSize)}`
      }
    }
    
    // 检查文件类型
    for (const file of files) {
      const fileName = file.name.toLowerCase()
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
      
      if (!allowedTypes.includes(file.type) && !hasValidExtension) {
        return {
          valid: false,
          message: `文件 "${file.name}" 格式不支持。支持的文件格式：${allowedExtensions.join(', ')}`
        }
      }
    }
    
    return { valid: true, message: '' }
  }
  
  /**
   * 处理文件上传
   */
  const handleFileUpload = async (files: FileList | null): Promise<number[]> => {
    if (!files || files.length === 0) return []
    
    const newFiles = Array.from(files)
    
    try {
      // 验证文件
      const validationResult = validateFiles(newFiles)
      if (!validationResult.valid) {
        ElMessage.error(validationResult.message)
        return []
      }
      
      uploading.value = true
      uploadProgress.value = 0
      
      ElMessage.info(`开始上传 ${newFiles.length} 个文件...`)
      
      // 逐个上传文件
      const attachmentIds: number[] = []
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i]
        
        // 验证单个文件
        const fileValidation = validateFileBeforeUpload(file)
        if (!fileValidation.valid) {
          ElMessage.error(`文件 "${file.name}" 验证失败: ${fileValidation.message}`)
          continue
        }
        
        try {
          // 上传文件
          const attachmentId = await uploadLetterAttachment(file, FILE_TYPE.LETTER_CONTENT)
          attachmentIds.push(attachmentId)
          
          // 更新进度
          uploadProgress.value = Math.round(((i + 1) / newFiles.length) * 100)
          console.log(`📤 上传进度: ${i + 1}/${newFiles.length} (${uploadProgress.value}%)`)
        } catch (error: any) {
          console.error(`上传文件 "${file.name}" 失败:`, error)
          ElMessage.error(`文件 "${file.name}" 上传失败`)
        }
      }
      
      if (attachmentIds.length > 0) {
        // 获取上传后的附件信息
        await loadAttachmentInfo(attachmentIds)
        ElMessage.success(`成功上传 ${attachmentIds.length} 个附件`)
      }
      
      return attachmentIds
    } catch (error: any) {
      console.error('文件上传失败:', error)
      
      let errorMessage = '上传失败'
      if (error.message) {
        if (error.message.includes('网络')) {
          errorMessage = '网络连接失败，请检查网络后重试'
        } else if (error.message.includes('大小') || error.message.includes('格式')) {
          errorMessage = error.message
        } else {
          errorMessage = `上传失败: ${error.message}`
        }
      } else {
        errorMessage = '上传失败，请稍后重试'
      }
      
      ElMessage.error(errorMessage)
      return []
    } finally {
      uploading.value = false
      uploadProgress.value = 0
    }
  }
  
  /**
   * 加载附件信息
   */
  const loadAttachmentInfo = async (attachmentIds: number[]) => {
    try {
      for (const id of attachmentIds) {
        const info = await getLetterAttachment(id)
        attachmentList.value.push(info)
      }
    } catch (error) {
      console.error('加载附件信息失败:', error)
    }
  }
  
  /**
   * 删除本地附件
   */
  const removeLocalAttachment = (index: number) => {
    const fileName = localFiles.value[index].name
    localFiles.value.splice(index, 1)
    ElMessage.success(`已删除附件: ${fileName}`)
  }
  
  /**
   * 删除已上传的附件
   */
  const removeUploadedAttachment = async (attachmentId: number, index: number) => {
    try {
      await deleteLetterAttachment(attachmentId)
      attachmentList.value.splice(index, 1)
      ElMessage.success('附件删除成功')
      return true
    } catch (error: any) {
      console.error('删除附件失败:', error)
      ElMessage.error(`删除失败: ${error.message || '网络错误'}`)
      return false
    }
  }
  
  /**
   * 批量删除附件
   */
  const batchRemoveAttachments = async (attachmentIds: number[]) => {
    try {
      for (const id of attachmentIds) {
        await deleteLetterAttachment(id)
      }
      
      attachmentList.value = attachmentList.value.filter(
        attachment => !attachmentIds.includes(attachment.id)
      )
      
      ElMessage.success(`成功删除 ${attachmentIds.length} 个附件`)
      return true
    } catch (error: any) {
      console.error('批量删除附件失败:', error)
      ElMessage.error(`删除失败: ${error.message || '网络错误'}`)
      return false
    }
  }
  
  /**
   * 拖拽相关方法
   */
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    isDragOver.value = true
  }
  
  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    isDragOver.value = false
  }
  
  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    isDragOver.value = false
    
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      await handleFileUpload(files)
    }
  }
  
  /**
   * 重置附件状态
   */
  const resetAttachments = () => {
    attachmentList.value = []
    tempAttachmentList.value = []
    localFiles.value = []
    uploading.value = false
    uploadProgress.value = 0
    isDragOver.value = false
  }
  
  return {
    // 状态
    attachmentList,
    tempAttachmentList,
    uploading,
    uploadProgress,
    isDragOver,
    localFiles,
    
    // 计算属性
    totalSize,
    formattedTotalSize,
    isWarning,
    isOverLimit,
    
    // 方法
    handleFileUpload,
    validateFiles,
    loadAttachmentInfo,
    removeLocalAttachment,
    removeUploadedAttachment,
    batchRemoveAttachments,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    getCurrentAttachmentSizeBytes,
    resetAttachments
  }
}

