/**
 * 格式化邮件时间显示（智能显示）
 * - 今天：今天 hh:mm
 * - 昨天：昨天 hh:mm
 * - 本年：m月d日
 * - 往年：yyyy/mm/dd
 */
export function formatMailTime(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  
  // 使用本地时间而不是UTC时间来获取日期字符串
  const getLocalDateStr = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const todayStr = getLocalDateStr(today)
  const mailDateStr = getLocalDateStr(date)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = getLocalDateStr(yesterday)
  
  const timeStr = date.toTimeString().slice(0, 5)
  
  if (mailDateStr === todayStr) {
    return `今天 ${timeStr}`
  } else if (mailDateStr === yesterdayStr) {
    return `昨天 ${timeStr}`
  } else {
    const currentYear = today.getFullYear()
    const mailYear = date.getFullYear()
    
    if (mailYear === currentYear) {
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    } else {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}/${month}/${day}`
    }
  }
}

/**
 * 格式化日期时间为中文格式：yyyy年m月d日 hh:mm
 */
export function formatDateTimeCn(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const hh = `${d.getHours()}`.padStart(2, '0')
  const mm = `${d.getMinutes()}`.padStart(2, '0')
  
  return `${y}年${m}月${day}日 ${hh}:${mm}`
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

/**
 * 格式化时间为 HH:MM
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toTimeString().slice(0, 5)
}

/**
 * 格式化相对时间（xx天前、xx小时前）
 */
export function formatLastSendTime(timeStr: string): string {
  if (!timeStr) return ''
  
  const now = new Date()
  const sendTime = new Date(timeStr)
  const diffMs = now.getTime() - sendTime.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffDays > 0) {
    return `${diffDays}天前`
  } else if (diffHours > 0) {
    return `${diffHours}小时前`
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟前`
  } else {
    return '刚刚'
  }
}

/**
 * 检查字符串是否为身份证号格式
 */
export function isIdCardFormat(str: string): boolean {
  return /^[0-9X]{15,18}$/.test(str)
}

/**
 * 验证邮箱格式
 */
export function isEmailFormat(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
}

/**
 * 获取头像显示文本
 */
export function getAvatarText(senderName?: string): string {
  if (!senderName) return '?'
  return senderName.charAt(0).toUpperCase()
}

/**
 * 去除HTML标签，提取纯文本
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  const temp = document.createElement('div')
  temp.innerHTML = html
  const text = temp.textContent || temp.innerText || ''
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * 格式化详细时间显示（yyyy年m月d日 hh:mm）
 */
export function formatDisplayTime(timeStr?: string): string {
  if (!timeStr) return '未知时间'
  
  try {
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) {
      return timeStr || '未知时间'
    }
    
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  } catch (error) {
    return timeStr || '未知时间'
  }
}

/**
 * 格式化收件人列表显示
 */
export function formatRecipientsForList(toMail?: string): string {
  if (!toMail) return '(收件人未填写)'
  const recipients = toMail.split(',').map(s => s.trim()).filter(Boolean)
  if (recipients.length === 0) {
    return '(收件人未填写)'
  }
  return recipients.join('、')
}

/**
 * 获取日期标签（今天/昨天/本周/上周/更早）
 */
export function getDateLabel(dateStr: string): string {
  // 获取今天的日期（只保留年月日，清零时分秒）
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 获取邮件的日期（只保留年月日，清零时分秒）
  const mailDate = new Date(dateStr)
  mailDate.setHours(0, 0, 0, 0)
  
  // 计算天数差（使用日期比较，而不是时间戳差值）
  const diffDays = Math.floor((today.getTime() - mailDate.getTime()) / 86400000)
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return '本周'
  if (diffDays < 14) return '上周'
  return '更早'  // 上周之后直接归为"更早"
}

