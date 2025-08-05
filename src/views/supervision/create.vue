<template>
  <ContentWrap>
    <div class="supervision-order-create">
      <!-- 页面标题 -->
      <div class="page-header mb-6 text-center">
        <h2 class="text-2xl font-bold text-red-600">{{ pageTitle }}</h2>
      </div>

      <!-- 督办单表单 -->
      <el-form
        :model="orderForm"
        :rules="rules"
        ref="orderFormRef"
        label-width="120px"
        class="order-form"
        v-loading="dataLoading"
        element-loading-text="正在加载数据..."
        :show-message="true"
        :inline-message="false"
        status-icon
      >
        <!-- 第一行：督办编号放右边 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 空白占位 -->
          </el-col>
          <el-col :span="12">
            <el-form-item label="督办编号：" prop="orderNumber">
              <el-input
                v-model="orderForm.orderNumber"
                placeholder="正在生成督办编号..."
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：文件标题 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="文件标题：" prop="title">
              <el-input v-model="orderForm.title" placeholder="请输入文件标题" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：督办分类、督办依据 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="督办分类：" prop="category">
              <el-select v-model="orderForm.category" placeholder="请选择督办分类" style="width: 100%">
                <el-option
                  v-for="dict in supervisionTypeOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="督办依据：" prop="basis">
              <el-select v-model="orderForm.basis" placeholder="请选择督办依据" style="width: 100%">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_REASON)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行：紧急程度、要求完成时间 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急程度：" prop="urgencyLevel">
              <el-select v-model="orderForm.urgencyLevel" placeholder="请选择紧急程度" style="width: 100%">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="要求完成时间：" prop="deadline" label-width="140px">
              <el-date-picker
                v-model="orderForm.deadline"
                type="datetime"
                placeholder="请选择完成时间"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第五行：牵头单位、重要程度 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="牵头单位：" prop="leadDept">
              <el-select
                v-model="orderForm.leadDept"
                placeholder="牵头部门"
                style="width: 100%"
                @change="handleLeadDeptChange"
              >
                <el-option
                  v-for="dept in deptList"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.name"
                  :data-id="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重要程度：" prop="importance">
              <el-select v-model="orderForm.importance" placeholder="请选择重要程度" style="width: 100%">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_SIGNIFICANCE_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第六行：协办单位 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="协办单位：" prop="collaborateDepts" >
              <el-select
                v-model="orderForm.collaborateDepts"
                multiple
                placeholder="协办单位由牵头单位选择"
                style="width: 100%;"
                :collapse-tags="true"
                :max-collapse-tags="2"
                filterable
                clearable
                remote
                :remote-method="searchDepts"
                :loading="false"
                @change="handleCollaborateDeptsChange"
                disabled
              >
                <el-option
                  v-for="dept in filteredCollaborateDepts"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.name"
                  :data-id="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 已选择的协办单位显示区域 -->
        <el-row :gutter="20" v-if="orderForm.collaborateDepts && orderForm.collaborateDepts.length > 0">
          <el-col :span="24">
            <div class="selected-depts-container">
              <div class="selected-depts-header">已选择的协办单位：</div>
              <div class="selected-depts-box">
                <el-tag
                  v-for="(dept, index) in orderForm.collaborateDepts"
                  :key="index"
                  closable
                  @close="removeDept(dept)"
                  class="dept-tag"
                  type="success"
                >
                  {{ dept }}
                </el-tag>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 第七行：督办人 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="督办人：" prop="supervisorName">
              <div class="search-container">
                <el-select
                  v-model="orderForm.supervisorName"
                  placeholder="搜索并选择督办人"
                  style="width: 200px;"
                  filterable
                  clearable
                  remote
                  :remote-method="searchUsers"
                  :loading="false"
                  @change="handleSupervisorChange"
                >
                  <el-option
                    v-for="user in filteredUserList"
                    :key="user.id"
                    :label="user.nickname || user.username"
                    :value="user.nickname || user.username"
                    :data-id="user.id"
                  />
                </el-select>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第八行：办公电话和分管领导 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="办公电话：" prop="officePhone">
              <el-input
                v-model="orderForm.officePhone"
                :placeholder="phoneLoading ? '手动填写' : '自动生成'"
                :loading="phoneLoading"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分管领导：" prop="leader">
              <el-input v-model="orderForm.leader" placeholder="自动获取" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 主要内容 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="主要内容：" prop="content">
              <el-input 
                type="textarea" 
                v-model="orderForm.content" 
                placeholder="请输入主要内容"
                :rows="6"
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 承办事项 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="承办事项：" prop="tasks">
              <el-input 
                type="textarea" 
                v-model="orderForm.tasks" 
                placeholder="请输入承办事项"
                :rows="4"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 督察办审批 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="督察办审批：" prop="inspectionApproval">
              <el-select v-model="orderForm.inspectionApproval" placeholder="待审批" style="width: 200px" disabled>
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_APPROVE_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
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
            <el-form-item label="承办状况：" prop="handlingDetails" >
              <el-input 
                type="textarea" 
                v-model="orderForm.handlingDetails" 
                placeholder="待各单位输入"
                :rows="6"
                disabled
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 督查督办复核 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="督查督办复核：" prop="supervisionReview">
              <el-select v-model="orderForm.supervisionReview" placeholder="待复核" style="width: 200px" disabled>
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_REAPPROVE_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <div class="form-actions mt-8 text-center">
          <el-button type="primary" @click="createOrder" size="large" :loading="submitLoading">
            创建督办单
          </el-button>
          <el-button @click="handleCancel" size="large">
            取消
          </el-button>
        </div>
      </el-form>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { OrderApi, type OrderVO } from '@/api/supervision'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { Icon } from '@/components/Icon'

