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
          start-placeholder="开始日期"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="date"
          end-placeholder="结束日期"
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
          @click="openForm('create/createForm')"
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
        label="开始日期"
        align="center"
        prop="startDate"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column
        label="结束日期"
        align="center"
        prop="endDate"
        :formatter="dateFormatter2"
        width="180px"
      />
      <!-- <el-table-column label="请假期间前往地点" align="center" prop="destination" />
      <el-table-column label="主持工作负责人安排" align="center" prop="hostArrangement" />
      <el-table-column label="其他补充信息" align="center" prop="remark" />
      <el-table-column label="校领导审批意见" align="center" prop="leaderOpinion" />
      <el-table-column label="工作主持人" align="center" prop="hostId" /> -->
      <el-table-column label="流转状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.LEAVE_STATUS" :value="scope.row.status"/>
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
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <!-- 状态为待审批(2)时显示编辑和删除按钮 -->
          <template v-if="scope.row.status === 2">
            <el-button
              link
              type="primary"
              @click="openForm('create/createForm', scope.row.id)"
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
import download from '@/utils/download'
import { RegisterVO, RegisterApi } from '@/api/leave/create/createForm'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
/** 请假登记 列表 */
defineOptions({ name: 'Register' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

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
const exportLoading = ref(false) // 导出的加载
const currentUser = useUserStore().getUser
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await RegisterApi.getRegisterPage(queryParams)
    list.value = data.list.filter((item: any) => {
      // 检查名称是否与当前登录用户匹配
      const isCurrentUser = item.personId === currentUser.id
      return isCurrentUser
    })

    // 更新总数为过滤后的数量
    total.value = list.value.length
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

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await RegisterApi.deleteRegister(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await RegisterApi.exportRegister(queryParams)
    download.excel(data, '请假登记.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
