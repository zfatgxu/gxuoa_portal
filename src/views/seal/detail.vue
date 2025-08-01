<template>
  <div class="form-container">
    <div class="form-header">
      <h1>{{ detail.applyTitle }}</h1>
      <p v-if="status==2" style="color: red;">盖章编号：{{ detail.sealNumber }}</p>
    </div>
    <el-form label-width="120px" class="seal-form">
      <!-- 材料名称 -->
      <div class="form-section">
        <div class="section-header">材料名称</div>
        <div class="material-name-content">
          {{ detail.materialName }}
        </div>
      </div>
      <!-- 印章类型 -->
      <div class="form-section">
        <div class="section-header">印章类型</div>
        <div class="seal-type-content">
          <div class="seal-item" v-for="(seal, idx) in detail.sealTypes" :key="idx">
            <span class="seal-name">{{ seal.name }}</span>
            <div class="seal-controls">
              <span class="unit">{{ seal.quantity }}个</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 单位签字 -->
      <div class="form-section">
        <div class="section-header">单位签字</div>
        <div class="signature-content">
          <!-- 单位签字行 - 显示所有三个审批人 -->
          <div class="signature-row">
            <span class="required">单位签字</span>
            <span class="signature-value">
              <!-- 如果有审批节点数据 -->
              <template v-if="sortedApprovers && sortedApprovers.length > 0">
                <!-- 按照角色顺序显示审批人 -->
                <template v-for="(approver, index) in sortedApprovers" :key="index">
                  <!-- 根据审批节点类型添加标注 -->
                  <span 
                    :style="{
                      color: approver.status === 2 ? '#00b32a' : 
                            approver.status === 1 ? '#448ef7' : 
                            approver.status === 3 ? '#f46b6c' : ''
                    }"
                    class="approver-item"
                  >
                    {{ approver.nickname }}
                    <!-- 根据角色类型添加标注 -->
                    <span>
                      （{{ approver.roleTitle }} 
                      <template v-if="approver.status === 2">已同意</template>
                      <template v-else-if="approver.status === 1">处理中</template>
                      <template v-else-if="approver.status === 3">不同意</template>
                      <template v-else>待审核</template>
                      ）
                    </span>
                  </span>
                </template>
              </template>
              <!-- 如果没有审批人数据 -->
              <template v-else-if="filteredActivityNodes && filteredActivityNodes.length > 0">
                <!-- 按照原来的方式显示 -->
                <template v-for="(activity, index) in filteredActivityNodes" :key="index">
                  <template v-if="activity.tasks && activity.tasks.length > 0">
                    <!-- 遍历所有任务，显示每个任务的审批人 -->
                    <template v-for="(task, taskIndex) in activity.tasks" :key="taskIndex">
                      <span 
                        :style="{
                          color: activity.status === 2 ? '#00b32a' : 
                                activity.status === 1 ? '#448ef7' : 
                                activity.status === 3 ? '#f46b6c' : ''
                        }"
                        class="approver-item"
                      >
                        {{ task.assigneeUser?.nickname }}
                        <span>
                          <!-- 优先使用userRoles中的角色信息 -->
                          <template v-if="userRoles && userRoles[task.assigneeUser?.id]">
                            （{{ userRoles[task.assigneeUser?.id] }} 
                            <template v-if="activity.status === 2">已同意</template>
                            <template v-else-if="activity.status === 1">处理中</template>
                            <template v-else-if="activity.status === 3">不同意</template>
                            <template v-else>待审核</template>
                            ）
                          </template>
                          <!-- 如果没有userRoles信息，则使用活动名称来确定角色 -->
                          <template v-else>
                            <template v-if="activity.name.includes('经办人')">（经办人 
                              <template v-if="activity.status === 2">已同意</template>
                              <template v-else-if="activity.status === 1">处理中</template>
                              <template v-else-if="activity.status === 3">不同意</template>
                              <template v-else>待审核</template>
                            ）</template>
                            <template v-else-if="activity.name.includes('审批人')">（审批人 
                              <template v-if="activity.status === 2">已同意</template>
                              <template v-else-if="activity.status === 1">处理中</template>
                              <template v-else-if="activity.status === 3">不同意</template>
                              <template v-else>待审核</template>
                            ）</template>
                            <template v-else-if="activity.name.includes('单位负责人')">（单位负责人 
                              <template v-if="activity.status === 2">已同意</template>
                              <template v-else-if="activity.status === 1">处理中</template>
                              <template v-else-if="activity.status === 3">不同意</template>
                              <template v-else>待审核</template>
                            ）</template>
                          </template>
                        </span>
                      </span>
                    </template>
                  </template>
                </template>
              </template>
              <!-- 如果没有审批节点数据 -->
              <template v-else>
                尚未指定审批人
              </template>
            </span>
          </div>
          
          <!-- 印章单位负责人签字（如果存在） -->
          <div class="signature-row" v-if="detail.sealUnitLeaderId">
            <span class="required">印章单位负责人签字</span>
            <span class="signature-value">
              <el-tag v-if="detail.sealUnitLeaderStatus === 2" type="success" effect="light">
                {{ detail.sealUnitLeaderName }}（已同意）
              </el-tag>
              <el-tag v-else-if="detail.sealUnitLeaderStatus === 1" type="warning" effect="light">
                {{ detail.sealUnitLeaderName }}（处理中）
              </el-tag>
              <el-tag v-else-if="detail.sealUnitLeaderStatus === 3" type="danger" effect="light">
                {{ detail.sealUnitLeaderName }}（不同意）
              </el-tag>
              <el-tag v-else type="info" effect="light">
                {{ detail.sealUnitLeaderName || '未指定' }}（待审核）
              </el-tag>
            </span>
          </div>
        </div>
      </div>
      <!-- 材料类型 -->
      <div class="form-section">
        <div class="section-header">材料类型</div>
        <div class="material-type-content">
          {{ getDictLabel(DICT_TYPE.SEAL_APPLY_MATERIAL_TYPES, detail.materialType) }}
        </div>
      </div>
      <!-- 附件 -->
      <div class="form-section">
        <div class="section-header">附件</div>
        <div class="upload-content">
          <div class="file-list" v-if="detail.attachments && detail.attachments.length">
            <div class="file-item" v-for="file in detail.attachments" :key="file.attachmentId">
              <div class="file-info">
                <span class="file-name">{{ file.attachmentName }}</span>
                <span class="file-size">{{ file.attachmentSize }}</span>
                <a :href="file.attachmentUrl" target="_blank" style="margin-left:8px;">下载</a>
                <a @click="previewFile(file)" style="margin-left:8px; cursor:pointer; color:#409EFF;">预览</a>
              </div>
            </div>
          </div>
          <div v-else style="color:#888;">空</div>
        </div>
      </div>
      <!-- 申请摘要 -->
      <div class="form-section">
        <div class="section-header">申请备注</div>
        <div class="notes-content">
          <div style="white-space:pre-line; color:#333;">{{ detail.attention }}</div>
        </div>
      </div>

      <!-- 电话 -->
      <div class="form-section">
        <div class="section-header">电话</div>
        <div class="phone-content">
          {{ detail.phone }}
        </div>
      </div>

      <!-- 二维码 -->
      <div class="form-section qr-section" v-if="status==2">
        <div class="qr-content">
          <Qrcode :text="qrText" :width="120" />
        </div>
      </div>

    </el-form>
    
  </div>
