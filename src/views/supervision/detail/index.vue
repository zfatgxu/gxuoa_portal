<template>
  <ContentWrap>
    <div class="supervision-order-detail">
      <!-- 页面标题 - 移到表格外面 -->
      <div class="page-header-outside">
        <h1 class="form-title">{{ getPageTitle() }}</h1>
      </div>



      <!-- 督办单详情表单 -->
      <div class="order-form-container" v-loading="loading" element-loading-text="正在加载数据...">
        <!-- 表单主体 -->
        <el-form
          :model="orderDetail"
          class="order-form"
        >
          <!-- 表格式布局 -->
          <div class="form-table">
            <!-- 督办编号行 -->
            <div class="form-row">
              <div class="form-content full-width order-number-content">
                <span class="order-number-label">{{ getOrderNumberLabel() }}：</span>
                <span class="order-number-display">{{ orderDetail.orderCode || '未生成' }}</span>
              </div>
            </div>

            <!-- 督办事项 -->
            <div class="form-row">
              <div class="form-label">督办事项</div>
              <div class="form-content full-width">
                <el-input :value="orderDetail.orderTitle" readonly />
              </div>
            </div>

            <!-- 主要内容 -->
            <div class="form-row">
              <div class="form-label">主要内容</div>
              <div class="form-content full-width">
                <el-input
                  type="textarea"
                  :value="orderDetail.content"
                  readonly
                  :rows="4"
                />
              </div>
            </div>

            <!-- 督办分类和督办依据 -->
            <div class="form-row">
              <div class="form-label">督办分类</div>
              <div class="form-content half-width">
                <el-input :value="orderDetail.detailType || getTypeName(orderDetail.type)" readonly />
              </div>
              <div class="form-label">督办依据</div>
              <div class="form-content half-width">
                <el-input :value="getReasonName(orderDetail.reason)" readonly />
              </div>
            </div>

            <!-- 紧急程度和完成期限 -->
            <div class="form-row">
              <div class="form-label">紧急程度</div>
              <div class="form-content half-width">
                <el-input :value="getPriorityName(orderDetail.priority)" readonly />
              </div>
              <div class="form-label">完成期限</div>
              <div class="form-content half-width">
                <div class="deadline-container">
                  <el-input :value="formatDate(orderDetail.deadline)" readonly class="deadline-display" />
                  <el-input :value="getReportFrequencyName(orderDetail.reportFrequency)" readonly class="report-frequency-display" />
                </div>
              </div>
            </div>

            <!-- 分管校领导和其他校领导 -->
            <div class="form-row">
              <div class="form-label">分管校领导</div>
              <div class="form-content half-width">
                <el-input :value="getLeadLeaderDisplay()" readonly />
              </div>
              <div class="form-label">其他校领导</div>
              <div class="form-content half-width">
                <el-input :value="getOtherLeadersDisplay()" readonly />
              </div>
            </div>

            <!-- 牵头单位和协办单位 -->
            <div class="form-row">
              <div class="form-label">牵头单位</div>
              <div class="form-content half-width">
                <!-- 督办人可编辑 -->
                <el-select
                  v-if="canEditLeadDept"
                  v-model="editForm.leadDept"
                  filterable
                  placeholder="请选择牵头单位"
                  style="width: 100%"
                  @change="handleLeadDeptChange"
                >
                  <el-option
                    v-for="dept in deptList"
                    :key="dept.id"
                    :label="dept.name"
                    :value="dept.id"
                  />
                </el-select>
                <!-- 只读模式 -->
                <el-input
                  v-else
                  :value="orderDetail.leadDeptName || getDeptName(orderDetail.leadDept) || '待督办人选择'"
                  readonly
                />
              </div>
              <div class="form-label">协办单位</div>
              <div class="form-content half-width">
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
                <template v-else>
                  <el-input
                    v-if="!orderDetail.coDept"
                    value="待牵头单位选择"
                    readonly
                  />
                  <div v-else class="readonly-tags">
                    <el-tag
                      v-for="dept in getCollaborateDepts(orderDetail.coDept)"
                      :key="dept"
                      type="success"
                      class="dept-tag"
                    >
                      {{ dept }}
                    </el-tag>
                  </div>
                </template>
              </div>
            </div>

            <!-- 督办人和联系电话 -->
            <div class="form-row">
              <div class="form-label">督办人</div>
              <div class="form-content half-width">
                <el-input :value="getSupervisorNames()" readonly />
              </div>
              <div class="form-label">联系电话</div>
              <div class="form-content half-width">
                <el-input :value="getSupervisorPhones()" readonly />
              </div>
            </div>



            <!-- 工作推进情况 -->
            <div class="form-row">
              <div class="form-label">工作推进情况</div>
              <div class="form-content full-width">
                <!-- 牵头单位和协办单位可编辑 -->
                <el-input
                  v-if="canEditLeadDeptDetail"
                  v-model="editForm.leadDeptDetail"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入工作推进情况"
                />
                <!-- 只读模式 -->
                <el-input
                  v-else
                  :value="orderDetail.deptDetail || '待各单位输入'"
                  type="textarea"
                  :rows="4"
                  readonly
                />
              </div>
            </div>

            <!-- 是否立项督办 -->
            <div class="form-row">
              <div class="form-label">是否立项督办</div>
              <div class="form-content full-width">
                <el-input :value="orderDetail.isProjectSupervision ? '是' : '否'" readonly />
              </div>
            </div>

            <!-- 是否结束督办 -->
            <div class="form-row">
              <div class="form-label">是否结束督办</div>
              <div class="form-content full-width">
                <el-input :value="orderDetail.isSupervisionClosed ? '是' : '否'" readonly />
              </div>
            </div>

            <!-- 概述 -->
            <div class="form-row">
              <div class="form-label">概述</div>
              <div class="form-content full-width">
                <div class="summary-content-inline">
                  <div v-if="parsedSummary && parsedSummary.length > 0">
                    <div v-for="(item, index) in parsedSummary" :key="index" class="summary-item-inline">
                      <strong>{{ item.label }}：</strong>{{ item.value }}
                    </div>
                  </div>
                  <div v-else class="no-summary-inline">
                    暂无概述信息
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 附件管理部分 -->
      <div class="attachment-section" v-if="hasEditPermission || existingAttachments.length > 0">
        <h3 class="section-title">附件管理</h3>

        <!-- 附件上传区域 -->
        <div v-if="hasEditPermission" class="upload-section">
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
                支持上传 doc、docx、pdf、xls、xlsx、jpg、jpeg、png、txt 格式文件，单个文件不超过20MB，最多上传10个文件
              </div>
            </template>
          </el-upload>
        </div>

        <!-- 已有附件列表 -->
        <div v-if="existingAttachments.length > 0" class="existing-attachments">
          <h4 class="attachment-subtitle">已有附件</h4>
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
        </div>
      </div>
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
import * as ProcessInstanceApi from '@/api/bpm/processInstance'

