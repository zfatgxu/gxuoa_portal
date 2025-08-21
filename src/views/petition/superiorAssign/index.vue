<template>
  <div class="petition-page">
    <!-- 位置导航 -->
    <div class="page-header">
      <span class="location">当前位置：信访工作 >> 上级部门转办交办</span>
    </div>

    <!-- 标签 + 搜索区 -->
    <div class="page-toolbar">
      <el-row :gutter="20">
        <!-- 状态标签 -->
        <el-col :span="8">
          <el-tabs v-model="activeName" class="custom-tabs" @tab-click="handleClick">
            <el-tab-pane label="待审核" name="pending" />
            <el-tab-pane label="处理中" name="processing" />
            <el-tab-pane label="已办结" name="completed" />
          </el-tabs>
        </el-col>
        <!-- 搜索 + 筛选 -->
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
          >
            <el-option label="一般" value="1" />
            <el-option label="紧急" value="2" />
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格（强制铺满 + 去竖线） -->
    <el-table
      :data="tableData"
      border="false"
      stripe
      :row-style="{ height: '68px' }"
      style="width: 100%; min-width: 1200px;"
      :loading="loading"
      empty-text="暂无数据"
    >
      <el-table-column label="序号" type="index" width="60" align="center" :resizable="false" />
      <el-table-column label="编号" prop="serialNo" width="120" align="center" :resizable="false" />
      <el-table-column label="优先级" width="100" align="center" :resizable="false">
        <template #default="scope">
          <span
            class="priority-tag"
            :class="{ 'priority-urgent': scope.row.priority === 2 }"
          >{{ scope.row.priority === 2 ? '紧急' : '一般' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="信访内容" prop="title" min-width="220" align="center" :resizable="false">
        <template #default="scope">
          <div class="ellipsis" :title="scope.row.title">{{ scope.row.title }}</div>
        </template>
      </el-table-column>
      <el-table-column label="来源" prop="source" width="120" align="center" :resizable="false" />
      <el-table-column label="当前状态" width="120" align="center" :resizable="false">
        <template #default="scope">
          <span
            class="status-tag"
            :class="{
              'status-pending': scope.row.status === 1,
              'status-processing': scope.row.status === 2,
              'status-completed': scope.row.status === 3
            }"
          >{{
              scope.row.status === 1 ? '待审核' :
                scope.row.status === 2 ? '处理中' : '已办结'
            }}</span>
        </template>
      </el-table-column>
      <el-table-column label="接收日期" width="160" align="center" :resizable="false">
        <template #default="scope">
          {{ formatTime(scope.row.receiveTime) }}
        </template>
      </el-table-column>
      <el-table-column label="上一操作人" prop="lastOperator" width="120" align="center" :resizable="false" />
      <el-table-column label="操作" width="120" align="center" :resizable="false">
        <template #default="scope">
          <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件（铺满容器） -->
    <div class="pagination-wrap flex items-center justify-between">
      <div class="pagination-left flex items-center">
        <div class="pagination-info">
          <span class="text-gray">共{{ total }}条记录 第{{ page }}/{{ maxPage }}页</span>
        </div>
        <el-pagination
          @current-change="handlePageChange"
          :current-page="page"
          :page-count="maxPage"
          layout="prev, pager, next"
          class="pagination-nav"
        />
        <el-select
          v-model="pageSize"
          placeholder="条数/页"
          class="page-size-select"
          @change="handleSizeChange"
        >
          <el-option label="10条/页" value="10" />
          <el-option label="20条/页" value="20" />
          <el-option label="50条/页" value="50" />
        </el-select>
      </div>
      <div class="pagination-actions flex items-center">
        <span class="mr-2 text-gray">跳至</span>
        <el-input
          v-model.number="jumpPage"
          type="number"
          min="1"
          :max="maxPage"
          style="width: 60px; margin-right: 8px;"
          clearable
        />
        <el-button type="primary" @click="handleConfirm">确定</el-button>
        <el-button type="primary" class="ml-2" @click="handleFirstPage">回到第一页</el-button>
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
  title: string;            // 信访内容
  content: string;
  source: string;           // 来源部门
  status: 1 | 2 | 3;        // 1=待审核，2=处理中，3=已办结
  receiveTime: string;      // 接收时间
  lastOperator: string;     // 上一操作人
}

// 模拟数据（包含待审核、处理中、已办结三种状态，每种状态约1/3）
const MOCK_DATA: PetitionItem[] = Array.from({ length: 45 }).map((_, i) => {
  // 状态分配：平均分配三种状态
  let status: 1 | 2 | 3;
  if (i % 3 === 0) status = 1;    // 待审核
  else if (i % 3 === 1) status = 2; // 处理中
  else status = 3;                // 已办结

  // 优先级分配：每4条出现1条紧急
  const priority = i % 4 === 0 ? 2 : 1;

  // 不同状态的信访内容示例
  const statusTexts = {
    1: '待审核：关于',
    2: '处理中：关于',
    3: '已办结：关于'
  };

  return {
    id: i + 1,
    serialNo: `XF${dayjs().format('YYYYMM')}${(i + 1).toString().padStart(3, '0')}`,
    priority,
    title: `${statusTexts[status]}${['校园设施改善', '教学质量提升', '食堂餐饮卫生', '宿舍管理优化', '奖学金评定'][i % 5]}的建议和意见...`,
    content: '详细内容...',
    source: ['教育厅', '市政府', '省信访局', '区教育局', '其他部门'][i % 5],
    status,
    receiveTime: `2023-0${(i % 9) + 1}-${(i % 28) + 1} ${(i % 24).toString().padStart(2, '0')}:${(i % 60).toString().padStart(2, '0')}:00`,
    lastOperator: ['张三', '李四', '王五', '赵六', '钱七', '孙八'][i % 6],
  };
});

