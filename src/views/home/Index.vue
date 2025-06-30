<template>
  <!-- <div>
    <el-card shadow="never" class="summary-card">
      <el-skeleton :loading="loading" animated>
        <el-row :gutter="16" justify="space-between">
          <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <div class="flex items-center">
               左侧内容可根据需要保留或修改 
            </div>
          </el-col>
          <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <div class="h-70px flex items-center justify-end lt-sm:mt-10px">
              <div class="px-8px text-right">
                <div class="mb-16px text-14px text-gray-400">{{ t('workplace.project') }}</div>
                <CountTo
                  class="text-20px"
                  :start-val="0"
                  :end-val="totalSate.project"
                  :duration="2600"
                />
              </div>
              <el-divider direction="vertical" />
              <div class="px-8px text-right">
                <div class="mb-16px text-14px text-gray-400">{{ t('workplace.toDo') }}</div>
                <CountTo
                  class="text-20px"
                  :start-val="0"
                  :end-val="totalSate.todo"
                  :duration="2600"
                />
              </div>
              <el-divider direction="vertical" border-style="dashed" />
              <div class="px-8px text-right">
                <div class="mb-16px text-14px text-gray-400">{{ t('workplace.access') }}</div>
                <CountTo
                  class="text-20px"
                  :start-val="0"
                  :end-val="totalSate.access"
                  :duration="2600"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </el-skeleton>
    </el-card>
  </div> -->

  <!-- 主要内容区域 - 左右布局 -->
  <el-row class="mt-8px" :gutter="16" type="flex" align="top">
    <!-- 左侧卡片区域 -->
    <el-col :xl="16" :lg="16" :md="24" :sm="24" :xs="24">
      <!-- 待办事项卡片 -->
      <TodoListCard 
        @goToTodoList="goToTodoList" 
        @goToTodoDetail="goToTodoDetail" 
        v-if="cardSettings.todo.visible"
        :todolength="cardSettings.todo.limit"
      />
      
      <!-- 文件管理卡片 -->
      <FileManagementCard 
        @goToFileManagement="goToFileManagement"
        @previewFile="previewFile"
        @downloadFile="downloadFile"
        @shareFile="shareFile"
        v-if="cardSettings.file.visible"
        :filelength="cardSettings.file.limit"
      />
      
      <!-- 快捷功能卡片 -->
      <ShortcutFunctionsCard 
        @goToAllFunctions="goToAllFunctions"
        v-if="cardSettings.shortcut.visible"
        :shortcutlength="cardSettings.shortcut.limit"
      />
    </el-col>
    
    <!-- 右侧卡片区域 -->
    <el-col :xl="8" :lg="8" :md="24" :sm="24" :xs="24">
      <!-- 通知公告卡片 -->
      <NoticeCard 
        @goToNoticeList="goToNoticeList"
        @viewNotice="viewNotice"
        v-if="cardSettings.notice.visible"
        :noticelength="cardSettings.notice.limit"
      />
      
      <!-- 日程安排卡片 -->
      <ScheduleCard 
        @goToSchedule="goToSchedule"
        @viewScheduleDetail="viewScheduleDetail"
        v-if="cardSettings.schedule.visible"
        :schedulelength="cardSettings.schedule.limit"
      />
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { set } from 'lodash-es'
import { EChartsOption } from 'echarts'
import { formatTime } from '@/utils'

import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { useRouter } from 'vue-router'
import type { WorkplaceTotal, Project, Notice, Shortcut } from './types'
import { pieOptions, barOptions } from './echarts-data'

// 导入卡片组件
import TodoListCard from './components/TodoListCard.vue'
import FileManagementCard from './components/FileManagementCard.vue'
import ShortcutFunctionsCard from './components/ShortcutFunctionsCard.vue'
import NoticeCard from './components/NoticeCard.vue'
import ScheduleCard from './components/ScheduleCard.vue'
import * as getUserSettingApi  from '@/api/system/user/setting'

defineOptions({ name: 'Index' })

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()
const loading = ref(false)
const avatar = userStore.getUser.avatar
const username = userStore.getUser.nickname

// 使用 appStore 中的 cardSettings
const cardSettings = computed(() => appStore.getCardSettings)

// 获取统计数
let totalSate = reactive<WorkplaceTotal>({
  project: 0,
  access: 0,
  todo: 0
})

const getCount = async () => {
  const data = {
    project: 40,
    access: 2340,
    todo: 10
  }
  totalSate = Object.assign(totalSate, data)
}

// 卡片组件事件处理方法
// 待办事项卡片
const goToTodoList = () => {
  router.push('/workplace/mytodo')
}

const goToTodoDetail = (item) => {
  // 使用 router.resolve 获取完整路径
  const path = router.resolve({
    name: 'documentApproval',
    query: { id: item.id, type: 3, isTodo: 1 }
  }).href
  
  try {
    console.log('打开路径:', path)
    
    const newWindow = window.open(
      path,
      '_blank',
      'width=1200,height=800,left=100,top=100,resizable=yes'
    )
    
    if (!newWindow) {
      ElMessage.warning('请允许弹出窗口')
      // 备选方案：在当前页打开
      router.push({ name: 'documentApproval', query: { id: item.id, type: 3, isTodo: 1 } })
    }
  } catch (error) {
    console.error('打开失败:', error)
    ElMessage.error('处理失败')
  }
}

// 文件管理卡片
const goToFileManagement = () => {
  router.push('/file/list')
}

const previewFile = (file) => {
  console.log('预览文件', file)
  // 实现文件预览逻辑
}

const downloadFile = (file) => {
  console.log('下载文件', file)
  // 实现文件下载逻辑
}

const shareFile = (file) => {
  console.log('分享文件', file)
  // 实现文件分享逻辑
}

// 快捷功能卡片
const goToAllFunctions = () => {
  router.push('/system/menu')
}

// 通知公告卡片
const goToNoticeList = () => {
  router.push('/notice/list')
}

const viewNotice = (notice) => {
  router.push({
    path: '/notice/detail',
    query: { id: notice.id }
  })
}

// 日程安排卡片
const goToSchedule = () => {
  router.push('/schedule/calendar')
}

const viewScheduleDetail = (schedule) => {
  router.push({
    path: '/schedule/detail',
    query: { id: schedule.id }
  })
}

// 初始化数据
const getAllApi = async () => {
  loading.value = true
  await Promise.all([
    getCount()
  ])
  loading.value = false
}

onMounted(() => {
  getAllApi()
})
</script>

<style scoped>
.summary-card {
  margin-bottom: 16px;
}
</style>
