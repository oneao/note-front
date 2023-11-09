<script setup>
// 下载表情包资源emoji.zip https://readpage.lanzouy.com/b04duelxg 密码:undraw
// static文件放在public下,引入emoji.ts文件可以移动assets下引入,也可以自定义到指定位置
import emoji from '../../utils/emoji'
import {reactive, onMounted} from 'vue'
import {UToast, usePage} from 'undraw-ui'

import axios from "axios";

const n_sid = ref(0)  //记录当前页面的笔记分享表id
import CommentApi from '@/api/comment'

onMounted(() => {
  if (commentUserName.value !== '' && commentUserEmail.value !== '' && commentUserAvatar.value !== '') {
    config.user.id = commentUserId.value
    config.user.username = commentUserName.value
    config.user.avatar = commentUserAvatar.value
  }
  const urlParams = new URLSearchParams(window.location.search);
  n_sid.value = parseInt(urlParams.get('n_sid'));
  //获取评论信息
  getComments()
  setTimeout(() => {
    config.comments = pageResult.value
  }, 200)
  getCommentUserLikes()
})

//获取用户的点赞信息
const getCommentUserLikes = () => {
  if (commentUserName.value !== '' && commentUserEmail.value !== '' && commentUserAvatar.value !== '' && commentUserId.value !== '') {
    CommentUserApi.getCommentUserLikes(commentUserId.value).then(res => {
      if (res.data.code === 200) {
        if (res.data.data !== null && res.data.data !== '') {
          config.user.likeIds = res.data.data.split(',')
        }
      } else {
        message.error(res.data.message)
      }
    }).catch(err => {
      message.error(err)
    })
  }
}
//调用获取这个分享笔记的评论api
const pageResult = ref([])
const getComments = () => {
  const obj = {
    noteShareId: n_sid.value,//分享笔记id
    pageNum: pageNum.value,//当前页数
    pageSize: pageSize.value,//记录数
    isLatest: latest.value ? 1 : 0 //ture 1 false 0
  }
  CommentApi.getComments(obj).then(res => {
    if (res.data.code === 200) {
      pageResult.value = res.data.data.result
      total.value = res.data.data.total
      if (typeof callback === 'function') {
        callback();
      }
    }
  })
}

const config = reactive({
  user: {
    id: 0,
    username: '',
    avatar: 'http://127.0.0.1:9000/note-bucket/adf77c91-1fe2-4610-971c-c033b9b62242.jpg',
    // 评论id数组 建议:存储方式用户uid和评论id组成关系,根据用户uid来获取对应点赞评论id,然后加入到数组中返回
    likeIds: []
  },
  emoji: emoji,
  comments: [],
})


