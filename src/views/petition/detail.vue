<template>
  <div class="petition-detail">
    <!-- 顶部信息 -->
    <div class="petition-header">
      <div class="visitor-info">
        <el-avatar :size="64" :src="visitorAvatar" class="visitor-avatar">
          {{ detailData.visitorName ? detailData.visitorName.substring(0, 1) : '访' }}
        </el-avatar>
        <div class="visitor-meta">
          <h2 class="visitor-name">{{ detailData.visitorName || '匿名访客' }}</h2>
          <div class="visitor-contact">
            <span v-if="detailData.visitorPhone">
              <i class="el-icon-phone"></i> {{ detailData.visitorPhone }}
            </span>
            <span v-if="detailData.visitorPhone && detailData.visitorEmail"> | </span>
            <span v-if="detailData.visitorEmail">
              <i class="el-icon-message"></i> {{ detailData.visitorEmail }}
            </span>
          </div>
        </div>
        <div class="action-buttons">
          <el-button type="primary" plain size="small" @click="handleVoiceCall">
            语音呼叫
          </el-button>
          <el-button type="info" plain size="small" @click="handleRelatedInfo">
            相关情况
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="petition-content">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="诉求信息" name="petition">
          <ContentWrap v-loading="loading">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="信访编号" :span="2">{{ detailData.petitionNo }}</el-descriptions-item>
              <el-descriptions-item label="信访标题" :span="2">{{ detailData.title }}</el-descriptions-item>
              <el-descriptions-item label="信访内容" :span="2">{{ detailData.content }}</el-descriptions-item>
              <el-descriptions-item label="来源类型">
                <dict-tag :type="DICT_TYPE.PETITION_SOURCE_TYPE" :value="detailData.sourceType" />
              </el-descriptions-item>
              <el-descriptions-item label="信访类型">
                <dict-tag :type="DICT_TYPE.PETITION_TYPE" :value="detailData.petitionType" />
              </el-descriptions-item>
              <el-descriptions-item label="内容分类">
                <dict-tag :type="DICT_TYPE.PETITION_CATEGORY_TYPE" :value="detailData.categoryType" />
              </el-descriptions-item>
              <el-descriptions-item label="紧急程度">
                <dict-tag :type="DICT_TYPE.PETITION_URGENCY_LEVEL" :value="detailData.urgencyLevel" />
              </el-descriptions-item>
              <el-descriptions-item label="是否全国性">
                {{ detailData.isNational ? '是' : '否' }}
              </el-descriptions-item>
              <el-descriptions-item label="是否涉法涉诉">
                {{ detailData.isIllegal ? '是' : '否' }}
              </el-descriptions-item>
              <el-descriptions-item label="是否匿名">
                {{ detailData.isAnonymous ? '是' : '否' }}
              </el-descriptions-item>
              <el-descriptions-item label="是否诬告">
                {{ detailData.isFake ? '是' : '否' }}
              </el-descriptions-item>
              <el-descriptions-item label="附件" :span="2">
                <div v-if="detailData.attachments && detailData.attachments.length > 0">
                  <el-link
                    v-for="(attachment, index) in detailData.attachments"
                    :key="index"
                    type="primary"
                    :underline="false"
                    @click="downloadAttachment(attachment)"
                    class="attachment-link"
                  >
                    <i class="el-icon-document"></i> {{ attachment }}
                  </el-link>
                </div>
                <span v-else>暂无附件</span>
              </el-descriptions-item>
              <el-descriptions-item label="处理状态">
                <dict-tag :type="DICT_TYPE.PETITION_STATUS" :value="detailData.status" />
              </el-descriptions-item>
              <el-descriptions-item label="满意度" v-if="detailData.satisfaction !== null">
                <dict-tag :type="DICT_TYPE.PETITION_SATISFACTION" :value="detailData.satisfaction" />
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ dateFormatter(null, detailData.createTime) }}</el-descriptions-item>
              <el-descriptions-item label="接收时间" v-if="detailData.receiveTime">
                {{ dateFormatter(null, detailData.receiveTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="截止时间" v-if="detailData.deadline">
                {{ dateFormatter(null, detailData.deadline) }}
              </el-descriptions-item>
              <el-descriptions-item label="完成时间" v-if="detailData.completeTime">
                {{ dateFormatter(null, detailData.completeTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="备注" :span="2" v-if="detailData.remark">
                {{ detailData.remark }}
              </el-descriptions-item>
            </el-descriptions>
          </ContentWrap>
        </el-tab-pane>
        
        <el-tab-pane label="概况信息" name="summary">
          <ContentWrap>
            <div class="summary-info">
              <div class="summary-item">
                <div class="summary-label">主要事实：</div>
                <div class="summary-content">{{ summaryData.mainFacts || '暂无数据' }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">主要诉求：</div>
                <div class="summary-content">{{ summaryData.mainRequests || '暂无数据' }}</div>
              </div>
            </div>
          </ContentWrap>
        </el-tab-pane>
        
        <el-tab-pane label="案号信息" name="caseInfo">
          <ContentWrap>
            <div class="case-info">
              <div class="case-item">
                <div class="case-label">附件：</div>
                <div class="case-content">
                  <div v-if="caseData.attachments && caseData.attachments.length > 0">
                    <div v-for="(attachment, index) in caseData.attachments" :key="index" class="attachment-item">
                      <el-link type="primary" :underline="false" @click="downloadAttachment(attachment.name)">
                        {{ attachment.name }}
                      </el-link>
                    </div>
                  </div>
                  <div v-else>暂无附件</div>
                </div>
              </div>
            </div>
          </ContentWrap>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 办理信息 -->
    <ContentWrap title="办理信息">
      <el-tabs type="border-card">
        <el-tab-pane label="办理信息">
          <el-table :data="handleList" style="width: 100%" border>
            <el-table-column label="经办单位" prop="deptName" align="center" min-width="150" />
            <el-table-column label="办理/流转方式" prop="handleType" align="center" min-width="120">
              <template #default="scope">
                <dict-tag :type="DICT_TYPE.PETITION_HANDLE_TYPE" :value="scope.row.handleType" />
              </template>
            </el-table-column>
            <el-table-column label="去向/回复" prop="deptName" align="center" min-width="150" />
            <el-table-column label="办理时间" prop="handleTime" align="center" min-width="180">
              <template #default="scope">
                {{ dateFormatter(null, scope.row.handleTime) }}
              </template>
            </el-table-column>
            <el-table-column label="办理结果" prop="handleResult" align="center" min-width="100">
              <template #default="scope">
                <dict-tag :type="DICT_TYPE.PETITION_HANDLE_RESULT" :value="scope.row.handleResult" />
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="200">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="viewHandleDetail(scope.row)">
                  查看
                </el-button>
                <el-button link type="primary" size="small" @click="printHandle(scope.row)">
                  打印
                </el-button>
                <el-button link type="primary" size="small" @click="signHandle(scope.row)">
                  签章
                </el-button>
                <el-button link type="danger" size="small" @click="rejectHandle(scope.row)">
                  驳回
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="受理办理流程">
          <el-steps :active="activeStep" finish-status="success" simple style="margin-top: 20px">
            <el-step title="分派" :description="getStepDescription(0)" />
            <el-step title="转送" :description="getStepDescription(1)" />
            <el-step title="转送" :description="getStepDescription(2)" />
            <el-step title="受理处理" :description="getStepDescription(3)" />
          </el-steps>
        </el-tab-pane>
        
        <el-tab-pane label="三级建议">
          <div class="no-data">暂无数据</div>
        </el-tab-pane>
        
        <el-tab-pane label="监督建议">
          <div class="no-data">暂无数据</div>
        </el-tab-pane>
        
        <el-tab-pane label="领导批示">
          <div class="no-data">暂无数据</div>
        </el-tab-pane>
        
        <el-tab-pane label="办理办结情况">
          <div class="no-data">暂无数据</div>
        </el-tab-pane>
        
        <el-tab-pane label="流程图解">
          <div class="process-diagram">
<!--            <img src="@/assets/images/petition/process-diagram.png" alt="流程图解" />-->
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="抄送">
          <div class="no-data">暂无数据</div>
        </el-tab-pane>
      </el-tabs>
    </ContentWrap>
  </div>
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as PetitionApi from '@/api/petition'
import { onMounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from '@/hooks/web/useMessage'

defineOptions({ name: 'PetitionDetail' })

const message = useMessage() // 消息弹窗
const route = useRoute() // 路由

const loading = ref(true) // 表单的加载中
const detailData = ref<PetitionApi.PetitionVO>({} as PetitionApi.PetitionVO) // 详情数据
const handleList = ref<PetitionApi.PetitionHandleVO[]>([]) // 处理记录列表
const activeTab = ref('petition') // 当前激活的标签页
const activeStep = ref(3) // 当前激活的步骤
const visitorAvatar = ref('') // 访客头像

// 概况信息
const summaryData = reactive({
  mainFacts: '反映学校食堂饭菜质量问题，希望学校能够重视并改进。',
  mainRequests: '希望学校能够提高食堂饭菜质量，增加菜品种类，保证食品安全。'
})

// 案号信息
const caseData = reactive({
  attachments: [
    { name: 'IMG_6725.png', url: '#' }
  ]
})

/** 获取步骤描述 */
const getStepDescription = (step: number) => {
  if (handleList.value.length <= step) {
    return ''
  }
  return `${handleList.value[step].deptName} ${dateFormatter(null, handleList.value[step].handleTime)}`
}

/** 语音呼叫 */
const handleVoiceCall = () => {
  message.success('正在发起语音呼叫...')
}

/** 查看相关情况 */
const handleRelatedInfo = () => {
  message.success('正在查询相关情况...')
}

/** 下载附件 */
const downloadAttachment = (fileName: string) => {
  message.success(`正在下载附件: ${fileName}`)
}

/** 查看处理详情 */
const viewHandleDetail = (row: PetitionApi.PetitionHandleVO) => {
  message.success(`查看处理详情: ${row.id}`)
}

/** 打印处理记录 */
const printHandle = (row: PetitionApi.PetitionHandleVO) => {
  message.success(`打印处理记录: ${row.id}`)
}

/** 签章 */
const signHandle = (row: PetitionApi.PetitionHandleVO) => {
  message.success(`签章: ${row.id}`)
}

/** 驳回 */
const rejectHandle = (row: PetitionApi.PetitionHandleVO) => {
  message.warning(`确定要驳回该处理记录吗?`)
}

/** 初始化 */
onMounted(async () => {
  try {
    // 获取详情
    const id = Number(route.params.id)
    if (!id) {
      message.error('参数错误')
      return
    }
    
    // 模拟API调用
    // detailData.value = await PetitionApi.getPetition(id)
    // handleList.value = await PetitionApi.getPetitionHandleList(id)
    
    // 使用Mock数据
    detailData.value = PetitionApi.mockPetitionList.find(item => item.id === id) || {} as PetitionApi.PetitionVO
    handleList.value = PetitionApi.mockPetitionHandleList
  } catch (error) {
    console.error('获取详情失败', error)
    message.error('获取详情失败')
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.petition-detail {
  padding: 10px;
  
  .petition-header {
    background-color: #fff;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .visitor-info {
      display: flex;
      align-items: center;
      
      .visitor-avatar {
        margin-right: 20px;
        background-color: #409EFF;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      
      .visitor-meta {
        flex: 1;
        
        .visitor-name {
          margin: 0 0 10px 0;
          font-size: 20px;
        }
        
        .visitor-contact {
          color: #606266;
          font-size: 14px;
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 10px;
      }
    }
  }
  
  .summary-info, .case-info {
    .summary-item, .case-item {
      margin-bottom: 15px;
      
      .summary-label, .case-label {
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .summary-content, .case-content {
        line-height: 1.5;
      }
    }
  }
  
  .attachment-link {
    margin-right: 15px;
    display: inline-block;
    margin-bottom: 5px;
  }
  
  .attachment-item {
    margin-bottom: 10px;
  }
  
  .no-data {
    text-align: center;
    color: #909399;
    padding: 30px 0;
  }
  
  .process-diagram {
    text-align: center;
    padding: 20px;
    
    img {
      max-width: 100%;
    }
  }
}
</style>
