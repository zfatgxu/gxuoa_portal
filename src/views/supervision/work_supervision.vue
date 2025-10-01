<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Statistics Cards -->
    <div class="grid grid-cols-[1fr_1fr_2fr] gap-6 mb-8">
      <!-- Total Tasks Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-4">
          <div class="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
          <h3 class="text-gray-700 font-medium">督办任务合计</h3>
        </div>
        <div class="flex items-center justify-center">
          <div class="relative w-32 h-32">
            <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle cx="50" cy="50" r="40" stroke="#e5e7eb" stroke-width="8" fill="none"/>
              <!-- Progress circle for 工作督办 -->
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#f59e0b"
                stroke-width="8"
                fill="none"
                :stroke-dasharray="workSupervisionDashArray"
                stroke-linecap="round"
              />
              <!-- Progress circle for 专项督查 -->
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#3b82f6"
                stroke-width="8"
                fill="none"
                :stroke-dasharray="specialSupervisionDashArray"
                :stroke-dashoffset="specialSupervisionDashOffset"
                stroke-linecap="round"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-2xl font-bold text-gray-800">{{ taskStats.total }}</span>
              <span class="text-sm text-gray-500">全部数据</span>
            </div>
          </div>
          <div class="ml-6 space-y-2">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span class="text-sm text-gray-600">工作督办</span>
              <span class="ml-2 text-sm font-medium">{{ taskStats.workSupervision }}</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span class="text-sm text-gray-600">专项督查</span>
              <span class="ml-2 text-sm font-medium">{{ taskStats.specialSupervision }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Status Statistics Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-4">
          <div class="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
          <h3 class="text-gray-700 font-medium">本月督办任务状态统计</h3>
        </div>
        <div class="flex items-center justify-center">
          <div class="relative w-32 h-32">
            <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle cx="50" cy="50" r="35" stroke="#e5e7eb" stroke-width="12" fill="none"/>
              <!-- Status segments -->
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke="#3b82f6"
                stroke-width="12"
                fill="none"
                :stroke-dasharray="statusInProgressDashArray"
              />
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke="#ef4444"
                stroke-width="12"
                fill="none"
                :stroke-dasharray="statusOverdueDashArray"
                :stroke-dashoffset="statusOverdueDashOffset"
              />
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke="#10b981"
                stroke-width="12"
                fill="none"
                :stroke-dasharray="statusCompletedDashArray"
                :stroke-dashoffset="statusCompletedDashOffset"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-xl font-bold text-gray-800">{{ statusStats.total }}</span>
              <span class="text-xs text-gray-500">全部数据</span>
            </div>
          </div>
          <div class="ml-4 space-y-1 text-sm">
            <div class="flex items-center space-x-3">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span class="text-gray-600">进行中</span>
              </div>
              <span class="font-medium">{{ statusStats.inProgress }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span class="text-gray-600">已超时</span>
              </div>
              <span class="font-medium">{{ statusStats.overdue }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span class="text-gray-600">已结束</span>
              </div>
              <span class="font-medium">{{ statusStats.completed }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Status Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-4">
          <div class="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
          <h3 class="text-gray-700 font-medium">本月督办情况</h3>
        </div>
        <div class="grid grid-cols-4 gap-4">
          <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-blue-500"><Calendar /></el-icon>
            <div class="flex flex-col items-center ml-4">
              <span class="text-md text-gray-600">本月新增</span>
              <span class="text-2xl font-bold text-blue-600">{{ monthlyStats.newTasks }}</span>
            </div>
          </div>
          <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-orange-500"><Clock /></el-icon>
            <div class="flex flex-col items-center ml-4">
              <span class="text-sm text-gray-600">进行中</span>
              <span class="text-2xl font-bold text-orange-600">{{ monthlyStats.inProgress }}</span>
            </div>
          </div>
          <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-green-500"><CheckCircle /></el-icon>
            <div class="flex flex-col items-center ml-4">
              <span class="text-sm text-gray-600">已完成</span>
              <span class="text-2xl font-bold text-green-600">{{ monthlyStats.completed }}</span>
            </div>
          </div>
          <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-red-500"><TimerOff /></el-icon>
            <div class="flex flex-col items-center ml-4">
              <span class="text-sm text-gray-600">已超时</span>
              <span class="text-2xl font-bold text-red-600">{{ monthlyStats.overdue }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs and Filters -->
    <div class="bg-white rounded-lg shadow-sm supervision-layout" ref="layoutRef">
      <div>
        <div class="task-header-row px-6 pt-6 pb-0">
          <div class="header-scale" ref="headerRef">
            <div class="tabs-bar -ml-3 flex items-center w-full">
              <el-tabs v-model="activeTab" class="tabs-custom">
                <el-tab-pane
                  v-for="tab in tabs"
                  :key="tab.key"
                  :label="tab.label"
                  :name="tab.key"
                />
              </el-tabs>
              <div class="mt-1">
                <!-- 纯文本模式新建督办按钮 -->
                <template v-if="pureTextMode">
                  <button class="tab-like-btn" @click="goToCreate">新建督办</button>
                </template>

                <!-- 原版新建督办按钮 -->
                <template v-else>
                  <button class="tab-like-btn" @click="goToCreate">新建督办</button>
                </template>
              </div>

              <!-- 同一行：搜索和筛选功能 -->
              <div class="task-controls ml-auto flex items-center" :style="{ marginLeft: 'auto' }">
                <div class="control-pair">
                  <span class="text-gray-700 font-medium">督办事项</span>
                  <el-input v-model="searchQuery" placeholder="请输入督办事项" />
                </div>
                <div class="control-pair">
                  <span class="text-gray-700 font-medium">优先级</span>
                  <el-select v-model="selectedPriority" placeholder="全部优先级" clearable>
                    <el-option
                      v-for="priority in priorityOptions"
                      :key="priority.value"
                      :label="priority.label"
                      :value="priority.value"
                    />
                  </el-select>
                </div>
                <div class="control-pair">
                  <span class="text-gray-700 font-medium">督办状态</span>
                  <el-select v-model="selectedSupervisionStatus" placeholder="全部状态" clearable>
                    <el-option
                      v-for="status in supervisionStatusOptions"
                      :key="status.value"
                      :label="status.label"
                      :value="status.value"
                    />
                  </el-select>
                </div>

                <div class="control-actions ml-4">
                  <!-- 纯文本模式按钮 -->
                  <template v-if="pureTextMode">
                    <button
                      class="font-bold transition-all duration-200 cursor-pointer hover:text-gray-600"
                      :style="{ color: '#111827', background: 'none', border: 'none', padding: '0', margin: '0 0.75rem 0 0', fontSize: '1.125rem' }"
                      @click="handleSearch"
                    >查询</button>
                    <button
                      class="font-bold transition-all duration-200 cursor-pointer hover:text-gray-600"
                      :style="{ color: '#111827', background: 'none', border: 'none', padding: '0', margin: '0 0.75rem 0 0', fontSize: '1.125rem' }"
                      @click="handleReset"
                    >重置</button>
                    <button
                      class="font-bold transition-all duration-200 cursor-pointer hover:text-gray-600 flex items-center"
                      :style="{ color: '#111827', background: 'none', border: 'none', padding: '0', margin: '0', fontSize: '1.125rem' }"
                      @click="openSeniorFilter"
                    >
                      <el-icon class="mr-1" :style="{ width: '1.25rem', height: '1.25rem' }"><Filter /></el-icon>
                      高级筛选
                    </button>
                  </template>
                  <!-- 原版按钮 -->
                  <template v-else>
                    <el-button type="primary" :style="{ backgroundColor: '#22A4EF', borderColor: '#22A4EF', color: '#fff' }" @click="handleSearch">查询</el-button>
                    <el-button @click="handleReset">重置</el-button>
                    <el-button type="primary" :style="{ backgroundColor: '#22A4EF', borderColor: '#22A4EF', color: '#fff' }" @click="openSeniorFilter">
                      <el-icon class="mr-1"><Filter /></el-icon>
                      高级筛选
                    </el-button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 状态筛选按钮组 -->
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
                  backgroundColor: statusFilters.pendingReview ? '#22A4EF' : '#9A9A9A'
                }"
              >
                待审核
              </button>
              <button
                @click="toggleStatusFilter('inProgress')"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white border-0 outline-none hover:shadow-md cursor-pointer"
                :style="{
                  backgroundColor: statusFilters.inProgress ? '#22A4EF' : '#9A9A9A'
                }"
              >
                进行中
              </button>
              <button
                @click="toggleStatusFilter('overdue')"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white border-0 outline-none hover:shadow-md cursor-pointer"
                :style="{
                  backgroundColor: statusFilters.overdue ? '#22A4EF' : '#9A9A9A'
                }"
              >
                已超时
              </button>
              <button
                @click="toggleStatusFilter('completed')"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white border-0 outline-none hover:shadow-md cursor-pointer"
                :style="{
                  backgroundColor: statusFilters.completed ? '#22A4EF' : '#9A9A9A'
                }"
              >
                已结束
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Task List -->
      <div class="p-6">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow cursor-pointer card-item"
          :class="{ 'card-item--updated': task.supervisionPageVOData?.hasUpdate || task.supervisionPageVOData?.unread }"
          style="border: 1px solid #E4EBFD;"
          @click="navigateToWorkflowDetail(task)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- 头部两行：第一行 类型(左) | 优先级(右)；第二行 标题(左) | 分管校领导(右) -->
              <div class="mb-2">
                <div class="flex items-center">
                  <!-- 纯文本模式：隐藏督办分类和优先级标签 -->
                  <template v-if="pureTextMode">
                    <!-- 督办分类和优先级标签已隐藏 -->
                  </template>

                  <!-- 原版模式：显示彩色标签 -->
                  <template v-else>
                    <!-- 督办类型标签 -->
                    <span
                      @click.stop="handleCategoryClick(task.type)"
                      :style="{
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        backgroundColor: task.type === 'work' || task.type === 1 ? '#22A4EF' : 'rgb(129, 179, 55)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '80px',
                        height: '32px'
                      }"
                      class="hover:opacity-80 mr-2"
                    >
                      {{ task.type === 'work' || task.type === 1 ? '工作督办' : '专项督查' }}
                    </span>

                    <!-- 优先级标签 -->
                    <span
                      class="ml-2 px-2 py-1 rounded text-xs font-medium w-20 text-center text-white"
                      :style="{
                        backgroundColor: task.status === '已超时' ? '#F59E0B' :
                                       task.status === '已结束' ? '#10B981' :
                                       task.status === '待审核' ? '#8B5CF6' : '#22A4EF'
                      }"
                    >
                      {{ task.status }}
                    </span>
                  </template>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <h4 class="text-xl font-bold text-gray-900 mr-2">{{ task.title }}</h4>
                </div>
              </div>

              <!-- 左右结构：左侧包含摘要+时间网格（含状态+剩余盒子），右侧为侧栏。采用间距布局，右侧不贴边。 -->
              <div class="flex items-start task-two-col" style="gap: var(--gap-x);">
                <!-- 左列外层固定宽度容器：避免长文本挤压右列 -->
                <div class="left-col-wrap" style="width: calc(100% - var(--sidebar-w) - var(--gap-x)); max-width: var(--left-max);">
                  <!-- 左侧：摘要行（上） + 时间/状态二维网格（下） -->
                  <div class="shrink-0">
                    <!-- 督办内容（单行省略） -->
                    <div v-if="getDisplayText(task)" class="mb-3">
                    <span
                      class="text-gray-900 leading-relaxed desc-text inline-block one-line-ellipsis"
                      :title="getDisplayText(task)"
                    >
                      {{ getDisplayText(task) }}
                    </span>
                    </div>

                    <!-- 批示：显示在督办内容下方，左对齐 -->
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

                    <!-- 最新部门办理信息：显示在摘要下方一行（来自 supervisionPageVOData），与时间行对齐 -->
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
                      <div class="grid items-start w-fit" style="grid-template-columns: max-content max-content; column-gap: var(--grid-col-gap); row-gap: var(--grid-row-gap);">
                        <div class="flex items-center">
                          <span class="text-gray-900 font-semibold inline-block w-24">起始时间：</span>
                          <span class="text-gray-900">{{ task.createdDate || '无' }}</span>
                        </div>
                        <!-- 右上：督办状态 - 纯文本显示 -->
                        <div class="flex items-center">
                          <span class="text-gray-900 font-semibold">{{ task.status }}</span>
                        </div>

                        <div class="flex items-center">
                          <span class="text-gray-900 font-semibold inline-block w-24">结束时间：</span>
                          <span class="font-semibold" :style="getDeadlineColorClass(task)">{{ getDeadlineText(task) }}</span>
                        </div>

                        <!-- 右下：剩余时间 - 纯文本显示，保持原有颜色逻辑 -->
                        <div class="flex items-center">
                          <span class="font-semibold" :style="getRemainingTimeColorStyle(task)">{{ getPreciseTimeRemaining(task) || '—' }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- 原有状态盒子样式（已注释）
                    <div>
                      <div class="grid items-start w-fit" style="grid-template-columns: max-content 120px; column-gap: var(--grid-col-gap); row-gap: var(--grid-row-gap);">
                        <div class="flex items-center">
                          <span class="text-gray-900 font-semibold inline-block w-24">起始时间：</span>
                          <span class="text-gray-900">{{ task.createdDate || '无' }}</span>
                        </div>
                        <div class="row-span-2 flex items-stretch">
                          <div
                            class="flex flex-col text-center px-2 py-1 rounded font-medium text-white"
                            :style="getStatusBoxContainerStyle(task)"
                            style="width: 120px;"
                          >
                            <div class="h-8 flex items-center justify-center font-semibold" :style="getStatusBoxDividerStyle(task)">{{ task.status }}</div>
                            <div class="h-8 flex items-center justify-center font-semibold" :style="getStatusBoxBottomTextStyle(task)">
                              {{ getPreciseTimeRemaining(task) || '—' }}
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center">
                          <span class="text-gray-900 font-semibold inline-block w-24">结束时间：</span>
                          <span class="font-semibold" :style="getDeadlineColorClass(task)">{{ getDeadlineText(task) }}</span>
                        </div>
                      </div>
                    </div>
                    -->
                  </div>
                </div>

                <!-- 右侧：侧栏，顶部与摘要平齐，其余纵向往下排列；固定宽度，左对齐，不贴右边 -->
                <div class="flex flex-col items-start gap-2 right-col" style="width: var(--sidebar-w);">
                  <div class="flex items-center">
                    <span class="text-gray-900 font-semibold leader-field-label">校领导</span><span class="text-gray-900 font-semibold">：</span>
                    <span class="text-gray-900 whitespace-nowrap">{{ getLeadLeadersText(task.supervisionPageVOData?.leadLeaders || task.leadLeaders) }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-900 font-semibold leader-field-label">办理部门</span><span class="text-gray-900 font-semibold">：</span>
                    <span class="text-gray-900 whitespace-nowrap">{{ task.leadDepartment }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-900 font-semibold leader-field-label">协办部门</span><span class="text-gray-900 font-semibold">：</span>
                    <span class="text-gray-900 whitespace-nowrap">{{ task.assistDepartments.length > 0 ? task.assistDepartments.join('、') : '未设置' }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-900 font-semibold leader-field-label">督办人</span><span class="text-gray-900 font-semibold">：</span>
                    <span class="text-gray-900 whitespace-nowrap">{{ task.supervisionPageVOData?.supervisorNameMap && Object.keys(task.supervisionPageVOData.supervisorNameMap).length > 0 ? Object.values(task.supervisionPageVOData.supervisorNameMap).join('、') : '未设置' }}</span>
                  </div>
                </div>
              </div>

              <!-- 列表内审批按钮 -->
              <div class="mt-3">
                <ListOperationButton :task="task" @success="handleListRefresh" />
              </div>
            </div>


          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="flex justify-center mt-6">
        <el-pagination
          v-model:current-page="pagination.pageNo"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="currentTabTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 高级筛选组件 -->
    <SeniorFilter
      ref="seniorFilterRef"
      v-model="seniorFilterVisible"
      :result-count="seniorFilterResultCount"
      @apply="handleSeniorFilterApply"
      @clear="handleSeniorFilterClear"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Filter, Document } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { SupervisionIndexApi, SupervisionTaskApi, LeaderRemarkApi } from '@/api/supervision/index'
import { useUserStore } from '@/store/modules/user'
import { formatDate as utilFormatDate } from '@/utils/formatTime'
import { getSupervisionStatusColor } from './components/permissions'
import SeniorFilter from './components/seniorFilter.vue'
import ListOperationButton from './workflow/ListOperationButton.vue'

const { push } = useRouter()
const route = useRoute()

// 等比例缩放（整块白色容器）
const layoutRef = ref<HTMLElement | null>(null)
const BASE_WIDTH = 1440 // 设计基准宽度
// 顶部第一行微缩（只作用于 header 行）
const headerRef = ref<HTMLElement | null>(null)

// 仅针对第一行（tabs + 新建 + 搜索 + 动作）做微缩，保证一行容纳
const applyHeaderScale = () => {
  const wrap = headerRef.value
  if (!wrap) return
  // 容器可用宽度：取父元素内容宽
  const parent = wrap.parentElement as HTMLElement
  if (!parent) return
  // 先重置缩放
  wrap.style.transform = ''
  wrap.style.transformOrigin = 'left center'
  let available = parent.clientWidth
  let needed = wrap.scrollWidth
  if (available <= 0 || needed <= 0) return
  if (needed <= available) return
  let scale = available / needed
  const MIN = 0.8
  if (scale < MIN) scale = MIN
  wrap.style.transform = `scale(${scale})`
}

const applyZoomScale = () => {
  const el = layoutRef.value
  if (!el) return
  const container = el.parentElement as HTMLElement
  if (!container) return
  const available = container.clientWidth || window.innerWidth
  const scale = Math.min(1, available / BASE_WIDTH)
    // 优先使用 zoom（Chromium），影响布局；Firefox 回退 transform
  ;(el as any).style.zoom = String(scale)
  // Firefox 不支持 zoom：检测后回退
  const zoomComputed = getComputedStyle(el as any).zoom
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
  // 某些异步渲染后再校正
  nextTick(() => { applyZoomScale(); applyHeaderScale() })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', applyZoomScale)
})
const userStore = useUserStore()
// 新建督办跳转：附带来源路径与类型
const goToCreate = () => {
  push({
    path: '/supervision/create',
    query: {
      from: 'work',
      fromPath: route.fullPath,
      type: 'work'
    }
  })
}

// 定义任务数据类型
interface TaskData {
  id: number
  title: string
  description: string
  summary?: string // 添加概述字段
  leadDepartment: string
  assistDepartments: string[]
  createdDate: string
  deadline: string
  deadlineTimestamp?: number // 添加原始时间戳字段
  createdTimestamp?: number // 新增：创建时间戳字段
  supervisor: string
  priority: string
  status: string
  overdueDays: number | null
  isOverdue: boolean
  daysRemaining: number | null
  type: string
  processInstanceId?: string
  supervisionStatus?: string
  taskId?: number // 任务ID，用于待办列表标签页的办理功能
  remarks?: any[] // 批示数据
  supervisionPageVOData?: any // 督办页面数据
}

// 定义任务统计数据类型
interface TaskStatsData {
  total: number
  workSupervision: number
  specialSupervision: number
}

// 定义状态统计数据类型
interface StatusStatsData {
  total: number
  inProgress: number
  overdue: number
  completed: number
}

// 定义月度统计数据类型
interface MonthlyStatsData {
  newTasks: number
  inProgress: number
  completed: number
  overdue: number
}

// 定义分页数据类型
interface PaginationData {
  pageNo: number
  pageSize: number
  total: number
}

// 响应式数据
const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')
const selectedPriority = ref('')
const selectedSupervisionStatus = ref('')
const activeTab = ref<string>('work')
const seniorFilterVisible = ref(false)
const seniorFilterParams = ref({})
const seniorFilterResultCount = ref(0)
const seniorFilterRef = ref()
// 纯文本模式开关（默认开启，用于预览效果）
const pureTextMode = ref(true)
// 状态筛选按钮状态
const statusFilters = ref({
  pendingReview: true, // 待审核 - 默认开启
  inProgress: true,    // 进行中 - 默认开启
  overdue: true,       // 已超时 - 默认开启
  completed: true      // 已结束 - 默认开启
})
// 详情弹框已移除

// Static data
const tabs = [
  { key: 'work', label: '工作督办' }
]

// 优先级选项
const priorityOptions = [
  { label: '一般优先', value: '一般优先' },
  { label: '中优先级', value: '中优先级' },
  { label: '高优先级', value: '高优先级' }
]

// 督办状态选项
const supervisionStatusOptions = [
  { label: '待审核', value: 4 },
  { label: '进行中', value: 1 },
  { label: '已超时', value: 2 },
  { label: '已结束', value: 3 }
]

// Statistics data
const taskStats = ref<TaskStatsData>({
  total: 0,
  workSupervision: 0,
  specialSupervision: 0
})

const statusStats = ref<StatusStatsData>({
  total: 0,
  inProgress: 0,
  overdue: 0,
  completed: 0
})

const monthlyStats = ref<MonthlyStatsData>({
  newTasks: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0
})

// 任务列表数据
const tasks = ref<TaskData[]>([])

// 分页数据
const pagination = ref<PaginationData>({
  pageNo: 1,
  pageSize: 10, // 默认显示10条数据
  total: 0
})

// 解析协办部门（从API返回的coDeptNameMap中获取）
const parseCoDepts = (coDeptNameMap: Record<string, string> | null | undefined): string[] => {
  if (!coDeptNameMap) return []
  return Object.values(coDeptNameMap)
}

// 解析牵头部门（从API返回的leadDeptNameMap中获取）
const parseLeadDepts = (leadDeptNameMap: Record<string, string> | null | undefined): string => {
  if (!leadDeptNameMap) return '未设置'
  const deptNames = Object.values(leadDeptNameMap)
  return deptNames.join('、') || '未设置'
}

// 从leadLeaders数组中提取所有校领导
const getLeadLeadersText = (leadLeaders: Array<{id: number, name: string, type: string}> | null | undefined): string => {
  if (!leadLeaders || leadLeaders.length === 0) return '未设置'

  // 去重处理：按姓名去重，保留第一个出现的
  const uniqueLeaders = leadLeaders.filter((leader, index, array) =>
    array.findIndex(l => l.name === leader.name) === index
  )

  // 返回去重后的领导姓名，用顿号分隔
  return uniqueLeaders.map(leader => leader.name).join('、')
}

// 展示督办人姓名（兼容不同来源）
const getSupervisorsDisplay = (task: any): string => {
  // 从 supervisionPageVOData.supervisors 读取
  const supList = task?.supervisionPageVOData?.supervisors
  if (Array.isArray(supList) && supList.length > 0) {
    const names = supList.map((s: any) => s?.name).filter(Boolean)
    return names.length > 0 ? names.join('、') : '未设置'
  }
  // 兼容任务直接携带 supervisors
  if (Array.isArray(task?.supervisors) && task.supervisors.length > 0) {
    return task.supervisors.join('、')
  }
  return '未设置'
}

// 根据supervisionStatus获取状态文本
const getSupervisionStatusText = (supervisionStatus: number | null | undefined): string => {
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

// 计算状态盒子的颜色风格，沿用剩余时间的颜色变化逻辑
const getStatusVariant = (task: any): 'normal' | 'urgent' | 'overdue' => {
  const cls = getPreciseTimeRemainingClass(task) || ''
  if (cls.includes('overdue')) return 'overdue'
  if (cls.includes('urgent')) return 'urgent'
  return 'normal'
}

const STATUS_COLORS: Record<'normal' | 'urgent' | 'overdue', { bg: string; border: string; text: string }> = {
  normal: { bg: 'rgb(129, 179, 55)', border: '#10B981', text: '#065F46' }, // 绿色与优先级标签一致
  urgent: { bg: '#F59E0B', border: '#F59E0B', text: '#92400E' }, // 橙
  overdue: { bg: '#F44336', border: '#F44336', text: '#FFFFFF' } // 新的红色
}

const getStatusBoxContainerStyle = (task: any) => {
  const v = getStatusVariant(task)
  const c = STATUS_COLORS[v]
  return {
    backgroundColor: c.bg,
    border: 'none',
    borderRadius: '4px'
  }
}

const getStatusBoxDividerStyle = (task: any) => {
  const v = getStatusVariant(task)
  const c = STATUS_COLORS[v]
  return {
    borderBottom: `2px solid rgba(255,255,255,0.6)`,
    color: '#ffffff',
    marginLeft: '-8px',
    marginRight: '-8px'
  }
}

const getStatusBoxBottomTextStyle = (task: any) => {
  const v = getStatusVariant(task)
  const c = STATUS_COLORS[v]
  return {
    color: '#ffffff'
  }
}

// 获取截止时间文本
const getDeadlineText = (task) => {
  return task.deadline || task.supervisionPageVOData?.deadline || '无'
}

// 根据任务状态获取截止时间颜色样式类（与状态盒子保持一致）
const getDeadlineColorClass = (task: TaskData) => {
  // 特殊状态：已结束时显示黑色（不受时间影响）
  if (task.status === '已结束') {
    return 'text-gray-900' // 黑色
  }

  // 其他状态：复用状态盒子的颜色逻辑，使用完全相同的颜色值
  const variant = getStatusVariant(task)
  const colors = STATUS_COLORS[variant]

  // 直接使用状态盒子的背景色作为文字颜色
  return { color: colors.bg }
}

// 获取剩余时间的颜色样式（保持原有颜色逻辑）
const getRemainingTimeColorStyle = (task: any) => {
  // 特殊状态：已结束时显示黑色（不受时间影响）
  if (task.status === '已结束') {
    return { color: '#111827' } // 黑色
  }

  // 其他状态：复用状态盒子的颜色逻辑，使用完全相同的颜色值
  const variant = getStatusVariant(task)
  const colors = STATUS_COLORS[variant]

  // 直接使用状态盒子的背景色作为文字颜色
  return { color: colors.bg }
}

// 计算精确的剩余时间文本
const getPreciseTimeRemaining = (task) => {
  // 直接使用原始时间戳（数据库中的精确时间）
  const deadlineTimestamp = task.deadlineTimestamp
  if (!deadlineTimestamp || typeof deadlineTimestamp !== 'number') {
    console.warn('缺少原始时间戳数据:', task)
    return null
  }

  const now = new Date()
  const deadlineDate = new Date(deadlineTimestamp)
  const timeDiff = deadlineDate.getTime() - now.getTime()

  // 计算绝对时间差
  const absDiff = Math.abs(timeDiff)
  const totalMinutes = Math.floor(absDiff / (60 * 1000))
  const totalHours = Math.floor(absDiff / (60 * 60 * 1000))
  const totalDays = Math.floor(absDiff / (24 * 60 * 60 * 1000))

  if (timeDiff < 0) {
    // 已超时 - 优先显示更小的时间单位
    if (totalDays >= 1) {
      return `超时${totalDays}天`
    } else if (totalHours >= 1) {
      return `超时${totalHours}小时`
    } else if (totalMinutes >= 1) {
      return `超时${totalMinutes}分钟`
    } else {
      return `刚刚超时`
    }
  } else {
    // 还有剩余时间 - 优先显示更小的时间单位
    if (totalDays >= 1) {
      return `剩余${totalDays}天`
    } else if (totalHours >= 1) {
      return `剩余${totalHours}小时`
    } else if (totalMinutes >= 1) {
      return `剩余${totalMinutes}分钟`
    } else {
      return `即将到期`
    }
  }
}

// 判断是否精确超时（精确到分钟）
const isPreciseOverdue = (task) => {
  const deadlineTimestamp = task.deadlineTimestamp
  if (!deadlineTimestamp || typeof deadlineTimestamp !== 'number') {
    return false
  }

  const now = new Date()
  const deadlineDate = new Date(deadlineTimestamp)
  return now > deadlineDate
}

// 获取创建时间戳（毫秒）
const getCreatedTimestamp = (task) => {
  // 优先使用 createdTimestamp 字段（待在数据映射阶段补充）
  if (task.createdTimestamp && typeof task.createdTimestamp === 'number') {
    return task.createdTimestamp
  }

  // 兜底：从 supervisionPageVOData.createTime 获取
  if (task.supervisionPageVOData?.createTime) {
    try {
      return new Date(task.supervisionPageVOData.createTime).getTime()
    } catch (e) {
      console.warn('解析 supervisionPageVOData.createTime 失败:', task.supervisionPageVOData.createTime)
    }
  }

  // 兜底：从 createdDate 字符串解析（格式："YYYY年MM月DD日 HH:mm"）
  if (task.createdDate && typeof task.createdDate === 'string') {
    try {
      // 解析 "YYYY年MM月DD日 HH:mm" 格式
      const match = task.createdDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{1,2})/)
      if (match) {
        const [, year, month, day, hour, minute] = match
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
        return date.getTime()
      }
    } catch (e) {
      console.warn('解析 createdDate 失败:', task.createdDate)
    }
  }

  return null
}

// 根据创建到截止的跨度计算预警阈值（天数）
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

// 获取剩余时间的样式类
const getPreciseTimeRemainingClass = (task) => {
  const deadlineTimestamp = task.deadlineTimestamp
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
    console.log(`[变色规则] 督办单: ${task.title}, 跨度: ${spanDays}天, 剩余: ${remainDays}天, 阈值: ${orangeThreshold}天, 结果: ${remainDays <= orangeThreshold ? '橙色' : '绿色'}`)
  }

  // 判断颜色
  if (remainDays <= orangeThreshold) {
    return 'remaining-days urgent' // 橙色
  } else {
    return 'remaining-days' // 绿色
  }
}

