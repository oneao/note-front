<script setup>
import {disabledBtn} from "@/utils/disabledBtn";
import UserApi from '@/api/user/index'
import {useMessage} from 'naive-ui'

const message = useMessage()
import {useLoadingBar} from 'naive-ui'

const loadingBar = useLoadingBar()

import {SettingOutlined} from "@vicons/antd";
import {useUserStore} from "@/stores/userStore";

const userStore = useUserStore();
const {email} = userStore;

//=====================================重置密码BEGIN=========================================
import md5 from 'js-md5'
const resetButton = ref(false)
const resetPassword = ref({
  old: '',
  new: ''
})
const toResetPassword = () => {
  disabledBtn(resetButton,true)
  loadingBar.start()
  if (resetPassword.value.old === '' || resetPassword.value.new === '' || resetPassword.value.old.length < 6 ||
      resetPassword.value.new.length < 6) {
    loadingBar.error()
    message.error('密码的长度不应小于6')
    disabledBtn(resetButton,false,true,2)
    return
  }
  const obj = {
    oldPassword: md5(email + resetPassword.value.old),
    newPassword: md5(email + resetPassword.value.new)
  }
  UserApi.toResetPassword(obj).then(res => {
    if (res.data.code === 60035) {
      //更新成功
      resetPassword.value.old = ''
      resetPassword.value.new = ''
      message.success(res.data.message)
      loadingBar.finish()
    } else if (res.data.code === 60034) {
      message.error(res.data.message)
      loadingBar.error()
    } else {
      console.log(res)
      loadingBar.error()
    }
    disabledBtn(resetButton,false,true,2)
  }).catch(err => {
    console.log(err)
    loadingBar.error()
    disabledBtn(resetButton,false,true,2)
  })
}
//=====================================重置密码END=========================================


//=====================================忘记密码BEGIN=========================================
const showForget = ref(false)
//获取验证码倒计时
const codeCountDownData = ref({
  text: '获取验证码', //显示文本
  time: 60,  //倒计时时间
  disabled: false,   //按钮是否禁用
  block: null
})
const resetCodeCountDownData = () => {
  clearInterval(codeCountDownData.value.block);
  codeCountDownData.value.text = '获取验证码';
  codeCountDownData.value.time = 60;
  codeCountDownData.value.disabled = false;
}
const codeCountDownMethod = () => {
  codeCountDownData.value.block = setInterval(() => {
    if (codeCountDownData.value.time === 1) {
      //不需要倒计时
      resetCodeCountDownData();
    } else {
      //需要倒计时
      codeCountDownData.value.disabled = true;  //禁用
      codeCountDownData.value.time--;
      codeCountDownData.value.text = codeCountDownData.value.time + '秒后重新获取';
    }
  }, 1000)
}
//获取验证码
const getResetCodeMethod = () => {
  loadingBar.start()
  UserApi.getForgetCode(email).then(res => {
    if (res.data.code === 60036){
      message.success(res.data.message)
      loadingBar.finish()
    }else {
      message.error(res.data.message)
      loadingBar.error()
    }
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
  codeCountDownMethod()
}
const forgetForm = ref({
  code:'',
  newPassword:''
})
const forgetConfirmButton = ref(false)
const toUpdateForgetPassword = () => {
  loadingBar.start()
  disabledBtn(forgetConfirmButton,true)
  if (forgetForm.value.code === '' || forgetForm.value.newPassword === '' || forgetForm.value.newPassword.length < 6 ){
    message.error('验证码不能为空,密码不能为空,并长度需要大于6位')
    disabledBtn(forgetConfirmButton,false,true,2)
    return
  }
  const obj = {
    email:email,
    code:forgetForm.value.code,
    newPassword: forgetForm.value.newPassword
  }
  UserApi.updateForgetPassword(obj).then(res => {
    if (res.data.code === 60035){
      message.success(res.data.message)
      loadingBar.finish()
      forgetForm.value.code = ''
      forgetForm.value.newPassword = ''
      showForget.value = false
    }else {
      message.error(res.data.message)
      loadingBar.error()
    }
    disabledBtn(forgetConfirmButton,false,true,2)
  }).catch(err => {
    console.log(err)
    loadingBar.error()
    disabledBtn(forgetConfirmButton,false,true,2)
  })
}

//=====================================忘记密码END=========================================
</script>
<template>
  <div class="content">
    <n-card style="width: 400px;height: 100%">
      <template #header>账号设置中心</template>
      <template #header-extra>
        <n-icon :component="SettingOutlined" :size="24"/>
      </template>
      <template #default>
        <n-space vertical>
          <n-text>账号</n-text>
          <n-input :disabled="true" v-model:value="email"></n-input>
          <template v-if="!showForget">
            <n-text>原密码</n-text>
            <n-input type="password" v-model:value="resetPassword.old" placeholder="输入原密码"></n-input>
            <n-text>新密码</n-text>
            <n-input type="password" v-model:value="resetPassword.new" placeholder="输入新密码"></n-input>
          </template>
          <template v-else>
            <n-text>验证码</n-text>
            <n-space>
              <n-input v-model:value="forgetForm.code" placeholder="输入验证码"></n-input>
              <n-button @click="getResetCodeMethod" :disabled="codeCountDownData.disabled" block type="success" style="width: 158px;">{{codeCountDownData.text}}</n-button>
            </n-space>
            <n-text>新密码</n-text>
            <n-input type="password" v-model:value="forgetForm.newPassword" placeholder="输入新密码"></n-input>
            <n-grid cols="2" :x-gap="12" style="margin-top: 20px">
              <n-gi>
                <n-button :disabled="forgetConfirmButton" @click="toUpdateForgetPassword" block type="success" ghost>
                  确认
                </n-button>
              </n-gi>
              <n-gi>
                <n-button  @click="showForget = false"  block tertiary>
                  取消
                </n-button>
              </n-gi>
            </n-grid>
          </template>
        </n-space>

        <n-grid cols="2" :x-gap="12" style="margin-top: 20px">
          <n-gi>
            <n-button v-if="!showForget" :disabled="resetButton" @click="toResetPassword" block type="success" ghost>
              重置密码
            </n-button>
          </n-gi>
          <n-gi>
            <n-button v-if="!showForget" @click="showForget = true" block tertiary>
              忘记密码
            </n-button>
          </n-gi>
        </n-grid>
        <n-space vertical style="margin-top: 20px">
          <n-text :depth="3">当前用户等级为普通用户</n-text>
        </n-space>
      </template>
    </n-card>
  </div>
</template>

<style scoped>
.content {
  width: 100%;
  height: 100%;
  background-image: url(/userAccountSetting.jpg);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
</style>