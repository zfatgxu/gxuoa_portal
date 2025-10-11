import { ref, computed, watchEffect } from 'vue'
import { useWebSocket } from '@vueuse/core'
import { getRefreshToken } from '@/utils/auth'
import { useMessage } from '@/hooks/web/useMessage'
import { ElNotification } from 'element-plus'

/**
 * 建立全局 WebSocket 连接并处理通知
 * 调用后即自动运行，无需在组件中再写 watchEffect
 */
export function useWsNotifications() {
  /* ---------- 连接 ---------- */
  const message = useMessage()
  const server = ref(
    (import.meta.env.VITE_BASE_URL + '/infra/ws').replace('http', 'ws') +
      '?token=' +
      getRefreshToken()
  )
  const { status, data, send, close, open } = useWebSocket(server.value, {
    autoReconnect: true,
    heartbeat: true
  })
  const getIsOpen = computed(() => status.value === 'OPEN')
  const getTagColor = computed(() => (getIsOpen.value ? 'success' : 'red'))

  /* ---------- 消息处理 ---------- */
  watchEffect(() => {
    if (!data.value || data.value === 'pong') return

    try {
      // 外层
      const jsonMessage = JSON.parse(data.value)
      const type = jsonMessage.type

      // content 可能是普通字符串，也可能是 JSON 字符串
      let content: any
      try {
        content = JSON.parse(jsonMessage.content)
      } catch {
        content = { content: jsonMessage.content }
      }

      if (!type) {
        message.error('未知的消息类型：' + data.value)
        return
      }

      // 通知封装
      const notify = (msg: string, messageId?: number) => {
        ElNotification({
          message: msg.replace(/\n/g, '<br/>'),
          dangerouslyUseHTMLString: true,
          type: 'success',
          duration: 10000,
          offset: 50,
          onClick: async () => {
            try {
              // 如果有messageId，通过API获取消息详情来获取documentId
              if (messageId) {
                const { getNotifyMessage } = await import('@/api/system/notify/message')
                const messageDetail = await getNotifyMessage(messageId)

                if (messageDetail && messageDetail.templateParams) {
                  let templateParams = messageDetail.templateParams

                  // 如果templateParams是字符串，需要解析
                  if (typeof templateParams === 'string') {
                    try {
                      templateParams = JSON.parse(templateParams)
                    } catch (e) {
                      console.error('解析templateParams失败:', e)
                    }
                  }

                  // 获取documentId
                  const documentId = templateParams.documentId || templateParams.id

                  if (documentId) {
                    // 在新窗口打开 document_approval 页面，使用真实的文档ID
                    const baseUrl = window.location.origin
                    const documentUrl = `${baseUrl}/#/document_approval?id=${documentId}&type=3&isTodo=1`
                    window.open(documentUrl, '_blank')
                    return
                  }
                }
              }

              // 如果无法获取documentId，显示错误信息
              console.error('无法获取文档ID')
              // message.error('无法获取文档ID，请检查消息数据')
            } catch (error) {
              // console.error('跳转失败:', error)
              // message.error('跳转失败，请重试')
            }
          }
        })
      }

      if (type === 'notice_document_reply') {
        const messageId = content.messageId || jsonMessage.messageId
        notify(typeof content === 'string' ? content : content.content, messageId)
        return
      }

      if (type === 'notice_document_todo') {
        const messageId = content.messageId || jsonMessage.messageId
        notify(typeof content === 'string' ? content : content.content, messageId)
        return
      }

      message.error('未处理消息：' + data.value)
    } catch (err) {
      console.error(err)
      message.error('处理消息发生异常：' + data.value)
    }
  })

  // 如有需要，可把 ws 实例返回给调用者
  return { status, data, send, close, open, getIsOpen, getTagColor }
}
