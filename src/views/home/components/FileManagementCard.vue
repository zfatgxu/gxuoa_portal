<template>
  <div class="card">
    <div class="card-header">
      <div class="title"><i class="bi bi-folder me-2"></i>文件管理
        <div class="toggle-icon" style="margin-left: auto;" @click="toggleExpand">
        <i class="bi bi-chevron-down" v-if="isExpanded">收起</i>
        <i class="bi bi-chevron-up" v-else>展开</i>
      </div>
      
      </div>
      
      <div class="more" @click="goToFileManagement">更多 <i class="bi bi-chevron-right"></i></div>
    </div>
    <div class="card-body" v-show="isExpanded">
      <div class="file-list" v-if="fileList && fileList.length > 0">
        <div class="file-item" v-for="(item, index) in fileList.slice(0, props.filelength)" :key="index">
          <div class="file-icon">
            <i class="bi" :class="getFileIcon(item.fileType)"></i>
          </div>
          <div class="file-info">
            <div class="file-name" @click="previewFile(item)">{{ item.fileName }}</div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(item.fileSize) }}</span>
              <span class="file-date">{{ formatDate(item.uploadTime) }}</span>
            </div>
          </div>
          <div class="file-actions">
            <i class="bi bi-download action-icon" @click="downloadFile(item)" title="下载"></i>
            <i class="bi bi-share action-icon" @click="shareFile(item)" title="分享"></i>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无文件" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatDate } from '@/utils/formatTime'
import { ElMessage } from 'element-plus'

const props = defineProps({
  filelength: {
    type: Number,
    default: 5
  }
})
// 定义事件
const emit = defineEmits(['goToFileManagement', 'previewFile', 'downloadFile', 'shareFile'])

// 控制卡片内容展开/收起的状态
const isExpanded = ref(true)

// 切换展开/收起状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 文件列表数据
const fileList = ref([])
const fileListLoading = ref(false)

// 获取文件列表
const getFileList = async () => {
  try {
    fileListLoading.value = true
    
    // 模拟API调用，实际项目中应替换为真实API
    // const res = await fileApi.getRecentFiles()
    
    // 模拟数据
    setTimeout(() => {
      fileList.value = [
        {
          fileName: '项目计划书.docx',
          fileType: 'docx',
          fileSize: 2048576, // 2MB
          uploadTime: new Date().getTime() - 86400000, // 昨天
          filePath: '/documents/项目计划书.docx'
        },
        {
          fileName: '财务报表.xlsx',
          fileType: 'xlsx',
          fileSize: 1048576, // 1MB
          uploadTime: new Date().getTime() - 172800000, // 前天
          filePath: '/documents/财务报表.xlsx'
        },
        {
          fileName: '会议纪要.pdf',
          fileType: 'pdf',
          fileSize: 3145728, // 3MB
          uploadTime: new Date().getTime() - 259200000, // 3天前
          filePath: '/documents/会议纪要.pdf'
        },
        {
          fileName: '产品设计图.png',
          fileType: 'png',
          fileSize: 5242880, // 5MB
          uploadTime: new Date().getTime() - 345600000, // 4天前
          filePath: '/images/产品设计图.png'
        },
        {
          fileName: '演示视频.mp4',
          fileType: 'mp4',
          fileSize: 10485760, // 10MB
          uploadTime: new Date().getTime() - 432000000, // 5天前
          filePath: '/videos/演示视频.mp4'
        }
      ]
      fileListLoading.value = false
    }, 500)
  } catch (error) {
    console.error('获取文件列表失败', error)
    ElMessage.error('获取文件列表失败')
    fileListLoading.value = false
  }
}

// 根据文件类型获取对应图标
const getFileIcon = (fileType) => {
  const iconMap = {
    'pdf': 'bi-file-earmark-pdf',
    'docx': 'bi-file-earmark-word',
    'doc': 'bi-file-earmark-word',
    'xlsx': 'bi-file-earmark-excel',
    'xls': 'bi-file-earmark-excel',
    'pptx': 'bi-file-earmark-ppt',
    'ppt': 'bi-file-earmark-ppt',
    'jpg': 'bi-file-earmark-image',
    'jpeg': 'bi-file-earmark-image',
    'png': 'bi-file-earmark-image',
    'gif': 'bi-file-earmark-image',
    'mp4': 'bi-file-earmark-play',
    'mp3': 'bi-file-earmark-music',
    'zip': 'bi-file-earmark-zip',
    'rar': 'bi-file-earmark-zip',
    'txt': 'bi-file-earmark-text'
  }
  
  return iconMap[fileType] || 'bi-file-earmark'
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

// 跳转到文件管理
const goToFileManagement = () => {
  emit('goToFileManagement')
}

// 预览文件
const previewFile = (file) => {
  emit('previewFile', file)
}

// 下载文件
const downloadFile = (file) => {
  emit('downloadFile', file)
}

// 分享文件
const shareFile = (file) => {
  emit('shareFile', file)
}

onMounted(() => {
  getFileList()
})
</script>

<style scoped>
/* 文件列表样式 */
.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
}

.file-item:last-child {
  border-bottom: none;
}

.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 24px;
}

.file-icon .bi-file-earmark-pdf {
  color: #e74c3c;
}

.file-icon .bi-file-earmark-word {
  color: #3498db;
}

.file-icon .bi-file-earmark-excel {
  color: #2ecc71;
}

.file-icon .bi-file-earmark-ppt {
  color: #e67e22;
}

.file-icon .bi-file-earmark-image {
  color: #9b59b6;
}

.file-icon .bi-file-earmark-play {
  color: #e74c3c;
}

.file-icon .bi-file-earmark-music {
  color: #f39c12;
}

.file-icon .bi-file-earmark-zip {
  color: #7f8c8d;
}

.file-icon .bi-file-earmark-text {
  color: #34495e;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 16px;
  margin-bottom: 5px;
  cursor: pointer;
}

.file-name:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.file-meta {
  display: flex;
  font-size: 12px;
  color: #999;
}

.file-size {
  margin-right: 15px;
}

.file-actions {
  display: flex;
  gap: 10px;
}

.action-icon {
  cursor: pointer;
  font-size: 18px;
  color: #999;
}

.action-icon:hover {
  color: var(--primary-color);
}

/* 卡片样式 */
.card {
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  background-color: white;
  border: none;
}

.card-header {
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  padding: 15px 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header .title {
  color: var(--primary-color);
  font-size: 18px;
  display: flex;
  align-items: center;
}

.toggle-icon {
  cursor: pointer;
  margin-right: 5px;
  font-size: 16px;
  transition: transform 0.3s;
}

.toggle-icon:hover {
  color: var(--primary-color);
}

.card-header .more {
  color: #999;
  font-size: 12px;
  font-weight: normal;
  cursor: pointer;
}

.card-body {
  padding: 15px 20px;
}
</style>
