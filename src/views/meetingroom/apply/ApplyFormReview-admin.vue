<template>
  <div class="application-container">
    <h1 class="form-title">广西大学会议室使用申请表 - 会议室管理员审批</h1>
    
    <div class="form-wrapper">
      <el-form :model="formData" ref="formRef" label-position="left">
        <table class="application-table">
          <tbody>
          <tr>
            <td class="label-cell">会议室</td>
            <td class="content-cell" colspan="3">
              <el-form-item class="no-margin">
                <el-input v-model="formData.conferenceRoom" readonly />
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell" colspan="1">申请单位</td>
            <td class="content-cell" colspan="3">
              <el-form-item class="no-margin">
                <el-input v-model="formData.department" readonly />
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell">申请人</td>
            <td class="content-cell" colspan="3">
              <el-form-item class="no-margin">
                <el-input v-model="formData.applicant" readonly />
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell">手机号码</td>
            <td class="content-cell" colspan="3">
              <el-form-item class="no-margin">
                <el-input v-model="formData.phone" readonly />
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell">活动主题</td>
            <td class="content-cell" colspan="3">
              <el-form-item class="no-margin">
                <el-input v-model="formData.activityTheme" readonly />
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell">横幅</td>
            <td class="content-cell" colspan="2">
              <el-form-item class="no-margin">
                <el-input v-model="formData.banner" readonly />
              </el-form-item>
            </td>
            <td class="note-cell" colspan="1">                                       
            </td>
          </tr>
          </tbody>
         
          <tr>
            <td class="label-cell" rowspan="2" style="text-align: center; width: 90px; padding: 8px;">活动时间</td>
            <td class="sub-label-cell" colspan="1" style="text-align: center; width: 90px; padding: 8px;">布台时间：</td>
            <td class="content-cell" colspan="2">
              <el-form-item class="no-margin">
                <el-input :value="formattedTimes.setupTime" readonly />
              </el-form-item>
            </td>
          </tr>
          
          <tr>
            <td class="sub-label-cell" colspan="1" style="text-align: center; width: 90px; padding: 8px;">使用时间：</td>
            <td class="content-cell" colspan="2">
              <div class="time-range">
                <el-form-item class="no-margin" style="flex: 1;">
                  <el-input :value="formattedTimes.startTime" readonly />
                </el-form-item>
                <span class="time-separator">至</span>
                <el-form-item class="no-margin" style="flex: 1;">
                  <el-input :value="formattedTimes.endTime" readonly />
                </el-form-item>
              </div>
            </td>
          </tr>
        
          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">参加人员介绍</td>
            <td class="content-cell" colspan="3">
              <div style="display: flex; align-items: flex-start;">
                <!-- 文本区域 -->
                <el-form-item class="no-margin" style="flex: 1; margin-right: 10px;">
                  <el-input
                    v-model="formData.participants"
                    type="textarea"
                    :rows="4"
                    style="width: 100%;"
                    readonly
                  />
                </el-form-item>

                <!-- 人数展示区域 -->
                <div style="width: 150px; display: flex; flex-direction: column;">
                  <td class="label-cell" style="width: 150px;">人员数量</td>
                  <el-input
                    v-model="formData.participantsNum"
                    readonly
                    style="width: 100%;"
                  />
                </div>
              </div>
            </td>
          </tr>

          </tbody>
          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">预约设备</td>
            <td class="content-cell" colspan="3">
              <div style="display: flex; align-items: flex-start;">
                <!-- 展示框 -->
                <div
                  class="equipment-display"
                  style="flex: 1; min-height: 120px; border: 1px solid #dcdfe6; border-radius: 4px; padding: 8px; display: flex; flex-wrap: wrap; gap: 6px;"
                >
                  <el-tooltip
                    v-for="(item, index) in selectedEquipments"
                    :key="index"
                    :content="item.detail"
                    placement="top"
                    effect="dark"
                  >
                    <el-tag type="success">
                      {{ item.equipmentName }} * {{ item.num }}
                    </el-tag>
                  </el-tooltip>
                </div>
              </div>
            </td>
          </tr>
          </tbody>

          <tbody>
          <tr>
            <td class="label-cell">使用事由及要求</td>
            <td class="content-cell" colspan="3">
              <el-form-item class="no-margin">
                <el-input
                  v-model="formData.purpose"
                  type="textarea"
                  :rows="4"
                  readonly />
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell">使用单位意见</td>
            <td class="content-cell" colspan="3">

              <el-form-item class="no-margin">
                <el-input
                  v-model="departmentInfo.opinion"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入使用单位意见"
                  :disabled="!canEditDepartmentOpinion || formData.status !== 0" />
              </el-form-item>
              <div class="signature-line">
                <span>负责人签字：</span>
                <el-input
                  v-model="departmentInfo.head"
                  class="!w-150px"
                  placeholder="请输入负责人姓名"
                  :disabled="!canEditDepartmentOpinion || formData.status !== 0" />
                <span class="time-right"> 日期：</span>
                <el-date-picker
                  v-model="departmentInfo.approvalDate"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="datetime"
                  placeholder="选择部门审批时间"
                  class="!w-220px"
                  :clearable="true"
                  :editable="false"
                  :disabled-date="time => time > new Date()"
                  :disabled="!canEditDepartmentOpinion || formData.status !== 0"
                />
              </div>
              <div v-if="canEditDepartmentOpinion && formData.status === 0 && !departmentInfo.head" class="signature-reminder">
                <small style="color: #f56c6c;">⚠️ 提醒：未自动获取到部门负责人，请手动填入正确的负责人姓名</small>
              </div>
            </td>
          </tr>
          </tbody>

          <tbody>
          <tr>
            <td class="label-cell">管理单位意见</td>
            <td class="content-cell" colspan="3">

              <el-form-item class="no-margin">
                <el-input
                  v-model="adminInfo.opinion"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入管理单位意见"
                  :disabled="!canEditAdminOpinion || formData.status !== 0" />
              </el-form-item>
              <div class="signature-line">
                <span>负责人签字：</span>
                <el-input
                  v-model="adminInfo.person"
                  class="!w-150px"
                  placeholder="请输入负责人姓名"
                  :disabled="!canEditAdminOpinion || formData.status !== 0" />
                <span class="time-right"> 日期：</span>
                <el-date-picker
                  v-model="adminInfo.approvalDate"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="datetime"
                  placeholder="选择管理员审批时间"
                  class="!w-220px"
                  :clearable="true"
                  :editable="false"
                  :disabled-date="time => time > new Date()"
                  :disabled="!canEditAdminOpinion || formData.status !== 0"
                />
              </div>
              <div v-if="canEditAdminOpinion && formData.status === 0 && !adminInfo.person" class="signature-reminder">
                <small style="color: #f56c6c;">⚠️ 提醒：未自动获取到管理部门负责人，请手动填入正确的负责人姓名</small>
              </div>
            </td>
          </tr>
          </tbody>

          <tbody>
          <tr>
            <td class="label-cell">注意事项</td>
            <td class="content-cell" colspan="3">
              <el-form-item class="no-margin">
                <el-input
                  v-model="adminInfo.notes"
                  type="textarea"
                  :rows="4"
                  :disabled="formData.status !== 0" />
              </el-form-item>
            </td>
          </tr>
          </tbody>

          <tr>
            <td class="label-cell">备注</td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="remark" class="no-margin">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入备注内容" readonly />
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td class="label-cell">附件信息</td>
            <td class="content-cell" colspan="3">
              <el-form-item class="no-margin">
                <ul class="attachment-list">
                  <li v-for="(file, index) in files.value" :key="index">
                    <div class="file-item">
                      <div class="file-meta">
                        <span class="file-label">📄 文件名称：</span>
                        <span class="file-value">{{ file.name }}</span>
                      </div>
                      <div class="file-meta">
                        <span class="file-label">📦 文件大小：</span>
                        <span class="file-value">{{ file.size }} kb</span>
                      </div>
                      <div class="file-meta">
                        <span class="file-label">🔗 文件链接：</span>
                        <a :href="file.url" target="_blank" class="file-link">点击预览</a>
                      </div>
                    </div>
                  </li>
                </ul>
              </el-form-item>
            </td>
          </tr>
        </table>

        <div class="form-actions">
          <!-- 如果状态为 3：已拒绝 -->
          <div v-if="formData.status === 3" style="color: red; font-weight: bold;">
            当前申请已被拒绝
          </div>
          <!-- 按需求移除“同意 / 不同意 / 保存 / 退出”按钮及相关功能 -->
        </div>
      </el-form>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import { RoomApplyApi } from '@/api/meetingroom/roomapply'
