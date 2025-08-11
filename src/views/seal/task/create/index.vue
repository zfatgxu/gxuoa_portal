<template>
  <div class="form-container">
    <div class="form-header">
      <!-- 未选择单位时显示选择框 -->
      <div v-if="!selectedUnit">
        <el-select
          v-model="selectedUnit"
          placeholder="请选择一个单位申请印章"
          filterable
          style="width: 300px;"
          :loading="unitListLoading"
        >
          <el-option v-for="unit in unitList" :key="unit.id" :label="unit.name" :value="unit" />
        </el-select>
      </div>
      <!-- 选择单位后显示完整h1标题 -->
      <div v-else class="title-with-edit">
        <h1>{{ selectedUnit.name }} 用印申请单</h1>
        <el-button type="primary" link @click="resetUnit" class="edit-unit-btn">
          <el-icon><Edit /></el-icon> 更改单位
        </el-button>
      </div>
    </div>

    <el-form :model="form" label-width="120px" class="seal-form">
      <!-- 材料名称 -->
      <div class="form-section">
        <div class="section-header required">材料名称</div>
        <div class="material-name-content">
          <el-input
            v-model="form.materialName"
            placeholder="请输入材料名称"
            class="material-input"
          />
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

      <!-- 印章类型 -->
      <div class="form-section">
        <div class="section-header required">印章类型</div>
        <div class="seal-type-content">
          <!-- 添加印章类型按钮 -->
          <div class="add-seal-section">
            <el-button type="primary" link @click="addCustomSeal" class="add-seal-btn">
              <el-icon><Plus /></el-icon> 添加印章类型
            </el-button>
          </div>
          <!-- 用户添加的印章类型 -->
          <div class="seal-item" v-for="(seal, index) in customSealTypes" :key="'custom-'+index">
            <div class="seal-name-select">
              <el-select v-model="seal.id" placeholder="请选择印章类型" class="custom-seal-select">
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
                :min="1"
                :max="99"
                size="small"
                class="quantity-input"
              />
              <span class="unit">个</span>
              <el-button type="danger" link @click="removeCustomSeal(index)" size="large">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 经办人、审核人和电话 -->
      <div class="form-section">
        <div class="connected-fields-row">
          <div class="connected-field-item">
            <div class="connected-field-header required">经办人</div>
            <div class="connected-field-content">
              <el-input
                v-model="managerSigner"
                placeholder=""
                class="connected-field-input"
                clearable
              />
            </div>
          </div>
          <div class="connected-field-item">
            <div class="connected-field-header required">审核人</div>
            <div class="connected-field-content">
              <el-input
                v-model="approverSigner"
                placeholder=""
                class="connected-field-input"
                clearable
              />
            </div>
          </div>
          <div class="connected-field-item">
            <div class="connected-field-header required">电话</div>
            <div class="connected-field-content">
              <el-input
                v-model="form.contactPhone"
                placeholder=""
                class="connected-field-input"
                clearable
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 单位负责人审核意见 -->
      <div class="form-section">
        <div class="section-header">单位负责人审核意见</div>
        <div class="notes-content">
          <el-input
            v-model="form.unitLeaderOpinion"
            type="textarea"
            :rows="3"
            placeholder=""
            disabled
          />
        </div>
      </div>

      <!-- 用印审核 -->
      <div class="form-section">
        <div class="section-header">用印审核</div>
        <div class="notes-content">
          <el-input
            v-model="form.sealAuditOpinion"
            type="textarea"
            :rows="3"
            placeholder=""
            disabled
          />
        </div>
      </div>

      <!-- 附件 -->
      <div class="form-section">
        <div class="section-header">附件</div>
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
            :before-upload="beforeUpload"
            :on-exceed="handleExceed"
          >
            <el-button type="primary">
              <el-icon style="vertical-align: middle; margin-right: 4px;"><Paperclip /></el-icon>
              选择文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                仅支持常见文件类型（doc/docx/xls/xlsx/pdf/jpg/png等），单个文件不超过20MB，最多上传10个文件
              </div>
            </template>
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

      <!-- 备注 -->
      <div class="form-section">
        <div class="section-header">备注</div>
        <div class="notes-content">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="4"
            placeholder="请输入"
          />
        </div>
      </div>

      <!-- 注意事项 -->
      <div class="form-section" v-if="selectedUnit && unitNoticeContent">
        <div class="section-header">注意事项</div>
        <div class="notice-content">
          <div class="notice-text" v-html="unitNoticeContent"></div>
        </div>
      </div>

      <!-- 单位负责人签字和提交按钮 -->
      <div class="form-section">
        <div class="section-header"></div>
        <div class="bottom-actions-content">
          <div class="bottom-actions-row">
            <div class="empty-space"></div>
            <div class="right-actions">
              <div class="unit-leader-section">
                <span class="signature-label">单位负责人签字</span>
                <el-select
                  v-model="unitLeaderSigner"
                  placeholder=""
                  class="unit-leader-select"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="user in sameDeptUsersList"
                    :key="user.id"
                    :label="user.nickname"
                    :value="user.id"
                  >
                    <span>{{ user.nickname }}</span>
                  </el-option>
                </el-select>
              </div>
              <div class="submit-section">
                <el-button type="primary" size="large" @click="submitForm">
                  提交
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { getSimpleUserList } from '@/api/system/user'
import { KKFileView } from '@/components/KKFileView'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document, Check, Close, Paperclip, Plus, Edit } from '@element-plus/icons-vue'
import * as DefinitionApi from '@/api/bpm/definition'
import * as UserApi from '@/api/system/user'
import { useUserStore } from '@/store/modules/user'
import { parseStartUserSelectTasks } from '@/utils/parseBpmn'
import * as SealApi from '@/api/seal'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { useRoute } from 'vue-router'
import { getAccessToken } from '@/utils/auth'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import { sealApi } from '@/api/seal/seal'
import { getSimpleDeptList, getDept } from '@/api/system/dept'
import { useRouter } from 'vue-router'

