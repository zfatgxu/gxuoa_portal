import request from '@/config/axios'

//提交印章申请
export const submitSealApplication = async (data: any) => {
  return await request.post({ 
    url: '/bpm/seal/create',
    data: data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

//获取印章申请分页
export const getSealApplicationPage = async (data: any) => {
  return await request.get({
    url: '/bpm/seal/page',
    params: data
  })
}

// 根据id获取印章申请
export const getSealApplicationById = async (id: number) => {
  return await request.get({
    url: '/bpm/seal/get?id=' + id
  })

}

//获取待办分页
export const getSealTodoPage = async (data: any) => {
  return await request.get({
    url: '/bpm/seal/todo-page',
    params: data
  })
}
