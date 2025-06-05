<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="公文id" prop="documentId">
        <el-input v-model="formData.documentId" placeholder="请输入公文id" />
      </el-form-item>
      <el-form-item label="处理类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择处理类型">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="签办人id" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入签办人id" />
      </el-form-item>
      <el-form-item label="签办信息" prop="message">
        <el-input v-model="formData.message" placeholder="请输入签办信息" />
      </el-form-item>
      <el-form-item label="签办单位id" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入签办单位id" />
      </el-form-item>
      <el-form-item label="流转模板" prop="templateId">
        <el-input v-model="formData.templateId" placeholder="请输入流转模板" />
      </el-form-item>
      <el-form-item label="是否显示流转信息(0-是、1-否)" prop="isShow">
        <el-radio-group v-model="formData.isShow">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否短信通知(0-是、1-否)" prop="isSms">
        <el-radio-group v-model="formData.isSms">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否完成(标识本次流转步骤是否完成0-是、1-否)" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="打开时间(记录第一次领办的时间)" prop="openTime">
        <el-date-picker
          v-model="formData.openTime"
          type="date"
          value-format="x"
          placeholder="选择打开时间(记录第一次领办的时间)"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from '@/hooks/web/useMessage'
import { CirculationApi, CirculationVO } from '@/api/document/circulation'

/** 公文流转记录表 表单 */
defineOptions({ name: 'CirculationForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  documentId: undefined,
  type: undefined,
  userId: undefined,
  message: undefined,
  deptId: undefined,
  templateId: undefined,
  isShow: undefined,
  isSms: undefined,
  status: undefined,
  openTime: undefined,
})
const formRules = reactive({
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
      formData.value = await CirculationApi.getCirculation(id)
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
    const data = formData.value as unknown as CirculationVO
    if (formType.value === 'create') {
      await CirculationApi.createCirculation(data)
      message.success(t('common.createSuccess'))
    } else {
      await CirculationApi.updateCirculation(data)
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
    documentId: undefined,
    type: undefined,
    userId: undefined,
    message: undefined,
    deptId: undefined,
    templateId: undefined,
    isShow: undefined,
    isSms: undefined,
    status: undefined,
    openTime: undefined,
  }
  formRef.value?.resetFields()
}
</script>