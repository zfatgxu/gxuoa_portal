import { useUserStore } from '@/store/modules/user'

/**
 * 检查当前用户是否具有指定角色
 * @param roles 角色数组
 * @returns 是否具有任一指定角色
 */
export const checkRole = (roles: string[]): boolean => {
  const userStore = useUserStore()
  const userRoles = userStore.getRoles || []
  return Array.isArray(userRoles) && roles.some(role => userRoles.includes(role))
}

/**
 * 检查当前用户是否可以中止/恢复督办
 * 只有主任(dcb_zr)和副主任(dcb_fzr)可以操作
 */
export const canSuspendResume = (): boolean => {
  return checkRole(['dcb_zr', 'dcb_fzr'])
}

/**
 * 检查当前用户是否可以查看已中止的督办
 * 主任(dcb_zr)、副主任(dcb_fzr)、管理员(dcb_gly)可以查看
 */
export const canViewSuspended = (): boolean => {
  return checkRole(['dcb_zr', 'dcb_fzr', 'dcb_gly'])
}

/**
 * 获取督办状态的显示颜色
 * @param supervisionStatus 督办状态
 * @returns 颜色值
 */
export const getSupervisionStatusColor = (supervisionStatus: number | null | undefined): string => {
  if (supervisionStatus === null || supervisionStatus === undefined) return '#22A4EF' // 蓝色 - 进行中
  switch (supervisionStatus) {
    case 1: return '#22A4EF' // 蓝色 - 进行中
    case 2: return '#F59E0B' // 橙色 - 已超时
    case 3: return '#10B981' // 绿色 - 已结束
    case 4: return '#8B5CF6' // 紫色 - 待审核
    case 5: return '#EF4444' // 红色 - 已终止
    case 6: return '#6B7280' // 灰色 - 已中止
    default: return '#22A4EF' // 默认蓝色
  }
}
