<template>
  <div class="form-container">
    <div class="form-header">
      <h1><el-select v-model="selectedUnit" placeholder="请选择一个单位申请印章" filterable style="width: 300px">
        <el-option v-for="unit in unitList" :key="unit.id" :label="unit.name" :value="unit.name" />
      </el-select> 用印申请单</h1>
    </div>
    
    <el-form :model="form" label-width="120px" class="seal-form">
      <!-- 材料名称 -->
      <div class="form-section">
        <div class="section-header required">材料名称</div>
        <div class="material-name-content">
          <el-input
            v-model="form.materialName"
            type="textarea"
            :rows="3"
            placeholder="请输入材料名称"
            class="material-input"
          />
        </div>
      </div>

      

      <!-- 印章类型 -->
      <div class="form-section">
        <div class="section-header required"><el-button type="primary" link @click="addCustomSeal" size="small">
              <el-icon><Plus /></el-icon> 添加印章类型
            </el-button></div>
        <div class="seal-type-content">
          <!-- <div class="seal-item" v-for="(seal, index) in defaultSealTypes" :key="'default-'+index">
            <span class="seal-name">{{ seal.name }}</span>
            <div class="seal-controls">
              <el-input-number
                v-model="seal.quantity"
                :min="0"
                :max="99"
                size="small"
                class="quantity-input"
              />
              <span class="unit">个</span>
            </div>
          </div> -->
          
          <!-- 用户添加的印章类型 -->
          <div class="seal-item" v-for="(seal, index) in customSealTypes" :key="'custom-'+index">
            <div class="seal-name-select">
              <el-select v-model="seal.id" placeholder="请选择印章类型" size="small" class="custom-seal-select">
                <el-option
                  v-for="option in sealTypeOptions"
                  :key="option.id"
                  :label="option.name"
                  :value="option.id"
                />
              </el-select>
            </div>
            <div class="seal-controls">
              <el-input-number
                v-model="seal.quantity"
                :min="0"
                :max="99"
                size="small"
                class="quantity-input"
              />
              <span class="unit">个</span>
              <el-button type="danger" link @click="removeCustomSeal(index)" size="small">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
          
          <!-- 添加印章按钮 -->
          <!-- <div class="add-seal-button">
            <el-button type="primary" link @click="addCustomSeal" size="small">
              <el-icon><Plus /></el-icon> 添加印章
            </el-button>
          </div> -->
        </div>
      </div>

      <!-- 指定审批人 -->
      <div class="form-section" v-if="startUserSelectTasks.length > 0">
        <div class="section-header required">选择单位签字审批人</div>
        <div class="signature-content">
          <el-form
            :model="startUserSelectAssignees"
            :rules="startUserSelectAssigneesFormRules"
            ref="startUserSelectAssigneesFormRef"
          >
            <div class="signature-row" v-for="userTask in startUserSelectTasks" :key="userTask.id">
              <span class="required">{{ userTask.name }}</span>
              <el-select
                v-model="startUserSelectAssignees[userTask.id]"
                multiple
                placeholder="请选择审批人"
                class="signature-input"
                filterable
              >
                <el-option
                  v-for="user in userList"
                  :key="user.id"
                  :label="user.nickname"
                  :value="user.id"
                />
              </el-select>
            </div>
          </el-form>
        </div>
      </div>

      <!-- 材料类型 -->
      <div class="form-section">
        <div class="section-header required">材料类型</div>
        <div class="material-type-content">
          <el-radio-group v-model="form.selectedMaterialTypes">
            <el-radio
              v-for="dict in getDictOptions(DICT_TYPE.SEAL_APPLY_MATERIAL_TYPES)" 
              :key="dict.value" 
              :label="dict.value"
              class="material-checkbox"
            >
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 附件上传 -->
      <div class="form-section">
        <div class="section-header">附件上传</div>
        <div class="upload-content">
          <el-upload
            class="upload-demo"
            :http-request="handleUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :file-list="[]"
            :show-file-list="false"
            multiple
            :headers="{ Authorization: 'Bearer ' + getAccessToken() }"
            name="file"
          >
            <el-button type="primary">
              <el-icon style="vertical-align: middle; margin-right: 4px;"><Paperclip /></el-icon>
              添加附件
            </el-button>
          </el-upload>
          
          <!-- 文件列表 -->
          <div class="file-list" v-if="uploadedFiles.length > 0">
            <div class="file-item" v-for="(file, index) in uploadedFiles" :key="index">
              <div class="file-info">
                <el-icon class="file-icon" :class="file.type === 'excel' ? 'excel-icon' : (file.type === 'pdf' ? 'pdf-icon' : 'document-icon')">
                  <document />
                </el-icon>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ file.size }}</span>
              </div>
              <div class="file-status">
                <el-tag v-if="file.status === 'success'" type="success" size="small">
                  <el-icon><check /></el-icon>
                  上传成功
                </el-tag>
                <el-tag v-else type="danger" size="small">
                  <el-icon><close /></el-icon>
                  上传失败
                </el-tag>
                <el-button type="primary" link size="small" @click="viewFile(file)">
                  查看
                </el-button>
                <el-button type="primary" link size="small" @click="removeFile(index)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 注意事项 -->
      <div class="form-section">
        <div class="section-header required">请填写备注</div>
        <div class="notes-content">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="4"
            placeholder="请填写备注"
          />
        </div>
      </div>

      <!-- 单位签字 -->
      <div class="form-section">
        <div class="section-header required">申请人联系电话</div>
        <div class="signature-content">
          <div class="signature-row">
            <!--<span class="required">联系电话</span>-->
            <el-input v-model="form.contactPhone" placeholder="请输入您的联系电话" class="signature-input" />
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <el-button type="primary" size="large" @click="submitForm">
          提交
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { getSimpleUserList } from '@/api/system/user'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document, Check, Close, Paperclip, Plus } from '@element-plus/icons-vue'
import * as DefinitionApi from '@/api/bpm/definition'
import * as UserApi from '@/api/system/user'
import { parseStartUserSelectTasks } from '@/utils/parseBpmn'
import * as SealApi from '@/api/seal'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { useRoute } from 'vue-router'
import { getAccessToken } from '@/utils/auth'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import { sealApi } from '@/api/seal/seal'
import { getSimpleDeptList } from '@/api/system/dept'
import { useRouter } from 'vue-router'

