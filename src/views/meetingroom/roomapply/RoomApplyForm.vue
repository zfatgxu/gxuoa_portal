<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="会议室名称" prop="conferenceRoom">
        <el-input v-model="formData.conferenceRoom" placeholder="请输入会议室名称" />
      </el-form-item>
      <el-form-item label="申请单位" prop="department">
        <el-input v-model="formData.department" placeholder="请输入申请单位" />
      </el-form-item>
      <el-form-item label="申请人" prop="applicant">
        <el-input v-model="formData.applicant" placeholder="请输入申请人" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号码" />
      </el-form-item>
      <el-form-item label="活动主题" prop="activityTheme">
        <el-input v-model="formData.activityTheme" placeholder="请输入活动主题" />
      </el-form-item>
      <el-form-item label="横幅内容" prop="banner">
        <el-input v-model="formData.banner" placeholder="请输入横幅内容" />
      </el-form-item>
      <el-form-item label="布台时间" prop="setupTime">
        <el-date-picker
          v-model="formData.setupTime"
          type="date"
          value-format="x"
          placeholder="选择布台时间"
        />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="date"
          value-format="x"
          placeholder="选择开始时间"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          type="date"
          value-format="x"
          placeholder="选择结束时间"
        />
      </el-form-item>
      <el-form-item label="参加人员及人数" prop="participants">
        <el-input v-model="formData.participants" placeholder="请输入参加人员及人数" />
      </el-form-item>
      <el-form-item label="使用事由及要求" prop="purpose">
        <el-input v-model="formData.purpose" placeholder="请输入使用事由及要求" />
      </el-form-item>
      <el-form-item label="使用单位意见" prop="departmentOpinion">
        <el-input v-model="formData.departmentOpinion" placeholder="请输入使用单位意见" />
      </el-form-item>
      <el-form-item label="部门负责人" prop="departmentHead">
        <el-input v-model="formData.departmentHead" placeholder="请输入部门负责人" />
      </el-form-item>
      <el-form-item label="部门审批时间" prop="departmentApprovalDate">
        <el-date-picker
          v-model="formData.departmentApprovalDate"
          type="datetime"
          value-format="x"
          placeholder="选择部门审批时间"
          :clearable="true"
          :editable="false"
          :disabled-date="(time) => time > new Date()"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="管理单位意见" prop="adminOpinion">
        <el-input v-model="formData.adminOpinion" placeholder="请输入管理单位意见" />
      </el-form-item>
      <el-form-item label="管理员" prop="adminPerson">
        <el-input v-model="formData.adminPerson" placeholder="请输入管理员" />
      </el-form-item>
      <el-form-item label="管理员审批时间" prop="adminApprovalDate">
        <el-date-picker
          v-model="formData.adminApprovalDate"
          type="datetime"
          value-format="x"
          placeholder="选择管理员审批时间"
          :clearable="true"
          :editable="false"
          :disabled-date="(time) => time > new Date()"
          style="width: 100%"
        />
      </el-form-item>
<!--      <el-form-item label="审核状态" prop="status">-->
<!--        <el-select v-model="formData.status" placeholder="请选择审核状态" style="width: 100%">-->
<!--          <el-option-->
<!--            v-for="item in statusOptions"-->
<!--            :key="item.value"-->
<!--            :label="item.label"-->
<!--            :value="item.value"-->
<!--          />-->
<!--        </el-select>-->
<!--      </el-form-item>-->
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="formData.status"
          placeholder="审核状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.APPLY_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { RoomApplyApi, RoomApplyVO } from '@/api/meetingroom/roomapply'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** 会议室申请 表单 */
