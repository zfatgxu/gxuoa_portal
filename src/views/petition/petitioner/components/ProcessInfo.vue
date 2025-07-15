<template>
  <div class="process-info">
    <div class="header">
      <span class="title">办理信息</span>
    </div>
    <div class="process-steps">
      <div class="process-step-header">
        <div class="step-header-item">办理单位</div>
        <div class="step-header-item">办理方式</div>
        <div class="step-header-item">去向单位</div>
        <div class="step-header-item">办理时间</div>
        <div class="step-header-item">操作</div>
      </div>
      
      <div v-for="(item, index) in props.processData" :key="index" class="process-step-item" :class="{ 'even-row': index % 2 === 1 }">
        <div class="step-content">
          <div class="step-cell">{{ item.department }}</div>
          <div class="step-cell">{{ item.processType }}</div>
          <div class="step-cell">{{ item.targetDepartment }}</div>
          <div class="step-cell">{{ item.processTime }}</div>
          <div class="step-cell action-cell">
            <div class="action-buttons">
              <el-button size="small" @click="handleView(item)">查看</el-button>
              <el-button size="small" type="primary" @click="handleSign(item)">签收</el-button>
              <el-button size="small" type="warning" @click="handleManage(item)">办理</el-button>
              <el-button size="small" type="danger" @click="handleReject(item)">驳回</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProcessItem {
  department: string
  processType: string
  targetDepartment: string
  processTime: string
}

interface ProcessInfoProps {
  processData: ProcessItem[]
}

const props = defineProps<ProcessInfoProps>()

// 按钮处理函数
const handleView = (row: ProcessItem) => {
  console.log('预览', row)
}

const handleSign = (row: ProcessItem) => {
  console.log('签收', row)
}

const handleManage = (row: ProcessItem) => {
  console.log('管理', row)
}

const handleReject = (row: ProcessItem) => {
  console.log('驳回', row)
}
</script>

<style scoped>
.process-info {
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.process-steps {
  padding: 0;
}

.process-step-header {
  display: flex;
  background-color: #eef1f6;
  border-bottom: 1px solid #e4e7ed;
  font-size: 13px;
  color: #606266;
  font-weight: bold;
}

.step-header-item {
  flex: 1;
  padding: 10px 12px;
  text-align: center;
  border-right: 1px solid #e4e7ed;
}

.step-header-item:last-child {
  border-right: none;
  width: 220px;
  flex: none;
}

.process-step-item {
  border-bottom: 1px solid #e4e7ed;
}

.process-step-item:last-child {
  border-bottom: none;
}

.even-row {
  background-color: #fafafa;
}

.step-content {
  display: flex;
  font-size: 13px;
  color: #606266;
}

.step-cell {
  flex: 1;
  padding: 10px 12px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  word-break: break-all;
}

.step-cell:last-child {
  border-right: none;
  width: 220px;
  flex: none;
}

.action-cell {
  padding: 5px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
}

.action-buttons .el-button {
  margin: 0;
}
</style>
