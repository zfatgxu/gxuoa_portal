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
      const notify = (msg: string) => {
        ElNotification({
          message: msg.replace(/\n/g, '<br/>'),
          dangerouslyUseHTMLString: true,
          type: 'success',
          duration: 10000,
          offset: 50
        })
      }

      if (type === 'notice_document_reply') {
        notify(typeof content === 'string' ? content : content.content)
        return
      }

      if (type === 'notice_document_todo') {
        notify(typeof content === 'string' ? content : content.content)
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