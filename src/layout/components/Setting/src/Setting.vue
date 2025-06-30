<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { useClipboard, useCssVar } from '@vueuse/core'

import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { useDesign } from '@/hooks/web/useDesign'

import { setCssVar, trim } from '@/utils'
import { colorIsDark, hexToRGB, lighten } from '@/utils/color'
import { useAppStore } from '@/store/modules/app'
import { ThemeSwitch } from '@/layout/components/ThemeSwitch'
import ColorRadioPicker from './components/ColorRadioPicker.vue'
import InterfaceDisplay from './components/InterfaceDisplay.vue'
import LayoutRadioPicker from './components/LayoutRadioPicker.vue'
// 导入保存设置的API
import { updateUserSetting } from '@/api/system/user/setting'

defineOptions({ name: 'Setting' })

const { t } = useI18n()
const appStore = useAppStore()

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('setting')
const layout = computed(() => appStore.getLayout)
const drawer = ref(false)

// 主题色相关
const systemTheme = ref(appStore.getTheme.elColorPrimary)

const setSystemTheme = (color: string) => {
  setCssVar('--el-color-primary', color)
  appStore.setTheme({ elColorPrimary: color })
  const leftMenuBgColor = useCssVar('--left-menu-bg-color', document.documentElement)
  setMenuTheme(trim(unref(leftMenuBgColor)))
}

// 头部主题相关
const headerTheme = ref(appStore.getTheme.topHeaderBgColor || '')

const setHeaderTheme = (color: string) => {
  const isDarkColor = colorIsDark(color)
  const textColor = isDarkColor ? '#fff' : 'inherit'
  const textHoverColor = isDarkColor ? lighten(color!, 6) : '#f6f6f6'
  const topToolBorderColor = isDarkColor ? color : '#eee'
  setCssVar('--top-header-bg-color', color)
  setCssVar('--top-header-text-color', textColor)
  setCssVar('--top-header-hover-color', textHoverColor)
  appStore.setTheme({
    topHeaderBgColor: color,
    topHeaderTextColor: textColor,
    topHeaderHoverColor: textHoverColor,
    topToolBorderColor
  })
  if (unref(layout) === 'top') {
    setMenuTheme(color)
  }
}

// 在组件挂载后直接设置主题
onMounted(() => {
  // 设置系统主题色（主色调，用于按钮、链接等强调色）






})

// 菜单主题相关
const menuTheme = ref(appStore.getTheme.leftMenuBgColor || '')

const setMenuTheme = (color: string) => {
  const primaryColor = useCssVar('--el-color-primary', document.documentElement)
  const isDarkColor = colorIsDark(color)
  const theme: Recordable = {
    // 左侧菜单边框颜色
    leftMenuBorderColor: isDarkColor ? 'inherit' : '#eee',
    // 左侧菜单背景颜色
    leftMenuBgColor: color,
    // 左侧菜单浅色背景颜色
    leftMenuBgLightColor: isDarkColor ? lighten(color!, 6) : color,
    // 左侧菜单选中背景颜色
    leftMenuBgActiveColor: isDarkColor
      ? 'var(--el-color-primary)'
      : hexToRGB(unref(primaryColor), 0.1),
    // 左侧菜单收起选中背景颜色
    leftMenuCollapseBgActiveColor: isDarkColor
      ? 'var(--el-color-primary)'
      : hexToRGB(unref(primaryColor), 0.1),
    // 左侧菜单字体颜色
    leftMenuTextColor: isDarkColor ? '#bfcbd9' : '#333',
    // 左侧菜单选中字体颜色
    leftMenuTextActiveColor: isDarkColor ? '#fff' : 'var(--el-color-primary)',
    // logo字体颜色
    logoTitleTextColor: isDarkColor ? '#fff' : 'inherit',
    // logo边框颜色
    logoBorderColor: isDarkColor ? color : '#eee'
  }
  appStore.setTheme(theme)
  appStore.setCssVarTheme()
}
if (layout.value === 'top' && !appStore.getIsDark) {
  headerTheme.value = '#fff'
  setHeaderTheme('#fff')
}

