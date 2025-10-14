# 邮件模块文档

## 📌 模块概述

内部邮件模块，提供邮件收发、草稿管理、附件处理、文件夹管理等核心功能。基于 Vue 3 + TypeScript 构建。

### 核心功能

✉️ 邮件收发（发送/接收/回复/转发） | 📁 文件夹管理（系统+自定义） | 📎 附件管理（上传/下载）  
📝 草稿功能 | ⭐ 星标邮件 | 🔍 高级搜索 | ⏰ 定时发送 | 📊 优先级设置 | 📮 已读回执

---

## 📂 目录结构

```
mail/
├── index.vue                    # 邮件列表主页面
├── write.vue                    # 写邮件页面
├── mail.css                     # 样式文件
├── components/                  # 组件目录
│   ├── AdvancedSearchDialog.vue        # 高级搜索弹窗
│   ├── AttachmentManager.vue           # 附件管理器
│   ├── BaseContextMenu.vue             # 右键菜单基础组件
│   ├── ContactContextMenu.vue          # 联系人右键菜单
│   ├── ContactPanel.vue                # 联系人面板
│   ├── EmailContextMenu.vue            # 邮件列表右键菜单
│   ├── FolderContextMenu.vue           # 自定义文件夹右键菜单
│   ├── FolderTreeItem.vue              # 自定义文件夹树节点
│   ├── MailSidebar.vue                 # 邮件侧边栏
│   ├── MailToolbar.vue                 # 邮件工具栏
│   ├── MainContent.vue                 # 主内容区
│   ├── OriginalMailDetailDialog.vue    # 原始邮件详情弹窗
│   ├── OriginalMailDisplay.vue         # 原始邮件显示
│   ├── RecipientSelector.vue           # 收件人选择器
│   └── ScheduleSendDialog.vue          # 定时发送弹窗
├── composables/                 # Composition API逻辑复用
│   ├── useAttachments.ts               # 附件管理逻辑
│   ├── useContacts.ts                  # 联系人管理逻辑
│   ├── useDataCache.ts                 # 数据缓存逻辑
│   ├── useDraft.ts                     # 草稿管理逻辑
│   ├── useFolderManagement.ts          # 文件夹管理逻辑
│   ├── useMailData.ts                  # 邮件数据加载逻辑
│   ├── useMailDetail.ts                # 邮件详情逻辑
│   ├── useMailOperations.ts            # 邮件操作逻辑
│   ├── useMailSearch.ts                # 邮件搜索逻辑
│   ├── useMailSend.ts                  # 邮件发送逻辑
│   ├── useMailStats.ts                 # 邮件统计逻辑
│   └── useUserCache.ts                 # 用户缓存逻辑
├── types/                       # 类型定义
│   └── mail.ts                         # 邮件相关类型定义
├── utils/                       # 工具函数
│   ├── mailFormatter.ts                # 邮件格式化工具
│   └── mailHelpers.ts                  # 邮件辅助函数
└── image/                       # 图片资源
    └── top.png                         # 顶部图片
```

---

## 🔌 API接口

邮件模块的API接口位于 `src/api/mail/` 目录下，按功能模块划分：

### 1. 信件API (`letter/index.ts`)

#### 邮件列表
- `getInboxMails()` - 获取收件箱邮件
- `getSentMails()` - 获取已发送邮件
- `getDraftMails()` - 获取草稿箱邮件
- `getStarredMails()` - 获取星标邮件
- `getDeletedMails()` - 获取已删除邮件
- `getTrashMails()` - 获取垃圾箱邮件
- `getUnreadMails()` - 获取未读邮件

#### 邮件详情
- `getLetterDetail(id)` - 获取邮件详细信息

#### 邮件发送
- `sendLetter(data)` - 发送邮件
- `replyLetter(data)` - 回复邮件
- `forwardLetter(data)` - 转发邮件
- `saveDraft(data)` - 保存草稿

#### 邮件操作
- `markAsRead(ids)` - 标记为已读
- `markAsUnread(ids)` - 标记为未读
- `toggleStar(ids)` - 切换星标状态
- `moveToTrash(ids)` - 移到回收站
- `restoreFromTrash(ids)` - 从回收站恢复
- `permanentDelete(ids)` - 彻底删除
- `markAsTrash(ids)` - 标记为垃圾邮件
- `restoreFromTrashFlag(ids)` - 取消垃圾邮件标记

#### 邮件搜索
- `searchLetters(params)` - 搜索邮件（全文搜索）
- `searchLettersByAttachment(params)` - 根据附件名称搜索（待完成）

#### 邮件统计
- `getMailStats()` - 获取邮件统计信息

#### 联系人管理
- `createLetterContactStar(data)` - 添加星标联系人
- `deleteLetterContactStar(id)` - 删除星标联系人
- `getLetterContactStarPage(params)` - 获取星标联系人列表

#### 已读回执
- `sendReadReceipt(letterId)` - 发送已读回执

### 2. 文件夹API (`folder/index.ts`)

#### 文件夹管理
- `createFolder(data)` - 创建文件夹
- `updateFolder(data)` - 更新文件夹
- `deleteFolder(id)` - 删除文件夹
- `getFolderDetail(id)` - 获取文件夹详情
- `getFolderList()` - 获取文件夹列表
- `getFolderTree()` - 获取文件夹树形结构

#### 文件夹邮件管理
- `moveMailToFolder(data)` - 移动邮件到文件夹
- `removeMailFromFolder(folderId, letterIds)` - 从文件夹移除邮件
- `getFolderMails(folderId, pageNo, pageSize)` - 获取文件夹邮件列表

