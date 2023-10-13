<script setup>
import {EmailOutlined, LockOutlined} from "@vicons/material"; //图标
import {ref,computed} from 'vue';
import {useMessage, useLoadingBar} from "naive-ui";

const message = useMessage();
const loadingBar = useLoadingBar();
//登陆表单
const loginFormData = ref({
  email: '',
  password: '',
  checked: false
})
//邮箱提示计算属性
const emailOptions = computed(() => {
  return ["@gmail.com", "@163.com", "@qq.com"].map((suffix) => {
    const prefix = loginFormData.value.email.split("@")[0];
    return {
      label: prefix + suffix,
      value: prefix + suffix
    };
  });
})
//登录规则
const loginFormRules = {
  email: [
    {
      required: true,
      message: '请输入邮箱号',
      trigger: ["input", "blur"]
    },
    {
      validator(rule, value) {
        //value是用户输入的值
        return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)
      },
      message: '请输入正确的邮箱号码',
      trigger: ["input", "blur"]
    }
  ],
  password: {
    required: true,
    message: '请输入密码',
    trigger: ["input", "blur"]
  },
  checked: {
    validator(rule, value) {
      //value是用户输入的值
      return value
    },
    message: '请认真阅读后勾选',
    trigger: "change"
  }
}
//表单声明对象
const loginFormRef = ref(null)
//登录验证
import UserApi from '@/api/user'
//用户共享资源
import {useUserStore} from '@/stores/userStore'

const userStore = useUserStore();
const {setUserInfo} = userStore;
//禁用按钮
const loginBtnDisabled = ref(false);
//引用登录模态框显示与否
import {handOffModalStore} from '@/stores/loginModalStore'

const modalStore = handOffModalStore();
const {changeModalStatus} = modalStore;
const handleValidateClick = (e) => {
  e.preventDefault();
  loginFormRef.value?.validate((errors) => {
    if (!errors) {
      loadingBar.start(); //加载条开始
      loginBtnDisabled.value = true; //禁用按钮
      const loginForm = {
        email: loginFormData.value.email,
        password: loginFormData.value.password
      }
      UserApi.userLogin(loginForm).then(res => {
        if (res.data.code === 60000) {
          const user = res.data.data.user;
          //登录成功
          loadingBar.finish();//加载条结束
          message.success(res.data.message);
          changeModalStatus(false); //关闭登录模态框
          localStorage.setItem("token", res.data.data.token) //存储token
          setUserInfo(user.id, user.email, user.nickName, user.avatar, user.level, user.createTime);
        } else {
          //登录失败
          loadingBar.error(); //加载条异常结束
          message.error(res.data.message);
        }
        //2.5s后解除登录按钮
        setTimeout(() => {
          loginBtnDisabled.value = false;
        }, 1500)
      }).catch(err => {
        console.log(err)
        loadingBar.error(); //加载条异常结束
        message.error("发生异常")
        //2.5s后解除登录按钮
        setTimeout(() => {
          loginBtnDisabled.value = false;
        }, 2500)
      })
    }
  });
}
//自定义页面跳转事件
const emits = defineEmits(['changeModal'])
</script>
<template>
  <n-card>
    <n-space justify="space-between" align="center">
      <h2>登录</h2>
      <n-text depth="3">暂无账号？
        <n-button @click="emits('changeModal',2)" type="info" text>去注册</n-button>
      </n-text>
    </n-space>
    <n-form ref="loginFormRef" :model="loginFormData" :rules="loginFormRules">
      <n-form-item label="邮箱账号" path="email" first style="margin-top: 8px">
        <!--<n-input placeholder="输入邮箱号" v-model:value="loginFormData.email">-->
        <!--  &lt;!&ndash;     prefix插槽       &ndash;&gt;-->
        <!--  <template #prefix>-->
        <!--    <n-icon :component="EmailOutlined"></n-icon>-->
        <!--  </template>-->
        <!--</n-input>-->
        <n-auto-complete v-model:value="loginFormData.email"
                         :input-props="{autocomplete: 'disabled'}"
                         placeholder="输入邮箱号"
                         :options="emailOptions"
                         clearable>
          <!--     prefix插槽       -->
          <template #prefix>
            <n-icon :component="EmailOutlined"></n-icon>
          </template>
        </n-auto-complete>
      </n-form-item>
      <n-form-item path="password" label="密码">
        <n-input type="password" v-model:value="loginFormData.password" placeholder="输入密码"
                 show-password-on="mousedown">
          <template #prefix>
            <n-icon :component="LockOutlined"></n-icon>
          </template>
        </n-input>
      </n-form-item>
      <!--        同意授权-->
      <n-form-item path="checked" :show-label="false">
        <n-checkbox v-model:checked="loginFormData.checked">同意</n-checkbox>
        <n-button text type="info">《存储条款》</n-button>
      </n-form-item>
      <!--          登录-->
      <n-form-item :show-label="false">
        <n-button @click="handleValidateClick" :disabled="loginBtnDisabled" block type="success" ghost>
          登录
        </n-button>
      </n-form-item>
    </n-form>
    <!--   忘记密码   -->
    <n-space justify="center" style="cursor: pointer">
      <n-text depth="3">忘记密码</n-text>
    </n-space>
  </n-card>
</template>