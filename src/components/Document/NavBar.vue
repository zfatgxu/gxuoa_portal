<template>
    <ul class="submenu">
      <li v-for="item in navItems" :key="item.name">
        <a
          href="#"
          @click.prevent="switchComponent(item.name)"
          :class="{ active: modelValue === item.name }"
        >
          {{ item.label }}
        </a>
      </li>
    </ul>
  </template>
  
  <script setup lang="ts">
  import { eventBus, EVENT_NAMES } from '../../utils/eventBus' 
  
  defineProps<{
    modelValue: string
  }>()
  
  const emit = defineEmits(['update:modelValue'])
  
  // 切换组件的函数
  const switchComponent = (componentName: string) => {
    // 更新当前组件的状态
    emit('update:modelValue', componentName)
    
    // 通过事件总线通知其他组件
    eventBus.emit(EVENT_NAMES.SWITCH_COMPONENT, componentName)
  }
  
  const navItems = [
    { name: 'TodoComponent', label: '我的代办' },
    //{ name: 'MeetingDocComponent', label: '拟上会文件' },
    { name: 'InternalDocComponent', label: '已签校内文件' },
    { name: 'ExternalDocComponent', label: '已签校外文件' },
    { name: 'SchoolDocComponent', label: '已签学校发文' },
    { name: 'LeaveDocComponent', label: '请假文件' },
    { name: 'AllDocComponent', label: '全部公文' },
    { name: 'FavoriteDocComponent', label: '我的收藏' }
  ]
  </script>
  
  <style scoped>
  .submenu {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 6px;
    list-style: none;
  }
  
  .submenu li a {
    padding: 6px 12px;
    color: #333;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .submenu li a:hover {
    background-color: #e0e6ed;
  }
  
  .submenu li a.active {
    background-color: #409EFF;
    color: white;
  }
  </style>
  