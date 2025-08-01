<template>
  <div class="statistics-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span>当前位置：信访工作 >> 统计汇总</span>
    </div>
    
    <!-- 用户信息和导出按钮 -->
    <div class="header-section">
      <div class="user-info" @click="seniorFilterVisible = true">
        <div class="w-8 h-8 rounded-md mr-2 flex items-center justify-center" style="background-color: #409EFF">
            <el-icon><Funnel color="white"/></el-icon>
        </div>
        <div>
          <div>高级筛选</div>
          <div class="text-xs">已选择{{ activeFilters.selectedFiltersCount }}个筛选条件</div>
        </div>
      </div>
      <div class="export-buttons">
        <el-button type="default" :icon="Download" size="large" @click="exportPDF">导出PDF</el-button>
        <el-button type="default" :icon="Download" size="large" @click="exportExcel">导出Excel</el-button>
        <el-button type="default" :icon="Download" size="large" @click="exportImage">导出图片</el-button>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="total-card">
            <div class="flex items-center">
             <div class="card-icon">
              <el-icon><CalendarRange /></el-icon>
             </div>
             <div>
              <div class="card-title">总计</div>
              <div class="card-value">16</div>
             </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="processing-card">
            <div class="flex items-center">
             <div class="card-icon">
              <el-icon><Timer /></el-icon>
             </div>
             <div>
              <div class="card-title">进行中</div>
              <div class="card-value">8</div>
             </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="completed-card">
            <div class="flex items-center">
             <div class="card-icon">
              <el-icon><CircleCheck /></el-icon>
             </div>
             <div>
              <div class="card-title">已完成</div>
              <div class="card-value">10</div>
            </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overdue-card">
            <div class="flex items-center">
             <div class="card-icon">
              <el-icon><Bell /></el-icon>
             </div>
             <div>
              <div class="card-title">已超时</div>
              <div class="card-value">7</div>
             </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-section">
      <el-row :gutter="20">
        <!-- 信访目的分类 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <div class="chart-header">
              <div class="chart-title">
                <el-icon v-if="purposeChartType === 'line'"><ChartSpline /></el-icon>
                <el-icon v-if="purposeChartType === 'pie'"><ChartPie /></el-icon>
                <el-icon v-if="purposeChartType === 'table'"><Table /></el-icon>
                信访目的分类
              </div>
              <div class="chart-tabs">
                <el-radio-group v-model="purposeChartType" size="small">
                  <el-radio-button label="line">折线图</el-radio-button>
                  <el-radio-button label="pie">饼状图</el-radio-button>
                  <el-radio-button label="table">数据表</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="chart-content">
              <!-- 折线图 -->
              <div v-show="purposeChartType === 'line'" class="chart-container">
                <div ref="purposeLineChart" class="echarts-container"></div>
              </div>
              <!-- 饼状图 -->
              <div v-show="purposeChartType === 'pie'" class="chart-container">
                <div ref="purposePieChart" class="echarts-container"></div>
              </div>
              <!-- 数据表 -->
              <div v-show="purposeChartType === 'table'" class="table-container">
                <el-table :data="purposeTableData" border style="width: 100%">
                  <el-table-column prop="type" label="目的类型" />
                  <el-table-column prop="count" label="数量" />
                  <el-table-column prop="percentage" label="占比" />
                </el-table>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 信访内容分类 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <div class="chart-header">
              <div class="chart-title">
                <el-icon v-if="contentChartType === 'line'"><ChartSpline /></el-icon>
                <el-icon v-if="contentChartType === 'pie'"><ChartPie /></el-icon>
                <el-icon v-if="contentChartType === 'table'"><Table /></el-icon>
                信访内容分类
              </div>
              <div class="chart-tabs">
                <el-radio-group v-model="contentChartType" size="small">
                  <el-radio-button label="line">折线图</el-radio-button>
                  <el-radio-button label="pie">饼状图</el-radio-button>
                  <el-radio-button label="table">数据表</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="chart-content">
              <!-- 折线图 -->
              <div v-show="contentChartType === 'line'" class="chart-container">
                <div ref="contentLineChart" class="echarts-container"></div>
              </div>
              <!-- 饼状图 -->
              <div v-show="contentChartType === 'pie'" class="chart-container">
                <div ref="contentPieChart" class="echarts-container"></div>
              </div>
              <!-- 数据表 -->
              <div v-show="contentChartType === 'table'" class="table-container">
                <el-table :data="contentTableData" border style="width: 100%">
                  <el-table-column prop="type" label="内容类型" />
                  <el-table-column prop="count" label="数量" />
                  <el-table-column prop="percentage" label="占比" />
                </el-table>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 详细数据表格 -->
    <div class="detail-data-section">
      <el-card class="detail-card">
        <div class="chart-header">
          <div class="chart-title">
            <el-icon><List /></el-icon>
            详细数据
          </div>
        </div>
        <div class="table-container">
          <el-table :data="detailTableData" :stripe="true" :show-overflow-tooltip="true">
            <el-table-column prop="id" align="center" label="序号" width="60"/>
            <el-table-column prop="code" align="center" label="编号"/>
            <el-table-column prop="priority" align="center" label="优先级" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.priority === '一般' ? 'warning' : 'danger'" size="default" round>
                  {{ scope.row.priority }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="category" align="center" label="分类">
              <template #default="scope">
                <el-tag :type="getTagType(scope.row.category)" size="default" effect="plain" round>
                  {{ scope.row.category }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" align="center" label="信访内容" show-overflow-tooltip>
                <template #default="scope">
                    <span style="font-size: 10px;">{{ scope.row.content }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="person" align="center" label="信访人" />
            <el-table-column prop="address" align="center" label="信访人地址" show-overflow-tooltip />
            <el-table-column prop="status" align="center" label="当前状态">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="default" effect="plain" round>
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="receiveDate" align="center" label="接收日期" />
            <el-table-column prop="lastOperator" align="center" label="上一操作人" />
            <el-table-column label="操作" align="center" fixed="right">
              <template #default="scope">
                <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <Pagination
            :total=3
            :page=1
            :limit=6
            @pagination="getList"
          />
        </div>
      </el-card>
    </div>
    <!-- 高级筛选弹框 -->
    <SeniorFilter
      v-model:visible="seniorFilterVisible"
      @apply="handleSeniorFilterApply"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { CalendarRange, Timer, CircleCheck, Bell, Funnel, ChartSpline, ChartPie, Table, List } from 'lucide-vue-next'
import { Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import SeniorFilter from '../components/seniorFilter.vue'

// 图表类型
const purposeChartType = ref('line')
const contentChartType = ref('line')

// 图表引用
const purposeLineChart = ref()
const purposePieChart = ref()
const contentLineChart = ref()
const contentPieChart = ref()

// 表格数据
const purposeTableData = ref([
  { type: '政策咨询', count: 35, percentage: '30%' },
  { type: '投诉举报', count: 32, percentage: '28%' },
  { type: '建议意见', count: 24, percentage: '24%' },
  { type: '求助申请', count: 20, percentage: '18%' }
])

const contentTableData = ref([
  { type: '职务行为', count: 35, percentage: '30%' },
  { type: '法律法规', count: 32, percentage: '28%' },
  { type: '学术工作', count: 24, percentage: '24%' }
])

const detailTableData = ref([
  {
    id: 1,
    code: '20220101',
    priority: '一般',
    category: '政策咨询',
    content: '关于政策咨询的信访内容',
    person: '张三',
    address: '北京市朝阳区',
    status: '已完成',
    receiveDate: '2022-01-01',
    lastOperator: '李四'
  },
  {
    id: 2,
    code: '20220102',
    priority: '一般',
    category: '投诉举报',
    content: '关于投诉举报的信访内容',
    person: '王五',
    address: '上海市浦东新区',
    status: '进行中',
    receiveDate: '2022-01-02',
    lastOperator: '赵六'
  },
  {
    id: 3,
    code: '20220102',
    priority: '紧急',
    category: '投诉举报',
    content: '关于投诉举报的信访内容',
    person: '王五',
    address: '上海市浦东新区',
    status: '进行中',
    receiveDate: '2022-01-02',
    lastOperator: '赵六'
  }
])

// 初始化折线图
const initLineChart = (chartRef, title, data) => {
  const chartDom = chartRef.value
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: data.series.map(item => item.name),
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: data.series
  }
  
  myChart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 初始化饼图
const initPieChart = (chartRef, title, data) => {
  const chartDom = chartRef.value
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: data.map(item => item.name)
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }
  
  myChart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 高级筛选弹框
const seniorFilterVisible = ref(false)
const activeFilters = ref({
  dateRange: [],
  petitionTypes: [],
  petitionPurposes: [],
  contentCategories: [],
  processingStatuses: [],
  priorityLevels: [],
  departments: [],
  petitionerTypes: [],
  selectedFiltersCount: 0
})

// 处理高级筛选应用
const handleSeniorFilterApply = (filters) => {
  // 更新筛选条件
  activeFilters.value = {
    dateRange: filters.dateRange || [],
    petitionTypes: filters.petitionTypes || [],
    petitionPurposes: filters.petitionPurposes || [],
    contentCategories: filters.contentCategories || [],
    processingStatuses: filters.processingStatuses || [],
    priorityLevels: filters.priorityLevels || [],
    departments: filters.departments || [],
    petitionerTypes: filters.petitionerTypes || [],
    selectedFiltersCount: filters.selectedFiltersCount || 0
  }
  ElMessage.success('筛选条件已应用')
}

// 筛选后的表格数据
const filteredTableData = computed(() => {
  if (!activeFilters.value || 
      (activeFilters.value.dateRange[0] === null && 
       activeFilters.value.dateRange[1] === null && 
       activeFilters.value.petitionTypes.length === 0 &&
       activeFilters.value.petitionPurposes.length === 0 &&
       activeFilters.value.contentCategories.length === 0 &&
       activeFilters.value.processingStatuses.length === 0 &&
       activeFilters.value.priorityLevels.length === 0 &&
       activeFilters.value.departments.length === 0 &&
       activeFilters.value.petitionerTypes.length === 0)) {
    return detailTableData.value
  }

  return detailTableData.value.filter(item => {
    // 日期范围筛选
    if (activeFilters.value.dateRange[0] && activeFilters.value.dateRange[1]) {
      const itemDate = new Date(item.receiveDate)
      const startDate = new Date(activeFilters.value.dateRange[0])
      const endDate = new Date(activeFilters.value.dateRange[1])
      
      // 设置时间为当天的开始和结束，以便正确比较
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      
      if (itemDate < startDate || itemDate > endDate) {
        return false
      }
    }
    
    // 信访类型筛选
    if (activeFilters.value.petitionTypes.length > 0) {
      // 假设item.type包含信访类型信息
      if (!activeFilters.value.petitionTypes.includes(item.type)) {
        return false
      }
    }
    
    // 信访目的筛选
    if (activeFilters.value.petitionPurposes.length > 0) {
      // 假设item.purpose包含信访目的信息
      if (!activeFilters.value.petitionPurposes.includes(item.purpose)) {
        return false
      }
    }
    
    // 信访内容分类筛选
    if (activeFilters.value.contentCategories.length > 0) {
      // 假设item.category包含信访内容分类信息
      if (!activeFilters.value.contentCategories.includes(item.category)) {
        return false
      }
    }
    
    // 处理状态筛选
    if (activeFilters.value.processingStatuses.length > 0) {
      // 假设item.status包含处理状态信息
      if (!activeFilters.value.processingStatuses.includes(item.status)) {
        return false
      }
    }
    
    // 优先级筛选
    if (activeFilters.value.priorityLevels.length > 0) {
      // 假设item.priority包含优先级信息
      if (!activeFilters.value.priorityLevels.includes(item.priority)) {
        return false
      }
    }
    
    // 部门筛选
    if (activeFilters.value.departments.length > 0) {
      // 假设item.department包含部门信息
      if (!activeFilters.value.departments.includes(item.department)) {
        return false
      }
    }
    
    // 信访人类型筛选
    if (activeFilters.value.petitionerTypes.length > 0) {
      // 假设item.petitionerType包含信访人类型信息
      if (!activeFilters.value.petitionerTypes.includes(item.petitionerType)) {
        return false
      }
    }
    
    return true
  })
})
// 导出PDF
const exportPDF = () => {
  ElMessage.info('导出PDF功能开发中')
}

// 导出Excel
const exportExcel = () => {
  ElMessage.info('导出Excel功能开发中')
}

// 导出图片
const exportImage = () => {
  ElMessage.info('导出图片功能开发中')
}

// 监听图表类型变化
watch(purposeChartType, (newVal) => {
  if (newVal === 'line') {
    nextTick(() => {
      initLineChart(purposeLineChart, '信访目的分类', {
        series: [
          {
            name: '政策咨询',
            type: 'line',
            data: [40, 45, 42, 38, 35, 32, 30, 32, 35, 38],
            smooth: true,
            lineStyle: { color: '#409EFF' }
          },
          {
            name: '投诉举报',
            type: 'line',
            data: [25, 23, 28, 30, 35, 38, 35, 32, 30, 28],
            smooth: true,
            lineStyle: { color: '#67C23A' }
          },
          {
            name: '建议意见',
            type: 'line',
            data: [20, 22, 25, 28, 24, 22, 24, 26, 24, 22],
            smooth: true,
            lineStyle: { color: '#E6A23C' }
          },
          {
            name: '求助申请',
            type: 'line',
            data: [15, 18, 20, 18, 15, 18, 20, 22, 20, 18],
            smooth: true,
            lineStyle: { color: '#F56C6C' }
          }
        ]
      })
    })
  } else if (newVal === 'pie') {
    nextTick(() => {
      initPieChart(purposePieChart, '信访目的分类', [
        { value: 30, name: '政策咨询' },
        { value: 28, name: '投诉举报' },
        { value: 24, name: '建议意见' },
        { value: 18, name: '求助申请' }
      ])
    })
  }
})

watch(contentChartType, (newVal) => {
  if (newVal === 'line') {
    nextTick(() => {
      initLineChart(contentLineChart, '信访内容分类', {
        series: [
          {
            name: '职务行为',
            type: 'line',
            data: [40, 45, 42, 38, 35, 32, 30, 32, 35, 38],
            smooth: true,
            lineStyle: { color: '#409EFF' }
          },
          {
            name: '法律法规',
            type: 'line',
            data: [25, 23, 28, 30, 35, 38, 35, 32, 30, 28],
            smooth: true,
            lineStyle: { color: '#67C23A' }
          },
          {
            name: '学术工作',
            type: 'line',
            data: [20, 22, 25, 28, 24, 22, 24, 26, 24, 22],
            smooth: true,
            lineStyle: { color: '#E6A23C' }
          }
        ]
      })
    })
  } else if (newVal === 'pie') {
    nextTick(() => {
      initPieChart(contentPieChart, '信访内容分类', [
        { value: 30, name: '职务行为' },
        { value: 28, name: '法律法规' },
        { value: 24, name: '学术工作' }
      ])
    })
  }
})

onMounted(() => {
  // 初始化图表
  nextTick(() => {
    // 初始化信访目的分类折线图
    initLineChart(purposeLineChart, '信访目的分类', {
      series: [
        {
          name: '政策咨询',
          type: 'line',
          data: [40, 45, 42, 38, 35, 32, 30, 32, 35, 38],
          smooth: true,
          lineStyle: { color: '#409EFF' }
        },
        {
          name: '投诉举报',
          type: 'line',
          data: [25, 23, 28, 30, 35, 38, 35, 32, 30, 28],
          smooth: true,
          lineStyle: { color: '#67C23A' }
        },
        {
          name: '建议意见',
          type: 'line',
          data: [20, 22, 25, 28, 24, 22, 24, 26, 24, 22],
          smooth: true,
          lineStyle: { color: '#E6A23C' }
        },
        {
          name: '求助申请',
          type: 'line',
          data: [15, 18, 20, 18, 15, 18, 20, 22, 20, 18],
          smooth: true,
          lineStyle: { color: '#F56C6C' }
        }
      ]
    })
    
    // 初始化信访内容分类折线图
    initLineChart(contentLineChart, '信访内容分类', {
      series: [
        {
          name: '职务行为',
          type: 'line',
          data: [40, 45, 42, 38, 35, 32, 30, 32, 35, 38],
          smooth: true,
          lineStyle: { color: '#409EFF' }
        },
        {
          name: '法律法规',
          type: 'line',
          data: [25, 23, 28, 30, 35, 38, 35, 32, 30, 28],
          smooth: true,
          lineStyle: { color: '#67C23A' }
        },
        {
          name: '学术工作',
          type: 'line',
          data: [20, 22, 25, 28, 24, 22, 24, 26, 24, 22],
          smooth: true,
          lineStyle: { color: '#E6A23C' }
        }
      ]
    })
  })
})

const getTagType = (category) => {
  switch (category) {
    case '政策咨询':
      return 'primary'
    case '投诉举报':
      return 'danger'
    case '建议意见':
      return 'warning'
    case '求助申请':
      return 'success'
    default:
      return 'info'
  }
}

const getStatusType = (status) => {
  switch (status) {
    case '已完成':
      return 'success'
    case '进行中':
      return 'primary'
    case '已超时':
      return 'danger'
    default:
      return 'info'
  }
}

const viewDetail = (row) => {
  ElMessage.error('功能未实现')
}


</script>

<style scoped>
.statistics-container {
  padding: 20px;
  background-color: #fff;
}

.breadcrumb {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  border: 1px solid #e4e7ed;
  width: 20%;
  padding: 10px;
  padding-left: 30px;
  border-radius: 10px;
}

.user-avatar {
  margin-right: 10px;
  background-color: #409EFF;
}

.export-buttons {
  display: flex;
  gap: 10px;
}

.stat-cards {
  margin-bottom: 20px;
}

.card-icon {
  font-size: 32px;
  margin-right: 40px;
}

.total-card .card-icon {
  color: #409EFF;
}

.processing-card .card-icon {
  color: #E6A23C;
}

.completed-card .card-icon {
  color: #67C23A;
}

.overdue-card .card-icon {
  color: #F56C6C;
}

.card-title {
  font-size: 24px;
  color: #909399;
  margin-bottom: 10px;
  font-weight: bold;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.total-card .card-value {
  color: #409EFF;
}

.processing-card .card-value {
  color: #E6A23C;
}

.completed-card .card-value {
  color: #67C23A;
}

.overdue-card .card-value {
  color: #F56C6C;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.chart-title .el-icon {
  margin-right: 5px;
}

.chart-container {
  height: 400px;
}

.echarts-container {
  width: 100%;
  height: 100%;
}

.table-container {
  margin-top: 20px;
}

.detail-data-section {
  margin-top: 20px;
}

.detail-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
