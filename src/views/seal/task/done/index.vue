<template>
  <!-- 顶部筛选表单 -->
  <ContentWrap>
    <el-form :inline="true" :model="queryParams" @submit.prevent>
      <el-form-item label="材料名称">
        <el-input v-model="queryParams.materialName" placeholder="请输入材料名称" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="盖章编码">
        <el-input v-model="queryParams.sealNumber" placeholder="请输入盖章编码" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="用印状态">
        <el-select v-model="queryParams.sealState" clearable placeholder="请选择用印状态" style="width: 200px">
          <el-option label="已用印" :value="1" />
          <el-option label="待用印" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="pagedList">
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
              :disabled="scope.row.applyData.sealState == 1"
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
      :total="filteredList.length"
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

defineOptions({ name: 'SealDoneTask' })

const { push } = useRouter() // 路由

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
// 过滤后的完整列表
const filteredList = computed(() => {
  let result = list.value.filter(item => item.applyData !== null)

  // 材料名称搜索过滤
  if (queryParams.materialName) {
    const materialName = queryParams.materialName.toLowerCase()
    result = result.filter(item => {
      const itemMaterialName = item.applyData?.materialName?.toLowerCase() || ''
      return itemMaterialName.includes(materialName)
    })
  }

  // 盖章编码搜索过滤
  if (queryParams.sealNumber) {
    const sealNumber = queryParams.sealNumber.toLowerCase()
    result = result.filter(item => {
      const itemSealNumber = item.applyData?.sealNumber?.toLowerCase() || ''
      return itemSealNumber.includes(sealNumber)
    })
  }

  // 用印状态过滤
  if (queryParams.sealState !== undefined && queryParams.sealState !== null) {
    result = result.filter(item => item.applyData?.sealState === queryParams.sealState)
  }

  return result
})

// 当前页显示的数据
const pagedList = computed(() => {
  const start = (queryParams.pageNo - 1) * queryParams.pageSize
  const end = start + queryParams.pageSize
  return filteredList.value.slice(start, end)
})
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  category: '用印申请',
  processDefinitionKey: 'seal_apply seal_apply_special',
  materialName: '', // 材料名称搜索
  sealNumber: '', // 盖章编码搜索
  sealState: undefined, // 用印状态筛选
})

/** 查询任务列表 */
const getList = async () => {
  loading.value = true
  try {
    // 只传递分页和基础查询参数，不传递搜索和筛选参数
    const baseParams = {
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize,
      category: queryParams.category,
      processDefinitionKey: queryParams.processDefinitionKey,
    }
    const data = await SealApi.getSealDonePage(baseParams)
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

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.materialName = ''
  queryParams.sealNumber = ''
  queryParams.sealState = undefined
  queryParams.pageNo = 1 // 重置到第一页
  // 前端过滤，不需要重新请求接口
}

/** 分页处理 */
const handlePagination = () => {
  // 前端分页，不需要重新请求接口
  // pagedList 会自动根据 queryParams.pageNo 和 queryParams.pageSize 的变化重新计算
}

/** 处理用印状态变更 */
const handleSealStateChange = async (row: any, checked: boolean) => {
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
