import request from '@/config/axios'
import type { PageParam } from '@/api/supervision'

// ==================== 邮件附件相关VO ====================

// 文件类型常量
export const FILE_TYPE = {
  LETTER_CONTENT: 1,  // 邮件内容附件
  LETTER_DRAFT: 2     // 草稿附件
} as const


// 邮件附件保存请求VO - 对应后端 LetterAttachmentSaveReqVO
export interface LetterAttachmentSaveReqVO {
  id?: number                   // 附件ID（更新时必需）
  fileName: string              // 原始文件名（必需）
  fileUrl: string               // 文件URL（必需）
  fileSize: string              // 文件大小（必需）
  fileType: number              // 文件类型（必需）
  uploadUserIdCard: string      // 上传用户身份证号（必需）
}

// 邮件附件响应VO - 对应后端 LetterAttachmentRespVO
export interface LetterAttachmentRespVO {
  id: number                    // 附件ID
  fileName: string              // 原始文件名
  fileUrl: string               // 文件URL(MinIO存储地址)
  fileSize: string              // 文件大小，如"1024KB"
  fileType: number              // 文件类型：1-邮件内容附件，2-草稿附件
  uploadUserIdCard: string      // 上传用户身份证号
  createTime: string            // 创建时间，格式：2024-01-01 10:00:00
}

// 邮件附件分页查询请求VO - 对应后端 LetterAttachmentPageReqVO
export interface LetterAttachmentPageReqVO extends PageParam {
  pageNo?: number               // 页码，默认1
  pageSize?: number             // 每页大小，默认10
  fileName?: string             // 文件名筛选
  fileType?: number             // 文件类型筛选
  uploadUserIdCard?: string     // 上传用户身份证号筛选
  createTime?: string[]         // 创建时间范围，格式：["2024-01-01 00:00:00", "2024-01-31 23:59:59"]
}

// ==================== 邮件附件管理API ====================

/**
 * 上传邮件附件
 * @param file 文件对象
 * @param fileType 文件类型：1-邮件内容附件，2-草稿附件
 * @param fileUrl 文件路径（可选）
 * @returns Promise<number> 返回附件ID
 */
export const uploadLetterAttachment = async (
  file: File,
  fileType: number,
  fileUrl?: string
): Promise<number> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileType', fileType.toString())
  if (fileUrl) {
    formData.append('fileUrl', fileUrl)
  }
  
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
 * 将后端返回的字节数字符串转换为合适的单位显示
 * @param sizeStr 后端返回的文件大小字符串（字节数）
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSizeFromString = (sizeStr: string): string => {
  if (!sizeStr) return '0 B'
  
  const bytes = parseInt(sizeStr, 10)
  if (isNaN(bytes)) {
    return '未知大小'
  }
  
  return formatFileSize(bytes)
}

/**
 * 下载附件
 * @param attachmentId 附件ID
 * @param fileName 文件名（可选）
 * @returns Promise<void>
 */
export const downloadAttachment = async (attachmentId: number, fileName?: string): Promise<void> => {
  try {
    const response = await request.download({
      url: `/letter/attachment/download?id=${attachmentId}`
    })
    
    if (!(response instanceof Blob)) {
      const errorMsg = (response && (response.msg || response.message)) || '文件下载失败'
      throw new Error(errorMsg)
    }

    const blob = response as Blob
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || '附件'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error('文件下载失败')
  }
}

/**
 * 文件上传前验证
 * @param file 文件对象
 * @returns 验证结果
 */
export const validateFileBeforeUpload = (file: File): { valid: boolean; message?: string } => {
  if (!file) {
    return { valid: false, message: '请选择文件' }
  }
  
  if (file.size > 50 * 1024 * 1024) {
    return { valid: false, message: '文件大小不能超过50MB' }
  }
  
  return { valid: true }
}

/**
 * 获取文件扩展名
 * @param fileName 文件名
 * @returns 文件扩展名
 */
export const getFileExtension = (fileName: string): string => {
  if (!fileName) return ''
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : ''
}