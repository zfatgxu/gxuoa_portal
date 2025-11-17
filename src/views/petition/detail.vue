<template>
  <ContentWrap>
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
              <el-input v-model="formData.name" placeholder="请输入信访人" clearable :readonly="!isEditing"/>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="是否校内人员:" label-width="150px!important">
              <el-select v-model="formData.inSchool" placeholder="是否校内人员" clearable :disabled="!isEditing">
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

        <el-row v-if="formData.inSchool === 1">
          <el-col :span="16">
            <el-form-item label="信访人单位:" label-width="120px">
              <el-select v-model="formData.petitionerUnit" placeholder="请选择单位" clearable :disabled="!isEditing">
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
        </el-row>

        <el-row v-else>
          <el-col :span="16">
            <el-form-item label="信访人单位:" label-width="120px">
              <el-input v-model="formData.petitionerUnit" placeholder="请输入单位名称" clearable :readonly="!isEditing"/>
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
            <el-form-item label="牵头单位:">
              <el-select 
                v-model="formData.leadDeptIds" 
                placeholder="请选择牵头单位" 
                multiple 
                clearable 
                filterable
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
          <el-button 
            :type="isEditing ? 'warning' : 'primary'" 
            @click="toggleEdit"
          >
            {{ isEditing ? '取消编辑' : '编辑' }}
          </el-button>
        </div>
      </el-form>
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
import { InfoApi } from '@/api/petition/info'
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

// 编辑状态
const isEditing = ref(false)

// 表单数据
const formData = reactive({
  petitionNumber: '', // 信访编号
  name: '', // 信访人
  inSchool: '', // 是否在校
  petitionerUnit: '', // 信访人单位
  purposeCategory: '', // 原因分类
  petitionChannel: '', // 信访渠道
  urgencyLevel: '', // 紧急程度
  contentCategory: '', // 内容分类
  isRepeat: '', // 重复信访
  leadDeptIds: [], // 牵头单位ID列表
  assistDeptIds: [], // 协办单位ID列表
  title: '', // 文件标题
  content: '', // 具体内容
  petitionDate: '', // 信访日期
  deadline: '', //截止日期
})

// 切换编辑状态
const toggleEdit = () => {
  isEditing.value = !isEditing.value
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
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  }
}

// 使用自定义过滤逻辑确保搜索准确性
const petitionerDeptSearchKeyword = ref('')

// 过滤后的信访人部门列表
const filteredPetitionerDepts = computed(() => {
  if (!petitionerDeptSearchKeyword.value) {
    return deptList.value
  }
  return deptList.value.filter(dept =>
    dept.name.toLowerCase().includes(petitionerDeptSearchKeyword.value.toLowerCase())
  )
})

const cooperationUnits = ref<string[]>([])
const id = route.query.id

const getDetail = () => {
  PetitionApi.getPetition(id).then(res => {
    console.log(res)
    formData.name = res.name
    formData.inSchool = res.inSchool
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
  })
}

onMounted(async () => {
  await loadDeptList()
  await loadUserList()
  getDetail()
  formData.petitionNumber = generatePetitionNumber()
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