</template>



<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Qrcode } from '@/components/Qrcode'
import { propTypes } from '@/utils/propTypes'
import * as SealApi from '@/api/seal'
import { formatDate } from '@/utils/formatTime'
import { KKFileView } from '@/components/KKFileView'
import { getDictLabel } from '@/utils/dict'
import { DICT_TYPE } from '@/utils/dict'
import { ElMessage } from 'element-plus'

//由网上印章申请，用户：  ，时间：   ，编号：
const qrText = ref('')

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  activityNodes: {
    type: Array,
    default: () => []
  },
  applyUser: {
    type: String,
    default: ''
  },
  applyTime: {
    type: String,
    default: ''
  },
  status: {
    type: Number,
    default: 0
  },
  processInstance: {
    type: Object,
    default: () => ({})
  }
})

//父组件传入的ID和activityNodes
const id = props.id
const applyId = props.applyId
const activityNodes = props.activityNodes
const applyUser = props.applyUser
const applyTime = props.applyTime
const status = props.status
console.log("印章详情组件接收到的参数：", { id, applyId, status, applyUser, applyTime })
console.log("印章详情组件接收到的审批节点：", activityNodes)

const filteredActivityNodes = computed(() => {
  return activityNodes.filter(
    (activity) => activity.id !== "StartUserNode" && activity.id !== "EndEvent" && activity.name !== "结束"
  );
});

