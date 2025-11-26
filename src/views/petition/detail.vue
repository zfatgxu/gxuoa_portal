<template>
  <ContentWrap>
  <div class="document-form-container">
    <div class="document-form">
      <div class="document-form-header">
        <h2>广西大学校务督办公室文件处理笺<br/>(信访转办用)</h2>
      </div>
      
      <!-- 主要内容折叠面板 -->
      <el-collapse v-model="mainContentActiveNames" class="main-content-collapse">
        <el-collapse-item title="信访基本信息" name="basicInfo">
          <el-form :model="formData" :rules="rules" ref="documentFormRef">
        <el-row style="justify-content: end;">
          <el-col :span="12">
            <el-form-item label="信访编号:" label-width="100px!important">
              <el-input v-model="formData.petitionNumber" placeholder="(自动生成)" readonly/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row style="justify-content: space-between;">
          <el-col :span="8" style="margin-right: 20px;">
            <el-form-item label="信访人:">
              <el-input v-model="formData.name" placeholder="请输入信访人" clearable :readonly="!isEditing"/>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="身份类别:" label-width="150px!important">
              <el-select v-model="formData.petitionerType" placeholder="请选择身份类别" clearable :disabled="!isEditing">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.PETITIONER_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="16">
            <el-form-item label="其他信息:" label-width="120px">
              <el-input v-model="formData.petitionerInfo" placeholder="如信访人电话、地址等信息" clearable :readonly="!isEditing"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="16">
            <el-form-item label="信访人单位:" label-width="120px">
              <el-input v-model="formData.petitionerUnit" placeholder="请输入单位名称" clearable :readonly="!isEditing"/>
            </el-form-item>
          </el-col>
        </el-row>



        <el-row style="justify-content: space-between;">
          <el-col :span="10">
            <el-form-item label="信访渠道:">
              <el-select v-model="formData.petitionChannel" placeholder="请选择渠道" clearable :disabled="!isEditing">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.PETITION_CHANNEL)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
                <!-- 可以根据实际需要添加更多选项 -->
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="10">
            <el-form-item label="信访原因:" label-width="100px!important">
              <el-select v-model="formData.purposeCategory" placeholder="请选择目的" clearable :disabled="!isEditing">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.PURPOSE_CATEGORY)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
                <!-- 可以根据实际需要添加更多选项 -->
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row style="justify-content: space-between;">
          <el-col :span="10">
            <el-form-item label="紧急程度:">
              <el-select v-model="formData.urgencyLevel" placeholder="请选择紧急程度" clearable :disabled="!isEditing">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="10">
            <el-form-item label="内容分类:" label-width="100px!important">
              <el-select v-model="formData.contentCategory" placeholder="请选择内容分类" clearable :disabled="!isEditing">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.CONTENT_CATEGORY)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
                <!-- 可以根据实际需要添加更多选项 -->
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="16">
            <el-form-item label="关键词:" label-width="120px">
              <el-input v-model="formData.keywords" placeholder="请填写内容类别细分" clearable :readonly="!isEditing"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="10">
            <el-form-item label="重复信访:">
              <el-select v-model="formData.isRepeat" placeholder="是否重复信访" clearable :disabled="!isEditing">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.IS_PRESENTATION)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="justify-content: space-between;">
          <el-col :span="10">
            <el-form-item label="校领导:" label-width="120px">
              <el-select 
                v-model="formData.leaderIds" 
                placeholder="请选择校领导" 
                multiple 
                clearable 
                filterable
                :disabled="!isEditing"
              >
                <el-option
                  v-for="leader in leaderOptions"
                  :key="leader.id"
                  :label="leader.nickname || leader.name"
                  :value="leader.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="信访办员工:" label-width="120px">
              <el-select 
                v-model="formData.petitionDept" 
                placeholder="请选择信访办员工" 
                multiple 
                clearable 
                filterable
                :disabled="!isEditing"
              >
                <el-option
                  v-for="staff in petitionDept"
                  :key="staff.id"
                  :label="staff.nickname || staff.name"
                  :value="staff.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="justify-content: space-between;">
          <el-col :span="10">
            <el-form-item label="牵头单位:">
              <el-select 
                v-model="formData.leadDeptIds" 
                placeholder="请选择牵头单位" 
                multiple 
                clearable 
                filterable
                :disabled="!isEditing"
              >
                <el-option
                  v-for="dept in deptOptions"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="协办单位:">
              <el-select 
                v-model="formData.assistDeptIds" 
                placeholder="请选择协办单位" 
                multiple 
                clearable 
                filterable
                :disabled="!isEditing"
              >
                <el-option
                  v-for="dept in deptOptions"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row style="justify-content: space-between;">
          <el-col :span="10">
            <el-form-item label="信访日期:">
              <el-date-picker
                v-model="formData.petitionDate"
                type="datetime"
                placeholder="选择信访日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                clearable
                :disabled="!isEditing"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="截止日期:">
              <el-date-picker
                v-model="formData.deadline"
                type="datetime"
                placeholder="选择截止日期和时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                clearable
                :disabled="!isEditing"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="18">
            <el-form-item label="标题:">
              <el-input v-model="formData.title" placeholder="请输入标题" clearable :readonly="!isEditing"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="正文:">
              <el-input type="textarea" v-model="formData.content" :autosize="{ minRows: 4 }" placeholder="请输入具体内容" clearable :readonly="!isEditing"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col>
            <el-form-item label=" ">
              <el-upload
                ref="uploadRef"
                :http-request="(options) => customUpload(options, 'petition')"
                :on-preview="previewFile"
                :before-remove="beforeRemove"
                :before-upload="beforeUpload"
                multiple
                v-model:file-list="petitionList"
                accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                :disabled="!isEditing"
              >
                <el-button type="primary" :icon=Paperclip :disabled="!isEditing">上传附件</el-button>
                <template #tip>
                  <div>
                    支持上传 doc、docx、pdf、xls、xlsx、jpg、jpeg、png、txt 格式文件，单个文件不超过20MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="form-actions">
          <template v-if="!isEditing">
            <el-button type="primary" @click="toggleEdit">
              编辑
            </el-button>
          </template>
          <template v-else>
            <el-button type="warning" @click="cancelEdit">
              取消
            </el-button>
            <el-button type="success" @click="saveEdit">
              保存
            </el-button>
          </template>
        </div>
      </el-form>
        </el-collapse-item>
      </el-collapse>

      <!-- 意见处理区域 -->
      <div class="opinion-section">
        <el-collapse v-model="activeNames">
          <el-collapse-item title="校领导批示意见" name="leaderOpinions">
            <div v-for="opinion in leaderOpinions" :key="opinion.createTime" class="opinion-item">
              <div class="opinion-header">
                <span class="opinion-name">{{ opinion.userName }}：</span>
                <span class="opinion-time">{{ formatTime(opinion.createTime) }}</span>
              </div>
              <div class="opinion-content">{{ opinion.note }}</div>
            </div>
            <div v-if="leaderOpinions.length === 0" class="no-opinion">暂无校领导意见</div>
          </el-collapse-item>

          <el-collapse-item title="督查办主任意见" name="petitionLeaderOpinions">
            <div v-for="opinion in petitionLeaderOpinions" :key="opinion.createTime" class="opinion-item">
              <div class="opinion-header">
                <span class="opinion-name">{{ opinion.userName }}：</span>
                <span class="opinion-time">{{ formatTime(opinion.createTime) }}</span>
              </div>
              <div class="opinion-content">{{ opinion.note }}</div>
            </div>
            <div v-if="petitionLeaderOpinions.length === 0" class="no-opinion">暂无信访办领导意见</div>
          </el-collapse-item>

          <el-collapse-item title="牵头单位意见" name="leadDeptOpinions">
            <div v-for="opinion in leadDeptOpinions" :key="opinion.createTime" class="opinion-item">
              <div class="opinion-header">
                <span class="opinion-name">{{ opinion.userName }}：</span>
                <span class="opinion-time">{{ formatTime(opinion.createTime) }}</span>
              </div>
              <div class="opinion-content">{{ opinion.note }}</div>
            </div>
            <div v-if="leadDeptOpinions.length === 0" class="no-opinion">暂无牵头单位意见</div>
          </el-collapse-item>

          <el-collapse-item title="协办单位意见" name="assistDeptOpinions">
            <div v-for="opinion in assistDeptOpinions" :key="opinion.createTime" class="opinion-item">
              <div class="opinion-header">
                <span class="opinion-name">{{ opinion.userName }}：</span>
                <span class="opinion-time">{{ formatTime(opinion.createTime) }}</span>
              </div>
              <div class="opinion-content">{{ opinion.note }}</div>
            </div>
            <div v-if="assistDeptOpinions.length === 0" class="no-opinion">暂无协办单位意见</div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import * as PetitionApi from '@/api/petition'
