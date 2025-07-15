<template>
  <div class="basic-info">
    <div class="header">
      <span class="title">基本信息</span>
      <el-button type="primary" size="small" @click="openEditDialog" class="edit-btn">修改</el-button>
    </div>
    <div class="info-content">
      <div class="info-table">
        <div class="info-row">
          <div class="info-cell label">受理编号：</div>
          <div class="info-cell value">{{ props.info.acceptanceNo }}</div>
          <div class="info-cell label">登记时间：</div>
          <div class="info-cell value">{{ props.info.registrationTime ? formatToDateTime(props.info.registrationTime) : '' }}</div>
          <div class="info-cell label">信访方式：</div>
          <div class="info-cell value">{{ props.info.petitionType }}</div>
        </div>

        <div class="info-row">
          <div class="info-cell label">业务编号：</div>
          <div class="info-cell value">{{ props.info.businessNo }}</div>
          <div class="info-cell label">受理部门：</div>
          <div class="info-cell value">{{ props.info.registrationOrg }}</div>
          <div class="info-cell label">限办截止：</div>
          <div class="info-cell value">{{ props.info.deadline ? formatToDateTime(props.info.deadline) : '' }}</div>
        </div>

        <div class="info-row">
          <div class="info-cell label">信访日期：</div>
          <div class="info-cell value">{{ props.info.petitionDate ? formatToDateTime(props.info.petitionDate) : '' }}</div>
          <div class="info-cell label">信访原因：</div>
          <div class="info-cell value">{{ props.info.petitionReason }}</div>
          <div class="info-cell label">是否逸期：</div>
          <div class="info-cell value">
            <el-tag size="small" :type="props.info.isOverdue ? 'danger' : 'success'">
              {{ props.info.isOverdue ? '是' : '否' }}
            </el-tag>
          </div>
        </div>

        <div class="info-row">
          <div class="info-cell label">处理状态：</div>
          <div class="info-cell value">
            <dict-tag :type="DICT_TYPE.PETITION_PROCESS_STATUS" :value="props.info.processStatus" />
          </div>
          <div class="info-cell label">内容分类：</div>
          <div class="info-cell value">{{ props.info.contentCategory }}</div>
          <div class="info-cell label"></div>
          <div class="info-cell value"></div>
        </div>
      </div>

    </div>
  </div>

  <!-- 编辑弹窗 -->
  <el-dialog v-model="dialogVisible" title="编辑基本信息" width="60%">
    <el-form :model="editForm" label-width="100px" :rules="rules" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="受理编号" prop="acceptanceNo">
            <el-input v-model="editForm.acceptanceNo" placeholder="请输入受理编号" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="登记时间" prop="registrationTime">
            <el-date-picker v-model="editForm.registrationTime" type="datetime" placeholder="请选择登记时间" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="信访方式" prop="petitionType">
            <el-input v-model="editForm.petitionType" placeholder="请输入信访方式" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="业务编号" prop="businessNo">
            <el-input v-model="editForm.businessNo" placeholder="请输入业务编号" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="受理部门" prop="registrationOrg">
            <el-input v-model="editForm.registrationOrg" placeholder="请输入受理部门" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="限办截止" prop="deadline">
            <el-date-picker v-model="editForm.deadline" type="datetime" placeholder="请选择限办截止时间" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="查询码" prop="queryCode">
            <el-input v-model="editForm.queryCode" placeholder="请输入查询码" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="信访日期" prop="petitionDate">
            <el-date-picker v-model="editForm.petitionDate" type="datetime" placeholder="请选择信访日期" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="涉及人数" prop="involvedCount">
            <el-input-number v-model="editForm.involvedCount" :min="0" placeholder="请输入涉及人数" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="信访原因" prop="petitionReason">
            <el-input v-model="editForm.petitionReason" placeholder="请输入信访原因" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="信访人数" prop="petitionerCount">
            <el-input-number v-model="editForm.petitionerCount" :min="0" placeholder="请输入信访人数" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否逸期" prop="isOverdue">
            <el-switch v-model="editForm.isOverdue" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="所属系统" prop="belongSystem">
            <el-input v-model="editForm.belongSystem" placeholder="请输入所属系统" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="问题属地" prop="problemLocation">
            <el-input v-model="editForm.problemLocation" placeholder="请输入问题属地" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="处理状态" prop="processStatus">
            <el-select v-model="editForm.processStatus" placeholder="请选择处理状态">
              <el-option
                v-for="dict in getDictOptions(DICT_TYPE.PETITION_PROCESS_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="内容分类" prop="contentCategory">
            <el-input v-model="editForm.contentCategory" placeholder="请输入内容分类" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { formatToDateTime } from '@/utils/dateUtil'
