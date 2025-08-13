<template>
  <ContentWrap>
    <div class="supervision-order-detail">
      <!-- 页面标题和操作按钮 -->
      <div class="page-header mb-6">
        <div class="flex justify-center items-center">
          <h2 class="text-2xl font-bold text-red-600">{{ getPageTitle() }}</h2>
        </div>
      </div>

      <!-- 督办单详情表单 -->
      <el-form
        :model="orderDetail"
        label-width="120px"
        class="order-form"
        v-loading="loading"
        element-loading-text="正在加载数据..."
      >
        <!-- 第一行：督办编号放右边 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 空白占位 -->
          </el-col>
          <el-col :span="12">
            <el-form-item label="督办编号：">
              <el-input
                :value="orderDetail.orderCode"
                readonly
                placeholder="督办编号"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：文件标题 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="文件标题：">
              <el-input :value="orderDetail.orderTitle" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：督办分类、督办依据 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="督办分类：">
              <el-input :value="orderDetail.detailType || getTypeName(orderDetail.type)" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="督办依据：">
              <el-input :value="getReasonName(orderDetail.reason)" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行：紧急程度、要求完成时间 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急程度：">
              <el-input :value="getPriorityName(orderDetail.priority)" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="要求完成时间：" label-width="140px">
              <el-input :value="formatDate(orderDetail.deadline)" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第五行：牵头单位、重要程度 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="牵头单位：">
              <el-input :value="orderDetail.leadDeptName || getDeptName(orderDetail.leadDept)" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重要程度：">
              <el-input :value="getSignificanceName(orderDetail.significance)" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第六行：协办单位 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="协办单位：">
              <!-- 牵头单位可编辑 -->
              <el-select
                v-if="canEditCollaborateDepts"
                v-model="editForm.collaborateDepts"
                multiple
                filterable
                placeholder="请选择协办单位"
                style="width: 100%"
                @change="handleCollaborateDeptsChange"
              >
                <el-option
                  v-for="dept in deptList"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.name"
                />
              </el-select>
              <!-- 只读模式 -->
              <div v-else class="readonly-tags">
                <el-tag
                  v-for="dept in getCollaborateDepts(orderDetail.coDept)"
                  :key="dept"
                  type="success"
                  class="dept-tag"
                >
                  {{ dept }}
                </el-tag>
                <span v-if="!orderDetail.coDept" class="text-gray-500">无协办单位</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第七行：督办人 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="督办人：">
              <el-input :value="orderDetail.supervisorName || '未分配'" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第八行：办公电话和分管领导 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="办公电话：">
              <el-input :value="orderDetail.officePhone || getUserMobile(orderDetail.supervisor) || '未设置'" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分管领导：">
              <el-input :value="orderDetail.leader || '(自动生成)'" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第九行：主要内容 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="主要内容：">
              <el-input
                :value="orderDetail.content"
                type="textarea"
                :rows="6"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第十行：承办事项 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="承办事项：">
              <el-input
                :value="orderDetail.undertakeMatter"
                type="textarea"
                :rows="4"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 督察办审批 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="督察办审批：">
              <el-input
                :value="getSupervisionApprovalText(orderDetail.supervisionApprove)"
                readonly
                style="width: 200px"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 牵头单位承办情况 -->
        <div class="section-title">
          <h3 class="text-lg font-medium text-red-600 mb-4">单位承办情况：</h3>
        </div>

        <!-- 承办状况 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="承办状况：">
              <!-- 牵头单位和协办单位可编辑 -->
              <el-input
                v-if="canEditLeadDeptDetail"
                v-model="editForm.leadDeptDetail"
                type="textarea"
                :rows="6"
                placeholder="请输入承办状况"
              />
              <!-- 只读模式 -->
              <el-input
                v-else
                :value="orderDetail.leadDeptDetail || '暂无'"
                type="textarea"
                :rows="6"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 督查督办复核 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="督查督办复核：">
              <el-input
                :value="getSupervisionReapprovalText(orderDetail.supervisionReapprove)"
                readonly
                style="width: 200px"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 概述部分 -->
        <div class="section-title">
          <h3 class="text-lg font-medium text-red-600 mb-4">概述：</h3>
        </div>

        <!-- 概述内容 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item>
              <div class="summary-content-simple">
                <div v-if="parsedSummary && parsedSummary.length > 0">
                  <div v-for="(item, index) in parsedSummary" :key="index" class="summary-item-simple">
                    <strong>{{ item.label }}：</strong>{{ item.value }}
                  </div>
                </div>
                <div v-else class="no-summary-simple">
                  暂无概述信息
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 附件上传区域 - 使用自定义上传 -->
        <el-row :gutter="20" v-if="hasEditPermission">
          <el-col :span="24">
            <h3 class="section-title attachment-title">附件管理</h3>
            <el-form-item label="上传附件：">
              <el-upload
                ref="uploadRef"
                v-model:file-list="fileList"
                :http-request="customUpload"
                :limit="10"
                :multiple="true"
                :auto-upload="true"
                :show-file-list="true"
                :on-error="handleCustomUploadError"
                :on-remove="handleFileRemove"
                :before-upload="beforeUpload"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                action="#"
              >
                <el-button type="primary">选取文件</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    支持上传 doc、docx、pdf、xls、xlsx、jpg、jpeg、png、txt 格式文件，单个文件不超过50MB，最多上传10个文件
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>



        <!-- 已有附件列表 -->
        <el-row :gutter="20" v-if="existingAttachments.length > 0">
          <el-col :span="24">
            <h3 class="section-title attachment-title">已有附件</h3>
            <el-table :data="existingAttachments" style="width: 100%">
              <el-table-column prop="name" label="文件名" min-width="200" />
              <el-table-column prop="size" label="文件大小" width="120">
                <template #default="scope">
                  {{ formatFileSize(scope.row.size) }}
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="上传时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button link type="primary" @click="downloadAttachment(scope.row)">
                    下载
                  </el-button>
                  <el-button
                    v-if="hasEditPermission"
                    link
                    type="danger"
                    @click="deleteAttachment(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>

      </el-form>
    </div>

  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { OrderApi, type OrderRespVO, type OrderSaveReqVO, type OrderWorkflowUpdateReqVO, type AttachmentFileInfo, type AttachmentRespVO } from '@/api/supervision'