import { Paperclip } from '@element-plus/icons-vue'
import { KKFileView } from '@/components/KKFileView'
import type { UploadFile, UploadUserFile } from 'element-plus';
import * as FileApi from '@/api/infra/file'
import dayjs from 'dayjs'

const route = useRoute()
// 生成信访编号
const generatePetitionNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  // 生成4位随机序列号
  const id = getPetitionId()
  
  // 格式: XF-年月日-序列号，例如 XF-20250808-1234
  const petitionNumber = `XF-${year}${month}${day}-${id}`
  
  return petitionNumber
}

const getPetitionId = () => {
  // 生成2位随机数，范围从10到99
  return Math.floor(Math.random() * 90) + 10;
}

const previewFile = (file: any) => {
  if (file.url) {
    // 使用KKFileView进行文件预览
    KKFileView.preview(file.url, file.name)
  } else {
    ElMessage.warning('文件链接不存在，无法预览')
  }
}

const petitionList = ref<UploadUserFile[]>([]);
const petitionHandlingFileList = ref<UploadUserFile[]>([]);
const petitionReplyFileList = ref<UploadUserFile[]>([]);

const uploadedFileIds = ref<string[]>([]);
const customUpload = async (options: any, fileListType: string) => {
  const { file, onSuccess, onError } = options
  
  try {
    // 创建 FormData
    const formData = new FormData()
    formData.append('file', file)
    const result = await FileApi.updateFile(formData)
    file.url = result.data
    let index = -1

    // 由于 upload 方法返回的是 Promise<T>，我们需要获取实际的响应数据
    const response = await result
    if (response.code === 0) {
      // 如果上传成功，调用成功回调并传递响应数据 
      onSuccess(response)
      switch (fileListType) {
        case 'petitionHandling':
          index = petitionHandlingFileList.value.findIndex((item: any) => item.uid === file.uid)
          if (index !== -1) {
            petitionHandlingFileList.value[index].url = file.url
          }
          break
        case 'petitionReply':
          index = petitionReplyFileList.value.findIndex((item: any) => item.uid === file.uid)
          if (index !== -1) {
            petitionReplyFileList.value[index].url = file.url
          }
          break
        case 'petition':
          index = petitionList.value.findIndex((item: any) => item.uid === file.uid)
          if (index !== -1) {
            petitionList.value[index].url = file.url
          }
          break
      }
    } else {
      // 如果上传失败，调用错误回调
      const error = new Error(response.msg || '文件上传失败')
      // 从文件列表中移除失败的文件
      if (index !== -1) {
        switch (fileListType) {
          case 'petitionHandling':
            petitionHandlingFileList.value.splice(index, 1)
            break
          case 'petitionReply':
            petitionReplyFileList.value.splice(index, 1)
            break
          case 'petition':
            petitionList.value.splice(index, 1)
            break
        }
      }
      onError(error)
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    // 从文件列表中移除失败的文件
    let index = -1
    switch (fileListType) {
      case 'petitionHandling':
        index = petitionHandlingFileList.value.findIndex((item: any) => item.uid === file.uid)
        break
      case 'petitionReply':
        index = petitionReplyFileList.value.findIndex((item: any) => item.uid === file.uid)
        break
      case 'petition':
        index = petitionList.value.findIndex((item: any) => item.uid === file.uid)
        break
    }
    if (index !== -1) {
      switch (fileListType) {
        case 'petitionHandling':
          petitionHandlingFileList.value.splice(index, 1)
          break
        case 'petitionReply':
          petitionReplyFileList.value.splice(index, 1)
          break
        case 'petition':
          petitionList.value.splice(index, 1)
          break
      }
    }
    onError(error)
  }
}

const beforeRemove = (file: UploadFile) => {
  return ElMessageBox.confirm(`确定移除 ${file.name}？`).then(
    () => {
      // 从已上传文件ID列表中移除
      const index = uploadedFileIds.value.findIndex((id: any) => id === file.uid);
      if (index > -1) {
        uploadedFileIds.value.splice(index, 1);
      }
      return true;
    },
    () => {
      return false;
    }
  );
};

const beforeUpload = (file: UploadFile) => {
  const fileSize = file?.size / 1024 / 1024;
  if (fileSize > 20) {
    ElMessage.error('文件大小超过20MB，无法上传');
    return false;
  }
  return true;
}

// 格式化时间戳
const formatTime = (timestamp: number | string) => {
  if (!timestamp) return '';
  
  // 如果时间戳是字符串，尝试转换为数字
  const time = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  
  // 使用dayjs格式化时间，格式为：YYYY-MM-DD HH:mm:ss
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
}

// 编辑状态
const isEditing = ref(false)

// 主要内容折叠面板激活项
const mainContentActiveNames = ref(['basicInfo'])

// 意见折叠面板激活项
const activeNames = ref(['leaderOpinions', 'petitionLeaderOpinions', 'petitionOfficeOpinions', 'leadDeptOpinions', 'assistDeptOpinions'])

// 意见数据
const leaderOpinions = ref([]) // 校领导意见
const petitionLeaderOpinions = ref([]) // 信访办领导意见
const petitionOfficeOpinions = ref([]) // 信访办意见
const leadDeptOpinions = ref([]) // 牵头单位意见
const assistDeptOpinions = ref([]) // 协办单位意见

// 表单数据
const formData = reactive({
  petitionNumber: '', // 信访编号
  name: '', // 信访人
  petitionerType: '', // 身份类别
  petitionerInfo: '', // 其他信息
  petitionerUnit: '', // 信访人单位
  purposeCategory: '', // 原因分类
  petitionChannel: '', // 信访渠道
  urgencyLevel: '', // 紧急程度
  contentCategory: '', // 内容分类
  isRepeat: '', // 重复信访
  leadDeptIds: [], // 牵头单位ID列表
  assistDeptIds: [], // 协办单位ID列表
  leaderIds: [], // 校领导ID列表
  title: '', // 文件标题
  content: '', // 具体内容
  petitionDate: '', // 信访日期
  deadline: '', //截止日期
  keywords: '', // 关键词
  petitionDept: [],
})

// 原始数据备份
const originalData = ref({})

// 切换编辑状态
const toggleEdit = () => {
  if (!isEditing.value) {
    // 进入编辑模式，备份当前数据
    originalData.value = JSON.parse(JSON.stringify(formData))
  }
  isEditing.value = !isEditing.value
}

// 取消编辑，恢复原始数据
const cancelEdit = () => {
  // 恢复原始数据
  Object.assign(formData, originalData.value)
  isEditing.value = false
}

// 保存编辑
const saveEdit = async () => {
  try {
    // 表单验证
    if (!documentFormRef.value) return
    
    const valid = await documentFormRef.value.validate()
    if (!valid) {
      ElMessage.error('表单验证失败，请检查输入内容')
      return
    }
    // 调用API保存数据
    const saveData = {
      ...formData,
      id: Number(route.query.id) // 从路由参数获取信访ID
    }
    console.log(saveData)
    await PetitionApi.updatePetition(saveData)
    ElMessage.success('保存成功')
    isEditing.value = false
    getDetail()
    
    // 触发全局事件，通知write/detail.vue刷新数据
    window.dispatchEvent(new CustomEvent('petition-data-updated', {
      detail: {
        petitionId: Number(route.query.id),
        timestamp: Date.now()
      }
    }))
    
  } catch (error) {
    console.error('保存失败:', error)
    const errorMsg = extractErrorMessage(error) || '保存失败，请重试'
    ElMessage.error(errorMsg)
  }
}

// 表单验证规则
const rules = reactive({
  petitioner: [{ required: true, message: '请输入信访人', trigger: 'blur' }],
  petitionerType: [{ required: true, message: '请选择信访人身份类别', trigger: 'change' }],
  documentTitle: [{ required: true, message: '请输入文件标题', trigger: 'blur' }],
  petitionChannel: [{ required: true, message: '请选择信访渠道', trigger: 'change' }],
  purposeCategory: [{ required: true, message: '请选择目的分类', trigger: 'change' }],
  contentCategory: [{ required: true, message: '请选择内容分类', trigger: 'change' }],
  subject: [{ required: true, message: '请输入主题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入具体内容', trigger: 'blur' }]
})

const documentFormRef = ref()
const deptList = ref<DeptApi.DeptVO[]>([])
const userList = ref<any[]>([])

// 部门选项列表
const deptOptions = ref<DeptApi.DeptVO[]>([])

// 校领导选项列表
const leaderOptions = ref<any[]>([])

// 信访办员工选项列表
const petitionDept = ref<any[]>([])

const loadDeptList = async () => {
  try {
    const result = await DeptApi.getSimpleDeptList()
    deptList.value = result || []
    deptOptions.value = result || []
  } catch (error) {
    console.error('加载部门列表失败:', error)
    ElMessage.error('加载部门列表失败')
  }
}

const loadUserList = async () => {
  try {
    const result = await UserApi.getSimpleUserList()
    userList.value = result || []
    console.log(userList.value)
    leaderOptions.value = userList.value.filter(user => {
      return user.deptNames.includes('校领导')
    })
    // 筛选信访办员工
    petitionDept.value = userList.value.filter(user => {
      return user.deptNames.includes('信访办')
    })
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  }
}

const id = route.query.id

const getDetail = () => {
  PetitionApi.getPetition(id).then(res => {
    console.log(res)
    formData.name = res.name
    formData.petitionerType = res.petitionerType
    formData.petitionerInfo = res.petitionerInfo
    formData.petitionerUnit = res.petitionerUnit
    formData.petitionChannel = res.petitionChannel
    formData.purposeCategory = res.purposeCategory
    formData.urgencyLevel = res.urgencyLevel
    formData.contentCategory = res.contentCategory
    formData.isRepeat = res.isRepeat
    formData.title = res.title
    formData.content = res.content
    formData.petitionDate = dayjs(res.petitionDate).format('YYYY-MM-DD HH:mm:ss')
    formData.deadline = dayjs(res.deadline).format('YYYY-MM-DD HH:mm:ss')
    // 生成新的信访编号
    formData.petitionNumber = res.petitionNumber
    formData.assistDeptIds = res.assistDeptIds
    formData.leadDeptIds = res.leadDeptIds
    formData.leaderIds = res.leaderIds
    formData.petitionDept = res.petitionDept
    formData.keywords = res.keywords
    
    // 加载意见数据
  })
  loadOpinions()
}

// 加载意见数据
const loadOpinions = async () => {
  try {
    // 模拟从后端获取意见数据
    // 实际项目中应该调用相应的API接口
    const data = await PetitionApi.getNoteDetail(Number(id));
    
    // 根据类型分类意见
    leaderOpinions.value = data.filter(opinion => opinion.role === 0)
    petitionLeaderOpinions.value = data.filter(opinion => opinion.role === 1)
    leadDeptOpinions.value = data.filter(opinion => opinion.role === 2)
    assistDeptOpinions.value = data.filter(opinion => opinion.role === 3)
  } catch (error) {
    console.error('加载意见数据失败:', error)
    ElMessage.error('加载意见数据失败')
  }
}

// 监听批示意见提交事件，自动刷新数据
const handleCommentSubmitted = () => {
  getDetail()
  loadOpinions()
}

onMounted(async () => {
  await loadDeptList()
  await loadUserList()
  getDetail()
  formData.petitionNumber = generatePetitionNumber()
  
  window.addEventListener('petition-comment-submitted', handleCommentSubmitted)
})

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('petition-comment-submitted', handleCommentSubmitted)
})
</script>

