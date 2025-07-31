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
      <!-- <el-form-item label="名称" prop="personId">
        <el-input
          v-model="queryParams.personId"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="来文单位" prop="deptId">
        <el-input
          v-model="queryParams.deptId"
          placeholder="请输入来文单位"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
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
      <!-- <el-form-item label="请假期间前往地点" prop="destination">
        <el-input
          v-model="queryParams.destination"
          placeholder="请输入请假期间前往地点"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="主持工作负责人安排" prop="hostArrangement">
        <el-input
          v-model="queryParams.hostArrangement"
          placeholder="请输入主持工作负责人安排"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="其他补充信息" prop="remark">
        <el-input
          v-model="queryParams.remark"
          placeholder="请输入其他补充信息"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="校领导审批意见" prop="leaderOpinion">
        <el-input
          v-model="queryParams.leaderOpinion"
          placeholder="请输入校领导审批意见"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="工作主持人" prop="hostId">
        <el-input
          v-model="queryParams.hostId"
          placeholder="请输入工作主持人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
       <el-form-item label="流转状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择流转状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.LEAVE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="审核人" prop="personAdmitId">
        <el-input
          v-model="queryParams.personAdmitId"
          placeholder="请输入审核人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="BaseBO 公共字段，创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item> -->
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['leave:register:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <!-- <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['leave:register:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button> -->
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <!-- <el-table-column label="主键，自增" align="center" prop="id" /> -->
      <el-table-column label="名称" align="center" prop="nickName" />
      <el-table-column label="来文单位" align="center" prop="deptName" />
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
      <!-- <el-table-column label="请假期间前往地点" align="center" prop="destination" />
      <el-table-column label="主持工作负责人安排" align="center" prop="hostArrangement" />
      <el-table-column label="其他补充信息" align="center" prop="remark" />
      <el-table-column label="校领导审批意见" align="center" prop="leaderOpinion" />
      <el-table-column label="工作主持人" align="center" prop="hostId" /> -->
      <el-table-column label="流转状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        <!-- <dict-tag :type="DICT_TYPE.LEAVE_STATUS" :value="scope.row.status"/> -->
        </template>
      </el-table-column>
      <!-- <el-table-column label="审核人" align="center" prop="personAdmitId" /> -->
      <!-- <el-table-column
        label="BaseBO 公共字段，创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      /> -->
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <!-- 状态为待会签(1)时显示编辑和删除按钮 -->
          <template v-if="scope.row.status === 1">
            <el-button
              link
              type="primary"
              @click="openForm('create', scope.row.id)"
              v-hasPermi="['leave:register:update']"
            >
              编辑
            </el-button>
<!--            <el-button-->
<!--              link-->
<!--              type="danger"-->
<!--              @click="handleDelete(scope.row.id)"-->
<!--              v-hasPermi="['leave:register:delete']"-->
<!--            >-->
<!--              删除-->
<!--            </el-button>-->
            <el-button
              link
              type="primary"
              @click="handleDetail(scope.row)"
            >
              查看详情
            </el-button>
          </template>
          <!-- 其他状态只显示查看详情按钮 -->
          <template v-else>
            <el-button
              link
              type="primary"
              @click="handleDetail(scope.row)"
            >
              查看详情
            </el-button>
          </template>
          <el-button v-if="hasDone(scope.row.status)" link type="primary" @click="handleFinance(scope.row)">提交财务报销</el-button>
          <el-button 
            v-if="hasAcademicMeeting(scope.row)" 
            link 
            type="primary" 
            @click="handleUploadToResearch(scope.row)"
          >上传科研院</el-button>
          <!-- <el-button v-if="hasPersonal(scope.row)" link type="primary" @click="handleFinance(scope.row)">销假</el-button> -->
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
  <RegisterForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter2 } from '@/utils/formatTime'
import { RegisterVO, RegisterApi } from '@/api/leave/create/createForm'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useRouter } from 'vue-router'
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

/** 获取状态标签类型 */
const getStatusTagType = (status) => {
  switch (parseInt(status)) {
    case 1: return 'warning' // 待会签
    case 4: return 'info'    // 已取消
    case 2: return 'primary' // 待审批
    case 3: return 'success' // 已完成
    case 0: return 'danger'  // 未通过
    default: return ''
  }
}

/** 获取状态标签文本 */
const getStatusLabel = (status) => {
  const dictList = getIntDictOptions(DICT_TYPE.LEAVE_STATUS)
  const dict = dictList.find(item => parseInt(item.value) === parseInt(status))
  return dict ? dict.label : '未知状态'
}

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
const openForm = (path: string, id?: number) => {
  router.push({ path: `/leave/${path}`, query: { id } })
}
/** 查看详情 */
const handleDetail = (row: any) => {
  router.push({
    path: '/bpm/process-instance/detail',
    query: {
      id: row.processInstanceId
    }
  })
}

/** 判断是否完成 */
const hasDone = (status: number): boolean => {
  return status === 3;
};

/** 判断是否包含学术会议 */
const hasAcademicMeeting = (row: any): boolean => {
  if (!row.reasons) return false;
  // 将原因字符串按"、"分割，检查是否包含"学术会议"
  const reasonList = row.reasons.split('、');
  return reasonList.some((reason: string) => reason.includes('学术会议')) && row.status === 3;
};

/** 判断是否包含因私 */
const hasPersonal = (row: any): boolean => {
  if (!row.reasons) return false;
  // 将原因字符串按"、"分割，检查是否包含"因私"
  const reasonList = row.reasons.split('、');
  const daysDiff = Math.ceil((row.endDate - row.startDate) / (1000 * 60 * 60 * 24));
  return reasonList.some((reason: string) => reason.includes('因私')) && row.status === 3 && daysDiff >= 7;
};

/** 上传科研院 */
const handleUploadToResearch = (row: any) => {
  ElMessage.error('上传科研院功能开发中');
};

/** 提交财务报销 */
const handleFinance=(row:any)=>{
  ElMessage.error('功能开发中')
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
