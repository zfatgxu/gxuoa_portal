<template>
  <div class="tabs-info">
    <div class="header">
      <span class="title">诉求信息</span>
      <div class="header-actions">
        <el-button v-if="activeTab === 'petition'" type="primary" size="small" @click="handleEdit">编辑诉求信息</el-button>
      </div>
    </div>
    <div class="tabs-container">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="诉求信息" name="petition">
          <div class="tab-content">
            <div class="petition-info" v-if="!isEditing">
              <!-- 主要事实和主要诉求 -->
              <div v-if="props.petitionInfo && props.petitionInfo.content" class="info-section">
                <div class="section-title">主题：</div>
                <div class="section-content">
                  <div class="content-box">{{ props.petitionInfo.content }}</div>
                </div>
              </div>
              <div v-if="props.petitionInfo && props.petitionInfo.mainFact !== undefined" class="info-section">
                <div class="section-title">内容：</div>
                <div class="section-content">
                  <div class="content-box">{{ props.petitionInfo.mainFact }}</div>
                </div>
              </div>
<!--              <div v-if="props.petitionInfo && props.petitionInfo.mainRequest !== undefined" class="info-section">-->
<!--                <div class="section-title">主要诉求：</div>-->
<!--                <div class="section-content">-->
<!--                  <div class="content-box">{{ props.petitionInfo.mainRequest }}</div>-->
<!--                </div>-->
<!--              </div>-->

              <!-- 概况信息 -->


              <el-empty v-if="!props.petitionInfo || (props.petitionInfo.mainFact === undefined && props.petitionInfo.mainRequest === undefined && !props.petitionInfo.content)" description="暂无诉求信息" />
            </div>

            <!-- 编辑表单 -->
            <div class="petition-edit" v-if="isEditing">
              <el-form :model="appealForm" label-width="100px" ref="formRef">
                <el-form-item label="主题" prop="content">
                  <el-input v-model="appealForm.content" type="textarea" :rows="4" placeholder="请输入上访主题" />
                </el-form-item>
                <el-form-item label="内容" prop="mainFacts">
                  <el-input v-model="appealForm.mainFacts" type="textarea" :rows="4" placeholder="请输入上访内容" />
                </el-form-item>
<!--                <el-form-item label="主要诉求" prop="mainRequest">-->
<!--                  <el-input v-model="appealForm.mainRequest" type="textarea" :rows="4" placeholder="请输入主要诉求" />-->
<!--                </el-form-item>-->
                <el-form-item>
                  <el-button type="primary" @click="submitForm">保存</el-button>
                  <el-button @click="cancelEdit">取消</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="附件信息" name="case">
          <div class="tab-content">
            <div class="case-info">
              <!-- 附件上传按钮 -->
              <div class="attachment-actions" v-if="activeTab === 'case'">
                <el-button type="primary" size="small" @click="showUploadDialog = true">上传附件</el-button>
              </div>

              <!-- 附件信息内容 -->
              <el-empty v-if="!attachmentList.length" description="暂无附件" />
              <div v-else class="attachment-list">
                <div class="attachment-item" v-for="(item, index) in attachmentList" :key="index">
                  <el-icon><Document /></el-icon>
                  <span class="file-name">{{ item.fileName }}</span>
                  <div class="attachment-actions">
                    <el-button type="primary" link size="small" @click="handleDownload(item)">下载</el-button>
                    <el-button type="danger" link size="small" @click="handleDeleteAttachment(item.id)">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
  <!-- 上传附件对话框 -->
  <el-dialog v-model="showUploadDialog" title="上传附件">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :auto-upload="false"
      :disabled="formLoading"
      :limit="5"
      :on-change="handleFileChange"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      accept=".jpg, .png, .gif, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf, .zip, .rar, .txt"
      multiple
      drag
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">
          支持上传各类文件，单个文件不超过10MB
        </div>
      </template>
    </el-upload>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="formLoading" type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="showUploadDialog = false">取 消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AppealApi, AppealVO } from '@/api/petition/appeal'
import { AttachmentApi, AttachmentVO } from '@/api/petition/attachment'
import { UploadFilled } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, watch } from 'vue'
import * as FileApi from '@/api/infra/file'


interface PetitionInfo {
  id?: number
  petitionId?: number
  mainFact: string
  mainRequest: string
  content: string
}

interface CaseFile {
  id?: number
  fileName: string
  fileUrl: string
  fileSize: string
}

interface TabsInfoProps {
  petitionInfo: PetitionInfo
  caseInfo: CaseFile[]
}

interface AppealForm {
  id?: number
  petitionId?: number
  mainFacts: string
  mainRequest: string
  content: string
}


const props = defineProps<TabsInfoProps>()

// 当前激活的标签页
const activeTab = ref('petition')

// 编辑状态
const isEditing = ref(false)

// 表单引用
const formRef = ref()

// 诉求信息表单
const appealForm = reactive<AppealForm>({
  mainFacts: '',
  mainRequest: '',
  content: ''
})


// 切换到编辑模式
const handleEdit = () => {
  // 初始化表单数据
  appealForm.id = props.petitionInfo?.id
  appealForm.petitionId = props.petitionInfo?.petitionId
  appealForm.mainFacts = props.petitionInfo?.mainFact || ''
  appealForm.mainRequest = props.petitionInfo?.mainRequest || ''
  appealForm.content = props.petitionInfo?.content || ''

  // 显示编辑表单
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
}