// 根据新的supervisionStatus字段计算显示状态
const calculateDisplayStatusNew = (supervisionStatus: number | null | undefined): {
  daysRemaining: number | null
  isOverdue: boolean
  overdueDays: number | null
  status: string
} => {
  const statusText = getSupervisionStatusText(supervisionStatus)

  return {
    daysRemaining: null,
    isOverdue: statusText === '已超时',
    overdueDays: null,
    status: statusText
  }
}

// 获取优先级文本
const getPriorityText = (priority: number | null | undefined): string => {
  if (priority === null || priority === undefined) return '一般优先'
  switch (priority) {
    case 1: return '一般优先'
    case 2: return '中优先级'
    case 3: return '高优先级'
    default: return '一般优先'
  }
}

// 获取统计数据
const getStatisticsData = async () => {
  return await SupervisionIndexApi.getStatistics()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 并行获取统计数据和督办数据
    let supervisionPromise

    // 构建通用搜索参数
    const searchParams: any = {
      pageNo: pagination.value.pageNo,
      pageSize: pagination.value.pageSize
    }

    // 优先使用高级筛选参数
    if (Object.keys(seniorFilterParams.value).length > 0) {
      const filters = seniorFilterParams.value

      // 处理高级筛选参数，转换为新的格式
      Object.keys(filters).forEach(key => {
        const value = filters[key]
        if (Array.isArray(value) && value.length > 0) {
          // 数组参数直接赋值，qs会自动处理为重复键名格式
          searchParams[key] = value
        } else if (value !== undefined && value !== null && value !== '') {
          searchParams[key] = value
        }
      })
      console.log('使用高级筛选参数:', filters)
    } else {
      // 使用简单筛选参数
      // 添加关键词搜索
      if (searchQuery.value.trim()) {
        searchParams.orderTitle = searchQuery.value.trim()
      }

      if (selectedPriority.value) {
        // 优先级转换为数组格式
        const priorityValue = getPriorityValue(selectedPriority.value)
        searchParams.priority = [priorityValue]
      }

      // 处理督办状态筛选 - 两种筛选方式互斥
      if (selectedSupervisionStatus.value !== '') {
        // 使用下拉框筛选（单个状态转为数组）
        searchParams.supervisionStatusList = [selectedSupervisionStatus.value]
      } else {
        // 使用按钮筛选（多状态支持）
        const activeStatuses = []
        if (statusFilters.value.pendingReview) activeStatuses.push(4) // 待审核
        if (statusFilters.value.inProgress) activeStatuses.push(1)    // 进行中
        if (statusFilters.value.overdue) activeStatuses.push(2)       // 已超时
        if (statusFilters.value.completed) activeStatuses.push(3)     // 已结束

        // 传递筛选参数：全部开启时不传参数，部分开启时传对应状态，全部关闭时传特殊值
        if (activeStatuses.length === 4) {
          // 全部开启，不传参数（显示所有数据）
        } else if (activeStatuses.length === 0) {
          // 全部关闭，传递特殊值表示不显示任何数据
          searchParams.supervisionStatusList = [-1]
          console.log('传递supervisionStatusList:', [-1])
        } else {
          // 部分开启，传递对应状态
          searchParams.supervisionStatusList = activeStatuses
          console.log('传递supervisionStatusList:', activeStatuses)
        }
      }
    }

    // 构建类型参数
    if (activeTab.value === 'todo') {
      // 最近更新标签页 - 使用合并的全部任务接口
      supervisionPromise = SupervisionTaskApi.getMergedAllTasksPage(searchParams)
    } else {
      // 工作督办和专项督查 - 只有在没有使用高级筛选时才添加类型参数
      if (Object.keys(seniorFilterParams.value).length === 0) {
        // 简单筛选时，根据标签页添加类型参数
        const typeParam = activeTab.value === 'work' ? 1 : 2
        searchParams.type = [typeParam]
      }
      // 如果使用了高级筛选，type参数已经在高级筛选中传递了

      // 添加统一查询参数，启用"最新进展优先+高亮+最近一条进度返回"
      searchParams.sortByLatestProgress = true
      searchParams.includeLatestProgress = true
      searchParams.highlightUnread = true
      searchParams.unreadFirst = true

      console.log('最终传递给后端的参数:', searchParams)
      supervisionPromise = SupervisionIndexApi.getIndexData(searchParams)
    }

    const [statisticsResult, supervisionResult] = await Promise.allSettled([
      getStatisticsData(),
      supervisionPromise
    ])

    // 处理统计数据
    if (statisticsResult.status === 'fulfilled') {
      const statistics = statisticsResult.value
      console.log('获取统计数据成功', statistics)

      // 设置任务类型统计
      taskStats.value = {
        total: statistics.workSupervision + statistics.specialSupervision,
        workSupervision: statistics.workSupervision,
        specialSupervision: statistics.specialSupervision
      }

      // 设置本月统计数据
      monthlyStats.value = {
        newTasks: statistics.monthTotal,
        inProgress: statistics.monthInProgress,
        completed: statistics.monthCompleted,
        overdue: statistics.monthOverdue
      }

      // 设置本月督办任务状态统计
      statusStats.value = {
        total: statistics.monthTotal, // 直接使用API返回的monthTotal字段
        inProgress: statistics.monthInProgress, // 进行中
        overdue: statistics.monthOverdue, // 已超时
        completed: statistics.monthCompleted // 已结束
      }

      console.log('本月督办任务状态统计数据:', {
        API原始数据: {
          monthTotal: statistics.monthTotal,
          monthInProgress: statistics.monthInProgress,
          monthOverdue: statistics.monthOverdue,
          monthCompleted: statistics.monthCompleted
        },
        映射后数据: statusStats.value
      })
    } else {
      console.error('获取统计数据失败', statisticsResult.reason)
      ElMessage.error('获取统计数据失败')
    }

    // 处理督办数据
    if (supervisionResult.status === 'fulfilled') {
      const supervisionResponse = supervisionResult.value
      console.log('获取督办数据成功', supervisionResponse)
      console.log('督办数据列表:', supervisionResponse.list)

      // 更新分页总数
      pagination.value.total = supervisionResponse.total

      // 更新高级筛选结果数量
      if (Object.keys(seniorFilterParams.value).length > 0) {
        seniorFilterResultCount.value = supervisionResponse.total || 0
      }

      console.log('获取数据成功:', {
        currentTab: activeTab.value,
        total: pagination.value.total,
        listLength: supervisionResponse.list.length,
        searchParams,
        seniorFilterActive: Object.keys(seniorFilterParams.value).length > 0
      })

      let processedTasks: TaskData[] = []

      if (activeTab.value === 'todo') {
        // 处理待办列表数据（任务格式），参考工作督办的字段映射
        const taskList = supervisionResponse.list || []

        processedTasks = taskList.map((task: any) => {
          // 格式化日期的辅助函数（与工作督办保持一致）
          const formatOrderDate = (dateValue: number | string | null | undefined): string => {
            if (!dateValue) return ''
            try {
              const date = new Date(dateValue)
              if (isNaN(date.getTime())) return ''
              return utilFormatDate(date, 'YYYY年MM月DD日')
            } catch {
              return ''
            }
          }

          // 待办列表数据结构：从task.supervisionPageVOData获取督办单信息
          // 根据实际API返回结构，督办单信息在task.supervisionPageVOData中：
          // - 标题：supervisionPageVOData.orderTitle
          // - 牵头部门：supervisionPageVOData.leadDeptName
          // - 截止时间：supervisionPageVOData.deadline
          // - 协办部门：supervisionPageVOData.coDeptNameMap（只要名字）
          // - 分管领导：supervisionPageVOData.leadLeaders（督办领导和牵头领导）
          const supervisionData = task.supervisionPageVOData || {}

          // 使用新的supervisionStatus字段计算状态
          const displayStatus = calculateDisplayStatusNew(supervisionData.supervisionStatus)

          return {
            id: supervisionData.id || task.id,
            title: supervisionData.orderTitle || '',
            description: supervisionData.content || '',
            summary: supervisionData.summary || '', // 添加概述字段映射
            leadDepartment: parseLeadDepts(supervisionData.leadDeptNameMap),
            assistDepartments: parseCoDepts(supervisionData.coDeptNameMap),
            createdDate: task.createTime ? utilFormatDate(new Date(task.createTime), 'YYYY年MM月DD日') : '未设置',
            deadline: supervisionData.deadline ? utilFormatDate(new Date(supervisionData.deadline), 'YYYY年MM月DD日') : '未设置',

            deadlineTimestamp: supervisionData.deadline, // 保存原始时间戳
            createdTimestamp: task.createTime || supervisionData.createTime, // 新增：创建时间戳
            supervisor: getLeadLeadersText(supervisionData.leadLeaders) || '未分配',
            priority: getPriorityText(supervisionData.priority),
            status: displayStatus?.status || '进行中', // 待办列表只显示进行中和已超时
            overdueDays: displayStatus?.overdueDays || null,
            isOverdue: displayStatus?.isOverdue || false,
            daysRemaining: displayStatus?.daysRemaining || null,
            type: supervisionData.type === 1 ? 'work' : 'special', // 根据supervisionData中的type字段设置
            processInstanceId: task.processInstanceId || supervisionData.processInstanceId || '',
            supervisionStatus: supervisionData.supervisionStatus || '',
            taskId: task.id, // 保存任务ID用于办理
            // 关键：挂载原始对象以便 getRemarks() 能从 supervisionPageVOData.remarks 读取
            supervisionPageVOData: supervisionData
          } as TaskData
        })
      } else {
        // 处理工作督办和专项督查数据（督办单格式）
        const supervisionOrders = supervisionResponse.list

        // 注意：督办数量统计现在使用API返回的数据，不再前端计算

        processedTasks = supervisionOrders.map((order) => {
          // 使用新的supervisionStatus字段计算状态
          const displayStatus = calculateDisplayStatusNew(order.supervisionStatus)

          // 调试信息
          console.log(`督办单 ${order.orderTitle}: supervisionStatus=${order.supervisionStatus}, 计算状态=${displayStatus?.status || '未知'}`)

          // 格式化日期的辅助函数
          const formatOrderDate = (dateValue: number | string | null | undefined): string => {
            if (!dateValue) return ''
            try {
              const date = new Date(dateValue)
              if (isNaN(date.getTime())) return ''
              return utilFormatDate(date, 'YYYY年MM月DD日')
            } catch {
              return ''
            }
          }

          return {
            id: order.id,
            title: order.orderTitle || '',
            description: order.content || '',
            summary: order.summary || '', // 添加概述字段映射
            leadDepartment: parseLeadDepts(order.leadDeptNameMap),
            assistDepartments: parseCoDepts(order.coDeptNameMap),
            createdDate: formatOrderDate(order.createTime),
            deadline: formatOrderDate(order.deadline),
            deadlineTimestamp: order.deadline, // 保存原始时间戳
            createdTimestamp: order.createTime, // 新增：创建时间戳
            supervisor: getLeadLeadersText(order.leadLeaders) || '未分配',
            priority: getPriorityText(order.priority),
            status: displayStatus?.status || '进行中',
            overdueDays: displayStatus?.overdueDays || null,
            isOverdue: displayStatus?.isOverdue || false,
            daysRemaining: displayStatus?.daysRemaining || null,
            type: order.type === 1 ? 'work' : 'special',
            processInstanceId: order.processInstanceId || '',
            supervisionStatus: order.supervisionStatus || '',
            // 关键：工作督办/专项督查从 order.remarks 提供批示
            remarks: Array.isArray(order.remarks) ? order.remarks : [],
            // 关键：挂载原始 order 对象到 supervisionPageVOData，保证模版能读取 leadLeaders 等字段
            supervisionPageVOData: order
          } as TaskData
        })
      }

      tasks.value = processedTasks
    } else {
      console.error('获取督办数据失败', supervisionResult.reason)
      ElMessage.error('获取督办数据失败')
    }

  } catch (error) {
    console.error('获取督办数据失败', error)
    ElMessage.error('获取督办数据失败')
  } finally {
    loading.value = false
  }
}

