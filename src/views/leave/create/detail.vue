<template>
  <div class="leave-request-form">
    <el-card class="form-card">
      <template #header>
        <div class="form-header">
          <h2>广西大学请示请假报告登记表</h2>
        </div>
      </template>

      <!-- 人员信息 -->
      <div class="form-section">
        <div class="divider">
          <span class="divider-text">人员</span>
        </div>
        <el-table :data="[personnel]" border style="width: 100%">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="department" label="部门" />
          <el-table-column prop="title" label="职称" />
          <el-table-column prop="position" label="职务" />
        </el-table>
      </div>

      <!-- 行程信息 -->
      <div class="form-section">
        <div class="divider">
          <span class="divider-text">行程</span>
        </div>
        <el-descriptions 
          border
          :column="1"
          class="approval-descriptions"
        >
          <!-- 起止日期 -->
          <el-descriptions-item label="起止日期(必填)" label-class-name="approval-label">
            <div class="date-range-picker">
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabled="isReadOnly"
              />
            </div>
          </el-descriptions-item>
          <!-- 事由 -->
          <el-descriptions-item label="请示请假事由(必填)" label-class-name="approval-label">
            <div class="reason-options">
              <div 
                v-for="reason in getIntDictOptions(DICT_TYPE.LEAVE_TYPE)" 
                :key="reason.value" 
              >
                <el-checkbox-group v-model="selectedReasons" :disabled="isReadOnly">
                  <el-checkbox 
                    :label="reason.value"
                  >
                    {{ reason.label }}
                  </el-checkbox>
                </el-checkbox-group>
                <!-- 调研展开内容 -->
                <div v-if="reason.value === 1 && selectedReasons.includes(1)" style="padding: 15px 10px;">
                  <div class="detail-item">
                    <span class="detail-label">调研主题</span>
                    <el-input v-model="researchTopic" :disabled="isReadOnly" placeholder="请输入调研主题"/>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">调研目的</span>
                    <el-input v-model="researchPurpose" :disabled="isReadOnly" placeholder="请输入调研目的"/>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">调研单位</span>
                    <el-input v-model="researchUnit" :disabled="isReadOnly" placeholder="请输入调研单位"/>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">开始时间</span>
                    <el-date-picker
                      v-model="researchStartDate"
                      type="datetime"
                      placeholder="开始时间"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%;"
                      :disabled="isReadOnly"
                    />
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">结束时间</span>
                    <el-date-picker
                      v-model="researchEndDate"
                      type="datetime"
                      placeholder="结束时间"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%;"
                      :disabled="isReadOnly"
                    />
                  </div>
                </div>
                <!-- 培训事由 -->
                <div v-if="reason.value === 2 && selectedReasons.includes(2)" style="padding: 15px 10px;">
                  <div class="detail-item">
                    <span class="detail-label">培训主题</span>
                    <el-input v-model="trainingTopic" :disabled="isReadOnly" placeholder="请输入培训主题"/>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">举办单位</span>
                    <el-input v-model="trainingUnit" :disabled="isReadOnly" placeholder="请输入举办单位"/>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">开始时间</span>
                    <el-date-picker
                      v-model="trainingStartDate"
                      type="datetime"
                      placeholder="开始时间"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%;"
                      :disabled="isReadOnly"
                    />
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">结束时间</span>
                    <el-date-picker
                      v-model="trainingEndDate"
                      type="datetime"
                      placeholder="结束时间"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%;"
                      :disabled="isReadOnly"
                    />
                  </div>
                </div>
                <!-- 公务事由 -->
                <div v-if="reason.value === 3 && selectedReasons.includes(3)" style="padding: 15px 10px;">
                  <div class="detail-item">
                    <span class="detail-label">会议名称</span>
                    <el-input v-model="businessTopic" :disabled="isReadOnly" placeholder="请输入会议名称"/>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">举办单位</span>
                    <el-input v-model="businessUnit" :disabled="isReadOnly" placeholder="请输入举办单位"/>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">开始时间</span>
                    <el-date-picker
                      v-model="businessStartDate"
                      type="datetime"
                      placeholder="开始时间"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%;"
                      :disabled="isReadOnly"
                    />
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">结束时间</span>
                    <el-date-picker
                      v-model="businessEndDate"
                      type="datetime"
                      placeholder="结束时间"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%;"
                      :disabled="isReadOnly"
                    />
                  </div>
                </div>
                <!-- 学术会议事由 -->
                <div v-if="reason.value === 5 && selectedReasons.includes(5)" style="padding: 15px 10px;">
                  <div v-for="(meeting, index) in academicMeetings" :key="index">
                    <div class="add-meeting">
                      <el-button v-if="index > 0" circle type="danger" @click="removeAcademicMeeting(index)">
                        <el-icon><Minus /></el-icon>
                      </el-button>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">会议名称</span>
                      <el-input v-model="meeting.academicTopic" :disabled="isReadOnly" placeholder="请输入会议名称"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">会议性质</span>
                      <el-radio-group v-model="meeting.academicNature" :disabled="isReadOnly">
                        <el-radio 
                          v-for="dict in getIntDictOptions(DICT_TYPE.ACADEMIC_NATURE)"
                          :key="dict.value" 
                          :label="dict.value"
                        >
                          {{ dict.label }}
                        </el-radio>
                      </el-radio-group>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">主办方</span>
                      <el-input v-model="meeting.academicUnit" :disabled="isReadOnly" placeholder="请输入主办方"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">开始时间</span>
                      <el-date-picker
                        v-model="meeting.academicStartDate"
                        type="datetime"
                        placeholder="开始时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled="isReadOnly"
                      />
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">结束时间</span>
                      <el-date-picker
                        v-model="meeting.academicEndDate"
                        type="datetime"
                        placeholder="结束时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled="isReadOnly"
                      />
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">受邀作报告</span>
                      <el-radio-group v-model="meeting.isPresentation" :disabled="isReadOnly">
                        <el-radio 
                          v-for="dict in getIntDictOptions(DICT_TYPE.IS_PRESENTATION)"
                          :key="dict.value" 
                          :label="dict.value"
                        >
                          {{ dict.label }}
                        </el-radio>
                      </el-radio-group>
                    </div>
                    <div v-if="meeting.isPresentation === 2" class="detail-item">
                      <span class="detail-label">报告类型</span>
                      <el-radio-group v-model="meeting.reportType" :disabled="isReadOnly">
                        <el-radio 
                          v-for="dict in getIntDictOptions(DICT_TYPE.REPORT_TYPE)"
                          :key="dict.value" 
                          :label="dict.value"
                        >
                          {{ dict.label }}
                        </el-radio>
                      </el-radio-group>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">报告题目</span>
                      <el-input v-model="meeting.reportTitle" :disabled="isReadOnly" placeholder="请输入报告题目"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">交流论文数</span>
                      <el-input v-model="meeting.academicPaperCount" :disabled="isReadOnly" placeholder="请输入交流论文数"/>
                    </div>
                  </div>
                  <div class="add-meeting">
                    <el-button type="primary" circle :disabled="isReadOnly" @click="addAcademicMeeting">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </div>
                </div>
                <!-- 因私事由 -->
                <div v-if="reason.value === 4 && selectedReasons.includes(4)" style="padding: 15px 10px;">
                  <div class="detail-item">
                    <span class="detail-label">请假类型</span>
                    <el-select v-model="personalType" :disabled="isReadOnly" placeholder="请选择请假类型" clearable>
                      <el-option 
                        v-for="dict in getIntDictOptions(DICT_TYPE.PERSONAL_TYPE)"
                        :key="dict.value" 
                        :label="dict.label" 
                        :value="dict.value"
                      />
                    </el-select>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">开始时间</span>
                    <el-date-picker
                      v-model="personalStartDate"
                      type="datetime"
                      placeholder="开始时间"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%;"
                      :disabled="isReadOnly"
                    />
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">结束时间</span>
                    <el-date-picker
                      v-model="personalEndDate"
                      type="datetime"
                      placeholder="结束时间"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%;"
                      :disabled="isReadOnly"
                    />
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">总计天数</span>
                    <el-input v-model="personalTotalDays" :disabled="isReadOnly" placeholder="请输入总计天数"/>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">请假详情</span>
                    <el-input v-model="personalReason" type="textarea" :rows="3" placeholder="请输入请假详情"/>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">联系电话</span>
                    <el-input v-model="personalPhone" :disabled="isReadOnly" placeholder="请输入联系电话"/>
                  </div>
                  <div v-if="personalType === 6">
                    <div class="detail-item">
                      <span class="detail-label">探亲路线</span>
                      <el-input v-model="personalRoute" :disabled="isReadOnly" placeholder="请输入探亲路线"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">与探望人关系</span>
                      <el-input v-model="personalRelation" :disabled="isReadOnly" placeholder="请输入与探望人关系"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">被探望人姓名</span>
                      <el-input v-model="personalVisitName" :disabled="isReadOnly" placeholder="请输入被探望人姓名"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">探亲类别</span>
                      <el-select v-model="personalVisitType" :disabled="isReadOnly" placeholder="请选择探亲类别" clearable>
                        <el-option 
                          v-for="dict in getIntDictOptions(DICT_TYPE.PERSONAL_VISIT_TYPE)"
                          :key="dict.value" 
                          :label="dict.label" 
                          :value="dict.value"
                        />
                      </el-select>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">户口所在地或地址</span>
                      <el-input v-model="personalVisitAddress" :disabled="isReadOnly" placeholder="请输入户口所在地或地址"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">婚姻状况</span>
                      <el-select v-model="personalMaritalStatus" :disabled="isReadOnly" placeholder="请选择婚姻状况" clearable>
                        <el-option 
                          v-for="dict in getIntDictOptions(DICT_TYPE.MARITAL_STATUS)"
                          :key="dict.value" 
                          :label="dict.label" 
                          :value="dict.value"
                        />
                      </el-select>
                    </div>
                  </div>
                  <div v-if="personalType === 11">
                    <div class="detail-item">
                      <span class="detail-label">生育次数</span>
                      <el-select v-model="personalParity" placeholder="请选择生育次数" clearable>
                        <el-option 
                          v-for="dict in getIntDictOptions(DICT_TYPE.PARITY)"
                          :key="dict.value" 
                          :label="dict.label" 
                          :value="dict.value"
                          :disabled="isReadOnly"
                        />
                      </el-select>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">是否多胞胎</span>
                      <el-select v-model="personalMultiple" placeholder="请选择是否多胞胎" clearable>
                        <el-option 
                          v-for="dict in getIntDictOptions(DICT_TYPE.IS_PRESENTATION)"
                          :key="dict.value" 
                          :label="dict.label" 
                          :value="dict.value"
                          :disabled="isReadOnly"
                        />
                      </el-select>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">是否难产</span>
                      <el-select v-model="personalDystocia" :disabled="isReadOnly" placeholder="请选择是否难产" clearable>
                        <el-option 
                          v-for="dict in getIntDictOptions(DICT_TYPE.IS_PRESENTATION)"
                          :key="dict.value" 
                          :label="dict.label" 
                          :value="dict.value"
                        />
                      </el-select>
                    </div>
                  </div>
                </div>
                <!-- 其他 -->
                <div v-if="reason.value === 6 && selectedReasons.includes(6)" style="padding: 15px 10px;">
                  <el-input
                    v-model="otherReason"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入其他"
                    :disabled="isReadOnly"
                  />
                </div>
              </div>
              <el-checkbox v-model="hasAttachment" :disabled="isReadOnly">
                附件
              </el-checkbox>
              <div v-if="hasAttachment" style="padding: 15px 10px;">
                <el-upload
                  ref="uploadRef"
                  :http-request="customUpload"
                  :on-preview="handlePreview"
                  :before-remove="beforeRemove"
                  multiple
                  v-model:file-list="fileList"
                  accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  :disabled="isReadOnly"
                >
                  <el-button type="primary" :disabled="isReadOnly">点击上传</el-button>
                  <template #tip>
                    <div class="el-upload__tip">支持jpg/png/pdf/doc/docx/xls/xlsx格式，单个文件不超过10MB</div>
                  </template>
                </el-upload>
              </div>
            </div>
          </el-descriptions-item>

          <!-- 前往地点 -->
          <el-descriptions-item label="前往地点(必填)" label-class-name="approval-label">
            <div class="detail-item">
              <!-- <span class="detail-label">国内</span> -->
              <el-cascader :options="pcaTextArr" v-model="destination" style="width: 100%" :disabled="isReadOnly"/>
            </div>
            <!-- <div class="detail-item">
              <span class="detail-label">国外</span>
              <el-input v-model="personalPhone" placeholder="请输入国外地址"/>
            </div> -->
          </el-descriptions-item>

          <!-- 请假期间主持工作负责人安排 -->
          <el-descriptions-item label="请假期间主持工作负责人安排(必填)" label-class-name="approval-label">
            <el-input
              v-model="workArrangement"
              type="textarea"
              :rows="4"
              placeholder="请输入请假期间工作安排"
              :disabled="isReadOnly"
            />
          </el-descriptions-item>

          <!-- 备注 -->
          <el-descriptions-item label="备注(说明)" label-class-name="approval-label">
            <el-input
              v-model="remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
              :disabled="isReadOnly"
            />
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <!-- 审批意见 -->
      <div class="approval-section">
        <div class="divider">
          <span class="divider-text">审批意见</span>
        </div>
        <el-descriptions 
          border
          :column="1"
          class="approval-descriptions"
        >
          <el-descriptions-item label="校领导意见" label-class-name="approval-label">
            <div>{{ leaderApproval }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="请假期间主持工作负责人会签" label-class-name="approval-label">
            <div>{{ hostApproval }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { Minus, Plus } from '@element-plus/icons-vue'
import { pcaTextArr } from "element-china-area-data";
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadFile, UploadUserFile } from 'element-plus';
import { getUserProfile } from '@/api/system/user/profile'
import { UserVO } from '@/api/system/user'
import { RegisterApi, RegisterFileApi, ReasonFormApi } from '@/api/leave/create/createForm' 
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import * as FileApi from '@/api/infra/file'
import * as DefinitionApi from '@/api/bpm/definition'
import * as UserApi from '@/api/system/user'
import { propTypes } from '@/utils/propTypes'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
const props = defineProps({
  id: propTypes.number.def(undefined)
})
const { query } = useRoute() // 查询参数
const queryId = query.id as unknown as number // 从 URL 传递过来的 id 编号
// 控制表单是否为只读状态
const isReadOnly = ref(false);
// 人员信息
const personnel = ref({
  id: '',
  deptId: '',
  name: '',
  department: '',
  title: '',
  position: ''
});
// 日期范围
const dateRange = ref([]);
// 调研事由信息
const researchID = ref();
const researchTopic = ref('');
const researchPurpose = ref('');
const researchUnit = ref('');
const researchStartDate = ref('');
const researchEndDate = ref('');
// 培训事由信息
const trainingID = ref();
const trainingTopic = ref('');
const trainingUnit = ref('');
const trainingStartDate = ref('');
const trainingEndDate = ref('');
// 公务事由信息
const businessID = ref();
const businessTopic = ref('');
const businessUnit = ref('');
const businessStartDate = ref('');
const businessEndDate = ref('');
// 学术会议事由信息
const academicID = ref();
const academicMeetings = ref([{
  academicTopic: '',
  academicNature: '',
  academicUnit: '',
  academicStartDate: '',
  academicEndDate: '',
  isPresentation: '',
  reportType: '',
  reportTitle: '',
  academicPaperCount: 0
}]);
const addAcademicMeeting = () => {
  academicMeetings.value.push({
    academicTopic: '',
    academicNature: '',
    academicUnit: '',
    academicStartDate: '',
    academicEndDate: '',
    isPresentation: '',
    reportType: '',
    reportTitle: '',
    academicPaperCount: 0
  });
};
const removeAcademicMeeting = (index) => {
  if (academicMeetings.value.length > 1) {
    academicMeetings.value.splice(index, 1);
  } else {
    // 如果是最后一个，清空数据而不是删除
    Object.keys(academicMeetings.value[0]).forEach(key => {
      academicMeetings.value[0][key] = '';
    });
  }
};
// 因私事由信息
const personalID = ref();
const personalType = ref<number>();
const personalStartDate = ref('');
const personalEndDate = ref('');
const personalTotalDays = ref<number>(0);
const personalReason = ref('');
const personalPhone = ref('');
const personalRoute = ref('');
const personalRelation = ref('');
const personalVisitName = ref('');
const personalVisitType = ref<number>();
const personalVisitAddress = ref('');
const personalMaritalStatus = ref<number>();
const personalParity = ref<number>();
const personalMultiple = ref<number>();
const personalDystocia = ref<number>();
// 其他事由
const otherID = ref();
const otherReason = ref('');
// 监听日期范围变化
watch(dateRange, (newVal) => {
  if (newVal && newVal.length === 2) {
    researchStartDate.value = newVal[0];
    researchEndDate.value = newVal[1];
    trainingStartDate.value = newVal[0];
    trainingEndDate.value = newVal[1];
    businessStartDate.value = newVal[0];
    businessEndDate.value = newVal[1];
    academicMeetings.value.forEach(meeting => {
      meeting.academicStartDate = newVal[0];
      meeting.academicEndDate = newVal[1];
    });
    personalStartDate.value = newVal[0];
    personalEndDate.value = newVal[1];
    personalTotalDays.value = Math.ceil((new Date(newVal[1]).getTime() - new Date(newVal[0]).getTime()) / (1000 * 60 * 60 * 24))+1;
  }
}, { deep: true });

const selectedReasons = ref<number[]>([]);
// 附件
const hasAttachment = ref(false);
const fileList = ref<UploadUserFile[]>([]);
const uploadedFileIds = ref<string[]>([]);
const uploadRef = ref()
const customUpload = async (options) => {
  const { file, onSuccess, onError } = options
  try {
    // 创建 FormData
    const formData = new FormData()
    formData.append('file', file)
    const result = await FileApi.updateFile(formData)
    file.url = result.data
    const index = fileList.value.findIndex(item => item.uid === file.uid);
    fileList.value[index].url = file.url;
    // 由于 upload 方法返回的是 Promise<T>，我们需要获取实际的响应数据
    const response = await result

    if (response.code === 0) {
      // 如果上传成功，调用成功回调并传递响应数据
      onSuccess(response)
    } else {
      // 如果上传失败，调用错误回调
      const error = new Error(response.msg || '文件上传失败')
      // 从文件列表中移除失败的文件
      if (index !== -1) {
        fileList.value.splice(index, 1)
      }
      onError(error)
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    // 从文件列表中移除失败的文件
    const index = fileList.value.findIndex(item => item.uid === file.uid)
    if (index !== -1) {
      fileList.value.splice(index, 1)
    }
    onError(error)
  }
}
const handlePreview = (file) => {
  // 首先检查 file 对象中是否有 url
  if (file.url) {
    window.open(file.url, '_blank');
    return;
  }
  
  // 如果没有，则尝试从 fileList 中查找
  const fileInList = fileList.value.find(item => item.uid === file.uid);
  if (fileInList?.url) {
    window.open(fileInList.url, '_blank');
    return;
  }

  // 如果都没有找到 url，则显示错误提示
  ElMessage.warning('无法预览该文件：缺少文件URL');
};
const beforeRemove = (file: UploadFile) => {
  return ElMessageBox.confirm(`确定移除 ${file.name}？`).then(
    () => {
      // 从已上传文件ID列表中移除
      const index = uploadedFileIds.value.findIndex(id => id === file.uid);
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
// 表单数据
const destination = ref('');
const workArrangement = ref('');
const remarks = ref('');

// 获取请假人信息
const routeId = ref(props.id || queryId)
const fetchUserProfile = async () => {
  try {
    if(!routeId.value){
      const res = await getUserProfile();
      if (res) {
        personnel.value = {
          id: res.id,
          deptId: res.dept?.id || '',
          name: res.username || '',
          department: res.dept?.name || '',
          title: res.posts?.[0]?.name || '',
          position: res.nickname || '',
        };
      }
    } else  {
      isReadOnly.value = true;
      const res = await RegisterApi.getRegister(Number(routeId.value))
      const res1 = await RegisterFileApi.getRegisterFile(Number(routeId.value))
      const res2 = await ReasonFormApi.getReasonForm(Number(routeId.value))
      if (res1.length > 0){
        hasAttachment.value = true;
        fileList.value = res1.map(file => ({
          ...file,
          name: file.leaveFileName, // 使用后端返回的文件名字段
          status: 'success', // 确保状态为成功
          url: file.leaveFileUrl // 如果有预览地址的话
        }));
      }
      if (res2 && Array.isArray(res2)) {
  res2.forEach(item => {
    // 根据类型设置选中的事由
    if (!selectedReasons.value.includes(item.type)) {
      selectedReasons.value.push(item.type);
    }

    // 根据不同类型设置对应的表单字段
    switch (item.type) {
      case 1: // 调研
        researchID.value = item.id;
        researchTopic.value = item.subject;
        researchPurpose.value = item.purpose;
        researchUnit.value = item.unit;
        researchStartDate.value = dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss');
        researchEndDate.value = dayjs(item.endDate).format('YYYY-MM-DD HH:mm:ss');
        break;
      case 2: // 培训
        trainingID.value = item.id;
        trainingTopic.value = item.subject;
        trainingUnit.value = item.unit;
        trainingStartDate.value = dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss');
        trainingEndDate.value = dayjs(item.endDate).format('YYYY-MM-DD HH:mm:ss');
        break;
      case 3: // 公务
        businessID.value = item.id;
        businessTopic.value = item.subject;
        businessUnit.value = item.unit;
        businessStartDate.value = dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss');
        businessEndDate.value = dayjs(item.endDate).format('YYYY-MM-DD HH:mm:ss');
        break;
      case 4: // 因私
        personalID.value = item.id;
        personalType.value = Number(item.privateType);
        personalStartDate.value = dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss');
        personalEndDate.value = dayjs(item.endDate).format('YYYY-MM-DD HH:mm:ss');
        personalTotalDays.value = item.totalDays;
        personalPhone.value = item.phone;
        personalParity.value = item.birthCount?.toString();
        personalDystocia.value = item.difficultBirth;
        personalMultiple.value = item.multipleBirth;
        personalVisitAddress.value = item.registeredAddress;
        personalRelation.value = item.relationship;
        personalRoute.value = item.visitRoute;
        personalVisitName.value = item.visitedPersonName;
        personalVisitType.value = item.visitType;
        personalReason.value = item.reason;
        break;
      case 5: // 学术会议
        academicID.value = item.id;
        // 清空现有会议
        academicMeetings.value = [];
        // 添加新的会议数据
        academicMeetings.value.push({
          academicTopic: item.subject,
          academicNature: item.meetingNature,
          academicUnit: item.unit,
          academicStartDate: dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss'),
          academicEndDate: dayjs(item.endDate).format('YYYY-MM-DD HH:mm:ss'),
          isPresentation: item.isPresentation,
          reportTitle: item.reportTitle,
          reportType: item.reportType,
          academicPaperCount: item.academicPaperCount
        });
        break;
      case 6: // 其他
        otherID.value = item.id;
        otherReason.value = item.detail;
        break;
          }
        });
      }
      if(res){
        dateRange.value = [dayjs(res.startDate).format('YYYY-MM-DD HH:mm:ss'), dayjs(res.endDate).format('YYYY-MM-DD HH:mm:ss')];
        workArrangement.value = res.hostArrangement;
        remarks.value = res.remark;
        destination.value = res.destination.split(',');
        personnel.value = {
          id: res.personId,
          deptId: res.deptId || '',
          name: res.userName || '',
          department: res.deptName || '',
          title: res.postName || '',
          position: res.nickName || '',
        };
        processInstanceId.value = res.processInstanceId;
      }
      if (processInstanceId.value) {
        getApprovalOpinions();
      }
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败');
  }
};
// 审批意见数据
const leaderApproval = ref('');
const hostApproval = ref('');

// 获取审批意见
const processInstanceId = ref('');
const getApprovalOpinions = async () => {
  try {
    
    const param = {
      processInstanceId: processInstanceId.value
    };
    const data = await ProcessInstanceApi.getApprovalDetail(param);
    console.log('审批详情数据:', data);
    
    if (data && data.activityNodes) {
      // 处理审批意见数据
      data.activityNodes.forEach(node => {
        // 根据节点类型或名称判断是校领导意见还是主持人会签
        if (node.id==='leader_sign') {
          leaderApproval.value = node.tasks[0].reason || '';
        } 
        if (node.id==='host_sign') {
          hostApproval.value = node.tasks[0].reason || '';
        }
      });
    }
  } catch (error) {
    console.error('获取审批意见失败:', error);
    ElMessage.error('获取审批意见失败');
  }
};

// 获取用户信息
onMounted(async () => {
  fetchUserProfile();
});

</script>

<style scoped>
.leave-request-form {
  padding: 20px;
}

.form-card {
  max-width: 1000px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  font-size: 16px;
}

.form-row {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.form-label {
  width: 200px;
  padding: 8px 12px 8px 0;
  text-align: right;
  font-size: 14px;
}

.form-label.required::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}

.reason-options .el-checkbox {
  display: block;
  width: 100%;            
}

.reason-options .el-checkbox__label {
  white-space: nowrap;
}

.approval-section {
  margin-top: 30px;
}

.divider {
  position: relative;
  border-top: 1px dashed #dcdfe6;
}

.divider-text {
  position: relative;
  top: -12px;
  margin-left: 20px;
  background-color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.form-actions {
  display: flex;
  margin-top: 30px;
  padding: 15px 0;
  border-top: 1px solid #ebeef5;
  justify-content: flex-end; 
}

.action-item {
  display: flex;
  align-items: center;
  margin-right: 20px;
  gap: 10px;
}

.action-select {
  width: 180px;
}

.reason-options .el-checkbox:hover {
  background-color: #f0f7ff;
  display: flex;
  align-items: center;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.detail-label {
  margin-right: 10px;
  width: 15%;
}

.add-meeting {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 10px;
}

.add-meeting .el-button {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 16px;
}

:deep(.reason-options .el-checkbox:not(.is-checked):hover .el-checkbox__inner) {
  border-color: #409EFF !important;
}

:deep(.reason-options .el-checkbox:not(.is-checked):hover .el-checkbox__label) {
  color: #409EFF !important;
}

:deep(.el-textarea__inner) {
  background-color: #fffbe6;
}

:deep(.el-date-editor) {
  width: 380px;
}

:deep(.el-table__cell) {
  background-color: #ffffff!important;
}

:deep(.el-descriptions__label) {
  width: 30%;
  background-color: #ffffff!important;
}

:deep(.el-descriptions__content) {
  width: 70%;
}
</style>
