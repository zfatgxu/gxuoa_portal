/**
 * Independent time operation tool to facilitate subsequent switch to dayjs
 */
// TODO 芋艿：【锁屏】可能后面删除掉
import dayjs from 'dayjs'

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'YYYY-MM-DD'

export function formatToDateTime(date?: dayjs.ConfigType, format = DATE_TIME_FORMAT): string {
  return dayjs(date).format(format)
}

export function formatToDate(date?: dayjs.ConfigType, format = DATE_FORMAT): string {
  return dayjs(date).format(format)
}

// 兼容性导出，避免其他文件的导入错误
export const utilFormatDate = formatToDateTime

export const dateUtil = dayjs
