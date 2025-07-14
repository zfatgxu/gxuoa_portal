<template>
    <!-- 顶部筛选表单和发起按钮 -->
    <ContentWrap>
      <el-form :inline="true" :model="queryParams" @submit.prevent>
        <el-form-item label="材料名称">
          <el-input v-model="queryParams.materialName" placeholder="请输入材料名称" clearable />
        </el-form-item>
        <el-form-item label="材料类型">
          <el-select v-model="queryParams.materialType" clearable placeholder="请选择材料类型">
            <el-option label="合同类材料" value="合同类材料" />
            <el-option label="合同类材料，未经过法务审核" value="合同类材料，未经过法务审核" />
            <el-option label="合同类材料，经过法务分室" value="合同类材料，经过法务分室" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button plain type="primary" @click="handleCreate">
            <Icon class="mr-5px" icon="ep:plus" />
            发起印章申请
          </el-button>
          <!-- 选择单位弹窗 -->
          <el-dialog v-model="dialogVisible" title="请选择申请单位" width="400px">
            <el-form>
              <el-form-item label="单位">
                <el-select v-model="selectedUnit" placeholder="请选择单位" filterable style="width: 300px">
                  <el-option v-for="unit in unitList" :key="unit.id" :label="unit.name" :value="unit.id" />
                </el-select>
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" :disabled="!selectedUnit" @click="handleUnitConfirm">确定</el-button>
            </template>
          </el-dialog>
        </el-form-item>
      </el-form>
    </ContentWrap>
  
    <!-- 列表 -->
    <ContentWrap>
      <el-table v-loading="loading" :data="list">
        <el-table-column align="center" label="申请编号" prop="id" />
        <el-table-column align="center" label="状态" prop="status">
          <template #default="scope">
            <dict-tag :type="DICT_TYPE.SEAL_APPLY_STATE" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="材料名称" prop="materialName" />
        <el-table-column align="center" label="材料类型" prop="materialType" />
        <el-table-column align="center" label="印章类型">
          <template #default="scope">
            <div v-for="seal in scope.row.sealTypes" :key="seal">
              {{ sealLabel(seal) }} × {{ scope.row.sealCounts[seal] || 0 }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="经办人签字" prop="manager" />
        <el-table-column align="center" label="单位负责人签字" prop="leader" />
        <el-table-column align="center" label="联系方式" prop="contact" />
        <el-table-column align="center" label="操作" width="120">
          <template #default="scope">
            <el-button size="mini" @click="viewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </ContentWrap>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { DICT_TYPE } from '@/utils/dict'
  import { getSimpleDeptList } from '@/api/system/dept'
  import * as SealApi from '@/api/seal'
  
  const router = useRouter()
  const loading = ref(false)
  const list = ref([]) // 数据列表
  const queryParams = ref({
    materialName: '',
    materialType: ''
  })
  // 单位选择弹窗相关
  const dialogVisible = ref(false)
  const selectedUnit = ref('')
  const unitList = ref([])
  
  const fetchUnitList = async () => {
    const res = await getSimpleDeptList()
    // 兼容返回结构
    unitList.value = Array.isArray(res) ? res : (res.data || [])
  }
  
  const sealLabel = (val: string) => {
    const map = {
      seal1: '中共广西大学委员会',
      seal2: '广西大学（红印）',
      seal3: '广西大学（黑印）',
      seal4: '广西大学校长办公室（红印）'
    }
    return map[val] || val
  }
  
  // 查询、重置、发起、详情等方法
  const handleQuery = () => {
    // TODO: 查询逻辑
  }
  const resetQuery = () => {
    queryParams.value = { materialName: '', materialType: '' }
    handleQuery()
  }
  const handleCreate = () => {
    selectedUnit.value = ''
    fetchUnitList()
    dialogVisible.value = true
  }
  
  const handleUnitConfirm = () => {
    dialogVisible.value = false
    // 跳转并携带单位参数（单位ID）
    const selectedUnitObj = unitList.value.find(u => u.id === selectedUnit.value)
    router.push({
      name: 'SealCreate',
      query: {
        unit: selectedUnit.value,
        unitName: selectedUnitObj ? selectedUnitObj.name : ''
      }
    })
  }

  //获取印章申请分页
  const getSealApplicationPage = async (data: any) => {
    const res = await SealApi.getSealApplicationPage(data)
    list.value = res.list
    
  }
  
  const viewDetail = (row: any) => {
    router.push({ name: 'SealDetail', query: { id: row.id } })
  }
  onMounted(() => {
    getSealApplicationPage()
  })
  </script>