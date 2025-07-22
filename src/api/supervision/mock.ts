import Mock from 'mockjs'
import { 
  DeptStatisticsRespVO, 
  DeptTaskRespVO, 
  DeptTaskPageReqVO, 
  PageResult 
} from './index'
import { mockApiResponse, getFutureDateString, getDaysDifference, getTodayString } from '@/utils/mock'

// 模拟部门统计数据
export const mockDeptStatistics = (): Promise<DeptStatisticsRespVO> => {
  const data = Mock.mock({
    'myTaskCount|2-5': 3,
    'ongoingCount|3-8': 4,
    'completedCount|1-6': 2,
    'overdueCount|0-3': 1
  }) as DeptStatisticsRespVO
  
  return mockApiResponse(data)
}

// 部门列表
const departments = ['学生处', '后勤处', '保卫处', '教务处', '人事处', '基建处', '信息中心', '校务督办', '党委办公室', '校长办公室']

// 生成模拟任务列表数据
const generateMockTaskList = (count: number = 20): DeptTaskRespVO[] => {
  const tasks: DeptTaskRespVO[] = []
  
  for (let i = 0; i < count; i++) {
    // 随机状态和日期
    let status: string
    const remainingDaysValue = Mock.Random.integer(-10, 60)
    
    if (remainingDaysValue < 0) {
      status = Mock.Random.boolean() ? '超时' : '已完成'
    } else {
      status = Mock.Random.pick(['进行中', '已完成', '进行中', '进行中']) // 增加进行中的概率
    }
    
    // 随机协作部门
    const collaboratorCount = Mock.Random.integer(0, 3)
    const collaborators: string[] = []
    
    for (let j = 0; j < collaboratorCount; j++) {
      const dept = Mock.Random.pick(departments)
      if (!collaborators.includes(dept)) {
        collaborators.push(dept)
      }
    }
    
    // 随机优先级
    const priority = Mock.Random.pick(['高优先级', '中优先级', '一般优先'])
    
    // 随机督办人
    const leaderName = Mock.Random.cname()
    const leaderTitle = Mock.Random.pick(['校长', '副校长', '主任', '处长'])
    
    const task: DeptTaskRespVO = {
      id: 1000 + i,
      title: Mock.Random.ctitle(5, 15),
      description: Mock.Random.cparagraph(1, 2),
      instruction: `${leaderName}${leaderTitle}批示：${Mock.Random.csentence(10, 30)}`,
      issuer: Mock.Random.pick(departments),
      collaborators,
      supervisor: `${leaderName}${leaderTitle}`,
      deadline: getFutureDateString(remainingDaysValue),
      createTime: getFutureDateString(-Mock.Random.integer(1, 30)),
      remainingDays: remainingDaysValue,
      priority,
      status,
      mainContent: Mock.Random.cparagraph(3, 8),
      undertakingContent: generateUndertakingContent(collaborators)
    }
    
    tasks.push(task)
  }
  
  return tasks
}

// 生成任务承办内容
const generateUndertakingContent = (collaborators: string[]): string => {
  let content = ''
  
  // 主责部门
  content += `1. ${Mock.Random.pick(departments)}负责${Mock.Random.csentence(10, 30)}；`
  
  // 协作部门
  for (let i = 0; i < collaborators.length; i++) {
    content += `${i + 2}. ${collaborators[i]}负责${Mock.Random.csentence(10, 30)}；`
  }
  
  return content
}

// 生成模拟任务列表
const mockTaskList: DeptTaskRespVO[] = generateMockTaskList()

// 更新任务列表中的日期相关字段，确保数据始终是基于当前日期计算的
const updateTaskDates = (tasks: DeptTaskRespVO[]): DeptTaskRespVO[] => {
  return tasks.map(task => {
    // 复制任务对象
    const updatedTask = { ...task }
    
    // 如果是已超时的任务
    if (task.status === '超时') {
      updatedTask.deadline = getFutureDateString(-5) // 5天前
      updatedTask.remainingDays = -5
    } else {
      // 更新剩余天数，基于截止日期和当前日期
      updatedTask.remainingDays = getDaysDifference(task.deadline)
    }
    
    return updatedTask
  })
}

