<script setup>
import {ref, computed, h,onBeforeUnmount} from "vue";
import {AddBoxRound, DeleteForeverFilled} from "@vicons/material";
import {NSpace, NText} from 'naive-ui'
import {useMessage} from 'naive-ui'
const message = useMessage()
import {useLoadingBar} from 'naive-ui'
const loadingBar = useLoadingBar()
import {useNotification} from 'naive-ui'
const notification = useNotification()
import bus from 'vue3-eventbus'
bus.on('createNewSmallNote',()=>{
  showEditModal(null)
})
//组件卸载之前停止监听
onBeforeUnmount(() => {
  bus.off('createNewSmallNote')
})
//按钮禁用
import {disabledBtn} from "@/utils/disabledBtn";
const saveButtonDisabled = ref(false)
//自定义事件
const emits = defineEmits(['save'])
//引入Api
import SmallNoteApi from "@/api/smallNote";
//是否显示编辑小记模态框
const show = ref(false)
//骨架屏加载
const loading = ref(true)
//声明表单对象
const formObj = ref({
  smallNoteId: null,
  userId: null,
  smallNoteTitle: '',//标题
  smallNoteTags: [],//标签
  smallNoteEvents: [],//待办事项
  smallNoteRemark: '🌷🌷🌷',//备注
  isTop: false,//是否置顶
  //计算该小记的内容是否已完成，都完成的话则显示‘已完成’的图片
  isFinished: computed(() => {
    const events = formObj.value.smallNoteEvents;
    if (events.length === 0) return false;
    return events.every(item => item.isChecked);
  }),
  isPrompt: false,//是否开启时间限制
  time: [Date.now(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime()],//起始时间
})
//显示编辑小记的模态框
const showEditModal = id => {
  //显示小记模态框
  show.value = true;
  loading.value = true;
  //如果id有值则为编辑小记，无值则为新增小记
  if (id === null) {
    //新增
    loading.value = false;
  } else {
    loading.value = false;
    //修改
    formObj.value.smallNoteId = id;
    getOneSmallNote();
    //调用获取小记的方法
    //处理回显数据
  }
}
//验证表单的规则
const saveSmallNoteForm = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      loadingBar.start();
      disabledBtn(saveButtonDisabled,true)
      if (formObj.value.smallNoteId === null) {
        //新增
        addSmallNote();
      }else{
        //修改
        updateSmallNote();
      }
    } else {
      const errorsMessage = [].concat(...errors)
      // 显示错误的通知
      notification.error({
        title: '编辑小记保存提醒',
        content: () =>
            h(NSpace, {vertical: true}, {
              default: () =>
                  errorsMessage.map((item, index) =>
                      h(NText, {type: 'error'}, {
                        default: () => `${index + 1}：${item.message}`,
                      })
                  ),
            }),
        duration: 5000,
      })
    }
  })
};
//保存小记
const addSmallNote = () => {
  const userId = JSON.parse(window.localStorage.getItem('user')).id;
  const isFinished = formObj.value.isFinished ? 1 : 0;
  const addObj = {
    userId: userId,
    smallNoteTitle: formObj.value.smallNoteTitle,//标题
    smallNoteTags: formObj.value.smallNoteTags.toString(),//标签
    smallNoteEvents: JSON.stringify(formObj.value.smallNoteEvents),//待办事项
    smallNoteRemark: formObj.value.smallNoteRemark,//备注
    isTop: formObj.value.isTop ? 1 : 0,//是否置顶
    isFinished: isFinished,//是否完成
    isPrompt: formObj.value.isPrompt ? 1 : 0,//是否开启时间限制
    beginTime: formObj.value.time[0],
    endTime: formObj.value.time[1]
  }
  SmallNoteApi.addSmallNote(addObj).then(res => {
    disabledBtn(saveButtonDisabled,false,true,2)
    if (res.data.code === 60006) {
      //新增成功
      message.success(res.data.message)
      show.value = false;
      loadingBar.finish();
      //重新获取小记列表
      emits('save',false,false); //触发自定义事件
    }
  }).catch(errors => {
    console.log(errors)
    loadingBar.error();
  })
}
//获取单个小记
const getOneSmallNote = () => {
  SmallNoteApi.getOneSmallNote(formObj.value.smallNoteId).then(res => {
    if(res.data.code === 200){
      formObj.value.smallNoteTitle = res.data.data.smallNoteTitle
      formObj.value.smallNoteTags = res.data.data.smallNoteTags.split(',')
      formObj.value.smallNoteEvents = JSON.parse(res.data.data.smallNoteEvents)
      formObj.value.smallNoteRemark = res.data.data.smallNoteRemark
      formObj.value.isTop = res.data.data.isTop === 1
      if(res.data.data.isPrompt === 1){
        formObj.value.isPrompt = true
        formObj.value.time[0] = new Date(res.data.data.beginTime).getTime();
        formObj.value.time[1] = new Date(res.data.data.endTime).getTime();
      }
    }
  })
}
//发送修改小记请求
const updateSmallNote = () => {
  const userId = JSON.parse(window.localStorage.getItem('user')).id;
  const obj = {
    userId: userId,
    smallNoteId : formObj.value.smallNoteId,
    smallNoteTitle: formObj.value.smallNoteTitle,//标题
    smallNoteTags: formObj.value.smallNoteTags.toString(),//标签
    smallNoteEvents: JSON.stringify(formObj.value.smallNoteEvents),//待办事项
    smallNoteRemark: formObj.value.smallNoteRemark,//备注
    isTop: formObj.value.isTop ? 1 : 0,//是否置顶
    isFinished: formObj.value.isFinished ? 1 : 0,//是否完成
    isPrompt: formObj.value.isPrompt ? 1 : 0,//是否开启时间限制
    beginTime: formObj.value.time[0],
    endTime: formObj.value.time[1]
  }
  SmallNoteApi.updateSmallNote(obj).then(res => {
    disabledBtn(saveButtonDisabled,false,true,2)
    if(res.data.code === 60004){
      message.success(res.data.message)
      show.value = false;
      loadingBar.finish();
      //重新获取小记列表
      emits('save'); //触发自定义事件
    }
  }).catch(err => {
    console.log(err)
  })
}
//重置编辑中的小记
const resetEditSmallNote = () => {
  formObj.value.id = null
  formObj.value.userId = null
  formObj.value.smallNoteTitle = ''
  formObj.value.smallNoteTags = []
  formObj.value.smallNoteEvents = []
  formObj.value.smallNoteRemark = '🌷🌷🌷'
  formObj.value.isPrompt = false
  formObj.value.isTop = false
}
//暴露函数
defineExpose({showEditModal})
//编辑小记的表单引用
const formRef = ref(null)
//验证规则
const formRules = {
  smallNoteTitle: {
    required: true,
    message: '请输入小记的标题'
  },
  smallNoteTags: {
    required: true,
    message: '请输入小记的标签'
  },
  smallNoteEvents: {
    required: true,
    message: '请输入小记的待办事项'
  }
}
//待办事件对象的声明
const onCreateToDoObj = () => ({
  isChecked: false,//是否完成
  toDoThing: ''//待办的事件
})
//获取用户选中的时间
const getTime = (userTime) => {
  console.log(userTime)
}
//选择日期时间的限制
const disablePreviousDate = (ts) => {
  return ts < Date.now() - 24 * 60 * 60 * 1000;
}
</script>
<template>
  <n-modal v-model:show="show" :auto-focus="false" :on-after-leave="resetEditSmallNote" transform-origin="center" :close-on-esc="false"
  :mask-closable="false">
    <div>
      <!--骨架屏-->
      <n-card v-if="loading" style="width: 460px;text-align: center"
              :class="{'one-thing-card-finished': formObj.isFinished}">
        <!--底部区域-->
        <template #default>
          <n-skeleton style="margin-bottom: 5px;margin-left: 160px" :width="90" :height="25"></n-skeleton>
          <n-skeleton style="margin-bottom: 5px;" :width="410" :height="30">
            <!--小记标题-->
            <n-input v-model:value="formObj.smallNoteTitle" size="large"
                     style="width: 100%;background-color: transparent;margin-bottom: 15px"
                     placeholder="请输入小记标题"></n-input>
          </n-skeleton>
          <div style="margin-top: 15px">
            <n-space align="center">
              <!--置顶容器-->
              <n-skeleton :width="40" :height="20">
              </n-skeleton>
              <n-skeleton :width="30" :height="20">
              </n-skeleton>
              <n-skeleton :width="40" :height="20" style="margin-left:-2px;">
              </n-skeleton>
              <n-skeleton :width="30" :height="20">
              </n-skeleton>
            </n-space>
            <!--分割线-->
            <n-divider/>
            <!--代办事项-->
            <n-skeleton :width="410" :height="45"></n-skeleton>
            <!--分割线-->
            <n-divider/>
            <!--小记备注-->
            <n-space vertical>
              <n-skeleton style="margin-bottom: 5px;margin-left: 160px" :width="90" :height="25">
              </n-skeleton>
              <n-skeleton :width="410" :height="80">
              </n-skeleton>
            </n-space>
            <!--分割线-->
            <n-divider/>
            <n-space style="margin-top: 10px;margin-bottom: 10px" center>
              <n-skeleton :width="220" :height="22"></n-skeleton>
              <n-skeleton :width="40" :height="22" style="margin-left: 5px"></n-skeleton>
            </n-space>
          </div>
        </template>
        <template #action>
          <n-grid cols="2" :x-gap="12">
            <n-gi>
              <n-skeleton :width="200" :height="30"></n-skeleton>
            </n-gi>
            <n-gi>
              <n-skeleton :width="200" :height="30"></n-skeleton>
            </n-gi>
          </n-grid>
        </template>
      </n-card>
      <!--实际数据显示区-->
      <n-card v-else style="width: 460px;text-align: center"
              :class="{'one-thing-card-finished': formObj.isFinished}">
        <!--底部区域-->
        <template #default>
          <n-form ref="formRef" :model="formObj" :rules="formRules">
            <n-gradient-text type="info" style="font-size: 20px;margin-bottom: 5px">
              小记标题
            </n-gradient-text>
            <n-form-item :show-label="false" :show-feedback="false" path="smallNoteTitle">
              <!--小记标题-->
              <n-input v-model:value="formObj.smallNoteTitle" size="large"
                       style="width: 100%;background-color: transparent;margin-bottom: 15px"
                       placeholder="请输入小记标题"></n-input>
            </n-form-item>
            <div>
              <n-space align="center">
                <!--置顶容器-->
                <n-gradient-text type="warning" style="font-size: 16px;">
                  置顶:
                </n-gradient-text>
                <!--置顶开关-->
                <n-switch :round="false" v-model:value="formObj.isTop"></n-switch>
                <!--标签容器-->
                <n-space align="center">
                  <n-form-item :show-label="false" :show-feedback="false" path="smallNoteTags">
                    <n-gradient-text type="warning" style="font-size: 16px;margin-right: 10px">
                      标签:
                    </n-gradient-text>
                    <!--标签选择-->
                    <n-dynamic-tags :max="5" v-model:value="formObj.smallNoteTags"></n-dynamic-tags>
                  </n-form-item>
                </n-space>
              </n-space>
              <!--分割线-->
              <n-divider/>
              <!--代办事项-->
              <n-form-item :show-label="false" :show-feedback="false" path="smallNoteEvents">
                <n-dynamic-input :on-create="onCreateToDoObj" v-model:value="formObj.smallNoteEvents">
                  <template #create-button-default>
                    添加待办事件
                  </template>
                  <!--动态输入框-->
                  <template #default="{ value }">
                    <div style="display: flex; align-items: center; width: 100%">
                      <!--复选框-->
                      <n-checkbox v-model:checked="value.isChecked"/>
                      <!--输入框-->
                      <n-input v-model:value="value.toDoThing" placeholder="请输入待办事项,选中代表完成！"
                               style="margin-left: 12px"/>
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
              </n-form-item>
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
                    v-model:value="formObj.smallNoteRemark"
                />
              </n-space>
              <!--分割线-->
              <n-divider/>
              <n-space style="margin-top: 10px;margin-bottom: 10px" center>
                <!--时间限制容器-->
                <n-gradient-text type="warning" style="font-size: 16px;">
                  是否为这个小记添加时间限制？
                </n-gradient-text>
                <n-switch :round="false" v-model:value="formObj.isPrompt"></n-switch>
              </n-space>
              <n-space vertical v-if="formObj.isPrompt">
                <n-text :depth="3" type="warning">注意：提示信息将发送至您的邮箱！</n-text>
                <n-gradient-text type="warning" style="font-size: 18px;display: block">
                  规定时间
                </n-gradient-text>
                <n-date-picker v-model:value="formObj.time" :default-value="formObj.time" type="datetimerange"
                               :on-confirm="getTime" :is-date-disabled="disablePreviousDate" clearable/>
                <!-- 起始时间 -->
              </n-space>
            </div>
          </n-form>
        </template>
        <template #action>
          <n-grid cols="2" :x-gap="12">
            <n-gi>
              <n-button :disabled="saveButtonDisabled" block ghost type="primary" @click="saveSmallNoteForm">保存</n-button>
            </n-gi>
            <n-gi>
              <n-button block tertiary @click="show = false">取消</n-button>
            </n-gi>
          </n-grid>
        </template>
      </n-card>
    </div>
  </n-modal>
</template>
<style scoped>
.n-card.one-thing-card-finished {
  background-image: url("@/assets/finish.png");
  background-repeat: no-repeat;
  background-position: 360px 0;
  animation: finished 0.25s linear forwards;
}

@keyframes finished {
  from {
    background-size: 130px 130px;
  }
  to {
    background-size: 100px 100px;
  }
}

</style>