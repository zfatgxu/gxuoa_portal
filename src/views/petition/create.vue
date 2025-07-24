<template>
  <div class="petition-create">
    <ContentWrap title="提交信访">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        v-loading="loading"
      >
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="信访标题" prop="title">
                <el-input v-model="formData.title" placeholder="请输入信访标题" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="信访类型" prop="petitionType">
                <el-select v-model="formData.petitionType" placeholder="请选择信访类型" class="w-full">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.PETITION_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="来源类型" prop="sourceType">
                <el-select v-model="formData.sourceType" placeholder="请选择来源类型" class="w-full">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.PETITION_SOURCE_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="紧急程度" prop="urgencyLevel">
                <el-select v-model="formData.urgencyLevel" placeholder="请选择紧急程度" class="w-full">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.PETITION_URGENCY_LEVEL)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="信访内容" prop="content">
                <el-input
                  v-model="formData.content"
                  type="textarea"
                  placeholder="请输入信访内容"
                  :rows="6"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="附件">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :file-list="fileList"
                  :on-change="handleFileChange"
                  :on-remove="handleFileRemove"
                  multiple
                >
                  <el-button type="primary">选择文件</el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                      可上传任意类型文件，单个文件不超过10MB
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
        
        <el-card class="box-card mt-20px">
          <template #header>
            <div class="card-header">
              <span>信访人信息</span>
              <el-switch
                v-model="formData.isAnonymous"
                active-text="匿名信访"
                inactive-text="实名信访"
                @change="handleAnonymousChange"
              />
            </div>
          </template>
          
          <el-row :gutter="20" v-if="!formData.isAnonymous">
            <el-col :span="12">
              <el-form-item label="信访人姓名" prop="visitorName">
                <el-input v-model="formData.visitorName" placeholder="请输入信访人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="visitorPhone">
                <el-input v-model="formData.visitorPhone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" v-if="!formData.isAnonymous">
            <el-col :span="12">
              <el-form-item label="电子邮箱" prop="visitorEmail">
                <el-input v-model="formData.visitorEmail" placeholder="请输入电子邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证号" prop="visitorIdentity">
                <el-input v-model="formData.visitorIdentity" placeholder="请输入身份证号" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" v-if="!formData.isAnonymous">
            <el-col :span="24">
              <el-form-item label="联系地址" prop="visitorAddress">
                <el-input v-model="formData.visitorAddress" placeholder="请输入联系地址" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="是否全国性" prop="isNational">
                <el-radio-group v-model="formData.isNational">
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否涉法涉诉" prop="isIllegal">
                <el-radio-group v-model="formData.isIllegal">
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否公开" prop="isPublic">
                <el-radio-group v-model="formData.isPublic">
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
        
        <el-card class="box-card mt-20px">
          <template #header>
            <div class="card-header">
              <span>列席人员</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="列席人员" prop="attendees">
                <el-input
                  v-model="formData.attendees"
                  type="textarea"
                  placeholder="请输入列席人员，以、分隔"
                  :rows="3"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="预览效果">
                <div class="attendees-preview">
                  <span v-for="(attendee, index) in attendeesList" :key="index" class="attendee-tag">
                    {{ attendee }}
                  </span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
        
        <el-card class="box-card mt-20px">
          <template #header>
            <div class="card-header">
              <span>备注信息</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  placeholder="请输入备注信息"
                  :rows="3"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
        
        <div class="form-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </div>
      </el-form>
    </ContentWrap>
  </div>
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import * as PetitionApi from '@/api/petition'
import { onMounted, ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from '@/hooks/web/useMessage'
import type { FormInstance, UploadUserFile } from 'element-plus'

defineOptions({ name: 'PetitionCreate' })

const message = useMessage() // 消息弹窗
const router = useRouter() // 路由

const loading = ref(false) // 表单的加载中
const formRef = ref<FormInstance>() // 表单实例
const fileList = ref<UploadUserFile[]>([]) // 文件列表

// 表单数据
const formData = reactive<Partial<PetitionApi.PetitionVO>>({
  title: '',
  content: '',
  visitorName: '',
  visitorPhone: '',
  visitorEmail: '',
  visitorAddress: '',
  visitorIdentity: '',
  sourceType: 1,
  petitionType: 1,
  urgencyLevel: 3,
  isPublic: true,
  isAnonymous: false,
  isNational: false,
  isIllegal: false,
  attendees: '张三、李四、王五、赵六、钱七、孙八、周九、吴十',
  remark: ''
})

// 列席人员列表
const attendeesList = computed(() => {
  if (!formData.attendees) return []
  return formData.attendees.split('、').filter(item => item.trim() !== '')
})

// 表单校验规则
const formRules = reactive({
  title: [{ required: true, message: '请输入信访标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入信访内容', trigger: 'blur' }],
  petitionType: [{ required: true, message: '请选择信访类型', trigger: 'change' }],
  sourceType: [{ required: true, message: '请选择来源类型', trigger: 'change' }],
  urgencyLevel: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  visitorName: [{ required: true, message: '请输入信访人姓名', trigger: 'blur' }],
  visitorPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  visitorEmail: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  visitorIdentity: [
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号码', trigger: 'blur' }
  ]
})

/** 处理匿名状态变更 */
const handleAnonymousChange = (val: boolean) => {
  if (val) {
    formData.visitorName = '匿名'
    formData.visitorPhone = ''
    formData.visitorEmail = ''
    formData.visitorAddress = ''
    formData.visitorIdentity = ''
  } else {
    formData.visitorName = ''
  }
}

/** 处理文件变更 */
const handleFileChange = (file: UploadUserFile) => {
  fileList.value.push(file)
}

/** 处理文件移除 */
const handleFileRemove = (file: UploadUserFile) => {
  const index = fileList.value.indexOf(file)
  if (index !== -1) {
    fileList.value.splice(index, 1)
  }
}

/** 取消 */
const cancel = () => {
  router.back()
}

/** 提交表单 */
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    // 模拟API调用
    // await PetitionApi.createPetition(formData as PetitionApi.PetitionVO)
    
    message.success('提交成功')
    router.push({ path: '/petition' })
  } catch (error) {
    console.error('提交失败', error)
    message.error('提交失败，请检查表单内容')
  } finally {
    loading.value = false
  }
}

/** 初始化 */
onMounted(() => {
  // 可以在这里加载一些初始化数据
})
</script>

<style lang="scss" scoped>
.petition-create {
  padding: 10px;
  
  .box-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .mt-20px {
    margin-top: 20px;
  }
  
  .form-footer {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    gap: 20px;
  }
  
  .attendees-preview {
    border: 1px dashed #ccc;
    padding: 10px;
    min-height: 60px;
    border-radius: 4px;
    background-color: #f9f9f9;
    
    .attendee-tag {
      display: inline-block;
      padding: 5px 10px;
      background-color: #ecf5ff;
      border: 1px solid #d9ecff;
      border-radius: 4px;
      margin-right: 10px;
      margin-bottom: 10px;
      color: #409eff;
    }
  }
}
</style>
