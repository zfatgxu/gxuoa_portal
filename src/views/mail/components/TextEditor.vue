<template>
  <div class="text-editor-wrapper" ref="wrapperRef">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      style="border-bottom: 1px solid #ccc"
    />
    <Editor
      :defaultConfig="editorConfig"
      :mode="mode"
      v-model="valueHtml"
      :style="{ height: height, overflowY: 'hidden' }"
      @on-created="handleCreated"
      @on-change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css'
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { ElMessage } from 'element-plus'
import { uploadImage } from '@/api/mail/upload'

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('')

// 容器 ref（用于处理下拉再次点击关闭）
const wrapperRef = ref<HTMLElement | null>(null)
let lastClickedMenuEl: Element | null = null
let lastMenuKey: string | null = null

// 工具栏配置
const toolbarConfig = {
  toolbarKeys: [
    'headerSelect',
    'blockquote',
    '|',
    'bold',
    'underline',
    'italic',
    'through',
    'color',
    'bgColor',
    '|',
    'fontSize',
    'fontFamily',
    'lineHeight',
    '|',
    'bulletedList',
    'numberedList',
    'todo',
    '|',
    'emotion',
    'insertLink',
    'divider',
    '|',
    'undo',
    'clearStyle',
  ]
}

// 编辑器配置
const editorConfig = {
  placeholder: '请输入正文...',
  // 关闭文本选择时的悬浮菜单（hoverbar）
  hoverbarKeys: {
    text: { menuKeys: [] }
  },
  MENU_CONF: {
    // 配置字体
    fontFamily: {
      fontFamilyList: [
        '黑体',
        '楷体',
        '仿宋',
        '微软雅黑',
        'Arial',
        'Tahoma',
        'Verdana'
      ]
    },
    // 配置字号
    fontSize: {
      fontSizeList: ['12px', '13px', '14px', '15px', '16px', '19px', '22px', '24px', '29px', '32px']
    },
    // 配置颜色
    color: {
      colors: [
        '#000000',
        '#333333',
        '#666666',
        '#999999',
        '#cccccc',
        '#ffffff',
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#ffff00',
        '#00ffff',
        '#ff00ff'
      ]
    },
    // 配置图片上传
    uploadImage: {
      server: '/api/upload/image',
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024, // 5M
      allowedFileTypes: ['image/*'],
      customUpload: async (file: File, insertFn: any) => {
        try {
          const response = await uploadImage(file)
          if (response.code === 200) {
            insertFn(response.data.url, response.data.name, response.data.url)
          } else {
            ElMessage.error('图片上传失败')
          }
        } catch (error) {
          console.error('图片上传失败:', error)
          ElMessage.error('图片上传失败')
        }
      }
    }
  }
}

// 组件属性
interface Props {
  modelValue?: string
  mode?: 'default' | 'simple'
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  mode: 'default',
  height: '400px'
})

// 组件事件
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [editor: any]
  'created': [editor: any]
}>()

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== valueHtml.value) {
    valueHtml.value = newVal
  }
}, { immediate: true })

// 编辑器创建完成
const handleCreated = (editor: any) => {
  editorRef.value = editor
  emit('created', editor)
}

// 编辑器内容变化
const handleChange = (editor: any) => {
  const html = editor.getHtml()
  valueHtml.value = html
  emit('update:modelValue', html)
  emit('change', editor)
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
  // 移除事件监听
  if (wrapperRef.value) {
    wrapperRef.value.removeEventListener('click', onToolbarClick, true)
  }
})

// 暴露编辑器实例
defineExpose({
  editor: editorRef,
  getHtml: () => editorRef.value?.getHtml(),
  getText: () => editorRef.value?.getText(),
  setHtml: (html: string) => editorRef.value?.setHtml(html),
  clear: () => editorRef.value?.clear()
})

// 处理工具栏点击：再次点击同一菜单时关闭下拉/面板
const removeActiveAndPanels = (clickedBtn?: Element | null) => {
  try {
    // 移除面板/弹窗（wangEditor v5 通常挂在 body 上）
    document.querySelectorAll('.w-e-panel, .w-e-modal, .w-e-tooltip').forEach((el) => {
      el.remove()
    })
    // 取消工具栏激活样式
    const container = wrapperRef.value || document
    container.querySelectorAll('.w-e-toolbar .w-e-bar-item.active').forEach((el) => {
      if (!clickedBtn || el === clickedBtn) {
        el.classList.remove('active')
      }
    })
  } catch (err) {
    // 忽略 DOM 操作异常
  }
}

const onToolbarClick = (e: Event) => {
  const target = e.target as Element | null
  if (!target) return
  const menuBtn = target.closest('.w-e-toolbar .w-e-bar-item') as HTMLElement | null
  if (!menuBtn) return
  const menuKey = menuBtn.getAttribute('data-menu-key') || null

  const hasOpenPanel = !!document.querySelector('.w-e-panel, .w-e-modal')

  // 若二次点击同一菜单（基于元素或 menuKey），则在捕获阶段拦截并关闭
  if (lastClickedMenuEl === menuBtn || (lastMenuKey && menuKey && lastMenuKey === menuKey)) {
    if (hasOpenPanel) {
      // 阻止后续冒泡到内部，从而避免再次打开
      e.stopPropagation()
      e.preventDefault()
      try {
        // 使用官方 API 关闭面板/弹窗
        ;(editorRef.value as any)?.hidePanelOrModal?.()
      } catch {}
      // 兜底：移除 DOM 悬浮层与激活样式
      removeActiveAndPanels(menuBtn)
      lastClickedMenuEl = null
      lastMenuKey = null
      return
    }
  }

  // 记录最新一次点击
  lastClickedMenuEl = menuBtn
  lastMenuKey = menuKey
}

onMounted(() => {
  if (wrapperRef.value) {
    // 使用捕获阶段，确保在内部组件处理前先记录点击
    wrapperRef.value.addEventListener('click', onToolbarClick, true)
  }
})
</script>

<style scoped>
.text-editor-wrapper {
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

/* 自定义工具栏悬停样式 - 让灰色选中标识更深 */
:deep(.w-e-toolbar .w-e-bar-item:hover) {
  background-color: #e6e6e6 !important; /* 更深的灰色悬停背景 */
}

:deep(.w-e-toolbar .w-e-bar-item button:hover) {
  background-color: #e6e6e6 !important; /* 按钮悬停背景 */
}

/* 下拉选择按钮的悬停效果 */
:deep(.w-e-toolbar .w-e-bar-item .select-button:hover) {
  background-color: #e6e6e6 !important;
}

/* 分组按钮的悬停效果 */
:deep(.w-e-toolbar .w-e-bar-item .group-button:hover) {
  background-color: #e6e6e6 !important;
}

/* 普通按钮的悬停效果 */
:deep(.w-e-toolbar .w-e-bar-item .button:hover) {
  background-color: #e6e6e6 !important;
}
</style>
