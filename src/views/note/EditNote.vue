<script setup>
//=========================================公共操作BEGIN============================================
import {onBeforeUnmount, ref, shallowRef, onMounted, shallowReactive, h} from 'vue';
import {NSpace, NText, useMessage} from 'naive-ui' //消息
const message = useMessage()
import {useLoadingBar} from 'naive-ui'//加载条
const loadingBar = useLoadingBar()
import {useRouter} from "vue-router";//路由
const router = useRouter();
import {
  FiberManualRecordRound,
  StarBorderRound,
  MoreHorizRound,
  StarRound,
  LockOpenFilled,
  LockOutlined, AddBoxRound, DeleteForeverFilled
} from '@vicons/material'//图标
import {
  ShareAltOutlined
} from '@vicons/antd'
import NoteApi from '@/api/note/index'//引入笔记Api
const props = defineProps({
  noteId: {type: String, required: true}
})//自定义属性
onMounted(() => {
  showEditor.value = false
  window.addEventListener('beforeunload', refreshThePageMethod);
})
const refreshThePageMethod = () => {
  //console.log(props.noteId)
  updateNoteContentMethod(props.noteId, getContent())
}//页面刷新保存笔记
//=========================================公共操作END============================================

//=========================================获取单个笔记信息BEGIN============================================
const getOneNoteInfo = () => {
  loadingBar.start()
  NoteApi.getOneNote(props.noteId).then(res => {
    if (res.data.code === 200) {
      //获取成功
      note.value = res.data.data
      shareFormValue.value.shareTitle = note.value.noteTitle
      shareFormValue.value.shareTags = note.value.noteTags === null ? [] : note.value.noteTags.split(',')
      loadingBar.finish()
      setTimeout(() => {
        if (note.value.noteContent !== null && note.value.noteContent !== '') {
          showEditor.value = true
          valueHtml.value = note.value.noteContent
        }else{
          showEditor.value = true
          valueHtml.value = ''
        }
      }, 100)
      showEditor.value = true
      loadingBar.finish()
    } else if (res.data.code === 60016) {
      //不能直接访问
      message.error(res.data.message)
      showVerify.value = true;
      loadingBar.error()
    }
  })
}
const note = ref({})  //note对象
getOneNoteInfo();

watch(() => props.noteId,
    (newValue, oldValue) => {
      showEditor.value = false;
      // 销毁，并移除 editor
      updateNoteContentMethod(oldValue, getContent());
      getOneNoteInfo();
    })//监听id值如何发生变化，那么就会重新调用请求方法。
const updateNoteContentMethod = (noteId, obj) => {
  loadingBar.start()
  if (obj.html === note.value.noteContent) { //如果没有变化，则不更新。
    loadingBar.finish()
    return;
  }
  const updateObj = {
    noteId: noteId,
    noteBody: obj.text.replace(/\s+/g, ' ').trim().substring(0, 40),
    noteContent: obj.html,
  }
  NoteApi.updateNoteContent(updateObj).then(res => {
    if (res.data.code === 60017) {
      //自動保存成功
      loadingBar.finish()
      message.success('笔记自动保存成功!')
    } else {
      //保存失敗
      loadingBar.error()
    }
  }).catch(err => {
    loadingBar.error()
    console.log(err)
  })
}

//=========================================获取单个笔记信息END============================================

//=========================================引入显示验证密码框BEGIN============================================
import VerifyNoteLockPassword from "@/components/message/VerifyNoteLockPassword.vue";
import md5 from "js-md5";