import { RoomInfoApi } from '@/api/meetingroom/roominfo'
import { RoomApplyFileApi } from '@/api/meetingroom/roomapplyfile'
import { getDept, getSimpleDeptList } from '@/api/system/dept'
import { getUser } from '@/api/system/user'
import { useUserStore } from '@/store/modules/user'
import EquipmentTable from '@/views/meetingroom/apply/equipmentTable.vue'
import { RoomEquipmentApi } from '@/api/meetingroom/roomequipment'
import { propTypes } from '@/utils/propTypes'

const props = defineProps({
  id: propTypes.number.def(undefined)
})
const { query } = useRoute() // 查询参数
const queryId = query.id //as unknown as number // 从 URL 传递过来的 id 编号

const formRef = ref(null)
const route = useRoute()
const loading = ref(false)
const userStore = useUserStore()
const selectedEquipments = ref()

// 权限控制
const canEditDepartmentOpinion = ref(false)
const canEditAdminOpinion = ref(false)
const roomDeptInfo = ref(null)
const currentUserDept = ref(null)

// 部门负责人信息
const departmentInfo = ref({
  head: '',
  opinion: '',
  approvalDate: ''
})

// 管理员信息
const adminInfo = ref({
  person: '',
  opinion: '',
  approvalDate: '',
  notes: ''
})

