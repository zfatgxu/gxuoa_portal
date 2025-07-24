<template>
  <div class="mailbox-container">
    <div class="banner">
      <img src="/src/assets/imgs/petition/mailbox-banner.svg" alt="信箱横幅" />
    </div>

    <div class="mailbox-content">
      <div class="mailbox-section">
        <div class="section-title">
          <h2>书记信箱</h2>
        </div>
        <div class="section-content">
          <div v-if="loading.secretary" class="loading">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else class="leader-list">
            <div v-for="(leader, index) in secretaryList" :key="index" class="leader-item">
              <div class="leader-avatar">
                <el-avatar :size="80" :src="leader.avatar || defaultAvatar" />
              </div>
              <div class="leader-info">
                <h3>{{ leader.nickname }} {{ leader.postName }}</h3>
                <p>{{ leader.remark || '主持学校党委全面工作。' }}</p>
                <el-button type="primary" @click="handleWriteLetter(leader)">
                  我要给{{ leader.nickname }}书记写信
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mailbox-section">
        <div class="section-title">
          <h2>校长信箱</h2>
        </div>
        <div class="section-content">
          <div v-if="loading.president" class="loading">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else class="leader-list">
            <div v-for="(leader, index) in presidentList" :key="index" class="leader-item">
              <div class="leader-avatar">
                <el-avatar :size="80" :src="leader.avatar || defaultAvatar" />
              </div>
              <div class="leader-info">
                <h3>{{ leader.nickname }} {{ leader.postName }}</h3>
                <p>{{ leader.remark || '主持学校行政全面工作。' }}</p>
                <el-button type="primary" @click="handleWriteLetter(leader)">
                  我要给{{ leader.nickname }}校长写信
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getSimpleUserList } from '@/api/system/user'
import { useRouter } from 'vue-router'
defineOptions({ name: 'Mailbox' })

const defaultAvatar = '/src/assets/imgs/avatar.jpg'
const router = useRouter()

// 领导列表数据
const secretaryList = ref([])
const presidentList = ref([])

// 加载状态
const loading = reactive({
  secretary: true,
  president: true
})

// 获取书记列表
const fetchSecretaryList = async () => {
  loading.secretary = true
  try {
    const res = await getSimpleUserList()
    secretaryList.value = (res || []).filter(user => user.deptName?.includes('书记'))
  } catch (error) {
    console.error('获取书记列表失败:', error)
  } finally {
    loading.secretary = false
  }
}

// 获取校长列表
const fetchPresidentList = async () => {
  loading.president = true
  try {
    const res = await getSimpleUserList()
    presidentList.value = (res || []).filter(user => user.deptName?.includes('校长'))
  } catch (error) {
    console.error('获取校长列表失败:', error)
  } finally {
    loading.president = false
  }
}

// 写信处理函数
const handleWriteLetter = (leader) => {
  router.push({
    path: '/petition/write',
    query: {
      recipientId: leader.id,
      workId: leader.workId,
      recipientName: leader.nickname,
      leaderDept: leader.postName,
      source: "校长信箱"
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  fetchSecretaryList()
  fetchPresidentList()
})
</script>

<style scoped>
.mailbox-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.banner {
  width: 100%;
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
}

.banner img {
  width: 100%;
  height: auto;
  display: block;
}

.mailbox-content {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.mailbox-section {
  flex: 1;
  min-width: 45%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-title {
  background-color: #9e1a1a;
  color: white;
  padding: 15px 20px;
}

.section-title h2 {
  margin: 0;
  font-size: 20px;
}

.section-content {
  padding: 20px;
}

.leader-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.leader-item {
  display: flex;
  gap: 20px;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.leader-item:last-child {
  border-bottom: none;
}

.leader-info {
  flex: 1;
}

.leader-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.leader-info p {
  margin: 0 0 15px 0;
  color: #666;
}

.loading {
  padding: 20px 0;
}

@media (max-width: 768px) {
  .mailbox-content {
    flex-direction: column;
  }

  .mailbox-section {
    min-width: 100%;
  }
}
</style>