import { DICT_TYPE, getDictOptions } from "@/utils/dict";
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { BaseInfoApi } from '@/api/petition/baseinfo'

interface BasicInfoProps {
  info: {
    id?: number
    petitionId?: number
    acceptanceNo: string
    businessNo: string
    queryCode: string
    petitionType: string
    petitionDate: string
    registrationOrg: string
    registrationTime: string
    deadline: string
    involvedCount: number
    petitionerCount: number
    petitionReason: string
    belongSystem: string
    problemLocation: string
    contentCategory: string
    isOverdue: boolean
    processStatus: string
    satisfaction?: number
  }
}

// 定义组件属性

const emit = defineEmits(['update'])
const props = defineProps<BasicInfoProps>()

// 弹窗相关
const dialogVisible = ref(false)
const formRef = ref()

// 编辑表单
const editForm = reactive({
  id: undefined as number | undefined,
  petitionId: undefined as number | undefined,
  acceptanceNo: '',
  businessNo: '',
  queryCode: '',
  petitionType: '',
  petitionDate: '',
  registrationOrg: '',
  registrationTime: '',
  deadline: '',
  involvedCount: 0,
  petitionerCount: 0,
  petitionReason: '',
  belongSystem: '',
  problemLocation: '',
  contentCategory: '',
  isOverdue: false,
  processStatus: '',
  satisfaction: 3 // 默认设置为一般
})

// 表单验证规则
const rules = {
  acceptanceNo: [
    { required: true, message: '请输入受理编号', trigger: 'blur' }
  ],
  petitionType: [
    { required: true, message: '请输入信访方式', trigger: 'blur' }
  ],
  processStatus: [
    { required: true, message: '请选择处理状态', trigger: 'change' }
  ]
}

// 打开编辑弹窗
const openEditDialog = () => {
  // 复制当前信息到编辑表单
  Object.keys(editForm).forEach(key => {
    if (props.info[key] !== undefined) {
      editForm[key] = props.info[key]
    }
  })
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 确保必要字段存在且类型正确
    if (!props.info.id || !props.info.petitionId) {
      ElMessage.error('缺少必要的ID信息')
      return
    }

    // 准备要提交的数据
    // 注意：需要将字符串日期转换为时间戳格式
    const submitData = {
      ...editForm,
      id: props.info.id as number,
      petitionId: props.info.petitionId as number,
      // 将字符串日期转换为时间戳
      petitionDate: editForm.petitionDate ? new Date(editForm.petitionDate).getTime() : undefined,
      registrationTime: editForm.registrationTime ? new Date(editForm.registrationTime).getTime() : undefined,
      deadline: editForm.deadline ? new Date(editForm.deadline).getTime() : undefined
    }

    // 调用API提交修改后的数据
    const res = await BaseInfoApi.updateBaseInfo(submitData as any) // 使用 any 类型临时解决类型兼容问题

    if (res) {
      // 更新成功后触发更新事件
      emit('update', submitData)

      // 关闭弹窗
      dialogVisible.value = false

      // 显示成功提示
      ElMessage.success('修改成功')
    } else {
      ElMessage.error('修改失败')
    }
  } catch (error: any) { // 显式指定 error 类型为 any
    console.error('提交失败:', error)
    ElMessage.error('提交失败: ' + (error.message || '未知错误'))
  }
}
</script>

<style scoped>
.basic-info {
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.edit-btn {
  margin-left: auto;
  font-size: 12px;
  padding: 4px 8px;
}

.title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.info-content {
  padding: 16px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ebeef5;
}

.info-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-cell {
  padding: 12px 10px;
  font-size: 13px;
  box-sizing: border-box;
}

.info-cell.label {
  width: 10%;
  background-color: #f5f7fa;
  color: #606266;
  text-align: right;
  border-right: 1px solid #ebeef5;
  font-weight: bold;
}

.info-cell.value {
  width: 23.33%;
  color: #606266;
  border-right: 1px solid #ebeef5;
}

.info-cell.value:nth-child(6) {
  border-right: none;
}
</style>
