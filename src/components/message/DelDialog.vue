<script setup>
//引入图标
import {WarningRound} from '@vicons/material'
//定义需要传递的属性
defineProps({
  show: {type:Boolean,default:false}, //是否显示删除框
  describe : {type:String,required:true}, //提示信息描述
  deleteBtn : {type:Boolean,default:true},  //删除按钮
  deleteCompleteBtn : {type:Boolean,default:true} //彻底删除按钮
})
//自定义事件
const emits = defineEmits(['deleteComplete','delete','cancel'])

</script>
<template>
  <n-modal
      transform-origin="center"
      :show="show"
      preset="dialog"
      type="warning"
      title="删除提醒"
      :closable="false"
  >
    <template #icon>
      <n-icon :component="WarningRound" style="position: relative;top:-2px"></n-icon>
    </template>
    <template #default>{{describe}}</template>
    <template #action>
      <n-button size="small" v-if="deleteCompleteBtn" @click="emits('deleteComplete',2)" tertiary type="error">彻底删除</n-button>
      <n-button size="small" v-if="deleteBtn" @click="emits('delete',1)" secondary type="error">删除</n-button>
      <n-button size="small" @click="emits('cancel')" tertiary>取消</n-button>
    </template>
  </n-modal>
</template>