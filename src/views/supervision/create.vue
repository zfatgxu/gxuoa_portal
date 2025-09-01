<template>
  <ContentWrap>
    <div class="supervision-order-create">
      <!-- 页面标题 - 移到表格外面 -->
      <div class="page-header-outside">
        <template v-if="!selectedType">
          <el-select
            v-model="selectedType"
            placeholder="请选择督办类型"
            size="large"
            style="width: 220px"
          >
            <el-option
              v-for="opt in supervisionTypeDict"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </template>
        <template v-else>
          <div class="title-with-action">
            <h1 class="form-title">{{ pageTitle }}</h1>
            <el-button type="text" class="change-type-btn" @click="selectedType = undefined">更改类型</el-button>
          </div>
        </template>
      </div>

      <!-- 督办单表单 -->
      <div class="order-form-container" v-loading="dataLoading" element-loading-text="正在加载数据...">

        <!-- 表单主体 -->
        <el-form
          :model="orderForm"
          :rules="rules"
          ref="orderFormRef"
          class="order-form"
          :show-message="true"
          :inline-message="false"
          status-icon
        >
          <!-- 表格式布局 -->
          <div class="form-table">
            <!-- 顶部行：仅右侧督办编号（保持原位置不变） -->
            <div class="form-row">
              <div class="form-content full-width order-number-content" style="display:flex; align-items:center; justify-content:flex-end; gap:12px;">
                <div>
                  <span class="order-number-label">{{ orderNumberLabel }}：</span>
                  <span class="order-number-display">{{ orderForm.orderNumber || '请先选择督办类型' }}</span>
                </div>
              </div>
            </div>

            <!-- 督办事项 -->
            <div class="form-row">
              <div class="form-label required">督办事项</div>
              <div class="form-content full-width">
                <el-input v-model="orderForm.title" placeholder="请输入督办事项" />
              </div>
            </div>

            <!-- 主要内容 -->
            <div class="form-row">
              <div class="form-label required">主要内容</div>
              <div class="form-content full-width">
                <el-input
                  type="textarea"
                  v-model="orderForm.content"
                  placeholder="请输入主要内容"
                  :rows="4"
                  maxlength="2000"
                  show-word-limit
                />
              </div>
            </div>

            <!-- 督办分类和紧急程度 -->
            <div class="form-row">
              <div class="form-label required">督办分类</div>
              <div class="form-content half-width">
                <div class="custom-select-container">
                  <el-select
                    v-model="orderForm.category"
                    placeholder="请选择督办分类"
                    filterable
                    allow-create
                    default-first-option
                    @change="handleCategoryChange"
                    class="category-select"
                  >
                    <el-option
                      v-for="dict in supervisionTypeOptions"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    >
                      <div class="dict-option-content">
                        <span>{{ dict.label }}</span>
                        <el-button
                          v-if="dict.id"
                          type="text"
                          size="small"
                          class="delete-dict-btn"
                          @click.stop="deleteCategoryDictItem(dict)"
                        >
                          删除
                        </el-button>
                      </div>
                    </el-option>
                  </el-select>
                  <el-button
                    v-if="showAddCategoryToDictButton"
                    type="text"
                    size="small"
                    class="add-to-dict-btn"
                    :loading="addingCategoryToDict"
                    @click="addCategoryToDict"
                  >
                    添加为常用选项
                  </el-button>
                </div>
              </div>
              <div class="form-label required">紧急程度</div>
              <div class="form-content half-width">
                <el-select v-model="orderForm.urgencyLevel" placeholder="请选择紧急程度" class="form-select">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </div>
            </div>

            <!-- 完成期限和汇报频次 -->
            <div class="form-row">
              <div class="form-label required">完成期限</div>
              <div class="form-content half-width">
                <el-date-picker
                  class="form-select"
                  style="width: 100%"
                  v-model="orderForm.deadline"
                  type="datetime"
                  placeholder="请选择完成期限"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :disabled-date="disabledDate"
                  :disabled-hours="disabledHours"
                  :disabled-minutes="disabledMinutes"
                  :default-time="defaultTime"
                />
              </div>
              <div class="form-label">汇报频次</div>
              <div class="form-content half-width">
                <el-select v-model="orderForm.reportFrequency" placeholder="请选择汇报频次" class="form-select">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.REPORT_FREQUENCY)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </div>
            </div>

            <!-- 分管校领导和其他校领导 -->
            <div class="form-row">
              <div class="form-label">分管校领导</div>
              <div class="form-content half-width">
                <el-input value="由督办人选择牵头单位后自动获取" placeholder="由督办人选择牵头单位后自动获取" disabled class="form-input" />
              </div>
              <div class="form-label">其他校领导</div>
              <div class="form-content half-width">
                <el-select
                  v-model="orderForm.otherLeaderIds"
                  multiple
                  placeholder="请选择其他校领导"
                  :collapse-tags="true"
                  :max-collapse-tags="3"
                  class="form-select"
                  @change="handleOtherLeadersChange"
                >
                  <el-option
                    v-for="user in userList"
                    :key="user.id"
                    :label="user.nickname || user.username"
                    :value="user.id"
                  />
                </el-select>
              </div>
            </div>

            <!-- 牵头单位和协办单位 -->
            <div class="form-row">
              <div class="form-label">牵头单位</div>
              <div class="form-content half-width">
                <el-input
                  value="由督办人选择"
                  placeholder="由督办人选择"
                  class="form-input"
                  disabled
                />
              </div>
              <div class="form-label">协办单位</div>
              <div class="form-content half-width">
                <el-input
                  value="由牵头单位选择"
                  placeholder="由牵头单位选择"
                  class="form-input"
                  disabled
                />
              </div>
            </div>

            <!-- 督办人和联系电话 -->
            <div class="form-row">
              <div class="form-label required">督办人</div>
              <div class="form-content half-width">
                <el-select
                  v-model="orderForm.supervisorIds"
                  multiple
                  placeholder="请选择督办人"
                  filterable
                  clearable
                  :collapse-tags="true"
                  :max-collapse-tags="3"
                  @change="handleSupervisorChange"
                  class="form-select"
                >
                  <el-option
                    v-for="user in userList"
                    :key="user.id"
                    :label="user.nickname || user.username"
                    :value="user.id"
                  />
                </el-select>
              </div>
              <div class="form-label">联系电话</div>
              <div class="form-content half-width">
                <el-input
                  v-model="orderForm.officePhone"
                  placeholder="请输入联系电话"
                  class="form-input"
                />
              </div>
            </div>

            <!-- 工作推进情况 -->
            <div class="form-row">
              <div class="form-label">工作推进情况</div>
              <div class="form-content full-width">
                <el-input
                  type="textarea"
                  v-model="orderForm.handlingDetails"
                  placeholder="待各单位输入"
                  :rows="4"
                  disabled
                  maxlength="2000"
                  show-word-limit
                />
              </div>
            </div>

            <!-- 是否立项督办 -->
            <div class="form-row">
              <div class="form-label">是否立项督办</div>
              <div class="form-content full-width">
                <el-radio-group v-model="orderForm.isProjectSupervision" disabled>
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </div>
            </div>

            <!-- 是否结束督办 -->
            <div class="form-row">
              <div class="form-label">是否结束督办</div>
              <div class="form-content full-width">
                <el-radio-group v-model="orderForm.isSupervisionClosed" disabled>
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button type="primary" @click="createOrder" size="large" :loading="submitLoading">
              提交
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { OrderApi, type OrderVO, type SupervisionTypeSaveReqVO, type SupervisionTypeRespVO } from '@/api/supervision'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { useDictStoreWithOut } from '@/store/modules/dict'
import { Icon } from '@/components/Icon'
// import { createDictData, deleteDictData, getDictDataByType } from '@/api/system/dict/dict.data'

