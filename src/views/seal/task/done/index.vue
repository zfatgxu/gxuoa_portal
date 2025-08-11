<template>


  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column align="center" label="盖章编码" prop="applyData.sealNumber" min-width="140" />
      <el-table-column align="center" label="用印状态" min-width="120">
        <template #default="scope">
          <div style="display: flex; align-items: center; justify-content: center;">
            <span
              :class="scope.row.applyData.sealState === 1 ? 'seal-status-used' : 'seal-status-pending'">
              {{ scope.row.applyData.sealState === 1 ? '已用印' : '待用印' }}
            </span>
            <el-checkbox
              :model-value="scope.row.applyData.sealState === 1"
              :disabled="scope.row.applyData.sealState == 1 || !canOperateSealState(scope.row) || !isSealNumberApproved(scope.row)"
              @change="(val) => handleSealStateChange(scope.row, val)"
              style="margin-left: 6px;"
            />
          </div>
        </template>
      </el-table-column>

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
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="完成时间"
        prop="endTime"
        min-width="150"
      />
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
      @pagination="handlePagination"
    />
  </ContentWrap>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter, formatPast2 } from '@/utils/formatTime'
import * as TaskApi from '@/api/bpm/task'
import * as SealApi from '@/api/seal/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'SealDoneTask' })

const { push } = useRouter() // 路由
const userStore = useUserStore() // 用户信息

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据



const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  category: '用印申请',
  processDefinitionKey: 'seal_apply seal_apply_special',
})

/** 查询任务列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SealApi.getSealDonePage(queryParams)
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



/** 分页处理 */
const handlePagination = () => {
  getList() // 重新请求数据
}

/** 检查盖章编码是否为审核通过状态（A开头） */
const isSealNumberApproved = (row: any) => {
  const sealNumber = row.applyData?.sealNumber
  if (!sealNumber || typeof sealNumber !== 'string') {
    return false
  }
  // A开头表示审核通过，B开头表示审核中或已拒绝
  return sealNumber.startsWith('A')
}

/** 检查当前用户是否有权限操作用印状态 */
const canOperateSealState = (row: any) => {
  // 获取当前登录用户ID
  const currentUserId = userStore.getUser.id

  // 检查是否有部门审核人列表
  if (!row.applyData?.deptAuditors || !Array.isArray(row.applyData.deptAuditors)) {
    return false
  }

  // 检查当前用户是否在部门审核人列表中
  return row.applyData.deptAuditors.some((auditor: any) => auditor.auditor === currentUserId)
}

/** 处理用印状态变更 */
const handleSealStateChange = async (row: any, checked: boolean) => {
  // 检查盖章编码状态
  if (!isSealNumberApproved(row)) {
    ElMessage.warning('只有审核通过的申请（盖章编码A开头）才能操作用印状态')
    return
  }

  // 检查权限
  if (!canOperateSealState(row)) {
    ElMessage.warning('您没有权限操作此申请的用印状态，只有部门用印审核人才能操作')
    return
  }

  // 根据勾选状态确定新的状态码
  const newSealState = checked ? 1 : 2
  const stateText = checked ? '已用印' : '未用印'

  ElMessageBox.confirm(
    `确认将此申请用印状态设为"${stateText}"？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        // 调用API更新用印状态，传递申请表单id和sealState
        await SealApi.updateSealState({
          id: row.applyData.id,
          sealState: newSealState
        })

        // 更新成功后更新本地数据
        row.applyData.sealState = newSealState
        ElMessage.success(`用印状态已更新为"${stateText}"`)
      } catch (error) {
        ElMessage.error('更新用印状态失败，请重试')
        console.error('更新用印状态失败:', error)
      }
    })
    .catch(() => {})
}

/** 初始化 **/
onMounted(async () => {
  await getList()
})
</script>

<style scoped>
.seal-status-used {
  color: #f39c12;
  font-weight: bold;
}

.seal-status-pending {
  color: #409eff;
  font-weight: bold;
}
</style>