// 从流程实例中获取userRoles数据
const userRoles = computed(() => {
  // 输出所有可能的数据源信息以便调试
  console.log('调试userRoles - detail值:', detail.value);
  console.log('调试userRoles - processInstance:', props.processInstance);
  
  // 首先尝试从detail中获取
  if (detail.value && detail.value.userRoles) {
    console.log('从detail中获取到userRoles:', detail.value.userRoles);
    // 检查数据格式是否正确
    return parseUserRoles(detail.value.userRoles);
  }
  
  // 如果detail中没有，尝试从流程实例的formVariables中获取
  if (props.processInstance && props.processInstance.formVariables && props.processInstance.formVariables.userRoles) {
    console.log('从流程实例的formVariables中获取到userRoles:', props.processInstance.formVariables.userRoles);
    return parseUserRoles(props.processInstance.formVariables.userRoles);
  }
  
  // 如果都没有，再尝试从流程实例的variables中获取
  if (props.processInstance && props.processInstance.variables && props.processInstance.variables.userRoles) {
    console.log('从流程实例的variables中获取到userRoles:', props.processInstance.variables.userRoles);
    return parseUserRoles(props.processInstance.variables.userRoles);
  }
  
  // 如果都没有，返回空对象
  console.log('无法获取userRoles数据，返回空对象');
  return {};
});

// 解析userRoles数据，确保是正确的对象格式
function parseUserRoles(data) {
  // 如果是字符串，尝试解析为JSON
  if (typeof data === 'string') {
    try {
      console.log('尝试将userRoles字符串解析为JSON:', data);
      return JSON.parse(data);
    } catch (e) {
      console.error('解析userRoles字符串失败:', e);
      return {};
    }
  }
  
  // 如果是对象，直接返回
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  
  // 其他情况返回空对象
  console.error('无法解析userRoles数据，类型:', typeof data);
  return {};
}

