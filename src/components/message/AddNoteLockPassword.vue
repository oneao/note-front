<script setup>
const props = defineProps({
  show: {type: Boolean, default: false}
})
const emits = defineEmits(['confirm', 'cancel'])
import {LockOutlined} from "@vicons/material";

const addLockPassWordRef = ref(null)  //验证
const rPasswordFormItemRef = ref(null);
const addLockPassWordForm = ref({
  password: '',
  reenteredPassword:''
})//验证笔记密码表单

function validatePasswordStartWith(rule, value) {
  return !!addLockPassWordForm.value.password && addLockPassWordForm.value.password.startsWith(value) && addLockPassWordForm.value.password.length >= value.length;
}
function validatePasswordSame(rule, value) {
  return value === addLockPassWordForm.value.password;
}
const addLockPassWordRules = {
  password: [
    {
      required: true,
      message: "请输入密码"
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
  ]
}//验证笔记密码表单
const addLockPassWordMethod = () => {
  addLockPassWordRef.value?.validate((errors) => {
    if (!errors) {
      emits('confirm', addLockPassWordForm.value.password)
      addLockPassWordForm.value.password = ''
      addLockPassWordForm.value.reenteredPassword = ''
    }
  })
}//验证笔记密码的方法
const cancelMethod = () => {
  addLockPassWordForm.value.password = ''
  addLockPassWordForm.value.reenteredPassword = ''
  emits('cancel')
}
const handlePasswordInput = () =>{
  if (addLockPassWordRef.value.reenteredPassword) {
    rPasswordFormItemRef.value?.validate({ trigger: "password-input" });
  }
}
</script>
<template>
  <n-modal :show="props.show" style="width: 400px;height: 280px">
    <n-card>
      <n-space justify="space-between" align="center">
        <h2>笔记加密</h2>
        <n-icon :component="LockOutlined" :size="24"  color="red"></n-icon>
      </n-space>
      <n-space vertical>
        <n-form ref="addLockPassWordRef" :model="addLockPassWordForm"
                :rules="addLockPassWordRules">
          <n-form-item path="password" label="笔记密码">
            <n-input v-model:value="addLockPassWordForm.password" placeholder="请输入密码" type="password" @input="handlePasswordInput" @keydown.enter.prevent>
              <template #prefix>
                <n-icon :component="LockOutlined"></n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item ref="rPasswordFormItemRef" first path="reenteredPassword" label="确认密码">
            <n-input v-model:value="addLockPassWordForm.reenteredPassword" placeholder="请输入确认密码" :disabled="!addLockPassWordForm.password" type="password"
                     @keydown.enter.prevent>
              <template #prefix>
                <n-icon :component="LockOutlined"></n-icon>
              </template>
            </n-input>
          </n-form-item>
        </n-form>
      </n-space>
      <template #action>
        <n-grid cols="2" :x-gap="12" style="margin-top: -30px">
          <n-gi>
            <n-button @click="addLockPassWordMethod" block type="success" ghost>
              加锁
            </n-button>
          </n-gi>
          <n-gi>
            <n-button block tertiary @click="cancelMethod">
              取消
            </n-button>
          </n-gi>
        </n-grid>
      </template>
    </n-card>
  </n-modal>
</template>