<style scoped>
.document-form-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.document-form-header {
  text-align: center;
  margin-bottom: 30px;
}

.document-form-header h2 {
  font-size: 24px;
  color: #f10606;
  margin-bottom: 10px;
}

.document-form {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  justify-content: center;
  width: 900px;
}

.el-row {
  margin-bottom: 20px;
}

.cooperation-units-list {
  margin: 10px 0;
  padding: 10px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  min-height: 40px;
}

.unit-processing-section {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.unit-processing-section h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

/* 主要内容折叠面板样式 */
.main-content-collapse {
  margin-bottom: 30px;
  border: none;
  border-radius: 0;
}

.main-content-collapse .el-collapse-item__header {
  background-color: #f8f9fa;
  font-weight: bold;
  font-size: 18px;
  color: #f10606;
  padding: 20px;
  border: none;
  border-radius: 0;
}

.main-content-collapse .el-collapse-item__wrap {
  background-color: #fff;
  border: none;
}

.main-content-collapse .el-collapse-item__content {
  padding: 20px;
  border: none;
}

/* 意见处理区域样式 */
.opinion-section {
  margin-top: 30px;
  border-top: 2px solid #f10606;
  padding-top: 20px;
}

.opinion-section .el-collapse {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.opinion-section .el-collapse-item__header {
  background-color: #f8f9fa;
  font-weight: bold;
  font-size: 16px;
  color: #f10606;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.opinion-section .el-collapse-item__wrap {
  background-color: #fff;
}

.opinion-section .el-collapse-item__content {
  padding: 20px;
}

.opinion-item {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #f10606;
}

.opinion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.opinion-name {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.opinion-time {
  color: #666;
  font-size: 12px;
}

.opinion-content {
  color: #555;
  line-height: 1.5;
  font-size: 14px;
}

.no-opinion {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .document-form-container {
    padding: 10px;
  }

  .document-form {
    padding: 15px;
  }

}

:deep(.el-form-item__label) {
  font-weight: bold;
  color: #f10606;
  font-size: 18px;
  width: 110px !important;
  justify-content: start;
}

</style>