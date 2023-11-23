<script setup>
import {computed, onMounted, watch} from "vue";
import {storeToRefs} from "pinia";

//引入图片
import {
  DeleteForeverSharp,
  ArrowCircleUpOutlined,
  ArrowCircleDownOutlined,
  EditFilled,
  SubtitlesOffOutlined,
} from '@vicons/material'
//引入消息组件
import {useMessage} from 'naive-ui'

const message = useMessage()
//引入加载条组件
import {useLoadingBar} from 'naive-ui'

const loadingBar = useLoadingBar()
//引入主题store
import {useThemeStore} from '@/stores/themeStore'

const themeStore = useThemeStore();
const {isDarkTheme} = storeToRefs(themeStore);
//小记图片的背景颜色
const thingFinishShadowColor = computed(() => {
  return isDarkTheme.value ? 'border-radius: 10px;border-color: lightblue;box-shadow: 0 2px 4px rgba(0,255,255, 0.5)'
      : 'border-radius: 10px;border-color: lightblue;border:1px solid lightcoral;box-shadow: 0 2px 4px rgba(0,255,255, 0.5);'
})
//引入用户信息store
import {useUserStore} from "@/stores/userStore";
const userStore = useUserStore();
const {id: userId,token} = storeToRefs(userStore);
watch(() => token.value,newData => {
  //window.location.reload();//强制刷新页面
  loading.value = true;
  getSmallNoteList(true,false);
})
//引入禁用
import {disabledBtn} from "@/utils/disabledBtn";
//引入小记Api
import SmallNoteApi from '@/api/smallNote'
//进入页面加载
onMounted(() => {
  getSmallNoteList(true,false);
})
//小记列表对象
const smallNoteList = ref([]);
//当前页
const queryObj = ref({
  userId: userId.value,
  page: 1,//当前页
  pageSize: 8,//显示记录数,
  filterValue:null,//过滤条件
  searchValue:null//查询条件
})
const pageChange = (nowPage) => {
  queryObj.value.page = nowPage;
  getSmallNoteList(true, queryObj);
}
//总页数
const pageTotal = ref();
//显示小记卡片是否需要延迟动画
let enterDelay = true
//隐藏小记卡片是否需要动画
let hiddenAnimation = true
//获取小记列表
const getSmallNoteList = (ed,ha) => {
  enterDelay = ed//显示小记卡片是否需要延迟动画
  hiddenAnimation = ha//隐藏小记卡片是否需要动画
  const pageObj = {
    userId: queryObj.value.userId,
    page: queryObj.value.page,
    pageSize: queryObj.value.pageSize,
    filterValue:queryObj.value.filterValue,
    searchValue:queryObj.value.searchValue
  }
  //获取当前登录用户的小记信息
  SmallNoteApi.getSmallNote(pageObj).then(res => {
    loadingBar.start();
    if (res && res.data.code === 200) {
      console.log(res)
      //查找成功
      smallNoteList.value = res.data.data.record;
      pageTotal.value = res.data.data.total;
      loadingBar.finish();
      if (loading.value) loading.value = false;
    }
  }).catch(err => {
    loadingBar.error();
  })
}
//计算页数
const computedPageCount = computed(() => {
  if (pageTotal.value < queryObj.value.pageSize) {
    return 1;
  } else {
    return ( Math.floor(pageTotal.value / queryObj.value.pageSize)) + 1;
  }
})
//小记是否置顶按钮显示
const isTopIconText = top => {
  if (top) {
    return {
      icon: ArrowCircleDownOutlined,
      text: '取消置顶'
    }
  } else {
    return {
      icon: ArrowCircleUpOutlined,
      text: '置顶'
    }
  }
}
//小记置顶按钮的禁用与否
const smallNoteTopButton = ref(false);
//改变指定小记的置顶状态
const changeTopStatus = (smallNoteId, isTopValue) => {
  //禁用小记置顶按钮
  disabledBtn(smallNoteTopButton,true)
  const changeTop = {
    userId: userId.value,
    smallNoteId: smallNoteId,
    smallNoteTopStatus: isTopValue,
  }
  SmallNoteApi.changeSmallNoteTopStatus(changeTop).then(res => {
    if (res.data.code === 60004) {
      message.success(res.data.message)
      //取消小记置顶按钮
      smallNoteTopButton.value = false;
      getSmallNoteList(false,false);
    } else {
      message.error('服务端错误')
    }
    disabledBtn(smallNoteTopButton,false,true,2)
  }).catch(err => {
    disabledBtn(smallNoteTopButton,false,true,2)
    console.log(err)
  })
}
//定义骨架屏的显示请求
const loading = ref(true)
//显示动画
import gsap from "gsap";