// 接传过来的数据
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 表单数据
const form = reactive({
  title: '',
  materialName: '',
  contactPhone: '',
  selectedMaterialTypes: [], // 新增的字段
  notes: '',
  attachments: [], // 添加附件字段
  sealAuditOpinion: '', // 用印审核意见
  unitLeaderOpinion: '' // 单位负责人审核意见
})

const selectedUnit = ref('')
const unitList = ref([])
const unitListLoading = ref(false) // 添加加载状态

// 指定审批人
const processDefineKey = 'seal_apply' // 流程定义 Key
const startUserSelectTasks = ref([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref({}) // 发起人选择审批人的数据
const startUserSelectAssigneesFormRef = ref() // 发起人选择审批人的表单 Ref
const startUserSelectAssigneesFormRules = ref({}) // 发起人选择审批人的表单 Rules
const userList = ref<Array<any>>([])

// 默认印章类型数据,是从数据库，印章表中获取的，
const defaultSealTypes = ref([])

// 检查单位是否有印章的函数
const checkUnitHasSeals = async (unitName: string) => {
  try {
    const res = await sealApi.getsealPage({
      pageSize: 1, // 只需要检查是否有数据，所以设置为1
      orgName: unitName
    })
    // 检查是否有印章数据
    return res && res.list && res.list.length > 0
  } catch (error) {
    console.error(`检查单位 ${unitName} 印章失败:`, error)
    return false // 出错时默认认为没有印章
  }
}

const fetchUnitList = async () => {
  unitListLoading.value = true
  try {
    const res = await getSimpleDeptList()
    // 兼容返回结构
    const allUnits = Array.isArray(res) ? res : (res.data || [])

    // 过滤出有印章的单位
    const unitsWithSeals = []

    // 并发检查所有单位是否有印章
    const checkPromises = allUnits.map(async (unit) => {
      const hasSeals = await checkUnitHasSeals(unit.name)
      if (hasSeals) {
        return unit
      }
      return null
    })

    const results = await Promise.all(checkPromises)

    // 过滤掉null值（没有印章的单位）
    unitList.value = results.filter(unit => unit !== null)

    console.log(`总单位数: ${allUnits.length}, 有印章的单位数: ${unitList.value.length}`)

  } catch (error) {
    console.error('获取单位列表失败:', error)
    ElMessage.error('获取单位列表失败')
    unitList.value = []
  } finally {
    unitListLoading.value = false
  }
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
    }
  } catch (error) {
    console.error('获取印章类型失败:', error)
  }
}

