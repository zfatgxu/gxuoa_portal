<template>
  <el-dialog
    v-model="visible"
    title="会议室列表"
    width="1200px"
  >
    <el-table
      :data="paginatedData"
      style="width: 100%"
      border
    >
      <el-table-column prop="deptName" label="部门" />
      <el-table-column prop="roomName" label="会议室名称" />
      <el-table-column prop="location" label="位置" />
      <el-table-column prop="capacity" label="容量" />
      <el-table-column prop="startTime" label="开始时间" />
      <el-table-column prop="endTime" label="结束时间" />
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="goToApplyForm(scope.row)">
            预约
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="tableData.length"
      layout="prev, pager, next"
      style="margin-top: 20px; text-align: right;"
    />
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps({
  visible: Boolean,
  data: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:visible'])

const currentPage = ref(1)
const pageSize = ref(10)

const tableData = ref(props.data)

watch(
  () => props.data,
  (newVal) => {
    tableData.value = newVal
  }
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tableData.value.slice(start, end)
})

const goToApplyForm = (row) => {
  console.log("当前行数据", row)

  sessionStorage.setItem('selectedRoomInfo', JSON.stringify({
    id: row.id,
    name: row.roomName,
    capacity: row.capacity,
    deptName: row.deptName,
    location: row.location,
    startTime: row.startTime,
    endTime: row.endTime,
    meetingRoomId: row.meetingRoomId,
    meetingRoomTimeId: row.meetingRoomTimeId
  }))

  router.push('/meeting/ApplyForm')
}

watch(() => props.visible, (val) => {
  if (!val) {
    currentPage.value = 1
  }
})

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})
</script>