// 根据角色顺序对审批人进行排序
const sortedApprovers = computed(() => {
  // 优先使用signers字段进行角色标识
  if (detail.value && detail.value.signers) {
    console.log('使用signers字段进行角色标识:', detail.value.signers);
    return parseSignersToApprovers(detail.value.signers);
  }
  
  // 如果没有审批节点数据，返回空数组
  if (!filteredActivityNodes.value || filteredActivityNodes.value.length === 0) {
    return [];
  }
  
  console.log('开始排序审批人，节点数量:', filteredActivityNodes.value.length);
  console.log('可用的userRoles:', userRoles.value);
  
  // 首先将活动节点按照定义的顺序排序
  const sortedNodes = [...filteredActivityNodes.value];
  sortedNodes.sort((a, b) => {
    // 按照经办人 -> 审批人 -> 单位负责人的顺序排序
    const getNodeOrder = (node) => {
      if (node.name.includes('经办人')) return 0;
      if (node.name.includes('审批人')) return 1;
      if (node.name.includes('单位负责人')) return 2;
      return 3; // 其他节点放在最后
    };
    return getNodeOrder(a) - getNodeOrder(b);
  });
  
  console.log('排序后的节点:', sortedNodes.map(n => n.name));
  
  // 存储所有审批人信息
  const approvers = [];
  const roleNames = ['经办人', '审批人', '单位负责人'];
  
  // 从排序后的节点中提取审批人信息
  sortedNodes.forEach((activity, activityIndex) => {
    if (activity.tasks && activity.tasks.length > 0) {
      // 确定该活动节点的角色
      let nodeRoleTitle = '';
      let nodeRoleIndex = -1;
      
      // 根据活动名称确定角色
      if (activity.name.includes('经办人')) {
        nodeRoleTitle = '经办人';
        nodeRoleIndex = 0;
      } else if (activity.name.includes('审批人')) {
        nodeRoleTitle = '审批人';
        nodeRoleIndex = 1;
      } else if (activity.name.includes('单位负责人')) {
        nodeRoleTitle = '单位负责人';
        nodeRoleIndex = 2;
      } else if (activityIndex < roleNames.length) {
        // 如果活动名称不包含角色信息，则根据顺序分配角色
        nodeRoleTitle = roleNames[activityIndex];
        nodeRoleIndex = activityIndex;
      } else {
        // 其他情况下使用默认角色
        nodeRoleTitle = '审批人';
        nodeRoleIndex = 1;
      }
      
      console.log(`活动节点 ${activity.name} 的角色确定为: ${nodeRoleTitle}`);
      
      // 遍历活动中的所有任务，获取所有审批人
      activity.tasks.forEach(task => {
        if (task.assigneeUser) {
          const userId = task.assigneeUser.id;
          const nickname = task.assigneeUser.nickname;
          const status = activity.status;
          
          console.log(`处理审批人: ${nickname}, 用户ID: ${userId}, 活动名称: ${activity.name}`);
          
          // 确定角色，优先使用userRoles中的数据
          let roleIndex = nodeRoleIndex;
          let roleTitle = nodeRoleTitle;
          
          // 尝试从userRoles中获取角色
          if (userRoles.value && userRoles.value[userId]) {
            const role = userRoles.value[userId];
            console.log(`从userRoles中找到角色: ${role}`);
            if (role === '经办人') {
              roleIndex = 0;
              roleTitle = '经办人';
            } else if (role === '审批人') {
              roleIndex = 1;
              roleTitle = '审批人';
            } else if (role === '单位负责人') {
              roleIndex = 2;
              roleTitle = '单位负责人';
            }
          }
          
          // 添加到审批人数组
          approvers.push({
            userId,
            nickname,
            status,
            roleIndex,
            roleTitle,
            activityName: activity.name
          });
        }
      });
    }
  });
  
  // 按照角色索引排序
  approvers.sort((a, b) => a.roleIndex - b.roleIndex);
  
  console.log('排序后的审批人:', approvers);
  return approvers;
})

