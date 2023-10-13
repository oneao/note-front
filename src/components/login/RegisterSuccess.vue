<script setup>
  import {SentimentSatisfiedTwotone} from '@vicons/material'
  //自定义页面跳转事件
  const emits = defineEmits(['changeModal'])
</script>

<template>
  <n-card style="text-align: center">
    <n-icon size="120" :component="SentimentSatisfiedTwotone" color="#87CEEB"></n-icon>
    <h2 style="margin-bottom: 10px">欢迎加入Note笔记</h2>
    <n-text depth="3" style="margin:0 10px">
      恭喜注册成功，
      点击前往<n-button @click="emits('changeModal',1)" type="info" text>登录页面</n-button>
    </n-text>
  </n-card>
</template>