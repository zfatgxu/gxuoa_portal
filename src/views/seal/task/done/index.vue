<template>
  <ContentWrap>
    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column align="center" label="流程" prop="processInstance.name" width="180" />
      <el-table-column label="摘要" prop="processInstance.summary" width="180">
        <template #default="scope">
          <div
            class="flex flex-col"
            v-if="scope.row.processInstance.summary && scope.row.processInstance.summary.length > 0"
          >
            <div v-for="(item, index) in scope.row.processInstance.summary" :key="index">
              <el-text type="info"> {{ item.key }} : {{ item.value }} </el-text>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="发起人"
        prop="processInstance.startUser.nickname"
        width="100"
      />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="发起时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" label="当前任务" prop="name" width="180" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="任务开始时间"
        prop="createTime"
        width="180"
      />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="任务结束时间"
        prop="endTime"
        width="180"
      />
      <el-table-column align="center" label="审批状态" prop="status" width="120">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SEAL_APPLY_STATE" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="审批建议" prop="reason" min-width="180" />
      <el-table-column align="center" label="耗时" prop="durationInMillis" width="160">
        <template #default="scope">
          {{ formatPast2(scope.row.durationInMillis) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="流程编号"
        prop="processInstanceId"
        :show-overflow-tooltip="true"
      />
      <el-table-column align="center" label="任务编号" prop="id" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="操作" fixed="right" width="80">
        <template #default="scope">
          <el-button link type="primary" @click="handleAudit(scope.row)">历史</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div class="flex justify-center items-center h-32">
          <el-empty description="暂无已办任务" />
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
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter, formatPast2 } from '@/utils/formatTime'
import * as TaskApi from '@/api/bpm/task'

defineOptions({ name: 'SealDoneTask' })

const { push } = useRouter() // 路由

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10, // 直接指定用印申请流程的key
  getProcessDefinitionKey: 'seal_apply',
})

/** 查询任务列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TaskApi.getTaskDonePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 处理审批按钮 */
const handleAudit = (row: any) => {
  push({
    name: 'BpmProcessInstanceDetail',
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
