import { ElMessageBox } from 'element-plus'

// KKFileView预览服务器地址
const KK_FILE_VIEW_URL = import.meta.env.VITE_KK_FILE_VIEW_URL || 'http://kkfileview.nnruibo.cn'

// Base64编码工具
const Base64 = {
  encode: (str: string): string => {
    return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16))
    }))
  }
}

/**
 * KKFileView文件预览工具
 */
export const KKFileView = {
  /**
   * 预览文件
   * @param fileUrl 文件URL
   * @param fileName 文件名称（可选）
   */
  preview(fileUrl: string, fileName?: string): void {
    if (!fileUrl) {
      ElMessageBox.alert('文件地址不能为空', '预览失败', {
        confirmButtonText: '确定',
        type: 'error'
      })
      return
    }

    try {
      // 解码URL（如果已经是编码状态）
      const href = decodeURIComponent(fileUrl)
      
      // 使用Base64编码
      const b64Encoded = Base64.encode(href)
      
      // 构建预览URL
      const previewUrl = `${KK_FILE_VIEW_URL}/onlinePreview?url=${encodeURIComponent(b64Encoded)}&baseUrl=base64`
      
      // 在新窗口中打开预览
      window.open(previewUrl, '_blank')
      
      console.log('预览URL:', previewUrl) // 调试用
    } catch (error) {
      console.error('文件预览失败:', error)
      ElMessageBox.alert('文件预览失败，请稍后再试', '预览失败', {
        confirmButtonText: '确定',
        type: 'error'
      })
    }
  }
}
