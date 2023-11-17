<script setup>
import {Rocket, RocketOutline, ShareOutline} from '@vicons/ionicons5'
import {LockOutlined, EditNoteTwotone} from '@vicons/material'
import {h, onMounted, defineComponent, ref, nextTick} from "vue";
import {
  NButton,
  NGradientText,
  NTag,
  NText,
  NInput,
  useDialog,
  useLoadingBar,
  useMessage,
  useNotification
} from "naive-ui";

const dialog = useDialog();
const loadingBar = useLoadingBar()
const message = useMessage()
const notification = useNotification()

import NoteApi from '@/api/note'

onMounted(() => {
  getShareNoteAll()
})
const getShareNoteAll = () => {
  loadingBar.start()
  const obj = {
    title: searchObj.value.searchTitle,
    day: searchObj.value.searchDay,
    isExpire: searchObj.value.searchIsExpire,
    page: pagination.value.page,
    pageSize: pagination.value.pageSize
  }
  NoteApi.getShareNoteAll(obj).then(res => {
    if (res.data.code === 200) {
      res.data.data.record.forEach(item => {
        item.tags = (item.tags === null || item.tags === '') ? item.tags : item.tags.split(',')
      })
      shareData.value = res.data.data.record
      total.value = res.data.data.total
      pageCount.value = Math.ceil(total.value / pagination.value.pageSize)
      loadingBar.finish()
    } else {
      message.error(res.data.message)
      loadingBar.error()
    }
  }).catch(err => {
    message.error(err)
    loadingBar.error()
  })
}
const current = computed(() => {
  if (total.value < 5) {
    return 1
  } else if (total.value >= 5 && total.value < 10) {
    return 2
  } else if (total.value >= 10 && total.value < 15) {
    return 3
  } else {
    return 4
  }
})  //steps当前位置
const tableHead = ref([
  {
    type: "selection",
  },
  {
    key: 'serialNumber',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'info'
          },
          {default: () => '序号'}
      )
    }
  },
  {
    key: 'title',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'error'
          },
          {default: () => '标题'}
      )
    },
  },
  {
    key: 'tags',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'warning'
          },
          {default: () => '标签'}
      )
    },
    render(row) {
      if (Array.isArray(row.tags)) {
        return row.tags.map((tagKey) => {
          return h(
              NTag,
              {
                style: {
                  marginRight: '3px',
                  marginTop:'3px'
                },
                type: 'info',
                bordered: false
              },
              {
                default: () => tagKey
              }
          )
        })
      } else {
        // 处理 row.tags 不是数组的情况
        return null; // 或者返回其他默认值
      }
    }
  },
  {
    key: 'shareLink',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'info'
          },
          {default: () => '分享链接'}
      )
    },
    render(row) {
      return h(
          NButton,
          {
            text: true,
            size: "small",
            onClick: () => {
              window.open(row.shareLink)
            }
          },
          {default: () => row.shareLink}
      );
    }
  },
  {
    key: 'likeNumber',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'error'
          },
          {default: () => '点赞数'}
      )
    },
  },
  {
    key: 'commentNumber',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'warning'
          },
          {default: () => '评论数'}
      )
    },
  },
  {
    key: 'visitNumber',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'warning'
          },
          {default: () => '访问量'}
      )
    },
  },
  {
    key: 'shareTime',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'info'
          },
          {default: () => '分享时间'}
      )
    },
  },
  {
    key: 'shareDay',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'info'
          },
          {default: () => '分享天数'}
      )
    },
    render(row) {
      return h(
          NText,
          {
            size: "small"
          },
          {
            default: () => {
              switch (row.shareDay) {
                case -1:
                  return '永久';
                case 7:
                  return '7天';
                case 30:
                  return '30天';
                case 365:
                  return '1年'
              }
            }
          }
      )
    }
  },
  {
    key: 'isShareExpire',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'info'
          },
          {default: () => '是否过期'}
      )
    },
    render(row) {
      return h(
          NButton,
          {
            type: 'info',
            size: "small",
            onClick: () => {
            }
          },
          {
            default: () => {
              if (row.isShareExpire === 1) {
                return '过期'
              } else {
                return '未过期'
              }
            }
          }
      );
    }
  },
  {
    key: 'actions',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'info'
          },
          {default: () => '操作'}
      )
    },
    render(record) {
      return [
        h(NButton, {
              type: 'error',
              style: {marginRight: '10px'},
              onClick: () => {
                shareNoteLockObj.value.noteShareId = record.noteShareId
                if (record.isNeedPassword === 1) {
                  delShareNoteLockShowModal.value = true
                } else {
                  //加锁
                  addShareNoteLockShowModal.value = true
                }
              }
            },
            {
              default: () => {
                if (record.isNeedPassword === 1) {
                  return '解锁'
                } else {
                  return '加锁'
                }
              }
            }
        ),
        h(NButton, {
              type: 'info',
              style: {marginRight: '10px', marginTop: '5px'},
              onClick: () => {
                updateShareDayShow(record.shareDay)
                updateShareDayNoteShareId.value = record.noteShareId
                updateShareDayShowModal.value = true
              }
            },
            {default: () => '修改分享天数'}
        ),
        h(NButton, {
              type: 'warning',
              style: {marginRight: '10px', marginTop: '5px'},
              onClick: () => {
                drawerShow.value = true
                drawerObj.value.title = record.title
                drawerObj.value.content = record.content
              }
            },
            {default: () => '预览'}
        ),
        h(NButton, {
              type: 'success',
              style: {marginRight: '10px', marginTop: '5px'},
              onClick: () => {
                dialog.warning({
                  maskClosable: false,
                  title: "警告",
                  content: "你确定取消分享该笔记么？",
                  positiveText: "确定",
                  negativeText: "取消",
                  onPositiveClick: () => {
                    loadingBar.start()
                    NoteApi.cancelShareNote(record.noteShareId).then(res => {
                      if (res.data.code === 200) {
                        getShareNoteAll()
                        message.success('取消分享成功😊')
                        loadingBar.finish()
                      } else {
                        message.error(res.data.message)
                        loadingBar.error()
                      }
                    }).catch(err => {
                      message.error(err)
                      loadingBar.error()
                    })
                  },
                  onNegativeClick: () => {
                  }
                });
              }
            },
            {default: () => '取消分享'}
        ),

      ]
    }
  }
])
const shareData = ref()
const rowKey = (row) => {
  return row.noteShareId
}
const checkedRowKeysRef = ref([]);
const handleCheck = (rowKeys) => {
  checkedRowKeysRef.value = rowKeys;
}
const drawerShow = ref(false)
const drawerObj = ref({
  title: '',
  content: ''
})
//=======================================搜索BEGIN================================================
const searchDayOptions = [
  {
    label: '无',
    value: -888
  },
  {
    label: "7天",
    value: 7
  },
  {
    label: "30天",
    value: 30
  },
  {
    label: "1年",
    value: 365
  },
  {
    label: '永久',
    value: -1
  }
]
const searchIsExpireOptions = [
  {
    label: '无',
    value: -888
  },
  {
    label: '未过期',
    value: 0
  },
  {
    label: '过期',
    value: 1
  }
]
const searchObj = ref({
  searchTitle: '',
  searchDay: null,  //分享天数
  searchIsExpire: null //是否过期
})
const searchShareNote = () => {
  getShareNoteAll()
}
//=======================================搜索END================================================