// 分页事件处理
const handleSizeChange = (newSize: number) => {
  pagination.value.pageSize = newSize
  pagination.value.pageNo = 1
  fetchData()
}

const handleCurrentChange = (newPage: number) => {
  pagination.value.pageNo = newPage
  fetchData()
}

// 监听标签页切换，重新获取数据
watch(activeTab, () => {
  pagination.value.pageNo = 1 // 切换标签页时重置到第一页
  fetchData()
})

// 处理审批操作成功后的列表刷新
const handleListRefresh = async () => {
  await fetchData()
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})

// Computed properties for chart data
const workSupervisionDashArray = computed(() => {
  if (taskStats.value.total === 0) return '0 251.2'
  const percentage = (taskStats.value.workSupervision / taskStats.value.total) * 251.2
  return `${percentage} 251.2`
})

const specialSupervisionDashArray = computed(() => {
  if (taskStats.value.total === 0) return '0 251.2'
  const percentage = (taskStats.value.specialSupervision / taskStats.value.total) * 251.2
  return `${percentage} 251.2`
})

const specialSupervisionDashOffset = computed(() => {
  if (taskStats.value.total === 0) return '0'
  const offset = (taskStats.value.workSupervision / taskStats.value.total) * 251.2
  return `-${offset}`
})

