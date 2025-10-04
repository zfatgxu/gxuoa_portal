import { ref, computed } from 'vue'
import {
  getFolderTree,
  createFolder,
  updateFolder,
  deleteFolder,
  type FolderRespVO,
  type FolderCreateReqVO,
  type FolderUpdateReqVO
} from '@/api/mail/folder'

export function useFolderManagement() {
  // 状态
  const customFolders = ref<FolderRespVO[]>([])
  
  // 计算属性
  const rootFolders = computed(() => {
    return customFolders.value.filter(folder => folder.parentId === 0)
  })
  
  // 方法
  const loadCustomFolders = async () => {
    try {
      const response = await getFolderTree()
      
      if (response && Array.isArray(response)) {
        // 将树形结构扁平化
        const flattenFolders = (folders: FolderRespVO[]): FolderRespVO[] => {
          const result: FolderRespVO[] = []
          folders.forEach(folder => {
            result.push(folder)
            if (folder.children && folder.children.length > 0) {
              result.push(...flattenFolders(folder.children))
            }
          })
          return result
        }
        
        customFolders.value = flattenFolders(response)
      } else {
        customFolders.value = []
      }
    } catch (error: any) {
      console.error('加载自定义文件夹失败:', error)
      customFolders.value = []
    }
  }
  
  const createNewFolder = async (folderName: string, parentId: number = 0) => {
    const createData: FolderCreateReqVO = {
      folderName: folderName.trim(),
      parentId,
      description: ''
    }
    
    await createFolder(createData)
    await loadCustomFolders()
  }
  
  const renameFolder = async (folderId: number, newName: string) => {
    const folder = customFolders.value.find(f => f.id === folderId)
    if (!folder) {
      throw new Error('文件夹不存在')
    }
    
    const updateData: FolderUpdateReqVO = {
      id: folderId,
      folderName: newName.trim(),
      parentId: folder.parentId,
      sortOrder: folder.sortOrder,
      description: folder.description
    }
    
    await updateFolder(updateData)
    await loadCustomFolders()
  }
  
  const deleteFolderById = async (folderId: number) => {
    const folder = customFolders.value.find(f => f.id === folderId)
    if (!folder) {
      throw new Error('文件夹不存在')
    }
    
    if ((folder.mailCount || 0) > 0) {
      throw new Error('该文件夹内仍有邮件，无法删除')
    }
    
    await deleteFolder(folderId)
    await loadCustomFolders()
  }
  
  const getFolderName = (folderId: number): string => {
    const folder = customFolders.value.find(f => f.id === folderId)
    return folder ? folder.folderName : '未知文件夹'
  }
  
  return {
    customFolders,
    rootFolders,
    loadCustomFolders,
    createNewFolder,
    renameFolder,
    deleteFolderById,
    getFolderName
  }
}