//接传过来的数据
const route = useRoute()
const router = useRouter()

// 表单数据
const form = reactive({
  title: '',
  materialName: '',
  contactPhone: '',
  selectedMaterialTypes: [], // 新增的字段
  notes: '',
  attachments: [] // 添加附件字段
})

const selectedUnit = ref('')
const unitList = ref([])

// 指定审批人
const processDefineKey = 'seal_apply' // 流程定义 Key
const startUserSelectTasks = ref([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref({}) // 发起人选择审批人的数据
const startUserSelectAssigneesFormRef = ref() // 发起人选择审批人的表单 Ref
const startUserSelectAssigneesFormRules = ref({}) // 发起人选择审批人的表单 Rules
const userList = ref<Array<any>>([])

// 默认印章类型数据,是从数据库，印章表中获取的，
const defaultSealTypes = ref([])

const fetchUnitList = async () => {
    const res = await getSimpleDeptList()
    // 兼容返回结构
    unitList.value = Array.isArray(res) ? res : (res.data || [])
  }

const getDefaultSealTypes = async () => {
  try {
    // 从数据库，印章表中获取
    const res = await sealApi.getsealPage({ pageSize: 100 }) // 获取印章列表，设置较大的pageSize以获取所有印章
    if (res && res.data && res.data.list && res.data.list.length > 0) {
      // 将后端返回的印章数据转换为前端需要的格式
      defaultSealTypes.value = res.data.list.map(item => {
        return {
          id: item.id,
          name: item.sealName,
          quantity: 0 // 初始数量为0
        }
      })
    } else {
      // // 如果没有获取到数据，使用默认数据
      // defaultSealTypes.value = [
      //   { id: 1, name: '中共广西大学委员会', quantity: 0 },
      //   { id: 2, name: '广西大学（红印）', quantity: 0 },
      //   { id: 3, name: '广西大学（钢印）', quantity: 0 },
      //   { id: 4, name: '广西大学校长办公室（红印）', quantity: 0 },
      //   { id: 5, name: '广西大学合同专用章（红印）', quantity: 0 },
      // ]
    }
  } catch (error) {
    console.error('获取印章类型失败:', error)
    // 获取失败时使用默认数据
    // defaultSealTypes.value = [
    //   { id: 1, name: '中共广西大学委员会', quantity: 0 },
    //   { id: 2, name: '广西大学（红印）', quantity: 0 },
    //   { id: 3, name: '广西大学（钢印）', quantity: 0 },
    //   { id: 4, name: '广西大学校长办公室（红印）', quantity: 0 },
    //   { id: 5, name: '广西大学合同专用章（红印）', quantity: 0 },
    // ]
  }
}

// 印章类型选项
const sealTypeOptions = ref([])

// 获取印章类型选项
const getSealTypeOptions = async () => {
  try {
    // 从数据库获取印章类型选项
    const res = await sealApi.getsealPage({ pageSize: 100 })
    
      sealTypeOptions.value = res.list.map(item => {
        return {
          id: item.id,
          name: item.sealName
        }
      })
    
      // // 如果没有获取到数据，使用默认数据
      // sealTypeOptions.value = [
      //   { id: 1, name: '中共广西大学委员会' },
      //   { id: 2, name: '广西大学（红印）' },
      //   { id: 3, name: '广西大学（钢印）' },
      //   { id: 4, name: '广西大学校长办公室（红印）' },
      //   { id: 5, name: '广西大学合同专用章（红印）' },
      //]
    
  } catch (error) {
    console.error('获取印章类型选项失败:', error)
    // 获取失败时使用默认数据
    // sealTypeOptions.value = [
    //   { id: 1, name: '中共广西大学委员会' },
    //   { id: 2, name: '广西大学（红印）' },
    //   { id: 3, name: '广西大学（钢印）' },
    //   { id: 4, name: '广西大学校长办公室（红印）' },
    //   { id: 5, name: '广西大学合同专用章（红印）' },
    // ]
  }
}

// 用户自定义添加的印章类型数据
const customSealTypes = ref([])

// 添加用户自定义印章类型
const addCustomSeal = () => {
  getSealTypeOptions()
  customSealTypes.value.push({
    id: '',
    name: '',
    quantity: 0
  })
}

// 删除用户自定义印章类型
const removeCustomSeal = (index) => {
  customSealTypes.value.splice(index, 1)
}

// 监听自定义印章类型的id变化，自动设置name
const watchCustomSealId = (seal) => {
  const selectedSeal = sealTypeOptions.value.find(option => option.id === seal.id)
  if (selectedSeal) {
    seal.name = selectedSeal.name
  }
}

// 监听自定义印章类型的id变化
watch(customSealTypes, (newVal) => {
  newVal.forEach((seal) => {
    watchCustomSealId(seal)
  })
}, { deep: true })

// 领导列表
const leaderList = ref([])

// 文件上传到minio
const { uploadUrl, httpRequest } = useUpload()
const fileList = ref([])
const uploadedFiles = reactive([])

// 文件上传成功处理
const handleUploadSuccess = (response, file) => {
  // 接口返回的数据结构中包含文件信息
 
  
  uploadedFiles.push({
    name: file.name,
    size: formatFileSize(file.size),
    status: 'success', // 添加这一行，设置状态为success
    type: getFileType(file.name), // 添加这一行，用于图标显示
    url: response.data // 保存文件URL的另一个字段
  })
  console.log('上传成功:', uploadedFiles)
  
  ElMessage.success('文件上传成功')
}

// 删除文件
const removeFile = (index) => {
  uploadedFiles.splice(index, 1)
  ElMessage.success('文件已删除')
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return Math.round(size / 1024) + 'KB'
  return Math.round(size / (1024 * 1024)) + 'M'
}

// 获取文件类型
const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  if (['xls', 'xlsx'].includes(ext)) return 'excel'
  if (['pdf'].includes(ext)) return 'pdf'
  return 'document'
}

// 查看文件
const viewFile = (file) => {
  window.open(file.url, '_blank')
}

// 提交表单
const submitForm = async () => {
  // 验证必填字段
  if (!selectedUnit.value) {
    ElMessage.error('请选择一个单位申请印章')
    return
  }
  if (!form.materialName) {
    ElMessage.error('请填写材料名称')
    return
  }
  
  if (!form.contactPhone) {
    ElMessage.error('请填写联系电话')
    return
  }
  
  // 验证联系电话格式
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(form.contactPhone)) {
    ElMessage.error('请输入正确的手机号码格式')
    return
  }
  
  // 验证是否添加了印章类型
  if (customSealTypes.value.length === 0) {
    ElMessage.error('请至少添加一种印章类型')
    return
  }
  
  // 验证印章类型是否选择
  const noTypeSeal = customSealTypes.value.find(seal => !seal.id)
  if (noTypeSeal) {
    ElMessage.error('请选择印章类型')
    return
  }
  
  // 校验印章数量
  const zeroQuantitySeal = customSealTypes.value.find(seal => !seal.quantity || seal.quantity === 0)
  if (zeroQuantitySeal) {
    const sealName = sealTypeOptions.value.find(option => option.id === zeroQuantitySeal.id)?.name || '印章'
    ElMessage.error(`${sealName}数量不能为0，请输入有效数量`)
    return
  }
  
  // 校验指定审批人
  if (startUserSelectTasks.value?.length > 0) {
    // 检查是否有未选择审批人的任务
    const emptyAssignees = Object.entries(startUserSelectAssignees.value).find(
      ([taskId, assignees]) => {
        // 检查该任务是否存在于startUserSelectTasks中
        const taskExists = startUserSelectTasks.value.some(task => task.id === taskId);
        // 如果任务存在且没有选择审批人，则返回true
        return taskExists && (!assignees || assignees.length === 0);
      }
    );
    
    if (emptyAssignees) {
      ElMessage.error('请选择所有必填的审批人');
      return;
    }
    
    // 确保所有任务都有对应的审批人
    for (const task of startUserSelectTasks.value) {
      if (!startUserSelectAssignees.value[task.id] || startUserSelectAssignees.value[task.id].length === 0) {
        ElMessage.error(`请为"${task.name}"选择审批人`);
        return;
      }
    }
  }
  
  // 验证材料类型
  if (!form.selectedMaterialTypes || form.selectedMaterialTypes.length === 0) {
    ElMessage.error('请至少选择一种材料类型')
    return
  }
  
  // 验证摘要
  if (!form.notes) {
    ElMessage.error('请填写申请摘要')
    return
  }
  
  // // 获取选中的材料类型的名称并合并为字符串
  // const selectedMaterialTypeLabels = form.selectedMaterialTypes.map(value => {
  //   const dict = getDictOptions(DICT_TYPE.SEAL_APPLY_MATERIAL_TYPES).find(item => item.value === value)
  //   return dict ? dict.label : ''
  // }).filter(label => label !== '').join(',') // 使用逗号连接成字符串

  // 处理文件数据，只保留名称、大小和URL
  const simplifiedFiles = uploadedFiles.map(file => ({
    name: file.name,
    size: file.size,
    url: file.url
  }))
  // 构建符合后端要求的数据结构
  const submitData = {
    applyTitle: selectedUnit.value+'印章申请单',//表单标题
    materialName: form.materialName,//材料名称
    phone: form.contactPhone,//联系电话
    materialTypes: form.selectedMaterialTypes,//材料类型
    attention: form.notes,//注意事项
    attachments: simplifiedFiles,//附件json，文件名，文件大小，文件路径
    
    // 印章类型表数据
    sealTypes: [...defaultSealTypes.value, ...customSealTypes.value]
  }
  
  // 设置指定审批人
  if (startUserSelectTasks.value?.length > 0) {
    submitData.startUserSelectAssignees = startUserSelectAssignees.value
  }
  
  // 提交数据到后端
  console.log('提交数据:', submitData)
  console.log('上传文件:', uploadedFiles)
  try {
    await SealApi.submitSealApplication(submitData)
    ElMessage.success('申请提交成功')
    //跳转到印章申请列表
    router.push('/seal/seal_apply')
  } catch (error) {
    ElMessage.error('申请提交失败')
  }
}