// Status chart computed properties
const statusInProgressDashArray = computed(() => {
  if (statusStats.value.total === 0) return '0 219.8'
  const percentage = (statusStats.value.inProgress / statusStats.value.total) * 219.8
  return `${percentage} 219.8`
})

const statusOverdueDashArray = computed(() => {
  if (statusStats.value.total === 0) return '0 219.8'
  const percentage = (statusStats.value.overdue / statusStats.value.total) * 219.8
  return `${percentage} 219.8`
})

const statusOverdueDashOffset = computed(() => {
  if (statusStats.value.total === 0) return '0'
  const offset = (statusStats.value.inProgress / statusStats.value.total) * 219.8
  return `-${offset}`
})

const statusCompletedDashArray = computed(() => {
  if (statusStats.value.total === 0) return '0 219.8'
  const percentage = (statusStats.value.completed / statusStats.value.total) * 219.8
  return `${percentage} 219.8`
})

const statusCompletedDashOffset = computed(() => {
  if (statusStats.value.total === 0) return '0'
  const offset = ((statusStats.value.inProgress + statusStats.value.overdue) / statusStats.value.total) * 219.8
  return `-${offset}`
})

// 直接返回后端数据
const filteredTasks = computed(() => {
  return tasks.value
})

// 计算当前标签页的总数量
const currentTabTotal = computed(() => {
  return pagination.value.total
})

