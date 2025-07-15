<template>
  <div class="petition-write-container">
    <div class="petition-write-header">
      <h2>{{ source || '信访写信' }}</h2>
      <div class="petition-write-description">
        <p>尊敬的来信人，您好！</p>
        <p>为进一步规范学校领导与师生员工的沟通渠道，更好地解决群众普遍关心的实际问题，学校专门设立了"书记信箱"、"校长信箱"（以下简称"信箱"）。为了使"信箱"更好地发挥作用，请您在使用时注意以下几点：</p>
        <ol>
          <li>学校欢迎广大师生员工和广西大学各级组织反映的问题，各单位工作人员的职务行为均可提出意见和建议。</li>
          <li>来信内容应当客观真实，注明具体事实，并保证真实性。</li>
          <li>建议您条理清晰将问题信件详细送达相应领导，以便详情得到回答对问题的处理。</li>
          <li>建议您尽量提供地址和联系问题，并填写真实姓名和联系方式，以便对您的情况反馈。</li>
          <li>对于已经答复过的事项，"信箱"可不予受理，请勿就同样的问题重复提交件。</li>
        </ol>
        <p>感谢您对我们工作的支持与配合！</p>
        <div class="petition-write-signature">广西大学校长办公室</div>
      </div>
    </div>

    <div class="petition-write-form">
      <el-form :model="formData" :rules="rules" ref="petitionFormRef" label-width="100px">
        <div class="petition-form-section">
          <div class="section-title">收信人</div>
          <div class="section-content">
            <el-form-item label="收信人">
              <el-input v-model="formData.recipientName" disabled />
            </el-form-item>
          </div>
        </div>

        <div class="petition-form-section">
          <div class="section-title" style="display: flex; justify-content: space-between; align-items: center;">
            <span>发信人</span>
            <el-switch
              v-model="anonymous"
              active-text="匿名信访"
              inactive-text="实名信访"
              inline-prompt
              style="margin-left: auto;
              transform: scale(1.2);"
              @change="handleAnonymousToggle"
            />
          </div>

          <div class="section-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input
                    v-model="formData.name"
                    :disabled="anonymous"
                    placeholder="请输入您的姓名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="单位" prop="unit">
                  <el-input
                    v-model="formData.unit"
                    :disabled="anonymous"
                    placeholder="请输入您的单位"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="电子邮箱" prop="email">
                  <el-input
                    v-model="formData.email"
                    :disabled="anonymous"
                    placeholder="请输入您的电子邮箱"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="phone">
                  <el-input
                    v-model="formData.phone"
                    :disabled="anonymous"
                    placeholder="请输入您的联系电话"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="formData.gender" :disabled="anonymous">
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="身份证号" prop="idCard">
                  <el-input
                    v-model="formData.idCard"
                    :disabled="anonymous"
                    placeholder="请输入您的身份证号"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="通讯地址" prop="address">
              <el-input
                v-model="formData.address"
                :disabled="anonymous"
                placeholder="请输入您的通讯地址"
              />
            </el-form-item>
          </div>
        </div>


        <div class="petition-form-section">
          <div class="section-title">信件内容</div>
          <div class="section-content">
            <el-form-item label="主题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入信件主题" />
            </el-form-item>

            <el-form-item label="内容" prop="content">
              <el-input
                v-model="formData.content"
                type="textarea"
                :rows="10"
                placeholder="请详细描述您的问题，以便我们更好地帮助您解决问题。"
              />
              <div class="content-limit">信件内容不能超过500字</div>
            </el-form-item>

            <el-form-item label="验证码" prop="captchaVerification">
              <div class="captcha-container">
                <Verify
                  ref="verifyRef"
                  @success="captchaSuccess"
                  captchaType="blockPuzzle"
                  mode="pop"
                />
                <el-button type="primary" @click="showCaptcha" size="default">点击验证</el-button>
                <span v-if="formData.captchaVerification" class="captcha-success">验证成功</span>
              </div>
            </el-form-item>
          </div>
        </div>

        <div class="petition-form-actions">
          <el-button type="primary" @click="submitPetition">发送</el-button>
          <el-button @click="resetForm">重写</el-button>
          <el-button type="info" @click="generateMockData">生成测试数据</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ElLoading, ElMessage, ElMessageBox} from 'element-plus'
