<script setup>
import {ref,computed} from "vue";
import {AddBoxRound, DeleteForeverFilled} from "@vicons/material";
//待办事件对象的声明
const onCreateToDoObj = () => ({
  isChecked: false,//是否完成
  toDoThing: ''//待办的事件
})
//声明待办对象的接受
const toDoObj = ref([])
//计算该小记的内容是否已完成，都完成的话则显示‘已完成’的图片
const toDoIsFinishedImage = computed(() => {
  if(toDoObj.value.length === 0) return false;
  return toDoObj.value.every(item => item.isChecked)
})
//声明小记到期提示
const expireTimePrompt = ref(false)
//声明是否开启消息提示
const expireTimePromptShow = (blag) => {
  expireTimePrompt.value = blag;
}
//声明默认时间
const time = ref([Date.now(),new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime()]);
//获取用户输入的时间
const getTime = (userTime) => {
  console.log(userTime)
}
//选择日期时间的限制
const disablePreviousDate = (ts) => {
  return ts < Date.now() - 24 * 60 * 60 * 1000;
}
</script>
<template>
  <n-modal :show="false" :auto-focus="false">
    <n-card style="width: 460px;text-align: center" :class="{'one-thing-card-finished':toDoIsFinishedImage}">
      <template #header>
        <n-gradient-text type="info" style="font-size: 20px;margin-bottom: 5px">
          小记标题
        </n-gradient-text>
        <n-input size="large" style="width: 100%;background-color: transparent" placeholder="请输入小记标题"></n-input>
      </template>
      <!--底部区域-->
      <template #default>
        <div>
          <n-space align="center">
            <!--置顶容器-->
            <n-gradient-text type="warning" style="font-size: 16px;">
              置顶:
            </n-gradient-text>
            <n-switch :round="false"></n-switch>
            <!--标签容器-->
            <n-space align="center">
              <n-gradient-text type="warning" style="font-size: 16px;">
                标签:
              </n-gradient-text >
              <n-dynamic-tags :max="5" :default-value="['IT','计算机','程序员','what']"></n-dynamic-tags>
            </n-space>
          </n-space>
          <!--分割线-->
          <n-divider/>
          <!--代办事项-->
          <n-dynamic-input :on-create="onCreateToDoObj" v-model:value="toDoObj">
            <template #create-button-default>
              添加待办事件
            </template>
            <!--动态输入框-->
            <template #default="{ value }">
              <div style="display: flex; align-items: center; width: 100%">
                <!--复选框-->
                <n-checkbox v-model:checked="value.isChecked"/>
                <!--输入框-->
                <n-input v-model:value="value.toDoThing" placeholder="请输入待办事项,选中代表完成！" style="margin-left: 12px"/>
              </div>
            </template>
            <template #action="{ index, create, remove, move }">
              <div style="display: flex; align-items: center; margin-left: 12px">
                <!--添加按钮-->
                <n-button @click="() => create(index)" circle tertiary type="tertiary" style="margin-right: 8px">
                  <n-icon :component="AddBoxRound"/>
                </n-button>
                <!--删除按钮-->
                <n-button @click="() => remove(index)" circle tertiary type="tertiary">
                  <n-icon :component="DeleteForeverFilled"/>
                </n-button>
              </div>
            </template>
          </n-dynamic-input>
          <!--分割线-->
          <n-divider/>
          <!--小记备注-->
          <n-space vertical>
            <n-gradient-text type="warning" style="font-size: 18px;display: block">
              小记备注
            </n-gradient-text>
            <n-input
                type="textarea"
                placeholder="请输入小记备注信息"
                style="width: 100%"
                default-value="🌷🌷🌷"
            />
          </n-space>
          <!--分割线-->
          <n-divider/>
          <n-space style="margin-top: 10px;margin-bottom: 10px" center>
            <!--置顶容器-->
            <n-gradient-text type="warning" style="font-size: 16px;">
              是否开启小记到期提示:
            </n-gradient-text>
            <n-switch :round="false" :on-update:value="expireTimePromptShow"></n-switch>

          </n-space>
          <n-space vertical v-if="expireTimePrompt">
            <n-text :depth="3" style="">注意：提示信息将发送至您的邮箱！</n-text>
            <n-gradient-text type="warning" style="font-size: 18px;display: block">
              起始时间
            </n-gradient-text>
            <n-date-picker v-model:value="time" :default-value="time" type="datetimerange" :on-confirm="getTime" :is-date-disabled="disablePreviousDate" clearable />
            <!-- 起始时间 -->
          </n-space>
        </div>
      </template>
      <template #action>
        <n-grid cols="2" :x-gap="12">
          <n-gi>
            <n-button block ghost type="primary">保存</n-button>
          </n-gi>
          <n-gi>
            <n-button block tertiary>取消</n-button>
          </n-gi>
        </n-grid>
      </template>
    </n-card>
  </n-modal>
</template>
<style scoped>
.n-card.one-thing-card-finished{
  background-image: url("@/assets/finish.png");
  background-repeat: no-repeat;
  background-position: 360px 0;
  animation: finished 0.25s linear forwards;
}
@keyframes finished {
  from{
    background-size: 130px 130px;
  }
  to{
    background-size: 100px 100px;
  }
}
</style>