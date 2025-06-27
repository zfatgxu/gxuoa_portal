<template>
    <div class="app-container">
      <div class="history-header">
        <span class="title">流转记录</span>
      </div>
      
      <!-- 流程进度条 -->
      <div class="snake-steps">
        <div 
          v-for="(rowSteps, rowIndex) in rows" 
          :key="rowIndex" 
          class="steps-row"
          :class="{ 'reverse': rowIndex % 2 !== 0 }"
        >
          <template v-for="(step, stepIndex) in rowSteps" :key="step.id">
            <div 
              class="step-item"
              :style="{ 
                backgroundColor: step.status === 'completed' ? 'rgba(103, 194, 58, 0.15)' : 'rgba(230, 162, 60, 0.15)',
                borderColor: step.status === 'completed' ? '#67C23A' : '#E6A23C',
                color: step.status === 'completed' ? '#67C23A' : '#E6A23C'
              }"
            >
              <span class="step-number" :style="{ backgroundColor: step.status === 'completed' ? '#67C23A' : '#E6A23C' }">{{ stepIndex + 1 + rowIndex * stepsPerRow }}</span>
              <span class="step-name">{{ step.name }}</span>
            </div>
            <!-- 在步骤项之间添加箭头 -->
            <div 
              v-if="stepIndex < rowSteps.length - 1" 
              class="step-connector"
            >
              <span class="step-arrow" :style="{ color: step.status === 'completed' ? '#67C23A' : '#E6A23C' }">
                {{ rowIndex % 2 === 0 ? '→' : '←' }}
              </span>
            </div>
          </template>
        </div>
      </div>
      
      <div class="history-content">
        <div v-if="!circulationList.length" class="empty-state">
          <el-empty description="暂无流转记录" />
        </div>
        
        <div v-else class="flow-history">
          <div class="flow-line"></div>
          
          <div class="flow-column">
            <div v-for="(item, index) in circulationList" :key="'item-'+index" class="flow-item">
              <div class="flow-number-dot" >
                {{ index + 1 }}
              </div>
              
              <div class="flow-content">
                <!-- 第一行：所有关键信息 -->
                <div class="flow-header">
                  <div class="flow-info-section">
                    <span class="flow-type">{{ item.typeName || '流转处理' }}</span>
                    <span class="flow-status">{{ item.circulationStatus}}</span>
                    <span class="flow-status" :style="{ backgroundColor: getStatusColor(item.status) }">{{ getStatusText(item.status) }}</span>
                  </div>
                  
                  <div class="flow-time-section">
                    <div class="time-row">
                      <i class="el-icon-time"></i>
                      <span class="time-label">到达：</span>
                      <span class="time-value">{{ formatTime(item.createTime) || '无' }}</span>
                    </div>
                    
                    <div class="time-row">
                      <i class="el-icon-view"></i>
                      <span class="time-label">打开：</span>
                      <span class="time-value">{{ formatTime(item.openTime) || '无' }}</span>
                    </div>
                    
                    <div class="time-row">
                      <i class="el-icon-finished"></i>
                      <span class="time-label">处理：</span>
                      <span class="time-value">{{ formatTime(item.createTime) || '无' }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- 第二行：处理意见 -->
                <div class="flow-body">
                  <div class="opinion-block">
                    <div class="opinion-header">
                      <span class="label">处理意见</span>
                      <span 
                        v-if="isOpinionLong(item.message)" 
                        class="toggle-btn" 
                        @click="toggleOpinion(index)"
                      >
                        {{ expandedOpinions[index] ? '收起' : '展开' }}
                      </span>
                    </div>
                    <p 
                      class="message" 
                      :class="{ 'collapsed': isOpinionLong(item.message) && !expandedOpinions[index] }"
                    >
                      {{ item.message || '无' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import * as circulationApi from '@/api/document/circulation'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const circulationList = ref([])
  
  // 流程步骤数据
  const processSteps = ref([])
  
  // 计算左右两列的项目
  const leftColumnItems = computed(() => {
    // 获取所有奇数索引的项目（0,2,4...）
    return circulationList.value.filter((_, index) => index % 2 === 0)
  })
  
  const rightColumnItems = computed(() => {
    // 获取所有偶数索引的项目（1,3,5...）
    return circulationList.value.filter((_, index) => index % 2 === 1)
  })
  
  // 格式化时间
  const formatTime = (time) => {
    if (!time) return ''
    const date = new Date(time)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  
  // 根据状态获取颜色
  const getStatusColor = (status) => {
    // status: 0 表示已处理，status: 1 表示未处理
    return status === 0 ? '#67C23A' : '#E6A23C'
  }
  
  // 获取状态文本
  const getStatusText = (status) => {
    // status: 0 表示已处理，status: 1 表示未处理
    return status === 0 ? '已处理' : '未处理'
  }
  
  // 获取流转记录
  const getList = async () => {
    try {
      const documentId = route.query.documentId
      if (!documentId) {
        ElMessage.warning('缺少文档ID参数')
        return
      }
      
      const res = await circulationApi.getListByDocumentId(Number(documentId))
      
      circulationList.value = res
        
        // 根据流转记录生成流程步骤
        generateProcessSteps(res)
      
    } catch (error) {
      ElMessage.error('获取流转记录失败')
    }
  }
  
  const stepsPerRow = 6 // 每行显示几个
  const rows = computed(() => {
    const result = []
    for (let i = 0; i < processSteps.value.length; i += stepsPerRow) {
      result.push(processSteps.value.slice(i, i + stepsPerRow))
    }
    return result
  })
  
  // 根据流转记录生成流程步骤
  const generateProcessSteps = (records) => {
    if (!records || records.length === 0) return
    
    // 清空现有步骤
    processSteps.value = []
    
    // 直接使用流转记录中的步骤，不去重
    const steps = records.map(record => {
      // 使用nodeName或其他名称字段作为步骤名称，如果没有则使用typeName或默认值
      const stepName = record.nodeName || record.typeName || '流转步骤'
      return { 
        id: record.id, // 保留ID用于状态匹配
        name: stepName, // 使用名称作为显示内容
        status: record.status === 0 ? 'completed' : 'pending',
        recordId: record.id // 保存原始记录ID用于状态更新
      }
    })
    
    // 更新步骤状态
    processSteps.value = steps
    
    // 更新步骤状态
    updateProcessStepsStatus(records)
  }
  
  // 更新流程步骤状态
  const updateProcessStepsStatus = (records) => {
    if (!records || records.length === 0 || processSteps.value.length === 0) return
    
    // 找到第一个未完成的步骤索引
    let firstUncompletedIndex = -1
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const stepIndex = processSteps.value.findIndex(step => step.recordId === record.id)
      
      if (stepIndex !== -1) {
        // status: 0 表示已完成，status: 1 表示未完成
        if (record.status === 0) {
          processSteps.value[stepIndex].status = 'completed'
        } else if (record.status === 1 && firstUncompletedIndex === -1) {
          firstUncompletedIndex = stepIndex
        }
      }
    }
    
    // 设置当前步骤
    if (firstUncompletedIndex !== -1) {
      processSteps.value[firstUncompletedIndex].status = 'current'
    } else if (processSteps.value.length > 0) {
      // 如果所有步骤都已完成，将最后一个步骤设为当前步骤
      const lastIndex = processSteps.value.length - 1
      if (processSteps.value[lastIndex].status !== 'completed') {
        processSteps.value[lastIndex].status = 'current'
      }
    }
  }
  
  // 展开/收起意见的状态
  const expandedOpinions = ref({})
  
  // 判断意见是否过长需要展开/收起
  const isOpinionLong = (opinion) => {
    if (!opinion) return false
    return opinion.length > 50 // 超过50个字符显示展开/收起按钮
  }
  
  // 切换展开/收起状态
  const toggleOpinion = (index) => {
    expandedOpinions.value[index] = !expandedOpinions.value[index]
  }
  
  onMounted(() => {
    getList()
  })
  </script>
  
  <style>
  /* 页面标题 */
  .history-header {
    padding: 15px 20px;
    margin-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }
  
  .history-header .title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    position: relative;
    padding-left: 12px;
    display: inline-block;
  }
  
  .history-header .title:before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 16px;
    width: 4px;
    background-color: #5B8FF9;
    border-radius: 2px;
  }
  
  /* 创新型流转历史页面样式 */
  .app-container {
    height: 100%;
    background-color: #f9fafc;
    padding: 0;
    overflow: auto;
  }
  
  .snake-steps {
    display: flex;
    flex-direction: column;
    //align-items: center;
    gap: 12px;
    margin-bottom: 10px;
    padding: 10px 0;
  }
  
  .steps-row {
    display: flex;
    align-items: center;
    //justify-content: center;
    margin-bottom: 8px;
    padding-left: 20px;
    padding-right: 30px;
  }
  
  .steps-row.reverse {
    flex-direction: row-reverse;
  }
  
  .step-item {
    position: relative;
    padding: 5px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 16px;
    background-color: #f5f7fa;
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #606266;
    white-space: nowrap;
    z-index: 2;
  }
  
  .step-completed {
    background-color: rgba(91, 143, 249, 0.15);
    border-color: #5B8FF9;
    color: #5B8FF9;
  }
  
  .step-current {
    background-color: rgba(91, 143, 249, 0.25);
    border-color: #5B8FF9;
    color: #5B8FF9;
    font-weight: bold;
  }
  
  .step-number {
    display: inline-block;
    width: 18px;
    height: 18px;
    background-color: #5B8FF9;
    color: #fff;
    border-radius: 50%;
    text-align: center;
    line-height: 18px;
    font-size: 11px;
    margin-right: 6px;
  }
  
  .step-connector {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    position: relative;
    z-index: 1;
  }
  
  .step-arrow {
    font-size: 16px;
    color: #c0c4cc;
  }
  
  .step-connector:has(+ .step-item[style*="borderColor: rgb(103, 194, 58)"]) .step-arrow,
  .step-item[style*="borderColor: rgb(103, 194, 58)"] + .step-connector .step-arrow {
    color: #67C23A;
  }
  
  .step-connector:has(+ .step-item[style*="borderColor: rgb(230, 162, 60)"]) .step-arrow,
  .step-item[style*="borderColor: rgb(230, 162, 60)"] + .step-connector .step-arrow {
    color: #E6A23C;
  }
  
  /* 内容区域 */
  .history-content {
    padding: 0 15px 20px;
    position: relative;
  }
  
  /* 空状态 */
  .empty-state {
    background-color: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }
  
  /* 极简列指示器 */
  .column-start {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #409EFF;
    margin-bottom: 15px;
    position: relative;
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2);
  }
  
  .column-start:after {
    content: '';
    position: absolute;
    width: 20px;
    height: 1px;
    background-color: #409EFF;
    right: -25px;
    top: 3px;
    animation: flash 2s infinite;
  }
  
  .column-next {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #409EFF;
    margin-bottom: 15px;
    opacity: 0.6;
  }
  
  @keyframes flash {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  
  /* 流转历史时间轴 */
  .flow-history {
    position: relative;
    padding: 10px 0;
  }
  
  /* 中央垂直线 */
  .flow-line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, transparent, #d0d7e9, #d0d7e9, transparent);
    transform: translateX(-50%);
    z-index: 1;
  }
  
  /* 流转项目 */
  .flow-item {
    position: relative;
    margin-bottom: 15px;
    padding-left: 20px;
    z-index: 2;
  }
  
  /* 时间轴上的点 */
  .flow-number-dot {
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #5B8FF9;
    left: 0;
    top: 15px;
    transform: translateX(-50%);
    z-index: 3;
    box-shadow: 0 0 0 4px rgba(91, 143, 249, 0.15);
    color: white;
    font-size: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 流转内容 */
  .flow-content {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    overflow: hidden;
    width: 100%;
    position: relative;
    border: 1px solid #eef0f5;
  }
  
  /* 流转项目头部 */
  .flow-header {
    background-color: #f5f7fa;
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
  }
  
  .flow-info-section {
    display: flex;
    align-items: center;
  }
  
  .flow-type {
    font-weight: 600;
    font-size: 14px;
    color: #2c3e50;
  }
  
  .flow-status {
    font-size: 12px;
    color: white;
    background-color: #5B8FF9;
    padding: 2px 8px;
    border-radius: 4px;
    margin-left: 8px;
  }
  
  .flow-time-section {
    display: flex;
    align-items: center;
    margin-left: 20px;
  }
  
  .time-row {
    display: flex;
    align-items: center;
    font-size: 11px;
    color: #8c9bab;
    margin-right: 12px;
  }
  
  .time-row i {
    margin-right: 4px;
    font-size: 12px;
    color: #5B8FF9;
  }
  
  .time-label {
    margin-right: 2px;
  }
  
  .time-value {
    color: #5c6b7a;
  }
  
  /* 流转内容主体 */
  .flow-body {
    padding: 15px;
  }
  
  /* 意见区块 */
  .opinion-block {
    margin-bottom: 12px;
  }
  
  .opinion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  
  .opinion-block .label {
    display: inline-block;
    font-size: 12px;
    color: #5B8FF9;
    background-color: rgba(91, 143, 249, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
  }
  
  .opinion-block .message {
    font-size: 13px;
    color: #2c3e50;
    margin: 0;
    line-height: 1.5;
    word-break: break-word;
  }
  
  .opinion-block .message.collapsed {
    max-height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .toggle-btn {
    font-size: 12px;
    color: #5B8FF9;
    cursor: pointer;
  }
  
  /* 响应式调整 */
  @media (max-width: 768px) {
    .flow-columns {
      flex-direction: column;
    }
    
    .flow-line {
      left: 20px;
      top: 0;
      bottom: 0;
    }
    
    .column-start, .column-next {
      margin-left: 20px;
    }
  }
  </style>
  