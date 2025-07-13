<template>
  <ContentWrap>
    <div class="supervision-order-create">
      <!-- 步骤1：督办单表单 -->
      <div v-if="currentStep === 1">
        <!-- 页面标题 -->
        <div class="page-header mb-6 text-center">
          <h2 class="text-2xl font-bold text-red-600">广西大学工作督办单</h2>
        </div>

        <!-- 督办单表单 -->
      <el-form :model="orderForm" :rules="rules" ref="orderFormRef" label-width="120px" class="order-form">
        <!-- 第一行：督办编号放右边 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 空白占位 -->
          </el-col>
          <el-col :span="12">
            <el-form-item label="督办编号：" prop="orderNumber">
              <el-input v-model="orderForm.orderNumber" placeholder="请输入编号" />
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
              <el-select v-model="orderForm.category" placeholder="上级部门文件办理" style="width: 100%">
                <el-option label="上级部门文件办理" value="上级部门文件办理" />
                <el-option label="学校重要工作" value="学校重要工作" />
                <el-option label="领导批示事项" value="领导批示事项" />
                <el-option label="其他事项" value="其他事项" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="督办依据：" prop="basis">
              <el-select v-model="orderForm.basis" placeholder="请选择督办依据" style="width: 100%">
                <el-option label="上级文件要求" value="上级文件要求" />
                <el-option label="学校工作安排" value="学校工作安排" />
                <el-option label="领导指示" value="领导指示" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行：紧急程度、要求完成时间 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急程度：" prop="urgencyLevel">
              <el-select v-model="orderForm.urgencyLevel" placeholder="一般" style="width: 100%">
                <el-option label="一般" :value="1" />
                <el-option label="紧急" :value="2" />
                <el-option label="特急" :value="3" />
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
              <el-select v-model="orderForm.leadDept" placeholder="牵头部门" style="width: 100%">
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
            <el-form-item label="重要程度：" prop="importance">
              <el-select v-model="orderForm.importance" placeholder="一般" style="width: 100%">
                <el-option label="一般" value="一般" />
                <el-option label="重要" value="重要" />
                <el-option label="特别重要" value="特别重要" />
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
              >
                <el-option
                  v-for="dept in filteredCollaborateDepts"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.name"
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
                >
                  <el-option
                    v-for="user in filteredUserList"
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
              <el-select v-model="orderForm.inspectionApproval" placeholder="同意办结" style="width: 200px">
                <el-option label="同意办结" value="同意办结" />
                <el-option label="补充办理" value="补充办理" />
                <el-option label="不同意办结" value="不同意办结" />
                <el-option label="需要整改" value="需要整改" />
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
              <el-select v-model="orderForm.supervisionReview" placeholder="同意办结" style="width: 200px">
                <el-option label="同意办结" value="同意办结" />
                <el-option label="继续督办" value="继续督办" />
                <el-option label="需要整改" value="需要整改" />
                <el-option label="暂缓办理" value="暂缓办理" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <div class="form-actions mt-8 text-center">
          <el-button type="primary" @click="submitOrder" size="large" :loading="submitLoading">
            保存
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
          <h2 class="text-2xl font-bold text-red-600">广西大学工作督办单</h2>
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
                <el-input v-model="orderForm.category" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <el-checkbox v-model="summaryFields.find(f => f.key === 'basis')!.checked">
                    督办依据：
                  </el-checkbox>
                </template>
                <el-input v-model="orderForm.basis" readonly />
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
          <h2 class="text-2xl font-bold text-red-600">广西大学工作督办单</h2>
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
                  <el-option label="上级部门文件办理" value="上级部门文件办理" />
                  <el-option label="学校重要工作" value="学校重要工作" />
                  <el-option label="领导批示事项" value="领导批示事项" />
                  <el-option label="其他事项" value="其他事项" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="督办依据：">
                <el-select v-model="orderForm.basis" disabled style="width: 100%">
                  <el-option label="上级文件要求" value="上级文件要求" />
                  <el-option label="学校工作安排" value="学校工作安排" />
                  <el-option label="领导指示" value="领导指示" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第四行：紧急程度、要求完成时间 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="紧急程度：">
                <el-select v-model="orderForm.urgencyLevel" disabled style="width: 100%">
                  <el-option label="一般" :value="1" />
                  <el-option label="紧急" :value="2" />
                  <el-option label="特急" :value="3" />
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
                  <el-option label="一般" value="一般" />
                  <el-option label="重要" value="重要" />
                  <el-option label="特别重要" value="特别重要" />
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
                  <el-option label="同意办结" value="同意办结" />
                  <el-option label="补充办理" value="补充办理" />
                  <el-option label="不同意办结" value="不同意办结" />
                  <el-option label="需要整改" value="需要整改" />
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
                  <el-option label="同意办结" value="同意办结" />
                  <el-option label="继续督办" value="继续督办" />
                  <el-option label="需要整改" value="需要整改" />
                  <el-option label="暂缓办理" value="暂缓办理" />
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
            <el-button type="primary" @click="completeOrder" size="large">完成</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { Icon } from '@/components/Icon'