import { getSimpleDeptList, getDept, type DeptVO } from '@/api/system/dept'
import { getSimpleUserList, type UserVO } from '@/api/system/user'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { formatDate as utilFormatDate } from '@/utils/formatTime'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox, type UploadUserFile } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { UploadFile } from '@/components/UploadFile'
import * as FileApi from '@/api/infra/file'

defineOptions({ name: 'SupervisionOrderDetail' })

const route = useRoute()
const loading = ref(false)
const userStore = useUserStore()

// 部门列表
const deptList = ref<DeptVO[]>([])

// 用户列表
const userList = ref<UserVO[]>([])

// 附件相关
const attachmentFiles = ref<any[]>([])           // 通用附件文件列表
const existingAttachments = ref<AttachmentRespVO[]>([])  // 已保存到数据库的附件
const uploadingAttachments = ref(false)          // 上传状态标识

// 自定义上传相关
const hasAttachment = ref(false)                 // 是否有附件标识
const fileList = ref<UploadUserFile[]>([])      // Element Plus上传组件的文件列表
const dataFiles = ref<number[]>([])             // 文件ID数组
const uploadedFileIds = ref<string[]>([])       // 已上传文件ID数组
const uploadRef = ref()                         // 上传组件引用
// 临时存储已上传但未保存到数据库的文件
const pendingAttachments = ref<Array<{
  name: string
  url: string
  size: number
  // type: string
}>>([])

