<template>
  <el-form ref="formRef" :model="password" :rules="rules" :label-width="200">
    <el-form-item :label="t('profile.password.oldPassword')" prop="oldPassword">
      <InputPassword v-model="password.oldPassword" />
    </el-form-item>
    <el-form-item :label="t('profile.password.newPassword')" prop="newPassword">
      <InputPassword v-model="password.newPassword" strength />
    </el-form-item>
    <el-form-item :label="t('profile.password.confirmPassword')" prop="confirmPassword">
      <InputPassword v-model="password.confirmPassword" strength />
    </el-form-item>
    <!-- 手机验证码 -->
    <el-form-item :label="t('profile.password.smsCode')" prop="code">
      <el-input
        v-model="password.code"
        :placeholder="t('profile.password.smsPlaceholder')"
        style="width: 42.5%"
      >
        <template #append>
          <span
            v-if="smsCodeTimer <= 0"
            class="get-sms-code"
            @click="getSmsCode"
          >
            {{ t('profile.password.getSmsCode') }}
          </span>
          <span v-else class="get-sms-code disabled">
            {{ smsCodeTimer }}秒后可重新获取
          </span>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item>
      <XButton :title="t('common.resetPassword')" type="primary" @click="submit(formRef)" />
      <XButton :title="t('common.clearInput')" type="danger" @click="reset(formRef)" />
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

import { InputPassword } from '@/components/InputPassword'
import { updateUserPassword } from '@/api/system/user/profile'
import { sendSmsCode } from '@/api/login'
import { useUserStore } from '@/store/modules/user'
import { getUserProfile } from '@/api/system/user/profile'

defineOptions({ name: 'ResetPwd' })

const { t } = useI18n()
const message = useMessage()
const formRef = ref<FormInstance>()
const password = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  code: '' // 添加验证码字段
})

// 短信验证码倒计时
const smsCodeTimer = ref(0)
let smsTimer: NodeJS.Timeout | null = null

// 表单校验
const equalToPassword = (_rule, value, callback) => {
  if (password.newPassword !== value) {
    callback(new Error(t('profile.password.diffPwd')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: t('profile.password.oldPwdMsg'), trigger: 'blur' },
    { min: 6, max: 20, message: t('profile.password.pwdRules'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: t('profile.password.newPwdMsg'), trigger: 'blur' },
    { min: 6, max: 20, message: t('profile.password.pwdRules'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('profile.password.cfPwdMsg'), trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('profile.password.smsCodeMsg'), trigger: 'blur' }
  ]
})

const userStore = useUserStore()

// 获取短信验证码
const getSmsCode = async () => {
  try {
    // 先尝试从store获取用户信息
    let userInfo = userStore.getUser
    console.log('Store中的用户信息:', userInfo)
    
    // 如果store中没有手机号，则调用个人信息API获取
    if (!userInfo?.mobile) {
      console.log('Store中无手机号，调用个人信息API获取')
      const profileData = await getUserProfile()
      console.log('个人信息API返回:', profileData)
      
      if (!profileData?.mobile) {
        message.error('用户未绑定手机号，无法发送验证码')
        return
      }
      
      // 更新store中的手机号信息
      await userStore.setUserMobileAction(profileData.mobile)
      userInfo = { ...userInfo, mobile: profileData.mobile }
    }
    
    console.log('最终使用的手机号:', userInfo.mobile)

    // 发送验证码
    await sendSmsCode({
      mobile: userInfo.mobile,
      scene: 4 // 4表示重置密码场景
    })
    
    message.success(t('profile.password.smsCodeSent'))
    
    // 开始倒计时
    smsCodeTimer.value = 60
    smsTimer = setInterval(() => {
      smsCodeTimer.value--
      if (smsCodeTimer.value <= 0) {
        clearInterval(smsTimer!)
        smsTimer = null
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    message.error('发送验证码失败，请重试')
  }
}

const submit = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      // 修改API调用，将验证码一同发送
      await updateUserPassword(password.oldPassword, password.newPassword, password.code)
      message.success(t('common.updateSuccess'))
      // 密码修改成功后，提示用户需要重新登录
      await message.confirm('密码修改成功，需要重新登录')
      // 调用登出方法，重定向到登录页面
      await userStore.loginOut()
    }
  })
}

const reset = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  // 清除倒计时
  if (smsTimer) {
    clearInterval(smsTimer)
    smsTimer = null
    smsCodeTimer.value = 0
  }
}

// 组件卸载时清除定时器
onUnmounted(() => {
  if (smsTimer) {
    clearInterval(smsTimer)
  }
})
</script>

<style lang="scss" scoped>
.get-sms-code {
  cursor: pointer;
  color: var(--el-color-primary);
  padding: 0 12px;
  white-space: nowrap;
  
  &.disabled {
    cursor: not-allowed;
    color: var(--el-color-info);
  }
  
  &:hover:not(.disabled) {
    color: var(--el-color-primary-light-3);
  }
}
</style>