// 监听layout变化，重置一些主题色
watch(
  () => layout.value,
  (n) => {
    if (n === 'top' && !appStore.getIsDark) {
      headerTheme.value = '#fff'
      setHeaderTheme('#fff')
    } else {
      setMenuTheme(unref(menuTheme))
    }
  }
)

// 拷贝
const copyConfig = async () => {
  const { copy, copied, isSupported } = useClipboard({
    source: `
      // 面包屑
      breadcrumb: ${appStore.getBreadcrumb},
      // 面包屑图标
      breadcrumbIcon: ${appStore.getBreadcrumbIcon},
      // 折叠图标
      hamburger: ${appStore.getHamburger},
      // 全屏图标
      screenfull: ${appStore.getScreenfull},
      // 尺寸图标
      size: ${appStore.getSize},
      // 多语言图标
      locale: ${appStore.getLocale},
      // 消息图标
      message: ${appStore.getMessage},
      // 标签页
      tagsView: ${appStore.getTagsView},
      // 标签页
      tagsViewImmerse: ${appStore.getTagsViewImmerse},
      // 标签页图标
      tagsViewIcon: ${appStore.getTagsViewIcon},
      // logo
      logo: ${appStore.getLogo},
      // 菜单手风琴
      uniqueOpened: ${appStore.getUniqueOpened},
      // 固定header
      fixedHeader: ${appStore.getFixedHeader},
      // 页脚
      footer: ${appStore.getFooter},
      // 灰色模式
      greyMode: ${appStore.getGreyMode},
      // layout布局
      layout: '${appStore.getLayout}',
      // 暗黑模式
      isDark: ${appStore.getIsDark},
      // 组件尺寸
      currentSize: '${appStore.getCurrentSize}',
      // 主题相关
      theme: {
        // 主题色
        elColorPrimary: '${appStore.getTheme.elColorPrimary}',
        // 左侧菜单边框颜色
        leftMenuBorderColor: '${appStore.getTheme.leftMenuBorderColor}',
        // 左侧菜单背景颜色
        leftMenuBgColor: '${appStore.getTheme.leftMenuBgColor}',
        // 左侧菜单浅色背景颜色
        leftMenuBgLightColor: '${appStore.getTheme.leftMenuBgLightColor}',
        // 左侧菜单选中背景颜色
        leftMenuBgActiveColor: '${appStore.getTheme.leftMenuBgActiveColor}',
        // 左侧菜单收起选中背景颜色
        leftMenuCollapseBgActiveColor: '${appStore.getTheme.leftMenuCollapseBgActiveColor}',
        // 左侧菜单字体颜色
        leftMenuTextColor: '${appStore.getTheme.leftMenuTextColor}',
        // 左侧菜单选中字体颜色
        leftMenuTextActiveColor: '${appStore.getTheme.leftMenuTextActiveColor}',
        // logo字体颜色
        logoTitleTextColor: '${appStore.getTheme.logoTitleTextColor}',
        // logo边框颜色
        logoBorderColor: '${appStore.getTheme.logoBorderColor}',
        // 头部背景颜色
        topHeaderBgColor: '${appStore.getTheme.topHeaderBgColor}',
        // 头部字体颜色
        topHeaderTextColor: '${appStore.getTheme.topHeaderTextColor}',
        // 头部悬停颜色
        topHeaderHoverColor: '${appStore.getTheme.topHeaderHoverColor}',
        // 头部边框颜色
        topToolBorderColor: '${appStore.getTheme.topToolBorderColor}'
      }
    `
  })
  if (!isSupported) {
    ElMessage.error(t('setting.copyFailed'))
  } else {
    await copy()
    if (unref(copied)) {
      ElMessage.success(t('setting.copySuccess'))
    }
  }
}

