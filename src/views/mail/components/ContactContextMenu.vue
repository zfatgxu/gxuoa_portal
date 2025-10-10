<template>
  <BaseContextMenu :visible="visible" :x="x" :y="y">
    <div class="menu-item" @click="handleToggleStar">
      <el-icon><Star /></el-icon>
      <span>{{ isStarred ? '取消星标' : '添加星标' }}</span>
    </div>
  </BaseContextMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Star } from '@element-plus/icons-vue'
import BaseContextMenu from './BaseContextMenu.vue'
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

