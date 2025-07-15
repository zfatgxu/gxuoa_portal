<template>
  <div class="warning-tips">
    <div class="module-header">
      <div class="title">
        <span>预警提示</span>
      </div>
      <div class="actions">
        <span class="more-link">更多 ></span>
      </div>
    </div>
    <div class="module-content">
      <!-- 预警提示内容为空的占位符 -->
      <div class="empty-content">
        <i class="el-icon-warning-outline"></i>
        <p>暂无预警提示</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'WarningTips' })

// 这里可以添加预警提示相关的逻辑
</script>

<style lang="scss" scoped>
.warning-tips {
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
    min-height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .empty-content {
      text-align: center;
      color: #909399;
      
      i {
        font-size: 48px;
        margin-bottom: 10px;
      }
      
      p {
        margin: 0;
        font-size: 14px;
      }
    }
  }
}
</style>
