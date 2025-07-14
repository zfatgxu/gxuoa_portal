<template>
  <div class="quick-actions">
    <div class="module-header">
      <div class="title">
        <span>快捷操作</span>
      </div>
      <div class="actions">
        <span class="more-link">更多 ></span>
      </div>
    </div>
    <div class="module-content">
      <div class="actions-grid">
        <div class="action-item" v-for="(action, index) in quickActions" :key="index" @click="handleAction(action)">
          <div class="action-icon" :style="{ backgroundColor: action.bgColor }">
            <i :class="action.icon"></i>
          </div>
          <div class="action-name">{{ action.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'QuickActions' })

// 模拟的快捷操作数据
const quickActions = ref([
  {
    id: 1,
    name: '未完成记',
    icon: 'el-icon-document',
    bgColor: '#8A6DE9',
    route: '/petition/unfinished'
  },
  {
    id: 2,
    name: '未信复记',
    icon: 'el-icon-message',
    bgColor: '#4B9CFF',
    route: '/petition/unreplied'
  },
  {
    id: 3,
    name: '复查数据统计',
    icon: 'el-icon-data-line',
    bgColor: '#00C2FF',
    route: '/petition/review-statistics'
  },
  {
    id: 4,
    name: '信访量总分分析表(按信访地)',
    icon: 'el-icon-pie-chart',
    bgColor: '#FFB800',
    route: '/petition/statistics-by-location'
  },
  {
    id: 5,
    name: '内容分类分年统计表(二类)',
    icon: 'el-icon-tickets',
    bgColor: '#FF6A6A',
    route: '/petition/statistics-by-category'
  },
  {
    id: 6,
    name: '进展类型统计(按地市)',
    icon: 'el-icon-data-board',
    bgColor: '#F86E9C',
    route: '/petition/statistics-by-status'
  }
])

// 处理快捷操作点击事件
const handleAction = (action) => {
  console.log('点击快捷操作:', action)
  // 这里可以添加跳转到相应页面的逻辑
}
</script>

<style lang="scss" scoped>
.quick-actions {
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
      .module-title {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }
  
  .module-content {
    padding: 15px;
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 20px;
      
      .action-item {
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-5px);
        }
        
        .action-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 10px;
          
          i {
            font-size: 24px;
            color: #fff;
          }
        }
        
        .action-name {
          font-size: 14px;
          color: #606266;
          line-height: 1.4;
        }
      }
    }
  }
}
</style>
