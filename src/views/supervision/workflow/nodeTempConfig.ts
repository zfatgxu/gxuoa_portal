/**
 * 督办流程节点临时变更配置
 * 用于配置驱动的临时修改功能
 */

export interface NodeTempField {
  /** 表单字段名 */
  formField: string
  /** 流程变量名 */
  processVar: string
  /** 显示名称 */
  displayName: string
  /** 自定义比较器，用于判断是否有变更 */
  comparator?: (oldVal: any, newVal: any) => boolean
}

export interface NodeTempConfig {
  /** 节点标识 */
  nodeKey: string
  /** 变更标识变量名 */
  flagVar: string
  /** 字段配置列表 */
  fields: NodeTempField[]
  /** 节点显示名称 */
  displayName: string
  /** 驳回优先级，数字越小优先级越高 */
  rejectPriority: number
}

/**
 * 默认比较器：深度比较两个值是否相等
 */
const defaultComparator = (oldVal: any, newVal: any): boolean => {
  if (oldVal === newVal) return false
  
  // 处理数组比较
  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    if (oldVal.length !== newVal.length) return true
    return oldVal.some((item, index) => item !== newVal[index])
  }
  
  // 处理对象比较
  if (typeof oldVal === 'object' && typeof newVal === 'object' && oldVal !== null && newVal !== null) {
    return JSON.stringify(oldVal) !== JSON.stringify(newVal)
  }
  
  return true
}

/**
 * 日期比较器：支持毫秒时间戳与字符串格式的等价比较
 */
const dateComparator = (oldVal: any, newVal: any): boolean => {
  if (oldVal == null && newVal == null) return false
  if (oldVal == null || newVal == null) return true
  
  try {
    // 处理原始值（通常是数字时间戳）
    let oldTime: number
    let oldFormatted: string = ''
    
    if (typeof oldVal === 'number') {
      oldTime = oldVal
      // 将毫秒时间戳格式化为本地时区的 "yyyy-MM-dd HH:mm:ss" 格式
      const date = new Date(oldTime)
      oldFormatted = date.getFullYear() + '-' + 
        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
        String(date.getDate()).padStart(2, '0') + ' ' + 
        String(date.getHours()).padStart(2, '0') + ':' + 
        String(date.getMinutes()).padStart(2, '0') + ':' + 
        String(date.getSeconds()).padStart(2, '0')
    } else {
      oldTime = new Date(oldVal).getTime()
      oldFormatted = String(oldVal)
    }
    
    // 处理当前值（可能是 "yyyy-MM-dd HH:mm:ss" 格式字符串）
    let newTime: number
    const newFormatted: string = String(newVal)
    
    if (typeof newVal === 'number') {
      newTime = newVal
    } else if (typeof newVal === 'string') {
      // 显式解析 "yyyy-MM-dd HH:mm:ss" 格式
      const match = newVal.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
      if (match) {
        const [, year, month, day, hour, minute, second] = match
        // 注意：月份需要减1，因为 Date 构造函数的月份是从0开始的
        newTime = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          parseInt(hour, 10),
          parseInt(minute, 10),
          parseInt(second, 10)
        ).getTime()
      } else {
        newTime = new Date(newVal).getTime()
      }
    } else {
      newTime = new Date(newVal).getTime()
    }
    
    // 先进行字符串语义等价判断
    const stringEqual = oldFormatted === newFormatted
    const timestampEqual = oldTime === newTime
    
    console.log(`🕐 [dateComparator] 日期比较详情:`)
    console.log(`🕐   原始值: ${oldVal} (${typeof oldVal}) → ${oldTime}ms → "${oldFormatted}"`)
    console.log(`🕐   当前值: ${newVal} (${typeof newVal}) → ${newTime}ms → "${newFormatted}"`)
    console.log(`🕐   字符串等价: ${stringEqual}`)
    console.log(`🕐   时间戳等价: ${timestampEqual}`)
    
    // 优先使用字符串等价判断，如果字符串相等则认为无变更
    if (stringEqual) {
      console.log(`🕐   判定结果: 无变更（字符串等价）`)
      return false
    }
    
    // 字符串不等时，使用时间戳判断
    const hasChanged = !timestampEqual
    console.log(`🕐   判定结果: ${hasChanged ? '有变更' : '无变更'}（时间戳比较）`)
    return hasChanged
  } catch (error) {
    console.warn('日期解析失败，使用字符串比较:', error)
    return String(oldVal) !== String(newVal)
  }
}

/**
 * 将值归一化为ID数组，用于部门字段比较
 */
const normalizeToIdArray = (val: any): number[] => {
  if (!val) return []
  
  let ids: number[] = []
  
  if (typeof val === 'string') {
    // 处理逗号分隔的字符串 "1,2,3"
    ids = val.split(',')
      .map(item => item.trim())
      .map(item => parseInt(item, 10))
      .filter(id => !isNaN(id))
  } else if (Array.isArray(val)) {
    // 处理数组，可能是对象数组或数字数组
    ids = val.map((item: any) => {
      if (typeof item === 'object' && item !== null) {
        // 对象，取 id 或 value 字段
        return parseInt(item.id || item.value || 0, 10)
      } else {
        // 直接是数字或字符串
        return parseInt(item, 10)
      }
    }).filter(id => !isNaN(id))
  } else if (typeof val === 'number') {
    // 单个数字
    ids = [val]
  } else if (typeof val === 'object' && val !== null) {
    // 单个对象
    const id = parseInt(val.id || val.value || 0, 10)
    if (!isNaN(id)) {
      ids = [id]
    }
  }
  
  // 排序并去重
  return [...new Set(ids)].sort((a, b) => a - b)
}

