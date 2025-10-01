<template>
  <div class="supervision-dashboard">
    <!-- Statistics Section -->
    <div class="stats-section">
      <h3 class="section-title">
        <el-icon class="title-icon"><DataAnalysis /></el-icon>
        本月督办情况
      </h3>
      <div class="stats-cards">
        <el-card class="stat-card managed-items">
          <div class="stat-content">
            <el-icon class="stat-icon"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-label">我的分管事项</div>
              <div class="stat-number">{{ statistics.managedItemsCount }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card ongoing">
          <div class="stat-content">
            <el-icon class="stat-icon"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-label">进行中</div>
              <div class="stat-number">{{ statistics.ongoingCount }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card instructed">
          <div class="stat-content">
            <el-icon class="stat-icon"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-label">已批示</div>
              <div class="stat-number">{{ statistics.instructedCount }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card attention">
          <div class="stat-content">
            <el-icon class="stat-icon"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-label">已关注</div>
              <div class="stat-number">{{ statistics.attentionCount }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Task Management Section -->
    <div class="task-section">
      <!-- Tabs and Filters -->
      <div class="bg-white rounded-lg shadow-sm supervision-layout" ref="layoutRef">
        <div>
          <div class="flex items-center justify-between px-6 pt-6 pb-0 header-scale" ref="headerRef">
            <div class="flex items-center -ml-3">
              <el-tabs v-model="activeTab" class="tabs-custom" @tab-change="handleTabChange">
                <el-tab-pane label="全部事项" name="all-items" />
                <el-tab-pane label="已关注" name="attention-items" />
              </el-tabs>
            </div>
            <!-- 搜索和筛选功能（与首页保持同一行，右侧对齐） -->
            <div class="flex space-x-4 items-center">
              <span class="text-gray-700 font-medium">督办事项</span>
              <el-input
                v-model="searchQuery"
                placeholder="请输入督办事项"
                style="width: 200px;"
              />
              <span class="text-gray-700 font-medium">优先级</span>
              <el-select
                v-model="selectedPriority"
                placeholder="全部优先级"
                clearable
                style="width: 150px;"
              >
                <el-option
                  v-for="priority in priorityOptions"
                  :key="priority.value"
                  :label="priority.label"
                  :value="priority.value"
                />
              </el-select>
              <span class="text-gray-700 font-medium">督办状态</span>
              <el-select
                v-model="selectedSupervisionStatus"
                placeholder="全部状态"
                clearable
                style="width: 150px;"
              >
                <el-option
                  v-for="status in supervisionStatusOptions"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
              <div class="w-4"></div> <!-- 增加间距 -->
              <template v-if="pureTextMode">
                <button
                    class="text-lg font-bold transition-all duration-200 cursor-pointer hover:text-gray-600"
                    :style="{
                      color: '#111827',
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      margin: '0 16px 0 0'
                    }"
                    @click="handleSearch">
                    查询
                </button>
                <button
                    class="text-lg font-bold transition-all duration-200 cursor-pointer hover:text-gray-600"
                    :style="{
                      color: '#111827',
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      margin: '0 16px 0 0'
                    }"
                    @click="handleReset">
                    重置
                </button>
                <button
                    class="text-lg font-bold transition-all duration-200 cursor-pointer hover:text-gray-600 flex items-center"
                    :style="{
                      color: '#111827',
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      margin: '0'
                    }"
                    @click="openSeniorFilter">
                    <el-icon class="mr-1"><Filter /></el-icon>
                    高级筛选
                </button>
              </template>
              <template v-else>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
                <el-button type="primary" plain @click="openSeniorFilter">
                  <el-icon class="mr-1"><Filter /></el-icon>
                  高级筛选
                </el-button>
              </template>
            </div>
          </div>
          <!-- 状态筛选按钮组（移入白底容器） -->
          <div class="px-6 pt-4 pb-2 border-b border-gray-200">
            <div class="flex items-center">
              <div class="flex space-x-4">
                <!-- 纯文本模式状态按钮 -->
                <template v-if="pureTextMode">
                  <button
                    @click="toggleStatusFilter('pendingReview')"
                    class="text-lg font-bold transition-all duration-200 cursor-pointer hover:text-gray-600"
                    :style="{
                      color: statusFilters.pendingReview ? '#111827' : '#6B7280',
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      margin: '0 16px 0 0'
                    }"
                  >
                    待审核
                  </button>
                  <button
                    @click="toggleStatusFilter('inProgress')"
                    class="text-lg font-bold transition-all duration-200 cursor-pointer hover:text-gray-600"
                    :style="{
                      color: statusFilters.inProgress ? '#111827' : '#6B7280',
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      margin: '0 16px 0 0'
                    }"
                  >
                    进行中
                  </button>
                  <button
                    @click="toggleStatusFilter('overdue')"
                    class="text-lg font-bold transition-all duration-200 cursor-pointer hover:text-gray-600"
                    :style="{
                      color: statusFilters.overdue ? '#111827' : '#6B7280',
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      margin: '0 16px 0 0'
                    }"
                  >
                    已超时
                  </button>
                  <button
                    @click="toggleStatusFilter('completed')"
                    class="text-lg font-bold transition-all duration-200 cursor-pointer hover:text-gray-600"
                    :style="{
                      color: statusFilters.completed ? '#111827' : '#6B7280',
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      margin: '0 16px 0 0'
                    }"
                  >
                    已结束
                  </button>
                </template>
                
                <!-- 原版状态按钮 -->
                <template v-else>
                  <button
                    @click="toggleStatusFilter('pendingReview')"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white border-0 outline-none hover:shadow-md cursor-pointer"
                    :style="{
                      backgroundColor: statusFilters.pendingReview ? '#39A8F9' : '#9A9A9A'
                    }"
                  >
                    待审核
                  </button>
                  <button
                    @click="toggleStatusFilter('inProgress')"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white border-0 outline-none hover:shadow-md cursor-pointer"
                    :style="{
                      backgroundColor: statusFilters.inProgress ? '#39A8F9' : '#9A9A9A'
                    }"
                  >
                    进行中
                  </button>
                  <button
                    @click="toggleStatusFilter('overdue')"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white border-0 outline-none hover:shadow-md cursor-pointer"
                    :style="{
                      backgroundColor: statusFilters.overdue ? '#39A8F9' : '#9A9A9A'
                    }"
                  >
                    已超时
                  </button>
                  <button
                    @click="toggleStatusFilter('completed')"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white border-0 outline-none hover:shadow-md cursor-pointer"
                    :style="{
                      backgroundColor: statusFilters.completed ? '#39A8F9' : '#9A9A9A'
                    }"
                  >
                    已结束
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- 列表区（与首页一致的内边距） -->
          <div class="p-6">
            <div class="task-list">
              <el-card
                v-for="task in filteredTaskList"
                :key="task.id"
                class="task-item clickable-card card-item"
                :class="{ 'card-item--updated': task.supervisionPageVOData?.hasUpdate || task.supervisionPageVOData?.unread }"
                shadow="hover"
                @click="navigateToWorkflowDetail(task)"
              >
                <!-- 纯文本模式卡片布局 -->
                <template v-if="pureTextMode">
                  <div>
                    <!-- 头部区域：标题 -->
                    <div class="mb-2">
                      <div class="flex items-center justify-between">
                        <h4 class="text-xl font-bold text-gray-900 mr-2" @click.stop="navigateToWorkflowDetail(task)">{{ getTaskTitle(task) }}</h4>
                      </div>
                    </div>
                    
                    <!-- 左右结构：左侧包含描述+批示+时间网格，右侧为侧栏 -->
                    <div class="flex items-start gap-12">
                      <!-- 左列：描述 + 批示 + 时间状态网格 -->
                      <div class="left-col-wrap" style="width: calc(100% - 340px - 48px); max-width: 720px;">
                        <div class="shrink-0">
                          <!-- 督办内容（描述）-->
                          <div v-if="getDisplayText(task)" class="mb-3">
                            <span class="leading-relaxed desc-text inline-block one-line-ellipsis" style="color: #111827;">{{ getDisplayText(task) }}</span>
                          </div>

                          <!-- 批示：显示在督办内容下方 -->
                          <div v-if="getRemarks(task).length > 0" class="task-remarks mb-4">
                            <el-icon class="remark-icon"><Document /></el-icon>
                            <el-tooltip 
                              :content="getAllRemarksFullText(task)"
                              placement="bottom"
                              effect="dark"
                            >
                              <span class="remark-item">
                                <span class="remark-label">{{ getFirstRemarkLabel(task) }}：</span>
                                <span class="remark-text">{{ getFirstRemarkTruncatedText(task) }}</span>
                              </span>
                            </el-tooltip>
                          </div>

                          <!-- 最新部门办理信息：显示在批示下方一行（来自 supervisionPageVOData），与时间行对齐 -->
                          <div
                            v-if="task.supervisionPageVOData && task.supervisionPageVOData.latestDeptDetail &&
                                   (task.supervisionPageVOData.latestDeptDetail.creatorName || task.supervisionPageVOData.latestDeptDetail.content)"
                            class="mb-3 flex items-start"
                          >
                            <!-- 左侧标签：固定宽度，粗体，含全角冒号 -->
                            <span class="text-gray-900 font-semibold inline-block w-24 whitespace-nowrap">最新进展：</span>
                            <!-- 右侧内容（单行省略），与时间值起始位置对齐 -->
                            <span class="text-gray-900 flex-1 one-line-ellipsis" :title="getLatestProgressFullText(task)">
                              <template v-if="task.supervisionPageVOData.latestDeptDetail.creatorName && task.supervisionPageVOData.latestDeptDetail.content">
                                {{ task.supervisionPageVOData.latestDeptDetail.creatorName }}：{{ task.supervisionPageVOData.latestDeptDetail.content }}
                              </template>
                              <template v-else-if="task.supervisionPageVOData.latestDeptDetail.creatorName">
                                {{ task.supervisionPageVOData.latestDeptDetail.creatorName }}
                              </template>
                              <template v-else>
                                {{ task.supervisionPageVOData.latestDeptDetail.content }}
                              </template>
                            </span>
                          </div>

                          <!-- 时间/状态二维网格：
                               行1：起始时间 | 督办状态
                               行2：结束时间 | 剩余时间 -->
                          <div>
                            <div class="grid items-start w-fit" style="grid-template-columns: max-content max-content; column-gap: 70px; row-gap: 8px;">
                              <div class="flex items-center">
                                <span class="text-gray-900 font-semibold inline-block w-24">起始时间：</span>
                                <span class="text-gray-900">{{ formatDateOnly(task.createTime) }}</span>
                              </div>
                              <!-- 右上：督办状态 - 纯文本显示 -->
                              <div class="flex items-center">
                                <span class="text-gray-900 font-semibold">{{ getStatusText(task) }}</span>
                              </div>

                              <div class="flex items-center">
                                <span class="text-gray-900 font-semibold inline-block w-24">结束时间：</span>
                                <span class="font-semibold" :style="getDeadlineColorStyle(task)">{{ getDeadlineText(task) }}</span>
                              </div>
                              
                              <!-- 右下：剩余时间 - 纯文本显示，保持原有颜色逻辑 -->
                              <div class="flex items-center">
                                <span v-if="activeTab !== 'attention-items' && getStatusText(task) !== '已结束'" class="font-semibold" :style="getRemainingTimeColorStyle(task)">{{ getPreciseTimeRemaining(task) || '—' }}</span>
                                <span v-else class="font-semibold text-gray-900">—</span>
                              </div>
                            </div>
                            
                            <!-- 按钮放在网格下面一行 -->
                            <div class="flex items-center gap-2 mt-3">
                              <el-button
                                v-if="activeTab === 'all-items'"
                                :loading="followLoading[task.processInstanceId]"
                                size="small"
                                class="follow-btn action-btn"
                                :style="{
                                  backgroundColor: isFollowed(task) ? 'rgb(190, 190, 190)' : 'rgb(89, 179, 253)',
                                  borderColor: isFollowed(task) ? 'rgb(190, 190, 190)' : 'rgb(89, 179, 253)',
                                  color: 'white'
                                }"
                                @click.stop="toggleFollow(task)"
                              >
                                {{ isFollowed(task) ? '已关注' : '关注' }}
                              </el-button>
                              <el-button v-if="getStatusText(task) !== '已结束'" size="small" type="primary" class="action-btn" @click.stop="addInstruction(task)">新增批示</el-button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 右侧：侧栏，固定宽度 -->
                      <div class="flex flex-col items-start gap-2" style="width: 340px;">
                        <div class="flex items-center">
                          <span class="text-gray-900 font-semibold leader-field-label">校领导</span><span class="text-gray-900 font-semibold">：</span>
                          <span class="text-gray-900 whitespace-nowrap">{{ getLeadLeadersText(task.supervisionPageVOData?.leadLeaders) || getLeadLeadersText(task.leadLeaders) || '未设置' }}</span>
                        </div>
                        <div class="flex items-center">
                          <span class="text-gray-900 font-semibold leader-field-label">办理部门</span><span class="text-gray-900 font-semibold">：</span>
                          <span class="text-gray-900 whitespace-nowrap">{{ getLeadDeptName(task) }}</span>
                        </div>
                        <div class="flex items-center">
                          <span class="text-gray-900 font-semibold leader-field-label">协办部门</span><span class="text-gray-900 font-semibold">：</span>
                          <span class="text-gray-900 whitespace-nowrap">{{ getCoDeptNames(task) }}</span>
                        </div>
                        <div class="flex items-center">
                          <span class="text-gray-900 font-semibold leader-field-label">督办人</span><span class="text-gray-900 font-semibold">：</span>
                          <span class="text-gray-900 whitespace-nowrap">{{ getSupervisorsDisplay(task) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 原版模式卡片布局 -->
                <template v-else>
                  <div class="task-header">
                    <div class="flex items-center">
                      <span 
                        class="px-2 py-2 rounded text-xs font-medium text-white mr-3"
                        :style="{
                          fontWeight: 'bold',
                          backgroundColor: getTypeText(task) === '工作督办' ? 'rgb(27, 173, 255)' : 'rgb(129, 179, 55)'
                        }">
                        {{ getTypeText(task) }}
                      </span>
                      <h4 class="task-title" @click.stop="navigateToWorkflowDetail(task)">{{ getTaskTitle(task) }}</h4>
                      <span
                        class="ml-2 px-2 py-1 rounded text-xs font-medium w-20 text-center text-white"
                        :style="{
                          fontWeight: 'bold',
                          backgroundColor: getPriorityText(task) === '高优先级' ? 'rgb(179, 55, 55)' :
                                         getPriorityText(task) === '中优先级' ? 'rgb(129, 179, 55)' :
                                         getPriorityText(task) === '一般优先' ? 'rgb(64, 149, 229)' :
                                         'rgb(64, 149, 229)'
                        }">
                        {{ getPriorityText(task) }}
                      </span>
                      <span
                        class="ml-2 px-2 py-1 rounded text-xs font-medium w-20 text-center text-white"
                        :style="{
                          fontWeight: 'bold',
                          backgroundColor: getStatusText(task) === '已超时' ? 'rgb(179, 55, 55)' :
                                         getStatusText(task) === '已结束' ? 'rgb(154, 154, 154)' :
                                         getStatusText(task) === '进行中' ? 'rgb(129, 179, 55)' :
                                         getStatusText(task) === '待审核' ? 'rgb(99, 102, 241)' :
                                         'rgb(154, 154, 154)'
                        }">
                        {{ getStatusText(task) }}
                      </span>
                      <!-- 关注按钮 - 只在全部事项标签页显示 -->
                      <el-button
                        v-if="activeTab === 'all-items'"
                        :loading="followLoading[task.processInstanceId]"
                        size="small"
                        class="follow-btn ml-3"
                        :style="{
                          backgroundColor: isFollowed(task) ? 'rgb(190, 190, 190)' : 'rgb(89, 179, 253)',
                          borderColor: isFollowed(task) ? 'rgb(190, 190, 190)' : 'rgb(89, 179, 253)',
                          color: 'white'
                        }"
                        @click.stop="toggleFollow(task)"
                      >
                        {{ isFollowed(task) ? '已关注' : '关注' }}
                      </el-button>
                    </div>
                  </div>

                  <!-- 描述 + 批示 同行展示 -->
                  <div
                    class="task-desc-row"
                    v-if="getDisplayText(task) || getRemarks(task).length > 0"
                  >
                    <el-tooltip 
                      class="desc-box"
                      :content="getDisplayText(task)" 
                      :disabled="getDisplayText(task).length <= 45"
                      placement="bottom"
                      effect="dark"
                    >
                      <span class="text-gray-600 leading-relaxed desc-text inline-block one-line-ellipsis">{{ getTruncatedText(task) }}</span>
                    </el-tooltip>

                    <div v-if="getRemarks(task).length > 0" class="task-remarks inline-remarks">
                      <el-icon class="remark-icon"><Document /></el-icon>
                      <el-tooltip 
                        :content="getAllRemarksFullText(task)"
                        placement="bottom"
                        effect="dark"
                      >
                        <span class="remark-item">
                          <span class="remark-label">{{ getFirstRemarkLabel(task) }}：</span>
                          <span class="remark-text">{{ getFirstRemarkTruncatedText(task) }}</span>
                        </span>
                      </el-tooltip>
                    </div>
                  </div>

                  <div class="task-content">
                    <div class="flex items-center justify-between text-sm">
                      <div class="flex items-center gap-6 flex-wrap">
                        <div class="flex items-center">
                          <span class="text-gray-500">起始时间：</span>
                          <span class="text-gray-700">{{ formatDateOnly(task.createTime) }}</span>
                        </div>
                        <div class="flex items-center">
                          <span class="text-gray-500">结束时间：</span>
                          <span :class="getDeadlineClass(task)">{{ getDeadlineText(task) }}</span>
                        </div>
                        <div class="flex items-center">
                          <span v-if="activeTab !== 'attention-items' && getStatusText(task) !== '已结束'" :class="getPreciseTimeRemainingClass(task)">
                            {{ getPreciseTimeRemaining(task) }}
                          </span>
                        </div>
                        <div class="flex items-center">
                          <span class="text-gray-500">分管校领导：</span>
                          <span class="text-gray-700">{{ getLeadLeadersText(task.supervisionPageVOData?.leadLeaders) || getLeadLeadersText(task.leadLeaders) || '未设置' }}</span>
                        </div>
                        <div class="flex items-center">
                          <span class="text-gray-500">办理部门：</span>
                          <span class="text-gray-700">{{ getLeadDeptName(task) }}</span>
                        </div>
                        <div class="flex items-center">
                          <span class="text-gray-500">协办部门：</span>
                          <span class="text-gray-700">{{ getCoDeptNames(task) }}</span>
                        </div>
                      </div>
                    </div>

                      <div class="flex ml-6">
                        <el-button v-if="getStatusText(task) !== '已结束'" class="w-20 ml-2" type="primary" @click.stop="addInstruction(task)">新增批示</el-button>
                      </div>
                  </div>
                </template>
              </el-card>
              <div v-if="filteredTaskList.length === 0 && !loading" class="no-tasks-message">
                {{ taskList.length === 0 ? '暂无相关任务。' : '没有符合条件的任务。' }}
              </div>
              <el-pagination
                v-if="pagination.total > 0"
                background
                layout="prev, pager, next"
                :total="pagination.total"
                :page-size="pagination.pageSize"
                :current-page="pagination.pageNo"
                @current-change="handlePageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Add Instruction Dialog -->
    <el-dialog
      v-model="instructionDialogVisible"
      title="新增批示"
      width="600px"
      class="add-progress-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="progress-dialog-content">
        <el-form :model="instructionForm" :rules="instructionRules" ref="instructionFormRef" label-width="0" :hide-required-asterisk="true" class="progress-form">
          <el-form-item prop="content" class="form-item-custom">
            <el-input
              v-model="instructionForm.content"
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
          <el-button @click="cancelInstruction" class="cancel-btn">
            <Icon icon="ep:close" class="btn-icon" />
            取消
          </el-button>
          <el-button type="primary" @click="submitInstruction" class="submit-btn">
            <Icon icon="ep:check" class="btn-icon" />
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- History Dialog -->
    <el-dialog
      v-model="historyDialogVisible"
      title="历史记录"
      width="80%"
    >
      <div class="history-timeline">
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in historyList"
            :key="index"
            :timestamp="item.time"
            :type="item.type"
          >
            <div class="history-item">
              <h4>{{ item.title }}</h4>
              <p>{{ item.content }}</p>
              <div class="history-meta">
                <span>操作人：{{ item.operator }}</span>
                <span>部门：{{ item.department }}</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      <template #footer>
        <el-button @click="historyDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 高级筛选弹窗 -->
    <SeniorFilter
      v-model="seniorFilterVisible"
      :result-count="seniorFilterResultCount"
      @apply="handleSeniorFilterApply"
      @clear="handleSeniorFilterClear"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import {
  Search, DataAnalysis, Document, Clock, CircleCheck, Warning,
  OfficeBuilding, User, Filter
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@/components/Icon'
import SeniorFilter from '../components/seniorFilter.vue'
import { SupervisionTaskApi, LeaderRemarkApi, SupervisionIndexApi, SupervisionFollowApi } from '@/api/supervision/index'
import { dateFormatter, formatDate as utilFormatDate } from '@/utils/formatTime'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'

// 从leadLeaders数组中提取分管校领导（督办领导和牵头领导）
const getLeadLeadersText = (leadLeaders) => {
  if (!leadLeaders || leadLeaders.length === 0) return '未设置'
  
  // 筛选督办领导和牵头领导
  const targetLeaders = leadLeaders.filter(leader => 
    leader.type === '督办领导' || leader.type === '牵头领导'
  )
  
  if (targetLeaders.length === 0) return '未设置'
  
  // 返回领导姓名，用顿号分隔
  return targetLeaders.map(leader => leader.name).join('、')
}

// 根据supervisionStatus获取状态文本
const getSupervisionStatusText = (supervisionStatus) => {
  if (supervisionStatus === null || supervisionStatus === undefined) return '进行中'
  switch (supervisionStatus) {
    case 1: return '进行中'
    case 2: return '已超时'
    case 3: return '已结束'
    case 4: return '待审核'
    case 5: return '已终止'
    case 6: return '已中止'
    default: return '进行中'
  }
}

// 根据新的supervisionStatus字段计算显示状态
const calculateDisplayStatusNew = (supervisionStatus) => {
  const statusText = getSupervisionStatusText(supervisionStatus)
  
  return {
    daysRemaining: null,
    isOverdue: statusText === '已超时',
    overdueDays: null,
    status: statusText
  }
}

// 格式化日期，只显示年月日
const formatDateOnly = (timestamp) => {
  if (!timestamp) return ''
  return utilFormatDate(new Date(timestamp), 'YYYY年MM月DD日')
}

// 获取用户store
const userStore = useUserStore()
const { push } = useRouter()

// 根据批示的leaderId判断显示标签
const getRemarkLabel = (remark) => {
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id

  // 如果批示的leaderId与当前用户ID匹配，显示"我的批示"
  if (remark.leaderId === currentUserId) {
    return '我的批示'
  }

  // 否则显示领导姓名
  return `${remark.leaderNickName}批示`
}

// 等比例缩放（整块白色容器）
const layoutRef = ref(null)
const BASE_WIDTH = 1440 // 设计基准宽度
// 顶部第一行微缩（只作用于 header 行）
const headerRef = ref(null)

// 仅针对第一行（tabs + 搜索）做微缩，保证一行容纳
const applyHeaderScale = () => {
  const wrap = headerRef.value
  if (!wrap) return
  const parent = wrap.parentElement
  if (!parent) return
  // 重置
  wrap.style.transform = ''
  wrap.style.transformOrigin = 'left center'
  const available = parent.clientWidth
  const needed = wrap.scrollWidth
  if (available <= 0 || needed <= 0) return
  if (needed <= available) return
  let scale = available / needed
  const MIN = 0.8
  if (scale < MIN) scale = MIN
  wrap.style.transform = `scale(${scale})`
}

// 整体容器等比缩放
const applyZoomScale = () => {
  const el = layoutRef.value
  if (!el) return
  const container = el.parentElement
  if (!container) return
  const available = container.clientWidth || window.innerWidth
  const scale = Math.min(1, available / BASE_WIDTH)
  el.style.zoom = String(scale)
  const zoomComputed = getComputedStyle(el).zoom
  if (!zoomComputed || zoomComputed === 'normal') {
    el.style.transformOrigin = 'top left'
    el.style.transform = `scale(${scale})`
    el.style.width = BASE_WIDTH + 'px'
  } else {
    el.style.transform = ''
    el.style.width = ''
  }
}

onMounted(() => {
  applyZoomScale()
  window.addEventListener('resize', applyZoomScale)
  nextTick(() => { applyZoomScale(); applyHeaderScale() })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', applyZoomScale)
})

// Reactive data
const activeTab = ref('all-items') // 默认激活"分管事项"
// 搜索和筛选相关变量
const searchQuery = ref('')
const selectedPriority = ref('')
const selectedSupervisionStatus = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')
const instructionDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const loading = ref(false)

// 纯文本模式开关（默认开启，用于预览效果）
const pureTextMode = ref(true)

// 关注相关状态
const followedTasks = ref(new Set()) // 存储已关注的任务processInstanceId
const followLoading = ref({}) // 存储每个任务的关注操作loading状态

const instructionForm = reactive({
  content: ''
})

const instructionFormRef = ref()

// 批示表单验证规则
const instructionRules = {
  content: [
    { required: true, message: '请输入批示内容', trigger: 'blur' }
  ]
}

// 分页相关
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0,
})