//=======================================分页BEGIN================================================
const pagination = ref({
  page: 1,
  pageSize: 2,
})
const total = ref(null) //总记录数
const pageCount = ref(0) //页数
const pageChange = (page) => {
  pagination.value.page = page
  getShareNoteAll()
}
//=======================================分页END================================================

//=======================================修改分享天数BEGIN================================================
const updateShareDayShow = (shareDay) => {
  oldShareDayValue.value = shareDay
  switch (shareDay) {
    case -1:
      oldShareDayTextValue.value = '永久'
      return
    case 7:
      oldShareDayTextValue.value = '7天'
      return
    case 30:
      oldShareDayTextValue.value = '30天'
      return
    case 365:
      oldShareDayTextValue.value = '1年'
      return
  }
}
const oldShareDayValue = ref(null)
const oldShareDayTextValue = ref(null)
const updateShareDayNoteShareId = ref(null)
const updateShareDayShowModal = ref(false)
const updateShareDayOptions = [
  {
    label: "7天",
    value: 7
  },
  {
    label: "30天",
    value: 30
  },
  {
    label: "1年",
    value: 365
  },
  {
    label: '永久',
    value: -1
  }
]
const updateShareDayValue = ref(null)
const updateShareDayConfirm = () => {
  if (updateShareDayValue.value === null) {
    message.warning('请选择分享天数')
  } else if (oldShareDayValue.value === updateShareDayValue.value && updateShareDayValue.value === -1) {
    message.warning('当前是已经是永久了哦')
  } else {
    loadingBar.start()
    const obj = {
      noteShareId: updateShareDayNoteShareId.value,
      shareDay: updateShareDayValue.value
    }
    NoteApi.updateShareNoteDay(obj).then(res => {
      if (res.data.code === 200) {
        updateShareDayCancel()
        message.success('更新成功')
        loadingBar.finish()
        getShareNoteAll()
      } else {
        message.error(res.data.message)
        loadingBar.error()
      }
    }).catch(err => {
      message.error(err)
      loadingBar.error()
    })
  }
}
const updateShareDayCancel = () => {
  oldShareDayValue.value = null
  updateShareDayValue.value = null
  updateShareDayNoteShareId.value = null
  updateShareDayShowModal.value = false
}
//=======================================修改分享天数END================================================