// 自定义上传方法
const customUpload = async (options) => {
  const { file, onSuccess, onError } = options
  try {
    // 创建 FormData
    const formData = new FormData()
    formData.append('file', file)

    // 调用文件上传API
    const result = await FileApi.updateFile(formData)

    // 检查响应结果
    if (result.code === 0) {
      // 上传成功，设置文件URL
      file.url = result.data

      // 更新文件列表中对应文件的URL
      const index = fileList.value.findIndex(item => item.uid === file.uid)
      if (index !== -1) {
        fileList.value[index].url = file.url
      }

      // 检查是否已存在相同URL的文件，避免重复添加
      const existingFile = pendingAttachments.value.find(att => att.url === file.url)
      if (!existingFile) {
        pendingAttachments.value.push({
          name: file.name,
          url: file.url,
          size: file.size
          // type: file.type
        })
      } else {
        console.log('文件已存在于待处理附件列表中，跳过添加')
      }

      // 调用成功回调
      onSuccess(result)
      ElMessage.success(`文件 ${file.name} 上传成功，将在审批通过后保存`)
    } else {
      // 上传失败
      const error = new Error(result.msg || '文件上传失败')

      // 从文件列表中移除失败的文件
      const index = fileList.value.findIndex(item => item.uid === file.uid)
      if (index !== -1) {
        fileList.value.splice(index, 1)
      }

      onError(error)
      ElMessage.error(result.msg || '文件上传失败')
    }
  } catch (error) {
    console.error('文件上传失败:', error)

    // 从文件列表中移除失败的文件
    const index = fileList.value.findIndex(item => item.uid === file.uid)
    if (index !== -1) {
      fileList.value.splice(index, 1)
    }

    onError(error)
    ElMessage.error('文件上传失败，请重试')
  }
}



// 处理自定义上传失败
const handleCustomUploadError = (error: any, file: any) => {
  console.error('自定义上传失败:', error, file)
  ElMessage.error(`文件 ${file.name} 上传失败: ${error.message || '未知错误'}`)
}

// 获取已上传文件的URL列表
const getUploadedFileUrls = (): string[] => {
  return fileList.value
    .filter(file => file.url)
    .map(file => file.url!)
}

// 清理待处理的附件（在审批拒绝时调用）
const clearPendingAttachments = () => {
  pendingAttachments.value = []
  fileList.value = []
  ElMessage.info('已清理未保存的附件')
}

// 文件上传前的验证
const beforeUpload = (file: any) => {
  // 检查文件数量限制
  if (fileList.value.length >= 10) {
    ElMessage.error('上传文件数量不能超过10个!')
    return false
  }

  // 检查文件类型
  const allowedTypes = ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt']
  let fileExtension = ''
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase()
  }

  const isValidType = allowedTypes.includes(fileExtension) ||
    allowedTypes.some(type => file.type.toLowerCase().includes(type))

  if (!isValidType) {
    ElMessage.error(`文件格式不正确, 请上传 ${allowedTypes.join('/')} 格式文件!`)
    return false
  }

  // 检查文件大小 (50MB)
  const isValidSize = file.size < 50 * 1024 * 1024
  if (!isValidSize) {
    ElMessage.error('上传文件大小不能超过50MB!')
    return false
  }

  ElMessage.success('正在上传文件，请稍候...')
  return true
}

// 处理文件移除
const handleFileRemove = async (file: any) => {
  try {
    // 如果文件在临时数组中，从临时数组中移除
    if (file.url) {
      const pendingIndex = pendingAttachments.value.findIndex(att => att.url === file.url)
      if (pendingIndex !== -1) {
        pendingAttachments.value.splice(pendingIndex, 1)
        ElMessage.success('文件已移除')
        return
      }

      // 如果文件已经保存到数据库，提示用户通过工作流删除
      const attachment = existingAttachments.value.find(att => att.url === file.url)
      if (attachment) {
        ElMessage.warning('已保存的附件需要通过工作流流程进行删除')
        return
      }
    }

    // 从文件列表中移除
    const index = fileList.value.findIndex(item => item.uid === file.uid)
    if (index !== -1) {
      fileList.value.splice(index, 1)
    }
  } catch (error) {
    console.error('删除附件失败:', error)
    ElMessage.error('删除附件失败')
  }
}