// 提交评论事件
const submit = async ({content, parentId, files, finish, reply}) => {
  if (commentUserName.value === '' && commentUserEmail.value === '' && commentUserAvatar.value === '') {
    if (nickname.value !== '' && headPic.value !== '' && email.value !== '') {
      commentUserForm.value.commentUserEmail = email.value
      commentUserForm.value.commentUserName = nickname.value
      commentUserForm.value.commentUserAvatar = headPic.value
    }
    showModal.value = true
    //发送添加请求
  } else {
    loadingBar.start()
    let str = '提交评论:' + content + ';\t父id: ' + parentId + ';\t图片:' + files + ';\t被回复评论:'
    //发送请求
    const formData = new FormData();
    const obj = {
      noteShareId: n_sid.value,
      parentId: parentId,
      commentUserId: config.user.id,
      content: content,
    }
    if (files.length > 0) {
      formData.append('file', files[0]); // 添加文件到表单数据
    } else {
      formData.append('file', null)
    }
    const comment = {
      id: '',
      parentId: null,
      uid: 0,
      address: '',
      content: '',
      likes: 0,
      createTime: '',
      contentImg: '',
      user: {},
    }
    formData.append("data", new Blob([JSON.stringify(obj)], {type: "application/json"}));
    await axios.post(`/comment/addComment`, formData, {headers: {'Content-Type': 'multipart/form-data'}})
        .then(res => {
          if (res.data.code === 200) {
            const obj = res.data.data
            //成功
            comment.id = String(obj.id)
            comment.parentId = obj.parentId
            comment.uid = obj.uid
            comment.address = obj.address
            comment.content = obj.content
            comment.likes = obj.likes
            comment.createTime = obj.createTime
            comment.contentImg = obj.contentImg
            comment.user = obj.commentUserVO
          }
          loadingBar.finish()
        }).catch(() => {
          loadingBar.error()
        });
    setTimeout(() => {
      console.log(comment)
      finish(comment)
      UToast({message: '评论成功!', type: 'info'})
    }, 200)
  }
}
// 点赞按钮事件 将评论id返回后端判断是否点赞，然后在处理点赞状态
const waitLikeOverShow = ref(false)
const like = (id, finish) => {
  if (commentUserName.value === '' || commentUserEmail.value === '' || commentUserAvatar.value === '' || commentUserId === '') {
    if (nickname.value !== '' && headPic.value !== '' && email.value !== '') {
      commentUserForm.value.commentUserEmail = email.value;
      commentUserForm.value.commentUserName = nickname.value;
      commentUserForm.value.commentUserAvatar = headPic.value;
    }
    showModal.value = true;
    // 发送添加请求
  } else {
    setTimeout(() => {
      waitLikeOverShow.value = true
      let isLike = 0;
      const index = config.user.likeIds.indexOf(id)
      if (index !== -1) {
        // 如果 id 已经存在于 likeIds 数组中，则移除它
        isLike = 0; // 取消点赞
      } else {
        // 如果 id 不存在于 likeIds 数组中，则添加它
        isLike = 1; // 点赞
      }
      finish()
      loadingBar.start();
      let likeIdString = config.user.likeIds.toString()
      console.log(isLike)
      CommentApi.goToLike(id, isLike)
          .then(res => {
            if (res.data.code !== 200) {
              message.error(res.data.message);
            } else {
              // 更新 likeIds 数组
              if (likeIdString === '' || likeIdString === null) {
                likeIdString = '0'
              }
              CommentUserApi.goToLikes(commentUserId.value, likeIdString)
                  .then(res => {
                    if (res.data.code !== 200) {
                      message.error(res.data.message);
                    } else {
                      loadingBar.finish();
                    }
                  })
                  .catch(err => {
                    message.error(err);
                    loadingBar.error();
                  });
            }
          })
          .catch(err => {
            message.error(err);
            loadingBar.error();
          });
      waitLikeOverShow.value = false
    }, 200)
  }
};

config.comments = []

import {CommentOutlined, FileImageOutlined} from '@vicons/antd'
import {NIcon} from "naive-ui";
import {useMessage, useLoadingBar} from "naive-ui";

const message = useMessage();
const loadingBar = useLoadingBar();

import {storeToRefs} from "pinia";
import {useUserStore} from "@/stores/userStore";

const userStore = useUserStore();
const {nickname, headPic, email} = storeToRefs(userStore)

import {useCommentUserStore} from "@/stores/commentUserStore";

const commentUserStore = useCommentUserStore()
const {setCommentUserInfo} = commentUserStore
const {commentUserEmail, commentUserName, commentUserAvatar, commentUserId} = storeToRefs(commentUserStore)

import CommentUserApi from '@/api/commentUser'
//=========================================评论个人信息设置=================================================
const showModal = ref(false) //显示评论用户信息框

