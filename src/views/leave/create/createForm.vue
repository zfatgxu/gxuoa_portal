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
          <el-table-column prop="name" label="姓名"/>
          <el-table-column prop="department" label="部门" />
          <el-table-column prop="title" label="职称" :formatter="(cellValue) => getDictLabel(DICT_TYPE.PROFESSIONAL_TITLE, cellValue.professionalTitle)"/>
          <el-table-column prop="position" label="职级" :formatter="(cellValue) => getDictLabel(DICT_TYPE.LEVEL, cellValue.level)"/>
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
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabled-date="pickerOptions"
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
                <el-checkbox-group v-model="selectedReasons" @change="handleReasonChange">
                  <el-checkbox
                    :label="reason.value"
                  >
                    {{ reason.label }}
                  </el-checkbox>
                </el-checkbox-group>
                <!-- 调研展开内容 -->
                <div v-if="reason.value === 1 && selectedReasons.includes(1)" style="padding: 15px 10px;">
                  <div v-for="(research, index) in researchList" :key="index">
                    <div class="add-meeting">
                    <el-button v-if="index > 0" type="danger" circle @click="removeResearch(index)">
                      <el-icon><Minus /></el-icon>
                    </el-button>
                  </div>
                    <div class="detail-item">
                      <span class="detail-label">调研主题</span>
                      <el-input v-model="research.researchTopic" type="textarea" autosize placeholder="请输入调研主题"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">调研目的</span>
                      <el-input v-model="research.researchPurpose" type="textarea" autosize placeholder="请输入调研目的"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">调研单位</span>
                      <el-input v-model="research.researchUnit" type="textarea" autosize placeholder="请输入调研单位"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">开始时间</span>
                      <el-date-picker
                        v-model="research.researchStartDate"
                        type="date"
                        placeholder="开始时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled-date="disabledStartDate(index,1)"
                      />
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">结束时间</span>
                      <el-date-picker
                        v-model="research.researchEndDate"
                        type="date"
                        placeholder="结束时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled-date="disabledEndDate(index,1)"
                      />
                    </div>
                    <div class="add-meeting">
                    <el-button type="primary" circle @click="addResearch">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                    </div>
                  </div>
                </div>
                <!-- 培训事由 -->
                <div v-if="reason.value === 2 && selectedReasons.includes(2)" style="padding: 15px 10px;">
                  <div v-for="(meeting, index) in trainingList" :key="index">
                    <div class="add-meeting">
                    <el-button v-if="index > 0" type="danger" circle @click="removeTraining(index)">
                      <el-icon><Minus /></el-icon>
                    </el-button>
                  </div>
                    <div class="detail-item">
                      <span class="detail-label">培训主题</span>
                      <el-input v-model="meeting.trainingTopic" type="textarea" autosize placeholder="请输入培训主题"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">举办单位</span>
                      <el-input v-model="meeting.trainingUnit" type="textarea" autosize placeholder="请输入举办单位"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">开始时间</span>
                      <el-date-picker
                        v-model="meeting.trainingStartDate"
                        type="date"
                        placeholder="开始时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled-date="disabledStartDate(index,2)"
                      />
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">结束时间</span>
                      <el-date-picker
                        v-model="meeting.trainingEndDate"
                        type="date"
                        placeholder="结束时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled-date="disabledEndDate(index,2)"
                      />
                    </div>
                    <div class="add-meeting">
                    <el-button type="primary" circle @click="addTraining">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </div>
                  </div>
                </div>
                <!-- 公务事由 -->
                <div v-if="reason.value === 3 && selectedReasons.includes(3)" style="padding: 15px 10px;">
                  <div v-for="(meeting, index) in businessList" :key="index">
                    <div class="add-meeting">
                      <el-button v-if="index > 0" circle type="danger" @click="removeBusiness(index)">
                        <el-icon><Minus /></el-icon>
                      </el-button>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">会议名称</span>
                      <el-input v-model="meeting.businessTopic" type="textarea" autosize placeholder="请输入会议名称"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">举办单位</span>
                      <el-input v-model="meeting.businessUnit" type="textarea" autosize placeholder="请输入举办单位"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">开始时间</span>
                      <el-date-picker
                        v-model="meeting.businessStartDate"
                        type="date"
                        placeholder="开始时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled-date="disabledStartDate(index,3)"
                      />
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">结束时间</span>
                      <el-date-picker
                        v-model="meeting.businessEndDate"
                        type="date"
                        placeholder="结束时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled-date="disabledEndDate(index,3)"
                      />
                    </div>
                    <div class="add-meeting">
                      <el-button type="primary" circle @click="addBusiness">
                        <el-icon><Plus /></el-icon>
                      </el-button>
                    </div>
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
                      <el-input v-model="meeting.academicTopic" type="textarea" autosize placeholder="请输入会议名称"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">会议性质</span>
                      <el-radio-group v-model="meeting.academicNature">
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
                      <el-input v-model="meeting.academicUnit" type="textarea" autosize placeholder="请输入主办方"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">开始时间</span>
                      <el-date-picker
                        v-model="meeting.academicStartDate"
                        type="date"
                        placeholder="开始时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled-date="disabledStartDate(index,5)"
                      />
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">结束时间</span>
                      <el-date-picker
                        v-model="meeting.academicEndDate"
                        type="date"
                        placeholder="结束时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled-date="disabledEndDate(index,5)"
                      />
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">受邀作报告</span>
                      <el-radio-group v-model="meeting.isPresentation">
                        <el-radio
                          v-for="dict in getIntDictOptions(DICT_TYPE.IS_PRESENTATION)"
                          :key="dict.value"
                          :label="dict.value"
                        >
                          {{ dict.label }}
                        </el-radio>
                      </el-radio-group>
                    </div>
                    <div v-if="meeting.isPresentation === 1" class="detail-item">
                      <span class="detail-label">报告类型</span>
                      <el-radio-group v-model="meeting.reportType">
                        <el-radio
                          v-for="dict in getIntDictOptions(DICT_TYPE.REPORT_TYPE)"
                          :key="dict.value"
                          :label="dict.value"
                        >
                          {{ dict.label }}
                        </el-radio>
                      </el-radio-group>
                    </div>
                    <div v-if="meeting.isPresentation === 1" class="detail-item">
                      <span class="detail-label">报告题目</span>
                      <el-input v-model="meeting.reportTitle" type="textarea" autosize placeholder="请输入报告题目"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">交流论文数</span>
                      <el-input v-model="meeting.academicPaperCount" type="number"
                      min="0" placeholder="请输入交流论文数"/>
                    </div>
                  </div>
                  <div class="add-meeting">
                    <el-button type="primary" circle @click="addAcademicMeeting">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </div>
                </div>
                <!-- 因私事由 -->
                <div v-if="reason.value === 4 && selectedReasons.includes(4)" style="padding: 15px 10px;">
                  <div v-for="(personal, index) in personalList" :key="index">
                    <div class="add-meeting">
                      <el-button v-if="index > 0" type="danger" circle @click="removePersonal(index)">
                        <el-icon><Minus /></el-icon>
                      </el-button>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">请假类型</span>
                      <el-select v-model="personal.personalType" placeholder="请选择请假类型" clearable>
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
                        v-model="personal.personalStartDate"
                        type="date"
                        placeholder="开始时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled-date="disabledStartDate(index,4)"
                      />
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">结束时间</span>
                      <el-date-picker
                        v-model="personal.personalEndDate"
                        type="date"
                        placeholder="结束时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%;"
                        :disabled-date="disabledEndDate(index,4)"
                      />
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">总计天数</span>
                      <el-input v-model="personal.personalTotalDays" readonly placeholder="请输入总计天数"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">请假详情</span>
                      <el-input v-model="personal.personalReason" type="textarea" autosize placeholder="请输入请假详情"/>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">联系电话</span>
                      <el-input v-model="personal.personalPhone" placeholder="请输入联系电话" :maxlength="11" @blur="validatePhone(personal.personalPhone)"/>
                    </div>
                    <div v-if="personal.personalType === 6">
                      <div class="detail-item">
                        <span class="detail-label">探亲路线</span>
                        <el-input v-model="personal.personalRoute" type="textarea" autosize placeholder="请输入探亲路线"/>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">与探望人关系</span>
                        <el-input v-model="personal.personalRelation" type="textarea" autosize placeholder="请输入与探望人关系"/>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">被探望人姓名</span>
                        <el-input v-model="personal.personalVisitName" type="textarea" autosize placeholder="请输入被探望人姓名"/>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">探亲类别</span>
                        <el-select v-model="personal.personalVisitType" placeholder="请选择探亲类别" clearable>
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
                        <el-input v-model="personal.personalVisitAddress" type="textarea" autosize placeholder="请输入户口所在地或地址"/>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">婚姻状况</span>
                        <el-select v-model="personal.personalMaritalStatus" placeholder="请选择婚姻状况" clearable>
                          <el-option
                            v-for="dict in getIntDictOptions(DICT_TYPE.MARITAL_STATUS)"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                          />
                        </el-select>
                      </div>
                    </div>
                    <div v-if="personal.personalType === 11">
                      <div class="detail-item">
                        <span class="detail-label">生育次数</span>
                        <el-select v-model="personal.personalParity" placeholder="请选择生育次数" clearable>
                          <el-option
                            v-for="dict in getIntDictOptions(DICT_TYPE.PARITY)"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                          />
                        </el-select>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">是否多胞胎</span>
                        <el-select v-model="personal.personalMultiple" placeholder="请选择是否多胞胎" clearable>
                          <el-option
                            v-for="dict in getIntDictOptions(DICT_TYPE.IS_PRESENTATION)"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                          />
                        </el-select>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">是否难产</span>
                        <el-select v-model="personal.personalDystocia" placeholder="请选择是否难产" clearable>
                          <el-option
                            v-for="dict in getIntDictOptions(DICT_TYPE.IS_PRESENTATION)"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                          />
                        </el-select>
                      </div>
                    </div>
                    <div class="add-meeting">
                      <el-button type="primary" circle @click="addPersonal">
                        <el-icon><Plus /></el-icon>
                      </el-button>
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
                  />
                </div>
              </div>
              <el-checkbox v-model="hasAttachment">
                附件
              </el-checkbox>
              <div v-if="hasAttachment" style="padding: 15px 10px;">
                <el-upload
                  ref="uploadRef"
                  :http-request="customUpload"
                  :on-preview="handlePreview"
                  :before-remove="beforeRemove"
                  :before-upload="beforeUpload"
                  multiple
                  v-model:file-list="fileList"
                  accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                >
                  <el-button type="primary">点击上传</el-button>
                  <template #tip>
                    <div>支持jpg/png/pdf/doc/docx/xls/xlsx格式，单个文件不超过20MB</div>
                  </template>
                </el-upload>
              </div>
            </div>
          </el-descriptions-item>

          <!-- 前往地点 -->
          <el-descriptions-item label="前往地点(必填)" label-class-name="approval-label">
            <div v-for="(loc, index) in destinations" :key="index" style="display: flex;flex-direction: column;margin-bottom: 20px;">
              <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <el-radio-group v-model="loc.locationType" style="margin-right: 15px;">
                  <el-radio label="domestic">国内</el-radio>
                  <el-radio label="foreign">国外</el-radio>
                </el-radio-group>
                <el-button 
                  v-if="index === destinations.length - 1" 
                  type="primary" 
                  circle 
                  @click="addDestination"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
                <el-button 
                  v-if="destinations.length > 1" 
                  type="danger" 
                  circle 
                  style="margin-left: 10px;"
                  @click="removeDestination(index)"
                >
                  <el-icon><Minus /></el-icon>
                </el-button>
              </div>
              
              <!-- 国内地址 -->
              <div v-if="loc.locationType === 'domestic'" style="display: flex; align-items: center;">
                <el-cascader :options="pcaTextArr" v-model="loc.destination" clearable style="width: 100%;" placeholder="请选择省/市/区"/>
              </div>
              
              <!-- 国外地址 -->
              <div v-if="loc.locationType === 'foreign'" style="display: flex; align-items: center; width: 100%;">
                <el-input v-model="loc.foreignAddress" placeholder="请输入国家和详细地址" style="width: 100%;" type="textarea" autosize />
              </div>
            </div>
          </el-descriptions-item>

          <!-- 请假期间主持工作负责人安排 -->
          <el-descriptions-item v-if="Number(personnel.level) >= 27 && Number(personnel.level) !== 100" label="请假期间主持工作负责人安排(必填)" label-class-name="approval-label">
            <el-input
              v-model="workArrangement"
              type="textarea"
              :rows="4"
              placeholder="请输入请假期间工作安排"
            />
          </el-descriptions-item>

          <!-- 备注 -->
          <el-descriptions-item label="备注(说明)" label-class-name="approval-label">
            <el-input
              v-model="remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <!-- 审批意见 -->
      <div v-if="Number(personnel.level) != 100" class="approval-section">
        <div class="divider">
          <span class="divider-text">审批意见</span>
        </div>
        <el-descriptions
          border
          :column="1"
          class="approval-descriptions"
        >
          <el-descriptions-item v-if="Number(personnel.level) >= 27" label="请假期间主持工作负责人会签" label-class-name="approval-label">
            <div></div>
          </el-descriptions-item>
          <el-descriptions-item label="领导意见" label-class-name="approval-label">
            <div></div>
          </el-descriptions-item>

        </el-descriptions>
      </div>

      <!-- 底部操作栏 -->
      <div class="form-actions">
        <div class="action-item">
          <span style="font-size: 14px;margin-bottom: 5px;">下一步</span>
        </div>
        <div class="action-item">
          <span v-if="Number(personnel.level) >= 27 && Number(personnel.level) != 100" style="font-size: 14px;margin-bottom: 5px;">请假期间主持工作负责人会签</span>
          <span v-if="Number(personnel.level) < 27" style="font-size: 14px;margin-bottom: 5px;">单位负责人签字</span>
        </div>
        <div class="action-item">
          <div v-for="userTask in startUserSelectTasks" :key="userTask.id">
            <div class="flex flex-wrap gap-2">
              <!-- 始终显示一个用户 -->
              <div
                v-if="startUserSelectAssignees[userTask.id]?.length > 0"
                :key="startUserSelectAssignees[userTask.id][0].id"
                class="bg-gray-100 h-35px rounded-3xl flex items-center pr-8px dark:color-gray-600"
              >
                <el-avatar class="!m-5px" :size="28">
                  {{ startUserSelectAssignees[userTask.id][0].nickname.substring(0, 1) }}
                </el-avatar>
                {{ startUserSelectAssignees[userTask.id][0].nickname }}
                <Icon
                  icon="ep:close"
                  class="ml-2 cursor-pointer hover:text-red-500"
                  @click="handleRemoveApprovalUser(startUserSelectAssignees[userTask.id][0], userTask.id)"
                />
              </div>
              <!-- 显示第二个用户（当只有两个人时） -->
              <div
                v-if="startUserSelectAssignees[userTask.id]?.length === 2"
                :key="startUserSelectAssignees[userTask.id][1].id"
                class="bg-gray-100 h-35px rounded-3xl flex items-center pr-8px dark:color-gray-600"
              >
                <el-avatar class="!m-5px" :size="28">
                  {{ startUserSelectAssignees[userTask.id][1].nickname.substring(0, 1) }}
                </el-avatar>
                {{ startUserSelectAssignees[userTask.id][1].nickname }}
                <Icon
                  icon="ep:close"
                  class="ml-2 cursor-pointer hover:text-red-500"
                  @click="handleRemoveApprovalUser(startUserSelectAssignees[userTask.id][1], userTask.id)"
                />
              </div>

              <!-- 显示省略号及下拉框（当超过两个人时） -->
              <el-popover
                v-if="startUserSelectAssignees[userTask.id]?.length > 2"
                placement="bottom"
                trigger="hover"
                :width="200"
              >
                <template #reference>
                  <div class="bg-gray-100 h-35px rounded-3xl flex items-center px-3 cursor-pointer">
                    等{{ startUserSelectAssignees[userTask.id].length - 1 }}人
                  </div>
                </template>

                <div class="p-2 max-h-300px overflow-auto">
                  <div
                    v-for="user in startUserSelectAssignees[userTask.id].slice(1)"
                    :key="user.id"
                    class="flex items-center py-1 px-2 hover:bg-gray-100 rounded"
                  >
                    <el-avatar class="!m-5px" :size="28">
                      {{ user.nickname.substring(0, 1) }}
                    </el-avatar>
                    <span class="ml-1 flex-1">{{ user.nickname }}</span>
                    <Icon
                      icon="ep:close"
                      class="ml-2 cursor-pointer hover:text-red-500"
                      @click="handleRemoveApprovalUser(user, userTask.id)"
                    />
                  </div>
                </div>
              </el-popover>
              <el-button v-if="Number(personnel.level) >= 27 && Number(personnel.level) != 100 && userTask.id==='host_sign'" type="primary" link @click="openApprovalUserSelect(userTask.id)" >
                <Icon icon="ep:plus" />选择代工人
              </el-button>
              <el-button v-if="userTask.id==='leader_sign' && Number(personnel.level) < 27" type="primary" link @click="openApprovalUserSelect(userTask.id)" :disabled="isReadOnly">
                <Icon icon="ep:plus" />选择领导
              </el-button>
            </div>
            
          </div>
        </div>
        <div class="action-item">
          <el-button type="primary" @click="handleSubmit">提交流程</el-button>
        </div>
      </div>
    </el-card>
  </div>
  <UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelectConfirm" />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { DICT_TYPE, getIntDictOptions, getStrDictOptions, getDictLabel } from '@/utils/dict'