// 督办单详情数据
const orderDetail = ref<OrderRespVO>({
  id: 0,
  orderCode: '',
  orderTitle: '',
  type: 1,
  detailType: '',
  reason: 1,
  priority: 1,
  deadline: 0,
  leadDept: null,
  leadDeptName: '',
  coDept: null,
  supervisor: 0,
  supervisorName: '',
  officePhone: '',
  leader: '',
  content: '',
  undertakeMatter: '',
  reportFrequency: '', // 汇报频次
  isProjectSupervision: false, // 是否立项督办
  isSupervisionClosed: false, // 是否结束督办
  leader: 0, // 分管校领导ID
  otherLeaders: '', // 其他校领导ID（逗号分隔）
  summary: '',
  processInstanceId: '',
  createTime: 0,
  // 已废弃字段保留兼容性
  significance: 1,
  supervisionApprove: null,
  leadDeptDetail: null,
  supervisionReapprove: null
})

// 编辑表单数据
const editForm = ref({
  coDept: '', // 协办单位ID字符串（逗号分隔）
  collaborateDepts: [] as string[], // 协办单位名称数组（用于显示）
  collaborateDeptIds: [] as number[], // 协办单位ID数组（用于提交）
  leadDeptDetail: '' // 牵头单位承办情况
})