defineOptions({ name: 'SupervisionOrderDetail' })

// 定义props，支持从父组件传递参数
const props = defineProps<{
  id?: string | number  // 可以是督办单ID或流程实例ID
  activityNodes?: any[]
  applyUser?: string
  applyTime?: string
  status?: number
}>()

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

  // 检查文件大小 (20MB)
  const isValidSize = file.size < 20 * 1024 * 1024
  if (!isValidSize) {
    ElMessage.error('上传文件大小不能超过20MB!')
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
  coDept: '',
  supervisors: [], // 督办人数组
  leadLeaders: [], // 分管领导和其他校领导数组
  content: '',
  deptDetail: null, // 工作推进情况
  reportFrequency: undefined, // 汇报频次
  isProjectSupervision: null, // 是否立项督办
  isSupervisionClosed: null, // 是否结束督办
  summary: '',
  processInstanceId: '',
  createTime: 0
})

// 编辑表单数据
const editForm = ref({
  leadDept: null as number | null, // 牵头单位ID
  coDept: '', // 协办单位ID字符串（逗号分隔）
  collaborateDepts: [] as string[], // 协办单位名称数组（用于显示）
  collaborateDeptIds: [] as number[], // 协办单位ID数组（用于提交）
  leadDeptDetail: '' // 牵头单位工作推进情况
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
  if (!deptId || deptId === 0) return '待督办人选择'
  const dept = deptList.value.find(item => item.id === deptId)
  return dept?.name || `未知部门(${deptId})`
}



// 根据流程实例ID获取督办单详情
const getOrderDetail = async (processInstanceId: string) => {
  try {
    loading.value = true
    const data = await OrderApi.getOrderByProcessInstanceId(processInstanceId)

    if (!data) {
      throw new Error('API返回的数据为空')
    }

    if (!data.id) {
      throw new Error('督办单数据无效：缺少ID字段')
    }

    // 直接使用新的API数据结构
    orderDetail.value = {
      ...data,
      // 确保数组字段正确初始化
      supervisors: data.supervisors || [],
      leadLeaders: data.leadLeaders || [],
      // 确保其他字段正确处理null值
      coDept: data.coDept || '',
      leadDept: data.leadDept || null,
      deptDetail: data.deptDetail || null
    }

    // 初始化编辑表单数据
    editForm.value.leadDept = data.leadDept || null
    editForm.value.coDept = data.coDept || ''
    editForm.value.collaborateDepts = getCollaborateDepts(data.coDept)
    editForm.value.leadDeptDetail = data.deptDetail || ''

    // 更新附件列表
    if (data.attachments && data.attachments.length > 0) {
      existingAttachments.value = data.attachments
    } else {
      existingAttachments.value = []
    }


  } catch (error) {
    console.error('根据流程实例ID获取督办单详情失败:', error)
    // 显示错误信息给用户
    ElMessage.error('获取督办单详情失败，请稍后重试')
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

// 获取督办编号标签
const getOrderNumberLabel = () => {
  if (!orderDetail.value.type) {
    return '督办编号'
  }

  // type: 1=工作督办, 2=专项督办
  if (orderDetail.value.type === 1) {
    return '督办编号'  // 工作督办单显示"督办编号"
  } else if (orderDetail.value.type === 2) {
    return '督查编号'  // 专项督办单显示"督查编号"
  } else {
    return '督办编号'
  }
}

// 获取汇报频次名称
const getReportFrequencyName = (frequency: number | undefined) => {
  if (!frequency) return '未设置'

  // 从字典中获取汇报频次选项
  const frequencyOptions = getIntDictOptions(DICT_TYPE.REPORT_FREQUENCY)
  const option = frequencyOptions.find(item => item.value === frequency)

  if (option) {
    // 如果字典中的label已经包含"汇报"，直接返回
    if (option.label.includes('汇报')) {
      return option.label
    }
    // 如果不包含"汇报"，则拼接
    return `汇报${option.label}`
  }

  return '未知频次'
}

// 获取分管校领导显示文本
const getLeadLeaderDisplay = () => {
  if (!orderDetail.value.leadLeaders || !Array.isArray(orderDetail.value.leadLeaders)) {
    return '待牵头单位确定后自动生成'
  }

  const leadLeaders = orderDetail.value.leadLeaders.filter(leader => leader.type === '分管领导')
  if (leadLeaders.length === 0) {
    return '待牵头单位确定后自动生成'
  }

  return leadLeaders.map(leader => leader.name).join('、')
}

// 获取其他校领导显示文本
const getOtherLeadersDisplay = () => {
  if (!orderDetail.value.leadLeaders || !Array.isArray(orderDetail.value.leadLeaders)) {
    return '无'
  }

  const otherLeaders = orderDetail.value.leadLeaders.filter(leader => leader.type === '其他分管领导')
  if (otherLeaders.length === 0) {
    return '无'
  }

  return otherLeaders.map(leader => leader.name).join('、')
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
  if (!coDept || coDept.trim() === '') return []

  // 将逗号分隔的ID字符串转换为部门名称数组
  const deptIds = coDept.split(',').filter(id => id.trim())
  return deptIds.map(deptId => {
    const id = parseInt(deptId.trim())
    if (isNaN(id)) return deptId.trim() // 如果不是数字，直接返回原值

    const dept = deptList.value.find(item => item.id === id)
    return dept?.name || `未知部门(${id})`
  })
}

// 获取督办人列表
const getSupervisorNames = () => {
  if (!orderDetail.value.supervisors || !Array.isArray(orderDetail.value.supervisors)) {
    return '未分配'
  }

  if (orderDetail.value.supervisors.length === 0) {
    return '未分配'
  }

  const supervisorNames = orderDetail.value.supervisors.map(s => s.name).filter(name => name)
  return supervisorNames.length > 0 ? supervisorNames.join('、') : '未分配'
}

// 获取督办人联系电话
const getSupervisorPhones = () => {
  if (!orderDetail.value.supervisors || !Array.isArray(orderDetail.value.supervisors)) {
    return '未设置'
  }

  if (orderDetail.value.supervisors.length === 0) {
    return '未设置'
  }

  // 如果只有一个督办人，显示其电话
  if (orderDetail.value.supervisors.length === 1) {
    return orderDetail.value.supervisors[0].phone || '未设置'
  }

  // 如果有多个督办人，显示所有电话（用、分隔）
  const phones = orderDetail.value.supervisors
    .map(s => s.phone)
    .filter(phone => phone)

  return phones.length > 0 ? phones.join('、') : '未设置'
}



// 权限状态
const canEditLeadDept = ref(false)           // 牵头单位编辑权限
const canEditCollaborateDepts = ref(false)   // 协办单位编辑权限
const canEditLeadDeptDetail = ref(false)     // 工作推进情况编辑权限

// 完整的活动节点数据（从审批详情API获取）
const fullActivityNodes = ref<any[]>([])

// 获取完整的审批详情（包含完整的活动节点信息）
const getFullApprovalDetail = async (processInstanceId: string) => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processInstanceId: processInstanceId
    })

    if (data && data.activityNodes) {
      fullActivityNodes.value = data.activityNodes
    }
  } catch (error) {
    console.error('获取完整审批详情失败:', error)
  }
}

