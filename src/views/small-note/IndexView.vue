<script setup>
import {computed,onMounted} from "vue";
import {storeToRefs} from "pinia";
//引入图片
import {DeleteForeverSharp,ArrowCircleUpOutlined,ArrowCircleDownOutlined,EditFilled} from '@vicons/material'
//引入消息组件
import { useMessage } from 'naive-ui'
const message = useMessage()
//引入加载条组件
import { useLoadingBar } from 'naive-ui'
const loadingBar = useLoadingBar()
//引入主题store
import {useThemeStore} from '@/stores/themeStore'
const themeStore = useThemeStore();
const {isDarkTheme} = storeToRefs(themeStore);
//小记图片的背景颜色
const thingFinishShadowColor = computed(() => {
  return isDarkTheme.value ? 'border-radius: 10px;border-color: lightblue;box-shadow: 0 2px 4px rgba(0,255,255, 0.5)'
      : 'border-radius: 10px;box-shadow: 0 2px 4px rgba(0,0,0, 0.1);background-color:#E6F6FF'
})
//引入用户信息store
import {useUserStore} from "@/stores/userStore";
const userStore = useUserStore();
const {id:userId} = storeToRefs(userStore);
//引入小记Api
import SmallNoteApi from '@/api/smallNote'
//小记列表对象
const smallNoteList = ref([]);
//获取小记列表
const getSmallNoteList = () =>{
  //获取当前登录用户的小记信息
  SmallNoteApi.getSmallNote(userId.value).then(res => {
    loadingBar.start;
    if(res && res.data.code === 200){
      //查找成功
      smallNoteList.value = res.data.data;
      loadingBar.finish;
    }
  }).catch(err => {
    loadingBar.error;
  })
}
//进入页面加载
onMounted(() => {
  getSmallNoteList();
})
//小记是否置顶按钮显示
const isTopIconText = top => {
  if(top){
    return {
      icon: ArrowCircleDownOutlined,
      text: '取消置顶'
    }
  }else{
    return {
      icon: ArrowCircleUpOutlined,
      text: '置顶'
    }
  }
}
//小记置顶按钮的禁用与否
const smallNoteTopButton = ref(false);
//改变指定小记的置顶状态
const changeTopStatus = (smallNoteId,isTopValue) => {
  //禁用小记置顶按钮
  smallNoteTopButton.value = true;
  const changeTop = {
    userId:userId.value,
    smallNoteId:smallNoteId,
    smallNoteTopStatus:isTopValue,
  }
  SmallNoteApi.changeSmallNoteTopStatus(changeTop).then(res => {
    if(res.data.code === 60004){
      message.success(res.data.message)
      //取消小记置顶按钮
      smallNoteTopButton.value = false;
      getSmallNoteList();
    }else{
      message.error('服务端错误')
    }
  }).catch(err => {
    console.log(err)
  })
}
</script>

<template>
  <n-layout embedded content-style="padding:24px">
    <!--小记页面头部-->
    <n-card size="small" style="border-radius: 10px;box-shadow: 0 2px 4px rgba(0,255,0,0.2);" >
      <!--标题-->
      <template #header>
        <h3>小记列表</h3>
      </template>
      <!--新增按钮-->
      <template #header-extra>
        <n-button>新增小记</n-button>
      </template>
    </n-card>
    <n-card size="small" :bordered="false" style="margin-top: 20px">
      <n-space>
        <n-card v-for="smallNote in smallNoteList "
                key="smallNote.id"
                :class="{'thing-card-finished' : smallNote.isFinished}"
                :segmented="{'content':'soft'}"
                size="small"
                embedded
                :title="smallNote.title"
                :style="thingFinishShadowColor"
                style="min-width: 220px;">
          <template #header-extra>
            <!--删除按钮-->
            <n-popover>
              <template #trigger>
                <n-button text style="margin-left: 10px">
                  <n-icon :size="18" :component="DeleteForeverSharp" />
                </n-button>
              </template>
              删除
            </n-popover>
            <!--置顶按钮-->
            <n-popover>
              <template #trigger>
                <n-button :disabled="smallNoteTopButton" text style="margin-left: 10px">
                  <n-icon :size="18" @click="changeTopStatus(smallNote.id,smallNote.isTop)" :component="isTopIconText(smallNote.isTop).icon" />
                </n-button>
              </template>
              {{isTopIconText(smallNote.isTop).text}}
            </n-popover>
            <!--编辑按钮-->
            <n-popover>
              <template #trigger>
                <n-button text style="margin-left: 10px">
                  <n-icon :size="18"  :component="EditFilled" />
                </n-button>
              </template>
              编辑
            </n-popover>
          </template>
          <template #default>
            <n-space>
              <n-tag v-for="tag in smallNote.tags.split(',')" size="small" :bordered="false">{{ tag }}</n-tag>
            </n-space>
          </template>
          <template #footer>
            <n-space align="center">
              <n-tag v-if="smallNote.isTop" size="small" :bordered="false" type="success">置顶</n-tag>
              <n-divider style="background-color: lightblue" v-if="smallNote.isTop"  vertical/>
              <n-text depth="3">{{smallNote.createTime}}</n-text>
            </n-space>
          </template>
        </n-card>
      </n-space>
    </n-card>
  </n-layout>
</template>

<style scoped>
.n-card.thing-card-finished::after{
  position: absolute;
  content: '';
  width: 100px;
  height: 100px;
  bottom: 50%;
  left: 30px;
  transform: translateY(50px);
  background-image: url("@/assets/finish.png");
  background-size: 100px 100px;
  background-repeat: no-repeat;
  /*只对有像素的部分进行投影*/
  filter: drop-shadow(5px 5px 2px v-bind(thingFinishShadowColor));
}
</style>