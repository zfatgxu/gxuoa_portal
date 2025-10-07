<template>
  <el-dialog
    v-model="dialogVisible"
    width="1200px"
    top="5vh"
    :style="{ height: '85vh' }"
    destroy-on-close
    @update:model-value="handleVisibleChange"
  >
    <template #header>
      <div class="detail-dialog-header">
        <span class="detail-dialog-title">邮件详情</span>
        <!-- 多封邮件时显示切换按钮 -->
        <div v-if="showNavigation" class="mail-navigation">
          <el-button 
            :icon="ArrowLeft" 
            size="small" 
            @click="$emit('prev')"
            title="上一封"
          >
            上一封
          </el-button>
          <span class="mail-counter">
            {{ currentIndex + 1 }} / {{ totalCount }}
          </span>
          <el-button 
            :icon="ArrowRight" 
            size="small" 
            @click="$emit('next')"
            title="下一封"
          >
            下一封
          </el-button>
        </div>
      </div>
    </template>
    
    <div v-if="loading" class="loading-state">
      <span class="loading-spinner"></span>
      正在加载邮件详情...
    </div>
    
    <div v-else-if="detail" class="original-detail-content">
      <!-- 顶部：主题与发件人信息 -->
      <div class="detail-header">
        <!-- 发件人信息靠左显示 -->
        <div class="detail-sender-info">
          <div class="sender-avatar">
            <img v-if="senderAvatar" :src="senderAvatar" :alt="detail.sender || '发件人'" />
            <span v-else>{{ getAvatarText(detail.sender) }}</span>
          </div>
          <div class="sender-details">
            <div class="sender-meta-item">
              <span class="meta-label">主题：</span>
              <span class="meta-value meta-subject">{{ detail.subject || '无主题' }}</span>
            </div>
            <div class="sender-meta-item">
              <span class="meta-label">发件人：</span>
              <span class="meta-value">{{ detail.sender || '未知' }}</span>
            </div>
            <div v-if="detail.toRecipients" class="sender-meta-item">
              <span class="meta-label">收件人：</span>
              <span class="meta-value">{{ detail.toRecipients }}</span>
            </div>
            <div v-if="detail.ccRecipients" class="sender-meta-item">
              <span class="meta-label">抄送人：</span>
              <span class="meta-value">{{ detail.ccRecipients }}</span>
            </div>
            <div v-if="detail.bccRecipients" class="sender-meta-item">
              <span class="meta-label">密送人：</span>
              <span class="meta-value">{{ detail.bccRecipients }}</span>
            </div>
            <div class="sender-meta-item">
              <span class="meta-label">时间：</span>
              <span class="meta-value">{{ detail.originalSendTime || '未知' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部：可滚动正文区域 -->
      <div class="detail-body">
        <!-- 附件列表 -->
        <div v-if="detail.attachments && detail.attachments.length > 0" class="detail-attachments">
          <div class="attachments-list">
            <div 
              v-for="att in detail.attachments" 
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
                    @click.prevent="$emit('download-attachment', att)"
                  >下载</el-link>
                </div>
              </div>
              <div class="attachment-details">
                <span class="file-size">{{ formatFileSizeFromString(att.fileSize) }}</span>
                <span v-if="getFileExtension(att.fileName)" class="file-type">
                  {{ getFileExtension(att.fileName).toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 正文内容 -->
        <div class="detail-content">
          <div v-if="!detail.content" class="loading-state">
            <span class="loading-spinner"></span>
            正在加载邮件内容...
          </div>
          <div v-else class="content-body" v-html="detail.content"></div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { formatFileSizeFromString, getFileExtension } from '@/api/mail/attachment'
import { getAvatarText } from '../utils/mailHelpers'
import type { LetterAttachmentRespVO } from '@/api/mail/attachment'

interface Props {
  modelValue: boolean
  loading?: boolean
  detail?: any
  senderAvatar?: string
  currentIndex?: number
  totalCount?: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'download-attachment', att: LetterAttachmentRespVO): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  detail: null,
  senderAvatar: '',
  currentIndex: 0,
  totalCount: 1
})

const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const showNavigation = computed(() => props.totalCount > 1)

const handleVisibleChange = (value: boolean) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.detail-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 40px;
}

.detail-dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.mail-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mail-counter {
  font-size: 14px;
  color: #606266;
  min-width: 60px;
  text-align: center;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  padding: 20px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e5e5;
  border-top-color: #409eff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.original-detail-content {
  display: flex;
  flex-direction: column;
  height: calc(85vh - 40px);
}

.detail-header {
  flex-shrink: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #dcdfe6;
}

.detail-sender-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.sender-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f2f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #606266;
  font-weight: 600;
  flex-shrink: 0;
}

.sender-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sender-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sender-meta-item {
  display: flex;
  align-items: baseline;
  font-size: 13px;
  line-height: 1.6;
}

.meta-label {
  color: #909399;
  min-width: 60px;
  flex-shrink: 0;
}

.meta-value {
  color: #606266;
  word-break: break-all;
}

.meta-subject {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.detail-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
  padding-top: 16px;
}

.detail-attachments {
  padding: 0;
  margin-bottom: 12px;
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

.detail-content {
  background: #fff;
  border: none;
  border-radius: 6px;
  padding: 12px;
}

.content-body {
  font-size: 14px;
  color: #303133;
  line-height: 1.8;
}
</style>