const bpmnXml = ref('')

onMounted(async () => {
  await fetchUnitList()
  
  //获取默认印章类型数据
  //await getDefaultSealTypes()
  //获取印章类型选项
  await getSealTypeOptions()
  
  try {
    //获取流程定义
    const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
      undefined,
      processDefineKey
    )
    if (!processDefinitionDetail) {
      ElMessage.error('印章申请的流程模型未配置，请检查！')
      return
    }
    
    //获取指定审批人
    if (processDefinitionDetail.bpmnXml) {
      bpmnXml.value = processDefinitionDetail.bpmnXml
      console.log('获取到BPMN XML数据，长度:', bpmnXml.value.length)
      
      try {
        startUserSelectTasks.value = await parseStartUserSelectTasks(bpmnXml.value)
        console.log('解析到的可指定审批人任务:', startUserSelectTasks.value)
        
        // 设置指定审批人
        if (startUserSelectTasks.value?.length > 0) {
          // 设置校验规则
          for (const userTask of startUserSelectTasks.value) {
            startUserSelectAssignees.value[userTask.id] = []
            startUserSelectAssigneesFormRules.value[userTask.id] = [
              { required: true, message: '请选择审批人', trigger: 'blur' }
            ]
          }
          // 加载用户列表
          userList.value = await UserApi.getSimpleUserList()
        }
      } catch (error) {
        console.error('解析BPMN XML时出错:', error)
        ElMessage.error('解析流程定义失败，请联系管理员')
      }
    } else {
      console.error('流程定义中没有BPMN XML数据')
      ElMessage.error('流程定义数据不完整，请联系管理员')
    }
  } catch (error) {
    console.error('获取流程定义失败:', error)
    ElMessage.error('获取流程定义失败，请联系管理员')
  }
  // 加载字典数据
  const dictOptions = await getDictOptions(DICT_TYPE.SEAL_APPLY_MATERIAL_TYPES)
  console.log('材料类型字典数据:', dictOptions)
})