// 获取当前工作流节点（可能有多个并行节点）
const getCurrentWorkflowNodes = () => {
  if (fullActivityNodes.value && fullActivityNodes.value.length > 0) {
    const runningNodes = fullActivityNodes.value.filter(node => node.status === 1)
    return runningNodes.map(node => node.id || node.taskDefinitionKey || node.activityId).filter(id => id)
  }
  return []
}

// 节点权限配置映射表
const NODE_PERMISSIONS = {
  'select_leaddept': {
    leadDept: true,           //  督办人可编辑牵头单位
    collaborateDepts: false,  // 
    leadDeptDetail: false,    // 
    attachments: true         //如有编辑权限可上传附件
  },
  'implement_plan': {
    leadDept: false,          // 
    collaborateDepts: true,   // 牵头单位负责人可编辑协办单位
    leadDeptDetail: true,     //牵头/协办负责人可编辑工作推进情况
    attachments: true         // 如有编辑权限可上传附件
  },
  'upload_plan': {
    leadDept: false,          // 
    collaborateDepts: false,  // 
    leadDeptDetail: true,     //  牵头/协办负责人可编辑工作推进情况
    attachments: true         //  如有编辑权限可上传附件
  },
  'co_dept': {
    leadDept: false,
    collaborateDepts: false,
    leadDeptDetail: true,     // 协办负责人可编辑工作推进情况
    attachments: true
  }
}

