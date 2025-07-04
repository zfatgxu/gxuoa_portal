<template>
  <div class="change-avatar">
    <CropperAvatar
      ref="cropperRef"
      :btnProps="{ preIcon: 'ant-design:cloud-upload-outlined' }"
      :showBtn="false"
      :value="img"
      width="120px"
      @change="handelUpload"
    />
  </div>
</template>
<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import { updateAvatar } from '@/api/system/user/profile'
import { CropperAvatar } from '@/components/Cropper'
import { useUserStore } from '@/store/modules/user'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import { UploadRequestOptions } from 'element-plus/es/components/upload/src/upload'
import { ElMessage } from 'element-plus'

// TODO @芋艿：合并到 ProfileUser 组件中，更简洁一点
defineOptions({ name: 'UserAvatar' })

defineProps({
  img: propTypes.string.def('')
})

const userStore = useUserStore()

const cropperRef = ref()
const handelUpload = async ({ data }) => {
  try {
    // 直接使用原始文件对象上传
    const avatar = await updateAvatar(data)
    
    // 关闭弹窗
    cropperRef.value.close()
    
    // 更新本地状态
    await userStore.setUserAvatarAction(avatar)
    
    // 重新获取完整的用户信息，确保刷新后头像不会消失
    await userStore.setUserInfoAction()
    
    // 显示成功提示
    ElMessage.success('头像更新成功')
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请重试')
  }
}
</script>

<style lang="scss" scoped>
.change-avatar {
  img {
    display: block;
    margin-bottom: 15px;
    border-radius: 50%;
  }
}
</style>
