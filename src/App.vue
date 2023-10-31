<script setup>
import RootView from '@/views/RootView.vue'
import {storeToRefs} from "pinia";
import {onMounted, provide, watch,onBeforeUnmount} from "vue";
//主題
import {useThemeStore} from "@/stores/themeStore";

const themeStore = useThemeStore();
const {theme} = storeToRefs(themeStore);
//用戶
import {useUserStore} from "@/stores/userStore";

const userStore = useUserStore();
const {token} = storeToRefs(userStore)
//是否需要强制加载页面
import {handOffModalStore} from '@/stores/loginModalStore';
const modalStore = handOffModalStore();
const {changeModalStatus} = modalStore;

const needReload = ref(false)
//为后代组件提供数据
provide('needReload', needReload)
import {useRouter} from "vue-router";
import L2dwidget from "@/views/dia/l2dwidget.vue";

const router = useRouter();
const currentPagePath = window.location.pathname; //當前路徑

watch(() => token.value, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    if (!currentPagePath.startsWith('noteShare')) {
      router.push('/note'); // 跳转到首页
      window.location.reload(); // 延迟执行强制刷新
    }
  }
})

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
        window.location.reload();//强制刷新页面
        needReload.value = true
        setTimeout(() => {
          needReload.value = false
        }, 1000)
      }
    }
  })
  //setTimeout(() => {
  //  window.L2Dwidget
  //      .on('*', (name) => {
  //        if (name === 'tapface' || name === 'tapbody'){
  //
  //        }
  //      })
  //      .init({
  //    pluginRootPath: 'public/live2dw/',
  //    pluginJsPath: 'lib/',
  //    pluginModelPath: 'live2d-widget-model-koharu/assets/',
  //    tagMode: false,
  //    debug: false,
  //    model: { jsonPath: '/public/live2dw/live2d-widget-model-haru_2/assets/haru02.model.json' },
  //    dialog: {
  //      enable: true, //是否开启对话框
  //      script: {
  //        //每20s，显示一言（调用一言Api返回的句子）
  //        'every idle 20s': '$hitokoto$',
  //        //触摸到class='star'对象,将会展示的文字
  //        'hover .star': '星星在天上而你在我心里 (*/ω＼*)',
  //        //触摸到身体
  //        'tap body': '害羞⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄',
  //        //触摸到头部
  //        'tap face': '~~'
  //      }
  //    },
  //    display: { //人物的属性配置
  //      position: 'left',
  //      width: 150,
  //      height: 300,
  //      hOffset: 70, // 横向偏移
  //      vOffset: 0 // 纵向偏移
  //    },
  //  })
  //}, 1000)
})
onBeforeUnmount(() => {
  document.querySelector('#live2d-widget').remove();
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
            <l2dwidget />
          </n-message-provider>
        </n-dialog-provider>
      </n-notification-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