//=======================================访问密码锁BEGIN================================================
const noSideSpace = (value) => !value.startsWith(" ") && !value.endsWith(" ") //不能输入空格
//加锁
const shareNoteLockObj = ref({
  noteShareId: null,
})
const addShareNoteLockObj = ref({
  lockPassword: null,
  confirmLockPassword: null
})
const addShareNoteLockShowModal = ref(false)
const addShareNoteLockConfirm = () => {
  if (addShareNoteLockObj.value.lockPassword === null || addShareNoteLockObj.value.confirmLockPassword === null) {
    notification.warning({
      content: "提示",
      meta: "密码和确认密码都不能为空😊",
      duration: 4000,
    })
  } else if (addShareNoteLockObj.value.lockPassword !== addShareNoteLockObj.value.confirmLockPassword) {
    notification.warning({
      content: "提示",
      meta: "密码和确认密码需要保持一致🤔",
      duration: 4000,
    })
  } else {
    loadingBar.start()
    const obj = {
      noteShareId: shareNoteLockObj.value.noteShareId,
      lockPassword: addShareNoteLockObj.value.lockPassword
    }
    NoteApi.addShareNoteLock(obj).then(res => {
      if (res.data.code === 200) {
        //添加成功
        addShareNoteLockCancel()
        message.success('添加访问密码成功😛')
        loadingBar.finish()
        getShareNoteAll()
      } else {
        message.error(res.data.message)
        loadingBar.error()
      }
    }).catch(err => {
      message.error(err)
      loadingBar.error()
    })
  }
}
const addShareNoteLockCancel = () => {
  shareNoteLockObj.value.noteShareId = null
  addShareNoteLockObj.value.lockPassword = null
  addShareNoteLockObj.value.confirmLockPassword = null
  addShareNoteLockShowModal.value = false
}
//删锁
const delShareNoteLockShowModal = ref(false)
const delShareNoteLockPassword = ref(null)
const delShareNoteLockConfirm = () => {
  if (delShareNoteLockPassword.value === null) {
    notification.warning({
      content: "提示",
      meta: "密码不能为空😊",
      duration: 4000,
    })
  } else {
    loadingBar.start()
    const obj = {
      noteShareId: shareNoteLockObj.value.noteShareId,
      lockPassword: delShareNoteLockPassword.value
    }
    NoteApi.delShareNoteLock(obj).then(res => {
      if (res.data.code === 200) {
        //取消成功
        delShareNoteLockCancel()
        message.success('取消分享密码成功😘')
        loadingBar.finish()
        getShareNoteAll()
      } else {
        message.error(res.data.message)
        loadingBar.error()
      }
    }).catch(err => {
      message.error(err)
      loadingBar.error()
    })
  }
}
const delShareNoteLockCancel = () => {
  shareNoteLockObj.value.noteShareId = null
  delShareNoteLockPassword.value = null
  delShareNoteLockShowModal.value = false
}
//=======================================访问密码锁END================================================

//=======================================右键显示菜单BEGIN================================================
const rightMouseOptions = ref([
  {
    label: () => h("span", {style: {color: "#4098fc"}}, "编辑"),
    key: "edit"
  },
  {
    label: () => h("span", {style: {color: "gray"}}, "取消"),
    key: "cancel"
  }
]);

