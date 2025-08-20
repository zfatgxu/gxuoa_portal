<template>
  <div class="statistics-page">
    <!-- 当前位置矩形（带边框） -->
    <div class="location-container">
      <el-breadcrumb separator=">>" class="breadcrumb">
        <el-breadcrumb-item>信访工作</el-breadcrumb-item>
        <el-breadcrumb-item>统计汇总</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 主内容矩形（带边框） -->
    <div class="main-container">
      <!-- 操作栏 -->
      <div class="toolbar">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-button
              type="primary"
              size="mini"
              class="filter-btn"
            >
              <el-icon class="mr-1"><Filter /></el-icon>
              高级筛选
              <span class="filter-count">已选择7个筛选条件</span>
            </el-button>
          </el-col>
          <el-col :span="18" class="flex justify-end">
            <el-button
              type="success"
              size="mini"
              class="mr-3"
            >
              <el-icon class="mr-1"><Download /></el-icon>导出PDF
            </el-button>
            <el-button
              type="success"
              size="mini"
              class="mr-3"
            >
              <el-icon class="mr-1"><Document /></el-icon>导出Excel
            </el-button>
            <el-button
              type="success"
              size="mini"
            >
              <el-icon class="mr-1"><Picture /></el-icon>导出图片
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 统计卡片区 -->
      <div class="stats-cards">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="card-header">
                <el-icon class="card-icon"><CalendarIcon /></el-icon>
                <span class="card-title">总计</span>
              </div>
              <div class="card-value">16</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="card-header">
                <el-icon class="card-icon" style="color: #ffb800;"><LoadingIcon /></el-icon>
                <span class="card-title">进行中</span>
              </div>
              <div class="card-value">8</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="card-header">
                <el-icon class="card-icon" style="color: #13ce66;"><CheckIcon /></el-icon>
                <span class="card-title">已完成</span>
              </div>
              <div class="card-value">10</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="card-header">
                <el-icon class="card-icon" style="color: #ff4949;"><WarningIcon /></el-icon>
                <span class="card-title">已超时</span>
              </div>
              <div class="card-value">7</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 图表区 -->
      <div class="chart-section">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-card class="chart-card">
              <div class="chart-header">
                <span class="chart-title">信访目的分类</span>
                <el-tabs v-model="purposeTab" class="chart-tabs" type="line">
                  <el-tab-pane label="折线图" name="line">
                    <template #icon><el-icon><LineChartIcon /></el-icon></template>
                  </el-tab-pane>
                  <el-tab-pane label="饼状图" name="pie">
                    <template #icon><el-icon><PieChartIcon /></el-icon></template>
                  </el-tab-pane>
                  <el-tab-pane label="数据表" name="table">
                    <template #icon><el-icon><TableIcon /></el-icon></template>
                  </el-tab-pane>
                </el-tabs>
              </div>
              <div class="chart-content">
                <template v-if="purposeTab === 'line'">
                  <div class="chart-placeholder">折线图（信访目的）</div>
                </template>
                <template v-else-if="purposeTab === 'pie'">
                  <div class="chart-placeholder">饼状图（信访目的）</div>
                </template>
                <template v-else>
                  <el-table :data="purposeTable" border style="width: 100%;">
                    <el-table-column prop="type" label="分类" />
                    <el-table-column prop="count" label="数量" />
                    <el-table-column prop="rate" label="占比" />
                  </el-table>
                </template>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="chart-card">
              <div class="chart-header">
                <span class="chart-title">信访内容分类</span>
                <el-tabs v-model="contentTab" class="chart-tabs" type="line">
                  <el-tab-pane label="折线图" name="line">
                    <template #icon><el-icon><LineChartIcon /></el-icon></template>
                  </el-tab-pane>
                  <el-tab-pane label="饼状图" name="pie">
                    <template #icon><el-icon><PieChartIcon /></el-icon></template>
                  </el-tab-pane>
                  <el-tab-pane label="数据表" name="table">
                    <template #icon><el-icon><TableIcon /></el-icon></template>
                  </el-tab-pane>
</template>
</div>
<div class="chart-content">
<template v-if="contentTab === 'line'">
  <div class="chart-placeholder">折线图（信访内容）</div>
