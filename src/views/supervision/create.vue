<template>
  <ContentWrap>
    <div class="supervision-order-create">
      <!-- 步骤1：督办单表单 -->
      <div v-if="currentStep === 1">
        <!-- 页面标题 -->
        <div class="page-header mb-6 text-center">
          <h2 class="text-2xl font-bold text-red-600">{{ pageTitle }}</h2>
        </div>

        <!-- 督办单表单 -->
      <el-form
        :model="orderForm"
        :rules="rules"
        ref="orderFormRef"
        label-width="120px"
        class="order-form"
        v-loading="dataLoading"
        element-loading-text="正在加载数据..."
      >
        <!-- 第一行：督办编号放右边 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 空白占位 -->
          </el-col>
          <el-col :span="12">
            <el-form-item label="督办编号：" prop="orderNumber">
              <el-input
                v-model="orderForm.orderNumber"
                placeholder="正在生成督办编号..."
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：文件标题 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="文件标题：" prop="title">
              <el-input v-model="orderForm.title" placeholder="请输入文件标题" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：督办分类、督办依据 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="督办分类：" prop="category">
              <el-select v-model="orderForm.category" placeholder="请选择督办分类" style="width: 100%">
                <el-option
                  v-for="dict in supervisionTypeOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="督办依据：" prop="basis">
              <el-select v-model="orderForm.basis" placeholder="请选择督办依据" style="width: 100%">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_REASON)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行：紧急程度、要求完成时间 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急程度：" prop="urgencyLevel">
              <el-select v-model="orderForm.urgencyLevel" placeholder="请选择紧急程度" style="width: 100%">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="要求完成时间：" prop="deadline" label-width="140px">
              <el-date-picker
                v-model="orderForm.deadline"
                type="datetime"
                placeholder="请选择完成时间"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第五行：牵头单位、重要程度 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="牵头单位：" prop="leadDept">
              <el-select
                v-model="orderForm.leadDept"
                placeholder="牵头部门"
                style="width: 100%"
                @change="handleLeadDeptChange"
              >
                <el-option
                  v-for="dept in deptList"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.name"
                  :data-id="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重要程度：" prop="importance">
              <el-select v-model="orderForm.importance" placeholder="请选择重要程度" style="width: 100%">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_SIGNIFICANCE_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第六行：协办单位 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="协办单位：" prop="collaborateDepts">
              <el-select
                v-model="orderForm.collaborateDepts"
                multiple
                placeholder="搜索并选择协办部门"
                style="width: 100%;"
                :collapse-tags="true"
                :max-collapse-tags="2"
                filterable
                clearable
                remote
                :remote-method="searchDepts"
                :loading="false"
                @change="handleCollaborateDeptsChange"
              >
                <el-option
                  v-for="dept in filteredCollaborateDepts"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.name"
                  :data-id="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 已选择的协办单位显示区域 -->
        <el-row :gutter="20" v-if="orderForm.collaborateDepts && orderForm.collaborateDepts.length > 0">
          <el-col :span="24">
            <div class="selected-depts-container">
              <div class="selected-depts-header">已选择的协办单位：</div>
              <div class="selected-depts-box">
                <el-tag
                  v-for="(dept, index) in orderForm.collaborateDepts"
                  :key="index"
                  closable
                  @close="removeDept(dept)"
                  class="dept-tag"
                  type="success"
                >
                  {{ dept }}
                </el-tag>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 第七行：督办人 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="督办人：" prop="supervisorName">
              <div class="search-container">
                <el-select
                  v-model="orderForm.supervisorName"
                  placeholder="搜索并选择督办人"
                  style="width: 200px;"
                  filterable
                  clearable
                  remote
                  :remote-method="searchUsers"
                  :loading="false"
                  @change="handleSupervisorChange"
                >
                  <el-option
                    v-for="user in filteredUserList"
                    :key="user.id"
                    :label="user.nickname || user.username"
                    :value="user.nickname || user.username"
                    :data-id="user.id"
                  />
                </el-select>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第八行：办公电话和分管领导 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="办公电话：" prop="officePhone">
              <el-input v-model="orderForm.officePhone" placeholder="(自动生成)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分管领导：" prop="leader">
              <el-input v-model="orderForm.leader" placeholder="(自动获取)" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 主要内容 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="主要内容：" prop="content">
              <el-input 
                type="textarea" 
                v-model="orderForm.content" 
                placeholder="请输入主要内容"
                :rows="6"
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 承办事项 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="承办事项：" prop="tasks">
              <el-input 
                type="textarea" 
                v-model="orderForm.tasks" 
                placeholder="请输入承办事项"
                :rows="4"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 督察办审批 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="督察办审批：" prop="inspectionApproval">
              <el-select v-model="orderForm.inspectionApproval" placeholder="请选择审批状态" style="width: 200px">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_APPROVE_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 牵头单位承办情况 -->
        <div class="section-title">
          <h3 class="text-lg font-medium text-red-600 mb-4">牵头单位承办情况：</h3>
        </div>

        <!-- 承办状况 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="承办状况：" prop="handlingDetails">
              <el-input 
                type="textarea" 
                v-model="orderForm.handlingDetails" 
                placeholder="请输入承办状况"
                :rows="6"
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 督查督办复核 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="督查督办复核：" prop="supervisionReview">
              <el-select v-model="orderForm.supervisionReview" placeholder="请选择复核状态" style="width: 200px">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_REAPPROVE_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <div class="form-actions mt-8 text-center">
          <el-button type="info" @click="submitOrder" size="large" :loading="submitLoading">
            保存草稿
          </el-button>
          <el-button @click="handleNext" type="primary" size="large">
            下一步
          </el-button>
          <el-button @click="handleCancel" size="large">
            取消
          </el-button>
        </div>
      </el-form>
      </div>

      <!-- 步骤2：概述选择页面 -->
      <div v-if="currentStep === 2">
        <!-- 页面标题 -->
        <div class="page-header mb-6 text-center">
          <h2 class="text-2xl font-bold text-red-600">{{ pageTitle }}</h2>
        </div>

        <!-- 督办单表单 -->
        <el-form label-width="120px" class="order-form">
          <!-- 第一行：督办编号放右边 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <!-- 空白占位 -->
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'orderNumber')!.checked">
                    督办编号：
                  </el-checkbox>
                </template>
                <el-input v-model="orderForm.orderNumber" readonly />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第二行：文件标题 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'title')!.checked">
                    文件标题：
                  </el-checkbox>
                </template>
                <el-input v-model="orderForm.title" readonly />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第三行：督办分类、督办依据 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'category')!.checked">
                    督办分类：
                  </el-checkbox>
                </template>
                <el-input :value="getCategoryLabel(orderForm.category)" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'basis')!.checked">
                    督办依据：
                  </el-checkbox>
                </template>
                <el-input :value="getReasonLabel(orderForm.basis)" readonly />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第四行：紧急程度、要求完成时间 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'urgencyLevel')!.checked">
                    紧急程度：
                  </el-checkbox>
                </template>
                <el-input :value="getFieldDisplayValue('urgencyLevel')" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label-width="140px">
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'deadline')!.checked">
                    要求完成时间：
                  </el-checkbox>
                </template>
                <el-input v-model="orderForm.deadline" readonly />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第五行：牵头单位、重要程度 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'leadDept')!.checked">
                    牵头单位：
                  </el-checkbox>
                </template>
                <el-input v-model="orderForm.leadDept" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'importance')!.checked">
                    重要程度：
                  </el-checkbox>
                </template>
                <el-input v-model="orderForm.importance" readonly />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第六行：协办单位 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'collaborateDepts')!.checked">
                    协办单位：
                  </el-checkbox>
                </template>
                <div class="readonly-tags">
                  <el-tag v-for="dept in orderForm.collaborateDepts" :key="dept" type="success">
                    {{ dept }}
                  </el-tag>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第七行：督办人 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'supervisorName')!.checked">
                    督办人：
                  </el-checkbox>
                </template>
                <div class="search-container">
                  <el-input v-model="orderForm.supervisorName" readonly style="width: 120px;" />
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第八行：办公电话和分管领导 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'officePhone')!.checked">
                    办公电话：
                  </el-checkbox>
                </template>
                <el-input v-model="orderForm.officePhone" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'leader')!.checked">
                    分管领导：
                  </el-checkbox>
                </template>
                <el-input v-model="orderForm.leader" readonly />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 主要内容 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'content')!.checked">
                    主要内容：
                  </el-checkbox>
                </template>
                <el-input type="textarea" v-model="orderForm.content" readonly :rows="6" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 承办事项 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'tasks')!.checked">
                    承办事项：
                  </el-checkbox>
                </template>
                <el-input type="textarea" v-model="orderForm.tasks" readonly :rows="4" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 督察办审批 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'inspectionApproval')!.checked">
                    督察办审批：
                  </el-checkbox>
                </template>
                <el-input v-model="orderForm.inspectionApproval" readonly />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 牵头单位承办情况 -->
          <div class="section-title">
            <h3 class="text-lg font-medium text-red-600 mb-4">牵头单位承办情况：</h3>
          </div>

          <!-- 承办状况 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'handlingDetails')!.checked">
                    承办状况：
                  </el-checkbox>
                </template>
                <el-input type="textarea" v-model="orderForm.handlingDetails" readonly :rows="6" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 督查督办复核 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'supervisionReview')!.checked">
                    督查督办复核：
                  </el-checkbox>
                </template>
                <el-input v-model="orderForm.supervisionReview" readonly />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 操作按钮 -->
          <div class="form-actions mt-8 text-center">
            <el-button @click="backToForm" size="large">返回上一步修改表单信息</el-button>
            <el-button type="primary" @click="goToPreview" size="large">预览</el-button>
          </div>
        </el-form>
      </div>

      <!-- 步骤3：预览页面 -->
      <div v-if="currentStep === 3">
        <!-- 页面标题 -->
        <div class="page-header mb-6 text-center">
          <h2 class="text-2xl font-bold text-red-600">{{ pageTitle }}</h2>
        </div>

        <!-- 督办单表单 -->
        <el-form label-width="120px" class="order-form">
          <!-- 第一行：督办编号放右边 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <!-- 空白占位 -->
            </el-col>
            <el-col :span="12">
              <el-form-item label="督办编号：">
                <el-input v-model="orderForm.orderNumber" readonly />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第二行：文件标题 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="文件标题：">
                <el-input v-model="orderForm.title" readonly />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第三行：督办分类、督办依据 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="督办分类：">
                <el-select v-model="orderForm.category" disabled style="width: 100%">
                  <el-option
                    v-for="dict in supervisionTypeOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="督办依据：">
                <el-select v-model="orderForm.basis" disabled style="width: 100%">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_REASON)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第四行：紧急程度、要求完成时间 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="紧急程度：">
                <el-select v-model="orderForm.urgencyLevel" disabled style="width: 100%">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="要求完成时间：" label-width="140px">
                <el-date-picker
                  v-model="orderForm.deadline"
                  type="datetime"
                  disabled
                  style="width: 100%"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第五行：牵头单位、重要程度 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="牵头单位：">
                <el-select v-model="orderForm.leadDept" disabled style="width: 100%">
                  <el-option
                    v-for="dept in deptList"
                    :key="dept.id"
                    :label="dept.name"
                    :value="dept.name"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="重要程度：">
                <el-select v-model="orderForm.importance" disabled style="width: 100%">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_SIGNIFICANCE_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第六行：协办单位 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="协办单位：">
                <div class="search-container">
                  <el-select
                    v-model="orderForm.collaborateDepts"
                    multiple
                    disabled
                    style="width: 150px;"
                    :collapse-tags="true"
                    :max-collapse-tags="0"
                  >
                    <el-option
                      v-for="dept in deptList"
                      :key="dept.id"
                      :label="dept.name"
                      :value="dept.name"
                    />
                  </el-select>


                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 已选择的协办单位显示区域 -->
          <el-row :gutter="20" v-if="orderForm.collaborateDepts && orderForm.collaborateDepts.length > 0">
            <el-col :span="24">
              <div class="selected-depts-container">
                <div class="selected-depts-header">已选择的协办单位：</div>
                <div class="selected-depts-box">
                  <el-tag
                    v-for="(dept, index) in orderForm.collaborateDepts"
                    :key="index"
                    class="dept-tag"
                    type="success"
                  >
                    {{ dept }}
                  </el-tag>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- 第七行：督办人 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="督办人：">
                <div class="search-container">
                  <el-select
                    v-model="orderForm.supervisorName"
                    disabled
                    style="width: 120px;"
                  >
                    <el-option
                      v-for="user in userList"
                      :key="user.id"
                      :label="user.nickname || user.username"
                      :value="user.nickname || user.username"
                    />
                  </el-select>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第八行：办公电话和分管领导 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="办公电话：">
                <el-input v-model="orderForm.officePhone" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="分管领导：">
                <el-input v-model="orderForm.leader" readonly />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 主要内容 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="主要内容：">
                <el-input
                  type="textarea"
                  v-model="orderForm.content"
                  readonly
                  :rows="6"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 承办事项 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="承办事项：">
                <el-input
                  type="textarea"
                  v-model="orderForm.tasks"
                  readonly
                  :rows="4"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 督察办审批 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="督察办审批：">
                <el-select v-model="orderForm.inspectionApproval" disabled style="width: 200px">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_APPROVE_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 牵头单位承办情况 -->
          <div class="section-title">
            <h3 class="text-lg font-medium text-red-600 mb-4">牵头单位承办情况：</h3>
          </div>

          <!-- 承办状况 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="承办状况：">
                <el-input
                  type="textarea"
                  v-model="orderForm.handlingDetails"
                  readonly
                  :rows="6"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 督查督办复核 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="督查督办复核：">
                <el-select v-model="orderForm.supervisionReview" disabled style="width: 200px">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_REAPPROVE_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 概述部分 -->
          <div class="section-title">
            <h3 class="text-lg font-medium text-red-600 mb-4">概述：</h3>
          </div>

          <!-- 概述内容 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item>
                <div class="preview-textarea summary-content">
                  <div v-for="field in selectedSummaryFields" :key="field.key" class="summary-item">
                    <strong>{{ field.label }}：</strong>{{ getSummaryFieldValue(field.key) }}
                  </div>
                  <div v-if="selectedSummaryFields.length === 0" class="no-summary">
                    未选择任何概述内容
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 操作按钮 -->
          <div class="form-actions mt-8 text-center">
            <el-button @click="goToStep(2)" size="large">返回上一步修改概述信息</el-button>
            <el-button type="primary" @click="completeOrder" size="large" :loading="submitLoading">
              完成并提交
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { OrderApi, type OrderVO } from '@/api/supervision'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { Icon } from '@/components/Icon'

