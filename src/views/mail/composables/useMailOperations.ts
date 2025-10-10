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
import { toggleDraftStar, deleteDraft } from '@/api/mail/draft'

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
    // 判断是否在草稿箱
    const isDraftFolder = selectedFolder === 'drafts'
    
    // 分离草稿邮件和正式邮件
    let draftIds: number[] = []
    let regularIds: number[] = []
    
    if (isDraftFolder) {
      // 在草稿箱中，所有邮件都是草稿
      draftIds = emailIds
    } else if (selectedFolder === 'starred') {
      // 在星标邮件中，需要区分草稿和正式邮件
      const currentEmails = options.allEmails[selectedFolder]
      if (currentEmails && currentEmails.length > 0) {
        emailIds.forEach(id => {
          const email = currentEmails.find(e => e.id === id)
          if (email?.isDraft) {
            draftIds.push(id)
          } else {
            regularIds.push(id)
          }
        })
      } else {
        // 找不到邮件，默认当作正式邮件处理
        regularIds = emailIds
      }
    } else {
      // 其他文件夹，默认都是正式邮件
      regularIds = emailIds
    }
    
    // 分别删除草稿邮件和正式邮件
    if (draftIds.length > 0) {
      // 删除草稿邮件（deleteDraft 支持单个或批量）
      await deleteDraft(draftIds)
    }
    
    if (regularIds.length > 0) {
      // 删除正式邮件（移到已删除）
      await moveToTrash({ ids: regularIds })
    }
    
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
    
    // 重新加载相关文件夹
    if (draftIds.length > 0) {
      // 如果删除了草稿，重新加载草稿箱
      if (selectedFolder !== 'drafts') {
        await options.loadFolderEmails('drafts')
      }
    }
    
    if (regularIds.length > 0) {
      // 如果删除了正式邮件，重新加载已删除文件夹
      if (selectedFolder !== 'deleted') {
        await options.loadFolderEmails('deleted')
      }
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
    // 判断是否在草稿箱
    const isDraftFolder = selectedFolder === 'drafts'
    
    // 分离草稿邮件和正式邮件
    let draftIds: number[] = []
    let regularIds: number[] = []
    
    if (isDraftFolder) {
      // 在草稿箱中，所有邮件都是草稿
      draftIds = emailIds
    } else if (selectedFolder === 'starred') {
      // 在星标邮件中，需要区分草稿和正式邮件
      const currentEmails = options.allEmails[selectedFolder]
      if (currentEmails && currentEmails.length > 0) {
        emailIds.forEach(id => {
          const email = currentEmails.find(e => e.id === id)
          if (email?.isDraft) {
            draftIds.push(id)
          } else {
            regularIds.push(id)
          }
        })
      } else {
        // 找不到邮件，默认当作正式邮件处理
        regularIds = emailIds
      }
    } else {
      // 其他文件夹，默认都是正式邮件
      regularIds = emailIds
    }
    
    // 分别彻底删除草稿邮件和正式邮件
    if (draftIds.length > 0) {
      // 彻底删除草稿邮件（deleteDraft 支持单个或批量）
      await deleteDraft(draftIds)
    }
    
    if (regularIds.length > 0) {
      // 彻底删除正式邮件
      await permanentDelete({ ids: regularIds })
    }
    
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
    
    // 重新加载相关文件夹
    if (regularIds.length > 0 && selectedFolder !== 'deleted') {
      // 如果删除了正式邮件，重新加载已删除文件夹
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
        // 分离草稿邮件和正式邮件
        const draftIdsToStar: number[] = []
        const regularIdsToStar: number[] = []
        
        emailIds.forEach(id => {
          // 在所有文件夹中查找邮件
          let email: Email | undefined
          Object.keys(options.allEmails).forEach(folderKey => {
            if (!email) {
              email = options.allEmails[folderKey].find(e => e.id === id)
            }
          })
          
          // 如果在系统文件夹中没找到，在自定义文件夹中查找
          if (!email) {
            Object.keys(options.folderEmails).forEach(folderId => {
              if (!email) {
                email = options.folderEmails[folderId].find(e => e.id === id)
              }
            })
          }
          
          // 根据邮件的 isDraft 属性分类
          if (email?.isDraft) {
            draftIdsToStar.push(id)
          } else {
            regularIdsToStar.push(id)
          }
        })
        
        // 分别调用对应的API
        if (draftIdsToStar.length > 0) {
          // 草稿邮件：逐个调用草稿标星API
          for (const draftId of draftIdsToStar) {
            await toggleDraftStar(draftId, true)
          }
        }
        
        if (regularIdsToStar.length > 0) {
          // 正式邮件：批量调用正式邮件标星API
          await toggleFolderMailsStar(regularIdsToStar)
        }
        
        const today = new Date().toISOString().split('T')[0]
        options.updateEmailStatusInAllFolders(emailIds, (email) => {
          email.isStarred = true
          email.starredAt = today
        })
        await options.loadFolderEmails('starred')
        break
      
      case 'unstar':
        // 分离草稿邮件和正式邮件
        const draftIdsToUnstar: number[] = []
        const regularIdsToUnstar: number[] = []
        
        emailIds.forEach(id => {
          // 在所有文件夹中查找邮件
          let email: Email | undefined
          Object.keys(options.allEmails).forEach(folderKey => {
            if (!email) {
              email = options.allEmails[folderKey].find(e => e.id === id)
            }
          })
          
          // 如果在系统文件夹中没找到，在自定义文件夹中查找
          if (!email) {
            Object.keys(options.folderEmails).forEach(folderId => {
              if (!email) {
                email = options.folderEmails[folderId].find(e => e.id === id)
              }
            })
          }
          
          // 根据邮件的 isDraft 属性分类
          if (email?.isDraft) {
            draftIdsToUnstar.push(id)
          } else {
            regularIdsToUnstar.push(id)
          }
        })
        
        // 分别调用对应的API
        if (draftIdsToUnstar.length > 0) {
          // 草稿邮件：逐个调用草稿标星API
          for (const draftId of draftIdsToUnstar) {
            await toggleDraftStar(draftId, false)
          }
        }
        
        if (regularIdsToUnstar.length > 0) {
          // 正式邮件：批量调用正式邮件标星API
          await toggleFolderMailsStar(regularIdsToUnstar)
        }
        
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
    // 查找邮件对象，判断是否是草稿
    let targetEmail: Email | undefined
    let isDraft = false
    
    // 在系统文件夹中查找
    Object.keys(options.allEmails).forEach(folderKey => {
      if (!targetEmail) {
        targetEmail = options.allEmails[folderKey].find(e => e.id === emailId)
      }
    })
    
    // 如果在系统文件夹中没找到，在自定义文件夹中查找（只会是正式邮件）
    if (!targetEmail) {
      Object.keys(options.folderEmails).forEach(folderId => {
        if (!targetEmail) {
          targetEmail = options.folderEmails[folderId].find(e => e.id === emailId)
        }
      })
    }
    
    // 判断是否是草稿：优先使用邮件对象的 isDraft 属性
    if (targetEmail?.isDraft) {
      isDraft = true
    }
    
    // 根据邮件类型调用不同的API
    if (isDraft) {
      // 草稿邮件：调用草稿标星API
      const newStarredState = !targetEmail?.isStarred
      await toggleDraftStar(emailId, newStarredState)
    } else {
      // 正式邮件：调用正式邮件标星API（包括自定义文件夹中的邮件）
      await toggleFolderMailsStar([emailId])
    }
    
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

