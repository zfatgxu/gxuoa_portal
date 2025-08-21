<template>
  <div class="petition-page">
    <!-- 白色顶栏：当前位置 -->
    <div class="page-header">
      <div class="header-inner">
        <span class="location">当前位置：信访工作 >>书记校长信箱 </span>
      </div>
    </div>

    <!-- 标签 + 多筛选区（顶部标签字号28px） -->
    <div class="page-toolbar">
      <el-row :gutter="20">
        <!-- 状态标签 -->
        <el-col :span="8">
          <el-tabs v-model="activeName" class="custom-tabs" @tab-click="handleClick">
            <el-tab-pane label="待审核" name="pending"/>
            <el-tab-pane label="处理中" name="processing"/>
            <el-tab-pane label="已办结" name="completed"/>
          </el-tabs>
        </el-col>
        <!-- 搜索 + 三筛选 -->
        <el-col :span="16" class="flex justify-end items-center">
          <el-input
            v-model="searchKey"
            placeholder="输入搜索关键词"
            class="custom-input"
            clearable
            @keydown.enter="handleSearch"
          >
            <template #suffix>
              <el-icon @click="handleSearch" class="search-icon">
                <Search />
              </el-icon>
            </template>
          </el-input>

          <el-select
            v-model="priorityFilter"
            placeholder="全部优先级"
            class="custom-select"
            clearable
            style="margin: 0 10px;"
          >
            <el-option label="一般" value="1"/>
            <el-option label="紧急" value="2"/>
          </el-select>

          <el-select
            v-model="categoryFilter"
            placeholder="全部分类"
            class="custom-select"
            clearable
            style="margin: 0 10px;"
          >
            <el-option label="咨询求助" value="咨询求助"/>
            <el-option label="申诉投诉" value="申诉投诉"/>
            <el-option label="建议赞扬" value="建议赞扬"/>
            <el-option label="感恩表扬" value="感恩表扬"/>
          </el-select>

          <el-select
            v-model="personTypeFilter"
            placeholder="全部信访人类型"
            class="custom-select"
            clearable
          >
            <el-option label="学生" value="学生"/>
            <el-option label="教职工" value="教职工"/>
            <el-option label="社会人员" value="社会人员"/>
            <el-option label="未知" value="未知"/>
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格（自适应布局 + 禁止横向滚动） -->
    <el-table
      :data="tableData"
      border
      stripe
      :row-style="{ height: '68px' }"
      style="width: 100%;"
      :loading="loading"
      empty-text="暂无数据"
    >
      <el-table-column label="序号" type="index" width="60" align="center" :resizable="false"/>
      <el-table-column label="编号" prop="serialNo" width="100" align="center" :resizable="false"/>

      <!-- 优先级标签（恢复一般状态样式） -->
      <el-table-column label="优先级" width="100" align="center" :resizable="false">
        <template #default="scope">
          <span
            class="priority-tag"
            :class="{
              'priority-urgent': scope.row.priority === 2,
              'priority-normal': scope.row.priority === 1
            }"
          >{{ scope.row.priority === 2 ? '紧急' : '一般' }}</span>
        </template>
      </el-table-column>

      <!-- 分类标签修复：椭圆边框 + 文字完整显示 -->
      <el-table-column label="分类" width="120" align="center" :resizable="false">
        <template #default="scope">
          <span class="category-tag">{{ scope.row.category }}</span>
        </template>
      </el-table-column>

      <!-- 信访内容（自适应收缩 + 文本截断） -->
      <el-table-column label="信访内容" prop="title" min-width="160" align="center" :resizable="false">
        <template #default="scope">
          <div class="ellipsis" :title="scope.row.title">{{ scope.row.title }}</div>
        </template>
      </el-table-column>

      <!-- 信访人（纯文本显示） -->
      <el-table-column label="信访人" prop="petitioner" width="100" align="center" :resizable="false"/>

      <!-- 信访人类型（纯文本显示） -->
      <el-table-column label="信访人类型" width="100" align="center" :resizable="false">
        <template #default="scope">
          <span>{{ scope.row.personType }}</span>
        </template>
      </el-table-column>

      <!-- 当前状态标签（自定义样式+文字居中） -->
      <el-table-column label="当前状态" width="100" align="center" :resizable="false">
        <template #default="scope">
          <span
            class="status-tag"
            :class="{
              'status-pending': scope.row.status === 1,
              'status-processing': scope.row.status === 2,
              'status-completed': scope.row.status === 3
            }"
          >{{ scope.row.status === 1 ? '待审核' : scope.row.status === 2 ? '处理中' : '已办结' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="接收日期" width="160" align="center" :resizable="false">
        <template #default="scope">
          {{ formatTime(scope.row.receiveTime) }}
        </template>
      </el-table-column>
      <el-table-column label="上一操作人" prop="lastOperator" width="100" align="center" :resizable="false"/>
      <el-table-column label="操作" width="100" align="center" :resizable="false">
        <template #default="scope">
          <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-wrap flex justify-between items-center">
      <div class="pagination-left flex items-center">
        <span class="record-info">共{{ total }}条记录 第{{ page }}/{{ maxPage }}页</span>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          :current-page="page"
          :page-sizes="[10, 20, 50]"
          :page-size="pageSize"
          layout="prev, pager, next, sizes"
          :total="total"
          class="custom-pagination"
        />
      </div>
      <div class="pagination-actions flex items-center">
        <span class="mr-2">跳至</span>
        <el-input
          v-model.number="jumpPage"
          type="number"
          min="1"
          :max="maxPage"
          style="width: 80px; margin-right: 8px;"
          clearable
        />
        <el-button type="primary" @click="handleConfirm">确定</el-button>
        <el-button type="primary" style="margin-left: 8px;" @click="handleFirstPage">回到第一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import type { TabsPaneContext } from 'element-plus'
import {
  ElTabs, ElTabPane, ElTable, ElTableColumn,
  ElInput, ElSelect, ElOption, ElButton,
  ElIcon, ElMessageBox
} from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 数据类型定义
interface PetitionItem {
  id: number;
  serialNo: string;
  priority: 1 | 2;          // 1=一般，2=紧急
  title: string;
  content: string;
  source: string;
  status: 1 | 2 | 3;       // 1=待审核，2=处理中，3=已办结
  receiveTime: string;
  lastOperator: string;
  category: string;        // 分类：咨询求助/申诉投诉等
  petitioner: string;      // 信访人
  personType: string;      // 信访人类型：学生/教职工等
}

// 模拟数据
const MOCK_DATA: PetitionItem[] = Array.from({ length: 140 }).map((_, i) => ({
  id: i + 1,
  serialNo: `serial_${i + 1}`,
  priority: i % 3 === 0 ? 2 : 1,
  title: '噶贝格',
  content: 'dcajhvlkawvzfdsbdfffahhfrtshrl...',
  source: '教育厅',
  status: i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3,
  receiveTime: '2023-02-13 19:02:00',
  lastOperator: '寅二',
  category: ['咨询求助', '申诉投诉', '建议赞扬', '感恩表扬'][i % 4],
  petitioner: ['黄三三', '王六六', '匿名'][i % 3],
  personType: ['学生', '教职工', '社会人员', '未知'][i % 4],
}));

// 响应式数据
const activeName = ref<string>('pending');
const searchKey = ref<string>('');
const priorityFilter = ref<string>('');
const categoryFilter = ref<string>('');
const personTypeFilter = ref<string>('');
const tableData = ref<PetitionItem[]>([]);
const page = ref<number>(1);
const pageSize = ref<number>(10);
const total = ref<number>(0);
const loading = ref<boolean>(false);
const jumpPage = ref<number>(1);

// 计算属性：最大页码
const maxPage = computed(() =>
  total.value === 0 ? 1 : Math.ceil(total.value / pageSize.value)
);

// 时间格式化
const formatTime = (time: string): string =>
  dayjs(time).format('YYYY-MM-DD HH:mm:ss');

// 数据获取（多条件筛选 + 分页）
const fetchData = async (): Promise<void> => {
  loading.value = true;
  try {
    const statusMap: Record<string, 1 | 2 | 3> = {
      pending: 1,
      processing: 2,
      completed: 3
    };
    const targetStatus = statusMap[activeName.value];

    const filtered = MOCK_DATA.filter(item => {
      if (item.status !== targetStatus) return false;
      if (searchKey.value && !item.title.includes(searchKey.value)) return false;
      if (priorityFilter.value && item.priority !== Number(priorityFilter.value)) return false;
      if (categoryFilter.value && item.category !== categoryFilter.value) return false;
      if (personTypeFilter.value && item.personType !== personTypeFilter.value) return false;
      return true;
    });

    const start = (page.value - 1) * pageSize.value;
    tableData.value = filtered.slice(start, start + pageSize.value);
    total.value = filtered.length;
  } catch (error) {
    console.error('数据获取失败：', error);
  } finally {
    loading.value = false;
  }
};

// 事件处理
const handleClick = (tab: TabsPaneContext, event: Event): void => {
  page.value = 1;
  jumpPage.value = 1;
  fetchData();
};

const handleSearch = (): void => {
  page.value = 1;
  jumpPage.value = 1;
  fetchData();
};

const handlePageChange = (val: number): void => {
  page.value = val;
  jumpPage.value = val;
  fetchData();
};

const handleSizeChange = (val: number): void => {
  pageSize.value = val;
  page.value = 1;
  jumpPage.value = 1;
  fetchData();
};

const handleDetail = (row: PetitionItem): void =>
  console.log('查看详情：', row);

const handleConfirm = (): void => {
  if (jumpPage.value && jumpPage.value >= 1 && jumpPage.value <= maxPage.value) {
    page.value = jumpPage.value;
    fetchData();
  } else {
    ElMessageBox.warning(`页码无效，请输入1~${maxPage.value}之间的数字`);
  }
};

const handleFirstPage = (): void => {
  page.value = 1;
  jumpPage.value = 1;
  fetchData();
};

onMounted(() => fetchData());
</script>

<style scoped lang="scss">
// 主题色配置
$primary-color: #2f86eb;
$table-row-hover: #f8f9fc;
$striped-color: #f5f7fa;
$border-color: #e6e6e6;

.petition-page {
  background: #fff;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  overflow-x: hidden; /* 禁止横向滚动 */
}

// 顶部导航
.page-header {
  padding: 12px 20px;
  border-bottom: 1px solid $border-color;
  .header-inner .location {
    font-size: 14px;
    color: #333;
  }
}

// 标签栏
.page-toolbar {
  padding: 10px 20px;
  background: $striped-color;
  border: 1px solid $border-color;
  border-top: none;

  .custom-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
      .el-tabs__item {
        color: #333;
        font-size: 28px;
        padding: 8px 20px;
        &.is-active {
          color: $primary-color;
          border-bottom: 2px solid $primary-color;
          &::before { content: none; }
        }
      }
    }
  }

  .custom-input {
    width: 200px; /* 紧凑化宽度 */
    margin-right: 10px;
    :deep(.el-input__wrapper) {
      border-radius: 4px;
      border: 1px solid #ccc;
      &:hover { border-color: $primary-color; }
    }
  }
  :deep(.search-icon) {
    cursor: pointer;
    color: #666;
    &:hover { color: $primary-color; }
  }
  .custom-select {
    width: 120px; /* 紧凑化宽度 */
    margin: 0 10px;
    :deep(.el-select__wrapper) {
      border-radius: 4px;
      border: 1px solid #ccc;
      &:hover { border-color: $primary-color; }
    }
  }
}