// 表单数据
const formData = ref({
  id: '',
  conferenceRoom: '',
  department: '',
  applicant: '',
  phone: '',
  activityTheme: '',
  banner: '',
  participants: '',
  purpose: '',
  setupTime: '',
  startTime: '',
  endTime: '',
  status: 0,
  remark: '',
  creator: '', // 申请人ID（创建人ID）
  meetingRoomId: '',
  participantsNum: 0
})

// 计算属性：格式化后的时间
const formattedTimes = computed(() => ({
  setupTime: formatDateTime(formData.value.setupTime),
  startTime: formatDateTime(formData.value.startTime),
  endTime: formatDateTime(formData.value.endTime)
}))

// 计算属性：完整的表单数据（包含格式化后的时间）
const fullFormData = computed(() => ({
  ...formData.value,
  ...formattedTimes.value
}))

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}
const times = ref()

// 获取当前用户信息
const getCurrentUser = () => {
  const user = userStore.getUser
  const roles = userStore.getRoles
  return {
    id: user.id,
    nickname: user.nickname,
    deptId: user.deptId,
    roles: roles
  }
}

// 判断是否为管理员
const isAdmin = (user) => {
  if (!user || !user.roles) return false
  return user.roles.includes('admin') ||
         user.roles.includes('super_admin') ||
         user.roles.includes('meeting_admin')
         //  //让部门管理员先没有权限
         // user.nickname?.includes('管理员') ||
         // user.nickname?.includes('admin')
}

// 判断是否为超级管理员
const isSuperAdmin = (user) => {
  if (!user || !user.roles) return false
  return user.roles.includes('super_admin') || user.id === 1
}

// 审核意见模板
const approvalTemplates = {
  approve: {
    department: '经审核，该申请符合会议室使用规定，申请材料齐全，使用时间合理，同意该申请。请按时使用会议室，并注意保持会议室整洁。',
    admin: '经管理部门审核，该会议室申请符合使用要求，申请用途正当，时间安排合理，同意批准使用。请严格按照申请时间使用，会议结束后及时清理现场。'
  },
  reject: {
    department: '经审核，该申请存在以下问题，暂不同意：请完善申请材料后重新提交。',
    admin: '经管理部门审核，该申请暂不符合使用要求，不予批准。如有疑问请联系管理部门。'
  }
}

