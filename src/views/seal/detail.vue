<template>
  <div class="form-container">
    <div class="form-header">
      <h1>{{ detail.applyTitle }}</h1>
      <p v-if="status==2" style="color: red;">盖章编号：{{ detail.sealNumber }}</p>
    </div>
    <el-form label-width="120px" class="seal-form">
      <!-- 材料名称 -->
      <div class="form-section">
        <div class="section-header">材料名称</div>
        <div class="material-name-content">
          {{ detail.materialName }}
        </div>
      </div>
      <!-- 印章类型 -->
      <div class="form-section">
        <div class="section-header">印章类型</div>
        <div class="seal-type-content">
          <div class="seal-item" v-for="(seal, idx) in detail.sealTypes" :key="idx">
            <span class="seal-name">{{ seal.name }}</span>
            <div class="seal-controls">
              <span class="unit">{{ seal.quantity }}个</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 单位签字 -->
      <div class="form-section">
        <div class="section-header">单位签字</div>
        <div class="signature-content">
          <!-- 遍历审批节点 -->
          <div v-for="(activity, index) in filteredActivityNodes" :key="index">
            <div class="signature-row">
              <span class="required">{{ activity.name }}</span>
              <span class="signature-value">
                <!-- 显示审批人和状态 -->
                <template v-if="activity.tasks && activity.tasks.length > 0">
                  <!-- 判断审批状态 -->
                  <span v-if="activity.status === 2" style="color: #00b32a;">
                    {{ activity.tasks[0].assigneeUser?.nickname }}（已同意）
                  </span>
                  <span v-else-if="activity.status === 1" style="color: #448ef7;">
                    {{ activity.tasks[0].assigneeUser?.nickname }}（处理中）
                  </span>
                  <span v-else-if="activity.status === 3" style="color: #f46b6c;">
                    {{ activity.tasks[0].assigneeUser?.nickname }}（不同意）
                  </span>
                  <span v-else>
                    {{ activity.tasks[0].assigneeUser?.nickname }}
                  </span>
                </template>
                <!-- 如果没有任务信息 -->
                <template v-else>
                  尚未审核
                </template>
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- 材料类型 -->
      <div class="form-section">
        <div class="section-header">材料类型</div>
        <div class="material-type-content">
         {{ detail.materialType }}
        </div>
      </div>
      <!-- 附件 -->
      <div class="form-section">
        <div class="section-header">附件</div>
        <div class="upload-content">
          <div class="file-list" v-if="detail.attachments && detail.attachments.length">
            <div class="file-item" v-for="file in detail.attachments" :key="file.attachmentId">
              <div class="file-info">
                <span class="file-name">{{ file.attachmentName }}</span>
                <span class="file-size">{{ file.attachmentSize }}</span>
                <a :href="file.attachmentUrl" target="_blank" style="margin-left:8px;">下载</a>
                <a @click="previewFile(file)" style="margin-left:8px; cursor:pointer; color:#409EFF;">预览</a>
              </div>
            </div>
          </div>
          <div v-else style="color:#888;">空</div>
        </div>
      </div>
      <!-- 申请摘要 -->
      <div class="form-section">
        <div class="section-header">申请备注</div>
        <div class="notes-content">
          <div style="white-space:pre-line; color:#333;">{{ detail.attention }}</div>
        </div>
      </div>

      <!-- 电话 -->
      <div class="form-section">
        <div class="section-header">电话</div>
        <div class="phone-content">
          {{ detail.phone }}
        </div>
      </div>

      <!-- 二维码 -->
      <div class="form-section qr-section" v-if="status==2">
        <div class="qr-content">
          <Qrcode :text="qrText" :width="120" />
        </div>
      </div>

    </el-form>
    
  </div>
</template>



<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Qrcode } from '@/components/Qrcode'
import { propTypes } from '@/utils/propTypes'
import * as SealApi from '@/api/seal'
import { formatDate } from '@/utils/formatTime'
import { KKFileView } from '@/components/KKFileView'

//由网上印章申请，用户：  ，时间：   ，编号：  
const qrText = ref('')

const props = defineProps({
  id: propTypes.number.def(undefined),
  activityNodes: propTypes.array.def([]),
  applyUser: propTypes.string.def(''),
  applyTime: propTypes.string.def(''),
  status: propTypes.string.def('')
})

//父组件传入的ID和activityNodes

const id = props.id
const activityNodes = props.activityNodes
const applyUser = props.applyUser
const applyTime = props.applyTime
const status = props.status
console.log("status",status)
console.log(activityNodes)