// 优先级选项
const priorityOptions = [
  { label: '一般优先', value: '一般优先' },
  { label: '中优先级', value: '中优先级' },
  { label: '高优先级', value: '高优先级' }
]

// 督办状态下拉选项（含待审核=4）
const supervisionStatusOptions = [
  { label: '待审核', value: 4 },
  { label: '进行中', value: 1 },
  { label: '已超时', value: 2 },
  { label: '已结束', value: 3 }
]

// 状态按钮组
const statusFilters = ref({
  pendingReview: true,
  inProgress: true,
  overdue: true,
  completed: true
})

// 高级筛选
const seniorFilterVisible = ref(false)
const seniorFilterParams = reactive({})
const seniorFilterActive = ref(false)
const seniorFilterResultCount = ref(0)

// 模拟当前用户的部门，用于“协办任务”过滤


// 任务列表数据
const taskList = ref([])

const historyList = ref([])

// 统计数据
const statistics = reactive({
  managedItemsCount: 0, // 我的分管事项
  ongoingCount: 0, // 进行中
  instructedCount: 0, // 已批示
  attentionCount: 0 // 需要关注
})

// 搜索选项暂时注释，后期调用后端接口实现
// const statuses = ['进行中', '已超时', '已结束', '需要关注']

// 计算部门选项暂时注释
// const departments = computed(() => {
//   const deptSet = new Set()
//   taskList.value.forEach(task => {
//     // 添加牵头单位
//     if (task.supervisionPageVOData?.leadDeptName) {
//       deptSet.add(task.supervisionPageVOData.leadDeptName)
//     }
//     // 添加创建单位
//     if (task.supervisionPageVOData?.creatorDeptName) {
//       deptSet.add(task.supervisionPageVOData.creatorDeptName)
//     }
//     // 添加协办单位
//     if (task.supervisionPageVOData?.coDeptNameMap) {
//       Object.values(task.supervisionPageVOData.coDeptNameMap).forEach(dept => {
//         if (dept) deptSet.add(dept)
//       })
//     }
//   })
//   return Array.from(deptSet)
// })