</template>
<template v-else-if="contentTab === 'pie'">
  <div class="chart-placeholder">饼状图（信访内容）</div>
</template>
<template v-else>
  <el-table :data="contentTable" border style="width: 100%;">
    <el-table-column prop="type" label="分类" />
    <el-table-column prop="count" label="数量" />
    <el-table-column prop="rate" label="占比" />
  </el-table>
</template>
</div>
</el-card>
</el-col>
</el-row>
</div>
</div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Calendar as CalendarIcon,
  Filter,
  Loading as LoadingIcon,
  Check as CheckIcon,
  WarningFilled as WarningIcon,
  Download,
  Document,
  Picture,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Table as TableIcon
} from '@element-plus/icons-vue'

// 图表Tab切换
const purposeTab = ref('line')
const contentTab = ref('line')

// 模拟表格数据
const purposeTable = ref([
  { type: '咨询求助', count: 5, rate: '31.25%' },
  { type: '投诉举报', count: 4, rate: '25.00%' },
  { type: '建议反馈', count: 3, rate: '18.75%' },
  { type: '感恩表扬', count: 4, rate: '25.00%' }
])

const contentTable = ref([
  { type: '教学管理', count: 6, rate: '37.50%' },
  { type: '后勤服务', count: 4, rate: '25.00%' },
  { type: '学生工作', count: 3, rate: '18.75%' },
  { type: '其他', count: 3, rate: '18.75%' }
])
</script>

<style scoped lang="scss">
.statistics-page {
  position: relative;
  min-height: 100vh;
  padding: 0;
  background-color: #f0f0f0; /* 浅灰色背景，让边框更明显 */
}

/* 当前位置矩形 - 显示边框 */
.location-container {
  position: absolute;
  left: 201px;
  top: 78px;
  width: 1694px;
  height: 62px;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid rgba(187, 187, 187, 1); /* 明显的灰色边框 */
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); /* 轻微阴影增强边框视觉效果 */

  .breadcrumb {
    margin: 0;
    .el-breadcrumb__item {
      font-size: 14px;
      color: #666;
    }
  }
}

/* 主内容矩形 - 显示边框 */
.main-container {
  position: absolute;
  left: 201px;
  top: 136px;
  width: 1694px;
  height: 824px;
  line-height: 18px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 1);
  color: rgba(102, 102, 102, 1);
  font-size: 14px;
  text-align: center;
  font-family: "Arial-regular", Arial, sans-serif;
  border: 1px solid rgba(187, 187, 187, 1); /* 从0px改为1px，显示边框 */
  padding: 24px;
  box-sizing: border-box;
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08); /* 轻微阴影增强边框视觉效果 */

  .toolbar {
    margin-bottom: 24px;
    text-align: left;

    .filter-btn {
      .filter-count {
        color: #999;
        font-size: 12px;
        margin-left: 6px;
      }
    }
  }

  .stats-cards {
    margin-bottom: 24px;
    text-align: left;

    .stat-card {
      text-align: center;
      padding: 24px 0;
      border-radius: 8px;
      border: 1px solid #ebeef5;

      .card-header {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;

        .card-icon {
          font-size: 28px;
          margin-right: 8px;
        }

        .card-title {
          font-size: 16px;
          color: #666;
        }
      }

      .card-value {
        font-size: 24px;
        font-weight: 600;
        color: #409eff;
      }
    }
  }

  .chart-section {
    text-align: left;

    .chart-card {
      border-radius: 8px;
      border: 1px solid #ebeef5;
      margin-bottom: 24px;

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #ebeef5;
        text-align: left;

        .chart-title {
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }

        .chart-tabs {
          :deep(.el-tabs--line) {
            .el-tabs__header {
              border-bottom: none;
            }
            .el-tabs__active-bar {
              background-color: #409eff;
            }
            .el-tabs__item {
              color: #666;
              &.is-active {
                color: #409eff;
              }
            }
          }
        }
      }

      .chart-content {
        padding: 24px;
        min-height: 300px;
        text-align: left;
      }

      .chart-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
        background: #f8f9fc;
        color: #999;
        border-radius: 4px;
      }
    }
  }

  .flex { display: flex; }
  .justify-end { justify-content: flex-end; }
  .mr-1 { margin-right: 4px; }
  .mr-3 { margin-right: 12px; }
}
</style>