// 响应式数据
const activeName = ref<string>('pending');       // 当前激活的标签页
const searchKey = ref<string>('');               // 搜索关键词
const priorityFilter = ref<string>('');          // 优先级筛选
const tableData = ref<PetitionItem[]>([]);       // 表格数据
const page = ref<number>(1);                     // 当前页码
const pageSize = ref<number>(10);                // 每页条数
const total = ref<number>(0);                    // 总记录数
const loading = ref<boolean>(false);             // 加载状态
const jumpPage = ref<number>(1);                 // 跳转页码输入

// 计算属性：最大页码
const maxPage = computed(() =>
  total.value === 0 ? 1 : Math.ceil(total.value / pageSize.value)
);

// 时间格式化
const formatTime = (time: string): string =>
  dayjs(time).format('YYYY-MM-DD HH:mm:ss');

// 数据获取（带筛选和分页）
const fetchData = async (): Promise<void> => {
  loading.value = true;
  try {
    const statusMap: Record<string, 1 | 2 | 3> = {
      pending: 1,   // 待审核
      processing: 2,// 处理中
      completed: 3  // 已办结
    };
    const targetStatus = statusMap[activeName.value];

    const filtered = MOCK_DATA.filter(item => {
      if (item.status !== targetStatus) return false;
      if (searchKey.value && !item.title.includes(searchKey.value)) return false;
      if (priorityFilter.value && item.priority !== Number(priorityFilter.value)) return false;
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

const handleDetail = (row: PetitionItem): void => {
  console.log('查看详情：', row);
};

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
// 主题变量
$primary-color: #2f86eb;      // 主蓝色
$text-gray: #999;             // 灰色文字
$border-color: #e6e6e6;       // 边框色
$table-row-hover: #f8f9fc;    // 表格行悬浮色
$striped-color: #f5f7fa;      // 斑马纹背景色

/* 核心调整：强制页面铺满 */
.petition-page {
  background: #fff;
  width: 100% !important;     // 强制占满父容器
  max-width: none;            // 移除最大宽度限制
  margin: 0;                  // 取消居中边距
  overflow-x: auto;           // 内容超出时允许横向滚动
}

// 顶部导航
.page-header {
  padding: 12px 20px;
  border-bottom: 1px solid $border-color;
  .location {
    font-size: 14px;
    color: #333;
  }
}

// 标签栏 + 搜索区
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
    width: 240px;
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
    width: 140px;
    margin-right: 10px;
    :deep(.el-select__wrapper) {
      border-radius: 4px;
      border: 1px solid #ccc;
      &:hover { border-color: $primary-color; }
    }
  }
}

// 表格样式（去竖线 + 自定义标签）
:deep(.el-table) {
  border: none !important;
  table-layout: fixed;
  width: 100% !important;  // 强制表格占满容器

  .el-table__cell {
    border-right: none !important;
    border-left: none !important;
  }

  .el-table__header-wrapper { background: $striped-color; }
  .el-table__row {
    height: 68px;
    &:hover { background: $table-row-hover; }
  }
  &.el-table--striped .el-table__body tr.el-table__row--striped td {
    background: $striped-color;
  }

  // 优先级标签（紧急=红色，一般=黄色）
  .priority-tag {
    display: inline-block;
    width: 69px;
    height: 31px;
    line-height: 31px;
    border-radius: 50px;
    font-size: 14px;
    text-align: center;
    font-family: PingFangSC-regular;

    &.priority-urgent {
      background-color: rgba(255, 116, 116, 1);
      color: rgba(255, 233, 233, 1);
    }
    &:not(.priority-urgent) { // 一般状态
      background-color: #ffc107;
      color: #fff;
    }
  }

  // 当前状态标签样式
  .status-tag {
    display: inline-block;
    width: 81px;
    height: 26px;
    line-height: 26px;
    border-radius: 11px;
    font-size: 14px;
    text-align: center;
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

// 文本截断
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 5px;
  box-sizing: border-box;
}

// 分页区域
.pagination-wrap {
  padding: 10px 20px;
  background: #fff;
  border-top: 1px solid $border-color;
  width: 100%;              // 占满父容器
  box-sizing: border-box;   // 避免padding撑大容器

  .pagination-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .pagination-info .text-gray {
      color: $text-gray;
      font-size: 14px;
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

    .page-size-select {
      width: 100px;
      :deep(.el-select__wrapper) {
        border-radius: 4px;
        border: 1px solid #ccc;
        &:hover { border-color: $primary-color; }
      }
    }
  }

  .pagination-actions {
    display: flex;
    align-items: center;

    .text-gray {
      color: $text-gray;
      font-size: 14px;
    }

    .el-input {
      :deep(.el-input__wrapper) {
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
.items-center { align-items: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.mr-2 { margin-right: 8px; }
.ml-2 { margin-left: 8px; }
</style>
