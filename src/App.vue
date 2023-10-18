<script setup>
import RootView from '@/views/RootView.vue'
import {storeToRefs} from "pinia";
import {onMounted, provide,watch} from "vue";
//主題
import {useThemeStore} from "@/stores/themeStore";

const themeStore = useThemeStore();
const {theme} = storeToRefs(themeStore);
//用戶
import {useUserStore} from "@/stores/userStore";

const userStore = useUserStore();
const {token} = storeToRefs(userStore)
//是否需要强制加载页面
const needReload = ref(false)
//为后代组件提供数据
provide('needReload', needReload)

onMounted(() => {
  window.addEventListener('storage', event => {
    if (event.key === 'theme') {
      themeStore.$hydrate()
    } else if (event.key === 'user') {
      //这串代码的意思是 只要不是user里面的token发生变化，都不会强制要求刷新页面
      const newToken = JSON.parse(event.newValue).token
      const oldToken = JSON.parse(event.oldValue).token
      if (newToken === oldToken) {
        userStore.$hydrate()
      } else {
        //window.location.reload();//强制刷新页面
        needReload.value = true
        setTimeout(() => {
          needReload.value = false
        }, 1000)
      }
    }
  })
})
</script>

<template>
  <n-config-provider :theme="theme.name">
    <!--    加载条-->
    <n-loading-bar-provider>
      <!--通知-->
      <n-notification-provider>
        <n-dialog-provider>
          <!--      消息提示-->
          <n-message-provider>
            <root-view/>
          </n-message-provider>
        </n-dialog-provider>
      </n-notification-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
