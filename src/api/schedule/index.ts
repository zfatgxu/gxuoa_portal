import request from '@/config/axios'

//提交活动周
export const submitScheduleWeek = async (data: any) => {
  return await request.post({ 
    url: '/leadarrange/week/create', 
    data: data,
  })
}

//获取活动周列表
export const getScheduleWeekList = async (data: any) => {
  return await request.get({
    url: '/leadarrange/week/page',
    params: data
  })
}

//删除活动周
export const deleteScheduleWeek = async (id: number) => {
  return await request.delete({
    url: '/leadarrange/week/delete',
    params: { id }
  })
}

