<template>
  <div class="processing-statistics">
    <div class="module-header">
      <div class="title">
        <span>办理进度统计表</span>
      </div>
      <div class="actions">
        <span class="more-link">更多 ></span>
      </div>
    </div>
    <div class="module-content">
      <el-table
        :data="statisticsData"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column prop="sourceType" label="信访方式" align="center" />
        <el-table-column prop="totalReceived" label="待办未受收" align="center" />
        <el-table-column prop="totalProcessing" label="未受理完结" align="center" />
        <el-table-column prop="totalCompleted" label="未答复" align="center" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'ProcessingStatistics' })

// 模拟的统计数据
const statisticsData = ref([
  {
    sourceType: '来信',
    totalReceived: 0,
    totalProcessing: 0,
    totalCompleted: 1
  },
  {
    sourceType: '来访',
    totalReceived: 0,
    totalProcessing: 0,
    totalCompleted: 0
  },
  {
    sourceType: '网上投诉',
    totalReceived: 0,
    totalProcessing: 0,
    totalCompleted: 3
  },
  {
    sourceType: '领导信箱',
    totalReceived: 0,
    totalProcessing: 0,
    totalCompleted: 0
  },
  {
    sourceType: '人民建议征集',
    totalReceived: 0,
    totalProcessing: 0,
    totalCompleted: 0
  }
])
</script>

<style lang="scss" scoped>
.processing-statistics {
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
    padding: 10px;
  }
}
</style>
