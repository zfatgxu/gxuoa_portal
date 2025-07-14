<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="会议室名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入会议室名称" />
      </el-form-item>
      <el-form-item label="位置" prop="location">
        <el-input v-model="formData.location" placeholder="请输入位置" />
      </el-form-item>
      <el-form-item label="容量" prop="capacity">
        <el-input
          v-model="formData.capacity"
          type="number"
          placeholder="请输入容量(单位:人)"
          @input="handleNumberInput"
        />
      </el-form-item>
      <el-form-item label="管理员" prop="manager">
        <el-input v-model="formData.manager" placeholder="请输入管理员" />
      </el-form-item>
      <el-form-item label="启用状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择启用状态" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.UNBAN_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开放状态" prop="open">
        <el-select v-model="formData.open" placeholder="请选择开放状态" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.OPEN_STATUS)"
            :key="dict.value"
            :label="dict.label"
      :value="dict.value"
    />
  </el-select>
</el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { RoomInfoApi, RoomInfoVO } from '@/api/meetingroom/roominfo'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** 会议室信息 表单 */
defineOptions({ name: 'RoomInfoForm' })
function handleNumberInput(value) {
  // 如果输入的是非法数字，比如前导0，或含字母等，清理
  const numeric = value.replace(/[^0-9]/g, '')
  if (numeric !== value) {
    formData.capacity = Number(numeric)
  }
}
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  location: undefined,
  capacity: undefined,
  equipment: undefined,
  manager: undefined,
  status: undefined,
  open: undefined,
})
const formRules = reactive({
  name: [
    { required: true, message: '会议室名称不能为空', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择启用状态', trigger: 'change' }
  ],
  open: [
    { required: true, message: '请选择开放状态', trigger: 'change' }
  ]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await RoomInfoApi.getRoomInfo(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as RoomInfoVO
    if (formType.value === 'create') {
      await RoomInfoApi.createRoomInfo(data)
      message.success(t('common.createSuccess'))
    } else {
      await RoomInfoApi.updateRoomInfo(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    location: undefined,
    capacity: undefined,
    equipment: undefined,
    manager: undefined,
    status: undefined,
    open: undefined,
  }
  formRef.value?.resetFields()
}
</script>
