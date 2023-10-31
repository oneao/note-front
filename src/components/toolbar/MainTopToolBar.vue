<script setup>
import {NotificationsNoneFilled, AccountBoxRound, ManageAccountsFilled, LogOutFilled} from "@vicons/material"
import {storeToRefs} from "pinia";
import {ref, onMounted, watch} from 'vue';
import {useRouter} from "vue-router";

const router = useRouter();
//主题切换
import {useThemeStore} from "@/stores/themeStore";

const themeStore = useThemeStore(); //创建对象
const {theme, isDarkTheme} = storeToRefs(themeStore); //传递对象
const {changeTheme, changeRailStyle} = themeStore; //函数直接取出

//登录模态框显示
import {handOffModalStore} from "@/stores/loginModalStore";

const handOffModal = handOffModalStore();
const {changeModalStatus} = handOffModal;
//登录成功后显示信息
import {useUserStore} from "@/stores/userStore";

const userStore = useUserStore();
const {id: userId, headPic: userAvatar, nickname} = storeToRefs(userStore);
const {levelInfo, resetUserInfo} = userStore;
//头像下拉菜单信息
import {NIcon} from "naive-ui";
//读取图标
const renderIcon = (icon) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    });
  };
};
//菜单选项
const menuOptions = [
  {
    key: 'user-center',
    label: "个人中心",
    icon: renderIcon(AccountBoxRound),
  },
  {
    key: 'account-setting',
    label: "账号设置",
    icon: renderIcon(ManageAccountsFilled)
  },
  {
    key: 'sign-out',
    label: "退出登录",
    icon: renderIcon(LogOutFilled)
  }
]
//点击菜单按钮
import UserApi from '@/api/user'
//消息提示
import {useMessage} from 'naive-ui'

const message = useMessage()
//控制弹出消息框的显示
const showPopover = ref(false);
//操作菜单
const updateMenuStatus = (key, item) => {
  if (key === 'sign-out') {
    UserApi.userSignOut().then(res => {
      if (res.data.code === 60003) {
        //注销成功
        message.success(res.data.message)
        showPopover.value = true;
        setTimeout(() => {
          showPopover.value = false;
        }, 1000)
        resetUserInfo();
        //删除本地存储信息
        window.localStorage.removeItem('token')
      } else {
        message.error(res.data.message)
      }
    })
  } else if (key === 'user-center') {
    router.push('/userCenter')
  } else if (key === 'account-setting') {
    router.push('/userAccountSetting')
  }
}


const activeTab = ref('')
const tabs = [
  {
    name: 'zan',
    title: '点赞',
    messages: [
      {content: '你的文章《XX》收到一条点赞', time: '2023-10-13 22:12:11'},
      {content: '你的文章《YY》收到一条点赞', time: '2023-10-13 22:12:11'},
      {content: '你的文章《YY》收到一条点赞', time: '2023-10-13 22:12:11'},
      {content: '你的文章《YY》收到一条点赞', time: '2023-10-13 22:12:11'},
      {content: '你的文章《YY》收到一条点赞', time: '2023-10-13 22:12:11'},
      {content: '你的文章《YY》收到一条点赞', time: '2023-10-13 22:12:11'},
    ],
  },
  {
    name: 'star',
    title: '关注',
    messages: [
      {content: '张三 关注了你', time: '2023-10-13 22:12:11'},
      {content: '张三 关注了你', time: '2023-10-13 22:12:11'},
    ],
  },
  {
    name: 'comment',
    title: '评论',
    messages: [
      {content: '张三 评论了你的文章《XX》"学到了"', time: '2023-10-13 22:12:11'},
      {content: '李四 评论了你的文章《YY》"不如Vue"', time: '2023-10-13 22:12:11'},
    ],
  },
]
const count = ref(tabs.map((item) => item.messages).flat().length)

watch(activeTab, (v) => {
  if (count === 0) return
  const tabIndex = tabs.findIndex((item) => item.name === v)
  count.value -= tabs[tabIndex].messages.length
  if (count.value < 0) count.value = 0
})