// 检查当前用户的所有编辑权限
const checkCurrentUserPermissions = () => {
  const currentUserId = userStore.getUser?.id
  if (!currentUserId || !fullActivityNodes.value.length) {
    return { leadDept: false, collaborateDepts: false, leadDeptDetail: false, attachments: false }
  }

  const permissions = {
    leadDept: false,
    collaborateDepts: false,
    leadDeptDetail: false,
    attachments: false
  }

  // 遍历所有运行中的活动节点
  fullActivityNodes.value.forEach(node => {
    if (node.status !== 1) return // 只处理运行中的节点

    const nodeId = node.id || node.taskDefinitionKey || node.activityId
    let hasAccess = false

    // 检查节点的tasks中是否有当前用户
    if (node.tasks && node.tasks.length > 0) {
      hasAccess = node.tasks.some(task =>
        (task.assigneeUser && task.assigneeUser.id === currentUserId) ||
        (task.ownerUser && task.ownerUser.id === currentUserId)
      )
    }

    // 检查candidateUsers
    if (!hasAccess && node.candidateUsers && node.candidateUsers.length > 0) {
      hasAccess = node.candidateUsers.some(user => user.id === currentUserId)
    }

    if (!hasAccess) return

    // 根据节点ID获取权限配置
    const nodePermissions = NODE_PERMISSIONS[nodeId]
    if (nodePermissions) {
      Object.keys(nodePermissions).forEach(key => {
        if (nodePermissions[key]) {
          permissions[key] = true
        }
      })
    }
  })

  return permissions
}