// 模拟部门任务分页接口
export const mockDeptTaskPage = (params: DeptTaskPageReqVO): Promise<PageResult<DeptTaskRespVO>> => {
  // 先更新任务日期相关字段
  const updatedTasks = updateTaskDates([...mockTaskList])
  
  // 根据当前选项卡筛选任务
  let filteredTasks = [...updatedTasks]
  
  // 当前模拟登录用户信息
  const currentUserInfo = {
    name: Mock.Random.cname(),
    title: Mock.Random.pick(['校长', '副校长', '主任', '处长']),
    department: Mock.Random.pick(departments)
  }
  
  const currentUserSupervisor = `${currentUserInfo.name}${currentUserInfo.title}`
  
  if (params.tab === 'my-tasks') {
    // 确保至少有几条"我的任务"
    const myTasks = updatedTasks.filter(task => task.supervisor === currentUserSupervisor)
    
    if (myTasks.length < 3) {
      // 如果筛选后"我的任务"太少，则为当前用户生成一些任务
      const additionalTaskCount = 3 - myTasks.length
      const additionalTasks: DeptTaskRespVO[] = []
      
      for (let i = 0; i < additionalTaskCount; i++) {
        const remainingDaysValue = Mock.Random.integer(-5, 30)
        let status: string
        
        if (remainingDaysValue < 0) {
          status = Mock.Random.boolean() ? '超时' : '已完成'
        } else {
          status = '进行中'
        }
        
        // 随机协作部门
        const collaboratorCount = Mock.Random.integer(1, 3)
        const collaborators: string[] = []
        
        for (let j = 0; j < collaboratorCount; j++) {
          const dept = Mock.Random.pick(departments)
          if (!collaborators.includes(dept) && dept !== currentUserInfo.department) {
            collaborators.push(dept)
          }
        }
        
        additionalTasks.push({
          id: 10000 + updatedTasks.length + i,
          title: `${currentUserInfo.name}${currentUserInfo.title}督办的${Mock.Random.ctitle(5, 10)}`,
          description: Mock.Random.cparagraph(1, 2),
          instruction: `${currentUserInfo.name}${currentUserInfo.title}批示：${Mock.Random.csentence(10, 30)}`,
          issuer: currentUserInfo.department,
          collaborators,
          supervisor: currentUserSupervisor,
          deadline: getFutureDateString(remainingDaysValue),
          createTime: getFutureDateString(-Mock.Random.integer(1, 15)),
          remainingDays: remainingDaysValue,
          priority: Mock.Random.pick(['高优先级', '中优先级', '一般优先']),
          status,
          mainContent: Mock.Random.cparagraph(3, 8),
          undertakingContent: generateUndertakingContent(collaborators)
        })
      }
      
      // 将新生成的任务添加到列表中
      filteredTasks = [...myTasks, ...additionalTasks]
    } else {
      filteredTasks = myTasks
    }
  } else if (params.tab === 'collaborative-tasks') {
    filteredTasks = filteredTasks.filter(task => task.collaborators.includes(currentUserInfo.department))
  } else if (params.tab === 'completed-tasks') {
    // 确保至少有几条已完成任务
    const completedTasks = updatedTasks.filter(task => task.status === '已完成')
    
    if (completedTasks.length < 3) {
      // 如果筛选后已完成任务太少，则生成一些已完成任务
      const additionalTaskCount = 3 - completedTasks.length
      const additionalTasks: DeptTaskRespVO[] = []
      
      for (let i = 0; i < additionalTaskCount; i++) {
        // 随机协作部门
        const collaboratorCount = Mock.Random.integer(0, 3)
        const collaborators: string[] = []
        
        for (let j = 0; j < collaboratorCount; j++) {
          const dept = Mock.Random.pick(departments)
          if (!collaborators.includes(dept)) {
            collaborators.push(dept)
          }
        }
        
        // 已完成任务的剩余天数可能为正（提前完成）或负（逾期完成）
        const remainingDaysValue = Mock.Random.integer(-20, 10)
        
        additionalTasks.push({
          id: 20000 + updatedTasks.length + i,
          title: Mock.Random.ctitle(5, 15),
          description: Mock.Random.cparagraph(1, 2),
          instruction: `${Mock.Random.cname()}${Mock.Random.pick(['校长', '副校长', '主任'])}批示：${Mock.Random.csentence(10, 30)}`,
          issuer: Mock.Random.pick(departments),
          collaborators,
          supervisor: `${Mock.Random.cname()}${Mock.Random.pick(['校长', '副校长', '主任', '处长'])}`,
          deadline: getFutureDateString(remainingDaysValue),
          createTime: getFutureDateString(-Mock.Random.integer(15, 45)),
          remainingDays: remainingDaysValue,
          priority: Mock.Random.pick(['高优先级', '中优先级', '一般优先']),
          status: '已完成',
          mainContent: Mock.Random.cparagraph(3, 8),
          undertakingContent: generateUndertakingContent(collaborators)
        })
      }
      
      // 将新生成的任务添加到列表中
      filteredTasks = [...completedTasks, ...additionalTasks]
    } else {
      filteredTasks = completedTasks
    }
  }
  
  // 应用关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(keyword) || 
      (task.description && task.description.toLowerCase().includes(keyword)) ||
      (task.instruction && task.instruction.toLowerCase().includes(keyword))
    )
  }
  
  // 应用部门筛选
  if (params.department && params.department !== 'all') {
    filteredTasks = filteredTasks.filter(task => 
      task.issuer === params.department || task.collaborators.includes(params.department)
    )
  }
  
  // 应用状态筛选
  if (params.status && params.status !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.status === params.status)
  }
  
  // 计算分页
  const pageNo = params.pageNo || 1
  const pageSize = params.pageSize || 10
  const total = filteredTasks.length
  const startIdx = (pageNo - 1) * pageSize
  const endIdx = Math.min(startIdx + pageSize, total)
  const pagedTasks = filteredTasks.slice(startIdx, endIdx)
  
  // 构造返回结果
  const result: PageResult<DeptTaskRespVO> = {
    list: pagedTasks,
    total,
    pageNo,
    pageSize
  }
  
  return mockApiResponse(result)
}

// 模拟获取任务详情接口
export const mockDeptTaskDetail = (id: number): Promise<DeptTaskRespVO | undefined> => {
  const allTasks = updateTaskDates([...mockTaskList])
  const task = allTasks.find(task => task.id === id)
  
  if (task) {
    return mockApiResponse(task)
  }
  return mockApiResponse(undefined)
}

// 模拟添加任务进度接口
export const mockAddTaskProgress = (taskId: number, data: { description: string, percentage: number }) => {
  // 对于模拟API，我们只返回成功响应
  return mockApiResponse({
    code: 0,
    message: '添加进度成功',
    data: {
      taskId,
      ...data,
      createTime: getTodayString()
    }
  })
}
