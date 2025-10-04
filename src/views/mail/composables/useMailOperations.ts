import type { Email } from '../utils/mailFormatter'
import {
  moveToTrash,
  restoreFromTrash,
  permanentDelete,
  markAsTrash,
  restoreFromTrashFlag
} from '@/api/mail/letter'
import {
  moveMailToFolder,
  removeMailFromFolder,
  setFolderMailsReadState,
  toggleFolderMailsStar
} from '@/api/mail/folder'

interface UseMailOperationsOptions {
  allEmails: Record<string, Email[]>
  folderEmails: Record<number, Email[]>
  updateEmailStatusInAllFolders: (ids: number[], fn: (email: Email) => void) => void
  loadFolderEmails: (folder: string) => Promise<void>
  loadFolderEmailsById: (folderId: number) => Promise<void>
}

export function useMailOperations(options: UseMailOperationsOptions) {
  // 方法
  const deleteEmails = async (emailIds: number[], selectedFolder: string, selectedFolderId: number | null) => {
    await moveToTrash({ ids: emailIds })
    
    // 根据当前文件夹类型选择正确的邮件列表
    if (selectedFolder === 'custom' && selectedFolderId) {
      // 自定义文件夹
      const currentEmails = options.folderEmails[selectedFolderId]
      if (currentEmails) {
        emailIds.forEach(emailId => {
          const emailIndex = currentEmails.findIndex(email => email.id === emailId)
          if (emailIndex !== -1) {
            currentEmails.splice(emailIndex, 1)
          }
        })
      }
    } else {
      // 系统文件夹
      const currentEmails = options.allEmails[selectedFolder]
      if (currentEmails) {
        emailIds.forEach(emailId => {
          const emailIndex = currentEmails.findIndex(email => email.id === emailId)
          if (emailIndex !== -1) {
            currentEmails.splice(emailIndex, 1)
          }
        })
      }
    }
    
    // 重新加载已删除文件夹（如果需要）
    if (selectedFolder !== 'deleted') {
      await options.loadFolderEmails('deleted')
    }
  }
  
  const restoreEmails = async (emailIds: number[]) => {
    await restoreFromTrash({ ids: emailIds })
    
    // 从已删除文件夹中移除邮件
    const currentEmails = options.allEmails.deleted
    if (currentEmails) {
      emailIds.forEach(emailId => {
        const emailIndex = currentEmails.findIndex(email => email.id === emailId)
        if (emailIndex !== -1) {
          currentEmails.splice(emailIndex, 1)
        }
      })
    }
    
    // 重新加载收件箱（恢复的邮件会回到收件箱）
    await options.loadFolderEmails('inbox')
  }
  
  const permanentDeleteEmails = async (emailIds: number[], selectedFolder: string, selectedFolderId: number | null) => {
    await permanentDelete({ ids: emailIds })
    
    // 根据当前文件夹类型选择正确的邮件列表
    if (selectedFolder === 'custom' && selectedFolderId) {
      // 自定义文件夹
      const currentEmails = options.folderEmails[selectedFolderId]
      if (currentEmails) {
        emailIds.forEach(emailId => {
          const emailIndex = currentEmails.findIndex(email => email.id === emailId)
          if (emailIndex !== -1) {
            currentEmails.splice(emailIndex, 1)
          }
        })
      }
    } else {
      // 系统文件夹
      const currentEmails = options.allEmails[selectedFolder]
      if (currentEmails) {
        emailIds.forEach(emailId => {
          const emailIndex = currentEmails.findIndex(email => email.id === emailId)
          if (emailIndex !== -1) {
            currentEmails.splice(emailIndex, 1)
          }
        })
      }
    }
    
    // 重新加载已删除文件夹（如果需要）
    if (selectedFolder !== 'deleted') {
      await options.loadFolderEmails('deleted')
    }
  }
  
  const markEmails = async (action: string, emailIds: number[], selectedFolder: string, selectedFolderId: number | null) => {
    switch (action) {
      case 'read':
        await setFolderMailsReadState(emailIds, true)
        options.updateEmailStatusInAllFolders(emailIds, (email) => {
          email.isRead = true
        })
        break
      
      case 'unread':
        await setFolderMailsReadState(emailIds, false)
        options.updateEmailStatusInAllFolders(emailIds, (email) => {
          email.isRead = false
        })
        break
      
      case 'star':
        await toggleFolderMailsStar(emailIds)
        const today = new Date().toISOString().split('T')[0]
        options.updateEmailStatusInAllFolders(emailIds, (email) => {
          email.isStarred = true
          email.starredAt = today
        })
        await options.loadFolderEmails('starred')
        break
      
      case 'unstar':
        await toggleFolderMailsStar(emailIds)
        options.updateEmailStatusInAllFolders(emailIds, (email) => {
          email.isStarred = false
          email.starredAt = undefined
        })
        // 从星标文件夹中移除邮件
        emailIds.forEach(emailId => {
          const starredIndex = options.allEmails.starred.findIndex(e => e.id === emailId)
          if (starredIndex !== -1) {
            options.allEmails.starred.splice(starredIndex, 1)
          }
        })
        await options.loadFolderEmails('starred')
        break
      
      case 'spam':
        await markAsTrash({ ids: emailIds })
        
        // 从当前文件夹移除邮件
        if (selectedFolder === 'custom' && selectedFolderId) {
          const currentEmails = options.folderEmails[selectedFolderId]
          if (currentEmails) {
            emailIds.forEach(emailId => {
              const emailIndex = currentEmails.findIndex(email => email.id === emailId)
              if (emailIndex !== -1) {
                currentEmails.splice(emailIndex, 1)
              }
            })
          }
        } else {
          const currentEmails = options.allEmails[selectedFolder]
          if (currentEmails) {
            emailIds.forEach(emailId => {
              const emailIndex = currentEmails.findIndex(email => email.id === emailId)
              if (emailIndex !== -1) {
                currentEmails.splice(emailIndex, 1)
              }
            })
          }
        }
        
        await options.loadFolderEmails('trash')
        
        // 如果当前不在垃圾箱，重新加载当前文件夹
        if (selectedFolder !== 'trash') {
          if (selectedFolder === 'custom' && selectedFolderId) {
            await options.loadFolderEmailsById(selectedFolderId)
          } else {
            await options.loadFolderEmails(selectedFolder)
          }
        }
        break
      
      case 'unspam':
        await restoreFromTrashFlag({ ids: emailIds })
        
        // 从当前文件夹移除邮件
        if (selectedFolder === 'custom' && selectedFolderId) {
          const currentEmails = options.folderEmails[selectedFolderId]
          if (currentEmails) {
            emailIds.forEach(emailId => {
              const emailIndex = currentEmails.findIndex(email => email.id === emailId)
              if (emailIndex !== -1) {
                currentEmails.splice(emailIndex, 1)
              }
            })
          }
        } else {
          const currentEmails = options.allEmails[selectedFolder]
          if (currentEmails) {
            emailIds.forEach(emailId => {
              const emailIndex = currentEmails.findIndex(email => email.id === emailId)
              if (emailIndex !== -1) {
                currentEmails.splice(emailIndex, 1)
              }
            })
          }
        }
        
        await options.loadFolderEmails('inbox')
        
        // 如果当前不在收件箱，重新加载当前文件夹
        if (selectedFolder !== 'inbox') {
          if (selectedFolder === 'custom' && selectedFolderId) {
            await options.loadFolderEmailsById(selectedFolderId)
          } else {
            await options.loadFolderEmails(selectedFolder)
          }
        }
        break
    }
  }
  
  const moveEmails = async (folderId: number, emailIds: number[]) => {
    await moveMailToFolder({
      letterIds: emailIds,
      folderId: folderId,
      mailType: 1
    })
  }
  
  const removeFromFolder = async (folderId: number, emailIds: number[]) => {
    await removeMailFromFolder(folderId, emailIds)
    
    // 本地移除
    const currentEmails = options.folderEmails[folderId]
    if (currentEmails) {
      emailIds.forEach(emailId => {
        const emailIndex = currentEmails.findIndex(email => email.id === emailId)
        if (emailIndex !== -1) {
          currentEmails.splice(emailIndex, 1)
        }
      })
    }
    
    await options.loadFolderEmailsById(folderId)
  }
  
  const toggleStar = async (emailId: number) => {
    await toggleFolderMailsStar([emailId])
    
    // 更新系统文件夹中的邮件状态
    Object.keys(options.allEmails).forEach(folderKey => {
      const email = options.allEmails[folderKey].find(e => e.id === emailId)
      if (email) {
        email.isStarred = !email.isStarred
        
        const today = new Date().toISOString().split('T')[0]
        if (email.isStarred) {
          email.starredAt = today
        } else {
          email.starredAt = undefined
          
          // 从星标文件夹中移除
          if (folderKey === 'starred') {
            const starredIndex = options.allEmails.starred.findIndex(e => e.id === emailId)
            if (starredIndex !== -1) {
              options.allEmails.starred.splice(starredIndex, 1)
            }
          }
        }
      }
    })
    
    // 更新自定义文件夹中的邮件状态
    Object.keys(options.folderEmails).forEach(folderId => {
      const email = options.folderEmails[folderId].find(e => e.id === emailId)
      if (email) {
        email.isStarred = !email.isStarred
        
        const today = new Date().toISOString().split('T')[0]
        if (email.isStarred) {
          email.starredAt = today
        } else {
          email.starredAt = undefined
        }
      }
    })
    
    await options.loadFolderEmails('starred')
  }
  
  return {
    deleteEmails,
    restoreEmails,
    permanentDeleteEmails,
    markEmails,
    moveEmails,
    removeFromFolder,
    toggleStar
  }
}

