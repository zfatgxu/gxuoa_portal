<template>
    <ContentWrap>
      <div class="py-20px">
        <div class="form-container">
  
          <!-- 标题 -->
          <div class="mb-20px text-center">
            <h1 class="text-2xl font-bold text-gray-800">{{ selectedDepartment }}通讯录</h1>
          </div>
  
          <!-- 已拒绝状态提示 -->
          <div v-if="isRejectedTask" class="mb-20px">
            <el-alert
              type="warning"
              :description="`您的表单已被拒绝，当前显示的是之前提交的表单数据，您可以在此基础上进行修改后重新提交。`"
              show-icon
              :closable="false"
            />
          </div>
  
          <!-- 日期选择 -->
          <div class="mb-20px flex justify-end">
            <div class="flex items-center">
              <span class="mr-10px text-gray-600">日期：</span>
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="!w-150px"
                :disabled="isRedirecting"
              />
            </div>
          </div>
  
          <!-- 表格区域 -->
          <el-table
            :data="tableData"
            border
            class="mb-20px"
            :header-cell-style="{ padding: '8px 0' }"
            :row-style="{ height: '32px' }"
            :cell-style="{ padding: '10px 0' }"
            :disabled="isRedirecting"
          >
            <el-table-column label="序号" type="index" width="80" align="left"/>
            <el-table-column label="姓名" prop="name" min-width="120" align="left">
              <template #default="scope">
                <div
                  v-if="!scope.row.editing || scope.row.editingField !== 'name'"
                  class="editable-cell"
                  @click="startEdit(scope.row, 'name')"
                >
                  {{ scope.row.name || '' }}
                </div>
                <el-input
                  v-else
                  v-model="scope.row.name"
                  @blur="finishEdit(scope.row)"
                  @keyup.enter="finishEdit(scope.row)"
                  ref="nameInput"
                  class="cell-input"
                />
              </template>
            </el-table-column>
            <el-table-column label="职务" prop="position" min-width="150" align="left">
              <template #default="scope">
                <div
                  v-if="!scope.row.editing || scope.row.editingField !== 'position'"
                  class="editable-cell"
                  @click="startEdit(scope.row, 'position')"
                >
                  {{ scope.row.position || '' }}
                </div>
                <el-input
                  v-else
                  v-model="scope.row.position"
                  @blur="finishEdit(scope.row)"
                  @keyup.enter="finishEdit(scope.row)"
                  ref="positionInput"
                  class="cell-input"
                />
              </template>
            </el-table-column>
            <el-table-column label="手机号1" prop="phone1" min-width="150" align="left">
              <template #default="scope">
                <div
                  v-if="!scope.row.editing || scope.row.editingField !== 'phone1'"
                  class="editable-cell"
                  @click="startEdit(scope.row, 'phone1')"
                >
                  {{ scope.row.phone1 || '' }}
                </div>
                <el-input
                  v-else
                  v-model="scope.row.phone1"
                  @blur="finishEdit(scope.row)"
                  @keyup.enter="finishEdit(scope.row)"
                  ref="phone1Input"
                  class="cell-input"
                />
              </template>
            </el-table-column>
            <el-table-column label="手机号2" prop="phone2" min-width="150" align="left">
              <template #default="scope">
                <div
                  v-if="!scope.row.editing || scope.row.editingField !== 'phone2'"
                  class="editable-cell"
                  @click="startEdit(scope.row, 'phone2')"
                >
                  {{ scope.row.phone2 || '' }}
                </div>
                <el-input
                  v-else
                  v-model="scope.row.phone2"
                  @blur="finishEdit(scope.row)"
                  @keyup.enter="finishEdit(scope.row)"
                  ref="phone2Input"
                  class="cell-input"
                />
              </template>
            </el-table-column>
            <el-table-column prop="extension1" min-width="120" align="left">
              <template #header>
                <span>分机号1</span>
                <el-tooltip
                  content="格式：010-12345678 或 0571-87654321-123"
                  placement="top"
                  effect="dark"
                >
                  <el-icon class="ml-5px cursor-pointer text-blue-500">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </template>
              <template #default="scope">
                <div
                  v-if="!scope.row.editing || scope.row.editingField !== 'extension1'"
                  class="editable-cell"
                  @click="startEdit(scope.row, 'extension1')"
                >
                  {{ scope.row.extension1 || '' }}
                </div>
                <el-input
                  v-else
                  v-model="scope.row.extension1"
                  @blur="finishEdit(scope.row)"
                  @keyup.enter="finishEdit(scope.row)"
                  ref="extension1Input"
                  class="cell-input"
                />
              </template>
            </el-table-column>
            <el-table-column label="分机号2" prop="extension2" min-width="120" align="left">
              <template #default="scope">
                <div
                  v-if="!scope.row.editing || scope.row.editingField !== 'extension2'"
                  class="editable-cell"
                  @click="startEdit(scope.row, 'extension2')"
                >
                  {{ scope.row.extension2 || '' }}
                </div>
                <el-input
                  v-else
                  v-model="scope.row.extension2"
                  @blur="finishEdit(scope.row)"
                  @keyup.enter="finishEdit(scope.row)"
                  ref="extension2Input"
                  class="cell-input"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="75" align="left">
              <template #default="scope">
                <div class="text-left">
                  <el-button
                    type="danger"
                    link
                    @click="removeRow(scope.$index)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
  
          <!-- 添加行按钮 -->
          <div class="mb-20px">
            <el-button 
              type="primary" 
              @click="addRow"
              :disabled="isRedirecting"
            >
              <Icon icon="ep:plus"/>
              添加行
            </el-button>
          </div>
  
          <!-- 单位负责人签字 -->
          <div class="mb-20px">
            <div class="flex justify-center items-center mb-4">
              <span class="mr-10px font-500">单位负责人签字：</span>
              <el-select
                v-model="selectedApprovers.deptLeaderApprove"
                placeholder="请选择单位负责人"
                class="!w-170px"
                :loading="userListLoading"
                :disabled="isRedirecting"
                @change="handleApproverChange"
                clearable
              >
                <el-option
                  v-for="user in userList"
                  :key="user.id"
                  :label="user.nickname"
                  :value="user.id"
                />
              </el-select>
              <el-button 
                v-if="userListLoading"
                type="text"
                :loading="true"
                class="ml-10px"
              >
                加载中...
              </el-button>
            </div>
          </div>
  
  
          <!-- 提交按钮 -->
          <div class="text-center">
            <el-button 
              type="primary" 
              @click="handleSubmit" 
              :loading="submitLoading"
              :disabled="!hasSelectedApprovers || submitLoading"
            >
              {{ submitLoading ? '提交中...' : '提交' }}
            </el-button>
            
          </div>
        </div>
      </div>
    </ContentWrap>
  </template>
  
  <script setup lang="ts">
  import {useUserStore} from '@/store/modules/user'
  import {useRoute, useRouter} from 'vue-router'
  import * as DeptApi from '@/api/system/dept'
  import * as UserApi from '@/api/system/user'
