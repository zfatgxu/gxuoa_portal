import { ref, watch, onBeforeUnmount, type Ref } from 'vue'
import { autoSaveDraft, getDraft } from '@/api/mail/draft'
import type { MailForm } from '../types/mail'

/**
 * 自动保存配置
 */
export interface AutoSaveConfig {
  /** 自动保存间隔（毫秒），默认 30 秒 */
  interval?: number
  /** 防抖延迟（毫秒），默认 3 秒 */
  debounceDelay?: number
  /** 是否启用自动保存，默认 true */
  enabled?: boolean
}

/**
 * 自动保存状态
 */
export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/**
 * 自动保存 Composable
 * 提供智能的自动保存功能
 */
export function useAutoSave(options: {
  mailForm: Ref<MailForm>
  editorInstance: Ref<any>
  currentDraftId: Ref<number | null>
  config?: AutoSaveConfig
}) {
  // 配置
  const config: Required<AutoSaveConfig> = {
    interval: options.config?.interval ?? 30000, // 30秒
    debounceDelay: options.config?.debounceDelay ?? 3000, // 3秒
    enabled: options.config?.enabled ?? true
  }
  
  // 状态
  const autoSaveStatus = ref<AutoSaveStatus>('idle')
  const lastAutoSaveTime = ref<string>('')
  const hasUnsavedChanges = ref(false)
  
  // 定时器
  let autoSaveTimer: NodeJS.Timeout | null = null
  let debounceTimer: NodeJS.Timeout | null = null
  
  // 上次保存的内容快照（用于检测变化）
  let lastSavedSnapshot = ''
  
  /**
   * 生成当前表单内容的快照
   */
  const createSnapshot = (): string => {
    return JSON.stringify({
      subject: options.mailForm.value.subject,
      content: options.mailForm.value.content,
      priority: options.mailForm.value.priority,
      requestReadReceipt: options.mailForm.value.requestReadReceipt
    })
  }
  
  /**
   * 检查是否有未保存的更改
   */
  const checkForChanges = (): boolean => {
    const currentSnapshot = createSnapshot()
    const hasChanges = currentSnapshot !== lastSavedSnapshot
    hasUnsavedChanges.value = hasChanges
    return hasChanges
  }
  
  /**
   * 执行自动保存
   */
  const performAutoSave = async (): Promise<void> => {
    // 必须有草稿ID才能自动保存
    if (!options.currentDraftId.value) {
      console.log('[AutoSave] 跳过自动保存：无草稿ID')
      return
    }
    
    // 检查是否有更改
    if (!checkForChanges()) {
      console.log('[AutoSave] 跳过自动保存：无内容变化')
      return
    }
    
    try {
      autoSaveStatus.value = 'saving'
      
      // 获取编辑器内容
      let editorContent = ''
      try {
        if (options.editorInstance.value && typeof options.editorInstance.value.getHtml === 'function') {
          editorContent = options.editorInstance.value.getHtml() || ''
        } else {
          editorContent = options.mailForm.value.content || ''
        }
      } catch (e) {
        editorContent = options.mailForm.value.content || ''
      }
      
      // 调用自动保存 API（只保存基本内容，不保存收件人和附件）
      const success = await autoSaveDraft({
        id: options.currentDraftId.value,
        subject: options.mailForm.value.subject || '',
        content: editorContent,
        priority: options.mailForm.value.priority || 1,
        requestReadReceipt: options.mailForm.value.requestReadReceipt || false
      })
      
      if (success) {
        // 获取草稿详情以获取真实的保存时间
        const draftDetail = await getDraft(options.currentDraftId.value)
        lastAutoSaveTime.value = draftDetail.lastSaveTime || new Date().toISOString()
        
        // 更新快照
        lastSavedSnapshot = createSnapshot()
        hasUnsavedChanges.value = false
        
        autoSaveStatus.value = 'saved'
        console.log('[AutoSave] 自动保存成功:', lastAutoSaveTime.value)
        
        // 3秒后恢复为idle状态
        setTimeout(() => {
          if (autoSaveStatus.value === 'saved') {
            autoSaveStatus.value = 'idle'
          }
        }, 3000)
      } else {
        throw new Error('自动保存返回失败')
      }
    } catch (error: any) {
      console.error('[AutoSave] 自动保存失败:', error)
      autoSaveStatus.value = 'error'
      
      // 5秒后恢复为idle状态
      setTimeout(() => {
        if (autoSaveStatus.value === 'error') {
          autoSaveStatus.value = 'idle'
        }
      }, 5000)
    }
  }
  
  /**
   * 重置自动保存定时器
   */
  const resetAutoSaveTimer = () => {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
    }
    
    if (config.enabled) {
      autoSaveTimer = setInterval(() => {
        performAutoSave()
      }, config.interval)
    }
  }
  
  /**
   * 防抖处理：内容变化时触发
   */
  const debouncedAutoSave = () => {
    if (!config.enabled || !options.currentDraftId.value) {
      return
    }
    
    // 标记有未保存的更改
    hasUnsavedChanges.value = true
    
    // 清除之前的防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // 设置新的防抖定时器
    debounceTimer = setTimeout(() => {
      performAutoSave()
    }, config.debounceDelay)
  }
  
  /**
   * 启动自动保存
   */
  const startAutoSave = () => {
    if (!config.enabled) {
      console.log('[AutoSave] 自动保存已禁用')
      return
    }
    
    console.log('[AutoSave] 启动自动保存，间隔:', config.interval / 1000, '秒')
    
    // 初始化快照
    lastSavedSnapshot = createSnapshot()
    
    // 设置定时器
    resetAutoSaveTimer()
    
    // 监听表单变化
    const stopWatching = watch(
      () => [
        options.mailForm.value.subject,
        options.mailForm.value.content,
        options.mailForm.value.priority,
        options.mailForm.value.requestReadReceipt
      ],
      () => {
        debouncedAutoSave()
      },
      { deep: true }
    )
    
    // 组件卸载时停止监听
    onBeforeUnmount(() => {
      stopWatching()
    })
  }
  
  /**
   * 停止自动保存
   */
  const stopAutoSave = () => {
    // 防重复调用：如果已经停止，直接返回
    if (!autoSaveTimer && !debounceTimer) {
      console.log('[AutoSave] 已经停止，跳过重复调用')
      return
    }
    
    console.log('[AutoSave] 停止自动保存')
    
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
    
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    
    autoSaveStatus.value = 'idle'
    hasUnsavedChanges.value = false
  }
  
  /**
   * 手动触发自动保存（用于特殊场景）
   */
  const triggerAutoSave = async () => {
    await performAutoSave()
  }
  
  /**
   * 更新保存快照（用于手动保存后同步状态）
   */
  const updateSnapshot = (saveTime?: string) => {
    lastSavedSnapshot = createSnapshot()
    hasUnsavedChanges.value = false
    if (saveTime) {
      lastAutoSaveTime.value = saveTime
    }
  }
  
  // 注意：不在这里调用 onBeforeUnmount，由调用方（write.vue）负责清理
  // 这样可以在清理前执行其他逻辑（如保存未保存的更改）
  
  return {
    // 状态
    autoSaveStatus,
    lastAutoSaveTime,
    hasUnsavedChanges,
    
    // 方法
    startAutoSave,
    stopAutoSave,
    triggerAutoSave,
    updateSnapshot,
    checkForChanges
  }
}

