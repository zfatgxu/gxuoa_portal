<script lang="tsx">
import { ElBreadcrumb, ElBreadcrumbItem } from 'element-plus'
import { ref, watch, computed, unref, defineComponent, TransitionGroup } from 'vue'
import { useRouter } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import { filterBreadcrumb } from './helper'
import { filter, treeToList } from '@/utils/tree'
import type { RouteLocationNormalizedLoaded, RouteMeta } from 'vue-router'

import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('breadcrumb')

const appStore = useAppStore()

// 面包屑图标
const breadcrumbIcon = computed(() => appStore.getBreadcrumbIcon)

export default defineComponent({
  name: 'Breadcrumb',
  setup() {
    const { currentRoute } = useRouter()

    const { t } = useI18n()

    const levelList = ref<AppRouteRecordRaw[]>([])

    const permissionStore = usePermissionStore()

    const menuRouters = computed(() => {
      const routers = permissionStore.getRouters
      return filterBreadcrumb(routers)
    })

    const getBreadcrumb = () => {
      const matched = currentRoute.value.matched.filter(item => item.meta && item.meta.title)
      
      // 构建完整的面包屑路径
      levelList.value = []
      
      // 遍历匹配的路由，构建层级结构
      for (let i = 0; i < matched.length; i++) {
        const route = matched[i]
        const meta = route.meta as RouteMeta
        
        // 跳过隐藏的路由（除非设置了canTo）
        if (meta.hidden && !meta.canTo) {
          continue
        }
        
        // 跳过不显示在面包屑中的路由
        if (meta.breadcrumb === false) {
          continue
        }
        
        // 构建面包屑项
        const breadcrumbItem: AppRouteRecordRaw = {
          path: route.path,
          name: route.name,
          meta: route.meta,
          redirect: route.redirect
        }
        
        levelList.value.push(breadcrumbItem)
      }
    }

    const renderBreadcrumb = () => {
      return levelList.value.map((v) => {
        const disabled = !v.redirect || v.redirect === 'noredirect'
        const meta = v.meta as RouteMeta
        return (
          <ElBreadcrumbItem to={{ path: disabled ? '' : v.path }} key={v.name}>
            {meta?.icon && breadcrumbIcon.value ? (
              <div class="flex items-center " >
                <Icon icon={meta.icon} class="mr-[2px]" svgClass="inline-block"></Icon>
                {t(v?.meta?.title)}
              </div>
            ) : (
              t(v?.meta?.title)
            )}
          </ElBreadcrumbItem>
        )
      })
    }

    watch(
      () => currentRoute.value,
      (route: RouteLocationNormalizedLoaded) => {
        if (route.path.startsWith('/redirect/')) {
          return
        }
        getBreadcrumb()
      },
      {
        immediate: true
      }
    )

    return () => (
      <ElBreadcrumb separator="/" class={`${prefixCls} flex items-center h-full ml-[10px]`}>
        <TransitionGroup appear enter-active-class="animate__animated animate__fadeInRight">
          {renderBreadcrumb()}
        </TransitionGroup>
      </ElBreadcrumb>
    )
  }
})
</script>

<style lang="scss" scoped>
$prefix-cls: #{$elNamespace}-breadcrumb;

.#{$prefix-cls} {
  :deep(.#{$prefix-cls}__item) {
    display: flex;
    .#{$prefix-cls}__inner {
      display: flex;
      align-items: center;
      color: var(--top-header-text-color);
      font-size: 50px;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  :deep(.#{$prefix-cls}__item):not(:last-child) {
    .#{$prefix-cls}__inner {
      color: var(--top-header-text-color);
      font-size: 50px;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  :deep(.#{$prefix-cls}__item):last-child {
    .#{$prefix-cls}__inner {
      display: flex;
      align-items: center;
      color: var(--el-text-color-placeholder);
      font-size: 50px;

      &:hover {
        color: var(--el-text-color-placeholder);
      }
    }
  }
}
</style>
