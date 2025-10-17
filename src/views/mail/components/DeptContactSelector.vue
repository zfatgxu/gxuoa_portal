<template>
  <el-dialog
    :model-value="modelValue"
    title="选择联系人"
    width="1000px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <div class="selector-container">
      <!-- 左侧：部门树面板 -->
      <div class="dept-tree-panel">
        <div class="panel-header">
          <el-input
            v-model="deptSearchText"
            placeholder="请输入部门名称"
            clearable
            @input="handleDeptSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="tree-content">
          <el-tree
            ref="treeRef"
            :data="deptTreeData"
            :props="defaultProps"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            node-key="id"
            highlight-current
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node-content">
                <el-icon 
                  :class="getNodeIconClass(data)"
                  class="node-icon"
                >
                  <component :is="getNodeIcon(data)" />
                </el-icon>
                <el-tooltip :content="node.label" placement="top" :show-after="500">
                  <span class="node-label">{{ node.label }}</span>
                </el-tooltip>
              </div>
            </template>
          </el-tree>
        </div>
      </div>
      
      <!-- 右侧：用户列表面板 -->
      <div class="user-list-panel">
        <div class="panel-header">
          <span class="dept-name">{{ currentDeptName || '请选择部门' }}</span>
          <span v-if="currentDeptUsers.length > 0" class="user-count">
            {{ currentDeptUsers.length }} 人
          </span>
        </div>
        
        <div class="user-list-content">
          <div v-if="currentDeptUsers.length === 0" class="empty-state">
            <el-icon class="empty-icon"><UserFilled /></el-icon>
            <p>{{ currentDeptName ? '该部门暂无用户' : '请从左侧选择部门' }}</p>
          </div>
          
          <div v-else class="user-items">
            <div
              v-for="user in currentDeptUsers"
              :key="user.id"
              class="user-item"
              @contextmenu.prevent="handleContextMenu($event, user)"
            >
              <el-avatar 
                :size="36"
                :src="user.avatar"
              >
                {{ (user.nickname || '?').substring(0, 1) }}
              </el-avatar>
              
              <div class="user-info">
                <div class="user-name">{{ user.nickname || '未知用户' }}</div>
                <div class="user-dept">{{ user.deptNames?.join('、') || '未知部门' }}</div>
              </div>
              
              <el-icon
                class="star-icon"
                :class="{ 'starred': isUserStarred(user) }"
                @click.stop="handleToggleStarClick(user)"
                title="添加/取消星标"
              >
                <component :is="isUserStarred(user) ? 'StarFilled' : 'Star'" />
              </el-icon>
              
              <div class="recipient-checkboxes">
                <el-checkbox
                  :model-value="isRecipientType(user.nickname, 'recipients')"
                  @change="(val) => handleRecipientChange(user.nickname, 'recipients', val)"
                >
                  收件人
                </el-checkbox>
                <el-checkbox
                  :model-value="isRecipientType(user.nickname, 'cc')"
                  @change="(val) => handleRecipientChange(user.nickname, 'cc', val)"
                >
                  抄送
                </el-checkbox>
                <el-checkbox
                  :model-value="isRecipientType(user.nickname, 'bcc')"
                  @change="(val) => handleRecipientChange(user.nickname, 'bcc', val)"
                >
                  密送
                </el-checkbox>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
  
  <!-- 右键菜单 -->
  <teleport to="body">
    <div
      v-if="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      @click="contextMenuVisible = false"
    >
      <div class="context-menu-item" @click="handleContextToggleStar">
        <el-icon><component :is="isUserStarred(contextMenuUser) ? 'StarFilled' : 'Star'" /></el-icon>
        <span>{{ isUserStarred(contextMenuUser) ? '取消星标' : '添加星标' }}</span>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElTree, ElMessage } from 'element-plus'
import { Search, OfficeBuilding, User, UserFilled, Star, StarFilled } from '@element-plus/icons-vue'
import { getSimpleDeptList } from '@/api/system/dept'
import { handleTree, defaultProps } from '@/utils/tree'