// 前端过滤逻辑暂时注释，后期调用后端接口实现
// const filteredTaskList = computed(() => {
//   return taskList.value.filter(task => {
//     // 关键词搜索 - 搜索标题和内容（参考督查督办首页）
//     const matchesSearch = !searchQuery.value ||
//       task.supervisionPageVOData?.orderTitle?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//       task.supervisionPageVOData?.content?.toLowerCase().includes(searchQuery.value.toLowerCase())

//     // 部门过滤 - 检查牵头单位、创建单位和协办单位（参考督查督办首页）
//     const matchesDepartment = !selectedDepartment.value ||
//       task.supervisionPageVOData?.leadDeptName === selectedDepartment.value ||
//       task.supervisionPageVOData?.creatorDeptName === selectedDepartment.value ||
//       Object.values(task.supervisionPageVOData?.coDeptNameMap || {}).includes(selectedDepartment.value)

//     // 状态过滤（参考督查督办首页）
//     const matchesStatus = !selectedStatus.value || getStatusText(task) === selectedStatus.value

//     return matchesSearch && matchesDepartment && matchesStatus
//   })
// })

// 暂时直接使用 taskList.value，不进行前端过滤
const filteredTaskList = computed(() => {
  return taskList.value
})

// 获取优先级数值（用于API调用）
const getPriorityValue = (priorityText) => {
  switch (priorityText) {
    case '一般优先': return 1
    case '中优先级': return 2
    case '高优先级': return 3
    default: return null
  }
}