defineOptions({ name: 'SupervisionOrderCreate' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 获取返回路径的函数
const getReturnPath = () => {
  const fromPage = route.query.from as string
  switch (fromPage) {
    case 'work_supervision':
      return '/supervision/work_supervision'
    case 'special_supervision':
      return '/supervision/special_supervision'
    default:
      // 默认根据督办类型返回对应页面
      const orderType = getSupervisionOrderType()
      return orderType === 'special' ? '/supervision/special_supervision' : '/supervision/work_supervision'
  }
}

// 获取督办类型
const getSupervisionOrderType = () => {
  const type = route.query.type as string
  return type === 'special' ? 'special' : 'work'
}

// 页面标题
const pageTitle = computed(() => {
  const orderType = getSupervisionOrderType()
  return orderType === 'special' ? '广西大学专项督办单' : '广西大学工作督办单'
})

// 督办分类选项
const supervisionTypeOptions = ref<any[]>([])

// 获取督办分类列表
const loadSupervisionTypes = async () => {
  try {
    const orderType = getSupervisionOrderType()
    // 工作督办是1，专项督办是2
    const typeValue = orderType === 'special' ? 2 : 1
    const result = await OrderApi.getSupervisionDetailTypes(typeValue)

    // 将字符串数组转换为下拉框需要的格式
    if (result && Array.isArray(result)) {
      supervisionTypeOptions.value = result.map((item, index) => ({
        value: item, // 使用字符串本身作为值
        label: item // 字符串作为显示标签
      }))
    } else {
      supervisionTypeOptions.value = []
    }
  } catch (error) {
    console.error('获取督办分类列表失败:', error)
    ElMessage.error('获取督办分类列表失败')
    // 如果API调用失败，回退到使用数据字典
    const orderType = getSupervisionOrderType()
    if (orderType === 'special') {
      supervisionTypeOptions.value = getIntDictOptions(DICT_TYPE.SPECIAL_SUPERVISION_TYPE)
    } else {
      supervisionTypeOptions.value = getIntDictOptions(DICT_TYPE.WORK_SUPERVISION_TYPE)
    }
  }
}

// 响应式数据
const submitLoading = ref(false)
const dataLoading = ref(false)
const phoneLoading = ref(false) // 获取办公电话的加载状态
const orderFormRef = ref()
const deptList = ref<DeptApi.DeptVO[]>([])
const userList = ref<any[]>([])
// 搜索关键词变量在下面的搜索逻辑部分声明



// 计算属性：可选择的协办单位（排除牵头单位）
const availableCollaborateDepts = computed(() => {
  return deptList.value.filter(dept => dept.name !== orderForm.leadDept)
})

// 使用自定义过滤逻辑确保搜索准确性
const deptSearchKeyword = ref('')
const userSearchKeyword = ref('')

// 过滤后的部门列表
const filteredCollaborateDepts = computed(() => {
  if (!deptSearchKeyword.value) {
    return availableCollaborateDepts.value
  }
  return availableCollaborateDepts.value.filter(dept =>
    dept.name.toLowerCase().includes(deptSearchKeyword.value.toLowerCase())
  )
})

// 过滤后的用户列表
const filteredUserList = computed(() => {
  if (!userSearchKeyword.value) {
    return userList.value
  }
  return userList.value.filter(user => {
    const name = user.nickname || user.username || ''
    return name.toLowerCase().includes(userSearchKeyword.value.toLowerCase())
  })
})

// 部门搜索方法
const searchDepts = (query: string) => {
  deptSearchKeyword.value = query
}

// 用户搜索方法
const searchUsers = (query: string) => {
  userSearchKeyword.value = query
}

// 督办单表单数据
const orderForm = reactive({
  orderNumber: '', // 督办编号
  title: '', // 督办标题
  category: undefined, // 督办分类（字符串类型）
  basis: undefined, // 督办依据（数字类型）
  urgencyLevel: undefined, // 紧急程度（数字类型）
  deadline: '', // 完成时间
  leadDept: '', // 牵头单位名称（用于显示）
  leadDeptId: 0, // 牵头单位ID（用于提交）
  importance: undefined, // 重要程度（数字类型）
  collaborateDepts: [], // 协办单位名称数组（用于显示）
  collaborateDeptIds: [], // 协办单位ID数组（用于提交）
  supervisorName: '', // 督办人姓名（用于显示）
  supervisorId: 0, // 督办人ID（用于提交）
  officePhone: '',
  leader: '',
  content: '', // 主要内容
  tasks: '', // 承办事项
  // 以下字段在创建阶段不可编辑，由工作流程控制
  inspectionApproval: undefined, // 督察办审批（数字类型） - 仅用于界面显示
  handlingDetails: '', // 牵头单位承办情况 - 仅用于界面显示
  supervisionReview: undefined // 督查督办复核（数字类型） - 仅用于界面显示
})

// 表单验证规则
const rules = {
  orderNumber: [
    { required: true, message: '督办编号不能为空', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入文件标题', trigger: 'blur' },
    { min: 1, max: 200, message: '文件标题长度在 1 到 200 个字符', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!value || !value.trim()) {
          callback(new Error('文件标题不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  category: [
    { required: true, message: '请选择督办分类', trigger: 'change' }
  ],
  basis: [
    { required: false, message: '请选择督办依据', trigger: 'change' }
  ],
  urgencyLevel: [
    { required: true, message: '请选择紧急程度', trigger: 'change' }
  ],
  importance: [
    { required: true, message: '请选择重要程度', trigger: 'change' }
  ],
  deadline: [
    { required: true, message: '请选择要求完成时间', trigger: 'change' }
  ],
  leadDept: [
    { required: true, message: '请选择牵头单位', trigger: 'change' }
  ],
  supervisorName: [
    { required: true, message: '请选择督办人', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入主要内容', trigger: 'blur' },
    { min: 1, max: 2000, message: '主要内容长度在 1 到 2000 个字符', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!value || !value.trim()) {
          callback(new Error('主要内容不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  tasks: [
    { required: false, message: '请输入承办事项', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value && value.length > 1000) {
          callback(new Error('承办事项长度不能超过 1000 个字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const generateOrderNumber = async () => {
  try {
    const orderCode = await OrderApi.generateSupervisionOrderCode()
    orderForm.orderNumber = orderCode
  } catch (error) {
    console.error('生成督办编号失败:', error)
    ElMessage.error('生成督办编号失败，请重试')
    // 如果生成失败，设置一个默认值或者重试
    orderForm.orderNumber = '生成失败，请刷新页面重试'
  }
}

const loadDeptList = async () => {
  try {
    dataLoading.value = true
    const result = await DeptApi.getSimpleDeptList()
    deptList.value = result || []
  } catch (error) {
    console.error('加载部门列表失败:', error)
    ElMessage.error('加载部门列表失败')
  } finally {
    dataLoading.value = false
  }
}

const loadUserList = async () => {
  try {
    const result = await UserApi.getSimpleUserList()
    userList.value = result || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  }
}

// 初始化数据加载
const initData = async () => {
  dataLoading.value = true
  try {
    await Promise.all([loadDeptList(), loadUserList(), loadSupervisionTypes()])
  } catch (error) {
    console.error('初始化数据失败:', error)
  } finally {
    dataLoading.value = false
  }
}


// 搜索功能通过 remote-method 实现精确过滤
// 用户在下拉框中输入时，会调用 searchDepts 或 searchUsers 方法
// 这些方法会更新搜索关键词，计算属性会自动过滤选项

const removeDept = (deptName: string) => {
  const index = orderForm.collaborateDepts.indexOf(deptName)
  if (index > -1) {
    orderForm.collaborateDepts.splice(index, 1)
    // 同时移除对应的ID
    const dept = deptList.value.find(d => d.name === deptName)
    if (dept) {
      const idIndex = orderForm.collaborateDeptIds.indexOf(dept.id)
      if (idIndex > -1) {
        orderForm.collaborateDeptIds.splice(idIndex, 1)
      }
    }
  }
}

// 处理牵头单位变化
const handleLeadDeptChange = (deptName: string) => {
  const dept = deptList.value.find(d => d.name === deptName)
  if (dept) {
    orderForm.leadDeptId = dept.id
    // 自动获取部门负责人信息
    getDeptLeaderInfo(dept.id)
  }
}

// 处理协办单位变化
const handleCollaborateDeptsChange = (deptNames: string[]) => {
  orderForm.collaborateDeptIds = []
  deptNames.forEach(name => {
    const dept = deptList.value.find(d => d.name === name)
    if (dept) {
      orderForm.collaborateDeptIds.push(dept.id)
    }
  })
}

// 处理督办人变化
const handleSupervisorChange = async (userName: string) => {
  const user = userList.value.find(u => (u.nickname || u.username) === userName)
  if (user) {
    orderForm.supervisorId = user.id

    // 调用API获取督办人手机号
    phoneLoading.value = true
    try {
      const phoneData = await OrderApi.getSupervisorPhone(user.id)

      // 后端直接返回手机号字符串
      if (phoneData && typeof phoneData === 'string' && phoneData.trim() !== '') {
        orderForm.officePhone = phoneData.trim()
      } else {
        orderForm.officePhone = ''
        ElMessage.warning('督办人未设置手机号，请手动填写办公电话')
      }
    } catch (error) {
      orderForm.officePhone = ''
      ElMessage.warning('无法获取督办人手机号，请手动填写办公电话')
    } finally {
      phoneLoading.value = false
    }
  } else {
    ElMessage.warning('未找到督办人信息')
  }
}

// 获取部门负责人信息
const getDeptLeaderInfo = async (deptId: number) => {
  try {
    const dept = await DeptApi.getDept(deptId)

    // 处理分管领导信息
    if (dept.leaderUserId) {
      const leader = userList.value.find(u => u.id === dept.leaderUserId)
      if (leader) {
        orderForm.leader = leader.nickname || leader.username
      } else {
        // 如果在当前用户列表中没找到，清空分管领导字段
        orderForm.leader = ''
      }
    } else {
      // 如果部门没有设置负责人，清空分管领导字段并提示用户
      orderForm.leader = ''
      ElMessage.warning('所选部门未设置负责人，提交时将使用督办人作为默认审批人')
    }

  } catch (error) {
    console.error('获取部门信息失败:', error)
    orderForm.leader = ''
    ElMessage.error('获取部门信息失败，请重新选择')
  }
}

// 数据转换辅助方法
// 这些方法现在主要用于显示转换
const getCategoryLabel = (value: string | number): string => {
  // 如果是字符串，直接返回
  if (typeof value === 'string') {
    return value
  }

  // 如果是数字，尝试从当前加载的督办分类选项中查找
  const option = supervisionTypeOptions.value.find(opt => opt.value === value)
  if (option) {
    return option.label
  }

  // 如果没找到，尝试从数据字典中查找（作为备用方案）
  // 首先尝试从工作督办分类中查找
  let dict = getIntDictOptions(DICT_TYPE.WORK_SUPERVISION_TYPE).find(d => d.value === value)
  if (dict) {
    return dict.label
  }

  // 如果没找到，尝试从专项督办分类中查找
  dict = getIntDictOptions(DICT_TYPE.SPECIAL_SUPERVISION_TYPE).find(d => d.value === value)
  if (dict) {
    return dict.label
  }

  // 如果还没找到，尝试从通用督办分类中查找
  dict = getIntDictOptions(DICT_TYPE.SUPERVISION_TYPE).find(d => d.value === value)
  if (dict) {
    return dict.label
  }

  // 如果都没找到，返回空字符串
  return ''
}

const getReasonLabel = (value: number): string => {
  const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_REASON).find(d => d.value === value)
  return dict?.label || ''
}

const getPriorityLabel = (value: number): string => {
  const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE).find(d => d.value === value)
  return dict?.label || ''
}

const getSignificanceLabel = (value: number): string => {
  const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_SIGNIFICANCE_TYPE).find(d => d.value === value)
  return dict?.label || ''
}

const getApprovalLabel = (value: number): string => {
  const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_APPROVE_TYPE).find(d => d.value === value)
  return dict?.label || ''
}

const getReapprovalLabel = (value: number): string => {
  const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_REAPPROVE_TYPE).find(d => d.value === value)
  return dict?.label || ''
}

// 自动生成概述内容
const generateAutoSummary = () => {
  const summaryItems: string[] = []

  // 添加标题
  if (orderForm.title) {
    summaryItems.push(`文件标题：${orderForm.title}`)
  }

  // 添加分类
  if (orderForm.category) {
    summaryItems.push(`督办分类：${getCategoryLabel(orderForm.category)}`)
  }

  // 添加紧急程度
  if (orderForm.urgencyLevel) {
    summaryItems.push(`紧急程度：${getPriorityLabel(orderForm.urgencyLevel)}`)
  }

  // 添加牵头单位
  if (orderForm.leadDept) {
    summaryItems.push(`牵头单位：${orderForm.leadDept}`)
  }

  // 添加督办人
  if (orderForm.supervisorName) {
    summaryItems.push(`督办人：${orderForm.supervisorName}`)
  }

  // 添加时间
  if (orderForm.deadline) {
    summaryItems.push(`要求完成时间：${orderForm.deadline}`)
  }

  return summaryItems.join('\n')
}

// 验证必填字段的方法
const validateRequiredFields = () => {
  const missingFields: string[] = []

  if (!orderForm.orderNumber) {
    missingFields.push('督办编号')
  }
  if (!orderForm.title?.trim()) {
    missingFields.push('文件标题')
  }
  if (!orderForm.category) {
    missingFields.push('督办分类')
  }
  if (!orderForm.urgencyLevel) {
    missingFields.push('紧急程度')
  }
  if (!orderForm.importance) {
    missingFields.push('重要程度')
  }
  if (!orderForm.deadline) {
    missingFields.push('要求完成时间')
  }
  if (!orderForm.leadDept) {
    missingFields.push('牵头单位')
  }
  if (!orderForm.supervisorName) {
    missingFields.push('督办人')
  }
  if (!orderForm.content?.trim()) {
    missingFields.push('主要内容')
  }

  return missingFields
}

const createOrder = async () => {
  try {
    // 首先进行自定义验证
    const missingFields = validateRequiredFields()
    if (missingFields.length > 0) {
      ElMessage.error(`请填写以下必填项：${missingFields.join('、')}`)
      return
    }

    // 表单验证
    const valid = await orderFormRef.value?.validate().catch((error) => {
      console.error('表单验证失败:', error)
      ElMessage.error('表单验证失败，请检查填写内容')
      return false
    })
    if (!valid) {
      ElMessage.error('请检查表单填写是否正确')
      return
    }

    submitLoading.value = true

    // 自动生成概述信息字符串
    const summaryContent = generateAutoSummary()

    // 准备提交数据，转换为API需要的格式
    const orderType = getSupervisionOrderType()

    // 构建发起人自选审批人 Map
    const startUserSelectAssignees: Record<string, number[]> = {}
    const startLeaderSelectAssignees: Record<string, number[]> = {}

    // First 节点先写死为 212
    startUserSelectAssignees['First'] = [212]

    // Third 节点设置为空
    startLeaderSelectAssignees['Third'] = []

    // 如果选择了牵头单位，需要获取该部门的负责人用户ID作为候选人
    if (orderForm.leadDeptId) {
      try {
        // 获取部门详细信息
        const deptDetail = await DeptApi.getDept(orderForm.leadDeptId)
        if (deptDetail && deptDetail.leaderUserId) {
          // 使用部门负责人的用户ID作为候选人
          startUserSelectAssignees['Second'] = [deptDetail.leaderUserId]
        } else {
          // 如果部门没有设置负责人，使用督办人作为默认候选人
          if (orderForm.supervisorId) {
            startUserSelectAssignees['Second'] = [orderForm.supervisorId]
            ElMessage.warning('所选牵头单位未设置负责人，将使用督办人作为默认审批人')
          } else {
            ElMessage.error('牵头单位未设置负责人且督办人信息缺失，请重新选择')
            return
          }
        }
      } catch (error) {
        console.error('获取部门负责人信息失败:', error)
        // 如果获取失败，使用督办人作为默认候选人
        if (orderForm.supervisorId) {
          startUserSelectAssignees['Second'] = [orderForm.supervisorId]
          ElMessage.warning('获取牵头单位负责人信息失败，将使用督办人作为默认审批人')
        } else {
          ElMessage.error('获取部门信息失败且督办人信息缺失，请重试')
          return
        }
      }
    }

    const submitData: OrderVO = {
      orderCode: orderForm.orderNumber,
      orderTitle: orderForm.title,
      type: orderType === 'special' ? 2 : 1, // 督办类型：1=工作督办, 2=专项督办
      detailType: orderForm.category, // 督办具体分类（字符串）
      orderType: orderType === 'special' ? 2 : 1, // 1=工作督办, 2=专项督办
      reason: orderForm.basis, // 直接使用数字值
      priority: orderForm.urgencyLevel,
      deadline: orderForm.deadline,
      leadDept: orderForm.leadDeptId,
      significance: orderForm.importance, // 直接使用数字值
      coDept: orderForm.collaborateDeptIds.join(','), // 协办单位ID用逗号分隔
      supervisor: orderForm.supervisorId,
      content: orderForm.content,
      undertakeMatter: orderForm.tasks,
      // 以下字段在创建时不设置，由工作流程自动处理
      // supervisionApprove: null, // 督察办审批 - 创建时为空
      // leadDeptDetail: '', // 承办状况 - 创建时为空
      // supervisionReapprove: null, // 督查督办复核 - 创建时为空
      summary: summaryContent, // 添加自动生成的概述信息字符串
      startUserSelectAssignees: startUserSelectAssignees,
      startLeaderSelectAssignees: startLeaderSelectAssignees// 发起人自选审批人
    }

    // 验证必要的ID字段
    if (!submitData.leadDept || !submitData.supervisor) {
      ElMessage.error('请确保已正确选择牵头单位和督办人')
      return
    }

    // 调用API创建督办单
    const result = await OrderApi.createOrder(submitData)

    if (result) {
      ElMessage.success('督办单创建成功')
    } else {
      throw new Error('创建督办单返回结果为空')
    }

    // 询问是否继续创建或返回列表
    try {
      await ElMessageBox.confirm('督办单已创建成功，是否继续创建新的督办单？', '操作成功', {
        confirmButtonText: '继续创建',
        cancelButtonText: '返回列表',
        type: 'success'
      })

      // 重置表单继续创建
      await resetForm()
    } catch {
      // 返回对应的列表页
      router.push(getReturnPath())
    }
  } catch (error: any) {
    console.error('创建督办单失败:', error)

    // 根据错误类型提供更详细的提示
    let errorMessage = '创建督办单失败，请重试'

    if (error?.response?.data?.msg) {
      errorMessage = error.response.data.msg
    } else if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    // 检查是否是验证相关的错误
    if (errorMessage.includes('验证') || errorMessage.includes('必填') || errorMessage.includes('不能为空')) {
      ElMessage.error(`表单验证失败：${errorMessage}`)
    } else {
      ElMessage.error(`创建督办单失败：${errorMessage}`)
    }
  } finally {
    submitLoading.value = false
  }
}

const resetForm = async () => {
  // 重置表单验证状态
  orderFormRef.value?.resetFields()

  await generateOrderNumber()
  orderForm.title = ''
  orderForm.category = undefined
  orderForm.basis = undefined
  orderForm.urgencyLevel = undefined
  orderForm.deadline = ''
  orderForm.leadDept = ''
  orderForm.leadDeptId = 0
  orderForm.importance = undefined
  orderForm.collaborateDepts = []
  orderForm.collaborateDeptIds = []
  orderForm.supervisorName = ''
  orderForm.supervisorId = 0
  orderForm.officePhone = ''
  orderForm.leader = ''
  orderForm.content = ''
  orderForm.tasks = ''
  orderForm.inspectionApproval = undefined
  orderForm.handlingDetails = ''
  orderForm.supervisionReview = undefined

  // 清除验证错误信息
  orderFormRef.value?.clearValidate()
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消创建督办单吗？已填写的信息将丢失。', '确认取消', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '继续编辑'
    })
    router.push(getReturnPath())
  } catch {
    // 用户取消，继续编辑
  }
}

// 初始化督办类型
const initSupervisionType = () => {
  const orderType = getSupervisionOrderType()
  // 可以根据需要设置默认的分类值
  // 这里暂时不设置默认值，让用户自己选择

  // 确保已加载对应类型的督办分类列表
  loadSupervisionTypes()
}

// 初始化
onMounted(async () => {
  await generateOrderNumber()
  await initData()
  initSupervisionType()
})
</script>

<style scoped>
.supervision-order-create {
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
}

.form-actions {
  border-top: 1px solid #ebeef5;
  padding-top: 30px;
  margin-top: 30px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-textarea__inner) {
  border-radius: 4px;
}

/* 确保标签不换行 */
:deep(.el-form-item__label) {
  white-space: nowrap;
}

/* 统一搜索容器样式 */
.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap; /* 不换行 */
}

.search-container .el-select,
.search-container .el-input,
.search-container .el-button {
  margin: 0;
  flex-shrink: 0; /* 防止元素被压缩 */
}



/* 已选择部门显示容器 */
.selected-depts-container {
  margin-top: -10px; /* 减少与上方的间距 */
  margin-bottom: 20px; /* 与督办人保持距离 */
  margin-left: 120px; /* 与协办单位标签对齐 */
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #fafafa;
  overflow: hidden;
}

.selected-depts-header {
  background-color: #f5f7fa;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  border-bottom: 1px solid #e4e7ed;
}

.selected-depts-box {
  padding: 12px;
  min-height: 60px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
  align-content: flex-start;
}

.dept-tag {
  margin: 0;
}

/* 必填项提示样式 */
.required-tips {
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}

.required-tips .el-icon {
  color: #f56c6c;
}

/* 增强表单验证错误提示的可见性 */
:deep(.el-form-item__error) {
  font-size: 12px;
  color: #f56c6c;
  padding-top: 4px;
}

/* 必填字段标签样式 */
:deep(.el-form-item.is-required .el-form-item__label::before) {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

</style>