// 印章类型选项
const sealTypeOptions = ref([])

// 获取印章类型选项
const getSealTypeOptions = async () => {
  try {
    // 从数据库获取印章类型选项
    const res = await sealApi.getsealPage({ pageSize: 100, orgName: selectedUnit.value.name })

    sealTypeOptions.value = res.list.map(item => {
      return {
        id: item.id,
        name: item.sealName
      }
    })
  } catch (error) {
    console.error('获取印章类型选项失败:', error)
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

// 检查印章类型是否已被选择
const isSealTypeSelected = (sealId) => {
  return customSealTypes.value.some(seal => seal.id === sealId)
}

// 监听自定义印章类型的id变化，自动设置name
const watchCustomSealId = (seal, index) => {
  // 如果选择了已存在的印章类型，提示用户不允许重复选择
  if (seal.id && customSealTypes.value.findIndex((s, i) => s.id === seal.id && i !== index) !== -1) {
    ElMessage.warning('该印章类型已被选择，不允许重复选择，如果需要多个，请添加数量')
    // 移除当前项
    customSealTypes.value.splice(index, 1)
    return
  }

  const selectedSeal = sealTypeOptions.value.find(option => option.id === seal.id)
  if (selectedSeal) {
    seal.name = selectedSeal.name
  }
}

// 监听自定义印章类型的id变化
watch(customSealTypes, (newVal) => {
  newVal.forEach((seal, index) => {
    watchCustomSealId(seal, index)
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

// 文件上传错误处理
const handleUploadError = (error, file) => {
  console.error('文件上传失败:', error)
  ElMessage.error('文件上传失败')
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
  KKFileView.preview(file.url)
}

// 根据用户姓名查找用户ID，找不到就返回原始姓名
const findUserIdByName = (userName: string) => {
  if (!userName || userName.trim() === '') return ""

  // 在所有用户列表中查找匹配的用户
  const user = allUsersList.value.find(user =>
    user.nickname === userName.trim() || user.username === userName.trim()
  )

  // 找到用户返回ID，找不到返回原始姓名
  return user ? user.id : userName.trim()
}

// 获取签字人信息，找到用户ID就传ID，找不到就只传姓名
const getSignerInfo = (userName: string) => {
  if (!userName || userName.trim() === '') {
    return { name: "", signed: false }
  }

  // 在所有用户列表中查找匹配的用户
  const user = allUsersList.value.find(user =>
    user.nickname === userName.trim() || user.username === userName.trim()
  )

  if (user) {
    // 找到用户，返回包含ID的信息
    return { id: user.id, name: userName.trim(), signed: false }
  } else {
    // 找不到用户，只返回姓名
    return { name: userName.trim(), signed: false }
  }
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
    // 校验三个独立的签字人是否都已填写
    if (!managerSigner.value || managerSigner.value.trim() === '') {
      ElMessage.error('请输入经办人签字');
      return;
    }
    if (!approverSigner.value || approverSigner.value.trim() === '') {
      ElMessage.error('请输入审批人签字');
      return;
    }
    if (!unitLeaderSigner.value) {
      ElMessage.error('请选择单位负责人签字');
      return;
    }
    
    // 简化后的任务映射
    startUserSelectTasks.value.forEach(task => {
      if (task.name === '单位负责人') {
        // 只需要指定单位负责人
        startUserSelectAssignees.value[task.id] = [unitLeaderSigner.value];
      }
      // 用印审核人节点不需要前端指定，后端根据部门自动分配
    });
  }

  // 验证材料类型
  if (!form.selectedMaterialTypes || form.selectedMaterialTypes.length === 0) {
    ElMessage.error('请至少选择一种材料类型')
    return
  }

  // 处理文件数据，只保留名称、大小和URL
  const simplifiedFiles = uploadedFiles.map(file => ({
    name: file.name,
    size: file.size,
    url: file.url
  }))

  // 构建符合后端要求的数据结构
  const submitData = {
    applyTitle: selectedUnit.value.name+'印章申请单',//表单标题
    materialName: form.materialName,//材料名称
    phone: form.contactPhone,//联系电话
    materialTypes: form.selectedMaterialTypes,//材料类型
    attention: form.notes,//注意事项
    attachments: simplifiedFiles,//附件json，文件名，文件大小，文件路径

    // 印章类型表数据
    sealTypes: [...defaultSealTypes.value, ...customSealTypes.value],

    // 申请印章所在的单位ID（后端根据此ID自动分配用印审核人）
    applyDept: selectedUnit.value.id,

    // 签字人信息
    startUserSelectAssignees: {
      handler: getSignerInfo(managerSigner.value),
      reviewer: getSignerInfo(approverSigner.value),
      unitHead: {
        id: [unitLeaderSigner.value],
        name: sameDeptUsersList.value.find(user => user.id === unitLeaderSigner.value)?.nickname || "",
        signed: false
      }
    }
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
//审核人和单位负责人列表
const auditUserList = ref<Array<any>>([])
// 合并用户列表和审批人列表，用于合并的签字选择框
const managerTask = ref(null) // 经办人签字任务
const allUsersList = ref([]) // 合并后的用户列表
const sameDeptUsersList = ref([]) // 同部门用户列表
const combinedSigners = ref([]) // 合并的签字人列表
const managerSigner = ref('')
const approverSigner = ref('')
const unitLeaderSigner = ref('')

// 印章使用注意事项相关
const unitNoticeContent = ref('') // 当前单位的印章使用注意事项

// 获取单位印章使用注意事项
const getUnitNotice = async (unitId: number, unitName: string) => {
  try {
    const notice = await getDept(unitId)
    if (!notice.sealAttention) {
      unitNoticeContent.value = ''
      return
    }
    unitNoticeContent.value = notice.sealAttention.replace(/(\d+\.)/g, '<br>$1').replace(/^<br>/, '')
    console.log(`已加载${unitName}的印章使用注意事项`)
  } catch (error) {
    console.error('获取单位印章使用注意事项失败:', error)
    unitNoticeContent.value = ''
  }
}

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
        
        // 找到经办人签字任务（用于合并的签字选择框）
        managerTask.value = startUserSelectTasks.value.find(task => task.name === '经办人签字')
        console.log('经办人签字任务:', managerTask.value)
        
        // 加载所有用户列表
        try {
          // 加载经办人用户列表
          userList.value = await UserApi.getSimpleUserList()
          console.log('加载经办人用户列表成功:', userList.value.length)
          
          // 加载审核人用户列表
          auditUserList.value = await UserApi.getSimpleUserList()
          console.log('加载审核人用户列表成功:', auditUserList.value.length)
          
          // 使用系统中所有用户作为可选用户列表
          // 获取所有用户，不做任何筛选
          const allUsers = await UserApi.getSimpleUserList({pageSize: 1000}) // 设置较大的pageSize确保获取全部用户
          allUsersList.value = allUsers
          console.log('设置完整用户列表:', allUsersList.value.length)

          // 获取当前登录用户的部门ID，并获取同部门用户
          const currentUser = userStore.getUser
          if (currentUser && currentUser.deptId) {
            // 根据部门ID获取同部门用户，适配新的数据结构
            const sameDeptUsers = allUsers.filter(user => {
              // 兼容新格式（deptIds数组）和旧格式（deptId）
              if (user.deptIds && Array.isArray(user.deptIds)) {
                return user.deptIds.includes(currentUser.deptId)
              } else if (user.deptId) {
                return user.deptId === currentUser.deptId
              }
              return false
            })
            sameDeptUsersList.value = sameDeptUsers
            console.log('设置同部门用户列表:', sameDeptUsersList.value.length)
          } else {
            // 如果无法获取当前用户部门信息，则使用所有用户
            sameDeptUsersList.value = allUsers
            console.log('无法获取当前用户部门信息，使用所有用户作为同部门用户')
          }
        } catch (error) {
          console.error('加载用户列表失败:', error)
          ElMessage.error('加载用户列表失败，请刷新页面重试')
        }

        // 设置指定审批人
        if (startUserSelectTasks.value?.length > 0) {
          // 初始化审批人列表
          startUserSelectTasks.value.forEach((task) => {
            startUserSelectAssignees.value[task.id] = [];
          });
          
          // 设置三个独立签字人的校验规则
          if (startUserSelectTasks.value && startUserSelectTasks.value.length > 0) {
            // 为每个任务设置校验规则
            startUserSelectTasks.value.forEach((task) => {
              startUserSelectAssigneesFormRules.value[task.id] = [
                { 
                  required: true, 
                  message: '请选择审批人', 
                  trigger: 'change'
                }
              ];
            });
          }
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

// 重置单位选择并清空印章类型
const resetUnit = () => {
  selectedUnit.value = null
  // 清空已选择的印章类型
  customSealTypes.value = []
  // 清空审核人列表
  auditUserList.value = []
  // 清空注意事项
  unitNoticeContent.value = ''
}

// 监听selectedUnit变化，当选择了单位时获取印章类型和注意事项
watch(selectedUnit, async (newVal) => {
  if (newVal) {
    getSealTypeOptions()

    // 加载单位印章使用注意事项
    await getUnitNotice(newVal.id, newVal.name)

    // 更新审核人列表和同部门用户列表
    try {
      // 获取所有用户然后前端过滤
      const allUsers = await UserApi.getSimpleUserList()

      // 适配新的用户数据结构：用户现在可能属于多个部门，使用deptIds数组
      const filterUsersByDept = (users, deptId) => {
        return users.filter(user => {
          // 兼容新格式（deptIds数组）和旧格式（deptId）
          if (user.deptIds && Array.isArray(user.deptIds)) {
            return user.deptIds.includes(deptId)
          } else if (user.deptId) {
            return user.deptId === deptId
          }
          return false
        })
      }

      // 更新审核人列表（使用当前登录用户的部门ID，而不是选择的用印单位ID）
      const currentUser = userStore.getUser
      if (currentUser && currentUser.deptId) {
        auditUserList.value = filterUsersByDept(allUsers, currentUser.deptId)
        // 同部门用户列表（用于单位负责人选择）也应该使用当前用户的部门ID
        sameDeptUsersList.value = filterUsersByDept(allUsers, currentUser.deptId)
      } else {
        // 如果无法获取当前用户部门信息，则使用所有用户
        auditUserList.value = allUsers
        sameDeptUsersList.value = allUsers
      }

      console.log('更新用户列表（基于当前用户部门）:', {
        selectedUnitId: newVal.id,
        selectedUnitName: newVal.name,
        currentUserDeptId: currentUser?.deptId,
        totalUsers: allUsers.length,
        auditUsers: auditUserList.value.length,
        sameDeptUsers: sameDeptUsersList.value.length
      })

    } catch (error) {
      console.error('获取用户列表失败:', error)
      ElMessage.error('获取用户列表失败')
      // 失败时使用空列表作为备选
      auditUserList.value = []
      sameDeptUsersList.value = []
    }
  } else {
    // 清空审核人列表、同部门用户列表和注意事项
    auditUserList.value = []
    sameDeptUsersList.value = []
    unitNoticeContent.value = ''
  }
})

// 获取选中的审批人ID
const getSelectedUserId = (taskId) => {
  const assignees = startUserSelectAssignees.value[taskId]
  return assignees && assignees.length > 0 ? assignees[0] : ''
}

// 处理审批人选择变化
const handleUserSelect = (taskId, value) => {
  startUserSelectAssignees.value[taskId] = [value]
}

// 处理多选审批人变化
const handleMultiUserSelect = (taskId, value) => {
  startUserSelectAssignees.value[taskId] = value
}

// 文件上传前的验证钩子
const beforeUpload = (file) => {
  // 检查文件大小
  const isLt20M = file.size / 1024 / 1024 < 20
  if (!isLt20M) {
    ElMessage.error('上传文件大小不能超过 20MB!')
    return false
  }

  // 检查文件类型
  const fileName = file.name.toLowerCase()
  const extension = fileName.substring(fileName.lastIndexOf('.') + 1)
  const allowedTypes = ['doc', 'docx', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png', 'txt', 'ppt', 'pptx']
  const isAllowedType = allowedTypes.includes(extension)

  if (!isAllowedType) {
    ElMessage.error(`不支持的文件类型: ${extension}，请上传常见文件类型!`)
    return false
  }

  // 检查上传数量
  if (uploadedFiles.length >= 10) {
    ElMessage.error('最多只能上传10个文件!')
    return false
  }

  return true
}

// 超出限制处理函数
const handleExceed = () => {
  ElMessage.warning('最多只能上传 10 个文件!')
}
</script>

<style scoped>
.user-order {
  margin-left: 5px;
  color: #409EFF;
  font-weight: bold;
}

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

.custom-select .el-select__selection {
  font-size: 30px;
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
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60px;
  line-height: 1.4;
}

.material-name-content {
  flex: 1;
  padding: 20px 15px;
  background: #e8f4fd;
}

.material-input {
  width: 100%;
  height: 40px;
}

.material-input .el-input__inner {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
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

.custom-seal-select {
  width: 250px;
  font-size: 14px;
}

.custom-seal-select .el-input__inner {
  font-size: 14px;
  height: 36px;
  line-height: 36px;
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

.title-with-edit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.edit-unit-btn {
  font-size: 14px;
  padding: 2px 5px;
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
  max-width: 350px;
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

.title-with-edit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.edit-unit-btn {
  font-size: 14px;
  padding: 2px 5px;
}

/* 注意事项样式 */
.notice-content {
  flex: 1;
  padding: 15px;
  background: #e8f4fd;
}

.notice-text {
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
}

.notice-text p {
  margin: 8px 0;
  padding-left: 0;
}

.notice-text p:first-child {
  margin-top: 0;
}

.notice-text p:last-child {
  margin-bottom: 0;
}

/* 经办人、审核人和电话连接布局 */
.connected-fields-row {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
}

.connected-field-item {
  flex: 1;
  display: flex;
  border-right: 1px solid #ddd;
}

.connected-field-item:last-child {
  border-right: none;
}

.connected-field-header {
  width: 120px;
  min-width: 80px;
  padding: 20px 15px;
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  font-weight: bold;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60px;
  line-height: 1.4;
}

.connected-field-header.required::before {
  content: "* ";
  color: #f56c6c;
}

.connected-field-content {
  flex: 1;
  padding: 15px;
  background: white;
  display: flex;
  align-items: center;
}

.connected-field-input {
  width: 100%;
}

/* 底部操作区域样式 */
.bottom-actions-content {
  flex: 1;
  padding: 15px;
}

.bottom-actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.empty-space {
  flex: 1;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.unit-leader-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-leader-select {
  width: 150px;
}

.submit-section {
  flex-shrink: 0;
}
</style>