// 状态按钮切换
const toggleStatusFilter = (status) => {
  statusFilters.value[status] = !statusFilters.value[status]
  selectedSupervisionStatus.value = ''
  pagination.pageNo = 1
  loadTaskList()
}

// 高级筛选相关方法
const openSeniorFilter = () => {
  seniorFilterVisible.value = true
}

const handleSeniorFilterApply = (payload) => {
  Object.assign(seniorFilterParams, payload || {})
  seniorFilterActive.value = true
  seniorFilterVisible.value = false
  
  // 清空简单筛选
  searchQuery.value = ''
  selectedPriority.value = ''
  selectedSupervisionStatus.value = ''
  statusFilters.value = {
    pendingReview: true,
    inProgress: true,
    overdue: true,
    completed: true
  }
  
  pagination.pageNo = 1
  loadTaskList()
}

const handleSeniorFilterClear = () => {
  Object.keys(seniorFilterParams).forEach(key => {
    delete seniorFilterParams[key]
  })
  seniorFilterActive.value = false
  seniorFilterResultCount.value = 0
  seniorFilterVisible.value = false
  
  pagination.pageNo = 1
  loadTaskList()
}

// 加载任务列表
const loadTaskList = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.pageNo || 1,
      pageSize: pagination.pageSize || 10,
      category: '督查督办'
    }
    
    // 高级筛选优先，使用高级筛选参数
    if (seniorFilterActive.value) {
      Object.assign(params, seniorFilterParams)
    } else {
      // 简单筛选
      if (searchQuery.value) {
        params.orderTitle = searchQuery.value
      }
      
      if (selectedPriority.value) {
        const p = getPriorityValue(selectedPriority.value)
        if (p !== null) params.priority = [p]
      }
      
      // 督办状态筛选：下拉优先，否则按按钮组合
      if (selectedSupervisionStatus.value) {
        params.supervisionStatusList = [selectedSupervisionStatus.value]
      } else {
        const activeStatuses = []
        if (statusFilters.value.pendingReview) activeStatuses.push(4)
        if (statusFilters.value.inProgress) activeStatuses.push(1)
        if (statusFilters.value.overdue) activeStatuses.push(2)
        if (statusFilters.value.completed) activeStatuses.push(3)
        
        if (activeStatuses.length === 0) {
          params.supervisionStatusList = [-1] // 全关传-1
        } else if (activeStatuses.length < 4) {
          params.supervisionStatusList = activeStatuses
        }
        // 全开不传supervisionStatusList
      }
    }

    // 添加统一查询参数，启用"最新进展优先+高亮+最近一条进度返回"
    params.sortByLatestProgress = true
    params.includeLatestProgress = true
    params.highlightUnread = true
    params.unreadFirst = true

    console.log('API请求参数:', params) // 添加调试日志

    let result
    if (activeTab.value === 'all-items') {
      result = await SupervisionTaskApi.getAllTasksPage(params)
    } else if (activeTab.value === 'attention-items') {
      // 已关注标签页使用关注列表接口，传入筛选参数
      result = await SupervisionFollowApi.getMyFollowList(params)
      // 转换数据格式以匹配现有的任务数据结构
      if (result && result.list) {
        result.list = result.list.map(followItem => ({
          processInstanceId: followItem.processInstanceId,
          createTime: followItem.createTime,
          taskType: 'todo', // 默认为待办状态
          remarks: followItem.remarks || [], // 保留批示数据
          supervisionPageVOData: {
            id: followItem.id,
            orderTitle: followItem.orderTitle,
            orderCode: followItem.orderCode,
            content: followItem.content,
            summary: followItem.summary, // 添加summary字段
            type: followItem.type,
            priority: followItem.priority,
            deadline: followItem.deadline,
            leadLeaders: followItem.leadLeaders, // 添加leadLeaders字段
            supervisionStatus: followItem.supervisionStatus, // 添加supervisionStatus字段
            supervisors: followItem.supervisors, // 添加督办人详细信息
            supervisorNameMap: followItem.supervisorNameMap, // 添加督办人名称映射
            coDeptNameMap: followItem.coDeptNameMap, // 添加协办部门名称映射
            leadDeptNameMap: followItem.leadDeptNameMap, // 添加办理部门名称映射
            // 其他字段可能需要根据实际API返回数据调整
          },
          leadLeaders: followItem.leadLeaders, // 在顶层也添加leadLeaders字段
          supervisionStatus: followItem.supervisionStatus // 在顶层也添加supervisionStatus字段
        }))
      }
    }

    console.log('API响应结果:', result) // 添加调试日志
    console.log('返回的任务数量:', result?.list?.length) // 检查实际返回的任务数量
    console.log('返回的总数:', result?.total) // 检查返回的总数

    const tasks = result.list || []
    taskList.value = tasks
    pagination.total = result.total || 0
    
    // 如果是全部事项标签页，需要更新关注状态
    if (activeTab.value === 'all-items') {
      await updateFollowStatus(tasks)
    } else if (activeTab.value === 'attention-items') {
      // 已关注标签页中的所有任务都是已关注状态
      tasks.forEach(task => {
        if (task.processInstanceId) {
          followedTasks.value.add(task.processInstanceId)
        }
      })
    }
  } catch (error) {
    console.error('加载任务列表失败', error)
    ElMessage.error('加载任务列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    console.log('开始调用分管领导统计数据API...')
    // 调用真实API获取分管领导月度任务统计数据
    const result = await SupervisionIndexApi.getLeaderMonthTaskStatistics()
    console.log('分管领导统计数据API响应:', result)

    // 映射API返回的字段到界面显示
    statistics.managedItemsCount = result.monthNew // 我的分管事项
    statistics.ongoingCount = result.monthInProgress // 进行中
    statistics.instructedCount = result.monthRemark // 已批示
    statistics.attentionCount = result.monthOverdue // 需要关注

    console.log('统计数据更新完成:', statistics)
  } catch (error) {
    console.error('加载统计数据失败', error)
    ElMessage.error('加载统计数据失败: ' + (error.message || error))
  }
}

