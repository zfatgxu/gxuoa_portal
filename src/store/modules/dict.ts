import { defineStore } from 'pinia'
import { store } from '../index'
// @ts-ignore
import { DictDataVO } from '@/api/system/dict/types'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
const { wsCache } = useCache('sessionStorage')
import { getSimpleDictDataList } from '@/api/system/dict/dict.data'

export interface DictValueType {
  value: any
  label: string
  clorType?: string
  cssClass?: string
}
export interface DictTypeType {
  dictType: string
  dictValue: DictValueType[]
}
export interface DictState {
  dictMap: Record<string, any>
  isSetDict: boolean
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => ({
    dictMap: {},
    isSetDict: false
  }),
  getters: {
    getDictMap(): Recordable {
      const dictMap = wsCache.get(CACHE_KEY.DICT_CACHE)
      if (dictMap) {
        this.dictMap = dictMap
      }
      return this.dictMap
    },
    getIsSetDict(): boolean {
      return this.isSetDict
    }
  },
  actions: {
    async setDictMap() {
      const dictMap = wsCache.get(CACHE_KEY.DICT_CACHE)
      if (dictMap) {
        this.dictMap = dictMap
        this.isSetDict = true
      } else {
        const res = await getSimpleDictDataList()
        
        // 设置数据
        const dictDataMap = new Map<string, any>()
        res.data.forEach((dictData: DictDataVO) => {
          // 获得 dictType 层级
          const enumValueObj = dictDataMap[dictData.dictType]
          if (!enumValueObj) {
            dictDataMap[dictData.dictType] = []
          }
          // 处理 dictValue 层级
          dictDataMap[dictData.dictType].push({
            value: dictData.value,
            label: dictData.label,
            colorType: dictData.colorType,
            cssClass: dictData.cssClass
          })
        })
        this.dictMap = dictDataMap
        this.isSetDict = true
        wsCache.set(CACHE_KEY.DICT_CACHE, dictDataMap, { exp: 60 }) // 60 秒 过期
        console.log("dictMap", dictDataMap)
      }
      // 初始化字典数据
      const initDict = () => {
        // 添加会议状态字典
        const meetingStatusDict = [
          { label: '未开始', value: 0, colorType: 'info' },
          { label: '进行中', value: 1, colorType: 'success' },
          { label: '已结束', value: 2, colorType: 'warning' }
        ]
        this.dictMap['oa_meeting_status'] = meetingStatusDict
      }
      initDict()
    },
    getDictByType(type: string) {
      
      if (!this.isSetDict) {
        this.setDictMap()
      }
      return this.dictMap[type]
    },
    async resetDict() {
      wsCache.delete(CACHE_KEY.DICT_CACHE)
      const res = await getSimpleDictDataList()
      
      // 设置数据
      const dictDataMap = new Map<string, any>()
      res.data.forEach((dictData: DictDataVO) => {
        // 获得 dictType 层级
        const enumValueObj = dictDataMap[dictData.dictType]
        if (!enumValueObj) {
          dictDataMap[dictData.dictType] = []
        }
        // 处理 dictValue 层级
        dictDataMap[dictData.dictType].push({
          value: dictData.value,
          label: dictData.label,
          colorType: dictData.colorType,
          cssClass: dictData.cssClass
        })
      })
      this.dictMap = dictDataMap
      this.isSetDict = true
      wsCache.set(CACHE_KEY.DICT_CACHE, dictDataMap, { exp: 60 }) // 60 秒 过期
    }
  }
})

export const useDictStoreWithOut = () => {
  return useDictStore(store)
}