function handlePopoverShow(show) {
  if (show && !activeTab.value) {
    activeTab.value = tabs[0]?.name
  }
}
const messageTab = ref([])
//===========================================websocket==============================================
import {useSocket} from '@/components/common/WebSocket.vue'
const { socket, send, on, off } = useSocket('ws://localhost:8080/note/webSocket');
on('open', event => {
  console.log("Connected to server", event);
});
on('message', data => {
  if (data !== null && data !== ''){
    const uId = data.split('^')[0];
    const uIdNumber = parseInt(uId);
    if (uIdNumber === userId.value){
      const time = data.split('^')[1];
      const message = data.split('^').slice(2).join('^');
      const obj = {
        time,
        message
      };
      messageTab.value.push(obj);
    }
  }
});

on('error', error => {
  console.error("WebSocket Error:", error);
});
on('close', event => {
  console.log("Connection closed", event);
});
//===========================================websocket==============================================
</script>

<template>

  <!--头部应用栏-->
  <n-space align="center" justify="space-between" style="height: 100%">

    <n-text style="font-size: 20px">Note</n-text>
    <n-space style="text-align: center">
      <!--头像-->
      <n-popover :disabled="showPopover" trigger="click" width="260" content-style="padding: 10px">
        <!--  -->
        <!--头像菜单触发器-->
        <template #trigger>
          <n-button circle :bordered="false">
            <n-avatar v-if="userId !== null" round :size="34" :src="userAvatar"/>
          </n-button>
        </template>
        <!--弹出信息主要内容-->
        <n-thing id="thing" :title="nickname">
          <!--头像-->
          <template #avatar>
            <n-avatar size="large" round :src="userAvatar" style="position: relative;top:6px"/>
          </template>
          <!--描述-->
          <template #description>
            <n-space align="center">
              <n-tag size="small" :bordered="false" type="success">{{ levelInfo }}</n-tag>
              <n-text depth="3">2099-01-31 到期</n-text>
            </n-space>
          </template>
          <template #default>
            <!--分割线-->
            <n-divider style="margin: 5px auto"/>
            <!--下拉菜单-->
            <n-menu id="user-header-menu" :options="menuOptions" :on-update:value="updateMenuStatus"
                    style="position: relative"/>
          </template>
        </n-thing>
      </n-popover>
      <!--分割线-->
      <n-divider v-if="userId !== null" vertical style="position: relative;top:5px;"
                 :style="theme.theDividingLineColor"/>
      <!--消息提示-->
      <n-badge dot processing :offset="[-6,1]">
        <n-popover trigger="hover" placement="bottom-end">
          <template #trigger>
            <n-button tertiary circle>
              <n-icon size="19" :component="NotificationsNoneFilled"></n-icon>
            </n-button>
          </template>
          <n-thing>
            <n-tabs type="line" animated>
              <n-tab-pane name="likes" tab="点赞">
                <n-space vertical v-if="messageTab.length > 0" v-for="item of messageTab">
                  <n-text>{{item.message}}</n-text>
                  <n-text :depth="3">{{ item.time }}</n-text>
                  <n-divider style="margin-top: 0px"/>
                </n-space>
              </n-tab-pane>
              <n-tab-pane name="comments" tab="评论">
                Hey Jude
              </n-tab-pane>
            </n-tabs>
          </n-thing>
        </n-popover>

      </n-badge>
      <!--全局背景切换-->
      <n-switch size="medium" style="margin-top: 6px" @update:value="changeTheme(!isDarkTheme)"
                :rail-style="changeRailStyle" v-model:value="isDarkTheme">
        <template #checked-icon>
          <n-icon :component="theme.icon"></n-icon>
        </template>
        <template #unchecked-icon>
          <n-icon :component="theme.icon"></n-icon>
        </template>
      </n-switch>
      <!--登录按钮-->
      <n-button v-if="userId === null" tertiary type="primary" @click="changeModalStatus(true)">登录</n-button>
    </n-space>
  </n-space>
</template>

<style scoped>
.n-menu#user-header-menu:deep(.n-menu-item-content) {
  padding-left: 6px !important;
}

.n-menu:deep(.n-menu-item-content::before) {
  left: 0;
  right: 0;
}

.n-menu#user-header-menu:deep(.n-menu-item-content .n-menu-item-content-header) {
  margin-top: 3px;
}

.n-thing#thing:deep(.n-thing-header__title) {
  font-size: 16px;
  font-weight: bold;
}
</style>