<script setup>
import {onMounted} from "vue";
import {NoteAddRound, BookmarkAddRound, NoteRound, StickyNote2Filled} from '@vicons/material'
import {useUserStore} from "@/stores/userStore";
import {storeToRefs} from 'pinia'
import {useRouter} from "vue-router";//路由
const router = useRouter();
import bus from 'vue3-eventbus'


const userStore = useUserStore();
const {token} = storeToRefs(userStore);
import UserApi from '@/api/user'

const showNoLogin = ref(false)
const showNoData = ref(false)
onMounted(() => {
  if (token.value !== null && token.value !== '') {
    getRecentOperationNote()
  } else {
    showNoLogin.value = true
  }
})
const recentData = ref([])
const getRecentOperationNote = () => {
  UserApi.getRecentOperationNote().then(res => {
    if (res.data.code === 200) {
      if (res.data.data === null) {
        showNoData.value = true
      } else {
        recentData.value = res.data.data
      }
    }
  })
}
const toNote = (item) => {
  if (item.type === 0) {
    //小记
    router.push('/smallNote').then(() => {
      bus.emit('showSmallNote',{data:item.id})
    })
  } else {
    //笔记
    router.push('/note/edit/' + item.id)
  }
}
import {handOffModalStore} from '@/stores/loginModalStore';
const modalStore = handOffModalStore();
const {changeModalStatus} = modalStore;
</script>
<template>
  <n-space vertical style="width: 95%;margin-top: 20px;">
    <div style="width: 95%;margin: auto">
      <n-carousel show-arrow autoplay style="border-radius: 10px">
        <img
            class="carousel-img"
            src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel1.jpeg"
        >
        <img
            class="carousel-img"
            src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg"
        >
        <img
            class="carousel-img"
            src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg"
        >
        <img
            class="carousel-img"
            src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg"
        >
      </n-carousel>
    </div>
    <n-space style="margin-left: 37px;margin-top: 20px">
      <n-button icon-placement="left" type="success" style="border-radius: 5px">
        <template #icon>
          <n-icon :component="NoteAddRound">
          </n-icon>
        </template>
        新增笔记
      </n-button>
      <n-button icon-placement="left" type="info" style="border-radius: 5px">
        <template #icon>
          <n-icon :component="BookmarkAddRound">
          </n-icon>
        </template>
        新增小记
      </n-button>
    </n-space>
    <n-space style="margin-top: 20px; margin-left: 37px" vertical>
      <n-space>
        <n-text style="font-size: 20px">最近操作记录（1个月内）</n-text>
      </n-space>
      <n-result status="404" title="尚未登录" description="生活总归带点荒谬" v-if="showNoLogin">
        <template #footer>
          <n-button @click="changeModalStatus(true)">去登陆</n-button>
        </template>
      </n-result>
      <n-result v-else-if="showNoData" status="418" title="暂无最近操作记录哦" description="一切尽在不言中">
        <template #footer>
          <n-text :depth="3">快去点击按钮去添加吧😊</n-text>
        </template>
      </n-result>
      <n-space>
        <n-thing v-for="item of recentData"
                 @click="toNote(item)"
                 style="background-color: #fafafc; border: 1px solid lightblue; border-radius: 8px; padding: 10px;cursor: pointer;margin-right: 20px;margin-top: 10px">
          <template #avatar>
            <n-icon v-if="item.type === 1" :component="NoteRound" :size="40" color="#0e7a0d"></n-icon>
            <n-icon v-else :component="StickyNote2Filled" :size="40" color="#147df6"></n-icon>
          </template>
          <template #header style="margin-bottom: 10px;">
            <n-text v-if="item.title === null" style="font-weight: bold; font-size: 16px; color: #333;">暂无设置标题
            </n-text>
            <n-text v-else style="font-weight: bold; font-size: 16px; color: #333;">{{ item.title }}</n-text>
            <br/>
            <n-text :depth="3">{{ item.updateTime }}</n-text>
          </template>
        </n-thing>
      </n-space>
    </n-space>
  </n-space>

</template>

<style scoped>

.carousel-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}
</style>