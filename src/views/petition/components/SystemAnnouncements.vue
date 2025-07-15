<template>
  <div class="system-announcements">
    <div class="module-header">
      <div class="title">
        <span>系统公告</span>
      </div>
      <div class="actions">
        <span class="more-link">更多 ></span>
      </div>
    </div>
    <div class="module-content">
      <div class="announcement-list">
        <div v-for="(item, index) in announcements" :key="index" class="announcement-item" @click="viewAnnouncement(item)">
          <div class="announcement-title">{{ item.title }}</div>
          <div class="announcement-date">{{ item.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'SystemAnnouncements' })

// 模拟的系统公告数据
const announcements = ref([
  {
    id: 1,
    title: '关于广西网上信访暨信息系统登记平台升级的通知',
    date: '2025-02-19'
  },
  {
    id: 2,
    title: '关于推广广西网上信访暨信息系统功能升级和数据交换联调工作的通知',
    date: '2024-12-26'
  },
  {
    id: 3,
    title: '关于述、交办、留办的办理方式网上统一转送的通知',
    date: '2024-12-02'
  },
  {
    id: 4,
    title: '关于新版信访门户信访人基表（模板）功能的通知',
    date: '2024-10-31'
  },
  {
    id: 5,
    title: '关于内蒙功能由智市平台数据模板功能升级的通知',
    date: '2024-10-24'
  }
])

// 查看公告详情
const viewAnnouncement = (announcement) => {
  console.log('查看公告详情:', announcement)
  // 这里可以添加查看公告详情的逻辑
}
</script>

<style lang="scss" scoped>
.system-announcements {
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
    
    .announcement-list {
      .announcement-item {
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
        
        .announcement-title {
          flex: 1;
          font-size: 14px;
          color: #303133;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .announcement-date {
          font-size: 13px;
          color: #909399;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