// 获取部门列表
const getDeptList = async () => {
  try {
    deptList.value = await getSimpleDeptList()
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

// 获取用户列表
const getUserList = async () => {
  try {
    userList.value = await getSimpleUserList()
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 根据部门ID获取部门名称
const getDeptName = (deptId: number | null) => {
  if (!deptId) return '未分配'
  const dept = deptList.value.find(item => item.id === deptId)
  return dept?.name || '未知部门'
}

// 根据用户ID获取用户姓名
const getUserName = (userId: number | null) => {
  if (!userId) return '未分配'
  const user = userList.value.find(item => item.id === userId)
  return user?.nickname || user?.username || '未知用户'
}

// 根据用户ID获取用户手机号
const getUserMobile = (userId: number | null) => {
  if (!userId) return ''
  const user = userList.value.find(item => item.id === userId)
  return user?.mobile || ''
}

// 根据流程实例ID获取督办单详情
const getOrderDetail = async (processInstanceId: string) => {
  try {
    loading.value = true
    const data = await OrderApi.getOrderByProcessInstanceId(processInstanceId)

    // 处理字段映射，确保前端显示正确
    const processedData = {
      ...data,
      // 督办人姓名映射：如果没有supervisorName，根据supervisor ID获取
      supervisorName: data.supervisorName || getUserName(data.supervisor),
      // 办公电话映射：优先使用后端返回的办公电话，其次使用督办人手机号
      officePhone:  data.supervisorPhone || getUserMobile(data.supervisor) || '',
      // 分管领导映射：leadDeptLeader -> leader
      leader: data.leader || data.leadDeptLeader || ''
    }

    // 如果没有办公电话，尝试通过新接口获取督办人手机号
    if (!processedData.officePhone && data.supervisor) {
      try {
        const phoneData = await OrderApi.getSupervisorPhone(data.supervisor)
        if (phoneData && typeof phoneData === 'string' && phoneData.trim() !== '') {
          processedData.officePhone = phoneData.trim()
        }
      } catch (error) {
        console.error('获取督办人手机号失败:', error)
      }
    }

    orderDetail.value = processedData

    // 初始化编辑表单数据
    editForm.value.coDept = data.coDept || ''
    editForm.value.collaborateDepts = getCollaborateDepts(data.coDept)
    editForm.value.leadDeptDetail = data.leadDeptDetail || ''

    // 更新附件列表
    if (data.attachments && data.attachments.length > 0) {
      existingAttachments.value = data.attachments
    } else {
      existingAttachments.value = []
    }


  } catch (error) {
    console.error('根据流程实例ID获取督办单详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (timestamp: number | string | null) => {
  if (!timestamp) return '未设置'
  
  let time: number
  if (typeof timestamp === 'string') {
    time = parseInt(timestamp)
  } else {
    time = timestamp
  }
  
  if (isNaN(time) || time <= 0) return '未设置'
  
  return utilFormatDate(new Date(time), 'YYYY/MM/DD HH:mm')
}

// 获取页面标题
const getPageTitle = () => {
  if (!orderDetail.value.type) {
    return '督办单详情'
  }

  // type: 1=工作督办, 2=专项督办
  if (orderDetail.value.type === 1) {
    return '广西大学工作督办单'
  } else if (orderDetail.value.type === 2) {
    return '广西大学专项督办单'
  } else {
    return '广西大学督办单'
  }
}

// 获取督办分类名称
const getTypeName = (type: number) => {
  const typeOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_TYPE)
  const option = typeOptions.find(item => item.value === type)
  return option?.label || '未知分类'
}

// 获取督办依据名称
const getReasonName = (reason: number) => {
  const reasonOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_REASON)
  const option = reasonOptions.find(item => item.value === reason)
  return option?.label || '未知依据'
}

// 获取紧急程度名称
const getPriorityName = (priority: number) => {
  const priorityOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE)
  const option = priorityOptions.find(item => item.value === priority)
  return option?.label || '未知程度'
}

// 获取重要程度名称
const getSignificanceName = (significance: number) => {
  const significanceOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_SIGNIFICANCE_TYPE)
  const option = significanceOptions.find(item => item.value === significance)
  return option?.label || '未知程度'
}

// 获取协办单位列表（根据ID获取部门名称）
const getCollaborateDepts = (coDept: string | null) => {
  if (!coDept) return []

  // 将逗号分隔的ID字符串转换为部门名称数组
  const deptIds = coDept.split(',').filter(id => id.trim())
  return deptIds.map(deptId => {
    const id = parseInt(deptId.trim())
    if (isNaN(id)) return deptId.trim() // 如果不是数字，直接返回原值

    const dept = deptList.value.find(item => item.id === id)
    return dept?.name || `未知部门(${id})`
  })
}

// 获取督察办审批文本
const getSupervisionApprovalText = (approve: number | null) => {
  if (approve === null || approve === undefined) return '待审批'
  if (approve === 1) return '同意'
  if (approve === 2) return '不同意'
  return '未知状态'
}

// 获取督察办复核文本
const getSupervisionReapprovalText = (reapprove: number | null) => {
  if (reapprove === null || reapprove === undefined) return '待复核'
  if (reapprove === 1) return '同意结办'
  if (reapprove === 2) return '不同意结办'
  return '未知状态'
}

// 部门详情缓存
const deptDetailsCache = ref<Map<number, any>>(new Map())

// 权限状态
const canEditCollaborateDepts = ref(false)
const canEditLeadDeptDetail = ref(false)

// 获取部门详情（带缓存）
const getDeptDetail = async (deptId: number) => {
  if (deptDetailsCache.value.has(deptId)) {
    return deptDetailsCache.value.get(deptId)
  }

  try {
    const deptDetail = await getDept(deptId)
    deptDetailsCache.value.set(deptId, deptDetail)
    return deptDetail
  } catch (error) {
    console.error(`获取部门详情失败 (ID: ${deptId}):`, error)
    return null
  }
}

// 检查协办单位编辑权限
const checkCollaborateDeptsPermission = async () => {
  // 牵头单位负责人可以编辑协办单位
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id
  const leadDeptId = orderDetail.value.leadDept

  if (!currentUserId || !leadDeptId) {
    canEditCollaborateDepts.value = false
    return
  }

  // 通过接口获取牵头单位部门详情
  const leadDeptDetail = await getDeptDetail(leadDeptId)
  if (!leadDeptDetail) {
    canEditCollaborateDepts.value = false
    return
  }

  const hasPermission = leadDeptDetail.leaderUserId === currentUserId

  canEditCollaborateDepts.value = hasPermission
}

// 检查承办状况编辑权限
const checkLeadDeptDetailPermission = async () => {
  // 牵头单位负责人和协办单位负责人都可以编辑承办情况
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id
  const leadDeptId = orderDetail.value.leadDept

  if (!currentUserId) {
    canEditLeadDeptDetail.value = false
    return
  }

  // 检查是否是牵头单位负责人
  if (leadDeptId) {
    const leadDeptDetail = await getDeptDetail(leadDeptId)
    if (leadDeptDetail && leadDeptDetail.leaderUserId === currentUserId) {
      canEditLeadDeptDetail.value = true
      return
    }
  }

  // 检查是否是协办单位负责人
  if (orderDetail.value.coDept) {
    const coDeptIds = orderDetail.value.coDept.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))

    for (const coDeptId of coDeptIds) {
      const coDeptDetail = await getDeptDetail(coDeptId)
      if (coDeptDetail && coDeptDetail.leaderUserId === currentUserId) {
        canEditLeadDeptDetail.value = true
        return
      }
    }
  }
  canEditLeadDeptDetail.value = false
}