interface Props {
  modelValue: boolean
  allUsers: any[]
  recipients: string[]
  cc: string[]
  bcc: string[]
  starredContacts: any[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'add-recipient', name: string, type: 'recipients' | 'cc' | 'bcc'): void
  (e: 'remove-recipient', name: string, type: 'recipients' | 'cc' | 'bcc'): void
  (e: 'toggle-star', contact: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 状态
const treeRef = ref<InstanceType<typeof ElTree>>()
const deptTreeData = ref<any[]>([])
const deptSearchText = ref('')
const currentDeptId = ref<number | null>(null)
const currentDeptName = ref('')

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuUser = ref<any>(null)

// 计算属性：当前部门的用户列表
const currentDeptUsers = computed(() => {
  if (!currentDeptId.value || !props.allUsers.length) {
    return []
  }
  
  // 过滤出属于当前部门的用户
  return props.allUsers.filter(user => {
    // 检查用户的 deptIds 数组是否包含当前部门ID
    return Array.isArray(user.deptIds) && user.deptIds.includes(currentDeptId.value)
  })
})

// 判断用户是否被星标
const isUserStarred = (user: any) => {
  if (!props.starredContacts || props.starredContacts.length === 0) {
    return false
  }
  
  const userIdCard = user.idCard || user.id?.toString()
  return props.starredContacts.some(starred => {
    return starred.contactIdCard === userIdCard
  })
}

// 判断用户是否属于某个收件人类型
const isRecipientType = (nickname: string, type: 'recipients' | 'cc' | 'bcc') => {
  return props[type].includes(nickname)
}

// 加载部门树数据
const loadDeptTree = async () => {
  try {
    const deptList = await getSimpleDeptList()
    deptTreeData.value = handleTree(deptList)
  } catch (error: any) {
    ElMessage.error('加载部门数据失败')
    console.error('加载部门数据失败:', error)
  }
}

// 部门搜索过滤
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.name.includes(value)
}

// 处理部门搜索
const handleDeptSearch = (value: string) => {
  treeRef.value?.filter(value)
}

// 处理节点点击
const handleNodeClick = (data: any) => {
  currentDeptId.value = data.id
  currentDeptName.value = data.name
}

// 获取节点图标
const getNodeIcon = (data: any) => {
  if (data.children && data.children.length > 0) {
    return OfficeBuilding
  }
  return User
}

// 获取节点图标样式类
const getNodeIconClass = (data: any) => {
  if (data.children && data.children.length > 0) {
    return 'dept-icon'
  }
  return 'user-icon'
}

// 处理收件人类型变更（互斥逻辑）
const handleRecipientChange = (nickname: string, type: 'recipients' | 'cc' | 'bcc', checked: boolean) => {
  if (checked) {
    // 先移除用户在其他两个类型中的存在
    const otherTypes: Array<'recipients' | 'cc' | 'bcc'> = ['recipients', 'cc', 'bcc'].filter(t => t !== type) as Array<'recipients' | 'cc' | 'bcc'>
    
    otherTypes.forEach(otherType => {
      if (props[otherType].includes(nickname)) {
        emit('remove-recipient', nickname, otherType)
      }
    })
    
    // 添加到当前类型
    if (!props[type].includes(nickname)) {
      emit('add-recipient', nickname, type)
    }
  } else {
    // 取消选中，从当前类型中移除
    if (props[type].includes(nickname)) {
      emit('remove-recipient', nickname, type)
    }
  }
}

// 处理星标切换
const handleToggleStarClick = (user: any) => {
  const contact = {
    name: user.nickname,
    idCard: user.idCard || user.id?.toString()
  }
  emit('toggle-star', contact)
}

// 处理右键菜单
const handleContextMenu = (event: MouseEvent, user: any) => {
  contextMenuVisible.value = false
  nextTick(() => {
    contextMenuUser.value = user
    contextMenuX.value = event.clientX
    contextMenuY.value = event.clientY
    contextMenuVisible.value = true
    
    // 点击其他地方关闭菜单
    const closeMenu = () => {
      contextMenuVisible.value = false
      document.removeEventListener('click', closeMenu)
      document.removeEventListener('contextmenu', closeMenu)
    }
    
    setTimeout(() => {
      document.addEventListener('click', closeMenu)
      document.addEventListener('contextmenu', closeMenu)
    }, 100)
  })
}

// 右键菜单中的星标切换
const handleContextToggleStar = () => {
  if (contextMenuUser.value) {
    handleToggleStarClick(contextMenuUser.value)
  }
  contextMenuVisible.value = false
}

// 处理关闭
const handleClose = () => {
  emit('update:modelValue', false)
}

// 监听弹窗打开，加载数据
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadDeptTree()
  }
})
</script>

<style scoped>
.selector-container {
  display: flex;
  height: 600px;
  gap: 16px;
}

/* 左侧部门树面板 */
.dept-tree-panel {
  width: 40%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f7fa;
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* 树节点样式 */
.tree-node-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.node-icon {
  margin-right: 8px;
  font-size: 16px;
  flex-shrink: 0;
}

.dept-icon {
  color: #409eff;
}

.user-icon {
  color: #67c23a;
}

.node-label {
  overflow: hidden;
  font-size: 14px;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* Element Plus 树组件样式覆盖 */
:deep(.el-tree) {
  background-color: transparent;
}

:deep(.el-tree-node__content) {
  height: 32px;
  padding: 0 8px;
  border-radius: 4px;
}

:deep(.el-tree-node__content:hover) {
  background-color: rgb(0 0 0 / 4%);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: rgb(64 158 255 / 10%);
}

:deep(.el-tree-node.is-current .node-label) {
  font-weight: 500;
  color: #409eff;
}

/* 右侧用户列表面板 */
.user-list-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.user-list-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f7fa;
}

.dept-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.user-count {
  font-size: 13px;
  color: #909399;
  padding: 2px 8px;
  background-color: #e4e7ed;
  border-radius: 10px;
}

.user-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

/* 用户列表项 */
.user-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.2s;
}

.user-item:hover {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.user-item .el-avatar {
  flex-shrink: 0;
  background-color: #409eff;
}

.user-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.user-dept {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.star-icon {
  font-size: 18px;
  margin-right: 12px;
  color: #c0c4cc;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.star-icon:hover {
  color: #ffa500;
  transform: scale(1.1);
}

.star-icon.starred {
  color: #ffa500;
}

.recipient-checkboxes {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

:deep(.el-checkbox) {
  margin-right: 0;
}

:deep(.el-checkbox__label) {
  font-size: 13px;
  padding-left: 6px;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  z-index: 9999;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  min-width: 140px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f5f7fa;
}

.context-menu-item .el-icon {
  font-size: 16px;
  color: #909399;
}
</style>

