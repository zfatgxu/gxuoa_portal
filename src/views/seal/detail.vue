<template>
  <div class="form-container">
    <div class="form-header">
      <h1>{{ detail.applyTitle }}</h1>
      <p style="color: red;">盖章编号：{{ detail.sealNumber }}</p>
    </div>
    <el-form label-width="120px" class="seal-form">
      <!-- 材料名称 -->
      <div class="form-section">
        <div class="section-header">材料名称</div>
        <div class="material-name-content">
          <el-input
            v-if="isRejectModifyStatus"
            v-model="detail.materialName"
            placeholder="请输入材料名称"
            class="material-input"
          />
          <span v-else>{{ detail.materialName }}</span>
        </div>
      </div>

      <!-- 材料类型 -->
      <div class="form-section">
        <div class="section-header">材料类型</div>
        <div class="material-type-content">
          <el-radio-group v-if="isRejectModifyStatus" v-model="detail.materialType">
            <el-radio
              v-for="dict in getDictOptions(DICT_TYPE.SEAL_APPLY_MATERIAL_TYPES)"
              :key="dict.value"
              :label="dict.value"
              class="material-checkbox"
            >
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
          <span v-else>{{ getDictLabel(DICT_TYPE.SEAL_APPLY_MATERIAL_TYPES, detail.materialType) }}</span>
        </div>
      </div>

      <!-- 印章类型 -->
      <div class="form-section">
        <div class="section-header">印章类型</div>
        <div class="seal-type-content">
          <div v-if="isRejectModifyStatus">
            <!-- 可编辑状态 -->
            <div class="seal-item" v-for="(seal, idx) in detail.sealTypes" :key="idx">
              <div class="seal-name-select">
                <el-select
                  v-model="seal.id"
                  placeholder="请选择印章类型"
                  class="custom-seal-select"
                  @change="(value) => updateSealName(idx, value)"
                >
                  <el-option
                    v-for="option in sealTypeOptions"
                    :key="option.id"
                    :label="option.name"
                    :value="option.id"
                  />
                </el-select>
              </div>
              <div class="seal-controls">
                <el-input-number
                  v-model="seal.quantity"
                  :min="1"
                  :max="99"
                  size="small"
                  class="quantity-input"
                />
                <span class="unit">个</span>
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="removeSealType(idx)"
                  v-if="detail.sealTypes.length > 1"
                >
                  删除
                </el-button>
              </div>
            </div>
            <div class="add-seal-button">
              <el-button type="primary" link @click="addSealType" class="add-seal-btn">
                <el-icon><Plus /></el-icon> 添加印章类型
              </el-button>
            </div>
          </div>
          <div v-else>
            <!-- 只读状态 -->
            <div class="seal-item" v-for="(seal, idx) in detail.sealTypes" :key="idx">
              <span class="seal-name">{{ seal.name }}</span>
              <div class="seal-controls">
                <span class="unit">{{ seal.quantity }}个</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 经办人、审核人和电话 -->
      <div class="form-section">
        <div class="connected-fields-row">
          <div class="connected-field-item">
            <div class="connected-field-header">经办人</div>
            <div class="connected-field-content">
              <el-input
                v-if="isRejectModifyStatus"
                v-model="detail.handlerSignature"
                placeholder="请输入经办人姓名"
                class="handler-input"
              />
              <span v-else>{{ detail.handlerSignature }}</span>
            </div>
          </div>
          <div class="connected-field-item">
            <div class="connected-field-header">审核人</div>
            <div class="connected-field-content">
              <el-input
                v-if="isRejectModifyStatus"
                v-model="detail.reviewerSignature"
                placeholder="请输入审核人姓名"
                class="reviewer-input"
              />
              <span v-else>{{ detail.reviewerSignature }}</span>
            </div>
          </div>
          <div class="connected-field-item">
            <div class="connected-field-header">电话</div>
            <div class="connected-field-content">
              <el-input
                v-if="isRejectModifyStatus"
                v-model="detail.phone"
                placeholder="请输入联系电话"
                class="phone-input"
              />
              <span v-else>{{ detail.phone }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 单位负责人审核意见 -->
      <div class="form-section">
        <div class="section-header">单位负责人审核意见</div>
        <div class="approval-opinion-content">
          <div v-if="getUnitLeaderOpinions().length > 0">
            <div v-for="(opinion, index) in getUnitLeaderOpinions()" :key="index" class="opinion-box" :class="{ 'mb-3': index < getUnitLeaderOpinions().length - 1 }">
              <div class="opinion-header">
                <span class="approver-name">{{ opinion.approver }}</span>
                <span v-if="shouldShowUnitLeaderStatusTag(opinion.status)" class="approval-status" :class="getStatusClass(opinion.status)">
                  {{ opinion.statusText }}
                </span>
                <span class="approval-time" v-if="opinion.time">
                  {{ opinion.time }}
                </span>
                <span class="opinion-round" v-if="getUnitLeaderOpinions().length > 1">
                  第{{ index + 1 }}次审批
                </span>
              </div>
              <div class="opinion-content">
                {{ opinion.content }}
              </div>
            </div>
          </div>
          <div v-else class="no-opinion">
            <span class="approver-info">待指定审批人</span>
            <span class="status-info">待审核</span>
          </div>
        </div>
      </div>

      <!-- 用印审核 -->
      <div class="form-section">
        <div class="section-header">用印审核</div>
        <div class="approval-opinion-content">
          <div v-if="getSealAuditOpinions().length > 0">
            <div v-for="(opinion, index) in getSealAuditOpinions()" :key="index" class="opinion-box" :class="{ 'mb-3': index < getSealAuditOpinions().length - 1 }">
              <div class="opinion-header">
                <span class="approver-name">{{ opinion.approver }}</span>
                <span v-if="shouldShowSealAuditStatusTag(opinion.status)" class="approval-status" :class="getStatusClass(opinion.status)">
                  {{ opinion.statusText }}
                </span>
                <span class="approval-time" v-if="opinion.time">
                  {{ opinion.time }}
                </span>
                <span class="opinion-round" v-if="getSealAuditOpinions().length > 1">
                  第{{ index + 1 }}次审批
                </span>
              </div>
              <div class="opinion-content">
                {{ opinion.content }}
              </div>
            </div>
          </div>
          <div v-else class="no-opinion">
            <span class="approver-info"></span>
            <span class="status-info"></span>
          </div>
        </div>
      </div>

      <!-- 附件 -->
      <div class="form-section">
        <div class="section-header">附件</div>
        <div class="upload-content">
          <!-- 可编辑状态 -->
          <div v-if="isRejectModifyStatus">
            <el-upload
              class="upload-demo"
              :http-request="handleUpload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :file-list="[]"
              :show-file-list="false"
              multiple
              :headers="{ Authorization: 'Bearer ' + getAccessToken() }"
              name="file"
              :before-upload="beforeUpload"
              :on-exceed="handleExceed"
            >
              <el-button type="primary">
                <el-icon style="vertical-align: middle; margin-right: 4px;"><Paperclip /></el-icon>
                选择文件
              </el-button>
              <template #tip>
                <div class="el-upload__tip">
                  仅支持常见文件类型（doc/docx/xls/xlsx/pdf/jpg/png等），单个文件不超过20MB，最多上传10个文件
                </div>
              </template>
            </el-upload>

            <!-- 已有附件列表 -->
            <div class="file-list" v-if="detail.attachments && detail.attachments.length > 0">
              <div class="file-section-title">已有附件</div>
              <div class="file-item" v-for="(file, index) in detail.attachments" :key="'existing-' + index">
                <div class="file-info">
                  <el-icon class="file-icon" :class="getFileIconClass(file.attachmentName)">
                    <Document />
                  </el-icon>
                  <span class="file-name">{{ file.attachmentName }}</span>
                  <span class="file-size">{{ file.attachmentSize }}</span>
                </div>
                <div class="file-status">
                  <el-tag type="success" size="small">
                    <el-icon><Check /></el-icon>
                    已上传
                  </el-tag>
                  <el-button type="primary" link size="small" @click="previewFile(file)">
                    查看
                  </el-button>
                  <el-button type="primary" link size="small">
                    <a :href="file.attachmentUrl" target="_blank" style="text-decoration: none; color: inherit;">下载</a>
                  </el-button>
                  <el-button type="danger" link size="small" @click="removeExistingFile(index)">
                    删除
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 新上传文件列表 -->
            <div class="file-list" v-if="uploadedFiles.length > 0">
              <div class="file-section-title" v-if="detail.attachments && detail.attachments.length > 0">新上传文件</div>
              <div class="file-item" v-for="(file, index) in uploadedFiles" :key="'new-' + index">
                <div class="file-info">
                  <el-icon class="file-icon" :class="file.type === 'excel' ? 'excel-icon' : (file.type === 'pdf' ? 'pdf-icon' : 'document-icon')">
                    <Document />
                  </el-icon>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ file.size }}</span>
                </div>
                <div class="file-status">
                  <el-tag v-if="file.status === 'success'" type="success" size="small">
                    <el-icon><Check /></el-icon>
                    上传成功
                  </el-tag>
                  <el-tag v-else type="danger" size="small">
                    <el-icon><Close /></el-icon>
                    上传失败
                  </el-tag>
                  <el-button type="primary" link size="small" @click="viewFile(file)">
                    查看
                  </el-button>
                  <el-button type="primary" link size="small" @click="removeFile(index)">
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 只读状态 -->
          <div v-else>
            <div class="file-list" v-if="detail.attachments && detail.attachments.length">
              <div class="file-item" v-for="file in detail.attachments" :key="file.attachmentId">
                <div class="file-info">
                  <el-icon class="file-icon" :class="getFileIconClass(file.attachmentName)">
                    <Document />
                  </el-icon>
                  <span class="file-name">{{ file.attachmentName }}</span>
                  <span class="file-size">{{ file.attachmentSize }}</span>
                </div>
                <div class="file-status">
                  <el-tag type="success" size="small">
                    <el-icon><Check /></el-icon>
                    上传成功
                  </el-tag>
                  <el-button type="primary" link size="small" @click="previewFile(file)">
                    查看
                  </el-button>
                  <el-button type="primary" link size="small">
                    <a :href="file.attachmentUrl" target="_blank" style="text-decoration: none; color: inherit;">下载</a>
                  </el-button>
                </div>
              </div>
            </div>
            <div v-else style="color:#888;">空</div>
          </div>
        </div>
      </div>

      <!-- 备注 -->
      <div class="form-section">
        <div class="section-header">备注</div>
        <div class="notes-content">
          <el-input
            v-if="isRejectModifyStatus"
            v-model="detail.attention"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
          <div v-else style="white-space:pre-line; color:#333;">{{ detail.attention }}</div>
        </div>
      </div>

      <!-- 注意事项 -->
      <div class="form-section" v-if="detail.unitNoticeContent">
        <div class="section-header">注意事项</div>
        <div class="notice-content">
          <div class="notice-text" v-html="detail.unitNoticeContent"></div>
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Qrcode } from '@/components/Qrcode'
import { propTypes } from '@/utils/propTypes'
import { formatDate } from '@/utils/formatTime'
import { KKFileView } from '@/components/KKFileView'
import { ElMessage } from 'element-plus'
import { Document, Check, Plus, Paperclip, Close } from '@element-plus/icons-vue'
import { getDept } from '@/api/system/dept'
import { sealApi } from '@/api/seal/seal'
import { getDictOptions, getDictLabel, DICT_TYPE } from '@/utils/dict'
import * as SealApi from '@/api/seal'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import { getAccessToken } from '@/utils/auth'


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
  },
  // 新增：当前任务信息，用于判断是否为驳回修改状态
  currentTask: {
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
const currentTask = props.currentTask

/** 判断是否为修改材料任务 */
const isRejectModifyStatus = computed(() => {
  // 修改材料任务只会有"申请人修改材料"这个节点
  return currentTask &&
         currentTask.name &&
         currentTask.name === '申请人修改材料'
})



// 印章类型选项（用于驳回修改时的下拉选择）
const sealTypeOptions = ref([])

// 获取印章类型选项
const getSealTypeOptions = async () => {
  try {
    // 检查是否有申请单位ID
    if (!detail.value.applyDept) {
      sealTypeOptions.value = []
      return
    }

    // 第一步：通过单位ID获取准确的单位名称
    let orgName = detail.value.applyDeptName // 先使用现有的名称作为默认值

    try {
      const deptInfo = await getDept(detail.value.applyDept)

      if (deptInfo && deptInfo.name) {
        orgName = deptInfo.name
      }
    } catch (deptError) {
      console.error('获取单位信息失败，使用现有名称:', deptError)
    }

    // 第二步：使用准确的单位名称获取印章类型
    const params = {
      pageSize: 100,
      orgName: orgName // 使用从系统接口获取的准确单位名称
    }

    const res = await sealApi.getsealPage(params)

    // 处理API响应
    if (res && res.list && Array.isArray(res.list) && res.list.length > 0) {
      sealTypeOptions.value = res.list.map(item => ({
        id: item.id,
        name: item.sealName
      }))
    } else {
      sealTypeOptions.value = []
    }
  } catch (error) {
    console.error('获取印章类型选项失败:', error)
    sealTypeOptions.value = []
  }
}



// 文件上传相关
const { uploadUrl, httpRequest } = useUpload()
const uploadedFiles = reactive([])

// 文件上传成功处理
const handleUploadSuccess = (response, file) => {
  uploadedFiles.push({
    name: file.name,
    size: formatFileSize(file.size),
    status: 'success',
    type: getFileType(file.name),
    url: response.data
  })

  ElMessage.success('文件上传成功')
}

// 文件上传错误处理
const handleUploadError = (error, file) => {
  console.error('文件上传失败:', error)
  ElMessage.error('文件上传失败')
}

// 删除文件
const removeFile = (index) => {
  uploadedFiles.splice(index, 1)
  ElMessage.success('文件已删除')
}

// 删除已有附件
const removeExistingFile = (index) => {
  if (detail.value.attachments && detail.value.attachments.length > index) {
    detail.value.attachments.splice(index, 1)
    ElMessage.success('附件已删除')
  }
}

// 查看文件
const viewFile = (file) => {
  if (file.url) {
    window.open(file.url, '_blank')
  }
}

// 文件上传前检查
const beforeUpload = (file) => {
  const isValidType = /\.(doc|docx|xls|xlsx|pdf|jpg|jpeg|png|gif)$/i.test(file.name)
  const isLt20M = file.size / 1024 / 1024 < 20

  if (!isValidType) {
    ElMessage.error('只支持常见文件类型（doc/docx/xls/xlsx/pdf/jpg/png等）')
    return false
  }
  if (!isLt20M) {
    ElMessage.error('文件大小不能超过20MB')
    return false
  }
  return true
}

// 文件超出限制处理
const handleExceed = (files, fileList) => {
  ElMessage.warning('最多只能上传10个文件')
}

// 文件上传处理
const handleUpload = (options) => {
  return httpRequest(options)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取文
const getFileType = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  if (['xls', 'xlsx'].includes(ext)) return 'excel'
  if (ext === 'pdf') return 'pdf'
  return 'document'
}

// 添加印章类型
const addSealType = () => {
  if (detail.value.sealTypes) {
    detail.value.sealTypes.push({
      id: '',
      name: '',
      quantity: 1
    })
  }
}

// 删除印章类型
const removeSealType = (index) => {
  if (detail.value.sealTypes && detail.value.sealTypes.length > 1) {
    detail.value.sealTypes.splice(index, 1)
  }
}

// 更新印章名称（当选择印章类型时同步更新名称）
const updateSealName = (index, sealId) => {
  if (detail.value.sealTypes && detail.value.sealTypes[index]) {
    // 根据选择的印章ID找到对应的印章名称
    const selectedSeal = sealTypeOptions.value.find(option => option.id === sealId)
    if (selectedSeal) {
      detail.value.sealTypes[index].name = selectedSeal.name
    }
  }
}



const filteredActivityNodes = computed(() => {
  return activityNodes.filter(
    (activity) => activity.id !== "StartUserNode" && activity.id !== "EndEvent" && activity.name !== "结束"
  );
});

// 从流程实例中获取userRoles数据
const userRoles = computed(() => {
  // 首先尝试从detail中获取
  if (detail.value && detail.value.userRoles) {
    return parseUserRoles(detail.value.userRoles);
  }

  // 如果detail中没有，尝试从流程实例的formVariables中获取
  if (props.processInstance && props.processInstance.formVariables && props.processInstance.formVariables.userRoles) {
    return parseUserRoles(props.processInstance.formVariables.userRoles);
  }

  // 如果都没有，再尝试从流程实例的variables中获取
  if (props.processInstance && props.processInstance.variables && props.processInstance.variables.userRoles) {
    return parseUserRoles(props.processInstance.variables.userRoles);
  }

  // 如果都没有，返回空对象
  return {};
});

// 解析userRoles数据，确保是正确的对象格式
function parseUserRoles(data) {
  // 如果是字符串，尝试解析为JSON
  if (typeof data === 'string') {
    try {
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
  return {};
}

// 根据角色顺序对审批人进行排序
const sortedApprovers = computed(() => {
  // 优先使用signers字段进行角色标识
  if (detail.value && detail.value.signers) {
    return parseSignersToApprovers(detail.value.signers);
  }

  // 如果没有审批节点数据，返回空数组
  if (!filteredActivityNodes.value || filteredActivityNodes.value.length === 0) {
    return [];
  }
  
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
      

      
      // 遍历活动中的所有任务，获取所有审批人
      activity.tasks.forEach(task => {
        if (task.assigneeUser) {
          const userId = task.assigneeUser.id;
          const nickname = task.assigneeUser.nickname;
          const status = activity.status;
          
          // 确定角色，优先使用userRoles中的数据
          let roleIndex = nodeRoleIndex;
          let roleTitle = activity.name;

          // 尝试从userRoles中获取角色
          if (userRoles.value && userRoles.value[userId]) {
            const role = userRoles.value[userId];
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
  

  return approvers;
})

// 将signers字段解析为审批人数组
function parseSignersToApprovers(signers) {
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
    return [];
  }
  
  // 定义角色标题数组
  const roleTitles = ['经办人', '审核人', '单位负责人'];
  
  // 将签字人名单转换为审批人对象数组
  const approvers = signerNames.map((name, index) => {
    const roleTitle = roleTitles[index] || `审核人${index + 1}`;
    
    // 默认状态为待审核
    let status = 0;
    
    // 从活动节点中查找匹配的审批状态
    if (filteredActivityNodes.value && filteredActivityNodes.value.length > 0) {
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
      }
    }
    
    return {
      nickname: name,
      roleTitle: roleTitle,
      status: status,
      userId: null
    };
  });
  

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
  materialType: '', // 材料类型，后端返回的是单个字符串值
  attention: '',
  attachments: [],
  sealState: 0,
  signers: '',
  phone: '',
  createTime: '',
  unitNoticeContent: '' // 注意事项内容
})

const fetchDetail = async () => {
  try {
    const res = await SealApi.getSealApplicationById(id)
    detail.value = res

    // 解析signers字段，分别设置经办人和审核人
    if (res.signers) {
      const signersArray = res.signers.split('，')
      detail.value.handlerSignature = signersArray[0] || ''
      detail.value.reviewerSignature = signersArray[1] || ''
      // 保留原始的signers字段，更新时需要用到
      detail.value.signers = res.signers
    } else {
      detail.value.handlerSignature = ''
      detail.value.reviewerSignature = ''
      detail.value.signers = ''
    }

    // 获取申请单位的印章使用注意事项
    if (res.applyDept) {
      await getUnitNotice(res.applyDept, res.applyDeptName || '申请单位')
    } else {
      // 尝试从其他可能的字段获取部门ID
      const possibleDeptId = res.deptId || res.unitId || res.departmentId
      if (possibleDeptId) {
        await getUnitNotice(possibleDeptId, res.applyDeptName || res.deptName || '申请单位')
      }
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 正确使用 onMounted 钩子
onMounted(async () => {
  // 先获取详情数据
  await fetchDetail()

  // 如果是驳回修改状态，需要加载印章类型选项（在获取详情后，这样可以获取到单位信息）
  if (isRejectModifyStatus.value) {
    await getSealTypeOptions()
  }

  updateQrText()
})

const previewFile = (file) => {
  KKFileView.preview(file.attachmentUrl)
}

// 获取文件图标类名
const getFileIconClass = (filename) => {
  if (!filename) return 'document-icon'
  const ext = filename.split('.').pop()?.toLowerCase()
  if (['xls', 'xlsx'].includes(ext)) return 'excel-icon'
  if (['pdf'].includes(ext)) return 'pdf-icon'
  return 'document-icon'
}

// 获取单位负责人审核意见（所有历史记录）
const getUnitLeaderOpinions = () => {
  const opinions = []

  // 如果有活动节点数据，获取所有相关的审批记录
  if (filteredActivityNodes.value && filteredActivityNodes.value.length > 0) {
    // 找到所有单位负责人相关的活动节点
    const unitLeaderActivities = filteredActivityNodes.value.filter(activity => {
      return activity.name === '单位负责人'
    })

    unitLeaderActivities.forEach((activity, activityIndex) => {
      if (activity.tasks && activity.tasks.length > 0) {
        activity.tasks.forEach((task, taskIndex) => {
          // 特殊处理：如果审批人为空，认为是自动通过
          if (!task.assigneeUser) {
            opinions.push({
              approver: '系统自动',
              status: 2,
              statusText: '自动通过',
              content: task.reason || '审批人为空，自动通过',
              time: task.endTime ? formatDate(task.endTime) : ''
            })
          } else {
            const statusText = activity.status === 2 ? '已同意' :
                              activity.status === 1 ? '处理中' :
                              activity.status === 5 ? '已驳回' : ''  // 其他状态不显示文本
            opinions.push({
              approver: task.assigneeUser.nickname,
              status: activity.status,
              statusText: statusText,
              content: task.reason || '',
              time: task.endTime ? formatDate(task.endTime) : ''
            })
          }
        })
      }
    })
  }


  return opinions
}

// 获取单位负责人审核意见（兼容旧方法）
const getUnitLeaderOpinion = () => {
  const opinions = getUnitLeaderOpinions()
  if (opinions.length > 0) {
    return opinions[opinions.length - 1] // 返回最后一次审批
  }

  return {
    approver: '',
    status: 0,
    statusText: '待审核',
    content: '',
    time: ''
  }
}

// 获取用印审核意见（返回已完成审批的记录）
const getSealAuditOpinions = () => {
  const opinions = []

  // 如果有活动节点数据，获取所有相关的审批记录
  if (filteredActivityNodes.value && filteredActivityNodes.value.length > 0) {
    // 找到所有用印审核相关的活动节点
    const sealAuditActivities = filteredActivityNodes.value.filter(activity => {
      return activity.name === '用印审核人'
    })

    sealAuditActivities.forEach((activity, activityIndex) => {
      if (activity.tasks && activity.tasks.length > 0) {
        activity.tasks.forEach((task, taskIndex) => {
          // 收集所有已完成审批的记录（不是处理中状态的都算完成）
          if (activity.status !== 1 && activity.status !== 0) {
            // 特殊处理：如果审批人为空，认为是自动通过
            if (!task.assigneeUser) {
              opinions.push({
                approver: '系统自动',
                status: 2,
                statusText: '已同意',
                content: task.reason || '审批人为空，自动通过',
                time: task.endTime ? formatDate(task.endTime) : ''
              })
            } else {
              // 显示同意和驳回状态的标签
              const statusText = activity.status === 2 ? '已同意' :
                                activity.status === 5 ? '已驳回' : ''
              opinions.push({
                approver: task.assigneeUser.nickname,
                status: activity.status,
                statusText: statusText,
                content: task.reason || '',
                time: task.endTime ? formatDate(task.endTime) : ''
              })
            }
          }
        })
      }
    })
  }

  return opinions
}

// 获取用印审核意见（兼容旧方法）
const getSealAuditOpinion = () => {
  const opinions = getSealAuditOpinions()
  if (opinions.length > 0) {
    return opinions[opinions.length - 1] // 返回最后一次审批
  }

  return {
    approver: '',
    status: 0,
    statusText: '待审核',
    content: '',
    time: ''
  }
}

// 判断是否显示状态标签（只显示已同意）- 保留用于兼容
const shouldShowStatusTag = (status) => {
  return status === 2  // 只显示已同意(2)的标签
}

// 判断是否显示单位负责人状态标签（显示已同意、处理中和已驳回）
const shouldShowUnitLeaderStatusTag = (status) => {
  return status === 2 || status === 1 || status === 5  // 显示已同意(2)、处理中(1)和已驳回(5)的标签
}

// 判断是否显示用印审核状态标签（显示已同意和已驳回）
const shouldShowSealAuditStatusTag = (status) => {
  return status === 2 || status === 5  // 显示已同意(2)和已驳回(5)的标签
}

// 获取审批状态对应的样式类
const getStatusClass = (status) => {
  switch (status) {
    case 2: return 'status-approved'    // 已同意
    case 1: return 'status-processing'  // 处理中
    case 5: return 'status-rejected'    // 已驳回
    default: return 'status-pending'    // 其他状态（不会显示，但保留样式）
  }
}

// 获取单位印章使用注意事项
const getUnitNotice = async (unitId: number, unitName: string) => {
  try {
    const notice = await getDept(unitId)

    if (notice && notice.sealAttention) {
      // 格式化注意事项，将数字序号转换为换行
      const formattedContent = notice.sealAttention.replace(/(\d+\.)/g, '<br>$1').replace(/^<br>/, '')
      detail.value.unitNoticeContent = formattedContent
    } else {
      detail.value.unitNoticeContent = ''
    }
  } catch (error) {
    console.error('获取单位印章使用注意事项失败:', error)
    detail.value.unitNoticeContent = ''
  }
}

// 更新印章申请（驳回修改时调用）
const updateSealApplication = async () => {
  try {

    // 验证必填字段
    if (!detail.value.materialName || detail.value.materialName.trim() === '') {
      ElMessage.error('请输入材料名称')
      return false
    }

    if (!detail.value.materialType) {
      ElMessage.error('请选择材料类型')
      return false
    }

    if (!detail.value.sealTypes || detail.value.sealTypes.length === 0) {
      ElMessage.error('请至少选择一种印章类型')
      return false
    }

    // 验证印章类型是否都已选择
    for (let i = 0; i < detail.value.sealTypes.length; i++) {
      const seal = detail.value.sealTypes[i]
      if (!seal.id || seal.id === '') {
        ElMessage.error(`请选择第${i + 1}个印章类型`)
        return false
      }
      if (!seal.quantity || seal.quantity < 1) {
        ElMessage.error(`第${i + 1}个印章类型的数量不能小于1`)
        return false
      }
    }

    // 处理附件数据：合并已有附件和新上传的附件，统一字段结构
    const existingAttachments = (detail.value.attachments || []).map(file => ({
      attachmentId: file.attachmentId,
      attachmentName: file.attachmentName,
      attachmentSize: file.attachmentSize,
      attachmentUrl: file.attachmentUrl
    }))

    const newAttachments = uploadedFiles.map(file => ({
      attachmentName: file.name,
      attachmentSize: file.size,
      attachmentUrl: file.url
      // 新上传的文件没有attachmentId，后端会自动生成
    }))

    const attachments = [...existingAttachments, ...newAttachments]

    // 构建signers字符串：经办人，审核人，单位负责人（第三个保持不变）
    const originalSigners = detail.value.signers || ''
    const signersArray = originalSigners.split('，')

    // 更新前两个签字人，保持第三个不变
    const newSigners = [
      detail.value.handlerSignature || signersArray[0] || '', // 经办人
      detail.value.reviewerSignature || signersArray[1] || '', // 审核人
      signersArray[2] || '' // 单位负责人（保持不变）
    ].join('，')

    // 构建更新数据
    const updateData = {
      id: id, // 印章申请单ID
      materialName: detail.value.materialName,
      materialType: detail.value.materialType, // 使用单数形式，与后端保持一致
      phone: detail.value.phone,
      signers: newSigners, // 使用组合后的signers字段
      sealTypes: detail.value.sealTypes,
      attention: detail.value.attention || '',
      attachments: attachments
    }

    // 调用更新接口
    await SealApi.updateSealApplication(updateData)
    ElMessage.success('修改成功')
    return true

  } catch (error) {
    console.error('更新印章申请失败:', error)
    ElMessage.error('修改失败，请重试')
    return false
  }
}

// 暴露更新方法给父组件调用
defineExpose({
  updateSealApplication
})
</script>


<style scoped>
.user-order {
  margin-left: 5px;
  color: #409EFF;
  font-weight: bold;
}

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

.custom-select .el-select__selection {
  font-size: 30px;
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
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60px;
  line-height: 1.4;
}

.material-name-content {
  flex: 1;
  padding: 20px 15px;
  background: #e8f4fd;
}

.material-input {
  width: 100%;
  height: 40px;
}

.material-input .el-input__inner {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
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

.custom-seal-select {
  width: 250px;
  font-size: 14px;
}

.custom-seal-select .el-input__inner {
  font-size: 14px;
  height: 36px;
  line-height: 36px;
}

.seal-name-select {
  flex: 1;
  display: flex;
  align-items: center;
}

.add-seal-button {
  margin-top: 10px;
  display: flex;
  justify-content: flex-start;
}

.add-seal-section {
  margin-bottom: 10px;
}

.add-seal-btn {
  font-size: 14px;
}

.title-with-edit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.edit-unit-btn {
  font-size: 14px;
  padding: 2px 5px;
}

.signature-content {
  flex: 1;
  padding: 15px;
  background: #f0f8ff;
}

.signature-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
}

.signature-row:last-child {
  margin-bottom: 0;
}

.signature-row .required {
  width: 140px; /* 或 144px，确保能容纳最长的标签 */
  min-width: 140px;
  text-align: left;
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
  max-width: 350px;
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

.file-section-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
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

.document-icon {
  color: #909399;
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

/* 经办人、审核人和电话连接布局 */
.connected-fields-row {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
}

.connected-field-item {
  flex: 1;
  display: flex;
  border-right: 1px solid #ddd;
  min-width: 0;
}

.connected-field-item:last-child {
  border-right: none;
}

.connected-field-header {
  width: 120px;
  min-width: 119px;
  padding: 20px 15px;
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  font-weight: bold;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60px;
  line-height: 1.4;
  flex-shrink: 0;
}

.connected-field-header.required::before {
  content: "* ";
  color: #f56c6c;
}

.connected-field-content {
  flex: 1;
  padding: 15px;
  background: white;
  display: flex;
  align-items: center;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.connected-field-input {
  width: 100%;
}

/* 注意事项样式 */
.notice-content {
  flex: 1;
  padding: 15px;
  background: #e8f4fd;
}

.notice-text {
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
}

.notice-text p {
  margin: 8px 0;
  padding-left: 0;
}

.notice-text p:first-child {
  margin-top: 0;
}

.notice-text p:last-child {
  margin-bottom: 0;
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

/* 审批意见样式 */
.approval-opinion-content {
  flex: 1;
  padding: 15px;
  background: #f8f9fa;
}

.opinion-box {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.opinion-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.approver-name {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.approval-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-approved {
  background: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b3e19d;
}

.status-rejected {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.status-processing {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.status-pending {
  background: #f4f4f5;
  color: #909399;
  border: 1px solid #d3d4d6;
}

.approval-time {
  color: #909399;
  font-size: 12px;
  margin-left: auto;
}

.opinion-content {
  color: #333;
  line-height: 1.6;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.no-opinion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  color: #909399;
}

.approver-info {
  font-weight: 500;
  color: #606266;
}

.status-info {
  color: #909399;
  font-size: 14px;
}

/* 多次审批记录样式 */
.mb-3 {
  margin-bottom: 12px;
}

.opinion-round {
  background: #f0f2f5;
  color: #666;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  margin-left: 8px;
}
</style>
