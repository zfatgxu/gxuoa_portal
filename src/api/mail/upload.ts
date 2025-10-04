import { service as request } from '@/config/axios/service'

export interface UploadResponse {
  code: number
  data: {
    url: string
    name: string
    size: number
  }
  message: string
}

// 上传图片
export const uploadImage = (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/api/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