// 统一权限检查（替换原有的三个权限检查方法）
const checkAllPermissions = async () => {
  const permissions = checkCurrentUserPermissions()

  // 更新权限状态
  canEditLeadDept.value = permissions.leadDept
  canEditCollaborateDepts.value = permissions.collaborateDepts
  canEditLeadDeptDetail.value = permissions.leadDeptDetail

  // 附件权限基于是否有任何编辑权限
  const hasAnyEditPermission = permissions.leadDept ||
                               permissions.collaborateDepts ||
                               permissions.leadDeptDetail
  // 这里可以根据实际需求调整附件权限逻辑
}

const hasEditPermission = computed(() => {
  return canEditLeadDept.value || canEditCollaborateDepts.value || canEditLeadDeptDetail.value
})

// 监听督办单数据变化，重新检查权限
watch(
  () => [orderDetail.value.supervisors, orderDetail.value.leadDept, orderDetail.value.coDept],
  async () => {
    if (orderDetail.value.id) {
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

    // 工作流审批人配置由后端自动设置，前端不需要处理
  }

  // 处理牵头单位（督办人可编辑）
  if (canEditLeadDept.value && editForm.value.leadDept) {
    updateData.leadDept = Number(editForm.value.leadDept)
  } else if (orderDetail.value.leadDept) {
    updateData.leadDept = Number(orderDetail.value.leadDept)
  }

  // 处理工作推进情况
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
    const hasChanges = (updateData.leadDept !== undefined) ||
                      (updateData.coDept !== undefined) ||
                      (updateData.deptDetail !== undefined) ||
                      (updateData.fileLIst !== undefined) ||
                      (pendingAttachments.value.length > 0) // 有待处理附件时也需要更新

    if (hasChanges) {
      await OrderApi.updateOrderInWorkflow(updateData)

      // 更新本地数据
      if (updateData.leadDept !== undefined) {
        orderDetail.value.leadDept = updateData.leadDept
      }
      if (canEditCollaborateDepts.value && updateData.coDept !== undefined) {
        orderDetail.value.coDept = editForm.value.coDept
      }
      if (canEditLeadDeptDetail.value && updateData.deptDetail !== undefined) {
        orderDetail.value.deptDetail = editForm.value.leadDeptDetail
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

// 处理牵头单位变化
const handleLeadDeptChange = (deptId: number) => {
  editForm.value.leadDept = deptId
  // 牵头单位变化时，清空协办单位选择（因为协办单位的选择权限可能会变化）
  editForm.value.collaborateDepts = []
  editForm.value.collaborateDeptIds = []
  editForm.value.coDept = ''
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

  // 获取流程实例ID，优先使用props传递的参数，然后使用路由参数
  const processInstanceId = props.id?.toString() ||
                           route.query.processInstanceId as string ||
                           route.params.id as string ||
                           route.query.id as string

  if (processInstanceId) {
    // 获取完整的审批详情（包含完整的活动节点信息）
    await getFullApprovalDetail(processInstanceId)

    // 直接使用流程实例ID获取督办单详情（包含附件信息）
    await getOrderDetail(processInstanceId)

    // 数据加载完成后，检查权限
    await checkAllPermissions()
  } else {
    console.error('缺少流程实例ID参数')
  }
})



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
  getOrderDetailData,
  getEditFormData,
  canEditLeadDept: computed(() => canEditLeadDept.value),
  canEditCollaborateDepts: computed(() => canEditCollaborateDepts.value),
  canEditLeadDeptDetail: computed(() => canEditLeadDeptDetail.value)
})
</script>

<style scoped>
.supervision-order-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面标题样式 - 与创建页面一致 */
.page-header-outside {
  text-align: center;
  margin-bottom: 30px;
}

.form-title {
  font-size: 28px;
  font-weight: bold;
  color: #d32f2f;
  letter-spacing: 2px;
  line-height: 1.4;
  margin: 0;
  font-family: "STXiaobiao", "SimSun", "Microsoft YaHei", serif;
}

/* 表单容器样式 - 与创建页面一致 */
.order-form-container {
  background: white;
  border: 2px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px auto;
  max-width: 1000px;
}

/* 督办编号样式 - 与创建页面一致 */
.order-number-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
  gap: 5px;
}