defineOptions({ name: 'SupervisionOrderCreate' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const dictStore = useDictStoreWithOut()

// 获取返回路径的函数
const getReturnPath = () => {
  // 统一返回新的督办列表页
  return '/supervision/index'
}

// 获取督办类型
const getSupervisionOrderType = () => {
  const type = route.query.type as string
  return type === 'special' ? 'special' : 'work'
}

// 页面标题
const selectedType = ref<number | undefined>(undefined) // 1=工作督办, 2=专项督查，初始未选择
const supervisionTypeDict = getIntDictOptions(DICT_TYPE.SUPERVISION_TYPE)

const pageTitle = computed(() => {
  if (!selectedType.value) return ''
  return selectedType.value === 2 ? '广西大学专项督查单' : '广西大学工作督办单'
})

// 督办编号标签
const orderNumberLabel = computed(() => {
  const orderType = getSupervisionOrderType()
  return orderType === 'special' ? '督查编号' : '督办编号'
})

// 督办分类选项（“督办分类”下拉使用）
const supervisionTypeOptions = ref<any[]>([])

// 获取督办分类列表
const loadSupervisionTypes = async () => {
  try {
    // 根据右上角选择的督办类型加载对应的“督办分类”
    const typeValue = selectedType.value // 1=工作督办, 2=专项督查
    const result = await OrderApi.getSupervisionDetailTypes(typeValue)

    // 处理返回的数据格式
    if (result && Array.isArray(result)) {
      // 检查返回的是对象数组还是字符串数组
      if (result.length > 0 && typeof result[0] === 'object' && result[0].id) {
        // 新格式：对象数组，包含id和type字段
        supervisionTypeOptions.value = result.map((item) => ({
          id: item.id, // 保存ID用于删除
          value: item.type, // 使用type字段作为值
          label: item.type // type字段作为显示标签
        }))
      } else {
        // 旧格式：字符串数组
        supervisionTypeOptions.value = result.map((item) => ({
          value: item, // 使用字符串本身作为值
          label: item // 字符串作为显示标签
        }))
      }
    } else {
      supervisionTypeOptions.value = []
    }
  } catch (error) {
    console.error('获取督办分类列表失败:', error)
    ElMessage.error('获取督办分类列表失败')
    // 如果API调用失败，回退到使用数据字典
    if (selectedType.value === 2) {
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

// 督办依据相关（已移除UI，逻辑注释保留参考）
// const showAddBasisToDictButton = ref(false)
// const addingBasisToDict = ref(false)
// const customBasisValue = ref('')

// 督办分类相关
const showAddCategoryToDictButton = ref(false)
const addingCategoryToDict = ref(false)
const customCategoryValue = ref('')

// 督办单表单数据
const orderForm = reactive({
  orderNumber: '', // 督办编号
  title: '', // 督办标题
  category: undefined, // 督办分类（字符串类型）
  // basis: undefined, // 督办依据（数字类型）
  urgencyLevel: undefined, // 紧急程度（数字类型）
  reportFrequency: undefined, // 汇报频次 (对应数据库 report_frequency) 1=每日 2=每周 3=每月 4=阶段性
  deadline: '', // 完成期限
  leadDept: '', // 牵头单位名称（用于显示）
  leadDeptId: 0, // 牵头单位ID（用于提交）
  collaborateDepts: [], // 协办单位名称数组（用于显示）
  collaborateDeptIds: [], // 协办单位ID数组（用于提交）
  supervisorNames: [], // 督办人姓名数组（用于显示，支持多选）
  supervisorIds: [], // 督办人ID数组（用于提交，支持多选）
  officePhone: '',
  leader: '', // 分管校领导姓名（用于显示）
  leaderId: 0, // 分管校领导ID（用于提交）
  otherLeaders: [], // 其他校领导姓名数组（用于显示）
  otherLeaderIds: [], // 其他校领导ID数组（用于提交）
  content: '', // 主要内容
  tasks: '', // 承办事项
  // 以下字段在创建阶段不可编辑，由工作流程控制
  handlingDetails: '', // 工作推进情况 - 仅用于界面显示
  isProjectSupervision: null, // 是否立项督办 (对应数据库 isProjectSupervision)
  isSupervisionClosed: null // 是否结束督办 (对应数据库 isSupervisionClosed)
})

// 表单验证规则
const rules = {
  orderNumber: [
    { required: true, message: '督办编号不能为空', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入督办事项', trigger: 'blur' },
    { min: 1, max: 200, message: '督办事项长度在 1 到 200 个字符', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!value || !value.trim()) {
          callback(new Error('督办事项不能为空'))
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
  // basis: [
  //   { required: false, message: '请选择督办依据', trigger: 'change' }
  // ],
  urgencyLevel: [
    { required: true, message: '请选择紧急程度', trigger: 'change' }
  ],
  deadline: [
    { required: true, message: '请选择完成期限', trigger: 'change' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback()
          return
        }

        const selectedDateTime = new Date(value)
        const now = new Date()

        if (selectedDateTime.getTime() <= now.getTime()) {
          callback(new Error('完成期限不能早于当前时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  // leadDept 不再是必填项，由督办人在后续流程中选择
  supervisorIds: [
    { required: true, message: '请选择督办人', trigger: 'change' },
    {
      validator: (rule: any, value: number[], callback: Function) => {
        if (!Array.isArray(value) || value.length === 0) {
          callback(new Error('请至少选择一个督办人'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
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
    if (!selectedType.value) {
      console.warn('督办类型未选择，无法生成编号')
      return
    }
    
    // 使用选择的督办类型：1=工作督办, 2=专项督查
    const typeValue = selectedType.value
    const orderCode = await OrderApi.generateSupervisionOrderCode(typeValue)
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
    // 先加载静态数据
    await Promise.all([loadDeptList(), loadUserList()])
    // 选择类型后再加载分类
    if (selectedType.value) {
      await loadSupervisionTypes()
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
  } finally {
    dataLoading.value = false
  }
}

// 监听督办类型选择变化：重载"督办分类"下拉并清空已选，同时生成编号
watch(selectedType, async () => {
  // 未选择时不加载分类，清空编号
  if (!selectedType.value) {
    orderForm.category = undefined
    orderForm.orderNumber = ''
    return
  }
  
  // 清空分类选择
  orderForm.category = undefined
  
  // 生成督办编号
  await generateOrderNumber()
  
  // 加载督办分类
  await loadSupervisionTypes()
})

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
const handleSupervisorChange = async (userIds: number[]) => {
  // 确保数组初始化
  if (!Array.isArray(userIds)) {
    userIds = []
  }

  // 防抖处理，避免快速切换导致的竞态条件
  if (phoneLoading.value) {
    return
  }

  // 只有选择单个督办人时才自动获取手机号
  if (userIds.length === 1) {
    const userId = userIds[0]
    // 调用API获取督办人手机号
    phoneLoading.value = true
    try {
      const phoneData = await OrderApi.getSupervisorPhone(userId)

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
  } else if (userIds.length > 1) {
    // 多选时清空手机号，提示用户手动填写
    orderForm.officePhone = ''
    ElMessage.info('选择多个督办人时，请手动填写联系电话')
  } else {
    // 没有选择督办人时清空手机号
    orderForm.officePhone = ''
  }
}

// 处理其他校领导变化
const handleOtherLeadersChange = (userIds: number[]) => {
  // 确保数组初始化
  if (!Array.isArray(userIds)) {
    orderForm.otherLeaderIds = []
  } else {
    orderForm.otherLeaderIds = [...userIds] // 创建副本避免引用问题
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
        orderForm.leaderId = leader.id // 同时保存ID
      } else {
        // 如果在当前用户列表中没找到，清空分管领导字段
        orderForm.leader = ''
        orderForm.leaderId = 0
      }
    } else {
      // 如果部门没有设置负责人，清空分管领导字段并提示用户
      orderForm.leader = ''
      orderForm.leaderId = 0
      ElMessage.warning('所选部门未设置负责人，提交时将使用督办人作为默认审批人')
    }

  } catch (error) {
    console.error('获取部门信息失败:', error)
    orderForm.leader = ''
    orderForm.leaderId = 0
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

// const getReasonLabel = (value: number): string => {
//   const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_REASON).find(d => d.value === value)
//   return dict?.label || ''
// }

const getPriorityLabel = (value: number): string => {
  const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE).find(d => d.value === value)
  return dict?.label || ''
}


// 获取汇报频次标签
const getReportFrequencyLabel = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return ''
  const num = typeof value === 'string' ? Number(value) : value
  const dict = getIntDictOptions(DICT_TYPE.REPORT_FREQUENCY).find(d => d.value === num)
  return dict?.label || ''
}



// 计算默认时间（当前时间的下一个小时）
const getDefaultTime = () => {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)
  return nextHour
}

// 设置默认时间
const defaultTime = ref(getDefaultTime())

// 禁用今日之前的日期
const disabledDate = (time: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 设置为今天的开始时间
  return time.getTime() < today.getTime()
}

// 禁用小时
const disabledHours = () => {
  const now = new Date()
  const selectedDate = orderForm.deadline ? new Date(orderForm.deadline) : null

  // 如果选择的是今天，则禁用当前小时之前的小时
  if (selectedDate && selectedDate.toDateString() === now.toDateString()) {
    const hours = []
    for (let i = 0; i < now.getHours(); i++) {
      hours.push(i)
    }
    return hours
  }
  return []
}

// 禁用分钟
const disabledMinutes = (hour: number) => {
  const now = new Date()
  const selectedDate = orderForm.deadline ? new Date(orderForm.deadline) : null

  // 如果选择的是今天且是当前小时，则禁用当前分钟之前的分钟
  if (selectedDate && selectedDate.toDateString() === now.toDateString() && hour === now.getHours()) {
    const minutes = []
    for (let i = 0; i <= now.getMinutes(); i++) {
      minutes.push(i)
    }
    return minutes
  }
  return []
}

// // 处理督办依据变化（已弃用）
// const handleBasisChange = (value: any) => {
//   if (typeof value === 'string') {
//     const existingOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_REASON)
//     const isExisting = existingOptions.some(option => option.label === value || option.value === value)
//     if (!isExisting && value.trim() !== '') {
//       customBasisValue.value = value
//       showAddBasisToDictButton.value = true
//     } else {
//       showAddBasisToDictButton.value = false
//       customBasisValue.value = ''
//     }
//   } else {
//     showAddBasisToDictButton.value = false
//     customBasisValue.value = ''
//   }
// }

// // 添加督办依据到数据字典（已弃用）
// const addBasisToDict = async () => { /* no-op */ }

// // 删除督办依据字典项（已弃用）
// const deleteBasisDictItem = async (dict: any) => { /* no-op */ }

// 处理督办分类变化
const handleCategoryChange = (value: any) => {
  // 检查是否是自定义输入的内容（字符串且不在现有选项中）
  if (typeof value === 'string') {
    const isExisting = supervisionTypeOptions.value.some(option => option.label === value || option.value === value)

    if (!isExisting && value.trim() !== '') {
      // 这是自定义输入的内容
      customCategoryValue.value = value
      showAddCategoryToDictButton.value = true
    } else {
      showAddCategoryToDictButton.value = false
      customCategoryValue.value = ''
    }
  } else {
    // 这是从选项中选择的值
    showAddCategoryToDictButton.value = false
    customCategoryValue.value = ''
  }
}

// 添加督办分类
const addCategoryToDict = async () => {
  if (!customCategoryValue.value.trim()) {
    ElMessage.warning('请输入有效的督办分类内容')
    return
  }

  try {
    addingCategoryToDict.value = true

    const orderType = getSupervisionOrderType()

    // 构造督办分类数据
    const typeData = {
      supervisionOrderType: orderType === 'special' ? 2 : 1, // 督办单类型：1=工作督办，2=专项督办
      type: customCategoryValue.value.trim(), // 具体类型
      deleted: false
    }

    // 调用API创建督办分类
    await OrderApi.createSupervisionType(typeData)

    ElMessage.success('督办分类已添加为常用选项，下次可直接选择')

    // 重新加载督办分类列表
    await loadSupervisionTypes()

    // 隐藏添加按钮
    showAddCategoryToDictButton.value = false

    // 将自定义值设置为新添加的值（字符串类型）
    orderForm.category = customCategoryValue.value.trim()

    // 清空自定义值
    customCategoryValue.value = ''

  } catch (error) {
    console.error('添加督办分类失败:', error)
    ElMessage.error('添加督办分类失败，请重试')
  } finally {
    addingCategoryToDict.value = false
  }
}

// 删除督办分类
const deleteCategoryDictItem = async (dict: any) => {
  ElMessageBox.confirm(
    `确定要删除督办分类"${dict.label}"吗？删除后将无法恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // 检查是否有ID
      if (dict.id) {
        // 有ID，直接删除
        await OrderApi.deleteSupervisionType(dict.id)
        ElMessage.success(`督办分类"${dict.label}"已删除`)
      } else {
        // 没有ID，说明是旧格式数据或字典数据，无法删除
        ElMessage.warning('该督办分类无法删除，请联系管理员')
        return
      }

      // 重新加载督办分类列表
      await loadSupervisionTypes()

      // 如果当前选中的就是被删除的项，清空选择
      if (orderForm.category === dict.value) {
        orderForm.category = undefined
      }

    } catch (error) {
      console.error('删除督办分类失败:', error)
      ElMessage.error('删除督办分类失败，请重试')
    }
  }).catch(() => {
    // 用户取消，不做任何操作
  })
}

// 自定义必填项校验
const validateRequiredFields = (): string[] => {
  const missingFields: string[] = []

  if (!orderForm.orderNumber) {
    missingFields.push('督办编号')
  }
  if (!orderForm.title?.trim()) {
    missingFields.push('督办事项')
  }
  if (!orderForm.category) {
    missingFields.push('督办分类')
  }
  if (!orderForm.urgencyLevel) {
    missingFields.push('紧急程度')
  }
  if (!orderForm.deadline) {
    missingFields.push('完成期限')
  }
  // 牵头单位不再在创建阶段验证，由督办人在后续流程中选择
  if (!Array.isArray(orderForm.supervisorIds) || orderForm.supervisorIds.length === 0) {
    missingFields.push('督办人')
  }
  if (!orderForm.content?.trim()) {
    missingFields.push('主要内容')
  }

  return missingFields
}




// 自动生成概述内容（模板B：单句）
const generateAutoSummary = () => {
  const parts: string[] = []

  // 督办事项
  const title = orderForm.title?.trim()
  if (title) parts.push(`针对‘${title}’`)

  // 督办分类
  if (orderForm.category) {
    const categoryLabel = getCategoryLabel(orderForm.category as any)
    if (categoryLabel) parts.push(`属${categoryLabel}`)
  }

  // 紧急程度
  if (orderForm.urgencyLevel) {
    const priorityLabel = getPriorityLabel(orderForm.urgencyLevel as any)
    if (priorityLabel) parts.push(`紧急度为${priorityLabel}`)
  }

  // 督办人（多个以、分隔）
  let supervisorsText = ''
  if (Array.isArray(orderForm.supervisorIds) && orderForm.supervisorIds.length > 0) {
    const names = orderForm.supervisorIds
      .map((id: number) => {
        const user = (userList?.value || []).find((u: any) => u.id === id)
        return user ? (user.nickname || user.username) : ''
      })
      .filter((name: string) => !!name)
    if (names.length > 0) supervisorsText = names.join('、')
  }
  if (supervisorsText) parts.push(`由${supervisorsText}督办`)

  // 完成期限（YYYY-MM-DD HH:mm）
  if (orderForm.deadline) {
    const deadlineText = typeof orderForm.deadline === 'string' && orderForm.deadline.length >= 16
      ? orderForm.deadline.slice(0, 16)
      : orderForm.deadline
    parts.push(`请于${deadlineText}前完成`)
  }

  // 汇报频次（可选）
  const freqLabel = getReportFrequencyLabel(orderForm.reportFrequency as any)
  const sentence = [
    parts.join('，'),
    freqLabel ? `并按周期内汇报${freqLabel}报送进展` : ''
  ].filter(Boolean).join('，')

  return sentence ? `${sentence}。` : ''
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
    // 使用用户在页面上选择的督办类型，而不是URL参数
    const supervisionType = selectedType.value // 1=工作督办, 2=专项督查

    const submitData: OrderVO = {
      orderCode: orderForm.orderNumber,
      orderTitle: orderForm.title,
      type: supervisionType, // 督办类型：1=工作督办, 2=专项督查
      detailType: orderForm.category, // 督办具体分类（字符串）
      orderType: supervisionType, // 1=工作督办, 2=专项督查
      // reason: orderForm.basis, // 已移除“督办依据”，不再提交
      priority: orderForm.urgencyLevel,
      deadline: orderForm.deadline,
      leadDept: '', // 牵头单位由督办人在后续流程中选择，创建时为空
      coDept: '', // 协办单位由牵头单位选择，创建时为空
      supervisor: orderForm.supervisorIds.join(','), // 督办人ID（支持多选，逗号分隔）
      content: orderForm.content,
      reportFrequency: orderForm.reportFrequency ? Number(orderForm.reportFrequency) : undefined, // 汇报频次
      otherLeaders: orderForm.otherLeaderIds.join(','), // 其他校领导ID（支持多选，逗号分隔）
      summary: summaryContent // 添加自动生成的概述信息字符串
    }

    // 验证必要的ID字段
    if (!Array.isArray(orderForm.supervisorIds) || orderForm.supervisorIds.length === 0 || !submitData.supervisor) {
      ElMessage.error('请确保已正确选择督办人')
      return
    }

    // 确保其他校领导数组初始化
    if (!Array.isArray(orderForm.otherLeaderIds)) {
      orderForm.otherLeaderIds = []
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

  // 重新生成督办编号
  await generateOrderNumber()

  // 重置所有表单字段
  orderForm.title = ''
  orderForm.category = undefined
  // orderForm.basis = undefined
  orderForm.urgencyLevel = undefined
  orderForm.reportFrequency = undefined
  orderForm.deadline = ''
  orderForm.leadDept = ''
  orderForm.leadDeptId = 0
  orderForm.collaborateDepts = []
  orderForm.collaborateDeptIds = []
  orderForm.supervisorNames = []
  orderForm.supervisorIds = []
  orderForm.officePhone = ''
  orderForm.leader = ''
  orderForm.leaderId = 0
  orderForm.otherLeaders = []
  orderForm.otherLeaderIds = []
  orderForm.content = ''
  orderForm.tasks = ''
  orderForm.handlingDetails = ''
  orderForm.isProjectSupervision = null
  orderForm.isSupervisionClosed = null

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

// 初始化督办类型（仅在已选择时加载分类）
const initSupervisionType = () => {
  // 这里不再根据路由强制设定类型，交由用户选择
  if (!selectedType.value) return
  loadSupervisionTypes()
}

// 初始化
onMounted(async () => {
  await initData()
  initSupervisionType()
})
</script>

<style scoped>
.supervision-order-create {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: transparent;
  min-height: 100vh;
}

.order-form-container {
  background: white;
  border: 2px solid #e8eaed;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin: 20px auto;
  max-width: 900px;
  overflow: hidden;
}

.page-header-outside {
  position: relative;
  padding: 20px 0 10px 0;
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
}

.form-title {
  font-family: "STXiaobiao", "SimSun", "KaiTi", "Microsoft YaHei", serif;
  font-size: 28px;
  font-weight: bold;
  color: #d32f2f;
  text-align: center;
  margin: 0;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(211, 47, 47, 0.1);
}

/* 标题与更改按钮同一行显示，整体仍居中 */
.title-with-action {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.change-type-btn {
  padding: 0 6px;
  height: auto;
  line-height: 1;
  font-size: 14px;
  color: #409eff;
}

.change-type-btn:hover {
  color: #66b1ff;
}

/* 督办编号在表格内显示 */
.order-number-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
  /* 为了与常规表单行的 label(120px) + 边框(1px) + 内容内边距(16px) 对齐 */
  padding-left: 137px;
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

.form-label.required::before {
  content: '*';
  color: #d32f2f;
  margin-right: 4px;
  font-weight: bold;
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

.form-content.quarter-width {
  flex: 0 0 200px;
}

.form-actions {
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-top: 1px solid #e8eaed;
  border-radius: 0 0 12px 12px;
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

:deep(.el-date-editor .el-input__wrapper) {
  border-radius: 6px;
  border: 1px solid #e8eaed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
  transition: all 0.2s ease;
  min-width: 200px;
}

/* 完成期限容器样式（已停用） */
/* .deadline-container { */
/*   display: flex; */
/*   align-items: center; */
/*   gap: 7px; */
/*   width: 100%; */
/* } */

/* .deadline-picker { */
/*   width: 100px;   直接设置固定宽度 */
/* } */

/* .report-frequency-select { */
/*   width: 130px;   调整宽度以完整显示汇报频次选项 */
/* } */

/* 统一表单控件样式 */
.form-select {
  width: 100% !important;
}

.form-input {
  width: 100% !important;
}



/* 单选按钮组样式 */
:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
}

:deep(.el-radio) {
  margin-right: 0;
  font-weight: 500;
}
/* 提交按钮样式 */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #1976d2 0%, #1976d2 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
  transition: all 0.3s ease;
  font-family: "STXiaobiao", "SimSun", "Microsoft YaHei", serif;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.4);
  background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%);
}

:deep(.el-button--primary:active) {
  transform: translateY(0);
}

/* 已选择部门显示 */
.selected-depts-display {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dept-tag {
  margin: 0;
  font-size: 12px;
}

/* 自定义选择器容器 */
.custom-select-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.custom-select-container .el-select {
  flex: 1;
  min-width: 0;
}

.category-select {
  width: 100% !important;
}

.basis-select {
  width: 100% !important;
}

.add-to-dict-btn {
  font-size: 12px;
  padding: 4px 8px;
  white-space: nowrap;
  color: #409eff;
  flex-shrink: 0;
}

.add-to-dict-btn:hover {
  color: #66b1ff;
}

/* 字典选项内容 */
.dict-option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.delete-dict-btn {
  font-size: 11px;
  padding: 2px 4px;
  color: #f56c6c;
  opacity: 0.7;
}

.delete-dict-btn:hover {
  opacity: 1;
  color: #f78989;
}

/* 表单验证错误提示 */
:deep(.el-form-item__error) {
  position: absolute;
  top: 100%;
  left: 0;
  font-size: 12px;
  color: #f56c6c;
  padding-top: 2px;
  z-index: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .supervision-order-create {
    padding: 10px;
  }

  .order-form-container {
    margin: 10px 0;
    max-width: none;
    border-width: 1px;
  }

  .page-header {
    padding: 20px 15px;
  }

  .form-title {
    font-size: 24px;
    letter-spacing: 1px;
  }

  .order-number-section {
    position: static;
    text-align: center;
    margin-top: 15px;
    background: none;
    border: none;
    padding: 0;
  }

  .form-row {
    flex-direction: column;
    min-height: auto;
  }

  .form-label {
    width: 100%;
    min-width: auto;
    border-right: none;
    border-bottom: 1px solid #333;
    justify-content: flex-start;
    padding: 10px 16px;
  }

  .form-content {
    width: 100%;
    padding: 12px 16px;
  }

  .form-content.half-width,
  .form-content.quarter-width {
    flex: 1;
  }

  .section-title {
    padding: 12px 20px;
  }

  .form-actions {
    padding: 20px;
  }

  /* 移动端不需要额外的左侧对齐内边距 */
  .order-number-content {
    padding-left: 16px;
  }
}

@media (max-width: 480px) {
  .form-title {
    font-size: 20px;
  }

  .form-label {
    font-size: 13px;
  }

  :deep(.el-button--primary) {
    padding: 10px 25px;
    font-size: 14px;
  }
}
</style>