// 权限判断逻辑
const checkPermissions = async () => {
  try {
    const currentUser = getCurrentUser()

    // 重置权限状态
    canEditAdminOpinion.value = false
    canEditDepartmentOpinion.value = false

    // 获取会议室所属部门信息
    if (formData.value.meetingRoomId) {
      try {
        // 方案1：使用专门的会议室信息API
        try {
          roomDeptInfo.value = await RoomInfoApi.getRoomInfo(formData.value.meetingRoomId)
          if (!roomDeptInfo.value || !roomDeptInfo.value.deptId) {
            throw new Error('RoomInfoApi 未返回 deptId')
          }
        } catch (roomInfoError) {
          roomDeptInfo.value = await RoomApplyApi.getRoomDeptInfo(formData.value.meetingRoomId)
        }

      } catch (error) {
        // 如果获取失败，给管理员默认权限
        if (isAdmin(currentUser)) {
          canEditAdminOpinion.value = true
          await fillAdminSignature()
          await fillAdminOpinionTemplate()
        }
      }
    }

    // 获取当前用户部门信息
    if (currentUser.deptId) {
      try {
        currentUserDept.value = await getDept(currentUser.deptId)
      } catch (error) {
        // 静默处理错误
      }
    }

    // 权限判断逻辑
    // 1. 超级管理员权限检查（只有超级管理员才能编辑所有区域）
    if (isSuperAdmin(currentUser)) {
      canEditAdminOpinion.value = true
      canEditDepartmentOpinion.value = true
      await fillAdminSignature()
      await fillDepartmentSignature()
      await fillAdminOpinionTemplate()
      await fillDepartmentOpinionTemplate()
      return
    }

    // 2. 部门管理员权限检查（只能编辑自己部门管理的会议室）
    if (isAdmin(currentUser)) {
      // 部门管理员只能管理自己部门的会议室
      if (roomDeptInfo.value && currentUser.deptId === roomDeptInfo.value.deptId) {
        canEditAdminOpinion.value = true
        await fillAdminSignature()
        await fillAdminOpinionTemplate()
      }
    }

    // 3. 普通用户部门匹配检查（如果还没有获得管理单位意见权限）
    if (!canEditAdminOpinion.value) {
      if (roomDeptInfo.value && roomDeptInfo.value.deptId) {
        if (currentUser.deptId === roomDeptInfo.value.deptId) {
          canEditAdminOpinion.value = true
          await fillAdminSignature()
          await fillAdminOpinionTemplate()
        }
      }
    }

    // 4. 如果用户属于申请单位，可以填写使用单位意见
    // 方法1：通过申请人部门ID匹配（最精确的方式）
    if (formData.value.creator) {
      try {
        const applicantInfo = await getUser(formData.value.creator)
        if (applicantInfo && applicantInfo.deptId) {
          if (applicantInfo.deptId === currentUser.deptId) {
            canEditDepartmentOpinion.value = true
            await fillDepartmentSignature()
            await fillDepartmentOpinionTemplate()
          }
        }
      } catch (error) {
        // 静默处理错误，继续尝试备用方案
      }
    }

    // 方法2：通过申请单位名称匹配（备用方案）
    if (!canEditDepartmentOpinion.value) {
      const applicantDeptName = formData.value.department
      if (currentUserDept.value && currentUserDept.value.name === applicantDeptName) {
        canEditDepartmentOpinion.value = true
        await fillDepartmentSignature()
        await fillDepartmentOpinionTemplate()
      }
    }

  } catch (error) {
    ElMessage.warning('权限检查失败，请联系管理员')

    // 错误情况下的权限处理
    const currentUser = getCurrentUser()
    // 超级管理员在错误情况下可以获得所有权限
    if (isSuperAdmin(currentUser)) {
      canEditAdminOpinion.value = true
      canEditDepartmentOpinion.value = true
      await fillAdminSignature()
      await fillDepartmentSignature()
      await fillAdminOpinionTemplate()
      await fillDepartmentOpinionTemplate()
    }
  }
}

// 填入使用单位负责人签名
const fillDepartmentSignature = async () => {
  try {
    // 根据申请人ID获取申请人信息和部门负责人
    if (!formData.value.creator) {
      await fillDepartmentSignatureByName()
      return
    }

    // 1. 根据申请人ID获取申请人信息
    const applicantInfo = await getUser(formData.value.creator)
    if (!applicantInfo || !applicantInfo.deptId) {
      return
    }

    // 2. 根据申请人的部门ID获取部门信息
    const applicantDept = await getDept(applicantInfo.deptId)
    if (!applicantDept) {
      return
    }

    // 3. 获取部门负责人信息
    let deptLeaderName = ''
    if (applicantDept.leaderUserId) {
      try {
        const deptLeader = await getUser(applicantDept.leaderUserId)
        if (deptLeader && deptLeader.username) {
          deptLeaderName = deptLeader.username
        }
      } catch (error) {
        // 静默处理错误
      }
    }

    // 4. 填入负责人签名
    if (deptLeaderName) {
      departmentInfo.value.head = deptLeaderName
    } else {
      // 如果没有找到部门负责人，留空让负责人自己填写
      departmentInfo.value.head = ''
    }

    // 5. 自动填入当前时间
    if (!departmentInfo.value.approvalDate) {
      departmentInfo.value.approvalDate = getCurrentDateTime()
    }

  } catch (error) {
    // 失败时也留空，让负责人手动填写
    departmentInfo.value.head = ''
  }
}