const hasEditPermission = computed(() => {
  return canEditCollaborateDepts.value || canEditLeadDeptDetail.value
})

// 权限检查函数
const checkAllPermissions = async () => {
  await Promise.all([
    checkCollaborateDeptsPermission(),
    checkLeadDeptDetailPermission()
  ])
}

// 监听督办单数据变化，重新检查权限
watch(
  () => [orderDetail.value.leadDept, orderDetail.value.coDept],
  async () => {
    if (orderDetail.value.id && orderDetail.value.leadDept) {
      await checkAllPermissions()
    }
  },
  { deep: true }
)

// 解析概述信息
const parsedSummary = computed(() => {
  const summary = orderDetail.value.summary || ''
  if (!summary) return []

  // 如果是字符串格式，按行分割并解析
  if (typeof summary === 'string') {
    return summary.split('\n').filter(line => line.trim()).map(line => {
      const colonIndex = line.indexOf('：')
      if (colonIndex === -1) {
        return {
          label: line.trim(),
          value: ''
        }
      }
      return {
        label: line.substring(0, colonIndex).trim(),
        value: line.substring(colonIndex + 1).trim()
      }
    })
  }

  return []
})

// 获取督办单工作流更新数据（只传递修改的字段）
const getSupervisionWorkflowUpdateData = async (startLeaderSelectAssignees?: Record<string, number[]>) => {
  const updateData: OrderWorkflowUpdateReqVO = {
    id: orderDetail.value.id // 督办单ID必传
  }

  // 获取协办单位数据 - 优先使用编辑表单的数据，其次使用原始数据
  let coDeptSource = ''
  if (canEditCollaborateDepts.value && editForm.value.coDept) {
    coDeptSource = editForm.value.coDept
  } else if (orderDetail.value.coDept) {
    coDeptSource = orderDetail.value.coDept
  }

  // 处理协办单位数据
  if (coDeptSource) {
    const { coDeptString, coDeptArray } = ensureDataConsistency(coDeptSource)
    updateData.coDept = coDeptString

    // 设置工作流自选审批人 - 传递协办部门的负责人ID而不是部门ID
    if (coDeptArray.length > 0) {
      // 使用await等待异步获取部门负责人ID
      const leaderIds = await getDeptLeaderIds(coDeptArray)
      if (leaderIds.length > 0) {
        updateData.startLeaderSelectAssignees = {
          "Third": [...leaderIds] // 使用部门负责人ID数组
        }
      } else {
        console.warn('协办部门没有找到对应的负责人，跳过设置 startLeaderSelectAssignees')
      }
    }
  }

  // 处理承办情况
  if (canEditLeadDeptDetail.value && editForm.value.leadDeptDetail) {
    updateData.deptDetail = editForm.value.leadDeptDetail
  }

  // 添加附件列表信息（包含已有附件和待处理附件）
  const allAttachments: AttachmentFileInfo[] = []

  // 添加已有附件
  if (existingAttachments.value.length > 0) {
    allAttachments.push(...existingAttachments.value.map(attachment => ({
      id: attachment.id!,
      name: attachment.name,
      url: attachment.url,
      size: attachment.size,
      type: attachment.type
    })))
  }

  // 添加待处理附件
  if (pendingAttachments.value.length > 0) {
    allAttachments.push(...pendingAttachments.value.map(attachment => ({
      name: attachment.name,
      url: attachment.url,
      size: attachment.size,
      // type: attachment.type
    })))
  }

  // 如果有附件，添加到更新数据中
  if (allAttachments.length > 0) {
    updateData.fileList = allAttachments
  }
  return updateData
}

