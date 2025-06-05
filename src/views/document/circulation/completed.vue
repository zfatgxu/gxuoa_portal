<template>
  <ContentWrap>
    <!-- 文件类型选择 -->
    <div class="mb-4">
      <el-radio-group v-model="queryParams.type" @change="handleTypeChange">
        <el-radio-button :label="1">校内呈文（办结）</el-radio-button>
        <el-radio-button :label="3">学校发文（办结）</el-radio-button>
        <el-radio-button :label="2">校外来文（办结）</el-radio-button>
        <el-radio-button :label="5">请假文件（办结）</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 搜索工作栏 -->
    <el-form
      class="mb-1 flex flex-nowrap items-center"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="5em"
    >
      <el-form-item label="文件名称" prop="documentName" class="!mb-0">
        <el-input
          v-model="queryParams.documentName"
          placeholder="请输入公文标题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="来文单位" prop="deptName" class="!mb-0">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入来文单位"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="联系人" prop="userName" class="!mb-0">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入联系人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="电话" prop="mobile" class="!mb-0">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入电话"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item class="!mb-0 ml-2">
        <el-button type="primary" @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="文件名称" align="center" min-width="180" show-overflow-tooltip>
        <template #default="scope">
          <el-button link type="primary" @click="viewApprovalContent(scope.row)">
            {{ scope.row.documentName }}
          </el-button>
          <el-button link type="primary" @click="viewPresentationContent(scope.row)">
            (文档)
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="流转状态" align="center" min-width="120">
        <template #default="scope">
          <div class="flex items-center justify-center gap-1">
            <el-button link type="info" @click="handleView(scope.row)">
              {{ scope.row.typeName }}
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="来文单位" align="center" prop="deptName" min-width="120" show-overflow-tooltip />
      <el-table-column label="联系人" align="center" prop="userName" />
      <el-table-column label="电话" align="center" prop="mobile" />
      <el-table-column
        label="提交时间"
        align="center"
        prop="startTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-if="scope.row.type === 11"
            link
            type="warning"
            @click="handleCancel(scope.row.id)"
            v-hasPermi="['document:circulation:cancel']"
          >
           撤销办结
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <CirculationForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CirculationApi, CirculationVO } from '@/api/document/circulation'
import CirculationForm from './CirculationForm.vue'
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

/** 公文流转记录表 列表 */
defineOptions({ name: 'DocumentCirculation' })

const loading = ref(true) // 列表的加载中
const list = ref<CirculationVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  documentName: undefined,
  deptName: undefined,
  userName: undefined,
  mobile: undefined,
  startTime: [],
  type: 1, // 默认选中校内呈文
  completed: 0
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CirculationApi.getCirculationPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 切换文件类型 */
const handleTypeChange = () => {
  queryParams.pageNo = 1
  getList()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const router = useRouter()
const formRef = ref()
const openForm = (type: string, id?: number) => {
  //formRef.value.open(type, id)
  router.push(`/document/document/presentation/${id}`)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    if (await ElMessageBox.confirm('确认要删除该公文吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })) {
      // 发起删除
      await CirculationApi.deleteCirculation(id)
      ElMessage.success('删除成功')
      // 刷新列表
      await getList()
    }
  } catch {}
}

// 查看签办内容
const viewApprovalContent = (row: any) => {
  if (!row || !row.id) {
    ElMessage.error('缺少ID')
    return
  }
  window.open(`/document/document/approval/${row.id}?hideLayout=true`, '_blank', 'width=1200,height=800,top=100,left=100,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes')
}

/** 查看流程历史操作 */
const handleView = (row: any) => {
  if (!row || !row.id) {
    console.error('缺少ID')
    return
  }
  // router.push({
  //   name: 'DocumentCirculationHistory',
  //   params: { id: row.id }
  // })
  window.open(`/document/circulation/history/${row.id}?hideLayout=true`, '_blank', 'width=1000,height=700,top=100,left=100,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes')
}

// 查看呈文详细内容
const viewPresentationContent = (row: any) => {
  if (!row || !row.id) {
    ElMessage.error('缺少ID')
    return
  }
  //router.push(`/document/document/presentation-view/${row.id}`)
  window.open(`/document/document/presentation-view/${row.id}?hideLayout=true`, '_blank', 'width=1200,height=800,top=100,left=100,menubar=no,toolbar=no,location=no,status=no')
}

/** 初始化 **/
onMounted(() => {
  queryParams.type = 1 // 默认选中校内呈文
  getList()
})
</script>