// 处理页码变更
const handlePageChange = (page) => {
  pagination.pageNo = page
  loadTaskList()
}

// 处理标签页切换
const handleTabChange = () => {
  pagination.pageNo = 1 // 重置为第一页
  loadTaskList()
}

// 处理搜索
const handleSearch = () => {
  pagination.pageNo = 1 // 重置为第一页
  // 若选择了下拉状态，按钮恢复为全开，保持与下拉互斥
  if (selectedSupervisionStatus.value) {
    statusFilters.value = {
      pendingReview: true,
      inProgress: true,
      overdue: true,
      completed: true
    }
  }
  loadTaskList()
}

// 处理重置
const handleReset = () => {
  searchQuery.value = ''
  selectedPriority.value = ''
  selectedSupervisionStatus.value = ''
  statusFilters.value = {
    pendingReview: true,
    inProgress: true,
    overdue: true,
    completed: true
  }
  
  // 清空高级筛选
  if (seniorFilterActive.value) {
    handleSeniorFilterClear()
    return
  }
  
  pagination.pageNo = 1
  loadTaskList()
}

// 数据处理辅助方法
const getTaskTitle = (task) => {
  return task.supervisionPageVOData?.orderTitle || task.name || '未知任务'
}

const getTaskContent = (task) => {
  return task.supervisionPageVOData?.content || ''
}

// 描述显示：直接显示 content（与首页一致）
const getDisplayText = (task) => {
  return task.supervisionPageVOData?.content || '未设置'
}

// 截断到 45 个字符，超长加省略号
const getTruncatedText = (task) => {
  const text = getDisplayText(task)
  return text.length > 45 ? text.substring(0, 45) + '...' : text
}

// 按 leaderId 去重，保留每位领导最新一条批示
const dedupeLatestByLeader = (remarks) => {
  const seen = new Set()
  const result = []
  for (const r of remarks || []) {
    const id = r?.leaderId
    if (id == null) continue
    if (!seen.has(id)) {
      seen.add(id)
      result.push(r) // 保留首次出现 = 最新
    }
  }
  return result
}

// 批示辅助函数
const getRemarks = (task) => {
  let remarks = []
  // 已关注标签页：从 task.remarks 获取
  if (activeTab.value === 'attention-items') {
    remarks = Array.isArray(task?.remarks) ? task.remarks : []
  } else {
    // 全部事项标签页：从 task.supervisionPageVOData.remarks 获取
    remarks = Array.isArray(task?.supervisionPageVOData?.remarks) ? task.supervisionPageVOData.remarks : []
  }
  return dedupeLatestByLeader(remarks)
}

