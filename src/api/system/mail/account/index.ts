import request from '@/config/axios'

export interface MailAccountVO {
  id: number
  mail: string
  username: string
  password: string
  host: string
  port: number
  sslEnable: boolean
  starttlsEnable: boolean
  // 新增IMAP/POP3接收配置
  receiveProtocol?: 'IMAP' | 'POP3'  // 接收协议
  receiveHost?: string               // 接收服务器地址
  receivePort?: number              // 接收服务器端口
  receiveSslEnable?: boolean        // 接收是否启用SSL
  autoSync?: boolean                // 是否自动同步
  syncInterval?: number             // 同步间隔(分钟)
}

// 查询邮箱账号列表
export const getMailAccountPage = async (params: PageParam) => {
  console.log('📋 查询邮箱账号列表API调用开始')
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/mail-account/page')
  
  try {
    const response = await request.get({ url: '/system/mail-account/page', params })
    console.log('✅ 查询邮箱账号列表API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 查询邮箱账号列表API调用失败')
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

// 查询邮箱账号详情
export const getMailAccount = async (id: number) => {
  console.log('👤 查询邮箱账号详情API调用开始')
  console.log('📋 账号ID:', id)
  console.log('🔗 API地址: /system/mail-account/get?id=' + id)
  
  try {
    const response = await request.get({ url: '/system/mail-account/get?id=' + id })
    console.log('✅ 查询邮箱账号详情API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 查询邮箱账号详情API调用失败')
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

// 新增邮箱账号
export const createMailAccount = async (data: MailAccountVO) => {
  console.log('➕ 新增邮箱账号API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/mail-account/create')
  
  try {
    const response = await request.post({ url: '/system/mail-account/create', data })
    console.log('✅ 新增邮箱账号API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 新增邮箱账号API调用失败')
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

// 修改邮箱账号
export const updateMailAccount = async (data: MailAccountVO) => {
  console.log('✏️ 修改邮箱账号API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/mail-account/update')
  
  try {
    const response = await request.put({ url: '/system/mail-account/update', data })
    console.log('✅ 修改邮箱账号API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 修改邮箱账号API调用失败')
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

// 删除邮箱账号
export const deleteMailAccount = async (id: number) => {
  console.log('🗑️ 删除邮箱账号API调用开始')
  console.log('📋 账号ID:', id)
  console.log('🔗 API地址: /system/mail-account/delete?id=' + id)
  
  try {
    const response = await request.delete({ url: '/system/mail-account/delete?id=' + id })
    console.log('✅ 删除邮箱账号API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 删除邮箱账号API调用失败')
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

// 批量删除邮箱账号
export const deleteMailAccountList = async (ids: number[]) => {
  console.log('🗑️ 批量删除邮箱账号API调用开始')
  console.log('📋 账号ID列表:', ids)
  console.log('🔗 API地址: /system/mail-account/delete-list')
  
  try {
    const response = await request.delete({ url: '/system/mail-account/delete-list', params: { ids: ids.join(',') } })
    console.log('✅ 批量删除邮箱账号API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 批量删除邮箱账号API调用失败')
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

// 获得邮箱账号精简列表
export const getSimpleMailAccountList = async () => {
  console.log('📋 获得邮箱账号精简列表API调用开始')
  console.log('🔗 API地址: /system/mail-account/simple-list')
  
  try {
    const response = request.get({ url: '/system/mail-account/simple-list' })
    console.log('✅ 获得邮箱账号精简列表API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 获得邮箱账号精简列表API调用失败')
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

// 新增邮件接收相关API
// 测试邮件账号连接 - 匹配后端实现
export const testMailAccountConnection = async (accountId: number) => {
  console.log('🔗 测试邮件账号连接API调用开始')
  console.log('📋 账号ID:', accountId)
  console.log('🔗 API地址: /system/mail/account/test-connection/' + accountId)
  
  try {
    const response = await request.post({ url: `/system/mail/account/test-connection/${accountId}` })
    console.log('✅ 测试邮件账号连接API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 测试邮件账号连接API调用失败')
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

// 手动同步指定账号的邮件 - 匹配后端实现
export const syncMailAccount = async (accountId: number) => {
  console.log('🔄 手动同步指定账号的邮件API调用开始')
  console.log('📋 账号ID:', accountId)
  console.log('🔗 API地址: /system/mail/account/sync/' + accountId)
  
  try {
    const response = await request.post({ url: `/system/mail/account/sync/${accountId}` })
    console.log('✅ 手动同步指定账号的邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 手动同步指定账号的邮件API调用失败')
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

// 获取账号同步状态
export const getAccountSyncStatus = async (accountId: number) => {
  console.log('📊 获取账号同步状态API调用开始')
  console.log('📋 账号ID:', accountId)
  console.log('🔗 API地址: /system/mail-account/sync-status/' + accountId)
  
  try {
    const response = await request.get({ url: `/system/mail-account/sync-status/${accountId}` })
    console.log('✅ 获取账号同步状态API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 获取账号同步状态API调用失败')
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

// 设置账号自动同步
export const setAutoSync = async (accountId: number, enabled: boolean, interval?: number) => {
  console.log('⚙️ 设置账号自动同步API调用开始')
  console.log('📋 账号ID:', accountId)
  console.log('📋 启用状态:', enabled)
  console.log('📋 同步间隔:', interval)
  console.log('🔗 API地址: /system/mail-account/auto-sync/' + accountId)
  
  try {
    const response = await request.put({ 
      url: `/system/mail-account/auto-sync/${accountId}`, 
      data: { enabled, interval } 
    })
    
    console.log('✅ 设置账号自动同步API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 设置账号自动同步API调用失败')
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