// 详情弹框相关逻辑已移除

// 处理审批按钮（参考部门界面实现）
const handleAudit = (task: TaskData) => {
  // 督办相关流程跳转到督办专用工作流详情页面
  if (task.processInstanceId) {
    push({
      name: 'SupervisionWorkflowDetail',
      params: {
        id: task.processInstanceId
      },
      query: {
        taskId: task.taskId || task.id
      }
    })
  } else {
    ElMessage.error('无法获取流程实例信息')
  }
}

// 整卡点击跳转到工作流详情（路径格式 A）
const navigateToWorkflowDetail = (task: TaskData) => {
  if (task.processInstanceId) {
    const path = `/supervision/workflow/detail/${task.processInstanceId}`
    const query: any = {}
    if (task.taskId || task.id) {
      query.taskId = task.taskId || task.id
    }
    push({ path, query })
  } else {
    ElMessage.error('无法获取流程实例信息')
  }
}

// 优先级文本转数值的辅助函数
const getPriorityValue = (priorityText: string): number => {
  switch (priorityText) {
    case '一般优先': return 1
    case '中优先级': return 2
    case '高优先级': return 3
    default: return 1
  }
}

// 高级筛选相关方法
const openSeniorFilter = () => {
  seniorFilterVisible.value = true
}

