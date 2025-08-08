<template>
  <!-- 顶部筛选表单 -->
  <ContentWrap>
    <el-form :inline="true" :model="queryParams" @submit.prevent>
      <el-form-item label="盖章编码">
        <el-input v-model="queryParams.sealNumber" placeholder="请输入盖章编码" clearable style="width: 220px" />
      </el-form-item>
      <el-form-item label="材料名称">
        <el-input v-model="queryParams.materialName" placeholder="请输入材料名称" clearable style="width: 220px" />
      </el-form-item>
      <el-form-item>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="filteredList">
      <el-table-column align="center" label="盖章编码" prop="applyData.sealNumber" min-width="140" />
      <el-table-column align="center" label="当前进度" prop="name" min-width="120" />
      <el-table-column align="center" label="材料名称" prop="applyData.materialName" min-width="200" show-overflow-tooltip />
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
      <el-table-column align="center" label="单位" min-width="150" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.applyData.applyTitle ? scope.row.applyData.applyTitle.split('印章申请单')[0] : '' }}
        </template>
      </el-table-column>
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

    <!-- 分页组件 -->
    <div class="pagination-container" style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
      <div class="search-result-info">
        <span v-if="queryParams.sealNumber || queryParams.materialName" style="color: #909399; font-size: 14px;">
          搜索结果：{{ filteredList.length }} 条记录
        </span>
      </div>
      <el-pagination
        v-model:current-page="queryParams.pageNo"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as TaskApi from '@/api/bpm/task'
import * as SealApi from "@/api/seal";

defineOptions({ name: 'SealTodoTask' })

const { push } = useRouter() // 路由

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const filteredList = computed(() => {
  let filtered = list.value.filter(item => item.applyData !== null)

  // 根据搜索条件进一步过滤
  if (queryParams.sealNumber) {
    filtered = filtered.filter(item =>
      item.applyData.sealNumber &&
      item.applyData.sealNumber.includes(queryParams.sealNumber)
    )
  }

  if (queryParams.materialName) {
    filtered = filtered.filter(item =>
      item.applyData.materialName &&
      item.applyData.materialName.includes(queryParams.materialName)
    )
  }

  return filtered
})

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  // 修改为数组形式，包含普通印章申请和特殊印章申请两个流程
  processDefinitionKey: 'seal_apply seal_apply_special',
  sealNumber: '',
  materialName: ''
})

/** 查询任务列表 */
const getList = async () => {
  loading.value = true
  try {
    //const data = await TaskApi.getTaskTodoPage(queryParams)
    const  data = await  SealApi.getSealTodoPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 重置按钮 */
const resetQuery = () => {
  queryParams.sealNumber = ''
  queryParams.materialName = ''
}

/** 处理分页大小变化 */
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  queryParams.pageNo = 1
  getList()
}

/** 处理页码变化 */
const handleCurrentChange = (val: number) => {
  queryParams.pageNo = val
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

/** 初始化 **/
onMounted(async () => {
  await getList()
})
</script>
