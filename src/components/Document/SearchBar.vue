<template>
  <div class="search-container">
    <el-form :inline="true" class="search-form">
      <el-form-item label="文件名称">
        <el-input v-model="searchParams.fileName" placeholder="请输入公文标题" clearable></el-input>
      </el-form-item>
      <el-form-item label="来文单位">
        <el-input v-model="searchParams.sourceUnit" placeholder="请输入来文单位" clearable></el-input>
      </el-form-item>
      <el-form-item label="联系人">
        <el-input v-model="searchParams.contact" placeholder="请输入联系人" clearable></el-input>
      </el-form-item>
      <el-form-item label="电话">
        <el-input v-model="searchParams.phone" placeholder="请输入联系人电话" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue'

// 定义组件接收的属性
const props = defineProps({
  // 可以传入默认的搜索参数
  defaultParams: {
    type: Object,
    default: () => ({})
  }
})

// 定义组件触发的事件
const emit = defineEmits(['search', 'reset'])

// 搜索参数
const searchParams = ref({
  fileName: '',
  sourceUnit: '',
  contact: '',
  phone: '',
  ...props.defaultParams
})

// 处理搜索
const handleSearch = () => {
  emit('search', { ...searchParams.value })
}

// 处理重置
const handleReset = () => {
  // 重置搜索参数
  searchParams.value = {
    fileName: '',
    sourceUnit: '',
    contact: '',
    phone: '',
    ...props.defaultParams
  }
  // 触发重置事件
  emit('reset')
}
</script>

<style scoped>
.search-container {
  margin-bottom: 5px;
  padding: 2px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.search-form .el-form-item {
  margin-right: 10px;
  margin-bottom: 5px;
}
</style>
