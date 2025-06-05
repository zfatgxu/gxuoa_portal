<template>
  <div class="presentation-view">
    <div class="presentation-header">
      <el-button @click="handleBack" icon="ArrowLeft">返回</el-button>
      <h2>{{ documentTitle }}</h2>
    </div>
    <div class="presentation-content">
      <div v-html="presentationContent" class="rich-content"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DocumentApi } from '@/api/document/index'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const documentId = ref<number>(0)
const documentTitle = ref<string>('')
const presentationContent = ref<string>('')
const loading = ref<boolean>(false)

// 获取呈文内容
const getPresentationContent = async () => {
  if (!documentId.value) return

  loading.value = true
  try {
    const documentData = await DocumentApi.getDocument(documentId.value)
    const data = documentData.data
    if (data) {
      documentTitle.value = data.documentName || '呈文详情'
      presentationContent.value = data.presentationContent || ''
    }
  } catch (error) {
    console.error('获取呈文内容失败:', error)
    ElMessage.error('获取呈文内容失败')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 页面加载时获取文档ID和数据
onMounted(() => {
  const id = route.params.id
  if (id) {
    documentId.value = Number(id)
    getPresentationContent()
  } else {
    ElMessage.error('文档ID不能为空')
    router.back()
  }
})
</script>

<style scoped>
.presentation-view {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.presentation-header {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.presentation-header h2 {
  margin: 0 0 0 20px;
  font-size: 18px;
}

.presentation-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.rich-content {
  min-height: 500px;
}

.rich-content :deep(p) {
  line-height: 1.5;
  margin: 0 0 10px 0;
}

.rich-content :deep(h1),
.rich-content :deep(h2),
.rich-content :deep(h3) {
  margin: 20px 0 10px 0;
}

.rich-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.rich-content :deep(td),
.rich-content :deep(th) {
  border: 1px solid #ddd;
  padding: 8px;
}
</style>
