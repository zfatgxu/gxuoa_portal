<template>
  <div class="document-approval" style="overflow-y: auto; height: 100vh;">
    <el-button
      :type="isFavorite ? 'danger' : 'primary'"
      size="default"
      @click="toggleFavorite"
      :title="isFavorite ? '取消收藏' : '收藏文档'"
      class="floating-fab"
    >
      {{ isFavorite ? '取消收藏' : '收藏' }}
    </el-button>

    <el-card class="box-card">
      <h1 class="table-title">{{ getDictLabel(DICT_TYPE.CIRCULATION_TEMPLATE_TYPE, formData.circulationTemplateType) }}</h1>
      <div class="document-table-container">
        <table class="document-table">
        <thead>
          <tr>
            <!-- 标题已移至表格外 -->
          </tr>
        </thead>
        <tbody>
          <!-- 校内呈文、校外来文和学校发文的共用头部信息 -->
          <template v-if="formData.circulationTemplateType === 1">
            <tr>
              <td class="table2">来文单位</td>
              <td class="table3">{{ formData.deptName }}</td>
              <td class="table2">来文字号</td>
              <td class="table3">{{ formData.documentNumber }}</td>
            </tr>
            <tr>
              <td class="table2">收文编号</td>
              <td class="table3">{{ formData.receiptNumber }}</td>
              <td class="table2">收文日期</td>
              <td class="table3">{{ formData.receiptTime }}</td>
            </tr>
            <tr>
              <td colspan="1" class="table2">文件名称:</td>
              <td colspan="3">
                <el-link class="table4" type="primary" @click="viewPresentationContent">{{ formData.documentName }}</el-link>
              </td>
            </tr>
          </template>
          <template v-if="formData.documentType === 3">
            <tr>
              <td colspan="4" class="table2">文件标题: <el-link class="table4" type="primary" @click="viewPresentationContent">{{ formData.documentName }}</el-link></td>
            </tr>
          </template>

          <!-- 纸质纪要文件申请的特有头部信息 -->
          <template v-if="formData.circulationTemplateType === 3">
            <tr>
              <td class="table2">申请单位</td>
              <td>{{ formData.deptName }}</td>
              <td class="table2">联系人</td>
              <td>{{ formData.contactPerson }}</td>
            </tr>
            <tr>
              <td class="table2">会议届次</td>
              <td colspan="3">{{ formData.documentName }}</td>
            </tr>
            <tr>
              <td class="table2">会议议题</td>
              <td colspan="3">{{ formData.meetingTopic }}</td>
            </tr>
            <tr>
              <td class="table2">申请事由</td>
              <td colspan="3">{{ formData.applicationReason }}</td>
            </tr>
          </template>

          <!-- 上面是共用的先不用修改 -->


          <!-- 校内呈文和校外来文共有的字段 -->
          <template v-if="formData.documentType === 1 || formData.documentType === 2">
          <tr>
            <td colspan="4" class="table2">校党政领导批示:
              <div class="document-input-container" v-if="formData.type === 0 || formData.messages.leaderApproval">
                <pre v-if="formData.messages.leaderApproval && formData.type === 0" class="document-preview-text">{{ formData.messages.leaderApproval }}</pre>
                <el-input
                  class="document-textarea"
                  v-model="leaderApprovalValue"
                  type="textarea"
                  autosize="{ minRows: 3 }"
                  resize="none"
                  placeholder="输入校党政领导批示"
                  :disabled="formData.type !== 0"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td colspan="4" class="table2">主要领导批示阅处:
              <div class="document-input-container" v-if="formData.type === 3 || formData.messages.mainLeaderApproval">
                <pre v-if="formData.messages.mainLeaderApproval && formData.type === 3" class="document-preview-text">{{ formData.messages.mainLeaderApproval }}</pre>
                <el-input
                  class="document-textarea"
                  v-model="mainLeaderApprovalValue"
                  type="textarea"
                  autosize="{ minRows: 3 }"
                  resize="none"
                  placeholder="输入主要领导批示阅处"
                  :disabled="formData.type !== 3"
                />
              </div>
            </td>
          </tr>

          <tr>
            <td colspan="4" class="table2">党办、校办办文情况:
              <div class="document-input-container" v-if="formData.type === 2 || formData.messages.documentHandling">
                <pre v-if="formData.messages.documentHandling && formData.type === 2" class="document-preview-text">{{ formData.messages.documentHandling }}</pre>
                <el-input
                  class="document-textarea"
                  v-model="documentHandlingValue"
                  type="textarea"
                  autosize="{ minRows: 3 }"
                  resize="none"
                  placeholder="输入党办、校办办文情况"
                  :disabled="formData.type !== 2"
                />
              </div>
            </td>
          </tr>
          <tr v-if="formData.type === 4 || formData.messages.jointSign">
            <td colspan="4" class="table2">会签:
              <div class="document-input-container">
                <pre v-if="formData.messages.jointSign && formData.type === 4" class="document-preview-text">{{ formData.messages.jointSign }}</pre>
                <el-input
                  class="document-textarea"
                  v-model="jointSignValue"
                  type="textarea"
                  autosize="{ minRows: 3 }"
                  resize="none"
                  placeholder="输入会签意见"
                  :disabled="formData.type !== 4"
                />
              </div>
            </td>
          </tr>

            <tr>
              <td colspan="4" class="table2">呈文单位负责人意见和签字:
                <div class="document-input-container" v-if="formData.type === 5 || formData.messages.unitLeaderSign">
                  <pre v-if="formData.messages.unitLeaderSign && formData.type === 5" class="document-preview-text">{{ formData.messages.unitLeaderSign }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="unitLeaderSignValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入呈文单位负责人意见和签字"
                    :disabled="formData.type !== 5"
                  />
                </div>
              </td>
            </tr>

            <!-- 校属单位处理情况 -->
            <tr>
              <td colspan="4" class="table2">
                校属单位处理情况：(如有需要，请另文请示或报告)
                <div class="document-input-container" v-if="formData.type === 6 || formData.messages.schoolUnitHandling">
                  <pre v-if="formData.messages.schoolUnitHandling && formData.type === 6" class="document-preview-text">{{ formData.messages.schoolUnitHandling }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="schoolUnitHandlingValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入校属单位处理情况"
                    :disabled="formData.type !== 6"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="1"  class="table2">传阅签名:</td>
              <td colspan="3">
                <div class="document-input-container" v-if="formData.type === 8 || formData.messages.circulation">
                  <pre v-if="formData.messages.circulation && formData.type === 8" class="document-preview-text">{{ formData.messages.circulation }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="circulationValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入传阅签名"
                    :disabled="formData.type !== 8"
                  />
                </div>
              </td>
            </tr>
          <tr>
            <td colspan="4" class="table2">办公室拟办意见:
              <div class="document-input-container" v-if="formData.type === 1 || formData.messages.officeOpinion">
                <pre v-if="formData.messages.officeOpinion && formData.type === 1" class="document-preview-text">{{ formData.messages.officeOpinion }}</pre>
                <el-input
                  class="document-textarea"
                  v-model="officeOpinionValue"
                  type="textarea"
                  autosize="{ minRows: 3 }"
                  resize="none"
                  placeholder="输入办公室拟办意见"
                  :disabled="formData.type !== 1"
                />
              </div>
            </td>
          </tr>

            <!-- 科室处理意见 -->
            <tr>
              <td colspan="4" class="table2">科室处理意见:
                <div class="document-input-container"  v-if="formData.type === 7 || formData.messages.departmentOpinion">
                  <pre v-if="formData.messages.departmentOpinion && formData.type === 7" class="document-preview-text">{{ formData.messages.departmentOpinion }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="departmentOpinionValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入科室处理意见"
                    :disabled="formData.type !== 7"
                  />
                </div>
              </td>
            </tr>


            <!-- 提交校办秘书岗 -->
            <tr v-if="formData.type === 9 || formData.messages.secretarySubmission">
              <td colspan="4" class="table2">提交校办秘书岗:
                <div class="document-input-container">
                  <pre v-if="formData.messages.secretarySubmission && formData.type === 9" class="document-preview-text">{{ formData.messages.secretarySubmission }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="secretarySubmissionValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入提交校办秘书岗意见"
                    :disabled="formData.type !== 9"
                  />
                </div>
              </td>
            </tr>

            <!-- 鉴印 -->
            <tr v-if="formData.type === 10 || formData.messages.seal">
              <td colspan="4" class="table2">鉴印:
                <div class="document-input-container">
                  <pre v-if="formData.messages.seal && formData.type === 10" class="document-preview-text">{{ formData.messages.seal }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="sealValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入鉴印意见"
                    :disabled="formData.type !== 10"
                  />
                </div>
              </td>
            </tr>

            <!-- 办结 -->
            <!-- <tr>
              <td colspan="4" class="table2">办结:
                <div class="document-input-container" v-if="formData.type === 11 || formData.messages.completed">
                  <pre v-if="formData.messages.completed && formData.type === 11" class="document-preview-text">{{ formData.messages.completed }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="completedValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入办结意见"
                    :disabled="formData.type !== 11"
                  />
                </div>
              </td>
            </tr> -->

            <!-- 退回修改 -->
            <tr>
              <td colspan="4" class="table2">退回修改:
                <div class="document-input-container" v-if="formData.type === 12 || formData.messages.returnModify">
                  <pre v-if="formData.messages.returnModify && formData.type === 12" class="document-preview-text">{{ formData.messages.returnModify }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="returnModifyValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入退回修改意见"
                    :disabled="formData.type !== 12"
                  />
                </div>
              </td>
            </tr>

            <!-- 阅知 -->
            <tr v-if="formData.type === 13 || formData.messages.known">
              <td colspan="4" class="table2">阅知:
                <div class="document-input-container">
                  <pre v-if="formData.messages.known && formData.type === 13" class="document-preview-text">{{ formData.messages.known }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="knownValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入阅知意见"
                    :disabled="formData.type !== 13"
                  />
                </div>
              </td>
            </tr>

            <!-- 填写建议列席会议单位 -->
            <tr v-if="formData.type === 14 || formData.messages.meetingUnits">
              <td colspan="4" class="table2">填写建议列席会议单位:
                <div class="document-input-container">
                  <pre v-if="formData.messages.meetingUnits && formData.type === 14" class="document-preview-text">{{ formData.messages.meetingUnits }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="meetingUnitsValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入建议列席会议单位"
                    :disabled="formData.type !== 14"
                  />
                </div>
              </td>
            </tr>

            <!-- 会前传阅 -->
            <tr v-if="formData.type === 15 || formData.messages.preCirculation">
              <td colspan="4" class="table2">会前传阅:
                <div class="document-input-container">
                  <pre v-if="formData.messages.preCirculation && formData.type === 15" class="document-preview-text">{{ formData.messages.preCirculation }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="preCirculationValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入会前传阅意见"
                    :disabled="formData.type !== 15"
                  />
                </div>
              </td>
            </tr>
          </template>





          <!-- 学校发文特有输入框和共有字段 -->
          <template v-if="formData.documentType === 3">
            <!-- 校党政领导批示 -->
            <tr v-if="formData.type === 0 || formData.messages.leaderApproval">
              <td colspan="4" class="table2">校党政领导批示:
                <div class="document-input-container">
                  <pre v-if="formData.messages.leaderApproval && formData.type === 0" class="document-preview-text">{{ formData.messages.leaderApproval }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="leaderApprovalValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入校党政领导批示"
                    :disabled="formData.type !== 0"
                  />
                </div>
              </td>
            </tr>

            <!-- 办文情况 -->
            <tr v-if="formData.type === 2 || formData.messages.documentHandling">
              <td colspan="4" class="table2">办文情况:
                <div class="document-input-container">
                  <pre v-if="formData.messages.documentHandling && formData.type === 2" class="document-preview-text">{{ formData.messages.documentHandling }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="documentHandlingValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入办文情况"
                    :disabled="formData.type !== 2"
                  />
                </div>
              </td>
            </tr>

            <!-- 签发 -->
            <tr>
              <td colspan="4" class="table2">签发:
                <div class="document-input-container" v-if="formData.type === 16 || formData.messages.issuing">
                  <pre v-if="formData.messages.issuing && formData.type === 16" class="document-preview-text">{{ formData.messages.issuing }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="issuingValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入签发意见"
                    :disabled="formData.type !== 16"
                  />
                </div>
              </td>
            </tr>

                        <!-- 分管领导审核 -->
            <tr>
              <td colspan="4" class="table2">分管领导审核:
                <div class="document-input-container" v-if="formData.type === 17 || formData.messages.deputyLeaderReview">
                  <pre v-if="formData.messages.deputyLeaderReview && formData.type === 17" class="document-preview-text">{{ formData.messages.deputyLeaderReview }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="deputyLeaderReviewValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入分管领导审核意见"
                    :disabled="formData.type !== 17"
                  />
                </div>
              </td>
            </tr>

            <!-- 校办核稿 -->
            <tr>
              <td colspan="4" class="table2">党办、校办核稿:
                <div class="document-input-container" v-if="formData.type === 18 || formData.messages.officeReview">
                  <pre v-if="formData.messages.officeReview && formData.type === 18" class="document-preview-text">{{ formData.messages.officeReview }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="officeReviewValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入校办核稿意见"
                    :disabled="formData.type !== 18"
                  />
                </div>
              </td>
            </tr>

            <!-- 会签 -->
            <tr>
              <td colspan="4" class="table2">会签:
                <div class="document-input-container" v-if="formData.type === 4 || formData.messages.jointSign">
                  <pre v-if="formData.messages.jointSign && formData.type === 4" class="document-preview-text">{{ formData.messages.jointSign }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="jointSignValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入会签意见"
                    :disabled="formData.type !== 4"
                  />
                </div>
              </td>
            </tr>

            <!-- 文件传阅 -->
            <tr v-if="formData.type === 8 || formData.messages.circulation">
              <td colspan="4" class="table2">传阅签名:
                <div class="document-input-container">
                  <pre v-if="formData.messages.circulation && formData.type === 8" class="document-preview-text">{{ formData.messages.circulation }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="circulationValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入传阅签名"
                    :disabled="formData.type !== 8"
                  />
                </div>
              </td>
            </tr>

            <!-- 提交校办秘书岗 -->
            <tr v-if="formData.type === 9 || formData.messages.secretarySubmission">
              <td colspan="4" class="table2">提交校办秘书岗:
                <div class="document-input-container">
                  <pre v-if="formData.messages.secretarySubmission && formData.type === 9" class="document-preview-text">{{ formData.messages.secretarySubmission }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="secretarySubmissionValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入提交校办秘书岗意见"
                    :disabled="formData.type !== 9"
                  />
                </div>
              </td>
            </tr>

            <!-- 鉴印 -->
            <tr>
              <td colspan="4" class="table2">鉴印:
                <div class="document-input-container" v-if="formData.type === 10 || formData.messages.seal">
                  <pre v-if="formData.messages.seal && formData.type === 10" class="document-preview-text">{{ formData.messages.seal }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="sealValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入鉴印意见"
                    :disabled="formData.type !== 10"
                  />
                </div>
              </td>
            </tr>

            <!-- 办结 -->
            <!-- <tr>
              <td colspan="4" class="table2">办结:
                <div class="document-input-container" v-if="formData.type === 11 || formData.messages.completed">
                  <pre v-if="formData.messages.completed && formData.type === 11" class="document-preview-text">{{ formData.messages.completed }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="completedValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入办结意见"
                    :disabled="formData.type !== 11"
                  />
                </div>
              </td>
            </tr> -->

            <!-- 退回修改 -->
            <tr v-if="formData.type === 12 || formData.messages.returnModify">
              <td colspan="4" class="table2">退回修改:
                <div class="document-input-container">
                  <pre v-if="formData.messages.returnModify && formData.type === 12" class="document-preview-text">{{ formData.messages.returnModify }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="returnModifyValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入退回修改意见"
                    :disabled="formData.type !== 12"
                  />
                </div>
              </td>
            </tr>

            <!-- 阅知 -->
            <tr v-if="formData.type === 13 || formData.messages.known">
              <td colspan="4" class="table2">阅知:
                <div class="document-input-container">
                  <pre v-if="formData.messages.known && formData.type === 13" class="document-preview-text">{{ formData.messages.known }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="knownValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入阅知意见"
                    :disabled="formData.type !== 13"
                  />
                </div>
              </td>
            </tr>

            <!-- 填写建议列席会议单位 -->
            <tr v-if="formData.type === 14 || formData.messages.meetingUnits">
              <td colspan="4" class="table2">填写建议列席会议单位:
                <div class="document-input-container">
                  <pre v-if="formData.messages.meetingUnits && formData.type === 14" class="document-preview-text">{{ formData.messages.meetingUnits }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="meetingUnitsValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入建议列席会议单位"
                    :disabled="formData.type !== 14"
                  />
                </div>
              </td>
            </tr>

            <!-- 会前传阅 -->
            <tr v-if="formData.type === 15 || formData.messages.preCirculation">
              <td colspan="4" class="table2">会前传阅:
                <div class="document-input-container">
                  <pre v-if="formData.messages.preCirculation && formData.type === 15" class="document-preview-text">{{ formData.messages.preCirculation }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="preCirculationValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入会前传阅意见"
                    :disabled="formData.type !== 15"
                  />
                </div>
              </td>
            </tr>

            <!-- 拟稿单位核稿 -->
            <tr>
              <td colspan="4" class="table2">拟稿单位核稿:
                <div class="document-input-container" v-if="formData.type === 19 || formData.messages.draftUnitReview">
                  <pre v-if="formData.messages.draftUnitReview && formData.type === 19" class="document-preview-text">{{ formData.messages.draftUnitReview }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="draftUnitReviewValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入拟稿单位核稿意见"
                    :disabled="formData.type !== 19"
                  />
                </div>
              </td>
            </tr>

            <!-- 发文 -->
            <tr>
              <td colspan="4" class="table2">发文:
                <div class="document-input-container" v-if="formData.type === 20 || formData.messages.documentIssue">
                  <pre v-if="formData.messages.documentIssue && formData.type === 20" class="document-preview-text">{{ formData.messages.documentIssue }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="documentIssueValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入发文意见"
                    :disabled="formData.type !== 20"
                  />
                </div>
              </td>
            </tr>
          </template>

          <!-- 纸质纪要文件申请特有字段 -->
          <template v-if="formData.documentType === 4">
            <!-- 校党政领导批示 -->
            <tr v-if="formData.type === 0 || formData.messages.leaderApproval">
              <td colspan="4" class="table2">校党政领导批示:
                <div class="document-input-container">
                  <pre v-if="formData.messages.leaderApproval && formData.type === 0" class="document-preview-text">{{ formData.messages.leaderApproval }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="leaderApprovalValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入校党政领导批示"
                    :disabled="formData.type !== 0"
                  />
                </div>
              </td>
            </tr>

            <!-- 呈文单位负责人签字 -->
            <tr>
              <td colspan="4" class="table2">呈文单位负责人签字:
                <div class="document-input-container" v-if="formData.type === 5 || formData.messages.unitLeaderSign">
                  <pre v-if="formData.messages.unitLeaderSign && formData.type === 5" class="document-preview-text">{{ formData.messages.unitLeaderSign }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="unitLeaderSignValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入呈文单位负责人签字"
                    :disabled="formData.type !== 5"
                  />
                </div>
              </td>
            </tr>

            <!-- 审核意见 -->
            <tr>
              <td colspan="4" class="table2">审核意见:
                <div class="document-input-container" v-if="formData.type === 21 || formData.messages.reviewOpinion">
                  <pre v-if="formData.messages.reviewOpinion && formData.type === 21" class="document-preview-text">{{ formData.messages.reviewOpinion }}</pre>
                  <el-input
                  class="document-textarea"
                    v-model="reviewOpinionValue"
                    type="textarea"
                    autosize="{ minRows: 3 }"
                  resize="none"
                    placeholder="输入审核意见"
                    :disabled="formData.type !== 21"
                  />
                </div>
              </td>
            </tr>
          </template>

          <!-- circulationTemplateType 为2的时候显示  -->
          <template v-if="formData.circulationTemplateType === 2">
            <tr>
              <td colspan="4" class="table2">拟稿单位核稿：{{ formData.draftUnitReview }}</td>
            </tr>
            <tr>
              <td colspan="2"  class="table2">拟稿单位：{{ formData.deptName }}</td>
              <td colspan="2" class="table2">拟稿人：{{ formData.drafter }}</td>
            </tr>
            <tr>
              <td colspan="4" class="table2">信息公开审查：
                <el-radio-group v-model="formData.publicityType">
                  <el-radio :label="1">主动公开</el-radio>
                  <el-radio :label="2">依申请公开</el-radio>
                  <el-radio :label="3">不予公开</el-radio>
                </el-radio-group>
              </td>
            </tr>
            <tr>
              <td colspan="4" class="table2">发文字号：〔{{ formData.documentNumber }}  〕 号 共印{{ formData.printCount }}份</td>
            </tr>

            <tr>
              <td colspan="4" class="table2">主送：{{ formData.mainRecipient }}</td>
            </tr>
            <tr>
              <td colspan="4" class="table2">抄送：{{ formData.ccRecipient }}</td>
            </tr>
            <tr>
              <td colspan="1" class="table2">录入：{{ formData.recorder }}</td>
              <td colspan="1" class="table2">校对：{{ formData.proofreader }}</td>
              <td colspan="1" class="table2">排版：{{ formData.layouter }}</td>
              <td colspan="1" class="table2">签印：{{ formData.issuer }}</td>
            </tr>
          </template>

          <!-- 显示当前界面二维码 -->
          <!-- <tr>
            <td colspan="4" class="table2">扫描查看：</td>
          </tr>
          <tr>
            <td colspan="4" class="text-center py-4">
              <div class="flex justify-center items-center">
                <Qrcode :text="currentPageUrl" :width="200" />
              </div>
              <div class="mt-2 text-gray-500 text-sm">扫描二维码查看当前文档</div>
            </td>
          </tr> -->

          <tr>
            <td colspan="4">
              <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; margin-right: 10px;">
                  <span style="margin-right: 10px;">下一步：</span>
                  <el-select v-model="formData.nextType" placeholder="请选择下一步操作" style="width: 180px;">
                    <el-option
                      v-for="item in getFilteredOptions()"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                
                <div style="display: flex; align-items: center;">
                  <span style="margin-right: 10px; margin-left: 20px;">签办人：</span>
                  <div class="inline-flex flex-wrap gap-2">
                    <div
                      v-for="user in selectedApprovalUsers"
                      :key="user.id"
                      class="bg-gray-100 h-35px rounded-3xl flex items-center pr-8px dark:color-gray-600 position-relative"
                    >
                      <el-avatar class="!m-5px" :size="28" v-if="user.avatar" :src="user.avatar" />
                      <el-avatar class="!m-5px" :size="28" v-else>
                        {{ user.nickname.substring(0, 1) }}
                      </el-avatar>
                      {{ user.nickname }}
                      <Icon
                        icon="ep:close"
                        class="ml-2 cursor-pointer hover:text-red-500"
                        @click="handleRemoveApprovalUser(user)"
                      />
                    </div>
                    <el-button type="primary" link @click="openApprovalUserSelect">
                      <Icon icon="ep:plus" />选择人员
                    </el-button>
                  </div>
                </div>
              </div>
                
              <div style="display: flex; justify-content: center; margin-top: 20px;">
                <el-button type="primary" @click="handleSubmit" v-hasPermi="['document:circulation:submit']">提交</el-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </el-card>
  </div>

  <!-- 用户选择弹窗 -->
  <UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelectConfirm" />
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import Qrcode from '@/components/Qrcode/src/Qrcode.vue'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { DocumentApi, DocumentInfoVO } from '@/api/document'
import documentFavoriteApi from '@/api/document/favorite'
import { useUserStore } from '@/store/modules/user'
import { useDictStoreWithOut } from '@/store/modules/dict'
import { UserVO } from '@/api/system/user'
import UserSelectForm from '@/components/UserSelectForm/index.vue'
import ContentWrap from '@/components/ContentWrap/src/ContentWrap.vue'
import Dialog from '@/components/Dialog/src/Dialog.vue'
import { waitForDebugger } from 'inspector'
import { set } from 'lodash-es'
import { Star, StarFilled } from '@element-plus/icons-vue'

// 获取字典存储实例
const dictStore = useDictStoreWithOut()


// 收藏相关
const isFavorite = ref(false)

const router = useRouter()
const route = useRoute()

// 检查是否已收藏
const checkIsFavorite = async () => {
  try {
    if (documentId.value) {
      const res = await documentFavoriteApi.isFavorite(documentId.value)
      if (res.code === 0) {
        isFavorite.value = res.data
        console.log('文档收藏状态:', isFavorite.value ? '已收藏' : '未收藏')
      }
    }
  } catch (error) {
    console.error('检查收藏状态失败', error)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  try {
    if (!documentId.value) {
      ElMessage.warning('文档ID不存在')
      return
    }

    if (isFavorite.value) {
      // 取消收藏
      const res = await documentFavoriteApi.cancelDocumentFavorite(documentId.value)
      if (res.code === 0) {
        isFavorite.value = false
        ElMessage.success('已取消收藏')
      }
    } else {
      // 添加收藏
      const res = await documentFavoriteApi.createDocumentFavorite({
        documentId: documentId.value
      })
      if (res.code === 0) {
        isFavorite.value = true
        ElMessage.success('收藏成功')
      }
    }
  } catch (error) {
    console.error('操作收藏失败', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 生成当前页面URL
const currentPageUrl = computed(() => {
  const origin = window.location.origin
  const path = router.resolve({
    name: route.name as string,
    params: route.params,
    query: route.query
  }).href
  return `${origin}${path}`
})

// 获取路由参数中的文档ID
const documentId = ref(Number(route.query.id) || 0)

// 用户选择相关
const selectedApprovalUsers = ref<UserVO[]>([])
const userSelectFormRef = ref()

// 表单数据
// 当前编辑的消息
const currentMessage = ref('');

const formData = reactive({
  id: undefined,
  documentName: '',
  deptId: undefined,
  deptName: '',
  circulationTemplateType: undefined,
  documentType:undefined,
  publicityType: 2, // 默认为依申请公开
  documentNumber: '',
  receiptNumber: '',
  receiptTime: '',
  // 新增字段
  draftUnitReview: '', // 拟稿单位核稿
  drafter: '', // 拟稿人
  printCount: 1, // 共印份数
  mainRecipient: '', // 主送
  ccRecipient: '', // 抄送
  recorder: '', // 录入人
  proofreader: '', // 校对人
  layouter: '', // 排版人
  issuer: '', // 签发人
  // 纸质纪要文件申请相关字段
  meetingTopic: '', // 会议议题
  applicationReason: '', // 申请事由
  collectionStatus: 0, // 领取状态，0-未领取，1-已领取
  contactPerson: '', // 联系人姓名及电话
  type: undefined,
  nextType: undefined,
  nextCheck: false, // 是否有操作下一步的权限
  circulationId: undefined,
  presentationContent: '', // 呈文内容
  messages: {
    leaderApproval: '', // 0-校党政领导批示
    officeOpinion: '', // 1-党办校办拟办意见
    documentHandling: '', // 2-办文情况
    mainLeaderApproval: '', // 3-主要领导批示阅处
    jointSign: '', // 4-会签
    unitLeaderSign: '', // 5-呈文单位负责人签字
    schoolUnitHandling: '', // 6-校属单位处理
    departmentOpinion: '', // 7-科室处理意见
    circulation: '', // 8-文件传阅
    secretarySubmission: '', // 9-提交校办秘书岗
    seal: '', // 10-鉴印
    completed: '', // 11-办结
    returnModify: '', // 12-退回修改
    known: '', // 13-阅知
    meetingUnits: '', // 14-填写建议列席会议单位
    preCirculation: '', // 15-会前传阅
    issuing: '', // 16-签发
    deputyLeaderReview: '', // 17-分管领导审核
    officeReview: '', // 18-校办核稿
    draftUnitReview: '', // 19-拟稿单位核稿
    documentIssue: '', // 20-发文
    reviewOpinion: '' // 21-审核意见
  },
  approvalUserIds: [] as number[]
});

// 处理表单项的computed属性
const leaderApprovalValue = computed({
  get: () => formData.type === 0 ? currentMessage.value : formData.messages.leaderApproval || '',
  set: (val) => formData.type === 0 ? currentMessage.value = val : formData.messages.leaderApproval = val
});

const mainLeaderApprovalValue = computed({
  get: () => formData.type === 3 ? currentMessage.value : formData.messages.mainLeaderApproval || '',
  set: (val) => formData.type === 3 ? currentMessage.value = val : formData.messages.mainLeaderApproval = val
});

const documentHandlingValue = computed({
  get: () => formData.type === 2 ? currentMessage.value : formData.messages.documentHandling || '',
  set: (val) => formData.type === 2 ? currentMessage.value = val : formData.messages.documentHandling = val
});

const unitLeaderSignValue = computed({
  get: () => formData.type === 5 ? currentMessage.value : formData.messages.unitLeaderSign || '',
  set: (val) => formData.type === 5 ? currentMessage.value = val : formData.messages.unitLeaderSign = val
});

const reviewOpinionValue = computed({
  get: () => formData.type === 21 ? currentMessage.value : formData.messages.reviewOpinion || '',
  set: (val) => formData.type === 21 ? currentMessage.value = val : formData.messages.reviewOpinion = val
});

const schoolUnitHandlingValue = computed({
  get: () => formData.type === 6 ? currentMessage.value : formData.messages.schoolUnitHandling || '',
  set: (val) => formData.type === 6 ? currentMessage.value = val : formData.messages.schoolUnitHandling = val
});

const circulationValue = computed({
  get: () => formData.type === 8 ? currentMessage.value : formData.messages.circulation || '',
  set: (val) => formData.type === 8 ? currentMessage.value = val : formData.messages.circulation = val
});

const officeOpinionValue = computed({
  get: () => formData.type === 1 ? currentMessage.value : formData.messages.officeOpinion || '',
  set: (val) => formData.type === 1 ? currentMessage.value = val : formData.messages.officeOpinion = val
});

const departmentOpinionValue = computed({
  get: () => formData.type === 7 ? currentMessage.value : formData.messages.departmentOpinion || '',
  set: (val) => formData.type === 7 ? currentMessage.value = val : formData.messages.departmentOpinion = val
});

const returnModifyValue = computed({
  get: () => formData.type === 12 ? currentMessage.value : formData.messages.returnModify || '',
  set: (val) => formData.type === 12 ? currentMessage.value = val : formData.messages.returnModify = val
});

const jointSignValue = computed({
  get: () => formData.type === 4 ? currentMessage.value : formData.messages.jointSign || '',
  set: (val) => formData.type === 4 ? currentMessage.value = val : formData.messages.jointSign = val
});

// 签发
const issuingValue = computed({
  get: () => formData.type === 16 ? currentMessage.value : formData.messages.issuing || '',
  set: (val) => formData.type === 16 ? currentMessage.value = val : formData.messages.issuing = val
});

// 分管领导审核
const deputyLeaderReviewValue = computed({
  get: () => formData.type === 17 ? currentMessage.value : formData.messages.deputyLeaderReview || '',
  set: (val) => formData.type === 17 ? currentMessage.value = val : formData.messages.deputyLeaderReview = val
});

// 校办核稿
const officeReviewValue = computed({
  get: () => formData.type === 18 ? currentMessage.value : formData.messages.officeReview || '',
  set: (val) => formData.type === 18 ? currentMessage.value = val : formData.messages.officeReview = val
});

// 拟稿单位核稿
const draftUnitReviewValue = computed({
  get: () => formData.type === 19 ? currentMessage.value : formData.messages.draftUnitReview || '',
  set: (val) => formData.type === 19 ? currentMessage.value = val : formData.messages.draftUnitReview = val
});

// 发文
const documentIssueValue = computed({
  get: () => formData.type === 20 ? currentMessage.value : formData.messages.documentIssue || '',
  set: (val) => formData.type === 20 ? currentMessage.value = val : formData.messages.documentIssue = val
});

// 提交校办秘书岗
const secretarySubmissionValue = computed({
  get: () => formData.type === 9 ? currentMessage.value : formData.messages.secretarySubmission || '',
  set: (val) => formData.type === 9 ? currentMessage.value = val : formData.messages.secretarySubmission = val
});

// 鉴印
const sealValue = computed({
  get: () => formData.type === 10 ? currentMessage.value : formData.messages.seal || '',
  set: (val) => formData.type === 10 ? currentMessage.value = val : formData.messages.seal = val
});

// 办结
const completedValue = computed({
  get: () => formData.type === 11 ? currentMessage.value : formData.messages.completed || '',
  set: (val) => formData.type === 11 ? currentMessage.value = val : formData.messages.completed = val
});

// 阅知
const knownValue = computed({
  get: () => formData.type === 13 ? currentMessage.value : formData.messages.known || '',
  set: (val) => formData.type === 13 ? currentMessage.value = val : formData.messages.known = val
});

// 填写建议列席会议单位
const meetingUnitsValue = computed({
  get: () => formData.type === 14 ? currentMessage.value : formData.messages.meetingUnits || '',
  set: (val) => formData.type === 14 ? currentMessage.value = val : formData.messages.meetingUnits = val
});

// 会前传阅
const preCirculationValue = computed({
  get: () => formData.type === 15 ? currentMessage.value : formData.messages.preCirculation || '',
  set: (val) => formData.type === 15 ? currentMessage.value = val : formData.messages.preCirculation = val
});

// 监听 type 变化
watch(() => formData.type, () => {
  // 当 type 变化时，清空当前消息
  currentMessage.value = ''
})

// 监听 documentType 变化
watch(() => formData.documentType, () => {
  // 当文档类型变化时，重置下一步选项
  formData.nextType = undefined
})

// 获取当前类型对应的消息 key
const getCurrentMessageKey = (type: number | null) => {
  if (type === null) return null;
  switch (type) {
    case 0:
      return 'leaderApproval';
    case 1:
      return 'officeOpinion';
    case 2:
      return 'documentHandling';
    case 3:
      return 'mainLeaderApproval';
    case 4:
      return 'jointSign';
    case 5:
      return 'unitLeaderSign';
    case 6:
      return 'schoolUnitHandling';
    case 7:
      return 'departmentOpinion';
    case 8:
      return 'circulation';
    case 9:
      return 'secretarySubmission';
    case 10:
      return 'seal';
    case 11:
      return 'completed';
    case 12:
      return 'returnModify';
    case 13:
      return 'known';
    case 14:
      return 'meetingUnits';
    case 15:
      return 'preCirculation';
    case 16:
      return 'issuing';
    case 17:
      return 'deputyLeaderReview';
    case 18:
      return 'officeReview';
    case 19:
      return 'draftUnitReview';
    case 20:
      return 'documentIssue';
    case 21:
      return 'reviewOpinion';
    default:
      return null;
  }
};

const formRef = ref()

const submit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 获取当前类型对应的消息 key
      const messageKey = getCurrentMessageKey(formData.type)
      if (messageKey && currentMessage.value) {
        // 将当前消息追加到历史数据中
        formData.messages[messageKey] = formData.messages[messageKey]
          ? formData.messages[messageKey] + '\n' + currentMessage.value
          : currentMessage.value

        // 清空当前消息
        currentMessage.value = ''

        // TODO: 调用保存 API
      }
    }
  })
}

// 获取文档信息
const getDocumentInfo = async () => {
  try {
    const isTodo = Number(route.query.isTodo || '1')
    const response = await DocumentApi.getDocumentInfo(documentId.value, { isTodo })
    const data = response.data
    if (data) {
      console.log('Document data:', data) // 添加日志
      // 设置基本信息
      formData.id = data.id
      formData.documentName = data.documentName
      formData.deptId = data.deptId
      formData.deptName = data.deptName
      formData.documentNumber = data.documentNumber
      formData.receiptNumber = data.receiptNumber
      formData.receiptTime = formatDate(data.receiptTime) // 格式化时间戳
      formData.circulationId = data.circulationId
      formData.documentType = data.documentType
      formData.presentationContent = data.presentationContent || '' // 设置呈文内容
      // 根据 documentType 给 circulationTemplateType 赋值
      if (data.documentType === 1 || data.documentType === 2) {
        formData.circulationTemplateType = 1
      } else if (data.documentType === 3) {
        formData.circulationTemplateType = 2
      } else if (data.documentType === 4) {
        formData.circulationTemplateType = 3 // 纸质纪要文件申请使用模板1
      } else {
        formData.circulationTemplateType = data.circulationTemplateType // 如果不符合条件，使用原始值
      }
      // 设置当前文件的公开类型
      formData.publicityType = data.publicityType || 2 // 如果后端没有返回，默认为依申请公开

      // 设置新增字段
      formData.draftUnitReview = data.draftUnitReview || '' // 拟稿单位核稿
      formData.drafter = data.drafter || '' // 拟稿人
      formData.printCount = data.printCount || 1 // 共印份数
      formData.mainRecipient = data.mainRecipient || '' // 主送
      formData.ccRecipient = data.ccRecipient || '' // 抄送
      formData.recorder = data.recorder || '' // 录入人
      formData.proofreader = data.proofreader || '' // 校对人
      formData.layouter = data.layouter || '' // 排版人
      formData.issuer = data.issuer || '' // 签发人

      // 设置纸质纪要文件申请相关字段
      formData.meetingTopic = data.meetingTopic || '' // 会议议题
      formData.applicationReason = data.applicationReason || '' // 申请事由
      formData.collectionStatus = data.collectionStatus || 0 // 领取状态
      formData.contactPerson = data.contactPerson || '' // 联系人姓名及电话

      formData.type = data.type // 设置当前类型
      formData.nextType = data.nextType || formData.type // 设置下一步类型，如果没有则使用当前类型
      formData.nextCheck = data.nextCheck || false // 设置是否显示签办人选择，如果后端没有返回则默认为false

      //给当前可编辑的文本框赋予初值
      if (data.circulationList && Array.isArray(data.circulationList)) {
        const currentUser = useUserStore().getUser.nickname; // 获取当前用户名
        console.log("currentUser:"+currentUser)
        console.log("formData:"+formData.type)
        const draftRecord = data.circulationList.find(item =>
          item.userName === currentUser &&
          item.type === Number(formData.type) &&
          item.status === 1
        );
        console.log(draftRecord)
        if (draftRecord && draftRecord.message) {
          // 直接设置当前消息框的值
          currentMessage.value = draftRecord.message;
          console.log('Draft message:', draftRecord.message);
          console.log('Current message value:', currentMessage.value);

          // 强制更新对应的输入框
          // 根据当前类型直接更新对应的计算属性
          nextTick(() => {
            switch (Number(formData.type)) {
              case 0:
                // 强制触发leaderApprovalValue的setter
                leaderApprovalValue.value = draftRecord.message;
                break;
              case 1:
                officeOpinionValue.value = draftRecord.message;
                break;
              case 2:
                documentHandlingValue.value = draftRecord.message;
                break;
              case 3:
                mainLeaderApprovalValue.value = draftRecord.message;
                break;
              case 4:
                jointSignValue.value = draftRecord.message;
                break;
              case 5:
                unitLeaderSignValue.value = draftRecord.message;
                break;
              case 6:
                schoolUnitHandlingValue.value = draftRecord.message;
                break;
              case 7:
                departmentOpinionValue.value = draftRecord.message;
                break;
              case 8:
                circulationValue.value = draftRecord.message;
                break;
              case 12:
                returnModifyValue.value = draftRecord.message;
                break;
              case 16:
                issuingValue.value = draftRecord.message;
                break;
              case 17:
                deputyLeaderReviewValue.value = draftRecord.message;
                break;
              case 18:
                officeReviewValue.value = draftRecord.message;
                break;
              case 19:
                draftUnitReviewValue.value = draftRecord.message;
                break;
              case 20:
                documentIssueValue.value = draftRecord.message;
                break;
              case 21:
                reviewOpinionValue.value = draftRecord.message;
                break;
            }
            console.log('已强制更新输入框，类型:', formData.type);
          });
        }
      }

      // 处理签办记录
      if (data.circulationList && Array.isArray(data.circulationList)) {
        data.circulationList.forEach(item => {
          // 对于相同type的多条记录，将message合并
          let message = item.message?.trim() || ''
          if (!message || item.status === 1) return // 如果message为空，或者未提交则跳过
          const sign = '\n\t' + item.userName + '\n\t' + item.updateTime
          message = message + sign
          switch (item.type) {
            case 0:
              formData.messages.leaderApproval = formData.messages.leaderApproval
                ? formData.messages.leaderApproval + '\n' + message
                : message;
              break;
            case 1:
              formData.messages.officeOpinion = formData.messages.officeOpinion
                ? formData.messages.officeOpinion + '\n' + message
                : message;
              break;
            case 2:
              formData.messages.documentHandling = formData.messages.documentHandling
                ? formData.messages.documentHandling + '\n' + message
                : message;
              break;
            case 3:
              formData.messages.mainLeaderApproval = formData.messages.mainLeaderApproval
                ? formData.messages.mainLeaderApproval + '\n' + message
                : message;
              break;
            case 4:
              formData.messages.jointSign = formData.messages.jointSign
                ? formData.messages.jointSign + '\n' + message
                : message;
              break;
            case 5:
              formData.messages.unitLeaderSign = formData.messages.unitLeaderSign
                ? formData.messages.unitLeaderSign + '\n' + message
                : message;
              break;
            case 6:
              formData.messages.schoolUnitHandling = formData.messages.schoolUnitHandling
                ? formData.messages.schoolUnitHandling + '\n' + message
                : message;
              break;
            case 7:
              formData.messages.departmentOpinion = formData.messages.departmentOpinion
                ? formData.messages.departmentOpinion + '\n' + message
                : message;
              break;
            case 8:
              formData.messages.circulation = formData.messages.circulation
                ? formData.messages.circulation + '\n' + message
                : message;
              break;
            case 9:
              formData.messages.secretarySubmission = formData.messages.secretarySubmission
                ? formData.messages.secretarySubmission + '\n' + message
                : message;
              break;
            case 10:
              formData.messages.seal = formData.messages.seal
                ? formData.messages.seal + '\n' + message
                : message;
              break;
            case 11:
              formData.messages.completed = formData.messages.completed
                ? formData.messages.completed + '\n' + message
                : message;
              break;
            case 12:
              formData.messages.returnModify = formData.messages.returnModify
                ? formData.messages.returnModify + '\n' + message
                : message;
              break;
            case 13:
              formData.messages.known = formData.messages.known
                ? formData.messages.known + '\n' + message
                : message;
              break;
            case 14:
              formData.messages.meetingUnits = formData.messages.meetingUnits
                ? formData.messages.meetingUnits + '\n' + message
                : message;
              break;
            case 15:
              formData.messages.preCirculation = formData.messages.preCirculation
                ? formData.messages.preCirculation + '\n' + message
                : message;
              break;
            case 16:
              formData.messages.issuing = formData.messages.issuing
                ? formData.messages.issuing + '\n' + message
                : message;
              break;
            case 17:
              formData.messages.deputyLeaderReview = formData.messages.deputyLeaderReview
                ? formData.messages.deputyLeaderReview + '\n' + message
                : message;
              break;
            case 18:
              formData.messages.officeReview = formData.messages.officeReview
                ? formData.messages.officeReview + '\n' + message
                : message;
              break;
            case 19:
              formData.messages.draftUnitReview = formData.messages.draftUnitReview
                ? formData.messages.draftUnitReview + '\n' + message
                : message;
              break;
            case 20:
              formData.messages.documentIssue = formData.messages.documentIssue
                ? formData.messages.documentIssue + '\n' + message
                : message;
              break;
            case 21:
              formData.messages.reviewOpinion = formData.messages.reviewOpinion
                ? formData.messages.reviewOpinion + '\n' + message
                : message;
              break;
          }
        })
      }
    }
  } catch (error) {
    console.error('获取文档信息失败:', error)
    ElMessage.error('获取文档信息失败')
  }
}

// 页面加载时获取文档信息
onMounted(() => {
  if (documentId.value) {
    getDocumentInfo()
  }
  checkIsFavorite()
})

// 初始化选中的用户
watch(
  () => formData.approvalUserIds,
  (newVal) => {
    if (newVal?.length) {
      // TODO: 从后端获取用户列表
      // selectedApprovalUsers.value = userList.filter((user: UserVO) =>
      //   newVal.includes(user.id)
      // ) as UserVO[]
    } else {
      selectedApprovalUsers.value = []
    }
  },
  {
    immediate: true
  }
)

/** 打开签办人选择 */
const openApprovalUserSelect = () => {
  userSelectFormRef.value.open(0, selectedApprovalUsers.value)
}

/** 移除签办人 */
const handleRemoveApprovalUser = (user: UserVO) => {
  const index = formData.approvalUserIds.indexOf(user.id)
  if (index !== -1) {
    formData.approvalUserIds.splice(index, 1)
    selectedApprovalUsers.value = selectedApprovalUsers.value.filter((u) => u.id !== user.id)
  }
}

/** 用户选择确认 */
const handleUserSelectConfirm = (_, users: UserVO[]) => {
  selectedApprovalUsers.value = users
  formData.approvalUserIds = users.map((user) => user.id)
}

const handleSave = async () => {
  try {
    // 获取当前类型对应的消息
    const messageKey = getCurrentMessageKey(formData.type);
    if (formData.type != null || formData.type != undefined) {
      if (!messageKey || !currentMessage.value) {
        ElMessage.warning('请输入签办信息');
        return;
      }

    // 验证下一步选项是否符合当前文档类型
    // if (formData.nextType !== null) {
    //   const filteredOptions = getFilteredOptions();
    //   const validNextTypes = filteredOptions.map(option => option.value);
    //   if (!validNextTypes.includes(formData.nextType)) {
    //     ElMessage.warning('请选择符合当前文档类型的下一步操作');
    //     return;
    //   }
    // }

    // 构建请求数据
    const data = {
      id: formData.id,
      circulationId: formData.circulationId,
      message: currentMessage.value,
      type: formData.type,
  //    nextType: formData.nextType !== null ? Number(formData.nextType) : 0,
      // 新增字段
      publicityType: formData.publicityType,
      draftUnitReview: formData.draftUnitReview,
      drafter: formData.drafter,
      printCount: formData.printCount,
      mainRecipient: formData.mainRecipient,
      ccRecipient: formData.ccRecipient,
      recorder: formData.recorder,
      proofreader: formData.proofreader,
      layouter: formData.layouter,
      issuer: formData.issuer,
      // 纸质纪要文件申请相关字段
      meetingTopic: formData.meetingTopic,
      applicationReason: formData.applicationReason,
      collectionStatus: formData.collectionStatus,
      contactPerson: formData.contactPerson,
      ids: []
    };

    // 调用保存接口
    await DocumentApi.saveDocumentMessage(data);

    // 保存成功后，更新本地数据
    formData.messages[messageKey] = formData.messages[messageKey]
      ? formData.messages[messageKey] + '\n' + currentMessage.value
      : currentMessage.value;

    // 清空当前消息
    currentMessage.value = '';

    ElMessage.success('保存成功');

    // 关闭当前窗口
    setTimeout(() => {
      window.close()
    }, 1000)
    } else {
      window.close()
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  }
}

const handleSubmit = async () => {
  try {
    if (formData.nextType === null || formData.nextType === undefined) {
      ElMessage.warning('请选择下一步事项');
      return;
    }

    // 验证下一步选项是否符合当前文档类型
    const filteredOptions = getFilteredOptions();
    const validNextTypes = filteredOptions.map(option => option.value);
    if (!validNextTypes.includes(formData.nextType)) {
      ElMessage.warning('请选择符合当前文档类型的下一步操作');
      return;
    }

    if (!formData.approvalUserIds || formData.approvalUserIds.length === 0) {
      ElMessage.warning('请选择签办人');
      return;
    }

    // 获取当前类型对应的消息
    const messageKey = getCurrentMessageKey(formData.type);
    // if (!messageKey || !currentMessage.value) {
    //   ElMessage.warning('请输入签办信息');
    //   return;
    // }

    // 构建请求数据
    const data = {
      id: formData.id,
      circulationId: formData.circulationId,
      message: currentMessage.value,
      type: formData.type,
      nextType: formData.nextType,
      approvalUserIds: formData.approvalUserIds,
      // 新增字段
      publicityType: formData.publicityType,
      draftUnitReview: formData.draftUnitReview,
      drafter: formData.drafter,
      printCount: formData.printCount,
      mainRecipient: formData.mainRecipient,
      ccRecipient: formData.ccRecipient,
      recorder: formData.recorder,
      proofreader: formData.proofreader,
      layouter: formData.layouter,
      issuer: formData.issuer,
      ids: formData.approvalUserIds || []
    };

    // 保存当前消息到本地数据
    formData.messages[messageKey] = formData.messages[messageKey]
      ? formData.messages[messageKey] + '\n' + currentMessage.value
      : currentMessage.value;

    // 根据文档类型进行不同的处理
    if (formData.documentType === 3 && [16, 17, 18, 19, 20].includes(formData.type)) {
      // 学校发文特有的处理逻辑
      console.log('学校发文提交处理，类型:', formData.type);
    } else if ((formData.documentType === 1 || formData.documentType === 2) && formData.type === 5) {
      // 校内呈文特有的处理逻辑
      console.log('校内呈文提交处理，类型:', formData.type);
    }

    // 调用提交接口
    const res = await DocumentApi.saveDocumentMessage(data);
    if (res.code === 0) {
      ElMessage.success('提交成功');
      // 跳转到我的文档页面
      //router.push('/document/myDocument');
      // setTimeout(() => {
    //   window.close()
    // }, 1000)
    // 如果是从待办列表打开的，刷新父窗口的列表
    if (window.opener && !window.opener.closed) {
        try {
          // 通知父窗口刷新列表
          window.opener.postMessage({ type: 'refreshTodoList' }, '*');
          console.log('已发送刷新列表消息到父窗口');
          
          // 延迟关闭当前窗口
          setTimeout(() => {
            window.close();
          }, 1500);
        } catch (e) {
          console.error('通知父窗口刷新失败:', e);
        }
      }
    } else {
      ElMessage.error(res.msg || '提交失败');
    }
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('提交失败');
  }
}

const handleCancel = () => {
  //router.back()
  window.close()
}

// 根据documentType过滤下拉框选项
const getFilteredOptions = () => {
  const allOptions = getIntDictOptions(DICT_TYPE.CIRCULATION_TYPE);
  console.log('DICT_TYPE.CIRCULATION_TYPE:', DICT_TYPE.CIRCULATION_TYPE);
  console.log('allOptions:', allOptions);
  console.log('documentType:', formData.documentType);

  // 根据documentType过滤选项
  if (formData.documentType === 1) { // 校内呈文
    // 校内呈文包含所有 0-15 的选项，包括呈文单位负责人签字(5)
    return allOptions.filter(option => [
      0,  // 校党政领导批示
      1,  // 党办校办拟办意见
      2,  // 办文情况
      3,  // 主要领导批示阅处
      4,  // 会签
      5,  // 呈文单位负责人签字
      6,  // 校属单位处理
      7,  // 科室处理意见
      8,  // 文件传阅
      9,  // 提交校办秘书岗
      10, // 鉴印
      11, // 办结
      12, // 退回修改
      13, // 阅知
      14, // 填写建议列席会议单位
      15  // 会前传阅
    ].includes(option.value));
  } else if (formData.documentType === 2) { // 校外来文
    return allOptions.filter(option => [
      0,  // 校党政领导批示
      1,  // 党办校办拟办意见
      2,  // 办文情况
      3,  // 主要领导批示阅处
      4,  // 会签

      6,  // 校属单位处理
      7,  // 科室处理意见
      8,  // 文件传阅
      9,  // 提交校办秘书岗
      10, // 鉴印
      11, // 办结
      12, // 退回修改
      13, // 阅知
      14, // 填写建议列席会议单位
      15  // 会前传阅
    ].includes(option.value));
  } else if (formData.documentType === 3) { // 学校发文
    // 学校发文包含传阅相关选项和发文特有选项
    return allOptions.filter(option => [
      0,  // 校党政领导批示
      2,  // 办文情况
      4,  // 会签
      8,  // 文件传阅
      9,  // 提交校办秘书岗
      10, // 鉴印
      11, // 办结
      12, // 退回修改
      13, // 阅知
      14, // 填写建议列席会议单位
      15, // 会前传阅
      16, // 签发
      17, // 分管领导审核
      18, // 校办核稿
      19, // 拟稿单位核稿
      20  // 发文
    ].includes(option.value));
  } else if (formData.documentType === 4) { // 纸质纪要文件申请
    // 纸质纪要文件申请显示校党政领导批示和审核意见
    return allOptions.filter(option => [
      0,  // 校党政领导批示
      5,  // 呈文单位负责人签字
      21  // 审核意见
    ].includes(option.value));
  }

  return allOptions; // 默认返回所有选项
}

// 查看呈文详细内容
const viewPresentationContent = () => {
  if (formData.id) {
    router.push(`/document/document/presentation-view/${formData.id}`)
  } else {
    ElMessage.warning('呈文内容不存在')
  }
}
</script>

<style scoped>
@import "@/styles/document.css";
/* 使用公共样式文件，只需添加特定于此组件的样式 */
</style>
