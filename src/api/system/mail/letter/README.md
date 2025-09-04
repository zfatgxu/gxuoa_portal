# 邮件系统 API 接口

## 概述

这个文件包含了邮件系统的所有API接口，基于后端提供的邮件系统API接口文档实现。

## 主要功能

### 1. 邮件发送
- `sendMail(data: SendMailReqVO)` - 发送邮件
- `saveDraft(data: SendMailReqVO)` - 保存草稿

### 2. 邮件内容管理
- `createMailContent(data: CreateMailContentReqVO)` - 创建邮件内容
- `updateMailContent(data: UpdateMailContentReqVO)` - 更新邮件内容
- `deleteMailContent(id: number)` - 删除邮件内容
- `getMailDetail(id: number)` - 获取邮件详情

### 3. 邮件列表查询
- `getInboxMails(params)` - 获取收件箱邮件
- `getSentMails(params)` - 获取已发送邮件
- `getDraftMails(params)` - 获取草稿邮件
- `getStarredMails(params)` - 获取星标邮件
- `getDeletedMails(params)` - 获取已删除邮件

### 4. 邮件操作
- `markMailAsRead(data: MarkReadReqVO)` - 标记邮件为已读
- `markMailAsUnread(data: MarkReadReqVO)` - 标记邮件为未读
- `toggleMailStar(id: number)` - 切换邮件星标状态
- `deleteMails(data: MarkReadReqVO)` - 删除邮件
- `restoreMails(data: MarkReadReqVO)` - 恢复邮件
- `batchOperationMails(data: BatchOperationReqVO)` - 批量操作邮件

### 5. 搜索和统计
- `searchMails(params: SearchMailReqVO)` - 搜索邮件
- `getMailStats()` - 获取邮件统计信息
- `getContactList(keyword?: string)` - 获取联系人列表

### 6. 账号相关
- `getAccountInboxMails(accountId, params)` - 获取指定账号的收件箱邮件
- `getAccountSentMails(accountId, params)` - 获取指定账号的已发送邮件
- `getAccountMailDetail(accountId, id)` - 获取指定账号的邮件详情
- `markAccountMailRead(accountId, data)` - 标记指定账号的邮件为已读/未读
- `getAccountMailStats(accountId)` - 获取指定账号的邮件统计信息

## 类型定义

### CreateMailContentReqVO
```typescript
interface CreateMailContentReqVO {
  subject: string              // 邮件主题
  content: string              // 邮件内容
  senderId: number             // 发件人ID
  receiverIds: string          // 收件人ID列表，逗号分隔
  ccUserIds?: string           // 抄送人ID列表，逗号分隔
  priority?: number            // 邮件优先级(1-普通,2-重要,3-紧急)
  isDraft?: boolean            // 是否草稿，默认false
  requestReadReceipt?: boolean // 是否请求已读回执，默认false
  status?: number              // 邮件状态(0-正常,1-撤回)，默认0
  folder?: string              // 文件夹类型，默认drafts
  attachmentIds?: string       // 附件ID列表，逗号分隔
}
```

### MailDetailVO
```typescript
interface MailDetailVO {
  id: number
  subject: string
  content: string
  status: number
  folder: string
  senderId: number
  sender: {
    id: number
    nickname: string
    email: string
    workId: string
  }
  receiverIds: string
  receivers: Array<{
    id: number
    nickname: string
    email: string
  }>
  // ... 更多字段
}
```

## 使用示例

```typescript
import { sendMail, saveDraft, getContactList, type CreateMailContentReqVO } from '@/api/system/mail/letter'

// 发送邮件
const sendData: CreateMailContentReqVO = {
  subject: '测试邮件',
  content: '这是一封测试邮件',
  senderId: 1, // 发件人ID
  receiverIds: '2,3', // 收件人ID列表，逗号分隔
  ccUserIds: '4,5', // 抄送人ID列表，逗号分隔
  priority: 1,
  isDraft: false,
  requestReadReceipt: false,
  status: 0,
  folder: 'sent'
}

try {
  await sendMail(sendData)
  console.log('邮件发送成功')
} catch (error) {
  console.error('邮件发送失败:', error)
}

// 保存草稿
const draftData: CreateMailContentReqVO = {
  subject: '草稿邮件',
  content: '这是一封草稿邮件',
  senderId: 1,
  receiverIds: '2',
  priority: 1,
  isDraft: true,
  requestReadReceipt: false,
  status: 0,
  folder: 'drafts'
}

try {
  await saveDraft(draftData)
  console.log('草稿保存成功')
} catch (error) {
  console.error('草稿保存失败:', error)
}

// 获取联系人列表
try {
  const contacts = await getContactList('张三')
  console.log('联系人列表:', contacts)
} catch (error) {
  console.error('获取联系人失败:', error)
}
```

## 注意事项

1. **身份验证**: 所有API接口都需要携带有效的Bearer Token进行身份验证
   - Token会自动通过axios拦截器添加到请求头中：`Authorization: Bearer {token}`
   - 如果token过期，系统会自动尝试刷新token
   - 如果刷新失败，会自动跳转到登录页面

2. **权限控制**: 所有接口都需要相应的权限才能访问
   - `letter:content:create` - 创建邮件权限
   - `letter:content:update` - 更新邮件权限
   - `letter:content:delete` - 删除邮件权限
   - `letter:content:query` - 查询邮件权限
   - `letter:query` - 邮件查询权限
   - `letter:update` - 邮件更新权限
   - `letter:delete` - 邮件删除权限

3. **错误处理**: 所有接口都包含详细的日志输出，便于调试
4. **分页查询**: 支持分页查询的接口都使用统一的参数格式
5. **时间格式**: 时间字段使用ISO 8601格式（yyyy-MM-ddTHH:mm:ss）
6. **核心API**: 发送邮件和保存草稿都使用核心API接口 `POST /system/letter/content/create`

## 权限要求

- `letter:content:create` - 创建邮件权限
- `letter:content:update` - 更新邮件权限
- `letter:content:delete` - 删除邮件权限
- `letter:content:query` - 查询邮件权限
- `letter:query` - 邮件查询权限
- `letter:update` - 邮件更新权限
- `letter:delete` - 邮件删除权限
