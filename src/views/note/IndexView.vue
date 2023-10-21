<script setup>
import NoteCard from '@/components/note/NoteCard.vue'
import {h, ref, onMounted, computed} from 'vue'
import {
  NoteAddRound,
  SubtitlesOffOutlined,
  DriveFileRenameOutlineOutlined,
  DeleteOutlineRound,
  ArrowCircleUpRound,
  ArrowCircleDownFilled
} from '@vicons/material'
import NoteApi from '@/api/note'
import {useMessage} from 'naive-ui' //消息
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
      console.log(res)
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
  isCreateNew: 0,//是否新建
  x: 0,
  y: 0,
  show: false, //是否显示右键菜单
  options: computed(() => {
    return [
      {
        label: "重命名笔记",
        key: "renameNote",
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
const showContextMenu = (e, noteId, isTop, noteTitle, isCreateNew) => {
  e.preventDefault();
  contextMenu.value.show = false;
  nextTick().then(() => {
    contextMenu.value.show = true;
    contextMenu.value.noteId = noteId;
    contextMenu.value.isTop = isTop;
    contextMenu.value.isCreateNew = isCreateNew;
    contextMenu.value.noteTitle = noteTitle ? noteTitle : defaultTitle;
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
    deleteDialogShow.value = true;
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
const deleteNoteLogic = (delStatus, isCreateNew) => {
  loadingBar.start()
  deleteDialogShow.value = false;//关闭删除提醒框
  const obj = {
    noteId: contextMenu.value.noteId,
    deleteType: delStatus,
    isCreateNew: isCreateNew
  }
  NoteApi.deleteNote(obj).then(res => {
    if (res.data.code === 60011) {
      message.success(res.data.message)
      getNoteInfo(false, true)
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
let defaultTitle = '暂未设置标题'
const addNote = () => {
  loadingBar.start()
  NoteApi.addNote().then(res => {
    if (res.data.code === 60013) {
      //新增成功
      message.success(res.data.message)
      goToEditNote(res.data.data)//跳转到编辑页
      getNoteInfo(false, false)//获取笔记列表
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
import VerifyNoteLockPassword from "@/components/message/VerifyNoteLockPassword.vue";

const router = useRouter();
const noteIdValue = ref('') //记录当前笔记的noteId
const goToEditNote = (noteId,isLock) => {
  if (isLock && noteId){
    showVerify.value = true
    noteIdValue.value = noteId
  }else if (noteId){
    router.push('/note/edit/' + noteId)
  }
}
//=========================================跳转编辑页面END============================================

//=========================================显示解锁笔记密码框BEGIN============================================
import md5 from 'js-md5'
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
    noteId:noteIdValue.value,
    lockPassword:md5(lockPassword)
  }
  console.log(obj)
  NoteApi.verifyNoteLockPassword(obj).then(res => {
    if (res.data.code === 60008){
      loadingBar.finish()
      cancelShowVerify() //关闭并清空输入的值
      message.success(res.data.message)
      router.push('/note/edit/' + obj.noteId)
    }else if (res.data.code === 60009){
      message.error(res.data.message)
      loadingBar.error()
    }else{
      console.log('未知响应码')
      loadingBar.error()
    }
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
}
//=========================================显示解锁笔记密码框END============================================
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
      <n-scrollbar>
        <!--标题区域:包括笔记列表标题和新增笔记按钮 -->
        <n-card :bordered="false" style="position: sticky;top: 0;z-index: 1">
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
                           @contextmenu="showContextMenu($event,note.id,!!note.isTop,note.noteTitle,note.isCreateNew)"
                           :class="{'contexting':(contextMenu.noteId === note.id && contextMenu.show)}"
                           @click="goToEditNote(note.id,!!note.isLock)">
                <NoteCard :note-id=note.id :note-title="note.noteTitle ? note.noteTitle : defaultTitle"
                          :note-body="note.noteBody"
                          :note-time="note.updateTime" :is-top="!!note.isTop" :is-lock="!!note.isLock"
                          :note-tags="note.noteTags"
                          @click-lock="clickLockShowModal"
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
            <n-button dashed>创建笔记</n-button>
          </template>
        </n-empty>
      </n-scrollbar>
    </n-layout-sider>
    <!--笔记编辑容器-->
    <n-layout-content>
      <!--该处为子路由-->
      <router-view/>
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
             :is-create-new="contextMenu.isCreateNew"
             @delete="deleteNoteLogic"
             @cancel="deleteDialogShow = false"
             :delete-complete-btn="false"/>
  <!--验证笔记密码模态框-->
  <verify-note-lock-password
      @cancel="cancelShowVerify"
      @confirm="getVerifyNotePassword"
      :show="showVerify">
  </verify-note-lock-password>
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
</style>