const handleSeniorFilterApply = (filters) => {
  seniorFilterParams.value = filters
  // 应用高级筛选时，重置简单筛选
  searchQuery.value = ''
  selectedPriority.value = ''
  selectedSupervisionStatus.value = ''
  // 重置状态筛选按钮为全部开启
  statusFilters.value = {
    pendingReview: true,
    inProgress: true,
    overdue: true,
    completed: true
  }
  // 应用高级筛选时，重置简单筛选新获取数据
  fetchData()
}

const handleSeniorFilterClear = () => {
  seniorFilterParams.value = {}
  seniorFilterResultCount.value = 0
  // 应用高级筛选时，重置简单筛选新获取数据
  // 重新获取数据
  fetchData()
}

// 处理搜索按钮点击
const handleSearch = () => {
  // 清空高级筛选参数
  seniorFilterParams.value = {}
  seniorFilterResultCount.value = 0

  // 如果下拉框有选择，重置状态筛选按钮为全部开启
  if (selectedSupervisionStatus.value !== '') {
    statusFilters.value = {
      pendingReview: true,
      inProgress: true,
      overdue: true,
      completed: true
    }
  }

  // 重置到第一页并重新获取数据
  pagination.value.pageNo = 1
  fetchData()
}

// 处理重置按钮点击
const handleReset = () => {
  // 重置简单筛选条件
  searchQuery.value = ''
  selectedPriority.value = ''
  selectedSupervisionStatus.value = ''

  // 重置状态筛选按钮为全部开启
  statusFilters.value = {
    pendingReview: true,
    inProgress: true,
    overdue: true,
    completed: true
  }

  // 清空高级筛选参数
  seniorFilterParams.value = {}
  seniorFilterResultCount.value = 0

  // 重置高级筛选组件内部状态
  if (seniorFilterRef.value && typeof seniorFilterRef.value.clearAllFilters === 'function') {
    seniorFilterRef.value.clearAllFilters()
  }

  // 重置到第一页并重新获取数据
  pagination.value.pageNo = 1
  fetchData()
}

