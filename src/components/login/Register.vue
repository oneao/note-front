<script setup>
import {EmailOutlined, LockOutlined} from "@vicons/material"; //图标
import {ref, computed, h} from 'vue';
import UserApi from '@/api/user'
import { useMessage } from 'naive-ui'
const message = useMessage();
//登陆表单
const registerFormData = ref({
  email: '',
  password: '',
  reenteredPassword: '',
  code: '', //验证码
  checked: false
})
//密码和重复密码验证
const validatePasswordStartWith = (rule, value) => {
  return !!registerFormData.value.password && registerFormData.value.password.startsWith(value) && registerFormData.value.password.length >= value.length;
}
const validatePasswordSame = (rule, value) => {
  return value === registerFormData.value.password;
}
const rPasswordFormItemRef = ref(null);
const handlePasswordInput = () => {
  if (registerFormData.value.reenteredPassword) {
    rPasswordFormItemRef.value?.validate({trigger: "password-input"});
  }
}
//检验密码长度
const isPasswordInvalid = computed(() => {
  return registerFormData.value.password.length >= 6;
})
//登录规则
const registerFormRules = {
  //邮箱
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
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: ["blur"]
    },
    {
      validator(rule, value) {
        //value是用户输入的值
        return value.length >= 6;
      },
      message: '密码的长度应大于等于6',
      trigger: ["input"]
    }
  ],
  reenteredPassword: [
    {
      required: true,
      message: "请再次输入密码",
      trigger: ["input", "blur"]
    },
    {
      validator: validatePasswordStartWith,
      message: "两次密码输入不一致",
      trigger: "input"
    },
    {
      validator: validatePasswordSame,
      message: "两次密码输入不一致",
      trigger: ["blur", "password-input"]
    }
  ],
  //验证码
  code: {
    required: true,
    message: '请输入获取的验证码',
    trigger: ["input", "blur"],
    key: 'code'
  },
  //是否勾选
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
const registerFormRef = ref(null)
//获取验证码验证
const getCodeButtonClick = (e) => {
  e.preventDefault();
  registerFormRef.value?.validate(
      (errors) => {
        if (!errors) {
          const email = registerFormData.value.email;
          UserApi.getCode(email).then(res => {
            if(res.code === 60001){
              //获取验证码成功
              message.success(res.data.message);
            }else{
              //获取验证码失败
              message.error(res.data.message);
            }
          }).catch(err => {
            console.log(err)
            // message.error(res.data.message);
          })
          //调用验证码倒计时方法
          codeCountDownMethod();
        }
      },
      (rule) => {
        return rule?.key !== 'code'
      }
  );
}
//获取验证码倒计时
const codeCountDownData = ref({
  text: '获取验证码', //显示文本
  time: 60,  //倒计时时间
  disabled: false,   //按钮是否禁用
  block: null
})
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
//重置获取验证码状态
const resetCodeCountDownData = () => {
  clearInterval(codeCountDownData.value.block);
  codeCountDownData.value.text = '获取验证码';
  codeCountDownData.value.time = 60;
  codeCountDownData.value.disabled = false;
}
//注册验证
const handleValidateClick = (e) => {
  e.preventDefault();
  registerFormRef.value?.validate((errors) => {
    if (!errors) {
      const registerForm = {
        email : registerFormData.value.email,
        password: registerFormData.value.password,
        code:registerFormData.value.code
      }
      UserApi.userRegister(registerForm).then(res => {
        console.log(res);
        if(res.data.code === 60002){
          message.success(res.data.message)
          //跳转到登录页面
          emits('changeModal',3);
        }else{
          message.error(res.data.message)
        }
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
      <h2>注册</h2>
      <n-text depth="3">已有账号？
        <n-button type="info" text @click="emits('changeModal',1)">去登录</n-button>
      </n-text>
    </n-space>
    <n-form ref="registerFormRef" :model="registerFormData" :rules="registerFormRules">
      <n-form-item label="邮箱账号" path="email" first style="margin-top: 8px">
        <n-input placeholder="输入邮箱号" v-model:value="registerFormData.email">
          <!--     prefix插槽       -->
          <template #prefix>
            <n-icon :component="EmailOutlined"></n-icon>
          </template>
        </n-input>
      </n-form-item>
      <n-form-item label="密码" path="password" first style="margin-top: 8px">
        <n-input placeholder="输入密码" type="password" @input="handlePasswordInput" @keydown.enter.prevent
                 v-model:value="registerFormData.password">
          <!--     prefix插槽       -->
          <template #prefix>
            <n-icon :component="LockOutlined"></n-icon>
          </template>
        </n-input>
      </n-form-item>
      <n-form-item label="确认密码" path="reenteredPassword" ref="rPasswordFormItemRef" first style="margin-top: 8px">
        <n-input placeholder="输入确认密码"
                 v-model:value="registerFormData.reenteredPassword"
                 :disabled="!isPasswordInvalid"
                 type="password"
                 @keydown.enter.prevent>
          <!--     prefix插槽       -->
          <template #prefix>
            <n-icon :component="LockOutlined"></n-icon>
          </template>
        </n-input>
      </n-form-item>
      <!--       验证码-->
      <n-grid :cols="2" :x-gap="20">
        <n-form-item-gi :span="1" path="code" label="验证码">
          <n-input v-model:value="registerFormData.code" placeholder="输入验证码">
            <template #prefix>
              <n-icon :component="LockOutlined"></n-icon>
            </template>
          </n-input>
        </n-form-item-gi>
        <n-form-item-gi :span="1">
          <n-button @click="getCodeButtonClick" :disabled="codeCountDownData.disabled" block type="success">
            {{ codeCountDownData.text }}
          </n-button>
        </n-form-item-gi>
      </n-grid>
      <!--        同意授权-->
      <n-form-item path="checked" :show-label="false">
        <n-checkbox v-model:checked="registerFormData.checked">同意</n-checkbox>
        <n-button text type="info">《存储条款》</n-button>
      </n-form-item>
      <!--          登录-->
      <n-form-item :show-label="false">
        <n-button @click="handleValidateClick" block type="success" ghost>
          注册
        </n-button>
      </n-form-item>
    </n-form>
  </n-card>
</template>