<template>
  <Dialog
    v-model="dialogVisible"
    title="邮件高级搜索"
    width="600px"
    :fullscreen="false"
  >
    <div class="advanced-search-body">
      <div class="search-form-row">
        <label class="search-label">关键字</label>
        <el-input 
          v-model="formData.keyword"
          placeholder="请输入"
          clearable
        />
      </div>

      <div class="search-form-row">
        <label class="search-label">关键字位置</label>
        <el-select v-model="formData.keywordLocation" placeholder="不限" clearable>
          <el-option label="主题" value="subject" />
          <el-option label="邮件正文" value="content" />
        </el-select>
      </div>

      <div class="search-form-row">
        <label class="search-label">发件人</label>
        <el-input 
          v-model="formData.sender"
          placeholder="请输入"
          clearable
        />
      </div>

      <div class="search-form-row">
        <label class="search-label">收件人</label>
        <el-input 
          v-model="formData.recipient"
          placeholder="请输入"
          clearable
        />
      </div>

      <div class="search-form-row">
        <label class="search-label">时间</label>
        <el-select v-model="formData.timeRange" placeholder="不限" clearable>
          <el-option label="不限" value="" />
          <el-option label="一天内" value="oneDay" />
          <el-option label="一周内" value="oneWeek" />
          <el-option label="一个月内" value="oneMonth" />
          <el-option label="六个月内" value="sixMonths" />
          <el-option label="一年内" value="oneYear" />
          <el-option label="自定义" value="custom" />
        </el-select>
      </div>

      <!-- 自定义时间范围 -->
      <div v-if="formData.timeRange === 'custom'" class="search-form-row">
        <label class="search-label">自定义时间</label>
        <el-date-picker
          v-model="customDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="flex: 1;"
        />
      </div>

      <div class="search-form-row">
        <label class="search-label">所在文件夹</label>
        <el-select v-model="formData.folder" placeholder="不限" clearable>
          <el-option label="不限" value="" />
          <el-option label="收件箱" value="inbox" />
          <el-option label="已发送" value="sent" />
          <el-option label="草稿箱" value="drafts" />
          <el-option label="已删除" value="deleted" />
          <el-option label="垃圾箱" value="trash" />
        </el-select>
      </div>

      <div class="search-form-row">
        <label class="search-label">是否包含附件</label>
        <el-select v-model="formData.hasAttachment" placeholder="不限" clearable>
          <el-option label="不限" value="" />
          <el-option label="包含附件" value="true" />
          <el-option label="不包含附件" value="false" />
        </el-select>
      </div>

      <div class="search-form-row">
        <label class="search-label">已读/未读</label>
        <el-select v-model="formData.readStatus" placeholder="不限" clearable>
          <el-option label="不限" value="" />
          <el-option label="已读" value="read" />
          <el-option label="未读" value="unread" />
        </el-select>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">搜索</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Dialog } from '@/components/Dialog'

// 定义搜索条件类型
export interface SearchCriteria {
  keyword: string
  keywordLocation: string
  sender: string
  recipient: string
  timeRange: string
  customStartDate?: string  // 自定义开始日期
  customEndDate?: string    // 自定义结束日期
  folder: string
  hasAttachment: string
  readStatus: string
}

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'search', criteria: SearchCriteria): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 双向绑定弹窗显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表单数据
const formData = ref<SearchCriteria>({
  keyword: '',
  keywordLocation: '',
  sender: '',
  recipient: '',
  timeRange: '',
  folder: '',
  hasAttachment: '',
  readStatus: ''
})

// 自定义日期范围
const customDateRange = ref<[string, string] | null>(null)

// 取消按钮
function handleCancel() {
  // 重置表单
  formData.value = {
    keyword: '',
    keywordLocation: '',
    sender: '',
    recipient: '',
    timeRange: '',
    folder: '',
    hasAttachment: '',
    readStatus: ''
  }
  customDateRange.value = null
  dialogVisible.value = false
}

// 提交搜索
function handleSubmit() {
  // 检查是否至少填写了一个搜索条件
  const hasAnyCriteria = 
    formData.value.keyword.trim() ||
    formData.value.sender.trim() ||
    formData.value.recipient.trim() ||
    formData.value.timeRange ||
    formData.value.folder ||
    formData.value.hasAttachment ||
    formData.value.readStatus
  
  if (!hasAnyCriteria) {
    ElMessage.warning('请至少填写一个搜索条件')
    return
  }
  
  // 如果选择了自定义时间，需要检查是否填写了日期范围
  if (formData.value.timeRange === 'custom') {
    if (!customDateRange.value || !customDateRange.value[0] || !customDateRange.value[1]) {
      ElMessage.warning('请选择自定义时间范围')
      return
    }
  }
  
  // 构造搜索条件
  const criteria: SearchCriteria = { ...formData.value }
  
  // 如果是自定义时间，添加开始和结束日期
  if (formData.value.timeRange === 'custom' && customDateRange.value) {
    criteria.customStartDate = customDateRange.value[0]
    criteria.customEndDate = customDateRange.value[1]
  }
  
  // 触发搜索事件
  emit('search', criteria)
  dialogVisible.value = false
}
</script>

<style scoped>
/* 弹窗内容样式 */
.advanced-search-body {
  padding: 10px 0;
}

.search-form-row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  gap: 12px;
}

.search-form-row:last-child {
  margin-bottom: 0;
}

.search-label {
  width: 100px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
  text-align: right;
}

.search-form-row :deep(.el-input),
.search-form-row :deep(.el-select) {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .search-label {
    width: 100%;
    text-align: left;
  }
}
</style>
