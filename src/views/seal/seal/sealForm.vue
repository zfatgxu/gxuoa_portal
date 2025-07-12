<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="印章编号" prop="sealId">
        <el-input v-model="formData.sealId" placeholder="请输入印章编号" />
      </el-form-item>
      <el-form-item label="印章名称" prop="sealName">
        <el-input v-model="formData.sealName" placeholder="请输入印章名称" />
      </el-form-item>
      <el-form-item label="所属单位" prop="orgName">
        <el-input v-model="formData.orgName" placeholder="请输入所属单位" />
      </el-form-item>
      <el-form-item label="所属单位ID" prop="orgId">
        <el-input v-model="formData.orgId" placeholder="请输入所属单位ID" />
      </el-form-item>
      <el-form-item label="上传人名称" prop="createName">
        <el-input v-model="formData.createName" placeholder="请输入上传人名称" />
      </el-form-item>
      <el-form-item label="启用表示： 1=启用，0=停用" prop="enableFlag">
        <el-radio-group v-model="formData.enableFlag">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { sealApi, sealVO } from '@/api/seal/seal'

/** 印章 表单 */
defineOptions({ name: 'sealForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  sealId: undefined,
  sealName: undefined,
  orgName: undefined,
  orgId: undefined,
  createName: undefined,
  enableFlag: undefined,
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
      formData.value = await sealApi.getseal(id)
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
    const data = formData.value as unknown as sealVO
    if (formType.value === 'create') {
      await sealApi.createseal(data)
      message.success(t('common.createSuccess'))
    } else {
      await sealApi.updateseal(data)
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
    sealId: undefined,
    sealName: undefined,
    orgName: undefined,
    orgId: undefined,
    createName: undefined,
    enableFlag: undefined,
  }
  formRef.value?.resetFields()
}
</script>