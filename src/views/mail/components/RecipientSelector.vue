<template>
  <div class="form-row">
    <div class="form-label">{{ labelText }}：</div>
    <div class="form-field">
      <el-select
        :model-value="modelValue"
        multiple
        filterable
        remote
        reserve-keyword
        allow-create
        default-first-option
        :placeholder="placeholder"
        :remote-method="handleRemoteSearch"
        :loading="loading"
        class="recipient-select"
        @update:model-value="handleUpdate"
        @focus="handleFocus"
        @click="handleFocus"
      >
        <el-option
          v-for="item in userOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
          <div class="user-option">
            <el-avatar :size="24" :src="item.avatar">
              {{ item.name?.substring(0, 1) || '?' }}
            </el-avatar>
            <div class="user-info">
              <div class="user-name">{{ item.name }}</div>
              <div class="user-details">
                <span v-if="item.deptName" class="dept-info">{{ item.deptName }}</span>
                <span v-if="item.workId" class="work-id">工号: {{ item.workId }}</span>
                <span v-if="item.email" class="email-info">{{ item.email }}</span>
              </div>
            </div>
          </div>
        </el-option>
      </el-select>
    </div>
    <div v-if="showActions" class="form-actions">
      <span class="action-link" @click="handleToggleCc">抄送</span>
      <span class="action-link" @click="handleToggleBcc">密送</span>
      <span>|</span>
      <span class="action-link">分别发送</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserOption } from '../types/mail'

interface Props {
  modelValue: string[]
  type: 'recipients' | 'cc' | 'bcc'
  placeholder?: string
  showActions?: boolean
  userOptions: UserOption[]
  loading: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
  (e: 'toggle-cc'): void
  (e: 'toggle-bcc'): void
  (e: 'focus', type: 'recipients' | 'cc' | 'bcc'): void
  (e: 'remote-search', query: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入收件人姓名、工号或邮箱地址',
  showActions: false
})

const emit = defineEmits<Emits>()

// 标签文本
const labelText = computed(() => {
  switch (props.type) {
    case 'cc':
      return '抄送'
    case 'bcc':
      return '密送'
    default:
      return '收件人'
  }
})

const handleUpdate = (value: string[]) => {
  emit('update:modelValue', value)
}

const handleFocus = () => {
  emit('focus', props.type)
}

const handleToggleCc = () => {
  emit('toggle-cc')
}

const handleToggleBcc = () => {
  emit('toggle-bcc')
}

const handleRemoteSearch = (query: string) => {
  emit('remote-search', query)
}
</script>

<style scoped>
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.form-label {
  width: 70px;
  text-align: right;
  padding-right: 10px;
  font-size: 14px;
  color: #606266;
}

.form-field {
  flex: 1;
}

.form-actions {
  margin-left: 10px;
  display: flex;
  gap: 10px;
}

.action-link {
  color: #4e73df;
  cursor: pointer;
  font-size: 14px;
}

.action-link:hover {
  text-decoration: underline;
}

.recipient-select {
  width: 100%;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 4px 0;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.user-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
}

.user-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}

.dept-info,
.work-id,
.email-info {
  color: #909399;
  white-space: nowrap;
}
</style>