// 将signers字段解析为审批人数组
function parseSignersToApprovers(signers) {
  console.log('开始解析signers字段:', signers);
  
  let signerNames = [];
  
  // 如果signers是字符串，按逗号分割
  if (typeof signers === 'string') {
    // 去除空白字符并按逗号分割
    signerNames = signers.split('，').map(name => name.trim()).filter(name => name.length > 0);
    // 如果没有中文逗号，尝试英文逗号
    if (signerNames.length === 1) {
      signerNames = signers.split(',').map(name => name.trim()).filter(name => name.length > 0);
    }
  } else if (Array.isArray(signers)) {
    // 如果是数组，直接使用
    signerNames = signers;
  } else {
    console.error('无法解析signers数据，类型:', typeof signers);
    return [];
  }
  
  console.log('解析后的签字人名单:', signerNames);
  console.log('可用的活动节点:', filteredActivityNodes.value);
  
  // 定义角色标题数组
  const roleTitles = ['经办人', '审批人', '单位负责人'];
  
  // 将签字人名单转换为审批人对象数组
  const approvers = signerNames.map((name, index) => {
    const roleTitle = roleTitles[index] || `审批人${index + 1}`;
    
    // 默认状态为待审核
    let status = 0;
    
    // 从活动节点中查找匹配的审批状态
    if (filteredActivityNodes.value && filteredActivityNodes.value.length > 0) {
      console.log(`尝试为 ${roleTitle} (${name}) 查找匹配的活动节点`);
      
      // 查找与当前审批人匹配的活动节点
      const matchingActivities = filteredActivityNodes.value.filter(activity => {
        // 检查活动节点是否包含任务，且任务的执行人是当前审批人
        if (activity.tasks && activity.tasks.length > 0) {
          return activity.tasks.some(task => 
            task.assigneeUser && task.assigneeUser.nickname === name
          );
        }
        return false;
      });
      
      if (matchingActivities.length > 0) {
        // 找到匹配的活动节点，使用其状态
        status = matchingActivities[0].status || 0;
        console.log(`找到匹配的活动节点 ${matchingActivities[0].name}，状态: ${status}`);
      } else {
        console.log(`未找到 ${name} 的匹配活动节点，使用默认状态: 0`);
      }
    }
    
    return {
      nickname: name,
      roleTitle: roleTitle,
      status: status,
      userId: null
    };
  });
  
  console.log('转换后的审批人数组:', approvers);
  return approvers;
}

// 获取详情后设置二维码文本
const updateQrText = () => {
  qrText.value = `网上印章申请，用户：${applyUser}，时间：${formatDate(applyTime)}，编号：${detail.value?.applyId || ''}`
}

// 获取审批人在数组中的索引位置
const getApproverIndex = (userId) => {
  // 如果没有用户ID，返回-1
  if (!userId) return -1;
  
  // 如果有审批人顺序数据，使用它
  if (detail.value && detail.value.userRoles) {
    // 找到当前用户对应的角色
    const role = detail.value.userRoles[userId];
    if (role === '经办人') return 0;
    if (role === '审批人') return 1;
    if (role === '单位负责人') return 2;
  }
  
  // 如果没有角色数据，尝试从活动节点中获取顺序
  if (filteredActivityNodes.value && filteredActivityNodes.value.length > 0) {
    // 尝试找到用户在活动节点中的位置
    for (let i = 0; i < filteredActivityNodes.value.length; i++) {
      const activity = filteredActivityNodes.value[i];
      if (activity.tasks && activity.tasks.length > 0 && 
          activity.tasks[0].assigneeUser && 
          activity.tasks[0].assigneeUser.id === userId) {
        return i;
      }
    }
  }
  
  // 如果无法确定顺序，返回-1
  return -1;
};

// 初始化一个空的详情对象，包含所有可能的字段，避免渲染错误
const detail = ref({
  applyId: '',
  applyTitle: '',
  materialName: '',
  sealTypes: [],
  handlerSignature: '',
  reviewerSignature: '',
  unitHeadSignature: '',
  sealUnitLeaderSignature: '', // 印章单位负责人签字
  contactPhone: '',
  materialTypes: {
    nonContract: false,
    contractNotReviewed: false,
    contractReviewed: false
  },
  attention: '',
  attachments: [],
  sealState: 0,
  signers: '',
  phone: '',
  createTime: ''
})

