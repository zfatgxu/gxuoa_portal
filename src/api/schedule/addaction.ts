import request from '@/config/axios'

//提交活动
export const submitScheduleWeekTask = async (data: any) => {
  return await request.post({ 
    url: '/leadarrange/week-task/create', 
    data: data,
  })
}

//更新活动
export const updateScheduleWeekTask = async (data: any) => {
  return await request.put({
    url: '/leadarrange/week-task/update', 
    data: data,
  })
}

//获取活动列表
export const getScheduleWeekTaskList = async (data: any) => {
  return await request.get({
    url: '/leadarrange/week-task/page',
    params: data
  })
}

//删除活动
export const deleteScheduleWeekTask = async (id: number) => {
  return await request.delete({
    url: '/leadarrange/week-task/delete',
    params: { id }
  })
}

//导出活动
export const exportScheduleWeekTask = async (data: any) => {
  return await request.download({
    url: '/leadarrange/week-task/export-excel',
    params: data
  })
}