<template>
  <div class="application-container">
    <h1 class="form-title">广西大学会议室使用申请表</h1>
    <div class="form-wrapper">
      <el-form :model="formData" :rules="rules" ref="formRef" label-position="left" :status-icon="false" validate-on-rule-change="false" :hide-required-asterisk="true">
        <table class="application-table">
          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">
              会议室<span class="reauired-mark">*</span>
            </td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="conferenceRoom" class="no-margin">
                <template v-if="formData.conferenceRoom">
                  <span class="readonly-text">{{ formData.conferenceRoom }}</span>
                </template>
                <template v-else>
                  <el-input v-model="formData.conferenceRoom" placeholder="请输入会议室名称" />
                </template>
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">申请单位<span class="reauired-mark">*</span></td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="department" class="no-margin" :validate-status="undefined">
                <el-input v-model="formData.department" maxlength="50" placeholder="请输入申请单位(字数限制50)" />
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">申请人<span class="reauired-mark">*</span></td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="applicant" class="no-margin" :validate-status="undefined">
                <el-input v-model="formData.applicant" placeholder="请输入申请人姓名" />
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">手机号码<span class="reauired-mark">*</span></td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="phone" class="no-margin" :validate-status="undefined">
                <el-input v-model="formData.phone" placeholder="请输入手机号码" />
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">活动主题<span class="reauired-mark">*</span></td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="activityTheme" class="no-margin" :validate-status="undefined">
                <el-input v-model="formData.activityTheme" placeholder="请输入活动主题" />
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">横幅</td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="banner" class="no-margin" :validate-status="undefined">
                <el-input v-model="formData.banner" placeholder="请输入横幅内容" />
              </el-form-item>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell" rowspan="2" style="width: 120px; padding: 8px;">活动时间<span class="reauired-mark">*</span></td>
            <td class="sub-label-cell" style="width: 120px; padding: 8px; text-align: center;">布台时间：</td>
            <td class="content-cell" colspan="2">
              <el-form-item prop="setupTime" class="no-margin" :validate-status="undefined">
                <el-date-picker
                  v-model="formData.setupTime"
                  type="datetime"
                  placeholder="选择布台时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td class="sub-label-cell" style="width: 120px; padding: 8px; text-align: center;">使用时间：</td>
            <td class="content-cell" colspan="2">
              <div class="time-range" style="display: flex; align-items: center;">
                <el-form-item prop="startTime" class="no-margin" style="flex: 1;" :validate-status="undefined">
                  <el-date-picker
                    v-model="formData.startTime"
                    type="datetime"
                    placeholder="选择开始时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                    :disabled="!!formData.startTime"
                  />
                </el-form-item>
                <span class="time-separator" style="margin: 0 10px;">至</span>
                <el-form-item prop="endTime" class="no-margin" style="flex: 1;" :validate-status="undefined">
                  <el-date-picker
                    v-model="formData.endTime"
                    type="datetime"
                    placeholder="选择结束时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                    :disabled="!!formData.endTime"
                  />
                </el-form-item>
              </div>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">参加人员介绍</td>
            <td class="content-cell" colspan="3">
              <div style="display: flex; align-items: flex-start;">
                <!-- 文本区域 -->
                <el-form-item class="no-margin" style="flex: 1; margin-right: 10px;">
                  <el-input
                    v-model="formData.participants"
                    type="textarea"
                    :rows="4"
                    style="width: 100%;"
                  />
                </el-form-item>

                <!-- 人数输入区域 -->
                <div style="width: 150px; display: flex; flex-direction: column;">
                  <td class="label-cell" style="width: 150px;">人员数量</td>
                  <el-form-item class="no-margin" style="width: 100%;">
                    <el-input-number
                      v-model="formData.participantsNum"
                      :min="1"
                      :max="formData.capacity"
                      placeholder="参与人数"
                      style="width: 100%;"
                    />
                  </el-form-item>
                </div>
              </div>
            </td>
          </tr>
          </tbody>
          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">预约设备</td>
            <td class="content-cell" colspan="3">
              <div style="display: flex; align-items: flex-start;">
                <!-- 展示框 -->
                <div
                  class="equipment-display"
                  style="flex: 1; min-height: 120px; border: 1px solid #dcdfe6; border-radius: 4px; padding: 8px; display: flex; flex-wrap: wrap; gap: 6px;"
                >
                  <el-tooltip
                    v-for="(item, index) in selectedEquipments"
                    :key="index"
                    :content="item.detail"
                    placement="top"
                    effect="dark"
                  >
                    <el-tag type="success">
                      {{ item.equipmentName }} * {{ item.num }}
                    </el-tag>
                  </el-tooltip>
                </div>

                <!-- 右侧按钮区域 -->
                <div style="display: flex; flex-direction: column; margin-left: 10px; width: 120px;">
                  <el-button
                    round
                    style="
            margin-bottom: 10px;
            height: 40px;
            width: 100%;
            font-weight: bold;
            background-color: #409EFF;
            color: #fff;
            border-color: #409EFF;
            box-sizing: border-box;
          "
                    @click="equipmentVisible = true"
                  >
                    设备菜单
                  </el-button>

                  <!-- 弹窗中嵌入子组件 -->
                  <el-dialog
                    v-model="equipmentVisible"
                    title="设备菜单"
                    width="60%"
                    :close-on-click-modal="false"
                  >
                    <equipment-table
                      @close="equipmentVisible = false"
                      :meeting-room-id="formData.meetingRoomId"
                      @update:selectedEquipments="handleSelectedEquipments"
                      :selected-equipments="selectedEquipments"
                    />
                  </el-dialog>
                </div>
              </div>
            </td>
          </tr>

          </tbody>
          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">使用事由及要求<span class="reauired-mark">*</span></td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="purpose" class="no-margin" :validate-status="undefined">
                <div class="editor-container" style="width: 100%;">
                  <el-input
                    v-model="formData.purpose"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入使用事由及要求"
                  />
                </div>
              </el-form-item>
            </td>
          </tr>
          </tbody>

          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">使用单位意见</td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="adminOpinion" class="no-margin" :validate-status="undefined">
                <el-input
                  v-model="departmentInfo.opinion"
                  type="textarea"
                  :rows="4"
                  placeholder="经审核，该申请符合会议室使用规定，申请材料齐全，使用时间合理，同意该申请。请按时使用会议室，并注意保持会议室整洁。"
                  readonly
                />
              </el-form-item>
              <div class="signature-line">
                <span>负责人签字：</span>
                <el-input v-model="departmentInfo.head" class="!w-150px" placeholder="请输入负责人姓名" />
                <span class="time-right"> 日期：</span>
                <el-date-picker
                  v-model="departmentInfo.approvalDate"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="datetime"
                  placeholder="选择管理员审批时间"
                  class="!w-220px"
                  :clearable="true"
                  :editable="false"
                  :disabled-date="(time) => time > new Date()"
                />
              </div>
            </td>
          </tr>
          </tbody>

          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">管理单位意见</td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="adminOpinion" class="no-margin" :validate-status="undefined">
                <el-input
                  v-model="adminInfo.opinion"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入管理单位意见(申请人不用填写)"
                  readonly
                />
              </el-form-item>
              <div class="signature-line">
                <span>负责人签字：</span>
                <el-input v-model="adminInfo.person" class="!w-150px" placeholder="请输入负责人姓名" readonly/>
                <span class="time-right"> 日期：</span>
                <el-date-picker
                  v-model="adminInfo.approvalDate"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="datetime"
                  placeholder="选择管理员审批时间"
                  class="!w-220px"
                  :clearable="true"
                  :editable="false"
                  :disabled-date="(time) => time > new Date()"
                  readonly                
                  />
              </div>
            </td>
          </tr>
          </tbody>

          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">注意事项</td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="precautions" class="no-margin" :validate-status="undefined">
                <el-input
                  v-model="adminInfo.notes"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入注意事项（申请人不用填写）"
                  readonly                
                  />
              </el-form-item>
            </td>
          </tr>
          </tbody>

          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">备注</td>
            <td class="content-cell" colspan="3">
              <el-form-item prop="remark" class="no-margin" :validate-status="undefined">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入备注内容" />
              </el-form-item>
            </td>
          </tr>
          </tbody>

          <tbody>
          <tr>
            <td class="label-cell" style="width: 120px; padding: 8px;">附件</td>
            <td class="content-cell" colspan="3">
              <el-upload
                class="upload-demo"
                :http-request="customUpload"
                :before-upload="handleBeforeUpload"
                :on-remove="handleRemove"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
                :file-list="fileList"
                :limit="3"
                :on-exceed="handleExceed"
                show-file-list
                :on-start="() => uploading.value = true"
              >
                <el-button type="primary">上传附件</el-button>
              </el-upload>
            </td>
          </tr>
          </tbody>

        </table>

        <div class="form-actions" v-if="!uploading">
          <el-button type="primary" @click="submitForm(id)" :loading="loading">提交</el-button>
          <el-button @click="goBack">返回</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElLoading } from 'element-plus';