// 更新督办单数据（供工作流调用）
const updateSupervisionOrder = async (startLeaderSelectAssignees?: Record<string, number[]>) => {
  try {
    const updateData = await getSupervisionWorkflowUpdateData(startLeaderSelectAssignees)

    // 只有当有实际修改的字段时才调用接口
    const hasChanges = (updateData.coDept !== undefined) ||
                      (updateData.deptDetail !== undefined) ||
                      (updateData.startLeaderSelectAssignees !== undefined) ||
                      (updateData.fileLIst !== undefined) ||
                      (pendingAttachments.value.length > 0) // 有待处理附件时也需要更新

    if (hasChanges) {
      await OrderApi.updateOrderInWorkflow(updateData)

      // 更新本地数据
      if (canEditCollaborateDepts.value && updateData.coDept !== undefined) {
        orderDetail.value.coDept = editForm.value.coDept
      }
      if (canEditLeadDeptDetail.value && updateData.deptDetail !== undefined) {
        orderDetail.value.leadDeptDetail = editForm.value.leadDeptDetail
      }
    }

    // 审批通过时清空待处理的附件列表（因为已经在工作流更新中包含了）
    if (pendingAttachments.value.length > 0) {
      pendingAttachments.value = []

      // 重新加载附件列表以显示最新状态
      await loadAttachments()
    }

    // 返回更新的数据，供工作流使用
    return {
      success: true,
      data: updateData
    }
  } catch (error) {
    console.error('更新督办单失败:', error)
    ElMessage.error('更新督办单失败')
    return {
      success: false,
      data: null
    }
  }
}

// 处理协办单位变化
const handleCollaborateDeptsChange = (deptNames: string[]) => {
  editForm.value.collaborateDeptIds = []
  deptNames.forEach(name => {
    const dept = deptList.value.find(d => d.name === name)
    if (dept) {
      editForm.value.collaborateDeptIds.push(dept.id)
    }
  })
  editForm.value.coDept = editForm.value.collaborateDeptIds.join(',')
}

// 获取部门负责人ID的辅助函数
const getDeptLeaderIds = async (deptIds: number[]): Promise<number[]> => {
  const leaderIds: number[] = []

  // 使用Promise.all并行获取所有部门详细信息
  await Promise.all(deptIds.map(async (deptId) => {
    try {
      // 使用getDept API获取完整的部门信息
      const deptInfo = await getDept(deptId)

      if (deptInfo && deptInfo.leaderUserId) {
        leaderIds.push(deptInfo.leaderUserId)
      } else {
        console.warn(`部门 ID:${deptId} 没有设置负责人`)
      }
    } catch (error) {
      console.error(`获取部门ID:${deptId}的详细信息失败:`, error)
    }
  }))

  return leaderIds
}

// 确保协办单位数据格式一致性的辅助函数
const ensureDataConsistency = (coDeptString: string): { coDeptString: string, coDeptArray: number[] } => {
  if (!coDeptString || coDeptString.trim() === '') {
    return { coDeptString: '', coDeptArray: [] }
  }

  // 处理字符串，分割并转换为数字
  const coDeptArray = coDeptString.split(',')
    .map(id => {
      const trimmed = id.trim()
      const parsed = parseInt(trimmed)
      return parsed
    })
    .filter(id => !isNaN(id))

  const consistentString = coDeptArray.join(',')

  return {
    coDeptString: consistentString,
    coDeptArray: coDeptArray
  }
}

// 附件相关方法
const loadAttachments = async () => {
  if (!orderDetail.value.id) return

  try {
    // 现在附件信息包含在督办单详情中，重新获取督办单详情
    const processInstanceId = route.query.processInstanceId as string ||
                             route.query.id as string
    if (processInstanceId) {
      await getOrderDetail(processInstanceId)
    }
  } catch (error) {
    console.error('加载附件列表失败:', error)
  }
}
const downloadAttachment = (attachment: AttachmentRespVO) => {
  // 下载附件
  window.open(attachment.url, '_blank')
}