const getAllRemarksFullText = (task) => {
  const remarks = getRemarks(task)
  if (!remarks.length) return ''
  // 组合为多行文本：如 “我的批示：XXXX”
  return remarks
    .map((r) => `${getRemarkLabel(r)}：${r?.remark || ''}`)
    .join('; ')
}

const getFirstRemarkLabel = (task) => {
  const first = getRemarks(task)[0]
  return first ? getRemarkLabel(first) : ''
}

const getFirstRemarkTruncatedText = (task) => {
  const remarks = getRemarks(task)
  const first = remarks[0]
  const text = first?.remark || ''
  let display = text.length > 45 ? text.slice(0, 45) + '...' : text
  // 多条批示时，行内文本尾部加省略号提示还有更多
  if (remarks.length > 1 && !display.endsWith('...')) {
    display += '...'
  }
  return display
}

const getCreatorDeptName = (task) => {
  return task.supervisionPageVOData?.creatorDeptName || ''
}

const getCoDeptNames = (task) => {
  const coDeptNameMap = task.supervisionPageVOData?.coDeptNameMap || {}
  const names = Object.values(coDeptNameMap)
  return names.length > 0 ? names.join('、') : '未设置'
}

const getLeadDeptName = (task) => {
  const leadDeptNameMap = task.supervisionPageVOData?.leadDeptNameMap || {}
  const names = Object.values(leadDeptNameMap)
  return names.length > 0 ? names.join('、') : (task.supervisionPageVOData?.leadDeptName || '未设置')
}

const getTypeText = (task) => {
  const type = task.supervisionPageVOData?.type
  return type === 2 ? '专项督查' : '工作督办'
}

const getDeadlineText = (task) => {
  const deadline = task.supervisionPageVOData?.deadline
  if (!deadline) return '无'
  return utilFormatDate(new Date(deadline), 'YYYY年MM月DD日')
}

// 组合"最新进展"的完整文本（用于 title 提示）
const getLatestProgressFullText = (task) => {
  const detail = task?.supervisionPageVOData?.latestDeptDetail
  if (!detail) return ''
  const name = detail.creatorName || ''
  const content = detail.content || ''
  if (name && content) return `${name}：${content}`
  return name || content || ''
}

// 根据任务状态获取截止时间的样式类 - 基于supervisionStatus
const getDeadlineClass = (task) => {
  const supervisionStatus = task.supervisionPageVOData?.supervisionStatus || task.supervisionStatus
  const statusText = getSupervisionStatusText(supervisionStatus)
  
  if (statusText === '已超时') {
    return 'deadline-date-overdue' // 红色
  } else if (statusText === '已结束') {
    return 'deadline-date-finished' // 黑色
  } else if (statusText === '进行中') {
    return 'deadline-date-processing' // 橙色
  }
  return 'deadline-date' // 默认颜色
}

// 计算精确的剩余时间文本 - 基于supervisionStatus显示
const getPreciseTimeRemaining = (task) => {
  // 根据supervisionStatus显示状态信息
  const supervisionStatus = task.supervisionPageVOData?.supervisionStatus || task.supervisionStatus
  const statusText = getSupervisionStatusText(supervisionStatus)
  
  if (statusText === '已超时') {
    // 继续计算具体超时时长
  } else if (statusText === '进行中') {
    // 继续计算具体剩余时长
  } else if (statusText === '已结束') {
    return null
  }

  // 统一按截止时间戳计算精确剩余/超时文案
  const deadlineTimestamp = task.deadlineTimestamp || task.supervisionPageVOData?.deadline
  if (!deadlineTimestamp || typeof deadlineTimestamp !== 'number') {
    return null
  }

  const now = new Date()
  const deadlineDate = new Date(deadlineTimestamp)
  const timeDiff = deadlineDate.getTime() - now.getTime()
  const absDiff = Math.abs(timeDiff)

  const totalMinutes = Math.floor(absDiff / (60 * 1000))
  const totalHours = Math.floor(absDiff / (60 * 60 * 1000))
  const totalDays = Math.floor(absDiff / (24 * 60 * 60 * 1000))

  if (timeDiff < 0) {
    if (totalDays >= 1) return `超时${totalDays}天`
    if (totalHours >= 1) return `超时${totalHours}小时`
    if (totalMinutes >= 1) return `超时${totalMinutes}分钟`
    return '刚刚超时'
  } else {
    if (totalDays >= 1) return `剩余${totalDays}天`
    if (totalHours >= 1) return `剩余${totalHours}小时`
    if (totalMinutes >= 1) return `剩余${totalMinutes}分钟`
    return '即将到期'
  }
}

// 获取剩余时间的样式类（与首页完全一致）
const getPreciseTimeRemainingClass = (task) => {
  const deadlineTimestamp = task.deadlineTimestamp || task.supervisionPageVOData?.deadline
  if (!deadlineTimestamp || typeof deadlineTimestamp !== 'number') {
    return 'remaining-days'
  }

  const now = new Date()
  const deadlineDate = new Date(deadlineTimestamp)
  const timeDiff = deadlineDate.getTime() - now.getTime()

  // 已超时：红色
  if (timeDiff <= 0) {
    return 'remaining-days overdue'
  }

  // 计算剩余天数
  const remainDays = Math.floor(timeDiff / (24 * 60 * 60 * 1000))
  
  // 获取创建时间戳
  const createdTimestamp = getCreatedTimestamp(task)
  
  // 计算预警阈值
  const orangeThreshold = getOrangeThresholdDays(createdTimestamp, deadlineTimestamp)
  
  // 调试日志
  if (createdTimestamp && deadlineTimestamp) {
    const spanDays = Math.ceil((deadlineTimestamp - createdTimestamp) / (24 * 60 * 60 * 1000))
    console.log(`[变色规则] 督办单: ${getTaskTitle(task)}, 跨度: ${spanDays}天, 剩余: ${remainDays}天, 阈值: ${orangeThreshold}天, 结果: ${remainDays <= orangeThreshold ? '橙色' : '绿色'}`)
  }
  
  // 判断颜色
  if (remainDays <= orangeThreshold) {
    return 'remaining-days urgent' // 橙色
  } else {
    return 'remaining-days' // 绿色
  }
}

const getPriorityText = (task) => {
  const priority = task.supervisionPageVOData?.priority
  if (priority === 1) return '一般优先'
  if (priority === 2) return '中优先级'
  if (priority === 3) return '高优先级'
  return '一般优先'
}

const formatCreateTime = (timestamp) => {
  if (!timestamp) return ''
  return utilFormatDate(new Date(timestamp), 'YYYY年MM月DD日')
}

// 展示督办人姓名（与首页一致）
const getSupervisorsDisplay = (task) => {
  // 优先从 supervisionPageVOData.supervisorNameMap 读取（新增支持）
  const supervisorNameMap = task?.supervisionPageVOData?.supervisorNameMap
  if (supervisorNameMap && Object.keys(supervisorNameMap).length > 0) {
    return Object.values(supervisorNameMap).join('、')
  }
  
  // 从 supervisionPageVOData.supervisors 读取
  const supList = task?.supervisionPageVOData?.supervisors
  if (Array.isArray(supList) && supList.length > 0) {
    const names = supList.map((s) => s?.name).filter(Boolean)
    return names.length > 0 ? names.join('、') : '未设置'
  }
  // 兼容任务直接携带 supervisors
  if (Array.isArray(task?.supervisors) && task.supervisors.length > 0) {
    return task.supervisors.join('、')
  }
  return '未设置'
}

