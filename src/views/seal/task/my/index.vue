<template>
  <ContentWrap>
    <el-table
      :data="pagedData"
      style="width: 100%"
      :header-cell-style="{ background: '#fafbfc', color: '#222', fontWeight: 500 }"
      :row-style="{ height: '48px' }"
    >
      <el-table-column prop="id" label="编号" width="90" align="center" />
      <el-table-column prop="auditStatus" label="审核状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.auditStatus === '通过' ? 'success' : 'warning'" size="small">
            {{ scope.row.auditStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sealStatus" label="用印状态" width="120" align="center">
        <template #default="scope">
          <div style="display: flex; align-items: center; justify-content: center;">
            <span 
              :class="scope.row.sealStatusCode === 1 ? 'material-success' : 'material-pending'">
              {{ scope.row.sealStatus }}
            </span>
            <el-checkbox
              :model-value="scope.row.sealStatusCode === 1"
              :disabled="scope.row.auditStatus !== '通过'"
              @change="(val) => handleSealCheck(scope.$index, scope.row, val)"
              style="margin-left: 6px;"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="materialName" label="用印材料名称" min-width="180">
        <template #default="scope">
          <el-link type="primary" @click="goDetail(scope.row.id)" style="cursor:pointer;">
            {{ scope.row.materialName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="经办人" width="110" align="center" />
      <el-table-column prop="applyTime" label="申请时间" width="160" align="center" />
      <el-table-column prop="phone" label="联系电话" width="120" align="center" />
      <el-table-column prop="unit" label="单位" width="120" align="center" />
      <el-table-column label="操作" width="110" align="center">
        <template #default="scope">
          <el-button type="danger" size="mini" @click="deleteRow(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrapper">
      <el-pagination
        background
        layout="total, prev, pager, next, jumper, sizes"
        :total="tableData.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        :page-sizes="[5, 10, 20, 50]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </ContentWrap>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import * as SealApi from '@/api/seal'

const router = useRouter()
const goDetail = (id) => {
  router.push({ name: 'SealDetail', query: { id } })
}

const tableData = ref([
  { id: '001', auditStatus: '通过', sealStatusCode: 1, sealStatus: '已用印', materialName: '合同原件', operator: '张三', applyTime: '2025-07-01 10:00', phone: '13800000001', unit: '行政部' },
  { id: '002', auditStatus: '待审', sealStatusCode: 2, sealStatus: '未用印', materialName: '发票复印件', operator: '李四', applyTime: '2025-07-02 14:30', phone: '13800000002', unit: '财务部' },
  { id: '003', auditStatus: '通过', sealStatusCode: 2, sealStatus: '未用印', materialName: '协议书', operator: '王五', applyTime: '2025-07-03 09:20', phone: '13800000003', unit: '人事部' },
  { id: '004', auditStatus: '待审', sealStatusCode: 2, sealStatus: '未用印', materialName: '会议纪要', operator: '赵六', applyTime: '2025-07-04 16:45', phone: '13800000004', unit: '研发部' },
  { id: '005', auditStatus: '通过', sealStatusCode: 1, sealStatus: '已用印', materialName: '项目合同', operator: '钱七', applyTime: '2025-07-05 11:10', phone: '13800000005', unit: '市场部' },
  { id: '006', auditStatus: '待审', sealStatusCode: 2, sealStatus: '未用印', materialName: '技术协议', operator: '孙八', applyTime: '2025-07-06 13:00', phone: '13800000006', unit: '技术部' },
  { id: '007', auditStatus: '通过', sealStatusCode: 1, sealStatus: '已用印', materialName: '采购合同', operator: '周九', applyTime: '2025-07-07 08:30', phone: '13800000007', unit: '采购部' },
])
const currentPage = ref(1)
const pageSize = ref(5)

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return tableData.value.slice(start, start + pageSize.value)
})

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}
const handleCurrentChange = (val) => {
  currentPage.value = val
}
const deleteRow = (index) => {
  const globalIndex = (currentPage.value - 1) * pageSize.value + index
  tableData.value.splice(globalIndex, 1)
}

// 用印状态勾选逻辑
const handleSealCheck = (index, row, checked) => {
  if (row.auditStatus !== '通过') {
    ElMessage.warning('只有审核通过的申请才能更改用印状态')
    return
  }
  
  // 根据勾选状态确定新的状态码和显示文本
  const newStatusCode = checked ? 1 : 2
  const newStatusText = checked ? '已用印' : '未用印'
  const confirmMessage = checked 
    ? '确认将此申请用印状态设为"已用印"？' 
    : '确认将此申请用印状态设为"未用印"？'
  
  ElMessageBox.confirm(
    confirmMessage,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        // 调用真实API请求，将申请表单id和sealState传给后端
        await SealApi.updateSealState({
          id: row.id,
          sealState: newStatusCode
        })
        
        // 更新成功后更新本地数据
        row.sealStatusCode = newStatusCode
        row.sealStatus = newStatusText
        ElMessage.success(`用印状态已更新为"${newStatusText}"`)
      } catch (error) {
        ElMessage.error('更新用印状态失败，请重试')
        console.error('更新用印状态失败:', error)
      }
    })
    .catch(() => {})
}
</script>

<style scoped>
.pagination-wrapper {
  margin-top: 18px;
  text-align: right;
}
.material-success {
  color: #21ba45;
  font-weight: bold;
}
.material-pending {
  color: #e91e63;
  font-weight: bold;
}
:deep(.el-table th) {
  background: #fafbfc !important;
  color: #222;
  font-weight: 500;
}
:deep(.el-table .el-table__cell) {
  font-size: 14px;
  padding: 8px 0;
}
</style>
