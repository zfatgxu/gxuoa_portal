<template>
  <div class="statistics-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span>当前位置：信访工作 >> 统计汇总</span>
    </div>
    
    <!-- 用户信息和导出按钮
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
    </div> -->
    
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
              <div class="card-value">{{ monthlyStats.increase }}</div>
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
              <div class="card-value">{{ monthlyStats.ongoing }}</div>
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
              <div class="card-value">{{ monthlyStats.finished }}</div>
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
              <div class="card-value">{{ monthlyStats.overdue }}</div>
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
                <el-icon v-if="purposeChartType === 'line'">
                  <ChartSpline />
                </el-icon>
                <el-icon v-if="purposeChartType === 'pie'">
                  <ChartPie />
                </el-icon>
                <el-icon v-if="purposeChartType === 'table'"><Table /></el-icon>
                信访目的分类
              </div>
              <div class="chart-tabs">
                <el-radio-group v-model="purposeChartType" size="small">
                  <el-radio-button label="line">折线图</el-radio-button>
                  <el-radio-button label="pie">饼状图</el-radio-button>
                </el-radio-group>
                <el-select v-model="purposeSelectedYear" placeholder="选择年份" size="small" class="ml-2" @change="getPurposeStat">
                  <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
                </el-select>
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
                </el-radio-group>
                <el-select v-model="contentSelectedYear" placeholder="选择年份" size="small" class="ml-2" @change="getContentStat">
                  <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
                </el-select>
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
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <!-- 信访渠道 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <div class="chart-header">
              <div class="chart-title">
                <el-icon v-if="channelChartType === 'line'"><ChartSpline /></el-icon>
                <el-icon v-if="channelChartType === 'pie'"><ChartPie /></el-icon>
                <el-icon v-if="channelChartType === 'table'"><Table /></el-icon>
                信访渠道
              </div>
              <div class="chart-tabs">
                <el-radio-group v-model="channelChartType" size="small">
                  <el-radio-button label="line">折线图</el-radio-button>
                  <el-radio-button label="pie">饼状图</el-radio-button>
                </el-radio-group>
                <el-select v-model="channelSelectedYear" placeholder="选择年份" size="small" class="ml-2" @change="getChannelStat">
                  <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
                </el-select>
              </div>
            </div>
            <div class="chart-content">
              <!-- 折线图 -->
              <div v-show="channelChartType === 'line'" class="chart-container">
                <div ref="channelLineChart" class="echarts-container"></div>
              </div>
              <!-- 饼状图 -->
              <div v-show="channelChartType === 'pie'" class="chart-container">
                <div ref="channelPieChart" class="echarts-container"></div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 高级筛选弹框 -->
    <SeniorFilter
      v-model:visible="seniorFilterVisible"
      @apply="handleSeniorFilterApply"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { CalendarRange, Timer, CircleCheck, Bell, Funnel, ChartSpline, ChartPie, Table, List } from 'lucide-vue-next'
import { Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import SeniorFilter from '../components/seniorFilter.vue'
import * as PetitionApi from '@/api/petition'

// 定义月度统计数据类型
interface MonthlyStatsData {
  increase: number
  ongoing: number
  finished: number
  overdue: number
}

const monthlyStats = ref<MonthlyStatsData>({
  increase: 0,
  ongoing: 0,
  finished: 0,
  overdue: 0
})

// 年份选择
const currentYear = new Date().getFullYear()
const yearOptions = ref<number[]>([])

// 生成最近10年的年份列表
for (let i = 0; i < 10; i++) {
  yearOptions.value.push(currentYear - i)
}

// 图表类型
const purposeChartType = ref('line')
const contentChartType = ref('line')
const channelChartType = ref('line')

// 选择的年份
const purposeSelectedYear = ref(currentYear)
const contentSelectedYear = ref(currentYear)
const channelSelectedYear = ref(currentYear)

// 图表引用
const purposeLineChart = ref()
const purposePieChart = ref()
const contentLineChart = ref()
const contentPieChart = ref()
const channelLineChart = ref()
const channelPieChart = ref()

// 表格数据
const purposeTableData = ref([
  { type: '政策咨询', count: 34, percentage: '30%' },
  { type: '投诉举报', count: 32, percentage: '28%' },
  { type: '建议意见', count: 24, percentage: '24%' },
  { type: '求助申请', count: 20, percentage: '18%' }
])

const contentTableData = ref([
  { type: '职务行为', count: 35, percentage: '30%' },
  { type: '法律法规', count: 32, percentage: '28%' },
  { type: '学术工作', count: 24, percentage: '24%' }
])

const channelTableData = ref([
  { type: '来访', count: 45, percentage: '35%' },
  { type: '来信', count: 32, percentage: '25%' },
  { type: '网上信访', count: 28, percentage: '22%' },
  { type: '电话信访', count: 23, percentage: '18%' }
])
const purposeData = reactive({})
const contentData = reactive({})
const channelData = reactive({})

// 初始化折线图
const initLineChart = (chartRef, title, data) => {
  const chartDom = chartRef.value
  if (!chartDom) return
  
  // 检查数据是否存在且有效
  if (!data || !data.series || !Array.isArray(data.series) || data.series.length === 0) {
    const myChart = echarts.init(chartDom)
    myChart.clear() // 清除图表内容
    return
  }
  
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
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
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
  
  // 检查数据是否存在且有效
  if (!data || !Array.isArray(data) || data.length === 0) {
    const myChart = echarts.init(chartDom)
    myChart.clear() // 清除图表内容
    return
  }
  
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
        series: purposeData.lineData
  })})
  } else if (newVal === 'pie') {
    nextTick(() => {
      initPieChart(purposePieChart, '信访目的分类', purposeData.pieData)
    })
  }
})

watch(contentChartType, (newVal) => {
  if (newVal === 'line') {
    nextTick(() => {
      initLineChart(contentLineChart, '信访内容分类', {
        series: contentData.lineData
      })
    })
  } else if (newVal === 'pie') {
    nextTick(() => {
      initPieChart(contentPieChart, '信访内容分类', contentData.pieData)
    })
  }
})

watch(channelChartType, (newVal) => {
  if (newVal === 'line') {
    nextTick(() => {
      initLineChart(channelLineChart, '信访渠道', {
        series: channelData.lineData
      })
    })
  } else if (newVal === 'pie') {
    nextTick(() => {
      initPieChart(channelPieChart, '信访渠道', channelData.pieData)
    })
  }
})

const getPurposeStat = async () => {
  PetitionApi.getStatDetail('purpose', purposeSelectedYear.value)
  .then(res => {
    console.log(res)
    purposeData.lineData = res.lineData
    purposeData.pieData = res.pieData
    
    // 检查当前图表类型并初始化对应的图表
    if (purposeChartType.value === 'line') {
      nextTick(() => {
        initLineChart(purposeLineChart, '信访目的分类', {series: res.lineData})
      })
    } else if (purposeChartType.value === 'pie') {
      nextTick(() => {
        initPieChart(purposePieChart, '信访目的分类', res.pieData)
      })
    }
  })
}

const getContentStat = async () => {
  PetitionApi.getStatDetail('category', contentSelectedYear.value)
  .then(res => {
    console.log(res)
    contentData.lineData = res.lineData
    contentData.pieData = res.pieData
    
    // 检查当前图表类型并初始化对应的图表
    if (contentChartType.value === 'line') {
      nextTick(() => {
        initLineChart(contentLineChart, '信访内容分类', {series: res.lineData})
      })
    } else if (contentChartType.value === 'pie') {
      nextTick(() => {
        initPieChart(contentPieChart, '信访内容分类', res.pieData)
      })
    }
  })
}
const getChannelStat = async () => {
  PetitionApi.getStatDetail('channel', channelSelectedYear.value)
  .then(res => {
    console.log(res)
    channelData.lineData = res.lineData
    channelData.pieData = res.pieData
    
    // 检查当前图表类型并初始化对应的图表
    if (channelChartType.value === 'line') {
      nextTick(() => {
        initLineChart(channelLineChart, '信访渠道', {series: res.lineData})
      })
    } else if (channelChartType.value === 'pie') {
      nextTick(() => {
        initPieChart(channelPieChart, '信访渠道', res.pieData)
      })
    }
  })
}

const getData = async () => {
  PetitionApi.getStatCount(reactive({isMonth: false}))
  .then(res => {
    monthlyStats.value = res
  })
  getPurposeStat()
  getContentStat()
  getChannelStat()
}

onMounted(() => {
  getData();
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