const showDropdownRef = ref(false)
const xRef = ref(0);
const yRef = ref(0);
//选择按钮
const handleSelect = (key) => {
  showDropdownRef.value = false;
  if (key === 'edit') {
    editShowModal.value = true
  } else if (key === 'cancel') {
    editShareNoteObj.value = {}
    editShowModal.value = false
  } else {

  }
}
const onClickoutside = () => {
  showDropdownRef.value = false
}
const rowProps = (row) => {
  return {
    onContextmenu: (e) => {
      editShareNoteObj.value = row
      e.preventDefault();
      showDropdownRef.value = false;
      nextTick().then(() => {
        showDropdownRef.value = true;
        xRef.value = e.clientX;
        yRef.value = e.clientY;
      });
    }
  };
}
const editShowModal = ref(false)
//记录右键编辑对象
const editShareNoteObj = ref({})
//确认
const editShareNoteConfirm = () => {
  if (editShareNoteObj.value.title === '' || editShareNoteObj.value.tags.length === 0) {
    notification.warning({
      title: '提示',
      description: '分享笔记',
      content: '标题和标题都不能为空🤠',
    })
  } else {
    loadingBar.start()
    const obj = {
      noteShareId: editShareNoteObj.value.noteShareId,
      title: editShareNoteObj.value.title,
      tags: editShareNoteObj.value.tags.toString(),
      remark: editShareNoteObj.value.remark
    }
    NoteApi.updateShareNoteContent(obj).then(res => {
      if (res.data.code === 200) {
        editShareNoteCancel()
        message.success('更新成功')
        loadingBar.finish()
        getShareNoteAll()
      } else {
        message.error(res.data.message)
        loadingBar.error()
      }
    }).catch(err => {
      message.error(err)
      loadingBar.error()
    })
  }
}
//取消
const editShareNoteCancel = () => {
  editShareNoteObj.value = {}
  editShowModal.value = false
}
//=======================================右键显示菜单END================================================

</script>

