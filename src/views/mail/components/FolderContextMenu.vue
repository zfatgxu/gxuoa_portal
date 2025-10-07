<template>
  <BaseContextMenu :visible="visible" :x="x" :y="y">
    <div v-if="!folderId" class="menu-item" @click="handleCreateFolder">新建文件夹</div>
    <div v-if="folderId" class="menu-item" @click="handleRenameFolder">重命名</div>
    <div v-if="folderId" class="menu-item" @click="handleDeleteFolder">删除文件夹</div>
  </BaseContextMenu>
</template>

<script setup lang="ts">
import BaseContextMenu from './BaseContextMenu.vue'

interface Props {
  visible: boolean
  x: number
  y: number
  folderId: number | null
}

interface Emits {
  (e: 'create-folder'): void
  (e: 'rename-folder', folderId: number): void
  (e: 'delete-folder', folderId: number): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleCreateFolder = () => {
  emit('create-folder')
}

const handleRenameFolder = () => {
  if (props.folderId) {
    emit('rename-folder', props.folderId)
  }
}

const handleDeleteFolder = () => {
  if (props.folderId) {
    emit('delete-folder', props.folderId)
  }
}
</script>


