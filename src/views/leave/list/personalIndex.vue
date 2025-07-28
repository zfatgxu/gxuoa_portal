<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="开始时间" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="date"
          placeholder="请选择开始日期"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="date"
          placeholder="请选择结束日期"
          class="!w-220px"
        />
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <!-- <el-table-column label="主键，自增" align="center" prop="id" /> -->
      <el-table-column label="名称" align="center" prop="nickName" />
      <el-table-column label="单位" align="center" prop="deptName" />
      <el-table-column
        label="开始时间"
        align="center"
        prop="startDate"
        :formatter="dateFormatter2"
      />
      <el-table-column
        label="结束时间"
        align="center"
        prop="endDate"
        :formatter="dateFormatter2"
      />

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="handleFinance(scope.row)">销假</el-button>
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

</template>

<script setup lang="ts">
import { dateFormatter2 } from '@/utils/formatTime'
import { RegisterVO, RegisterApi } from '@/api/leave/create/createForm'
/** 请假登记 列表 */
defineOptions({ name: 'Register' })

const loading = ref(true) // 列表的加载中
const list = ref<RegisterVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  personId: undefined,
  deptId: undefined,
  startDate: undefined,
  endDate: undefined,
  destination: undefined,
  hostArrangement: undefined,
  remark: undefined,
  leaderOpinion: undefined,
  hostId: undefined,
  status: undefined,
  personAdmitId: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await RegisterApi.getRegisterPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 提交财务报销 */
const handleFinance=(row:any)=>{
  ElMessage.error('功能开发中')
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