import {InfoApi} from '@/api/petition/info'
import {VisitorApi} from '@/api/petition/visitor'
import {VisitorRelationApi} from '@/api/petition/visitorrelation'
import {BaseInfoApi} from '@/api/petition/baseinfo'
import {AppealApi} from '@/api/petition/appeal'
import {formatToDateTime} from '@/utils/dateUtil'
import {useTagsViewStore} from '@/store/modules/tagsView'
import {Verify} from '@/components/Verifition'
import {useI18n} from 'vue-i18n'

defineOptions({ name: 'PetitionWrite' })

const route = useRoute()
const router = useRouter()

// 从路由参数中获取收信人信息
const recipientId = route.query.recipientId as string
const recipientName = route.query.recipientName as string
const leaderDept = route.query.leaderDept as string
const workId = route.query.workId as string
const source = route.query.source as string
const rules = reactive({})
// 表单引用
const petitionFormRef = ref()
const anonymous = ref(false)

watch(anonymous, (val) => {
  if (val) {
    for (const key in rules) {
      rules[key] = [] // 移除所有验证规则
    }

  } else {
    // 恢复所有规则
    for (const key in fullRules) {
      rules[key] = fullRules[key]
    }
  }
})

// 匿名切换逻辑
const handleAnonymousToggle = (val) => {
  if (val) {
    ElMessageBox.alert('匿名模式下信访可能不被受理', '提示', {
      confirmButtonText: '我知道了',
      type: 'warning',
      center: true,
    })
    formData.name = '匿名信访人'
    formData.unit = '匿名地址'
    formData.email = '匿名邮箱'
    formData.phone = '***********'
    formData.gender = 1
    formData.idCard = '******************'
    formData.address = '***'
  } else {
    formData.name = ''
    formData.unit = ''
    formData.email = ''
    formData.phone = ''
    formData.gender = null
    formData.idCard = ''
    formData.address = ''
  }
}

// 合并的表单数据
const formData = reactive({
  // 信访信息部分
  recipientId: workId || '',
  recipientName: recipientName || '',
  source: source || '',
  title: '',
  content: '',
  captchaVerification: '',
  deptId: '',
  deptName: leaderDept || '',

  // 信访人信息部分
  name: '',
  gender: 1,
  email: '',
  phone: '',
  idCard: '',
  address: '',
  unit: ''
})

// 表单验证规则
const fullRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在2到50个字符之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入通讯地址', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入信件主题', trigger: 'blur' },
    { min: 2, max: 255, message: '主题长度在2到255个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入信件内容', trigger: 'blur' },
    { max: 500, message: '内容不能超过500个字符', trigger: 'blur' }
  ],
  captchaVerification: [
    { required: true, message: '请完成验证码验证', trigger: 'change' }
  ]
}

