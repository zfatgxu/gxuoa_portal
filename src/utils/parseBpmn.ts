import BpmnModdle from 'bpmn-moddle'

/**
 * 解析 bpmnXml 并提取所有用户任务
 */
export async function parseStartUserSelectTasks(bpmnXml: string) {
  // 添加输入验证
  if (!bpmnXml || typeof bpmnXml !== 'string') {
    console.error('无效的BPMN XML：输入为空或不是字符串')
    return []
  }

  // 检查XML是否包含基本的XML结构
  if (!bpmnXml.trim().startsWith('<?xml') && !bpmnXml.trim().startsWith('<')) {
    console.error('无效的BPMN XML：缺少XML声明或根元素')
    return []
  }

  try {
    console.log('开始解析BPMN XML...')
    const moddle = new BpmnModdle()
    const { rootElement } = await moddle.fromXML(bpmnXml)

    if (!rootElement || !rootElement.rootElements) {
      console.error('无效的BPMN XML：无法找到根元素')
      return []
    }

    console.log('根元素类型:', rootElement.$type)
    console.log('子元素数量:', rootElement.rootElements.length)

    const process = rootElement.rootElements.find((el: any) => el.$type === 'bpmn:Process')
    
    if (!process || !process.flowElements) {
      console.error('无效的BPMN XML：无法找到流程元素')
      return []
    }

    console.log('流程ID:', process.id)
    console.log('流程名称:', process.name)
    console.log('流程元素数量:', process.flowElements.length)

    const userTasks = process.flowElements.filter((el: any) => el.$type === 'bpmn:UserTask')
    console.log('找到用户任务数量:', userTasks.length)
    
    // 直接返回所有用户任务的ID和名称
    const result = userTasks.map((task: any) => ({
      id: task.id,
      name: task.name
    }))

    console.log('返回所有用户任务:', result)
    return result
  } catch (error) {
    console.error('解析BPMN XML时出错:', error)
    return []
  }
}
