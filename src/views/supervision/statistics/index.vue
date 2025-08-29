<template>
  <div class="statistics-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span>当前位置：督办管理 >> 统计汇总</span>
    </div>
    
    <!-- 顶部操作区 -->
    <div class="header-section">
      <!-- 高级筛选按钮 -->
      <div class="senior-filter-btn" @click="seniorFilterVisible = true">
        <div class="w-10 h-10 rounded-md mr-2 flex items-center justify-center" style="background-color: #409EFF">
          <el-icon size="20"><Funnel color="white"/></el-icon>
        </div>
        <div class="text-gray-500 flex flex-col">
          <span class="text-base font-bold text-gray-700">高级筛选</span>
          <span class="text-sm text-gray-500">已选择 <span class="text-blue-500 font-bold">{{ activeFilters.selectedFiltersCount }}</span> 个筛选条件</span>
        </div>
      </div>
      
      <!-- 导出按钮 -->
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
                <div class="card-value">{{ statistics.total }}</div>
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
                <div class="card-value">{{ statistics.inProgress }}</div>
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
                <div class="card-title">已结束</div>
                <div class="card-value">{{ statistics.completed }}</div>
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
                <div class="card-value">{{ statistics.overdue }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-section">
      <el-row :gutter="20">
        <!-- 督办类型分类 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <div class="chart-header">
              <div class="chart-title">
                <el-icon v-if="typeChartType === 'line'"><ChartSpline /></el-icon>
                <el-icon v-if="typeChartType === 'pie'"><ChartPie /></el-icon>
                <el-icon v-if="typeChartType === 'table'"><Table /></el-icon>
                督办类型分类
              </div>
              <div class="chart-tabs">
                <el-radio-group v-model="typeChartType" size="small">
                  <el-radio-button label="line">折线图</el-radio-button>
                  <el-radio-button label="pie">饼状图</el-radio-button>
                  <el-radio-button label="table">数据表</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="chart-content">
              <!-- 折线图 -->
              <div v-show="typeChartType === 'line'" class="chart-container">
                <div ref="typeLineChart" class="echarts-container"></div>
              </div>
              <!-- 饼状图 -->
              <div v-show="typeChartType === 'pie'" class="chart-container">
                <div ref="typePieChart" class="echarts-container"></div>
              </div>
              <!-- 数据表 -->
              <div v-show="typeChartType === 'table'" class="table-container">
                <el-table :data="typeTableData" border style="width: 100%">
                  <el-table-column prop="type" label="类型" />
                  <el-table-column prop="count" label="数量" />
                  <el-table-column prop="percentage" label="占比" />
                </el-table>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 督办分类统计 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <div class="chart-header">
              <div class="chart-title-with-filters">
                <div class="chart-title">
                  <el-icon v-if="categoryChartType === 'line'"><ChartSpline /></el-icon>
                  <el-icon v-if="categoryChartType === 'pie'"><ChartPie /></el-icon>
                  <el-icon v-if="categoryChartType === 'table'"><Table /></el-icon>
                  督办分类统计
                </div>
                <!-- 图表筛选区域移动到标题旁边 -->
                <div class="chart-filters-inline">
                  <el-select v-model="supervisionType" placeholder="督办类型" clearable size="small" style="width: 120px; margin-right: 8px" @change="onSupervisionTypeChange">
                    <el-option label="工作督办" :value="1" />
                    <el-option label="专项督查" :value="2" />
                  </el-select>
                  <el-select v-model="supervisionCategories" placeholder="督办分类" multiple clearable size="small" style="width: 150px" @change="processChartData">
                    <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </div>
              <div class="chart-tabs">
                <el-radio-group v-model="categoryChartType" size="small">
                  <el-radio-button label="line">折线图</el-radio-button>
                  <el-radio-button label="pie">饼状图</el-radio-button>
                  <el-radio-button label="table">数据表</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="chart-content">
              <!-- 折线图 -->
              <div v-show="categoryChartType === 'line'" class="chart-container">
                <div ref="categoryLineChart" class="echarts-container"></div>
              </div>
              <!-- 饼状图 -->
              <div v-show="categoryChartType === 'pie'" class="chart-container">
                <div ref="categoryPieChart" class="echarts-container"></div>
              </div>
              <!-- 数据表 -->
              <div v-show="categoryChartType === 'table'" class="table-container">
                <el-table :data="categoryTableData" border style="width: 100%">
                  <el-table-column prop="category" label="分类" />
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
            <el-table-column prop="supervisionCode" align="center" label="督办编号"/>
            <el-table-column prop="priority" align="center" label="优先级" width="100">
              <template #default="scope">
                <el-tag :type="getPriorityType(scope.row.priority)" size="default" round>
                  {{ scope.row.priority }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" align="center" label="类型">
              <template #default="scope">
                <el-tag type="primary" size="default" effect="plain" round>
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="supervisionItem" align="center" label="督办事项" show-overflow-tooltip>
              <template #default="scope">
                <span style="font-size: 12px;">{{ scope.row.supervisionItem }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="supervisor" align="center" label="督办人" />
            <el-table-column prop="leadDept" align="center" label="牵头单位" />
            <el-table-column prop="status" align="center" label="当前状态">
              <template #default="scope">
                <el-tag :style="getStatusStyle(scope.row.status)" size="default" effect="plain" round>
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startDate" align="center" label="开始日期" />
            <el-table-column label="操作" align="center" fixed="right">
              <template #default="scope">
                <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <Pagination
            :total="pagination.total"
            :page="pagination.page"
            :limit="pagination.limit"
            @pagination="handlePagination"
          />
        </div>
      </el-card>
    </div>
    
    <!-- 高级筛选弹框 -->
    <SeniorFilter
      v-model="seniorFilterVisible"
      @apply="handleSeniorFilterApply"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { CalendarRange, Timer, CircleCheck, Bell, Funnel, ChartSpline, ChartPie, Table, List } from 'lucide-vue-next'
import { Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import SeniorFilter from '../components/seniorFilter.vue'
import { SupervisionIndexApi, OrderApi, MonthlyDataItem } from '@/api/supervision'
import { useRouter } from 'vue-router'

const router = useRouter()

// 图表类型
const typeChartType = ref('line')
const categoryChartType = ref('line')

// 图表引用
const typeLineChart = ref()
const typePieChart = ref()
const categoryLineChart = ref()
const categoryPieChart = ref()

// 监听督办类型变化
const onSupervisionTypeChange = async () => {
  if (supervisionType.value) {
    // 根据督办类型从统计数据中获取对应的分类选项
    const categoryData = monthlyData.value.filter(item =>
      item.categoryType === 'category' &&
      item.type === supervisionType.value &&
      item.categoryName !== '其他' &&
      item.categoryName !== '未分类'
    )

    // 获取唯一的分类名称
    const uniqueCategories = [...new Set(categoryData.map(item => item.categoryName))]
    categoryOptions.value = uniqueCategories.map(name => ({
      label: name,
      value: name
    }))

    console.log('督办分类选项更新:', categoryOptions.value)
  } else {
    categoryOptions.value = []
  }

  // 清空已选择的分类
  supervisionCategories.value = []

  // 重新处理图表数据
  processChartData()
}

// 筛选条件
const supervisionType = ref<number | null>(null)
const supervisionCategories = ref<string[]>([])
const categoryOptions = ref<any[]>([])

// 统计数据
const statistics = ref({
  total: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0
})

// 原始月度数据
const monthlyData = ref<MonthlyDataItem[]>([])

// 处理后的图表数据
const typeChartData = ref<any>({
  lineData: { series: [] },
  pieData: [],
  tableData: []
})

const categoryChartData = ref<any>({
  lineData: { series: [] },
  pieData: [],
  tableData: []
})

// 计算属性：表格数据
const typeTableData = computed(() => typeChartData.value.tableData)
const categoryTableData = computed(() => categoryChartData.value.tableData)

const detailTableData = ref([])

// 分页
const pagination = ref({
  total: 0,
  page: 1,
  limit: 10
})

// 高级筛选
const seniorFilterVisible = ref(false)
const activeFilters = ref({
  selectedFiltersCount: 0
})

// 初始化折线图
const initLineChart = (chartRef: any, title: string, data: any) => {
  const chartDom = chartRef.value
  if (!chartDom) return

  let myChart = echarts.getInstanceByDom(chartDom)
  if (!myChart) {
    myChart = echarts.init(chartDom)
  }

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: data.series.map((item: any) => item.name),
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
      data: data.months || ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value'
    },
    series: data.series
  }

  myChart.setOption(option, true) // 第二个参数true表示不合并，完全替换

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 初始化饼图
const initPieChart = (chartRef: any, title: string, data: any) => {
  const chartDom = chartRef.value
  if (!chartDom) return

  let myChart = echarts.getInstanceByDom(chartDom)
  if (!myChart) {
    myChart = echarts.init(chartDom)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: data.map((item: any) => item.name)
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

  myChart.setOption(option, true) // 第二个参数true表示不合并，完全替换

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 加载统计数据
const loadStatisticsData = async () => {
  try {
    // 1. 获取统计数据
    const statisticsResponse = await SupervisionIndexApi.getStatistics()
    console.log('统计数据响应:', statisticsResponse)
    
    // 更新统计卡片数据
    statistics.value = {
      total: statisticsResponse.workSupervision + statisticsResponse.specialSupervision,
      inProgress: statisticsResponse.ongoingCount,
      completed: statisticsResponse.completedCount,
      overdue: statisticsResponse.overtimeCount
    }
    
    // 保存原始月度数据
    monthlyData.value = statisticsResponse.monthlyData || []
    
    // 处理图表数据
    processChartData()
    
    // 2. 获取详细列表数据（不受图表筛选影响）
    const params: any = {
      pageNo: pagination.value.page,
      pageSize: pagination.value.limit
    }

    const listResponse = await SupervisionIndexApi.getIndexData(params)
    
    // 更新详细表格数据
    const data = listResponse.list || []
    detailTableData.value = data.map((item: any, index: number) => {
      const formatOrderDate = (dateValue: number | string | null | undefined): string => {
        if (!dateValue) return ''
        try {
          const date = new Date(dateValue)
          if (isNaN(date.getTime())) return ''
          return date.toISOString().split('T')[0]
        } catch {
          return ''
        }
      }

      // 解析牵头部门名称
      const parseLeadDepts = (leadDeptNameMap: Record<string, string> | null | undefined): string => {
        if (!leadDeptNameMap) return '未设置'
        const deptNames = Object.values(leadDeptNameMap)
        return deptNames.join('、') || '未设置'
      }

      return {
        id: index + 1,
        supervisionCode: item.orderCode || '',
        priority: getPriorityText(item.priority),
        type: getTypeText(item.type),
        supervisionItem: item.orderTitle || '',
        supervisor: item.supervisorName || '未设置',
        leadDept: parseLeadDepts(item.leadDeptNameMap),
        status: item.supervisionStatus || 1,
        startDate: formatOrderDate(item.createTime),
        processInstanceId: item.processInstanceId, // 添加流程实例ID用于跳转
        taskId: item.taskId // 添加任务ID用于跳转
      }
    })
    
    pagination.value.total = listResponse.total || 0
    
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 处理图表数据
const processChartData = () => {
  if (!monthlyData.value.length) return
  
  // 分离督办类型和督办分类数据
  const typeData = monthlyData.value.filter(item => item.categoryType === 'type')
  const categoryData = monthlyData.value.filter(item => item.categoryType === 'category')
  
  // 处理督办类型图表数据
  processTypeChartData(typeData)
  
  // 处理督办分类图表数据
  processCategoryChartData(categoryData)
}

// 处理督办类型图表数据
const processTypeChartData = (data: MonthlyDataItem[]) => {
  // 过滤掉"其他"和"未分类"的数据
  const filteredData = data.filter(item => 
    item.categoryName !== '其他' && 
    item.categoryName !== '未分类'
  )
  
  // 获取所有月份
  const months = [...new Set(filteredData.map(item => item.month))].sort((a, b) => a - b)
  const monthLabels = months.map(m => `${m}月`)
  
  // 获取所有类型
  const types = [...new Set(filteredData.map(item => item.categoryName))]
  
  // 生成折线图数据
  const series = types.map((type, index) => {
    const typeData = filteredData.filter(item => item.categoryName === type)
    const monthData = months.map(month => {
      const item = typeData.find(d => d.month === month)
      return item ? item.count : 0
    })
    
    return {
      name: type,
      type: 'line',
      data: monthData,
      smooth: true,
      lineStyle: { color: getChartColor(index) }
    }
  })
  
  // 生成饼图数据
  const pieData = types.map(type => {
    const total = filteredData.filter(item => item.categoryName === type)
      .reduce((sum, item) => sum + item.count, 0)
    return { value: total, name: type }
  })
  
  // 生成表格数据
  const total = pieData.reduce((sum, item) => sum + item.value, 0)
  const tableData = pieData.map(item => ({
    type: item.name,
    count: item.value,
    percentage: total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '0%'
  }))
  
  typeChartData.value = {
    lineData: { series, months: monthLabels },
    pieData,
    tableData
  }
}

// 处理督办分类图表数据
const processCategoryChartData = (data: MonthlyDataItem[]) => {
  // 过滤掉"其他"和"未分类"的数据
  let filteredData = data.filter(item =>
    item.categoryName !== '其他' &&
    item.categoryName !== '未分类'
  )

  // 根据督办类型筛选（第一个下拉框）
  if (supervisionType.value) {
    filteredData = filteredData.filter(item => item.type === supervisionType.value)
  }

  // 根据督办分类筛选（第二个下拉框）
  if (supervisionCategories.value.length > 0) {
    filteredData = filteredData.filter(item =>
      supervisionCategories.value.includes(item.categoryName)
    )
  }

  // 获取所有月份
  const months = [...new Set(filteredData.map(item => item.month))].sort((a, b) => a - b)
  const monthLabels = months.map(m => `${m}月`)

  // 获取所有分类
  const categories = [...new Set(filteredData.map(item => item.categoryName))]

  // 生成折线图数据
  const series = categories.map((category, index) => {
    const categoryData = filteredData.filter(item => item.categoryName === category)
    const monthData = months.map(month => {
      const item = categoryData.find(d => d.month === month)
      return item ? item.count : 0
    })

    return {
      name: category,
      type: 'line',
      data: monthData,
      smooth: true,
      lineStyle: { color: getChartColor(index) }
    }
  })

  // 生成饼图数据
  const pieData = categories.map(category => {
    const total = filteredData.filter(item => item.categoryName === category)
      .reduce((sum, item) => sum + item.count, 0)
    return { value: total, name: category }
  })

  // 生成表格数据
  const total = pieData.reduce((sum, item) => sum + item.value, 0)
  const tableData = pieData.map(item => ({
    category: item.name,
    count: item.value,
    percentage: total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '0%'
  }))

  categoryChartData.value = {
    lineData: { series, months: monthLabels },
    pieData,
    tableData
  }

  // 强制重新渲染图表
  nextTick(() => {
    if (categoryChartType.value === 'line' && series.length > 0) {
      initLineChart(categoryLineChart, '督办分类统计', { series, months: monthLabels })
    } else if (categoryChartType.value === 'pie' && pieData.length > 0) {
      initPieChart(categoryPieChart, '督办分类统计', pieData)
    }
  })
}

// 获取图表颜色
const getChartColor = (index: number): string => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#C71585']
  return colors[index % colors.length]
}

// 处理分页
const handlePagination = (paginationData: any) => {
  pagination.value.page = paginationData.page
  pagination.value.limit = paginationData.limit
  loadStatisticsData()
}

// 处理高级筛选应用
const handleSeniorFilterApply = (filters: any) => {
  activeFilters.value = {
    selectedFiltersCount: filters.selectedFiltersCount || 0
  }
  // 这里可以根据筛选条件重新加载数据
  loadStatisticsData()
  ElMessage.success('筛选条件已应用')
}

// 获取优先级文本 - 修复映射关系
const getPriorityText = (priority: number) => {
  switch (priority) {
    case 1: return '一般优先'
    case 2: return '中优先级'
    case 3: return '高优先级'
    default: return '一般优先'
  }
}

// 获取类型文本
const getTypeText = (type: number) => {
  switch (type) {
    case 1: return '工作督办'
    case 2: return '专项督查'
    default: return '工作督办'
  }
}

// 督办人和牵头单位字段说明：
// supervisor: 督办人字段，直接使用API返回值
// leadDept: 牵头单位字段，直接使用API返回值
// 如需要根据ID获取名称，需要调用相关接口进行转换

// 获取优先级标签类型
const getPriorityType = (priority: string) => {
  switch (priority) {
    case '高优先级': return 'danger'
    case '中优先级': return 'warning'
    case '一般优先': return 'info'
    default: return 'info'
  }
}

// 获取状态标签类型
const getStatusType = (status: number) => {
  switch (status) {
    case 1: return '' // 进行中 - 使用自定义颜色
    case 2: return 'danger' // 已超时
    case 3: return 'success' // 已结束
    default: return ''
  }
}

// 获取状态文本 - 确认映射关系
const getStatusText = (status: number) => {
  switch (status) {
    case 1: return '进行中'
    case 2: return '已超时'
    case 3: return '已结束'
    default: return '进行中'
  }
}

// 获取状态样式
const getStatusStyle = (status: number) => {
  switch (status) {
    case 1: // 进行中
      return {
        backgroundColor: 'rgb(129, 179, 55)',
        color: 'white',
        border: 'none'
      }
    case 2: // 已超时
      return {
        backgroundColor: 'rgb(179, 55, 55)',
        color: 'white',
        border: 'none'
      }
    case 3: // 已结束
      return {
        backgroundColor: 'rgb(154, 154, 154)',
        color: 'white',
        border: 'none'
      }
    default:
      return {
        backgroundColor: 'rgb(129, 179, 55)',
        color: 'white',
        border: 'none'
      }
  }
}

// 查看详情
const viewDetail = (row: any) => {
  // 如果有流程实例ID，跳转到督办工作流详情页面
  if (row.processInstanceId) {
    // 构建URL，如果有taskId则添加taskId参数
    let url = `/supervision/workflow/detail/${row.processInstanceId}`
    if (row.taskId) {
      url += `?taskId=${row.taskId}`
    }
    router.push(url)
  } else {
    // 如果没有流程实例ID，跳转到督办详情页面
    router.push(`/supervision/detail/${row.supervisionCode}`)
  }
}

// 导出功能
const exportPDF = () => {
  ElMessage.info('导出PDF功能开发中')
}

const exportExcel = () => {
  ElMessage.info('导出Excel功能开发中')
}

const exportImage = () => {
  ElMessage.info('导出图片功能开发中')
}

// 监听图表类型变化
watch(typeChartType, (newVal) => {
  if (newVal === 'line') {
    nextTick(() => {
      if (typeChartData.value.lineData.series.length > 0) {
        initLineChart(typeLineChart, '督办类型分类', typeChartData.value.lineData)
      }
    })
  } else if (newVal === 'pie') {
    nextTick(() => {
      if (typeChartData.value.pieData.length > 0) {
        initPieChart(typePieChart, '督办类型分类', typeChartData.value.pieData)
      }
    })
  }
})

watch(categoryChartType, (newVal) => {
  if (newVal === 'line') {
    nextTick(() => {
      if (categoryChartData.value.lineData.series.length > 0) {
        initLineChart(categoryLineChart, '督办分类统计', categoryChartData.value.lineData)
      }
    })
  } else if (newVal === 'pie') {
    nextTick(() => {
      if (categoryChartData.value.pieData.length > 0) {
        initPieChart(categoryPieChart, '督办分类统计', categoryChartData.value.pieData)
      }
    })
  }
})

// 监听图表数据变化，自动更新图表
watch(() => typeChartData.value, () => {
  nextTick(() => {
    if (typeChartType.value === 'line' && typeChartData.value.lineData.series.length > 0) {
      initLineChart(typeLineChart, '督办类型分类', typeChartData.value.lineData)
    } else if (typeChartType.value === 'pie' && typeChartData.value.pieData.length > 0) {
      initPieChart(typePieChart, '督办类型分类', typeChartData.value.pieData)
    }
  })
}, { deep: true })

watch(() => categoryChartData.value, () => {
  nextTick(() => {
    if (categoryChartType.value === 'line' && categoryChartData.value.lineData.series.length > 0) {
      initLineChart(categoryLineChart, '督办分类统计', categoryChartData.value.lineData)
    } else if (categoryChartType.value === 'pie' && categoryChartData.value.pieData.length > 0) {
      initPieChart(categoryPieChart, '督办分类统计', categoryChartData.value.pieData)
    }
  })
}, { deep: true })

onMounted(() => {
  // 初始化数据
  loadStatisticsData()
})
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
  flex-wrap: wrap;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  border: 1px solid #e4e7ed;
  padding: 10px;
  padding-left: 30px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.user-info:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.chart-filters {
  display: flex;
  align-items: center;
  gap: 10px;
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

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  min-height: 550px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .chart-filters {
    flex-direction: column;
    width: 100%;
  }
  
  .chart-filters .el-select {
    width: 100% !important;
    margin-right: 0 !important;
    margin-bottom: 10px;
  }
  
  .export-buttons {
    justify-content: center;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 10px;
  }
}

/* 图表切换按钮样式 */
.chart-tabs .el-radio-group {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 2px;
}

.chart-tabs .el-radio-button__inner {
  border: none;
  background-color: transparent;
  color: #606266;
  font-size: 12px;
  padding: 8px 12px;
}

.chart-tabs .el-radio-button__original-radio:checked + .el-radio-button__inner {
  background-color: #409EFF;
  color: #fff;
  border-radius: 2px;
}

/* 表格样式优化 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 600;
}

.el-table td {
  padding: 12px 0;
}

/* 标签样式 */
.el-tag {
  font-weight: 500;
}

/* 分页样式 */
.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 卡片阴影效果 */
.el-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 8px;
}

.el-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

/* 统计卡片特殊样式 */
.stat-cards .el-card {
  transition: all 0.3s;
}

.stat-cards .el-card:hover {
  transform: translateY(-2px);
}

/* 筛选区域样式 */
.chart-filters .el-select {
  border-radius: 6px;
}

.chart-filters .el-select .el-input__inner {
  border-radius: 6px;
}

/* 标题与筛选器组合布局 */
.chart-title-with-filters {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.chart-filters-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-filters-inline .el-select {
  border-radius: 4px;
}

/* 导出按钮样式 */
.export-buttons .el-button {
  border-radius: 6px;
  font-weight: 500;
}

/* 高级筛选按钮样式 */
.senior-filter-btn {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #374151;
  min-width: 180px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.senior-filter-btn:hover {
  background-color: #f9fafb;
  border-color: #409EFF;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

/* 高级筛选按钮所需的CSS类 */
.w-10 {
  width: 2.5rem;
}

.h-10 {
  height: 2.5rem;
}

.rounded-md {
  border-radius: 0.375rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.flex-col {
  flex-direction: column;
}

.text-gray-500 {
  color: #6b7280;
}

.font-bold {
  font-weight: 700;
}

.text-gray-700 {
  color: #374151;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
