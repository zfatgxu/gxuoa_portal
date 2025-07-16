import BpmnModdle from 'bpmn-moddle'
/**
 * 解析 bpmnXml 并提取特定类型的用户任务
 * candidateStrategy=35 表示发起人可以指定审批人的用户任务
 * candidateStrategy=60 表示代工签字类型的任务
 */
export async function parseCandidateStrategyTasks(bpmnXml: string, taskType: 'assignable' | 'hostSign' = 'assignable') {
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
    const moddle = new BpmnModdle({
      flowable: {
        uri: 'http://flowable.org/bpmn',
        prefix: 'flowable',
        xml: {
          tagAlias: 'lowerCase'
        }
      }
    })
    
    const { rootElement } = await moddle.fromXML(bpmnXml)

    if (!rootElement || !rootElement.rootElements) {
      console.error('无效的BPMN XML：无法找到根元素')
      return []
    }

    const process = rootElement.rootElements.find((el: any) => el.$type === 'bpmn:Process')
    
    if (!process || !process.flowElements) {
      console.error('无效的BPMN XML：无法找到流程元素')
      return []
    }

    // 获取所有用户任务
    const userTasks = process.flowElements.filter((el: any) => el.$type === 'bpmn:UserTask')
    
    // 直接从XML中查找包含特定candidateStrategy值的用户任务
    const taskIds = userTasks.map((task: any) => task.id)
    
    // 根据任务类型选择不同的candidateStrategy值
    const candidateStrategyValue = taskType === 'hostSign' ? '60' : '35'
    
    // 使用更灵活的正则表达式，匹配不同格式的XML
    // 匹配 <userTask id="xxx"> 或 <bpmn:userTask id="xxx"> 格式
    // 然后在其中查找 <flowable:candidateStrategy><![CDATA[值]]></flowable:candidateStrategy>
    const candidateStrategyPattern = new RegExp(
      `<(?:bpmn:)?userTask\\s+id="([^"]+)"[^>]*>[\\s\\S]*?<flowable:candidateStrategy><!\\[CDATA\\[${candidateStrategyValue}\\]\\]><\\/flowable:candidateStrategy>`, 
      'g'
    )
    const matches = [...bpmnXml.matchAll(candidateStrategyPattern)]
    
    // 如果没有找到匹配项，尝试使用另一种可能的格式
    let candidateTaskIds = matches.map(match => match[1])
    
    if (candidateTaskIds.length === 0) {
      // 尝试匹配可能的其他格式
      const alternativePattern = new RegExp(
        `id="([^"]+)"[\\s\\S]*?<flowable:candidateStrategy><!\\[CDATA\\[${candidateStrategyValue}\\]\\]><\\/flowable:candidateStrategy>`, 
        'g'
      )
      const alternativeMatches = [...bpmnXml.matchAll(alternativePattern)]
      
      // 从替代匹配中过滤出用户任务ID
      candidateTaskIds = alternativeMatches
        .map(match => match[1])
        .filter(id => taskIds.includes(id))
    }
    
    // 过滤出包含特定candidateStrategy值的用户任务
    const candidateTasks = userTasks.filter((task: any) => 
      candidateTaskIds.includes(task.id)
    )
    
    // 返回这些用户任务的ID和名称
    const result = candidateTasks.map((task: any) => ({
      id: task.id,
      name: task.name
    }))

    return result
  } catch (error) {
    console.error('解析BPMN XML时出错:', error)
    return []
  }
}

/**
 * 专门用于解析代工签字类型的任务（candidateStrategy=60）
 */
export async function parseHostSignTasks(bpmnXml: string) {
  return parseCandidateStrategyTasks(bpmnXml, 'hostSign')
}