// 表格核心样式（自适应布局 + 禁止列调整）
:deep(.el-table) {
  border: 1px solid $border-color;
  border-top: none;
  table-layout: fixed; /* 固定布局，配合min-width实现自适应收缩 */
  width: 100%;        /* 跟随父容器宽度 */
  min-width: 1000px;  /* 保证基础可读性，避免过度收缩 */

  // 禁止列宽调整
  .el-table__header-wrapper .el-table__cell {
    resize: none !important;
  }

  // 移除竖线
  .el-table__cell {
    border-right: none !important;
  }

  .el-table__header-wrapper { background: $striped-color; }
  .el-table__row {
    height: 68px;
    &:hover { background: $table-row-hover; }
  }
  &.el-table--striped .el-table__body tr.el-table__row--striped td {
    background: $striped-color;
  }

  // 优先级标签（修改一般状态为黄色背景）
  .priority-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 69px;
    height: 31px;
    border-radius: 50px;
    font-size: 14px;
    font-family: PingFangSC-regular;

    &.priority-urgent {
      background-color: rgba(255, 116, 116, 1);
      color: rgba(255, 233, 233, 1);
    }
    &.priority-normal {
      background-color: #FFD700; /* 黄色背景 */
      color: rgba(255, 255, 255, 1); /* 白色文字 */
    }
  }

  // 分类标签终极修复：
  .category-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 91px;
    height: 31px;
    border-radius: 50px;
    font-size: 14px;
    font-family: PingFangSC-regular;
    border: 1px solid rgba(108, 108, 108, 1);
    background-color: rgba(255, 255, 255, 1);
    color: rgba(16, 16, 16, 1);
  }

  // 当前状态标签（文字居中）
  .status-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 81px;
    height: 26px;
    border-radius: 11px;
    font-size: 14px;
    font-family: PingFangSC-regular;

    &.status-pending {
      background-color: rgba(252, 213, 162, 1);
      color: rgba(155, 125, 49, 1);
    }
    &.status-processing {
      background-color: rgba(165, 214, 167, 1);
      color: rgba(52, 101, 54, 1);
    }
    &.status-completed {
      background-color: rgba(129, 199, 212, 1);
      color: rgba(29, 97, 111, 1);
    }
  }
}

// 文本截断样式
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 5px;
  box-sizing: border-box;
}

// 分页样式
.pagination-wrap {
  padding: 10px 20px;
  background: $striped-color;
  border: 1px solid $border-color;
  border-top: none;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .pagination-left {
    display: flex;
    align-items: center;
    .record-info {
      color: #999;
      font-size: 14px;
      margin-right: 20px;
    }
    :deep(.el-pagination) {
      .el-pagination__button {
        border: 1px solid #ccc;
        background: #fff;
        &:hover { border-color: $primary-color; color: $primary-color; }
        &.is-active {
          background: $primary-color;
          border-color: $primary-color;
          color: #fff;
        }
      }
    }
  }

  .pagination-actions {
    display: flex;
    align-items: center;
    .el-input {
      :deep(.el-input__wrapper) {
        width: 80px;
        padding-left: 6px;
        padding-right: 6px;
        border-radius: 4px;
        border: 1px solid #ccc;
        &:hover { border-color: $primary-color; }
      }
    }
    .el-button {
      padding: 6px 12px;
      &:hover { opacity: 0.9; }
    }
  }
}

// 工具类
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.mr-2 { margin-right: 8px; }
</style>
