<template>
  <div class="login-title-container">
    <h2 class="login-title">
      {{ getFormTitle }}
    </h2>
  </div>
</template>
<script lang="ts" setup>
import { LoginStateEnum, useLoginState } from './useLogin'

defineOptions({ name: 'LoginFormTitle' })

const { t } = useI18n()

const { getLoginState } = useLoginState()

const getFormTitle = computed(() => {
  const titleObj = {
    [LoginStateEnum.RESET_PASSWORD]: t('sys.login.forgetFormTitle'),
    [LoginStateEnum.LOGIN]: t('sys.login.signInFormTitle'),
    [LoginStateEnum.REGISTER]: t('sys.login.signUpFormTitle'),
    [LoginStateEnum.MOBILE]: t('sys.login.mobileSignInFormTitle'),
    [LoginStateEnum.QR_CODE]: t('sys.login.qrSignInFormTitle'),
    [LoginStateEnum.SSO]: t('sys.login.ssoFormTitle')
  }
  return titleObj[unref(getLoginState)]
})
</script>

<style scoped>
.login-title-container {
  text-align: center;
  margin-bottom: 25px;
  position: relative;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  position: relative;
  display: inline-block;
}

.login-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
}

.login-decoration {
  width: 50px;
  height: 4px;
  background: linear-gradient(to right, #dc3545, #ff6b6b);
  border-radius: 2px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.login-decoration::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  to {
    left: 100%;
  }
}
</style>
