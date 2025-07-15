<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <div class="equipment-container">
      <div class="tag-wrapper">
        <el-tag
          v-for="(item, index) in equipmentList"
          :key="index"
          type="info"
          class="equipment-tag"
          closable
          disable-transitions
          @close="handleTagClose(item, index)"
          @click="handleTagClick(item)"
          :title="item.detail"
        >
          {{ item.equipmentName }} * {{ item.num }}
        </el-tag>
      </div>
    </div>

    <!-- 左下角按钮区域 -->
    <div class="bottom-action">
      <el-button size="small" @click="handleClear">清空</el-button>
      <el-button size="small" type="primary" @click="handleAdd">添加</el-button>
    </div>

    <!-- 设备编辑弹窗 -->
    <el-drawer
      v-model="editDrawerVisible"
      :title="action === 'add' ? '添加设备' : '编辑设备'"
      size="30%"
    >
      <el-form label-width="80px">
        <el-form-item label="设备名称">
          <el-input v-model="editItem.equipmentName" :disabled="action === 'edit'" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="editItem.num" :min="1" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="editItem.detail" rows="3" />
        </el-form-item>
      </el-form>
      <div style="text-align: right;">
        <el-button @click="editDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">
          {{ action === 'add' ? '添加' : '修改' }}
        </el-button>
      </div>
    </el-drawer>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { RoomEquipmentApi } from '@/api/meetingroom/roomequipment'
import { ElMessageBox, ElMessage } from 'element-plus'

const handleClear = async () => {
  await RoomEquipmentApi.deleteAllEquipment(meetingRoomId.value).then(res =>{
    // 如果不需要确认，直接清空
    equipmentList.value = []
    // 可选提示
    ElMessage.success('已清空设备')
    }
  ).catch(error => {
    console.error(error)
  })


}

const handleTagClose = async (item, index) => {
  try {
    // 先弹出确认框
    await ElMessageBox.confirm(
      `确定要删除设备「${item.equipmentName}」吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // ✅ 用户点击确定后的逻辑，可接后端接口
    // await deleteEquipmentApi(item.id) // 若有后端可调用此处
    await RoomEquipmentApi.deleteEquipment(item.id).then(
      // 本地删除
      equipmentList.value.splice(index, 1)
    )

    ElMessage.success('删除成功')
  } catch (error) {
    // 点击取消或关闭弹窗时走这里
    console.log(error)
    ElMessage.info('已取消删除')
  }
}

const handleSaveEdit = () => {
  if (action.value === 'add') {
    // 添加逻辑
    let req = {
      equipmentName: editItem.value.equipmentName,
      num: editItem.value.num,
      detail: editItem.value.detail,
      meetingRoomId: meetingRoomId.value
    }
    RoomEquipmentApi.createEquipment(req).then(res =>{
        // 一般直接 push 到设备列表
        equipmentList.value.push({
          id: res,
          equipmentName: editItem.value.equipmentName,
          num: editItem.value.num,
          detail: editItem.value.detail,
        })
        console.log('添加设备成功:', res)
    }
    )

  } else if (action.value === 'edit') {
    // 修改逻辑
    // 找到原列表中对应的项进行更新
    const index = equipmentList.value.findIndex(item => item.equipmentName === editItem.value.equipmentName)
    if (index !== -1) {
      equipmentList.value[index] = { ...editItem.value }
      console.log('修改设备成功:', editItem.value)
    } else {
      console.warn('未找到要修改的设备')
    }
  }
  // 关闭抽屉
  editDrawerVisible.value = false
}

const dialogVisible = ref(false)
const dialogTitle = ref()
const action = ref()
const meetingRoomId = ref()
const editDrawerVisible = ref(false)
// 设备列表数据（模拟）
const equipmentList = ref([])
const editItem = ref({
  equipmentName: '',
  num: 1,
  detail: ''
})
// 点击标签弹出编辑抽屉
const handleTagClick = (item) => {
  editItem.value = {
    equipmentName: item.equipmentName,
    num: item.num,
    detail: item.detail
  } // 浅拷贝，防止直接修改
  action.value = "edit"
  editDrawerVisible.value = true
}

const handleAdd =() =>{
  editItem.value ={
    id: null,
    num: 1,
    equipmentName: "",
    detail: ""
  }
  action.value = "add"
  editDrawerVisible.value = true
}

// 对外暴露 open 方法，父组件可调用 open(type, id)
const open = (type, id) => {
  console.log('接收到参数：', type, id)
  meetingRoomId.value = id
  // ❗️此处仅做演示，后续可根据 id 查询后端数据填充
  RoomEquipmentApi.getEquipmentByRoomId(meetingRoomId.value).then(res => {
    console.log("结果",res)
    equipmentList.value = res
  }).catch(error => {
    console.error(error)
  })
  dialogVisible.value = true
  dialogTitle.value = "设备" + type
}

defineExpose({ open })
</script>

<style scoped>
.equipment-container {
  max-height: 300px; /* 最大高度，可按需继续调整 */
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #f9fafc;
}

.tag-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* 标签间距稍微再大一点 */
}

.equipment-tag {
  margin: 8px 0;         /* 上下留更多空间 */
  padding: 6px 12px;     /* 内部填充增大，整体更大更舒服 */
  font-size: 14px;       /* 字体更大，默认一般是 12px，这里提升可读性 */
  cursor: pointer;       /* 鼠标悬浮为 pointer，提示可点击 */
}

.bottom-action {
  margin-top: 20px; /* 与标签区域再多留一些距离 */
  text-align: left;
}
</style>
