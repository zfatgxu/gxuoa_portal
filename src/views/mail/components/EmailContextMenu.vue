<template>
  <BaseContextMenu :visible="visible" :x="x" :y="y">
    <!-- 根据邮件状态显示不同的菜单选项 -->
    <div 
      v-if="email && folderName !== '草稿箱' && !email.isRead && !(folderName === '星标邮件' && email.isDraft)" 
      class="menu-item" 
      @click="handleMarkAsRead"
    >
      标记为已读
    </div>
    <div 
      v-if="email && folderName !== '草稿箱' && email.isRead && !(folderName === '星标邮件' && email.isDraft)" 
      class="menu-item" 
      @click="handleMarkAsUnread"
    >
      标记为未读
    </div>
    <div 
      v-if="email && !email.deletedAt && !isTrashFolder" 
      class="menu-item" 
      @click="handleDelete"
    >
      删除
    </div>
    <div 
      v-if="email && (email.deletedAt || isTrashFolder)" 
      class="menu-item" 
      @click="handlePermanentDelete"
    >
      彻底删除
    </div>
    <div 
      v-if="email && isDeletedFolder" 
      class="menu-item" 
      @click="handleRestore"
    >
      恢复
    </div>
    <!-- 垃圾邮件相关选项 -->
    <div 
      v-if="email && folderName === '收件箱'" 
      class="menu-item" 
      @click="handleMarkAsSpam"
    >
      这是垃圾邮件
    </div>
    <div 
      v-if="email && isTrashFolder" 
      class="menu-item" 
      @click="handleMarkAsSpam"
    >
      这不是垃圾邮件
    </div>
    <div 
      v-if="email && !isDeletedFolder && isCustomFolder && currentCustomFolderId"
      class="menu-item"
      @click="handleRemoveFromCurrentFolder"
    >
      从当前文件夹移除
    </div>
    <!-- 移动到... 悬浮子菜单 -->
    <div 
      v-if="!isDeletedFolder && !isTrashFolder && !isDraftFolder && !(email && folderName === '星标邮件' && email.isDraft)"
      class="menu-item"
      style="position: relative;"
      @mouseenter="showMoveSubmenu = true"
      @mouseleave="showMoveSubmenu = false"
    >
      移动到...
      <div
        v-if="showMoveSubmenu"
        class="context-menu context-submenu"
        :style="{ left: '100%', top: '0px', position: 'absolute', zIndex: 2000 }"
        @mouseenter.stop="showMoveSubmenu = true"
        @mouseleave="showMoveSubmenu = false"
        @click.stop
      >
        <div
          v-for="item in moveTargetFolders"
          :key="item.id"
          class="menu-item"
          :style="{ paddingLeft: (8 + item.level * 12) + 'px' }"
          @click="handleMoveToFolder(item.id)"
        >
          {{ item.folderName }}
        </div>
      </div>
    </div>
  </BaseContextMenu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseContextMenu from './BaseContextMenu.vue'
import type { Email } from '../types/mail'

interface Props {
  visible: boolean
  x: number
  y: number
  email: Email | null
  folderName: string
  isDeletedFolder: boolean
  isTrashFolder?: boolean
  isDraftFolder?: boolean
  isCustomFolder?: boolean
  currentCustomFolderId?: number
  customFolders: Array<{
    id: number
    folderName: string
    parentId: number
    mailCount: number
    children?: any[]
  }>
}

interface Emits {
  (e: 'mark-as-read'): void
  (e: 'mark-as-unread'): void
  (e: 'delete'): void
  (e: 'permanent-delete'): void
  (e: 'restore'): void
  (e: 'mark-as-spam'): void
  (e: 'remove-from-folder'): void
  (e: 'move-to-folder', folderId: number): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showMoveSubmenu = ref(false)

// 计算移动目标文件夹列表
const moveTargetFolders = computed(() => {
  const build = (folders: any[], level = 0, acc: any[] = []) => {
    folders.forEach((f) => {
      acc.push({ ...f, level })
      if (f.children && f.children.length) {
        build(f.children, level + 1, acc)
      }
    })
    return acc
  }
  const roots = (props.customFolders || []).filter((f: any) => f.parentId === 0)
  return build(roots)
})

const handleMarkAsRead = () => {
  emit('mark-as-read')
  emit('close')
}

const handleMarkAsUnread = () => {
  emit('mark-as-unread')
  emit('close')
}

const handleDelete = () => {
  emit('delete')
  emit('close')
}

const handlePermanentDelete = () => {
  emit('permanent-delete')
  emit('close')
}

const handleRestore = () => {
  emit('restore')
  emit('close')
}

const handleMarkAsSpam = () => {
  emit('mark-as-spam')
  emit('close')
}

const handleRemoveFromCurrentFolder = () => {
  emit('remove-from-folder')
  emit('close')
}

const handleMoveToFolder = (folderId: number) => {
  emit('move-to-folder', folderId)
  emit('close')
}
</script>

<style scoped>
.context-submenu {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 140px;
  padding: 4px 0;
  font-size: 14px;
  overflow: hidden;
}

.context-submenu .menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  color: #333;
  transition: background-color 0.2s;
  font-size: 14px;
}

.context-submenu .menu-item:hover {
  background-color: #f5f7fa;
}
</style>

