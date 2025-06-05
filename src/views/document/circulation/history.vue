<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">流转记录</span>
        </div>
      </template>
      <div class="timeline-container">
        <el-empty v-if="!circulationList.length" description="暂无流转记录" />
        <el-timeline v-else>
        <el-timeline-item
          v-for="(item, index) in circulationList"
          :key="index"
          :timestamp="formatTime(item.createTime)"
          placement="top"
        >
          <el-card class="box-card mb-4">
            <template #header>
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <span style="font-weight: 700; font-size: 16px; margin-right: 30px;">{{ item.typeName || '流转处理' }}</span>
                  <span style="color: #606266; border-left: 2px solid #dcdfe6; padding-left: 15px;">{{ item.circulationStatus }}</span>
                </div>
              </div>
            </template>
            <div class="flex justify-between items-start mb-4">
              <div class="text-gray-700 flex-grow">
                处理意见：{{ item.message }}
              </div>
              <div class="text-gray-500 text-sm text-left ml-4">
                <div>到达时间：{{ formatTime(item.createTime) }}</div>
                <div>打开时间：{{ formatTime(item.openTime) }}</div>
                <div>处理时间：{{ formatTime(item.createTime) }}</div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CirculationApi } from '@/api/document/circulation'
import { formatDate } from '@/utils/formatTime'
import ContentWrap from '@/components/ContentWrap/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const circulationList = ref<any[]>([])

// 格式化时间
const formatTime = (time: string | Date | null) => {
  if (!time) return ''
  const date = typeof time === 'string' ? new Date(time) : time
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

// 获取状态标签类型
const getStatusType = (status: number | null) => {
  if (status === null || status === undefined) return 'info'
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态标签样式
const getStatusStyle = (status: number | null) => {
  if (status === null || status === undefined) return {}
  const styles = {
    0: { color: '#E6A23C', backgroundColor: '#FDF6EC', borderColor: '#F5DAB1' },
    1: { color: '#67C23A', backgroundColor: '#F0F9EB', borderColor: '#C2E7B0' },
    2: { color: '#F56C6C', backgroundColor: '#FEF0F0', borderColor: '#FAC6C6' }
  }
  return styles[status] || {}
}







const getList = async () => {
  try {
    const id = Number(route.query.documentId)
    if (!id) {
      ElMessage.error('缺少文档ID参数')
      return
    }

    const res = await CirculationApi.getCirculationList(id)
    const res1 = res.data
    console.log('获取流转记录响应：', res)
    if (Array.isArray(res1)) {
      circulationList.value = res1.map(item => ({
        ...item,
        isShow: !Boolean(item.isShow),
        isSms: !Boolean(item.isSms)
      }))
    } else {
      circulationList.value = []
      ElMessage.warning('暂无流转记录')
    }
  } catch (error) {
    ElMessage.error('获取流转记录失败')
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.box-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.box-card :deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.timeline-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}
</style>
