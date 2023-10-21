<script setup>
import {LockOutlined, LockOpenFilled} from '@vicons/material'
import {htmlToText} from "html-to-text";

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

const emits = defineEmits(['clickLock'])
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
        <n-icon v-if="isLock" @click="emits('clickLock',true)" :size="20" :component="LockOutlined"/>
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
          <n-tag v-else-if="null === noteTags||''===noteTags" size="small" :bordered="false" type="warning">
            该笔记暂无标签哦!
          </n-tag>
          <n-tag v-else v-for="tag in noteTags.split(',')" :type="tagColor()" size="small"
                 :bordered="false">{{ tag }}
          </n-tag>
          <n-divider/>
        </n-space>
        <n-text depth="3">{{ noteTime }}</n-text>
      </n-space>
    </template>
  </n-thing>

</template>