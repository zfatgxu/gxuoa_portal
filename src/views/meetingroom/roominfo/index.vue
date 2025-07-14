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
      <el-form-item label="会议室" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入会议室名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="位置" prop="location">
        <el-input
          v-model="queryParams.location"
          placeholder="请输入位置"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="容纳人数" prop="capacity">
        <el-input
          v-model="queryParams.capacity"
          placeholder="请输入容纳人数"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="管理员" prop="manager">
        <el-input
          v-model="queryParams.manager"
          placeholder="请输入管理员"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="启用状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="启用状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.UNBAN_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开放状态" prop="status">
        <el-select
          v-model="queryParams.open"
          placeholder="开放状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.OPEN_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['meetingroom:room-info:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          @click="handleExport"-->
<!--          :loading="exportLoading"-->
<!--          v-hasPermi="['meetingroom:room-info:export']"-->
<!--        >-->
<!--          <Icon icon="ep:download" class="mr-5px" /> 导出-->
<!--        </el-button>-->
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="会议室ID" align="center" prop="id" />
      <el-table-column label="会议室名称" align="center" prop="name" />
      <el-table-column label="位置" align="center" prop="location" />
      <el-table-column label="容量" align="center" prop="capacity" />
      <el-table-column label="管理员" align="center" prop="manager" />
      <el-table-column
        label="启用状态"
        align="center"
        prop="status"
        :formatter="formatUnbanStatus"
      />
      <el-table-column
        label="开放状态"
        align="center"
        prop="open"
        :formatter="formatOpenStatus"
      />
      <el-table-column label="操作" align="center" width="420px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openEquipmentInfo('编辑', scope.row.id)"
            size="small"
          >
            设备管理
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['meetingroom:room-info:update']"
            size="small"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="openTimeConfig(scope.row.id)"
            v-hasPermi="['meetingroom:room-info:update']"
            size="small"
          >
            时间配置
          </el-button>
          <el-button
            link
            type="primary"
            @click="openOccupationManagement(scope.row)"
            v-hasPermi="['meetingroom:room-info:update']"
            size="small"
          >
            占用管理
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['meetingroom:room-info:delete']"
            size="small"
          >
            删除
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
  <RoomInfoForm ref="formRef" @success="getList" />
  
  <!-- 时间配置弹窗 -->
  <RoomTimeForm ref="timeFormRef" @success="getList" />

  <!-- 占用管理弹窗 -->
  <OccupationManagementDialog
    v-model="occupationDialogVisible"
    :room-info="selectedRoom"
    @success="handleOccupationSuccess"
  />

  <equipmentForm ref="equipmentFormRef" />

</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { RoomInfoApi, RoomInfoVO } from '@/api/meetingroom/roominfo'
import { defineAsyncComponent } from 'vue'
import { ElMessage } from 'element-plus'
const RoomInfoForm = defineAsyncComponent(() => import('./RoomInfoForm.vue'))
const RoomTimeForm = defineAsyncComponent(() => import('./RoomTimeForm.vue'))
const OccupationManagementDialog = defineAsyncComponent(() => import('@/components/MeetingRoom/OccupationManagementDialog.vue'))
const equipmentForm = defineAsyncComponent(() => import('./equipmentInfo.vue'))
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** 会议室信息 列表 */
defineOptions({ name: 'RoomInfo' })

const equipmentFormRef = ref()
/** 打开设备管理 */
const openEquipmentInfo = (type: string, id?: number) => {
  equipmentFormRef.value.open(type, id)
}

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<RoomInfoVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  name: undefined,
  location: undefined,
  capacity: undefined,
  equipment: undefined,
  manager: undefined,
  status: undefined,
  open: undefined,
  createTime: [],
  my: 1,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// 占用管理相关状态
const occupationDialogVisible = ref(false)
const selectedRoom = ref<{ id: number; name: string; location?: string } | null>(null)

const formatUnbanStatus = (row: any) => {
  const map = {
    0: '禁用',
    1: '启用'
  }
  return map[row.status] ?? '未知'
}

const formatOpenStatus = (row: any) => {
  const map = {
    0: '内部使用',
    1: '开放使用'
  }
  return map[row.open] ?? '未知'
}


/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await RoomInfoApi.getRoomInfoPage(queryParams)
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
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 时间配置操作 */
const timeFormRef = ref()
const openTimeForm = (type: string, id: number) => {
  if (timeFormRef.value) {
    timeFormRef.value.open(type, id)
  } else {
    console.error('timeFormRef is not available')
    message.error('时间配置组件未加载完成，请稍后重试')
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await RoomInfoApi.deleteRoomInfo(id)
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
    const data = await RoomInfoApi.exportRoomInfo(queryParams)
    download.excel(data, '会议室信息.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 打开时间配置弹窗 */
const openTimeConfig = (id: number) => {
  openTimeForm('create', id)
}

/** 打开占用管理弹窗 */
const openOccupationManagement = (room: RoomInfoVO) => {
  selectedRoom.value = {
    id: room.id,
    name: room.name,
    location: room.location
  }
  occupationDialogVisible.value = true
}

/** 占用管理成功回调 */
const handleOccupationSuccess = () => {
  ElMessage.success('占用设置成功')
  // 可以在这里刷新列表或执行其他操作
}



/** 初始化 **/
onMounted(() => {
  getList()
})
</script>

<style scoped>
/* 操作按钮样式 */
.el-button + .el-button {
  margin-left: 8px;
}
</style>