#### 文件夹工具
- `checkFolderName(folderName, excludeId)` - 检查文件夹名称是否可用
- `getFolderMailCount(folderId)` - 获取文件夹邮件数量

### 3. 草稿API (`draft/index.ts`)

- `createDraft(data)` - 创建草稿
- `updateDraft(data)` - 更新草稿
- `deleteDraft(ids)` - 删除草稿（支持批量）
- `getDraft(id)` - 获取草稿详情
- `getDraftPage(params)` - 分页查询草稿
- `getMyDrafts()` - 获取我的草稿列表
- `getStarredDrafts()` - 获取星标草稿列表
- `toggleDraftStar(id, isStarred)` - 切换草稿星标
- `sendDraft(data)` - 发送草稿
- `autoSaveDraft(data)` - 自动保存草稿
- `getScheduledDrafts()` - 获取定时发送草稿

### 4. 附件API (`attachment/index.ts`)

- `uploadLetterAttachment(file, fileType, fileUrl)` - 上传附件
- `updateLetterAttachment(data)` - 更新附件信息
- `deleteLetterAttachment(id)` - 删除附件
- `getLetterAttachment(id)` - 获取附件详情
- `getLetterAttachmentsByLetterId(letterId, fileType)` - 根据邮件ID获取附件列表
- `getLetterAttachmentsByDraftId(draftId)` - 根据草稿ID获取附件列表
- `getLetterAttachmentPage(params)` - 分页查询附件
- `downloadAttachment(attachmentId, fileName)` - 下载附件

#### 附件工具函数
- `formatFileSize(bytes)` - 格式化文件大小
- `formatFileSizeFromString(sizeStr)` - 从字符串格式化文件大小
- `validateFileBeforeUpload(file)` - 上传前验证文件
- `getFileExtension(fileName)` - 获取文件扩展名

---

## 📝 核心类型 (`types/mail.ts`)

| 类型 | 说明 | 主要字段 |
|------|------|---------|
| **MailForm** | 邮件表单数据 | recipients, cc, bcc, subject, content, attachments, priority, requestReadReceipt |
| **Email** | 邮件列表项 | id, sender, subject, content, isRead, isStarred, priority, attachments, hasAttachment |
| **UserOption** | 联系人选项 | userId, name, label, avatar, deptName, email |
| **AttachmentConfig** | 附件配置 | maxFileSize, maxTotalSize, maxFileCount, allowedTypes |

---

## 🧩 Composables（组合式函数）

| Composable | 功能说明 |
|------------|---------|
| **useMailData** | 邮件数据加载（收件箱、发件箱、草稿箱、星标等） |
| **useMailOperations** | 邮件操作（删除、恢复、标记、移动、星标） |
| **useMailSend** | 邮件发送（表单验证、发送逻辑） |
| **useAttachments** | 附件管理（上传、下载、删除、验证） |
| **useContacts** | 联系人管理（搜索、最近联系人、星标联系人） |
| **useDraft** | 草稿管理（自动保存、手动保存、加载、删除） |
| **useFolderManagement** | 文件夹管理（创建、重命名、删除） |
| **useMailSearch** | 邮件搜索（全文搜索、高级筛选） |
| **useMailStats** | 邮件统计（统计数据、刷新） |
| **useMailDetail** | 邮件详情（加载详情、标记已读） |
| **useDataCache** | 数据缓存（减少API请求） |
| **useUserCache** | 用户缓存（避免重复查询） |

---

## 🎨 主要组件

| 组件 | 功能描述 |
|------|---------|
| **index.vue** | 邮件列表主页面：侧边栏、列表、详情、搜索、批量操作 |
| **write.vue** | 写邮件页面：收件人选择、富文本编辑、附件管理、草稿保存、定时发送 |
| **MailSidebar** | 侧边栏：系统文件夹、自定义文件夹树、邮件统计、文件夹操作 |
| **MainContent** | 主内容区：邮件列表、搜索、批量操作、详情查看、右键菜单 |
| **AttachmentManager** | 附件管理器：上传（拖拽/选择）、下载、删除、验证 |
| **RecipientSelector** | 收件人选择器：用户搜索、多选、最近联系人、星标联系人 |
| **MailToolbar** | 工具栏：发送、保存草稿、定时发送、优先级、已读回执 |
| **AdvancedSearchDialog** | 高级搜索：关键词、发件人、日期、附件、优先级筛选 |
| **ContactPanel** | 联系人面板：最近联系人、星标联系人、搜索、管理 |

---

## 🔧 工具函数

### mailFormatter.ts - 邮件格式化
- `convertMailToEmail` - 将后端邮件数据转换为前端Email类型
- `formatEmailContent` - 格式化邮件内容，处理HTML标签
- `parseRecipients` - 解析收件人字符串为数组
- `formatTimeAgo` - 格式化相对时间（如"2小时前"）

### mailHelpers.ts - 邮件辅助
- `validateEmail` - 验证邮箱地址格式
- `getFileIcon` - 根据文件类型获取图标
- `truncateText` - 截断文本到指定长度

---


## ⚙️ 配置说明

- **附件限制**：单个文件最大50MB，总大小100MB，最多10个文件
- **草稿自动保存**：默认每60秒自动保存（可在 `write.vue` 中修改）
- **邮件优先级**：1-普通，2-重要，3-紧急

---

## 🎯 开发建议

1. **使用Composables**：优先使用 composables 复用业务逻辑，而非直接调用 API
2. **错误处理**：始终对 API 调用进行 try-catch 错误处理
3. **附件验证**：上传前使用 `validateFileBeforeUpload` 验证文件
4. **数据缓存**：使用 `useDataCache` 缓存频繁访问的数据，减少请求
5. **事件通信**：父子组件通过 emit 事件进行通信

---