// 提交信访表单
const submitPetition = async () => {
  if (!petitionFormRef.value) return

  try {
    await petitionFormRef.value.validate()

    // 检查验证码是否已完成验证
    if (!formData.captchaVerification) {
      ElMessage.warning('请先完成验证码验证')
      return
    }

    ElMessageBox.confirm('确认提交信访信件吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      const loadingInstance = ElLoading.service({
        lock: true,
        text: '提交中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      try {
        // 生成受理编号，格式为XF+年月日+序号
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        // 生成四位序号，这里使用随机数模拟
        const serialNumber = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
        const receiptNo = `XF${year}${month}${day}${serialNumber}`
        const businessNo = `BIZ${year}${month}${day}${serialNumber}`

        // 1. 创建信访信息，获取信访ID
        const infoData = {
          title: formData.title,
          content: formData.content,
          deptId: formData.deptId || 0,
          deptName: formData.deptName || '',
          recipientId: Number(formData.recipientId) || 0,
          recipientName: formData.recipientName || '',
          source: formData.source || '信访系统',
          receiptNo: receiptNo // 添加受理编号
        }
        const infoRes = await InfoApi.createInfo(infoData)
        const petitionId = infoRes

        if (!petitionId) {
          throw new Error('创建信访信息失败')
        }

        // 2. 创建信访人信息，获取信访人ID
        const visitorData = {
          name: formData.name,
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone,
          idCard: formData.idCard,
          address: formData.address
        }
        console.log(visitorData)
        const visitorRes = await VisitorApi.createVisitor(visitorData as any)
        const visitorId = visitorRes

        if (!visitorId) {
          throw new Error('创建信访人信息失败')
        }

        // 3. 创建信访人与信访关联
        const relationData = {
          petitionId: petitionId,
          visitorId: visitorId,
          isPrimary: true // 设为主要信访人
        }
        await VisitorRelationApi.createVisitorRelation(relationData as any)

        //4. 创建信访基本信息表
        // 获取时间戳
        const petitionDateTimestamp = now.getTime()
        const registrationTimeTimestamp = now.getTime()
        const deadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        const deadlineTimestamp = deadline.getTime()

        // // 使用项目自带的日期格式化函数
        // const petitionDateStr = formatToDateTime(now)
        // const registrationTimeStr = formatToDateTime(now)
        // const deadlineStr = formatToDateTime(deadline)

        // // 显示弹窗查看时间是否正确
        // ElMessageBox.alert(
        //   `信访日期: ${petitionDateStr}\n登记时间: ${registrationTimeStr}\n截止日期: ${deadlineStr}`,
        //   '日期检查',
        //   { confirmButtonText: '确定' }
        // )

        const detailData = {
          petitionId: petitionId,
          acceptanceNo: receiptNo, // 使用前面生成的受理编号
          businessNo: businessNo, // 生成业务编号
          queryCode: Math.random().toString(36).substring(2, 10).toUpperCase(), // 生成随机查询码
          petitionType: '校长信箱', // 信访类型，默认值
          contentCategory: '建议信',
          petitionDate: petitionDateTimestamp, // 信访日期为当前时间的时间戳
          registrationOrg: formData.deptName || '信访办公室', // 登记机构
          registrationTime: registrationTimeTimestamp, // 登记时间为当前时间的时间戳
          deadline: deadlineTimestamp, // 截止日期为30天后的时间戳
          involvedCount: 1, // 涉及人数
          petitionerCount: 1, // 信访人数
          petitionReason: formData.title, // 信访原因使用标题
          problemLocation : formData.address,
          belongSystem : "广西大学oa系统"
        }

        console.log('发送给后端的数据:', detailData)
        await BaseInfoApi.createBaseInfo(detailData as any)

        //5. 创建信访诉求表
        const appealData = {
          petitionId: petitionId,
          mainFacts: formData.content, // 使用信件内容作为主要事实
          mainRequest: `希望${formData.recipientName}能够关注并解决我的问题`, // 生成一个默认的主要诉求
          content: `来信人${formData.name}就${formData.title}问题向${formData.recipientName}提出信访诉求。` // 生成概况信息
        }
        await AppealApi.createAppeal(appealData as any)

        // 清空表单数据
        await resetForm()

        ElMessage.success('信访提交成功！')
        // 删除当前标签页
        const tagsViewStore = useTagsViewStore()
        tagsViewStore.delView(route)
        // 跳转到信访列表页面
        router.push('/petition/index')
      } catch (error) {
        console.error('提交信访表单失败:', error)
        ElMessage.error('提交失败：' + ((error as any).message || '未知错误'))
      } finally {
        loadingInstance.close()
      }
    }).catch(() => {
      // 用户取消提交
    })
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请完善表单信息')
  }
}

// 使用工具函数格式化日期

// 重置表单
const resetForm = () => {
  if (petitionFormRef.value) {
    petitionFormRef.value.resetFields()
  }
  // 重置验证码状态
  formData.captchaVerification = ''
  // 验证码组件没有直接暴露refresh方法，需要重新点击验证
}