import dayjs from 'dayjs';
import { RoomApplyApi } from '@/api/meetingroom/roomapply'
import { RoomApplyFileApi } from '@/api/meetingroom/roomapplyfile'
import * as FileApi from '@/api/infra/file'
import EquipmentTable from '@/views/meetingroom/apply/equipmentTable.vue'
import { RoomEquipmentApi } from '@/api/meetingroom/roomequipment' // 引入子组件

const equipmentVisible = ref(false)


const selectedEquipments = ref()
const router = useRouter();
const route = useRoute();

const uploading = ref(false);
const handleBeforeUpload = (file) => {
  uploading.value = true
  return true // 继续上传
}

const loading = ref(false);
const fileList = ref([]);
const id = route.query.id;

const formRef = ref(null);

const formData = reactive({
  conferenceRoom: '',
  department: '',
  applicant: '',
  phone: '',
  activityTheme: '',
  banner: '',
  setupTime: '',
  startTime: '',
  endTime: '',
  participants: '',
  purpose: '',
  precautions: '',
  remark: '',
  attachments: [],
  signature: '',
  meetingRoomId: '',
  participantsNum:'',
  meetingRoomTimeId:''
});

// 部门负责人信息 - 按照 ApplyFormReview-admin.vue 的样式
const departmentInfo = reactive({
  head: '',
  opinion: '',
  approvalDate: ''
})

