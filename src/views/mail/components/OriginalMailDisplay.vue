<template>
  <div>
    <!-- 多封转发时：显示邮件列表 -->
    <div 
      v-if="originalList.length > 0" 
      class="forward-orig-mails"
    >
      <div class="orig-mail-title">
        <span class="orig-mail-text">原始邮件</span>
        <span class="orig-mail-divider"></span>
      </div>
      <div class="forward-card-grid">
        <div 
          v-for="item in originalList" 
          :key="item.id" 
          class="forward-card"
          @click="handleOpenDetail(item.id)"
        >
          <button 
            class="remove-badge"
            title="取消选择"
            @click.stop="handleRemoveOriginal(item.id)"
          >
            ×
          </button>
          <div class="subject">
            {{ item.subject || '无主题' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 单封回复/转发：显示详细信息 -->
    <div v-else-if="originalMail" class="single-original">
      <div class="orig-mail-title">
        <span class="orig-mail-text">原始邮件</span>
        <span class="orig-mail-divider"></span>
      </div>
      <div class="original-info-box">
        <div class="original-info-grid">
          <div class="info-label">发件人：</div>
          <div class="info-value">{{ originalMail.fromUserName || '' }}</div>
          <div class="info-label">收件人：</div>
          <div class="info-value">{{ originalMail.toUserNames || '' }}</div>
          <div class="info-label">发件时间：</div>
          <div class="info-value">{{ originalMail.sendTime || '' }}</div>
          <div class="info-label">主题：</div>
          <div class="info-value">{{ originalMail.subject || '' }}</div>
        </div>
      </div>
      
      <!-- 原始邮件附件 -->
      <div v-if="originalMail.attachments && originalMail.attachments.length > 0" class="detail-attachments">
        <div class="attachments-list">
          <div 
            v-for="att in originalMail.attachments" 
            :key="att.id" 
            class="attachment-item"
          >
            <div class="attachment-info">
              <div class="attachment-name">{{ att.fileName }}</div>
              <div class="attachment-actions">
                <el-link 
                  type="primary"
                  :underline="false"
                  :title="`下载 ${att.fileName}`"
                  @click.prevent="handleDownload(att)"
                >
                  下载
                </el-link>
              </div>
            </div>
            <div class="attachment-details">
              <span class="file-size">{{ formatFileSize(att.fileSize) }}</span>
              <span v-if="getExtension(att.fileName)" class="file-type">
                {{ getExtension(att.fileName).toUpperCase() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 原始邮件正文 -->
      <div v-if="originalHtml" class="original-content">
        <div v-html="originalHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OriginalMailInfo } from '../types/mail'
import { formatFileSizeFromString, getFileExtension } from '@/api/mail/attachment'

interface Props {
  originalMail: OriginalMailInfo | null
  originalList: OriginalMailInfo[]
  originalHtml: string
}

interface Emits {
  (e: 'open-detail', id: number): void
  (e: 'remove-original', id: number): void
  (e: 'download-attachment', attachment: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleOpenDetail = (id: number) => {
  emit('open-detail', id)
}

const handleRemoveOriginal = (id: number) => {
  emit('remove-original', id)
}

const handleDownload = (attachment: any) => {
  emit('download-attachment', attachment)
}

const formatFileSize = (size: string) => {
  return formatFileSizeFromString(size)
}

const getExtension = (fileName: string) => {
  return getFileExtension(fileName)
}
</script>

<style scoped>
.forward-orig-mails,
.single-original {
  padding: 12px 20px 0 20px;
  background-color: #ffffff;
}

.orig-mail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
}

.orig-mail-text {
  font-size: 12px;
  color: #909399;
  line-height: 1;
}

.orig-mail-divider {
  flex: 1;
  height: 1px;
  background: #e5e5e5;
}

.forward-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 12px;
}

.forward-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  min-height: 60px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.forward-card:hover {
  background: #f5faff;
  border-color: #bae6fd;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.forward-card:active {
  transform: translateY(0);
}

.remove-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: #f5f5f5;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-size: 18px;
  line-height: 1;
  padding: 0;
}

.remove-badge:hover {
  background: #fee;
  color: #f56c6c;
}

.subject {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-flex;
  align-items: center;
  text-align: left;
  width: 100%;
}

.original-info-box {
  background: #f5f7fa;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  padding: 10px 12px;
  margin: 0 0 8px 0;
}

.original-info-grid {
  font-size: 13px;
  color: #606266;
  display: grid;
  grid-template-columns: 72px 1fr;
  row-gap: 6px;
  column-gap: 8px;
  align-items: start;
}

.info-label {
  color: #909399;
}

.info-value {
  color: #606266;
}

.detail-attachments {
  padding: 0;
  margin-bottom: 8px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
}

.attachment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.attachment-name {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.attachment-details {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #909399;
}

.original-content {
  background: #fff;
  border: none;
  border-radius: 6px;
  padding: 12px;
}

.original-content > div {
  font-size: 14px;
  color: #303133;
  line-height: 1.8;
}
</style>

