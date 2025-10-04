<template>
  <div 
    v-if="visible"
    class="context-menu"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <div class="context-menu-item" @click="handleToggleStar">
      <el-icon><Star /></el-icon>
      <span>{{ isStarred ? '取消星标' : '添加星标' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Star } from '@element-plus/icons-vue'
import type { LetterContactStarRespVO } from '@/api/mail/letter'

interface Props {
  visible: boolean
  x: number
  y: number
  contact: any
  type: 'recent' | 'starred'
  starredContacts: LetterContactStarRespVO[]
  starredContactDisplayNames: Map<number, string>
}

interface Emits {
  (e: 'toggle-star'): void
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 检查联系人是否已星标
const isStarred = computed(() => {
  if (!props.contact || !props.type) {
    return false
  }
  
  if (props.type === 'starred') {
    return true
  } else if (props.type === 'recent') {
    return props.starredContacts.some(starred => {
      const starredDisplayName = props.starredContactDisplayNames.get(starred.id)
      return starredDisplayName === props.contact.name || starred.contactIdCard === props.contact.idCard
    })
  }
  return false
})

const handleToggleStar = () => {
  emit('toggle-star')
  emit('update:visible', false)
}
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 120px;
  overflow: hidden;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f5f7fa;
}

.context-menu-item .el-icon {
  margin-right: 8px;
  font-size: 16px;
}
</style>