defineOptions({ name: 'SupervisionOrderCreate' })

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const submitLoading = ref(false)
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
  orderNumber: '',
  title: '',
  category: '',
  basis: '',
  urgencyLevel: 1,
  deadline: '',
  leadDept: '', // 牵头单位
  importance: '一般',
  collaborateDepts: [], // 协办单位改为数组
  supervisorName: '',
  officePhone: '',
  leader: '',
  content: '',
  tasks: '',
  inspectionApproval: '同意办结', // 督察办审批
  handlingDetails: '',
  supervisionReview: '同意办结' // 督查督办复核
})

// 表单验证规则
const rules = {
  orderNumber: [
    { required: true, message: '请输入督办编号', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入文件标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择督办分类', trigger: 'change' }
  ],
  urgencyLevel: [
    { required: true, message: '请选择紧急程度', trigger: 'change' }
  ],
  deadline: [
    { required: true, message: '请选择完成时间', trigger: 'change' }
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
  ]
}

// 方法
const generateOrderNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `DB${year}${month}${day}${random}`
}

const loadDeptList = async () => {
  try {
    deptList.value = await DeptApi.getSimpleDeptList()
  } catch (error) {
    console.error('加载部门列表失败:', error)
    ElMessage.error('加载部门列表失败')
  }
}

const loadUserList = async () => {
  try {
    userList.value = await UserApi.getSimpleUserList()
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  }
}

const initUserInfo = () => {
  const user = userStore.getUser
  if (user) {
    orderForm.supervisorName = user.nickname || user.username
  }
}

// 搜索功能通过 remote-method 实现精确过滤
// 用户在下拉框中输入时，会调用 searchDepts 或 searchUsers 方法
// 这些方法会更新搜索关键词，计算属性会自动过滤选项

const removeDept = (deptName: string) => {
  const index = orderForm.collaborateDepts.indexOf(deptName)
  if (index > -1) {
    orderForm.collaborateDepts.splice(index, 1)
  }
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

const completeOrder = () => {
  ElMessage.success('督办单创建完成')
  // 这里可以保存督办单或跳转到其他页面
}

// 获取字段显示值
const getFieldDisplayValue = (key: string) => {
  const value = orderForm[key as keyof typeof orderForm]
  if (!value) return ''

  switch (key) {
    case 'urgencyLevel':
      const urgencyMap = { 1: '一般', 2: '紧急', 3: '特急' }
      return urgencyMap[value as keyof typeof urgencyMap] || ''
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
  if (!value) return '无'

  switch (key) {
    case 'urgencyLevel':
      const urgencyMap = { 1: '一般', 2: '紧急', 3: '特急' }
      return urgencyMap[value as keyof typeof urgencyMap] || '无'
    case 'collaborateDepts':
      return Array.isArray(value) && value.length > 0 ? value.join('、') : '无'
    default:
      return String(value)
  }
}

const submitOrder = async () => {
  try {
    const valid = await orderFormRef.value?.validate().catch(() => false)
    if (!valid) return

    submitLoading.value = true

    // 准备提交数据
    const submitData = {
      ...orderForm,
      supervisorId: userStore.getUser?.id,
      createTime: new Date().toISOString()
    }

    console.log('提交督办单数据:', submitData)

    // 这里调用API保存督办单
    // await SupervisionOrderApi.createOrder(submitData)

    ElMessage.success('督办单保存成功')

    // 询问是否继续创建或返回列表
    try {
      await ElMessageBox.confirm('督办单已保存成功，是否继续创建新的督办单？', '操作成功', {
        confirmButtonText: '继续创建',
        cancelButtonText: '返回列表',
        type: 'success'
      })

      // 重置表单继续创建
      resetForm()
    } catch {
      // 返回列表页
      router.push('/supervision/initiate')
    }
  } catch (error) {
    console.error('保存督办单失败:', error)
    ElMessage.error('保存督办单失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  orderForm.orderNumber = generateOrderNumber()
  orderForm.title = ''
  orderForm.category = ''
  orderForm.basis = ''
  orderForm.urgencyLevel = 1
  orderForm.deadline = ''
  orderForm.leadDept = ''
  orderForm.importance = '一般'
  orderForm.collaborateDepts = []
  orderForm.officePhone = ''
  orderForm.leader = ''
  orderForm.content = ''
  orderForm.tasks = ''
  orderForm.inspectionApproval = '同意办结'
  orderForm.handlingDetails = ''
  orderForm.supervisionReview = '同意办结'

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
    router.push('/supervision/initiate')
  } catch {
    // 用户取消，继续编辑
  }
}

// 初始化
onMounted(() => {
  orderForm.orderNumber = generateOrderNumber()
  initUserInfo()
  loadDeptList()
  loadUserList()
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
