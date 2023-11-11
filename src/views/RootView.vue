<script setup>
import MainLeftToolBar from "@/components/toolbar/MainLeftToolBar.vue";
import MainTopToolBar from "@/components/toolbar/MainTopToolBar.vue";
import ShowModal from "@/components/login/ShowModal.vue";
import {useDialog} from 'naive-ui'
import {ref, inject, watch} from "vue";

//對話框對象
const dialog = useDialog()
//登录状态的对话框
const loginStatusDialog = ref(null)

//接受app.vue提供的‘是否需要加载页面’
const needReload = inject('needReload')
//如果needReload的值为true时，则重新加载页面
watch(() => needReload.value, newData => {
  if (newData) {
    changeLoginStatusDialog();
  }
})
//登录状态发生改变时出现的对话框
const changeLoginStatusDialog = () => {
  if (loginStatusDialog.value === null) {
    loginStatusDialog.value = dialog.create({
      showIcon: false,
      closable: false,
      closeOnEsc: false,
      maskClosable: false,
      content: '登录状态已改变，需要重新加载页面！',
      positiveText: '重新加载页面',
      positiveButtonProps: {
        tertiary: true
      },
      onPositiveClick: () => {
        window.location.reload();//强制刷新页面
        return false
      }
    })
  }
}
import {useRouter} from "vue-router";

const router = useRouter();
//全局前置路由守卫————初始化的时候被调用、每次路由切换之前被调用
router.beforeEach((to, from, next) => {
  //如果路由需要跳转
  if (to.fullPath.startsWith('/noteShare')) {
    show.value = false
  } else {
    show.value = true
  }
  next()
})
const show = ref(true)
import ShareNoteLayout from "@/views/note/ShareNoteLayout.vue";

</script>

<template>
  <!-- 页面布局 -->
  <n-layout v-if="show"  position="absolute">
    <!--头部-->
    <n-layout-header  bordered style="height:64px;padding: 0 20px;">
      <MainTopToolBar/>
    </n-layout-header>
    <!--底部-->
    <n-layout position="absolute" style="top: 64px" has-sider>
      <!--左侧应用栏-->
      <n-layout-sider width="64px" bordered content-style="padding: 24px 0;text-align:center;">
        <main-left-tool-bar/>
      </n-layout-sider>
      <!--主页面-->
      <router-view/>
    </n-layout>
  </n-layout>
  <share-note-layout v-else/>
  <!-- 登录模态框 -->
  <show-modal/>
</template>

<style scoped>

</style>