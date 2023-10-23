<script setup>
//=========================================公共操作BEGIN============================================
import {onBeforeUnmount, ref, shallowRef, onMounted, shallowReactive} from 'vue';
import {useMessage} from 'naive-ui' //消息
const message = useMessage()
import {useLoadingBar} from 'naive-ui'//加载条
const loadingBar = useLoadingBar()
import {useRouter} from "vue-router";//路由
const router = useRouter();
import {FiberManualRecordRound, StarBorderRound, MoreHorizRound, LockOpenFilled, LockOutlined} from '@vicons/material'//图标
import NoteApi from '@/api/note/index'//引入笔记Api
const props = defineProps({
  noteId: {type: String, required: true}
})//自定义属性
onMounted(() => {
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
      loadingBar.finish()
      setTimeout(() => {
        if (note.value.noteContent !== null && note.value.noteContent !== '') {
          showEditor.value = true
          valueHtml.value = note.value.noteContent
        }
      }, 100)
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
    return;
  }
  console.log('1111')
  const updateObj = {
    noteId: noteId,
    noteBody: obj.text.replace(/\s+/g, ' ').trim().substring(0, 40),
    noteContent: obj.html
  }
  console.log(updateObj)
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
  console.log(obj)
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
          <n-button round>分享</n-button>
          <!--收藏-->
          <n-popover trigger="hover">
            <template #trigger>
              <n-button text circle>
                <n-icon size="25" :component="StarBorderRound"/>
              </n-button>
            </template>
            收藏
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
</template>