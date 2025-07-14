<template>
  <div class="resource-download">
    <div class="module-header">
      <div class="title">
        <span>资料下载</span>
      </div>
      <div class="actions">
        <span class="more-link">更多 ></span>
      </div>
    </div>
    <div class="module-content">
      <div class="download-list">
        <div v-for="(item, index) in downloadResources" :key="index" class="download-item" @click="downloadResource(item)">
          <div class="resource-title">{{ item.title }}</div>
          <div class="resource-date">{{ item.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'ResourceDownload' })

// 模拟的资料下载数据
const downloadResources = ref([
  {
    id: 1,
    title: '新功能培训.pptx',
    date: '2025-01-10',
    url: '#'
  },
  {
    id: 2,
    title: '数据统计新功能使用说明文档.docx',
    date: '2024-12-29',
    url: '#'
  },
  {
    id: 3,
    title: '新版信访门户信访人基表（模板）功能操作手册.docx',
    date: '2024-10-31',
    url: '#'
  },
  {
    id: 4,
    title: '由于平台数据模板新增"零下资源检索"零件专题示范培训课程.docx',
    date: '2024-10-24',
    url: '#'
  },
  {
    id: 5,
    title: '秋冬信息功能新增特色功能使用说明.docx',
    date: '2024-10-24',
    url: '#'
  }
])

// 下载资料
const downloadResource = (resource) => {
  console.log('下载资料:', resource)
  // 这里可以添加下载资料的逻辑
}
</script>

<style lang="scss" scoped>
.resource-download {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  
  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #e6e6e6;
    
    .title {
      font-weight: bold;
      font-size: 16px;
      color: #303133;
    }
    
    .actions {
      display: flex;
      align-items: center;
      
      i {
        font-size: 18px;
        color: #909399;
        margin-right: 10px;
        cursor: pointer;
      }
      
      .module-title {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }
  
  .module-content {
    padding: 10px;
    
    .download-list {
      .download-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 5px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background-color: #f5f7fa;
        }
        
        .resource-title {
          flex: 1;
          font-size: 14px;
          color: #303133;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .resource-date {
          font-size: 13px;
          color: #909399;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
