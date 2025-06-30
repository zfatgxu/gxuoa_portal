// 卡片设置相关类型定义

// 单个卡片设置项
export interface CardSetting {
  visible: boolean  // 是否显示
  limit: number     // 显示条数
}

// 所有卡片设置
export interface CardSettings {
  todo?: CardSetting      // 待办事项卡片
  notice?: CardSetting    // 通知公告卡片
  shortcut?: CardSetting  // 快捷功能卡片
  schedule?: CardSetting  // 日程安排卡片
  file?: CardSetting      // 文件管理卡片
}

// localStorage中存储的用户设置
export interface UserSetting {
  todo?: {
    visible?: boolean
    limit?: number
  }
  notice?: {
    visible?: boolean
    limit?: number
  }
  shortcut?: {
    visible?: boolean
    limit?: number
  }
  schedule?: {
    visible?: boolean
    limit?: number
  }
  file?: {
    visible?: boolean
    limit?: number
  }
  [key: string]: any  // 允许其他设置项
}
