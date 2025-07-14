<template>
  <div class="petitioner-detail">
    <!-- 顶部信访人信息 -->
    <PersonInfo :petitioners="petitionersList" />

    <!-- 导航标签页 -->
    <TabsInfo
      :petition-info="petitionInfo"
      :case-info="caseInfo"
      @download="downloadFile"
      @update-appeal="handleAppealUpdate"
      @refresh-attachments="fetchAttachments"
    />

    <!-- 基础信息 -->
    <BasicInfo :info="basicInfo" @update="handleBasicInfoUpdate" />

    <!-- 办理信息 -->
    <ProcessInfo :process-data="processInfo" />
    <AcceptanceOpinion :base-info="baseInfo"/>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import PersonInfo from './components/PersonInfo.vue'
import BasicInfo from './components/BasicInfo.vue'
import ProcessInfo from './components/ProcessInfo.vue'
import TabsInfo from './components/TabsInfo.vue'
import AcceptanceOpinion from '@/views/petition/petitioner/components/AcceptanceOpinion.vue'
import { VisitorApi } from '@/api/petition/visitor'
import { AppealApi } from '@/api/petition/appeal'
import { AttachmentApi } from '@/api/petition/attachment'
import { BaseInfoApi } from '@/api/petition/baseinfo'
import { ProcessApi } from '@/api/petition/process'

defineOptions({ name: 'PetitionPetitioner' })

// 获取路由参数
const route = useRoute()
const petitionId = ref(route.query.petitionId as string)

// 加载状态
const loading = ref(false)


// 模拟数据 - 信访人信息
const petitionersList = ref([
  {
    avatar: 'https://placeholder.com/150',
    name: '待加载',
    gender: '未知',
    phone: '未知',
    idCard: '未知',
    address: '未知'
  }
])


// 诉求信息
const petitionInfo = ref({
  id: 1,
  petitionId: 1,
  mainFact: '正在加载中...',
  mainRequest: '正在加载中...',
  content: '正在加载中...'
})


// 模拟数据 - 案号信息（附件）
const caseInfo = ref([
  {
    id: 1,
    petitionId: 1,
    fileName: '正在加载中...',
    fileUrl: '#',
    fileSize: '0KB'
  }
])


// 模拟数据 - 基础信息
const basicInfo = ref({
  id: 1,
  petitionId: 1,
  acceptanceNo: '正在加载中...',
  businessNo: '正在加载中...',
  queryCode: '正在加载中...',
  petitionType: '正在加载中...',
  petitionDate: '正在加载中...',
  registrationOrg: '正在加载中...',
  registrationTime: '正在加载中...',
  deadline: '正在加载中...',
  involvedCount: 0,
  petitionerCount: 0,
  petitionReason: '正在加载中...',
  belongSystem: '正在加载中...',
  problemLocation: '正在加载中...',
  contentCategory: '正在加载中...',
  isOverdue: false,
  processStatus: '正在加载中...'
})


// 模拟数据 - 办理流程
const processInfo = ref([
  {
    id: 1,
    petitionId: 1,
    department: '正在加载中...',
    processType: '正在加载中...',
    targetDepartment: '正在加载中...',
    processTime: '正在加载中...'
  }
])

// 下载文件
const downloadFile = (file: any) => {
  console.log('下载文件', file)
  // 实际项目中这里应该调用下载接口
}

// 处理基础信息更新事件
const handleBasicInfoUpdate = async (updatedInfo: any) => {
  try {
    // 调用API更新基础信息
    await BaseInfoApi.updateBaseInfo(updatedInfo)
    // 重新获取基础信息
    await fetchBaseInfo()
  } catch (error) {
    console.error('更新基础信息失败:', error)
  }
}

// 处理诉求信息更新事件
const handleAppealUpdate = async (updatedAppeal: any) => {
  try {
    // 更新本地数据
    petitionInfo.value = {
      id: updatedAppeal.id,
      petitionId: updatedAppeal.petitionId,
      mainFact: updatedAppeal.mainFacts,
      mainRequest: updatedAppeal.mainRequest,
      content: updatedAppeal.content
    }
  } catch (error) {
    console.error('更新诉求信息失败:', error)
  }
}

// 获取附件列表
const fetchAttachments = async () => {
  if (!petitionId.value) {
    console.error('信访ID不能为空')
    return
  }
  
  try {
    const attachmentRes = await AttachmentApi.getAttachmentListByPetitionId(Number(petitionId.value))
    console.log('附件列表响应:', attachmentRes)

    if (attachmentRes  && attachmentRes.length > 0) {
      // 将后端返回的数据转换为前端需要的格式
      caseInfo.value = attachmentRes.map(item => ({
        id: item.id,
        petitionId: item.petitionId,
        fileName: item.fileName || '',
        fileUrl: item.fileUrl || '',
        fileSize: item.fileSize || ''
      }))
    } else {
      console.warn(`未找到petitionId为 ${petitionId.value} 的附件信息`)
      caseInfo.value = [] // 设置为空数组
    }
  } catch (error) {
    console.error('获取附件列表失败:', error)
    caseInfo.value = [] // 设置为空数组
  }
}
const baseInfo = ref({})
// 获取基础信息
const fetchBaseInfo = async () => {
  if (!petitionId.value) {
    console.error('信访 ID 不能为空')
    return
  }

  try {
    const baseInfoRes = await BaseInfoApi.getBaseInfoByPetitionId(Number(petitionId.value))
    console.log('基础信息响应:', baseInfoRes)
    baseInfo.value = baseInfoRes
    if (baseInfoRes && baseInfoRes.id) {
      // 将后端返回的数据转换为前端需要的格式
      basicInfo.value = {
        id: baseInfoRes.id,
        petitionId: baseInfoRes.petitionId,
        acceptanceNo: baseInfoRes.acceptanceNo || '',
        businessNo: baseInfoRes.businessNo || '',
        queryCode: baseInfoRes.queryCode || '',
        petitionType: baseInfoRes.petitionType || '',
        petitionDate: baseInfoRes.petitionDate || '',
        registrationOrg: baseInfoRes.registrationOrg || '',
        registrationTime: baseInfoRes.registrationTime || '',
        deadline: baseInfoRes.deadline || '',
        involvedCount: baseInfoRes.involvedCount || 0,
        petitionerCount: baseInfoRes.petitionerCount || 0,
        petitionReason: baseInfoRes.petitionReason || '',
        belongSystem: baseInfoRes.belongSystem || '',
        problemLocation: baseInfoRes.problemLocation || '',
        contentCategory: baseInfoRes.contentCategory || '',
        isOverdue: baseInfoRes.isOverdue || false,
        processStatus: baseInfoRes.processStatus || ''
      }
    } else {
      console.warn(`未找到 petitionId 为 ${petitionId.value} 的基础信息`)
      basicInfo.value = {
        id: 0,
        petitionId: Number(petitionId.value),
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
        processStatus: ''
      }
    }
  } catch (error) {
    console.error('获取基础信息失败:', error)
    basicInfo.value = {
      id: 0,
      petitionId: Number(petitionId.value),
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
      processStatus: ''
    }
  }
}