const handleUpload = (options) => {
  return httpRequest(options)
}
</script>

<style scoped>
.form-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: white;
}

.form-header {
  text-align: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
}

.form-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.seal-form {
  border: 2px solid #409eff;
  border-radius: 8px;
  overflow: hidden;
}

.form-section {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.form-section:last-child {
  border-bottom: none;
}

.section-header {
  width: 120px;
  padding: 20px 15px;
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  text-align: center;
  min-height: 60px;
}

.material-name-content {
  flex: 1;
  padding: 15px;
  background: #e8f4fd;
}

.material-input {
  width: 100%;
}

.seal-type-content {
  flex: 1;
  padding: 15px;
}

.seal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.seal-item:last-child {
  border-bottom: none;
}

.seal-name {
  flex: 1;
  color: #333;
}

.seal-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-input {
  width: 80px;
}

.unit {
  color: #666;
  font-size: 14px;
}

.custom-select {
  width: 120px;
}

.signature-content {
  flex: 1;
  padding: 15px;
  background: #f0f8ff;
}

.signature-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
}

.signature-row:last-child {
  margin-bottom: 0;
}
.signature-row .required {
  width: 140px; /* 或 144px，确保能容纳最长的标签 */
  min-width: 140px;
  text-align: left;
  margin-right: 12px;
  display: inline-block;
  flex-shrink: 0;
}

.required::before {
  content: "* ";
  color: #f56c6c;
}

.signature-input {
  flex: 1;
  max-width: 300px;
}

.material-type-content {
  flex: 1;
  padding: 15px;
}

.material-checkbox {
  display: block;
  margin-bottom: 10px;
}

.upload-content {
  flex: 1;
  padding: 15px;
}

.upload-demo {
  margin-bottom: 20px;
}

.file-list {
  margin-top: 15px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fafafa;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  font-size: 18px;
}

.excel-icon {
  color: #67c23a;
}

.pdf-icon {
  color: #f56c6c;
}

.document-icon {
  color: #909399;
}

.file-name {
  font-weight: 500;
  color: #333;
}

.file-size {
  color: #666;
  font-size: 12px;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notes-content {
  flex: 1;
  padding: 15px;
}

.form-actions {
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

:deep(.el-input-number) {
  width: 80px;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
}

.custom-seal-select {
  width: 180px;
}

.seal-name-select {
  flex: 1;
  display: flex;
  align-items: center;
}

.add-seal-button {
  margin-top: 10px;
  display: flex;
  justify-content: flex-start;
}
</style>