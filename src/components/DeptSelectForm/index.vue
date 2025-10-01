<template>
  <Dialog v-model="dialogVisible" title="部门选择" width="600">
    <el-row v-loading="formLoading">
      <el-col :span="24">
        <ContentWrap class="h-1/1">
          <el-tree
            ref="treeRef"
            :key="treeRenderKey"
            :data="deptTree"
            :props="defaultProps"
            show-checkbox
            :check-strictly="checkStrictly"
            check-on-click-node
            :default-expanded-keys="[]"
            highlight-current
            node-key="id"
            @check="handleCheck"
          />
        </ContentWrap>
      </el-col>
    </el-row>
    <template #footer>
      <el-button
        :disabled="formLoading || !selectedDeptIds?.length"
        type="primary"
        @click="submitForm"
      >
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'

defineOptions({ name: 'DeptSelectForm' })

const emit = defineEmits<{
  confirm: [deptList: any[]]
}>()

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const props = defineProps({
  // 是否严格的遵循父子不互相关联
  checkStrictly: {
    type: Boolean,
    default: false
  },
  // 是否支持多选
  multiple: {
    type: Boolean,
    default: true
  }
})

const treeRef = ref()
const treeRenderKey = ref(0)
const deptTree = ref<Tree[]>([]) // 部门树形结构
const selectedDeptIds = ref<number[]>([]) // 选中的部门 ID 列表
const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中

/** 打开弹窗 */
const open = async (selectedList?: DeptApi.DeptVO[]) => {
  resetForm()
  formLoading.value = true
  try {
    // 加载部门列表
    const deptData = await DeptApi.getSimpleDeptList()
    deptTree.value = handleTree(deptData)
  } finally {
    formLoading.value = false
  }
  dialogVisible.value = true
  await nextTick()
  // 打开时强制全部折叠
  if (treeRef.value && typeof treeRef.value.collapseAll === 'function') {
    try { treeRef.value.collapseAll() } catch (e) {}
  } else {
    // 兼容不支持 collapseAll 的环境，通过重渲染实现默认折叠
    treeRenderKey.value += 1
    await nextTick()
  }
  // 设置已选择的部门（不自动展开）
  if (selectedList?.length) {
    const selectedIds = selectedList
      .map((dept) => dept.id)
      .filter((id): id is number => id !== undefined)
    selectedDeptIds.value = selectedIds
    treeRef.value?.setCheckedKeys(selectedIds)
  }
}

/** 处理选中状态变化 */
const handleCheck = (data: any, checked: any) => {
  selectedDeptIds.value = treeRef.value.getCheckedKeys()
  if (!props.multiple && selectedDeptIds.value.length > 1) {
    // 单选模式下，只保留最后选择的节点
    const lastSelectedId = selectedDeptIds.value[selectedDeptIds.value.length - 1]
    selectedDeptIds.value = [lastSelectedId]
    treeRef.value.setCheckedKeys([lastSelectedId])
  }
}

/** 提交选择 */
const submitForm = async () => {
  try {
    // 获取选中的完整部门数据
    const checkedNodes = treeRef.value.getCheckedNodes()
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    emit('confirm', checkedNodes)
  } finally {
  }
}

/** 重置表单 */
const resetForm = () => {
  deptTree.value = []
  selectedDeptIds.value = []
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([])
  }
  // 确保下次打开时为折叠初始态
  treeRenderKey.value += 1
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>