/**
 * 部门字段比较器：先归一化为ID数组再比较
 */
const deptComparator = (oldVal: any, newVal: any): boolean => {
  const oldIds = normalizeToIdArray(oldVal)
  const newIds = normalizeToIdArray(newVal)
  
  // 比较数组长度和每个元素
  if (oldIds.length !== newIds.length) return true
  
  return oldIds.some((id, index) => id !== newIds[index])
}

/**
 * 督办流程节点临时变更配置
 */
export const SUPERVISION_NODE_TEMP_CONFIGS: NodeTempConfig[] = [
  {
    nodeKey: 'select_leaddept',
    flagVar: 'deptChangeFlag', // 兼容现有变量名
    displayName: '选择办理单位',
    rejectPriority: 1,
    fields: [
      {
        formField: 'leadDept',
        processVar: 'tempLeadDeptIds',
        displayName: '办理单位',
        comparator: deptComparator
      },
      {
        formField: 'coDept',
        processVar: 'tempCoDeptIds',
        displayName: '协办单位',
        comparator: deptComparator
      }
    ]
  },
  {
    nodeKey: 'update_materials',
    flagVar: 'updateMaterialsChangeFlag',
    displayName: '修改督办信息',
    rejectPriority: 3,
    fields: [
      {
        formField: 'orderTitle',
        processVar: 'latestTempUpdateMaterialsOrderTitle',
        displayName: '督办事项',
        comparator: defaultComparator
      },
      {
        formField: 'content',
        processVar: 'latestTempUpdateMaterialsContent',
        displayName: '主要内容',
        comparator: defaultComparator
      },
      {
        formField: 'officePhone',
        processVar: 'latestTempUpdateMaterialsOfficePhone',
        displayName: '联系电话',
        comparator: defaultComparator
      },
      {
        formField: 'detailType',
        processVar: 'latestTempUpdateMaterialsType',
        displayName: '督办分类',
        comparator: defaultComparator
      },
      {
        formField: 'priority',
        processVar: 'latestTempUpdateMaterialsPriority',
        displayName: '紧急程度',
        comparator: defaultComparator
      },
      {
        formField: 'reportFrequency',
        processVar: 'latestTempUpdateMaterialsReportFrequency',
        displayName: '报告频次',
        comparator: defaultComparator
      },
      {
        formField: 'deadline',
        processVar: 'latestTempUpdateMaterialsDeadline',
        displayName: '完成期限',
        comparator: dateComparator
      },
      {
        formField: 'supervisorIds',
        processVar: 'latestTempUpdateMaterialsSupervisors',
        displayName: '督办人',
        comparator: defaultComparator
      },
      {
        formField: 'otherLeaderIds',
        processVar: 'latestTempUpdateMaterialsOtherLeaders',
        displayName: '其他校领导',
        comparator: defaultComparator
      },
      {
        formField: 'leadDept',
        processVar: 'latestTempUpdateMaterialsLeadDeptIds',
        displayName: '办理单位',
        comparator: deptComparator
      },
      {
        formField: 'coDept',
        processVar: 'latestTempUpdateMaterialsCoDeptIds',
        displayName: '协办单位',
        comparator: deptComparator
      }
    ]
  },
  // 【需求变更】de_director_check 节点无编辑权限，临时变更配置停用
  // 如需恢复，请取消下方注释并删除此说明
  /*
  {
    nodeKey: 'de_director_check',
    flagVar: 'deDirectorChangeFlag',
    displayName: '副主任审核',
    rejectPriority: 2,
    fields: [
      {
        formField: 'orderTitle',
        processVar: 'tempDeDirectorOrderTitle',
        displayName: '督办事项',
        comparator: defaultComparator
      },
      {
        formField: 'content',
        processVar: 'tempDeDirectorContent',
        displayName: '主要内容',
        comparator: defaultComparator
      },
      {
        formField: 'type',
        processVar: 'tempDeDirectorType',
        displayName: '督办分类',
        comparator: defaultComparator
      },
      {
        formField: 'priority',
        processVar: 'tempDeDirectorPriority',
        displayName: '紧急程度',
        comparator: defaultComparator
      },
      {
        formField: 'deadline',
        processVar: 'tempDeDirectorDeadline',
        displayName: '完成期限',
        comparator: dateComparator
      },
      {
        formField: 'reportFrequency',
        processVar: 'tempDeDirectorReportFrequency',
        displayName: '报告频次',
        comparator: defaultComparator
      },
      {
        formField: 'otherLeaderIds',
        processVar: 'tempDeDirectorOtherLeaders',
        displayName: '其他校领导',
        comparator: defaultComparator
      },
      {
        formField: 'supervisorIds',
        processVar: 'tempDeDirectorSupervisors',
        displayName: '督办人',
        comparator: defaultComparator
      },
      {
        formField: 'officePhone',
        processVar: 'tempDeDirectorOfficePhone',
        displayName: '联系电话',
        comparator: defaultComparator
      }
    ]
  }
  */
]

/**
 * 根据节点标识获取配置
 */
export const getNodeTempConfig = (nodeKey: string): NodeTempConfig | undefined => {
  return SUPERVISION_NODE_TEMP_CONFIGS.find(config => config.nodeKey === nodeKey)
}

/**
 * 获取所有配置的变更标识变量名
 */
export const getAllFlagVars = (): string[] => {
  return SUPERVISION_NODE_TEMP_CONFIGS.map(config => config.flagVar)
}

/**
 * 根据驳回优先级排序获取配置
 */
export const getConfigsByRejectPriority = (): NodeTempConfig[] => {
  return [...SUPERVISION_NODE_TEMP_CONFIGS].sort((a, b) => a.rejectPriority - b.rejectPriority)
}