const showVerify = ref(false) //是否显示
const cancelShowVerify = () => {
  showVerify.value = false
}//取消显示
const getVerifyNotePassword = (lockPassword) => {
  loadingBar.start()
  const obj = {
    noteId: props.noteId,
    lockPassword: md5(lockPassword)
  }
  NoteApi.verifyNoteLockPassword(obj).then(res => {
    if (res.data.code === 60008) {
      loadingBar.finish()
      cancelShowVerify() //关闭并清空输入的值
      message.success(res.data.message)
      router.push('/note/edit/' + obj.noteId)
    } else if (res.data.code === 60009) {
      message.error(res.data.message)
      loadingBar.error()
    } else {
      console.log('未知响应码')
      loadingBar.error()
    }
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
} //验证笔记密码的api
const getThoroughNotePassword = (lockPassword) => {
  loadingBar.start()
  const obj = {
    noteId: props.noteId,
    lockPassword: md5(lockPassword)
  }
  console.log(obj)
  NoteApi.completelyLiftedNoteLockPassword(obj).then(res => {
    if (res.data.code === 60015) {
      loadingBar.finish()
      cancelShowVerify() //关闭并清空输入的值
      message.success(res.data.message)
      getNoteInfo(false, false)
      router.push('/note/edit/' + obj.noteId)
    } else if (res.data.code === 60009) {
      message.error(res.data.message)
      loadingBar.error()
    } else {
      console.log('未知响应码')
      loadingBar.error()
    }
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
}
//=========================================引入显示验证密码框END============================================

//=========================================文档编辑器BEGIN============================================
const showEditor = ref(true)
import '@wangeditor/editor/dist/css/style.css';
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {disabledBtn} from "@/utils/disabledBtn";

// 编辑器实例，必须用 shallowRef ，重要！
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('')
// 编辑器配置
let userInfo = window.localStorage.getItem('user')
const userId = JSON.parse(userInfo).id;
const token = JSON.parse(userInfo).token;
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/note-serve/image/upload',
      fieldName: 'file',
      // 单个文件的最大体积限制，默认为 2M
      maxFileSize: 1 * 1024 * 1024, // 1M
      // 最多可上传几个文件，默认为 100
      maxNumberOfFiles: 10,
      // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
      allowedFileTypes: ['image/*'],
      // 将 meta 拼接到 url 参数中，默认 false
      metaWithUrl: false,
      // 自定义增加 http  header
      headers: {
        'Authorization': 'Bearer ' + token,
        'id': userId
      },
      // 跨域是否传递 cookie ，默认为 false
      withCredentials: true,
      // 超时时间，默认为 10 秒
      timeout: 5 * 1000, // 5 秒
      // 上传之前触发
      onBeforeUpload(file) {    // JS 语法
        // file 选中的文件，格式如 { key: file }
        return file
        // 可以 return
        // 1. return file 或者 new 一个 file ，接下来将上传
        // 2. return false ，不上传这个 file
      },

      // 上传进度的回调函数
      onProgress(progress) {       // JS 语法
        // progress 是 0-100 的数字
        console.log('progress', progress)
      },

      // 单个文件上传成功之后
      onSuccess(file, res) {          // JS 语法
        console.log(`${file.name} 上传成功`, res)
      },

      // 单个文件上传失败
      onFailed(file, res) {           // JS 语法
        console.log(`${file.name} 上传失败`, res)
      },

      // 上传错误，或者触发 timeout 超时
      onError(file, err, res) {               // JS 语法
        console.log(`${file.name} 上传出错`, err, res)
      }
    }
  }
}

// 编辑器回调函数
const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}
const handleChange = (editor) => {
  //console.log("change:", editor.children);
}
const handleDestroyed = (editor) => {
  //console.log('destroyed', editor)
}
const handleFocus = (editor) => {
  //console.log('focus', editor)
}
const handleBlur = (editor) => {
  //console.log('blur', editor)
}
const customAlert = (info, type) => {
  //alert(`【自定义提示】${type} - ${info}`)
}
const customPaste = (editor, event, callback) => {
  //console.log('ClipboardEvent 粘贴事件对象', event)
  // 自定义插入内容// 禁止粘贴
  // editor.insertText('xxx')
  // 返回值（注意，vue 事件的返回值，不能用 return）
  callback(true) // 返回 false ，阻止默认粘贴行为
  // callback(true) // 返回 true ，继续默认的粘贴行为
}

// 及时销毁编辑器
onBeforeUnmount(() => {
  console.log('destroy')
  const editor = editorRef.value
  if (editor == null) return
  // 销毁，并移除 editor
  editor.destroy()
})

const toolbarConfig = {
  /* 工具栏配置 */
  excludeKeys: [
    'group-video',
    'fullScreen',
    'insertImage'
  ]
}

//  获取当前的html信息   这里获取的资源可上传
const getContent = () => {
  const editor = editorRef.value
  if (editor == null) return
  return {
    html: editor.getHtml(),
    text: editor.getText()
  }
}
//=========================================文档编辑器END============================================

