<script setup lang="ts">
import { ref, watch} from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

import { AcceptanceOpinionApi } from '@/api/petition/opinion'
const props = defineProps<{
  opinion: string
  baseInfo: any
}>()

const router = useRouter()

const emit = defineEmits<{
  (e: 'update', opinion: string): void
}>()
const updateFlag = ref(0);
const editableOpinion = ref(props.opinion)
watch(
  () => props.baseInfo?.petitionId,
  async (petitionId) => {
    if (petitionId) {
      try {
        console.log('发起请求，petitionId:', petitionId)
        const res = await AcceptanceOpinionApi.getOpinion(petitionId)
        if (res!== null) {
          console.log(res)
          updateFlag.value = 1
          editableOpinion.value = res.opinion
        }

      } catch (error) {
        console.error('查询审核意见失败', error)
      }
    }
  },
  { immediate: true }
)

watch(() => props.opinion, (newVal) => {
  editableOpinion.value = newVal
})


const submitOpinion = () => {

  const param = {
    "petitionId": props.baseInfo.petitionId,
    "opinion": editableOpinion.value
  }
  console.log(param)
  if (updateFlag.value){
    const res = AcceptanceOpinionApi.updateOpinion(param)
    ElMessage.success('更新审核意见成功')
  }else {
    const res = AcceptanceOpinionApi.createOpinion(param)
    ElMessage.success('创建审核意见成功')
  }

  router.push('/petition/index')
}

</script>
<template>
  <div class="opinion-info">
    <div class="header">
      <span class="title">审核意见</span>
    </div>

    <div class="opinion-body">
      <el-input
        type="textarea"
        v-model="editableOpinion"
        :rows="5"
        placeholder="请输入审核意见"
      />
    </div>

    <div class="submit-section">
      <el-button class="submit-btn" type="primary" size="default" @click="submitOpinion">
        提交审核
      </el-button>
    </div>
  </div>
</template>


<style scoped lang="scss">

.submit-section {
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
}

.submit-btn {
  font-size: 16px;
  padding: 10px 24px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.5);
  transform: translateY(-2px);
}

.opinion-info {
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.opinion-body {
  padding: 16px;
}

.submit-section {
  padding: 0 16px 16px;
  display: flex;
  justify-content: flex-end;
}

</style>