.order-number-label {
  font-size: 15px;
  color: #d32f2f;
  font-weight: bold;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

.order-number-display {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

/* 表单样式 - 与创建页面一致 */
.order-form {
  padding: 0;
}

.form-table {
  width: 100%;
}

.form-row {
  display: flex;
  border-bottom: 1px solid #e8eaed;
  min-height: 50px;
  align-items: stretch;
  transition: background-color 0.2s ease;
}

.form-row:hover {
  background-color: #fafafa;
}

.form-row:last-child {
  border-bottom: none;
}

.form-label {
  background: white;
  color: #d32f2f;
  border-right: 1px solid #e8eaed;
  padding: 12px 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  min-width: 120px;
  width: 120px;
  font-size: 15px;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

/* 确保第二个标签有左边框 */
.form-row .form-label:nth-child(3) {
  border-left: 1px solid #e8eaed;
}

.form-content {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  flex: 1;
  background: white;
  transition: all 0.2s ease;
}

.form-content.full-width {
  flex: 1;
}

.form-content.half-width {
  flex: 1;
  min-width: 0;
  border-right: 1px solid #e8eaed;
}

.form-content.half-width:first-child {
  flex: 0.8;
}

.form-content.half-width:last-child {
  flex: 1.2;
  border-right: none;
}

/* 移除Element Plus默认样式 */
:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  display: none;
}

:deep(.el-form-item__content) {
  margin-left: 0 !important;
  width: 100%;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8eaed;
  background: white;
  transition: all 0.2s ease;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
  border: 1px solid #e8eaed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
  resize: none;
  transition: all 0.2s ease;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 6px;
  border: 1px solid #e8eaed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
  transition: all 0.2s ease;
}

/* 完成期限容器样式 */
.deadline-container {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
}

.deadline-display {
  flex: 1;
}

.report-frequency-display {
  width: 130px;
}

/* 只读标签样式 */
.readonly-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
  align-items: center;
}

.readonly-tags .el-tag {
  margin: 0;
}

/* 内联概述样式 */
.summary-content-inline {
  width: 100%;
}

.summary-item-inline {
  margin-bottom: 8px;
  line-height: 1.6;
  font-size: 14px;
}

.summary-item-inline strong {
  color: #303133;
  margin-right: 8px;
}

.no-summary-inline {
  color: #909399;
  font-style: italic;
  font-size: 14px;
}

/* 附件部分样式 */
.attachment-section {
  background: white;
  border: 2px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  max-width: 1000px;
  padding: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #d32f2f;
  letter-spacing: 1px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8eaed;
}

.upload-section {
  margin-bottom: 30px;
}

.existing-attachments {
  margin-top: 20px;
}

.attachment-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 15px;
}

/* 部门标签样式 */
.dept-tag {
  margin-right: 8px;
  margin-bottom: 4px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .supervision-order-detail {
    padding: 10px;
  }

  .order-form-container, .attachment-section {
    margin: 10px 0;
    max-width: none;
    border-width: 1px;
    padding: 20px;
  }

  .form-title {
    font-size: 24px;
    letter-spacing: 1px;
  }

  .form-row {
    flex-direction: column;
    min-height: auto;
  }

  .form-label {
    width: 100%;
    min-width: auto;
    border-right: none;
    border-bottom: 1px solid #e8eaed;
    justify-content: flex-start;
    padding: 10px 16px;
  }

  .form-content {
    width: 100%;
    padding: 12px 16px;
  }

  .form-content.half-width {
    flex: 1;
    border-right: none;
  }
}
</style>