// 根据创建到截止的跨度计算预警阈值（天数）（与首页一致）
const getOrangeThresholdDays = (createdTimestamp, deadlineTimestamp) => {
  if (!createdTimestamp || !deadlineTimestamp) {
    return 1 // 兜底：24小时内变橙（约等于1天）
  }
  
  const spanMs = deadlineTimestamp - createdTimestamp
  if (spanMs <= 0) {
    return 0 // 异常数据：创建时间晚于截止时间
  }
  
  const spanDays = Math.ceil(spanMs / (24 * 60 * 60 * 1000))
  
  if (spanDays <= 7) return 2
  if (spanDays <= 15) return 3
  if (spanDays <= 30) return 7
  if (spanDays <= 90) return 10
  if (spanDays <= 180) return 15
  if (spanDays <= 365) return 30
  return 30 // 超过一年固定30天
}

// 获取创建时间戳（与首页一致）
const getCreatedTimestamp = (task) => {
  // 优先使用 createdTimestamp，其次 createTime
  return task.createdTimestamp || task.createTime || null
}

// 状态颜色常量（与首页保持一致）
const STATUS_COLORS = {
  normal: { bg: 'rgb(129, 179, 55)', border: '#10B981', text: '#065F46' }, // 绿色与优先级标签一致
  urgent: { bg: '#F59E0B', border: '#F59E0B', text: '#92400E' }, // 橙色
  overdue: { bg: '#F44336', border: '#F44336', text: '#FFFFFF' } // 红色
}

// 计算状态盒子的颜色风格，沿用剩余时间的颜色变化逻辑（与首页一致）
const getStatusVariant = (task) => {
  const cls = getPreciseTimeRemainingClass(task) || ''
  if (cls.includes('overdue')) return 'overdue'
  if (cls.includes('urgent')) return 'urgent'
  return 'normal'
}

// 获取截止时间的内联样式（纯文本模式使用）
const getDeadlineColorStyle = (task) => {
  const supervisionStatus = task.supervisionPageVOData?.supervisionStatus || task.supervisionStatus
  const statusText = getSupervisionStatusText(supervisionStatus)
  
  if (statusText === '已超时') {
    return { color: '#DC2626' } // 红色
  } else if (statusText === '已结束') {
    return { color: '#111827' } // 黑色
  } else if (statusText === '进行中') {
    return { color: '#D97706' } // 橙色
  }
  return { color: '#111827' } // 默认黑色
}

// 获取剩余时间的内联样式（与首页完全一致）
const getRemainingTimeColorStyle = (task) => {
  // 特殊状态：已结束时显示黑色（不受时间影响）
  if (getStatusText(task) === '已结束') {
    return { color: '#111827' } // 黑色
  }
  
  // 其他状态：复用状态盒子的颜色逻辑，使用完全相同的颜色值
  const variant = getStatusVariant(task)
  const colors = STATUS_COLORS[variant]
  
  // 直接使用状态盒子的背景色作为文字颜色
  return { color: colors.bg }
}

// Methods
const getPriorityType = (task) => {
  const priority = task.supervisionPageVOData?.priority
  if (priority === 1) return 'info'    // 一般优先级
  if (priority === 2) return 'warning' // 中优先级
  if (priority === 3) return 'danger'  // 高优先级
  return 'info' // 一般优先级
}

// 获取任务状态类型（用于标签颜色）
const getStatusType = (task) => {
  const status = getStatusText(task)
  const types = {
    '进行中': 'warning',
    '已结束': 'success',
    '已超时': 'danger',
    '需要关注': 'danger'
  }
  return types[status] || 'info'
}

// 获取任务状态文本 - 使用新的supervisionStatus字段
const getStatusText = (task) => {
  // 优先使用supervisionStatus字段
  const supervisionStatus = task.supervisionPageVOData?.supervisionStatus || task.supervisionStatus
  if (supervisionStatus !== null && supervisionStatus !== undefined) {
    return getSupervisionStatusText(supervisionStatus)
  }

  // 兼容旧的taskType逻辑
  const taskType = task.taskType
  if (taskType === 'done') {
    return '已结束'
  }
  if (taskType === 'todo') {
    return '进行中'
  }

  // 默认情况
  return '进行中'
}


const currentInstructionTask = ref(null)

const addInstruction = (task) => {
  currentInstructionTask.value = task
  instructionDialogVisible.value = true
  console.log('addInstruction')
}

const submitInstruction = async () => {
  if (!instructionFormRef.value) return

  try {
    await instructionFormRef.value.validate()

    // 二次确认弹窗
    await ElMessageBox.confirm(
      `请确认提交该批示：\n\n${instructionForm.content}`,
      '二次确认',
      {
        type: 'warning',
        confirmButtonText: '确认提交',
        cancelButtonText: '取消'
      }
    )

    // 调用新增批示API
    await LeaderRemarkApi.insertLeaderRemark({
      processInstanceId: currentInstructionTask.value.processInstanceId,
      remark: instructionForm.content.trim()
    })

    ElMessage.success('批示已提交')
    instructionDialogVisible.value = false

    // 重置表单
    instructionForm.content = ''

    // 重新加载任务列表以显示最新批示
    await loadTaskList()
  } catch (error) {
    // 用户取消确认时不显示错误信息
    if (error === 'cancel') {
      return
    }
    console.error('提交批示失败:', error)
    ElMessage.error('提交批示失败')
  }
}

const cancelInstruction = () => {
  instructionDialogVisible.value = false
  instructionForm.content = ''
}

const showMoreHistory = () => {
  historyDialogVisible.value = true
}

const handleScroll = (event) => {
  // 处理滚动事件
  console.log('Content scrolled:', event.target.scrollTop)
}

// 整卡点击跳转到督办工作流详情页（携带可选 taskId）
const navigateToWorkflowDetail = (task) => {
  const processInstanceId = task.processInstance?.id || task.processInstanceId
  if (!processInstanceId) return
  const query = task.id ? { taskId: task.id } : {}
  push({
    name: 'SupervisionWorkflowDetail',
    params: { id: processInstanceId },
    query
  })
}

// 注意：统计数据现在通过API获取，不再需要基于任务列表计算的辅助方法

// 关注相关功能函数

// 判断任务是否已关注
const isFollowed = (task) => {
  return followedTasks.value.has(task.processInstanceId)
}

// 切换关注状态
const toggleFollow = async (task) => {
  if (!task.processInstanceId) {
    ElMessage.error('任务信息不完整，无法操作')
    return
  }

  const processInstanceId = task.processInstanceId
  const currentFollowStatus = isFollowed(task)
  const newFollowStatus = !currentFollowStatus

  // 设置loading状态
  followLoading.value[processInstanceId] = true

  try {
    await SupervisionFollowApi.toggleFollow({
      processInstanceId,
      followStatus: newFollowStatus
    })

    // 更新本地状态
    if (newFollowStatus) {
      followedTasks.value.add(processInstanceId)
      ElMessage.success('已关注')
    } else {
      followedTasks.value.delete(processInstanceId)
      ElMessage.success('已取消关注')
    }
  } catch (error) {
    console.error('关注操作失败', error)
    ElMessage.error('操作失败：' + (error.message || error))
  } finally {
    // 清除loading状态
    followLoading.value[processInstanceId] = false
  }
}

// 更新任务列表的关注状态（用于全部事项标签页）
const updateFollowStatus = async (tasks) => {
  // 这里可以根据需要实现批量查询关注状态的逻辑
  // 暂时简化处理，只保留已有的关注状态
  // 如果后端提供批量查询关注状态的接口，可以在这里调用
}

