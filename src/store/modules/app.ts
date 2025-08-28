import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { ElementPlusSize } from '@/types/elementPlus'
import { LayoutType } from '@/types/layout'
import { ThemeTypes } from '@/types/theme'
import { CardSetting, CardSettings } from '@/types/card'
import { humpToUnderline, setCssVar } from '@/utils'
import { getCssColorVariable, hexToRGB, mix } from '@/utils/color'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { store } from '@/store'

const { wsCache } = useCache()

interface AppState {
  breadcrumb: boolean
  breadcrumbIcon: boolean
  collapse: boolean
  uniqueOpened: boolean
  hamburger: boolean
  screenfull: boolean
  search: boolean
  size: boolean
  locale: boolean
  message: boolean
  tagsView: boolean
  tagsViewImmerse: boolean
  tagsViewIcon: boolean
  logo: boolean
  fixedHeader: boolean
  greyMode: boolean
  pageLoading: boolean
  layout: LayoutType
  title: string
  userInfo: string
  isDark: boolean
  currentSize: ElementPlusSize
  sizeMap: ElementPlusSize[]
  mobile: boolean
  footer: boolean
  theme: ThemeTypes
  fixedMenu: boolean
  cardSettings: CardSettings
}

export const useAppStore = defineStore('app', {
  state: (): AppState => {
    return {
      userInfo: 'userInfo', 
      sizeMap: ['default', 'large', 'small'],
      mobile: false, 
      title: import.meta.env.VITE_APP_TITLE, 
      pageLoading: false, 

      breadcrumb: false, 
      breadcrumbIcon: false, 
      collapse: false, 
      uniqueOpened: true, 
      hamburger: true, 
      screenfull: false, 
      search: true, 
      size: false, 
      locale: false, 
      message: true, 
      tagsView: true, 
      tagsViewImmerse: false, 
      tagsViewIcon: true, 
      logo: true, 
      fixedHeader: true, 
      footer: true, 
      greyMode: false, 
      fixedMenu: wsCache.get('fixedMenu') || false, 

      cardSettings: {
        todo: {
          visible: wsCache.get('todoCardVisible') !== false,
          limit: wsCache.get('todoCardLimit') || 5
        },
        notice: {
          visible: wsCache.get('noticeCardVisible') !== false,
          limit: wsCache.get('noticeCardLimit') || 5
        },
        shortcut: {
          visible: wsCache.get('shortcutCardVisible') !== false,
          limit: wsCache.get('shortcutCardLimit') || 5
        },
        schedule: {
          visible: wsCache.get('scheduleCardVisible') !== false,
          limit: wsCache.get('scheduleCardLimit') || 5
        },
        file: {
          visible: wsCache.get('fileCardVisible') !== false,
          limit: wsCache.get('fileCardLimit') || 5
        }
      },

      layout:  'topLeft', 
      isDark: false, 
      currentSize: wsCache.get('default') || 'default', 
      theme: {
        elColorPrimary: '#0061B1',
        leftMenuBorderColor: '#fff',
        leftMenuBgColor: '#fff',
        leftMenuBgLightColor: '#fff',
        leftMenuBgActiveColor: '#0061B1',
        leftMenuCollapseBgActiveColor: '#0061B1',
        leftMenuTextColor: '#00000',
        leftMenuTextActiveColor: '#fff',
        logoTitleTextColor: '#fff',
        logoBorderColor: 'inherit',
        topHeaderBgColor: '#0061B1',
        topHeaderTextColor: '#fff',
        topHeaderHoverColor: '#0061B1',
        topToolBorderColor: '#dcdfe6'
      }
    }
  },
  getters: {
    getBreadcrumb(): boolean {
      return this.breadcrumb
    },
    getBreadcrumbIcon(): boolean {
      return this.breadcrumbIcon
    },
    getCollapse(): boolean {
      return this.collapse
    },
    getUniqueOpened(): boolean {
      return this.uniqueOpened
    },
    getHamburger(): boolean {
      return this.hamburger
    },
    getScreenfull(): boolean {
      return this.screenfull
    },
    getSize(): boolean {
      return this.size
    },
    getLocale(): boolean {
      return this.locale
    },
    getMessage(): boolean {
      return this.message
    },
    getTagsView(): boolean {
      return this.tagsView
    },
    getTagsViewImmerse(): boolean {
      return this.tagsViewImmerse
    },
    getTagsViewIcon(): boolean {
      return this.tagsViewIcon
    },
    getLogo(): boolean {
      return this.logo
    },
    getFixedHeader(): boolean {
      return this.fixedHeader
    },
    getGreyMode(): boolean {
      return this.greyMode
    },
    getFixedMenu(): boolean {
      return this.fixedMenu
    },
    getPageLoading(): boolean {
      return this.pageLoading
    },
    getLayout(): LayoutType {
      return this.layout
    },
    getTitle(): string {
      return this.title
    },
    getUserInfo(): string {
      return this.userInfo
    },
    getIsDark(): boolean {
      return this.isDark
    },
    getCurrentSize(): ElementPlusSize {
      return this.currentSize
    },
    getSizeMap(): ElementPlusSize[] {
      return this.sizeMap
    },
    getMobile(): boolean {
      return this.mobile
    },
    getTheme(): ThemeTypes {
      return this.theme
    },
    getFooter(): boolean {
      return this.footer
    },
    getCardSettings(): CardSettings {
      return this.cardSettings
    },
    getTodoCard(): CardSetting {
      return this.cardSettings.todo || { visible: true, limit: 5 }
    },
    getNoticeCard(): CardSetting {
      return this.cardSettings.notice || { visible: true, limit: 5 }
    },
    getShortcutCard(): CardSetting {
      return this.cardSettings.shortcut || { visible: true, limit: 5 }
    },
    getScheduleCard(): CardSetting {
      return this.cardSettings.schedule || { visible: true, limit: 5 }
    },
    getFileCard(): CardSetting {
      return this.cardSettings.file || { visible: true, limit: 5 }
    }
  },
  actions: {
    setPrimaryLight() {
      if (this.theme.elColorPrimary) {
        const elColorPrimary = this.theme.elColorPrimary
        const color = this.isDark ? '#000000' : '#ffffff'
        const lightList = [3, 5, 7, 8, 9]
        lightList.forEach((v) => {
          setCssVar(`--el-color-primary-light-${v}`, mix(color, elColorPrimary, v / 10))
        })
        setCssVar(`--el-color-primary-dark-2`, mix(color, elColorPrimary, 0.2))

        this.setAllColorRgbVars()
      }
    },

    setAllColorRgbVars() {
      const colorTypes = ['primary', 'success', 'warning', 'danger', 'error', 'info']

      colorTypes.forEach((type) => {
        const colorValue = getCssColorVariable(`--el-color-${type}`)
        if (colorValue) {
          const rgbaString = hexToRGB(colorValue, 1)
          const rgbValues = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
          if (rgbValues) {
            const [, r, g, b] = rgbValues
            setCssVar(`--el-color-${type}-rgb`, `${r}, ${g}, ${b}`)
          }
        }
      })
    },
    setBreadcrumb(breadcrumb: boolean) {
      this.breadcrumb = breadcrumb
    },
    setBreadcrumbIcon(breadcrumbIcon: boolean) {
      this.breadcrumbIcon = breadcrumbIcon
    },
    setCollapse(collapse: boolean) {
      this.collapse = collapse
    },
    setUniqueOpened(uniqueOpened: boolean) {
      this.uniqueOpened = uniqueOpened
    },
    setHamburger(hamburger: boolean) {
      this.hamburger = hamburger
    },
    setScreenfull(screenfull: boolean) {
      this.screenfull = screenfull
    },
    setSize(size: boolean) {
      this.size = size
    },
    setLocale(locale: boolean) {
      this.locale = locale
    },
    setMessage(message: boolean) {
      this.message = message
    },
    setTagsView(tagsView: boolean) {
      this.tagsView = tagsView
    },
    setTagsViewImmerse(tagsViewImmerse: boolean) {
      this.tagsViewImmerse = tagsViewImmerse
    },
    setTagsViewIcon(tagsViewIcon: boolean) {
      this.tagsViewIcon = tagsViewIcon
    },
    setLogo(logo: boolean) {
      this.logo = logo
    },
    setFixedHeader(fixedHeader: boolean) {
      this.fixedHeader = fixedHeader
    },
    setGreyMode(greyMode: boolean) {
      this.greyMode = greyMode
    },
    setFixedMenu(fixedMenu: boolean) {
      wsCache.set('fixedMenu', fixedMenu)
      this.fixedMenu = fixedMenu
    },
    setPageLoading(pageLoading: boolean) {
      this.pageLoading = pageLoading
    },
    setLayout(layout: LayoutType) {
      if (this.mobile && layout !== 'classic') {
        ElMessage.warning('移动端模式下不支持切换其他布局')
        return
      }
      this.layout = layout
      wsCache.set(CACHE_KEY.LAYOUT, this.layout)
    },
    setTitle(title: string) {
      this.title = title
    },
    setIsDark(isDark: boolean) {
      this.isDark = isDark
      if (this.isDark) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
      wsCache.set(CACHE_KEY.IS_DARK, this.isDark)
      this.setPrimaryLight()
    },
    setCurrentSize(currentSize: ElementPlusSize) {
      this.currentSize = currentSize
      wsCache.set('currentSize', this.currentSize)
    },
    setMobile(mobile: boolean) {
      this.mobile = mobile
    },
    setTheme(theme: ThemeTypes) {
      this.theme = Object.assign(this.theme, theme)
      wsCache.set(CACHE_KEY.THEME, this.theme)
      this.setCssVarTheme() // 自动应用主题到CSS变量
    },
    setCssVarTheme() {
      for (const key in this.theme) {
        setCssVar(`--${humpToUnderline(key)}`, this.theme[key])
      }
      this.setPrimaryLight()
    },
    setFooter(footer: boolean) {
      this.footer = footer
    },
    setCardSettings(settings: CardSettings) {
      this.cardSettings = settings
      if (settings.todo) {
        wsCache.set('todoCardVisible', settings.todo.visible)
        wsCache.set('todoCardLimit', settings.todo.limit)
      }
      if (settings.notice) {
        wsCache.set('noticeCardVisible', settings.notice.visible)
        wsCache.set('noticeCardLimit', settings.notice.limit)
      }
      if (settings.shortcut) {
        wsCache.set('shortcutCardVisible', settings.shortcut.visible)
        wsCache.set('shortcutCardLimit', settings.shortcut.limit)
      }
      if (settings.schedule) {
        wsCache.set('scheduleCardVisible', settings.schedule.visible)
        wsCache.set('scheduleCardLimit', settings.schedule.limit)
      }
      if (settings.file) {
        wsCache.set('fileCardVisible', settings.file.visible)
        wsCache.set('fileCardLimit', settings.file.limit)
      }
    },
    /*未使用的函数，存在警告，注释掉了*/
    /*setTodoCard(setting: CardSetting) {
      this.cardSettings.todo = setting
      wsCache.set('todoCardVisible', setting.visible)
      wsCache.set('todoCardLimit', setting.limit)
    },
    setNoticeCard(setting: CardSetting) {
      this.cardSettings.notice = setting
      wsCache.set('noticeCardVisible', setting.visible)
      wsCache.set('noticeCardLimit', setting.limit)
    },
    setShortcutCard(setting: CardSetting) {
      this.cardSettings.shortcut = setting
      wsCache.set('shortcutCardVisible', setting.visible)
      wsCache.set('shortcutCardLimit', setting.limit)
    },
    setScheduleCard(setting: CardSetting) {
      this.cardSettings.schedule = setting
      wsCache.set('scheduleCardVisible', setting.visible)
      wsCache.set('scheduleCardLimit', setting.limit)
    },
    setFileCard(setting: CardSetting) {
      this.cardSettings.file = setting
      wsCache.set('fileCardVisible', setting.visible)
      wsCache.set('fileCardLimit', setting.limit)
    },
    setTodoCardVisible(visible: boolean) {
      if (!this.cardSettings.todo) this.cardSettings.todo = { visible, limit: 5 }
      else this.cardSettings.todo.visible = visible
      wsCache.set('todoCardVisible', visible)
    },*/
    setNoticeCardVisible(visible: boolean) {
      if (!this.cardSettings.notice) this.cardSettings.notice = { visible, limit: 5 }
      else this.cardSettings.notice.visible = visible
      wsCache.set('noticeCardVisible', visible)
    },
    setShortcutCardVisible(visible: boolean) {
      if (!this.cardSettings.shortcut) this.cardSettings.shortcut = { visible, limit: 5 }
      else this.cardSettings.shortcut.visible = visible
      wsCache.set('shortcutCardVisible', visible)
    },
    setScheduleCardVisible(visible: boolean) {
      if (!this.cardSettings.schedule) this.cardSettings.schedule = { visible, limit: 5 }
      else this.cardSettings.schedule.visible = visible
      wsCache.set('scheduleCardVisible', visible)
    },
    setFileCardVisible(visible: boolean) {
      if (!this.cardSettings.file) this.cardSettings.file = { visible, limit: 5 }
      else this.cardSettings.file.visible = visible
      wsCache.set('fileCardVisible', visible)
    },
    setTodoCardLimit(limit: number) {
      if (!this.cardSettings.todo) this.cardSettings.todo = { visible: true, limit }
      else this.cardSettings.todo.limit = limit
      wsCache.set('todoCardLimit', limit)
    },
    setNoticeCardLimit(limit: number) {
      if (!this.cardSettings.notice) this.cardSettings.notice = { visible: true, limit }
      else this.cardSettings.notice.limit = limit
      wsCache.set('noticeCardLimit', limit)
    },
    setShortcutCardLimit(limit: number) {
      if (!this.cardSettings.shortcut) this.cardSettings.shortcut = { visible: true, limit }
      else this.cardSettings.shortcut.limit = limit
      wsCache.set('shortcutCardLimit', limit)
    },
    setScheduleCardLimit(limit: number) {
      if (!this.cardSettings.schedule) this.cardSettings.schedule = { visible: true, limit }
      else this.cardSettings.schedule.limit = limit
      wsCache.set('scheduleCardLimit', limit)
    },
    setFileCardLimit(limit: number) {
      if (!this.cardSettings.file) this.cardSettings.file = { visible: true, limit }
      else this.cardSettings.file.limit = limit
      wsCache.set('fileCardLimit', limit)
    }
  },
  persist: false
})

export const useAppStoreWithOut = () => {
  return useAppStore(store)
}
