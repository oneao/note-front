<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {RobotOutlined} from '@vicons/antd'

onMounted(() => {
  setTimeout(() => {
    window.L2Dwidget
        .on('*', (name) => {
          if (name === 'tapface' || name === 'tapbody') {
            showPopover.value = !showPopover.value
          }
        })
        .init({
          pluginRootPath: 'live2dw/',
          pluginJsPath: 'lib/',
          pluginModelPath: '/live2dw/live2d-widget-model-koharu/assets/',
          tagMode: false,
          debug: false,
          model: {jsonPath: '/live2dw/live2d-widget-model-haru_2/assets/haru02.model.json'},
          dialog: {
            enable: true, //是否开启对话框
            script: {
              //每20s，显示一言（调用一言Api返回的句子）
              'every idle 20s': '$hitokoto$',
              //触摸到class='star'对象,将会展示的文字
              'hover .star': '星星在天上而你在我心里 (*/ω＼*)',
              //触摸到身体
              'tap body': '害羞⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄',
              //触摸到头部
              'tap face': '~~'
            }
          },
          display: { //人物的属性配置
            position: 'left',
            width: 150,
            height: 300,
            hOffset: 70, // 横向偏移
            vOffset: 0 // 纵向偏移
          },
        })
  }, 1000)
})
onBeforeUnmount(() => {
  document.querySelector('#live2d-widget').remove();
})
const showPopover = ref(false) //展示对话框
//const handleUpdateShow = (show) => {
//  //message.success(show ? "show" : "hide");
//}

const inputMessage = ref('')
const chatRecord = ref([
  { sender: 'robot', content: '欢迎使用聊天框！'},
]);
const sendMessage = () => {
  codeCountDownMethod()
  chatRecord.value.push({ sender: 'user', content: inputMessage.value });
  chatRecord.value.push({ sender: 'robot', content: '' });
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/openai?content=${inputMessage.value}`);
  xhr.setRequestHeader('Content-Type', 'text/event-stream');
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 3) {
      // 正在接收数据时，将数据添加到聊天记录中
      chatRecord.value[chatRecord.value.length - 1].content = xhr.responseText
    }
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // 请求完成时，将最后一条响应数据添加到聊天记录中
        chatRecord.value[chatRecord.value.length - 1].content = xhr.responseText
      }
    }
  }
  xhr.send();
  // 在新消息出现时将滚动条滚动到最下方
  setTimeout(() => {
    messageContainer.value.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 0);
  inputMessage.value = ''; // 将清空inputMessage.value的代码移动到发送请求之后
}
const codeCountDownData = ref({
  text: '发送', //显示文本
  time: 20,  //倒计时时间
  disabled: false,   //按钮是否禁用
  block: null
})
const codeCountDownMethod = () => {
  codeCountDownData.value.block = setInterval(() => {
    if (codeCountDownData.value.time === 1) {
      //不需要倒计时
      resetCodeCountDownData();
    } else {
      //需要倒计时
      codeCountDownData.value.disabled = true;  //禁用
      codeCountDownData.value.time--;
      codeCountDownData.value.text = codeCountDownData.value.time + '秒';
    }
  }, 1000)
}
const resetCodeCountDownData = () => {
  clearInterval(codeCountDownData.value.block);
  codeCountDownData.value.text = '发送';
  codeCountDownData.value.time = 20;
  codeCountDownData.value.disabled = false;
}
const messageContainer = ref(null); // 引用消息容器元素

</script>

<template>
  <n-popover :show="showPopover" placement="top-end" trigger="click">
    <template #trigger>
      <div></div>
      </template>
    <n-thing style="width: 250px;height: 350px">
      <template #header>AI聊天</template>
      <template #header-extra>
        <n-icon :size="18" :component="RobotOutlined"/>
      </template>
      <template #description>
        <div style="height: 100%; display: flex; flex-direction: column; justify-content: flex-end;">
          <div style="flex: 1; overflow-y: auto; max-height: 260px;">
            <!-- 聊天消息列表 -->
            <div v-for="message in chatRecord"  style="margin-bottom: 10px;margin-top: 15px" ref="messageContainer">
              <div v-if="message.sender === 'user'" style="text-align: right;">
                  <span style="background-color: #e6f7ff; padding: 5px 10px; border-radius: 5px;">
                    {{ message.content }}
                  </span>
              </div>
              <div v-else style="text-align: left;">
                <span style="background-color: #f5f5f5; padding: 5px 10px; border-radius: 5px;">
                    {{ message.content }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div style="position: fixed;margin-bottom: 20px; bottom: 0;">
          <n-space>
            <n-input style="width: 180px" v-model:value="inputMessage"></n-input> <!-- 使用之前定义的变量名 -->
            <n-button @click="sendMessage" :disabled="codeCountDownData.disabled" type="success">{{ codeCountDownData.text}}</n-button> <!-- 调用发送消息的方法 -->
          </n-space>
        </div>
      </template>
    </n-thing>
  </n-popover>
  <!--<n-button style="margin-left: 115px;margin-top: 490px;width: 60px;height: 180px" text></n-button>-->
</template>
<style scoped>
/* 调整滚动条样式 */
::-webkit-scrollbar {
  width: 1px; /* 设置滚动条宽度 */
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1; /* 设置滚动条背景色 */
}

::-webkit-scrollbar-thumb {
  background-color: #888; /* 设置滚动条滑块颜色 */
  border-radius: 4px; /* 设置滚动条滑块圆角 */
}

::-webkit-scrollbar-thumb:hover {
  background-color: #555; /* 设置滚动条滑块悬停时的颜色 */
}
</style>