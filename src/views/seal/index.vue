<template>
  <!-- 顶部筛选表单和发起按钮 -->
  <ContentWrap>
    <el-form :inline="true" :model="queryParams" @submit.prevent>
      <el-form-item label="材料名称">
        <el-input v-model="queryParams.materialName" placeholder="请输入材料名称" clearable style="width: 220px" />
      </el-form-item>
      <el-form-item label="材料类型">
        <el-select v-model="queryParams.materialType" clearable placeholder="请选择材料类型" style="width: 280px">
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.SEAL_APPLY_MATERIAL_TYPES)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审批状态">
        <el-select v-model="queryParams.status" clearable placeholder="请选择审批状态" style="width: 200px">
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.SEAL_APPLY_STATE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-form-item>
        <el-button plain type="primary" @click="handleCreate">
          <Icon class="mr-5px" icon="ep:plus" />
          发起印章申请
        </el-button>
        <!-- 选择单位弹窗 -->
        <el-dialog v-model="dialogVisible" title="请选择申请单位" width="400px">
          <el-form>
            <el-form-item label="单位">
              <el-select v-model="selectedUnit" placeholder="请选择单位" filterable style="width: 300px">
                <el-option v-for="unit in unitList" :key="unit.id" :label="unit.name" :value="unit.id" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" :disabled="!selectedUnit" @click="handleUnitConfirm">确定</el-button>
          </template>
        </el-dialog>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column align="center" label="盖章编码" prop="sealNumber" />
      <!-- 材料名称超链接（与详情按钮跳转一致） -->
      <el-table-column align="center" label="材料名称">
        <template #default="scope">
          <el-link type="primary" underline @click="handleMaterialClick(scope.row)">
            {{ scope.row.materialName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="经办人">
        <template #default="scope">
          {{ getFirstSigner(scope.row.signers) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="审批状态" prop="status">
        <template #default="scope">
            <span :class="getApprovalStatusClass(scope.row.status)">
              {{ getApprovalStatusText(scope.row.status) }}
            </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="用印状态" min-width="120">
        <template #default="scope">
            <span
              :class="scope.row.sealState === 1 ? 'seal-status-used' : 'seal-status-pending'">
              {{ scope.row.sealState === 1 ? '已用印' : '待用印' }}
            </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="材料类型" >
        <template #default="scope">
          {{ getDictLabel(DICT_TYPE.SEAL_APPLY_MATERIAL_TYPES, scope.row.materialType) }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="联系方式" prop="phone" />
      <el-table-column align="center" label="操作" width="160">
        <template #default="scope">
          <el-button size="mini" @click="viewDetail(scope.row)">详情</el-button>
          <el-button
            v-if="showEditButton(scope.row)"
            size="mini"
            type="primary"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container" style="display: flex; justify-content: flex-end; margin-top: 16px;">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DICT_TYPE } from '@/utils/dict'
import { getSimpleDeptList } from '@/api/system/dept'
import * as SealApi from '@/api/seal'
import { useUserStore } from '@/store/modules/user'
import { getDictLabel, getDictOptions } from '@/utils/dict'
import { ElMessage } from 'element-plus'


const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const list = ref([]) // 数据列表
const total = ref(0) // 总条数
const queryParams = ref({
  materialName: '',
  materialType: '',
  status: '',
  pageNo: 1,
  pageSize: 10
})
// 单位选择弹窗相关
const dialogVisible = ref(false)
const selectedUnit = ref('')
const unitList = ref([])

const fetchUnitList = async () => {
  const res = await getSimpleDeptList()
  // 兼容返回结构
  unitList.value = Array.isArray(res) ? res : (res.data || [])
}

const sealLabel = (val: string) => {
  const map = {
    seal1: '中共广西大学委员会',
    seal2: '广西大学（红印）',
    seal3: '广西大学（黑印）',
    seal4: '广西大学校长办公室（红印）'
  }
  return map[val] || val
}

// 查询、重置、发起、详情等方法
const handleQuery = () => {
  getSealApplicationPage(queryParams.value)
}
const resetQuery = () => {
  queryParams.value = {
    materialName: '',
    materialType: '',
    status: '',
    pageNo: 1,
    pageSize: queryParams.value.pageSize
  }
  handleQuery()
}
const handleCreate = () => {
  // 直接跳转到用印申请创建页面
  router.push({
    name: 'SealCreate',
    query: {}
  })
}

const handleUnitConfirm = () => {
  dialogVisible.value = false
  // 跳转并携带单位参数（单位ID）
  const selectedUnitObj = unitList.value.find(u => u.id === selectedUnit.value)
  router.push({
    name: 'SealCreate',
    query: {
      unit: selectedUnit.value,
      unitName: selectedUnitObj ? selectedUnitObj.name : ''
    }
  })
}

//获取印章申请分页
const getSealApplicationPage = async (data: any) => {
  loading.value = true
  try {
    const res = await SealApi.getSealApplicationPage(data)
    list.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取印章申请列表失败', error)
  } finally {
    loading.value = false
  }
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  queryParams.value.pageSize = val
  queryParams.value.pageNo = 1
  handleQuery()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  queryParams.value.pageNo = val
  handleQuery()
}

const viewDetail = (row: any) => {
  router.push({ name: 'SealDetail', query: { id: row.processInstanceId } })
}

// 判断是否显示编辑按钮
const showEditButton = (row: any) => {
  // 当前任务节点是"单位负责人"时显示编辑按钮
  return row.currentTaskName === '单位负责人'
}

// 处理编辑操作
const handleEdit = (row: any) => {
  // 跳转到创建页面，传递id参数（参考请假模块实现）
  router.push({
    name: 'SealCreate',
    query: { id: row.id }
  })
}

// 材料名称超链接点击事件（与详情按钮跳转一致）
const handleMaterialClick = (row: any) => {
  router.push({
    name: 'SealDetail',
    query: { id: row.processInstanceId }
  })
}

// 获取第一个经办人姓名
const getFirstSigner = (signers: string) => {
  if (!signers) return ''
  const signerArray = signers.split('，')
  return signerArray[0] || ''
}

// 获取审批状态样式类
const getApprovalStatusClass = (status: number) => {
  switch (status) {
    case 1: // 审批中
      return 'approval-status-running'
    case 2: // 审批通过
      return 'approval-status-approved'
    case 3: // 审批不通过
      return 'approval-status-rejected'
    case 4: // 已取消
      return 'approval-status-cancelled'
    case 5: // 已驳回
      return 'approval-status-rejected-back'
    default:
      return ''
  }
}

// 获取审批状态文本
const getApprovalStatusText = (status: number) => {
  switch (status) {
    case 1:
      return '审批中'
    case 2:
      return '审批通过'
    case 3:
      return '审批不通过'
    case 4:
      return '已取消'
    case 5:
      return '已驳回'
    default:
      return '未知状态'
  }
}

// 处理用印状态变更
const handleSealStateChange = (row: any, checked: boolean) => {
  if (row.status !== 2) {
    ElMessage.warning('只有审核通过的申请才能更改用印状态')
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
          id: row.id,
          sealState: newSealState
        })

        // 更新成功后更新本地数据
        row.sealState = newSealState
        ElMessage.success(`用印状态已更新为"${stateText}"`)
      } catch (error) {
        ElMessage.error('更新用印状态失败，请重试')
        console.error('更新用印状态失败:', error)
      }
    })
    .catch(() => {})
}

onMounted(() => {
  getSealApplicationPage(queryParams.value)
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

/* 审批状态样式 */
.approval-status-running {
  color: #e6a23c;
  background-color: #fdf6ec;
  border: 1px solid #f5dab1;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  display: inline-block;
}

.approval-status-approved {
  color: #67c23a;
  background-color: #f0f9ff;
  border: 1px solid #b3d8b3;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  display: inline-block;
}

.approval-status-rejected {
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  display: inline-block;
}

.approval-status-cancelled {
  color: #909399;
  background-color: #f4f4f5;
  border: 1px solid #d3d3d3;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  display: inline-block;
}

.approval-status-rejected-back {
  color: #e74c3c;
  background-color: #fdf2f2;
  border: 1px solid #f5b7b1;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  display: inline-block;
}
</style>