//=========================================收藏笔记BEGIN============================================
const toCollection = () => {
  note.value.isCollection = note.value.isCollection === 0 ? 1 : 0;
  loadingBar.start()
  const obj = {
    noteId: note.value.id,
    isCollection: note.value.isCollection
  }
  NoteApi.updateNoteCollection(obj).then(res => {
    if (res.data.code === 60018 || res.data.code === 60019) {
      message.success(res.data.message)
      loadingBar.finish()
    } else {
      loadingBar.error()
    }
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
}

//=========================================收藏笔记END============================================

//=========================================分享笔记END============================================
import {useNotification} from 'naive-ui'//通知框
const notification = useNotification()

const shareFormRef = ref();
const shareFormValue = ref({
  shareTitle: '',
  shareTags: [],
  shareTime: '',
  isNeedPass: false,
  sharePass: '',
  shareRemark: '',
})
const shareFromRules = {
  shareTitle: {
    required: true,
    message: '请输入笔记标题'
  },
  shareTags: {
    required: true,
    message: '请添加标签'
  },
  shareTime: {
    required: true,
    message: '请选择分享日期',
  }
}
const shareOptions = [
  {
    label: "7天",
    value: "7"
  },
  {
    label: "30天",
    value: "30"
  },
  {
    label: "1年",
    value: "365"
  },
  {
    label: '永久',
    value: '-1'
  }
]
const saveShareMessage = () => {
  shareFormRef.value?.validate((errors) => {
    if (!errors) {
      loadingBar.start();
      const obj = {
        noteId: props.noteId,
        noteShareTime: shareFormValue.value.shareTime,
        noteShareTitle: shareFormValue.value.shareTitle,
        noteShareTags: shareFormValue.value.shareTags.toString(),
        noteShareRemark: shareFormValue.value.shareRemark,
        isNeedPassword: shareFormValue.value.isNeedPass === true ? 1 : 0,
        noteSharePassword: shareFormValue.value.sharePass
      }
      NoteApi.addNoteShare(obj).then(res => {
        if (res.data.code === 60020 || res.data.code === 60021) {
          notification.info({
            title: res.data.message,
            content:res.data.data,
          })
          cancelShareModal()
        } else {
          //分享失败
          loadingBar.error()
        }
        loadingBar.finish()
      }).catch(err => {
        console.log(err)
        loadingBar.error()
      })
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
}
const showShareModal = ref(false)
const toShowShareModal = () => {
  loadingBar.start()
  NoteApi.getNoteIsShare(note.value.id).then(res => {
    if (res.data.code === 60029){
      updateNoteContentMethod(props.noteId, getContent());
      notification.info({
        title: res.data.message,
        content:res.data.data,
      })
      loadingBar.error()
    }else if (res.data.code === 60028){
      showShareModal.value = true;
      updateNoteContentMethod(props.noteId, getContent());
      loadingBar.error()
    }else{
      console.log(res)
      loadingBar.error()
    }
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
}
const cancelShareModal = () => {
  showShareModal.value = false  //关闭
  //重置
  shareFormValue.value.shareTitle = note.value.noteTitle
  shareFormValue.value.shareTags = note.value.noteTags === null ? [] : note.value.noteTags.split(',')
  shareFormValue.value.shareTime = ''
  shareFormValue.value.isNeedPass = false
  shareFormValue.value.sharePass = ''
  shareFormValue.value.shareRemark = ''
}
//=========================================分享笔记END============================================

</script>
<template>
  <!--上部显示框-->
  <n-space vertical>
    <n-card :bordered="false" size="small">
      <n-space justify="space-between" align="center">
        <!--发布时间-->
        <n-space align="center" :wrap-item="false">
          <n-icon :component="FiberManualRecordRound" color="#18a058"/>
          <n-text depth="3">保存并发布于：{{ note.updateTime }}</n-text>
        </n-space>
        <n-space align="center" :wrap-item="false" :size="8">
          <!--收藏-->
          <n-popover trigger="hover">
            <template #trigger>
              <n-button text circle @click="toCollection">
                <n-icon size="25" v-if="note.isCollection === 0" :component="StarBorderRound"/>
                <n-icon size="25" v-else :component="StarRound" color="red"/>
              </n-button>
            </template>
            <n-text v-if="note.isCollection === 0">收藏</n-text>
            <n-text v-else>取消收藏</n-text>
          </n-popover>
          <n-popover trigger="hover">
            <template #trigger>
              <n-button @click="toShowShareModal" text>
                <n-icon :component="ShareAltOutlined" :size="22"/>
              </n-button>
            </template>
            分享
          </n-popover>
          <!--更多-->
          <n-popover trigger="hover">
            <template #trigger>
              <n-button text circle>
                <n-icon size="20" :component="MoreHorizRound"/>
              </n-button>
            </template>
            更多
          </n-popover>
        </n-space>
      </n-space>
    </n-card>
    <n-card :bordered="false" size="small">
      <div style="border: 1px solid #ccc" v-if="showEditor">
        <!-- 工具栏 -->
        <Toolbar
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            style="border-bottom: 1px solid #ccc"
        />
        <!-- 编辑器 -->
        <Editor id="editor-container"
                v-model="valueHtml"
                :defaultConfig="editorConfig"
                @onChange="handleChange"
                @onCreated="handleCreated"
                @onDestroyed="handleDestroyed"
                @onFocus="handleFocus"
                @onBlur="handleBlur"
                @customAlert="customAlert"
                @customPaste="customPaste"
                style="height: 500px"
        />
      </div>
    </n-card>
  </n-space>
  <!--验证笔记密码模态框-->
  <verify-note-lock-password
      @cancel="cancelShowVerify"
      @confirm="getVerifyNotePassword"
      @thoroughConfirm="getThoroughNotePassword"
      :show="showVerify">
  </verify-note-lock-password>
  <!--分享笔记框-->
  <n-modal :show="showShareModal" transform-origin="center">
    <n-card style="width: 460px;text-align: center">
      <!--底部区域-->
      <template #default>
        <n-form ref="shareFormRef" :model="shareFormValue" :rules="shareFromRules">
          <n-gradient-text type="info" style="font-size: 20px;margin-bottom: 5px">
            笔记标题
          </n-gradient-text>
          <n-form-item :show-label="false" :show-feedback="false" path="shareTitle">
            <!--小记标题-->
            <n-input v-model:value="shareFormValue.shareTitle" size="large"
                     style="width: 100%;background-color: transparent;margin-bottom: 15px"
                     placeholder="请输入笔记标题"></n-input>
          </n-form-item>
          <div>
            <n-space align="center">
              <!--标签容器-->
              <n-space align="center">
                <n-form-item :show-label="false" :show-feedback="false" path="shareTags">
                  <n-gradient-text type="warning" style="font-size: 16px;margin-right: 10px">
                    标签:
                  </n-gradient-text>
                  <!--标签选择-->
                  <n-dynamic-tags :max="5" v-model:value="shareFormValue.shareTags"></n-dynamic-tags>
                </n-form-item>
              </n-space>
            </n-space>
            <!--分割线-->
            <n-divider/>
            <!--代办事项-->
            <n-form-item :show-label="false" :show-feedback="false" path="shareTime">
              <n-text>分享天数：</n-text>
              <n-select style="width: 330px" v-model:value="shareFormValue.shareTime" placeholder="请选择分享天数"
                        :options="shareOptions"/>
            </n-form-item>
            <!--分割线-->
            <n-divider/>
            <!--小记备注-->
            <n-space vertical>
              <n-gradient-text type="warning" style="font-size: 18px;display: block">
                笔记备注
              </n-gradient-text>
              <n-input
                  type="textarea"
                  placeholder="请输入笔记备注信息"
                  style="width: 100%"
                  v-model:value="shareFormValue.shareRemark"
              />
            </n-space>
            <!--分割线-->
            <n-divider/>
            <n-space style="margin-top: 10px;margin-bottom: 10px" center>
              <!--时间限制容器-->
              <n-gradient-text type="warning" style="font-size: 16px;">
                是否为这个笔记添加访问密码？
              </n-gradient-text>
              <n-switch :round="false" v-model:value="shareFormValue.isNeedPass"></n-switch>
            </n-space>
            <n-space vertical v-if="shareFormValue.isNeedPass">
              <n-text :depth="3" type="warning">注意：密码不要随意泄露哦！</n-text>
              <n-input v-model:value="shareFormValue.sharePass" placeholder="请输入访问密码"></n-input>
              <!-- 起始时间 -->
            </n-space>
          </div>
        </n-form>
      </template>
      <template #action>
        <n-grid cols="2" :x-gap="12">
          <n-gi>
            <n-button block ghost type="primary" @click="saveShareMessage">保存</n-button>
          </n-gi>
          <n-gi>
            <n-button block tertiary @click="cancelShareModal">取消</n-button>
          </n-gi>
        </n-grid>
      </template>
    </n-card>
  </n-modal>
</template>