const filteredActivityNodes = computed(() => {
  return activityNodes.filter(
    (activity) => activity.id !== "StartUserNode" && activity.id !== "EndEvent"
  );
})

const detail = ref({
  
})

const fetchDetail = async () => {
  console.log('获取详情ID:', id)
  
  //如果 getApplyInfoById API 已实现，请取消下面注释
  const res = await SealApi.getSealApplicationById(id)
  detail.value = res
  
  // 临时使用模拟数据
  // detail.value = {
  //   title: '印章申请详情',
  //   materialName: '合同原件',
  //   sealTypes: [
  //     { name: '公章', quantity: 2 },
  //     { name: '财务章', quantity: 1 }
  //   ],
  //   handlerSignature: '经办人签字',
  //   reviewerSignature: '审核人签字',
  //   unitHeadSignature: '单位负责人签字',
  //   contactPhone: '联系电话',
  //   materialTypes: {
  //     nonContract: true,
  //     contractNotReviewed: false,
  //     contractReviewed: false
  //   },
  //   notes: '注意事项',
  //   attachments: [
  //     {
  //       name: '合同原件',
  //       url: 'https://example.com/contract.pdf',
  //       size: '1.2MB'
  //     },
  //     {
  //       name: '合同原件2',
  //       url: 'https://example.com/contract.pdf',
  //       size: '1.2MB'
  //     }
  //   ],
  //   sealStatus: '未用印',
  // }
}

// 获取详情后设置二维码文本
const updateQrText = () => {
  qrText.value = `网上印章申请，用户：${applyUser}，时间：${formatDate(applyTime)}，编号：${detail.value?.applyId || ''}`
}

// 正确使用 onMounted 钩子
onMounted(() => {
  fetchDetail().then(() => {
    updateQrText()
  })
})

const previewFile = (file) => {
  KKFileView.preview(file.attachmentUrl)
}
</script>


<style scoped>
.qr-float-box {
  position: absolute;
  right: 32px;
  bottom: 32px;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.10);
  border-radius: 12px;
  padding: 16px 16px 8px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  position: relative;
}

.form-header {
  text-align: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
}

.form-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.seal-form {
  border: 2px solid #409eff;
  border-radius: 8px;
  overflow: hidden;
}

.form-section {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.form-section:last-child {
  border-bottom: none;
}

.section-header {
  width: 120px;
  padding: 20px 15px;
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  text-align: center;
  min-height: 60px;
}

.material-name-content {
  flex: 1;
  padding: 15px;
  background: #e8f4fd;
}

.material-input {
  width: 100%;
}

.seal-type-content {
  flex: 1;
  padding: 15px;
}

.seal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.seal-item:last-child {
  border-bottom: none;
}

.seal-name {
  flex: 1;
  color: #333;
}

.seal-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-input {
  width: 80px;
}

.unit {
  color: #666;
  font-size: 14px;
}

.custom-select {
  width: 120px;
}

.signature-content {
  flex: 1;
  padding: 15px;
  background: #f0f8ff;
}

.signature-row {
  display: flex;
  align-items: center;
 padding-bottom: 15px;
  gap: 15px;
}

.signature-row:last-child {
  margin-bottom: 0;
}
.signature-row .required {
  width: 140px; /* 或 144px，确保能容纳最长的标签 */
  min-width: 140px;
  text-align: center;
  margin-right: 12px;
  display: inline-block;
  flex-shrink: 0;
}

.required::before {
  content: "* ";
  color: #f56c6c;
}

.signature-input {
  flex: 1;
  max-width: 300px;
}

.material-type-content {
  flex: 1;
  padding: 15px;
}

.material-checkbox {
  display: block;
  margin-bottom: 10px;
}

.upload-content {
  flex: 1;
  padding: 15px;
}

.upload-demo {
  margin-bottom: 20px;
}

.file-list {
  margin-top: 15px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fafafa;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  font-size: 18px;
}

.excel-icon {
  color: #67c23a;
}

.pdf-icon {
  color: #f56c6c;
}

.file-name {
  font-weight: 500;
  color: #333;
}

.file-size {
  color: #666;
  font-size: 12px;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notes-content {
  flex: 1;
  padding: 15px;
}

.phone-content {

  padding: 15px;
  text-align: center;
}

.qr-content {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-right: 0;
}
.qr-section {
  padding-left: 0;
}

.form-actions {
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

:deep(.el-input-number) {
  width: 80px;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
}
</style>