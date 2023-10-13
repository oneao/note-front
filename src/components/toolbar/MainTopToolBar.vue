<script setup>
import {NotificationsNoneFilled, AccountBoxRound, ManageAccountsFilled, LogOutFilled} from "@vicons/material"
import {storeToRefs} from "pinia";
import {ref, onMounted, watch} from 'vue';
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
        resetUserInfo();
        //删除本地存储信息
        window.localStorage.removeItem('token')
      } else {
        message.error(res.data.message)
      }
    })
  }
}

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
        <n-button tertiary circle>
          <n-icon size="19" :component="NotificationsNoneFilled"></n-icon>
        </n-button>
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