// 初始化
onMounted(() => {
  // 加载统计数据
  loadStatistics()
  // 加载任务列表
  loadTaskList()
})
</script>

<style scoped>
.supervision-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.stats-section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  margin-bottom: 16px;
  color: #303133;
}

.title-icon {
  margin-right: 8px;
  font-size: 20px;
  color: #409eff;
}
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.managed-items {
  border-left: 4px solid #409eff;
}

.stat-card.ongoing {
  border-left: 4px solid #e6a23c;
}

.stat-card.instructed {
  border-left: 4px solid #67c23a;
}

.stat-card.attention {
  border-left: 4px solid #f56c6c;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 28px;
}

.stat-card.managed-items .stat-icon {
  color: #409eff;
}

.stat-card.ongoing .stat-icon {
  color: #e6a23c;
}

.stat-card.instructed .stat-icon {
  color: #67c23a;
}

.stat-card.attention .stat-icon {
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.task-section {
  background: transparent; /* 外层不需要背景，避免双层白底 */
  border-radius: 0;
  padding: 0; /* 移除内边距，避免与内层 .bg-white 容器叠加导致上方留白 */
  box-shadow: none; /* 阴影交由内层白卡处理 */
}

.task-header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.inline-tabs {
  flex-shrink: 0;
}

/* 与首页保持一致的 tabs 样式 */
.tabs-custom {
  padding: 0 16px;
}
.tabs-custom :deep(.el-tabs__item) {
  font-weight: bold;
  font-size: 24px;
  padding: 0 8px;
}
.tabs-custom :deep(.el-tabs__header) {
  margin: 0;
}
.tabs-custom :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

/* 标签页文字样式 */
.inline-tabs :deep(.el-tabs__item) {
  font-size: 20px;        /* 调整文字大小 */
  font-weight: 500;       /* 调整文字粗细：normal(400), 500, 600, bold(700) */
  color: #303133;         /* 非激活状态文字颜色 */
}

/* 激活状态的标签页文字样式 */
.inline-tabs :deep(.el-tabs__item.is-active) {
  font-size: 20px;        /* 激活状态文字大小 */
  font-weight: 500;       /* 激活状态文字粗细 */
  color: #409EFF;         /* 激活状态文字颜色 */
}

.control-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.task-search {
  width: 250px;
}

.task-filter {
  width: 150px;
}

.more-btn {
  color: #409eff;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-item {
  margin-bottom: 16px;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.task-item:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.clickable-card {
  cursor: pointer;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-title {
  margin: 0;
  font-size: 20px; /* 与部门界面保持一致 */
  font-weight: bold; /* 与部门界面保持一致 */
  cursor: pointer;
  color: #303133;
  transition: color 0.3s;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.task-description {
  margin-bottom: 0;
}

.description-text {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.leadership-instruction {
  margin-bottom: 12px;
}

.task-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 12px;
}

.task-details {
  flex: 1;
}

.detail-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 32px;
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.detail-item .el-icon {
  font-size: 14px;
  color: #909399;
  flex-shrink: 0;
}

.detail-label {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

.detail-value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.task-title {
  cursor: pointer;
}

.task-title:hover {
  color: #409eff;
}

.remaining-days.overdue {
  color: #f56c6c;
  font-weight: 600;
}

.remaining-days.urgent {
  color: #e6a23c;
  font-weight: 600;
}

.supervisor {
  color: #409eff; /* 蓝色样式 */
  font-weight: 500;
}

.deadline {
  margin-left: auto;
  color: #303133;
}

.deadline-date {
  color: #E6A23C;
  font-size: 14px;
  font-weight: 500;
}

/* 截止时间颜色样式 */
.deadline-date-overdue {
  color: #F56C6C; /* 红色 - 已超时 */
  font-size: 14px;
  font-weight: 500;
}

.deadline-date-finished {
  color: #303133; /* 黑色 - 已结束 */
  font-size: 14px;
  font-weight: 500;
}

.deadline-date-processing {
  color: #E6A23C; /* 橙色 - 进行中 */
  font-size: 14px;
  font-weight: 500;
}

.remaining-days {
  color: #67c23a;
  font-size: 14px;
  font-weight: 500;
}

.task-buttons {
  display: flex;
  gap: 8px;
}

.no-tasks-message {
  padding: 40px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* Element Plus 卡片样式调整 */
:deep(.el-card__body) {
  padding: 24px; /* 与部门界面保持一致 */
}

@media (max-width: 768px) {
  .task-header-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .control-group {
    margin-top: 12px;
    width: 100%;
  }

  .task-search, .task-filter {
    width: 100%;
  }

  .task-content {
    flex-direction: column;
    align-items: stretch;
  }

  .task-buttons {
    margin-top: 16px;
  }
}

.history-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.history-btn {
  color: #409eff;
  font-size: 14px;
}

.history-timeline {
  max-height: 400px;
  overflow-y: auto;
}

.history-item h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
}

.history-item p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}

.history-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #909399;
}

.no-tasks-message {
  text-align: center;
  padding: 50px;
  color: #909399;
  font-size: 16px;
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
  margin: 0;
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
}

.textarea-custom :deep(.el-textarea__inner) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  font-size: 14px;
  line-height: 1.5;
  padding: 12px;
  resize: none;
}

.textarea-custom :deep(.el-textarea__inner):focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
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
  color: #656d76;
  font-size: 14px;
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
  border: 1px solid #1890ff;
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;
  padding: 0 16px;
}
.tabs-custom :deep(.el-tabs__item) {
  font-weight: bold;
  font-size: 24px;
  padding: 0 8px;
}
.tabs-custom :deep(.el-tabs__header) {
  margin: 0;
}
.tabs-custom :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__header) {
  margin-bottom: 0; /* 确保标签页头部没有额外底部间距 */
}

:deep(.el-tabs__nav-wrap) {
  margin-bottom: 0; /* 确保标签页导航包裹器没有额外底部间距 */
}

.remark-label {
  font-size: inherit; /* 与描述行一致 */
  font-weight: bold;
  color: rgb(229, 146, 50); /* 统一为(229,146,50) */
  margin-right: 4px;
}

.remark-text {
  font-size: inherit; /* 与描述行一致 */
  font-weight: bold;
  color: rgb(229, 146, 50); /* 统一为(229,146,50) */
  line-height: 1.4;
}

.remark-icon {
  font-size: 14px;
  color: rgb(229, 146, 50); /* 与批示文字同色 */
  flex-shrink: 0;
}

:deep(.el-button--small) {
  padding: 5px 12px;
  font-size: 12px;
}

/* 只对非督办详情弹窗应用此样式 */
:deep(.el-dialog:not(.supervision-detail-dialog) .el-dialog__body) {
  padding: 15px 20px;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 12px;
  color: #909399;
}

/* 关注按钮样式 */
.follow-btn {
  min-width: 60px;
  height: 28px;
  font-size: 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.follow-btn:hover {
  opacity: 0.8;
}

/* 单行省略统一样式 */
.one-line-ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

/* 统一卡片动作按钮尺寸（关注/新增批示） */
.action-btn {
  min-width: 80px;
  height: 28px;
  font-size: 12px;
  border-radius: 4px;
}

/* 卡片基础浅灰背景，使卡片更“独立” */
.card-item {
  background-color: #FAFBFC;
}

/* 卡片高亮样式（有新进展/未读） */
.card-item--updated {
  background-color: #F0F7FF;
  border-color: #cdd5df !important;
}

/* 纯文本模式的侧栏字段标签对齐（与部门页一致） */
.leader-field-label {
  display: inline-block;
  width: 80px;
  text-align: justify;
  text-align-last: justify;
}
</style>