// 提交表单
const submitForm = async () => {
  try {
    // 构建提交数据
    const appealData: AppealVO = {
      id: appealForm.id || 0,
      petitionId: appealForm.petitionId || 0,
      mainFacts: appealForm.mainFacts,
      mainRequest: appealForm.mainRequest,
      content: appealForm.content
    }

    // 调用API提交数据
    await AppealApi.updateAppeal(appealData)

    // 提示成功
    ElMessage.success('诉求信息更新成功')

    // 通知父组件刷新数据
    emit('update-appeal', appealData)

    // 关闭编辑模式
    isEditing.value = false

  } catch (error) {
    console.error('更新诉求信息失败:', error)
    ElMessage.error('更新诉求信息失败')
  }
}

// 文件下载事件
const emit = defineEmits(['download', 'update-appeal', 'refresh-attachments'])
const handleDownload = (file: CaseFile | AttachmentVO) => {
  // 直接在新标签页中打开文件URL
  if (file.fileUrl) {
    window.open(file.fileUrl, '_blank')
  } else {
    // 如果需要通过父组件处理下载
    emit('download', file)
  }
}

// 附件列表
const attachmentList = ref<AttachmentVO[]>([])

// 监听 props.caseInfo 变化，同步到 attachmentList
watch(() => props.caseInfo, (newVal) => {
  if (newVal && newVal.length > 0) {
    // 将 CaseFile 类型转换为 AttachmentVO 类型
    attachmentList.value = newVal.map(item => ({
      id: item.id || 0,
      petitionId: props.petitionInfo?.petitionId || 0,
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      fileSize: item.fileSize
    }))
  } else {
    // 如果没有附件，则清空列表
    attachmentList.value = []
  }
}, { immediate: true })

// 获取附件列表
const fetchAttachments = async () => {
  if (props.petitionInfo?.petitionId) {
    try {
      console.log('开始获取附件列表:', props.petitionInfo.petitionId)
      const res = await AttachmentApi.getAttachmentListByPetitionId(props.petitionInfo.petitionId)
      console.log('附件列表响应:', res)
      
      if (res && res.length > 0) {
        attachmentList.value = res
        console.log('更新附件列表:', attachmentList.value)
      } else {
        // 如果没有数据，清空列表
        attachmentList.value = []
      }
    } catch (error) {
      console.error('获取附件列表失败:', error)
      // 发生错误时也清空列表
      attachmentList.value = []
    }
  }
}

// 监听petitionId变化，获取附件列表
watch(() => props.petitionInfo?.petitionId, (newVal) => {
  if (newVal) {
    fetchAttachments()
  }
}, { immediate: true })

// 监听标签页切换，当切换到附件标签页时刷新数据
watch(() => activeTab.value, (newVal) => {
  if (newVal === 'case' && props.petitionInfo?.petitionId) {
    fetchAttachments()
  }
})

// 删除附件
const handleDeleteAttachment = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该附件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await AttachmentApi.deleteAttachment(id)
    ElMessage.success('删除附件成功')
    fetchAttachments()
    emit('refresh-attachments')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除附件失败:', error)
      ElMessage.error('删除附件失败')
    }
  }
}

// 上传附件对话框
const showUploadDialog = ref(false)
const formLoading = ref(false)
const fileList = ref([])
const uploadRef = ref()

/** 处理上传的文件发生变化 */
const handleFileChange = (file) => {
  console.log('文件变化:', file)
}

/** 提交表单 */
const submitFileForm = async (options) => {
  const { file, onSuccess, onError } = options

  if (fileList.value.length === 0) {
    ElMessage.error('请上传文件')
    return
  }
  formLoading.value = true
  
  try {
    // 使用Promise.all并行上传所有文件
    const uploadPromises = fileList.value.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file.raw)
      formData.append('petitionId', String(props.petitionInfo.petitionId || 0))
      const fd = new FormData()
      fd.append('file', file.raw)
      const result = await FileApi.updateFile(fd)
      formData.append("fileUrl", result.data)
      const response = await AttachmentApi.uploadAttachment(formData)
      return response
    })
    // 等待所有上传完成
    await Promise.all(uploadPromises)
    
    // 清理
    showUploadDialog.value = false
    formLoading.value = false
    uploadRef.value?.clearFiles()
    
    // 提示成功，并刷新
    ElMessage.success('附件上传成功')
    
    // 立即刷新附件列表
    await fetchAttachments()
    emit('refresh-attachments')
  } catch (error) {
    console.error('上传附件失败:', error)
    ElMessage.error('上传附件失败')
    formLoading.value = false
  }
}

/** 上传错误提示 */
const submitFormError = () => {
  ElMessage.error('上传失败，请您重新上传！')
  formLoading.value = false
}

/** 文件数超出提示 */
const handleExceed = () => {
  ElMessage.error('最多只能上传五个文件！')
}
</script>

<style scoped>
.tabs-info {
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.tabs-container {
  padding: 0;
}

.detail-tabs {
  margin: 0;
}

.tab-content {
  padding: 16px;
  background: #fff;
}

.petition-info,
.overview-info,
.case-info {
  margin-bottom: 16px;
}

.info-section {
  margin-bottom: 20px;
}

.section-title {
  color: #606266;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
}

.section-content {
  padding: 0 10px;
}

.content-box {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  line-height: 1.6;
  color: #606266;
  font-size: 13px;
  min-height: 80px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px dashed #d9d9d9;
}

.file-name {
  margin: 0 12px;
  flex: 1;
  font-size: 13px;
  color: #606266;
}

.attachment-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.upload-container {
  padding: 10px 0;
}

:deep(.el-tabs__header) {
  margin: 0;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 16px;
  background-color: #f5f7fa;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: transparent;
}

:deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  color: #606266;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
  font-weight: bold;
}

:deep(.el-tabs__active-bar) {
  background-color: #409EFF;
  height: 2px;
}
</style>
