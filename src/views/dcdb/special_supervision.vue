<template>
    <div class="supervision-management">
      <!-- 面包屑导航 -->
      <el-breadcrumb separator=">>" class="breadcrumb">
        <el-breadcrumb-item>当前位置: 督查督办</el-breadcrumb-item>
        <el-breadcrumb-item>专项督办</el-breadcrumb-item>
        <!-- <el-breadcrumb-item>上级部门督办</el-breadcrumb-item> -->
      </el-breadcrumb>
  
      <div class="content-wrapper">
        <!-- 操作按钮区域 -->
        <div class="action-bar">
          <div class="action-buttons">
            <el-button type="primary" :icon="Plus">新建</el-button>
            <el-button :icon="Edit">修改</el-button>
            <el-button :icon="Delete" type="danger">删除</el-button>
            <el-button :icon="Download">导出</el-button>
            <el-button :icon="Bell" type="warning">提醒</el-button>
          </div>
          
          <div class="search-area">
            <div class="search-item">
              <span class="search-label">督办内容:</span>
              <el-input v-model="searchForm.content" placeholder="请输入" style="width: 150px;" />
            </div>
            <div class="search-item">
              <span class="search-label">督办编号:</span>
              <el-input v-model="searchForm.number" placeholder="请输入" style="width: 150px;" />
            </div>
            <div class="search-item">
              <span class="search-label">承办单位:</span>
              <el-select v-model="searchForm.unit" placeholder="全部" style="width: 120px;">
                <el-option label="全部" value="all" />
                <el-option label="11部门" value="dept11" />
                <el-option label="12部门" value="dept12" />
              </el-select>
            </div>
            <el-button type="primary">搜索</el-button>
          </div>
        </div>
  
        <!-- 标签页和排序 -->
        <div class="tab-sort-area">
          <el-tabs v-model="activeTab" class="tabs custom-tabs">
            <el-tab-pane label="流程中" name="processing" />
            <el-tab-pane label="结办文件" name="completed" />
            <el-tab-pane label="否决文件" name="rejected" />
          </el-tabs>
          
          <div class="sort-area">
            <div class="sort-item">
              <span>排序字段:</span>
              <el-select v-model="sortField" style="width: 120px;">
                <el-option label="创建时间" value="createTime" />
                <el-option label="完成期限" value="deadline" />
                <el-option label="督办编号" value="number" />
              </el-select>
            </div>
            <div class="sort-item">
              <span>排序方式:</span>
              <el-select v-model="sortOrder" style="width: 100px;">
                <el-option label="倒序" value="desc" />
                <el-option label="正序" value="asc" />
              </el-select>
            </div>
          </div>
        </div>
  
        <!-- 数据表格 -->
        <el-table :data="currentTableData" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="序号" width="80" />
          <el-table-column prop="supervisionNumber" label="督办编号" min-width="120" />
          <el-table-column prop="content" label="督办内容" min-width="150" />
          <el-table-column prop="handlingUnit" label="承办单位" min-width="100" />
          <el-table-column prop="deadline" label="完成期限" min-width="120" />
          <el-table-column prop="registrationDate" label="登记日期" min-width="100" />
          <el-table-column prop="processingUser" label="处理用户" min-width="120" />
          <el-table-column label="操作" width="80" fixed="right">
            <template #default>
              <el-button type="primary" link>详情</el-button>
            </template>
          </el-table-column>
        </el-table>
  
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <div class="pagination-info">
            共 {{ currentTableData.length }} 条记录 第 1 / {{ Math.ceil(currentTableData.length / pageSize) }} 页
          </div>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 50]"
            layout="prev, pager, next, sizes, jumper"
            :total="currentTableData.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
          <div class="pagination-actions">
            <el-button type="primary">确定</el-button>
            <el-button>回到第一页</el-button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed } from 'vue'
  import { Plus, Edit, Delete, Download, Bell } from '@element-plus/icons-vue'
  
  // 搜索表单
  const searchForm = reactive({
    content: '',
    number: '',
    unit: 'all'
  })
  
  // 当前激活的标签页
  const activeTab = ref('processing')
  
  // 排序
  const sortField = ref('createTime')
  const sortOrder = ref('desc')
  
  // 分页
  const currentPage = ref(1)
  const pageSize = ref(20)
  
  // 流程中的数据
  const processingData = ref([
    {
      id: 1,
      supervisionNumber: 'dfbgfb',
      content: '2222',
      handlingUnit: '11部门',
      deadline: '2025-10-8',
      registrationDate: '2025-04',
      processingUser: '11, 22, 33,'
    },
    {
      id: 2,
      supervisionNumber: 'sfgnrnt',
      content: '333',
      handlingUnit: '11部门',
      deadline: '2025-10-8',
      registrationDate: '2025-04',
      processingUser: '44, 55'
    },
    {
      id: 3,
      supervisionNumber: 'mnt',
      content: 'rrrrf',
      handlingUnit: '11部门',
      deadline: '2025-10-8',
      registrationDate: '2025-04',
      processingUser: '22'
    },
    {
      id: 4,
      supervisionNumber: 'dfbgrth',
      content: 'fbgnhn',
      handlingUnit: '11部门',
      deadline: '2025-10-8',
      registrationDate: '2025-04',
      processingUser: '33'
    },
    {
      id: 5,
      supervisionNumber: 'trhsbtn',
      content: 'dvfbgn',
      handlingUnit: '11部门',
      deadline: '2025-10-8',
      registrationDate: '2025-04',
      processingUser: '44'
    }
  ])
  
  // 结办文件数据
  const completedData = ref([
    {
      id: 1,
      supervisionNumber: 'WC001',
      content: '年度工作总结报告',
      handlingUnit: '办公室',
      deadline: '2024-12-31',
      registrationDate: '2024-12',
      processingUser: '张三'
    },
    {
      id: 2,
      supervisionNumber: 'WC002',
      content: '财务审计报告',
      handlingUnit: '财务部',
      deadline: '2024-11-30',
      registrationDate: '2024-11',
      processingUser: '李四'
    },
    {
      id: 3,
      supervisionNumber: 'WC003',
      content: '项目验收报告',
      handlingUnit: '技术部',
      deadline: '2024-10-15',
      registrationDate: '2024-10',
      processingUser: '王五'
    }
  ])
  
  // 否决文件数据
  const rejectedData = ref([
    {
      id: 1,
      supervisionNumber: 'RJ001',
      content: '不合规申请材料',
      handlingUnit: '审批科',
      deadline: '2024-09-20',
      registrationDate: '2024-09',
      processingUser: '赵六'
    },
    {
      id: 2,
      supervisionNumber: 'RJ002',
      content: '资质不符要求',
      handlingUnit: '人事部',
      deadline: '2024-08-10',
      registrationDate: '2024-08',
      processingUser: '孙七'
    }
  ])
  
  // 根据当前标签页显示对应数据
  const currentTableData = computed(() => {
    switch (activeTab.value) {
      case 'processing':
        return processingData.value
      case 'completed':
        return completedData.value
      case 'rejected':
        return rejectedData.value
      default:
        return processingData.value
    }
  })
  
  // 选中的行
  const selectedRows = ref([])
  
  // 处理选择变化
  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
  }
  
  // 处理页面大小变化
  const handleSizeChange = (size) => {
    pageSize.value = size
  }
  
  // 处理当前页变化
  const handleCurrentChange = (page) => {
    currentPage.value = page
  }
  </script>
  
  <style scoped>
  .supervision-management {
    padding: 20px;
    background-color: #f5f5f5;
    min-height: 100vh;
  }
  
  .breadcrumb {
    margin-bottom: 20px;
    color: #999;
  }
  
  .content-wrapper {
    background: white;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .action-buttons {
    display: flex;
    gap: 8px;
  }
  
  .search-area {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .search-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .search-label {
    white-space: nowrap;
    color: #666;
  }
  
  .tab-sort-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #e4e7ed;
  }
  
  .tabs {
    flex: 1;
  }
  
  .sort-area {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  
  .sort-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .pagination-info {
    color: #666;
    font-size: 14px;
  }
  
  .pagination-actions {
    display: flex;
    gap: 10px;
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  
  :deep(.el-tabs__active-bar) {
    background-color: #409eff;
  }
  
  :deep(.el-tabs__item.is-active) {
    color: #409eff;
  }
  
  /* 自定义标签页样式 - 加大加粗字体 */
  :deep(.custom-tabs .el-tabs__item) {
    font-size: 16px !important;
    font-weight: bold !important;
    padding: 0 20px !important;
    height: 50px !important;
    line-height: 50px !important;
  }
  
  :deep(.custom-tabs .el-tabs__nav) {
    height: 50px !important;
  }
  
  :deep(.custom-tabs .el-tabs__active-bar) {
    height: 3px !important;
  }
  
  :deep(.el-table) {
    width: 100% !important;
  }
  
  :deep(.el-table__body-wrapper) {
    width: 100% !important;
  }
  
  :deep(.el-table th) {
    background-color: #fafafa;
  }
  
  @media (max-width: 768px) {
    .action-bar {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-area {
      justify-content: center;
    }
    
    .tab-sort-area {
      flex-direction: column;
      align-items: stretch;
      gap: 15px;
    }
    
    .sort-area {
      justify-content: center;
    }
    
    .pagination-wrapper {
      flex-direction: column;
      align-items: center;
    }
  
    :deep(.custom-tabs .el-tabs__item) {
      font-size: 14px !important;
      padding: 0 15px !important;
    }
  }
  </style>