<template>
  <div class="petition-dashboard">
    <!-- 第一行：左侧待办信访列表，中间预警提示，右侧快捷操作 -->
    <div class="dashboard-main-row">
      <!-- 左侧待办信访列表 -->
      <div class="left-column">
        <PendingPetitionList />
      </div>
      <!-- 中间预警提示 -->
      <div class="middle-column">
        <WarningTips />
      </div>
      <!-- 右侧快捷操作 -->
      <div class="right-column">
        <QuickActions />
      </div>
    </div>
    
    <!-- 第二行：左侧办理进度统计和效率图表，右侧公告和资料 -->
    <div class="dashboard-main-row">
      <!-- 左宽列 - 统计数据 -->
      <div class="left-wide-column">
        <!-- 办理进度统计表 -->
        <div class="dashboard-panel margin-bottom">
          <ProcessingStatistics />
        </div>
        
        <!-- 处理效率统计图表 -->
        <div class="dashboard-panel">
          <EfficiencyChart />
        </div>
      </div>
      
      <!-- 右窄列 - 公告和资料 -->
      <div class="right-narrow-column">
        <!-- 系统公告 -->
        <div class="dashboard-panel margin-bottom">
          <SystemAnnouncements />
        </div>
        
        <!-- 资料下载 -->
        <div class="dashboard-panel">
          <ResourceDownload />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

// 直接在模板中使用组件标签
defineOptions({ name: 'PetitionIndex' })

/** 初始化 */
onMounted(() => {
  console.log('信访系统首页加载完成')
})
</script>

<!-- 导入各个模块组件 -->
<script lang="ts">
import PendingPetitionList from './components/PendingPetitionList.vue'
import WarningTips from './components/WarningTips.vue'
import ProcessingStatistics from './components/ProcessingStatistics.vue'
import EfficiencyChart from './components/EfficiencyChart.vue'
import QuickActions from './components/QuickActions.vue'
import SystemAnnouncements from './components/SystemAnnouncements.vue'
import ResourceDownload from './components/ResourceDownload.vue'

export default {
  components: {
    PendingPetitionList,
    WarningTips,
    ProcessingStatistics,
    EfficiencyChart,
    QuickActions,
    SystemAnnouncements,
    ResourceDownload
  }
}
</script>

<style lang="scss" scoped>
.petition-dashboard {
  padding: 10px;
  background-color: #f0f2f5;
  
  .dashboard-row,
  .dashboard-main-row {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .dashboard-row {
    width: 100%;
  }
  
  .left-column {
    flex: 6; /* 左列占据空间最大 */
  }
  
  .middle-column {
    flex: 3; /* 中间列占据中等空间 */
  }
  
  .right-column {
    flex: 3; /* 右列占据中等空间 */
  }
  
  .left-wide-column {
    flex: 7; /* 第二行左宽列 */
  }
  
  .right-narrow-column {
    flex: 3; /* 第二行右窄列 */
  }
  
  .dashboard-panel {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    
    &.margin-bottom {
      margin-bottom: 15px;
    }
  }
}
</style>
