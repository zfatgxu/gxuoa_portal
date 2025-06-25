// 创建一个简单的事件总线，用于组件间通信
type EventCallback = (...args: any[]) => void

interface EventBus {
  on(event: string, callback: EventCallback): void
  emit(event: string, ...args: any[]): void
  off(event: string, callback?: EventCallback): void
}

class EventBusClass implements EventBus {
  private events: Record<string, EventCallback[]> = {}

  // 监听事件
  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  // 触发事件
  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args))
    }
  }

  // 移除事件监听
  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      // 如果没有提供回调函数，则移除该事件的所有监听器
      delete this.events[event]
    } else if (this.events[event]) {
      // 否则只移除指定的回调函数
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  }
}

// 导出事件总线实例
export const eventBus = new EventBusClass()

// 定义事件名称常量
export const EVENT_NAMES = {
  SWITCH_COMPONENT: 'switch-component',
  UPDATE_UNREAD_COUNT: 'update-unread-count',
  REFRESH_TODO_LIST: 'refresh-todo-list'
}
