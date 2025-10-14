<template>
  <div class="contact-list">
    <div class="contact-header">
      <span>联系人</span>
    </div>
    
    <div class="contact-search">
      <div class="header-search">
        <span class="search-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#bdbdbd" stroke-width="1.5" fill="none"/>
            <path d="M12 12l-2.5-2.5" stroke="#bdbdbd" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <input 
          v-model="searchText" 
          class="search-input" 
          type="text" 
          placeholder="搜索联系人" 
        />
      </div>
    </div>
    
    <div class="contact-groups">
      <!-- 最近联系人分组 -->
      <div class="contact-group">
        <div 
          class="folder-item" 
          @click="toggleRecentExpanded"
        >
          <span class="folder-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M4 6l4 4 4-4" 
                stroke="#ff9800" 
                stroke-width="1.5" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                :transform="!recentExpanded ? 'rotate(-90 8 8)' : ''"
              />
            </svg>
          </span>
          <span class="folder-name">最近联系人</span>
          <span class="folder-badge">{{ filteredRecentContacts.length || 0 }}</span>
        </div>
        
        <div v-if="recentExpanded" class="group-contacts">
          <div 
            v-for="contact in filteredRecentContacts" 
            :key="contact.name"
            class="contact-item"
            @click="handleSelectContact(contact)"
            @contextmenu.prevent="handleContextMenu($event, contact, 'recent')"
          >
            <el-avatar 
              v-if="recentContactAvatars.get(contact.name)"
              :size="24" 
              :src="recentContactAvatars.get(contact.name)"
            />
            <el-avatar 
              v-else
              :size="24"
            >
              {{ contact.name?.substring(0, 1) || '?' }}
            </el-avatar>
            <div class="contact-info">
              <div class="contact-name">{{ contact.name }}</div>
              <div class="contact-time">
                {{ recentContactDepartments.get(contact.name) || '未知部门' }}
              </div>
            </div>
          </div>
          <div v-if="filteredRecentContacts.length === 0 && !searchText.trim()" class="empty-state">
            暂无最近联系人
          </div>
        </div>
      </div>
      
      <!-- 星标联系人分组 -->
      <div class="contact-group">
        <div 
          class="folder-item" 
          @click="toggleStarredExpanded"
        >
          <span class="folder-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M4 6l4 4 4-4" 
                stroke="#ff9800" 
                stroke-width="1.5" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                :transform="!starredExpanded ? 'rotate(-90 8 8)' : ''"
              />
            </svg>
          </span>
          <span class="folder-name">星标联系人</span>
          <span class="folder-badge">{{ filteredStarredContacts.length || 0 }}</span>
        </div>
        
        <div v-if="starredExpanded" class="group-contacts">
          <div 
            v-for="contact in filteredStarredContacts" 
            :key="contact.id"
            class="contact-item"
            @click="handleSelectStarredContact(contact)"
            @contextmenu.prevent="handleContextMenu($event, contact, 'starred')"
          >
            <el-avatar 
              v-if="starredContactAvatars.get(contact.id)"
              :size="24" 
              :src="starredContactAvatars.get(contact.id)"
            />
            <el-avatar 
              v-else
              :size="24"
            >
              {{ (starredContactDisplayNames.get(contact.id) || '?').substring(0, 1) }}
            </el-avatar>
            <div class="contact-info">
              <div class="contact-name">
                {{ starredContactDisplayNames.get(contact.id) || '加载中...' }}
              </div>
              <div class="contact-time">
                {{ starredContactDepartments.get(contact.id) || '未知部门' }}
              </div>
            </div>
          </div>
          <div v-if="filteredStarredContacts.length === 0 && !searchText.trim()" class="empty-state">
            暂无星标联系人
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LetterContactStarRespVO } from '@/api/mail/letter'
import type { RecentContact } from '../types/mail'
import { formatLastSendTime } from '../utils/mailHelpers'

interface Props {
  filteredRecentContacts: RecentContact[]
  recentContactDepartments: Map<string, string>
  recentContactAvatars: Map<string, string>
  filteredStarredContacts: LetterContactStarRespVO[]
  starredContactDisplayNames: Map<number, string>
  starredContactDepartments: Map<number, string>
  starredContactAvatars: Map<number, string>
  contactSearch: string
}

interface Emits {
  (e: 'select-contact', contact: any): void
  (e: 'context-menu', event: MouseEvent, contact: any, type: 'recent' | 'starred'): void
  (e: 'update:contactSearch', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const recentExpanded = ref(true)
const starredExpanded = ref(true)

const searchText = ref(props.contactSearch)

// 监听搜索文本变化
const updateSearch = (value: string) => {
  emit('update:contactSearch', value)
}

// 由于Vue 3的响应式系统，我们需要使用watch来同步更新
import { watch } from 'vue'
watch(searchText, (newVal) => {
  emit('update:contactSearch', newVal)
})

watch(() => props.contactSearch, (newVal) => {
  searchText.value = newVal
})

const toggleRecentExpanded = () => {
  recentExpanded.value = !recentExpanded.value
}

const toggleStarredExpanded = () => {
  starredExpanded.value = !starredExpanded.value
}

const handleSelectContact = (contact: RecentContact) => {
  emit('select-contact', { name: contact.name, type: 'recent' })
}

const handleSelectStarredContact = (contact: LetterContactStarRespVO) => {
  const displayName = props.starredContactDisplayNames.get(contact.id)
  if (displayName) {
    emit('select-contact', { name: displayName, type: 'starred', contact })
  }
}

const handleContextMenu = (event: MouseEvent, contact: any, type: 'recent' | 'starred') => {
  emit('context-menu', event, contact, type)
}

const formatTime = (timeStr: string) => {
  return formatLastSendTime(timeStr)
}
</script>

<style scoped>
.contact-list {
  width: 220px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-left: 8px;
  overflow: hidden;
}

.contact-header {
  padding: 12px 15px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4e73df;
  background-color: #f5faff;
}

.contact-search {
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.header-search {
  width: 100%;
  height: 32px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 8px;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 100%;
  padding-left: 32px;
  padding-right: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #4e73df;
}

.contact-groups {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.contact-group {
  margin-bottom: 10px;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 6px 4px;
  cursor: pointer;
  font-size: 12px;
  color: #333;
  border-radius: 2px;
  margin-bottom: 2px;
  transition: background-color 0.2s;
}

.folder-item:hover {
  background-color: #f5f5f5;
}

.folder-icon {
  margin-right: 6px;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
}

.folder-name {
  flex: 1;
  font-weight: 500;
}

.folder-badge {
  margin-left: auto;
  background-color: #909399;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.group-contacts {
  padding: 2px 0;
}

.contact-item {
  padding: 6px 12px 6px 25px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin: 2px 4px;
}

.contact-item:hover {
  background-color: #f5f7fa;
}

.contact-item .el-avatar {
  margin-right: 8px;
  background-color: #4e73df;
}

.contact-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.contact-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: #303133;
}

.contact-time {
  font-size: 11px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  padding: 20px 25px;
  text-align: center;
  color: #909399;
  font-size: 12px;
}
</style>

