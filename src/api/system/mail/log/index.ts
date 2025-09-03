import request from '@/config/axios'

export interface MailLogVO {
  id: number
  userId: number
  userType: number
  toMail: string
  accountId: number
  fromMail: string
  templateId: number
  templateCode: string
  templateNickname: string
  templateTitle: string
  templateContent: string
  templateParams: string
  sendStatus: number
  sendTime: Date
  sendMessageId: string
  sendException: string
}

// 查询邮件日志列表 - 修改为对应内部邮件系统
export const getMailLogPage = async (params: PageParam) => {
  console.log('📋 查询邮件日志列表API调用开始')
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/letter/log/page')
  
  try {
    const response = await request.get({ url: '/system/letter/log/page', params })
    console.log('✅ 查询邮件日志列表API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 查询邮件日志列表API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

// 查询邮件日志详情 - 修改为对应内部邮件系统
export const getMailLog = async (id: number) => {
  console.log('👤 查询邮件日志详情API调用开始')
  console.log('📋 日志ID:', id)
  console.log('🔗 API地址: /system/letter/log/get?id=' + id)
  
  try {
    const response = await request.get({ url: '/system/letter/log/get?id=' + id })
    console.log('✅ 查询邮件日志详情API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 查询邮件日志详情API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

// 新增邮件日志相关API - 对应内部邮件系统
export const createMailLog = async (data: MailLogVO) => {
  console.log('➕ 新增邮件日志API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/log/create')
  
  try {
    const response = await request.post({ url: '/system/letter/log/create', data })
    console.log('✅ 新增邮件日志API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 新增邮件日志API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

export const updateMailLog = async (data: MailLogVO) => {
  console.log('✏️ 修改邮件日志API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/log/update')
  
  try {
    const response = await request.put({ url: '/system/letter/log/update', data })
    console.log('✅ 修改邮件日志API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 修改邮件日志API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

export const deleteMailLog = async (id: number) => {
  console.log('🗑️ 删除邮件日志API调用开始')
  console.log('📋 日志ID:', id)
  console.log('🔗 API地址: /system/letter/log/delete?id=' + id)
  
  try {
    const response = await request.delete({ url: '/system/letter/log/delete?id=' + id })
    console.log('✅ 删除邮件日志API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 删除邮件日志API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

export const deleteMailLogList = async (ids: number[]) => {
  console.log('🗑️ 批量删除邮件日志API调用开始')
  console.log('📋 日志ID列表:', ids)
  console.log('🔗 API地址: /system/letter/log/delete-list')
  
  try {
    const response = await request.delete({ url: '/system/letter/log/delete-list', params: { ids: ids.join(',') } })
    console.log('✅ 批量删除邮件日志API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 批量删除邮件日志API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}
