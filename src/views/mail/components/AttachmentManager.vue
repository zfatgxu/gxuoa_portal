<template>
  <div>
    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInputRef"
      type="file" 
      multiple 
      style="display: none" 
      accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.mp4,.avi,.mov,.mp3,.wav"
      @change="handleFileInputChange"
    />
    
    <!-- 拖拽上传区域 -->
    <div 
      v-if="!attachmentList.length && !localFiles.length"
      class="drag-upload-area"
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileUpload"
    >
      <div class="drag-upload-content">
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div class="upload-text">
          <div class="upload-main-text">点击或拖拽文件到此处上传</div>
          <div class="upload-tip-text">支持 doc、docx、pdf、xls、xlsx、ppt、pptx、jpg、jpeg、png、txt、zip、rar 等格式</div>
          <div class="upload-limit-text">单个文件不超过50MB，总大小不超过100MB</div>
        </div>
      </div>
    </div>

    <!-- 附件列表 -->
    <div 
      v-if="attachmentList.length > 0 || localFiles.length > 0" 
      class="attachments-section"
    >
      <div class="attachments-header">
        <div class="attachments-title">
          <el-icon><Files /></el-icon>
          附件 ({{ attachmentList.length + localFiles.length }})
        </div>
        <div class="attachments-actions">
          <el-button 
            size="small" 
            type="primary" 
            plain
            @click="triggerFileUpload"
          >
            <el-icon><Plus /></el-icon>
            添加附件
          </el-button>
          <el-button 
            v-if="attachmentList.length > 0" 
            size="small" 
            type="danger" 
            plain
            @click="handleBatchRemove"
          >
            清空所有
          </el-button>
        </div>
      </div>
      
      <!-- 已上传的附件 -->
      <div v-if="attachmentList.length > 0" class="uploaded-attachments">
        <div 
          v-for="(attachment, index) in attachmentList" 
          :key="attachment.id"
          class="attachment-item uploaded"
        >
          <div class="attachment-info">
            <div class="attachment-name">{{ attachment.fileName }}</div>
            <div class="attachment-actions">
              <el-button 
                size="small" 
                type="danger" 
                plain
                @click="handleRemoveUploaded(attachment.id, index)"
                title="删除"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="attachment-details">
            <span class="file-size">{{ formatFileSize(attachment.fileSize) }}</span>
            <span v-if="getExtension(attachment.fileName)" class="file-type">
              {{ getExtension(attachment.fileName).toUpperCase() }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 本地文件（未上传） -->
      <div v-if="localFiles.length > 0" class="local-attachments">
        <div 
          v-for="(file, index) in localFiles" 
          :key="index"
          class="attachment-item local"
        >
          <div class="attachment-info">
            <div class="attachment-name">{{ file.name }}</div>
            <div class="attachment-actions">
              <el-button 
                size="small" 
                type="danger" 
                plain
                @click="handleRemoveLocal(index)"
                title="删除"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="attachment-details">
            <span class="file-size">{{ formatSize(file.size) }}</span>
            <span v-if="getExtension(file.name)" class="file-type">
              {{ getExtension(file.name).toUpperCase() }}
            </span>
            <span class="pending-badge">待上传</span>
          </div>
        </div>
      </div>
      
      <!-- 上传进度 -->
      <div v-if="uploading" class="upload-progress">
        <el-progress 
          :percentage="uploadProgress" 
          :show-text="true"
          :stroke-width="6"
          status="success"
        />
        <div class="progress-text">正在上传附件...</div>
      </div>
      
      <!-- 附件统计信息 -->
      <div 
        v-if="(attachmentList.length + localFiles.length) > 0" 
        class="attachment-stats"
        :style="getStatsStyle()"
      >
        <el-icon><InfoFilled /></el-icon>
        <div class="stats-content">
          <div class="stats-main">
            当前邮件 {{ attachmentList.length + localFiles.length }} 个附件，大小 {{ formattedTotalSize }}
          </div>
          <div class="stats-limit">
            限制：单个文件 ≤ 50MB，总大小 ≤ 100MB
          </div>
          <div v-if="isWarning" class="stats-warning">
            ⚠️ 附件总大小接近限制，建议减少附件数量
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled, Files, Plus, Delete, InfoFilled } from '@element-plus/icons-vue'
import { formatFileSizeFromString, formatFileSize as formatSizeUtil, getFileExtension } from '@/api/mail/attachment'
import type { LetterAttachmentRespVO } from '@/api/mail/attachment'

