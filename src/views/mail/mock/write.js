// 邮件相关的mock数据

// 侧边栏菜单项
export const sidebarItems = [
  //{ name: '写信', icon: 'Edit' },
  { name: '收信箱', icon: 'Document', count: 1 },
  { name: '星标邮件', icon: 'Star' },
  { name: '已发送', icon: 'Position' },
  { name: '草稿箱', icon: 'Files', count: 4 },
  { name: '已删除', icon: 'Delete', count: 8 },
  { name: '垃圾箱', icon: 'Folder-Delete' },
  { name: '我的文件夹', icon: 'Folder' }
]

// 用户选项数据
export const userOptions = [
  { value: 'user1', label: '张三', avatar: '' },
  { value: 'user2', label: '李四', avatar: '' },
  { value: 'user3', label: '王五', avatar: '' },
  { value: 'user4', label: '赵六', avatar: '' }
]

// 联系人分组数据
export const contactGroups = [
  {
    name: '最近联系人',
    expanded: true,
    contacts: [
      { id: 'contact1', name: '张三', email: 'zhangsan@example.com', avatar: '' },
      { id: 'contact2', name: '李四', email: 'lisi@example.com', avatar: '' },
      { id: 'contact3', name: '王五', email: 'wangwu@example.com', avatar: '' }
    ]
  },
  {
    name: '星标联系人',
    expanded: false,
    contacts: [
      { id: 'contact4', name: '计算机学院-张教授', email: 'zhang-prof@example.edu.cn', avatar: '' },
      { id: 'contact5', name: '数学学院-李副教授', email: 'li-prof@example.edu.cn', avatar: '' },
      { id: 'contact6', name: '物理学院-王讲师', email: 'wang-lecturer@example.edu.cn', avatar: '' },
      { id: 'contact7', name: '外语学院-赵老师', email: 'zhao-teacher@example.edu.cn', avatar: '' }
    ]
  }
]

// 发送设置选项
export const sendingOptions = [
  { label: '普通发送', value: 'normal' },
  { label: '定时发送', value: 'scheduled' },
  { label: '加密发送', value: 'encrypted' },
  { label: '已读回执', value: 'receipt' }
]

// 模拟搜索用户的函数
export const searchUsers = (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = userOptions.filter(user => 
        user.label.toLowerCase().includes(query.toLowerCase())
      )
      resolve(results)
    }, 300)
  })
}