const deleteAttachment = async (attachment: AttachmentRespVO) => {
  try {
    await ElMessageBox.confirm(
      '已保存的附件删除需要通过工作流流程处理，当前版本暂不支持直接删除。',
      '提示',
      {
        type: 'info',
        confirmButtonText: '我知道了',
        showCancelButton: false
      }
    )
  } catch (error) {
    // 用户点击了确定按钮，不需要处理
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 初始化
onMounted(async () => {
  // 先获取部门列表和用户列表，确保字段映射能正确工作
  await Promise.all([
    getDeptList(),
    getUserList()
  ])

  // 获取流程实例ID，支持多种传参方式
  const processInstanceId = route.query.processInstanceId as string ||
                           route.params.id as string ||
                           route.query.id as string

  if (processInstanceId) {
    // 直接使用流程实例ID获取督办单详情（包含附件信息）
    await getOrderDetail(processInstanceId)

    // 数据加载完成后，检查权限
    await checkAllPermissions()
  } else {
    console.error('缺少流程实例ID参数')
  }
})

// 检查当前用户是否为牵头单位负责人
const checkIsLeadDeptLeader = async (): Promise<boolean> => {
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id
  const leadDeptId = orderDetail.value.leadDept

  if (!currentUserId || !leadDeptId) {
    return false
  }

  // 通过接口获取牵头单位部门详情
  const leadDeptDetail = await getDeptDetail(leadDeptId)
  if (!leadDeptDetail) {
    return false
  }

  return leadDeptDetail.leaderUserId === currentUserId
}

// 检查当前用户是否为协办单位负责人
const checkIsCoDeptLeader = async (): Promise<boolean> => {
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id

  if (!currentUserId || !orderDetail.value.coDept) {
    return false
  }

  // 检查是否是协办单位负责人
  const coDeptIds = orderDetail.value.coDept.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))

  for (const coDeptId of coDeptIds) {
    const coDeptDetail = await getDeptDetail(coDeptId)
    if (coDeptDetail && coDeptDetail.leaderUserId === currentUserId) {
      return true
    }
  }

  return false
}

// 获取督办单详情数据（用于外部调用）
const getOrderDetailData = () => {
  return orderDetail.value
}

// 获取编辑表单数据
const getEditFormData = () => {
  return editForm.value
}

// 暴露方法供外部调用
defineExpose({
  updateSupervisionOrder,
  clearPendingAttachments,
  hasEditPermission: computed(() => hasEditPermission.value),
  pendingAttachmentsCount: computed(() => pendingAttachments.value.length),
  checkIsLeadDeptLeader,
  checkIsCoDeptLeader,
  getOrderDetailData,
  getEditFormData,
  canEditCollaborateDepts: computed(() => canEditCollaborateDepts.value),
  canEditLeadDeptDetail: computed(() => canEditLeadDeptDetail.value)
})
</script>

<style scoped>
.supervision-order-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.order-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 30px 0 20px 0;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  color: #303133;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-textarea__inner) {
  border-radius: 4px;
}

/* 只读标签样式 */
.readonly-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
  align-items: center;
}

/* 附件上传样式 */
.upload-tip {
  margin-top: 8px;
}

/* 自定义上传样式 */
.uploaded-urls {
  margin-top: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.uploaded-urls h4 {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.uploaded-urls ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.uploaded-urls li {
  margin-bottom: 4px;
  word-break: break-all;

  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.readonly-tags .el-tag {
  margin: 0;
}

/* 概述内容样式 */
.summary-content {
  min-height: 100px;
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
}

.summary-item {
  margin-bottom: 8px;
  line-height: 1.6;
}

.summary-item strong {
  color: #303133;
  margin-right: 8px;
}

.no-summary {
  color: #909399;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

/* 简化的概述内容样式 - 去掉框框 */
.summary-content-simple {
  margin-bottom: 20px;
}

.summary-item-simple {
  margin-bottom: 8px;
  line-height: 1.6;
}

.summary-item-simple strong {
  color: #303133;
  margin-right: 8px;
}

.no-summary-simple {
  color: #909399;
  font-style: italic;
}

/* 部门标签样式 */
.dept-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

/* 附件管理标题样式 */
.attachment-title {
  color: #dc2626 !important;
  font-weight: 600;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
}
/* 只读输入框样式 */
:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

/* 确保只读状态下的样式 */
:deep(.el-input__inner[readonly]) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: default;
}

:deep(.el-textarea__inner[readonly]) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: default;
}
</style>