interface Props {
  attachmentList: LetterAttachmentRespVO[]
  localFiles: File[]
  uploading: boolean
  uploadProgress: number
  isDragOver: boolean
  formattedTotalSize: string
  isWarning: boolean
  isOverLimit: boolean
}

interface Emits {
  (e: 'upload', files: FileList): void
  (e: 'remove-uploaded', id: number, index: number): void
  (e: 'remove-local', index: number): void
  (e: 'batch-remove', ids: number[]): void
  (e: 'drag-over', event: DragEvent): void
  (e: 'drag-leave', event: DragEvent): void
  (e: 'drop', event: DragEvent): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const handleFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('upload', target.files)
    // 清空输入框，允许重复选择相同文件
    target.value = ''
  }
}

const handleRemoveUploaded = (id: number, index: number) => {
  emit('remove-uploaded', id, index)
}

const handleRemoveLocal = (index: number) => {
  emit('remove-local', index)
}

const handleBatchRemove = () => {
  const ids = props.attachmentList.map(a => a.id)
  emit('batch-remove', ids)
}

const handleDragOver = (e: DragEvent) => {
  emit('drag-over', e)
}

const handleDragLeave = (e: DragEvent) => {
  emit('drag-leave', e)
}

const handleDrop = (e: DragEvent) => {
  emit('drop', e)
}

const formatFileSize = (size: string) => {
  return formatFileSizeFromString(size)
}

const formatSize = (size: number) => {
  return formatSizeUtil(size)
}

const getExtension = (fileName: string) => {
  return getFileExtension(fileName)
}

const getStatsStyle = () => {
  if (props.isOverLimit) {
    return {
      marginTop: '10px',
      padding: '8px 12px',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#dc2626'
    }
  } else if (props.isWarning) {
    return {
      marginTop: '10px',
      padding: '8px 12px',
      background: '#fffbeb',
      border: '1px solid #fed7aa',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#d97706'
    }
  } else {
    return {
      marginTop: '10px',
      padding: '8px 12px',
      background: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#0369a1'
    }
  }
}
</script>

<style scoped>
.drag-upload-area {
  margin: 20px;
  padding: 40px 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-upload-area:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.drag-upload-area.drag-over {
  border-color: #409eff;
  background-color: #e6f7ff;
  transform: scale(1.02);
}

.drag-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  transition: color 0.3s ease;
}

.drag-upload-area:hover .upload-icon {
  color: #409eff;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-main-text {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.upload-tip-text {
  font-size: 14px;
  color: #909399;
}

.upload-limit-text {
  font-size: 12px;
  color: #c0c4cc;
}

.attachments-section {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  background-color: #fafafa;
  max-height: 300px;
  overflow-y: auto;
}

.attachments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.attachments-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 5px;
}

.attachments-title .el-icon {
  color: #409eff;
}

.attachments-actions {
  display: flex;
  gap: 8px;
}

.uploaded-attachments,
.local-attachments {
  display: grid;
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 10px;
}

.attachment-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
  min-height: 60px;
}

.attachment-item.uploaded {
  background: #ffffff;
}

.attachment-item.local {
  background: #fff7e6;
  border-color: #ffd591;
}

.attachment-info {
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.attachment-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  flex: 1;
  min-width: 0;
  word-break: break-word;
  line-height: 1.4;
}

.attachment-actions {
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  gap: 5px;
}

.attachment-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
  width: 100%;
  margin-top: 4px;
}

.file-size {
  color: #606266;
}

.pending-badge {
  color: #fa8c16;
  background: #fff3cd;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 11px;
}

.upload-progress {
  margin-top: 10px;
}

.progress-text {
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.attachment-stats {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.stats-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stats-main {
  font-weight: 500;
  line-height: 1.4;
}

.stats-limit {
  font-size: 11px;
  opacity: 0.8;
  line-height: 1.3;
}

.stats-warning {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
  margin-top: 2px;
}

@media (max-width: 768px) {
  .uploaded-attachments,
  .local-attachments {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 480px) {
  .uploaded-attachments,
  .local-attachments {
    grid-template-columns: 1fr;
  }
}
</style>