const commentUserForm = ref({
  commentUserEmail: '',
  commentUserName: '',
  commentUserAvatar: '',
}) //评论用户信息
const handleFinish = ({
                        file,
                        event
                      }) => {
  commentUserForm.value.commentUserAvatar = JSON.parse((event?.target).response).data.url
  return file;
};//图片上传成功的回调函数
const isEmail = (email) => {
  // 定义邮箱地址的正则表达式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // 使用正则表达式进行匹配
  return emailRegex.test(email);
}//检查是否是邮箱号
const confirmSaveCommentUser = () => {
  if (commentUserForm.value.commentUserName === '' || commentUserForm.value.commentUserAvatar === '' || commentUserForm.value.commentUserEmail === '') {
    message.warning("用户名和头像还有邮箱号都不能为空哦！")
  } else if (!isEmail(commentUserForm.value.commentUserEmail)) {
    //发送请求
    console.log(commentUserForm.value.commentUserEmail)
    message.warning("邮箱号有误！")
  } else {
    const obj = {
      commentUserEmail: commentUserForm.value.commentUserEmail,
      commentUserName: commentUserForm.value.commentUserName,
      commentUserAvatar: commentUserForm.value.commentUserAvatar
    }
    CommentUserApi.addCommentUser(obj).then(res => {
      if (res.data.code === 200) {
        const commentUserMid = res.data.data
        setCommentUserInfo(commentUserMid.id, commentUserMid.commentUserEmail, commentUserMid.commentUserName, commentUserMid.commentUserAvatar)
        config.user.id = commentUserMid.commentUserId
        config.user.username = commentUserMid.commentUserEmail
        config.user.avatar = commentUserMid.commentUserAvatar
        config.user.likeIds = commentUserMid.commentLikes === null ? [] : commentUserMid.commentLikes.split(',')
        message.success('修改成功')
        cancelSaveCommentUser()
      } else {
        message.error(res.data.message)
      }
    }).catch(err => {
      message.error(err)
    })
  }
}//点击保存按钮
const cancelSaveCommentUser = () => {
  commentUserForm.value.commentUserEmail = ''
  commentUserForm.value.commentUserName = ''
  commentUserForm.value.commentUserAvatar = ''
  showModal.value = false
}//点击取消按钮
//===========================================评论分页============================================
// 是否禁用滚动加载评论
const disable = ref(false)
// 当前页数
const pageNum = ref(1)
// 页大小
const pageSize = ref(2)
// 评论总数量
const total = ref(0)
// 加载更多评论
const more = () => {
  if (pageNum.value <= Math.ceil(total.value / pageSize.value)) {
    setTimeout(() => {
      pageNum.value++
      getComments()
      setTimeout(() => {
        config.comments.push(...pageResult.value)
      }, 100)
    }, 100)
  } else {
    disable.value = true
  }
}

//===========================================评论分页============================================
//排序
const latest = ref(true)
const sorted = (latest) => {
  config.comments = []
  getComments()
  setTimeout(() => {
    config.comments = pageResult.value
  }, 200)
}

//=========================================评论个人信息设置=================================================
</script>

<template>
  <u-comment-scroll :disable="disable" @more="more">
    <u-comment :config="config" @submit="submit" @like="like" upload page>
      <!-- <template>导航栏卡槽</template> -->
      <!-- <template #info>用户信息卡槽</template> -->
      <!-- <template #card>用户信息卡片卡槽</template> -->
      <!-- <template  #opearte>操作栏卡槽</template>-->
      <u-comment-nav v-model="latest" @sorted="sorted"></u-comment-nav>
    </u-comment>
  </u-comment-scroll>
  <n-modal v-model:show="showModal" :mask-closable='false'>
    <n-card style="width: 300px;height: 420px"
            :bordered="false">
      <template #header>设置评论个人信息</template>
      <template #header-extra>
        <n-icon :component="CommentOutlined" :size="22" style="margin-bottom: 5px"></n-icon>
      </template>
      <template #default>
        <n-space vertical>
          <n-text>邮箱</n-text>
          <n-input v-model:value="commentUserForm.commentUserEmail" placeholder="输入邮箱号"></n-input>
          <n-text>昵称</n-text>
          <n-input v-model:value="commentUserForm.commentUserName" placeholder="输入昵称" maxlength="30"
                   show-count></n-input>
          <n-text>头像</n-text>
          <n-upload action="/note-serve/image/uploadCommentUserImage"
                    accept="image/*"
                    @finish="handleFinish"
                    :show-file-list="false"
                    :max="5">
            <n-avatar
                v-if="commentUserForm.commentUserAvatar !== ''"
                size="large"
                style="width: 100px;height: 100px;cursor: pointer"
                :src="commentUserForm.commentUserAvatar"
            />
            <n-button v-else text>
              <n-icon :component="FileImageOutlined" :size="100"></n-icon>
            </n-button>
          </n-upload>
        </n-space>
      </template>
      <template #footer>
        <n-grid cols="2" :x-gap="12">
          <n-gi>
            <n-button @click="confirmSaveCommentUser" block type="success" ghost>
              保存
            </n-button>
          </n-gi>
          <n-gi>
            <n-button @click="cancelSaveCommentUser" block tertiary>
              取消
            </n-button>
          </n-gi>
        </n-grid>
      </template>
    </n-card>
  </n-modal>
  <n-modal v-show="waitLikeOverShow"  :mask-closable="false">
    <n-card
        style="width: 10px"
        title="模态框"
        size="huge"
        :bordered="false"
        role="dialog"
        aria-modal="true"
    >
    </n-card>
  </n-modal>
</template>

