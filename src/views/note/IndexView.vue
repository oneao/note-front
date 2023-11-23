<script setup>
import NoteCard from '@/components/note/NoteCard.vue'
import {h, ref, onMounted, computed, inject, onBeforeUnmount} from 'vue'
import {
  NoteAddRound,
  SubtitlesOffOutlined,
  DriveFileRenameOutlineOutlined,
  DeleteOutlineRound,
  ArrowCircleUpRound,
  ArrowCircleDownFilled,
  DeleteOutlined
} from '@vicons/material'
import {FileImageOutlined} from '@vicons/antd'
import NoteApi from '@/api/note'
import {NSpace, NText, useMessage} from 'naive-ui' //消息
const message = useMessage()
import {useLoadingBar} from 'naive-ui'//加载条
const loadingBar = useLoadingBar()
//=========================================图标相关BEGIN============================================
import {NIcon} from "naive-ui";

const renderIcon = (icon) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    });
  };
};
//=========================================图标相关END============================================

//=========================================笔记列表BEGIN============================================
onMounted(() => {
  getNoteInfo(true, true);
})//进入页面获取笔记列表
const noteList = ref([])//笔记列表数组
const getNoteInfo = (ed, ha) => {
  enterDelay = ed//显示小记卡片是否需要延迟动画
  hiddenAnimation = ha//隐藏小记卡片是否需要动画
  loadingBar.start();
  NoteApi.getNoteInfo().then(res => {
    if (res.data.code === 200) {
      //请求成功
      noteList.value = res.data.data
      loadingBar.finish()
      loading.value = false //取消加载状态
    }
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
}//获取登录用户的笔记
const loading = ref(true)//是否加载骨架屏
//=========================================笔记列表END============================================

//=========================================动画显示BEGIN============================================
import gsap from "gsap";

let enterDelay = true//显示小记卡片是否需要延迟动画
let hiddenAnimation = true//隐藏小记卡片是否需要动画
const beforeEnter = (el) => {
  gsap.set(el, {
    x: 30,
    opacity: 0
  })
}
const enterEvent = (el, done) => {
  gsap.to(el, {
    x: 0,
    opacity: 1,
    duration: 0.5,
    delay: () => (enterDelay ? el.dataset.index * 0.12 : 0),
    onComplete: done
  })
}
const beforeLeave = (el) => {
  if (hiddenAnimation) {
    const left = el.offsetLeft
    const top = el.offsetTop
    gsap.set(el, {
      position: 'absolute',
      boxShadow: '0 0 5px black',
      width: 'calc(100%-24px)',
      zIndex: 1,
      top,
      left,
      backdropFilter: 'blur(5px)'
    })
  }
}
const leaveEvent = (el, done) => {
  if (hiddenAnimation) {
    gsap.to(el, {
      scale: 0,
      duration: 0.5,
      onComplete: false
    })
  } else {
    gsap.to(el, {
      duration: 0,
      onComplete: done
    })
  }
}
//=========================================动画显示END============================================

//=========================================右键下拉菜单BEGIN============================================
const contextMenu = ref({
  noteId: null,//笔记的id
  noteTitle: '',//笔记的标题
  isTop: false,//是否置顶
  isNewBuild: 0,//是否新建
  noteBackgroundImage: '',
  isLock: false,
  x: 0,
  y: 0,
  show: false, //是否显示右键菜单
  options: computed(() => {
    return [
      {
        label: "编辑笔记信息",
        key: "editNoteMessage",
        icon: renderIcon(DriveFileRenameOutlineOutlined)
      },
      {
        label: "删除笔记",
        key: "deleteNote",
        icon: renderIcon(DeleteOutlineRound)
      },
      {
        label: "置顶",
        key: "top",
        icon: renderIcon(ArrowCircleUpRound),
        show: !contextMenu.value.isTop
      },
      {
        label: "取消置顶",
        key: "cancelTop",
        icon: renderIcon(ArrowCircleDownFilled),
        show: contextMenu.value.isTop
      },
    ]
  })
})//右键菜单对象
const showContextMenu = (e, noteId, isTop, noteTitle, isNewBuild, noteBody, noteTags, noteBackgroundImage, isLock) => {
  e.preventDefault();
  contextMenu.value.show = false;
  nextTick().then(() => {
    contextMenu.value.show = true;//是否显示
    contextMenu.value.noteId = noteId;//笔记id
    contextMenu.value.isTop = isTop;//是否置顶
    contextMenu.value.isNewBuild = isNewBuild;//是否新建
    contextMenu.value.noteTitle = noteTitle;//笔记标题
    contextMenu.value.noteBackgroundImage = noteBackgroundImage;//背景图片
    contextMenu.value.isLock = isLock
    //为编辑笔记信息表单赋值
    editNoteMessageForm.value.noteTitle = contextMenu.value.noteTitle
    editNoteMessageForm.value.noteBody = noteBody
    editNoteMessageForm.value.noteTags = noteTags === null || noteTags === '' ? [] : noteTags.split(',')
    contextMenu.value.x = e.clientX;
    contextMenu.value.y = e.clientY;
  });
}//显示右键菜单
const clickContextMenuOutside = () => {
  contextMenu.value.show = false
}
const handleSelect = (key) => {
  contextMenu.value.show = false
  if (key === 'top' || key === 'cancelTop') {
    updateNoteTopStatus();
  } else if (key === 'deleteNote') {
    if (contextMenu.value.isLock) {
      showVerify.value = true
      watch(() => rememberVerifyNoteCode.value, newData => {
        if (newData) {
          deleteDialogShow.value = true;
          rememberVerifyNoteCode.value = false
        }
      })
    } else {
      deleteDialogShow.value = true;
    }
  } else if (key === 'editNoteMessage') {
    if (contextMenu.value.isLock) {
      showVerify.value = true
      watch(() => rememberVerifyNoteCode.value, newData => {
        if (newData) {
          editNoteMessageModal.value = true
          rememberVerifyNoteCode.value = false
        }
      })
    } else {
      editNoteMessageModal.value = true
    }
  }
}
//=========================================右键下拉菜单END============================================

//=========================================修改笔记的置顶状态BEGIN============================================
const updateNoteTopStatus = () => {
  loadingBar.start()
  //修改置顶状态
  const obj = {
    noteId: contextMenu.value.noteId,
    status: contextMenu.value.isTop ? 1 : 0
  }
  NoteApi.changeNoteTopStatus(obj).then(res => {
    console.log(res)
    if (res.data.code === 60010) {
      loadingBar.finish()
      getNoteInfo(false, false)//重新获取列表
    }
  }).catch(err => {
    loadingBar.error()
    console.log(err)
  })
} //api方法
//=========================================修改笔记的置顶状态END============================================

//=========================================删除笔记BEGIN============================================
import DelDialog from "@/components/message/DelDialog.vue";

const deleteDialogShow = ref(false);//是否显示删除提醒框
const deleteNoteLogic = (delStatus, isNewBuild) => {
  loadingBar.start()
  deleteDialogShow.value = false;//关闭删除提醒框
  const obj = {
    noteId: contextMenu.value.noteId,
    deleteType: delStatus,
    isNewBuild: isNewBuild
  }
  NoteApi.deleteNote(obj).then(res => {
    if (res.data.code === 60011) {
      message.success(res.data.message)
      getNoteInfo(false, true)
      router.push('/note')
    } else {
      message.error(res.data.message)
    }
    loadingBar.finish()
  }).catch(err => {
    loadingBar.error()
    console.log(err)
  })
}//逻辑删除api方法
//=========================================删除笔记END============================================

//=========================================新增笔记BEGIN============================================
import bus from 'vue3-eventbus'

bus.on('createNewNote', () => {
  addNote()
})
onBeforeUnmount(() => {
  bus.off('createNewNote')
})
let defaultTitle = '暂未设置标题'
const addNote = () => {
  loadingBar.start()
  NoteApi.addNote().then(res => {
    if (res.data.code === 60013) {
      //新增成功
      message.success(res.data.message)
      getNoteInfo(false, false)//获取笔记列表
      goToEditNote(res.data.data, false)//跳转到编辑页
      loadingBar.finish();
    } else {
      message.success(res.data.message)
      loadingBar.error()
    }
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
}
//=========================================新增笔记END============================================

//=========================================跳转编辑页面BEGIN============================================
import {useRouter} from "vue-router";

const router = useRouter();
const noteIdValue = ref('') //记录当前笔记的noteId
const goToEditNote = (noteId, isLock) => {
  noteIdValue.value = noteId
  if (isLock && noteId) {
    showVerify.value = true
  } else if (noteId) {
    router.push('/note/edit/' + noteId)
  }
}
//=========================================跳转编辑页面END============================================

//=========================================显示解锁笔记密码框BEGIN============================================
import md5 from 'js-md5'
import VerifyNoteLockPassword from "@/components/message/VerifyNoteLockPassword.vue";

const rememberVerifyNoteCode = ref(false) //有锁的时候删除需要进行校验
const showVerify = ref(false) //是否显示
const cancelShowVerify = () => {
  showVerify.value = false
}//取消显示
const clickLockShowModal = (e) => {
  showVerify.value = e
}//点击图标显示
const getVerifyNotePassword = (lockPassword) => {
  loadingBar.start()
  const obj = {
    noteId: noteIdValue.value === null || noteIdValue.value === '' ? contextMenu.value.noteId : noteIdValue.value,
    lockPassword: md5(lockPassword)
  }
  console.log(obj)
  NoteApi.verifyNoteLockPassword(obj).then(res => {
    if (res.data.code === 60008) {
      loadingBar.finish()
      cancelShowVerify() //关闭并清空输入的值
      rememberVerifyNoteCode.value = true //标记
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
    noteId: noteIdValue.value,
    lockPassword: md5(lockPassword)
  }
  console.log(obj)
  NoteApi.completelyLiftedNoteLockPassword(obj).then(res => {
    if (res.data.code === 60015) {
      loadingBar.finish()
      cancelShowVerify() //关闭并清空输入的值
      message.success(res.data.message)
      getNoteInfo(false, false)
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
//=========================================显示解锁笔记密码框END============================================

//=========================================显示加锁笔记密码框BEGIN============================================
import AddNoteLockPassword from "@/components/message/AddNoteLockPassword.vue";
import {disabledBtn} from "@/utils/disabledBtn";

const showAddNoteLockModal = ref(false)
const cancelShowAddNoteLocalModal = () => {
  showAddNoteLockModal.value = false
}
const clickAddLockShowModal = (e) => {
  showAddNoteLockModal.value = e
}//点击图标显示
const getAddNoteLockPassword = (notePassword) => {
  loadingBar.start()
  const obj = {
    noteId: noteIdValue.value,
    lockPassword: md5(notePassword)
  }
  NoteApi.addNoteLockPassword(obj).then(res => {
    if (res.data.code === 60014) {
      showAddNoteLockModal.value = false
      loadingBar.finish()
      message.success(res.data.message)
      getNoteInfo(false, false)
    } else {
      loadingBar.error()
    }
  }).catch(err => {
    loadingBar.error()
    console.log(err)
  })
}//给笔记添加密码API
//=========================================显示加锁笔记密码框END============================================
router.beforeEach((to, from, next) => {
  if (from.fullPath && from.fullPath.startsWith('/note/edit')) {
    getNoteInfo(false, true)
  }
  next();
});
//=========================================笔记信息编辑框BEGIN============================================
let userInfo = window.localStorage.getItem('user')
const userId = JSON.parse(userInfo).id;
const token = JSON.parse(userInfo).token;
const handleFinish = ({
                        file,
                        event
                      }) => {
  console.log(event);
  message.success((event?.target).response.data);
  contextMenu.value.noteBackgroundImage = JSON.parse((event?.target).response).data.url
  //const ext = file.name.split(".")[1];
  //file.name = `更名.${ext}`;
  //file.url = "__HTTPS__://www.mocky.io/v2/5e4bafc63100007100d8b70f";
  return file;
};//图片上传成功的回调函数
import {useNotification} from 'naive-ui'//通知
const notification = useNotification()
const editNoteMessageModal = ref(false)
const editNoteMessageRef = ref(null)
const editNoteMessageForm = ref({
  noteTitle: '',
  noteBody: '',
  noteTags: [],
})
const editNoteMessageRules = {
  noteTitle: {
    required: true,
    message: "请输入标题",
  },
  noteBody: {
    required: true,
    message: "请输入笔记主题",
  },
  noteTags: {
    required: true,
    message: "请选择笔记标签",
  }
}
const saveEditNoteMessage = () => {
  editNoteMessageRef.value?.validate((errors) => {
    if (!errors) {
      const obj = {
        noteId: contextMenu.value.noteId,
        noteTitle: editNoteMessageForm.value.noteTitle,
        noteBody: editNoteMessageForm.value.noteBody,
        noteTags: editNoteMessageForm.value.noteTags.toString(),
        noteBackgroundImage: contextMenu.value.noteBackgroundImage
      }
      NoteApi.updateNoteMessage(obj).then(res => {
        if (res.data.code === 60017) {
          //更新成功
          editNoteMessageModal.value = false //关闭
          message.success(res.data.message)
          getNoteInfo(true, true)
          router.push('/note/edit/' + contextMenu.value.noteId)
        }
      }).catch(err => {
        console.log(err)
      })
      //loadingBar.start();
    } else {
      const errorsMessage = [].concat(...errors)
      // 显示错误的通知
      notification.error({
        title: '编辑笔记保存提醒',
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
const cancelEditNoteMessage = () => {
  editNoteMessageModal.value = false
}
//=========================================笔记信息编辑框END============================================
const getData = () => {
  setTimeout(() => {
    getNoteInfo(true, true)
  }, 100)
}
const routerPath = inject('routerPath')
//获取编辑笔记id
const editNoteId = computed(() => {
  const index = routerPath.value.indexOf('/note/edit/')
  if (index === -1) return null;
  return parseInt(routerPath.value.substring('/note/edit/'.length))
})
const delBackgroundImage = () => {
  contextMenu.value.noteBackgroundImage = ''
}
</script>

<template>
  <!--笔记容器-->
  <n-layout has-sider>
    <!--笔记列表容器-->
    <n-layout-sider
        bordered
        show-trigger
        :width="320"
        class="note-list"
        :collapsed-width="0"
    >
      <!--滚动条-->
      <n-scrollbar @scroll="contextMenu.show = false">
        <!--标题区域:包括笔记列表标题和新增笔记按钮 -->
        <n-card :bordered="false" style="position: sticky;top: 0;z-index: 1;width: calc(100% - 1px)">
          <template #action>
            <n-space align="center" justify="space-between">
              <h3 style="margin: 0">笔记列表</h3>
              <n-button circle type="primary" @click="addNote">
                <n-icon :size="24" :component="NoteAddRound"></n-icon>
              </n-button>
            </n-space>
          </template>
        </n-card>
        <!--笔记骨架屏-->
        <n-space v-if="loading" vertical style="margin: 12px;">
          <n-card size="small" v-for="n in 3" style="height: 180px;" :key="n">
            <n-space vertical>
              <n-skeleton :height="26" :width="120"/>
              <n-skeleton :height="23" :width="260"/>
              <n-skeleton text :width="180" style="margin-top: 10px;margin-bottom: 10px"/>
              <n-skeleton :height="16" :width="160"/>
            </n-space>
          </n-card>
        </n-space>
        <!--笔记列表区域-->
        <n-list hoverable clickable style="margin: 12px">
          <TransitionGroup @before-enter="beforeEnter" @enter="enterEvent" @before-leave="beforeLeave"
                           @leave="leaveEvent"
                           move-class="move-transition">
            <template v-if="!loading && noteList.length > 0">
              <n-list-item v-for="(note,index) in noteList" :key="note.id"
                           :data-index="index"
                           :style="{ backgroundImage: `url(${note.noteBackgroundImage})`,backgroundSize: '100% 100%'}"
                           @contextmenu="showContextMenu($event,note.id,!!note.isTop,note.noteTitle,note.isNewBuild,note.noteBody,note.noteTags,note.noteBackgroundImage,!!note.isLock)"
                           :class="{'contexting':(contextMenu.noteId === note.id && contextMenu.show) || editNoteId === note.id}"
                           @click="goToEditNote(note.id,!!note.isLock)"
                           class="list-class"
              >
                <NoteCard :note-id=note.id :note-title="note.noteTitle ? note.noteTitle : defaultTitle"
                          :note-body="note.noteBody"
                          :note-time="note.updateTime" :is-top="!!note.isTop" :is-lock="!!note.isLock"
                          :note-tags="note.noteTags"
                          @click-lock="clickLockShowModal"
                          @click-add-lock="clickAddLockShowModal"
                ></NoteCard>
              </n-list-item>
            </template>
          </TransitionGroup>
        </n-list>
        <!--没有笔记的时候-->
        <n-empty v-if="!loading && noteList.length === 0"
                 style="width: max-content; position: absolute;top:50%;left: 50%;transform: translate(-88px,-65.8px)"
                 size="huge" description="暂无笔记列表,快创建笔记吧!">
          <template #icon>
            <n-icon :component="SubtitlesOffOutlined"/>
          </template>
          <template #extra>
            <n-button dashed @click="addNote">创建笔记</n-button>
          </template>
        </n-empty>
      </n-scrollbar>
    </n-layout-sider>
    <!--笔记编辑容器-->
    <n-layout-content embedded content-style="padding:20px">
      <!--该处为子路由-->
      <router-view @reloadLeftToolbar="getData"/>
    </n-layout-content>
  </n-layout>
  <!--右键下拉菜单-->
  <n-dropdown
      placement="bottom-start"
      trigger="manual"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :options="contextMenu.options"
      :show="contextMenu.show"
      :on-clickoutside="clickContextMenuOutside"
      @select="handleSelect"
  />
  <!--删除提醒框 delete-complete-btn是否显示彻底删除提醒框-->
  <DelDialog :title="contextMenu.noteTitle ? contextMenu.noteTitle : '显示失效，请联系管理员'"
             :show="deleteDialogShow"
             :is-new-build="contextMenu.isNewBuild"
             @delete="deleteNoteLogic"
             @cancel="deleteDialogShow = false"
             :delete-complete-btn="false"/>
  <!--验证笔记密码模态框-->
  <verify-note-lock-password
      @cancel="cancelShowVerify"
      @confirm="getVerifyNotePassword"
      @thoroughConfirm="getThoroughNotePassword"
      :show="showVerify">
  </verify-note-lock-password>
  <!--添加笔记密码模态框-->
  <add-note-lock-password
      :show="showAddNoteLockModal"
      @cancel="cancelShowAddNoteLocalModal"
      @confirm="getAddNoteLockPassword"></add-note-lock-password>
  <!--编辑笔记信息-->
  <n-modal :show="editNoteMessageModal" style="width: 400px;height: 580px">
    <n-card>
      <n-space vertical>
        <n-form
            :label-width="80"
            ref="editNoteMessageRef"
            :model="editNoteMessageForm"
            :rules="editNoteMessageRules"
        >
          <n-form-item label="标题" path="noteTitle">
            <n-input v-model:value="editNoteMessageForm.noteTitle" placeholder="输入标题"/>
          </n-form-item>
          <n-form-item label="主体" path="noteBody">
            <n-input v-model:value="editNoteMessageForm.noteBody" type="textarea" placeholder="输入主体"/>
          </n-form-item>
          <n-form-item label="标签" path="noteTags">
            <n-dynamic-tags v-model:value="editNoteMessageForm.noteTags"/>
          </n-form-item>
        </n-form>
        <n-space vertical>
          <n-space justify="space-between">
            <n-text>背景图片</n-text>
            <n-popover trigger="hover">
              <template #trigger>
                <n-button @click="delBackgroundImage" type="info" text>
                  <n-icon :component="DeleteOutlined" :size="22"/>
                </n-button>
              </template>
              删除背景图片
            </n-popover>
          </n-space>
          <n-upload action="/note-serve/image/upload"
                    :headers="{'Authorization': 'Bearer ' + token,'id': userId}"
                    accept="image/*"
                    @finish="handleFinish"
                    :show-file-list="false"
                    :max="5"
          >
            <n-avatar
                v-if="contextMenu.noteBackgroundImage !== null && contextMenu.noteBackgroundImage !== ''"
                size="large"
                style="width: 160px;height: 150px;cursor: pointer"
                :src="contextMenu.noteBackgroundImage"
            />
            <n-button v-else text>
              <n-icon :component="FileImageOutlined" :size="150"></n-icon>
            </n-button>
          </n-upload>
        </n-space>
        <n-grid cols="2" :x-gap="12" style="margin-top: 5px">
          <n-gi>
            <n-button @click="saveEditNoteMessage" block ghost type="primary">保存</n-button>
          </n-gi>
          <n-gi>
            <n-button block tertiary @click="cancelEditNoteMessage">取消</n-button>
          </n-gi>
        </n-grid>
      </n-space>
    </n-card>
  </n-modal>
</template>
<style>
.n-layout-sider.n-layout-sider--collapsed.note-list .n-layout-toggle-button {
  right: -30px;
}

.n-layout-sider.note-list .n-layout-toggle-button {
  transition: right 1s;
}

.n-list .n-list-item.move-transition {
  transition: all 0.5s;
}

.n-list .n-list-item.contexting {
  box-shadow: 0 0 4px #18A056;
}

.n-list .n-list-item.selectItem {
}

.list-class {
  margin-bottom: 5px;
}
</style>