const fetchDetail = async () => {
  console.log('获取详情ID:', id)
  
  //如果 getApplyInfoById API 已实现，请取消下面注释
  const res = await SealApi.getSealApplicationById(id)
  detail.value = res
  
  // 临时使用模拟数据
  // detail.value = {
  //   title: '印章申请详情',
  //   materialName: '合同原件',
  //   sealTypes: [
  //     { name: '公章', quantity: 2 },
  //     { name: '财务章', quantity: 1 }
  //   ],
  //   handlerSignature: '经办人签字',
  //   reviewerSignature: '审核人签字',
  //   unitHeadSignature: '单位负责人签字',
  //   contactPhone: '联系电话',
  //   materialTypes: {
  //     nonContract: true,
  //     contractNotReviewed: false,
  //     contractReviewed: false
  //   },
  //   notes: '注意事项',
  //   attachments: [
  //     {
  //       name: '合同原件',
  //       url: 'https://example.com/contract.pdf',
  //       size: '1.2MB'
  //     },
  //     {
  //       name: '合同原件2',
  //       url: 'https://example.com/contract.pdf',
  //       size: '1.2MB'
  //     }
  //   ],
  //   sealStatus: '未用印',
  // }
}

// 正确使用 onMounted 钩子
onMounted(() => {
  fetchDetail().then(() => {
    updateQrText()
  })
})

const previewFile = (file) => {
  KKFileView.preview(file.attachmentUrl)
}
</script>


<style scoped>
.approver-item {
  display: inline-block;
  margin-right: 12px;
  margin-bottom: 8px;
}
.qr-float-box {
  position: absolute;
  right: 32px;
  bottom: 32px;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.10);
  border-radius: 12px;
  padding: 16px 16px 8px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  position: relative;
}

.form-header {
  text-align: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
}

.form-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.seal-form {
  border: 2px solid #409eff;
  border-radius: 8px;
  overflow: hidden;
}

.form-section {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.form-section:last-child {
  border-bottom: none;
}

.section-header {
  width: 120px;
  padding: 20px 15px;
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  text-align: center;
  min-height: 60px;
}

.material-name-content {
  flex: 1;
  padding: 15px;
  background: #e8f4fd;
}

.material-input {
  width: 100%;
}

.seal-type-content {
  flex: 1;
  padding: 15px;
}

.seal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.seal-item:last-child {
  border-bottom: none;
}

.seal-name {
  flex: 1;
  color: #333;
}

.seal-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-input {
  width: 80px;
}

.unit {
  color: #666;
  font-size: 14px;
}

.custom-select {
  width: 120px;
}

.signature-content {
  flex: 1;
  padding: 15px;
  background: #f0f8ff;
}

.signature-row {
  display: flex;
  align-items: center;
 padding-bottom: 15px;
  gap: 15px;
}

.signature-row:last-child {
  margin-bottom: 0;
}
.signature-row .required {
  width: 140px; /* 或 144px，确保能容纳最长的标签 */
  min-width: 140px;
  text-align: center;
  margin-right: 12px;
  display: inline-block;
  flex-shrink: 0;
}

.required::before {
  content: "* ";
  color: #f56c6c;
}

.signature-input {
  flex: 1;
  max-width: 300px;
}

.material-type-content {
  flex: 1;
  padding: 15px;
}

.material-checkbox {
  display: block;
  margin-bottom: 10px;
}

.upload-content {
  flex: 1;
  padding: 15px;
}

.upload-demo {
  margin-bottom: 20px;
}

.file-list {
  margin-top: 15px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fafafa;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  font-size: 18px;
}

.excel-icon {
  color: #67c23a;
}

.pdf-icon {
  color: #f56c6c;
}

.file-name {
  font-weight: 500;
  color: #333;
}

.file-size {
  color: #666;
  font-size: 12px;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notes-content {
  flex: 1;
  padding: 15px;
}

.phone-content {

  padding: 15px;
  text-align: center;
}

.qr-content {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-right: 0;
}
.qr-section {
  padding-left: 0;
}

.form-actions {
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

:deep(.el-input-number) {
  width: 80px;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
}
</style>
