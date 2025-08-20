<template>
  <div>
    <!-- 查询条件 -->
    <div class="filter-container">
      <div class="filter-item">
        <span class="label-text">审核状态：</span>
        <el-select v-model="queryParams.status" placeholder="全部" clearable @change="handleStatusChange" style="width: 120px;">
          <el-option label="全部" :value="null" />
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已拒绝" :value="2" />
        </el-select>
      </div>
    </div>
    
    <!-- 表格展示 -->
    <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe border>
      <el-table-column header-class-name="head-color" prop="serialNumber" label="序号" width="60" align="center" />
      <el-table-column header-class-name="head-color" prop="subject" label="主题" align="center" show-overflow-tooltip />
      <el-table-column header-class-name="head-color" prop="statusText" label="状态" width="100" align="center">
        <template #default="{row}">
          <el-tag :type="getStatusType(row.status)" effect="plain">
            {{ row.statusText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column header-class-name="head-color" prop="meetingRoom" label="会议室" align="center" show-overflow-tooltip />
      <el-table-column header-class-name="head-color" prop="applicantUnit" label="申请单位" align="center" show-overflow-tooltip />
      <el-table-column header-class-name="head-color" prop="applicant" label="申请人" align="center" width="100" />
      <el-table-column header-class-name="head-color" prop="startTime" label="开始时间" width="160" align="center" />
      <el-table-column header-class-name="head-color" prop="endTime" label="结束时间" width="160" align="center" />
      <el-table-column header-class-name="head-color" label="操作" width="180" align="center" fixed="right">
        <template #default="{row}">
          <el-button type="primary" size="small" @click="viewDetail(row)">查看</el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="deleteApply(row)"
            :disabled="row.status === 1 || row.status === 2"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.pageNo"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { RoomApplyApi } from '@/api/meetingroom/roomapply';
import { formatDate } from '@/utils/formatTime';
import { useRouter } from 'vue-router';

// 初始化路由
const router = useRouter();

// 格式化时间戳为日期字符串
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';
  return formatDate(new Date(timestamp), 'YYYY-MM-DD HH:mm:ss');
};

// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  status: null, // 可以根据状态过滤：0-待审核 1-已通过 2-已拒绝
  my: 1
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(false);

// 获取申请列表
const getApplyList = async () => {
  try {
    loading.value = true;
    const res = await RoomApplyApi.getRoomApplyPage(queryParams);
    
    if (res && res.list) {
      tableData.value = res.list.map((item, index) => {
        return {
          serialNumber: (queryParams.pageNo - 1) * queryParams.pageSize + index + 1,
          id: item.id,
          subject: item.activityTheme,
          isApproved: item.status === 1, // 1表示已通过
          status: item.status,
          statusText: getStatusText(item.status),
          meetingRoom: item.conferenceRoom,
          manager: item.adminPerson || '-',
          capacity: item.participantsCount || '-',
          applicantUnit: item.department,
          applicant: item.applicant,
          phone: item.phone,
          setupTime: formatTimestamp(item.setupTime),
          startTime: formatTimestamp(item.startTime),
          endTime: formatTimestamp(item.endTime),
          applicationTime: formatTimestamp(item.createTime),
          banner: item.banner,
          remark: item.remark,
          participants: item.participants,
          purpose: item.purpose,
          precautions: item.precautions,
          departmentOpinion: item.departmentOpinion,
          departmentHead: item.departmentHead,
          adminOpinion: item.adminOpinion
        };
      });
      total.value = res.total || 0;
    } else {
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取申请列表失败:', error);
    ElMessage.error('获取申请列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '已拒绝';
    case -1: return '草稿';
    default: return '未知';
  }
};

// 获取状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'warning';   // 待审核 - 黄色警告
    case 1: return 'success';   // 已通过 - 绿色成功
    case 2: return 'danger';    // 已拒绝 - 红色危险
    case -1: return 'info';     // 草稿 - 灰色信息
    default: return 'info';     // 默认 - 灰色信息
  }
};

// 页面加载时获取数据
onMounted(() => {
  getApplyList();
});

// 分页变化
const handlePageChange = (page) => {
  queryParams.pageNo = page;
  getApplyList();
};

// 每页条数变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size;
  queryParams.pageNo = 1;
  getApplyList();
};

// 状态过滤变化
const handleStatusChange = (status) => {
  queryParams.status = status;
  queryParams.pageNo = 1;
  getApplyList();
};

// 查看详情
const viewDetail = (row) => {
  try {
    // 跳转到详情页面，传递ID参数
    router.push({
      path: '/meetingroom/apply',
      query: { id: row.id }
    });
  } catch (error) {
    console.error('跳转失败:', error);
    ElMessage.error('查看详情失败，请重试');
  }
};

// 根据开始和结束时间判断时间段
const getTimeSlot = (startTime, endTime) => {
  if (!startTime || !endTime) return 'morning';
  
  const startHour = parseInt(startTime.split(' ')[1].split(':')[0], 10);
  
  if (startHour >= 0 && startHour < 12) {
    return 'morning';
  } else if (startHour >= 12 && startHour < 18) {
    return 'afternoon';
  } else {
    return 'evening';
  }
};

// 删除申请
const deleteApply = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const res = await RoomApplyApi.deleteRoomApply(row.id);
    if (res) {
      ElMessage.success('删除成功');
      getApplyList();
    } else {
      ElMessage.error('删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除申请失败:', error);
      ElMessage.error('删除失败');
    }
  }
};


</script>

<style scoped>
.el-table {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.head-color {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}

.filter-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.label-text {
  margin-right: 8px;
  font-weight: 500;
  color: #606266;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

/* 表格行悬停效果 */
.el-table :deep(tbody tr:hover) {
  background-color: #f0f9ff !important;
}

/* 表格奇数行背景色 */
.el-table :deep(tbody tr:nth-child(odd)) {
  background-color: #fafafa;
}

/* 表格偶数行背景色 */
.el-table :deep(tbody tr:nth-child(even)) {
  background-color: #ffffff;
}
</style>
