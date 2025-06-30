<script lang="ts" setup>
import { setCssVar } from '@/utils'

import { useDesign } from '@/hooks/web/useDesign'
import { useWatermark } from '@/hooks/web/useWatermark'
import { useAppStore } from '@/store/modules/app'

defineOptions({ name: 'InterfaceDisplay' })

const { t } = useI18n()
const { getPrefixCls } = useDesign()
const { setWatermark } = useWatermark()
const prefixCls = getPrefixCls('interface-display')
const appStore = useAppStore()

const water = ref()

// 面包屑
const breadcrumb = ref(appStore.getBreadcrumb)

const breadcrumbChange = (show: boolean) => {
  appStore.setBreadcrumb(show)
}

// 面包屑图标
const breadcrumbIcon = ref(appStore.getBreadcrumbIcon)

const breadcrumbIconChange = (show: boolean) => {
  appStore.setBreadcrumbIcon(show)
}

// 折叠图标
const hamburger = ref(appStore.getHamburger)

const hamburgerChange = (show: boolean) => {
  appStore.setHamburger(show)
}

// 全屏图标
const screenfull = ref(appStore.getScreenfull)

const screenfullChange = (show: boolean) => {
  appStore.setScreenfull(show)
}

// 尺寸图标
const size = ref(appStore.getSize)

const sizeChange = (show: boolean) => {
  appStore.setSize(show)
}

// 多语言图标
const locale = ref(appStore.getLocale)

const localeChange = (show: boolean) => {
  appStore.setLocale(show)
}

// 消息图标
const message = ref(appStore.getMessage)

const messageChange = (show: boolean) => {
  appStore.setMessage(show)
}

// 标签页
const tagsView = ref(appStore.getTagsView)

const tagsViewChange = (show: boolean) => {
  // 切换标签栏显示时，同步切换标签栏的高度
  setCssVar('--tags-view-height', show ? '35px' : '0px')
  appStore.setTagsView(show)
}

// 标签页沉浸
const tagsViewImmerse = ref(appStore.getTagsViewImmerse)

const tagsViewImmerseChange = (immerse: boolean) => {
  appStore.setTagsViewImmerse(immerse)
}

// 标签页图标
const tagsViewIcon = ref(appStore.getTagsViewIcon)

const tagsViewIconChange = (show: boolean) => {
  appStore.setTagsViewIcon(show)
}

// logo
const logo = ref(appStore.getLogo)

const logoChange = (show: boolean) => {
  appStore.setLogo(show)
}

// 菜单手风琴
const uniqueOpened = ref(appStore.getUniqueOpened)

const uniqueOpenedChange = (uniqueOpened: boolean) => {
  appStore.setUniqueOpened(uniqueOpened)
}

// 固定头部
const fixedHeader = ref(appStore.getFixedHeader)

const fixedHeaderChange = (show: boolean) => {
  appStore.setFixedHeader(show)
}

// 页脚
const footer = ref(appStore.getFooter)

const footerChange = (show: boolean) => {
  appStore.setFooter(show)
}

// 灰色模式
const greyMode = ref(appStore.getGreyMode)

const greyModeChange = (show: boolean) => {
  appStore.setGreyMode(show)
}

// 固定菜单
const fixedMenu = ref(appStore.getFixedMenu)

const fixedMenuChange = (show: boolean) => {
  appStore.setFixedMenu(show)
}

// 设置水印
const setWater = () => {
  setWatermark(water.value)
}

// 卡片设置
// 获取卡片设置
const cardSettings = computed(() => appStore.getCardSettings)

// todo卡片
const todoCard = computed({
  get: () => cardSettings.value.todo?.visible ?? true,
  set: (val) => appStore.setTodoCardVisible(val)
})

const todoCardLimit = computed({
  get: () => cardSettings.value.todo?.limit ?? 5,
  set: (val) => appStore.setTodoCardLimit(val)
})

const todoCardChange = (visible: boolean) => {
  appStore.setTodoCardVisible(visible)
}

const todoCardLimitChange = (limit: number) => {
  appStore.setTodoCardLimit(limit)
}

// 通知卡片
const noticeCard = computed({
  get: () => cardSettings.value.notice?.visible ?? true,
  set: (val) => appStore.setNoticeCardVisible(val)
})

const noticeCardLimit = computed({
  get: () => cardSettings.value.notice?.limit ?? 5,
  set: (val) => appStore.setNoticeCardLimit(val)
})

const noticeCardChange = (visible: boolean) => {
  appStore.setNoticeCardVisible(visible)
}

const noticeCardLimitChange = (limit: number) => {
  appStore.setNoticeCardLimit(limit)
}

// 快捷方式卡片
const shortcutCard = computed({
  get: () => cardSettings.value.shortcut?.visible ?? true,
  set: (val) => appStore.setShortcutCardVisible(val)
})

const shortcutCardLimit = computed({
  get: () => cardSettings.value.shortcut?.limit ?? 5,
  set: (val) => appStore.setShortcutCardLimit(val)
})

const shortcutCardChange = (visible: boolean) => {
  appStore.setShortcutCardVisible(visible)
}

const shortcutCardLimitChange = (limit: number) => {
  appStore.setShortcutCardLimit(limit)
}

// 日程卡片
const scheduleCard = computed({
  get: () => cardSettings.value.schedule?.visible ?? true,
  set: (val) => appStore.setScheduleCardVisible(val)
})