// import * as ContactsSubmitApi from '@/api/addressbook-flow/contactsSubmit'
// import * as TaskContactApi from '@/api/addressbook/task-contact-relation'
  import {QuestionFilled} from '@element-plus/icons-vue'
  import {useTagsViewStore} from '@/store/modules/tagsView'
  
  defineOptions({name: 'AddressbookFillTasksForm'})
  
  const route = useRoute()
  const router = useRouter()
  const tagsViewStore = useTagsViewStore()
  const submitLoading = ref(false)
  const isRedirecting = ref(false) // 是否正在跳转中
  const selectedDate = ref(new Date().toISOString().split('T')[0]) // 默认选择当天日期
  const userListLoading = ref(false)
  
  // 审批人选择相关
  const selectedApprovers = ref({
    deptLeaderApprove: undefined as number | undefined // 部门负责人审批人
  })
  
  // 计算是否有选择的审批人
  const hasSelectedApprovers = computed(() => {
    return selectedApprovers.value.deptLeaderApprove !== undefined
  })
  
  // 用户store
  const userStore = useUserStore()
  
  // 当前用户信息
  const currentUser = computed(() => userStore.getUser)
  
  // 部门名称
  const selectedDepartment = ref('')
  
  // 部门列表
  const deptList = ref<DeptApi.DeptVO[]>([])
  
  // 用户列表（本单位人员）
  const userList = ref<UserApi.UserVO[]>([])
  
  // 任务相关变量
  const taskId = ref<number>(0)
  const isRejectedTask = ref<boolean>(false)
  const existingWorkflowData = ref<any>(null)
  
  // 根据部门ID获取部门名称
  const getDeptNameById = (deptId: number) => {
    if (!deptId) return '未知部门'
    const dept = deptList.value.find(item => item.id === deptId)
    return dept ? dept.name : '未知部门'
  }
  
  // 获取部门列表
  const getDeptList = async () => {
    try {
      deptList.value = await DeptApi.getSimpleDeptList()
    } catch (error) {
      console.error('获取部门列表失败:', error)
    }
  }
  
  // 获取本单位人员列表
  const getDeptUserList = async () => {
    try {
      userListLoading.value = true
      const currentUser = userStore.getUser
      if (!currentUser || !currentUser.deptId) {
        console.error('当前用户部门信息无效')
        return
      }
  
      // 按 deptId 过滤简表，然后获取详情
      const allUsers = await UserApi.getSimpleUserList()
      const fallbackSimple = (allUsers || []).filter((u: any) => Array.isArray(u?.deptIds) && u.deptIds.includes(currentUser.deptId))
      userList.value = await Promise.all(fallbackSimple.map((u: any) => UserApi.getUser(u.id)))
  
    } catch (error) {
      console.error('获取本单位人员列表失败:', error)
      userList.value = []
    } finally {
      userListLoading.value = false
    }
  }
  
  // 智能填充表格数据
  const fillTableWithDeptUsers = async () => {
    try {
      // 清空现有表格数据
      tableData.value = []
      
      // 如果是已拒绝状态，使用原表单数据填充
      if (isRejectedTask.value && existingWorkflowData.value?.contacts) {
        await fillWithRejectedData()
        return
      }
      
      // 使用本部门用户数据填充（首次填写）
      await fillWithDeptUsers()
      
    } catch (error) {
      console.error('智能填充表格数据失败:', error)
      ElMessage.error('数据加载失败，请刷新页面重试')
      // 确保至少有一个空行
      ensureMinimumRows()
    }
  }
  
  // 使用被拒绝的原表单数据填充
  const fillWithRejectedData = async () => {
    try {
      existingWorkflowData.value.contacts.forEach((contact: any) => {
        const rowData = {
          name: contact.name || '',
          position: contact.position || '',
          phone1: contact.phone1 || '',
          phone2: contact.phone2 || '',
          extension1: contact.extension1 || '',
          extension2: contact.extension2 || '',
          editing: false,
          editingField: ''
        }
        tableData.value.push(rowData)
      })
      
      // 恢复之前的审批人选择
      await restorePreviousApprovers()
    } catch (error) {
      console.error('填充被拒绝数据失败:', error)
      throw error
    }
  }
  
  
  
  // 使用本部门用户数据填充
  const fillWithDeptUsers = async () => {
    try {
      if (userList.value.length > 0) {
        userList.value.forEach((user: UserApi.UserVO) => {
          const rowData = {
            name: user.nickname || '',
            position: user.job || '', // 使用job字段作为职务
            phone1: user.mobile || '', // 手机号存到手机号1
            phone2: '',
            extension1: '',
            extension2: '',
            editing: false,
            editingField: ''
          }
          tableData.value.push(rowData)
        })
      }
      
      // 确保至少有一行数据
      ensureMinimumRows()
    } catch (error) {
      console.error('填充部门用户数据失败:', error)
      throw error
    }
  }
  
  // 确保至少有一行数据
  const ensureMinimumRows = () => {
    if (tableData.value.length === 0) {
      tableData.value.push(createEmptyRow())
    }
  }
  
  // 恢复之前的审批人选择
  const restorePreviousApprovers = async () => {
    try {
      if (!existingWorkflowData.value) {
        return
      }
      
      // 尝试从多个可能的来源获取审批人信息
      let approverId = getApproverIdFromWorkflowData(existingWorkflowData.value)
      
      // 如果从workflowData中没有获取到，尝试从latestRecord中获取
      // if (!approverId && taskId.value && currentUser.value?.deptId) {
      //   try {
      //     const latestRecord = await TaskContactApi.taskContactRelationApi.getLatestTaskContact(taskId.value, currentUser.value.deptId)
      //     if (latestRecord?.approver) {
      //       approverId = getApproverIdFromString(latestRecord.approver)
      //     }
      //   } catch (error) {
      //     console.error('从latestRecord获取审批人失败:', error)
      //   }
      // }
      
      if (!approverId) {
        return
      }
  
      // 检查审批人是否在当前用户列表中
      const approver = userList.value.find(user => user.id === approverId)
      
      if (approver) {
        selectedApprovers.value.deptLeaderApprove = approverId
        ElMessage.success(`已自动选择审批人：${approver.nickname}`)
      } else {
        ElMessage.warning('原审批人不在当前部门，请重新选择审批人')
      }
    } catch (error) {
      console.error('恢复审批人选择失败:', error)
      ElMessage.warning('恢复审批人选择失败，请手动选择')
    }
  }
  
  // 从字符串中解析审批人ID（通用函数）
  const getApproverIdFromString = (approverStr: any): number | null => {
    try {
      if (!approverStr) return null
      
      const approverId = approverStr.toString()
      
      // 处理字符串数组格式 "[123]" 或 "[1,227]"
      if (approverId.startsWith('[') && approverId.endsWith(']')) {
        const trimmed = approverId.slice(1, -1)
        if (trimmed) {
          // 如果包含逗号，取第一个ID
          const firstId = trimmed.split(',')[0].trim()
          const parsed = parseInt(firstId)
          if (!isNaN(parsed) && parsed > 0) {
            return parsed
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('解析审批人ID失败:', error)
      return null
    }
  }
  
  // 从工作流数据中获取审批人ID
  const getApproverIdFromWorkflowData = (workflowData: any): number | null => {
    try {
      // 尝试多个可能的字段
      const approverFields = ['approver', 'deptLeaderApprove', 'approverId']
      
      for (const field of approverFields) {
        const approverId = workflowData[field]
        if (approverId) {
          const result = getApproverIdFromString(approverId)
          if (result) return result
        }
      }
      
      return null
    } catch (error) {
      console.error('从工作流数据解析审批人ID失败:', error)
      return null
    }
  }
  
  
  // 根据用户ID获取用户名
  const getUserName = (userId: number) => {
    const user = userList.value.find(u => u.id === userId)
    return user ? user.nickname : `用户${userId}`
  }
  
  // 处理审批人选择变化
  const handleApproverChange = (value: number | undefined) => {
    // 可以在这里添加审批人选择后的逻辑
    console.log('选择的审批人ID:', value)
  }
  
  // 验证审批人选择
  const validateApprovers = () => {
    const {deptLeaderApprove} = selectedApprovers.value
  
    if (!deptLeaderApprove) {
      ElMessage.warning('请选择部门负责人审批人')
      return false
    }
  
    // 验证审批人是否在用户列表中
    const approverExists = userList.value.some(user => user.id === deptLeaderApprove)
    if (!approverExists) {
      ElMessage.error('选择的审批人不存在，请重新选择')
      return false
    }
  
    return true
  }
  
  // 检测任务状态并获取必要数据
  const checkTaskStatus = async () => {
    try {
      if (!taskId.value || !currentUser.value?.deptId) {
        console.error('❌ 任务ID或用户部门信息无效')
        ElMessage.error('任务ID或用户部门信息无效')
        return false
      }

      // 获取最新的任务参与记录
      // const latestRecord = await TaskContactApi.taskContactRelationApi.getLatestTaskContact(taskId.value, currentUser.value.deptId)

      // if (!latestRecord) {
      //   console.error('❌ 未找到任务参与记录')
      //   ElMessage.error('当前用户部门未参与此任务')
      //   return false
      // }

      // 检查状态并获取必要数据
      // await checkDetailedTaskStatus(latestRecord)
      return true
      
    } catch (error) {
      console.error('❌ 检查任务状态失败:', error)
      ElMessage.error('检查任务状态失败')
      return false
    }
  }
  
  // 检查任务状态并获取必要数据
  // const checkDetailedTaskStatus = async (latestRecord: any) => {
  //   try {
  //     // 重置状态
  //     isRejectedTask.value = false
  //     existingWorkflowData.value = null
  //     
  //     // 如果是已拒绝状态，获取原表单数据
  //     if (latestRecord.status === 3) {
  //       isRejectedTask.value = true
  //       await getWorkflowContactsData(latestRecord)
  //     }
  //   } catch (error) {
  //     console.error('检查任务状态失败:', error)
  //     throw error
  //   }
  // }
  
  // 获取工作流联系人数据（参考detail.vue的逻辑）
  // const getWorkflowContactsData = async (latestRecord: any) => {
  //   try {
  //     if (!latestRecord?.processInstanceId) {
  //       ElMessage.warning('无法获取原表单数据：缺少流程实例ID')
  //       return
  //     }

  //     // 通过processInstanceId获取联系人数据
  //     // const workflowContacts = await TaskContactApi.taskContactRelationApi.getWorkflowContacts(latestRecord.processInstanceId)
      
  //     // if (workflowContacts?.contacts && Array.isArray(workflowContacts.contacts) && workflowContacts.contacts.length > 0) {
  //     //   existingWorkflowData.value = workflowContacts
  //     // } else {
  //     //   ElMessage.warning('未找到原表单数据')
  //     // }
  //   } catch (error) {
  //     console.error('获取被拒绝工作流数据失败:', error)
  //     ElMessage.error('获取原表单数据失败，请联系管理员')
  //   }
  // }
  
  
  
  // 初始化部门名称
  const initDepartmentName = async () => {
    await getDeptList()
    const currentUser = userStore.getUser
    if (currentUser && currentUser.deptId) {
      selectedDepartment.value = getDeptNameById(currentUser.deptId)
    } else {
      selectedDepartment.value = '未知部门'
    }
  }
  
  // 创建空行数据
  const createEmptyRow = () => ({
    name: '',
    position: '',
    phone1: '',
    phone2: '',
    extension1: '',
    extension2: '',
    editing: false,
    editingField: ''
  })
  
  // 表格数据
  const tableData = ref<any[]>([createEmptyRow()])
  
  // 添加行
  const addRow = () => {
    tableData.value.push(createEmptyRow())
  }
  
  // 删除行
  const removeRow = (index: number) => {
    if (tableData.value.length > 1) {
      tableData.value.splice(index, 1)
    } else {
      // 如果只剩一行，清空该行数据而不是删除
      tableData.value[0] = createEmptyRow()
      ElMessage.warning('至少保留一行数据')
    }
  }
  
  // 开始编辑
  const startEdit = (row: any, field: string) => {
    // 先结束其他行的编辑
    tableData.value.forEach(item => {
      item.editing = false
      item.editingField = ''
    })
  
    // 开始编辑当前单元格
    row.editing = true
    row.editingField = field
  
    // 下一个tick后聚焦输入框
    nextTick(() => {
      const input = document.querySelector(`.cell-input input`) as HTMLInputElement
      if (input) {
        input.focus()
        input.select()
      }
    })
  }
  
  // 手机号格式验证
  const validatePhoneFormat = (phone: string): boolean => {
    if (!phone || phone.trim() === '') {
      return true // 空值不验证
    }
    const phonePattern = /^(?:(?:\+|00)86)?1(?:3[\d]|4[5-79]|5[0-35-9]|6[5-7]|7[0-8]|8[\d]|9[189])\d{8}$/
    return phonePattern.test(phone.trim())
  }
  
  // 分机号格式验证
  const validateExtensionFormat = (extension: string): boolean => {
    if (!extension || extension.trim() === '') {
      return true // 空值不验证
    }
    const extensionPattern = /^\d{3,4}-\d{7,8}(-\d{3,4})?$/
    return extensionPattern.test(extension.trim())
  }
  
  // 结束编辑
  const finishEdit = (row: any) => {
    const editedField = row.editingField
  
    // 手机号格式验证
    if (editedField === 'phone1' && row.phone1) {
      if (!validatePhoneFormat(row.phone1)) {
        ElMessage.error('手机号1格式不正确，请输入有效的手机号码')
        return // 验证失败，不结束编辑
      }
    }
  
    if (editedField === 'phone2' && row.phone2) {
      if (!validatePhoneFormat(row.phone2)) {
        ElMessage.error('手机号2格式不正确，请输入有效的手机号码')
        return // 验证失败，不结束编辑
      }
    }
  
    // 分机号格式验证
    if (editedField === 'extension1' && row.extension1) {
      if (!validateExtensionFormat(row.extension1)) {
        ElMessage.error('分机号1格式不正确，请输入正确格式（如：010-12345678）')
        return // 验证失败，不结束编辑
      }
    }
  
    if (editedField === 'extension2' && row.extension2) {
      if (!validateExtensionFormat(row.extension2)) {
        ElMessage.error('分机号2格式不正确，请输入正确格式（如：010-12345678）')
        return // 验证失败，不结束编辑
      }
    }
  
    if (editedField === 'name' && row.name) {
      const matched = userList.value.find((u: UserApi.UserVO) => u.nickname === row.name)
      if (matched) {
        if (!row.position) {
          row.position = matched.job || ''
        }
        if (!row.phone1) {
          row.phone1 = matched.mobile || ''
        }
      }
    }
  
    if ((editedField === 'phone1' || editedField === 'phone2') && (row.phone1 || row.phone2)) {
      const phone = row.phone1 || row.phone2
      const matched = userList.value.find((u: UserApi.UserVO) => u.mobile === phone)
      if (matched) {
        if (!row.name) {
          row.name = matched.nickname || ''
        }
        if (!row.position) {
          row.position = matched.job || ''
        }
      }
    }
  
    row.editing = false
    row.editingField = ''
  }
  
  // 验证表格数据
  const validateTableData = () => {
    for (let i = 0; i < tableData.value.length; i++) {
      const row = tableData.value[i]
  
      // 1. 验证姓名必填
      if (!row.name || row.name.trim() === '') {
        ElMessage.error(`第${i + 1}行：姓名不能为空`)
        return false
      }
  
      // 2. 验证手机号格式（如果填写了的话）
      if (row.phone1 && !validatePhoneFormat(row.phone1)) {
        ElMessage.error(`第${i + 1}行：手机号1格式不正确`)
        return false
      }
  
      if (row.phone2 && !validatePhoneFormat(row.phone2)) {
        ElMessage.error(`第${i + 1}行：手机号2格式不正确`)
        return false
      }
  
      // 验证分机号格式（如果填写了的话）
      if (row.extension1 && !validateExtensionFormat(row.extension1)) {
        ElMessage.error(`第${i + 1}行：分机号1格式不正确`)
        return false
      }
  
      if (row.extension2 && !validateExtensionFormat(row.extension2)) {
        ElMessage.error(`第${i + 1}行：分机号2格式不正确`)
        return false
      }
  
      // 3. 验证手机号和分机号至少填写一个
      const hasPhone = row.phone1 || row.phone2
      const hasExtension = row.extension1 || row.extension2
  
      if (!hasPhone && !hasExtension) {
        ElMessage.error(`第${i + 1}行：手机号和分机号至少填写一个`)
        return false
      }
    }
  
    return true
  }
  
  // 提交表单
  const handleSubmit = async () => {
    try {
      // 验证表格数据
      if (!validateTableData()) {
        return
      }
  
      // 验证审批人选择
      if (!validateApprovers()) {
        return
      }
  
      submitLoading.value = true
  
      // 验证任务和部门信息
      if (!taskId.value || !currentUser.value?.deptId) {
        ElMessage.error('任务ID或用户部门信息无效')
        return
      }
  
      // 准备联系人数据
      const contacts = tableData.value.map(row => ({
        name: row.name.trim(),
        position: row.position.trim() || undefined,
        phone1: row.phone1.trim() || undefined,
        phone2: row.phone2.trim() || undefined,
        extension1: row.extension1.trim() || undefined,
        extension2: row.extension2.trim() || undefined
      }))
  
      // 获取提交人信息
      const submitterPhone = (userList.value.find(u => u.id === currentUser.value?.id)?.mobile) || '13800000000'
      const submitTime = getBeijingTime()
      const selectedApproverId = selectedApprovers.value.deptLeaderApprove
      const selectedApproverName = selectedApproverId ? getUserName(selectedApproverId) : '未选择审批人'
  
      // 构建接口请求数据
      const submitData = {
        mode: "create" as const,
        taskId: taskId.value,
        deptId: currentUser.value.deptId,
        contacts: contacts,
        submitterName: currentUser.value?.nickname || '未知用户',
        submitterPhone: submitterPhone,
        submitTime: submitTime,
        contactsDescription: `${selectedDepartment.value}通讯录填写完成，共${contacts.length}条记录，审批人：${selectedApproverName}`,
        startUserSelectAssignees: {
          manager_sign: selectedApproverId ? [selectedApproverId] : []
        }
      }
  
      // 调用统一接口
      // await ContactsSubmitApi.createWithContacts(submitData)
      
      // 临时模拟提交成功
      console.log('提交数据:', submitData)
      ElMessage.success('通讯录提交成功（模拟）')
  
      // 设置跳转状态
      isRedirecting.value = true
      ElMessage.success('通讯录提交成功，工作流程已启动')
  
      // 延迟关闭标签页，让用户看到成功提示
      setTimeout(() => {
        // 关闭当前标签页
        const currentView = tagsViewStore.getVisitedViews.find(
          view => view.fullPath === route.fullPath
        )
        if (currentView) {
          tagsViewStore.delView(currentView)
        }
        
        // 跳转到任务列表页面
        router.push('/addressbook/fill-tasks/index')
      }, 500)
  
    } catch (error: any) {
      console.error('提交失败:', error)
  
      // 显示错误信息
      if (error.response?.data?.message) {
        ElMessage.error(`提交失败: ${error.response.data.message}`)
      } else if (error.message) {
        ElMessage.error(`提交失败: ${error.message}`)
      } else {
        ElMessage.error('提交失败，请重试')
      }
    } finally {
      submitLoading.value = false
    }
  }
  
  // 获取北京时间
  const getBeijingTime = () => {
    const now = new Date()
    // 获取北京时间（UTC+8）
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    return beijingTime.toISOString().slice(0, 19).replace('T', ' ')
  }
  
  // 页面离开确认
  onBeforeUnmount(() => {
    if (isRedirecting.value) {
      // 如果正在跳转中，阻止页面离开
      return false
    }
  })
  
  // 页面加载时初始化
  onMounted(async () => {
    try {
      // 从路由参数获取任务ID
      const taskIdParam = route.query.taskId
      if (!taskIdParam) {
        ElMessage.error('缺少任务ID参数')
        return
      }
      
      taskId.value = parseInt(taskIdParam as string)
      if (isNaN(taskId.value) || taskId.value <= 0) {
        ElMessage.error('任务ID参数无效')
        return
      }
  
      // 初始化部门名称
      await initDepartmentName()
  
      // 获取本单位人员列表
      await getDeptUserList()
  
      // 检查任务状态
      const success = await checkTaskStatus()
      
      if (!success) {
        return
      }
  
      // 填充表格数据
      await fillTableWithDeptUsers()
      
    } catch (error: any) {
      console.error('页面初始化失败:', error)
      ElMessage.error('页面初始化失败，请刷新页面重试')
    }
  })
  </script>
  
  <style scoped>
  /* 表单样式 */
  .form-container {
    width: 1400px;
    padding: 30px;
    margin: 0 auto;
    font-size: 16px;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  }
  
  /* 可编辑单元格样式 */
  .editable-cell {
    display: flex;
    min-height: 32px;
    padding: 0;
    font-size: 16px;
    line-height: 32px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
    align-items: center;
  }
  
  .editable-cell:hover {
    background-color: #f5f7fa;
  }
  
  /* 单元格输入框特殊样式 */
  .cell-input .el-input__wrapper {
    min-height: 32px;
  }
  
  .cell-input .el-input__inner {
    height: 32px;
    padding: 0 8px;
    line-height: 32px;
    background: transparent;
  }
  
  /* 统一字体大小 */
  .el-table th,
  .el-table td,
  .el-button,
  .el-select,
  span,
  .el-table .el-button--danger {
    font-size: 16px;
  }
  </style>
  