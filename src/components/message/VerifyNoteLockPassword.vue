<script setup>
const props = defineProps({
  show:{type:Boolean,default:false}
})
const emits = defineEmits(['confirm','cancel','thoroughConfirm'])
import {LockOutlined} from "@vicons/material";
const verifyTheUnlockPasswordRef = ref(null)  //验证
const verifyTheUnlockPasswordForm = ref({
  lockPassword: '',
})//验证笔记密码表单
const verifyTheUnlockPasswordRules = {
  lockPassword: {
    required: true,
    message: '请输入解锁密码',
    trigger: "blur"
  }
}//验证笔记密码表单
const verifyTheUnlockPasswordMethod1 = () => {
  verifyTheUnlockPasswordRef.value?.validate((errors) => {
    if(!errors){
      emits('confirm',verifyTheUnlockPasswordForm.value.lockPassword)
      verifyTheUnlockPasswordForm.value.lockPassword = ''
    }
  })
}//普通解锁
const verifyTheUnlockPasswordMethod2 = () => {
  verifyTheUnlockPasswordRef.value?.validate((errors) => {
    if(!errors){
      emits('thoroughConfirm',verifyTheUnlockPasswordForm.value.lockPassword)
      verifyTheUnlockPasswordForm.value.lockPassword = ''
    }
  })
}//彻底解锁
const cancelMethod = () => {
  verifyTheUnlockPasswordForm.value.lockPassword = ''
  emits('cancel')
}
</script>
<template>
  <n-modal :show="props.show" style="width: 400px;height: 200px">
    <n-card>
      <n-space justify="space-between" align="center">
        <h2>笔记解锁</h2>
        <n-text depth="3">
          <n-button type="info" text>忘记笔记密码？</n-button>
        </n-text>
      </n-space>
      <n-form ref="verifyTheUnlockPasswordRef" :model="verifyTheUnlockPasswordForm"
              :rules="verifyTheUnlockPasswordRules">
        <n-form-item label="解锁密码" path="lockPassword">
          <n-input type="password" v-model:value="verifyTheUnlockPasswordForm.lockPassword" placeholder="输入解锁密码"
                   show-password-on="mousedown">
            <template #prefix>
              <n-icon :component="LockOutlined"></n-icon>
            </template>
          </n-input>
        </n-form-item>
      </n-form>
      <template #action>
        <n-grid cols="2" :x-gap="12" style="margin-top: -30px">
          <n-gi>
            <n-button @click="verifyTheUnlockPasswordMethod1" block type="success"  ghost>
              解锁
            </n-button>
          </n-gi>
          <n-gi>
            <n-button block tertiary @click="cancelMethod">
              取消
            </n-button>
          </n-gi>
        </n-grid>
        <n-button @click="verifyTheUnlockPasswordMethod2" block type="error" style="width: 100%;margin-top: 10px" ghost>
          彻底解锁
        </n-button>
      </template>
    </n-card>
  </n-modal>
</template>