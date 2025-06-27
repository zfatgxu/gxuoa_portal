<template>
  <div class="search-container">
    <el-form :inline="true" class="search-form">
      <el-form-item label="文件名称">
        <el-input 
          v-model="searchParams.fileName" 
          placeholder="请输入公文标题" 
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      
      <el-form-item label="来文单位">
        <el-input 
          v-model="searchParams.sourceUnit" 
          placeholder="请输入来文单位" 
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="联系人">
        <el-input 
          v-model="searchParams.contact" 
          placeholder="请输入联系人" 
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="电话">
        <el-input 
          v-model="searchParams.phone" 
          placeholder="请输入联系人电话" 
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSearch" :loading="loading">
           搜索
        </el-button>
        <el-button @click="handleReset">
           重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, watch } from 'vue'

// 定义组件接收的属性
const props = defineProps({
  // 可以传入默认的搜索参数
  defaultParams: {
    type: Object,
    default: () => ({})
  },
  // 搜索结果
  searchResults: {
    type: Array,
    default: () => []
  },
  // 是否正在加载
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义组件触发的事件
const emit = defineEmits(['search', 'reset', 'update:searchResults'])

// 搜索参数
const searchParams = ref({
  fileName: '',
  sourceUnit: '',
  contact: '',
  phone: '',
  ...props.defaultParams
})

// 是否已经执行过搜索
const hasSearched = ref(false)

// 处理搜索
const handleSearch = () => {
  // 标记已经执行过搜索
  hasSearched.value = true
  
  // 构建搜索参数
  const params = { 
    ...searchParams.value
  }
  
  // 移除空值
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === null || params[key] === undefined) {
      delete params[key]
    }
  })
  
  // 触发搜索事件
  emit('search', params)
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
  
  // 重置搜索状态
  hasSearched.value = false
  
  // 触发重置事件
  emit('reset')
}
</script>

<style scoped>
.search-container {
  
  
  background-color: #f5f7fa;
  border-radius: 4px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 5px;
}

.search-form .el-form-item {
  margin-right: 10px;
  margin-bottom: 5px;
}
</style>
