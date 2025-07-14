<template>
  <div style="border: 1px solid #dcdfe6; border-radius: 4px; overflow: hidden;">
    <!-- 固定高度且允许内部溢出滚动 -->
    <el-scrollbar style="height: 500px;">
      <div
        style="display: flex; flex-wrap: wrap; gap: 14px; padding: 10px;"
      >
        <el-tooltip
          v-for="(item, index) in equipmentOptions"
          :key="index"
          :content="item.detail"
          placement="top"
          effect="dark"
        >
          <div
            style="
          display: flex;
          align-items: center;
          border: 1px solid #ebeef5;
          border-radius: 6px;
          padding: 10px 12px;
          width: 280px;
          box-sizing: border-box;
          flex-shrink: 0;
        "
          >
            <el-checkbox
              v-model="item.checked"
              @change="val => handleCheckChange(val, item)"
              style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
            >
              {{ item.equipmentName }}
            </el-checkbox>

            <el-input-number
              v-model="item.num"
              :min="0"
              :max="item.MaxNum"
              style="margin-left: 10px; width: 100px;"
              @change="val => handleNumChange(val, item)"
            />
          </div>
        </el-tooltip>
      </div>
    </el-scrollbar>


    <!-- 底部操作 -->
    <div style="text-align: right; margin-top: 20px;">
      <el-button @click="emit('close')">关闭</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted } from 'vue'
import { RoomEquipmentApi } from '@/api/meetingroom/roomequipment'
const emit = defineEmits(['update:selectedEquipments', 'close'])
const equipmentOptions = ref([])

const props = defineProps({
  meetingRoomId: {
    type: [Number,String],
    required: true
  },
  selectedEquipments: {
    type: Array,
    default: () => []
  }
})
// 初始化加载设备
async function loadEquipmentOptions() {
  try {
    console.log('子组件接收到会议室 ID：', props.meetingRoomId)
    const res = await RoomEquipmentApi.getEquipmentByRoomId(props.meetingRoomId)
    equipmentOptions.value = res.map(item => ({
      id: item.id,
      equipmentName: item.equipmentName,
      num: item.num,
      detail: item.detail,
      MaxNum: item.num,
      checked: true,
    }))
// 如果 selectedEquipments 非空，进行对比更新
    if (props.selectedEquipments && props.selectedEquipments.length > 0) {
      // 遍历 equipmentOptions
      equipmentOptions.value.forEach(opt => {
        // 查找该 id 是否在父组件传进来的 selectedEquipments 中
        const match = props.selectedEquipments.find(sel => sel.id === opt.id)
        if (match) {
          // 如果找到了，把 num 替换，checked 改为 true
          opt.num = match.num
          opt.checked = true
        } else {
          // 没有找到，num 设 0，checked 设 false
          opt.num = 0
          opt.checked = false
        }
      })
    }

  } catch (error) {
    console.error('获取设备列表失败', error)
  }
}

// 页面加载时调用
onMounted(() => {
  loadEquipmentOptions()
})


function handleCheckChange(val, item) {
  if (!val) {
    item.num = 0
  } else if (item.num === 0) {
    item.num = 1
  }
}

function handleNumChange(val, item) {
  if (val === 0) {
    item.checked = false
  } else {
    item.checked = true
  }
}

function handleSave() {
  const selectedEquipments = equipmentOptions.value.filter(e => e.checked && e.num > 0)
  console.log('已选择设备:', selectedEquipments)
  emit('update:selectedEquipments', selectedEquipments)
  emit('close')
}
</script>