// 切换状态筛选按钮
const toggleStatusFilter = (status: 'pendingReview' | 'inProgress' | 'overdue' | 'completed') => {
  statusFilters.value[status] = !statusFilters.value[status]

  // 清空下拉框选择，避免冲突
  selectedSupervisionStatus.value = ''

  // 重置到第一页并重新获取数据
  pagination.value.pageNo = 1
  fetchData()
}

// 处理分类标签点击事件
const handleCategoryClick = (taskType: string | number) => {
  // 根据任务类型切换到对应标签页
  if (taskType === 'work' || taskType === 1) {
    activeTab.value = 'work'
  } else if (taskType === 'special' || taskType === 2) {
    activeTab.value = 'special'
  }
}

// 获取显示文本（用于判断长度）
const getDisplayText = (task: TaskData): string => {
  return task.supervisionPageVOData?.content || task.summary || task.description || '未设置'
}

// 获取截断后的文本（超过45字符显示省略号）
const getTruncatedText = (task: TaskData): string => {
  const text = getDisplayText(task)
  return text.length > 45 ? text.substring(0, 45) + '...' : text
}


// 根据批示的leaderId判断显示标签
const getRemarkLabel = (remark: any) => {
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id

  // 如果批示的leaderId与当前用户ID匹配，显示"我的批示"
  if (remark.leaderId === currentUserId) {
    return '我的批示'
  }

  // 否则显示领导姓名
  return `${remark.leaderNickName}批示`
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
const getRemarks = (task: TaskData) => {
  let remarks = []
  // 最近更新标签页：从 task.supervisionPageVOData.remarks 获取
  if (activeTab.value === 'todo') {
    remarks = Array.isArray(task?.supervisionPageVOData?.remarks) ? task.supervisionPageVOData.remarks : []
  } else {
    // 工作督办/专项督查标签页：从 task.remarks 获取
    remarks = Array.isArray(task?.remarks) ? task.remarks : []
  }
  return dedupeLatestByLeader(remarks)
}

const getAllRemarksFullText = (task: TaskData) => {
  const remarks = getRemarks(task)
  if (!remarks.length) return ''
  // 组合为多行文本：如 "我的批示：XXXX"
  return remarks
    .map((r) => `${getRemarkLabel(r)}：${r?.remark || ''}`)
    .join('; ')
}

// 组合“最新进展”的完整文本（用于 title 提示）
const getLatestProgressFullText = (task: TaskData): string => {
  const detail = task?.supervisionPageVOData?.latestDeptDetail
  if (!detail) return ''
  const name = detail.creatorName || ''
  const content = detail.content || ''
  if (name && content) return `${name}：${content}`
  return name || content || ''
}

const getFirstRemarkLabel = (task: TaskData) => {
  const first = getRemarks(task)[0]
  return first ? getRemarkLabel(first) : ''
}

const getFirstRemarkTruncatedText = (task: TaskData) => {
  const remarks = getRemarks(task)
  const first = remarks[0]
  const text = first?.remark || ''
  // 基础截断逻辑
  let display = text.length > 45 ? text.slice(0, 45) + '...' : text
  // 若存在多条批示，即使未超长也追加省略号，提示有更多内容
  if (remarks.length > 1 && !display.endsWith('...')) {
    display += '...'
  }
  return display
}

</script>

<style scoped>
/* Custom styles for better visual appeal */
.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.transition-shadow {
  transition: box-shadow 0.2s ease-in-out;
}

/* Ensure proper spacing and alignment */
.grid {
  gap: 1rem;
}

.tabs-custom {
  padding: 0 16px;
}
.tabs-custom :deep(.el-tabs__item) {
  font-weight: bold;
  font-size: 1.25rem; /* 与新建督办一致，保持对齐 */
  padding: 0 8px;
}
.tabs-custom :deep(.el-tabs__header) {
  margin: 0;
  min-height: 1.75rem;
  display: flex;
  align-items: center;
}
.tabs-custom :deep(.el-tabs__nav-wrap::after) {
  display: none;
}
/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 自适应变量：用于卡片左右列与时间网格，以及顶部布局 */
.supervision-layout {
  --sidebar-w: clamp(14rem, 22vw, 21.25rem);
  --gap-x: clamp(0.5rem, 2vw, 2rem);
  --grid-col-gap: clamp(1rem, 5vw, 4.375rem);
  --grid-row-gap: 0.5rem;
  --left-max: clamp(28rem, 48vw, 42rem);
  --header-gap: clamp(0.5rem, 1vw, 0.75rem);
}

/* 顶部行：左 Tabs + 右 Controls，使用不换行flex，整体配合zoom等比例缩小 */
.supervision-layout .task-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--header-gap);
  white-space: nowrap;
}

