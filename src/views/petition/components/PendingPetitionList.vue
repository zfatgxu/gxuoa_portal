<template>
  <div class="pending-petition-list">
    <div class="module-header">
      <div class="title-tabs">
        <div
          v-for="(tab, index) in tabs"
          :key="index"
          :class="['tab-item', { active: activeTabIndex === index }]"
          @click="handleTabClick(index)"
        >
          {{ tab.name }}
          <span v-if="tab.count > 0" class="count-badge">{{ tab.count }}</span>
        </div>
      </div>
      <div class="actions">
        <span class="more-link">更多 ></span>
      </div>
    </div>

    <el-table
      :data="petitionList"
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      :row-style="{ cursor: 'pointer' }"
      @row-click="handleRowClick"
      v-loading="loading"
    >
      <el-table-column prop="id" label="序号" width="60" align="center" />
      <el-table-column prop="receiptNo" label="受理编号" min-width="120" align="center" />
      <el-table-column prop="visitorName" label="信访人" min-width="100" align="center" />
      <el-table-column prop="title" label="标题" min-width="220" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="deptName" label="处理单位" min-width="120" align="center" />
      <el-table-column prop="createTime" label="到达日期" min-width="120" align="center" />
      <el-table-column label="处理状态" min-width="100" align="center">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.PETITION_PROCESS_STATUS" :value="scope.row.processStatus" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { InfoApi } from '@/api/petition/info'
import { DICT_TYPE } from '@/utils/dict'
import { formatToDateTime } from '@/utils/dateUtil'

defineOptions({ name: 'PendingPetitionList' })

const router = useRouter()
const loading = ref(false)

// 标签页配置 - 处理状态(1:待审核 2：已审核 3:信访办驳回 4:领导已批阅 5：领导打回）
const tabs = [
  { name: '待审核', count: 0, processStatus: '1' },
  { name: '已审核', count: 0, processStatus: '2' },
  { name: '信访办驳回', count: 0, processStatus: '3' },
  { name: '领导已批阅', count: 0, processStatus: '4' },
  { name: '领导打回', count: 0, processStatus: '5' }
]

const activeTabIndex = ref(0)

// 定义信访数据类型
interface PetitionItem {
  id: number
  petitionId: number
  receiptNo: string
  visitorName: string
  title: string
  deptName: string
  createTime: string
  processStatus: string
}

// 信访列表数据
const petitionList = ref<PetitionItem[]>([])

// 根据处理状态获取信访列表数据
const fetchPetitionList = async () => {
  loading.value = true
  try {
    // 获取当前选中标签对应的处理状态
    const currentTab = tabs[activeTabIndex.value]
    const processStatus = currentTab.processStatus
    
    // 调用根据处理状态查询的接口
    const res = await InfoApi.getInfoPageByProcessStatus(processStatus, {
      pageNo: 1,
      pageSize: 10 // 获取多一点数据，然后在前端进行排序和限制
    })
    console.log(`处理状态[${processStatus}]的API响应数据:`, res)

    // 判断是否有数据列表
    let dataList = res?.list || [];
    
    // 按创建时间降序排序，确保最新的数据在前面
    dataList.sort((a, b) => {
      const timeA = a.createTime ? new Date(a.createTime).getTime() : 0;
      const timeB = b.createTime ? new Date(b.createTime).getTime() : 0;
      return timeB - timeA; // 降序排列
    });
    
    // 只取前5条数据
    dataList = dataList.slice(0, 5);
    
    if (dataList.length > 0) {
      // 将后端返回的数据转换为前端需要的格式
      petitionList.value = dataList.map((item, index) => {
        // 使用工具函数处理时间格式
        const formattedTime = item.createTime ? formatToDateTime(item.createTime) : ''

        // 直接使用后端返回的处理状态
        const processStatus = item.processStatus || ''

        return {
          id: index + 1, // 前端自增的序号
          petitionId: item.id, // 后端返回的信访ID
          receiptNo: item.receiptNo || '',
          visitorName: item.visitorName || '',
          title: item.title || '',
          deptName: item.deptName || '',
          createTime: formattedTime,
          processStatus: processStatus // 添加处理状态字段
        }
      })

      // 更新标签页数量
      currentTab.count = res?.total || dataList.length
    } else {
      petitionList.value = []
      currentTab.count = 0
    }
  } catch (error) {
    console.error('获取信访列表失败:', error)
    petitionList.value = []
  } finally {
    loading.value = false
  }
}

// 处理标签点击事件
const handleTabClick = (index) => {
  activeTabIndex.value = index
  fetchPetitionList()
}

// 监听标签变化
watch(() => activeTabIndex.value, () => {
  fetchPetitionList()
})

// 组件挂载时获取数据
onMounted(async () => {
  // 先获取所有标签页的数据数量
  await fetchTabCounts()
  // 再获取当前选中标签的数据
  fetchPetitionList()
})

// 获取所有标签页的数据数量
const fetchTabCounts = async () => {
  try {
    // 并行获取所有标签页的数据数量
    const promises = tabs.map(tab => 
      InfoApi.getInfoPageByProcessStatus(tab.processStatus, {
        pageNo: 1,
        pageSize: 1
      }).then(res => {
        // 直接更新标签的计数
        tab.count = res?.total || 0
        return res
      }).catch(() => {
        // 如果某个标签请求失败，设置为0并继续
        tab.count = 0
        return null
      })
    )
    
    // 等待所有请求完成
    await Promise.all(promises)
  } catch (error) {
    console.error('获取标签页数据数量失败:', error)
  }
}

// 处理行点击事件
const handleRowClick = (row) => {
  console.log('点击了行:', row)
  // 跳转到详情页
  router.push({
    path: `/petition/petitioner/index`,
    query: {
      petitionId: row.petitionId
    }
  })
}
</script>

<style lang="scss" scoped>
.pending-petition-list {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #e6e6e6;

    .title-tabs {
      display: flex;

      .tab-item {
        padding: 8px 15px;
        cursor: pointer;
        font-size: 14px;
        color: #606266;
        margin-right: 10px;
        position: relative;

        &.active {
          color: #409EFF;
          font-weight: bold;

          &:after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: #409EFF;
          }
        }

        .count-badge {
          display: inline-block;
          padding: 0 5px;
          font-size: 12px;
          background-color: #f56c6c;
          color: #fff;
          border-radius: 10px;
          margin-left: 5px;
        }
      }
    }

    .actions {
      .module-title {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }
}
</style>
