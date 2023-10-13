<script setup>
import MainTopToolBar from "@/components/toolbar/MainTopToolBar.vue";
import ShowModal from "@/components/login/ShowModal.vue";
import {storeToRefs} from "pinia";
import {onMounted} from "vue";

import {useThemeStore} from "@/stores/themeStore";

const themeStore = useThemeStore();
const {theme} = storeToRefs(themeStore);
const {changeTheme} = themeStore;
onMounted(() => {
  window.addEventListener('storage', event => {
    if (event.key === 'theme') {
      const newTheme = JSON.parse(event.newValue);
      changeTheme(newTheme.isDarkTheme);
    }
  })
})
</script>

<template>
  <n-config-provider :theme="theme.name">
    <!--    加载条-->
    <n-loading-bar-provider>
      <!--      消息提示-->
      <n-message-provider>
        <!-- 页面布局 -->
        <n-layout position="absolute">
          <!--头部-->
          <n-layout-header bordered style="height:64px;padding: 0 20px">
            <MainTopToolBar/>
          </n-layout-header>
          <!--    底部-->
          <n-layout position="absolute" style="top: 64px" has-sider>
            <!--左侧应用栏-->
            <n-layout-sider width="64px" bordered content-style="padding: 24px 0;text-align:center">
              海淀桥
            </n-layout-sider>
            <!--主页面-->
            <router-view/>
          </n-layout>
        </n-layout>
        <!-- 登录模态框 -->
        <show-modal/>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