// 获取诉求信息
const fetchAppealInfo = async () => {
  if (!petitionId.value) {
    console.error('信访 ID 不能为空')
    return
  }

  try {
    const appealRes = await AppealApi.getAppealByPetitionId(Number(petitionId.value))
    console.log('诉求信息响应:', appealRes)

    if (appealRes && appealRes.id) {
      // 将后端返回的数据转换为前端需要的格式
      petitionInfo.value = {
        id: appealRes.id,
        petitionId: appealRes.petitionId,
        mainFact: appealRes.mainFacts || '',
        mainRequest: appealRes.mainRequest || '',
        content: appealRes.content || ''
      }
    } else {
      console.warn(`未找到 petitionId 为 ${petitionId.value} 的诉求信息`)
      petitionInfo.value = {
        id: 0,
        petitionId: Number(petitionId.value),
        mainFact: '',
        mainRequest: '',
        content: ''
      }
    }
  } catch (error) {
    console.error('获取诉求信息失败:', error)
    petitionInfo.value = {
      id: 0,
      petitionId: Number(petitionId.value),
      mainFact: '',
      mainRequest: '',
      content: ''
    }
  }
}

// 根据信访ID查询信息
const fetchPetitionData = async () => {
  if (!petitionId.value) {
    console.error('信访ID不能为空')
    return
  }

  loading.value = true
  try {
    console.log('查询信访ID:', petitionId.value)
    const id = petitionId.value

    // 加载信访人信息 - 使用API调用
    try {
      const visitorRes = await VisitorApi.getVisitorListByPetitionID(Number(petitionId.value))
      console.log('信访人信息响应:', visitorRes)

      if (visitorRes && visitorRes.length > 0) {
        // 将后端返回的数据转换为前端需要的格式，但不对敏感信息进行加密
        petitionersList.value = visitorRes.map(item => ({
          id: item.id,
          avatar: item.avatar || '/src/assets/imgs/avatar.jpg',
          name: item.name || '未知',
          gender: item.gender === 1 ? '男' : item.gender === 2 ? '女' : '未知',
          phone: item.phone || '未知',
          idCard: item.idCard || '未知',
          address: item.address || '未知'
        }))
      } else {
          petitionersList.value = []
          console.warn(`未找到ID为 ${id} 的信访人信息`)
      }
    } catch (error) {
      console.error('获取信访人信息失败:', error)
        petitionersList.value = []
        console.warn(`未找到ID为 ${id} 的信访人信息`)
    }

    // 加载诉求信息 - 使用独立的函数获取
    await fetchAppealInfo()

    // 加载附件信息 - 使用独立的函数获取
    await fetchAttachments()

    // 加载基础信息 - 使用独立的函数获取
    await fetchBaseInfo()

    // 加载办理流程 - 使用API调用
    try {
      const processRes = await ProcessApi.getProcessListByPetitionId(Number(petitionId.value))
      console.log('办理流程响应:', processRes)

      if (processRes && processRes.length > 0) {
        // 将后端返回的数据转换为前端需要的格式
        processInfo.value = processRes.map(item => ({
          id: item.id,
          petitionId: item.petitionId,
          department: item.department || '',
          processType: item.processType || '',
          targetDepartment: item.targetDepartment || '',
          processTime: item.processTime || '',
          operation: item.operation || ''
        }))
      } else {
        console.warn(`未找到petitionId为 ${id} 的办理流程信息`)
        processInfo.value = [] // 设置为空数组
      }
    } catch (error) {
      console.error('获取办理流程失败:', error)
      console.warn(`未找到petitionId为 ${id} 的办理流程信息`)
      processInfo.value = [] // 设置为空数组
    }

    console.log('数据加载完成')
  } catch (error) {
    console.error('获取信访详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchPetitionData()
})
</script>

<style scoped>
.petitioner-detail {
  padding: 16px;
  background: #f5f7fa;
}

.detail-tabs {
  margin: 20px 0;
}

.tab-content {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-top: none;
  border-radius: 0 0 4px 4px;
}

.petition-info,
.overview-info,
.case-info {
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 16px;
}

.label {
  font-weight: bold;
  margin-bottom: 8px;
}

.value {
  line-height: 1.6;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.file-name {
  margin: 0 12px;
  flex: 1;
}
</style>