// 通过申请人姓名获取部门负责人（备用方案）
const fillDepartmentSignatureByName = async () => {
  try {
    // 方案1：根据申请单位名称获取部门信息
    const applicantDeptName = formData.value.department
    if (applicantDeptName) {
      try {
        // 获取所有部门列表，查找匹配的部门
        const deptList = await getSimpleDeptList()
        const matchedDept = deptList.find(dept => dept.name === applicantDeptName)

        if (matchedDept && matchedDept.leaderUserId) {
          const deptLeader = await getUser(matchedDept.leaderUserId)
          if (deptLeader && deptLeader.username) {
            departmentInfo.value.head = deptLeader.username
            // 自动填入当前时间
            if (!departmentInfo.value.approvalDate) {
              departmentInfo.value.approvalDate = getCurrentDateTime()
            }
            return
          }
        }
      } catch (error) {
        // 静默处理错误
      }
    }

    // 方案2：如果都失败了，留空让负责人自己填写
    departmentInfo.value.head = ''
    // 自动填入当前时间
    if (!departmentInfo.value.approvalDate) {
      departmentInfo.value.approvalDate = getCurrentDateTime()
    }

  } catch (error) {
    departmentInfo.value.head = ''
  }
}

// 填入管理单位负责人签名
const fillAdminSignature = async () => {
  try {
    const currentUser = getCurrentUser()
    let adminLeaderName = ''

    // 1. 尝试根据会议室所属部门获取管理部门负责人
    if (roomDeptInfo.value && roomDeptInfo.value.deptId) {
      try {
        // 获取会议室管理部门信息
        const roomManageDept = await getDept(roomDeptInfo.value.deptId)
        if (roomManageDept && roomManageDept.leaderUserId) {
          // 获取管理部门负责人信息
          const deptLeader = await getUser(roomManageDept.leaderUserId)
          if (deptLeader && deptLeader.username) {
            adminLeaderName = deptLeader.username
          }
        }
      } catch (error) {
        // 静默处理错误
      }
    }

    // 2. 填入管理单位负责人签名
    if (adminLeaderName) {
      adminInfo.value.person = adminLeaderName
    } else {
      adminInfo.value.person = ''
    }

    // 3. 自动填入当前时间
    if (!adminInfo.value.approvalDate) {
      adminInfo.value.approvalDate = getCurrentDateTime()
    }

  } catch (error) {
    // 失败时也不要自动使用当前用户，而是提示错误
    adminInfo.value.person = ''
  }
}

