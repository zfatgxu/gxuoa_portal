<template>
  <div class="application-container">
    <div class="header">
      <h1>纸质纪要申请</h1>
      <p class="subtitle">请填写以下信息申请纸质会议纪要</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="application-form"
    >
      <!-- 申请人信息 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <el-icon><User /></el-icon>
            <span>申请人信息</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="applicantName">
              <el-input v-model="form.applicantName" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工号" prop="employeeId">
              <el-input v-model="form.employeeId" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%">
                <el-option label="人事部" value="hr" />
                <el-option label="财务部" value="finance" />
                <el-option label="技术部" value="tech" />
                <el-option label="市场部" value="marketing" />
                <el-option label="运营部" value="operations" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱地址" />
        </el-form-item>
      </el-card>

      <!-- 纪要信息 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <el-icon><Document /></el-icon>
            <span>纪要信息</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会议名称" prop="meetingName">
              <el-input v-model="form.meetingName" placeholder="请输入会议名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会议日期" prop="meetingDate">
              <el-date-picker
                v-model="form.meetingDate"
                type="date"
                placeholder="请选择会议日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="纪要类型" prop="minutesType">
              <el-select v-model="form.minutesType" placeholder="请选择纪要类型" style="width: 100%">
                <el-option label="董事会纪要" value="board" />
                <el-option label="股东大会纪要" value="shareholder" />
                <el-option label="部门会议纪要" value="department" />
                <el-option label="项目会议纪要" value="project" />
                <el-option label="其他会议纪要" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急程度" prop="urgency">
              <el-select v-model="form.urgency" placeholder="请选择紧急程度" style="width: 100%">
                <el-option label="普通" value="normal" />
                <el-option label="紧急" value="urgent" />
                <el-option label="特急" value="critical" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="申请份数" prop="copies">
          <el-input-number v-model="form.copies" :min="1" :max="50" />
        </el-form-item>
      </el-card>

      <!-- 申请详情 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <el-icon><EditPen /></el-icon>
            <span>申请详情</span>
          </div>
        </template>

        <el-form-item label="申请原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明申请纸质纪要的原因"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="3"
            placeholder="其他需要说明的事项（选填）"
          />
        </el-form-item>

        <el-form-item label="配送地址" prop="deliveryAddress">
          <el-input
            v-model="form.deliveryAddress"
            type="textarea"
            :rows="2"
            placeholder="请输入详细的配送地址"
          />
        </el-form-item>
      </el-card>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="submitForm" :loading="loading">
          提交申请
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Document, EditPen } from '@element-plus/icons-vue'

const formRef = ref()
const loading = ref(false)

const form = reactive({
  applicantName: '',
  employeeId: '',
  department: '',
  phone: '',
  email: '',
  meetingName: '',
  meetingDate: '',
  minutesType: '',
  urgency: 'normal',
  copies: 1,
  reason: '',
  remarks: '',
  deliveryAddress: ''
})

const rules = reactive({
  applicantName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  employeeId: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  meetingName: [
    { required: true, message: '请输入会议名称', trigger: 'blur' }
  ],
  meetingDate: [
    { required: true, message: '请选择会议日期', trigger: 'change' }
  ],
  minutesType: [
    { required: true, message: '请选择纪要类型', trigger: 'change' }
  ],
  urgency: [
    { required: true, message: '请选择紧急程度', trigger: 'change' }
  ],
  copies: [
    { required: true, message: '请输入申请份数', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入申请原因', trigger: 'blur' },
    { min: 10, message: '申请原因至少需要10个字符', trigger: 'blur' }
  ],
  deliveryAddress: [
    { required: true, message: '请输入配送地址', trigger: 'blur' }
  ]
})

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 模拟提交请求
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('申请提交成功！我们将在2个工作日内处理您的申请。')
    resetForm()
  } catch (error) {
    ElMessage.error('请检查表单信息是否完整')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
</script>

<style scoped>
.application-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header h1 {
  color: #303133;
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  color: #606266;
  margin: 0;
  font-size: 14px;
}

.application-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 25px;
  border: 1px solid #ebeef5;
}

.form-section:last-of-type {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.form-actions {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.form-actions .el-button {
  min-width: 100px;
  margin: 0 10px;
}

:deep(.el-card__header) {
  background-color: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
}
</style>