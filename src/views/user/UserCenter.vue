<script setup>
import {onMounted} from "vue";
import {FileImageOutlined} from "@vicons/antd";
import {NIcon} from "naive-ui";
import {useLoadingBar} from 'naive-ui'
const loadingBar = useLoadingBar()
import {useMessage} from 'naive-ui'
const message = useMessage()
//===================================用户查询，保存BEGIN===========================================
import {useUserStore} from "@/stores/userStore";

const userStore = useUserStore();
const {updateNicknameAndHeadPic,levelInfo} = userStore;
import UserApi from '@/api/user/index'

onMounted(() => {
  getUserInfo() //获取用户信息
})
const userMessage = ref({
  id: null,
  email: '',
  nickName: '',
  avatar: null,
  level: '',
  createTime: '',
})
const getUserInfo = () => {
  disabledBtn(resetButton,true)
  loadingBar.start()
  UserApi.getUserInfo().then(res => {
    if (res.data.code === 200) {
      userMessage.value.id = res.data.data.id
      userMessage.value.email = res.data.data.email
      userMessage.value.nickName = res.data.data.nickName
      userMessage.value.avatar = res.data.data.avatar
      userMessage.value.level = res.data.data.level
      userMessage.value.createTime = res.data.data.createTime
      loadingBar.finish()
    } else {
      loadingBar.error()
    }
    disabledBtn(resetButton,false,true,2)
  }).catch(err => {
    disabledBtn(resetButton,false,true,2)
    loadingBar.error()
  })
}
let userInfo = window.localStorage.getItem('user')
const userId = JSON.parse(userInfo).id;
const token = JSON.parse(userInfo).token;
const handleFinish = ({
                        file,
                        event
                      }) => {
  //message.success((event?.target).response.data);
  userMessage.value.avatar = JSON.parse((event?.target).response).data.url
  //const ext = file.name.split(".")[1];
  //file.name = `更名.${ext}`;
  //file.url = "__HTTPS__://www.mocky.io/v2/5e4bafc63100007100d8b70f";
  return file;
};//图片上传成功的回调函数
const updateUserMessage = () => {
  disabledBtn(saveButton,true)
  loadingBar.start()
  const obj = {
    nickName: userMessage.value.nickName,
    avatar: userMessage.value.avatar,
  }
  UserApi.updateUserMessage(obj).then(res => {
    if (res.data.code === 60033) {
      message.success(res.data.message)
      updateNicknameAndHeadPic(obj.nickName,obj.avatar);//更新本地昵称和头像
      loadingBar.finish()
      getUserInfo()
    } else {
      console.log(res)
      loadingBar.error()
    }
    disabledBtn(saveButton,false,true,2)
  }).catch(err => {
    console.log(err)
    loadingBar.error()
    disabledBtn(saveButton,false,true,2)
  })
}
const resetUserMessage = () => {
  getUserInfo()
}
//===================================用户查询，保存END=============================================
//===================================时间线BEGIN=============================================
import TimeLine from '@/components/common/TimeLine.vue'
import {disabledBtn} from "@/utils/disabledBtn";
const saveButton = ref(false)
const resetButton = ref(false)
//===================================时间线END=============================================
</script>
<template>
  <n-layout>
    <n-layout position="absolute" has-sider>
      <n-layout-sider
          content-style="padding: 24px;"
          :native-scrollbar="false"
          bordered
          :width="500"
          style="margin-left: 0px"
      >
        <n-space vertical>
          <n-h1>个人中心</n-h1>
          <n-text :depth="3">你是本站的第{{ userMessage.id }}位注册用户哦！</n-text>
          <n-divider/>
          <n-space vertical>
            <n-text>头像</n-text>
            <n-upload action="/note-serve/image/upload"
                      :headers="{'Authorization': 'Bearer ' + token,'id': userId}"
                      accept="image/*"
                      @finish="handleFinish"
                      :show-file-list="false"
                      :max="5">
              <n-avatar
                  v-if="userMessage.avatar !== null"
                  size="large"
                  style="width: 160px;height: 150px;cursor: pointer"
                  :src="userMessage.avatar"
              />
              <n-button v-else text>
                <n-icon :component="FileImageOutlined" :size="100"></n-icon>
              </n-button>
            </n-upload>
          </n-space>
          <n-space vertical>
            <n-text>邮箱号</n-text>
            <n-input v-model:value="userMessage.email" :disabled="true"></n-input>
          </n-space>
          <n-space vertical>
            <n-text>昵称</n-text>
            <n-input v-model:value="userMessage.nickName"></n-input>
          </n-space>
          <n-space vertical>
            <n-text>创建时间</n-text>
            <n-input v-model:value="userMessage.createTime" :disabled="true"></n-input>
          </n-space>
          <n-grid cols="2" :x-gap="12" style="margin-top: 10px">
            <n-gi>
              <n-button :disabled="saveButton" @click="updateUserMessage" block type="success" ghost>
                保存
              </n-button>
            </n-gi>
            <n-gi>
              <n-button :disabled="resetButton" @click="resetUserMessage" block tertiary>
                重置
              </n-button>
            </n-gi>
          </n-grid>
          <n-divider/>
          <n-text :depth="3" v-if="userMessage.level === 1">当前你的等级是
            <n-text style="color: red">会员用户</n-text>
            哦！
          </n-text>
          <n-text :depth="3" v-else>当前你的等级为<n-gradient-text type="warning">{{levelInfo.level}}</n-gradient-text></n-text>
        </n-space>
      </n-layout-sider>
      <n-layout-content embedded position="absolute" style=" left: 496px; top: -40px; bottom: -41px;">
        <time-line />
      </n-layout-content>
    <!--   -->
    </n-layout>
  </n-layout>
</template>
<style scoped>

</style>