// 获取当前时间字符串
const getCurrentDateTime = () => {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 自动填入使用单位审核意见模板
const fillDepartmentOpinionTemplate = async () => {
  try {
    // 只有在意见为空时才自动填入
    if (!departmentInfo.value.opinion || departmentInfo.value.opinion.trim() === '') {
      departmentInfo.value.opinion = approvalTemplates.approve.department
    }
  } catch (error) {
    // 静默处理错误
  }
}

// 自动填入管理单位审核意见模板
const fillAdminOpinionTemplate = async () => {
  try {
    // 只有在意见为空时才自动填入
    if (!adminInfo.value.opinion || adminInfo.value.opinion.trim() === '') {
      adminInfo.value.opinion = approvalTemplates.approve.admin
    }
  } catch (error) {
    // 静默处理错误
  }
}

// 获取申请详情
const fetchApplyDetail = async (id) => {
  try {
    loading.value = true
    const res = await RoomApplyApi.getRoomApply(id)
    console.log("res",res)
    const AllRoomEquipment = await RoomEquipmentApi.getEquipmentByRoomId(res.meetingRoomId)
    const equipmentStr = res.equipments
    const equipmentMap = equipmentStr.split('|').map(item => {
      const [idStr, numStr] = item.split('*')
      return {
        id: parseInt(idStr),
        num: parseInt(numStr)
      }
    })

    const selectedEquipmentsList = equipmentMap
      .map(equip => {
        const match = AllRoomEquipment.find(item => item.id === equip.id)
        if (match) {
          return {
            id: equip.id,
            equipmentName: match.equipmentName,
            detail: match.detail,
            num: equip.num,
            checked: true
          }
        }
        return null // 显式返回 null，后面过滤掉
      })
      .filter(e => e && e.checked && e.num > 0)

    selectedEquipments.value = selectedEquipmentsList

    const filedata = await RoomApplyFileApi.getFilesByApplyId(id)
    files.value = filedata.map(file => ({
      name: file.fileName,
      size: file.fileSize,
      url: file.fileUrl,
      id: file.id,
      status: 'success'
    }))
    let data = res
    if (data) {
      times.value = {
        setupTime: data.setupTime,
        startTime: data.startTime,
        endTime: data.endTime
      }
      formData.value = {
        ...data,
        setupTime: formatDateTime(data.setupTime),
        startTime: formatDateTime(data.startTime),
        endTime: formatDateTime(data.endTime),
        creator: data.creator || data.createBy || data.userId || data.applicantId || data.createUser || data.createdBy || ''
      }

      // 确保 creator 是数字类型（如果存在的话）
      if (formData.value.creator && typeof formData.value.creator === 'string' && !isNaN(Number(formData.value.creator))) {
        formData.value.creator = Number(formData.value.creator)
      }
      departmentInfo.value = {
        head: data.departmentHead,
        opinion: data.departmentOpinion,
        approvalDate: formatDateTime(data.departmentApprovalDate)
      }
      adminInfo.value = {
        person: data.adminPerson,
        opinion: data.adminOpinion,
        approvalDate: formatDateTime(data.adminApprovalDate),
        notes: data.precautions
      }

      // 获取申请详情后进行权限检查和自动填入
      await checkPermissions()
    }
  } catch (error) {
    ElMessage.error('获取申请详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 优先使用业务表单通过 props 传入的业务主键，其次尝试从路由上解析数值型 ID
  let resolvedId = null
  if (props.id !== undefined && props.id !== null && !isNaN(Number(props.id))) {
    resolvedId = Number(props.id)
  } else {
    const q = route.query
    const possible = q.businessKey || q.applyId || q.id
    if (possible !== undefined && possible !== null && !isNaN(Number(possible))) {
      resolvedId = Number(possible)
    }
  }

  if (resolvedId !== null) {
    fetchApplyDetail(resolvedId)
  } else {
    ElMessage.warning('未找到申请记录ID')
  }
})

// 同意申请
const approveApplication = async () => {
  return
  try {
    loading.value = true
    const submitData = {
      ...formData.value,
      status: 1,
      setupTime: times.value.setupTime,
      startTime: times.value.startTime,
      endTime: times.value.endTime,
      departmentHead: departmentInfo.value.head,
      departmentOpinion: departmentInfo.value.opinion,
      departmentApprovalDate: convertDateToTimestamp(departmentInfo.value.approvalDate),
      adminPerson: adminInfo.value.person,
      adminOpinion: adminInfo.value.opinion,
      adminApprovalDate: convertDateToTimestamp(adminInfo.value.approvalDate),
      precautions: adminInfo.value.notes,
      remark: formData.value.remark
    }
    const res = await RoomApplyApi.updateRoomApply(submitData)
    ElMessage.success('已同意该申请')
    
    // 通知父窗口刷新数据
    if (window.opener && !window.opener.closed) {
      try {
        // 调用父窗口的刷新方法
        window.opener.refreshApplyList && window.opener.refreshApplyList()
      } catch (e) {
        console.error('通知父窗口刷新失败:', e)
      }
    }
    
    window.close()
  } catch (error) {
    console.error('审批失败:', error)
    ElMessage.error('审批失败: ' + (error.message || error))
  } finally {
    loading.value = false
  }
}

// 拒绝申请
const rejectApplication = async () => {
  return
  try {
    loading.value = true
    const submitData = {
      ...formData.value,
      status: 2,
      setupTime: times.value.setupTime,
      startTime: times.value.startTime,
      endTime: times.value.endTime,
      departmentHead: departmentInfo.value.head,
      departmentOpinion: departmentInfo.value.opinion,
      departmentApprovalDate: convertDateToTimestamp(departmentInfo.value.approvalDate),
      adminPerson: adminInfo.value.person,
      adminOpinion: adminInfo.value.opinion,
      adminApprovalDate: convertDateToTimestamp(adminInfo.value.approvalDate),
      precautions: adminInfo.value.notes,
      remark: formData.value.remark
    }
    const res = await RoomApplyApi.updateRoomApply(submitData)
    ElMessage.success('已拒绝该申请')
    
    // 通知父窗口刷新数据
    if (window.opener && !window.opener.closed) {
      try {
        // 调用父窗口的刷新方法
        window.opener.refreshApplyList && window.opener.refreshApplyList()
      } catch (e) {
        console.error('通知父窗口刷新失败:', e)
      }
    }
    
    window.close()
  } catch (error) {
    console.error('审批失败:', error)
    ElMessage.error('审批失败: ' + (error.message || error))
  } finally {
    loading.value = false
  }
}

// 将日期字符串转换为时间戳
const convertDateToTimestamp = (dateStr) => {
  if (!dateStr) return null
  
  try {
    // 如果是数字类型，说明已经是时间戳，直接返回
    if (typeof dateStr === 'number') return dateStr
    
    // 如果是字符串，转换为时间戳
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      console.warn('无效的日期格式:', dateStr)
      return null
    }
    
    // 返回毫秒级时间戳
    return date.getTime()
  } catch (error) {
    console.error('日期转换错误:', error)
    return null
  }
}

// 保存申请
const saveApplication = async () => {
  return
  try {
    loading.value = true
    const submitData = {
      ...formData.value,
      setupTime: times.value.setupTime,
      startTime: times.value.startTime,
      endTime: times.value.endTime,
      departmentHead: departmentInfo.value.head,
      departmentOpinion: departmentInfo.value.opinion,
      departmentApprovalDate: convertDateToTimestamp(departmentInfo.value.approvalDate),
      adminPerson: adminInfo.value.person,
      adminOpinion: adminInfo.value.opinion,
      adminApprovalDate: convertDateToTimestamp(adminInfo.value.approvalDate),
      precautions: adminInfo.value.notes,
    }
    const res = await RoomApplyApi.updateRoomApply(submitData)
    ElMessage.success('保存成功')
    if (formData.value.id) {
      await fetchApplyDetail(formData.value.id)
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败: ' + (error.message || error))
  } finally {
    loading.value = false
  }
}

// 退出
const exitApplication = () => {
  return
  if (window.opener && !window.opener.closed) {
    try {
      // 调用父窗口的刷新方法
      window.opener.refreshApplyList && window.opener.refreshApplyList()
    } catch (e) {
      console.error('通知父窗口刷新失败:', e)
    }
  }
  window.close()
}
const files = reactive([])


</script>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: auto !important;
}

body {
  overflow-y: scroll !important;
}

.application-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
}

