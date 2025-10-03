<template>
  <ContentWrap>
    <div class="supervision-order-detail" ref="detailFormEl">
      <!-- 页面标题 - 移到表格外面 -->
      <div class="page-header-outside">
        <h1 class="form-title">{{ getPageTitle() }}</h1>
      </div>



      <!-- 督办单详情表单 -->
      <div class="order-form-container" v-loading="loading" element-loading-text="正在加载数据...">
        
        <!-- 拟变更预览区域 - 仅在审批节点显示 -->
        <div v-if="showChangePreview" class="change-preview-container">
          <div class="change-preview-header">
            <el-icon><EditPen /></el-icon>
            <span>拟变更预览</span>
          </div>
          <div class="change-preview-content">
            <!-- 表格形式显示变更内容 -->
            <el-table v-if="changePreviewRows.length > 0" :data="changePreviewRows" class="change-preview-table" border>
              <el-table-column prop="label" label="字段" width="120" />
              <el-table-column prop="oldDisplay" label="原内容" min-width="200" />
              <el-table-column prop="newDisplay" label="变更内容" min-width="200" />
            </el-table>
            
            <!-- 操作按钮区域 -->
            <div v-if="changePreviewRows.length > 0 && canOperateInPreview" class="change-preview-actions">
              <el-button type="success" @click="(e) => handleApproveFromPreview(e)">
                <el-icon><Select /></el-icon>
                通过
              </el-button>
              <el-button type="danger" @click="(e) => handleRejectFromPreview(e)">
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
            </div>
            
            <div v-if="changePreviewRows.length === 0" class="no-change">
              <el-icon><InfoFilled /></el-icon>
              <span>暂无变更</span>
            </div>
          </div>
        </div>

        <!-- 最新动态区域 - 使用与拟变更预览相同的样式框架 -->
        <div v-if="progressRecords.length > 0 && progressRecords[0].isLatest" class="change-preview-container">
          <div class="change-preview-header">
            <el-icon><StarFilled /></el-icon>
            <span>最新动态</span>
          </div>
          <div class="change-preview-content">
            <div class="progress-record-item">
              <div class="progress-record-dot">
                <div class="dot-inner"></div>
              </div>
              <div class="progress-record-content">
                <div class="progress-record-title">
                  <Icon icon="ep:user" class="user-icon" />
                  {{ progressRecords[0].title }}
                  <span class="progress-record-handler" v-if="progressRecords[0].handler">{{ progressRecords[0].handler }}</span>
                  <span v-if="progressRecords[0].expectedTime" class="progress-record-expected-time">
                    <Icon icon="ep:calendar" class="calendar-icon" />
                    预计完成时间：{{ progressRecords[0].expectedTime }}
                  </span>
                </div>
                <div class="progress-record-time">
                  <Icon icon="ep:clock" class="time-icon" />
                  {{ progressRecords[0].time }}
                </div>
                <!-- 原始 description 仅在非计划摘要时显示 -->
                <div v-if="progressRecords[0].description && !shouldShowPlanSummary(progressRecords[0])" class="progress-record-description">
                  {{ progressRecords[0].description }}
                </div>
                
                <!-- 计划摘要显示（纯文本，无样式） -->
                <div v-if="shouldShowPlanSummary(progressRecords[0])" class="plan-summary-simple">
                  <div v-for="(item, index) in getSimplePlanSummary(progressRecords[0])" :key="index" class="summary-item">
                    <div class="summary-line-with-file">
                      <span class="summary-text-inline">{{ item.text }}</span>
                      <div v-if="item.file" class="summary-file-inline">
                        <el-link @click="previewProgressFile(item.file)" type="primary" class="file-preview-link">
                          <Icon icon="ep:document" />
                          {{ item.file.name }}
                        </el-link>
                        <el-link :href="getFileUrl(item.file)" target="_blank" type="primary" class="file-download-link">
                          <Icon icon="ep:download" />
                        </el-link>
                      </div>
                    </div>
                  </div>
                  <div v-if="hasMorePlans(progressRecords[0])" class="summary-more-simple">
                    ...
                    <el-link type="primary" @click="showViewAllPlansForRecord(progressRecords[0])" style="margin-left: 8px;">
                      查看全部计划
                    </el-link>
                  </div>
                </div>
                
                <!-- 单行计划记录（implement_plan）也显示查看全部计划链接 -->
                <div v-if="isPlanLikeRecord(progressRecords[0])" class="single-plan-view-all">
                  <el-link type="primary" @click="showViewAllPlansForRecord(progressRecords[0])">
                    查看全部计划
                  </el-link>
                </div>
                
                <div class="progress-record-description" v-if="progressRecords[0].remark && progressRecords[0].recordType !== 'implement_plan_audit'">
                  <strong>领导批示：</strong>{{ progressRecords[0].remark }}
                </div>
                <!-- 原始附件仅在非计划摘要时显示 -->
                <div v-if="progressRecords[0].attachments && progressRecords[0].attachments.length > 0 && !shouldShowPlanSummary(progressRecords[0])" class="progress-record-attachments">
                  <div class="attachments-list">
                    <div v-for="file in progressRecords[0].attachments" :key="file.id || file.name" class="progress-attachment-item">
                      <Icon icon="ep:document" class="attachment-icon" />
                      <span class="attachment-name" @click="previewProgressFile(file)">{{ file.name }}</span>
                      <Icon icon="ep:download" class="attachment-download-btn" @click="downloadProgressFile(file)" title="下载文件" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 表单主体 -->
        <el-form
          :model="orderDetail"
          class="order-form"
        >
          <!-- 表格式布局 -->
          <div class="form-table">
            <!-- 督办编号行 -->
            <div class="form-row">
              <div class="form-content full-width order-number-content">
                <span class="order-number-label">{{ getOrderNumberLabel() }}：</span>
                <span class="order-number-display">{{ orderDetail.orderCode || '未生成' }}</span>
              </div>
            </div>

            <!-- 督办事项 -->
            <div class="form-row">
              <div class="form-label">督办事项</div>
              <div class="form-content full-width">
                <el-input 
                  v-if="canEditOrderTitle"
                  v-model="editForm.orderTitle"
                  placeholder="请输入督办事项"
                  maxlength="100"
                  show-word-limit
                />
                <el-input v-else :value="orderDetail.orderTitle" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 主要内容 -->
            <div class="form-row">
              <div class="form-label">主要内容</div>
              <div class="form-content full-width">
                <el-input
                  v-if="canEditContent"
                  v-model="editForm.content"
                  type="textarea"
                  placeholder="请输入主要内容"
                  :autosize="{ minRows: 4 }"
                  maxlength="2000"
                  show-word-limit
                />
                <el-input
                  v-else
                  type="textarea"
                  :model-value="orderDetail.content"
                  readonly
                  class="readonly-display"
                  :autosize="{ minRows: 4 }"
                />
              </div>
            </div>

            <!-- 督办分类和紧急程度 -->
            <div class="form-row">
              <div class="form-label">督办分类</div>
              <div class="form-content half-width">
                <el-select
                  v-if="canEditType"
                  v-model="editForm.detailType"
                  placeholder="请选择督办分类"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in typeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-input v-else :value="getDetailTypeDisplayName()" readonly class="readonly-display" />
              </div>
              <div class="form-label">紧急程度</div>
              <div class="form-content half-width">
                <el-select
                  v-if="canEditPriority"
                  v-model="editForm.priority"
                  placeholder="请选择紧急程度"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in priorityOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-input v-else :value="getPriorityName(orderDetail.priority)" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 完成期限和办理单位进度报告频次 -->
            <div class="form-row">
              <div class="form-label">完成期限</div>
              <div class="form-content half-width">
                <el-date-picker
                  v-if="canEditDeadline"
                  v-model="editForm.deadline"
                  type="datetime"
                  placeholder="请选择完成期限"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                  :disabled-date="disabledDeadlineDate"
                  :disabled-hours="disabledDeadlineHours"
                  :disabled-minutes="disabledDeadlineMinutes"
                  :default-time="defaultDeadlineTime"
                />
                <el-input v-else :value="formatDate(orderDetail.deadline)" readonly class="readonly-display" />
              </div>
              <div class="form-label long-label">办理单位进度报告频次</div>
              <div class="form-content half-width">
                <el-select
                  v-if="canEditReportFrequency"
                  v-model="editForm.reportFrequency"
                  placeholder="请选择办理单位进度报告频次"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="option in reportFrequencyOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-input v-else :value="getReportFrequencyName(orderDetail.reportFrequency)" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 校领导（合并显示：督查办分管校领导 + 办理单位分管校领导 + 其他校领导） -->
            <div class="form-row">
              <div class="form-label">校领导</div>
              <div class="form-content full-width">
                <el-input :value="getAllLeadersDisplay()" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 拟调整部门预览（仅在审核节点显示） -->
            <div v-if="showDeptChangePreview" class="form-row dept-change-preview">
              <div class="form-label">拟调整预览</div>
              <div class="form-content full-width">
                <div class="dept-change-container">
                  <el-alert
                    title="督办人申请调整办理/协办单位，请审核"
                    type="warning"
                    :closable="false"
                    show-icon
                    class="dept-change-alert"
                  />
                  <div class="dept-change-details">
                    <!-- 办理单位变更 -->
                    <div v-if="deptChangePreview.leadDeptChanged" class="change-item">
                      <div class="change-label">办理单位调整：</div>
                      <div class="change-content">
                        <div class="change-from">
                          <span class="change-title">当前：</span>
                          <template v-if="deptChangePreview.currentLeadDepts.length > 0">
                            <el-tag
                              v-for="dept in deptChangePreview.currentLeadDepts"
                              :key="dept"
                              type="info"
                              size="small"
                              class="dept-tag-small"
                            >
                              {{ dept }}
                            </el-tag>
                          </template>
                          <span v-else class="no-dept">无</span>
                        </div>
                        <div class="change-arrow">→</div>
                        <div class="change-to">
                          <span class="change-title">拟调整为：</span>
                          <template v-if="deptChangePreview.newLeadDepts.length > 0">
                            <el-tag
                              v-for="dept in deptChangePreview.newLeadDepts"
                              :key="dept"
                              type="success"
                              size="small"
                              class="dept-tag-small"
                            >
                              {{ dept }}
                            </el-tag>
                          </template>
                          <span v-else class="no-dept">无</span>
                        </div>
                      </div>
                    </div>
                    <!-- 协办单位变更 -->
                    <div v-if="deptChangePreview.coDeptChanged" class="change-item">
                      <div class="change-label">协办单位调整：</div>
                      <div class="change-content">
                        <div class="change-from">
                          <span class="change-title">当前：</span>
                          <template v-if="deptChangePreview.currentCoDepts.length > 0">
                            <el-tag
                              v-for="dept in deptChangePreview.currentCoDepts"
                              :key="dept"
                              type="info"
                              size="small"
                              class="dept-tag-small"
                            >
                              {{ dept }}
                            </el-tag>
                          </template>
                          <span v-else class="no-dept">无</span>
                        </div>
                        <div class="change-arrow">→</div>
                        <div class="change-to">
                          <span class="change-title">拟调整为：</span>
                          <template v-if="deptChangePreview.newCoDepts.length > 0">
                            <el-tag
                              v-for="dept in deptChangePreview.newCoDepts"
                              :key="dept"
                              type="success"
                              size="small"
                              class="dept-tag-small"
                            >
                              {{ dept }}
                            </el-tag>
                          </template>
                          <span v-else class="no-dept">无</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 办理单位和协办单位 -->
            <div class="form-row">
              <div class="form-label">办理单位</div>
              <div class="form-content half-width">
                <!-- 督办人可编辑 -->
                <el-select
                  v-if="canEditLeadDept"
                  v-model="editForm.leadDept"
                  multiple
                  filterable
                  placeholder="请选择办理单位（可多选）"
                  style="width: 100%"
                  @change="handleLeadDeptChange"
                >
                  <el-option
                    v-for="dept in deptList"
                    :key="dept.id"
                    :label="dept.name"
                    :value="dept.id"
                  />
                </el-select>
                <!-- 只读模式 -->
                <template v-else>
                  <el-input
                    v-if="!orderDetail.leadDept || getLeadDeptNames().length === 0"
                    value="待督办人选择"
                    readonly
                    class="readonly-display"
                  />
                  <el-input
                    v-else
                    :value="getLeadDeptNames().join('、')"
                    readonly
                    class="readonly-display"
                  />
                </template>
              </div>
              <div class="form-label">协办单位</div>
              <div class="form-content half-width">
                <!-- 办理单位可编辑 -->
                <el-select
                  v-if="canEditCollaborateDepts"
                  v-model="editForm.collaborateDepts"
                  multiple
                  filterable
                  placeholder="请选择协办单位"
                  style="width: 100%"
                  @change="handleCollaborateDeptsChange"
                >
                  <el-option
                    v-for="dept in deptList"
                    :key="dept.id"
                    :label="dept.name"
                    :value="dept.name"
                  />
                </el-select>
                <!-- 只读模式 -->
                <template v-else>
                  <el-input
                    v-if="shouldShowCoDeptPlaceholder || !orderDetail.coDept"
                    value="待办理单位选择"
                    readonly
                    class="readonly-display"
                  />
                  <el-input
                    v-else
                    :value="getCollaborateDepts(orderDetail.coDept).join('、')"
                    readonly
                    class="readonly-display"
                  />
                </template>
              </div>
            </div>

            <!-- 督办人和联系电话 -->
            <div class="form-row">
              <div class="form-label">督办人</div>
              <div class="form-content half-width">
                <el-select
                  v-if="canEditSupervisors"
                  v-model="editForm.supervisorIds"
                  multiple
                  placeholder="请选择督办人"
                  :collapse-tags="true"
                  :max-collapse-tags="3"
                  style="width: 100%"
                  clearable
                  @change="handleSupervisorChange"
                >
                  <el-option
                    v-for="user in userList"
                    :key="user.id"
                    :label="user.nickname || user.username"
                    :value="user.id"
                  />
                </el-select>
                <el-input v-else :value="getSupervisorDisplay()" readonly class="readonly-display" />
              </div>
              <div class="form-label">联系电话</div>
              <div class="form-content half-width">
                <el-input
                  v-if="canEditOfficePhone"
                  v-model="editForm.officePhone"
                  placeholder="请输入联系电话"
                  maxlength="20"
                />
                <el-input v-else :value="orderDetail.officePhone || '未设置'" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 工作推进情况 -->
            <div class="form-row">
              <div class="form-label no-wrap">工作推进情况</div>
              <div class="form-content full-width">
                <div class="work-progress-content">
                  <!-- 操作按钮区域 -->
                  <div class="timeline-actions-section">
                    <div class="timeline-actions">
                      <el-button
                        v-if="canEditLeadDeptDetail && !(isImplementPlanNode && isCurrentUserSupervisor)"
                        type="primary"
                        size="default"
                        @click="showAddProgressDialog"
                      >
                        添加工作推进
                      </el-button>
                      <el-button
                        v-if="progressRecords.length > 0"
                        type="primary"
                        size="default"
                        @click="sortProgressRecords('asc')"
                      >
                        <el-icon><ArrowUp /></el-icon>
                        时间正序
                      </el-button>
                      <el-button
                        v-if="progressRecords.length > 0"
                        type="primary"
                        size="default"
                        @click="sortProgressRecords('desc')"
                      >
                        <el-icon><ArrowDown /></el-icon>
                        时间倒序
                      </el-button>
                      <el-button
                        v-if="isCurrentUserLeader && !isSupervisionEnded"
                        type="primary"
                        size="default"
                        @click="showAddRemarkDialog"
                      >
                        新增批示
                      </el-button>
                      <el-button
                        v-if="isImplementPlanNode && isCurrentUserSupervisor"
                        type="warning"
                        size="default"
                        @click="openAuditDialog"
                      >
                        计划审核
                      </el-button>
                      <el-button
                        v-if="hasMoreRecords"
                        type="primary"
                        size="default"
                        :loading="isToggling"
                        :title="isExpanded ? '折叠' : '展开'"
                        @click="toggleProgressRecords"
                      >
                        <span class="double-arrow-icon">
                          <el-icon v-if="isExpanded"><ArrowUp /></el-icon>
                          <el-icon v-if="isExpanded"><ArrowUp /></el-icon>
                          <el-icon v-if="!isExpanded"><ArrowDown /></el-icon>
                          <el-icon v-if="!isExpanded"><ArrowDown /></el-icon>
                        </span>
                      </el-button>
                    </div>
                  </div>


                  <!-- 进度记录列表（除了最新的） -->
                  <div class="progress-timeline" v-if="progressRecords.length > 1">
                    <div
                      v-for="(record, index) in displayedProgressRecords"
                      :key="index"
                      class="progress-record-item"
                    >
                      <div class="progress-record-dot">
                        <div class="dot-inner"></div>
                      </div>
                      <div class="progress-record-content">
                        <div class="progress-record-title">
                          <Icon icon="ep:user" class="user-icon" />
                          {{ record.title }}
                          <span class="progress-record-handler" v-if="record.handler">{{ record.handler }}</span>
                          <span v-if="record.expectedTime" class="progress-record-expected-time">
                            <Icon icon="ep:calendar" class="calendar-icon" />
                            预计完成时间：{{ record.expectedTime }}
                          </span>
                        </div>
                        <div class="progress-record-time">
                          <Icon icon="ep:clock" class="time-icon" />
                          {{ record.time }}
                        </div>
                        
                        <!-- 原始 description 仅在非计划摘要时显示 -->
                        <div v-if="record.description && !shouldShowPlanSummary(record)" class="progress-record-description">
                          {{ record.description }}
                        </div>
                        
                        <!-- 计划摘要显示（纯文本，无样式） -->
                        <div v-if="shouldShowPlanSummary(record)" class="plan-summary-simple">
                          <div v-for="(item, index) in getSimplePlanSummary(record)" :key="index" class="summary-item">
                            <div class="summary-line-with-file">
                              <span class="summary-text-inline">{{ item.text }}</span>
                              <div v-if="item.file" class="summary-file-inline">
                                <el-link @click="previewProgressFile(item.file)" type="primary" class="file-preview-link">
                                  <Icon icon="ep:document" />
                                  {{ item.file.name }}
                                </el-link>
                                <el-link :href="getFileUrl(item.file)" target="_blank" type="primary" class="file-download-link">
                                  <Icon icon="ep:download" />
                                </el-link>
                              </div>
                            </div>
                          </div>
                          <div v-if="hasMorePlans(record)" class="summary-more-simple">
                            ...
                            <el-link type="primary" @click="showViewAllPlansForRecord(record)" style="margin-left: 8px;">
                              查看全部计划
                            </el-link>
                          </div>
                        </div>
                        
                        <!-- 单行计划记录（implement_plan）也显示查看全部计划链接 -->
                        <div v-if="isPlanLikeRecord(record)" class="single-plan-view-all">
                          <el-link type="primary" @click="showViewAllPlansForRecord(record)">
                            查看全部计划
                          </el-link>
                        </div>
                        
                        <div class="progress-record-description" v-if="record.remark && record.recordType !== 'implement_plan_audit'">
                          <strong>领导批示：</strong>{{ record.remark }}
                        </div>
                        
                        <!-- 原始附件仅在非计划摘要时显示 -->
                        <div v-if="record.attachments && record.attachments.length > 0 && !shouldShowPlanSummary(record)" class="progress-record-attachments">
                          <div class="attachments-list">
                            <div v-for="file in record.attachments" :key="file.id || file.name" class="progress-attachment-item">
                              <Icon icon="ep:document" class="attachment-icon" />
                              <span class="attachment-name" @click="previewProgressFile(file)">{{ file.name }}</span>
                              <Icon icon="ep:download" class="attachment-download-btn" @click="downloadProgressFile(file)" title="下载文件" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 空状态 -->
                  <div v-else-if="progressRecords.length === 0" class="empty-progress">
                    <div class="empty-text">暂无进度更新记录</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 同意立项督办显示行（仅内容框，无左侧标签） -->
            <div class="form-row" v-if="(orderDetail.isProjectSupervision === true || orderDetail.isProjectSupervision === 1) && projectApprovalText">
              <div class="form-content full-width">
                <el-input :value="projectApprovalText" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 同意结束督办显示行（仅内容框，无左侧标签） -->
            <div class="form-row" v-if="(orderDetail.isSupervisionClosed === true || orderDetail.isSupervisionClosed === 1) && closeApprovalText">
              <div class="form-content full-width">
                <el-input :value="closeApprovalText" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 是否立项督办 -->
            <!-- <div class="form-row">
              <div class="form-label">是否立项督办</div>
              <div class="form-content full-width">
                <el-select
                  v-if="canEditIsProjectSupervision"
                  v-model="editForm.isProjectSupervision"
                  placeholder="请选择是否立项督办"
                  style="width: 100%"
                >
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
                <el-input v-else :value="projectApprovalText" readonly class="readonly-display" />
              </div>
            </div> -->

            <!-- 是否结束督办 -->
            <!-- <div class="form-row">
              <div class="form-label">是否结束督办</div>
              <div class="form-content full-width">
                <el-input :value="closeApprovalText" readonly class="readonly-display" />
              </div>
            </div> -->

            <!-- 概述 -->
            <div class="form-row" v-if="false">
              <div class="form-label">概述</div>
              <div class="form-content full-width">
                <div class="summary-content-inline">
                  <div v-if="parsedSummary && parsedSummary.length > 0">
                    <div v-for="(item, index) in parsedSummary" :key="index" class="summary-item-inline">
                      <strong>{{ item.label }}：</strong>{{ item.value }}
                    </div>
                  </div>
                  <div v-else class="no-summary-inline">
                    暂无概述信息
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form>
      </div>

    </div>

    <!-- 添加进度更新弹窗 -->
    <el-dialog
      v-model="addProgressDialogVisible"
      title="添加进度更新"
      width="1000px"
      class="add-progress-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="progress-dialog-content">
        <!-- upload_plan 节点：是否能按期完成提示区域 -->
        <div v-if="isUploadPlanNode" class="completion-check-section">
          <div class="completion-prompt">
            请根据自身情况判断是否能在规定期限内完成工作
          </div>
          <div class="completion-deadline">
            任务完成期限：{{ formatDeadlineDisplay(orderDetail.deadline) }}
          </div>
          
          <!-- 是否能按期完成选择 -->
          <div class="completion-choice">
            <el-radio-group v-model="progressForm.canFinishOnTime" @change="handleCanFinishOnTimeChange">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </div>
        </div>
        
        <!-- 非 upload_plan 节点：直接显示工作计划表格 -->
        <div v-if="!isUploadPlanNode" class="plan-table-section">
          <div class="plan-table-header">
            <div class="plan-table-title">工作计划安排</div>
            <!-- 审核模式：用户切换选择器 -->
            <div v-if="auditMode && auditUserOptions.length > 0" class="audit-user-selector">
              <span class="selector-label">当前上传人：</span>
              <el-select 
                v-model="selectedAuditUserId" 
                placeholder="请选择上传人"
                style="width: 280px"
                @change="onAuditUserChange"
              >
                <el-option
                  v-for="option in auditUserOptions"
                  :key="option.value"
                  :label="`${option.nickname}（部门：${option.deptName}）(${option.count}条)`"
                  :value="option.value"
                />
              </el-select>
            </div>
          </div>
          <div class="plan-table-tip">
            <Icon icon="ep:info-filled" class="tip-icon" />
            <span v-if="auditMode">当前显示 {{ selectedAuditUserName || '所选用户' }} 的提交内容，可逐行审核</span>
            <span v-else-if="isImplementPlanNode">当前显示计划执行状态，可通过"添加工作推进"提交新的计划内容</span>
            <span v-else>请按顺序提交，上一行提交后才能填写下一行</span>
          </div>
          <el-table :data="auditMode ? planEntryRows : progressForm.planRows" border class="plan-table">
            <el-table-column prop="date" label="预计完成时间" width="150" align="center">
              <template #default="{ row }">
                <span>{{ row.date }}</span>
              </template>
            </el-table-column>
            <el-table-column label="工作内容概述" min-width="200">
              <template #default="{ row, $index }">
                <!-- 审核模式：只读显示 -->
                <div v-if="auditMode" class="readonly-summary">
                  {{ row.summary || '未填写' }}
                </div>
                <!-- 非审核模式：可编辑 -->
                <template v-else>
                  <el-input
                    v-model="row.summary"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入工作内容概述..."
                    maxlength="200"
                    :disabled="getRowDisabled(row, $index)"
                  />
                  <!-- 状态提示 -->
                  <div v-if="row.status === 'submitted'" class="row-status-tip submitted">
                    ✓ 已提交
                  </div>
                  <div v-else-if="row.status === 'rejected'" class="row-status-tip rejected">
                    ✗ 已驳回
                  </div>
                  <div v-else-if="row.status === 'waiting'" class="row-status-tip waiting">
                    等待上一行提交
                  </div>
                  <div v-else-if="row.status === 'pending' && !isFirstPendingRow(row, $index)" class="row-status-tip waiting">
                    等待上一行提交
                  </div>
                  <!-- 顺延记录提示 -->
                  <div v-if="row.isDelayed" class="row-status-tip delayed">
                    📋 顺延内容，请重新填写并提交
                  </div>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="工作计划文件" min-width="250">
              <template #default="{ row, $index }">
                <!-- 审核模式：只读文件列表 -->
                <div v-if="auditMode" class="readonly-files">
                  <div v-if="getRowFileList(row).length > 0" class="file-list-horizontal">
                    <div v-for="file in getRowFileList(row)" :key="getFileUrl(file) || file.name" class="file-item-horizontal">
                      <div v-if="getFileUrl(file)" class="file-actions">
                        <el-link @click="previewProgressFile(file)" type="primary" class="file-preview-link">
                          <Icon icon="ep:document" class="file-icon" />
                          {{ file.name }}
                        </el-link>
                        <el-link :href="getFileUrl(file)" target="_blank" type="primary" class="file-download-link">
                          <Icon icon="ep:download" class="download-icon" />
                        </el-link>
                      </div>
                      <span v-else class="file-name-only">
                        <Icon icon="ep:document" class="file-icon" />
                        {{ file.name }}
                      </span>
                    </div>
                  </div>
                  <div v-else class="no-files">未上传文件</div>
                </div>
                <!-- 非审核模式：可上传 -->
                <div v-else class="plan-upload-container">
                  <el-upload
                    v-model:file-list="row.fileList"
                    :http-request="(options) => customPlanUpload(options, $index)"
                    :multiple="true"
                    :auto-upload="true"
                    :show-file-list="true"
                    :on-error="(error) => handlePlanUploadError(error, $index)"
                    :on-remove="(file) => handlePlanFileRemove(file, $index)"
                    :before-upload="beforePlanUpload"
                    accept=".doc,.docx,.xls,.xlsx"
                    action="#"
                    class="plan-upload"
                    :disabled="getRowDisabled(row, $index)"
                  >
                    <el-button size="small" type="primary" :disabled="getRowDisabled(row, $index)">
                      <Icon icon="ep:upload" class="upload-icon" />
                      选择文件
                    </el-button>
                  </el-upload>
                  <div class="plan-upload-tip">
                    支持Word/Excel，单个≤100MB
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 审核结果列（非审核模式显示） -->
            <el-table-column v-if="!auditMode" label="审核结果" width="100" align="center">
              <template #default="{ row }">
                <template v-if="isImplementPlanNode">
                  <!-- 新接口数据：基于 status 显示，兜底使用 auditDecision -->
                  <el-tag v-if="row.status === 'approved' || row.auditDecision === 'approved'" type="success" size="small">
                    已通过
                  </el-tag>
                  <el-tag v-else-if="row.status === 'rejected' || row.auditDecision === 'rejected'" type="danger" size="small">
                    不通过
                  </el-tag>
                  <el-tag v-else-if="row.status === 'submitted'" type="warning" size="small">
                    待审核
                  </el-tag>
                  <el-tag v-else-if="row.status === 'pending_delay'" type="info" size="small">
                    顺延占位
                  </el-tag>
                  <el-tag v-else type="info" size="small">
                    {{ row.statusDisplay || row.status || '未提交' }}
                  </el-tag>
                </template>
                <template v-else>
                  <!-- 旧数据：基于 auditDecision 显示 -->
                  <el-tag v-if="row.auditDecision === 'approved'" type="success" size="small">
                    已通过
                  </el-tag>
                  <el-tag v-else-if="row.auditDecision === 'rejected'" type="danger" size="small">
                    不通过
                  </el-tag>
                  <el-tag v-else type="info" size="small">
                    未审核
                  </el-tag>
                </template>
              </template>
            </el-table-column>
            <!-- 审核列（仅审核模式显示） -->
            <el-table-column v-if="auditMode" label="审核" width="180" align="center">
              <template #default="{ row, $index }">
                <template v-if="isImplementPlanNode">
                  <!-- 新接口数据：基于 status 显示，兜底使用 auditDecision -->
                  <div v-if="row.status === 'approved' || row.status === 'rejected' || row.auditDecision === 'approved' || row.auditDecision === 'rejected'" class="audit-status">
                    <el-tag v-if="row.status === 'approved' || row.auditDecision === 'approved'" type="success" size="small">
                      已通过
                    </el-tag>
                    <el-tag v-else-if="row.status === 'rejected' || row.auditDecision === 'rejected'" type="danger" size="small">
                      不通过
                    </el-tag>
                  </div>
                  <!-- 未审核：显示操作按钮 -->
                  <div v-else class="audit-actions">
                    <el-button
                      size="small"
                      type="success"
                      :disabled="row.status !== 'submitted'"
                      @click="approveEntry(row)"
                    >
                      通过
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      :disabled="row.status !== 'submitted'"
                      @click="rejectEntry(row)"
                    >
                      不通过
                    </el-button>
                  </div>
                </template>
                <template v-else>
                  <!-- 旧数据：基于 auditDecision 显示 -->
                  <div v-if="row.auditDecision" class="audit-status">
                    <el-tag v-if="row.auditDecision === 'approved'" type="success" size="small">
                      已通过
                    </el-tag>
                    <el-tag v-else-if="row.auditDecision === 'rejected'" type="danger" size="small">
                      不通过
                    </el-tag>
                  </div>
                  <!-- 未审核：显示操作按钮 -->
                  <div v-else class="audit-actions">
                    <el-button
                      size="small"
                      type="success"
                      :disabled="!canAuditRow(row, $index)"
                      @click="approveRow($index)"
                    >
                      通过
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      :disabled="!canAuditRow(row, $index)"
                      @click="rejectRow($index)"
                    >
                      不通过
                    </el-button>
                  </div>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-form :model="progressForm" :rules="progressRules" ref="progressFormRef" label-width="140px" class="progress-form">
          <!-- 所有节点都不再显示当前进度情况文本框，改为使用计划表格 -->

          <!-- upload_plan 节点：是分支 - 动态表格 -->
          <template v-if="isUploadPlanNode && progressForm.canFinishOnTime">
            <div class="plan-table-section">
              <div class="plan-table-title">工作计划安排</div>
              <div class="plan-table-tip">
                <Icon icon="ep:info-filled" class="tip-icon" />
                请填写周期内的工作计划，提交后将按计划时间逐步执行
              </div>
              <el-table :data="auditMode ? planEntryRows : progressForm.planRows" border class="plan-table">
                <el-table-column prop="date" label="预计完成时间" width="150" align="center">
                  <template #default="{ row }">
                    <span>{{ row.date }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="工作内容概述" min-width="200">
                  <template #default="{ row, $index }">
                    <el-input
                      v-model="row.summary"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入工作内容概述..."
                      maxlength="200"
                      :disabled="getRowDisabled(row, $index)"
                    />
                    <!-- 状态提示（upload_plan 节点不显示 future 状态） -->
                    <div v-if="row.status === 'submitted'" class="row-status-tip submitted">
                      ✓ 已提交
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="工作计划上传" min-width="250">
                  <template #default="{ row, $index }">
                    <div class="plan-upload-container">
                      <el-upload
                        v-model:file-list="row.fileList"
                        :http-request="(options) => customPlanUpload(options, $index)"
                        :multiple="true"
                        :auto-upload="true"
                        :show-file-list="true"
                        :on-error="(error) => handlePlanUploadError(error, $index)"
                        :on-remove="(file) => handlePlanFileRemove(file, $index)"
                        :before-upload="beforePlanUpload"
                        accept=".doc,.docx,.xls,.xlsx"
                        action="#"
                        class="plan-upload"
                        :disabled="getRowDisabled(row, $index)"
                      >
                        <el-button size="small" type="primary" :disabled="getRowDisabled(row, $index)">
                          <Icon icon="ep:upload" class="upload-icon" />
                          选择文件
                        </el-button>
                      </el-upload>
                      <div class="plan-upload-tip">
                        支持Word/Excel，单个≤100MB
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>

          <!-- upload_plan 节点：否分支 - 原因和重新选择时间 -->
          <template v-if="isUploadPlanNode && !progressForm.canFinishOnTime">
            <el-form-item label="不能按时完成原因" prop="delayReason" class="form-item-custom form-item-no-label">
              <el-input
                v-model="progressForm.delayReason"
                type="textarea"
                :rows="3"
                placeholder="请详细说明不能按时完成的具体原因..."
                maxlength="200"
                show-word-limit
                class="textarea-custom"
              />
            </el-form-item>

            <el-form-item label="请重新选择完成时间" prop="planTime" class="form-item-custom form-item-no-label">
              <el-date-picker
                v-model="progressForm.planTime"
                type="datetime"
                placeholder="请选择预计完成时间"
                format="YYYY年MM月DD日 HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                class="date-picker-custom"
                :disabled-date="disabledProgressDate"
                :disabled-hours="disabledProgressHours"
                :disabled-minutes="disabledProgressMinutes"
                :default-time="defaultProgressTime"
              />
            </el-form-item>
          </template>

          <!-- 非 upload_plan 和 implement_plan 节点保持原有的预计完成时间字段 -->
          <el-form-item v-if="!isUploadPlanNode && !isImplementPlanNode" label="预计完成时间" prop="planTime" class="form-item-custom form-item-no-label">
            <el-date-picker
              v-model="progressForm.planTime"
              type="datetime"
              placeholder="请选择预计完成时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              class="date-picker-custom"
              :disabled-date="disabledProgressDate"
              :disabled-hours="disabledProgressHours"
              :disabled-minutes="disabledProgressMinutes"
              :default-time="defaultProgressTime"
            />
          </el-form-item>

          <!-- 非 upload_plan 节点的原有附件上传 - 已注释，改为使用表格内的文件上传功能 -->
          <!-- <el-form-item v-if="!isUploadPlanNode" label="相关附件" class="form-item-custom form-item-no-label upload-item">
            <div class="upload-container">
              <el-upload
                ref="progressUploadRef"
                v-model:file-list="progressForm.fileList"
                :http-request="customProgressUpload"
                :multiple="true"
                :auto-upload="true"
                :show-file-list="true"
                :on-error="handleProgressUploadError"
                :on-remove="handleProgressFileRemove"
                :before-upload="beforeProgressUpload"
                accept=".doc,.docx,.xls,.xlsx"
                action="#"
                class="upload-custom"
              >
                <el-button type="primary" class="upload-btn">
                  <Icon icon="ep:upload" class="upload-icon" />
                  选择文件
                </el-button>
              </el-upload>
              <div class="upload-tip">
                <Icon icon="ep:info-filled" class="tip-icon" />
                仅支持 doc、docx、xls、xlsx 格式，单个文件不超过100MB，数量不限
              </div>
            </div>
          </el-form-item> -->
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer-custom">
          <!-- 审核模式：仅显示关闭按钮 -->
          <template v-if="auditMode">
            <el-button @click="cancelAddProgress" class="cancel-btn">
              <Icon icon="ep:close" class="btn-icon" />
              关闭
            </el-button>
          </template>
          <!-- 非审核模式：按原逻辑显示 -->
          <template v-else>
            <!-- implement_plan 或 upload_plan 节点显示提交和取消按钮 -->
            <template v-if="isImplementPlanNode || isUploadPlanNode">
              <el-button @click="cancelAddProgress" class="cancel-btn">
                <Icon icon="ep:close" class="btn-icon" />
                取消
              </el-button>
              <el-button type="primary" @click="submitAddProgress" :loading="progressSubmitting" :disabled="progressSubmitting || isSubmitDisabled" class="submit-btn">
                <Icon icon="ep:check" class="btn-icon" />
                {{ getSubmitButtonText }}
              </el-button>
            </template>
            <!-- 其他节点只显示关闭按钮 -->
            <template v-else>
              <el-button @click="cancelAddProgress" class="cancel-btn">
                <Icon icon="ep:close" class="btn-icon" />
                关闭
              </el-button>
            </template>
          </template>
        </div>
      </template>
    </el-dialog>

    <!-- 添加批示弹窗 -->
    <el-dialog
      v-model="addRemarkDialogVisible"
      title="新增批示"
      width="600px"
      class="add-progress-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="progress-dialog-content">
        <el-form :model="remarkForm" :rules="remarkRules" ref="remarkFormRef" label-width="140px" class="progress-form">
          <el-form-item label="批示内容" prop="remark" class="form-item-custom">
            <el-input
              v-model="remarkForm.remark"
              type="textarea"
              :rows="6"
              placeholder="请输入批示内容..."
              maxlength="500"
              show-word-limit
              class="textarea-custom"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer-custom">
          <el-button @click="cancelAddRemark" class="cancel-btn">
            <Icon icon="ep:close" class="btn-icon" />
            取消
          </el-button>
          <el-button type="primary" @click="submitAddRemark" class="submit-btn">
            <Icon icon="ep:check" class="btn-icon" />
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看全部计划弹窗 -->
    <el-dialog
      v-model="viewAllPlansDialogVisible"
      title="查看全部计划"
      width="1000px"
      class="view-all-plans-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="view-all-plans-content">
        <el-table :data="viewAllPlansData" border class="plan-table">
          <el-table-column prop="date" label="预计完成时间" width="150" align="center">
            <template #default="{ row }">
              <span>{{ row.date }}</span>
            </template>
          </el-table-column>
          <el-table-column label="工作内容概述" min-width="300">
            <template #default="{ row }">
              <!-- 单用户模式（旧数据格式） -->
              <div v-if="!row.userPlans" class="readonly-summary">
                {{ row.summary || '未填写' }}
              </div>
              <!-- 多用户模式（新数据格式） -->
              <div v-else class="multi-user-plans">
                <div v-for="userPlan in row.userPlans" :key="userPlan.userId" class="user-plan-item">
                  <div class="user-plan-header">
                    <span class="user-name">{{ userPlan.userName }}</span>
                    <span class="dept-name">（{{ userPlan.deptName }}）</span>
                    <el-tag v-if="userPlan.status === 'submitted'" type="warning" size="small">待审核</el-tag>
                    <el-tag v-else-if="userPlan.status === 'approved'" type="success" size="small">已通过</el-tag>
                    <el-tag v-else-if="userPlan.status === 'rejected'" type="danger" size="small">已退回</el-tag>
                    <el-tag v-else-if="userPlan.isDelayed" type="info" size="small">顺延</el-tag>
                  </div>
                  <div class="user-plan-content">
                    {{ userPlan.summary || '未填写' }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="工作计划附件" min-width="250">
            <template #default="{ row }">
              <!-- 单用户模式（旧数据格式） -->
              <div v-if="!row.userPlans" class="readonly-files">
                <div v-if="row.fileList && row.fileList.length > 0" class="file-list-horizontal">
                  <div v-for="file in row.fileList" :key="getFileUrl(file) || file.name" class="file-item-horizontal">
                    <div v-if="getFileUrl(file)" class="file-actions">
                      <el-link @click="previewProgressFile(file)" type="primary" class="file-preview-link">
                        <Icon icon="ep:document" class="file-icon" />
                        {{ file.name }}
                      </el-link>
                      <el-link :href="getFileUrl(file)" target="_blank" type="primary" class="file-download-link">
                        <Icon icon="ep:download" class="download-icon" />
                      </el-link>
                    </div>
                    <span v-else class="file-name-only">
                      <Icon icon="ep:document" class="file-icon" />
                      {{ file.name }}
                    </span>
                  </div>
                </div>
                <div v-else class="no-files">未上传文件</div>
              </div>
              <!-- 多用户模式（新数据格式） -->
              <div v-else class="multi-user-files">
                <div v-for="userPlan in row.userPlans" :key="userPlan.userId" class="user-files-item">
                  <div class="user-files-header">
                    <span class="user-name">{{ userPlan.userName }}</span>
                  </div>
                  <div class="user-files-content">
                    <div v-if="userPlan.fileList && userPlan.fileList.length > 0" class="file-list-horizontal">
                      <div v-for="file in userPlan.fileList" :key="getFileUrl(file) || file.name" class="file-item-horizontal">
                        <div v-if="getFileUrl(file)" class="file-actions">
                          <el-link @click="previewProgressFile(file)" type="primary" class="file-preview-link">
                            <Icon icon="ep:document" class="file-icon" />
                            {{ file.name }}
                          </el-link>
                          <el-link :href="getFileUrl(file)" target="_blank" type="primary" class="file-download-link">
                            <Icon icon="ep:download" class="download-icon" />
                          </el-link>
                        </div>
                        <span v-else class="file-name-only">
                          <Icon icon="ep:document" class="file-icon" />
                          {{ file.name }}
                        </span>
                      </div>
                    </div>
                    <div v-else class="no-files">未上传文件</div>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <div class="dialog-footer-custom">
          <el-button @click="closeViewAllPlansDialog" class="cancel-btn">
            <Icon icon="ep:close" class="btn-icon" />
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>

  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, reactive, nextTick, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { OrderApi, LeaderRemarkApi, MarkReadApi, PlanEntryApi, type OrderRespVO, type OrderSaveReqVO, type OrderWorkflowUpdateReqVO, type AttachmentFileInfo, type AttachmentRespVO, type PlanEntryRespVO, type PlanEntrySubmitReqVO, type PlanEntryAuditReqVO, type PlanEntryBatchSubmitReqVO, type PlanEntryBatchItem } from '@/api/supervision'
import { getSimpleDeptList, getDept, type DeptVO } from '@/api/system/dept'
import { EditPen, ArrowRight, InfoFilled, Select, Close, StarFilled, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { getSimpleUserList, type UserVO } from '@/api/system/user'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { utilFormatDate } from '@/utils/dateUtil'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox, type UploadUserFile } from 'element-plus'
import { checkRole } from '@/utils/permission'
import { WarningFilled } from '@element-plus/icons-vue'
import { UploadFile } from '@/components/UploadFile'
import { Icon } from '@/components/Icon'
import * as DeptApi from '@/api/system/dept'
import * as FileApi from '@/api/infra/file'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import * as DefinitionApi from '@/api/bpm/definition'
import { SupervisionProcessApi, SupervisionTaskOperationApi } from '@/api/supervision/index'
import { canSuspendResume } from '../components/permissions'
import { KKFileView } from '@/components/KKFileView'

defineOptions({ name: 'SupervisionOrderDetail' })

// 定义props，支持从父组件传递参数
const props = defineProps<{
  id?: string | number  // 可以是督办单ID或流程实例ID
  activityNodes?: any[]
  applyUser?: string
  applyTime?: string
  status?: number
}>()

const route = useRoute()
const loading = ref(false)
const detailFormEl = ref<HTMLElement | null>(null)
const userStore = useUserStore()

// 部门列表
const deptList = ref<DeptVO[]>([])

// 用户列表
const userList = ref<UserVO[]>([])
// 获取办公电话的加载状态（用于防抖）
const phoneLoading = ref(false)

// 督办分类选项
const typeOptions = ref<Array<{value: number | string, label: string, id?: number}>>([])

// 紧急程度选项
const priorityOptions = computed(() => getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE))

// 办理单位进度报告频次选项
const reportFrequencyOptions = computed(() => getIntDictOptions(DICT_TYPE.REPORT_FREQUENCY))




// 进度更新记录相关状态
const progressRecords = ref<any[]>([])           // 进度记录列表
const hasMoreRecords = ref(false)                // 是否有更多记录
const isExpanded = ref(false)                    // 当前是否为展开状态（默认折叠）
const isToggling = ref(false)                    // 是否正在切换状态（防止频繁点击）

// implement_plan 节点的结构化上下文状态
const planEntryRows = ref<any[]>([])             // 计划记录行数据（用于审核上下文）
const implementPlanLoading = ref(false)          // 加载 implement_plan 上下文状态

// 计算属性：待审核的计划记录数量
const pendingAuditCount = computed(() => {
  if (!isImplementPlanNode.value) return 0
  return planEntryRows.value.filter(entry => entry.status === 'submitted').length
})

// 解析附件信息（用于新接口数据）
const parseAttachmentInfo = (attachmentInfo: string) => {
  if (!attachmentInfo || attachmentInfo.trim() === '') return []
  try {
    return JSON.parse(attachmentInfo)
  } catch (error) {
    console.warn('解析附件信息失败:', error)
    return []
  }
}

// 获取行的附件列表（兼容新旧数据格式）
const getRowFileList = (row: any) => {
  if (isImplementPlanNode.value && row.attachmentInfo) {
    // 新接口数据：从 attachmentInfo JSON 解析
    return parseAttachmentInfo(row.attachmentInfo)
  }
  // 旧数据格式：直接使用 fileList
  return row.fileList || []
}
const addProgressDialogVisible = ref(false)     // 添加进度弹窗显示状态
const addRemarkDialogVisible = ref(false)       // 添加批示弹窗状态
const viewAllPlansDialogVisible = ref(false)    // 查看全部计划弹窗状态
const viewAllPlansData = ref<any[]>([])         // 查看全部计划弹窗数据
const progressSubmitting = ref(false)           // 进度提交中状态
const hasNewProgressInThisSession = ref(false)  // 本会话是否新增过进度记录
const progressSortOrder = ref<'asc' | 'desc'>('desc') // 进度记录排序方式，默认倒序（最新在前）
const auditMode = ref(false)                    // 是否为审核模式（督办人只读审核）
// 移除了 pendingProgressUpdate 和 isEditingPendingProgress 相关逻辑
// 进度更新表单数据
const progressForm = reactive({
  deptDetail: '',
  planTime: '',
  fileList: [] as Array<{
    uid: string
    name: string
    url?: string
    status?: string
    raw?: File
    size?: number
  }>,
  canFinishOnTime: true, // 是否能按时完成
  delayReason: '', // 不能按时完成的原因
  coopUnitsChanged: false, // 协办单位是否变更
  planRows: [] as Array<{
    date: string
    summary: string
    fileList: Array<{
      uid: string
      name: string
      url?: string
      status?: string
      raw?: File
      size?: number
    }>
  }> // 工作计划行数据
})

// 批示表单数据
const remarkForm = reactive({
  remark: ''
})

// 进度更新表单验证规则
const progressRules = computed(() => {
  const rules: any = {}
  
  if (isUploadPlanNode.value) {
    // upload_plan 节点的校验规则
    if (progressForm.canFinishOnTime) {
      // 选择"是"时，验证计划表格
      rules.planRows = [
        {
          validator: (rule: any, value: any[], callback: any) => {
            if (!value || value.length === 0) {
              callback(new Error('请至少填写一行计划内容'))
              return
            }
            
            const hasValidRow = value.some(row => 
              (row.summary && row.summary.trim() !== '') || 
              (row.fileList && row.fileList.length > 0)
            )
            
            if (!hasValidRow) {
              callback(new Error('请至少在一行中填写工作内容或上传文件'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    } else {
      // 选择"否"时，验证原有字段
      rules.planTime = [
        { required: true, message: '请选择预计完成时间', trigger: 'change' }
      ]
      rules.delayReason = [
        { required: true, message: '请填写不能按时完成的原因', trigger: 'blur' }
      ]
    }
  } else {
    // implement_plan 节点：验证是否有可提交的行
    rules.planRows = [
      {
        validator: (rule: any, value: any[], callback: any) => {
          const targetRow = findFirstPendingRow()
          if (!targetRow) {
            callback(new Error('尚未到达可提交时间或本周期已全部提交'))
            return
          }
          
          // 验证当前可提交行是否有内容
          if (!targetRow.summary || targetRow.summary.trim() === '') {
            if (!targetRow.fileList || targetRow.fileList.length === 0) {
              callback(new Error('请在当前可提交行中填写工作内容或上传文件'))
              return
            }
          }
          
          callback()
        },
        trigger: 'blur'
      }
    ]
  }
  
  return rules
})

// 批示表单验证规则
const remarkRules = {
  remark: [
    { required: true, message: '请输入批示内容', trigger: 'blur' }
  ]
}

// 判断督办是否已结束（基于后端字段 isSupervisionClosed）
const isSupervisionEnded = computed(() => {
  const closed = orderDetail.value?.isSupervisionClosed
  // 后端该字段定义为 boolean | null，这里进行显式布尔化
  return !!closed
})

// 判断当前是否为 upload_plan 节点（放宽判断：基于当前运行中的节点ID集合）
// 使用已有的工具函数 getCurrentWorkflowNodes()，避免受 assigneeUser、字段命名差异影响
const isUploadPlanNode = computed(() => {
  const currentNodes: string[] = getCurrentWorkflowNodes()
  return Array.isArray(currentNodes) && currentNodes.includes('upload_plan')
})

// 判断当前是否为 implement_plan 节点
const isImplementPlanNode = computed(() => {
  const currentNodes: string[] = getCurrentWorkflowNodes()
  return Array.isArray(currentNodes) && currentNodes.includes('implement_plan')
})

// 判断当前用户是否为领导（有批示权限）
const isCurrentUserLeader = computed(() => {
  const currentUserId = userStore.getUser?.id
  if (!currentUserId || !orderDetail.value.leadLeaders || !Array.isArray(orderDetail.value.leadLeaders)) {
    return false
  }
  
  return orderDetail.value.leadLeaders.some(leader => leader.id === currentUserId)
})

// 办理单位负责人数据是否就绪
const isLeadDeptLeaderReady = computed(() => {
  const hasOrderId = !!orderDetail.value.id
  const hasLeadDeptLeaderIds = Array.isArray(orderDetail.value.leadDeptLeaderIds)
  
  return hasOrderId && hasLeadDeptLeaderIds
})

// 判断当前用户是否为办理单位负责人
const isLeadDeptLeader = computed(() => {
  const currentUserId = userStore.getUser?.id
  const currentUserIdNum = Number(currentUserId)
  
  if (!currentUserId || !isLeadDeptLeaderReady.value) {
    return false
  }
  
  // 直接使用后端返回的 leadDeptLeaderIds 进行判断
  const leadDeptLeaderIds = orderDetail.value.leadDeptLeaderIds || []
  const isLeader = leadDeptLeaderIds.some(leaderId => Number(leaderId) === currentUserIdNum)
  
  return isLeader
})

// 判断当前用户是否为督办人
const isCurrentUserSupervisor = computed(() => {
  const currentUserId = userStore.getUser?.id
  if (!currentUserId || !orderDetail.value.supervisors || !Array.isArray(orderDetail.value.supervisors)) {
    return false
  }
  
  return orderDetail.value.supervisors.some(supervisor => supervisor.id === Number(currentUserId))
})

// 计算显示的进度记录（除了最新的，并按排序方式显示）
const displayedProgressRecords = computed(() => {
  if (progressRecords.value.length <= 1) return []

  const records = progressRecords.value.slice(1) // 排除最新的记录

  // 根据排序方式排序
  return records.sort((a, b) => {
    const timeA = a.createTime || 0
    const timeB = b.createTime || 0

    if (progressSortOrder.value === 'asc') {
      return timeA - timeB // 正序：时间早的在前
    } else {
      return timeB - timeA // 倒序：时间晚的在前
    }
  })
})

// 进度记录排序方法
const sortProgressRecords = (order: 'asc' | 'desc') => {
  progressSortOrder.value = order
}

// 督办单详情数据
const orderDetail = ref<OrderRespVO>({
  id: 0,
  orderCode: '',
  orderTitle: '',
  type: 1,
  detailType: '',
  reason: 1,
  priority: 1,
  deadline: 0,
  leadDept: null as string | null,
  coDept: '',
  supervisors: [], // 督办人数组
  leadLeaders: [], // 分管领导和其他校领导数组
  content: '',
  deptDetail: null, // 工作推进情况
  reportFrequency: undefined, // 办理单位进度报告频次
  isProjectSupervision: null, // 是否立项督办
  isSupervisionClosed: null, // 是否结束督办
  summary: '',
  processInstanceId: '',
  createTime: 0
})

// 待审核提交数据（多单位审核用）
interface PendingSubmission {
  recordId: string
  date: string
  deptName: string
  creatorNickName: string
  creatorUserId: number
  summary: string
  attachments: any[]
  createTime: number
  auditStatus: 'pending' | 'approved' | 'rejected'
}

// 按日期分组的待审核提交 Map<date, PendingSubmission[]>
const pendingAuditMap = ref<Map<string, PendingSubmission[]>>(new Map())

// 审核用户选择器相关
interface AuditUserOption {
  label: string
  value: string | number // 支持复合键或数值ID
  nickname: string
  deptName: string
  count: number
  userId: number // 真实的用户ID，用于后端接口调用
}

const auditUserOptions = ref<AuditUserOption[]>([])
const selectedAuditUserId = ref<string | number>('')
const selectedAuditUserName = ref<string>('')
const selectedAuditUserDept = ref<string>('')

// 编辑表单数据
const editForm = ref({
  leadDept: [] as number[], // 办理单位ID数组（支持多选）
  leadDeptNames: [] as string[], // 办理单位名称数组（用于显示）
  coDept: '', // 协办单位ID字符串（逗号分隔）
  collaborateDepts: [] as string[], // 协办单位名称数组（用于显示）
  collaborateDeptIds: [] as number[], // 协办单位ID数组（用于提交）
  leadDeptDetail: '', // 办理单位工作推进情况
  orderTitle: '', // 督办事项
  content: '', // 主要内容
  type: 1, // 督办分类
  detailType: '' as string | number, // 督办分类详细类型
  priority: 1, // 紧急程度
  deadline: '', // 完成期限
  reportFrequency: undefined as number | undefined, // 办理单位进度报告频次
  otherLeaderIds: [] as number[], // 其他校领导ID数组
  supervisorIds: [] as number[], // 督办人ID数组
  officePhone: '' // 联系电话
})



// 获取部门列表
const getDeptList = async () => {
  try {
    deptList.value = await getSimpleDeptList()
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

// 获取用户列表
const getUserList = async () => {
  try {
    userList.value = await getSimpleUserList()
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 提取错误信息的通用函数
const extractErrorMessage = (error: any): string => {
  // 优先级：后端响应消息 > Error对象消息 > 字符串化错误
  if (error?.response?.data?.msg) {
    return error.response.data.msg
  }
  if (error?.data?.msg) {
    return error.data.msg
  }
  if (error?.message) {
    return error.message
  }
  return String(error) || '操作失败'
}

// 获取督办分类选项
const getTypeOptions = async () => {
  try {
    // 根据当前督办单类型获取分类选项
    const supervisionOrderType = orderDetail.value.type || 1
    const result = await OrderApi.getSupervisionDetailTypes(supervisionOrderType)
    
    // 处理返回的数据格式，与 create.vue 保持一致
    if (result && Array.isArray(result)) {
      // 检查返回的是对象数组还是字符串数组
      if (result.length > 0 && typeof result[0] === 'object' && result[0].id) {
        // 新格式：对象数组，包含id和type字段
        typeOptions.value = result.map((item) => ({
          id: item.id, // 保存ID用于删除
          value: item.id, // 使用id作为值（数字）
          label: item.type // type字段作为显示标签
        }))
      } else {
        // 旧格式：字符串数组
        typeOptions.value = result.map((item) => ({
          value: item, // 使用字符串本身作为值
          label: item // 字符串作为显示标签
        }))
      }
    } else {
      typeOptions.value = []
    }
    
    // 映射 detailType 值以确保下拉框正确回显
    if (typeOptions.value.length > 0 && (!editForm.value.detailType || typeof editForm.value.detailType === 'string')) {
      const detailTypeName = orderDetail.value.detailTypeName || editForm.value.detailType
      if (detailTypeName) {
        const matchedOption = typeOptions.value.find(option => option.label === detailTypeName)
        if (matchedOption) {
          editForm.value.detailType = matchedOption.value
        }
      }
    }
  } catch (error) {
    console.error('获取督办分类选项失败:', error)
    // 失败时使用字典兜底
    try {
      if (orderDetail.value.type === 2) {
        typeOptions.value = getIntDictOptions(DICT_TYPE.SPECIAL_SUPERVISION_TYPE)
      } else {
        typeOptions.value = getIntDictOptions(DICT_TYPE.WORK_SUPERVISION_TYPE)
      }
    } catch (dictError) {
      console.error('字典兜底失败:', dictError)
      typeOptions.value = []
    }
  }
}

// 根据部门ID获取部门名称
const getDeptName = (deptId: number | null) => {
  if (!deptId || deptId === 0) return '待督办人选择'
  const dept = deptList.value.find(item => item.id === deptId)
  return dept?.name || `未知部门(${deptId})`
}

// 获取办理单位名称列表（支持单选和多选兼容）
const getLeadDeptNames = () => {
  const leadDept = orderDetail.value.leadDept
  if (!leadDept) return []

  // 兼容处理：支持单个ID或ID数组
  let deptIds: number[] = []
  if (Array.isArray(leadDept)) {
    deptIds = leadDept
  } else if (typeof leadDept === 'number') {
    deptIds = [leadDept]
  } else if (typeof leadDept === 'string') {
    // 支持逗号分隔的字符串格式
    deptIds = leadDept.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
  }

  return deptIds.map(deptId => {
    const dept = deptList.value.find(item => item.id === deptId)
    return dept?.name || `未知部门(${deptId})`
  })
}


// 根据流程实例ID获取督办单详情
const getOrderDetail = async (processInstanceId: string) => {
  try {
    loading.value = true
    const data = await OrderApi.getOrderByProcessInstanceId(processInstanceId)

    if (!data) {
      throw new Error('API返回的数据为空')
    }

    if (!data.id) {
      throw new Error('督办单数据无效：缺少ID字段')
    }

    // 直接使用新的API数据结构
    orderDetail.value = {
      ...data,
      // 确保数组字段正确初始化
      supervisors: data.supervisors || [],
      leadLeaders: data.leadLeaders || []
    }
    
    // 时间显示现在直接基于活动节点数据，无需初始化冻结时间
    // 初始化编辑表单数据
    editForm.value.leadDept = data.leadDept ? data.leadDept.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []
    editForm.value.leadDeptNames = getLeadDeptNames()
    editForm.value.coDept = data.coDept || ''
    editForm.value.collaborateDepts = getCollaborateDepts(data.coDept)
    editForm.value.leadDeptDetail = data.deptDetail || ''
    editForm.value.orderTitle = data.orderTitle || ''
    editForm.value.content = data.content || ''
    editForm.value.type = data.type || 1
    editForm.value.detailType = data.detailType || ''
    editForm.value.priority = data.priority || 1
    editForm.value.deadline = data.deadline ? utilFormatDate(new Date(data.deadline), 'YYYY-MM-DD HH:mm:ss') : ''
    editForm.value.reportFrequency = data.reportFrequency
    // 初始化其他校领导ID数组
    editForm.value.otherLeaderIds = data.leadLeaders ? 
      data.leadLeaders.filter(leader => leader.type === '其他分管领导').map(leader => leader.id) : []
    // 初始化督办人ID数组
    editForm.value.supervisorIds = data.supervisors ? data.supervisors.map(supervisor => supervisor.id) : []
    // 初始化联系电话
    editForm.value.officePhone = data.officePhone || ''
    
    // 标记已读 - 获取到督办单详情后立即调用
    if (data.id) {
      await markOrderAsRead(data.id)
    }
    
  } catch (error) {
    console.error('根据流程实例ID获取督办单详情失败:', error)
    // 显示错误信息给用户
    ElMessage.error('获取督办单详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 标记督办单已读
const markOrderAsRead = async (orderId: number) => {
  try {
    await MarkReadApi.markRead(orderId)
  } catch (error) {
    // 静默失败，不影响用户体验
  }
}

// 格式化日期
const formatDate = (timestamp: number | string | null) => {
  if (!timestamp) return '未设置'
  
  let time: number
  if (typeof timestamp === 'string') {
    time = parseInt(timestamp)
  } else {
    time = timestamp
  }
  
  if (isNaN(time) || time <= 0) return '未设置'
  
  return utilFormatDate(new Date(time), 'YYYY年MM月DD日 HH:mm')
}

// 获取页面标题
const getPageTitle = () => {
  if (!orderDetail.value.type) {
    return '督办单详情'
  }

  // type: 1=工作督办, 2=专项督办
  if (orderDetail.value.type === 1) {
    return '广西大学工作督办单'
  } else if (orderDetail.value.type === 2) {
    return '广西大学专项督办单'
  } else {
    return '广西大学督办单'
  }
}

// 获取督办编号标签
const getOrderNumberLabel = () => {
  if (!orderDetail.value.type) {
    return '督办编号'
  }

  // type: 1=工作督办, 2=专项督办
  if (orderDetail.value.type === 1) {
    return '督办编号'  // 工作督办单显示"督办编号"
  } else if (orderDetail.value.type === 2) {
    return '督查编号'  // 专项督办单显示"督查编号"
  } else {
    return '督办编号'
  }
}

// 获取办理单位进度报告频次名称
const getReportFrequencyName = (frequency: number | undefined) => {
  if (!frequency) return '未设置'

  // 从字典中获取办理单位进度报告频次选项
  const frequencyOptions = getIntDictOptions(DICT_TYPE.REPORT_FREQUENCY)
  const option = frequencyOptions.find(item => item.value === frequency)

  if (option) {
    // 直接返回字典中的label，不再添加"汇报"前缀
    return option.label
  }

  return '未知频次'
}

// 获取督查办校领导显示文本
const getSupervisionLeaderDisplay = () => {
  if (!orderDetail.value.leadLeaders || !Array.isArray(orderDetail.value.leadLeaders)) {
    return '待办理单位确定后自动生成'
  }

  const supervisionLeaders = orderDetail.value.leadLeaders.filter(leader => leader.type === '督办领导')
  if (supervisionLeaders.length === 0) {
    return '待办理单位确定后自动生成'
  }

  return supervisionLeaders.map(leader => leader.name).join('、')
}

// 合并获取全部“校领导”显示文本（督查办分管校领导 + 办理单位分管校领导 + 其他校领导）
const getAllLeadersDisplay = () => {
  const names: string[] = []
  const pushNames = (arr: any[]) => {
    arr.forEach(item => {
      const n = item?.name
      if (n && !names.includes(n)) names.push(n)
    })
  }

  const list = orderDetail.value.leadLeaders || []
  // 督查办分管校领导
  pushNames(list.filter((l: any) => l.type === '督办领导'))
  // 办理单位分管校领导
  pushNames(list.filter((l: any) => l.type === '牵头领导'))
  // 其他校领导
  pushNames(list.filter((l: any) => l.type === '其他分管领导'))

  return names.length > 0 ? names.join('、') : '未设置'
}

// 获取办理单位分管校领导显示文本
const getUnitLeaderDisplay = () => {
  // 检查是否有办理单位
  const hasLeadDept = orderDetail.value.leadDept && 
    (Array.isArray(orderDetail.value.leadDept) ? orderDetail.value.leadDept.length > 0 : true)
  
  if (!orderDetail.value.leadLeaders || !Array.isArray(orderDetail.value.leadLeaders)) {
    return hasLeadDept ? '办理单位尚未设置分管校领导' : '待办理单位确定后自动生成'
  }

  const unitLeaders = orderDetail.value.leadLeaders.filter(leader => leader.type === '牵头领导')
  if (unitLeaders.length === 0) {
    return hasLeadDept ? '办理单位尚未设置分管校领导' : '待办理单位确定后自动生成'
  }

  return unitLeaders.map(leader => leader.name).join('、')
}

// 获取其他校领导显示文本
const getOtherLeadersDisplay = () => {
  if (!orderDetail.value.leadLeaders || !Array.isArray(orderDetail.value.leadLeaders)) {
    return '无'
  }

  const otherLeaders = orderDetail.value.leadLeaders.filter(leader => leader.type === '其他分管领导')
  if (otherLeaders.length === 0) {
    return '无'
  }

  return otherLeaders.map(leader => leader.name).join('、')
}

// 获取督办分类名称
const getTypeName = (type: number) => {
  const typeOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_TYPE)
  const option = typeOptions.find(item => item.value === type)
  return option?.label || '未知分类'
}

// 获取督办分类详细名称（支持直接传入值：字符串或数字）
const getDetailTypeName = (value: number | string | undefined) => {
  // 空值直接返回 undefined，调用方可兜底为"未设置"
  if (value == null) return undefined
  
  // 在 typeOptions 中查找匹配项
  const option = typeOptions.value.find(item => item.value == value || item.id == value)
  if (option) {
    return option.label
  }
  
  // 兜底：使用字典查找
  const dictOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_TYPE)
  const dictOption = dictOptions.find(item => item.value == value)
  return dictOption?.label
}

// 获取督办分类展示名称（优先使用 detailTypeId）
const getDetailTypeDisplayName = () => {
  // 优先使用 detailTypeId 匹配 typeOptions
  if (orderDetail.value.detailTypeId != null) {
    const option = typeOptions.value.find(item => item.value == orderDetail.value.detailTypeId || item.id == orderDetail.value.detailTypeId)
    if (option) {
      return option.label
    }
  }
  
  // 备选使用 detailTypeName
  if (orderDetail.value.detailTypeName) {
    return orderDetail.value.detailTypeName
  }
  
  // 兜底使用原有逻辑
  return getDetailTypeName(orderDetail.value.detailType ?? orderDetail.value.type) || '未设置'
}

// 获取督办依据名称
const getReasonName = (reason: number) => {
  const reasonOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_REASON)
  const option = reasonOptions.find(item => item.value === reason)
  return option?.label || '未知依据'
}

// 获取紧急程度名称
const getPriorityName = (priority: number) => {
  const priorityOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE)
  const option = priorityOptions.find(item => item.value === priority)
  return option?.label || '未知程度'
}

// 获取重要程度名称
const getSignificanceName = (significance: number) => {
  const significanceOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_SIGNIFICANCE_TYPE)
  const option = significanceOptions.find(item => item.value === significance)
  return option?.label || '未知程度'
}

// 获取协办单位列表（根据ID获取部门名称）
const getCollaborateDepts = (coDept: string | null) => {
  if (!coDept || coDept.trim() === '') return []

  // 将逗号分隔的ID字符串转换为部门名称数组
  const deptIds = coDept.split(',').filter(id => id.trim())
  return deptIds.map(deptId => {
    const id = parseInt(deptId.trim())
    if (isNaN(id)) return deptId.trim() // 如果不是数字，直接返回原值

    const dept = deptList.value.find(item => item.id === id)
    return dept?.name || `未知部门(${id})`
  })
}

// 获取督办人列表
const getSupervisorNames = () => {
  if (!orderDetail.value.supervisors || !Array.isArray(orderDetail.value.supervisors)) {
    return '未分配'
  }

  if (orderDetail.value.supervisors.length === 0) {
    return '未分配'
  }

  const supervisorNames = orderDetail.value.supervisors.map(s => s.name).filter(name => name)
  return supervisorNames.length > 0 ? supervisorNames.join('、') : '未分配'
}


// 获取督办人显示文本（用于只读模式）
const getSupervisorDisplay = () => {
  if (!orderDetail.value.supervisors || !Array.isArray(orderDetail.value.supervisors)) {
    return '未设置'
  }
  
  return orderDetail.value.supervisors
    .map(supervisor => supervisor.name || supervisor.nickname || supervisor.username || '未知')
    .join('、')
}


// 权限状态
const canEditLeadDept = ref(false)           // 办理单位编辑权限
const canEditCollaborateDepts = ref(false)   // 协办单位编辑权限
const canEditLeadDeptDetail = ref(false)     // 工作推进情况编辑权限


// 拟调整预览相关
const showDeptChangePreview = ref(false)
const deptChangePreview = ref({
  currentLeadDepts: [] as any[],
  proposedLeadDepts: [] as any[],
  currentCoDepts: [] as any[],
  proposedCoDepts: [] as any[]
})

// 多节点临时变更预览相关
const showMultiNodeChangePreview = ref(false)
const multiNodeChangePreview = ref<Record<string, any>>({})

// 拟变更预览相关
const showChangePreview = ref(false)
const changePreview = ref({
  leadDept: {
    changed: false,
    oldIds: [] as number[],
    newIds: [] as number[],
    oldDisplay: '',
    newDisplay: ''
  },
  coDept: {
    changed: false,
    oldIds: [] as number[],
    newIds: [] as number[],
    oldDisplay: '',
    newDisplay: ''
  },
  deadline: {
    changed: false,
    oldValue: '',
    newValue: '',
    oldDisplay: '',
    newDisplay: ''
  }
})

// 终止后刷新详情（与 onMounted 时的加载逻辑保持一致）
const refreshDetailAfterTerminate = async () => {
  const processInstanceId = props.id?.toString() || 
                           (route.query.processInstanceId as string) || 
                           (route.params.id as string) || 
                           (route.query.id as string)
  if (!processInstanceId) return
  
  try {
    await Promise.all([
      getOrderDetail(processInstanceId),
      getProgressRecords(processInstanceId, isExpanded.value)
    ])
  } catch (error) {
    console.error('❌ 刷新详情失败:', error)
  }
  
  await getWorkflowDetail(processInstanceId)
  
  // 轻量轮询确保终止节点出现在时间线上
  let retryCount = 0
  const maxRetries = 5
  const retryInterval = 400
  
  while (retryCount < maxRetries) {
    await getFullApprovalDetail(processInstanceId)
    
    // 检查是否已有终止节点
    const hasTerminateNode = fullActivityNodes.value.some(node => 
      node.name?.startsWith('[终止]') || 
      (node.processDefinitionKey === 'supervision_terminate')
    )
    
    if (hasTerminateNode) {
      console.log(`✅ 终止节点已出现在时间线上，停止轮询 (第${retryCount + 1}次)`)
      break
    }
    
    retryCount++
    if (retryCount < maxRetries) {
      console.log(`⏳ 第${retryCount}次未检测到终止节点，${retryInterval}ms后重试...`)
      await new Promise(resolve => setTimeout(resolve, retryInterval))
    }
  }
  
  if (retryCount >= maxRetries) {
    console.log('⚠️ 达到最大重试次数，终止节点可能需要手动刷新页面查看')
  }
}

// 流程实例变量缓存
const processVars = ref<Record<string, any>>({})

const canEditOrderTitle = ref(false)         // 督办事项编辑权限
const canEditContent = ref(false)            // 主要内容编辑权限
const canEditType = ref(false)               // 督办分类编辑权限
const canEditPriority = ref(false)           // 紧急程度编辑权限
const canEditDeadline = ref(false)           // 完成期限编辑权限
const canEditReportFrequency = ref(false)    // 办理单位进度报告频次编辑权限
const canEditOtherLeaders = ref(false)       // 其他校领导编辑权限
const canEditSupervisors = ref(false)        // 督办人编辑权限
const canEditOfficePhone = ref(false)        // 联系电话编辑权限

// 创建必填字段配置
const CREATION_REQUIRED_FIELDS = [
  'orderTitle',      // 督办事项
  'content',         // 主要内容
  'detailType',      // 督办分类
  'priority',        // 紧急程度
  'deadline',        // 完成期限
  'reportFrequency', // 办理单位进度报告频次
  'supervisors',     // 督办人
  'officePhone'      // 联系电话
]

// 字段中文名映射
const FIELD_LABEL_MAP: Record<string, string> = {
  orderTitle: '督办事项',
  content: '主要内容',
  detailType: '督办分类',
  priority: '紧急程度',
  deadline: '完成期限',
  reportFrequency: '办理单位进度报告频次',
  supervisors: '督办人',
  officePhone: '联系电话',
  leadDept: '办理单位',
  leadDeptDetail: '工作推进情况'
}

// 字段权限映射
const FIELD_PERM_MAP: Record<string, string> = {
  orderTitle: 'canEditOrderTitle',
  content: 'canEditContent',
  detailType: 'canEditType',
  priority: 'canEditPriority',
  deadline: 'canEditDeadline',
  reportFrequency: 'canEditReportFrequency',
  supervisors: 'canEditSupervisors',
  officePhone: 'canEditOfficePhone',
  leadDept: 'canEditLeadDept',
  leadDeptDetail: 'canEditLeadDeptDetail'
}

// 完整的活动节点数据（从审批详情API获取）
const fullActivityNodes = ref<any[]>([])

// 获取工作流详情（补充缺失的函数）
const getWorkflowDetail = async (processInstanceId: string) => {
  // 为保持兼容性，这里可以是空实现或调用相同接口
  // 主要的节点数据由 getFullApprovalDetail 负责获取
}

// 获取完整的审批详情（包含完整的活动节点信息）
const getFullApprovalDetail = async (processInstanceId: string) => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processInstanceId: processInstanceId
    })

    if (data && data.activityNodes) {
      fullActivityNodes.value = data.activityNodes
      
      // 缓存流程变量到 processVars
      if (data.processInstance && data.processInstance.formVariables) {
        processVars.value = data.processInstance.formVariables
      } else if (data.processInstance && data.processInstance.processVariables) {
        processVars.value = data.processInstance.processVariables
      } else if (data.processVariables) {
        processVars.value = data.processVariables
      } else {
        processVars.value = {}
      }
      
      // 立即刷新权限，确保权限状态及时更新
      await checkAllPermissions()
    }
  } catch (error) {
    console.error('获取完整审批详情失败:', error)
  }
}

// 获取当前工作流节点（可能有多个并行节点）
const getCurrentWorkflowNodes = () => {
  if (fullActivityNodes.value && fullActivityNodes.value.length > 0) {
    const runningNodes = fullActivityNodes.value.filter(node => node.status === 1)
    return runningNodes.map(node => node.id || node.taskDefinitionKey || node.activityId).filter(id => id)
  }
  return []
}

// 节点权限配置映射表
const NODE_PERMISSIONS = {
  'select_leaddept': {
    leadDept: true,           // 督办人可编辑办理单位
    collaborateDepts: true,  //可编辑协办单位
    leadDeptDetail: false,    // 
    attachments: true         //如有编辑权限可上传附件
  },
  'implement_plan': {
    leadDept: false,          // 
    collaborateDepts: false,  // 协办单位不可编辑
    leadDeptDetail: true,     //牵头/协办负责人可编辑工作推进情况
    attachments: true         // 如有编辑权限可上传附件
  },
  'upload_plan': {
    leadDept: false,          // 
    collaborateDepts: true,   // 办理单位负责人可编辑协办单位
    leadDeptDetail: true,     // 办理/协办负责人可编辑工作推进情况
    attachments: true         //  如有编辑权限可上传附件
  },
  'co_dept': {
    leadDept: false,
    collaborateDepts: false,
    leadDeptDetail: true,     // 协办负责人可编辑工作推进情况
    attachments: true
  },
  // 【需求变更】de_director_check 节点无编辑权限，所有字段权限设为 false
  'de_director_check': {
    orderTitle: false,        // 不可编辑督办事项
    content: false,           // 不可编辑主要内容
    type: false,              // 不可编辑督办分类
    priority: false,          // 不可编辑紧急程度
    deadline: false,          // 不可编辑完成期限
    reportFrequency: false,   // 不可编辑办理单位进度报告频次
    otherLeaders: false,      // 不可编辑其他校领导
    supervisors: false,       // 不可编辑督办人
    officePhone: false,       // 不可编辑联系电话
    leadDept: false,          // 不可编辑办理单位
    collaborateDepts: false,  // 不可编辑协办单位
    attachments: false        // 不可上传附件
  },
  'director_check': {
    orderTitle: true,         // 可编辑督办事项
    content: true,            // 可编辑主要内容
    type: true,               // 可编辑督办分类
    priority: true,           // 可编辑紧急程度
    deadline: true,           // 可编辑完成期限
    reportFrequency: true,    // 可编辑办理单位进度报告频次
    otherLeaders: true,       // 可编辑其他校领导
    supervisors: true,        // 可编辑督办人
    officePhone: true,        // 可编辑联系电话
    leadDept: true,           // 可编辑办理单位
    collaborateDepts: true,   // 可编辑协办单位
    attachments: true         // 可上传附件
  },
  'update_materials': {
    orderTitle: true,         // 可编辑督办事项
    content: true,            // 可编辑主要内容
    type: true,               // 可编辑督办分类
    priority: true,           // 可编辑紧急程度
    deadline: true,           // 可编辑完成期限
    reportFrequency: true,    // 可编辑办理单位进度报告频次
    otherLeaders: true,       // 可编辑其他校领导
    supervisors: true,        // 可编辑督办人
    officePhone: true,        // 可编辑联系电话
    leadDept: true,           // 可编辑办理单位
    collaborateDepts: true,   // 可编辑协办单位
    attachments: true         // 可上传附件
  },
  'administrator_review': {
    orderTitle: true,         // 可编辑督办事项（同 update_materials）
    content: true,            // 可编辑主要内容
    type: true,               // 可编辑督办分类
    priority: true,           // 可编辑紧急程度
    deadline: true,           // 可编辑完成期限
    reportFrequency: true,    // 可编辑办理单位进度报告频次
    otherLeaders: true,       // 可编辑其他校领导
    supervisors: true,        // 可编辑督办人
    officePhone: true,        // 可编辑联系电话
    leadDept: true,           // 可编辑办理单位
    collaborateDepts: true,   // 可编辑协办单位
    attachments: true         // 可上传附件
  }
}

// 检查当前用户的所有编辑权限
const checkCurrentUserPermissions = () => {
  const currentUserId = userStore.getUser?.id
  if (!currentUserId || !fullActivityNodes.value.length) {
    return { 
      leadDept: false, 
      collaborateDepts: false, 
      leadDeptDetail: false, 
      attachments: false,
      orderTitle: false,
      content: false,
      type: false,
      priority: false,
      deadline: false,
      reportFrequency: false,
      otherLeaders: false,
      supervisors: false,
      officePhone: false
    }
  }

  const permissions = {
    leadDept: false,
    collaborateDepts: false,
    leadDeptDetail: false,
    attachments: false,
    orderTitle: false,
    content: false,
    type: false,
    priority: false,
    deadline: false,
    reportFrequency: false,
    otherLeaders: false,
    supervisors: false,
    officePhone: false
  }

  // 遍历所有运行中的活动节点
  fullActivityNodes.value.forEach(node => {
    if (node.status !== 1) return // 只处理运行中的节点

    const nodeId = node.id || node.taskDefinitionKey || node.activityId
    let hasAccess = false

    // 检查节点的tasks中是否有当前用户
    if (node.tasks && node.tasks.length > 0) {
      hasAccess = node.tasks.some(task =>
        (task.assigneeUser && Number(task.assigneeUser.id) === Number(currentUserId)) ||
        (task.ownerUser && Number(task.ownerUser.id) === Number(currentUserId))
      )
    }

    // 检查candidateUsers
    if (!hasAccess && node.candidateUsers && node.candidateUsers.length > 0) {
      hasAccess = node.candidateUsers.some(user => Number(user.id) === Number(currentUserId))
    }

    if (!hasAccess) return

    // 根据节点ID获取权限配置
    const nodePermissions = NODE_PERMISSIONS[nodeId]
    if (nodePermissions) {
      Object.keys(nodePermissions).forEach(key => {
        if (nodePermissions[key]) {
          permissions[key] = true
        }
      })
    }
  })

  return permissions
}

// 统一权限检查（替换原有的三个权限检查方法）
const checkAllPermissions = async () => {
  const permissions = checkCurrentUserPermissions()

  // 检查督办是否已中止 - 中止状态下禁止提交进度
  const isSuspended = orderDetail.value?.supervisionStatus === 6
  
  // 更新权限状态 - 如果已中止且当前用户不是特权用户，则禁用进度提交权限
  canEditLeadDept.value = permissions.leadDept
  canEditCollaborateDepts.value = permissions.collaborateDepts
  canEditLeadDeptDetail.value = isSuspended && !canSuspendResume() ? false : permissions.leadDeptDetail
  canEditOrderTitle.value = permissions.orderTitle
  canEditContent.value = permissions.content
  canEditType.value = permissions.type
  canEditPriority.value = permissions.priority
  canEditDeadline.value = permissions.deadline
  canEditReportFrequency.value = permissions.reportFrequency
  canEditOtherLeaders.value = permissions.otherLeaders
  canEditSupervisors.value = permissions.supervisors
  canEditOfficePhone.value = permissions.officePhone
  
  // 检查是否需要显示拟调整预览
  checkDeptChangePreview()

  // 附件权限基于是否有任何编辑权限
  const hasAnyEditPermission = permissions.leadDept ||
                               permissions.collaborateDepts ||
                               permissions.leadDeptDetail ||
                               permissions.orderTitle ||
                               permissions.content ||
                               permissions.type ||
                               permissions.priority ||
                               permissions.deadline ||
                               permissions.reportFrequency ||
                               permissions.otherLeaders ||
                               permissions.supervisors ||
                               permissions.officePhone
  // 这里可以根据实际需求调整附件权限逻辑

}

const hasEditPermission = computed(() => {
  return canEditLeadDept.value || canEditCollaborateDepts.value || canEditLeadDeptDetail.value ||
         canEditOrderTitle.value || canEditContent.value || canEditType.value ||
         canEditPriority.value || canEditDeadline.value || canEditReportFrequency.value ||
         canEditOtherLeaders.value || canEditSupervisors.value || canEditOfficePhone.value
})

// 监听督办单数据变化，重新检查权限
watch(
  () => [orderDetail.value.supervisors, orderDetail.value.leadDept, orderDetail.value.coDept],
  async () => {
    if (orderDetail.value.id) {
      await checkAllPermissions()
      
      // 初始化 editForm 的协办单位相关字段（防止首次编辑时数据不一致）
      if (orderDetail.value.coDept && (!editForm.value.collaborateDeptIds || editForm.value.collaborateDeptIds.length === 0)) {
        const { coDeptArray } = ensureDataConsistency(orderDetail.value.coDept)
        editForm.value.collaborateDeptIds = coDeptArray
        editForm.value.coDept = orderDetail.value.coDept
        
        // 同步协办单位名称数组
        editForm.value.collaborateDepts = coDeptArray.map(deptId => {
          const dept = deptList.value.find(item => item.id === deptId)
          return dept?.name || `未知部门(${deptId})`
        })
      }
    }
  },
  { deep: true }
)

// 解析概述信息
const parsedSummary = computed(() => {
  const summary = orderDetail.value.summary || ''
  if (!summary) return []

  // 如果是字符串格式，按行分割并解析
  if (typeof summary === 'string') {
    return summary.split('\n').filter(line => line.trim()).map(line => {
      const colonIndex = line.indexOf('：')
      if (colonIndex === -1) {
        return {
          label: line.trim(),
          value: ''
        }
      }
      return {
        label: line.substring(0, colonIndex).trim(),
        value: line.substring(colonIndex + 1).trim()
      }
    })
  }

  return []
})

// 获取督办单工作流更新数据（只传递修改的字段）
const getSupervisionWorkflowUpdateData = async (startLeaderSelectAssignees?: Record<string, number[]>) => {
  const updateData: any = {
    id: orderDetail.value.id // 督办单ID必传
  }

  // 处理督办事项
  if (canEditOrderTitle.value && editForm.value.orderTitle !== orderDetail.value.orderTitle) {
    updateData.orderTitle = editForm.value.orderTitle
  }

  // 处理主要内容
  if (canEditContent.value && editForm.value.content !== orderDetail.value.content) {
    updateData.content = editForm.value.content
  }

  // 处理督办分类
  if (canEditType.value && editForm.value.detailType !== orderDetail.value.detailType) {
    updateData.detailType = editForm.value.detailType
  }

  // 处理紧急程度
  if (canEditPriority.value && editForm.value.priority !== orderDetail.value.priority) {
    updateData.priority = editForm.value.priority
  }

  // 处理完成期限
  if (canEditDeadline.value && editForm.value.deadline) {
    // 统一转换为毫秒时间戳进行比较
    const newDeadlineMillis = new Date(editForm.value.deadline).getTime()
    const oldDeadlineMillis = orderDetail.value.deadline || 0
    
    if (newDeadlineMillis !== oldDeadlineMillis) {
      // 发送给后端时使用字符串格式（yyyy-MM-dd HH:mm:ss）
      updateData.deadline = editForm.value.deadline
    }
  }

  // 处理办理单位进度报告频次
  if (canEditReportFrequency.value && editForm.value.reportFrequency !== orderDetail.value.reportFrequency) {
    updateData.reportFrequency = editForm.value.reportFrequency
  }

  // 处理其他校领导
  if (canEditOtherLeaders.value) {
    const currentOtherLeaderIds = orderDetail.value.leadLeaders ? 
      orderDetail.value.leadLeaders.filter(leader => leader.type === '其他分管领导').map(leader => leader.id) : []
    const newOtherLeaderIds = editForm.value.otherLeaderIds || []
    
    // 比较数组是否有变化
    const hasChanged = currentOtherLeaderIds.length !== newOtherLeaderIds.length ||
      !currentOtherLeaderIds.every(id => newOtherLeaderIds.includes(id))
    
    if (hasChanged) {
      updateData.otherLeaders = newOtherLeaderIds.join(',')
    }
  }

  // 处理督办人
  if (canEditSupervisors.value) {
    const currentSupervisorIds = orderDetail.value.supervisors ? 
      orderDetail.value.supervisors.map(supervisor => supervisor.id) : []
    const newSupervisorIds = editForm.value.supervisorIds || []
    
    // 比较数组是否有变化
    const hasChanged = currentSupervisorIds.length !== newSupervisorIds.length ||
      !currentSupervisorIds.every(id => newSupervisorIds.includes(id))
    
    if (hasChanged) {
      updateData.supervisors = newSupervisorIds.join(',')
    }
  }

  // 处理联系电话
  if (canEditOfficePhone.value && editForm.value.officePhone !== (orderDetail.value.officePhone || '')) {
    updateData.officePhone = editForm.value.officePhone
  }

  // 处理协办单位数据
  if (canEditCollaborateDepts.value) {
    // 在 upload_plan 节点，总是提交协办单位数据（包括清空的情况）
    const coDeptSource = editForm.value.coDept || ''
    if (coDeptSource) {
      const { coDeptString, coDeptArray } = ensureDataConsistency(coDeptSource)
      updateData.coDept = coDeptString
    } else {
      // 支持清空协办单位
      updateData.coDept = ''
    }
    // 工作流审批人配置由后端自动设置，前端不需要处理
  } else if (orderDetail.value.coDept) {
    // 无编辑权限时，保持原有数据
    const { coDeptString, coDeptArray } = ensureDataConsistency(orderDetail.value.coDept)
    updateData.coDept = coDeptString
  }
  // 处理办理单位（督办人可编辑）
  if (canEditLeadDept.value && editForm.value.leadDept.length > 0) {
    // 将数组转换为逗号分隔的字符串（与协办单位格式保持一致）
    updateData.leadDept = editForm.value.leadDept.join(',')
  } else if (orderDetail.value.leadDept) {
    // 兼容现有数据格式
    if (Array.isArray(orderDetail.value.leadDept)) {
      updateData.leadDept = orderDetail.value.leadDept.join(',')
    } else {
      updateData.leadDept = String(orderDetail.value.leadDept)
    }
  }
  // 处理工作推进情况
  if (canEditLeadDeptDetail.value && editForm.value.leadDeptDetail) {
    updateData.deptDetail = editForm.value.leadDeptDetail
  }
  return updateData
}
// 获取字段有效值
const getEffectiveValue = (field: string): any => {
  // 优先取编辑表单的值，否则取详情数据的值
  const editValue = (editForm.value as any)[field]
  const detailValue = (orderDetail.value as any)[field]
  return editValue !== undefined && editValue !== null ? editValue : detailValue
}

// 判断字段是否可编辑
const isEditable = (field: string): boolean => {
  const permKey = FIELD_PERM_MAP[field]
  if (!permKey) return false
  
  // 通过权限映射获取对应的权限标志
  const permMap: Record<string, any> = {
    canEditOrderTitle: canEditOrderTitle.value,
    canEditContent: canEditContent.value,
    canEditType: canEditType.value,
    canEditPriority: canEditPriority.value,
    canEditDeadline: canEditDeadline.value,
    canEditReportFrequency: canEditReportFrequency.value,
    canEditSupervisors: canEditSupervisors.value,
    canEditOfficePhone: canEditOfficePhone.value,
    canEditLeadDept: canEditLeadDept.value,
    canEditLeadDeptDetail: canEditLeadDeptDetail.value
  }
  
  return !!permMap[permKey]
}

// 通用空值判断
const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'number') return false // 数字0也是有效值
  return false
}

// 详情页：督办人变化时自动获取联系电话（对齐创建页逻辑）
const handleSupervisorChange = async (userIds: number[]) => {
  if (!Array.isArray(userIds)) {
    userIds = []
  }
  if (phoneLoading.value) {
    return
  }
  if (userIds.length >= 1) {
    phoneLoading.value = true
    try {
      const phonePromises = userIds.map(userId =>
        OrderApi.getSupervisorPhone(userId).catch(() => '')
      )
      const phoneResults = await Promise.all(phonePromises)
      const validPhones = phoneResults
        .filter(phone => phone && typeof phone === 'string' && phone.trim() !== '')
        .map(phone => phone.trim())
        .filter((phone, index, arr) => arr.indexOf(phone) === index)
      if (validPhones.length > 0) {
        editForm.value.officePhone = validPhones.join(',')
      } else {
        editForm.value.officePhone = ''
        ElMessage.warning('所选督办人均未设置手机号，请手动填写联系电话')
      }
      if (validPhones.length < userIds.length && validPhones.length > 0) {
        ElMessage.info(`已自动填入${validPhones.length}个督办人的手机号，其余请手动补充`)
      }
    } catch (error) {
      editForm.value.officePhone = ''
      ElMessage.warning('无法获取督办人手机号，请手动填写联系电话')
    } finally {
      phoneLoading.value = false
    }
  } else {
    editForm.value.officePhone = ''
  }
}

// 统一校验入口
const validateBeforeUpdate = async (contextTaskKey?: string): Promise<void> => {
  // 节点特定规则校验
  if (contextTaskKey) {
    switch (contextTaskKey) {
      case 'select_leaddept':
        // 督办人选择办理部门节点 - 检查办理单位
        const leadDeptValue = getEffectiveValue('leadDept')
        if (isEmpty(leadDeptValue)) {
          throw new Error('请先选择办理单位')
        }
        break
        
      case 'implement_plan':
      case 'upload_plan':
      case 'co_dept':
        // 必须上传工作推进的节点：基于当前节点进入时间 + 当前用户的严格校验
        await validateProgressForRequiredNodes(contextTaskKey)
        break
    }
  }
}

// 必须上传工作推进节点的严格校验
const validateProgressForRequiredNodes = async (contextTaskKey: string): Promise<void> => {
  // 获取当前用户信息
  const currentUser = userStore.getUser
  const currentUserNickname = currentUser?.nickname
  
  if (!currentUserNickname) {
    throw new Error('无法获取当前用户信息，请重新登录')
  }
  
  // 获取当前节点的进入时间
  const currentTaskStartTime = getCurrentTaskStartTime(contextTaskKey)
  
  // 检查进度记录
  if (!Array.isArray(progressRecords.value) || progressRecords.value.length === 0) {
    throw new Error('请通过"添加工作推进"功能填写工作推进情况')
  }
  
  // 查找符合条件的进度记录：当前用户在当前节点进入后创建的
  const validProgressRecords = progressRecords.value.filter(record => {
    const isCurrentUser = record.creatorNickName === currentUserNickname
    const isAfterTaskStart = currentTaskStartTime ? record.createTime >= currentTaskStartTime : true
    return isCurrentUser && isAfterTaskStart
  })
  
  if (validProgressRecords.length === 0) {
    throw new Error('请先新增一条工作推进记录再提交')
  }
}

// 获取当前节点的进入时间
const getCurrentTaskStartTime = (contextTaskKey: string): number | null => {
  if (!fullActivityNodes.value || fullActivityNodes.value.length === 0) {
    return null
  }
  
  // 查找当前运行中的指定节点
  const currentNode = fullActivityNodes.value.find(node => 
    node.status === 1 && // 运行中
    (node.id === contextTaskKey || node.taskDefinitionKey === contextTaskKey || node.activityId === contextTaskKey)
  )
  
  if (currentNode && currentNode.startTime) {
    return currentNode.startTime
  }
  
  // 如果找不到具体节点，尝试从当前运行的任务中获取最早的开始时间
  const runningNodes = fullActivityNodes.value.filter(node => node.status === 1)
  if (runningNodes.length > 0) {
    const earliestStartTime = Math.min(...runningNodes.map(node => node.startTime || Date.now()).filter(time => time))
    return earliestStartTime
  }
  
  return null
}

// 创建必填字段校验（仅校验当前可编辑的字段）
const validateRequiredFields = (): void => {
  for (const field of CREATION_REQUIRED_FIELDS) {
    if (isEditable(field)) {
      const value = getEffectiveValue(field)
      const fieldLabel = FIELD_LABEL_MAP[field] || field

      if (isEmpty(value)) {
        throw new Error(`请填写${fieldLabel}`)
      }
    }
  }
}

const updateSupervisionOrder = async (startLeaderSelectAssignees?: Record<string, number[]>, contextTaskKey?: string) => {
  try {
    // 统一校验入口
    await validateBeforeUpdate(contextTaskKey)
    
    // 移除了待提交进度更新的逻辑，现在进度更新直接提交

    const updateData = await getSupervisionWorkflowUpdateData(startLeaderSelectAssignees)

    // 仅在 select_leaddept 节点：精确判断办理/协办单位是否发生变化，设置 deptChangeFlag 供流程条件使用
    try {
      const currentNodes: string[] = getCurrentWorkflowNodes()
      if (Array.isArray(currentNodes) && currentNodes.includes('select_leaddept')) {
        const normalizeCsv = (str: any): string => {
          const s = (str ?? '').toString()
          return s.split(',').map((x: string) => x.trim()).filter(Boolean).sort().join(',')
        }
        const isCsvEqual = (a: any, b: any): boolean => normalizeCsv(a) === normalizeCsv(b)

        const oldLead = orderDetail.value.leadDept || ''
        const oldCo = orderDetail.value.coDept || ''
        const newLead = (updateData as any).leadDept !== undefined ? (updateData as any).leadDept : oldLead
        const newCo = (updateData as any).coDept !== undefined ? (updateData as any).coDept : oldCo

        const changed = !isCsvEqual(oldLead, newLead) || !isCsvEqual(oldCo, newCo)
        ;(updateData as any).deptChangeFlag = changed ? 1 : 2
      }
    } catch (e) {
      // 安全兜底，出现异常不影响正常提交
    }

    // 检查当前是否为 select_leaddept、upload_plan 或 update_materials 节点（这些节点不直接落库）
    const currentNodes: string[] = getCurrentWorkflowNodes()
    const isSelectLeadDeptNode = Array.isArray(currentNodes) && currentNodes.includes('select_leaddept')
    const isUploadPlanNode = Array.isArray(currentNodes) && currentNodes.includes('upload_plan')
    const isUpdateMaterialsNode = Array.isArray(currentNodes) && currentNodes.includes('update_materials')
    
    // 只有当有实际修改的字段时才调用接口
    const hasChanges = (updateData.leadDept !== undefined) ||
                      (updateData.coDept !== undefined) ||
                      (updateData.deptDetail !== undefined) ||
                      (updateData.orderTitle !== undefined) ||
                      (updateData.content !== undefined) ||
                      (updateData.type !== undefined) ||
                      (updateData.priority !== undefined) ||
                      (updateData.deadline !== undefined) ||
                      (updateData.reportFrequency !== undefined) ||
                      (updateData.otherLeaders !== undefined) ||
                      (updateData.supervisors !== undefined) ||
                      (updateData.officePhone !== undefined)

    if (hasChanges) {
      // select_leaddept、upload_plan 和 update_materials 节点：不直接更新数据库，只更新本地状态
      if (isSelectLeadDeptNode || isUploadPlanNode || isUpdateMaterialsNode) {
        // 不调用 OrderApi.updateOrderInWorkflow，只更新本地状态
        console.log(`[updateSupervisionOrder] ${currentNodes.join(',')} 节点跳过直接更新接口，仅更新本地状态`)
      } else {
        // 其他节点：正常调用更新接口
        await OrderApi.updateOrderInWorkflow(updateData)
      }

      // 更新本地数据
      if (updateData.leadDept !== undefined) {
        // 更新本地数据为数组格式
        orderDetail.value.leadDept = editForm.value.leadDept
      }
      if (canEditCollaborateDepts.value && updateData.coDept !== undefined) {
        orderDetail.value.coDept = editForm.value.coDept
      }
      if (canEditLeadDeptDetail.value && updateData.deptDetail !== undefined) {
        orderDetail.value.deptDetail = editForm.value.leadDeptDetail
      }
      if (canEditOrderTitle.value && updateData.orderTitle !== undefined) {
        orderDetail.value.orderTitle = editForm.value.orderTitle
      }
      if (canEditContent.value && updateData.content !== undefined) {
        orderDetail.value.content = editForm.value.content
      }
      if (canEditType.value && updateData.type !== undefined) {
        orderDetail.value.type = editForm.value.type
      }
      if (canEditPriority.value && updateData.priority !== undefined) {
        orderDetail.value.priority = editForm.value.priority
      }
      if (canEditDeadline.value && updateData.deadline !== undefined) {
        orderDetail.value.deadline = updateData.deadline
      }
      if (canEditReportFrequency.value && updateData.reportFrequency !== undefined) {
        orderDetail.value.reportFrequency = editForm.value.reportFrequency
      }
      // 更新其他校领导本地数据
      if (canEditOtherLeaders.value && updateData.otherLeaders !== undefined) {
        // 更新leadLeaders数组中的其他分管领导
        const otherLeaderUsers = userList.value.filter(user => editForm.value.otherLeaderIds.includes(user.id))
        const existingLeaders = orderDetail.value.leadLeaders ? 
          orderDetail.value.leadLeaders.filter(leader => leader.type !== '其他分管领导') : []
        const newOtherLeaders = otherLeaderUsers.map(user => ({
          id: user.id,
          name: user.nickname,
          type: '其他分管领导'
        }))
        orderDetail.value.leadLeaders = [...existingLeaders, ...newOtherLeaders]
      }
      // 更新督办人本地数据
      if (canEditSupervisors.value && updateData.supervisors !== undefined) {
        const supervisorUsers = userList.value.filter(user => editForm.value.supervisorIds.includes(user.id))
        orderDetail.value.supervisors = supervisorUsers.map(user => ({
          id: user.id,
          name: user.nickname,
          phone: user.mobile || ''
        }))
      }
      // 更新联系电话本地数据
      if (canEditOfficePhone.value && updateData.officePhone !== undefined) {
        orderDetail.value.officePhone = editForm.value.officePhone
      }
    }
    // 返回更新的数据，供工作流使用
    return {
      success: true,
      data: updateData
    }
  } catch (error) {
    console.error('更新督办单失败:', error)
    // 提取具体错误信息
    const errorMessage = extractErrorMessage(error)
    
    // 如果是用户取消协办单位选择，静默返回，不显示错误
    if (errorMessage === 'USER_CANCELLED_COLLABORATE_DEPT_SELECTION') {
      return {
        success: false,
        data: null
      }
    }
    
    // 向上抛出具体错误，避免上层显示通用错误
    throw new Error(errorMessage)
  }
}

// 检查是否需要显示部门变更预览
const checkDeptChangePreview = async () => {
  const currentNodes = getCurrentWorkflowNodes()
  
  const isApprovalNode = currentNodes.some(node => 
    ['supervisor_review', 'de_director_check', 'director_check', 'de_director_recheck', 'director_recheck', 'administrator_review'].includes(node)
  )
  
  if (!isApprovalNode) {
    showDeptChangePreview.value = false
    showChangePreview.value = false
    return
  }
  
  // 检查是否已有缓存的流程变量，如果没有则等待 getFullApprovalDetail 完成
  if (!processVars.value || Object.keys(processVars.value).length === 0) {
    // 这里不需要手动调用，因为 getFullApprovalDetail 会在页面加载时自动调用并缓存变量
    return
  }
  
  await calculateChangePreview()
}

// 处理办理单位变化
const handleLeadDeptChange = (deptIds: number[]) => {
  editForm.value.leadDept = deptIds || []
  // 更新办理单位名称显示
  editForm.value.leadDeptNames = deptIds.map(deptId => {
    const dept = deptList.value.find(item => item.id === deptId)
    return dept?.name || `未知部门(${deptId})`
  })
  
  // 智能处理协办单位：仅移除与新办理单位冲突的协办单位，保留其它协办单位
  const newLeadDeptIds = deptIds || []
  let currentCollaborateDeptIds = editForm.value.collaborateDeptIds || []
  
  // 兜底逻辑：如果 collaborateDeptIds 为空，尝试从 coDept 或 orderDetail.coDept 解析
  if (currentCollaborateDeptIds.length === 0) {
    const coDeptSource = editForm.value.coDept || orderDetail.value.coDept || ''
    if (coDeptSource) {
      const { coDeptArray } = ensureDataConsistency(coDeptSource)
      currentCollaborateDeptIds = coDeptArray
    }
  }
  
  // 过滤掉与办理单位重复的协办单位ID
  const filteredCollaborateDeptIds = currentCollaborateDeptIds.filter(
    collaborateId => !newLeadDeptIds.includes(collaborateId)
  )
  
  // 更新协办单位相关字段
  editForm.value.collaborateDeptIds = filteredCollaborateDeptIds
  editForm.value.coDept = filteredCollaborateDeptIds.join(',')
  
  // 更新协办单位名称数组（用于显示）
  editForm.value.collaborateDepts = filteredCollaborateDeptIds.map(deptId => {
    const dept = deptList.value.find(item => item.id === deptId)
    return dept?.name || `未知部门(${deptId})`
  })
}

// 处理协办单位变化
const handleCollaborateDeptsChange = (deptNames: string[]) => {
  editForm.value.collaborateDeptIds = []
  deptNames.forEach(name => {
    const dept = deptList.value.find(d => d.name === name)
    if (dept) {
      editForm.value.collaborateDeptIds.push(dept.id)
    }
  })
  editForm.value.coDept = editForm.value.collaborateDeptIds.join(',')
}



// 确保协办单位数据格式一致性的辅助函数
const ensureDataConsistency = (coDeptString: string): { coDeptString: string, coDeptArray: number[] } => {
  if (!coDeptString || coDeptString.trim() === '') {
    return { coDeptString: '', coDeptArray: [] }
  }

  // 处理字符串，分割并转换为数字
  const coDeptArray = coDeptString.split(',')
    .map(id => {
      const trimmed = id.trim()
      const parsed = parseInt(trimmed)
      return parsed
    })
    .filter(id => !isNaN(id))

  const consistentString = coDeptArray.join(',')

  return {
    coDeptString: consistentString,
    coDeptArray: coDeptArray
  }
}

// 进度更新记录相关方法
// 获取进度更新记录
const getProgressRecords = async (processInstanceId: string, showAll: boolean = true) => {
  if (!processInstanceId) return

  try {
    const data = await OrderApi.getSupervisionTaskDetail(processInstanceId, showAll)

    // 处理不同的响应格式
    let apiData: any
    if (data && data.data) {
      apiData = data.data
    } else if (data && data.code === 0) {
      apiData = data.data
    } else if (data) {
      apiData = data
    }

    if (apiData) {
      // 根据showAll参数决定使用哪个数据源
      let recordsToProcess: any[] = []

      if (showAll) {
        recordsToProcess = apiData.allRecords || apiData.latestRecords || []
      } else {
        recordsToProcess = apiData.latestRecords || []
      }

      if (Array.isArray(recordsToProcess) && recordsToProcess.length > 0) {
        const formattedRecords = recordsToProcess.map((record: any, index: number) => {
          const expectedTimeFormatted = record.planTime ? formatTimestamp(record.planTime) : ''
          
          return {
            // 展示字段
            title: record.creatorDeptName || '未知部门',
            handler: record.creatorNickName || '',
            description: record.deptDetail || '', // 不再默认显示'暂无详细信息'
            remark: record.remark || '', // 保留批示字段
            expectedTime: expectedTimeFormatted,
            time: record.createTime ? formatTimestamp(record.createTime) : (record.planTime ? formatTimestamp(record.planTime) : ''),
            attachments: record.fileList && Array.isArray(record.fileList) ? record.fileList : [],
            createTime: record.createTime || 0,
            isLatest: false,
            // 原始字段（用于严格校验）
            creatorNickName: record.creatorNickName || '',
            creatorUserId: record.creatorUserId ?? record.creatorId ?? null,
            id: record.id, // 保留任务记录ID，用于sourceTaskId传递
            // 结构化字段
            recordType: record.recordType,
            targetUserId: record.targetUserId,
            decision: record.decision,
            periodDate: record.periodDate,
            sourceTaskId: record.sourceTaskId,
            originalContent: record.originalContent
          }
        })

        // 按时间排序：最新的在前面
        formattedRecords.sort((a, b) => (b.createTime || 0) - (a.createTime || 0))


        // 标记最新的记录
        if (formattedRecords.length > 0) {
          formattedRecords[0].isLatest = true

          if (formattedRecords.length > 1) {
            const latestRecord = formattedRecords[0]
            const otherRecords = formattedRecords.slice(1)
            otherRecords.sort((a, b) => (a.createTime || 0) - (b.createTime || 0))
            formattedRecords.splice(0, formattedRecords.length, latestRecord, ...otherRecords)
          }
        }

        progressRecords.value = formattedRecords
        hasMoreRecords.value = apiData.hasMore || false
        
        // 读取后端返回的审核结果索引
        if (apiData.auditDecisionByUser) {
          auditDecisionByUser.value = new Map(Object.entries(apiData.auditDecisionByUser))
        }
        if (apiData.auditDecisionByDept) {
          auditDecisionByDept.value = new Map(Object.entries(apiData.auditDecisionByDept))
        }
      } else {
        progressRecords.value = []
        hasMoreRecords.value = false
        auditDecisionByUser.value = new Map()
        auditDecisionByDept.value = new Map()
      }
    }
  } catch (error) {
    console.error('获取进度更新记录失败:', error)
    ElMessage.error('获取进度更新记录失败')
  }
}

// 新增：获取计划记录数据（implement_plan 节点专用）
const getPlanEntryRecords = async (processInstanceId: string) => {
  if (!processInstanceId) return

  try {
    console.log('[getPlanEntryRecords] 开始获取计划记录:', processInstanceId)
    
    const planEntries: PlanEntryRespVO[] = await PlanEntryApi.list(processInstanceId) || []

    console.log('[getPlanEntryRecords] 获取到计划记录:', planEntries.length, '条')

    if (planEntries.length > 0) {
      // 将计划记录转换为兼容原格式的进度记录
      const formattedRecords = planEntries.map((entry: PlanEntryRespVO) => {
        const createTime = new Date(entry.createTime).getTime()
        
        return {
          // 展示字段
          title: entry.targetDeptName || '未知部门',
          handler: entry.targetUserName || '',
          description: entry.summary || '',
          remark: '', // 计划记录没有批示
          expectedTime: '',
          time: formatTimestamp(createTime),
          attachments: entry.attachmentInfo ? JSON.parse(entry.attachmentInfo) : [],
          createTime: createTime,
          isLatest: false,
          // 原始字段（用于严格校验）
          creatorNickName: entry.targetUserName || '',
          creatorUserId: entry.targetUserId,
          id: entry.id,
          // 结构化字段
          recordType: 'implement_plan',
          targetUserId: entry.targetUserId,
          decision: null,
          periodDate: entry.periodDate,
          sourceTaskId: entry.sourceEntryId,
          originalContent: entry.summary,
          // 新增：计划记录特有字段
          planEntryId: entry.id,
          status: entry.status,
          statusDisplay: entry.statusDisplay,
          isDelayedPlaceholder: entry.isDelayedPlaceholder
        }
      })

      // 按期次日期排序：最新的在前面
      formattedRecords.sort((a, b) => {
        const dateA = new Date(a.periodDate).getTime()
        const dateB = new Date(b.periodDate).getTime()
        return dateB - dateA
      })

      // 标记最新的记录
      if (formattedRecords.length > 0) {
        formattedRecords[0].isLatest = true
      }

      progressRecords.value = formattedRecords
      hasMoreRecords.value = false

      // 构建审核结果索引（基于新的状态字段）
      const auditByUser = new Map()
      const auditByDept = new Map()
      
      planEntries.forEach(entry => {
        const userId = entry.targetUserId.toString()
        const deptName = entry.targetDeptName
        
        if (entry.status === 'approved') {
          auditByUser.set(userId, 'approved')
          auditByDept.set(deptName, 'approved')
        } else if (entry.status === 'rejected') {
          auditByUser.set(userId, 'rejected')
          auditByDept.set(deptName, 'rejected')
        }
      })

      auditDecisionByUser.value = auditByUser
      auditDecisionByDept.value = auditByDept

      console.log('[getPlanEntryRecords] 处理完成，记录数:', formattedRecords.length)
    } else {
      progressRecords.value = []
      hasMoreRecords.value = false
      auditDecisionByUser.value = new Map()
      auditDecisionByDept.value = new Map()
    }
  } catch (error) {
    console.error('[getPlanEntryRecords] 获取计划记录失败:', error)
    ElMessage.error('获取计划记录失败')
  }
}

// 加载 implement_plan 节点的结构化上下文（用于审核按钮显隐和状态判断）
const loadImplementPlanContext = async (processInstanceId: string, targetUserId?: number) => {
  if (!processInstanceId) return

  try {
    implementPlanLoading.value = true
    console.log('[loadImplementPlanContext] 开始加载 implement_plan 上下文:', processInstanceId, targetUserId ? `用户ID: ${targetUserId}` : '所有用户')
    
    const planEntries: PlanEntryRespVO[] = await PlanEntryApi.list(processInstanceId, targetUserId) || []

    console.log('[loadImplementPlanContext] 获取到计划记录:', planEntries.length, '条')

    // 生成完整的期次行（与办理界面一致）
    const fullPlanRows = generatePlanRows()
    
    // 将结构化记录填充到对应的期次行中
    planEntries.forEach((entry: PlanEntryRespVO) => {
      const normalizedPeriodDate = normalizePeriodDate(entry.periodDate)
      const targetRow = fullPlanRows.find(row => row.date === normalizedPeriodDate)
      
      if (targetRow) {
        // 填充结构化数据到行中
        targetRow.id = entry.id
        targetRow.summary = entry.summary || ''
        targetRow.status = entry.status // draft/submitted/approved/rejected/pending_delay
        targetRow.statusDisplay = entry.statusDisplay || entry.status
        targetRow.targetUserId = entry.targetUserId
        targetRow.targetUserName = entry.targetUserName
        targetRow.targetDeptName = entry.targetDeptName
        targetRow.fileCount = entry.fileCount || 0
        targetRow.attachmentInfo = entry.attachmentInfo
        targetRow.isDelayedPlaceholder = entry.isDelayedPlaceholder || false
        targetRow.sourceEntryId = entry.sourceEntryId
        targetRow.fileList = parseAttachmentInfo(entry.attachmentInfo) || []
        targetRow.createTime = entry.createTime
        targetRow.updateTime = entry.updateTime
        
        // 根据状态设置行状态
        switch (entry.status) {
          case 'submitted':
            targetRow.submitted = true
            targetRow.submittedAt = entry.updateTime || entry.createTime
            targetRow.auditDecision = null
            break
          case 'approved':
            targetRow.submitted = true
            targetRow.submittedAt = entry.updateTime || entry.createTime
            targetRow.auditDecision = 'approved'
            break
          case 'rejected':
            targetRow.submitted = true
            targetRow.submittedAt = entry.updateTime || entry.createTime
            targetRow.auditDecision = 'rejected'
            break
          case 'pending_delay':
            targetRow.submitted = false
            targetRow.submittedAt = null
            targetRow.isDelayed = true
            break
          default:
            targetRow.submitted = false
            targetRow.submittedAt = null
        }
        
        console.log('[loadImplementPlanContext] 填充行数据:', {
          date: normalizedPeriodDate,
          status: entry.status,
          summary: targetRow.summary?.substring(0, 30) + '...',
          hasFiles: targetRow.fileList?.length > 0
        })
      }
    })

    // 将完整的期次行赋给审核上下文
    planEntryRows.value = fullPlanRows

    console.log('[loadImplementPlanContext] 上下文加载完成，行数:', fullPlanRows.length)
    console.log('[loadImplementPlanContext] 待审核行数:', fullPlanRows.filter(r => r.status === 'submitted').length)
    
  } catch (error) {
    console.error('[loadImplementPlanContext] 加载上下文失败:', error)
    // 静默失败，不影响其他功能
    planEntryRows.value = []
  } finally {
    implementPlanLoading.value = false
  }
}

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return utilFormatDate(date, 'YYYY年MM月DD日 HH:mm')
}

// 根据节点key获取指定节点的通过时间
const getNodePassTimeByKey = (taskDefinitionKey: string): number | null => {
  if (!fullActivityNodes.value || fullActivityNodes.value.length === 0) {
    return null
  }
  
  // 查找已完成的指定节点 (status === 2)，使用 id 字段匹配
  const targetNode = fullActivityNodes.value.find(node => 
    node.status === 2 && node.id === taskDefinitionKey
  )
  
  if (targetNode && targetNode.endTime) {
    return Number(targetNode.endTime)
  }
  
  return null
}

// 数据归一化为ID数组（与流程变量逻辑一致）
const normalizeToIdArray = (val: any): number[] => {
  if (!val) return []
  
  if (Array.isArray(val)) {
    // 数组：提取ID并转为数字
    return val
      .map((item: any) => (typeof item === 'object' && item !== null ? (item.id ?? item.value ?? item) : item))
      .map((v: any) => (typeof v === 'number' ? v : parseInt(String(v), 10)))
      .filter((v: any) => !Number.isNaN(v))
      .sort((a, b) => a - b) // 排序便于比较
  } else if (typeof val === 'string') {
    // 字符串：按逗号分割转为数字数组
    return val
      .split(',')
      .map((s: string) => s.trim())
      .map((s: string) => parseInt(s, 10))
      .filter((n: number) => !Number.isNaN(n))
      .sort((a, b) => a - b)
  } else if (typeof val === 'object' && val !== null) {
    // 单个对象：取ID
    const id = parseInt(String(val.id ?? val.value ?? ''), 10)
    return Number.isNaN(id) ? [] : [id]
  } else if (typeof val === 'number') {
    // 单个数字
    return [val]
  }
  
  return []
}

// 根据ID数组获取部门名称显示
const getDeptNamesDisplay = async (ids: number[]): Promise<string> => {
  if (!ids || ids.length === 0) return '无'
  
  try {
    const names: string[] = []
    for (const id of ids) {
      const dept = await getDept(id)
      if (dept && dept.name) {
        names.push(dept.name)
      } else {
        names.push(`ID:${id}`)
      }
    }
    return names.join('、')
  } catch (error) {
    return ids.map(id => `ID:${id}`).join('、')
  }
}

// 计算 update_materials 字段变更预览
const calculateUpdateMaterialsPreview = async (originalData: any, processVars: any) => {
  const preview = {
    orderTitle: { changed: false, oldDisplay: '', newDisplay: '' },
    content: { changed: false, oldDisplay: '', newDisplay: '' },
    officePhone: { changed: false, oldDisplay: '', newDisplay: '' },
    type: { changed: false, oldDisplay: '', newDisplay: '' },
    priority: { changed: false, oldDisplay: '', newDisplay: '' },
    reportFrequency: { changed: false, oldDisplay: '', newDisplay: '' },
    supervisors: { changed: false, oldDisplay: '', newDisplay: '' },
    otherLeaders: { changed: false, oldDisplay: '', newDisplay: '' },
    deadlineFromUpdateMaterials: { changed: false, oldDisplay: '', newDisplay: '' }
  }

  console.log('🔍 [calculateUpdateMaterialsPreview] originalData:', originalData)
  console.log('🔍 [calculateUpdateMaterialsPreview] processVars:', processVars)

  if (!originalData || !processVars) {
    console.log('🔍 [calculateUpdateMaterialsPreview] 数据为空，返回默认预览')
    return preview
  }

  // 判断值是否有意义（非 null/undefined/空字符串/空数组）
  const hasMeaningfulValue = (value: any): boolean => {
    if (value === undefined || value === null) return false
    if (typeof value === 'string' && value.trim() === '') return false
    if (Array.isArray(value)) return value.length > 0
    return true
  }

  // 督办事项
  const oldOrderTitle = originalData.orderTitle || ''
  const newOrderTitle = processVars.latestTempUpdateMaterialsOrderTitle
  if (hasMeaningfulValue(newOrderTitle) && oldOrderTitle !== newOrderTitle) {
    preview.orderTitle = {
      changed: true,
      oldDisplay: oldOrderTitle || '未设置',
      newDisplay: newOrderTitle
    }
  }

  // 主要内容
  const oldContent = originalData.content || ''
  const newContent = processVars.latestTempUpdateMaterialsContent
  if (hasMeaningfulValue(newContent) && oldContent !== newContent) {
    preview.content = {
      changed: true,
      oldDisplay: oldContent || '未设置',
      newDisplay: newContent.length > 50 ? newContent.substring(0, 50) + '...' : newContent
    }
  }

  // 联系电话
  const oldOfficePhone = originalData.officePhone || ''
  const newOfficePhone = processVars.latestTempUpdateMaterialsOfficePhone
  if (hasMeaningfulValue(newOfficePhone) && oldOfficePhone !== newOfficePhone) {
    preview.officePhone = {
      changed: true,
      oldDisplay: oldOfficePhone || '未设置',
      newDisplay: newOfficePhone
    }
  }

  // 督办分类
  const oldType = originalData.detailType
  const newType = processVars.latestTempUpdateMaterialsType
  console.log('🔍 [督办分类] oldType:', oldType, 'newType:', newType)
  if (hasMeaningfulValue(newType) && oldType !== newType) {
    preview.type = {
      changed: true,
      oldDisplay: getDetailTypeName(oldType) || '未设置',
      newDisplay: getDetailTypeName(newType) || '未设置'
    }
    console.log('🔍 [督办分类] 检测到变更')
  } else {
    console.log('🔍 [督办分类] 未检测到变更，原因:', !hasMeaningfulValue(newType) ? 'newType无意义值' : '值相同')
  }

  // 紧急程度
  const oldPriority = originalData.priority
  const newPriority = processVars.latestTempUpdateMaterialsPriority
  if (hasMeaningfulValue(newPriority) && oldPriority !== newPriority) {
    preview.priority = {
      changed: true,
      oldDisplay: getPriorityName(oldPriority) || '未设置',
      newDisplay: getPriorityName(newPriority) || '未设置'
    }
  }

  // 报告频次
  const oldReportFreq = originalData.reportFrequency
  const newReportFreq = processVars.latestTempUpdateMaterialsReportFrequency
  if (hasMeaningfulValue(newReportFreq) && oldReportFreq !== newReportFreq) {
    preview.reportFrequency = {
      changed: true,
      oldDisplay: getReportFrequencyName(oldReportFreq) || '未设置',
      newDisplay: getReportFrequencyName(newReportFreq) || '未设置'
    }
  }

  // 督办人（将值统一归一化为ID CSV再解析姓名）
  const oldSupervisorsArr = originalData.supervisors || []
  const oldSupervisorsCsv = Array.isArray(oldSupervisorsArr)
    ? oldSupervisorsArr.map((u: any) => u.id).join(',')
    : (originalData.supervisor || '')

  const rawNewSupervisors = processVars.latestTempUpdateMaterialsSupervisors
  const newSupervisorsCsv = Array.isArray(rawNewSupervisors)
    ? rawNewSupervisors.join(',')
    : rawNewSupervisors

  if (hasMeaningfulValue(newSupervisorsCsv) && oldSupervisorsCsv !== newSupervisorsCsv) {
    preview.supervisors = {
      changed: true,
      oldDisplay: await getUserNamesFromCsv(oldSupervisorsCsv),
      newDisplay: await getUserNamesFromCsv(newSupervisorsCsv)
    }
  }

  // 其他校领导
  const oldOtherLeaders = originalData.otherLeaders || ''
  const newOtherLeaders = processVars.latestTempUpdateMaterialsOtherLeaders
  if (hasMeaningfulValue(newOtherLeaders) && oldOtherLeaders !== newOtherLeaders) {
    preview.otherLeaders = {
      changed: true,
      oldDisplay: await getUserNamesFromCsv(oldOtherLeaders),
      newDisplay: await getUserNamesFromCsv(newOtherLeaders)
    }
  }

  // 办理单位（将值统一归一化为ID数组再解析部门名称）
  const oldLeadDeptArr = originalData.leadDept || []
  const oldLeadDeptIds = Array.isArray(oldLeadDeptArr)
    ? oldLeadDeptArr
    : (typeof oldLeadDeptArr === 'string' ? oldLeadDeptArr.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : [])

  const rawNewLeadDept = processVars.latestTempUpdateMaterialsLeadDeptIds || []
  const newLeadDeptIds = Array.isArray(rawNewLeadDept)
    ? rawNewLeadDept
    : []

  if (newLeadDeptIds.length > 0 && JSON.stringify(oldLeadDeptIds.sort()) !== JSON.stringify(newLeadDeptIds.sort())) {
    const getDeptNamesFromIds = (ids: number[]): string => {
      return ids.map(id => {
        const dept = deptList.value.find(item => item.id === id)
        return dept?.name || `未知部门(${id})`
      }).join('、')
    }

    preview.leadDept = {
      changed: true,
      oldDisplay: getDeptNamesFromIds(oldLeadDeptIds) || '未设置',
      newDisplay: getDeptNamesFromIds(newLeadDeptIds) || '未设置'
    }
  }

  // 协办单位（将值统一归一化为ID数组再解析部门名称）
  const oldCoDeptArr = originalData.coDept || []
  const oldCoDeptIds = Array.isArray(oldCoDeptArr)
    ? oldCoDeptArr
    : (typeof oldCoDeptArr === 'string' ? oldCoDeptArr.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : [])

  const rawNewCoDept = processVars.latestTempUpdateMaterialsCoDeptIds || []
  const newCoDeptIds = Array.isArray(rawNewCoDept)
    ? rawNewCoDept
    : []

  if (newCoDeptIds.length > 0 && JSON.stringify(oldCoDeptIds.sort()) !== JSON.stringify(newCoDeptIds.sort())) {
    const getDeptNamesFromIds = (ids: number[]): string => {
      return ids.map(id => {
        const dept = deptList.value.find(item => item.id === id)
        return dept?.name || `未知部门(${id})`
      }).join('、')
    }

    preview.coDept = {
      changed: true,
      oldDisplay: getDeptNamesFromIds(oldCoDeptIds) || '未设置',
      newDisplay: getDeptNamesFromIds(newCoDeptIds) || '未设置'
    }
  }

  // 完成期限 (来自 update_materials)
  const oldDeadline = originalData.deadline || ''
  const newDeadline = processVars.latestTempUpdateMaterialsDeadline
  if (hasMeaningfulValue(newDeadline) && oldDeadline !== newDeadline) {
    const formatDeadline = (timestamp: any) => {
      if (!timestamp) return '未设置'
      try {
        return formatDate(new Date(Number(timestamp)), 'YYYY年MM月DD日 HH:mm')
      } catch {
        return String(timestamp)
      }
    }
    
    preview.deadlineFromUpdateMaterials = {
      changed: true,
      oldDisplay: formatDeadline(oldDeadline),
      newDisplay: formatDeadline(newDeadline)
    }
  }

  return preview
}

// 将 CSV 格式的用户ID转换为姓名显示
const getUserNamesFromCsv = async (csvIds: any): Promise<string> => {
  // 确保 csvIds 是字符串类型
  const csvString = String(csvIds || '')
  if (!csvString || csvString.trim() === '') return '无'
  
  try {
    const ids = csvString.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
    if (ids.length === 0) return '无'
    
    const names: string[] = []
    for (const id of ids) {
      const user = userList.value.find(u => u.id === id)
      if (user) {
        names.push(user.nickname || user.username || `ID:${id}`)
      } else {
        names.push(`ID:${id}`)
      }
    }
    return names.join('、')
  } catch (error) {
    return csvIds
  }
}

// 计算是否有任何变更
const hasAnyChange = computed(() => {
  if (!changePreview.value) return false
  
  return changePreview.value.leadDept?.changed ||
         changePreview.value.coDept?.changed ||
         changePreview.value.deadline?.changed ||
         changePreview.value.orderTitle?.changed ||
         changePreview.value.content?.changed ||
         changePreview.value.officePhone?.changed ||
         changePreview.value.type?.changed ||
         changePreview.value.priority?.changed ||
         changePreview.value.reportFrequency?.changed ||
         changePreview.value.supervisors?.changed ||
         changePreview.value.otherLeaders?.changed
})

// 计算拟变更预览表格数据
const changePreviewRows = computed(() => {
  if (!changePreview.value) return []
  
  const rows = []
  
  // 定义字段映射
  const fieldMap = [
    { key: 'leadDept', label: '办理单位' },
    { key: 'coDept', label: '协办单位' },
    { key: 'deadline', label: '完成期限' },
    { key: 'orderTitle', label: '督办事项' },
    { key: 'content', label: '主要内容' },
    { key: 'officePhone', label: '联系电话' },
    { key: 'type', label: '督办分类' },
    { key: 'priority', label: '紧急程度' },
    { key: 'reportFrequency', label: '报告频次' },
    { key: 'supervisors', label: '督办人' },
    { key: 'otherLeaders', label: '其他校领导' },
    { key: 'deadlineFromUpdateMaterials', label: '完成期限' }
  ]
  
  // 只显示有变更的字段
  fieldMap.forEach(field => {
    const fieldData = changePreview.value[field.key]
    if (fieldData && fieldData.changed) {
      rows.push({
        label: field.label,
        oldDisplay: fieldData.oldDisplay || '',
        newDisplay: fieldData.newDisplay || ''
      })
    }
  })
  
  return rows
})

// 计算是否有变更预览（用于外部调用）
const hasChangePreview = computed(() => {
  return showChangePreview.value && changePreviewRows.value.length > 0
})

// 计算当前用户是否可以在预览区操作（基于运行中节点的办理权限）
const canOperateInPreview = computed(() => {
  const currentUserId = userStore.getUser?.id
  if (!currentUserId || !fullActivityNodes.value.length) {
    return false
  }

  // 遍历所有运行中的活动节点
  return fullActivityNodes.value.some(node => {
    if (node.status !== 1) return false // 只处理运行中的节点

    // 检查节点的tasks中是否有当前用户
    if (node.tasks && node.tasks.length > 0) {
      const hasTaskAccess = node.tasks.some(task =>
        (task.assigneeUser && Number(task.assigneeUser.id) === Number(currentUserId)) ||
        (task.ownerUser && Number(task.ownerUser.id) === Number(currentUserId))
      )
      if (hasTaskAccess) return true
    }

    // 检查candidateUsers
    if (node.candidateUsers && node.candidateUsers.length > 0) {
      const hasCandidateAccess = node.candidateUsers.some(user => 
        Number(user.id) === Number(currentUserId)
      )
      if (hasCandidateAccess) return true
    }

    return false
  })
})

// 定义 emit 事件
const emit = defineEmits(['open-approve', 'open-reject'])

// 处理从预览表格点击通过
const handleApproveFromPreview = (event: Event) => {
  emit('open-approve', event.currentTarget as HTMLElement)
}

// 处理从预览表格点击拒绝
const handleRejectFromPreview = (event: Event) => {
  emit('open-reject', event.currentTarget as HTMLElement)
}

// 计算拟变更预览
const calculateChangePreview = async () => {
  try {
    // 获取当前表单数据和原始数据
    const currentData = getEditFormData()
    const originalData = getOrderDetailData()
    
    if (!currentData || !originalData) {
      showChangePreview.value = false
      return
    }
    
    // 归一化办理单位数据 - 旧值来自详情数据
    const oldLeadDeptIds = normalizeToIdArray(originalData.leadDept)
    
    // 新值优先从流程变量获取
    let newLeadDeptIds: number[] = []
    if (processVars.value.tempLeadDeptIds && Array.isArray(processVars.value.tempLeadDeptIds)) {
      newLeadDeptIds = processVars.value.tempLeadDeptIds
    } else if (processVars.value.tempDirectorLeadDept && Array.isArray(processVars.value.tempDirectorLeadDept)) {
      newLeadDeptIds = processVars.value.tempDirectorLeadDept
    } else if (processVars.value.tempDeDirectorLeadDept && Array.isArray(processVars.value.tempDeDirectorLeadDept)) {
      newLeadDeptIds = processVars.value.tempDeDirectorLeadDept
    } else {
      newLeadDeptIds = normalizeToIdArray(currentData.leadDept)
    }
    
    // 归一化协办单位数据 - 旧值来自详情数据
    const oldCoDeptIds = normalizeToIdArray(originalData.coDept)
    
    // 新值优先从流程变量获取（按优先级排序）
    let newCoDeptIds: number[] = []
    if (processVars.value.latestTempCoDeptIds && Array.isArray(processVars.value.latestTempCoDeptIds)) {
      newCoDeptIds = processVars.value.latestTempCoDeptIds
    } else if (processVars.value.tempCoDeptIds && Array.isArray(processVars.value.tempCoDeptIds)) {
      newCoDeptIds = processVars.value.tempCoDeptIds
    } else if (processVars.value.tempDirectorCollaborateDepts && Array.isArray(processVars.value.tempDirectorCollaborateDepts)) {
      newCoDeptIds = processVars.value.tempDirectorCollaborateDepts
    } else if (processVars.value.tempDeDirectorCollaborateDepts && Array.isArray(processVars.value.tempDeDirectorCollaborateDepts)) {
      newCoDeptIds = processVars.value.tempDeDirectorCollaborateDepts
    } else {
      newCoDeptIds = normalizeToIdArray(currentData.coDept)
    }
    
    // 检查变更标识，任何标识为1时强制展示预览
    const deptChangeFlag = processVars.value.deptChangeFlag === 1
    const directorChangeFlag = processVars.value.directorChangeFlag === 1
    const deDirectorChangeFlag = processVars.value.deDirectorChangeFlag === 1
    const updateMaterialsChangeFlag = processVars.value.updateMaterialsChangeFlag === 1
    const hasChangeFlag = deptChangeFlag || directorChangeFlag || deDirectorChangeFlag || updateMaterialsChangeFlag
    
    // 计算数据变更（忽略顺序）
    const arraysEqual = (arr1: number[], arr2: number[]) => {
      if (arr1.length !== arr2.length) return false
      const sorted1 = [...arr1].sort((a, b) => a - b)
      const sorted2 = [...arr2].sort((a, b) => a - b)
      return sorted1.every((val, index) => val === sorted2[index])
    }
    
    const leadDeptChanged = !arraysEqual(oldLeadDeptIds, newLeadDeptIds)
    const coDeptChanged = !arraysEqual(oldCoDeptIds, newCoDeptIds)
    
    // 获取显示名称
    const oldLeadDeptDisplay = await getDeptNamesDisplay(oldLeadDeptIds)
    const newLeadDeptDisplay = await getDeptNamesDisplay(newLeadDeptIds)
    const oldCoDeptDisplay = await getDeptNamesDisplay(oldCoDeptIds)
    const newCoDeptDisplay = await getDeptNamesDisplay(newCoDeptIds)
    
    // 检查完成期限变更（从流程变量中获取最新的 plan_time）
    const oldDeadline = originalData.deadline || ''
    let newDeadline = oldDeadline
    let deadlineChanged = false
    
    // 从流程变量中获取最新的 plan_time（upload_plan 节点延期时设置）
    if (processVars.value.latestPlanTime) {
      newDeadline = processVars.value.latestPlanTime
      deadlineChanged = oldDeadline !== newDeadline
    }
    
    // 格式化显示时间
    const formatDeadline = (dateStr: string) => {
      if (!dateStr) return '未设置'
      try {
        return formatDate(new Date(dateStr), 'YYYY年MM月DD日 HH:mm')
      } catch {
        return dateStr
      }
    }
    
    const oldDeadlineDisplay = formatDeadline(oldDeadline)
    const newDeadlineDisplay = formatDeadline(newDeadline)
    
    // 计算 update_materials 字段变更
    const updateMaterialsPreview = await calculateUpdateMaterialsPreview(originalData, processVars.value)
    console.log('🔍 [calculateChangePreview] updateMaterialsPreview:', updateMaterialsPreview)
    
    // 更新预览数据
    changePreview.value = {
      leadDept: {
        changed: leadDeptChanged, // 仅基于实际数据变更
        oldIds: oldLeadDeptIds,
        newIds: newLeadDeptIds,
        oldDisplay: oldLeadDeptDisplay,
        newDisplay: newLeadDeptDisplay
      },
      coDept: {
        changed: coDeptChanged, // 仅基于实际数据变更
        oldIds: oldCoDeptIds,
        newIds: newCoDeptIds,
        oldDisplay: oldCoDeptDisplay,
        newDisplay: newCoDeptDisplay
      },
      deadline: {
        changed: deadlineChanged,
        oldValue: oldDeadline,
        newValue: newDeadline,
        oldDisplay: oldDeadlineDisplay,
        newDisplay: newDeadlineDisplay
      },
      ...updateMaterialsPreview
    }
    
    // 显示预览（仅当有实际数据变更时）
    const shouldShow = leadDeptChanged || coDeptChanged || deadlineChanged || 
      updateMaterialsPreview.orderTitle.changed || updateMaterialsPreview.content.changed ||
      updateMaterialsPreview.officePhone.changed || updateMaterialsPreview.type.changed ||
      updateMaterialsPreview.priority.changed || updateMaterialsPreview.reportFrequency.changed ||
      updateMaterialsPreview.supervisors.changed || updateMaterialsPreview.otherLeaders.changed ||
      updateMaterialsPreview.deadlineFromUpdateMaterials.changed
    
    console.log('🔍 [calculateChangePreview] shouldShow:', shouldShow)
    console.log('🔍 [calculateChangePreview] updateMaterialsChangeFlag:', updateMaterialsChangeFlag)
    console.log('🔍 [calculateChangePreview] processVars.value:', processVars.value)
    
    showChangePreview.value = shouldShow
    
  } catch (error) {
    console.error('计算拟变更预览失败:', error)
    showChangePreview.value = false
  }
}

// 获取督查办主任审核通过时间（立项督办）
const getDirectorCheckPassTime = (): number | null => {
  return getNodePassTimeByKey('director_check')
}

// 获取督查办主任复核通过时间（结束督办）
const getDirectorRecheckPassTime = (): number | null => {
  return getNodePassTimeByKey('director_recheck')
}

// 获取审批通过时间
const getApprovalPassTime = (preferType?: 'project' | 'close'): number | null => {
  // 优先级1: 从流程节点中查找通过节点的 endTime
  if (fullActivityNodes.value && fullActivityNodes.value.length > 0) {
    // 查找已完成的节点 (status === 2)
    const completedNodes = fullActivityNodes.value.filter(node => node.status === 2)
    
    if (completedNodes.length > 0) {
      // 按完成时间倒序排列，取最新的完成节点
      const sortedNodes = completedNodes.sort((a, b) => {
        const endTimeA = a.endTime || 0
        const endTimeB = b.endTime || 0
        return endTimeB - endTimeA
      })
      
      const latestCompletedNode = sortedNodes[0]
      if (latestCompletedNode.endTime) {
        return latestCompletedNode.endTime
      }
    }
  }
  
  // 优先级2: 使用 props.applyTime
  if (props.applyTime) {
    const applyTimeNum = typeof props.applyTime === 'string' ? 
      new Date(props.applyTime).getTime() : 
      Number(props.applyTime)
    if (!isNaN(applyTimeNum) && applyTimeNum > 0) {
      return applyTimeNum
    }
  }
  
  // 优先级3: 返回 null（无时间）
  return null
}

// 计算属性：立项督办审批状态文本（使用督查办主任审核通过时间）
const projectApprovalText = computed(() => {
  // 未通过或未审批：显示空白
  if (!orderDetail.value.isProjectSupervision) {
    return ''
  }
  
  // 获取督查办主任审核通过时间
  const passTime = getDirectorCheckPassTime()
  if (passTime) {
    const formattedTime = utilFormatDate(new Date(passTime), 'YYYY年MM月DD日 HH:mm')
    return `同意立项督办 ${formattedTime}`
  }
  
  // 找不到时间：只显示"同意立项督办"
  return '同意立项督办'
})

// 计算属性：结束督办审批状态文本（使用督查办主任复核通过时间）
const closeApprovalText = computed(() => {
  // 未通过或未审批：显示空白
  if (!orderDetail.value.isSupervisionClosed) {
    return ''
  }
  
  // 获取督查办主任复核通过时间
  const passTime = getDirectorRecheckPassTime()
  if (passTime) {
    const formattedTime = utilFormatDate(new Date(passTime), 'YYYY年MM月DD日 HH:mm')
    return `同意结束督办 ${formattedTime}`
  }
  
  // 找不到时间：只显示"同意结束督办"
  return '同意结束督办'
})

// 时间选择限制通用工具函数
// 计算默认时间（当前时间的下一个小时）
const getNextHourDefaultTime = () => {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)
  return nextHour
}

// 构建禁用日期函数
const buildDisabledDate = (getSelectedStr: () => string) => {
  return (time: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // 设置为今天的开始时间
    return time.getTime() < today.getTime()
  }
}

// 构建禁用小时函数
const buildDisabledHours = (getSelectedStr: () => string) => {
  return () => {
    const now = new Date()
    const selectedStr = getSelectedStr()
    const selectedDate = selectedStr ? new Date(selectedStr) : null

    // 如果选择的是今天，则禁用当前小时之前的小时
    if (selectedDate && selectedDate.toDateString() === now.toDateString()) {
      const hours = []
      for (let i = 0; i < now.getHours(); i++) {
        hours.push(i)
      }
      return hours
    }
    return []
  }
}

// 构建禁用分钟函数
const buildDisabledMinutes = (getSelectedStr: () => string) => {
  return (hour: number) => {
    const now = new Date()
    const selectedStr = getSelectedStr()
    const selectedDate = selectedStr ? new Date(selectedStr) : null

    // 如果选择的是今天且是当前小时，则禁用当前分钟之前的分钟
    if (selectedDate && selectedDate.toDateString() === now.toDateString() && hour === now.getHours()) {
      const minutes = []
      for (let i = 0; i <= now.getMinutes(); i++) {
        minutes.push(i)
      }
      return minutes
    }
    return []
  }
}

// 完成期限时间选择限制
const defaultDeadlineTime = ref(getNextHourDefaultTime())
const disabledDeadlineDate = buildDisabledDate(() => editForm.value.deadline)
const disabledDeadlineHours = buildDisabledHours(() => editForm.value.deadline)
const disabledDeadlineMinutes = buildDisabledMinutes(() => editForm.value.deadline)

// 预计完成时间选择限制
const defaultProgressTime = ref(getNextHourDefaultTime())
const disabledProgressDate = buildDisabledDate(() => progressForm.planTime)
const disabledProgressHours = buildDisabledHours(() => progressForm.planTime)
const disabledProgressMinutes = buildDisabledMinutes(() => progressForm.planTime)

// 打开审核弹窗（督办人专用）
const openAuditDialog = async () => {
  auditMode.value = true
  addProgressDialogVisible.value = true
  
  // 重置表单
  progressForm.deptDetail = ''
  progressForm.planTime = ''
  progressForm.fileList = []
  progressForm.canFinishOnTime = true
  progressForm.delayReason = ''
  progressForm.coopUnitsChanged = false
  progressForm.planRows = []
  
  // 获取流程实例ID
  const processInstanceId = props.id?.toString() || route.query.processInstanceId as string || route.params.id as string || route.query.id as string
  
  // 强制拉取全部进度记录，确保能看到所有上传人
  if (processInstanceId) {
    await getProgressRecords(processInstanceId, true)
  }
  
  // 生成基础计划行
  progressForm.planRows = generatePlanRows()
  
  // 构建审核用户选项列表
  await buildAuditUserOptions()
  
  // 根据默认选中的用户加载审核上下文（填充 planEntryRows）
  if (selectedAuditUserId.value && processInstanceId) {
    // 解析出数值型用户ID
    let numericUserId: number = 0
    if (typeof selectedAuditUserId.value === 'number') {
      numericUserId = selectedAuditUserId.value
    } else if (typeof selectedAuditUserId.value === 'string' && /^\d+$/.test(selectedAuditUserId.value)) {
      numericUserId = parseInt(selectedAuditUserId.value, 10)
    } else {
      const selectedOption = auditUserOptions.value.find(option => option.value === selectedAuditUserId.value)
      if (selectedOption && selectedOption.userId > 0) {
        numericUserId = selectedOption.userId
      }
    }
    
    if (numericUserId > 0) {
      await loadImplementPlanContext(processInstanceId, numericUserId)
    }
  }
  
  console.log('🔍 [openAuditDialog] 审核弹窗已打开，用户选项已构建')
}

// 统一获取记录的用户ID（归一化处理）
const getRecordUserId = (record: any): number => {
  // 优先使用后端返回的 creatorUserId，兜底 creatorId，最后默认 0
  return record.creatorUserId ?? record.creatorId ?? 0
}

// 将已提交的单行记录合并到计划行中（全量合并，用于审核模式）
const mergeSubmittedRecordsIntoPlanRows = () => {
  if (!progressRecords.value || progressRecords.value.length === 0) {
    return
  }
  
  // 查找所有单行计划记录（implement_plan 格式：YYYY-MM-DD：内容）
  const singlePlanRecords = progressRecords.value.filter(record => isPlanLikeRecord(record))
  
  singlePlanRecords.forEach(record => {
    mergeSingleRecordIntoPlanRows(record, progressForm.planRows)
  })
}

// 新版：直接从计划记录数据填充计划行（implement_plan 节点专用）
const fillPlanRowsFromPlanEntries = async () => {
  // 获取当前用户信息
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id
  
  if (!currentUserId) {
    console.log('🔍 [fillPlanRowsFromPlanEntries] 无法获取当前用户信息')
    return
  }
  
  const processInstanceId = props.id?.toString() || 
                           route.query.processInstanceId as string || 
                           route.params.id as string || 
                           route.query.id as string
  
  if (!processInstanceId) {
    console.log('🔍 [fillPlanRowsFromPlanEntries] 无法获取流程实例ID')
    return
  }
  
  try {
    console.log('🔍 [fillPlanRowsFromPlanEntries] 开始从新API获取计划记录')
    
    // 使用新的 PlanEntryApi.list 获取当前用户的计划记录
    const planEntries: PlanEntryRespVO[] = await PlanEntryApi.list(processInstanceId, currentUserId) || []
    
    console.log('🔍 [fillPlanRowsFromPlanEntries] 获取到计划记录数量:', planEntries.length)
    
    // 直接根据计划记录填充对应的计划行
    planEntries.forEach(entry => {
      const normalizedPeriodDate = normalizePeriodDate(entry.periodDate)
      const targetRow = progressForm.planRows.find(row => row.date === normalizedPeriodDate)
      if (targetRow) {
        // 根据状态填充行数据
        targetRow.summary = entry.summary || ''
        targetRow.fileList = parseAttachmentInfo(entry.attachmentInfo) || []
        targetRow.taskId = entry.id
        
        // 根据状态设置行状态
        switch (entry.status) {
          case 'submitted':
            targetRow.submitted = true
            targetRow.submittedAt = entry.updateTime || entry.createTime
            targetRow.status = 'submitted'
            targetRow.isDelayed = entry.isDelayedPlaceholder || false
            break
          case 'approved':
            targetRow.submitted = true
            targetRow.submittedAt = entry.updateTime || entry.createTime
            // 审核通过：状态应为 approved，避免显示为“待审核”
            targetRow.status = 'approved'
            targetRow.auditDecision = 'approved'
            targetRow.isDelayed = false
            break
          case 'rejected':
            targetRow.submitted = true
            targetRow.submittedAt = entry.updateTime || entry.createTime
            // 审核不通过：状态应为 rejected，避免显示为“待审核”
            targetRow.status = 'rejected'
            targetRow.auditDecision = 'rejected'
            targetRow.isDelayed = false
            break
          case 'pending_delay':
            targetRow.summary = entry.summary || ''
            targetRow.submitted = false
            targetRow.submittedAt = null
            // 顺延占位：使用明确状态，便于前端展示“顺延”标记
            targetRow.status = 'pending_delay'
            targetRow.isDelayed = true
            break
          default:
            targetRow.submitted = false
            targetRow.submittedAt = null
            targetRow.status = 'pending'
            targetRow.isDelayed = false
        }
        
        console.log('🔍 [fillPlanRowsFromPlanEntries] 填充行数据:', {
          date: normalizedPeriodDate,
          status: entry.status,
          summary: targetRow.summary?.substring(0, 50) + '...',
          hasFiles: targetRow.fileList?.length > 0
        })
      }
    })
  } catch (error) {
    console.error('🔍 [fillPlanRowsFromPlanEntries] 获取计划记录失败:', error)
    // 静默失败，不影响其他功能
  }
}

// 判断行是否可以审核
const canAuditRow = (row: any, index: number) => {
  // implement_plan 节点：使用新的状态判断逻辑
  if (isImplementPlanNode.value) {
    // 通过日期在 planEntryRows 中查找对应的结构化记录
    const planEntry = planEntryRows.value.find(entry => entry.date === row.date)
    if (planEntry) {
      // 只有 submitted 状态的记录可以审核，且未被审核过
      return planEntry.status === 'submitted' && !row.auditDecision
    }
    // 如果找不到对应的计划记录，则不可审核
    return false
  }
  
  // 其他节点：保持原有逻辑
  // 已审核的行不可再次审核
  if (row.auditDecision) {
    return false
  }
  
  // 只有有内容的行才能审核（有summary或有文件）
  return (row.summary && row.summary.trim() !== '') || (row.fileList && row.fileList.length > 0)
}

// 审核通过（新接口版本，基于 entry 对象）
const approveEntry = async (entry: any) => {
  if (entry.status !== 'submitted') {
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确认通过 ${entry.date} 的工作计划吗？`,
      '审核确认',
      {
        confirmButtonText: '确认通过',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const processInstanceId = props.id?.toString() || 
                             route.query.processInstanceId as string || 
                             route.params.id as string || 
                             route.query.id as string
    
    // 获取当前用户信息
    const currentUser = userStore.getUser
    if (!currentUser) {
      ElMessage.error('无法获取用户信息')
      return
    }
    
    // 构造审核请求
    const auditReqVO: PlanEntryAuditReqVO = {
      processInstanceId: processInstanceId || '',
      targetUserId: entry.targetUserId,
      periodDate: entry.date,
      decision: 1, // 通过
      remark: `审核通过 - ${currentUser.nickname}（${currentUser.deptName || ''}）`,
      delayNext: false
    }
    
    await PlanEntryApi.audit(auditReqVO)
    
    ElMessage.success(`${entry.date} 计划审核通过`)
    
    // 刷新数据（保留当前用户选择）
    if (processInstanceId) {
      await getProgressRecords(processInstanceId, true)
      
      // 刷新结构化上下文（传入当前审核的用户ID）
      if (isImplementPlanNode.value && entry.targetUserId) {
        await loadImplementPlanContext(processInstanceId, entry.targetUserId)
      }
      
      // 重建用户选项列表，保留当前选择
      await buildAuditUserOptions(true)
      
      // 刷新当前用户的表格数据
      if (selectedAuditUserId.value) {
        await refreshPlanRowsForSelectedUser()
      }
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('审核通过失败:', error)
    ElMessage.error('审核通过失败')
  }
}

// 审核不通过（新接口版本，基于 entry 对象）
const rejectEntry = async (entry: any) => {
  if (entry.status !== 'submitted') {
    return
  }
  
  try {
    // 校验必要参数
    if (!orderDetail.value.reportFrequency) {
      ElMessage.error('督办单未设置汇报频次，无法进行顺延操作，请联系管理员')
      return
    }
    
    if (!orderDetail.value.deadline) {
      ElMessage.error('督办单未设置截止日期，无法进行顺延操作，请联系管理员')
      return
    }
    
    await ElMessageBox.confirm(
      `确认退回 ${entry.date} 的工作计划并顺延到下一周期吗？`,
      '审核确认',
      {
        confirmButtonText: '确认退回',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const processInstanceId = props.id?.toString() || 
                             route.query.processInstanceId as string || 
                             route.params.id as string || 
                             route.query.id as string
    
    // 获取当前用户信息
    const currentUser = userStore.getUser
    if (!currentUser) {
      ElMessage.error('无法获取用户信息')
      return
    }
    
    // 格式化本地日期（避免 toISOString 导致的时区问题）
    const formatLocalDate = (timestamp: number) => {
      const d = new Date(timestamp)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    // 构造审核请求
    const auditReqVO: PlanEntryAuditReqVO = {
      processInstanceId: processInstanceId || '',
      targetUserId: entry.targetUserId,
      periodDate: entry.date,
      decision: 2, // 不通过
      remark: `审核不通过并顺延 - ${currentUser.nickname}（${currentUser.deptName || ''}）`,
      delayNext: true,
      reportFrequency: orderDetail.value.reportFrequency,
      deadline: formatLocalDate(orderDetail.value.deadline)
    }
    
    await PlanEntryApi.audit(auditReqVO)
    
    ElMessage.success(`${entry.date} 计划已退回并顺延到下一周期`)
    
    // 刷新数据（保留当前用户选择）
    if (processInstanceId) {
      await getProgressRecords(processInstanceId, true)
      
      // 刷新结构化上下文（传入当前审核的用户ID）
      if (isImplementPlanNode.value && entry.targetUserId) {
        await loadImplementPlanContext(processInstanceId, entry.targetUserId)
      }
      
      // 重建用户选项列表，保留当前选择
      await buildAuditUserOptions(true)
      
      // 刷新当前用户的表格数据
      if (selectedAuditUserId.value) {
        await refreshPlanRowsForSelectedUser()
      }
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('审核不通过失败:', error)
    ElMessage.error('审核不通过失败')
  }
}

// 审核通过（原有方法，兼容非 implement_plan 节点）
const approveRow = async (index: number) => {
  const row = progressForm.planRows[index]
  
  // implement_plan 节点：转调新方法
  if (isImplementPlanNode.value) {
    // 通过日期在 planEntryRows 中查找对应的 entry
    const entry = planEntryRows.value.find(e => e.date === row.date)
    if (entry) {
      await approveEntry(entry)
    } else {
      ElMessage.error('找不到对应的计划记录')
    }
    return
  }
  
  // 其他节点：保持原有逻辑
  if (!canAuditRow(row, index)) {
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确认通过 ${row.date} 的工作计划吗？`,
      '审核确认',
      {
        confirmButtonText: '确认通过',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    
    const processInstanceId = props.id?.toString() || route.query.processInstanceId as string || route.params.id as string || route.query.id as string
    
    // 其他节点：使用旧接口
    // 解析真实的用户ID
    let numericUserId: number = 0
    
    if (typeof selectedAuditUserId.value === 'number') {
      numericUserId = selectedAuditUserId.value
    } else if (typeof selectedAuditUserId.value === 'string' && /^\d+$/.test(selectedAuditUserId.value)) {
      numericUserId = parseInt(selectedAuditUserId.value, 10)
    } else {
      const selectedOption = auditUserOptions.value.find(option => option.value === selectedAuditUserId.value)
      if (selectedOption && selectedOption.userId > 0) {
        numericUserId = selectedOption.userId
      }
    }
    
    const auditData = {
      processInstanceId: processInstanceId || '',
      deptDetail: `[审核通过] ${row.date}（用户：${selectedAuditUserName.value}，部门：${selectedAuditUserDept.value}）`,
      fileList: [],
      // 结构化字段，确保审核结果准确存储和索引
      recordType: 'audit',
      decision: 1, // approved
      targetUserId: numericUserId,
      periodDate: row.date
    }
    
    await OrderApi.insertSupervisionOrderTaskNew(auditData)
    
    ElMessage.success(`${row.date} 计划审核通过`)
    
    // 本地更新该行的审核状态
    row.auditDecision = 'approved'
    
    // 强制刷新最新进展
    if (processInstanceId) {
      await getProgressRecords(processInstanceId, true)
      
      // 重建用户选项列表，保留当前选择
      await buildAuditUserOptions(true)
      
      // 刷新当前用户的表格数据
      if (selectedAuditUserId.value) {
        await refreshPlanRowsForSelectedUser()
      }
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('审核通过失败:', error)
    ElMessage.error('审核通过失败')
  }
}

// 审核不通过（审核模式：留痕退回；非审核模式：延期到下一行）
const rejectRow = async (index: number) => {
  const row = progressForm.planRows[index]
  
  // implement_plan 节点：转调新方法
  if (isImplementPlanNode.value) {
    // 通过日期在 planEntryRows 中查找对应的 entry
    const entry = planEntryRows.value.find(e => e.date === row.date)
    if (entry) {
      await rejectEntry(entry)
    } else {
      ElMessage.error('找不到对应的计划记录')
    }
    return
  }
  
  // 其他节点：保持原有逻辑
  if (!canAuditRow(row, index)) {
    return
  }
  
  try {
    if (auditMode.value) {
      // 审核模式：留痕退回 + 内容顺延到下一行
      await ElMessageBox.confirm(
        `确认退回 ${row.date} 的工作计划吗？\n退回后该内容将顺延到下一周期继续完成。`,
        '审核确认',
        {
          confirmButtonText: '确认退回',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      const processInstanceId = props.id?.toString() || route.query.processInstanceId as string || route.params.id as string || route.query.id as string
      
      // 其他节点：使用旧接口
      // 校验必要参数
      if (!orderDetail.value?.reportFrequency) {
        ElMessage.error('督办单未设置汇报频次，无法进行顺延操作，请联系管理员')
        return
      }
      
      if (!orderDetail.value?.deadline) {
        ElMessage.error('督办单未设置截止日期，无法进行顺延操作，请联系管理员')
        return
      }
      
      // 解析真实的用户ID
      let numericUserId: number = 0
      
      if (typeof selectedAuditUserId.value === 'number') {
        numericUserId = selectedAuditUserId.value
      } else if (typeof selectedAuditUserId.value === 'string' && /^\d+$/.test(selectedAuditUserId.value)) {
        numericUserId = parseInt(selectedAuditUserId.value, 10)
      } else {
        const selectedOption = auditUserOptions.value.find(option => option.value === selectedAuditUserId.value)
        if (selectedOption && selectedOption.userId > 0) {
          numericUserId = selectedOption.userId
        }
      }
      
      // 验证用户ID是否有效
      if (numericUserId <= 0) {
        ElMessage.error('无法识别上传人ID，无法执行审核不通过操作。请让该用户重新提交一次或联系管理员处理。')
        return
      }
      
      // 格式化本地日期（避免 toISOString 导致的时区问题）
      const formatLocalDate = (timestamp: number) => {
        const d = new Date(timestamp)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      
      // 使用新审核接口
      const auditReqVO: PlanEntryAuditReqVO = {
        processInstanceId: processInstanceId || '',
        targetUserId: numericUserId,
        periodDate: row.date,
        decision: 2, // 不通过
        remark: `审核不通过并顺延 - ${selectedAuditUserName.value}（${selectedAuditUserDept.value}）`,
        delayNext: true,
        reportFrequency: orderDetail.value.reportFrequency,
        deadline: formatLocalDate(orderDetail.value.deadline)
      }
      await PlanEntryApi.audit(auditReqVO)
      
      ElMessage.success(`${row.date} 计划已退回并顺延到下一周期`)
      
      // 刷新进度记录和用户选项（强制拉取全部记录，保留当前用户选择）
      if (processInstanceId) {
        await getProgressRecords(processInstanceId, true)
        
        // 重建用户选项列表，保留当前选择
        await buildAuditUserOptions(true)
        
        // 刷新当前用户的表格数据
        if (selectedAuditUserId.value) {
          await refreshPlanRowsForSelectedUser()
        }
      }
    } else {
      // 非审核模式：延期到下一行
      await ElMessageBox.confirm(
        `确认将 ${row.date} 的工作计划延期到下一周期吗？`,
        '延期确认',
        {
          confirmButtonText: '确认延期',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      // 移动内容到下一行
      moveRowToNext(index)
      
      ElMessage.success(`${row.date} 计划已延期到下一周期`)
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('审核操作失败:', error)
    ElMessage.error('审核操作失败')
  }
}

// 移动行内容到下一行（普通延期模式）
const moveRowToNext = (index: number) => {
  const currentRow = progressForm.planRows[index]
  const nextIndex = index + 1
  
  // 确保下一行存在
  ensureNextRow(index)
  
  const nextRow = progressForm.planRows[nextIndex]
  
  // 移动内容到下一行
  const delayPrefix = `【延期自 ${currentRow.date}】`
  if (nextRow.summary && nextRow.summary.trim() !== '') {
    nextRow.summary = delayPrefix + nextRow.summary
  } else {
    nextRow.summary = delayPrefix + (currentRow.summary || '')
  }
  
  // 移动附件
  if (currentRow.fileList && currentRow.fileList.length > 0) {
    if (!nextRow.fileList) {
      nextRow.fileList = []
    }
    nextRow.fileList.push(...currentRow.fileList)
  }
  
  // 清空当前行
  currentRow.summary = ''
  currentRow.fileList = []
  
  // 重新计算状态并保存缓存
  recalcPlanRowsStatus()
  const processInstanceId = props.id?.toString() || route.query.processInstanceId as string || route.params.id as string || route.query.id as string
  savePlanRowsToCache(processInstanceId, progressForm.planRows)
}

// 审核模式下移动行内容到下一行（保留当前行内容作为留痕）
const moveRowToNextInAuditMode = (index: number) => {
  const currentRow = progressForm.planRows[index]
  const nextIndex = index + 1
  
  // 确保下一行存在
  ensureNextRow(index)
  
  const nextRow = progressForm.planRows[nextIndex]
  
  console.log('🔍 [moveRowToNextInAuditMode] 顺延内容:', {
    fromDate: currentRow.date,
    toDate: nextRow.date,
    summary: currentRow.summary,
    hasFiles: currentRow.fileList?.length > 0
  })
  
  // 移动内容到下一行
  const delayPrefix = `【审核不通过顺延自 ${currentRow.date}】`
  if (nextRow.summary && nextRow.summary.trim() !== '') {
    // 下一行已有内容，追加到前面
    nextRow.summary = delayPrefix + (currentRow.summary || '') + '\n' + nextRow.summary
  } else {
    // 下一行为空，直接设置
    nextRow.summary = delayPrefix + (currentRow.summary || '')
  }
  
  // 移动附件（去重合并）
  if (currentRow.fileList && currentRow.fileList.length > 0) {
    if (!nextRow.fileList) {
      nextRow.fileList = []
    }
    
    // 去重合并附件（按 url 去重）
    const existingUrls = new Set(nextRow.fileList.map(file => file.url || file.fileUrl || ''))
    currentRow.fileList.forEach(file => {
      const fileUrl = file.url || file.fileUrl || ''
      if (fileUrl && !existingUrls.has(fileUrl)) {
        nextRow.fileList.push(file)
        existingUrls.add(fileUrl)
      }
    })
  }
  
  // 审核模式：保留当前行内容作为留痕，但标记为已驳回状态
  currentRow.status = 'rejected'
  // 不清空 summary 和 fileList，保留作为审核记录
  
  console.log('🔍 [moveRowToNextInAuditMode] 顺延完成:', {
    currentRowStatus: currentRow.status,
    nextRowSummary: nextRow.summary,
    nextRowFiles: nextRow.fileList?.length || 0
  })
  
  // 重新计算状态
  recalcPlanRowsStatus()
}

// 确保下一行存在
const ensureNextRow = (index: number) => {
  const nextIndex = index + 1
  if (nextIndex >= progressForm.planRows.length) {
    // 需要新增下一行
    const currentRow = progressForm.planRows[index]
    const nextDate = getNextDateForRow(currentRow.date)
    
    progressForm.planRows.push({
      date: nextDate,
      summary: '',
      fileList: [],
      submitted: false,
      submittedAt: null,
      status: 'pending'
    })
  }
}

// 根据汇报频次计算下一个日期
const getNextDateForRow = (currentDate: string) => {
  const date = new Date(currentDate.replace(/年|月/g, '-').replace(/日/g, ''))
  const reportFrequency = Number(orderDetail.value.reportFrequency)
  
  switch (reportFrequency) {
    case 1: // 日报
      date.setDate(date.getDate() + 1)
      break
    case 2: // 周报
      date.setDate(date.getDate() + 7)
      break
    case 3: // 半月报
      date.setDate(date.getDate() + 15)
      break
    case 4: // 月报
      date.setMonth(date.getMonth() + 1)
      break
    case 5: // 季报
      date.setMonth(date.getMonth() + 3)
      break
    case 6: // 半年报
      date.setMonth(date.getMonth() + 6)
      break
    case 7: // 年报
      date.setFullYear(date.getFullYear() + 1)
      break
    default: // 默认周报
      date.setDate(date.getDate() + 7)
      break
  }
  
  return formatDateForTable(date)
}

// 处理"查看全部计划"点击事件
const handleViewAllPlansClick = async () => {
  // 如果是督办人在 implement_plan 节点，打开审核弹窗
  if (isImplementPlanNode.value && isCurrentUserSupervisor.value) {
    await openAuditDialog()
  } else {
    // 否则打开正常的进度弹窗
    await showAddProgressDialog()
  }
}

// 显示添加进度更新弹窗
const showAddProgressDialog = async () => {
  auditMode.value = false // 确保非审核模式
  addProgressDialogVisible.value = true
  // 重置表单
  progressForm.deptDetail = ''
  progressForm.planTime = ''
  progressForm.fileList = []
  // upload_plan 节点特殊字段重置
  progressForm.canFinishOnTime = true
  progressForm.delayReason = ''
  progressForm.coopUnitsChanged = false
  progressForm.planRows = []
  
  if (isUploadPlanNode.value) {
    // upload_plan 节点特殊逻辑
    checkCoopUnitsChanged()
    // 监听协办单位变化
    watchCoopUnitsChange()
    // 如果默认选择“是”，初始化计划表格
    if (progressForm.canFinishOnTime) {
      // 先尝试从本地缓存加载上次的计划
      const processInstanceId = props.id?.toString() || route.query.processInstanceId as string || route.params.id as string || route.query.id as string
      const cachedPlanRows = loadPlanRowsFromCache(processInstanceId)
      
      if (cachedPlanRows && cachedPlanRows.length > 0) {
        // 使用缓存的计划
        progressForm.planRows = cachedPlanRows.map(row => ({
          ...row,
          // 重置状态，因为这是新的编辑会话
          submitted: false,
          submittedAt: null,
          status: 'pending'
        }))
      } else {
        // 没有缓存，尝试从当前用户的进度记录中还原上次整套计划
        const currentUser = userStore.getUser
        const currentUserId = currentUser?.id
        
        if (currentUserId) {
          const lastPlanRecord = findLastUploadPlanRecordByUser(currentUserId)
          if (lastPlanRecord) {
            // 从进度记录还原计划（不带附件，避免误提交历史附件）
            let planRows = parsePlanRowsFromDeptDetail(lastPlanRecord.description)
            // 设置为可编辑状态，清空附件
            progressForm.planRows = planRows.map(row => ({
              ...row,
              submitted: false,
              submittedAt: null,
              status: 'pending',
              fileList: [] // 清空附件，避免误提交历史附件
            }))
          } else {
            // 当前用户没有历史记录，生成默认计划
            progressForm.planRows = generatePlanRows()
          }
        } else {
          // 无法获取用户信息，生成默认计划
          progressForm.planRows = generatePlanRows()
        }
      }
      recalcPlanRowsStatus()
    }
  } else {
    // implement_plan 节点：也需要加载缓存和生成计划表格
    const processInstanceId = props.id?.toString() || route.query.processInstanceId as string || route.params.id as string || route.query.id as string
    
    // 强制刷新进度记录，确保获取最新的顺延内容
    await getProgressRecords(processInstanceId, true)
    
    const cachedPlanRows = loadPlanRowsFromCache(processInstanceId)
    
    if (cachedPlanRows && cachedPlanRows.length > 0) {
      // 使用缓存的计划
      progressForm.planRows = cachedPlanRows
    } else {
      // 没有缓存，生成默认计划
      progressForm.planRows = generatePlanRows()
    }
    
    // 无论是否使用缓存，都要填充最新的计划记录数据
    if (isImplementPlanNode.value) {
      await fillPlanRowsFromPlanEntries()
    } else {
      mergeCurrentUserRecordsIntoPlanRows()
    }
    
    // 为每一行计算审核状态
    progressForm.planRows.forEach(row => {
      row.auditDecision = getAuditDecisionForCurrentUser(row.date)
    })
    
    recalcPlanRowsStatus()
  }
}

// 显示添加批示弹窗
const showAddRemarkDialog = () => {
  addRemarkDialogVisible.value = true
  // 重置表单
  remarkForm.remark = ''
}

// 显示查看全部计划弹窗
const showViewAllPlansDialog = (planRows: any[]) => {
  viewAllPlansData.value = planRows || []
  viewAllPlansDialogVisible.value = true
}

// 关闭查看全部计划弹窗
const closeViewAllPlansDialog = () => {
  viewAllPlansDialogVisible.value = false
  viewAllPlansData.value = []
}

// 取消添加批示
const cancelAddRemark = () => {
  addRemarkDialogVisible.value = false
  
  // 重置表单
  remarkForm.remark = ''
}

// 计算计划行状态
const recalcPlanRowsStatus = () => {
  const now = new Date()
  
  if (isUploadPlanNode.value) {
    // upload_plan 节点：所有未提交的行都是 pending，不受时间限制
    progressForm.planRows.forEach(row => {
      if (row.submitted) {
        row.status = 'submitted'
      } else {
        row.status = 'pending'
      }
    })
  } else {
    // implement_plan 节点：按顺序填写，上一行提交后才能填写下一行
    progressForm.planRows.forEach((row, index) => {
      // 已审核（通过/不通过）或顺延占位的行，保持后端状态，不被覆盖
      if (row.status === 'approved' || row.status === 'rejected' || row.status === 'pending_delay') {
        return
      }

      if (row.submitted) {
        row.status = 'submitted'
      } else {
        // 检查前面的行是否都已“完成”（提交或已审核）
        const previousRowsAllCompleted = progressForm.planRows.slice(0, index).every(prevRow => {
          const s = prevRow.status
          return prevRow.submitted || s === 'approved' || s === 'rejected'
        })
        
        if (previousRowsAllCompleted) {
          row.status = 'pending'
        } else {
          row.status = 'waiting' // 等待前面的行提交/审核
        }
      }
    })
  }
}

// 查找第一个可提交的行（implement_plan 节点用）
// 包含 pending 和 pending_delay（顺延占位）状态
const findFirstPendingRow = () => {
  return progressForm.planRows.find(row => row.status === 'pending' || row.status === 'pending_delay')
}

// 判断行是否禁用
const getRowDisabled = (row: any, index: number) => {
  if (isUploadPlanNode.value) {
    // upload_plan 节点：所有行都可编辑（除非已提交），不受时间限制
    return row.status === 'submitted'
  } else {
    // implement_plan 节点：仅第一个 pending 或 pending_delay 行可编辑
    if (row.status === 'submitted' || row.status === 'waiting') {
      return true
    }
    if (row.status === 'pending' || row.status === 'pending_delay') {
      return !isFirstPendingRow(row, index)
    }
    return true
  }
}

// 判断是否为第一个 pending 行
const isFirstPendingRow = (row: any, index: number) => {
  const firstPending = findFirstPendingRow()
  return firstPending && firstPending === row
}

// 计算提交按钮文案
const getSubmitButtonText = computed(() => {
  if (isUploadPlanNode.value) {
    return '提交整套计划'
  } else {
    const targetRow = findFirstPendingRow()
    if (targetRow) {
      return `提交 ${targetRow.date} 计划`
    } else {
      return '暂无可提交计划'
    }
  }
})

// 计算提交按钮是否禁用
const isSubmitDisabled = computed(() => {
  if (isUploadPlanNode.value) {
    return false // upload_plan 节点由表单验证控制
  } else {
    return !findFirstPendingRow() // implement_plan 节点无可提交行时禁用
  }
})

// 本地缓存工具函数
const getPlanRowsCacheKey = (processInstanceId: string) => {
  // 获取当前节点类型（优先判断 implement_plan，避免并行节点时误判）
  const currentNodes = getCurrentWorkflowNodes()
  let nodeKey = 'other'
  if (currentNodes.includes('implement_plan')) {
    nodeKey = 'implement_plan'
  } else if (currentNodes.includes('upload_plan')) {
    nodeKey = 'upload_plan'
  }
  
  // 获取当前用户ID
  const userId = userStore.getUser?.id || 'anonymous'
  
  return `supervision:planRows:${processInstanceId}:${nodeKey}:${userId}`
}

// 获取旧版缓存键（用于向后兼容）
const getOldPlanRowsCacheKey = (processInstanceId: string) => {
  return `supervision:planRows:${processInstanceId}`
}

// 保存整套计划到本地缓存
const savePlanRowsToCache = (processInstanceId: string, planRows: any[]) => {
  try {
    const cacheData = {
      planRows: planRows,
      timestamp: Date.now(),
      version: '1.0'
    }
    localStorage.setItem(getPlanRowsCacheKey(processInstanceId), JSON.stringify(cacheData))
    console.log('整套计划已保存到本地缓存')
  } catch (error) {
    console.warn('保存计划到本地缓存失败:', error)
  }
}

// 从本地缓存读取整套计划
const loadPlanRowsFromCache = (processInstanceId: string) => {
  try {
    // 先尝试读取新版缓存键
    const newCacheKey = getPlanRowsCacheKey(processInstanceId)
    let cached = localStorage.getItem(newCacheKey)
    
    if (cached) {
      const cacheData = JSON.parse(cached)
      if (cacheData.planRows && Array.isArray(cacheData.planRows)) {
        console.log('从新版本地缓存加载整套计划')
        return cacheData.planRows
      }
    }
    
    // 获取当前节点类型，决定是否回退到旧键
    const currentNodes = getCurrentWorkflowNodes()
    const isUploadPlan = currentNodes.includes('upload_plan')
    const isImplementPlan = currentNodes.includes('implement_plan')
    
    // 只有 upload_plan 节点才尝试读取旧版缓存（向后兼容）
    // implement_plan 节点严禁读取旧版缓存，避免被 upload_plan 污染
    if (isUploadPlan && !isImplementPlan) {
      const oldCacheKey = getOldPlanRowsCacheKey(processInstanceId)
      cached = localStorage.getItem(oldCacheKey)
      if (cached) {
        const cacheData = JSON.parse(cached)
        if (cacheData.planRows && Array.isArray(cacheData.planRows)) {
          console.log('从旧版本地缓存加载整套计划（upload_plan 兼容模式）')
          return cacheData.planRows
        }
      }
    }
  } catch (error) {
    console.warn('从本地缓存读取计划失败:', error)
  }
  return null
}

// 构建审核用户选项列表（新版：基于 PlanEntryApi.list）
const buildAuditUserOptions = async (preserveSelection: boolean = false) => {
  console.log('🔍 [buildAuditUserOptions] 开始构建审核用户选项, preserveSelection:', preserveSelection)
  
  // 保存当前选择
  const previousUserId = selectedAuditUserId.value
  
  // 清空现有数据
  auditUserOptions.value = []
  if (!preserveSelection) {
    selectedAuditUserId.value = ''
    selectedAuditUserName.value = ''
    selectedAuditUserDept.value = ''
  }
  
  const processInstanceId = props.id?.toString() || 
                           route.query.processInstanceId as string || 
                           route.params.id as string || 
                           route.query.id as string
  
  if (!processInstanceId) {
    console.log('🔍 [buildAuditUserOptions] 无法获取流程实例ID')
    return
  }
  
  // 获取当前用户信息
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id
  
  if (!currentUserId) {
    console.log('🔍 [buildAuditUserOptions] 无法获取当前用户信息')
    return
  }
  
  try {
    console.log('🔍 [buildAuditUserOptions] 从新API获取所有计划记录')
    
    // 使用新的 PlanEntryApi.list 获取所有用户的计划记录
    const planEntries: PlanEntryRespVO[] = await PlanEntryApi.list(processInstanceId) || []
    
    console.log('🔍 [buildAuditUserOptions] 获取到计划记录数量:', planEntries.length)
    
    // 过滤出需要审核的记录（排除当前督办人自己的记录）
    const recordsToShow = planEntries.filter(entry => {
      // 不能是督办人自己提交的
      return entry.targetUserId !== currentUserId
    })
    
    console.log('🔍 [buildAuditUserOptions] 需要显示的记录数量:', recordsToShow.length)
    
    // 按用户统计
    const userCountMap = new Map<number, { 
      nickname: string, 
      deptName: string, 
      submittedCount: number, 
      totalCount: number 
    }>()
    
    recordsToShow.forEach(entry => {
      const userId = entry.targetUserId
      const nickname = entry.targetUserName || '未知用户'
      const deptName = entry.targetDeptName || '未知部门'
      
      if (userCountMap.has(userId)) {
        const userInfo = userCountMap.get(userId)!
        userInfo.totalCount++
        if (entry.status === 'submitted') {
          userInfo.submittedCount++
        }
      } else {
        userCountMap.set(userId, { 
          nickname, 
          deptName, 
          submittedCount: entry.status === 'submitted' ? 1 : 0,
          totalCount: 1
        })
      }
      
      console.log('🔍 [buildAuditUserOptions] 处理记录:', {
        userId,
        nickname,
        deptName,
        status: entry.status,
        periodDate: entry.periodDate,
        summary: entry.summary?.substring(0, 30) + '...'
      })
    })
    
    // 构建选项列表
    auditUserOptions.value = Array.from(userCountMap.entries()).map(([userId, info]) => {
      return {
        label: `${info.nickname}（部门：${info.deptName}，待审核：${info.submittedCount}）`,
        value: userId, // 直接使用数值用户ID
        nickname: info.nickname,
        deptName: info.deptName,
        count: info.submittedCount, // 待审核数量
        totalCount: info.totalCount, // 总记录数量
        userId: userId // 真实的用户ID
      }
    })
    
    // 按待审核数量降序排序，然后按用户昵称排序
    auditUserOptions.value.sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count // 待审核数量多的在前
      }
      return a.nickname.localeCompare(b.nickname)
    })
    
    // 选择逻辑：如果需要保留选择，优先恢复之前的用户
    if (preserveSelection && previousUserId) {
      const previousOption = auditUserOptions.value.find(opt => 
        String(opt.value) === String(previousUserId)
      )
      
      if (previousOption) {
        // 之前选中的用户仍在列表中，保持选择
        selectedAuditUserId.value = previousOption.value
        selectedAuditUserName.value = previousOption.nickname
        selectedAuditUserDept.value = previousOption.deptName
        console.log('🔍 [buildAuditUserOptions] 保留之前的选择:', previousOption.nickname)
      } else {
        // 之前选中的用户已不在列表中（可能已全部审核完），选择下一个有待审的用户
        const firstWithPending = auditUserOptions.value.find(opt => opt.count > 0)
        const firstOption = firstWithPending || auditUserOptions.value[0]
        
        if (firstOption) {
          selectedAuditUserId.value = firstOption.value
          selectedAuditUserName.value = firstOption.nickname
          selectedAuditUserDept.value = firstOption.deptName
          console.log('🔍 [buildAuditUserOptions] 之前的用户已不在列表，切换到:', firstOption.nickname)
        }
      }
    } else {
      // 不保留选择，默认选中第一个有待审核记录的用户
      const firstWithPending = auditUserOptions.value.find(opt => opt.count > 0)
      const firstOption = firstWithPending || auditUserOptions.value[0]
      
      if (firstOption) {
        selectedAuditUserId.value = firstOption.value
        selectedAuditUserName.value = firstOption.nickname
        selectedAuditUserDept.value = firstOption.deptName
      }
    }
    
    console.log('🔍 [buildAuditUserOptions] 构建完成，用户选项:', auditUserOptions.value.map(opt => `${opt.nickname}(待审核:${opt.count})`))
    console.log('🔍 [buildAuditUserOptions] 当前选中:', selectedAuditUserName.value)
  } catch (error) {
    console.error('🔍 [buildAuditUserOptions] 获取计划记录失败:', error)
    // 静默失败，不影响其他功能
  }
}

// 根据选中的用户刷新表格数据
const refreshPlanRowsForSelectedUser = async () => {
  console.log('🔍 [refreshPlanRowsForSelectedUser] 刷新表格数据，当前用户:', selectedAuditUserName.value)
  
  if (!selectedAuditUserId.value) {
    console.log('🔍 [refreshPlanRowsForSelectedUser] 未选择用户，清空表格')
    progressForm.planRows = []
    return
  }
  
  // 重新生成整套计划行
  progressForm.planRows = generatePlanRows()
  
  const processInstanceId = props.id?.toString() || 
                           route.query.processInstanceId as string || 
                           route.params.id as string || 
                           route.query.id as string
  
  if (!processInstanceId) {
    console.log('🔍 [refreshPlanRowsForSelectedUser] 无法获取流程实例ID')
    return
  }
  
  try {
    // 使用新的 PlanEntryApi.list 获取选中用户的计划记录
    const planEntries: PlanEntryRespVO[] = await PlanEntryApi.list(processInstanceId, selectedAuditUserId.value) || []
    
    console.log('🔍 [refreshPlanRowsForSelectedUser] 获取到计划记录数量:', planEntries.length)
    
    // 将计划记录填充到对应的计划行
    planEntries.forEach(entry => {
      const normalizedPeriodDate = normalizePeriodDate(entry.periodDate)
      const targetRow = progressForm.planRows.find(row => row.date === normalizedPeriodDate)
      
      if (targetRow) {
        // 填充行数据
        targetRow.summary = entry.summary || ''
        targetRow.fileList = parseAttachmentInfo(entry.attachmentInfo) || []
        targetRow.taskId = entry.id
        
        // 根据状态设置行状态
        switch (entry.status) {
          case 'submitted':
            targetRow.submitted = true
            targetRow.submittedAt = entry.updateTime || entry.createTime
            targetRow.status = 'submitted'
            targetRow.isDelayed = entry.isDelayedPlaceholder || false
            break
          case 'approved':
            targetRow.submitted = true
            targetRow.submittedAt = entry.updateTime || entry.createTime
            targetRow.status = 'approved'
            targetRow.auditDecision = 'approved'
            targetRow.isDelayed = false
            break
          case 'rejected':
            targetRow.submitted = true
            targetRow.submittedAt = entry.updateTime || entry.createTime
            targetRow.status = 'rejected'
            targetRow.auditDecision = 'rejected'
            targetRow.isDelayed = false
            break
          case 'pending_delay':
            targetRow.summary = entry.summary || ''
            targetRow.submitted = false
            targetRow.submittedAt = null
            targetRow.status = 'pending_delay'
            targetRow.isDelayed = true
            break
          default:
            targetRow.submitted = false
            targetRow.submittedAt = null
            targetRow.status = 'pending'
            targetRow.isDelayed = false
        }
        
        console.log('🔍 [refreshPlanRowsForSelectedUser] 填充行数据:', {
          date: normalizedPeriodDate,
          status: entry.status,
          summary: targetRow.summary?.substring(0, 30) + '...',
          hasFiles: targetRow.fileList?.length > 0
        })
      }
    })
    
    console.log('🔍 [refreshPlanRowsForSelectedUser] 表格数据刷新完成')
  } catch (error) {
    console.error('🔍 [refreshPlanRowsForSelectedUser] 获取计划记录失败:', error)
    // 静默失败，不影响其他功能
  }
}

// 处理审核用户切换
const onAuditUserChange = async (userKey: string | number) => {
  console.log('🔍 [onAuditUserChange] 用户切换:', userKey)
  
  // 更新选中用户的相关信息（宽松匹配）
  const selectedOption = auditUserOptions.value.find(option => String(option.value) === String(userKey))
  if (selectedOption) {
    selectedAuditUserId.value = selectedOption.value
    selectedAuditUserName.value = selectedOption.nickname
    selectedAuditUserDept.value = selectedOption.deptName
    
    // 如果是 implement_plan 节点，重新加载结构化上下文（按用户过滤）
    if (isImplementPlanNode.value) {
      const processInstanceId = props.id?.toString() || 
                               route.query.processInstanceId as string || 
                               route.params.id as string || 
                               route.query.id as string
      if (processInstanceId && selectedOption.userId > 0) {
        await loadImplementPlanContext(processInstanceId, selectedOption.userId)
      }
    } else {
      // 其他节点：刷新表格数据
      await refreshPlanRowsForSelectedUser()
    }
  }
}

// 获取指定日期和部门的审核决定
const getAuditDecision = (date: string, deptName: string): 'approved' | 'rejected' | null => {
  if (!progressRecords.value || progressRecords.value.length === 0) {
    return null
  }
  
  // 获取当前督办人信息
  const currentUser = userStore.getUser
  const currentUserNickname = currentUser?.nickname
  
  if (!currentUserNickname) {
    return null
  }
  
  // 查找督办人的审核记录
  const auditRecord = progressRecords.value.find(record => {
    // 必须是督办人创建的记录
    if (record.creatorNickName !== currentUserNickname) {
      return false
    }
    
    // 检查是否是审核记录格式
    const isApprovalRecord = record.description.includes(`[审核通过] ${date}（部门：${deptName}）`)
    const isRejectionRecord = record.description.includes(`[审核退回] ${date}（部门：${deptName}）`)
    
    return isApprovalRecord || isRejectionRecord
  })
  
  if (!auditRecord) {
    return null
  }
  
  // 判断审核结果
  if (auditRecord.description.includes(`[审核通过] ${date}（部门：${deptName}）`)) {
    return 'approved'
  } else if (auditRecord.description.includes(`[审核退回] ${date}（部门：${deptName}）`)) {
    return 'rejected'
  }
  
  return null
}

// 审核结果索引（从后端获取的结构化数据）
const auditDecisionByUser = ref(new Map())
const auditDecisionByDept = ref(new Map())

// 获取当前用户指定日期的审核决定（办理单位用）
const getAuditDecisionForCurrentUser = (date: string): 'approved' | 'rejected' | null => {
  // 获取当前用户信息
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id
  const currentUserDeptName = currentUser?.dept?.name
  
  if (!currentUserId) {
    return null
  }
  
  // 优先从结构化索引获取（按用户ID）
  const userKey = `${date}#${currentUserId}`
  if (auditDecisionByUser.value.has(userKey)) {
    return auditDecisionByUser.value.get(userKey)
  }
  
  // 兜底从部门索引获取
  if (currentUserDeptName) {
    const deptKey = `${date}#${currentUserDeptName}`
    if (auditDecisionByDept.value.has(deptKey)) {
      return auditDecisionByDept.value.get(deptKey)
    }
  }
  
  // 最后兜底：使用原有的字符串解析逻辑（保持兼容性）
  return getAuditDecisionByStringParsing(date)
}

// 兜底的字符串解析方法（保持向后兼容）
const getAuditDecisionByStringParsing = (date: string): 'approved' | 'rejected' | null => {
  if (!progressRecords.value || progressRecords.value.length === 0) {
    return null
  }
  
  // 获取当前用户信息
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id
  const currentUserNickname = currentUser?.nickname
  const currentUserDeptName = currentUser?.dept?.name
  
  if (!currentUserId || !currentUserNickname) {
    return null
  }
  
  // 查找审核记录（不限制创建者，只要匹配格式即可）
  const auditRecord = progressRecords.value.find(record => {
    // 优先匹配优化格式（不含用户ID）
    const optimizedApprovalPattern = `[审核通过] ${date}（用户：${currentUserNickname}，部门：${currentUserDeptName}）`
    const optimizedRejectionPattern = `[审核不通过] ${date}（用户：${currentUserNickname}，部门：${currentUserDeptName}）`
    
    // 兼容旧格式（包含用户ID）
    const oldApprovalPattern = `[审核通过] ${date}（用户ID：${currentUserId}，用户：${currentUserNickname}，部门：${currentUserDeptName}）`
    const oldRejectionPattern = `[审核不通过] ${date}（用户ID：${currentUserId}，用户：${currentUserNickname}，部门：${currentUserDeptName}）`
    
    if (record.description.includes(optimizedApprovalPattern) || record.description.includes(optimizedRejectionPattern) ||
        record.description.includes(oldApprovalPattern) || record.description.includes(oldRejectionPattern)) {
      return true
    }
    
    // 向后兼容最旧格式（仅部门）
    if (currentUserDeptName) {
      const legacyApprovalPattern = `[审核通过] ${date}（部门：${currentUserDeptName}）`
      const legacyRejectionPattern = `[审核退回] ${date}（部门：${currentUserDeptName}）`
      const legacyRejectionPattern2 = `[审核不通过] ${date}（部门：${currentUserDeptName}）`
      
      return record.description.includes(legacyApprovalPattern) || 
             record.description.includes(legacyRejectionPattern) || 
             record.description.includes(legacyRejectionPattern2)
    }
    
    return false
  })
  
  if (!auditRecord) {
    return null
  }
  
  // 判断审核结果（优先匹配优化格式）
  const optimizedApprovalPattern = `[审核通过] ${date}（用户：${currentUserNickname}，部门：${currentUserDeptName}）`
  const optimizedRejectionPattern = `[审核不通过] ${date}（用户：${currentUserNickname}，部门：${currentUserDeptName}）`
  
  // 兼容旧格式（包含用户ID）
  const oldApprovalPattern = `[审核通过] ${date}（用户ID：${currentUserId}，用户：${currentUserNickname}，部门：${currentUserDeptName}）`
  const oldRejectionPattern = `[审核不通过] ${date}（用户ID：${currentUserId}，用户：${currentUserNickname}，部门：${currentUserDeptName}）`
  
  if (auditRecord.description.includes(optimizedApprovalPattern) || auditRecord.description.includes(oldApprovalPattern)) {
    return 'approved'
  } else if (auditRecord.description.includes(optimizedRejectionPattern) || auditRecord.description.includes(oldRejectionPattern)) {
    return 'rejected'
  }
  
  // 兼容最旧格式（仅部门）
  if (currentUserDeptName) {
    const legacyApprovalPattern = `[审核通过] ${date}（部门：${currentUserDeptName}）`
    const legacyRejectionPattern = `[审核退回] ${date}（部门：${currentUserDeptName}）`
    const legacyRejectionPattern2 = `[审核不通过] ${date}（部门：${currentUserDeptName}）`
    
    if (auditRecord.description.includes(legacyApprovalPattern)) {
      return 'approved'
    } else if (auditRecord.description.includes(legacyRejectionPattern) || auditRecord.description.includes(legacyRejectionPattern2)) {
      return 'rejected'
    }
  }
  
  return null
}

// 获取指定日期和用户的审核决定（新版本，按用户ID精确匹配）
const getAuditDecisionByUser = (date: string, userId: number, nickname: string, deptName: string): 'approved' | 'rejected' | null => {
  if (!progressRecords.value || progressRecords.value.length === 0) {
    return null
  }
  
  // 获取当前督办人信息
  const currentUser = userStore.getUser
  const currentUserNickname = currentUser?.nickname
  
  if (!currentUserNickname) {
    return null
  }
  
  // 查找督办人的审核记录
  const auditRecord = progressRecords.value.find(record => {
    // 必须是督办人创建的记录
    if (record.creatorNickName !== currentUserNickname) {
      return false
    }
    
    // 优先匹配新格式（包含用户ID）
    const newApprovalPattern = `[审核通过] ${date}（用户ID：${userId}，用户：${nickname}，部门：${deptName}）`
    const newRejectionPattern = `[审核不通过] ${date}（用户ID：${userId}，用户：${nickname}，部门：${deptName}）`
    
    if (record.description.includes(newApprovalPattern) || record.description.includes(newRejectionPattern)) {
      return true
    }
    
    // 向后兼容旧格式（仅部门）
    const oldApprovalPattern = `[审核通过] ${date}（部门：${deptName}）`
    const oldRejectionPattern = `[审核退回] ${date}（部门：${deptName}）`
    
    return record.description.includes(oldApprovalPattern) || record.description.includes(oldRejectionPattern)
  })
  
  if (!auditRecord) {
    return null
  }
  
  // 判断审核结果（优先匹配新格式）
  const newApprovalPattern = `[审核通过] ${date}（用户ID：${userId}，用户：${nickname}，部门：${deptName}）`
  const newRejectionPattern = `[审核不通过] ${date}（用户ID：${userId}，用户：${nickname}，部门：${deptName}）`
  
  if (auditRecord.description.includes(newApprovalPattern)) {
    return 'approved'
  } else if (auditRecord.description.includes(newRejectionPattern)) {
    return 'rejected'
  }
  
  // 兼容旧格式
  const oldApprovalPattern = `[审核通过] ${date}（部门：${deptName}）`
  const oldRejectionPattern = `[审核退回] ${date}（部门：${deptName}）`
  
  if (auditRecord.description.includes(oldApprovalPattern)) {
    return 'approved'
  } else if (auditRecord.description.includes(oldRejectionPattern)) {
    return 'rejected'
  }
  
  return null
}

// 检查记录是否已被督办人审核过
const isAuditedBySupervisor = (record: any): boolean => {
  if (!progressRecords.value || progressRecords.value.length === 0) {
    return false
  }
  
  // 获取当前督办人信息
  const currentUser = userStore.getUser
  const currentUserNickname = currentUser?.nickname
  
  if (!currentUserNickname) {
    return false
  }
  
  // 解析记录的日期和部门
  const dateMatch = record.description.match(/^(\d{4}-\d{2}-\d{2})/)
  if (!dateMatch) {
    return false
  }
  
  const date = dateMatch[1]
  const deptName = record.title || record.creatorDeptName || ''
  
  // 查找是否存在督办人对该日期+用户的审核记录
  const auditRecord = progressRecords.value.find(r => {
    // 必须是督办人创建的记录
    if (r.creatorNickName !== currentUserNickname) {
      return false
    }
    
    // 优先匹配新格式（包含用户ID）
    const userId = getRecordUserId(record)
    const nickname = record.creatorNickName || ''
    const newApprovalPattern = `[审核通过] ${date}（用户ID：${userId}，用户：${nickname}，部门：${deptName}）`
    const newRejectionPattern = `[审核不通过] ${date}（用户ID：${userId}，用户：${nickname}，部门：${deptName}）`
    
    if (r.description.includes(newApprovalPattern) || r.description.includes(newRejectionPattern)) {
      return true
    }
    
    // 向后兼容旧格式（仅部门）
    const oldApprovalPattern = `[审核通过] ${date}（部门：${deptName}）`
    const oldRejectionPattern = `[审核退回] ${date}（部门：${deptName}）`
    
    return r.description.includes(oldApprovalPattern) || r.description.includes(oldRejectionPattern)
  })
  
  return !!auditRecord
}


// 生成计划摘要（前两条计划 + 两个文件）
const generatePlanSummary = (planRows: any[]) => {
  if (!planRows || planRows.length === 0) {
    return { summaryLines: [], files: [], hasMore: false }
  }
  
  // 按日期排序
  const sortedRows = [...planRows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // 取前两条计划
  const summaryRows = sortedRows.slice(0, 2)
  const summaryLines = summaryRows
    .filter(row => row.summary && row.summary.trim() !== '')
    .map(row => `${row.date}：${row.summary}`)
  
  // 收集文件（每行最多一个文件，总计最多两个）
  const files = []
  for (const row of summaryRows) {
    if (row.fileList && row.fileList.length > 0 && files.length < 2) {
      files.push({
        ...row.fileList[0],
        rowDate: row.date
      })
    }
  }
  
  const hasMore = sortedRows.length > 2 || summaryRows.some(row => row.fileList && row.fileList.length > 1)
  
  return { summaryLines, files, hasMore }
}

// 从 deptDetail 文本还原计划行（备用方案）
const parsePlanRowsFromDeptDetail = (deptDetail: string) => {
  if (!deptDetail) return []
  
  const lines = deptDetail.split('\n').filter(line => line.trim() !== '')
  return lines.map(line => {
    const match = line.match(/^(\d{4}-\d{2}-\d{2})：(.+)$/)
    if (match) {
      return {
        date: match[1],
        summary: match[2],
        fileList: [],
        submitted: true,
        submittedAt: null,
        status: 'submitted'
      }
    }
    return null
  }).filter(Boolean)
}

// 查找最后一次上传的整套计划记录
const findLastUploadPlanRecord = () => {
  if (!progressRecords.value || progressRecords.value.length === 0) {
    return null
  }
  
  // 按时间倒序查找最近的整套计划记录
  const sortedRecords = [...progressRecords.value].sort((a, b) => b.createTime - a.createTime)
  
  for (const record of sortedRecords) {
    if (shouldShowPlanSummary(record)) {
      return record
    }
  }
  
  return null
}

// 查找指定用户最后一次上传的整套计划记录（避免预填他人数据）
const findLastUploadPlanRecordByUser = (userId: number) => {
  if (!progressRecords.value || progressRecords.value.length === 0) {
    return null
  }
  
  // 按时间倒序查找最近的整套计划记录，且必须是指定用户创建的
  const sortedRecords = [...progressRecords.value].sort((a, b) => b.createTime - a.createTime)
  
  for (const record of sortedRecords) {
    // 必须是整套计划记录且是指定用户创建的
    if (shouldShowPlanSummary(record) && getRecordUserId(record) === userId) {
      return record
    }
  }
  
  return null
}

// 判断进度记录是否应该显示计划摘要
const shouldShowPlanSummary = (record: any) => {
  // 只有 upload_plan 节点提交的记录才显示摘要
  // 判断标准：deptDetail 包含多行且格式为“日期：内容”
  if (!record.description) return false
  
  const lines = record.description.split('\n').filter(line => line.trim() !== '')
  if (lines.length < 2) return false
  
  // 检查是否至少有一行符合日期格式
  return lines.some(line => /^\d{4}-\d{2}-\d{2}：/.test(line))
}

// 判断是否为单行计划记录（implement_plan 节点）
const isPlanLikeRecord = (record: any) => {
  if (!record.description) return false
  
  // 单行且符合日期格式：YYYY-MM-DD：内容 或 YYYY-MM-DD: 内容（支持全角/半角冒号）
  const lines = record.description.split('\n').filter(line => line.trim() !== '')
  if (lines.length !== 1) return false
  
  // 支持全角冒号"："和半角冒号":"
  return /^\d{4}-\d{2}-\d{2}[：:]/.test(lines[0].trim())
}

// 判断是否应该显示“查看全部计划”链接
const shouldShowViewAllPlansLink = (record: any) => {
  return shouldShowPlanSummary(record) || isPlanLikeRecord(record)
}

// 获取进度记录的计划摘要
const getPlanSummaryForRecord = (record: any) => {
  if (!shouldShowPlanSummary(record)) {
    return { summaryLines: [], files: [], hasMore: false }
  }
  
  // 直接从该记录的 description 还原计划，不使用缓存（避免展示时被当前用户缓存污染）
  const planRows = parsePlanRowsFromDeptDetail(record.description)
  return generatePlanSummary(planRows)
}

// 显示进度记录对应的全部计划
const showViewAllPlansForRecord = async (record: any) => {
  // 判断记录类型：如果是 implement_plan 执行进度记录
  if (record.recordType === 'implement_plan' || isPlanLikeRecord(record)) {
    // 如果当前用户是督办人，打开审核弹窗（可审核）
    if (isCurrentUserSupervisor.value) {
      await openAuditDialog()
      return
    }
    
    // 如果当前用户不是督办人，打开查看弹窗（只读查看该用户的计划）
    const targetUserId = record.targetUserId || record.creatorUserId
    const hasDataInTable = await showStructuredViewAllPlans(targetUserId, false)
    
    if (hasDataInTable) {
      return
    }
    
    // 兜底：生成整套计划并合并记录
    let planRows = generatePlanRows()
    mergeSingleRecordIntoPlanRows(record, planRows)
    showViewAllPlansDialog(planRows)
    return
  }
  
  // 其他记录类型（如整套计划提交）：优先从表中读取，兜底使用 deptDetail 解析
  if (shouldShowPlanSummary(record)) {
    // upload_plan 节点：优先从表中读取整套计划（template 版本）
    const targetUserId = record.targetUserId || record.creatorUserId
    const hasDataInTable = await showStructuredViewAllPlans(targetUserId, true)
    
    // 如果表中有数据，已经打开弹窗，直接返回
    if (hasDataInTable) {
      return
    }
    
    // 兜底：表中无数据时，从 deptDetail 还原（兼容历史数据）
    console.log('🔍 [showViewAllPlansForRecord] 表中无数据，使用 deptDetail 兜底解析')
    let planRows = parsePlanRowsFromDeptDetail(record.description)
    planRows = ensureRowFilesFromAttachments(planRows, record.attachments || [], 'modal')
    showViewAllPlansDialog(planRows)
  } else {
    // 其他情况：生成整套计划并合并记录
    let planRows = generatePlanRows()
    mergeSingleRecordIntoPlanRows(record, planRows)
    showViewAllPlansDialog(planRows)
  }
}

// 显示结构化的全部计划（implement_plan 节点专用）
// 返回值：boolean - 是否成功从表中获取到数据
const showStructuredViewAllPlans = async (targetUserId?: number, forceTemplate: boolean = false): Promise<boolean> => {
  const processInstanceId = props.id?.toString() || 
                           route.query.processInstanceId as string || 
                           route.params.id as string || 
                           route.query.id as string
  
  if (!processInstanceId) {
    console.log('🔍 [showStructuredViewAllPlans] 无法获取流程实例ID')
    return false
  }
  
  try {
    console.log('🔍 [showStructuredViewAllPlans] 开始获取结构化计划数据, targetUserId:', targetUserId, 'forceTemplate:', forceTemplate)
    
    // 根据节点类型决定查询哪个版本的计划记录
    let planEntries: PlanEntryRespVO[] = []
    
    // 判断当前是否为历史节点（通过检查是否有运行中的任务来判断）
    const isHistoricalNode = !fullActivityNodes.value.some(node => node.status === 1)
    
    if (forceTemplate || isHistoricalNode) {
      // 强制查询template版本（整套计划）或历史节点
      try {
        planEntries = await PlanEntryApi.listByVersionType(processInstanceId, 'template') || []
        console.log('🔍 [showStructuredViewAllPlans] 获取到template版本计划记录:', planEntries.length, '条')
      } catch (error) {
        console.warn('🔍 [showStructuredViewAllPlans] 获取template版本失败，尝试获取所有记录:', error)
        planEntries = await PlanEntryApi.list(processInstanceId, targetUserId) || []
      }
    } else {
      // 当前活动节点：查询exec版本（执行阶段的记录）
      try {
        planEntries = await PlanEntryApi.listByVersionType(processInstanceId, 'exec') || []
        console.log('🔍 [showStructuredViewAllPlans] 获取到exec版本计划记录:', planEntries.length, '条')
        
        // 如果exec版本为空，兜底查询所有记录
        if (planEntries.length === 0) {
          planEntries = await PlanEntryApi.list(processInstanceId, targetUserId) || []
          console.log('🔍 [showStructuredViewAllPlans] exec版本为空，兜底获取所有记录:', planEntries.length, '条')
        }
      } catch (error) {
        console.warn('🔍 [showStructuredViewAllPlans] 获取exec版本失败，尝试获取所有记录:', error)
        planEntries = await PlanEntryApi.list(processInstanceId, targetUserId) || []
      }
    }
    
    // 如果指定了targetUserId，过滤只保留该用户的记录
    if (targetUserId) {
      planEntries = planEntries.filter(entry => entry.targetUserId === targetUserId)
      console.log('🔍 [showStructuredViewAllPlans] 过滤后只保留用户', targetUserId, '的记录:', planEntries.length, '条')
    }
    
    console.log('🔍 [showStructuredViewAllPlans] 获取到计划记录数量:', planEntries.length)
    
    // 如果没有数据，返回 false 让调用方使用兜底方案
    if (planEntries.length === 0) {
      console.log('🔍 [showStructuredViewAllPlans] 表中无数据，返回 false')
      return false
    }
    
    // 生成基础计划行
    const planRows = generatePlanRows()
    
    // 按用户分组计划记录
    const userPlanMap = new Map<number, PlanEntryRespVO[]>()
    planEntries.forEach(entry => {
      const userId = entry.targetUserId
      if (!userPlanMap.has(userId)) {
        userPlanMap.set(userId, [])
      }
      userPlanMap.get(userId)!.push(entry)
    })
    
    // 为每个计划行填充数据
    planRows.forEach(row => {
      row.hasAnyContent = false
      
      if (forceTemplate) {
        // 整套计划（template）：使用单用户模式，不设置 userPlans
        // 这样模板会走单用户渲染分支，呈现简洁样式
        userPlanMap.forEach((userEntries, userId) => {
          const matchingEntry = userEntries.find(entry => normalizePeriodDate(entry.periodDate) === row.date)
          
          if (matchingEntry) {
            row.summary = matchingEntry.summary || ''
            row.fileList = parseAttachmentInfo(matchingEntry.attachmentInfo) || []
            row.hasAnyContent = Boolean(row.summary) || row.fileList.length > 0
          }
        })
      } else {
        // 执行进度（exec）：使用多用户模式，设置 userPlans
        row.userPlans = []
        
        // 遍历所有用户的计划记录
        userPlanMap.forEach((userEntries, userId) => {
          const matchingEntry = userEntries.find(entry => normalizePeriodDate(entry.periodDate) === row.date)
          
          if (matchingEntry) {
            const userPlan = {
              userId: matchingEntry.targetUserId,
              userName: matchingEntry.targetUserName,
              deptName: matchingEntry.targetDeptName,
              summary: matchingEntry.summary || '',
              status: matchingEntry.status,
              statusDisplay: matchingEntry.statusDisplay,
              fileList: parseAttachmentInfo(matchingEntry.attachmentInfo) || [],
              isDelayed: matchingEntry.isDelayedPlaceholder || false,
              createTime: matchingEntry.createTime,
              updateTime: matchingEntry.updateTime
            }
            
            row.userPlans.push(userPlan)
            
            if (userPlan.summary || userPlan.fileList.length > 0) {
              row.hasAnyContent = true
            }
          }
        })
        
        // 按用户名排序
        row.userPlans.sort((a, b) => a.userName.localeCompare(b.userName))
      }
    })
    
    // 只显示有内容的行
    const rowsWithContent = planRows.filter(row => row.hasAnyContent)
    
    console.log('🔍 [showStructuredViewAllPlans] 处理完成，有内容的行数:', rowsWithContent.length)
    
    showViewAllPlansDialog(rowsWithContent)
    return true
  } catch (error) {
    console.error('🔍 [showStructuredViewAllPlans] 获取结构化计划数据失败:', error)
    ElMessage.error('获取计划数据失败')
    return false
  }
}

// 将单行记录合并到计划行中（增强容错）
const mergeSingleRecordIntoPlanRows = (record: any, planRows: any[]) => {
  if (!record.description) return
  
  // 清理描述文本：去除BOM、不可见字符、多余空格
  let line = record.description.replace(/[\uFEFF\u200B-\u200D\u2060]/g, '').trim()
  
  // 支持全角冒号"："和半角冒号":"，允许日期后有空格
  const match = line.match(/^(\d{4}-\d{2}-\d{2})\s*[：:]\s*(.+)$/)
  if (!match) {
    console.warn('🚨 [mergeSingleRecordIntoPlanRows] 无法解析记录格式:', {
      description: record.description,
      cleanedLine: line,
      creatorNickName: record.creatorNickName
    })
    return
  }
  
  const [, dateStr, summary] = match
  const cleanSummary = summary.trim()
  
  console.log('🔍 [mergeSingleRecordIntoPlanRows] 解析成功:', {
    dateStr,
    summary: cleanSummary,
    creatorNickName: record.creatorNickName
  })
  
  // 找到对应日期的行
  const targetRow = planRows.find(row => row.date === dateStr)
  if (targetRow) {
    // 判断是否为顺延记录（优先使用结构化字段，兜底使用字符串匹配）
    const isDelayedRecord = (record.recordType === 'implement_plan' && record.sourceTaskId) || 
                           (cleanSummary && cleanSummary.includes('【审核不通过顺延自'))
    
    if (isDelayedRecord) {
      // 顺延记录：作为占位符，仅在该行还未有正常记录时才设置
      if (!targetRow.submitted && !targetRow.hasNormalRecord) {
        // 优先使用原始内容，兜底使用完整内容
        targetRow.summary = record.originalContent || cleanSummary
        targetRow.submitted = false // 重要：不标记为已提交
        targetRow.submittedAt = null
        targetRow.status = 'pending' // 保持待填写状态
        targetRow.isDelayed = true // 标记为顺延记录
      }
      // 如果已有正常记录，顺延记录不覆盖
    } else {
      // 正常记录：标记为已提交，覆盖任何顺延占位
      if (cleanSummary && cleanSummary !== '') {
        targetRow.summary = cleanSummary
      }
      targetRow.submitted = true
      targetRow.submittedAt = record.createTime
      targetRow.status = 'submitted'
      targetRow.isDelayed = false
      targetRow.hasNormalRecord = true // 标记该行已有正常记录
    }
    
    // 设置任务ID，用于审核不通过时的sourceTaskId传递
    if (record.id) {
      targetRow.taskId = record.id
    }
    
    // 合并附件
    if (record.attachments && record.attachments.length > 0) {
      targetRow.fileList = record.attachments
    }
    
    console.log('🔍 [mergeSingleRecordIntoPlanRows] 合并完成:', {
      date: dateStr,
      summary: targetRow.summary,
      hasFiles: targetRow.fileList?.length > 0
    })
  } else {
    console.warn('🚨 [mergeSingleRecordIntoPlanRows] 未找到对应日期的行:', {
      dateStr,
      availableDates: planRows.map(row => row.date),
      creatorNickName: record.creatorNickName
    })
  }
}

// 获取文件URL（兼容多种字段格式）
const getFileUrl = (file: any) => {
  if (!file) return ''
  return file.url || file.fileUrl || file.response?.data?.url || file.response?.url || ''
}

// 为计划行分配附件（兼容模式）
const ensureRowFilesFromAttachments = (planRows: any[], attachments: any[], mode: 'summary' | 'modal') => {
  if (!planRows || !attachments || attachments.length === 0) {
    return planRows
  }
  
  // 按日期排序计划行
  const sortedRows = [...planRows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  if (mode === 'summary') {
    // 摘要模式：仅为前两条行各分配至多1个文件
    const firstTwoRows = sortedRows.slice(0, 2)
    let attachmentIndex = 0
    
    firstTwoRows.forEach(row => {
      if (!row.fileList || row.fileList.length === 0) {
        if (attachmentIndex < attachments.length) {
          row.fileList = [attachments[attachmentIndex]]
          attachmentIndex++
        }
      }
    })
    
    return sortedRows
  } else {
    // 弹窗模式：将所有附件按顺序分配到各行
    let attachmentIndex = 0
    
    sortedRows.forEach(row => {
      if (!row.fileList || row.fileList.length === 0) {
        // 为每行分配一个或多个文件（这里先分配一个）
        if (attachmentIndex < attachments.length) {
          row.fileList = [attachments[attachmentIndex]]
          attachmentIndex++
        }
      }
    })
    
    // 如果还有剩余附件，继续分配到已有文件的行
    while (attachmentIndex < attachments.length) {
      for (const row of sortedRows) {
        if (attachmentIndex >= attachments.length) break
        if (row.fileList && row.fileList.length > 0) {
          row.fileList.push(attachments[attachmentIndex])
          attachmentIndex++
        }
      }
      // 防止无限循环
      if (attachmentIndex < attachments.length) {
        // 如果还有附件但所有行都没有文件，放到第一行
        if (sortedRows.length > 0) {
          if (!sortedRows[0].fileList) sortedRows[0].fileList = []
          sortedRows[0].fileList.push(attachments[attachmentIndex])
          attachmentIndex++
        } else {
          break
        }
      }
    }
    
    return sortedRows
  }
}

// 生成简化的计划摘要（前两条 + 对应文件）
const getSimplePlanSummary = (record: any) => {
  if (!shouldShowPlanSummary(record)) {
    return []
  }
  
  // 直接从该记录的 description 还原计划，不使用缓存（避免展示时被当前用户缓存污染）
  let planRows = parsePlanRowsFromDeptDetail(record.description)
  // 为计划行分配附件（摘要模式）
  planRows = ensureRowFilesFromAttachments(planRows, record.attachments || [], 'summary')
  
  if (!planRows || planRows.length === 0) {
    return []
  }
  
  // 按日期排序，取前两条
  const sortedRows = [...planRows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const firstTwoRows = sortedRows.slice(0, 2)
  
  return firstTwoRows.map(row => ({
    text: `${row.date}：${row.summary || '工作进度更新'}`,
    file: row.fileList && row.fileList.length > 0 ? row.fileList[0] : null
  }))
}

// 判断是否有更多计划
const hasMorePlans = (record: any) => {
  if (!shouldShowPlanSummary(record)) {
    return false
  }
  
  // 直接从该记录的 description 还原计划，不使用缓存（避免展示时被当前用户缓存污染）
  const planRows = parsePlanRowsFromDeptDetail(record.description)
  
  if (!planRows || planRows.length === 0) {
    return false
  }
  
  // 检查是否有超过两条计划，或者前两条中有多个文件
  const sortedRows = [...planRows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return sortedRows.length > 2 || sortedRows.slice(0, 2).some(row => row.fileList && row.fileList.length > 1)
}

// 检测协办单位是否变更（upload_plan 节点专用）
const checkCoopUnitsChanged = () => {
  if (!isUploadPlanNode.value) return
  
  // 获取当前表单中的协办单位
  const currentCoopUnits = editForm.value.collaborateDeptIds || []
  
  // 获取原始协办单位（从 orderDetail 中获取）
  const originalCoopUnits = orderDetail.value?.coDept ? 
    orderDetail.value.coDept.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []
  
  // 比较两个数组是否相同
  const arraysEqual = (arr1: number[], arr2: number[]) => {
    if (arr1.length !== arr2.length) return false
    const sorted1 = [...arr1].sort()
    const sorted2 = [...arr2].sort()
    return sorted1.every((val, index) => val === sorted2[index])
  }
  
  progressForm.coopUnitsChanged = !arraysEqual(currentCoopUnits, originalCoopUnits)
}

// 监听协办单位变化（upload_plan 节点专用）
const watchCoopUnitsChange = () => {
  if (!isUploadPlanNode.value) return
  
  // 监听协办单位ID数组的变化
  watch(() => editForm.value.collaborateDeptIds, () => {
    if (addProgressDialogVisible.value) {
      checkCoopUnitsChanged()
    }
  }, { deep: true })
}

// 提交批示
const submitAddRemark = async () => {
  if (!remarkFormRef.value) return

  try {
    await remarkFormRef.value.validate()

    // 二次确认弹窗
    await ElMessageBox.confirm(
      `请确认提交该批示：\n\n${remarkForm.remark}`,
      '二次确认',
      {
        type: 'warning',
        confirmButtonText: '确认提交',
        cancelButtonText: '取消'
      }
    )

    const processInstanceId = props.id?.toString() ||
                             route.query.processInstanceId as string ||
                             route.params.id as string ||
                             route.query.id as string

    // 调用批示创建接口
    const remarkData = {
      processInstanceId: processInstanceId || '',
      remark: remarkForm.remark
    }
    // 实际调用后端批示创建接口
    await LeaderRemarkApi.insertLeaderRemark(remarkData)
    
    ElMessage.success('批示添加成功')
    addRemarkDialogVisible.value = false
    remarkForm.remark = ''

    // 刷新进度记录列表
    if (processInstanceId) {
      await getProgressRecords(processInstanceId, isExpanded.value)
    }
  } catch (error) {
    // 用户取消确认时不显示错误信息
    if (error === 'cancel') {
      return
    }
    console.error('添加批示失败:', error)
    ElMessage.error('添加批示失败')
  }
}

// 切换进度记录显示状态（折叠/展开）
const toggleProgressRecords = async () => {
  if (isToggling.value) return // 防止频繁点击

  const processInstanceId = props.id?.toString() ||
                           route.query.processInstanceId as string ||
                           route.params.id as string ||
                           route.query.id as string

  if (!processInstanceId) return

  try {
    isToggling.value = true

    // 切换状态
    isExpanded.value = !isExpanded.value

    // 根据新状态调用接口
    await getProgressRecords(processInstanceId, isExpanded.value)

  } catch (error) {
    console.error('切换进度记录显示状态失败:', error)
    ElMessage.error('切换显示状态失败')
    // 发生错误时恢复原状态
    isExpanded.value = !isExpanded.value
  } finally {
    isToggling.value = false
  }
}

// 预览进度记录中的附件
const previewProgressFile = (file: any) => {
  if (!file.url) {
    ElMessage.warning('文件地址不存在，无法预览')
    return
  }

  try {
    // 使用 KKFileView 进行预览
    KKFileView.preview(file.url, file.name)
  } catch (error) {
    console.error('KKFileView 预览失败，尝试直接打开:', error)
    // 兜底逻辑：直接在新窗口打开文件
    try {
      window.open(file.url, '_blank')
    } catch (openError) {
      console.error('直接打开文件也失败:', openError)
      ElMessage.error('文件预览失败，请尝试下载查看')
    }
  }
}

// 下载进度记录中的附件
const downloadProgressFile = (file: any) => {
  if (file.url) {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success(`正在下载：${file.name}`)
  } else {
    ElMessage.info(`文件：${file.name}`)
  }
}

// 进度更新弹窗相关方法
const progressFormRef = ref()
const progressUploadRef = ref()
const remarkFormRef = ref()

// 格式化截止时间显示
const formatDeadlineDisplay = (deadline: number | string) => {
  if (!deadline) return '未设置'
  
  try {
    const date = typeof deadline === 'number' ? new Date(deadline) : new Date(deadline)
    if (isNaN(date.getTime())) return '无效日期'
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}年${month}月${day}日`
  } catch (error) {
    console.error('日期格式化失败:', error)
    return '无效日期'
  }
}

// 根据汇报频次生成计划行
const generatePlanRows = () => {
  const rows = []
  
  // 获取起始日期（督办单创建时间）
  let startDate = new Date()
  if (orderDetail.value.createTime) {
    startDate = new Date(orderDetail.value.createTime)
  }
  // 归一化为当天 00:00:00
  startDate.setHours(0, 0, 0, 0)
  
  // 获取截止日期
  let endDate = new Date()
  if (orderDetail.value.deadline) {
    endDate = new Date(orderDetail.value.deadline)
  } else {
    // 如果没有截止日期，默认从创建日期开始一周
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 7)
  }
  // 归一化为当天 23:59:59
  endDate.setHours(23, 59, 59, 999)
  
  // 检查日期范围是否有效
  if (startDate > endDate) {
    console.warn('创建时间晚于截止时间，无法生成计划行')
    return rows // 返回空数组
  }
  
  // 获取汇报频次（按数值严格映射）
  const reportFrequency = Number(orderDetail.value.reportFrequency)
  let frequencyType = 'weekly' // 默认周报
  
  switch (reportFrequency) {
    case 1:
      frequencyType = 'daily'
      break
    case 2:
      frequencyType = 'weekly'
      break
    case 3:
      frequencyType = 'biweekly' // 半月报
      break
    case 4:
      frequencyType = 'monthly'
      break
    case 5:
      frequencyType = 'quarterly'
      break
    case 6:
      frequencyType = 'halfyearly'
      break
    case 7:
      frequencyType = 'yearly'
      break
    default:
      frequencyType = 'weekly' // 默认周报
      break
  }
  
  // 根据频次类型生成计划行
  switch (frequencyType) {
    case 'daily':
      generateDailyRowsForPlan(startDate, endDate, rows)
      break
    case 'weekly':
      generateWeeklyRowsForPlan(startDate, endDate, rows)
      break
    case 'biweekly':
      generateBiWeeklyRowsForPlan(startDate, endDate, rows)
      break
    case 'monthly':
      generateMonthlyRowsForPlan(startDate, endDate, rows)
      break
    case 'quarterly':
      generateQuarterlyRowsForPlan(startDate, endDate, rows)
      break
    case 'halfyearly':
      generateHalfYearlyRowsForPlan(startDate, endDate, rows)
      break
    case 'yearly':
      generateYearlyRowsForPlan(startDate, endDate, rows)
      break
    default:
      generateStageRowsForPlan(startDate, endDate, rows)
      break
  }
  
  return rows
}

// 生成日报行
const generateDailyRows = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  
  while (current <= endDate) {
    rows.push({
      date: formatDateForTable(current),
      summary: '',
      fileList: []
    })
    current.setDate(current.getDate() + 1)
  }
}

// 生成周报行
const generateWeeklyRows = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  
  // 始终包含创建日
  rows.push({
    date: formatDateForTable(current),
    summary: '',
    fileList: []
  })
  
  // 每隔7天生成一行
  current.setDate(current.getDate() + 7)
  
  while (current < endDate) {
    rows.push({
      date: formatDateForTable(current),
      summary: '',
      fileList: []
    })
    current.setDate(current.getDate() + 7)
  }
  
  // 始终包含截止日（如果不是同一天）
  if (formatDateForTable(new Date(endDate)) !== rows[rows.length - 1].date) {
    rows.push({
      date: formatDateForTable(endDate),
      summary: '',
      fileList: []
    })
  }
}

// 生成半月报行
const generateBiWeeklyRows = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  
  // 始终包含创建日
  rows.push({
    date: formatDateForTable(current),
    summary: '',
    fileList: []
  })
  
  // 每隔15天生成一行
  current.setDate(current.getDate() + 15)
  
  while (current < endDate) {
    rows.push({
      date: formatDateForTable(current),
      summary: '',
      fileList: []
    })
    current.setDate(current.getDate() + 15)
  }
  
  // 始终包含截止日（如果不是同一天）
  if (formatDateForTable(new Date(endDate)) !== rows[rows.length - 1].date) {
    rows.push({
      date: formatDateForTable(endDate),
      summary: '',
      fileList: []
    })
  }
}

// 生成月报行
const generateMonthlyRows = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  
  // 始终包含创建日
  rows.push({
    date: formatDateForTable(current),
    summary: '',
    fileList: []
  })
  
  // 每个月生成一行
  while (current < endDate) {
    current.setMonth(current.getMonth() + 1)
    
    // 处理月末日期不存在的情况（如从31号到某月没有31号）
    if (current.getDate() !== startDate.getDate()) {
      current.setDate(0) // 设置为上个月的最后一天
    }
    
    if (current < endDate) {
      rows.push({
        date: formatDateForTable(current),
        summary: '',
        fileList: []
      })
    }
  }
  
  // 始终包含截止日（如果不是同一天）
  if (formatDateForTable(new Date(endDate)) !== rows[rows.length - 1].date) {
    rows.push({
      date: formatDateForTable(endDate),
      summary: '',
      fileList: []
    })
  }
}

// 生成季报行
const generateQuarterlyRows = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  
  // 始终包含创建日
  rows.push({
    date: formatDateForTable(current),
    summary: '',
    fileList: []
  })
  
  // 每3个月生成一行
  while (current < endDate) {
    current.setMonth(current.getMonth() + 3)
    
    if (current.getDate() !== startDate.getDate()) {
      current.setDate(0)
    }
    
    if (current < endDate) {
      rows.push({
        date: formatDateForTable(current),
        summary: '',
        fileList: []
      })
    }
  }
  
  if (formatDateForTable(new Date(endDate)) !== rows[rows.length - 1].date) {
    rows.push({
      date: formatDateForTable(endDate),
      summary: '',
      fileList: []
    })
  }
}

// 生成半年报行
const generateHalfYearlyRows = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  
  rows.push({
    date: formatDateForTable(current),
    summary: '',
    fileList: []
  })
  
  while (current < endDate) {
    current.setMonth(current.getMonth() + 6)
    
    if (current.getDate() !== startDate.getDate()) {
      current.setDate(0)
    }
    
    if (current < endDate) {
      rows.push({
        date: formatDateForTable(current),
        summary: '',
        fileList: []
      })
    }
  }
  
  if (formatDateForTable(new Date(endDate)) !== rows[rows.length - 1].date) {
    rows.push({
      date: formatDateForTable(endDate),
      summary: '',
      fileList: []
    })
  }
}

// 生成年报行
const generateYearlyRows = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  
  rows.push({
    date: formatDateForTable(current),
    summary: '',
    fileList: []
  })
  
  while (current < endDate) {
    current.setFullYear(current.getFullYear() + 1)
    
    // 处理闰年情况（2月29日）
    if (current.getMonth() === 1 && current.getDate() === 29) {
      if (!isLeapYear(current.getFullYear())) {
        current.setDate(28)
      }
    }
    
    if (current < endDate) {
      rows.push({
        date: formatDateForTable(current),
        summary: '',
        fileList: []
      })
    }
  }
  
  if (formatDateForTable(new Date(endDate)) !== rows[rows.length - 1].date) {
    rows.push({
      date: formatDateForTable(endDate),
      summary: '',
      fileList: []
    })
  }
}

// 判断是否为闰年
const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

// 格式化日期为表格显示格式
const formatDateForTable = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 规范化期次日期为统一的字符串格式 YYYY-MM-DD
const normalizePeriodDate = (value: any): string => {
  if (!value) return ''
  
  // 如果已经是字符串格式 YYYY-MM-DD，直接返回
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  
  // 如果是数组格式 [year, month, day]
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  
  // 如果是 Date 对象
  if (value instanceof Date) {
    return formatDateForTable(value)
  }
  
  // 如果是时间戳（数字）
  if (typeof value === 'number') {
    return formatDateForTable(new Date(value))
  }
  
  // 兜底：尝试转换为 Date
  try {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return formatDateForTable(date)
    }
  } catch (e) {
    console.warn('无法解析期次日期:', value)
  }
  
  return ''
}

// 格式化日期为计划表格格式（YYYY-MM-DD）
const formatDateForPlan = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 生成日报行（用于计划表格）
const generateDailyRowsForPlan = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  const endDateOnly = new Date(endDate)
  endDateOnly.setHours(0, 0, 0, 0) // 只比较日期部分
  
  while (current <= endDateOnly) {
    rows.push({
      date: formatDateForPlan(current),
      summary: '',
      fileList: [],
      submitted: false,
      submittedAt: null,
      status: 'future'
    })
    current.setDate(current.getDate() + 1)
  }
}

// 生成周报行（用于计划表格）
const generateWeeklyRowsForPlan = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  const endDateOnly = new Date(endDate)
  endDateOnly.setHours(0, 0, 0, 0) // 只比较日期部分
  
  // 始终包含开始日
  rows.push({
    date: formatDateForPlan(current),
    summary: '',
    fileList: [],
    submitted: false,
    submittedAt: null,
    status: 'future'
  })
  
  // 每隔7天生成一行
  current.setDate(current.getDate() + 7)
  
  while (current <= endDateOnly) {
    rows.push({
      date: formatDateForPlan(current),
      summary: '',
      fileList: [],
      submitted: false,
      submittedAt: null,
      status: 'future'
    })
    current.setDate(current.getDate() + 7)
  }
  
  // 始终包含截止日（如果不是同一天且未超过截止日）
  const endDateFormatted = formatDateForPlan(endDateOnly)
  if (rows.length > 0 && endDateFormatted !== rows[rows.length - 1].date) {
    rows.push({
      date: endDateFormatted,
      summary: '',
      fileList: [],
      submitted: false,
      submittedAt: null,
      status: 'future'
    })
  }
}

// 生成半月报行（用于计划表格）
const generateBiWeeklyRowsForPlan = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  const endDateOnly = new Date(endDate)
  endDateOnly.setHours(0, 0, 0, 0) // 只比较日期部分
  
  // 始终包含开始日
  rows.push({
    date: formatDateForPlan(current),
    summary: '',
    fileList: [],
    submitted: false,
    submittedAt: null,
    status: 'future'
  })
  
  // 每隔15天生成一行
  current.setDate(current.getDate() + 15)
  
  while (current <= endDateOnly) {
    rows.push({
      date: formatDateForPlan(current),
      summary: '',
      fileList: [],
      submitted: false,
      submittedAt: null,
      status: 'future'
    })
    current.setDate(current.getDate() + 15)
  }
  
  // 始终包含截止日（如果不是同一天且未超过截止日）
  const endDateFormatted = formatDateForPlan(endDateOnly)
  if (rows.length > 0 && endDateFormatted !== rows[rows.length - 1].date) {
    rows.push({
      date: endDateFormatted,
      summary: '',
      fileList: [],
      submitted: false,
      submittedAt: null,
      status: 'future'
    })
  }
}

// 生成月报行（用于计划表格）
const generateMonthlyRowsForPlan = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  const endDateOnly = new Date(endDate)
  endDateOnly.setHours(0, 0, 0, 0) // 只比较日期部分
  
  // 始终包含开始日
  rows.push({
    date: formatDateForPlan(current),
    summary: '',
    fileList: [],
    submitted: false,
    submittedAt: null,
    status: 'future'
  })
  
  // 每个月生成一行
  while (current <= endDateOnly) {
    current.setMonth(current.getMonth() + 1)
    
    // 处理月末日期不存在的情况（如从31号到某月没有31号）
    if (current.getDate() !== startDate.getDate()) {
      current.setDate(0) // 设置为上个月的最后一天
    }
    
    if (current <= endDateOnly) {
      rows.push({
        date: formatDateForPlan(current),
        summary: '',
        fileList: [],
        submitted: false,
        submittedAt: null,
        status: 'future'
      })
    }
  }
  
  // 始终包含截止日（如果不是同一天且未超过截止日）
  const endDateFormatted = formatDateForPlan(endDateOnly)
  if (rows.length > 0 && endDateFormatted !== rows[rows.length - 1].date) {
    rows.push({
      date: endDateFormatted,
      summary: '',
      fileList: [],
      submitted: false,
      submittedAt: null,
      status: 'future'
    })
  }
}

// 生成季报行（用于计划表格）
const generateQuarterlyRowsForPlan = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  const endDateOnly = new Date(endDate)
  endDateOnly.setHours(0, 0, 0, 0)
  
  rows.push({
    date: formatDateForPlan(current),
    summary: '',
    fileList: [],
    submitted: false,
    submittedAt: null,
    status: 'future'
  })
  
  while (current <= endDateOnly) {
    current.setMonth(current.getMonth() + 3)
    if (current.getDate() !== startDate.getDate()) {
      current.setDate(0)
    }
    if (current <= endDateOnly) {
      rows.push({
        date: formatDateForPlan(current),
        summary: '',
        fileList: [],
        submitted: false,
        submittedAt: null,
        status: 'future'
      })
    }
  }
  
  const endDateFormatted = formatDateForPlan(endDateOnly)
  if (rows.length > 0 && endDateFormatted !== rows[rows.length - 1].date) {
    rows.push({
      date: endDateFormatted,
      summary: '',
      fileList: [],
      submitted: false,
      submittedAt: null,
      status: 'future'
    })
  }
}

// 生成半年报行（用于计划表格）
const generateHalfYearlyRowsForPlan = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  const endDateOnly = new Date(endDate)
  endDateOnly.setHours(0, 0, 0, 0)
  
  rows.push({
    date: formatDateForPlan(current),
    summary: '',
    fileList: [],
    submitted: false,
    submittedAt: null,
    status: 'future'
  })
  
  while (current <= endDateOnly) {
    current.setMonth(current.getMonth() + 6)
    if (current.getDate() !== startDate.getDate()) {
      current.setDate(0)
    }
    if (current <= endDateOnly) {
      rows.push({
        date: formatDateForPlan(current),
        summary: '',
        fileList: [],
        submitted: false,
        submittedAt: null,
        status: 'future'
      })
    }
  }
  
  const endDateFormatted = formatDateForPlan(endDateOnly)
  if (rows.length > 0 && endDateFormatted !== rows[rows.length - 1].date) {
    rows.push({
      date: endDateFormatted,
      summary: '',
      fileList: [],
      submitted: false,
      submittedAt: null,
      status: 'future'
    })
  }
}

// 生成年报行（用于计划表格）
const generateYearlyRowsForPlan = (startDate: Date, endDate: Date, rows: any[]) => {
  const current = new Date(startDate)
  const endDateOnly = new Date(endDate)
  endDateOnly.setHours(0, 0, 0, 0)
  
  rows.push({
    date: formatDateForPlan(current),
    summary: '',
    fileList: [],
    submitted: false,
    submittedAt: null,
    status: 'future'
  })
  
  while (current <= endDateOnly) {
    current.setFullYear(current.getFullYear() + 1)
    if (current.getMonth() === 1 && current.getDate() === 29) {
      if (!isLeapYear(current.getFullYear())) {
        current.setDate(28)
      }
    }
    if (current <= endDateOnly) {
      rows.push({
        date: formatDateForPlan(current),
        summary: '',
        fileList: [],
        submitted: false,
        submittedAt: null,
        status: 'future'
      })
    }
  }
  
  const endDateFormatted = formatDateForPlan(endDateOnly)
  if (rows.length > 0 && endDateFormatted !== rows[rows.length - 1].date) {
    rows.push({
      date: endDateFormatted,
      summary: '',
      fileList: [],
      submitted: false,
      submittedAt: null,
      status: 'future'
    })
  }
}

// 生成阶段性报告行（用于计划表格）
const generateStageRowsForPlan = (startDate: Date, endDate: Date, rows: any[]) => {
  const endDateOnly = new Date(endDate)
  endDateOnly.setHours(0, 0, 0, 0) // 只比较日期部分
  
  // 阶段性报告：仅生成开始日和截止日两行
  rows.push({
    date: formatDateForPlan(startDate),
    summary: '',
    fileList: [],
    submitted: false,
    submittedAt: null,
    status: 'future'
  })
  
  // 如果截止日不是同一天，添加截止日
  if (formatDateForPlan(endDateOnly) !== formatDateForPlan(startDate)) {
    rows.push({
      date: formatDateForPlan(endDateOnly),
      summary: '',
      fileList: [],
      submitted: false,
      submittedAt: null,
      status: 'future'
    })
  }
}

// 处理“能否按时完成”选择变化
const handleCanFinishOnTimeChange = (value: boolean) => {
  if (value) {
    // 选择“是”时，初始化计划表格
    if (progressForm.planRows.length === 0) {
      // 先尝试从本地缓存加载
      const processInstanceId = props.id?.toString() || route.query.processInstanceId as string || route.params.id as string || route.query.id as string
      const cachedPlanRows = loadPlanRowsFromCache(processInstanceId)
      
      if (cachedPlanRows && cachedPlanRows.length > 0) {
        progressForm.planRows = cachedPlanRows.map(row => ({
          ...row,
          submitted: false,
          submittedAt: null,
          status: 'pending'
        }))
      } else {
        // 没有缓存，尝试从当前用户的进度记录还原
        const currentUser = userStore.getUser
        const currentUserId = currentUser?.id
        
        if (currentUserId) {
          const lastPlanRecord = findLastUploadPlanRecordByUser(currentUserId)
          if (lastPlanRecord) {
            // 从进度记录还原计划（不带附件，避免误提交历史附件）
            let planRows = parsePlanRowsFromDeptDetail(lastPlanRecord.description)
            progressForm.planRows = planRows.map(row => ({
              ...row,
              submitted: false,
              submittedAt: null,
              status: 'pending',
              fileList: [] // 清空附件，避免误提交历史附件
            }))
          } else {
            // 当前用户没有历史记录，生成默认计划
            progressForm.planRows = generatePlanRows()
          }
        } else {
          // 无法获取用户信息，生成默认计划
          progressForm.planRows = generatePlanRows()
        }
      }
    }
    // 重新计算行状态
    nextTick(() => {
      recalcPlanRowsStatus()
    })
  } else {
    // 选择“否”时，清空计划表格
    progressForm.planRows = []
  }
}

// 重置进度表单
const resetProgressForm = () => {
  progressForm.deptDetail = ''
  progressForm.planTime = ''
  progressForm.fileList = []
  // upload_plan 节点特殊字段重置
  progressForm.canFinishOnTime = true
  progressForm.delayReason = ''
  progressForm.coopUnitsChanged = false
  progressForm.planRows = []
}

// 取消添加进度更新
const cancelAddProgress = () => {
  addProgressDialogVisible.value = false
  auditMode.value = false // 重置审核模式
  
  // 重置表单
  resetProgressForm()
}

// 移除了编辑待提交进度的功能

// 自定义进度更新文件上传方法
const customProgressUpload = async (options) => {
  const { file, onSuccess, onError } = options
  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await FileApi.updateFile(formData)

    if (result.code === 0) {
      file.url = result.data
      const index = progressForm.fileList.findIndex(item => item.uid === file.uid)
      if (index !== -1) {
        progressForm.fileList[index].url = file.url
      }
      onSuccess(result)
      ElMessage.success(`文件 ${file.name} 上传成功`)
    } else {
      const error = new Error(result.msg || '文件上传失败')
      const index = progressForm.fileList.findIndex(item => item.uid === file.uid)
      if (index !== -1) {
        progressForm.fileList.splice(index, 1)
      }
      onError(error)
      ElMessage.error(result.msg || '文件上传失败')
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    const index = progressForm.fileList.findIndex(item => item.uid === file.uid)
    if (index !== -1) {
      progressForm.fileList.splice(index, 1)
    }
    onError(error)
    ElMessage.error('文件上传失败，请重试')
  }
}

// 处理进度更新文件上传失败
const handleProgressUploadError = (error: any, file: any) => {
  console.error('进度更新文件上传失败:', error, file)
  ElMessage.error(`文件 ${file.name} 上传失败: ${error.message || '未知错误'}`)
}

// 进度更新文件移除处理
const handleProgressFileRemove = async (file: any) => {
  try {
    const index = progressForm.fileList.findIndex(item => item.uid === file.uid)
    if (index !== -1) {
      progressForm.fileList.splice(index, 1)
      ElMessage.success('文件已移除')
    }
  } catch (error) {
    console.error('删除附件失败:', error)
    ElMessage.error('删除附件失败')
  }
}

// 进度更新文件上传前验证
const beforeProgressUpload = (file: File) => {
  const allowedTypes = ['doc', 'docx', 'xls', 'xlsx']
  let fileExtension = ''
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase()
  }

  const isValidType = allowedTypes.includes(fileExtension) ||
    allowedTypes.some(type => file.type.toLowerCase().includes(type))

  if (!isValidType) {
    ElMessage.error(`文件格式不正确, 请上传 ${allowedTypes.join('/')} 格式文件!`)
    return false
  }

  const isValidSize = file.size < 100 * 1024 * 1024
  if (!isValidSize) {
    ElMessage.error('上传文件大小不能超过100MB!')
    return false
  }

  ElMessage.success('正在上传文件，请稍候...')
  return true
}

// 计划表格文件上传方法
const customPlanUpload = async (options, rowIndex: number) => {
  const { file, onSuccess, onError } = options
  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await FileApi.updateFile(formData)

    if (result.code === 0) {
      file.url = result.data
      const row = progressForm.planRows[rowIndex]
      if (row) {
        const fileIndex = row.fileList.findIndex(item => item.uid === file.uid)
        if (fileIndex !== -1) {
          row.fileList[fileIndex].url = file.url
        }
      }
      onSuccess(result)
      ElMessage.success(`文件 ${file.name} 上传成功`)
    } else {
      const error = new Error(result.msg || '文件上传失败')
      const row = progressForm.planRows[rowIndex]
      if (row) {
        const fileIndex = row.fileList.findIndex(item => item.uid === file.uid)
        if (fileIndex !== -1) {
          row.fileList.splice(fileIndex, 1)
        }
      }
      onError(error)
      ElMessage.error(result.msg || '文件上传失败')
    }
  } catch (error) {
    console.error('计划文件上传失败:', error)
    const row = progressForm.planRows[rowIndex]
    if (row) {
      const fileIndex = row.fileList.findIndex(item => item.uid === file.uid)
      if (fileIndex !== -1) {
        row.fileList.splice(fileIndex, 1)
      }
    }
    onError(error)
    ElMessage.error('文件上传失败，请重试')
  }
}

// 处理计划文件上传失败
const handlePlanUploadError = (error: any, rowIndex: number) => {
  console.error('计划文件上传失败:', error)
  ElMessage.error(`文件上传失败: ${error.message || '未知错误'}`)
}

// 计划文件移除处理
const handlePlanFileRemove = async (file: any, rowIndex: number) => {
  try {
    const row = progressForm.planRows[rowIndex]
    if (row) {
      const fileIndex = row.fileList.findIndex(item => item.uid === file.uid)
      if (fileIndex !== -1) {
        row.fileList.splice(fileIndex, 1)
        ElMessage.success('文件已移除')
      }
    }
  } catch (error) {
    console.error('删除计划文件失败:', error)
    ElMessage.error('删除文件失败')
  }
}

// 计划文件上传前验证
const beforePlanUpload = (file: File) => {
  const allowedTypes = ['doc', 'docx', 'xls', 'xlsx']
  let fileExtension = ''
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase()
  }

  const isValidType = allowedTypes.includes(fileExtension) ||
    allowedTypes.some(type => file.type.toLowerCase().includes(type))

  if (!isValidType) {
    ElMessage.error(`文件格式不正确, 请上传 ${allowedTypes.join('/')} 格式文件!`)
    return false
  }

  const isValidSize = file.size < 100 * 1024 * 1024
  if (!isValidSize) {
    ElMessage.error('上传文件大小不能超过100MB!')
    return false
  }

  ElMessage.success('正在上传文件，请稍候...')
  return true
}

// 检查是否有文件正在上传（包括计划表格中的文件）
const checkUploadStatus = () => {
  // 检查普通文件上传状态
  const uploadingFiles = progressForm.fileList.filter(file => 
    file.status === 'uploading' || 
    (file.raw && !file.url)
  )
  
  const failedFiles = progressForm.fileList.filter(file => 
    file.status === 'fail'
  )
  
  // 检查计划表格中的文件上传状态
  let planUploadingCount = 0
  let planFailedCount = 0
  
  progressForm.planRows.forEach(row => {
    row.fileList.forEach(file => {
      if (file.status === 'uploading' || (file.raw && !file.url)) {
        planUploadingCount++
      }
      if (file.status === 'fail') {
        planFailedCount++
      }
    })
  })
  
  return {
    hasUploading: uploadingFiles.length > 0 || planUploadingCount > 0,
    hasFailed: failedFiles.length > 0 || planFailedCount > 0,
    uploadingCount: uploadingFiles.length + planUploadingCount,
    failedCount: failedFiles.length + planFailedCount
  }
}

// 提交添加进度更新（直接调用后端接口立即新增进度记录）
const submitAddProgress = async () => {
  if (!progressFormRef.value) return
  
  // 检查督办是否已中止
  if (orderDetail.value?.supervisionStatus === 6) {
    ElMessage.error('督办已中止，无法提交进度')
    return
  }
  
  // 防止重复提交
  if (progressSubmitting.value) return

  // 检查文件上传状态
  const uploadStatus = checkUploadStatus()
  
  if (uploadStatus.hasUploading) {
    ElMessage.warning(`还有 ${uploadStatus.uploadingCount} 个文件正在上传中，请等待上传完成后再提交`)
    return
  }
  
  if (uploadStatus.hasFailed) {
    ElMessage.error(`有 ${uploadStatus.failedCount} 个文件上传失败，请先移除失败的文件或重新上传`)
    return
  }

  try {
    // upload_plan 节点提交前最终检测协办单位变更
    if (isUploadPlanNode.value) {
      checkCoopUnitsChanged()
    }
    
    // 表单验证
    await progressFormRef.value.validate()
    
    // 额外校验：implement_plan 节点检查是否有可提交的行
    if (!isUploadPlanNode.value) {
      const targetRow = findFirstPendingRow()
      if (!targetRow) {
        ElMessage.error('尚未到达可提交时间或本周期已全部提交')
        progressSubmitting.value = false
        return
      }
    }
    
    // 二次确认弹窗
    await ElMessageBox.confirm(
      '确认提交该工作进度吗？',
      '二次确认',
      {
        confirmButtonText: '确认提交',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      }
    )
    
    // 开始提交
    progressSubmitting.value = true

    const fileList = progressForm.fileList
      .filter(file => file.url && file.url !== '')
      .map(file => ({
        name: file.name,
        url: file.url,
        size: file.size || ''
      }))

    const processInstanceId = props.id?.toString() ||
                             route.query.processInstanceId as string ||
                             route.params.id as string ||
                             route.query.id as string

    // 根据节点类型采用不同的提交策略
    let progressData: any = {
      processInstanceId: processInstanceId || ''
    }
    let didSubmitViaNewApi = false
    
    if (isUploadPlanNode.value) {
      // upload_plan 节点：批量提交整套计划到 supervision_plan_entry
      if (progressForm.canFinishOnTime && progressForm.planRows.length > 0) {
        // 获取当前用户信息
        const currentUser = userStore.getUser
        if (!currentUser) {
          ElMessage.error('无法获取用户信息')
          progressSubmitting.value = false
          return
        }
        
        // 多级兜底获取办理人部门名称
        const deptNameFromUser = currentUser.deptName && currentUser.deptName.trim()
        const deptNameFromId = typeof currentUser.deptId === 'number' ? getDeptName(currentUser.deptId) : ''
        const deptNameFromLead = Array.isArray(editForm.value.leadDeptNames) && editForm.value.leadDeptNames.length > 0
          ? editForm.value.leadDeptNames[0]
          : ''

        const targetDeptName = deptNameFromUser || 
                              (deptNameFromId && deptNameFromId !== '待督办人选择' ? deptNameFromId : '') ||
                              deptNameFromLead || ''

        if (!targetDeptName) {
          ElMessage.error('无法获取办理人部门名称，请先完善个人信息或选择办理单位')
          progressSubmitting.value = false
          return
        }
        
        // 构建批量提交数据
        const entries: PlanEntryBatchItem[] = progressForm.planRows
          .filter(row => row.summary && row.summary.trim() !== '')
          .map(row => ({
            periodDate: row.date,
            summary: row.summary || '',
            fileList: row.fileList
              .filter(file => file.url && file.url !== '')
              .map(file => ({
                id: file.id,
                name: file.name,
                url: file.url,
                size: file.size || ''
              }))
          }))
        
        if (entries.length === 0) {
          ElMessage.error('请至少填写一条计划内容')
          progressSubmitting.value = false
          return
        }
        
        const batchSubmitData: PlanEntryBatchSubmitReqVO = {
          processInstanceId: processInstanceId || '',
          targetUserId: currentUser.id,
          targetUserName: currentUser.nickname || '',
          targetDeptName: targetDeptName,
          entries: entries
        }
        
        // 调用新的批量提交接口
        await PlanEntryApi.submitBatchTemplate(batchSubmitData)
        didSubmitViaNewApi = true
        
        console.log('[submitAddProgress] 批量提交模板版计划成功:', batchSubmitData)
      } else {
        // 选择"否"时的原有逻辑，构造旧接口数据
        progressData.canFinishOnTime = progressForm.canFinishOnTime
        progressData.delayReason = progressForm.delayReason || undefined
        progressData.coopUnitsChanged = progressForm.coopUnitsChanged
        progressData.needExtraApprovalFlag = (!progressForm.canFinishOnTime || progressForm.coopUnitsChanged) ? 1 : 0
        
        if (progressForm.coopUnitsChanged && editForm.value.collaborateDeptIds) {
          progressData.tempCoDeptIds = editForm.value.collaborateDeptIds
        }
        
        progressData.deptDetail = progressForm.deptDetail
        // 将 planTime 转为时间戳字符串，避免后端解析错误
        progressData.planTime = progressForm.planTime ? String(new Date(progressForm.planTime).getTime()) : undefined
        progressData.fileList = fileList.length > 0 ? fileList : undefined
      }
    } else if (isImplementPlanNode.value) {
      // implement_plan 节点：使用新的计划记录接口
      const targetRow = findFirstPendingRow()
      if (!targetRow) {
        ElMessage.error('尚未到达可提交时间或本周期已全部提交')
        progressSubmitting.value = false
        return
      }
      
      // 获取当前用户信息
      const currentUser = userStore.getUser
      if (!currentUser) {
        ElMessage.error('无法获取用户信息')
        progressSubmitting.value = false
        return
      }
      
      // 多级兜底获取办理人部门名称
      const deptNameFromUser = currentUser.deptName && currentUser.deptName.trim()
      const deptNameFromId = typeof currentUser.deptId === 'number' ? getDeptName(currentUser.deptId) : ''
      const deptNameFromLead = Array.isArray(editForm.value.leadDeptNames) && editForm.value.leadDeptNames.length > 0
        ? editForm.value.leadDeptNames[0]
        : ''

      const targetDeptName = deptNameFromUser || 
                            (deptNameFromId && deptNameFromId !== '待督办人选择' ? deptNameFromId : '') ||
                            deptNameFromLead || ''

      if (!targetDeptName) {
        ElMessage.error('无法获取办理人部门名称，请先完善个人信息或选择办理单位')
        progressSubmitting.value = false
        return
      }
      
      // 准备附件数据
      const rowFiles = targetRow.fileList
        .filter(file => file.url && file.url !== '')
        .map(file => ({
          id: file.id,
          name: file.name,
          url: file.url,
          size: file.size || ''
        }))
      
      // 调用新的计划记录提交接口
      const planEntryData: PlanEntrySubmitReqVO = {
        processInstanceId: processInstanceId || '',
        targetUserId: currentUser.id,
        targetUserName: currentUser.nickname || '',
        targetDeptName: targetDeptName,
        periodDate: targetRow.date,
        summary: targetRow.summary || '',
        fileList: rowFiles.length > 0 ? rowFiles : undefined
      }
      
      await PlanEntryApi.submit(planEntryData)
      didSubmitViaNewApi = true
      
      console.log('[submitAddProgress] 计划记录提交成功:', planEntryData)
    } else {
      // 其他节点：保持原有逻辑
      const targetRow = findFirstPendingRow()
      if (!targetRow) {
        ElMessage.error('尚未到达可提交时间或本周期已全部提交')
        progressSubmitting.value = false
        return
      }
      
      // 生成该行的文本和数据
      progressData.deptDetail = `${targetRow.date}：${targetRow.summary || '工作进度更新'}`
      
      // 该行的附件
      const rowFiles = targetRow.fileList
        .filter(file => file.url && file.url !== '')
        .map(file => ({
          name: file.name,
          url: file.url,
          size: file.size || ''
        }))
      if (rowFiles.length > 0) {
        progressData.fileList = rowFiles
      }
    }
    
    // 如果没有通过新接口提交，则使用旧接口提交
    if (!didSubmitViaNewApi) {
      await OrderApi.insertSupervisionOrderTaskNew(progressData)
    }
    
    // 标记本会话已新增进度记录
    hasNewProgressInThisSession.value = true
    
    // 根据节点类型更新行状态
    if (isUploadPlanNode.value) {
      // upload_plan：标记所有行为已提交
      if (progressForm.canFinishOnTime) {
        progressForm.planRows.forEach(row => {
          row.submitted = true
          row.submittedAt = Date.now()
          row.status = 'submitted'
        })
        
        // 保存整套计划到本地缓存
        savePlanRowsToCache(processInstanceId, progressForm.planRows)
      }
    } else {
      // implement_plan：仅标记当前提交的行
      const targetRow = findFirstPendingRow()
      if (targetRow) {
        targetRow.submitted = true
        targetRow.submittedAt = Date.now()
        targetRow.status = 'submitted'
        // 重新计算所有行状态
        recalcPlanRowsStatus()
        
        // 保存整套计划到本地缓存（包含已提交状态）
        savePlanRowsToCache(processInstanceId, progressForm.planRows)
      }
    }
    
    ElMessage.success('进度记录已成功添加')
    
    // 如果是 upload_plan 或所有行都已提交，关闭弹窗
    if (isUploadPlanNode.value || !findFirstPendingRow()) {
      // 显示成功消息
      ElMessage.success('进度更新成功')
      
      // 关闭弹窗
      addProgressDialogVisible.value = false
      
      // 重置表单
      resetProgressForm()
      
      // 清空计划表格
      progressForm.planRows = []
    }

    // 刷新进度记录列表（强制拉取全部记录，确保能看到所有人的最新提交）
    if (processInstanceId) {
      await getProgressRecords(processInstanceId, true)
      
      // 如果是 implement_plan 节点，同时刷新结构化上下文
      if (isImplementPlanNode.value) {
        await loadImplementPlanContext(processInstanceId)
      }
    }
  } catch (error) {
    // 用户取消确认时，error 是字符串 'cancel' 或 'close'，不显示错误信息
    if (error === 'cancel' || error === 'close') {
      // 用户取消，静默处理
      return
    }
    
    console.error('添加进度更新失败:', error)
    ElMessage.error('添加进度更新失败')
  } finally {
    progressSubmitting.value = false
  }
}

// 初始化
onMounted(async () => {
  // 获取基础数据
  await Promise.all([
    getDeptList(),
    getUserList(),
    getTypeOptions()
  ])
  
  // 获取流程实例ID
  const processInstanceId = props.id?.toString() || 
                           route.query.processInstanceId as string || 
                           route.params.id as string || 
                           route.query.id as string

  if (processInstanceId) {
    try {
      // 并行获取督办单详情和进度记录
      await Promise.all([
        getOrderDetail(processInstanceId),
        getProgressRecords(processInstanceId, isExpanded.value)
      ])
    } catch (error) {
      console.error('❌ 详情接口调用失败:', error)
    }
    
    // 获取工作流详情
    await getWorkflowDetail(processInstanceId)
    
    // 获取完整审批详情（包含活动节点信息）
    await getFullApprovalDetail(processInstanceId)
    
    // 如果是 implement_plan 节点，加载结构化上下文
    if (isImplementPlanNode.value) {
      await loadImplementPlanContext(processInstanceId)
    }
    
    // 获取督办分类选项
    await getTypeOptions()
    
    // 检查权限
    await checkAllPermissions()
  } else {
    console.error('缺少流程实例ID参数')
  }
})

// 获取督办单详情数据（用于外部调用）
const getOrderDetailData = () => {
  return orderDetail.value
}

// 获取编辑表单数据
const getEditFormData = () => {
  return editForm.value
}

// 移除冻结时间相关逻辑，现在直接基于指定节点的通过时间显示


// 移除了清理待提交进度更新数据的功能

// 暴露方法供外部调用
defineExpose({
  updateSupervisionOrder,
  hasEditPermission: computed(() => hasEditPermission.value),
  // 移除了 pendingProgressUpdate 相关的暴露接口
  cancelAddProgress,
  showAddProgressDialog,
  getOrderDetailData,
  getEditFormData,
  canEditLeadDept: computed(() => canEditLeadDept.value),
  canEditCollaborateDepts: computed(() => canEditCollaborateDepts.value),
  canEditLeadDeptDetail: computed(() => canEditLeadDeptDetail.value),
  // 新增：办理单位负责人权限判断
  isLeadDeptLeaderReady: computed(() => isLeadDeptLeaderReady.value),
  isLeadDeptLeader: computed(() => isLeadDeptLeader.value),
  // 新增：拟变更预览状态
  hasChangePreview
})
</script>

<style scoped>
.supervision-order-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面标题样式 - 与创建页面一致 */
.page-header-outside {
  text-align: center;
  margin-bottom: 30px;
}

.form-title {
  font-size: 28px;
  font-weight: bold;
  color: #d32f2f;
  letter-spacing: 2px;
  line-height: 1.4;
  margin: 0;
  font-family: "STXiaobiao", "SimSun", "Microsoft YaHei", serif;
}

/* 表单容器样式 - 与创建页面一致 */
.order-form-container {
  background: white;
  border: 2px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px auto;
  max-width: 1000px;
}

/* 督办编号样式 - 与创建页面一致 */
.order-number-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
  gap: 5px;
}

.order-number-label {
  font-size: 15px;
  color: #d32f2f;
  font-weight: bold;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

.order-number-display {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

/* 表单样式 - 与创建页面一致 */
.order-form {
  padding: 0;
}

.form-table {
  width: 100%;
}

.form-row {
  display: flex;
  border-bottom: 1px solid #e8eaed;
  min-height: 50px;
  align-items: stretch;
  transition: background-color 0.2s ease;
}

.form-row:hover {
  background-color: #fafafa;
}

.form-row:last-child {
  border-bottom: none;
}

.form-label {
  background: white;
  color: #d32f2f;
  border-right: 1px solid #e8eaed;
  padding: 12px 16px;
  font-weight: 600;
  width: var(--label-width, 120px);
  text-align: justify;
  text-align-last: justify;
  position: relative;
  font-size: 15px;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

/* 长标签支持换行但保持固定宽度 */
.form-label.long-label {
  white-space: normal;
  word-break: break-all;
  line-height: 1.2;
  width: var(--label-width, 120px);
  font-size: 13px;
  padding: 8px 12px;
}

/* 指定不换行的标签（如：工作推进情况） */
.form-label.no-wrap {
  white-space: nowrap;
}

/* 确保第二个标签有左边框 */
.form-row .form-label:nth-child(3) {
  border-left: 1px solid #e8eaed;
}

.form-content {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  flex: 1;
  background: white;
  transition: all 0.2s ease;
}

.form-content.full-width {
  flex: 1;
}

.form-content.half-width {
  flex: 1;
  min-width: 0;
  border-right: 1px solid #e8eaed;
}

.form-content.half-width:first-child {
  flex: 0.8;
}

.form-content.half-width:last-child {
  flex: 1.2;
  border-right: none;
}

/* 移除Element Plus默认样式 */
:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  display: none;
}

:deep(.el-form-item__content) {
  margin-left: 0 !important;
  width: 100%;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8eaed;
  background: white;
  transition: all 0.2s ease;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
  border: 1px solid #e8eaed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
  resize: none;
  transition: all 0.2s ease;
}



:deep(.el-select .el-input__wrapper) {
  border-radius: 6px;
  border: 1px solid #e8eaed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
  transition: all 0.2s ease;
}

/* 完成期限容器样式 */
.deadline-container {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
}

.deadline-display {
  flex: 1;
}

.report-frequency-display {
  width: 130px;
}

/* 只读标签样式 */
.readonly-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
  align-items: center;
}

.readonly-tags .el-tag {
  margin: 0;
}

/* 内联概述样式 */
.summary-content-inline {
  width: 100%;
}

.summary-item-inline {
  margin-bottom: 8px;
  line-height: 1.6;
  font-size: 14px;
}

.summary-item-inline strong {
  color: #303133;
  margin-right: 8px;
}

.no-summary-inline {
  color: #909399;
  font-style: italic;
  font-size: 14px;
}

/* 附件部分样式 */
.attachment-section {
  background: white;
  border: 2px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  max-width: 1000px;
  padding: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #d32f2f;
  letter-spacing: 1px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8eaed;
}

.upload-section {
  margin-bottom: 30px;
}

.existing-attachments {
  margin-top: 20px;
}

.attachment-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 15px;
}

/* 部门标签样式 */
.dept-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

/* 只读输入框样式 */
:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

/* 确保只读状态下的样式 */
:deep(.el-input__inner[readonly]) {
  background-color: #f5f7fa;
  color: #606266;
  cursor: default;
}

:deep(.el-textarea__inner[readonly]) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: default;
}

/* 更高优先级：覆盖全局只读的灰底设置 */
.order-form :deep(.readonly-display .el-input__inner[readonly]) {
  background: transparent !important;
}

.order-form :deep(.readonly-display .el-textarea__inner[readonly]) {
  background: transparent !important;
}

.order-form :deep(.readonly-display input[readonly]),
.order-form :deep(.readonly-display .el-textarea__inner[readonly]) {
  color: var(--el-text-color-regular);
  cursor: default;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .supervision-order-detail {
    padding: 10px;
  }

  .order-form-container, .attachment-section {
    margin: 10px 0;
    max-width: none;
    border-width: 1px;
    padding: 20px;
  }

  .form-title {
    font-size: 24px;
    letter-spacing: 1px;
  }

  .form-row {
    flex-direction: column;
    min-height: auto;
  }

  .form-label {
    width: 100%;
    min-width: auto;
    border-right: none;
    border-bottom: 1px solid #e8eaed;
    justify-content: flex-start;
    padding: 10px 16px;
  }

  .form-content {
    width: 100%;
    padding: 12px 16px;
  }

  .form-content.half-width {
    flex: 1;
    border-right: none;
  }
}

/* 工作推进情况内容区域样式 */
.work-progress-content {
  width: 100%;
  padding: 0;
}

/* 操作按钮区域样式 */
.timeline-actions-section {
  margin: 12px 0;
  padding: 8px 0;
}

/* 最新动态区域样式 */
.latest-progress-section {
  margin-bottom: 12px;
}

.latest-progress-header {
  font-size: 15px;
  font-weight: bold;
  color: #d32f2f;
  margin-bottom: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
  letter-spacing: 0.5px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 6px;
}

.latest-progress-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.latest-progress-expected-time-right {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 13px;
  margin-left: 20px;
  flex-shrink: 0;
}

.latest-progress-expected-time-inline {
  display: inline-flex;
  align-items: center;
  color: #909399;
  font-size: 13px;
  margin-left: 12px;
}

.calendar-icon {
  margin-right: 5px;
  color: #409eff;
}

.progress-record-expected-time {
  display: inline-flex;
  align-items: center;
  color: #909399;
  font-size: 13px;
  margin-left: 15px;
}

.header-icon {
  color: #ffa726;
  font-size: 14px;
}

.latest-progress-item {
  position: relative;
  padding-left: 24px;
  background: #f0f7ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  padding: 17px 17px 17px 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.latest-progress-item:hover {
  background: #f0f7ff;
  border-color: #b3d8ff;
}

.latest-progress-dot {
  position: absolute;
  left: 12px;
  top: 18px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1890ff;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #1890ff;
}



.latest-progress-content {
  width: 100%;
}

.latest-progress-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.user-icon {
  color: #1890ff;
  font-size: 14px;
}

.latest-progress-handler {
  font-size: 13px;
  color: #6c757d;
  margin-left: 6px;
  font-weight: normal;
}

.latest-progress-time {
  font-size: 13px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.time-icon {
  color: #1890ff;
  font-size: 12px;
}

.latest-progress-description {
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.latest-progress-attachments {
  margin-top: 8px;
}

.attachments-header {
  font-size: 13px;
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.paperclip-icon {
  color: #1890ff;
  font-size: 12px;
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.latest-attachment-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 13px;
}

.latest-attachment-item:hover {
  background: #e9ecef;
  border-color: #1890ff;
}

/* 操作按钮区域 */
.timeline-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  align-items: center;
}

/* 进度时间线样式 - 与最新动态区域保持一致 */
.progress-timeline {
  margin-top: 12px;
}

.progress-record-item {
  position: relative;
  padding-left: 24px;
  background: #fafbfc;
  border: 1px solid #e1e8f0;
  border-radius: 6px;
  padding: 17px 17px 17px 32px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.progress-record-item:last-child {
  margin-bottom: 0;
}

.progress-record-item:hover {
  background: #f0f7ff;
  border-color: #b3d8ff;
}

.progress-record-dot {
  position: absolute;
  left: 12px;
  top: 18px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1890ff;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #1890ff;
}

.progress-record-content {
  width: 100%;
}

.progress-record-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.progress-record-handler {
  font-size: 13px;
  color: #6c757d;
  margin-left: 6px;
  font-weight: normal;
}

.progress-record-time {
  font-size: 13px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.progress-record-description {
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.progress-record-attachments {
  margin-top: 8px;
}

.progress-attachment-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  cursor: pointer;
  margin-right: 6px;
  margin-bottom: 4px;
  font-size: 13px;
}

.progress-attachment-item:hover {
  background: #e9ecef;
  border-color: #1890ff;
}

/* 双箭头图标样式 */
.double-arrow-icon {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  gap: -2px;
}

.double-arrow-icon .el-icon {
  font-size: 10px;
  line-height: 1;
  margin: -1px 0;
}

/* 通用附件样式 */
.attachment-icon {
  color: #1890ff;
  font-size: 12px;
}

.attachment-name {
  color: #495057;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
  flex: 1;
}

.attachment-name:hover {
  color: #1890ff;
  text-decoration: underline;
}

.attachment-download-btn {
  color: #6c757d;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 2px;
  border-radius: 2px;
  margin-left: 6px;
}

.attachment-download-btn:hover {
  color: #1890ff;
  background: #f0f7ff;
}

/* 空状态样式 */
.empty-progress {
  text-align: center;
  padding: 20px 16px;
  color: #6c757d;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 6px;
}

.empty-text {
  font-size: 14px;
}



/* 添加进度更新弹窗样式 */
.add-progress-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.add-progress-dialog :deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.add-progress-dialog :deep(.el-dialog__header) {
  background: #f8f9fa;
  color: #2c3e50;
  padding: 16px 20px;
  margin: 0;
  border-bottom: 1px solid #e9ecef;
}

.add-progress-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.add-progress-dialog :deep(.el-dialog__headerbtn) {
  top: 16px;
  right: 16px;
}

.add-progress-dialog :deep(.el-dialog__close) {
  color: #6c757d;
  font-size: 16px;
}

.add-progress-dialog :deep(.el-dialog__close):hover {
  color: #495057;
}

.add-progress-dialog :deep(.el-dialog__body) {
  padding: 0;
  background: white;
}

.progress-dialog-content {
  padding: 20px;
}

.progress-form {
  background: white;
  border-radius: 6px;
  padding: 20px;
  box-shadow: none;
  border: 1px solid #f0f0f0;
}

.form-item-custom {
  margin-bottom: 20px;
}

.form-item-custom :deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.5;
  display: block !important;
  visibility: visible !important;
  width: auto !important;
  height: auto !important;
  opacity: 1 !important;
}

.form-item-no-label :deep(.el-form-item__label) {
  display: none !important;
}

.form-item-inline {
  display: flex;
  align-items: center;
}

.form-item-inline :deep(.el-form-item__label) {
  margin-bottom: 0 !important;
  line-height: 32px;
}

.form-item-inline :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  margin-left: 0 !important;
}

.form-item-inline :deep(.el-radio-group) {
  display: flex;
  align-items: center;
  gap: 16px;
  line-height: 32px;
}

.form-item-inline :deep(.el-radio) {
  margin-right: 0;
  line-height: 32px;
}

.form-item-inline :deep(.el-radio__label) {
  line-height: 32px;
}

.textarea-custom :deep(.el-textarea__inner) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.2s ease;
  resize: none;
}

.textarea-custom :deep(.el-textarea__inner):focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.date-picker-custom :deep(.el-input__wrapper) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.2s ease;
}

.date-picker-custom :deep(.el-input__wrapper):hover,
.date-picker-custom :deep(.el-input__wrapper.is-focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.upload-item {
  margin-bottom: 16px;
}

.upload-container {
  width: 100%;
}

.upload-custom :deep(.el-upload) {
  width: 100%;
}

.upload-btn {
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 500;
  background: #1890ff;
  border: none;
  color: white;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.2);
}

.upload-icon {
  margin-right: 6px;
  font-size: 14px;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.tip-icon {
  color: #909399;
  margin-right: 4px;
  font-size: 12px;
}

.dialog-footer-custom {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #d0d7de;
  background: white;
  color: #6c757d;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  border-color: #adb5bd;
  color: #495057;
}

.submit-btn {
  padding: 8px 16px;
  border-radius: 6px;
  background: #1890ff;
  border: none;
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.2);
}

.btn-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 审批状态行样式 */
.approval-status-line {
  padding: 12px 16px;
  margin: 8px 0;
  background-color: #f8f9fa;
  border-left: 4px solid #28a745;
  color: #495057;
  font-size: 14px;
  border-radius: 0 4px 4px 0;
}

/* 拟调整预览样式 */
.dept-change-preview {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.dept-change-container {
  width: 100%;
}

.dept-change-alert {
  margin-bottom: 16px;
}

.dept-change-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.change-item {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
}

.change-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.change-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.change-from,
.change-to {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.change-title {
  font-weight: 500;
  color: #666;
  font-size: 13px;
  white-space: nowrap;
}

.change-arrow {
  color: #1890ff;
  font-weight: bold;
  font-size: 16px;
  margin: 0 4px;
}

.dept-tag-small {
  margin: 2px;
}

.no-dept {
  color: #999;
  font-style: italic;
  font-size: 13px;
}

/* 拟变更预览样式 */
.change-preview-container {
  margin-bottom: 20px;
  border: 1px solid #e6a23c;
  border-radius: 6px;
  background-color: #fdf6ec;
  overflow: hidden;
}

.change-preview-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6a23c;
  font-weight: 600;
  color: #e6a23c;
}

.change-preview-header .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.change-preview-content {
  padding: 16px;
}

.change-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.change-item:last-child {
  margin-bottom: 0;
}

.change-label {
  font-weight: 600;
  color: #606266;
  margin-right: 8px;
  min-width: 80px;
}

.change-old {
  color: #909399;
  background-color: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 8px;
}

.change-arrow {
  margin: 0 8px;
  color: #e6a23c;
  font-size: 16px;
}

.change-new {
  color: #67c23a;
  background-color: #f0f9ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.no-change {
  display: flex;
  align-items: center;
  color: #909399;
  font-style: italic;
}

.no-change .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* 审核相关样式 */
.audit-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.audit-actions .el-button {
  min-width: 60px;
  font-size: 12px;
}

.readonly-summary {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
  min-height: 40px;
  word-break: break-word;
}

.readonly-files {
  padding: 8px 12px;
}

.file-list-horizontal {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item-horizontal {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-preview-link {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  text-decoration: none;
}

.file-download-link {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.file-download-link:hover {
  background-color: #e3f2fd;
}

.file-name-only {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 13px;
}

.no-files {
  color: #999;
  font-style: italic;
  font-size: 13px;
  text-align: center;
  padding: 20px;
}

.file-icon {
  color: #1890ff;
  font-size: 14px;
}

.download-icon {
  color: #666;
  font-size: 14px;
}

/* 拟变更预览表格样式 */
.change-preview-table {
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
}

.change-preview-table .el-table__header th {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
  border-right: 1px solid #ebeef5;
}

.change-preview-table .el-table__header th:last-child {
  border-right: none;
}

.change-preview-table .el-table__body td {
  padding: 12px 0;
  border-right: 1px solid #ebeef5;
}

.change-preview-table .el-table__body td:last-child {
  border-right: none;
}

.change-preview-table .el-table__row {
  border-bottom: 1px solid #ebeef5;
}

.change-preview-table .el-table__row:last-child {
  border-bottom: none;
}

/* 操作按钮区域样式 */
.change-preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.change-preview-actions .el-button {
  min-width: 80px;
}

/* 新增：是否能按期完成提示区域样式 */
.completion-check-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.completion-prompt {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  text-align: center;
}

.completion-deadline {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  text-align: center;
}

.completion-choice {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.completion-choice .el-radio-group {
  font-size: 16px;
}

.completion-choice .el-radio {
  margin-right: 30px;
  font-weight: 500;
}

/* 计划表格样式 */
.plan-table-section {
  margin-top: 20px;
}

.plan-table-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-left: 4px;
  border-left: 4px solid #1890ff;
}

.plan-table {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
}

.plan-table .el-table__header th {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
  text-align: center;
  padding: 12px 8px;
}

.plan-table .el-table__body td {
  padding: 12px 8px;
  vertical-align: top;
}

.plan-upload-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-upload {
  width: 100%;
}

.plan-upload .el-upload {
  width: 100%;
}

/* 表格内选择文件按钮颜色 */
.plan-upload .el-button--primary {
  background-color: #1890FF;
  border-color: #1890FF;
}

.plan-upload .el-button--primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.plan-upload .el-button--primary:focus {
  background-color: #1890FF;
  border-color: #1890FF;
}

.plan-upload .el-button--primary:active {
  background-color: #096dd9;
  border-color: #096dd9;
}

.plan-upload .el-upload-list {
  margin-top: 8px;
}

.plan-upload-tip {
  font-size: 12px;
  color: #999;
  text-align: center;
  line-height: 1.2;
}

/* 行状态提示样式 */
.row-status-tip {
  font-size: 12px;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  text-align: center;
}

.row-status-tip.submitted {
  color: #67c23a;
  background-color: #f0f9ff;
  border: 1px solid #b3e19d;
}

.row-status-tip.waiting {
  color: #e6a23c;
  background-color: #fdf6ec;
  border: 1px solid #f5dab1;
}

.row-status-tip.rejected {
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
}

.row-status-tip.delayed {
  color: #e6a23c;
  background-color: #fdf6ec;
  border: 1px solid #f5dab1;
}

/* 计划表格提示样式 */
.plan-table-tip {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  padding: 8px 12px;
  background-color: #f4f4f5;
  border-radius: 4px;
  border-left: 3px solid #409eff;
  display: flex;
  align-items: center;
}

.plan-table-tip .tip-icon {
  margin-right: 6px;
  color: #409eff;
  font-size: 14px;
}

/* 简化计划摘要样式（纯文本） */
.plan-summary-simple {
  margin: 8px 0;
}

.summary-item {
  margin-bottom: 6px;
}

.summary-line-with-file {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-text-inline {
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
}

.summary-file-inline {
  display: flex;
  align-items: center;
  gap: 4px;
}

.file-preview-link {
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.file-preview-link .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

.file-download-link {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 2px;
}

.file-download-link .el-icon {
  font-size: 12px;
}

.summary-more-simple {
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
}

.summary-more-simple .el-link {
  font-size: 13px;
}

/* 单行计划记录的查看全部计划链接样式 */
.single-plan-view-all {
  margin-top: 8px;
  font-size: 13px;
}

.single-plan-view-all .el-link {
  font-size: 13px;
}

/* 查看全部计划弹窗样式 */
.view-all-plans-dialog .el-dialog__body {
  padding: 20px;
}

/* 多用户计划显示样式 */
.multi-user-plans {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-plan-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 8px 12px;
  background-color: #fafafa;
}

.user-plan-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
}

.user-plan-header .user-name {
  font-weight: 500;
  color: #303133;
}

.user-plan-header .dept-name {
  color: #909399;
  font-size: 12px;
}

.user-plan-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
  word-break: break-word;
}

/* 多用户文件显示样式 */
.multi-user-files {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-files-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 8px 12px;
  background-color: #fafafa;
}

.user-files-header {
  margin-bottom: 6px;
  font-size: 13px;
}

.user-files-header .user-name {
  font-weight: 500;
  color: #303133;
}

.user-files-content {
  font-size: 12px;
}

.user-files-content .file-list-horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.user-files-content .file-item-horizontal {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-files-content .no-files {
  color: #c0c4cc;
  font-style: italic;
}

.view-all-plans-content {
  max-height: 500px;
  overflow-y: auto;
}

.readonly-summary {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  min-height: 40px;
}

.readonly-files {
  padding: 8px;
}

.readonly-files .file-list-horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.readonly-files .file-item-horizontal {
  display: flex;
  align-items: center;
}

.readonly-files .file-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.readonly-files .file-preview-link {
  font-size: 13px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.readonly-files .file-download-link {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 2px;
}

.readonly-files .download-icon {
  font-size: 12px;
}

.readonly-files .file-icon {
  margin-right: 6px;
  font-size: 14px;
}

.readonly-files .no-files {
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

.readonly-files .file-name-only {
  font-size: 13px;
  color: #606266;
  display: flex;
  align-items: center;
}

.readonly-files .file-name-only .file-icon {
  margin-right: 6px;
  font-size: 14px;
  color: #909399;
}


/* 计划表格中的输入框样式 */
.plan-table .el-textarea {
  width: 100%;
}

.plan-table .el-textarea__inner {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.4;
  resize: vertical;
}

.plan-table .el-textarea__inner:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

/* 文件上传组件样式优化 */
.plan-upload .el-upload__tip {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.plan-upload .el-upload-list__item {
  margin-top: 4px;
  font-size: 12px;
}

/* 弹窗宽度调整 */
.add-progress-dialog {
  min-width: 1000px;
}

.add-progress-dialog .el-dialog__body {
  padding: 20px 24px;
}

/* 表单项样式优化 */
.progress-form .form-item-custom {
  margin-bottom: 20px;
}

.progress-form .form-item-no-label .el-form-item__label {
  display: none;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .add-progress-dialog {
    min-width: 90vw;
  }
  
  .plan-table .el-table__body td {
    padding: 8px 4px;
  }
  
  .completion-choice .el-radio {
    margin-right: 20px;
  }
}

@media (max-width: 768px) {
  .completion-check-section {
    padding: 16px;
  }
  
  .completion-prompt {
    font-size: 14px;
  }
  
  .plan-table-title {
    font-size: 14px;
  }
  
  .plan-upload-container {
    gap: 6px;
  }
}

/* 表格头部样式 */
.plan-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.plan-table-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.audit-user-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selector-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

/* 审核状态样式 */
.audit-status {
  display: flex;
  justify-content: center;
  align-items: center;
}

.audit-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .plan-table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .audit-user-selector {
    width: 100%;
  }
  
  .audit-user-selector .el-select {
    flex: 1;
  }
  
  .audit-actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
