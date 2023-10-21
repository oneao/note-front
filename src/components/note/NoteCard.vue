<script setup>
import {LockOutlined, LockOpenFilled} from '@vicons/material'
import { useMessage } from 'naive-ui' //消息
const message = useMessage()

import { useLoadingBar } from 'naive-ui'//加载条
const loadingBar = useLoadingBar()

import {htmlToText} from "html-to-text";

import NoteApi from '@/api/note'  //笔记api

const noteProps = defineProps({
  noteId: {type: Number, required: true},
  noteTitle: {type: String, required: true},
  noteBody: {type: String},
  noteTags: {type: String, required: false},
  isTop: {type: Boolean, required: true},
  isLock: {type: Boolean, required: true},
  noteTime: {type: String, required: true},
})//note组件需要的属性值
const fontTitleColor = () => {
  const fontCss = [
    'primary', 'info', 'success', 'warning', 'error'
  ];
  const randomIndex = Math.floor(Math.random() * fontCss.length);
  return fontCss[randomIndex];
};//随机产生笔记title的颜色
const tagColor = () => {
  const fontCss = [
    'info', 'success', 'warning', 'error'
  ];
  const randomIndex = Math.floor(Math.random() * fontCss.length);
  return fontCss[randomIndex];
};//随机产生标签的颜色
const verifyTheUnlockPasswordShow = ref(false) //验证笔记密码是否显示
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
const verifyTheUnlockPasswordMethod = () => {
  verifyTheUnlockPasswordRef.value?.validate((errors) => {
    if (!errors){
      loadingBar.start();
      const obj = {
        noteId:noteProps.noteId,//笔记id
        noteLockPassword:verifyTheUnlockPasswordForm.value.lockPassword
      }
      NoteApi.verifyNoteLockPassword(obj).then(res => {
        if(res.data.data === 60008){
          //TODO:验证成功
          message.success(res.data.message)
          loadingBar.finish();
        }else{
          message.error(res.data.message)
          loadingBar.error();
        }
      })
    }
  })
}//验证笔记密码的方法
</script>

<template>
  <n-thing>
    <template #header>
      <n-gradient-text :size="18" :type="fontTitleColor()">
        {{ noteTitle }}
      </n-gradient-text>
    </template>
    <template #header-extra>
      <n-button text :type="isLock ? 'error' : 'primary'">
        <n-icon v-if="isLock" @click="verifyTheUnlockPasswordShow = true" :size="20" :component="LockOutlined"/>
        <n-icon v-else :size="20" :component="LockOpenFilled"/>
      </n-button>
    </template>
    <template #description>
      <n-ellipsis line-clamp="2" :tooltip="false">
        <n-text v-if="null === noteBody" depth="3">暂无内容</n-text>
        <n-text v-else depth="3">{{ htmlToText(noteBody) }}</n-text>
      </n-ellipsis>
    </template>
    <template #default>
      <n-space vertical :size="8">
        <n-space align="center" :size="8">
          <n-tag type="primary" size="small" :bordered="false" v-if="isTop">置顶</n-tag>
          <n-tag v-if="isLock" size="small" :bordered="false" type="error">该笔记暂无法查看标签哦!</n-tag>
          <n-tag v-else-if="null === noteTags||''===noteTags" size="small" :bordered="false" type="warning">该笔记暂无标签哦!</n-tag>
          <n-tag v-else v-for="tag in noteTags.split(',')" :type="tagColor()" size="small"
                 :bordered="false">{{ tag }}
          </n-tag>
          <n-divider/>
        </n-space>
        <n-text depth="3">{{ noteTime }}</n-text>
      </n-space>
    </template>
  </n-thing>
  <!--验证笔记密码模态框-->
  <n-modal :show="verifyTheUnlockPasswordShow" style="width: 400px;height: 200px">
    <n-card>
      <n-space justify="space-between" align="center">
        <h2>笔记解锁</h2>
        <n-text depth="3">
          <n-button type="info" text>忘记密码？</n-button>
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
            <n-button @click="verifyTheUnlockPasswordMethod" block type="success"  ghost>
              解锁
            </n-button>
          </n-gi>
          <n-gi>
            <n-button block tertiary @click="verifyTheUnlockPasswordShow = false">
              取消
            </n-button>
          </n-gi>
        </n-grid>
      </template>
    </n-card>
  </n-modal>
</template>