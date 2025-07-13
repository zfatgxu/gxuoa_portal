import { Layout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()

// 邮件路由
export default [
  {
    path: '/mail',
    component: Layout,
    redirect: '/mail/write',
    name: 'Mail',
    meta: {
      title: '内部邮件',
      icon: 'ep:message',
      orderNo: 5000
    },
    children: [
      {
        path: 'write',
        component: () => import('@/views/mail/write.vue'),
        name: 'MailWrite',
        meta: {
          title: '写信'
        }
      }
    ]
  }
]
