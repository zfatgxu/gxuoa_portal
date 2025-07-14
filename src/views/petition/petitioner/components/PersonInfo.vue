<template>
  <div class="petitioners-container">
    <div class="header-actions">
      <div class="title-badge">
        <span class="title">信访人信息</span>
      </div>
      <div class="header-right">
        <el-button type="primary" size="small" plain class="print-btn">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
      </div>
    </div>
    
    <!-- 信访人列表 -->
    <div v-if="props.petitioners && props.petitioners.length > 0" class="petitioners-list">
      <div v-for="(petitioner, index) in props.petitioners" :key="index" class="petitioner-card">
        <div class="card-content">
          <div class="card-header">
            <div class="petitioner-index" v-if="props.petitioners.length > 1">
              <el-tag type="info" effect="plain" class="index-tag">信访人 {{ index + 1 }}</el-tag>
            </div>
            
            <div class="action-buttons">
              <el-button size="small" type="primary" circle>
                <el-icon><Phone /></el-icon>
              </el-button>
              <el-button size="small" type="info" circle @click="toggleSensitiveInfo(index)">
                <el-icon>
                  <Hide v-if="isSensitiveInfoVisible(index)" />
                  <View v-else />
                </el-icon>
              </el-button>
            </div>
          </div>
          
          <div class="avatar-info">
            <div class="avatar-container">
              <img :src="petitioner.avatar" class="avatar-image" />
            </div>
            <div class="basic-identity">
              <div class="name-gender">
                <span class="name">{{ petitioner.name }}</span>
                <el-tag size="small" type="primary" effect="plain" class="gender-tag">{{ petitioner.gender }}</el-tag>
              </div>
              <div class="contact-info">
                <el-icon><Phone /></el-icon>
                <span class="phone" v-if="isSensitiveInfoVisible(index)">{{ petitioner.phone }}</span>
                <span class="phone" v-else>{{ maskPhone(petitioner.phone) }}</span>
              </div>
              <div class="id-info">
                <span class="id-label"></span>
                <span class="id-value" v-if="isSensitiveInfoVisible(index)">{{ petitioner.idCard }}</span>
                <span class="id-value" v-else>{{ maskIdCard(petitioner.idCard) }}</span>
              </div>
            </div>
          </div>
          
          <div class="address-info">
            <el-icon><Location /></el-icon>
            <span class="address">{{ petitioner.address }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-content">
      <el-empty description="暂无信访人信息" />
    </div>
      

    </div>
</template>

<script setup lang="ts">
import { Phone, Location, Printer, InfoFilled, View, Hide } from '@element-plus/icons-vue'
import { ref, computed } from 'vue'

interface Petitioner {
  avatar: string
  name: string
  gender: string
  phone: string
  idCard: string
  address: string
}

interface PetitionersProps {
  petitioners: Petitioner[]
}

const props = defineProps<PetitionersProps>()

// 使用本地状态跟踪每个信访人的敏感信息显示状态
const sensitiveInfoVisibility = ref<Record<number, boolean>>({})

// 检查指定信访人的敏感信息是否显示
const isSensitiveInfoVisible = (index: number): boolean => {
  return !!sensitiveInfoVisibility.value[index]
}

// 切换指定信访人的敏感信息显示状态
const toggleSensitiveInfo = (index: number) => {
  sensitiveInfoVisibility.value[index] = !sensitiveInfoVisibility.value[index]
}

// 手机号码脱敏处理
const maskPhone = (phone: string) => {
  if (!phone) return ''
  // 保留前三位和后四位，中间用星号代替
  return phone.replace(/^(\d{3})\d*(\d{4})$/, '$1****$2')
}

// 身份证号脱敏处理
const maskIdCard = (idCard: string) => {
  if (!idCard) return ''
  // 保留前四位和后四位，中间用星号代替
  return idCard.replace(/^(\d{4})\d*(\d{4})$/, '$1**********$2')
}
</script>

<style scoped>
.petitioners-container {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
}

.petitioners-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.title-badge {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.print-btn {
  margin-left: auto;
}

.petitioner-card {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  width: calc(20% - 13px);
  min-width: 220px;
  flex-grow: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.petitioner-index {
  display: flex;
  align-items: center;
}

.index-tag {
  font-weight: bold;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.avatar-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.avatar-container {
  width: 64px;
  height: 80px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.basic-identity {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.name-gender {
  display: flex;
  align-items: center;
}

.gender-tag {
  font-size: 12px;
  height: 22px;
  line-height: 20px;
  padding: 0 6px;
}

.contact-info, .id-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.address-info {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #606266;
  font-size: 13px;
  padding-top: 6px;
  border-top: 1px dashed #e4e7ed;
}

.name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.id-label {
  color: #909399;
}

.phone, .id-value {
  color: #606266;
}

.address {
  flex: 1;
  color: #606266;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-clamp: 2;
}
</style>
