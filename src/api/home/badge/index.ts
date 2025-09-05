import { getHomeToDoPage } from '@/api/home/todo'
import { SupervisionTaskApi } from '@/api/supervision'
import { getSealTodoPage } from '@/api/seal'
import { RegisterApi } from '@/api/leave/create/createForm'
import { getUnreadMails } from '@/api/system/mail/letter'

// Badge数据接口
export interface BadgeData {
  [key: string]: number
}

// 获取各模块待办数量的服务
export class BadgeService {
  
  // 获取公文待办数量
  static async getDocumentTodoCount(): Promise<number> {
    try {
      const response = await getHomeToDoPage({ 
        pageNo: 1, 
        pageSize: 1 
      })
      return response?.total || 0
    } catch (error) {
      console.warn('获取公文待办数量失败:', error)
      return 0
    }
  }

  // 获取督查督办待办数量
  static async getSupervisionTodoCount(): Promise<number> {
    try {
      const response = await SupervisionTaskApi.getTodoPage({ 
        pageNo: 1, 
        pageSize: 1 
      })
      return response?.total || 0
    } catch (error) {
      console.warn('获取督查督办待办数量失败:', error)
      return 0
    }
  }

  // 获取印章管理待办数量
  static async getSealTodoCount(): Promise<number> {
    try {
      const response = await getSealTodoPage({ 
        pageNo: 1, 
        pageSize: 1 
      })
      return response?.total || 0
    } catch (error) {
      console.warn('获取印章管理待办数量失败:', error)
      return 0
    }
  }

  // 获取请假审批待办数量（使用请假登记专用接口）
  static async getLeaveTodoCount(): Promise<number> {
    try {
      const response = await RegisterApi.getRegisterTodoPage({ 
        pageNo: 1, 
        pageSize: 1,
        category: '请假登记',
        processDefinitionKey: 'oa_leaveRegister'
      })
      return response?.total || 0
    } catch (error) {
      console.warn('获取请假审批待办数量失败:', error)
      return 0
    }
  }

  // 获取邮件待办数量（未读邮件）
  static async getMailTodoCount(): Promise<number> {
    try {
      const response = await getUnreadMails({ 
        pageNo: 1, 
        pageSize: 1 
      })
      return response?.total || 0
    } catch (error) {
      console.warn('获取邮件待办数量失败:', error)
      return 0
    }
  }

  // 获取所有模块的待办数量
  static async getAllBadgeCounts(): Promise<BadgeData> {
    const [
      documentCount,
      supervisionCount,
      sealCount,
      leaveCount,
      mailCount
    ] = await Promise.all([
      this.getDocumentTodoCount(),
      this.getSupervisionTodoCount(),
      this.getSealTodoCount(),
      this.getLeaveTodoCount(),
      this.getMailTodoCount()
    ])

    return {
      document: documentCount,      // 公文
      supervision: supervisionCount, // 督查督办
      seal: sealCount,              // 印章管理
      leave: leaveCount,            // 请假审批
      mail: mailCount               // 邮件
    }
  }
}