const beforeEnter = (el) => {
  gsap.set(el, {
    y: 30,
    opacity: 0
  })
}
const enterEvent = (el, done) => {
  gsap.to(el, {
    y: 0,
    opacity: 1,
    duration: 0.5,
    delay:()=>(enterDelay ? el.dataset.index * 0.12 : 0),
    onComplete: done
  })
}
//离开前
const beforeLeave = (el) => {
  if(hiddenAnimation){
    const left = el.offsetLeft
    const top = el.offsetTop
    gsap.set(el,{
      position:'absolute',
      boxShadow:'0 0 5px black',
      zIndex:1,
      top,
      left
    })
  }
}
const leaveEvent = (el, done) => {
  if(hiddenAnimation){
    let tl = gsap.timeline()
    tl.to(el,{
      scale:1.3,
      duration:0.25
    }).to(el,{
      scale:0,
      duration:0.25,
      onComplete:done
    })
  }else {
    gsap.to(el, {

      duration: 0,
      onComplete: done
    })
  }
}
//计算css样式
const changePageCss = computed(() => {
  if (smallNoteList.value === null ||smallNoteList.value.length <= 4) {
    return 'top:-10%;left:380px'
  } else if (smallNoteList.value.length > 4 && smallNoteList.value.length <= 8) {
    return 'top:30%;left:380px'
  }
})
const cardBelowCss = computed(() => {
  if (smallNoteList.value === null || smallNoteList.value.length <= 4) {
    return 'height:380px;'
  } else if (smallNoteList.value.length > 4 && smallNoteList.value.length <= 8) {
    return 'height:600px;'
  }
})
const computedIsPromptCss = (item) => {
  if(item.isPrompt){
    return 'height:220px'
  }else {
    return 'height:130px'
  }
}
//引入`删除提示框`
import DelDialog from '@/components/message/DelDialog.vue'
//声明删除提醒框内容
const deleteDialogObj = ref({
  show: false,//是否显示
  smallNoteId: null,//小记id
  title: null//删除的文件名称
})
//声明获取删除的信息
const deleteDialog = (id, title) => {
  deleteDialogObj.value.show = true;
  deleteDialogObj.value.smallNoteId = id;
  deleteDialogObj.value.title = title;
}
//声明删除删除事件
const delSmallNote = (delStatus) => {
  console.log(delStatus)
  deleteDialogObj.value.show = false;//关闭提醒框
  loadingBar.start();
  //逻辑删除
  const delObj = {
    userId: userId.value,
    smallNoteId: deleteDialogObj.value.smallNoteId, //删除的小记id
    deleteType: delStatus//逻辑删除
  }
  SmallNoteApi.deleteSmallNote(delObj).then(res => {
    if (res.data.code === 60005) {
      //删除成功
      message.success(res.data.message)
      //关闭删除提示框
      deleteDialogObj.value.show = false;
      loadingBar.finish();
      //重新显示数据
      getSmallNoteList(false,true);
    } else {
      message.error('删除失败，请联系管理员')
      loadingBar.error();
    }
  }).catch(err => {
    console.log(err)
  })
}
//引入编辑小记组件
import EditSmallNoteModal from '@/components/smallNote/EditSmallNoteModal.vue'
//计算倒计时剩余时间
const countDownTime = (beginTime,endTime) => {
  beginTime = new Date(beginTime);
  endTime = new Date(endTime);
  const nowTime = new Date();
  if(nowTime > beginTime){
    return endTime - nowTime;
  }else{
    return null
  }
}
//声明编辑小记对象
const editSmallNoteModalRef = ref(null)
//过滤选项
const filterOptions = [
  {
    label:'默认',
    value:null
  },
  {
    label: '未完成',
    value: 0
  },
  {
    label: '已完成',
    value: 1
  }
]
//触发过滤方法
const filterMethod = () => {
  //queryObj.value.searchValue = null;
  getSmallNoteList(true)
}

