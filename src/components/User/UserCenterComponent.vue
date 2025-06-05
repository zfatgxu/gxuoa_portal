<template>
  <div class="user-center-container">
    <!-- 左侧个人信息卡片 -->
    <div class="user-info-card">
      <div class="card-header">个人中心</div>
      <div class="avatar-container">
        <div class="avatar">
          <img src="@/assets/default-avatar.png" alt="用户头像" />
        </div>
      </div>
      <div class="menu-list">
        <div class="menu-item">
          <i class="bi bi-person"></i>
          <span>用户名称</span>
        </div>
        <div class="menu-item">
          <i class="bi bi-phone"></i>
          <span>手机号码</span>
        </div>
        <div class="menu-item">
          <i class="bi bi-envelope"></i>
          <span>用户邮箱</span>
        </div>
        <div class="menu-item">
          <i class="bi bi-building"></i>
          <span>所在部门</span>
        </div>
        <div class="menu-item">
          <i class="bi bi-briefcase"></i>
          <span>所属岗位</span>
        </div>
        <div class="menu-item">
          <i class="bi bi-person-badge"></i>
          <span>所属职级</span>
        </div>
        <div class="menu-item">
          <i class="bi bi-card-list"></i>
          <span>角色权限</span>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="content-area">
      <div class="content-header">基本信息</div>
      
      <!-- 标签页 -->
      <div class="tabs">
        <div class="tab-item" :class="{ active: activeTab === 'basic' }" @click="activeTab = 'basic'">
          基本资料
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'">
          保密设置
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'social' }" @click="activeTab = 'social'">
          社交信息
        </div>
      </div>
      
      <!-- 基本资料表单 -->
      <div v-if="activeTab === 'basic'" class="form-container">
        <div class="form-item">
          <div class="form-label">
            <span class="required">*</span>用户昵称
          </div>
          <el-input v-model="userForm.nickname" placeholder="请输入用户昵称"></el-input>
        </div>
        
        <div class="form-item">
          <div class="form-label">
            <span class="required">*</span>手机号码
          </div>
          <el-input v-model="userForm.mobile" placeholder="请输入手机号码" disabled></el-input>
        </div>
        
        <div class="form-item">
          <div class="form-label">
            <span class="required">*</span>用户邮箱
          </div>
          <el-input v-model="userForm.email" placeholder="请输入用户邮箱"></el-input>
        </div>
        
        <div class="form-item">
          <div class="form-label">性别</div>
          <div class="radio-group">
            <el-radio v-model="userForm.gender" :label="1">男</el-radio>
            <el-radio v-model="userForm.gender" :label="2">女</el-radio>
          </div>
        </div>
        
        <div class="form-actions">
          <el-button type="primary" @click="saveUserInfo">保存</el-button>
          <el-button @click="resetForm">重置</el-button>
        </div>
      </div>
      
      <!-- 保密设置表单 -->
      <div v-if="activeTab === 'security'" class="form-container">
        <div class="form-item">
          <div class="form-label">旧密码</div>
          <el-input v-model="securityForm.oldPassword" type="password" placeholder="请输入旧密码"></el-input>
        </div>
        
        <div class="form-item">
          <div class="form-label">新密码</div>
          <el-input v-model="securityForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
        </div>
        
        <div class="form-item">
          <div class="form-label">确认密码</div>
          <el-input v-model="securityForm.confirmPassword" type="password" placeholder="请再次输入新密码"></el-input>
        </div>
        
        <div class="form-actions">
          <el-button type="primary" @click="changePassword">保存</el-button>
          <el-button @click="resetSecurityForm">重置</el-button>
        </div>
      </div>
      
      <!-- 社交信息表单 -->
      <div v-if="activeTab === 'social'" class="form-container">
        <div class="form-item">
          <div class="form-label">微信</div>
          <el-input v-model="socialForm.wechat" placeholder="请输入微信号"></el-input>
        </div>
        
        <div class="form-item">
          <div class="form-label">QQ</div>
          <el-input v-model="socialForm.qq" placeholder="请输入QQ号"></el-input>
        </div>
        
        <div class="form-actions">
          <el-button type="primary" @click="saveSocialInfo">保存</el-button>
          <el-button @click="resetSocialForm">重置</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue' 
