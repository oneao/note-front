<script setup>
import {NotificationsNoneFilled, AccountBoxRound, ManageAccountsFilled, LogOutFilled} from "@vicons/material"
import {CloseOutlined} from '@vicons/antd'
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
const {id: userId, headPic: userAvatar, nickname, token} = storeToRefs(userStore);
const {levelInfo, resetUserInfo} = userStore;
//头像下拉菜单信息
import {NIcon, useDialog} from "naive-ui";
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


//===========================================websocket==============================================
//评论============================
const commentObj = {
  userId: 0,
  index: 0,
  time: '',
  message: ''
}
const commentList = ref([])
//评论============================

import {useSocket} from '@/components/common/WebSocket.vue'


const messageTab = ref([])
const isJSONString = (data) => {
  try {
    JSON.parse(data);
    return true;
  } catch (error) {
    return false;
  }
}

if (userId.value === null || userId.value === '') {
  userId.value = -1
}
const {socket, send, on, off} = useSocket(`ws://localhost:8080/note/webSocket/${userId.value}`);
on('open', event => {
  console.log("Connected to server", event);
});

on('message', data => {
  if (data === 'ping') {
  } else if (data !== null && data !== '' && isJSONString(data)) {
    const jsonData = JSON.parse(data);
    jsonData.message = '你分享的笔记《' + jsonData.message + '》被评论啦！😝';
    // 转换时间格式
    const dateTime = new Date(jsonData.time);
    jsonData.time = dateTime.toISOString().slice(0, 19).replace('T', ' ');
    commentList.value.push(jsonData);
  } else {
    const uId = data.split('^')[0];
    const uIdNumber = parseInt(uId);
    if (uIdNumber === userId.value) {
      const index = data.split('^')[1];
      const time = data.split('^')[2];
      const message = data.split('^').slice(3).join('^');
      const obj = {
        index,
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
const getLikeMessage = () => {
  UserApi.getLikeMessage().then(res => {
    console.log(res)
    if (res.data.code === 200) {
      if (res.data.data !== null) {
        res.data.data.forEach(item => {
          const index = item.split('^')[0]
          const time = item.split('^')[1]
          const message = item.split('^')[2]
          const obj = {
            index, time, message
          }
          messageTab.value.push(obj)
        })
      }
    }
  })
}
const getCommentReply = () => {
  UserApi.getCommentReply().then(res => {
    if (res.data.code === 200) {
      if (res.data.data !== null) {
        res.data.data.forEach(item => {
          item.message = '你分享的笔记《' + item.message + '》被评论啦！😝';
          commentList.value.push(item)
        })
      }
    }
  })
}
onMounted(() => {
  if (token.value !== null && token.value !== '') {
    getLikeMessage()
    getCommentReply()
  }
})
//===========================================websocket==============================================

//===========================================删除点赞信息=============================================
const goToDelLikeMessage = (item) => {
  const value = item.index + "^" + item.time + "^" + item.message
  UserApi.delOneLikeMessage(value).then(res => {
    if (res.data.code === 200) {
      message.success("删除成功")
      //删除成功
      messageTab.value = messageTab.value.filter(value => {
        return item !== value;
      })
    } else {
      //删除失败
      message.error(res.data.message)
    }
  })
}
//n-tabs标签
const dialog = useDialog();
const handleBeforeLeave = (tabName) => {
  switch (tabName) {
    case "delAll":
      dialog.success({
        title: "删除所有",
        content: "你确定删除所有信息？",
        positiveText: "确定",
        negativeText: "取消",
        maskClosable: false,
        onPositiveClick: () => {
          if (messageTab.value.length > 0) {
            UserApi.delAllReplyMessage().then(res => {
              if (res.data.code === 200) {
                messageTab.value = []
                commentList.value = []
                message.success('删除所有信息成功')
              } else {
                message.error(res.data.message)
              }
            }).catch(err => {
              message.error(err)
            })
          } else {
            message.info('当前没有消息哦！')
          }
        },
        onNegativeClick: () => {

        }
      });
      return false;
    default:
      return true;
  }
}

const delOneCommentReply = (item) => {
  UserApi.delOneCommentReply(item.index).then(res => {
    if (res.data.code === 200) {
      message.success("删除成功")
      commentList.value = commentList.value.filter(k => {
        return k.index !== item.index
      })
      commentList.value.forEach(k => {
        if(k.index > item.index){
          k.index = k.index - 1;
        }
      })
    }
  })
}
//===========================================删除点赞信息=============================================


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
      <n-badge :value="messageTab.length + commentList.length" processing :offset="[-6,1]">
        <n-popover trigger="click" placement="bottom-end">
          <template #trigger>
            <n-button tertiary circle>
              <n-icon size="19" :component="NotificationsNoneFilled"></n-icon>
            </n-button>
          </template>
          <n-thing>
            <n-tabs type="line" animated default-value="likes"
                    @before-leave="handleBeforeLeave">
              <n-tab-pane name="likes" tab="点赞">
                <n-scrollbar style="max-height: 200px">
                  <n-space vertical v-if="messageTab.length > 0" v-for="item of messageTab">
                    <n-text>{{ item.message }}</n-text>
                    <n-space justify="space-between">
                      <n-text :depth="3">{{ item.time }}</n-text>
                      <n-icon :component="CloseOutlined" @click="goToDelLikeMessage(item)"
                              style="cursor: pointer"></n-icon>
                    </n-space>
                    <n-divider style="margin-top: 0px"/>
                  </n-space>
                </n-scrollbar>
              </n-tab-pane>
              <n-tab-pane name="comments" tab="评论">
                <n-scrollbar style="max-height: 200px">
                  <n-space vertical v-if="commentList.length > 0" v-for="item of commentList">
                    <n-text>{{ item.message }}</n-text>
                    <n-space justify="space-between">
                      <n-text :depth="3">{{ item.time }}</n-text>
                      <n-icon :component="CloseOutlined"
                              style="cursor: pointer" @click="delOneCommentReply(item)"></n-icon>
                    </n-space>
                    <n-divider style="margin-top: 0px"/>
                  </n-space>
                </n-scrollbar>
              </n-tab-pane>
              <n-tab-pane name="delAll" tab="删除所有">
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