.form-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: bold;
}

.form-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.application-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.attachment-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.attachment-list li {
  margin-bottom: 15px;
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.file-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-meta {
  font-size: 13px;
  color: #333;
}

.file-label {
  font-weight: 600;
  margin-right: 5px;
  color: #606266;
}

.file-value {
  color: #303133;
}

.file-link {
  color: #409EFF;
  text-decoration: underline;
  transition: color 0.2s;
}

.file-link:hover {
  color: #66b1ff;
}


.application-table td {
  border: 1px solid #dcdfe6;
  padding: 8px;
  vertical-align: middle;
}

.label-cell {
  width: 120px;
  background-color: #f5f7fa;
  text-align: center;
  font-weight: bold;
}

.sub-label-cell {
  width: 100px;
  text-align: right;
  padding-right: 10px;
}

.content-cell {
  padding: 5px;
}

.note-cell {
  width: 200px;
  color: #606266;
  font-size: 13px;
  padding: 5px;
  line-height: 1.4;
}

.time-range {
  display: flex;
  align-items: center;
}

.time-separator {
  margin: 0 5px;
}

.unit-opinion {
  margin-bottom: 15px;
  font-size: 14px;
}

.signature-line {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.time-right {
  margin-left: auto; /* 将时间推到最右侧 */
}

.notes {
  font-size: 13px;
  color: #303133;
  line-height: 1.4;
}

.notes p {
  margin: 5px 0;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 0 20px 20px;
}

.no-margin {
  margin: 0 !important;
}

.upload-demo {
  margin-top: 10px;
}

/* 权限提示样式 */
.permission-info {
  margin-bottom: 10px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
  color: #0369a1;
  font-size: 13px;
}

/* 签名提醒样式 */
.signature-reminder {
  margin-top: 5px;
  padding: 4px 8px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  font-size: 12px;
}
</style>
