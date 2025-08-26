<template>
  <!-- 搜索筛选表单 -->
  <ContentWrap>
    <el-form :inline="true" :model="queryParams" @submit.prevent>
      <el-form-item label="盖章编码">
        <el-input
          v-model="queryParams.sealNumber"
          placeholder="请输入盖章编码"
          clearable
          style="width: 220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="材料名称" min-width="230">
        <el-input
          v-model="queryParams.materialName"
          placeholder="请输入材料名称"
          clearable
          style="width: 220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column align="center" label="盖章编码" prop="applyData.sealNumber" min-width="140" />
      <!-- 材料名称超链接（新增13字截断逻辑，对齐参考代码） -->
      <el-table-column align="center" label="材料名称" width="230" show-overflow-tooltip>
        <template #default="scope">
          <div class="material-name-container">
            <el-link
              type="primary"
              underline
              @click="handleMaterialClick(scope.row)"
            >
              {{ formatMaterialName(scope.row.applyData.materialName) }}
            </el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="经办人" min-width="100">
        <template #default="scope">
          {{ scope.row.applyData.signers ? scope.row.applyData.signers.replace(/,/g, '，').split('，')[0] : '' }}
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="申请时间"
        prop="applyData.createTime"
        min-width="150"
      />
      <el-table-column
        align="center"
        label="申请人"
        prop="processInstance.startUser.nickname"
        min-width="100"
      />
      <el-table-column align="center" label="联系电话" prop="applyData.phone" min-width="130" />
      <el-table-column align="center" label="用印单位" min-width="90" show-overflow-tooltip prop="processInstance.startUser.deptName"/>
      <el-table-column align="center" label="操作" fixed="right" width="80">
        <template #default="scope">
          <el-button link type="primary" @click="handleAudit(scope.row)">办理</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div class="flex justify-center items-center h-32">
          <el-empty description="暂无待办任务" />
        </div>
      </template>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="handlePagination"
    />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as TaskApi from '@/api/bpm/task'
import * as SealApi from "@/api/seal";
import { useRouter } from 'vue-router'
import { onMounted, ref, reactive } from 'vue'

defineOptions({ name: 'SealTodoTask' })

const { push } = useRouter() // 路由

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据


const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  // 修改为数组形式，包含普通印章申请和特殊印章申请两个流程
  processDefinitionKey: 'seal_apply seal_apply_special',
  sealNumber: '', // 盖章编码搜索
  materialName: '', // 材料名称搜索
})

/** 查询任务列表 */
const getList = async () => {
  loading.value = true
  try {
    //const data = await TaskApi.getTaskTodoPage(queryParams)
    const data = await SealApi.getSealTodoPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 查询按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1 // 重置到第一页
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.sealNumber = ''
  queryParams.materialName = ''
  queryParams.pageNo = 1
  getList()
}

/** 分页处理 */
const handlePagination = () => {
  getList()
}

/** 处理审批按钮 */
const handleAudit = (row: any) => {
  push({
    name: 'SealDetail',
    query: {
      id: row.processInstance.id,
      taskId: row.id
    }
  })
}

/** 处理材料名称点击（超链接） */
const handleMaterialClick = (row: any) => {
  // 点击材料名称与点击办理按钮效果相同，跳转到详情页
  push({
    name: 'SealDetail',
    query: {
      id: row.processInstance.id,
      taskId: row.id
    }
  })
}

/** 新增：材料名称13字截断处理（完全对齐参考代码逻辑） */
const formatMaterialName = (name: string) => {
  if (!name || typeof name !== 'string') return '' // 空值/非字符串安全处理，避免报错
  const maxLength = 13 // 限制最大显示13个字
  // 超过长度截取前13字+省略号，否则显示原文本
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name
}

/** 初始化 **/
onMounted(async () => {
  await getList()
})
</script>

<style scoped>
/* 替换原有样式，采用参考代码的截断样式逻辑，确保生效 */
/* 表格固定布局：避免列宽自适应破坏截断效果 */
.el-table {
  table-layout: fixed !important;
}

/* 材料名称容器：核心截断样式 */
.material-name-container {
  width: 100% !important;
  white-space: nowrap !important; /* 禁止文本换行 */
  overflow: hidden !important; /* 隐藏溢出内容 */
  text-overflow: ellipsis !important; /* 溢出显示省略号 */
  display: block !important;
  box-sizing: border-box !important;
}

/* 强制el-link继承容器样式：避免行内元素干扰截断逻辑 */
.material-name-container .el-link {
  display: inline-block !important;
  width: 100% !important;
  white-space: inherit !important;
  overflow: inherit !important;
  text-overflow: inherit !important;
}
</style>