// 管理员信息 - 按照 ApplyFormReview-admin.vue 的样式
const adminInfo = reactive({
  person: '',
  opinion: '',
  approvalDate: '',
  notes: ''
})

const rules = {
  department: [{ required
      : true, message: '请输入使用单位', trigger: 'blur' }],
  applicant: [{ required: true, message: '请输入申请人', trigger: 'blur' }],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  activityTheme: [{ required: true, message: '请输入活动主题', trigger: 'blur' }],
  banner: [],
  setupTime: [{ required: true, message: '请选择布台时间', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  signature: [{ required: true, message: '请签字', trigger: 'blur' }],
  purpose: [{ required: true, message: '请输入用途', trigger: 'blur' }]
};

const attachList = ref([])

function handleSelectedEquipments(newEquipments) {
  console.log('父组件收到已选择设备：', newEquipments)
  selectedEquipments.value = newEquipments
}

// 自定义上传函数
const customUpload = async (options) => {
  const { file, onSuccess, onError } = options
  try {
    // 创建 FormData
    const formData = new FormData()
    formData.append('file', file)
    const result = await FileApi.updateFile(formData)
    file.url = result.data
    // 由于 upload 方法返回的是 Promise<T>，我们需要获取实际的响应数据
    const response = await result

    if (response.code === 0) {
      // 如果上传成功，调用成功回调并传递响应数据

    } else {
      // 如果上传失败，调用错误回调
      const error = new Error(response.msg || '文件上传失败')
      // 从文件列表中移除失败的文件
      const index = fileList.value.findIndex(item => item.uid === file.uid)
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


const handleUploadSuccess = (response, file) => {
  console.log(1)
  const fileName = file.name
  console.log("file",file)
  const fileSize = (file.size / 1024).toFixed(2) // 转为 KB 显示
  const fileUrl = file.raw.url
  attachList.value.push({
    name: fileName,
    size: fileSize,
    url: fileUrl
  })
  console.log("attachlist",attachList)
  ElMessage.success('文件上传成功');
  uploading.value = false
  // 上传成功后文件信息自动加入 fileList，无需手动添加
};

const handleRemove = async (file, fileListNow) => {
  // 判断是已上传的文件（来自后端）还是本地新添加的
  if (file.id) {
    try {
      await RoomApplyFileApi.deleteFile(file.id)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }
  // fileList.value 会自动更新，不需手动删
}

const handleUploadError = (error) => {
  ElMessage.error('文件上传失败');
  uploading.value = false
  console.error('上传失败', error);
};

const handleExceed = () => {
  ElMessage.warning('最多只能上传3个文件');
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

const convertDateToTimestamp = (date) => {
  if (!date) return null;
  const d = dayjs(date);
  return d.isValid() ? d.valueOf() : null;
};


const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请完善表单信息');
      return;
    }
    loading.value = true;
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '提交中...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    const submitData = {
      conferenceRoom: formData.conferenceRoom,
      department: formData.department,
      applicant: formData.applicant,
      phone: formData.phone,
      activityTheme: formData.activityTheme,
      banner: formData.banner,
      setupTime: convertDateToTimestamp(formData.setupTime),
      startTime: convertDateToTimestamp(formData.startTime),
      endTime: convertDateToTimestamp(formData.endTime),
      participants: formData.participants,
      purpose: formData.purpose,
      remark: formData.remark,
      precautions: formData.precautions,
      status: 0,
      signature: formData.signature,
      meetingRoomId: formData.meetingRoomId,
      participantsNum: formData.participantsNum,
      equipments: (selectedEquipments.value || [])
                                    .map(item => `${item.id}*${item.num}`)
                                    .join('|'),
      meetingRoomTimeId: formData.meetingRoomTimeId,
      // 使用单位意见相关字段 - 按照后端 RoomApplyVO 接口
      departmentHead: departmentInfo.head,
      departmentOpinion: departmentInfo.opinion,
      departmentApprovalDate: convertDateToTimestamp(departmentInfo.approvalDate),
      // 管理单位意见相关字段 - 按照后端 RoomApplyVO 接口
      adminPerson: adminInfo.person,
      adminOpinion: adminInfo.opinion,
      adminApprovalDate: convertDateToTimestamp(adminInfo.approvalDate)
    };
    if (id) {
      submitData.id = id;
    }
    let res;
    try {
      if (id) {
        res = await RoomApplyApi.updateRoomApply(submitData);
      } else {
        res = await RoomApplyApi.createRoomApply(submitData);
      }
      loadingInstance.close();
      loading.value = false;

      if (res) {
        ElMessage.success('会议室申请提交成功！');
        router.push('/xzsp/meetingroom/MyApply');
      } else {
        ElMessage.error('申请提交失败，请重试');
      }
    } catch (error) {
      loadingInstance.close();
      loading.value = false;
      ElMessage.error('提交失败: ' + (error.message || '未知错误'));
      console.error('提交申请时发生错误:', error);
    }

    if (attachList.value.length !== 0) {
      try {
        for (const file of attachList.value) {
          let applyId
          if (id){
            applyId = id}
          else {
            applyId = res
          }
          const fileVO = {
            meetingApplyId: applyId,
            fileName: file.name,
            fileSize: file.size,
            fileUrl: file.url
          }
          console.log(fileVO)
          await RoomApplyFileApi.createFile(fileVO)
          console.log(`文件 "${file.name}" 创建成功`)
        }

        ElMessage.success("所有附件记录已成功提交")
        resetForm()
      } catch (err) {
        console.error("上传记录保存失败:", err)
        ElMessage.error("附件提交失败，请重试")
      }
    }
  });
};

const resetForm = () => {
  const requireId = route.query.id

  if (requireId){
    fetchRoomApplyDetail(requireId)
  }else{
      console.log(formRef.value)
      formRef.value.resetFields();
      const storedInfo = sessionStorage.getItem('selectedRoomInfo')
      if (storedInfo) {
        try {
          const roomInfo = JSON.parse(storedInfo)
          formData.participants = ''
          // 自动填充表单字段
          formData.conferenceRoom = roomInfo.name || ''
          formData.capacity = roomInfo.capacity || ''
          formData.setupTime = roomInfo.date || ''
          formData.startTime = `${formData.setupTime} ${roomInfo.startTime}`
          formData.endTime = `${formData.setupTime} ${roomInfo.endTime}`
          formData.meetingRoomId = roomInfo.meetingRoomId
        } catch (e) {
          console.error('会议室信息解析失败：', e)
        }
      }
  }
  fileList.value = [];
};

const goBack = () => {
  router.push('/xzsp/meetingroom/apply');
};

onMounted(() => {
  const requireId = route.query.id

  if (requireId){
    fetchRoomApplyDetail(requireId)
  }else{
    const storedInfo = sessionStorage.getItem('selectedRoomInfo')

    if (storedInfo) {
      try {
        const roomInfo = JSON.parse(storedInfo)

        // 自动填充表单字段（你可以根据表单结构灵活调整）
        formData.conferenceRoom = roomInfo.name || ''
        formData.capacity = roomInfo.capacity || ''
        formData.setupTime = roomInfo.date || ''
        formData.startTime = `${formData.setupTime} ${roomInfo.startTime}`
        formData.endTime = `${formData.setupTime} ${roomInfo.endTime}`
        formData.meetingRoomId = roomInfo.meetingRoomId
        formData.meetingRoomTimeId = roomInfo.meetingRoomTimeId
        // 若表单字段名不同，可自行映射
        console.log('会议室信息预填成功：', formData)
      } catch (e) {
        console.error('会议室信息解析失败：', e)
      }
    }
  }

});

/**
 * 获取所有数据
 * @param id
 * @returns {Promise<any>}
 */
async function fetchRoomApplyDetail(id) {
  try {
    const res = await RoomApplyApi.getRoomApply(id)
    const filedata = await RoomApplyFileApi.getFilesByApplyId(id)

    const AllRoomEquipment = await RoomEquipmentApi.getEquipmentByRoomId(res.meetingRoomId)

    const equipmentStr = res.equipments

    const equipmentMap = equipmentStr.split('|').map(item => {
      const [idStr, numStr] = item.split('*')
      return {
        id: parseInt(idStr),
        num: parseInt(numStr)
      }
    })

    const selectedEquipmentsList = equipmentMap
      .map(equip => {
        const match = AllRoomEquipment.find(item => item.id === equip.id)
        if (match) {
          return {
            id: equip.id,
            equipmentName: match.equipmentName,
            detail: match.detail,
            num: equip.num,
            checked: true
          }
        }
        return null // 显式返回 null，后面过滤掉
      })
      .filter(e => e && e.checked && e.num > 0)

    selectedEquipments.value = selectedEquipmentsList

      fileList.value = filedata.map(file => ({
      name: file.fileName,
      size: file.fileSize,
      url: file.fileUrl,
      id: file.id,
      status: 'success'
    }))
    console.log("fileList",fileList)
    console.log('原始API响应:', JSON.stringify(res))

    // 将响应数据赋值到 formData 中
    formData.conferenceRoom = res.conferenceRoom || ''
    formData.department = res.department || ''
    formData.applicant = res.applicant || ''
    formData.phone = res.phone || ''
    formData.activityTheme = res.activityTheme || ''
    formData.banner = res.banner || ''
    formData.setupTime = formatTimestamp(res.setupTime);
    formData.startTime = formatTimestamp(res.startTime);
    formData.endTime = formatTimestamp(res.endTime);
    formData.participants = res.participants || ''
    formData.purpose = res.purpose || ''
    formData.precautions = res.precautions || ''
    formData.remark = res.remark || ''
    formData.attachments = res.attachments || []
    formData.signature = res.signature || ''
    formData.participantsNum = res.participantsNum
    formData.meetingRoomId = res.meetingRoomId
    
    // 添加意见相关字段的处理 - 按照后端 RoomApplyVO 接口
    departmentInfo.head = res.departmentHead || ''
    departmentInfo.opinion = res.departmentOpinion || ''
    departmentInfo.approvalDate = formatTimestamp(res.departmentApprovalDate)
    adminInfo.person = res.adminPerson || ''
    adminInfo.opinion = res.adminOpinion || ''
    adminInfo.approvalDate = formatTimestamp(res.adminApprovalDate)
    // 注意：后端没有 precautions 字段，所以 adminInfo.notes 保持为空
    adminInfo.notes = ''

    return res
  } catch (error) {
    console.error('获取会议申请详情失败:', error.message || error)
    throw error
  }
}
</script>

<style>
.application-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
}

.form-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: bold;
}

