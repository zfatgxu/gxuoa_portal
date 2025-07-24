<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6 text-center">
        <h1 class="text-3xl font-bold mb-2">帮助中心</h1>
        <p class="text-gray-300">我们在这里为您提供帮助！</p>
      </div>

      <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Usage Tutorials Section -->
        <div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <BookOpenIcon class="w-6 h-6 mr-2 text-gray-600" />
            使用教程
          </h2>
          <div class="space-y-4">
            <div v-for="(tutorial, index) in tutorials" :key="index" class="border rounded-lg bg-gray-50">
              <button
                @click="toggleTutorial(index)"
                class="w-full text-left p-4 flex justify-between items-center text-lg font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                {{ tutorial.title }}
                <ChevronDownIcon :class="{'rotate-180': tutorial.open}" class="w-5 h-5 transform transition-transform duration-200" />
              </button>
              <div v-if="tutorial.open" class="p-4 border-t border-gray-200 text-gray-600">
                <p>{{ tutorial.content }}</p>
                <ul v-if="tutorial.steps" class="list-disc list-inside mt-2 space-y-1">
                  <li v-for="(step, sIndex) in tutorial.steps" :key="sIndex">{{ step }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Service Chat Section -->
        <div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <MessageSquareIcon class="w-6 h-6 mr-2 text-gray-600" />
            客服聊天
          </h2>
          <div class="flex flex-col h-[400px] border rounded-lg bg-gray-50">
            <!-- Chat Messages -->
            <div class="flex-1 p-4 overflow-y-auto space-y-4">
              <div
                v-for="(message, index) in messages"
                :key="index"
                :class="[
                  'flex',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                ]"
              >
                <div
                  :class="[
                    'max-w-[70%]',
                    'rounded-lg',
                    'px-4',
                    'py-2',
                    'text-sm',
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  ]"
                >
                  {{ message.text }}
                </div>
              </div>
            </div>

            <!-- Chat Input -->
            <div class="border-t border-gray-200 p-4 flex items-center">
              <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="输入您的问题..."
                class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                @click="sendMessage"
                class="ml-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <SendIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BookOpenIcon, MessageSquareIcon, ChevronDownIcon, SendIcon } from 'lucide-vue-next';

const tutorials = ref([
  {
    title: '如何注册新账户？',
    content: '注册新账户非常简单，请按照以下步骤操作：',
    steps: [
      '1. 点击页面右上角的“注册”按钮。',
      '2. 在弹出的表单中填写您的邮箱和密码。',
      '3. 阅读并同意用户协议。',
      '4. 点击“提交”完成注册。',
    ],
    open: false,
  },
  {
    title: '如何重置密码？',
    content: '如果您忘记了密码，可以通过以下步骤重置：',
    steps: [
      '1. 在登录页面点击“忘记密码？”链接。',
      '2. 输入您的注册邮箱。',
      '3. 查收邮件，点击邮件中的重置链接。',
      '4. 设置新密码。',
    ],
    open: false,
  },
  {
    title: '如何联系技术支持？',
    content: '您可以通过客服聊天或发送邮件联系我们。',
    open: false,
  },
]);

const messages = ref([
  { sender: 'support', text: '您好！有什么可以帮助您的吗？' },
  { sender: 'user', text: '我无法登录我的账户。' },
  { sender: 'support', text: '请问您是否尝试过重置密码？' },
]);

const newMessage = ref('');

const toggleTutorial = (index) => {
  tutorials.value[index].open = !tutorials.value[index].open;
};

const sendMessage = () => {
  if (newMessage.value.trim() !== '') {
    messages.value.push({ sender: 'user', text: newMessage.value.trim() });
    newMessage.value = '';
    // Simulate a response from support
    setTimeout(() => {
      messages.value.push({ sender: 'support', text: '感谢您的提问，我们正在处理您的问题。' });
    }, 1000);
  }
};
</script>

<style scoped>
/* You can add custom styles here if needed, but Tailwind handles most of it */
</style>
