<template>
  <div class="quick-access">
    <el-popover
      placement="bottom"
      :width="300"
      trigger="click"
      popper-class="quick-access-popover"
    >
      <template #reference>
        <div class="quick-access-icon custom-hover" :style="{ color }">
          <Icon icon="ep:menu" />
        </div>
      </template>
      <div class="quick-access-content">
        <div class="quick-access-title">快捷功能</div>
        <div class="quick-access-grid">
          <div v-for="(item, index) in quickItems" :key="index" class="quick-access-item" @click="handleItemClick(item)">
            <div class="quick-access-item-icon">
              <img :src="item.icon" alt="icon" class="quick-access-item-img" />
            </div>
            <div class="quick-access-item-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/components/Icon'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'QuickAccess'
})

const props = defineProps({
  color: {
    type: String,
    default: ''
  }
})

const router = useRouter()

// 快捷功能项
const quickItems = [
  {
    icon: new URL('@/assets/imgs/shortcuts/document.png', import.meta.url).href,
    label: '文档中心',
    path: '/wjgl/xuexiaowenjian'
  },
  {
    icon: new URL('@/assets/imgs/shortcuts/leave.png', import.meta.url).href,
    label: '请假申请',
    path: '/leave/list/index'
  },
  {
    icon: new URL('@/assets/imgs/shortcuts/office.png', import.meta.url).href,
    label: '会议室申请',
    path: '/xzsp/meetingroom/apply'
  },
  {
    icon: new URL('@/assets/imgs/shortcuts/sms.png', import.meta.url).href,
    label: '即时通讯',
    path: '/mail/write'
  },
  {
    icon: new URL('@/assets/imgs/shortcuts/setting.png', import.meta.url).href,
    label: '系统设置',
    path: '/user/profile'
  },
  {
    icon: new URL('@/assets/imgs/shortcuts/help.png', import.meta.url).href,
    label: '帮助中心',
    path: '/help'
  }
]

// 处理项点击
const handleItemClick = (item: any) => {
  router.push(item.path)
}
</script>

<style lang="scss" scoped>
.quick-access {
  &-icon {
    padding: 0 10px;
    height: var(--top-tool-height);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
  }

  &-content {
    padding: 10px;
  }

  &-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: var(--el-text-color-primary);
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  &-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 10px;
    border-radius: 4px;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }

    &-icon {
      margin-bottom: 8px;
    }

    &-img {
      width: 50px;
      height: 50px;
      object-fit: contain;
    }

    &-label {
      font-size: 12px;
      color: var(--el-text-color-primary);
    }
  }
}
</style>
