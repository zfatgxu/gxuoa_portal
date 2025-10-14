<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <div 
        class="tool-btn primary" 
        :class="{ 'disabled': sending }" 
        @click="handleSend"
      >
        <el-icon><Position /></el-icon>
        <span>{{ sending ? '发送中...' : '发送' }}</span>
      </div>
      <el-dropdown trigger="click">
        <div class="tool-btn">
          <el-icon><Setting /></el-icon>
          <span>发信设置</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleScheduleSend">定时发送</el-dropdown-item>
            <el-dropdown-item @click="handleToggleReadReceipt">
              <div class="dropdown-item-with-checkbox">
                <el-checkbox 
                  :model-value="requestReadReceipt" 
                  @change="handleToggleReadReceipt"
                  @click.stop
                >
                  请求已读回执
                </el-checkbox>
              </div>
            </el-dropdown-item>
            <el-dropdown-item divided>
              <el-dropdown placement="right-start" @command="handlePriorityChange">
                <div class="dropdown-submenu-trigger">
                  <span>设置优先级</span>
                  <span class="priority-label">{{ getPriorityLabel(priority) }}</span>
                  <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="1">
                      <div class="priority-item">
                        <el-icon v-if="priority === 1" class="check-icon"><Check /></el-icon>
                        <span :class="{ 'checked': priority === 1 }">普通</span>
                      </div>
                    </el-dropdown-item>
                    <el-dropdown-item :command="2">
                      <div class="priority-item">
                        <el-icon v-if="priority === 2" class="check-icon"><Check /></el-icon>
                        <span :class="{ 'checked': priority === 2, 'important': true }">重要</span>
                      </div>
                    </el-dropdown-item>
                    <el-dropdown-item :command="3">
                      <div class="priority-item">
                        <el-icon v-if="priority === 3" class="check-icon"><Check /></el-icon>
                        <span :class="{ 'checked': priority === 3, 'urgent': true }">紧急</span>
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="toolbar-right">
      <span v-if="scheduledSendTime" class="scheduled-time">
        <el-icon><Clock /></el-icon>
        <span>定时发送: {{ formatScheduledTime(scheduledSendTime) }}</span>
      </span>
      
      <!-- 自动保存状态显示 -->
      <span v-if="autoSaveStatus && autoSaveStatus !== 'idle'" class="auto-save-status" :class="autoSaveStatus">
        <el-icon v-if="autoSaveStatus === 'saving'" class="rotating"><Loading /></el-icon>
        <el-icon v-else-if="autoSaveStatus === 'saved'"><CircleCheck /></el-icon>
        <el-icon v-else-if="autoSaveStatus === 'error'"><CircleClose /></el-icon>
        <span>{{ getAutoSaveStatusText(autoSaveStatus) }}</span>
      </span>
      
      <span v-if="lastSaveTime && autoSaveStatus !== 'saving'" class="time">已于{{ lastSaveTime }}保存至草稿</span>
      <div class="tool-btn" @click="handleSaveDraft">
        <span>保存草稿</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Position, Setting, ArrowDown, ArrowRight, Check, Clock, Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { formatMailTime } from '../utils/mailHelpers'

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  sending: boolean
  lastSaveTime?: string
  requestReadReceipt: boolean
  priority: number
  scheduledSendTime?: string
  autoSaveStatus?: AutoSaveStatus
}

interface Emits {
  (e: 'send'): void
  (e: 'save-draft'): void
  (e: 'schedule-send'): void
  (e: 'update:requestReadReceipt', value: boolean): void
  (e: 'update:priority', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  lastSaveTime: '',
  priority: 1,
  scheduledSendTime: '',
  autoSaveStatus: 'idle'
})
const emit = defineEmits<Emits>()

const handleSend = () => {
  emit('send')
}

const handleSaveDraft = () => {
  emit('save-draft')
}

const handleScheduleSend = () => {
  emit('schedule-send')
}

const handleToggleReadReceipt = () => {
  emit('update:requestReadReceipt', !props.requestReadReceipt)
}

const handlePriorityChange = (priority: number) => {
  emit('update:priority', priority)
}

const getPriorityLabel = (priority: number): string => {
  switch (priority) {
    case 1:
      return '普通'
    case 2:
      return '重要'
    case 3:
      return '紧急'
    default:
      return '普通'
  }
}

// 格式化定时发送时间显示（复用模块的时间格式化函数）
const formatScheduledTime = (timeStr: string): string => {
  if (!timeStr) return ''
  try {
    return formatMailTime(timeStr)
  } catch (e) {
    return timeStr
  }
}

// 获取自动保存状态文本
const getAutoSaveStatusText = (status: AutoSaveStatus): string => {
  switch (status) {
    case 'saving':
      return '正在保存...'
    case 'saved':
      return '已自动保存'
    case 'error':
      return '保存失败'
    default:
      return ''
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  height: 66px;
  background-color: #fff;
  border-bottom: 2px solid #e3f2fd;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tool-btn {
  height: 33px;
  padding: 0 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 15px;
  color: #222;
  display: flex;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
}

.tool-btn:hover {
  background-color: #f0f0f0;
}

.tool-btn.primary {
  background-color: #4285f4;
  color: white;
  border-color: #4285f4;
}

.tool-btn.primary:hover {
  background-color: #3367d6;
}

.tool-btn.disabled {
  background-color: #c0c4cc !important;
  border-color: #c0c4cc !important;
  color: #a8abb2 !important;
  cursor: not-allowed !important;
}

.tool-btn.disabled:hover {
  background-color: #c0c4cc !important;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.time {
  font-size: 12px;
  color: #666;
  margin-right: 10px;
  min-width: 120px;
  white-space: nowrap;
}

.scheduled-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #409eff;
  margin-right: 12px;
  padding: 4px 12px;
  background-color: #ecf5ff;
  border-radius: 12px;
  white-space: nowrap;
}

.scheduled-time .el-icon {
  font-size: 14px;
}

.dropdown-item-with-checkbox {
  width: 100%;
}

.dropdown-item-with-checkbox :deep(.el-checkbox) {
  width: 100%;
}

.dropdown-item-with-checkbox :deep(.el-checkbox__label) {
  width: 100%;
}

.dropdown-submenu-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.priority-label {
  color: #909399;
  font-size: 13px;
  flex: 1;
  text-align: right;
}

.priority-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.priority-item .check-icon {
  color: #409eff;
  font-size: 16px;
}

.priority-item span {
  flex: 1;
}

.priority-item span.checked {
  color: #409eff;
  font-weight: 500;
}

.priority-item span.important {
  color: #e6a23c;
}

.priority-item span.urgent {
  color: #f56c6c;
}

/* 自动保存状态 */
.auto-save-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  margin-right: 8px;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.auto-save-status.saving {
  color: #409eff;
  background-color: #ecf5ff;
}

.auto-save-status.saved {
  color: #67c23a;
  background-color: #f0f9ff;
}

.auto-save-status.error {
  color: #f56c6c;
  background-color: #fef0f0;
}

.auto-save-status .el-icon {
  font-size: 14px;
}

/* 旋转动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotating {
  animation: rotate 1s linear infinite;
}
</style>

