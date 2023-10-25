<script setup>
import {ref, onMounted} from 'vue'
import {LockTwotone} from '@vicons/material'
import {HeartOutlined, HeartFilled} from '@vicons/antd'
import { useMessage } from 'naive-ui'
const message = useMessage()
import { useLoadingBar } from 'naive-ui'
const loadingBar = useLoadingBar()

const likeHeart = ref(false)  //点赞
const toLickNote = () => {
  loadingBar.start()
  likeHeart.value = !likeHeart.value
  if (likeHeart.value){
    noteShareObj.value.noteLikeNumber++
  }else{
    noteShareObj.value.noteLikeNumber--
  }
  const obj = {
    id:id.value,
    likeHeart:likeHeart.value ? '1' : '0' //true:1 false:0
  }
  console.log(obj)
  NoteApi.goToLick(obj).then(res => {
    if(res.data.code === 60030 || res.data.code === 60031){
      message.success(res.data.message)
    }else {
      console.log(res)
      loadingBar.error()
    }
    loadingBar.finish();
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
}//去点赞或取消点赞
import NoteApi from '@/api/note'
//笔记内容
const show404 = ref(false)
const show403 = ref(false)
const id = ref('') //分享表的id
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const n_sid = urlParams.get('n_sid');
  if (n_sid === null || n_sid === '') {
    show404.value = true
  } else {
    id.value = n_sid;
    NoteApi.getShareNoteIsLock(n_sid).then(res => {
      if (res.data.code === 60022 || res.data.code === 60023){
        show404.value = true;
      }else if(res.data.code === 60024){
        //需要锁
        show403.value = true  //显示403
        showNoteSharePasswordModal.value = true  //显示输入密码框
      }else if (res.data.code === 60025){
        //不需要锁
        getNoteShareInfo();
      }else {
        show404.value = true;
      }
    }).catch(err => {
      console.log(err)
    })
  }
})
const noteShareObj = ref({})
const getNoteShareInfo = () => {
  loadingBar.start()
  const obj = {
    n_sid : id.value,
    noteSharePassword: noteSharePassword.value
  }
  NoteApi.getShareNote(obj).then(res => {
    if (res.data.code === 60026){
      message.error(res.data.message)
      loadingBar.error()
    }else if(res.data.code === 60027){
      console.log(res)
      message.success(res.data.message)
      showNoteSharePasswordModal.value = false
      show403.value = false
      noteShareObj.value = res.data.data //赋值
      loadingBar.finish()
    }else {
      console.log(res)
      loadingBar.error()
    }
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
} //获取笔记信息
const noteSharePassword = ref('') //分享表的密码
const showNoteSharePasswordModal = ref(false)
const verifyNotePasswordConfirmMethod = () => {
  if (noteSharePassword.value === '' || noteSharePassword.value === null){
    message.error('访问密码不能为空哦!')
  }else{
    getNoteShareInfo()  //发送获取笔记信息的请求!
  }
} //点击确认密码按钮
const verifyNotePasswordCancelMethod = () => {
  noteSharePassword.value = '' //重置
  showNoteSharePasswordModal.value = false
} //点击取消按钮
</script>
<template>
  <div v-if="!show404 && !show403" class="page-container">
    <div class="header">
      <n-space justify="center" :size="30">
        <n-gradient-text type="warning" style="font-weight: bold">
          分享人：{{ noteShareObj.nickName }}
        </n-gradient-text>
        <n-gradient-text type="info" style="font-weight: bold">
          分享时间：{{ noteShareObj.noteShareThatTime }}
        </n-gradient-text>
        <n-space justify="space-between" :size="0">
          <n-gradient-text style="font-weight: bold">点赞数：
            <n-number-animation ref="numberAnimationInstRef" :from="0" :to="noteShareObj.noteLikeNumber"/>
          </n-gradient-text>
        </n-space>
        <n-space justify="space-between" :size="0">
          <n-gradient-text type="error" style="font-weight: bold">点赞：</n-gradient-text>
          <n-button text @click="toLickNote">
            <n-icon v-if="!likeHeart" :component="HeartOutlined" :size="22" style="margin-top: -1px"></n-icon>
            <n-icon v-else color="red" :component="HeartFilled" :size="22" style="margin-top: -1px"></n-icon>
          </n-button>
        </n-space>
        <n-space justify="space-between" :size="0">
          <n-gradient-text type="warning" style="font-weight: bold">访问量：
            <n-number-animation ref="numberAnimationInstRef" :from="0" :to="noteShareObj.noteShareVisitNumber"/>
          </n-gradient-text>
        </n-space>
      </n-space>
    </div>
    <n-space justify="center">
      <n-gradient-text type="error" :size="20">标题:{{noteShareObj.noteShareTitle}}</n-gradient-text>
    </n-space>
    <n-space :size="12">
      <n-gradient-text style="margin-top: 3px" :size="14" >标签:</n-gradient-text>
      <n-tag v-if="typeof noteShareObj.noteShareTags !== 'string' || noteShareObj.noteShareTags === ''" type="error" :bordered="false">
        该笔记没有标签哦！
      </n-tag>
      <n-tag v-else v-for="tag in noteShareObj.noteShareTags.split(',')" :bordered="false">{{ tag }}</n-tag>
    </n-space>
    <n-space style="margin-top: 10px">
      <n-text :depth="3">备注：{{noteShareObj.noteShareRemark}}</n-text>
    </n-space>
    <div class="content">
      <div class="note-content" v-html="noteShareObj.noteShareContent"></div>
    </div>
    <div class="footer">
      <n-space vertical style="text-align: center">
        <n-gradient-text type="error" style="font-weight: bold" :size="22">ONEAO-NOTE</n-gradient-text>
        <n-text depth="3">注意：分享{{noteShareObj.noteShareTime}}天内有效!</n-text>
      </n-space>
    </div>
  </div>
  <!--结果页-->
  <n-result v-else-if="show404" status="404" title="404 资源不存在" description="生活总归带点荒谬" class="centered">
    <template #footer>
      <n-button>找点乐子吧</n-button>
    </template>
  </n-result>
  <n-result v-else-if="show403" status="403" title="403 禁止访问" class="centered" description="总有些门是对你关闭的">
    <template #footer>
      <n-button @click="showNoteSharePasswordModal = true">输入密码访问!</n-button>
    </template>
  </n-result>
  <!--需要密码是否展示的内容-->
  <n-modal :show="showNoteSharePasswordModal">
    <n-card style="width: 400px;height: 200px">
      <template #header>
        该笔记访问需要密码哦！
      </template>
      <template #header-extra>
        <n-icon :component="LockTwotone" :size="22"></n-icon>
      </template>
      <template #default>
        <n-text>输入笔记密码</n-text>
        <n-input v-model:value="noteSharePassword" placeholder="笔记密码" clearable type="password" style="margin-left: -2px;margin-top: 10px"></n-input>
      </template>
      <template #footer>
        <n-grid :x-gap="12" :cols="2">
          <n-gi>
            <n-button block @click="verifyNotePasswordConfirmMethod">确认</n-button>
          </n-gi>
          <n-gi>
            <n-button block @click="verifyNotePasswordCancelMethod">取消</n-button>
          </n-gi>
        </n-grid>
      </template>
    </n-card>
  </n-modal>
</template>


<style scoped>
.centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
//background-color: #f5f5f5; padding: 10px;
}


.publisher {
  font-weight: bold;
  margin-right: 10px;
}

.publish-time {
  font-weight: bold;
  margin-right: 10px;
}


.content {
  margin-top: 20px;
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.note-content:deep(img) {
  max-width: 750px;
  //max-width: 100%;
  height: auto;
}
.footer {
  margin-top: 20px;
//background-color: #f5f5f5; padding: 10px;
}

</style>
