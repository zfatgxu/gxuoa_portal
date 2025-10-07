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
            <el-dropdown-item>定时发送</el-dropdown-item>
            <el-dropdown-item>请求已读回执</el-dropdown-item>
            <el-dropdown-item>设置优先级</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="toolbar-right">
      <span v-if="lastSaveTime" class="time">已于{{ lastSaveTime }}保存至草稿</span>
      <div class="tool-btn" @click="handleSaveDraft">
        <span>保存草稿</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Position, Setting, ArrowDown } from '@element-plus/icons-vue'

interface Props {
  sending: boolean
  lastSaveTime?: string
}

interface Emits {
  (e: 'send'): void
  (e: 'save-draft'): void
}

withDefaults(defineProps<Props>(), {
  lastSaveTime: ''
})
const emit = defineEmits<Emits>()

const handleSend = () => {
  emit('send')
}

const handleSaveDraft = () => {
  emit('save-draft')
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
</style>

