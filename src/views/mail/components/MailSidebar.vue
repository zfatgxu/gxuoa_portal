<template>
  <div class="sidebar">
    <!-- 顶部按钮区域 -->
    <div class="sidebar-top">
      <button class="compose-btn" @click="handleCompose">
        <span class="icon icon--compose">
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 14l8.5-8.5c.6-.6 1.6-.6 2.2 0l1.8 1.8c.6.6.6 1.6 0 2.2L7 18H3v-4z" fill="#f5a623"/>
            <path d="M12.3 3.7l4 4" stroke="#f5a623" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="btn-text">写信</span>
      </button>
      <div class="sidebar-divider"></div>
    </div>

    <!-- 文件夹列表 -->
    <div class="folder-list">
      <div class="folder-item" :class="{active: selectedFolder==='inbox'}" @click="handleSelectFolder('inbox')">
        <span class="folder-icon">
          <!-- 信箱SVG -->
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="12" rx="3" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M2 6l8 6 8-6" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
        </span>
        <span class="folder-name">收件箱</span><span class="folder-badge">{{ mailStats.inboxCount || 0 }}</span>
      </div>
      <div class="folder-item" :class="{active: selectedFolder==='starred'}" @click="handleSelectFolder('starred')">
        <span class="folder-icon">
          <!-- 星标SVG -->
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="10,2 12,7.5 18,7.5 13,11.5 15,17 10,13.5 5,17 7,11.5 2,7.5 8,7.5" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
        </span>
        <span class="folder-name">星标邮件</span><span class="folder-badge">{{ mailStats.starredCount || 0 }}</span>
      </div>
      <div class="folder-item" :class="{active: selectedFolder==='sent'}" @click="handleSelectFolder('sent')">
        <span class="folder-icon">
          <!-- 纸飞机SVG -->
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="2,18 18,10 2,2 5,10 2,18" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
        </span>
        <span class="folder-name">已发送</span><span class="folder-badge">{{ mailStats.sentCount || 0 }}</span>
      </div>
      <div class="folder-item" :class="{active: selectedFolder==='drafts'}" @click="handleSelectFolder('drafts')">
        <span class="folder-icon">
          <!-- 文件夹SVG -->
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="10" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M2 6l6-4 4 4h6" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
        </span>
        <span class="folder-name">草稿箱</span><span class="folder-badge">{{ mailStats.draftsCount || 0 }}</span>
      </div>
      <div class="folder-item" :class="{active: selectedFolder==='deleted'}" @click="handleSelectFolder('deleted')">
        <span class="folder-icon">
          <!-- 垃圾桶SVG -->
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="7" width="10" height="9" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M3 7h14" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M8 10v3" stroke="#ff9800" stroke-width="1.2"/><path d="M12 10v3" stroke="#ff9800" stroke-width="1.2"/></svg>
        </span>
        <span class="folder-name">已删除</span><span class="folder-badge">{{ mailStats.deletedCount || 0 }}</span>
      </div>
      <!-- 垃圾箱 -->
      <div class="folder-item" :class="{active: selectedFolder==='trash'}" @click="handleSelectFolder('trash')">
        <span class="folder-icon">
          <!-- 垃圾箱SVG -->
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="12" rx="3" stroke="#ff9800" stroke-width="1.5" fill="none"/><rect x="8" y="10" width="4" height="4" rx="1" stroke="#ff9800" stroke-width="1.2" fill="none"/></svg>
        </span>
        <span class="folder-name">垃圾箱</span><span class="folder-badge">{{ mailStats.trashCount || 0 }}</span>
      </div>
      <!-- 我的文件夹标题 -->
      <div class="folder-item folder-title" @click="toggleMyFolders" @contextmenu.prevent="handleFolderContextMenu">
        <span class="expand-icon" :class="{ expanded: isMyFoldersExpanded }" style="margin-right: 8px;">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" :style="{ transform: isMyFoldersExpanded ? 'rotate(180deg)' : 'rotate(270deg)', transition: 'transform 0.15s ease' }">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="folder-icon">
          <!-- 文件夹SVG -->
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="10" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M2 6l6-4 4 4h6" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
        </span>
        <span class="folder-name">我的文件夹</span>
        <span style="flex: 1 1 auto;"></span>
        <button class="add-folder-btn" @click.stop="handleCreateFolder" title="新建文件夹" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;background:transparent;cursor:pointer;padding:0;">
          <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1v12M1 7h12" stroke="#666" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <!-- 自定义文件夹列表 -->
      <transition name="folder-expand" appear>
        <div v-if="isMyFoldersExpanded" class="folder-list-container">
          <div v-for="rootFolder in rootFolders" :key="rootFolder.id">
            <FolderTreeItem 
              :folder="rootFolder" 
              :selected-folder-id="selectedFolderId"
              :level="0"
              @select-folder="handleSelectFolder"
              @context-menu="handleItemContextMenu"
            />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FolderTreeItem from './FolderTreeItem.vue'
import type { FolderRespVO } from '@/api/mail/folder'
import type { MailStatsVO } from '@/api/mail/letter'

interface Props {
  selectedFolder: string
  selectedFolderId: number | null
  customFolders: FolderRespVO[]
  mailStats: MailStatsVO
}

interface Emits {
  (e: 'select-folder', folder: string | number): void
  (e: 'create-folder'): void
  (e: 'folder-context-menu', event: MouseEvent): void
  (e: 'item-context-menu', payload: { x: number, y: number, folderId: number }): void
  (e: 'compose'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 我的文件夹展开状态
const isMyFoldersExpanded = ref(false)

// 计算根文件夹
const rootFolders = computed(() => {
  return props.customFolders.filter(folder => folder.parentId === 0)
})

// 切换我的文件夹展开/收起状态
const toggleMyFolders = () => {
  isMyFoldersExpanded.value = !isMyFoldersExpanded.value
}

// 选择文件夹
const handleSelectFolder = (folder: string | number) => {
  emit('select-folder', folder)
}

// 创建文件夹
const handleCreateFolder = () => {
  emit('create-folder')
}

// 文件夹右键菜单
const handleFolderContextMenu = (event: MouseEvent) => {
  emit('folder-context-menu', event)
}

// 项右键菜单
const handleItemContextMenu = (payload: { x: number, y: number, folderId: number }) => {
  emit('item-context-menu', payload)
}

// 写信
const handleCompose = () => {
  emit('compose')
}
</script>

