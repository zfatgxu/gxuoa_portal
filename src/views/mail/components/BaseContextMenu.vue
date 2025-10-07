<template>
  <div 
    v-if="visible"
    class="base-context-menu"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * 基础右键菜单组件
 * 提供统一的右键菜单样式和行为
 * 通过 slot 允许自定义菜单内容
 */
interface Props {
  visible: boolean
  x: number
  y: number
}

defineProps<Props>()
</script>

<style scoped>
.base-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 140px;
  padding: 4px 0;
  font-size: 14px;
  overflow: hidden;
}

/* 使用 :deep 为 slot 内容定义样式 */
.base-context-menu :deep(.menu-item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  color: #333;
  transition: background-color 0.2s;
  font-size: 14px;
}

.base-context-menu :deep(.menu-item:hover) {
  background-color: #f5f7fa;
}

.base-context-menu :deep(.menu-item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
}
</style>