const showSmallNote = () => {

}
</script>

<template>
  <!--小记显示框-->
  <n-layout embedded content-style="padding:24px">
    <!--小记页面头部-->
    <n-card size="small" style="border-radius: 10px;border: 1px solid red;box-shadow: 0 2px 4px skyblue;">
      <!--标题-->
      <template #header>
        <h3>小记列表</h3>
      </template>
      <!--新增按钮-->
      <template #header-extra>
        <n-space>
          <n-select v-model:value="queryObj.filterValue" :options="filterOptions"
                    @update:value="filterMethod"
                    placeholder="默认" style="width:130px"></n-select>
          <!--搜索输入框-->
          <n-input-group>
            <n-input v-model:value="queryObj.searchValue" placeholder="请输入搜索条件"></n-input>
            <n-button @click="getSmallNoteList(true)">搜索</n-button>
          </n-input-group>
          <!--过滤选项-->
          <n-button @click="editSmallNoteModalRef.showEditModal(null)">新增小记</n-button>
        </n-space>
      </template>
    </n-card>
    <!--小记页面底部-->
    <n-card size="small" :bordered="false"
            style="margin-top: 20px;border-radius: 10px;border: 1px solid lightcoral;box-shadow: 0 2px 4px skyblue;"
            :style="cardBelowCss"
    >
      <!--骨架屏-->
      <n-space v-if="loading">
        <n-card :segmented="{'content':'soft'}"
                size="large"
                :style="thingFinishShadowColor"
                style="width: 380px;height: 160px;margin-left: 10px;min-width: 230px;max-width:max-content;margin-top: 10px"
                embedded
                v-for="n in 8">
          <template #header>
            <n-skeleton :width="180"  height="20px"/>
          </template>
          <template #header-extra>
            <n-skeleton :width="20" :height="20" style="margin-left: 6px" circle :repeat="3"></n-skeleton>
          </template>
          <template #default>
            <n-space >
              <n-skeleton :width="30" :height="15"></n-skeleton>
              <n-skeleton :width="30" :height="15"></n-skeleton>
              <n-skeleton :width="30" :height="15"></n-skeleton>
            </n-space>
          </template>
          <template #footer>
            <n-skeleton text :width="160"/>
          </template>
        </n-card>
      </n-space>
      <!--显示数据内容-->
      <n-space :wrap-item="false">
        <TransitionGroup @before-enter="beforeEnter" @enter="enterEvent" @before-leave="beforeLeave" @leave="leaveEvent"
                         move-class="move-transition">
          <!---->
          <template v-if="!loading && smallNoteList !== null">
            <n-card class="thing-cards"
                    v-for="(smallNote,index) in smallNoteList"
                    :key="smallNote.id"
                    :data-index="index"
                    :class="{'thing-card-finished' : smallNote.isFinished}"
                    :segmented="{'content':'soft'}"
                    size="small"
                    embedded
                    :title="smallNote.smallNoteTitle"
                    :style="thingFinishShadowColor,computedIsPromptCss(smallNote)"
                    style="min-width:220px;max-width:305px;margin-top: 15px;margin-left: 25px;background-color: lightsalmon">
              <template #header-extra>
                <!--删除按钮-->
                <n-popover>
                  <template #trigger>
                    <n-button text @click="deleteDialog(smallNote.id,smallNote.smallNoteTitle)" style="margin-left: 10px">
                      <n-icon :size="18" :component="DeleteForeverSharp"/>
                    </n-button>
                  </template>
                  删除
                </n-popover>
                <!--置顶按钮-->
                <n-popover>
                  <template #trigger>
                    <n-button :disabled="smallNoteTopButton" text style="margin-left: 10px">
                      <n-icon :size="18" @click="changeTopStatus(smallNote.id,smallNote.isTop)"
                              :component="isTopIconText(smallNote.isTop).icon"/>
                    </n-button>
                  </template>
                  {{ isTopIconText(smallNote.isTop).text }}
                </n-popover>
                <!--编辑按钮-->
                <n-popover>
                  <template #trigger>
                    <n-button text style="margin-left: 10px" @click="editSmallNoteModalRef.showEditModal(smallNote.id)">
                      <n-icon :size="18" :component="EditFilled"/>
                    </n-button>
                  </template>
                  编辑
                </n-popover>
              </template>
              <template #default>
                <n-space>
                  <n-tag v-if="smallNote.isTop" size="small" :bordered="false" type="success">置顶</n-tag>
                  <n-tag v-for="tag in smallNote.smallNoteTags.split(',')" size="small" :bordered="false">{{ tag }}</n-tag>
                </n-space>
              </template>
              <template #footer>
                <n-space align="center" v-if="smallNote.isPrompt">
                  <!--<n-divider style="background-color: lightblue;margin-left: 2px;margin-right: 2px" v-if="smallNote.isTop" vertical/>-->
                  <n-text depth="3">开始时间 ：{{ smallNote.beginTime }}</n-text>
                  <n-text depth="3">完成时间 ：{{ smallNote.endTime }}</n-text>
                  <br>
                  <n-text depth="3">剩余时间 ：
                    <n-countdown v-if="new Date(smallNote.endTime) > new Date()" :duration="countDownTime(smallNote.beginTime,smallNote.endTime)" :active="true" />
                    <n-gradient-text v-else type="warning">规定时间已经走完了哦!</n-gradient-text>
                  </n-text>
                </n-space>
              </template>
            </n-card>
            <n-card :bordered="false"
                    style="margin-top: 330px;margin-left: 150px;min-width:220px;max-width:max-content;position: absolute;"
                    :style="changePageCss"
            >
              <n-pagination
                  :display-order="['quick-jumper', 'pages', 'size-picker']"
                  :page-count="computedPageCount"
                  show-quick-jumper
                  show-size-picker
                  :page-sizes="[queryObj.pageSize]"
                  :on-update:page="page => {
                  pageChange(page)}"
              />
            </n-card>
          </template>
        </TransitionGroup>
      </n-space>
      <!--无数据的时候显示-->
      <n-empty v-if="!loading && smallNoteList === null " style="margin: 20px auto" size="huge"
               description="暂无小记,请添加小记">
        <template #icon>
          <n-icon :component="SubtitlesOffOutlined"></n-icon>
        </template>
        <template #extra>
          <n-button @click="editSmallNoteModalRef.showEditModal(null)">创建小记</n-button>
        </template>
      </n-empty>
    </n-card>
  </n-layout>
  <!--删除小记提示框-->
  <DelDialog :title="deleteDialogObj.title ? deleteDialogObj.title : '显示失效，请联系管理员'"
             :show="deleteDialogObj.show"
             @delete="delSmallNote"
             @cancel="deleteDialogObj.show = false"
             :delete-complete-btn="false"/>
  <!--编辑小记窗口-->
  <edit-small-note-modal ref="editSmallNoteModalRef" @save="getSmallNoteList(true,queryObj)"/>
</template>

<style scoped>
.move-transition {
  transition: all 0.5s;
}

.n-card.thing-card-finished::after {
  position: absolute;
  content: '';
  width: 100px;
  height: 100px;
  bottom: 50%;
  left: 30px;
  transform: translateY(50px);
  background-image: url("@/assets/finish.png");
  background-size: 100px 100px;
  background-repeat: no-repeat;
  /*只对有像素的部分进行投影*/
  filter: drop-shadow(5px 5px 2px v-bind(thingFinishShadowColor));
}

</style>