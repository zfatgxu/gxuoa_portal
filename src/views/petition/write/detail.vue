<template>
    <div class="document-form-container">
      <div class="document-form">
        <div class="document-form-header">
          <h2>广西大学校务督办公室文件处理笺<br/>(信访转办用)</h2>
        </div>
        <el-form :model="formData" :rules="rules" ref="documentFormRef">
          <el-row style="justify-content: end;">
            <el-col :span="12">
              <el-form-item label="信访编号:" label-width="100px!important">
                <el-input v-model="formData.petitionNumber" placeholder="(自动生成)" readonly/>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col :span="8" style="margin-right: 20px;">
              <el-form-item label="信访人:">
                <el-input v-model="formData.petitioner" placeholder="请输入信访人" clearable/>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="信访人身份类别:" label-width="150px!important">
                <el-select v-model="formData.petitionerType" placeholder="请选择身份类别" clearable>
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
  
          <el-row >
            <el-col :span="8">
              <el-form-item label="信访人单位:" label-width="120px">
                <el-select v-model="formData.petitionerUnit" placeholder="请选择单位" clearable>
                  <el-option
                    v-for="dept in filteredPetitionerDepts"
                    :key="dept.id"
                    :label="dept.name"
                    :value="dept.name"
                    :data-id="dept.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" style="margin-left: 20px;margin-right: 20px;">
              <el-input v-model="inputPetitionerUnit" placeholder="输入单位名称" clearable @change="searchPetitionerDepts"/>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col :span="18">
              <el-form-item label="文件标题:">
                <el-input v-model="formData.documentTitle" placeholder="请输入文件标题" clearable/>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row style="justify-content: space-between;">
            <el-col :span="10">
              <el-form-item label="信访渠道:">
                <el-select v-model="formData.petitionChannel" placeholder="请选择渠道" clearable>
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
              <el-form-item label="目的分类:" label-width="100px!important">
                <el-select v-model="formData.purposeCategory" placeholder="请选择目的" clearable>
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
                <el-select v-model="formData.urgencyLevel" placeholder="请选择紧急程度" clearable>
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
                <el-select v-model="formData.contentCategory" placeholder="请选择内容分类" clearable>
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
            <el-col :span="10">
              <el-form-item label="重复信访:">
                <el-select v-model="formData.isRepeat" placeholder="是否重复信访" clearable>
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
  
          <el-row>
            <el-col>
              <el-form-item label="主题:">
                <el-input type="textarea" v-model="formData.subject" :autosize="{ minRows: 4 }" placeholder="请输入主题" clearable/>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col>
              <el-form-item label="具体内容:">
                <el-input type="textarea" v-model="formData.content" :autosize="{ minRows: 4 }" placeholder="请输入具体内容" clearable/>
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
                >
                  <el-button type="primary" :icon=Paperclip>上传附件</el-button>
                  <template #tip>
                    <div>
                      支持上传 doc、docx、pdf、xls、xlsx、jpg、jpeg、png、txt 格式文件，单个文件不超过20MB
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col>
              <el-form-item label="拟办意见:">
                <el-input type="textarea" v-model="formData.proposedOpinion" :autosize="{ minRows: 4 }" placeholder="请输入拟办意见" clearable/>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col :span="12">
              <el-form-item label="督查办主任意见:" label-width="150px!important">
                <el-select v-model="formData.directorOpinion" placeholder="请选择意见" clearable>
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_OPINION)"
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
              <el-form-item label="牵头单位:">
                <el-select v-model="formData.acceptanceUnit" placeholder="请选择牵头单位" clearable>
                  <el-option
                    v-for="dept in deptList"
                    :key="dept.id"
                    :label="dept.name"
                    :value="dept.name"
                    :data-id="dept.id"
                  />
                  <!-- 可以根据实际需要添加更多选项 -->
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="要求完成时间:" label-width="150px!important">
                <el-date-picker v-model="formData.requiredCompletionTime" type="date" placeholder="选择日期" value-format="YYYY-MM-DD HH:mm:ss"/>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col :span="10">
              <el-form-item label="协办单位:">
                <el-select v-model="cooperationUnit" placeholder="请选择协办单位" clearable>
                  <el-option
                    v-for="dept in filteredCollaborateDepts"
                    :key="dept.id"
                    :label="dept.name"
                    :value="dept.name"
                    :data-id="dept.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10" style="margin-left: 20px;margin-right: 20px;">
              <el-input v-model="inputCollaborateUnit" placeholder="输入单位名称" clearable @change="searchCollaborateDepts"/>
            </el-col>
            <el-button type="primary" size="small" @click="addCooperationUnit(cooperationUnit)">添加</el-button>
          </el-row>
  
          <el-row>
            <el-col>
              <el-form-item label=" ">
                <el-input v-model="cooperationUnits" type="textarea" :autosize="{ minRows: 4 }" placeholder="已添加部门"/>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col :span="10">
              <el-form-item label="督办人:">
                <el-select v-model="formData.supervisor" placeholder="请选择督办人" @change="handleSupervisorChange" clearable>
                  <el-option
                    v-for="user in filteredSupervisorateUsers"
                    :key="user.id"
                    :label="user.nickname"
                    :value="user.id"
                    :data-id="user.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10" style="margin-left: 20px;margin-right: 20px;">
              <el-input v-model="inputSupervisor" placeholder="输入姓名" clearable @change="searchSupervisorateUsers"/>
            </el-col>
          </el-row>
  
          <el-row style="justify-content: space-between;">
            <el-col :span="10">
              <el-form-item label="办公电话:">
                <el-input v-model="formData.officePhone" placeholder="(自动生成)" clearable/>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="分管领导:">
                <el-input v-model="formData.responsibleLeader" placeholder="(自动生成)" clearable/>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col :span="10">
              <el-form-item label="会签人:">
                <el-select v-model="formData.countersigner" placeholder="请选择会签人" clearable>
                  <el-option
                    v-for="user in filteredCountersignerUsers"
                    :key="user.id"
                    :label="user.nickname"
                    :value="user.nickname"
                    :data-id="user.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10" style="margin-left: 20px;margin-right: 20px;">
              <el-input v-model="inputCountersigner" placeholder="输入姓名" clearable @change="searchCountersignerUsers"/>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col :span="10">
              <el-form-item label="阅批人:">
                <el-select v-model="formData.reviewer" placeholder="请选择阅批人" clearable>
                  <el-option
                    v-for="user in filteredReviewerUsers"
                    :key="user.id"
                    :label="user.nickname"
                    :value="user.nickname"
                    :data-id="user.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10" style="margin-left: 20px;margin-right: 20px;">
              <el-input v-model="inputReviewer" placeholder="输入姓名" clearable @change="searchReviewerUsers"/>
            </el-col>
          </el-row>
  
          <div class="unit-processing-section">
            <h3>单位部门办理情况：</h3>
            <el-form-item label="信访处理:">
              <el-input type="textarea" v-model="formData.petitionHandling" :autosize="{ minRows: 4 }" placeholder="请输入信访处理情况" clearable/>
            </el-form-item>
          </div>
  
          <el-row>
            <el-col>
              <el-form-item label=" ">
                <el-upload
                  ref="uploadRef"
                  :http-request="(options) => customUpload(options, 'petitionHandling')"
                  :on-preview="previewFile"
                  :before-remove="beforeRemove"
                  :before-upload="beforeUpload"
                  multiple
                  v-model:file-list="petitionHandlingFileList"
                  accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  :file-list-type="'petitionHandling'"
                >
                  <el-button type="primary" :icon=Paperclip>上传处理报告附件</el-button>
                  <template #tip>
                    <div>
                      支持上传 doc、docx、pdf、xls、xlsx、jpg、jpeg、png、txt 格式文件，单个文件不超过20MB
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col>
              <el-form-item label=" ">
                <el-upload
                  ref="uploadRef"
                  :http-request="(options) => customUpload(options, 'petitionReply')"
                  :on-preview="previewFile"
                  :before-remove="beforeRemove"
                  :before-upload="beforeUpload"
                  multiple
                  v-model:file-list="petitionReplyFileList"
                  accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  :file-list-type="'petitionReply'"
                >
                  <el-button type="primary" :icon=Paperclip>上传答复意见附件</el-button>
                  <template #tip>
                    <div>
                      支持上传 doc、docx、pdf、xls、xlsx、jpg、jpeg、png、txt 格式文件，单个文件不超过20MB
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col :span="12">
              <el-form-item label="办结审核:">
                <el-select v-model="formData.completionReview" placeholder="请选择审核结果" clearable>
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.PETITION_COMPLETION)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
  
          <div class="form-actions">
            <el-button type="primary" @click="saveForm">保存</el-button>
            <el-button type="primary" @click="nextStep">下一步</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive, ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
  import { ElMessage } from 'element-plus'
  import * as DeptApi from '@/api/system/dept'
  import * as UserApi from '@/api/system/user'
  import { OrderApi } from '@/api/supervision'
  import { Paperclip } from '@element-plus/icons-vue'
  import { KKFileView } from '@/components/KKFileView'
  import type { UploadFile, UploadUserFile } from 'element-plus';
  import * as FileApi from '@/api/infra/file'
  import { InfoApi } from '@/api/petition/info'
  import dayjs from 'dayjs'
  // 各文本输入值
  const inputPetitionerUnit = ref('')
  const inputCollaborateUnit = ref('')
  const inputSupervisor = ref('')
  const inputCountersigner = ref('')
  const inputReviewer = ref('')
  // 生成信访编号
  const generatePetitionNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    // 生成4位随机序列号
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    
    // 格式: XF-年月日-序列号，例如 XF-20250808-1234
    const petitionNumber = `XF-${year}${month}${day}-${randomNum}`
    
    return petitionNumber
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
  
  // 表单数据
  const formData = reactive({
    petitionNumber: '', // 信访编号
    petitioner: '', // 信访人
    petitionerType: '', // 信访人身份类别
    petitionerUnit: '', // 信访人单位
    documentTitle: '', // 文件标题
    petitionChannel: '', // 信访渠道
    purposeCategory: '', // 目的分类
    urgencyLevel: '', // 紧急程度
    contentCategory: '', // 内容分类
    isRepeat: '', // 重复信访
    subject: '', // 主题
    content: '', // 具体内容
    proposedOpinion: '', // 拟办意见
    directorOpinion: '', // 督查办主任意见
    acceptanceUnit: '', // 牵头单位
    requiredCompletionTime: '', // 要求完成时间
    cooperationUnits: '', // 已选协办单位列表
    supervisor: '', // 督办人
    officePhone: '', // 办公电话
    responsibleLeader: '', // 分管领导
    counterSigner: '', // 会签人
    reviewer: '', // 阅批人
    petitionHandling: '', // 信访处理
    completionReview: '', // 办结审核
    petitionList: [],// 信访附件列表
    petitionHandlingFileList: [], // 处理报告附件列表
    petitionReplyFileList: [], // 答复意见附件列表
  })
  
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
  
  const loadDeptList = async () => {
    try {
      const result = await DeptApi.getSimpleDeptList()
      deptList.value = result || []
    } catch (error) {
      console.error('加载部门列表失败:', error)
      ElMessage.error('加载部门列表失败')
    }
  }
  
  const loadUserList = async () => {
    try {
      const result = await UserApi.getSimpleUserList()
      userList.value = result || []
    } catch (error) {
      console.error('加载用户列表失败:', error)
      ElMessage.error('加载用户列表失败')
    }
  }
  
  // 使用自定义过滤逻辑确保搜索准确性
  const petitionerDeptSearchKeyword = ref('')
  const collaborateDeptSearchKeyword = ref('')
  const supervisorSearchKeyword = ref('')
  const countersignerSearchKeyword = ref('')
  const reviewerSearchKeyword = ref('')
  
  // 过滤后的信访人部门列表
  const filteredPetitionerDepts = computed(() => {
    if (!petitionerDeptSearchKeyword.value) {
      return deptList.value
    }
    return deptList.value.filter(dept =>
      dept.name.toLowerCase().includes(petitionerDeptSearchKeyword.value.toLowerCase())
    )
  })
  
  // 过滤后的协办部门列表
  const filteredCollaborateDepts = computed(() => {
    // 首先过滤掉已选择的牵头单位
    const filteredList = deptList.value.filter(dept => 
      dept.name !== formData.acceptanceUnit
    )
    
    if (!collaborateDeptSearchKeyword.value) {
      return filteredList
    }
    
    return filteredList.filter(dept =>
      dept.name.toLowerCase().includes(collaborateDeptSearchKeyword.value.toLowerCase())
    )
  })
  
  // 过滤后的督查用户列表
  const filteredSupervisorateUsers = computed(() => {
    if (!supervisorSearchKeyword.value) {
      return userList.value
    }
    return userList.value.filter(user => {
      const name = user.nickname || user.username || ''
      return name.toLowerCase().includes(supervisorSearchKeyword.value.toLowerCase())
    })
  })
  
  // 过滤后的会签用户列表
  const filteredCountersignerUsers = computed(() => {
    if (!countersignerSearchKeyword.value) {
      return userList.value
    }
    return userList.value.filter(user => {
      const name = user.nickname || user.username || ''
      return name.toLowerCase().includes(countersignerSearchKeyword.value.toLowerCase())
    })
  })
  
  // 过滤后的阅知用户列表
  const filteredReviewerUsers = computed(() => {
    if (!reviewerSearchKeyword.value) {
      return userList.value
    }
    return userList.value.filter(user => {
      const name = user.nickname || user.username || ''
      return name.toLowerCase().includes(reviewerSearchKeyword.value.toLowerCase())
    })
  })
  
  // 信访人部门搜索方法
  const searchPetitionerDepts = (query: string) => {
    petitionerDeptSearchKeyword.value = query
  }
  
  // 协办部门搜索方法
  const searchCollaborateDepts = (query: string) => {
    collaborateDeptSearchKeyword.value = query
  }
  
  // 督查用户搜索方法
  const searchSupervisorateUsers = (query: string) => {
    supervisorSearchKeyword.value = query
  }
  
  // 会签用户搜索方法
  const searchCountersignerUsers = (query: string) => {
    countersignerSearchKeyword.value = query
  }
  
  // 阅知用户搜索方法
  const searchReviewerUsers = (query: string) => {
    reviewerSearchKeyword.value = query
  }
  
  // 处理督办人变化
  const handleSupervisorChange = async (userId: number) => {
    const user = userList.value.find(u => u.id === userId)
    
    if (user) {
      formData.supervisor = user.id
  
      // 调用API获取督办人手机号
      try {
        const phoneData = await OrderApi.getSupervisorPhone(user.id)
  
        // 后端直接返回手机号字符串
        if (phoneData && typeof phoneData === 'string' && phoneData.trim() !== '') {
          formData.officePhone = phoneData.trim()
        } else {
          formData.officePhone = ''
          ElMessage.warning('督办人未设置手机号，请手动填写办公电话')
        }
      } catch (error) {
        formData.officePhone = ''
        ElMessage.warning('无法获取督办人手机号，请手动填写办公电话')
      }
    } 
  
    if (user.deptIds) {
      const leaderNames: string[] = []
      for (const deptId of user.deptIds) {
        const dept = await DeptApi.getDept(deptId)
        // 处理分管领导信息
        if (dept.leaderUserId) {
          const leader = userList.value.find(u => u.id === dept.leaderUserId)
          if (leader) {
            // 避免重复添加相同的领导
            if (!leaderNames.includes(leader.nickname)) {
              leaderNames.push(leader.nickname)
            }
          } else {
            // 如果在当前用户列表中没找到，清空分管领导字段
            ElMessage.warning('用户列表中没找到该用户,请手动输入')
          } 
        } else {
        // 如果部门没有设置负责人，清空分管领导字段并提示用户
        ElMessage.warning('所选部门未设置负责人,请手动输入')
      }
     }
     formData.responsibleLeader = leaderNames.join(',')
    }
  }
  
  // 保存表单
  const saveForm = async () => {
  
        // 处理信访附件列表
        formData.petitionList = petitionList.value.map(file => {
          return {
            name: file.name,
            size: file.size,
            url: file.url
          }
        })
        
        // 处理处理报告附件列表
        formData.petitionHandlingFileList = petitionHandlingFileList.value.map(file => {
          return {
            name: file.name,
            size: file.size,
            url: file.url
          }
        })
        
        // 处理答复意见附件列表
        formData.petitionReplyFileList = petitionReplyFileList.value.map(file => {
          return {
            name: file.name,
            size: file.size,
            url: file.url
          }
        })
        // 处理时间格式
        formData.requiredCompletionTime = dayjs(formData.requiredCompletionTime).format('YYYY-MM-DD HH:mm:ss')
        // 将协办单位列表转换为字符串
        formData.cooperationUnits = cooperationUnits.value.join(',')
        // 将表单数据保存
        const res = await InfoApi.createInfo(formData)
        console.log(res)
        ElMessage.success('表单保存成功')
        // 这里可以添加保存表单数据的逻辑
  }
  
  // 从本地缓存加载表单数据
  const loadFormDataFromCache = () => {
    const cachedData = localStorage.getItem('petition_form_data')
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData)
        
        // 恢复基本表单数据
        Object.keys(formData).forEach(key => {
          if (key !== 'petitionList' && key !== 'petitionHandlingFileList' && key !== 'petitionReplyFileList') {
            if (parsedData[key] !== undefined) {
              formData[key] = parsedData[key]
            }
          }
        })
        
        // 恢复附件列表
        if (Array.isArray(parsedData.petitionList)) {
          petitionList.value = parsedData.petitionList
        }
        
        if (Array.isArray(parsedData.petitionHandlingFileList)) {
          petitionHandlingFileList.value = parsedData.petitionHandlingFileList
        }
        
        if (Array.isArray(parsedData.petitionReplyFileList)) {
          petitionReplyFileList.value = parsedData.petitionReplyFileList
        }
        
        ElMessage.info('已从本地缓存恢复表单数据')
      } catch (error) {
        console.error('解析缓存数据失败:', error)
      }
    }
  }
  
  // 清除本地缓存的表单数据
  const clearFormDataCache = () => {
    localStorage.removeItem('petition_form_data')
  }
  
  // 下一步
  const nextStep = () => {
    documentFormRef.value.validate((valid) => {
      if (valid) {
        ElMessage.success('进入下一步')
        // 这里可以添加跳转到下一步的逻辑
      } else {
        ElMessage.error('表单验证失败，请检查必填项')
        return false
      }
    })
  }
  const cooperationUnit = ref('')
  const cooperationUnits = ref<string[]>([])
  // 添加协办单位
  const addCooperationUnit = (unit: string) => {
    if (unit && !cooperationUnits.value.includes(unit)) {
      cooperationUnits.value.push(unit)
    }
  }
  
  onMounted(async () => {
    await loadDeptList()
    await loadUserList()
    formData.petitionNumber = generatePetitionNumber()
    loadFormDataFromCache()
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
  