<template>
  <n-space vertical style="margin: 20px auto;width: 95%">
    <n-steps style="width: 90%;margin: 30px auto" v-model:current="current">
      <template #finish-icon>
        <n-icon :component="Rocket"></n-icon>
      </template>
      <n-step
          disabled
          title="LEVEL ONE"
          description="分享的数量过少哦"
      >
        <template #icon>
          <n-icon :component="RocketOutline"></n-icon>
        </template>
      </n-step>
      <n-step
          disabled
          title="LEVEL TWO"
          description="分享的数量一般哦"
      >
        <template #icon>
          <n-icon :component="RocketOutline"></n-icon>
        </template>
      </n-step>

      <n-step
          disabled
          title="LEVEL THREE"
          description="分享的数量较多哦"
      >
        <template #icon>
          <n-icon :component="RocketOutline"></n-icon>
        </template>
      </n-step>

      <n-step
          disabled
          title="LEVEL FOUR"
          description="分享的数量很多哦（达到该等级，有特殊奖励哦）"
      >
        <template #icon>
          <n-icon :component="RocketOutline"></n-icon>
        </template>
      </n-step>
    </n-steps>
    <n-space justify="end">
      <n-input placeholder="请输入搜索条件(标题)" v-model:value="searchObj.searchTitle"></n-input>
      <n-select style="width: 150px" placeholder="请选择分享天数"
                :options="searchDayOptions" v-model:value="searchObj.searchDay"/>
      <n-select style="width: 150px" placeholder="是否过期"
                :options="searchIsExpireOptions" v-model:value="searchObj.searchIsExpire"/>
      <n-button type="success" style="width: 80px" @click="searchShareNote">搜索</n-button>
    </n-space>
    <n-data-table
        :columns="tableHead"
        :data="shareData"
        :row-key="rowKey"
        @update:checked-row-keys="handleCheck"
        :row-props="rowProps"
        :single-line="false" :striped="true"
        :bordered="false"
    >
    </n-data-table>
    <n-dropdown
        placement="bottom-start"
        trigger="manual"
        :x="xRef"
        :y="yRef"
        :options="rightMouseOptions"
        :show="showDropdownRef"
        :on-clickoutside="onClickoutside"
        @select="handleSelect"
    >
    </n-dropdown>
    <n-space justify="center">
      <n-space style="margin-top: 2px">
        <n-text style="font-size: 16px;">总记录数：{{ total }}</n-text>
      </n-space>
      <n-pagination v-model:page="pagination.page"
                    :page-count="pageCount"
                    :page-size="pagination.pageSize"
                    :on-update:page="page => {
                      pageChange(page)
                    }"
                    show-quick-jumper>
        <template #goto>
          跳到
        </template>
      </n-pagination>
      <n-space style="margin-top: 3px">
        <n-text>页</n-text>
      </n-space>
    </n-space>
  </n-space>
  <!--文章内容预览-->
  <n-drawer v-model:show="drawerShow" :width="480">
    <n-drawer-content :title="drawerObj.title" :native-scrollbar="false">
      <div v-html="drawerObj.content"></div>
    </n-drawer-content>
  </n-drawer>
  <!--修改分享天数-->
  <n-modal v-model:show="updateShareDayShowModal"
           :mask-closable="false"
  >
    <n-card
        style="width: 400px"
        title="修改分享日期"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
    >
      <template #default>
        <n-select placeholder="选择分享天数" :options="updateShareDayOptions"
                  v-model:value="updateShareDayValue"></n-select>
      </template>
      <template #footer>
        <n-text style="display:block;">当前该笔记的分享天数是：{{ oldShareDayTextValue }}</n-text>
        <n-text :depth="3">注意：修改后将会重新计时！</n-text>
      </template>
      <template #action>
        <n-grid cols="2" :x-gap="12" style="margin-top: -30px">
          <n-gi>
            <n-button block type="success" ghost @click="updateShareDayConfirm">
              确认
            </n-button>
          </n-gi>
          <n-gi>
            <n-button block tertiary @click="updateShareDayCancel">
              取消
            </n-button>
          </n-gi>
        </n-grid>
      </template>

    </n-card>
  </n-modal>
  <!--加锁-->
  <n-modal v-model:show="addShareNoteLockShowModal"
           :mask-closable="false"
  >
    <n-card
        style="width: 400px"
        title="为分享笔记添加锁密码"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
    >
      <template #header-extra>
        <n-icon :component="LockOutlined" :size="22"></n-icon>
      </template>
      <template #default>
        <n-space vertical>
          <n-text>密码</n-text>
          <n-input v-model:value="addShareNoteLockObj.lockPassword" type="password" :allow-input="noSideSpace"

                   placeholder="输入访问密码"></n-input>
          <n-text>确认密码</n-text>
          <n-input v-model:value="addShareNoteLockObj.confirmLockPassword" type="password" :allow-input="noSideSpace"
                   placeholder="输入确认密码"></n-input>
        </n-space>
      </template>
      <template #footer>
        <n-text :depth="3">注意：添加密码后需要需要密码访问！</n-text>
      </template>
      <template #action>
        <n-grid cols="2" :x-gap="12" style="margin-top: -30px">
          <n-gi>
            <n-button block type="success" ghost @click="addShareNoteLockConfirm">
              确认
            </n-button>
          </n-gi>
          <n-gi>
            <n-button block tertiary @click="addShareNoteLockCancel">
              取消
            </n-button>
          </n-gi>
        </n-grid>
      </template>

    </n-card>
  </n-modal>
  <!--解锁-->
  <n-modal v-model:show="delShareNoteLockShowModal"
           :mask-closable="false"
  >
    <n-card
        style="width: 400px"
        title="删除分享笔记锁密码"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
    >
      <template #header-extra>
        <n-icon :component="LockOutlined" :size="22"></n-icon>
      </template>
      <template #default>
        <n-space vertical>
          <n-text>密码</n-text>
          <n-input v-model:value="delShareNoteLockPassword" type="password" :allow-input="noSideSpace"

                   placeholder="输入访问密码"></n-input>
        </n-space>
      </template>
      <template #footer>
        <n-text :depth="3">注意：删除密码后将可以直接访问</n-text>
      </template>
      <template #action>
        <n-grid cols="2" :x-gap="12" style="margin-top: -30px">
          <n-gi>
            <n-button block type="success" ghost @click="delShareNoteLockConfirm">
              确认
            </n-button>
          </n-gi>
          <n-gi>
            <n-button block tertiary @click="delShareNoteLockCancel">
              取消
            </n-button>
          </n-gi>
        </n-grid>
      </template>

    </n-card>
  </n-modal>
  <!--编辑框显示-->
  <n-modal v-model:show="editShowModal"
           :mask-closable="false"
  >
    <n-card
        style="width: 400px"
        title="编辑笔记信息"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
    >
      <template #header-extra>
        <n-icon :component="EditNoteTwotone" :size="24" style="margin-bottom: 10px"></n-icon>
      </template>
      <template #default>
        <n-space vertical>
          <n-text>标题</n-text>
          <n-input v-model:value="editShareNoteObj.title" placeholder="输入分享标题"></n-input>
          <n-text>标签</n-text>
          <n-dynamic-tags v-model:value="editShareNoteObj.tags"/>
          <n-text>备注</n-text>
          <n-input v-model:value="editShareNoteObj.remark" type="textarea" placeholder="输入分享备注"></n-input>
        </n-space>
      </template>
      <template #footer>
        <n-text :depth="3">注意：只用于分享页面展示！</n-text>
      </template>
      <template #action>
        <n-grid cols="2" :x-gap="12" style="margin-top: -30px">
          <n-gi>
            <n-button block type="success" ghost @click="editShareNoteConfirm">
              确认
            </n-button>
          </n-gi>
          <n-gi>
            <n-button block tertiary @click="editShareNoteCancel">
              取消
            </n-button>
          </n-gi>
        </n-grid>
      </template>

    </n-card>
  </n-modal>
</template>

<style scoped>

</style>
