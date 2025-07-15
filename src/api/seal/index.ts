import request from '@/config/axios'

//提交印章申请
export const submitSealApplication = async (data: any) => {
  return await request.post({ 
    url: '/bpm/seal/seal_apply/create', 
    data: data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

//获取印章申请分页
export const getSealApplicationPage = async (data: any) => {
  return await request.get({
    url: '/bpm/seal/seal_apply/page',
    params: data
  })
}

// 根据id获取印章申请
export const getSealApplicationById = async (id: number) => {
  return await request.get({
    url: '/bpm/seal/seal_apply/get?id=' + id
  })
}