import { ElMessage } from 'element-plus'
import userApi from '../../api/user'

// 当前激活的标签页
const activeTab = ref('basic')

// 加载状态
const loading = ref(false)

// 用户基本信息表单
const userForm = reactive({
  nickname: '',
  mobile: '',
  email: '',
  gender: 1, // 1男 2女
  avatar: ''
})

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    console.log('开始获取用户信息')
    const res = await userApi.getUserInfo()
    console.log('获取用户信息响应:', res)
    
    if (res && res.code === 0 && res.data) {
      const userData = res.data
      userForm.nickname = userData.nickname || ''
      userForm.mobile = userData.mobile || ''
      userForm.email = userData.email || ''
      userForm.gender = userData.gender || 1
      userForm.avatar = userData.avatar || ''
      
      // 如果有社交信息，也更新社交信息表单
      if (userData.wechat) socialForm.wechat = userData.wechat
      if (userData.qq) socialForm.qq = userData.qq
      
      console.log('用户信息获取成功:', userForm)
    } else {
      console.error('获取用户信息失败:', res)
      ElMessage.error(res?.msg || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 保存用户基本信息
const saveUserInfo = async () => {
  if (!userForm.nickname) {
    ElMessage.warning('请输入用户昵称')
    return
  }
  
  loading.value = true
  try {
    const res = await userApi.updateUser({
      nickname: userForm.nickname,
      email: userForm.email,
      gender: userForm.gender
    })
    
    if (res.code === 0) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存用户信息失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 重置用户基本信息表单
const resetForm = () => {
  // 重新获取用户信息
  fetchUserInfo()
}

// 安全设置表单
const securityForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 修改密码
const changePassword = async () => {
  if (!securityForm.oldPassword) {
    ElMessage.warning('请输入旧密码')
    return
  }
  
  if (!securityForm.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  
  if (securityForm.newPassword !== securityForm.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  
  loading.value = true
  try {
    const res = await userApi.updateUserPassword({
      oldPassword: securityForm.oldPassword,
      newPassword: securityForm.newPassword
    })
    
    if (res.code === 0) {
      ElMessage.success('密码修改成功')
      resetSecurityForm()
    } else {
      ElMessage.error(res.msg || '密码修改失败')
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('密码修改失败')
  } finally {
    loading.value = false
  }
}

// 重置安全设置表单
const resetSecurityForm = () => {
  securityForm.oldPassword = ''
  securityForm.newPassword = ''
  securityForm.confirmPassword = ''
}

// 社交信息表单
const socialForm = reactive({
  wechat: '',
  qq: ''
})

// 保存社交信息
const saveSocialInfo = async () => {
  loading.value = true
  try {
    // 社交信息可以作为用户扩展字段保存
    const res = await userApi.updateUser({
      wechat: socialForm.wechat,
      qq: socialForm.qq
    })
    
    if (res.code === 0) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存社交信息失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 重置社交信息表单
const resetSocialForm = () => {
  // 重新获取用户信息
  fetchUserInfo()
}
// 页面加载时获取用户信息
onMounted(() => {
  console.log('用户中心组件已挂载')
  try {
    fetchUserInfo()
  } catch (error) {
    console.error('在onMounted中调用fetchUserInfo时出错:', error)
  }
})
</script>

<style scoped>
.user-center-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 80px);
}

/* 左侧个人信息卡片 */
.user-info-card {
  width: 280px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 15px;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.avatar-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e1f1ff;
  box-shadow: 0 0 10px rgba(0, 120, 255, 0.2);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-list {
  padding: 0 15px 15px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover {
  color: #409EFF;
}

.menu-item i {
  margin-right: 10px;
  font-size: 16px;
}

/* 右侧内容区域 */
.content-area {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-header {
  padding: 15px;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #eee;
}

/* 标签页 */
.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  color: #409EFF;
}

.tab-item.active {
  color: #409EFF;
  border-bottom-color: #409EFF;
}

/* 表单样式 */
.form-container {
  padding: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.required {
  color: #f56c6c;
  margin-right: 4px;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
}
</style>