// 生成模拟数据
const generateMockData = () => {
  // 生成随机姓名
  const surnames = [
    '张', '王', '李', '赵', '陈', '刘', '杨', '黄', '吴', '孙'
  ]
  const names = [
    '明', '华', '强', '伟', '英', '文', '军', '杰', '浩', '文', '静', '秀英', '文静', '文涛'
  ]
  const surname = surnames[Math.floor(Math.random() * surnames.length)]
  const name = names[Math.floor(Math.random() * names.length)]

  // 生成随机手机号
  const prefixes = ['134', '135', '136', '137', '138', '139', '150', '151', '152', '157', '158', '159', '182', '183', '187', '188', '189']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
  const phone = prefix + suffix.substring(0, 8)

  // 生成随机身份证号
  const generateIdCard = () => {
    // 生成地区码（这里用广西的一些地区码）
    const areaCodes = ['450100', '450200', '450300', '450400', '450500', '450600', '450700', '450800', '450900']
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)]

    // 生成出生日期，范围18-60岁
    const now = new Date()
    const year = now.getFullYear() - Math.floor(Math.random() * 42 + 18)
    const month = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')
    const day = Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')
    const birth = `${year}${month}${day}`

    // 生成顺序码（三位）
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

    // 生成性别码（奇数为男，偶数为女）
    const genderDigit = formData.gender === 1 ? (Math.floor(Math.random() * 5) * 2 + 1) : (Math.floor(Math.random() * 5) * 2)


    return areaCode + birth + sequence + genderDigit
  }

  // 生成随机单位
  const units = [
    '广西大学', '广西大学计算机与电子信息学院', '广西大学教务处', '广西大学学生处', '广西大学后勤处'
  ]
  const unit = units[Math.floor(Math.random() * units.length)]

  // 生成随机邮箱
  const emailDomains = ['qq.com', '163.com', 'gmail.com', 'outlook.com', 'gxu.edu.cn']
  const emailPrefix = Math.random().toString(36).substring(2, 10)
  const emailDomain = emailDomains[Math.floor(Math.random() * emailDomains.length)]
  const email = `${emailPrefix}@${emailDomain}`

  // 生成随机地址
  const provinces = [
    '广西', '广东', '湖南', '江西', '四川'
  ]
  const cities = [
    '南宁市', '桂林市', '柳州市', '北海市', '钦州市'
  ]
  const districts = [
    '青秀区', '兴宁区', '江南区', '西乡塘区', '良庆区'
  ]
  const streets = [
    '大学东路', '民族大道', '东葡路', '明秀路', '相思湖东路'
  ]
  const province = provinces[Math.floor(Math.random() * provinces.length)]
  const city = cities[Math.floor(Math.random() * cities.length)]
  const district = districts[Math.floor(Math.random() * districts.length)]
  const street = streets[Math.floor(Math.random() * streets.length)]
  const number = Math.floor(Math.random() * 100 + 1) + "号"
  const address = `${province}${city}${district}${street}${number}`

  // 生成随机标题
  const titlePrefixes = [
    '关于', '对于', '针对', '就', '求助'
  ]
  const titleTopics = [
    '校园建设', '学生宿舍', '教学质量', '食堂服务', '图书馆开放时间', '停车问题', '学生活动'
  ]
  const titleSuffixes = [
    '的建议', '的意见', '的反馈', '的问题', '的请求'
  ]
  const titlePrefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)]
  const titleTopic = titleTopics[Math.floor(Math.random() * titleTopics.length)]
  const titleSuffix = titleSuffixes[Math.floor(Math.random() * titleSuffixes.length)]
  const title = titlePrefix + titleTopic + titleSuffix

  // 生成随机内容
  const contentPrefixes = [
    (surname, name, unit) => `尊敬的${formData.recipientName}：\n\n您好！我是${surname}${name}，来自${unit}。`,
    (surname, name, unit) => `尊敬的${formData.recipientName}：\n\n我是${unit}的${surname}${name}，非常感谢您拥有这个信箱平台。`,
    (surname, name) => `尊敬的${formData.recipientName}：\n\n我是${surname}${name}，在此向您反映一个问题。`
  ]
  const contentBodies = [
    (titleTopic) => `我想反映一下关于${titleTopic}的问题。目前我们遇到了一些困难，希望能得到学校的重视和解决。`,
    (titleTopic) => `最近我注意到我们学校的${titleTopic}存在一些问题，这些问题已经影响到了我们的日常学习和生活。`,
    (titleTopic) => `我想就${titleTopic}问题提出一些建议。目前这方面还有很大的改进空间，希望能得到您的重视。`
  ]
  const contentEndings = [
    (surname, name) => `希望学校能够重视这个问题，并采取相应的措施。非常感谢您的关注和支持！\n\n此致\n敬意\n${surname}${name}`,
    (surname, name) => `期待您的回复和处理。再次表示感谢！\n\n此致\n敬意\n${surname}${name}`,
    (surname, name) => `请您在百忙之中抽空关注这个问题，谢谢！\n\n此致\n敬意\n${surname}${name}`
  ]
  const selectedPrefixFn = contentPrefixes[Math.floor(Math.random() * contentPrefixes.length)]
  const selectedBodyFn = contentBodies[Math.floor(Math.random() * contentBodies.length)]
  const selectedEndingFn = contentEndings[Math.floor(Math.random() * contentEndings.length)]

  // 调用函数生成内容
  const contentPrefix = selectedPrefixFn(surname, name, unit)
  const contentBody = selectedBodyFn(titleTopic)
  const contentEnding = selectedEndingFn(surname, name)
  const content = `${contentPrefix}\n\n${contentBody}\n\n${contentEnding}`

  // 填充到表单
  formData.name = surname + name
  formData.unit = unit
  formData.email = email
  formData.phone = phone
  formData.idCard = generateIdCard()
  formData.address = address
  formData.title = title
  formData.content = content

  ElMessage.success('测试数据生成成功')
}