import { Minus, Plus } from '@element-plus/icons-vue'
import { pcaTextArr } from "element-china-area-data";
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadFile, UploadUserFile } from 'element-plus';
import { getUserProfile } from '@/api/system/user/profile'
import { RegisterApi, RegisterFileApi, ReasonFormApi } from '@/api/leave/create/createForm'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import * as FileApi from '@/api/infra/file'
import * as DefinitionApi from '@/api/bpm/definition'
import * as UserApi from '@/api/system/user'
import { parseHostSignTasks } from '@/utils/parseBpmnleave'
import { number } from 'vue-types';
import UserSelectForm from '@/components/UserSelectForm/index.vue'; // 导入 UserSelectForm 组件
import { UserVO } from '@/api/system/user'
// 当前登录人员信息
const personnel = ref({
  id: '',
  deptId: '',
  name: '',
  department: '',
  title: '',
  position: '',
  level: '',
  professionalTitle: '',
});
// 日期范围
const dateRange = ref([]);
// 调研事由信息
const researchList = ref([
  {
    id: '',
    researchTopic: '',
    researchPurpose: '',
    researchUnit: '',
    researchStartDate: '',
    researchEndDate: ''
  }
]);
const addResearch = () => {
  researchList.value.push({
    id: '',
    researchTopic: '',
    researchPurpose: '',
    researchUnit: '',
    researchStartDate: '',
    researchEndDate: ''
  });
};
const removeResearch = (index) => {
  if (researchList.value.length > 1) {
    researchList.value.splice(index, 1);
  } else {
    Object.keys(researchList.value[0]).forEach(key => {
      researchList.value[0][key] = '';
    });
  }
};
// 培训事由信息
const trainingList = ref([
  {
    id: '',
    trainingTopic: '',
    trainingUnit: '',
    trainingStartDate: '',
    trainingEndDate: ''
  }
]);
const addTraining = () => {
  trainingList.value.push({
    id: '',
    trainingTopic: '',
    trainingUnit: '',
    trainingStartDate: '',
    trainingEndDate: ''
  });
};
const removeTraining = (index) => {
  if (trainingList.value.length > 1) {
    trainingList.value.splice(index, 1);
  } else {
    Object.keys(trainingList.value[0]).forEach(key => {
      trainingList.value[0][key] = '';
    });
  }
};
// 公务事由信息
const businessList = ref([
  {
    id: '',
    businessTopic: '',
    businessUnit: '',
    businessStartDate: '',
    businessEndDate: ''
  }
]);
const addBusiness = () => {
  businessList.value.push({
    id: '',
    businessTopic: '',
    businessUnit: '',
    businessStartDate: '',
    businessEndDate: ''
  });
};
const removeBusiness = (index) => {
  if (businessList.value.length > 1) {
    businessList.value.splice(index, 1);
  } else {
    Object.keys(businessList.value[0]).forEach(key => {
      businessList.value[0][key] = '';
    });
  }
};
// 学术会议事由信息
const academicMeetings = ref([
  {
    id: '',
    academicTopic: '',
    academicNature: '',
    academicUnit: '',
    academicStartDate: '',
    academicEndDate: '',
    isPresentation: '',
    reportType: '',
    reportTitle: '',
    academicPaperCount: ''
  }
]);
const addAcademicMeeting = () => {
  academicMeetings.value.push({
    id: '',
    academicTopic: '',
    academicNature: '',
    academicUnit: '',
    academicStartDate: '',
    academicEndDate: '',
    isPresentation: '',
    reportType: '',
    reportTitle: '',
    academicPaperCount: ''
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
const personalList = ref([
  {
    id: '',
    personalType: '',
    personalStartDate: '',
    personalEndDate: '',
    personalTotalDays: 0,
    personalReason: '',
    personalPhone: '',
    personalRoute: '',
    personalRelation: '',
    personalVisitName: '',
    personalVisitType: '',
    personalVisitAddress: '',
    personalMaritalStatus: '',
    personalParity: '',
    personalMultiple: '',
    personalDystocia: ''
  }
]);
const addPersonal = () => {
  personalList.value.push({
    id: '',
    personalType: '',
    personalStartDate: '',
    personalEndDate: '',
    personalTotalDays: 0,
    personalReason: '',
    personalPhone: '',
    personalRoute: '',
    personalRelation: '',
    personalVisitName: '',
    personalVisitType: '',
    personalVisitAddress: '',
    personalMaritalStatus: '',
    personalParity: '',
    personalMultiple: '',
    personalDystocia: ''
  });
};
const removePersonal = (index: number) => {
  if (personalList.value.length > 1) {
    personalList.value.splice(index, 1);
  } else {
    Object.keys(personalList.value[0]).forEach(key => {
      personalList.value[0][key] = '';
    });
  }
};
// 其他事由
const otherID = ref();
const otherReason = ref('');
// 监听日期范围变化
watch(dateRange, (newVal) => {
  if (newVal && newVal.length === 2) {
    researchList.value.forEach(meeting => {
      meeting.researchStartDate = newVal[0];
      meeting.researchEndDate = newVal[1];
    });
    trainingList.value.forEach(meeting => {
      meeting.trainingStartDate = newVal[0];
      meeting.trainingEndDate = newVal[1];
    });
    businessList.value.forEach(meeting => {
      meeting.businessStartDate = newVal[0];
      meeting.businessEndDate = newVal[1];
    });
    academicMeetings.value.forEach(meeting => {
      meeting.academicStartDate = newVal[0];
      meeting.academicEndDate = newVal[1];
    });
    personalList.value.forEach(meeting => {
      meeting.personalStartDate = newVal[0];
      meeting.personalEndDate = newVal[1];
      meeting.personalTotalDays = Math.ceil((new Date(newVal[1]).getTime() - new Date(newVal[0]).getTime()) / (1000 * 60 * 60 * 24))+1;
    });
  }
}, { deep: true });

// 监听因私请假的开始时间和结束时间变化
watch(personalList, (newVal) => {
  newVal.forEach(personal => {
    if (personal.personalStartDate && personal.personalEndDate) {
      personal.personalTotalDays = Math.ceil((new Date(personal.personalEndDate).getTime() - new Date(personal.personalStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
  });
}, { deep: true });

const selectedReasons = ref<number[]>([]);
const dataReasons = ref<{id: number, type: number}[]>([]);
// 附件
const hasAttachment = ref(false);
const fileList = ref<UploadUserFile[]>([]);
const dataFiles = ref<number[]>([]);
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

const beforeUpload = (file: UploadFile) => {
  const fileSize = file.size / 1024 / 1024;
  if (fileSize > 20) {
    ElMessage.error('文件大小超过20MB，无法上传');
    return false;
  }
  return true;
}

// 起止日期为空时，清空事由
const handleReasonChange = () => {
  if (!dateRange.value || dateRange.value.length === 0) {
    selectedReasons.value = [];
    ElMessage.warning('请先选择起止日期');
  }
};

// 表单数据
const destinations = ref([{ locationType: 'domestic', destination: '', destinationDetail: '', foreignAddress: '' }]);
const workArrangement = ref('');
const remarks = ref('');
const router = useRouter()
// 添加目的地
const addDestination = () => {
  destinations.value.push({ locationType: 'domestic', destination: '', destinationDetail: '', foreignAddress: '' });
};

// 删除目的地
const removeDestination = (index) => {
  if (destinations.value.length > 1) {
    destinations.value.splice(index, 1);
  }
};
// 手机号验证
const validatePhone = (phoneValue) => {
  if (!phoneValue) return;
  
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phoneValue)) {
    ElMessage.warning('请输入正确的11位手机号码');
    return '';
  }
  return phoneValue;
};
// 提交流程
const handleSubmit = async () => {
  // 0. 确认提示
  await ElMessageBox.confirm(
      '确认提交请假申请吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }
    )
  try {
    // 1. 表单验证
    if (!dateRange.value || dateRange.value.length !== 2) {
      ElMessage.warning('请选择请假日期范围')
      return
    }

    if (selectedReasons.value.length === 0) {
      ElMessage.warning('请至少选择一个请假事由')
      return
    }

        // 调研事由验证
        if (selectedReasons.value.includes(1)) {
      for (let i = 0; i < researchList.value.length; i++) {
        const research = researchList.value[i];
        if (!research.researchTopic) {
          ElMessage.warning(`第${i+1}条调研记录的调研主题不能为空`);
          return;
        }
        if (!research.researchPurpose) {
          ElMessage.warning(`第${i+1}条调研记录的调研目的不能为空`);
          return;
        }
        if (!research.researchUnit) {
          ElMessage.warning(`第${i+1}条调研记录的调研单位不能为空`);
          return;
        }
      }
    }

    // 培训事由验证
    if (selectedReasons.value.includes(2)) {
      for (let i = 0; i < trainingList.value.length; i++) {
        const training = trainingList.value[i];
        if (!training.trainingTopic) {
          ElMessage.warning(`第${i+1}条培训记录的培训主题不能为空`);
          return;
        }
        if (!training.trainingUnit) {
          ElMessage.warning(`第${i+1}条培训记录的培训单位不能为空`);
          return;
        }
      }
    }

    // 公务事由验证
    if (selectedReasons.value.includes(3)) {
      for (let i = 0; i < businessList.value.length; i++) {
        const business = businessList.value[i];
        if (!business.businessTopic) {
          ElMessage.warning(`第${i+1}条公务记录的会议名称不能为空`);
          return;
        }
        if (!business.businessUnit) {
          ElMessage.warning(`第${i+1}条公务记录的会议单位不能为空`);
          return;
        }
      }
    }

    // 学术会议事由验证
    if (selectedReasons.value.includes(5)) {
      for (let i = 0; i < academicMeetings.value.length; i++) {
        const meeting = academicMeetings.value[i];
        if (!meeting.academicTopic) {
          ElMessage.warning(`第${i+1}条学术会议记录的会议名称不能为空`);
          return;
        }
        if (!meeting.academicNature) {
          ElMessage.warning(`第${i+1}条学术会议记录的会议性质不能为空`);
          return;
        }
        if (!meeting.academicUnit) {
          ElMessage.warning(`第${i+1}条学术会议记录的会议单位不能为空`);
          return;
        }
      }
    }

    // 因私事由验证
    if (selectedReasons.value.includes(4)) {
      for (let i = 0; i < personalList.value.length; i++) {
        const personal = personalList.value[i];
        if (!personal.personalType) {
          ElMessage.warning(`第${i+1}条因私记录的请假类型不能为空`);
          return;
        }
        if (!personal.personalReason) {
          ElMessage.warning(`第${i+1}条因私记录的请假详情不能为空`);
          return;
        }
        if (!personal.personalPhone) {
          ElMessage.warning(`第${i+1}条因私记录的联系电话不能为空`);
          return;
        }
      }
    }

    // 其他事由验证
    if (selectedReasons.value.includes(6) && !otherReason.value) {
      ElMessage.warning('其他事由内容不能为空');
      return;
    }

    if (hasAttachment.value && fileList.value.length === 0) {
      ElMessage.warning('请上传至少一个附件');
      return;
    }

    // 检查是否至少有一个有效的目的地
    const hasValidDestination = destinations.value.some(loc => {
      if(loc.locationType === 'domestic') {
        return loc.destination;
      } else if(loc.locationType === 'foreign') {
        return loc.foreignAddress;
      }
      return false;
    });
    if (!hasValidDestination) {
      ElMessage.warning('请至少填写一个前往地点')
      return
    }

    if (Number(personnel.value.level) >= 27 && Number(personnel.value.level) !== 100) {
      if (!workArrangement.value) {
        ElMessage.warning('请填写请假期间工作安排')
        return
      }
    }

    if (Number(personnel.value.level) >= 27 && Number(personnel.value.level) !== 100) {
      if (startUserSelectAssignees.value['host_sign'].length === 0) {
        ElMessage.warning('请选择代工人')
        return
      }
    }

    if (Number(personnel.value.level) < 27) {
      if (startUserSelectAssignees.value['leader_sign'].length === 0) {
        ElMessage.warning('请选择领导审核')
        return
      }
    }

    // 拼接所有目的地为一个字符串，使用 ||| 作为分隔符
    const fullDestination = destinations.value
      .filter(loc => {
        if(loc.locationType === 'domestic') {
          return loc.destination;
        } else if(loc.locationType === 'foreign') {
          return loc.foreignAddress;
        }
        return false;
      })
      .map(loc => {
        if(loc.locationType === 'domestic') {
          return `国内 / ${loc.destination.join(' / ')}`;
        } else {
          return `国外 / ${loc.foreignAddress}`;
        }
      })
      .join(' ||| ');
    // 2. 准备提交数据
    const formData = {
      id: Number(),
      startDate: dateRange.value[0], // 开始日期
      endDate: dateRange.value[1],   // 结束日期
      destination: String(fullDestination), // 前往地点
      hostArrangement: workArrangement.value, // 工作安排
      remark: remarks.value, // 备注
      personId: Number(personnel.value.id), // 请假人ID
      deptId: Number(personnel.value.deptId), // 部门ID
      leaderOpinion: '', // 领导意见，初始为空
      hostId: startUserSelectAssignees.value['leader_sign'].map((user) => user.id).join(','),
      personAdmitId: startUserSelectAssignees.value['host_sign'].map((user) => user.id).join(',')
    }

    // 1. 提交主表数据
    let response = null
    let leaveRegisterId = Number()
    if (routeId.value) {
      formData.id = Number(routeId.value)
      response = await RegisterApi.updateRegister(formData)
      leaveRegisterId = Number(routeId.value)
    } else {
      response = await RegisterApi.createRegister(formData)
      leaveRegisterId = Number(response)
    }
    // 获取主表ID

    // 2. 提交请假事由（每个事由单独提交）
    const reasonPromises = selectedReasons.value.flatMap(reason => {
      if (reason === 5) {
        return academicMeetings.value.flatMap(meeting => {
          const reasonData = {
            id: meeting.id,
            leaveRegisterId: leaveRegisterId,
            type: reason,
            startDate: meeting.academicStartDate,
            endDate: meeting.academicEndDate,
            // 可以添加其他会议相关字段
            subject: meeting.academicTopic,
            meetingNature: Number(meeting.academicNature),
            unit: meeting.academicUnit,
            reportType: meeting.isPresentation === 1 ? meeting.reportType : '',
            reportTitle: meeting.isPresentation === 1 ? meeting.reportTitle : '',
            reportPaperCount: meeting.academicPaperCount
          };
          if (meeting.id) {
            return ReasonFormApi.updateReasonForm(reasonData);
          } else {
            return ReasonFormApi.createReasonForm(reasonData);
          }
        });
      } else if (reason === 1) {
        return researchList.value.flatMap(research => {
          const reasonData = {
            id: research.id,
            leaveRegisterId: leaveRegisterId,
            type: reason,
            subject: research.researchTopic,
            purpose: research.researchPurpose,
            unit: research.researchUnit,
            startDate: research.researchStartDate,
            endDate: research.researchEndDate,
          }
          if (research.id) {
            return ReasonFormApi.updateReasonForm(reasonData);
          } else {
            return ReasonFormApi.createReasonForm(reasonData);
          }
        });
      } else if (reason === 2) {
        return trainingList.value.flatMap(training => {
          const reasonData = {
            id: training.id,
            leaveRegisterId: leaveRegisterId,
            type: reason,
            subject: training.trainingTopic,
            unit: training.trainingUnit,
            startDate: training.trainingStartDate,
            endDate: training.trainingEndDate,
          }
          if (training.id) {
            return ReasonFormApi.updateReasonForm(reasonData);
          } else {
            return ReasonFormApi.createReasonForm(reasonData);
          }
        });
      } else if (reason === 3) {
        return businessList.value.flatMap(business => {
          const reasonData = {
            id: business.id,
            leaveRegisterId: leaveRegisterId,
            type: reason,
            subject: business.businessTopic,
            unit: business.businessUnit,
            startDate: business.businessStartDate,
            endDate: business.businessEndDate,
          }
          if (business.id) {
            return ReasonFormApi.updateReasonForm(reasonData);
          } else {
            return ReasonFormApi.createReasonForm(reasonData);
          }
        });
      } else if (reason === 4) {
        return personalList.value.flatMap(personal => {
        const reasonData = {
          id: personal.id,
          leaveRegisterId: leaveRegisterId,
          type: reason,
          privateType: personal.personalType,
          startDate: personal.personalStartDate,
          endDate: personal.personalEndDate,
          totalDays: personal.personalTotalDays,
          birthCount: personal.personalParity,
          difficultBirth: personal.personalDystocia,
          multipleBirth: personal.personalMultiple,
          detail: personal.personalReason,
          phone: personal.personalPhone,
          visitRoute: personal.personalRoute,
          relationship: personal.personalRelation,
          visitedPersonName: personal.personalVisitName,
          visitType: personal.personalVisitType,
          registeredAddress: personal.personalVisitAddress,
          maritalStatus: personal.personalMaritalStatus,
        }
        if (personal.id) {
          return ReasonFormApi.updateReasonForm(reasonData);
        } else {
          return ReasonFormApi.createReasonForm(reasonData);
        }
      })
      } else if (reason === 6) {
        const reasonData = {
          id: otherID.value,
          leaveRegisterId: leaveRegisterId,
          type: reason,
          detail: otherReason.value,
        }
        if (otherID.value) {
          return ReasonFormApi.updateReasonForm(reasonData);
        } else {
          return ReasonFormApi.createReasonForm(reasonData);
        }
      }
    })
    // 更新时删除取消了的事由
    if (routeId.value) {
      const deletedReasons = dataReasons.value.filter(reason => !selectedReasons.value.includes(reason.type));
      const deletedReasonPromises = deletedReasons.map(reason => {
        return ReasonFormApi.deleteReasonForm(reason.id);
      });
      await Promise.all(deletedReasonPromises);
    }
    // 3. 提交附件（每个附件单独提交）
    const filePromises = fileList.value.flatMap(file => {
      const fileData = {
        id: file.id,
        leaveRegisterId: Number(leaveRegisterId),
        leaveFileUrl: String(file.url),
        leaveFileName: String(file.name),
        leaveFileSize: Number(file.size)
      }
      if (file.id) {
        return RegisterFileApi.updateRegisterFile(fileData);
      } else {
        return RegisterFileApi.createRegisterFile(fileData);
      }
    })
    // 更新时删除取消了的附件
    if (routeId.value) {
      const deletedFiles = dataFiles.value.filter(id => !fileList.value.map(file => file.id).includes(id));
      const deletedFilePromises = deletedFiles.map(id => {
        return RegisterFileApi.deleteRegisterFile(id);
      });
      await Promise.all(deletedFilePromises);
    }

    // 等待所有请求完成
    await Promise.all([...reasonPromises, ...filePromises])

    ElMessage.success('提交成功')
    // 提交成功后跳转到列表页
    router.push('/leave/list/index')
  } catch (error) {
    ElMessage.error('提交失败，请稍后重试')
  }
}
// 获取请假人信息
const isReadOnly = ref(false)
const route = useRoute()
const routeId = ref(route.query.id as string | undefined)
const fetchUserProfile = async () => {
  try {
    if(!routeId.value){
      const res = await getUserProfile();
      if (res) {
        personnel.value = {
          id: res.id,
          deptId: res.deptIds || '',
          name: res.nickname || '',
          department: res.dept?.name || '',
          title: res.posts?.[0]?.name || '',
          position: res.nickname || '',
          level: res.level || '',
          professionalTitle: res.professionalTitle || '',
        };
      }
    } else  {
      isReadOnly.value = true;
      const res = await RegisterApi.getRegister(Number(routeId.value))
      const res1 = await RegisterFileApi.getRegisterFile(Number(routeId.value))
      const res2 = await ReasonFormApi.getReasonForm(Number(routeId.value))
      if (res1.length > 0){
        hasAttachment.value = true;
        dataFiles.value = res1.map(file => file.id);
        fileList.value = res1.map(file => ({
          ...file,
          id: file.id,
          name: file.leaveFileName, // 使用后端返回的文件名字段
          status: 'success', // 确保状态为成功
          url: file.leaveFileUrl, // 如果有预览地址的话
          size: file.leaveFileSize
        }));
      }
      if (res2 && Array.isArray(res2)) {
        // 获取所有存在的事由类型
        const existingTypes = res2.map(item => item.type);

        // 只清空有对应数据的列表
        if (existingTypes.includes(1)) researchList.value = [];
        if (existingTypes.includes(2)) trainingList.value = [];
        if (existingTypes.includes(3)) businessList.value = [];
        if (existingTypes.includes(4)) personalList.value = [];
        if (existingTypes.includes(5)) academicMeetings.value = [];
        res2.forEach(item => {
          // 根据类型设置选中的事由
          if (!selectedReasons.value.includes(item.type)) {
            selectedReasons.value.push(item.type);
            dataReasons.value.push({id: item.id, type: item.type});
          }

          // 根据不同类型设置对应的表单字段
          switch (item.type) {
            case 1: // 调研
              researchList.value.push({
                id: item.id,
                researchTopic: item.subject,
                researchPurpose: item.purpose,
                researchUnit: item.unit,
                researchStartDate: dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss'),
                researchEndDate: dayjs(item.endDate).format('YYYY-MM-DD HH:mm:ss'),
              });
              break;
            case 2: // 培训
              trainingList.value.push({
                id: item.id,
                trainingTopic: item.subject,
                trainingUnit: item.unit,
                trainingStartDate: dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss'),
                trainingEndDate: dayjs(item.endDate).format('YYYY-MM-DD HH:mm:ss'),
              });
              break;
            case 3: // 公务
              businessList.value.push({
                id: item.id,
                businessTopic: item.subject,
                businessUnit: item.unit,
                businessStartDate: dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss'),
                businessEndDate: dayjs(item.endDate).format('YYYY-MM-DD HH:mm:ss'),
              });
              break;
            case 4: // 因私
              personalList.value.push({
                id: item.id,
                personalType: Number(item.privateType),
                personalStartDate: dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss'),
                personalEndDate: dayjs(item.endDate).format('YYYY-MM-DD HH:mm:ss'),
                personalTotalDays: item.totalDays,
                personalPhone: item.phone,
                personalParity: item.birthCount?.toString(),
                personalDystocia: item.difficultBirth,
                personalMultiple: item.multipleBirth,
                detail: item.detail,
                visitRoute: item.visitRoute,
                relationship: item.relationship,
                visitedPersonName: item.visitedPersonName,
                visitType: item.visitType,
                registeredAddress: item.registeredAddress,
                maritalStatus: item.maritalStatus,
              });
              break;
            case 5: // 学术会议
              academicMeetings.value.push({
                id: item.id,
                academicTopic: item.subject,
                academicNature: item.meetingNature,
                academicUnit: item.unit,
                academicStartDate: dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss'),
                academicEndDate: dayjs(item.endDate).format('YYYY-MM-DD HH:mm:ss'),
                isPresentation: item.reportTitle||item.reportType?1:0,
                reportTitle: item.reportTitle,
                reportType: Number(item.reportType),
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
        // 解析 personAdmitId 字符串为用户对象数组
        if (res.personAdmitId) {
          const userIds = res.personAdmitId.split(',').map(id => Number(id));
          // 将 ID 转换为用户对象数组
          startUserSelectAssignees.value['host_sign'] = userList.value.filter((user: any) =>
            userIds.includes(user.id)
          )
        } else {
          startUserSelectAssignees.value['host_sign'] = [];
        }
        // 解析 hostId 字符串为用户对象数组
        if (res.hostId) {
          const userIds = res.hostId.split(',').map(id => Number(id));
          // 将 ID 转换为用户对象数组
          startUserSelectAssignees.value['leader_sign'] = userList.value.filter((user: any) =>
            userIds.includes(user.id)
          )
        } else {
          startUserSelectAssignees.value['leader_sign'] = [];
        }
        // 解析目的地数据
        if (res.destination) {
          // 检查是否使用 ||| 分隔符
          if (res.destination.includes('|||')) {
            const multiDestinations = res.destination.split('|||');
            destinations.value = multiDestinations.map(dest => {
              const trimmedDest = dest.trim();
              
              // 检查是否是国内地址
              if (trimmedDest.startsWith('国内 /')) {
                const parts = trimmedDest.substring(4).trim().split('/').map(p => p.trim());
                return {
                  locationType: 'domestic',
                  destination: parts,
                  destinationDetail: '',
                  foreignAddress: ''
                };
              }
              
              // 检查是否是国外地址
              if (trimmedDest.startsWith('国外 /')) {
                return {
                  locationType: 'foreign',
                  destination: '',
                  destinationDetail: '',
                  foreignAddress: trimmedDest.substring(4).trim()
                };
              }
              
              // 兼容旧格式（使用逗号分隔的省市区）
              if (trimmedDest.includes(',')) {
                const parts = trimmedDest.split(',');
                return {
                  locationType: 'domestic',
                  destination: parts.slice(0, 3), 
                  destinationDetail: parts.slice(3).join(','),
                  foreignAddress: ''
                };
              }
              
              // 兼容旧格式（使用/分隔但没有国内前缀的省市区）
              if (trimmedDest.includes('/')) {
                return {
                  locationType: 'domestic',
                  destination: trimmedDest.split('/'),
                  destinationDetail: '',
                  foreignAddress: ''
                };
              }
              
              // 默认当作国内地址处理
              return {
                locationType: 'domestic',
                destination: trimmedDest ? [trimmedDest] : '',
                destinationDetail: '',
                foreignAddress: ''
              };
            });
          } else {
            const trimmedDest = res.destination.trim();
            
            // 检查是否是国内地址
            if (trimmedDest.startsWith('国内 /')) {
              const parts = trimmedDest.substring(4).trim().split('/').map(p => p.trim());
              destinations.value = [{
                locationType: 'domestic',
                destination: parts,
                destinationDetail: '',
                foreignAddress: ''
              }];
            }
            // 检查是否是国外地址
            else if (trimmedDest.startsWith('国外 /')) {
              destinations.value = [{
                locationType: 'foreign',
                destination: '',
                destinationDetail: '',
                foreignAddress: trimmedDest.substring(4).trim()
              }];
            }
            // 兼容旧格式（使用逗号分隔）
            else if (trimmedDest.includes(',')) {
              const destParts = trimmedDest.split(',');
              // 如果地点数据包含超过省市区的部分，则最后一部分为详细地址
              destinations.value = [{
                locationType: 'domestic',
                destination: destParts.slice(0, 3),
                destinationDetail: destParts.length > 3 ? destParts.slice(3).join(',') : '',
                foreignAddress: ''
              }];
            }
            // 兼容旧格式（使用/分隔但没有国内前缀的省市区）
            else if (trimmedDest.includes('/')) {
              destinations.value = [{
                locationType: 'domestic',
                destination: trimmedDest.split('/'),
                destinationDetail: '',
                foreignAddress: ''
              }];
            }
            // 默认当作国内地址处理
            else {
              destinations.value = [{
                locationType: 'domestic',
                destination: trimmedDest ? [trimmedDest] : '',
                destinationDetail: '',
                foreignAddress: ''
              }];
            }
          }
        }
        personnel.value = {
          id: res.personId,
          deptId: res.deptId || '',
          name: res.nickName || '',
          department: res.deptName || '',
          title: res.postName || '',
          position: res.nickName || '',
          level: res.level || '',
          professionalTitle: res.professionalTitle || '',
        };
      }
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败');
  }
};
const pickerOptions =(time) => {
  // 禁用今天之前的日期
  return time.getTime() < Date.now() - 8.64e7; // 8.64e7 是一天的毫秒数
};
// 限制在开始日期至结束日期范围内
const disabledDate = (time) => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return false;
  }
  
  const startDate = new Date(dateRange.value[0]);
  const endDate = new Date(dateRange.value[1]);
  
  // 移除时间部分，只比较日期
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  const currentDate = new Date(time);
  currentDate.setHours(0, 0, 0, 0);
  
  // 对于开始日期和结束日期，都不能超出主日期范围
  return currentDate < startDate || currentDate > endDate;
};
// 为调研事由的开始日期创建禁用函数
const disabledStartDate = (index, type) => {
  return (time) => {
    // 首先应用全局日期范围限制
    if (disabledDate(time)) {
      return true;
    }
    
    // 根据事由类型获取对应的结束日期
    let endDate;
    switch (type) {
      case 1:
        if (researchList.value && researchList.value[index]) {
          endDate = researchList.value[index].researchEndDate;
        }
        break;
      case 2:
        if (trainingList.value && trainingList.value[index]) {
          endDate = trainingList.value[index].trainingEndDate;
        }
        break;
      case 3:
        if (businessList.value && businessList.value[index]) {
          endDate = businessList.value[index].businessEndDate;
        }
        break;
      case 4:
        if (personalList.value && personalList.value[index]) {
          endDate = personalList.value[index].personalEndDate;
        }
        break;
      case 5:
        if (academicMeetings.value && academicMeetings.value[index]) {
          endDate = academicMeetings.value[index].academicEndDate;
        }
        break;
      default:
        return false;
    }

    // 如果已有结束日期，则不能选择晚于结束日期的时间
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      
      const currentDate = new Date(time);
      currentDate.setHours(0, 0, 0, 0);
      
      return currentDate > end;
    }
    
    return false;
  };
};

// 为调研事由的结束日期创建禁用函数
const disabledEndDate = (index, type) => {
  return (time) => {
    // 首先应用全局日期范围限制
    if (disabledDate(time)) {
      return true;
    }
    
    let startDate;
    switch (type) {
      case 1:
        if (researchList.value && researchList.value[index]) {
          startDate = researchList.value[index].researchStartDate;
        }
        break;
      case 2:
        if (trainingList.value && trainingList.value[index]) {
          startDate = trainingList.value[index].trainingStartDate;
        }
        break;
      case 3:
        if (businessList.value && businessList.value[index]) {
          startDate = businessList.value[index].businessStartDate;
        }
        break;
      case 4:
        if (personalList.value && personalList.value[index]) {
          startDate = personalList.value[index].personalStartDate;
        }
        break;
      case 5:
        if (academicMeetings.value && academicMeetings.value[index]) {
          startDate = academicMeetings.value[index].academicStartDate;
        }
        break;
      default:
        return false;
    }

    // 如果已有开始日期，则不能选择早于开始日期的时间
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const currentDate = new Date(time);
      currentDate.setHours(0, 0, 0, 0);
      
      return currentDate < start;
    }
    
    return false;
  };
};
/** 打开签办人选择 */
const openApprovalUserSelect = (taskKey: string) => {
  userSelectFormRef.value?.open(
    taskKey,
    personnel.value.deptId,
    startUserSelectAssignees.value[taskKey],
    personnel.value.id 
  );
}

/** 移除签办人 */
const handleRemoveApprovalUser = (user: UserVO, taskKey: string) => {
  if (isReadOnly.value) {
    return
  }
  startUserSelectAssignees.value[taskKey] = startUserSelectAssignees.value[taskKey].filter((u) => u.id !== user.id)
}


/** 用户选择确认 */
const handleUserSelectConfirm = (taskKey: string,users: UserVO[]) => {
  startUserSelectAssignees.value[taskKey] = users
}


// 指定审批人
const processDefineKey = 'oa_leaveRegister' // 流程定义 Key
const startUserSelectTasks = ref([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref({}) // 发起人选择审批人的数据
const startUserSelectAssigneesFormRef = ref() // 发起人选择审批人的表单 Ref
const startUserSelectAssigneesFormRules = ref({}) // 发起人选择审批人的表单 Rules
const userList = ref<Array<any>>([])
const bpmnXml = ref('')
const userSelectFormRef = ref() // 添加 ref 引用
const fetchProcessDefinition = async () => {
  try {
    //获取流程定义
    const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
      undefined,
      processDefineKey
    )
    if (!processDefinitionDetail) {
      ElMessage.error('请假申请的流程模型未配置，请检查！')
      return
    }

    //获取指定审批人
    if (processDefinitionDetail.bpmnXml) {
      bpmnXml.value = processDefinitionDetail.bpmnXml

      try {
        startUserSelectTasks.value = await parseHostSignTasks(bpmnXml.value)

        // 设置指定审批人
        if (startUserSelectTasks.value?.length > 0) {
          // 设置校验规则
          for (const userTask of startUserSelectTasks.value) {
            startUserSelectAssignees.value[userTask.id] = []
            startUserSelectAssigneesFormRules.value[userTask.id] = [
              { required: true, message: '请选择审批人', trigger: 'blur' }
            ]
          }
        }
      } catch (error) {
        ElMessage.error('解析流程定义失败，请联系管理员')
      }
    } else {
      ElMessage.error('流程定义数据不完整，请联系管理员')
    }
  } catch (error) {
    ElMessage.error('获取流程定义失败，请联系管理员')
  }
}
// 获取用户信息
onMounted(async () => {
// 加载用户列表
userList.value = await UserApi.getSimpleUserList()
await fetchProcessDefinition()
await fetchUserProfile()
})
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

/* .reason-options .el-checkbox:hover {
  background-color: #f0f7ff;
  display: flex;
  align-items: center;
} */

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

:deep(.el-textarea__inner) {
  background-color: #ffffff;
}
</style>