.form-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.application-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.application-table td {
  border: 1px solid #dcdfe6;
  padding: 8px;
  vertical-align: middle;
}

.label-cell {
  width: 120px;
  background-color: #f5f7fa;
  text-align: center;
  font-weight: bold;
}

.sub-label-cell {
  width: 100px;
  text-align: right;
  padding-right: 10px;
}

.content-cell {
  padding: 5px;
}

.required-cell {
  width: 60px;
  color: #f56c6c;
  text-align: center;
}

.note-cell {
  width: 200px;
  color: #606266;
  font-size: 13px;
  padding: 5px;
  line-height: 1.4;
}

.time-range {
  display: flex;
  align-items: center;
}

.time-separator {
  margin: 0 5px;
}

.editor-container {
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  margin-top: 5px;
  display: flex;
  gap: 5px;
}

.unit-opinion {
  margin-bottom: 15px;
  font-size: 14px;
}

.signature-line {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.signature-input {
  width: 150px;
  margin: 0 10px;
}

.required-mark {
  color: #f56c6c;
}

.notes {
  font-size: 13px;
  color: #303133;
  line-height: 1.4;
}
.reauired-mark{
  color:red;
}
.notes p {
  margin: 5px 0;
}
.time-right {
  margin-left: auto; /* 将时间推到最右侧 */
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 0 20px 20px;
}

.no-margin {
  margin: 0 !important;
}

/* 覆盖Element Plus的一些样式 */
:deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid #dcdfe6;
  border-radius: 0;
}

:deep(.el-textarea__inner) {
  border: 1px solid #dcdfe6;
  border-radius: 0;
}

/* 覆盖错误状态的样式 - 使用更强的选择器权重 */
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 !important;
  border-color: #dcdfe6 !important;
  background-color: #fff !important;
}

:deep(.el-form-item.is-error .el-textarea__inner) {
  box-shadow: 0 0 0 1px #dcdfe6 !important;
  border-color: #dcdfe6 !important;
  background-color: #fff !important;
}

:deep(.el-form-item.is-error) {
  margin-bottom: 0 !important;
}

:deep(.el-form-item__error) {
  display: none !important;
  visibility: hidden !important;
  position: static !important;
  height: 0 !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 使用非常高的特异性选择器覆盖错误状态 */
:deep(.el-form-item.is-error .el-input__wrapper),
:deep(.el-form-item.is-error .el-input__wrapper:hover),
:deep(.el-form-item.is-error .el-input__wrapper:focus),
:deep(.el-form-item.is-error .el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 1px #dcdfe6 !important;
  border-color: #dcdfe6 !important;
}
:deep(.note-cell2){
    color:red
}
/* ApplyFormReview-admin.vue */
/* ApplyFormReview-dept.vue */
</style>