// 验证码相关
const { t } = useI18n()
const verifyRef = ref()

// 显示验证码
const showCaptcha = () => {
  if (verifyRef.value) {
    verifyRef.value.show()
  }
}

// 验证码验证成功回调
const captchaSuccess = (params) => {
  // 将验证结果保存到表单
  formData.captchaVerification = params.captchaVerification
  ElMessage.success('验证码验证成功')
}

// 获取标签页管理器
const tagsViewStore = useTagsViewStore()

// 检查是否已经有写信页面打开
const checkExistingWritePage = () => {
  const visitedViews = tagsViewStore.getVisitedViews

  // 查找是否已经有写信页面打开
  const existingWriteView = visitedViews.find(view =>
    view.path === '/petition/write' &&
    view.query.recipientId
  )

  // 如果当前页面就是已打开的页面，不需要跳转
  if (existingWriteView && route.fullPath === existingWriteView.fullPath) {
    return false
  }

  if (existingWriteView) {
    // 如果已经有写信页面打开
    if (recipientId && recipientId !== existingWriteView.query.recipientId) {
      // 如果当前页面有收信人，但与已打开的页面收信人不同
      ElMessage.warning('您已经打开了一个写信页面，请先完成当前信访再给其他领导写信')
    }
    
    // 先删除当前标签页，再跳转到已打开的页面
    // 这样可以避免额外打开一个标签页
    tagsViewStore.delView(route)
    router.push(existingWriteView)
    return true
  }
  return false
}

// 页面加载时执行
onMounted(() => {
  // 首先检查是否已经有写信页面打开
  // 如果有，则跳转到已打开的页面并终止后续操作
  if (checkExistingWritePage()) {
    return
  }

  // 检查收信人信息
  if (!recipientId || !recipientName) {
    // 如果没有指定收信人，说明是直接从菜单栏进入的
    ElMessage.warning('未指定收信人，请从信箱页面选择收信人')

    // 先删除当前标签页，再跳转到信箱页面
    // 这样可以避免额外打开一个标签页
    tagsViewStore.delView(route)
    router.push('/petition/mailbox')
    return
  }
})
</script>

<style scoped>
.petition-write-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.petition-write-header {
  margin-bottom: 30px;
}

.petition-write-header h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.petition-write-description {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.petition-write-description p {
  margin-bottom: 10px;
  line-height: 1.6;
}

.petition-write-description ol {
  padding-left: 20px;
  margin: 15px 0;
}

.petition-write-description li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.petition-write-signature {
  text-align: right;
  margin-top: 20px;
  font-weight: bold;
}

.petition-form-section {
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.section-title {
  background-color: #9e1a1a;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
}

.section-content {
  padding: 20px;
  background-color: #fff;
}

.content-limit {
  text-align: right;
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-image {
  background-color: #f0f0f0;
  padding: 10px 20px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  letter-spacing: 2px;
  user-select: none;
  cursor: pointer;
}

.captcha-success {
  display: inline-block;
  margin-left: 10px;
  color: #67c23a;
  font-weight: bold;
}

.petition-form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .petition-write-container {
    padding: 10px;
  }

  .el-form-item {
    margin-bottom: 15px;
  }
}
</style>
