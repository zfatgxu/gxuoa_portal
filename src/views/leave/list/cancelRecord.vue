<template>
<ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
    class="-mb-15px"
    :model="queryParams"
    ref="queryFormRef"
    :inline="true"
    label-width="68px"
    >
    <el-form-item label="开始时间" prop="startDate">
        <el-date-picker
        v-model="queryParams.startDate"
        value-format="YYYY-MM-DD HH:mm:ss"
        type="date"
        placeholder="请选择开始日期"
        class="!w-220px"
        />
    </el-form-item>
    <el-form-item label="结束时间" prop="endDate">
        <el-date-picker
        v-model="queryParams.endDate"
        value-format="YYYY-MM-DD HH:mm:ss"
        type="date"
        placeholder="请选择结束日期"
        class="!w-220px"
        />
    </el-form-item>
    <el-form-item label="请假人" prop="personId">
        <el-input v-model="queryParams.personId" placeholder="请输入请假人" class="!w-220px" clearable/>
    </el-form-item>
    <el-form-item label="单位" prop="deptId">
        <el-input v-model="queryParams.deptId" placeholder="请输入单位" class="!w-220px" clearable/>
    </el-form-item>
    <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
    </el-form-item>
    </el-form>
</ContentWrap>

<!-- 列表 -->
<ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
    <!-- <el-table-column label="主键，自增" align="center" prop="id" /> -->
    <el-table-column label="请假人" align="center" prop="nickName" />
    <el-table-column label="单位" align="center" prop="deptName" />
    <el-table-column
        label="开始时间"
        align="center"
        prop="startDate"
        :formatter="dateFormatter2"
    />
    <el-table-column
        label="结束时间"
        align="center"
        prop="endDate"
        :formatter="dateFormatter2"
    />
    <el-table-column label="流转状态" align="center" prop="status">
        <template #default="scope">
        <el-tag :type="getStatusTagType(scope.row)">
            {{ getStatusLabel(scope.row) }}
        </el-tag>
        <!-- <dict-tag :type="DICT_TYPE.LEAVE_STATUS" :value="scope.row.status"/> -->
        </template>
    </el-table-column>
    <el-table-column label="操作" align="center">
        <template #default="scope">
        <el-button link type="primary" @click="seekDetail(scope.row)"  v-if="hasCanceling(scope.row)">查看详情</el-button>
        </template>
    </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
    :total="total"
    v-model:page="queryParams.pageNo"
    v-model:limit="queryParams.pageSize"
    @pagination="getList"
    />
</ContentWrap>

</template>

<script setup lang="ts">
import { dateFormatter2 } from '@/utils/formatTime'
import { CancelFormApi } from '@/api/leave/create/createForm'
import { useRouter } from 'vue-router'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
/** 请假登记 列表 */
defineOptions({ name: 'Register' })

const router = useRouter()
const loading = ref(true) // 列表的加载中
const list = ref<any[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
pageNo: 1,
pageSize: 10,
personId: undefined,
deptId: undefined,
startDate: undefined,
endDate: undefined,
destination: undefined,
hostArrangement: undefined,
remark: undefined,
leaderOpinion: undefined,
hostId: undefined,
status: undefined,
personAdmitId: undefined,
createTime: [],
})
const queryFormRef = ref() // 搜索的表单
/** 查询列表 */
const getList = async () => {
loading.value = true
try {
    const data = await CancelFormApi.getCancelFormPage(queryParams)
    list.value = data.list
    total.value = data.total
} finally {
    loading.value = false
}
}

/** 搜索按钮操作 */
const handleQuery = () => {
queryParams.pageNo = 1
getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
queryFormRef.value.resetFields()
handleQuery()
}

/** 判断是否处于销假中 */
const hasCanceling = (row:any): boolean => {
return row.cancelForm.processInstanceId !== null;
};

const getStatusTagType = (row:any) => {
switch (parseInt(row.cancelForm.status)) {
    case 1: return 'warning' // 待会签
    case 3: return 'primary' // 待销假
    case 2: return 'success' // 已销假
    case 0: return 'info'  // 待审批
    default: return ''
}
}

/** 获取状态标签文本 */
const getStatusLabel = (row:any) => {
const dictList = getIntDictOptions(DICT_TYPE.CANCELSTATUE)
console.log(dictList)
const dict = dictList.find(item => parseInt(item.value) === parseInt(row.cancelForm.status))
return dict ? dict.label : '未知状态'
}


/** 查看销假详情 */
const seekDetail=(row:any)=>{
router.push({
    path: '/bpm/process-instance/detail',
    query: {
    id: row.cancelForm.processInstanceId
    }
})
}

/** 初始化 **/
onMounted(() => {
getList()
})
</script>