/* Tabs 与 新建督办合并为一个整体 */
.tabs-bar {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.tab-like-btn {
  font-size: 1.25rem;            /* 与 .el-tabs__item 一致 */
  line-height: 1.75rem;           /* 与 .el-tabs__item 一致 */
  padding: 0 8px;                 /* 与 .el-tabs__item 一致 */
  height: var(--el-tabs-header-height, 2.25rem); /* 与 Tabs 头高度一致 */
  background: transparent;
  border: none;
  color: inherit;                 /* 继承 Tab 文字颜色 */
  font-weight: bold;              /* 与 Tab 粗细一致 */
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.tab-like-btn:hover { background: rgba(0,0,0,0.04); }

/* header 第一行容器设为 flex，便于右侧对齐 */
.header-scale {
  display: flex;
  align-items: center;
  gap: var(--header-gap);
  width: 100%;
}

/* 搜索与筛选控件区域：单行不换行，等比例缩放；gap 使用rem */
.supervision-layout .task-controls {
  display: flex;
  align-items: center;
  gap: var(--header-gap);
  flex-wrap: nowrap;
  justify-content: flex-end; /* 将内部内容贴右对齐 */
  min-width: 0;             /* 防止因内容过长导致不收缩 */
}

/* 成对的 label+控件并排呈现 */
.supervision-layout .control-pair {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* 控件宽度用 rem 固定（基于1440设计），配合 zoom 等比例缩小 */
.supervision-layout .task-controls :deep(.el-input) { width: 10rem; } /* 160px */
.supervision-layout .task-controls :deep(.el-select) { width: 8rem; } /* 128px */

/* 按钮行动作区：单行不换行 */
.supervision-layout .control-actions {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  gap: 0.5rem;
  margin-left: 1rem; /* 与左侧筛选控件留出小间距，避免被推到最右 */
}

/* 响应式：极窄屏时卡片上下堆叠兜底，不影响顶部等比例缩放 */
@media (max-width: 900px) {
  .task-two-col {
    flex-direction: column;
    gap: 1rem;
  }

  .right-col {
    width: 100% !important;
  }
}

/* 校领导等标签固定宽度对齐样式 */
.leader-field-label {
  display: inline-block;
  width: 4em;
  text-align: justify;
  text-align-last: justify;
}

/* 描述与批示同行布局：使用flexbox确保同行显示 */
.task-desc-row {
  display: flex;
  align-items: flex-start;
  gap: 36px;
  margin-bottom: 1.75rem; /* 与首页的 mb-7 一致，避免被 scoped 样式覆盖后无间距 */
  min-height: 24px;
}

.desc-text {
  color: #111827;
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
}

.task-remarks.inline-remarks {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 描述容器：限制描述区域宽度，避免把批示推到最右边 */
.desc-box {
  flex: 0 1 70%;
  max-width: 70%;
  display: inline-flex;
}

.remark-item {
  display: inline;
}

.remark-label {
  font-size: inherit; /* 与描述行一致 */
  font-weight: bold;
  color: #F59E0B; /* 统一使用状态盒子的橙色 */
}

.remark-text {
  font-size: inherit; /* 与描述行一致 */
  font-weight: bold; /* 内容加粗 */
  color: #F59E0B; /* 统一使用状态盒子的橙色 */
}

.remark-icon {
  font-size: 14px;
  color: #F59E0B; /* 统一使用状态盒子的橙色 */
  flex-shrink: 0;
}

/* 响应式：窄屏改为上下布局 */
@media (max-width: 1024px) {
  .task-desc-row {
    flex-direction: column;
    gap: 12px;
  }
}

.remaining-days {
  color: #67c23a; /* 绿色 - 正常 */
  font-weight: 600;
}

.remaining-days.overdue {
  color: #f56c6c; /* 红色 - 超期 */
  font-weight: 600;
}

.remaining-days.urgent {
  color: #e6a23c; /* 橙色 - 今日到期 */
  font-weight: 600;
}

/* 单行省略统一样式（列表页使用） */
.one-line-ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0; /* 在 flex 布局下允许收缩，确保省略号生效 */
}

/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 卡片基础浅灰背景，使卡片更“独立” */
.card-item {
  background-color: #FAFBFC; /* 调整为更浅的卡片底色 */
}

/* 有新进展的卡片：比基础灰稍深，便于区分 */
.card-item--updated {
  background-color: #F0F7FF; /* 高亮卡片底色 */
  border-color: #cdd5df !important; /* 略深的边框，使用 !important 覆盖行内样式 */
}
</style>