defineOptions({ name: 'SupervisionOrderCreate' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 获取返回路径的函数
const getReturnPath = () => {
  const fromPage = route.query.from as string
  switch (fromPage) {
    case 'work_supervision':
      return '/supervision/work_supervision'
    case 'special_supervision':
      return '/supervision/special_supervision'
  }
}

// 获取督办类型
const getSupervisionOrderType = () => {
  const type = route.query.type as string
  return type === 'special' ? 'special' : 'work'
}

// 页面标题
const pageTitle = computed(() => {
  const orderType = getSupervisionOrderType()
  return orderType === 'special' ? '广西大学专项督办单' : '广西大学工作督办单'
})

// 督办分类选项
const supervisionTypeOptions = ref<any[]>([])

// 获取督办分类列表
const loadSupervisionTypes = async () => {
  try {
    const orderType = getSupervisionOrderType()
    // 工作督办是1，专项督办是2
    const typeValue = orderType === 'special' ? 2 : 1
    const result = await OrderApi.getSupervisionDetailTypes(typeValue)
    console.log('API返回的督办分类数据:', result)

    // 将字符串数组转换为下拉框需要的格式
    if (result && Array.isArray(result)) {
      supervisionTypeOptions.value = result.map((item, index) => ({
        value: item, // 使用字符串本身作为值
        label: item // 字符串作为显示标签
      }))
      console.log('转换后的督办分类选项:', supervisionTypeOptions.value)
    } else {
      supervisionTypeOptions.value = []
      console.log('API返回数据格式不正确或为空')
    }
  } catch (error) {
    console.error('获取督办分类列表失败:', error)
    ElMessage.error('获取督办分类列表失败')
    // 如果API调用失败，回退到使用数据字典
    const orderType = getSupervisionOrderType()
    if (orderType === 'special') {
      supervisionTypeOptions.value = getIntDictOptions(DICT_TYPE.SPECIAL_SUPERVISION_TYPE)
    } else {
      supervisionTypeOptions.value = getIntDictOptions(DICT_TYPE.WORK_SUPERVISION_TYPE)
    }
  }
}

// 响应式数据
const submitLoading = ref(false)
const dataLoading = ref(false)
const orderFormRef = ref()
const deptList = ref<DeptApi.DeptVO[]>([])
const userList = ref<any[]>([])
// 搜索关键词变量在下面的搜索逻辑部分声明

// 步骤控制
const currentStep = ref(1) // 1: 表单填写, 2: 概述选择, 3: 预览

// 概述选择字段
const summaryFields = ref([
  { key: 'orderNumber', label: '督办编号', checked: false, required: false },
  { key: 'title', label: '文件标题', checked: false, required: true },
  { key: 'category', label: '督办分类', checked: false, required: false },
  { key: 'basis', label: '督办依据', checked: false, required: false },
  { key: 'urgencyLevel', label: '紧急程度', checked: false, required: false },
  { key: 'deadline', label: '要求完成时间', checked: false, required: false },
  { key: 'leadDept', label: '牵头单位', checked: false, required: false },
  { key: 'importance', label: '重要程度', checked: false, required: false },
  { key: 'collaborateDepts', label: '协办单位', checked: false, required: false },
  { key: 'supervisorName', label: '督办人', checked: false, required: false },
  { key: 'officePhone', label: '办公电话', checked: false, required: false },
  { key: 'leader', label: '分管领导', checked: false, required: false },
  { key: 'content', label: '主要内容', checked: false, required: false },
  { key: 'tasks', label: '承办事项', checked: false, required: false },
  { key: 'inspectionApproval', label: '督察办审批', checked: false, required: false },
  { key: 'handlingDetails', label: '承办状况', checked: false, required: false },
  { key: 'supervisionReview', label: '督查督办复核', checked: false, required: false }
])

// 计算属性：可选择的协办单位（排除牵头单位）
const availableCollaborateDepts = computed(() => {
  return deptList.value.filter(dept => dept.name !== orderForm.leadDept)
})

// 使用自定义过滤逻辑确保搜索准确性
const deptSearchKeyword = ref('')
const userSearchKeyword = ref('')

// 过滤后的部门列表
const filteredCollaborateDepts = computed(() => {
  if (!deptSearchKeyword.value) {
    return availableCollaborateDepts.value
  }
  return availableCollaborateDepts.value.filter(dept =>
    dept.name.toLowerCase().includes(deptSearchKeyword.value.toLowerCase())
  )
})

// 过滤后的用户列表
const filteredUserList = computed(() => {
  if (!userSearchKeyword.value) {
    return userList.value
  }
  return userList.value.filter(user => {
    const name = user.nickname || user.username || ''
    return name.toLowerCase().includes(userSearchKeyword.value.toLowerCase())
  })
})

// 部门搜索方法
const searchDepts = (query: string) => {
  deptSearchKeyword.value = query
}

// 用户搜索方法
const searchUsers = (query: string) => {
  userSearchKeyword.value = query
}

// 督办单表单数据
const orderForm = reactive({
  orderNumber: '', // 督办编号
  title: '', // 督办标题
  category: undefined, // 督办分类（字符串类型）
  basis: undefined, // 督办依据（数字类型）
  urgencyLevel: undefined, // 紧急程度（数字类型）
  deadline: '', // 完成时间
  leadDept: '', // 牵头单位名称（用于显示）
  leadDeptId: 0, // 牵头单位ID（用于提交）
  importance: undefined, // 重要程度（数字类型）
  collaborateDepts: [], // 协办单位名称数组（用于显示）
  collaborateDeptIds: [], // 协办单位ID数组（用于提交）
  supervisorName: '', // 督办人姓名（用于显示）
  supervisorId: 0, // 督办人ID（用于提交）
  officePhone: '',
  leader: '',
  content: '', // 主要内容
  tasks: '', // 承办事项
  inspectionApproval: undefined, // 督察办审批（数字类型）
  handlingDetails: '', // 牵头单位承办情况
  supervisionReview: undefined // 督查督办复核（数字类型）
})

// 表单验证规则
const rules = {
  orderNumber: [
    { required: true, message: '督办编号不能为空', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入文件标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择督办分类', trigger: 'change' }
  ],
  basis: [
    { required: false, message: '请选择督办依据', trigger: 'change' }
  ],
  urgencyLevel: [
    { required: true, message: '请选择紧急程度', trigger: 'change' }
  ],
  deadline: [
    { required: false, message: '请选择完成时间', trigger: 'change' }
  ],
  leadDept: [
    { required: true, message: '请选择牵头单位', trigger: 'change' }
  ],
  supervisorName: [
    { required: true, message: '请选择督办人', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入主要内容', trigger: 'blur' },
    { min: 1, max: 2000, message: '内容长度在 1 到 2000 个字符', trigger: 'blur' }
  ],
  tasks: [
    { required: false, message: '请输入承办事项', trigger: 'blur' },
    { min: 1, max: 1000, message: '承办事项长度在 1 到 1000 个字符', trigger: 'blur' }
  ]
}

// 方法
const generateOrderNumber = async () => {
  try {
    const orderCode = await OrderApi.generateSupervisionOrderCode()
    orderForm.orderNumber = orderCode
  } catch (error) {
    console.error('生成督办编号失败:', error)
    ElMessage.error('生成督办编号失败，请重试')
    // 如果生成失败，设置一个默认值或者重试
    orderForm.orderNumber = '生成失败，请刷新页面重试'
  }
}

const loadDeptList = async () => {
  try {
    dataLoading.value = true
    const result = await DeptApi.getSimpleDeptList()
    deptList.value = result || []
  } catch (error) {
    console.error('加载部门列表失败:', error)
    ElMessage.error('加载部门列表失败')
  } finally {
    dataLoading.value = false
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

// 初始化数据加载
const initData = async () => {
  dataLoading.value = true
  try {
    await Promise.all([loadDeptList(), loadUserList(), loadSupervisionTypes()])
  } catch (error) {
    console.error('初始化数据失败:', error)
  } finally {
    dataLoading.value = false
  }
}

const initUserInfo = () => {
  const user = userStore.getUser
  if (user) {
    orderForm.supervisorName = user.nickname || user.username
    orderForm.supervisorId = user.id
  }
}

// 搜索功能通过 remote-method 实现精确过滤
// 用户在下拉框中输入时，会调用 searchDepts 或 searchUsers 方法
// 这些方法会更新搜索关键词，计算属性会自动过滤选项

const removeDept = (deptName: string) => {
  const index = orderForm.collaborateDepts.indexOf(deptName)
  if (index > -1) {
    orderForm.collaborateDepts.splice(index, 1)
    // 同时移除对应的ID
    const dept = deptList.value.find(d => d.name === deptName)
    if (dept) {
      const idIndex = orderForm.collaborateDeptIds.indexOf(dept.id)
      if (idIndex > -1) {
        orderForm.collaborateDeptIds.splice(idIndex, 1)
      }
    }
  }
}

// 处理牵头单位变化
const handleLeadDeptChange = (deptName: string) => {
  const dept = deptList.value.find(d => d.name === deptName)
  if (dept) {
    orderForm.leadDeptId = dept.id
    // 自动获取部门负责人信息和办公电话
    getDeptLeaderAndPhoneInfo(dept.id)
  }
}

// 处理协办单位变化
const handleCollaborateDeptsChange = (deptNames: string[]) => {
  orderForm.collaborateDeptIds = []
  deptNames.forEach(name => {
    const dept = deptList.value.find(d => d.name === name)
    if (dept) {
      orderForm.collaborateDeptIds.push(dept.id)
    }
  })
}

// 处理督办人变化
const handleSupervisorChange = (userName: string) => {
  const user = userList.value.find(u => (u.nickname || u.username) === userName)
  if (user) {
    orderForm.supervisorId = user.id
    // 注意：办公电话应该根据牵头单位部门的phone来获取，而不是督办人的手机号
    // 所以这里不设置办公电话，办公电话由牵头单位变化时自动获取
  }
}

// 获取部门负责人信息和办公电话
const getDeptLeaderAndPhoneInfo = async (deptId: number) => {
  try {
    const dept = await DeptApi.getDept(deptId)

    // 处理分管领导信息
    if (dept.leaderUserId) {
      const leader = userList.value.find(u => u.id === dept.leaderUserId)
      if (leader) {
        orderForm.leader = leader.nickname || leader.username
      } else {
        // 如果在当前用户列表中没找到，清空分管领导字段
        orderForm.leader = ''
        console.warn('未找到部门负责人信息，leaderUserId:', dept.leaderUserId)
      }
    } else {
      // 如果部门没有设置负责人，清空分管领导字段并提示用户
      orderForm.leader = ''
      console.warn('部门未设置负责人，deptId:', deptId)
      ElMessage.warning('所选部门未设置负责人，提交时将使用督办人作为默认审批人')
    }

    // 处理办公电话信息
    if (dept.phone) {
      orderForm.officePhone = dept.phone
    } else {
      // 如果部门没有设置电话，清空办公电话字段
      orderForm.officePhone = ''
      console.warn('部门未设置办公电话，deptId:', deptId)
    }
  } catch (error) {
    console.error('获取部门信息失败:', error)
    orderForm.leader = ''
    orderForm.officePhone = ''
    ElMessage.error('获取部门信息失败，请重新选择')
  }
}

// 数据转换辅助方法
// 这些方法现在主要用于显示转换
const getCategoryLabel = (value: string | number): string => {
  // 如果是字符串，直接返回
  if (typeof value === 'string') {
    return value
  }

  // 如果是数字，尝试从当前加载的督办分类选项中查找
  const option = supervisionTypeOptions.value.find(opt => opt.value === value)
  if (option) {
    return option.label
  }

  // 如果没找到，尝试从数据字典中查找（作为备用方案）
  // 首先尝试从工作督办分类中查找
  let dict = getIntDictOptions(DICT_TYPE.WORK_SUPERVISION_TYPE).find(d => d.value === value)
  if (dict) {
    return dict.label
  }

  // 如果没找到，尝试从专项督办分类中查找
  dict = getIntDictOptions(DICT_TYPE.SPECIAL_SUPERVISION_TYPE).find(d => d.value === value)
  if (dict) {
    return dict.label
  }

  // 如果还没找到，尝试从通用督办分类中查找
  dict = getIntDictOptions(DICT_TYPE.SUPERVISION_TYPE).find(d => d.value === value)
  if (dict) {
    return dict.label
  }

  // 如果都没找到，返回空字符串
  return ''
}

const getReasonLabel = (value: number): string => {
  const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_REASON).find(d => d.value === value)
  return dict?.label || ''
}

const getPriorityLabel = (value: number): string => {
  const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE).find(d => d.value === value)
  return dict?.label || ''
}

const getSignificanceLabel = (value: number): string => {
  const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_SIGNIFICANCE_TYPE).find(d => d.value === value)
  return dict?.label || ''
}

const getApprovalLabel = (value: number): string => {
  const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_APPROVE_TYPE).find(d => d.value === value)
  return dict?.label || ''
}

const getReapprovalLabel = (value: number): string => {
  const dict = getIntDictOptions(DICT_TYPE.SUPERVISION_REAPPROVE_TYPE).find(d => d.value === value)
  return dict?.label || ''
}

// 步骤控制方法
const goToStep = (step: number) => {
  currentStep.value = step
}

const backToForm = () => {
  currentStep.value = 1
}

const goToPreview = () => {
  currentStep.value = 3
}

const completeOrder = async () => {
  try {
    submitLoading.value = true

    // 生成概述信息字符串
    const summaryContent = generateSummaryContent()

    // 准备提交数据，转换为API需要的格式
    const orderType = getSupervisionOrderType()

    // 构建发起人自选审批人 Map
    const startUserSelectAssignees: Record<string, number[]> = {}

    // First 节点先写死为 212
    startUserSelectAssignees['First'] = [212]

    // 如果选择了牵头单位，需要获取该部门的负责人用户ID作为候选人
    if (orderForm.leadDeptId) {
      try {
        // 获取部门详细信息
        const deptDetail = await DeptApi.getDept(orderForm.leadDeptId)
        if (deptDetail && deptDetail.leaderUserId) {
          // 使用部门负责人的用户ID作为候选人
          startUserSelectAssignees['Second'] = [deptDetail.leaderUserId]
          console.log('使用部门负责人作为候选人，部门ID:', orderForm.leadDeptId, '负责人ID:', deptDetail.leaderUserId)
        } else {
          // 如果部门没有设置负责人，使用督办人作为默认候选人
          console.warn('部门未设置负责人，使用督办人作为默认候选人，部门ID:', orderForm.leadDeptId)
          if (orderForm.supervisorId) {
            startUserSelectAssignees['Second'] = [orderForm.supervisorId]
            ElMessage.warning('所选牵头单位未设置负责人，将使用督办人作为默认审批人')
          } else {
            ElMessage.error('牵头单位未设置负责人且督办人信息缺失，请重新选择')
            return
          }
        }
      } catch (error) {
        console.error('获取部门负责人信息失败:', error)
        // 如果获取失败，使用督办人作为默认候选人
        if (orderForm.supervisorId) {
          startUserSelectAssignees['Second'] = [orderForm.supervisorId]
          ElMessage.warning('获取牵头单位负责人信息失败，将使用督办人作为默认审批人')
        } else {
          ElMessage.error('获取部门信息失败且督办人信息缺失，请重试')
          return
        }
      }
    }

    const submitData: OrderVO = {
      orderCode: orderForm.orderNumber,
      orderTitle: orderForm.title,
      type: orderType === 'special' ? 2 : 1, // 督办类型：1=工作督办, 2=专项督办
      detailType: orderForm.category, // 督办具体分类（字符串）
      orderType: orderType === 'special' ? 2 : 1, // 1=工作督办, 2=专项督办
      reason: orderForm.basis, // 直接使用数字值
      priority: orderForm.urgencyLevel,
      deadline: orderForm.deadline,
      leadDept: orderForm.leadDeptId,
      significance: orderForm.importance, // 直接使用数字值
      coDept: orderForm.collaborateDeptIds.join(','), // 协办单位ID用逗号分隔
      supervisor: orderForm.supervisorId,
      content: orderForm.content,
      undertakeMatter: orderForm.tasks,
      supervisionApprove: orderForm.inspectionApproval, // 直接使用数字值
      leadDeptDetail: orderForm.handlingDetails,
      supervisionReapprove: orderForm.supervisionReview, // 直接使用数字值
      summary: summaryContent, // 添加概述信息字符串
      startUserSelectAssignees: startUserSelectAssignees // 发起人自选审批人
    }

    console.log('提交督办单数据:', submitData)
    console.log('概述信息:', summaryContent)
    console.log('发起人自选审批人:', startUserSelectAssignees)

    // 验证必要的ID字段
    if (!submitData.leadDept || !submitData.supervisor) {
      ElMessage.error('请确保已正确选择牵头单位和督办人')
      return
    }

    // 调用API创建督办单
    const result = await OrderApi.createOrder(submitData)

    if (result) {
      ElMessage.success('督办单创建成功')
    } else {
      throw new Error('创建督办单返回结果为空')
    }

    // 询问是否继续创建或返回列表
    try {
      await ElMessageBox.confirm('督办单已创建成功，是否继续创建新的督办单？', '操作成功', {
        confirmButtonText: '继续创建',
        cancelButtonText: '返回列表',
        type: 'success'
      })

      // 重置表单继续创建
      resetForm()
      currentStep.value = 1 // 返回第一步
    } catch {
      // 返回对应的列表页
      router.push(getReturnPath())
    }
  } catch (error) {
    console.error('完成督办单创建失败:', error)
    ElMessage.error('创建督办单失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// 获取字段显示值
const getFieldDisplayValue = (key: string) => {
  const value = orderForm[key as keyof typeof orderForm]
  if (value === undefined || value === null || value === '') return ''

  switch (key) {
    case 'category':
      return getCategoryLabel(value as string | number)
    case 'basis':
      return getReasonLabel(value as number)
    case 'urgencyLevel':
      return getPriorityLabel(value as number)
    case 'importance':
      return getSignificanceLabel(value as number)
    case 'inspectionApproval':
      return getApprovalLabel(value as number)
    case 'supervisionReview':
      return getReapprovalLabel(value as number)
    case 'collaborateDepts':
      return Array.isArray(value) ? value.join('、') : ''
    default:
      return String(value)
  }
}

// 判断字段是否被选中
const isFieldSelected = (key: string) => {
  const field = summaryFields.value.find(f => f.key === key)
  return field ? field.checked : false
}

// 获取选中的概述字段
const selectedSummaryFields = computed(() => {
  return summaryFields.value.filter(field => field.checked)
})

// 获取概述字段的值
const getSummaryFieldValue = (key: string) => {
  const value = orderForm[key as keyof typeof orderForm]
  if (value === undefined || value === null || value === '') return '无'

  switch (key) {
    case 'category':
      return getCategoryLabel(value as string | number) || '无'
    case 'basis':
      return getReasonLabel(value as number) || '无'
    case 'urgencyLevel':
      return getPriorityLabel(value as number) || '无'
    case 'importance':
      return getSignificanceLabel(value as number) || '无'
    case 'inspectionApproval':
      return getApprovalLabel(value as number) || '无'
    case 'supervisionReview':
      return getReapprovalLabel(value as number) || '无'
    case 'collaborateDepts':
      return Array.isArray(value) && value.length > 0 ? value.join('、') : '无'
    default:
      return String(value)
  }
}

// 生成概述信息字符串
const generateSummaryContent = () => {
  const selectedFields = summaryFields.value.filter(field => field.checked)

  if (selectedFields.length === 0) {
    return '未选择任何概述内容'
  }

  const summaryItems = selectedFields.map(field => {
    const value = getSummaryFieldValue(field.key)
    return `${field.label}：${value}`
  })

  return summaryItems.join('\n')
}

const submitOrder = async () => {
  try {
    const valid = await orderFormRef.value?.validate().catch(() => false)
    if (!valid) return

    submitLoading.value = true

    // 保存按钮只做表单验证和本地保存，不调用API
    ElMessage.success('表单数据已保存，请继续完善概述信息')

    // 可以在这里保存到本地存储（可选）
    // localStorage.setItem('supervisionOrderDraft', JSON.stringify(orderForm))

  } catch (error) {
    console.error('保存表单失败:', error)
    ElMessage.error('保存表单失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

const resetForm = async () => {
  await generateOrderNumber()
  orderForm.title = ''
  orderForm.category = undefined
  orderForm.basis = undefined
  orderForm.urgencyLevel = undefined
  orderForm.deadline = ''
  orderForm.leadDept = ''
  orderForm.leadDeptId = 0
  orderForm.importance = undefined
  orderForm.collaborateDepts = []
  orderForm.collaborateDeptIds = []
  orderForm.supervisorName = ''
  orderForm.supervisorId = 0
  orderForm.officePhone = ''
  orderForm.leader = ''
  orderForm.content = ''
  orderForm.tasks = ''
  orderForm.inspectionApproval = undefined
  orderForm.handlingDetails = ''
  orderForm.supervisionReview = undefined

  // 保持督办人信息
  initUserInfo()
}

const handleNext = async () => {
  try {
    const valid = await orderFormRef.value?.validate().catch(() => false)
    if (!valid) return

    // 显示提示对话框
    ElMessageBox.confirm(
      '请选择需要添加到概述中的内容',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(() => {
      // 进入概述选择步骤
      currentStep.value = 2
    }).catch(() => {
      // 用户取消
    })
  } catch (error) {
    console.error('验证失败:', error)
  }
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消创建督办单吗？已填写的信息将丢失。', '确认取消', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '继续编辑'
    })
    router.push(getReturnPath())
  } catch {
    // 用户取消，继续编辑
  }
}

// 初始化督办类型
const initSupervisionType = () => {
  const orderType = getSupervisionOrderType()
  // 可以根据需要设置默认的分类值
  // 这里暂时不设置默认值，让用户自己选择

  // 确保已加载对应类型的督办分类列表
  loadSupervisionTypes()
}

// 初始化
onMounted(async () => {
  await generateOrderNumber()
  initUserInfo()
  await initData()
  initSupervisionType()
})
</script>

<style scoped>
.supervision-order-create {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.order-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 30px 0 20px 0;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.form-actions {
  border-top: 1px solid #ebeef5;
  padding-top: 30px;
  margin-top: 30px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-textarea__inner) {
  border-radius: 4px;
}

/* 确保标签不换行 */
:deep(.el-form-item__label) {
  white-space: nowrap;
}

/* 统一搜索容器样式 */
.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap; /* 不换行 */
}

.search-container .el-select,
.search-container .el-input,
.search-container .el-button {
  margin: 0;
  flex-shrink: 0; /* 防止元素被压缩 */
}



/* 已选择部门显示容器 */
.selected-depts-container {
  margin-top: -10px; /* 减少与上方的间距 */
  margin-bottom: 20px; /* 与督办人保持距离 */
  margin-left: 120px; /* 与协办单位标签对齐 */
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #fafafa;
  overflow: hidden;
}

.selected-depts-header {
  background-color: #f5f7fa;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  border-bottom: 1px solid #e4e7ed;
}

.selected-depts-box {
  padding: 12px;
  min-height: 60px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
  align-content: flex-start;
}

.dept-tag {
  margin: 0;
}

/* 概述选择对话框样式 */
.summary-dialog-content {
  padding: 10px 0;
}

.summary-tip {
  margin-bottom: 15px;
  font-size: 14px;
  color: #606266;
}

.summary-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.summary-option {
  margin: 0;
  padding: 5px 0;
}

.dialog-footer {
  text-align: right;
}

/* 概述选择页面样式 */
.summary-selection-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.summary-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.summary-form {
  position: relative;
}

.summary-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  width: 120px !important;
  text-align: left;
  display: flex;
  align-items: center;
  padding-left: 30px;
}

.summary-form :deep(.el-checkbox) {
  position: absolute;
  left: 0;
  margin: 0;
}

.summary-form :deep(.el-form-item) {
  margin-bottom: 18px;
  position: relative;
}

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



/* 概述内容样式 */
.summary-content {
  min-height: 100px;
}

.summary-item {
  margin-bottom: 8px;
  line-height: 1.6;
}

.summary-item strong {
  color: #303133;
  margin-right: 8px;
}

.no-summary {
  color: #909399;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}
</style>
