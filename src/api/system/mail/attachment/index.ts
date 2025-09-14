import request from '@/config/axios'
import type { PageParam } from '@/api/supervision'

// ==================== 邮件附件相关VO ====================

// 邮件附件保存请求VO - 对应后端 LetterAttachmentSaveReqVO
export interface LetterAttachmentSaveReqVO {
  id?: number                   // 附件ID（更新时必填）
  letterId?: number             // 邮件ID
  draftId?: number              // 草稿ID
  fileName: string              // 文件名
  fileSize: number              // 文件大小
  fileType: number              // 文件类型
  fileUrl: string               // 文件URL
  uploadUserIdCard: string      // 上传用户身份证号
  isTemp?: boolean              // 是否临时文件
  tempExpireTime?: string       // 临时文件过期时间
}

// 邮件附件响应VO - 对应后端 LetterAttachmentRespVO
export interface LetterAttachmentRespVO {
  id: number                    // 附件ID
  letterId?: number             // 邮件ID
  draftId?: number              // 草稿ID
  fileName: string              // 文件名
  fileSize: number              // 文件大小
  fileType: number              // 文件类型
  fileUrl: string               // 文件URL
  uploadUserIdCard: string      // 上传用户身份证号
  uploadTime: string            // 上传时间
  downloadCount: number         // 下载次数
  isTemp: boolean               // 是否临时文件
  tempExpireTime?: string       // 临时文件过期时间
  createTime: string            // 创建时间
  updateTime: string            // 更新时间
  tenantId: number              // 租户编号
}

// 邮件附件分页查询请求VO - 对应后端 LetterAttachmentPageReqVO
export interface LetterAttachmentPageReqVO extends PageParam {
  letterId?: number             // 邮件ID
  draftId?: number              // 草稿ID
  fileName?: string             // 文件名
  fileType?: number             // 文件类型
  uploadUserIdCard?: string     // 上传用户身份证号
  isTemp?: boolean              // 是否临时文件
}

// ==================== 邮件附件管理API ====================

/**
 * 上传邮件附件
 * @param file 文件对象
 * @param fileType 文件类型
 * @param fileUrl 文件URL
 * @returns Promise<number> 返回附件ID
 */
export const uploadLetterAttachment = async (
  file: File,
  fileType: number,
  fileUrl: string
): Promise<number> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileType', fileType.toString())
  formData.append('fileUrl', fileUrl)
  
  return await request.post({
    url: '/letter/attachment/upload',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 更新邮件附件
 * @param data 更新请求参数
 * @returns Promise<boolean>
 */
export const updateLetterAttachment = async (data: LetterAttachmentSaveReqVO): Promise<boolean> => {
  return await request.put({ url: '/letter/attachment/update', data })
}

/**
 * 删除邮件附件
 * @param id 附件编号
 * @returns Promise<boolean>
 */
export const deleteLetterAttachment = async (id: number): Promise<boolean> => {
  return await request.delete({ url: `/letter/attachment/delete?id=${id}` })
}

/**
 * 获取邮件附件详情
 * @param id 附件编号
 * @returns Promise<LetterAttachmentRespVO>
 */
export const getLetterAttachment = async (id: number): Promise<LetterAttachmentRespVO> => {
  return await request.get({ url: `/letter/attachment/get?id=${id}` })
}

/**
 * 根据邮件ID获取附件列表
 * @param letterId 邮件ID
 * @param fileType 文件类型过滤（可选）
 * @returns Promise<LetterAttachmentRespVO[]>
 */
export const getLetterAttachmentsByLetterId = async (
  letterId: number,
  fileType?: number
): Promise<LetterAttachmentRespVO[]> => {
  const params: any = { letterId }
  if (fileType !== undefined) {
    params.fileType = fileType
  }
  return await request.get({ url: '/letter/attachment/list-by-letter-id', params })
}

/**
 * 根据草稿ID获取附件列表
 * @param draftId 草稿ID
 * @returns Promise<LetterAttachmentRespVO[]>
 */
export const getLetterAttachmentsByDraftId = async (draftId: number): Promise<LetterAttachmentRespVO[]> => {
  return await request.get({ url: `/letter/attachment/list-by-draft-id?draftId=${draftId}` })
}

/**
 * 获取邮件附件分页列表
 * @param params 分页查询参数
 * @returns Promise<{list: LetterAttachmentRespVO[], total: number}>
 */
export const getLetterAttachmentPage = async (
  params: LetterAttachmentPageReqVO
): Promise<{list: LetterAttachmentRespVO[], total: number}> => {
  return await request.get({ url: '/letter/attachment/page', params })
}

// ==================== 工具函数 ====================

/**
 * 文件大小格式化工具
 * @param bytes 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * 下载附件到本地
 * @param attachmentId 附件ID
 * @param fileName 文件名（可选）
 * @returns Promise<void>
 */
export const downloadAttachmentToLocal = async (attachmentId: number, fileName?: string): Promise<void> => {
  try {
    const response = await request.get({
      url: `/letter/attachment/download/${attachmentId}`,
      responseType: 'blob'
    })
    
    const blob = new Blob([response])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || '附件'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('文件下载失败:', error)
    throw new Error('文件下载失败')
  }
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型数组
 * @returns 是否允许该文件类型
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type) || allowedTypes.some(type => 
    file.name.toLowerCase().endsWith(type.toLowerCase())
  )
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSize 最大文件大小（字节）
 * @returns 是否在允许的大小范围内
 */
export const validateFileSize = (file: File, maxSize: number = 1024 * 1024 * 1024): boolean => {
  return file.size <= maxSize
}

/**
 * 获取文件扩展名
 * @param fileName 文件名
 * @returns 文件扩展名（不包含点号）
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

/**
 * 根据文件扩展名获取文件类型图标
 * @param fileName 文件名
 * @returns 文件类型图标类名
 */
export const getFileTypeIcon = (fileName: string): string => {
  const extension = getFileExtension(fileName)
  
  const iconMap: Record<string, string> = {
    // 文档类型
    'pdf': 'file-pdf',
    'doc': 'file-word',
    'docx': 'file-word',
    'xls': 'file-excel',
    'xlsx': 'file-excel',
    'ppt': 'file-powerpoint',
    'pptx': 'file-powerpoint',
    'txt': 'file-text',
    
    // 图片类型
    'jpg': 'file-image',
    'jpeg': 'file-image',
    'png': 'file-image',
    'gif': 'file-image',
    'bmp': 'file-image',
    'svg': 'file-image',
    
    // 压缩文件
    'zip': 'file-zip',
    'rar': 'file-zip',
    '7z': 'file-zip',
    'tar': 'file-zip',
    'gz': 'file-zip',
    
    // 视频文件
    'mp4': 'file-video',
    'avi': 'file-video',
    'mov': 'file-video',
    'wmv': 'file-video',
    'flv': 'file-video',
    
    // 音频文件
    'mp3': 'file-audio',
    'wav': 'file-audio',
    'flac': 'file-audio',
    'aac': 'file-audio',
  }
  
  return iconMap[extension] || 'file'
}
