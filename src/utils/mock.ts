/**
 * 简单的Mock工具，用于模拟API响应
 */

// 模拟异步API调用，返回模拟数据
export const mockApiResponse = <T>(data: T, delay: number = 300): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, delay)
  })
}

// 生成随机ID
export const generateId = (): number => {
  return Math.floor(Math.random() * 10000) + 1
}

// 获取今天日期的字符串，格式：YYYY-MM-DD
export const getTodayString = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取未来日期的字符串，格式：YYYY-MM-DD
export const getFutureDateString = (daysFromNow: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 计算两个日期之间的天数差
export const getDaysDifference = (targetDateStr: string): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const targetDate = new Date(targetDateStr)
  targetDate.setHours(0, 0, 0, 0)
  
  const diffTime = targetDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
