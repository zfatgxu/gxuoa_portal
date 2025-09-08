<template>
  <div>
    <div 
      class="folder-item" 
      :class="{active: selectedFolderId === folder.id}"
      :style="{ paddingLeft: (level * 20 + 16) + 'px' }"
      @click="handleSelectFolder"
    >
      <span class="folder-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="6" width="16" height="10" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/>
          <path d="M2 6l6-4 4 4h6" stroke="#ff9800" stroke-width="1.5" fill="none"/>
        </svg>
      </span>
      <span class="folder-name">{{ folder.folderName }}</span>
      <span class="folder-badge">{{ folder.mailCount }}</span>
    </div>
    
    <!-- 递归渲染子文件夹 -->
    <FolderTreeItem 
      v-for="child in folder.children" 
      :key="child.id" 
      :folder="child" 
      :selected-folder-id="selectedFolderId"
      :level="level + 1"
      @select-folder="$emit('select-folder', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { FolderRespVO } from '@/api/system/mail/folder/index'

// 定义props
interface Props {
  folder: FolderRespVO
  selectedFolderId?: number
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedFolderId: undefined,
  level: 0
})

// 定义emits
const emit = defineEmits<{
  'select-folder': [folderId: number]
}>()

// 处理文件夹选择
const handleSelectFolder = () => {
  emit('select-folder', props.folder.id)
}
</script>

<style scoped>
.folder-item {
  display: flex;
  align-items: center;
  padding: 8px 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  border-radius: 12px;
  margin-bottom: 3px;
}

.folder-item:hover {
  background-color: #f0f0f0;
}

.folder-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.folder-icon {
  margin-right: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.folder-name {
  flex: 1;
  font-size: 13px;
}

.folder-badge {
  background-color: #e0e0e0;
  color: #666;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 11px;
  margin-left: 4px;
}

.folder-item.active .folder-name {
  color: #1976d2;
  font-weight: 500;
}
</style>
