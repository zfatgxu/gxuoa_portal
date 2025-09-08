import request from '@/config/axios'
import type { MailListItemVO } from '../letter/index'

// ==================== 文件夹相关VO ====================

// 文件夹响应VO - 对应后端 FolderRespVO
export interface FolderRespVO {
  id: number                    // 文件夹ID
  userIdCard: string            // 用户身份证号
  folderName: string            // 文件夹名称
  parentId: number              // 父文件夹ID
  sortOrder: number             // 排序顺序
  description?: string          // 文件夹描述
  mailCount: number             // 邮件数量
  createTime: string            // 创建时间
  updateTime: string            // 更新时间
  children?: FolderRespVO[]     // 子文件夹列表
}

// 文件夹创建请求VO - 对应后端 FolderCreateReqVO
export interface FolderCreateReqVO {
  folderName: string            // 文件夹名称，必填
  parentId?: number             // 父文件夹ID，可选，默认为0（根目录）
  description?: string          // 文件夹描述，可选
}

// 文件夹更新请求VO - 对应后端 FolderUpdateReqVO
export interface FolderUpdateReqVO {
  id: number                    // 文件夹ID，必填
  folderName: string            // 文件夹名称，必填
  parentId?: number             // 父文件夹ID，可选
  sortOrder?: number            // 排序顺序，可选
  description?: string          // 文件夹描述，可选
}

// 移动邮件请求VO - 对应后端 MoveMailReqVO
export interface MoveMailReqVO {
  letterIds: number[]           // 信件ID列表，必填
  folderId: number              // 目标文件夹ID，必填
  mailType: number              // 邮件类型：1-收件，2-发件，必填
}


// ==================== 文件夹管理API ====================

/**
 * 创建文件夹
 * @param data 创建文件夹请求参数
 * @returns Promise<number> 返回创建的文件夹ID
 */
export const createFolder = async (data: FolderCreateReqVO): Promise<number> => {
  return await request.post({ url: '/letter/folder/create', data })
}

/**
 * 更新文件夹
 * @param data 更新文件夹请求参数
 * @returns Promise<boolean>
 */
export const updateFolder = async (data: FolderUpdateReqVO): Promise<boolean> => {
  return await request.put({ url: '/letter/folder/update', data })
}

/**
 * 删除文件夹
 * @param id 文件夹ID
 * @returns Promise<boolean>
 */
export const deleteFolder = async (id: number): Promise<boolean> => {
  return await request.delete({ url: `/letter/folder/delete?id=${id}` })
}

/**
 * 获取文件夹详情
 * @param id 文件夹ID
 * @returns Promise<FolderRespVO>
 */
export const getFolderDetail = async (id: number): Promise<FolderRespVO> => {
  return await request.get({ url: `/letter/folder/get?id=${id}` })
}

/**
 * 获取文件夹列表
 * @returns Promise<FolderRespVO[]>
 */
export const getFolderList = async (): Promise<FolderRespVO[]> => {
  return await request.get({ url: '/letter/folder/list' })
}

/**
 * 获取文件夹树形结构
 * @returns Promise<FolderRespVO[]>
 */
export const getFolderTree = async (): Promise<FolderRespVO[]> => {
  return await request.get({ url: '/letter/folder/tree' })
}

// ==================== 文件夹邮件管理API ====================

/**
 * 移动邮件到文件夹
 * @param data 移动邮件请求参数
 * @returns Promise<boolean>
 */
export const moveMailToFolder = async (data: MoveMailReqVO): Promise<boolean> => {
  return await request.post({ url: '/letter/folder/move-mail', data })
}

/**
 * 从文件夹移除邮件
 * @param folderId 文件夹ID
 * @param letterIds 信件ID列表
 * @param mailType 邮件类型：1-收件，2-发件
 * @returns Promise<boolean>
 */
export const removeMailFromFolder = async (folderId: number, letterIds: number[], mailType: number): Promise<boolean> => {
  return await request.delete({ 
    url: `/letter/folder/remove-mail?folderId=${folderId}&letterIds=${letterIds.join(',')}&mailType=${mailType}` 
  })
}

/**
 * 获取文件夹中的邮件列表
 * @param folderId 文件夹ID
 * @param pageNo 页码，可选，默认1
 * @param pageSize 页大小，可选，默认20
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getFolderMails = async (folderId: number, pageNo: number = 1, pageSize: number = 20): Promise<{list: MailListItemVO[], total: number}> => {
  return await request.get({ 
    url: `/letter/folder/mails?folderId=${folderId}&pageNo=${pageNo}&pageSize=${pageSize}` 
  })
}

// ==================== 文件夹工具API ====================

/**
 * 检查文件夹名称是否可用
 * @param folderName 文件夹名称
 * @param excludeId 排除的文件夹ID（用于更新时检查）
 * @returns Promise<boolean> true-可用，false-不可用
 */
export const checkFolderName = async (folderName: string, excludeId?: number): Promise<boolean> => {
  const params = excludeId ? { folderName, excludeId } : { folderName }
  return await request.get({ url: '/letter/folder/check-name', params })
}

/**
 * 获取文件夹邮件数量
 * @param folderId 文件夹ID
 * @returns Promise<number> 邮件数量
 */
export const getFolderMailCount = async (folderId: number): Promise<number> => {
  return await request.get({ url: `/letter/folder/mail-count?folderId=${folderId}` })
}
