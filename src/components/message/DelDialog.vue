<script setup>
//引入图标
import {WarningRound} from '@vicons/material'
import {computed} from "vue";
//定义需要传递的属性
const props = defineProps({
  title:{type:String},//标题
  size:{type:Number,default:1},//删除的个数
  show:{type:Boolean,default:false}, //是否显示删除框
  deleteBtn : {type:Boolean,default:true},  //删除按钮
  deleteCompleteBtn : {type:Boolean,default:true}, //彻底删除按钮
  isCreateNew : {type:Number}
})
const describe = computed(() => {
  if (props.size === 1){
    //如果删除的个数是1
    if (props.deleteBtn){
      //如果是删除按钮
      if (props.isCreateNew === 0){
        return '删除《' + props.title + '》将无法恢复!'
      }else{
        return '删除《' + props.title + '》可在回收站内恢复!'
      }
    }else if(props.deleteCompleteBtn){
      return '彻底删除《' + props.title + '》将无法恢复!'
    }else{
      return '删除提醒';
    }
  }else{
    //删除的个数是多个
    return '删除多个文件提醒'
  }
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
      <n-button size="small" v-if="deleteBtn" @click="emits('delete',1,isCreateNew)" secondary type="error">删除</n-button>
      <n-button size="small" @click="emits('cancel')" tertiary>取消</n-button>
    </template>
  </n-modal>
</template>