<template>
  <Dialog v-model="dialogVisible" :max-height="500" :scroll="true" title="消息详情">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="发送人">
        {{ detailData.templateNickname }}
      </el-descriptions-item>
      <el-descriptions-item label="发送时间">
        {{ formatDate(detailData.createTime) }}
      </el-descriptions-item>
      <!-- <el-descriptions-item label="消息类型">
        <dict-tag :type="DICT_TYPE.SYSTEM_NOTIFY_TEMPLATE_TYPE" :value="detailData.templateType" />
      </el-descriptions-item>
      <el-descriptions-item label="是否已读">
        <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="detailData.readStatus" />
      </el-descriptions-item>
      <el-descriptions-item v-if="detailData.readStatus" label="阅读时间">
        {{ formatDate(detailData.readTime) }}
      </el-descriptions-item> -->
      <el-descriptions-item label="内容">
        {{ detailData.templateContent }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 跳转按钮 -->
    <div style="margin-top: 20px; text-align: center;">
      <el-button type="primary" @click="handleJumpToDocument">
        跳转到文档处理
      </el-button>
    </div>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import * as NotifyMessageApi from '@/api/system/notify/message'

defineOptions({ name: 'MyNotifyMessageDetailDetail' })

const dialogVisible = ref(false) // 弹窗的是否展示
const detailLoading = ref(false) // 表单的加载中
const detailData = ref({} as NotifyMessageApi.NotifyMessageVO) // 详情数据

/** 打开主页右上角铃铛消息，并点击弹出详情窗口的具体代码 */
const open = async (data: NotifyMessageApi.NotifyMessageVO) => {
  dialogVisible.value = true
  // 设置数据
  detailLoading.value = true
  try {
    detailData.value = data
  } finally {
    detailLoading.value = false
  }
}

/** 跳转到文档处理页面 */
const handleJumpToDocument = () => {
  try {
    // 从消息的templateParams中获取documentId
    let documentId = null

    if (detailData.value.templateParams) {
      let templateParams = detailData.value.templateParams

      // 如果templateParams是字符串，需要解析
      if (typeof templateParams === 'string') {
        try {
          templateParams = JSON.parse(templateParams)
        } catch (e) {
          console.error('解析templateParams失败:', e)
        }
      }

      // 获取documentId
      documentId = templateParams.documentId || templateParams.id
    }

    if (documentId) {
      // 在新窗口打开 document_approval 页面，使用真实的文档ID
      window.open(`/document_approval?id=${documentId}&type=3&isTodo=1`, '_blank')
    } else {
      console.error('无法获取文档ID，templateParams:', detailData.value.templateParams)
      // ElMessage.error('无法获取文档ID，请检查消息数据')
      return
    }
  } catch (error) {
    console.error('跳转失败:', error)
    // ElMessage.error('跳转失败，请重试')
    return
  }

  // 关闭当前弹窗
  dialogVisible.value = false
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>