defineOptions({ name: 'RoomApplyForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  conferenceRoom: undefined,
  department: undefined,
  applicant: undefined,
  phone: undefined,
  activityTheme: undefined,
  banner: undefined,
  setupTime: undefined,
  startTime: undefined,
  endTime: undefined,
  participants: undefined,
  purpose: undefined,
  departmentOpinion: undefined,
  departmentHead: undefined,
  departmentApprovalDate: undefined,
  adminOpinion: undefined,
  adminPerson: undefined,
  adminApprovalDate: undefined,
  status: undefined,
  remark: undefined,
})
const formRules = reactive({
  conferenceRoom: [{ required: true, message: '会议室名称不能为空', trigger: 'blur' }],
  department: [{ required: true, message: '申请单位不能为空', trigger: 'blur' }],
  applicant: [{ required: true, message: '申请人不能为空', trigger: 'blur' }],
  phone: [{ required: true, message: '手机号码不能为空', trigger: 'blur' }],
  activityTheme: [{ required: true, message: '活动主题不能为空', trigger: 'blur' }],
  setupTime: [{ required: true, message: '布台时间不能为空', trigger: 'blur' }],
  startTime: [{ required: true, message: '开始时间不能为空', trigger: 'blur' }],
  endTime: [{ required: true, message: '结束时间不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '审核状态：0-待审核 1-已通过 2-已拒绝不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

// 审核状态选项
const statusOptions = [
  { value: '0', label: '待审核' },
  { value: '1', label: '已通过' },
  { value: '2', label: '已拒绝' }
] as const

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  
  if (!id) {
    resetForm()
    return
  }
  
  // 修改时，设置数据
  formLoading.value = true
  try {
    // 确保 ID 存在且有效
    if (!id) {
      console.error('无效的 ID:', id)
      message.error('无效的申请 ID')
      return
    }
    
    console.log('开始获取申请详情，ID:', id, '类型:', typeof id)
    
    // 检查 RoomApplyApi 是否存在
    // if (!RoomApplyApi || typeof RoomApplyApi.getRoomApply !== 'function') {
      // console.error('RoomApplyApi.getRoomApply 不是一个函数', RoomApplyApi)
      // message.error('API 调用失败：接口未定义')
      // return
    // }
    
    // 打印 API 方法
    console.log('RoomApplyApi.getRoomApply:', RoomApplyApi.getRoomApply.toString())
    
    // 调用 API
    const res = await RoomApplyApi.getRoomApply(id)
    console.log('API 响应:', res)
    
    if (res ) {
      const data = res
      console.log('处理前数据:', JSON.parse(JSON.stringify(data))) // 深拷贝避免响应式影响
      
      // 确保所有字段都有值，避免 undefined 错误
      const formValue = {
        id: data.id,
        conferenceRoom: data.conferenceRoom || '',
        department: data.department || '',
        applicant: data.applicant || '',
        phone: data.phone || '',
        activityTheme: data.activityTheme || '',
        banner: data.banner || '',
        setupTime: data.setupTime ? Number(data.setupTime) : undefined,
        startTime: data.startTime ? Number(data.startTime) : undefined,
        endTime: data.endTime ? Number(data.endTime) : undefined,
        participants: data.participants || '',
        purpose: data.purpose || '',
        departmentOpinion: data.departmentOpinion || '',
        departmentHead: data.departmentHead || '',
        departmentApprovalDate: data.departmentApprovalDate ? Number(data.departmentApprovalDate) : undefined,
        adminOpinion: data.adminOpinion || '',
        adminPerson: data.adminPerson || '',
        adminApprovalDate: data.adminApprovalDate ? Number(data.adminApprovalDate) : undefined,
        status: data.status,
        remark: data.remark || ''
      }
      
      console.log('处理后表单数据:', formValue)
      // 使用 Object.assign 确保触发响应式更新
      Object.assign(formData.value, formValue)
      console.log('当前表单数据:', formData.value)
    }
  } catch (error) {
    console.error('获取申请详情失败:', error)
    message.error('获取申请详情失败')
  } finally {
    formLoading.value = false
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
    const data = formData.value as unknown as RoomApplyVO
    if (formType.value === 'create') {
      await RoomApplyApi.createRoomApply(data)
      message.success(t('common.createSuccess'))
    } else {
      await RoomApplyApi.updateRoomApply(data)
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
    conferenceRoom: undefined,
    department: undefined,
    applicant: undefined,
    phone: undefined,
    activityTheme: undefined,
    banner: undefined,
    setupTime: undefined,
    startTime: undefined,
    endTime: undefined,
    participants: undefined,
    purpose: undefined,
    departmentOpinion: undefined,
    departmentHead: undefined,
    departmentApprovalDate: undefined,
    adminOpinion: undefined,
    adminPerson: undefined,
    adminApprovalDate: undefined,
    status: undefined,
    remark: undefined,
  }
  formRef.value?.resetFields()
}
</script>

<script lang="ts">
export default {
  name: 'RoomApplyForm'
}
</script>
