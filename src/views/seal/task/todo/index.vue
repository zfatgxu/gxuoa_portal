<template>
  <ContentWrap>
    <!-- 列表 -->
    <el-table v-loading="loading" :data="filteredList">
      <el-table-column align="center" label="申请编号" prop="applyData.applyId" width="120" />
      <el-table-column align="center" label="申请摘要" prop="applyData.attention" width="120" />
      <el-table-column align="center" label="当前进度" prop="name" width="120" />
      <el-table-column align="center" label="用印状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.applyData.sealState === 1 ? 'success' : scope.row.applyData.sealState === 2 ? 'warning' : 'info'">
            {{ scope.row.applyData.sealState === 1 ? '已用印' : scope.row.applyData.sealState === 2 ? '待用印' : '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="用印材料名" prop="applyData.materialName" width="500" />
      <el-table-column align="center" label="经办人" width="100">
        <template #default="scope">
          {{ scope.row.applyData.signers ? scope.row.applyData.signers.replace(/,/g, '，').split('，')[0] : '' }}
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="申请时间"
        prop="applyData.createTime"
        width="150"
      />
      <el-table-column
        align="center"
        label="申请人"
        prop="processInstance.startUser.nickname"
        width="100"
      />
      <el-table-column align="center" label="联系电话" prop="applyData.phone" width="120" />
      <el-table-column align="center" label="单位" width="150">
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
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
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
  return list.value.filter(item => item.applyData !== null)
})
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  // 修改为数组形式，包含普通印章申请和特殊印章申请两个流程
  processDefinitionKey: 'seal_apply seal_apply_special',
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