// 清空缓存
const clear = () => {
  const { wsCache } = useCache()
  wsCache.delete(CACHE_KEY.LAYOUT)
  wsCache.delete(CACHE_KEY.IS_DARK)
  // 保留主题设置，不删除主题缓存
  // wsCache.delete(CACHE_KEY.THEME)
  
  // 重新加载页面前，确保主题颜色设置永不失效
  const systemColor = '#2C6AA0' // 天蓝，明快清新
 
  
  // 直接设置主题色，不依赖缓存
  setCssVar('--el-color-primary', systemColor)
  setCssVar('--top-header-bg-color', headerColor)
  
  // 如果不是顶部布局，设置菜单主题色
  if (layout.value !== 'top') {
    const isDarkColor = colorIsDark(menuColor)
    setCssVar('--left-menu-bg-color', menuColor)
    // 保存主题设置到缓存，确保刷新后仍然生效
    appStore.setTheme({
      elColorPrimary: systemColor,
      topHeaderBgColor: headerColor,
      leftMenuBgColor: menuColor,
      // 其他必要的主题设置...
      leftMenuBgLightColor: isDarkColor ? lighten(menuColor, 6) : menuColor
    })
    appStore.setCssVarTheme()
  }
  
  window.location.reload()
}

// 保存设置到后端
const saveSettingLoading = ref(false)
const saveSettingToBackend = async () => {
  try {
    saveSettingLoading.value = true
    
    const settings = {
      cardConfig: JSON.stringify(appStore.getCardSettings)
    }
    await updateUserSetting(settings)
    
    ElMessage.success('设置已成功保存到服务器')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败，请稍后重试')
  } finally {
    saveSettingLoading.value = false
  }
}
</script>

<template>
  <div
    :class="prefixCls"
    class="fixed right-0 top-[45%] h-40px w-40px cursor-pointer bg-[var(--el-color-primary)] text-center leading-40px"
    @click="drawer = true"
  >
    <Icon color="#fff" icon="ep:setting" />
  </div>

  <ElDrawer v-model="drawer" :z-index="4000" direction="rtl" size="350px">
    <template #header>
      <!-- <span class="text-16px font-700">{{ t('setting.projectSetting') }}</span> -->
      <span class="text-16px font-700">主页设置</span>
    </template>

   <!-- <div class="text-center">
      主题
      <ElDivider>{{ t('setting.theme') }}</ElDivider>
      <ThemeSwitch />

      布局 
      <ElDivider>{{ t('setting.layout') }}</ElDivider>
      <LayoutRadioPicker />

       系统主题
<ElDivider>{{ t('setting.systemTheme') }}</ElDivider>
<ColorRadioPicker
  v-model="systemTheme"
  :schema="['#2C6AA0']"
  @change="setSystemTheme"
/>

 头部主题 
<ElDivider>{{ t('setting.headerTheme') }}</ElDivider>
<ColorRadioPicker
  v-model="headerTheme"
  :schema="['#ffffff']"
  @change="setHeaderTheme"
/>

 菜单主题
<template v-if="layout !== 'top'">
  <ElDivider>{{ t('setting.menuTheme') }}</ElDivider>
  <ColorRadioPicker
    v-model="menuTheme"
    :schema="['#001529']"
    @change="setMenuTheme"
  />
</template>
    </div> -->
    <!-- 界面显示 -->
    <ElDivider>{{ t('setting.interfaceDisplay') }}</ElDivider>
    <InterfaceDisplay />

    <ElDivider />
    <div>
      <ElButton 
        class="w-full" 
        type="primary" 
        :loading="saveSettingLoading"
        @click="saveSettingToBackend"
      >
        保存设置到服务器
      </ElButton>
    </div>
    <div class="mt-5px">
      <ElButton class="w-full" type="danger" @click="clear">
        {{ t('setting.clearAndReset') }}
      </ElButton>
    </div>
  </ElDrawer>
</template>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-setting;

.#{$prefix-cls} {
  border-radius: 6px 0 0 6px;
  z-index: 1200;/*修正没有z-index会被表格层覆盖,值不要超过4000*/
}
</style>