const scheduleCardLimit = computed({
  get: () => cardSettings.value.schedule?.limit ?? 5,
  set: (val) => appStore.setScheduleCardLimit(val)
})

const scheduleCardChange = (visible: boolean) => {
  appStore.setScheduleCardVisible(visible)
}

const scheduleCardLimitChange = (limit: number) => {
  appStore.setScheduleCardLimit(limit)
}

// 文件卡片
const fileCard = computed({
  get: () => cardSettings.value.file?.visible ?? true,
  set: (val) => appStore.setFileCardVisible(val)
})

const fileCardLimit = computed({
  get: () => cardSettings.value.file?.limit ?? 5,
  set: (val) => appStore.setFileCardLimit(val)
})

const fileCardChange = (visible: boolean) => {
  appStore.setFileCardVisible(visible)
}

const fileCardLimitChange = (limit: number) => {
  appStore.setFileCardLimit(limit)
}

const layout = computed(() => appStore.getLayout)

watch(
  () => layout.value,
  (n) => {
    if (n === 'top') {
      appStore.setCollapse(false)
    }
  }
)
</script>

<template>
  <div :class="prefixCls">
    <div class="flex items-center justify-between">
      <span class="text-14px">{{ t('setting.todoCard') }}</span>
      <div class="flex items-center justify-between mt-2">
        <el-input-number
          v-model="todoCardLimit"
          :min="1"
          :max="10"
          @change="todoCardLimitChange"
          size="small"
          class="w-20 text-12px"
          controls-position="right"
        />
      </div>
      <ElSwitch v-model="todoCard" @change="todoCardChange" />
    </div>
    <div class="flex items-center justify-between">
      <span class="text-14px">{{ t('setting.noticeCard') }}</span>
      <div class="flex items-center justify-between mt-2">
        <el-input-number
          v-model="noticeCardLimit"
          :min="1"
          :max="10"
          @change="noticeCardLimitChange"
          size="small"
          class="w-20 text-12px"
          controls-position="right"
        />
      </div>
      <ElSwitch v-model="noticeCard" @change="noticeCardChange" />
    </div>
    <div class="flex items-center justify-between">
      <span class="text-14px">{{ t('setting.shortcutCard') }}</span>
      <div class="flex items-center justify-between mt-2">
        <el-input-number
          v-model="shortcutCardLimit"
          :min="1"
          :max="10"
          @change="shortcutCardLimitChange"
          size="small"
          class="w-20 text-12px"
          controls-position="right"
        />
      </div>
      <ElSwitch v-model="shortcutCard" @change="shortcutCardChange" />
    </div>
    <div class="flex items-center justify-between">
      <span class="text-14px">{{ t('setting.scheduleCard') }}</span>
      <div class="flex items-center justify-between mt-2">
        <el-input-number
          v-model="scheduleCardLimit"
          :min="1"
          :max="10"
          @change="scheduleCardLimitChange"
          size="small"
          class="w-20 text-12px"
          controls-position="right"
        />
      </div>
      <ElSwitch v-model="scheduleCard" @change="scheduleCardChange" />
    </div>
    <div class="flex items-center justify-between">
      <span class="text-14px">{{ t('setting.fileCard') }}</span>
      <div class="flex items-center justify-between mt-2">
        <el-input-number
          v-model="fileCardLimit"
          :min="1"
          :max="10"
          @change="fileCardLimitChange"
          size="small"
          class="w-20 text-12px"
          controls-position="right"
        />
      </div>
      <ElSwitch v-model="fileCard" @change="fileCardChange" />
    </div>
    <!--
      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.breadcrumbIcon') }}</span>
        <ElSwitch v-model="breadcrumbIcon" @change="breadcrumbIconChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.hamburgerIcon') }}</span>
        <ElSwitch v-model="hamburger" @change="hamburgerChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.screenfullIcon') }}</span>
        <ElSwitch v-model="screenfull" @change="screenfullChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.sizeIcon') }}</span>
        <ElSwitch v-model="size" @change="sizeChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.localeIcon') }}</span>
        <ElSwitch v-model="locale" @change="localeChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.messageIcon') }}</span>
        <ElSwitch v-model="message" @change="messageChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.tagsView') }}</span>
        <ElSwitch v-model="tagsView" @change="tagsViewChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.tagsViewImmerse') }}</span>
        <ElSwitch v-model="tagsViewImmerse" @change="tagsViewImmerseChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.tagsViewIcon') }}</span>
        <ElSwitch v-model="tagsViewIcon" @change="tagsViewIconChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.logo') }}</span>
        <ElSwitch v-model="logo" @change="logoChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.uniqueOpened') }}</span>
        <ElSwitch v-model="uniqueOpened" @change="uniqueOpenedChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.fixedHeader') }}</span>
        <ElSwitch v-model="fixedHeader" @change="fixedHeaderChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.footer') }}</span>
        <ElSwitch v-model="footer" @change="footerChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.greyMode') }}</span>
        <ElSwitch v-model="greyMode" @change="greyModeChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('setting.fixedMenu') }}</span>
        <ElSwitch v-model="fixedMenu" @change="fixedMenuChange" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-14px">{{ t('watermark.watermark') }}</span>
        <ElInput v-model="water" class="right-1 w-20" @change="setWater()" />
      </div> -->
  </div>
</template>
