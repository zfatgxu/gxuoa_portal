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

        <el-row style="justify-content: space-between;">
          <el-col :span="8" style="margin-right: 20px;">
            <el-form-item label="信访人:">
              <el-input v-model="formData.name" placeholder="请输入信访人" clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="身份类别:" label-width="150px!important">
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

        <el-row>
          <el-col :span="16">
            <el-form-item label="其他信息:" label-width="120px">
              <el-input v-model="formData.petitionerInfo" placeholder="如信访人电话、地址等信息" clearable/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="16">
            <el-form-item label="信访人单位:" label-width="120px">
              <el-input v-model="formData.petitionerUnit" placeholder="请输入单位名称" clearable/>
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
            <el-form-item label="信访原因:" label-width="100px!important">
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
          <el-col :span="16">
            <el-form-item label="关键词:" label-width="120px">
              <el-input v-model="formData.keywords" placeholder="请填写内容类别细分" clearable/>
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

        <el-row style="justify-content: space-between;">
          <el-col :span="10">
            <el-form-item label="校领导:" label-width="120px">
              <el-select 
                v-model="formData.leaderIds" 
                placeholder="请选择校领导" 
                multiple 
                clearable 
                filterable
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
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="18">
            <el-form-item label="标题:">
              <el-input v-model="formData.title" placeholder="请输入标题" clearable/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="正文:">
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
        <div class="form-actions">
          <el-button type="info" @click="fillFormWithSampleData">一键填写</el-button>
          <el-button type="primary" @click="saveForm">保存</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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

// 表单数据
const formData = reactive({
  petitionNumber: '', // 信访编号
  name: '', // 信访人
  petitionerType: '', // 是否在校
  petitionerInfo: '', // 其他信息
  petitionerUnit: '', // 信访人单位
  petitionChannel: '', // 信访渠道
  purposeCategory: '', // 原因分类
  urgencyLevel: '', // 紧急程度
  contentCategory: '', // 内容分类
  isRepeat: '', // 重复信访
  leadDeptIds: [], // 牵头单位ID列表
  assistDeptIds: [], // 协办单位ID列表
  leaderIds: [], // 校领导ID列表
  petitionDept: [], // 信访办员工ID列表
  title: '', // 文件标题
  content: '', // 具体内容
  petitionDate:'',
  deadline:'', //截止日期
  keywords: '', // 关键词
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

// 一键填写表单
const fillFormWithSampleData = () => {
    // 填充示例数据
    formData.name = '张三'
    formData.petitionerType = 0
    formData.petitionerUnit = '计算机学院'
    formData.petitionChannel = 1
    formData.purposeCategory = 1
    formData.urgencyLevel = 1
    formData.contentCategory = 1
    formData.isRepeat = 0
    formData.title = '关于校园网络问题的信访'
    formData.content = '尊敬的领导：\n\n我是计算机学院的学生张三，近期发现校园网络存在不稳定问题，特别是在晚上高峰期，网速明显下降，影响学习和生活。希望学校能够关注并改善网络质量。\n\n谢谢！'
    formData.petitionDate = dayjs().format('YYYY-MM-DD')
    formData.deadline = dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss')
    formData.keywords = '校园网络, 不稳定, 晚上高峰期'
    formData.petitionerInfo = '其他信息'
    formData.leadDeptIds = [128]
    formData.assistDeptIds = [219, 170]
    formData.leaderIds = [344]
    // 生成新的信访编号
    formData.petitionNumber = generatePetitionNumber()
    ElMessage.success('表单已一键填写完成！')
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
      await InfoApi.createInfo(formData)
      ElMessage.success('表单保存成功')
}

// 获取router实例
const router = useRouter()

// 下一步
const nextStep = () => {
  documentFormRef.value.validate((valid) => {
    if (valid) {
      // 先提交表单数据
      PetitionApi.createPetition(formData);
      console.log(formData)
      
      // 弹出选择对话框
      ElMessageBox.confirm(
        '表单提交成功！请选择下一步操作：',
        '操作成功',
        {
          distinguishCancelAndClose: true,
          confirmButtonText: '跳转回首页',
          cancelButtonText: '清空表单继续填写',
          type: 'success'
        }
      ).then(() => {
        // 用户选择跳转回首页
        router.push('/xfgz/xf')
      }).catch((action) => {
        if (action === 'cancel') {
          // 用户选择清空表单继续填写
          // 清空表单数据
          Object.keys(formData).forEach(key => {
            formData[key] = ''
          })
          // 重新生成信访编号
          formData.petitionNumber = generatePetitionNumber()
          // 清空附件列表
          petitionList.value = []
          petitionHandlingFileList.value = []
          petitionReplyFileList.value = []
          // 清空协办单位
          cooperationUnits.value = []
          
          ElMessage.success('表单已清空，可以继续填写新内容')
        }
      })
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
