<script setup>
import {h, onMounted} from "vue";
import {NButton, NGradientText, NTag, useMessage, useLoadingBar} from "naive-ui";
import {HappyOutline, SadOutline,Rocket,RocketOutline} from '@vicons/ionicons5'

const loadingBar = useLoadingBar()
const message = useMessage()

import NoteApi from '@/api/note'

const tableHead = ref([
  {
    type: "selection",
  },
  {
    key: 'serialNumber',
    align: 'center',
    width: 100,
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
    width: 250,
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'error'
          },
          {default: () => '标题'}
      )
    }
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
                  marginRight: '6px'
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
    key: 'noteBody',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'success'
          },
          {default: () => '主体'}
      )
    },
    ellipsis: true
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
    //添加按钮时必须有模板组件，将按钮信息以参数形式传到组件中，在组件中写相关样式 或 使用naive ui提供的组件
    render(record) {
      return [
        h(NButton, { //NButton是naive ui提供的按钮组件模板，需要引入 import { NTag, NButton, } from 'naive-ui'
              style: {marginRight: '10px'},
              onClick: () => {
                showDrawer.value = true
                drawerContent.value.title = record.title
                drawerContent.value.content = record.content
              }
            },
            {default: () => '预览'}
        ),
        h(NButton, {
              onClick: () => cancelCollectionNote(record)
            },
            {default: () => '取消收藏'}
        )
      ]
    }
  }
])
const cancelCollectionNote = (record) => {
  if (record.id !== '' && record.id !== null) {
    loadingBar.start()
    NoteApi.cancelCollectionNote(record.id).then(res => {
      if (res.data.code === 200) {
        message.success('取消收藏成功!')
        loadingBar.finish()
        getCollectionNote() //重新获取
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
const collectionData = ref([]);
//=====================================复选框BEGIN======================================
const rowKey = (row) => {
  return row.id
}
const checkedRowKeysRef = ref([]);
const handleCheck = (rowKeys) => {
  checkedRowKeysRef.value = rowKeys;
}
//=====================================复选框END======================================
onMounted(() => {
  getCollectionNote()
})
const getCollectionNote = () => {
  loadingBar.start()
  const obj = {
    noteTitle: searchTitle.value,
    noteBody: searchBody.value,
    page: pagination.value.page,
    pageSize: pagination.value.pageSize
  }
  NoteApi.getCollectionNote(obj).then(res => {
    if (res.data.code === 200) {
      total.value = res.data.data.total
      if(total.value <= 5){
        current.value = 1
      }else if(total.value> 5 && total.value <= 10){
        current.value = 2
      }else if(total.value > 10 && total.value <= 15){
        current.value = 3
      }else {
        current.value = 4
      }
      pageCount.value = Math.ceil(total.value / pagination.value.pageSize)
      collectionData.value = res.data.data.record
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
const showDrawer = ref(false)
const drawerContent = ref({
  title: '',
  content: ''
})
//=======================================搜索BEGIN=================================================
const searchTitle = ref('')
const searchBody = ref('')
const searchCollectionNote = () => {
  if (searchBody.value !== '' || searchTitle.value !== '') {
    getCollectionNote()
  }
}
//=======================================搜索END=================================================

//=======================================批量恢复BEGIN=================================================
const batchCancelCollectionNotes = () => {
  if (checkedRowKeysRef.value.length === 0) {
    message.warning('需要选中才可以恢复哦！')
  } else {
    const noteIds = checkedRowKeysRef.value
    loadingBar.start()
    NoteApi.batchCancelCollectionNotes(noteIds).then(res => {
      if (res.data.code === 200) {
        checkedRowKeysRef.value = []
        getCollectionNote()
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
}
//=======================================批量恢复END=================================================

//=======================================分页BEGIN=================================================
const pagination = ref({
  page: 1,
  pageSize: 5,
})
const total = ref(null) //总记录数
const pageCount = ref(0) //页数
const pageChange = (page) => {
  pagination.value.page = page
  getCollectionNote()
}
//=======================================分页END=================================================

//=======================================Step-BEGIN=================================================

const current = ref(1)
//=======================================Step-END=================================================

</script>

<template>
  <n-space vertical>
    <n-steps style="width: 90%;margin: 30px auto" v-model:current="current">
      <template #finish-icon>
        <n-icon :component="Rocket"></n-icon>
      </template>
      <n-step
          disabled
          title="LEVEL ONE"
          description="收藏的数量过少哦"
      >
        <template #icon>
          <n-icon :component="RocketOutline"></n-icon>
        </template>
      </n-step>
      <n-step
          disabled
          title="LEVEL TWO"
          description="收藏的数量一般哦"
      >
        <template #icon>
          <n-icon :component="RocketOutline"></n-icon>
        </template>
      </n-step>

      <n-step
          disabled
          title="LEVEL THREE"
          description="收藏的数量较多哦"
      >
        <template #icon>
          <n-icon :component="RocketOutline"></n-icon>
        </template>
      </n-step>

      <n-step
          disabled
          title="LEVEL FOUR"
          description="收藏的数量很多哦（达到该等级，有特殊奖励哦）"
      >
        <template #icon>
          <n-icon :component="RocketOutline"></n-icon>
        </template>
      </n-step>
    </n-steps>
    <n-space vertical style="width: 90%;margin: 10px auto">
      <n-space justify="space-between">
        <n-space>
          <n-button type="warning" @click="batchCancelCollectionNotes">批量取消收藏</n-button>
        </n-space>
        <n-space justify="end">
          <n-input v-model:value="searchTitle" placeholder="搜索内容为标题" maxlength="20" show-count
                   clearable></n-input>
          <n-input v-model:value="searchBody" placeholder="搜索内容为主体内容" maxlength="50" show-count
                   clearable></n-input>
          <n-button type="success" @click="searchCollectionNote">搜索</n-button>
        </n-space>
      </n-space>
      <n-data-table
          :columns="tableHead"
          :data="collectionData"
          :row-key="rowKey"
          @update:checked-row-keys="handleCheck"
          :single-line="false" :striped="true"
          :bordered="false"
      >
      </n-data-table>
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
    <n-drawer v-model:show="showDrawer" :width="480">
      <n-drawer-content :title="drawerContent.title" :native-scrollbar="false">
        <div v-html="drawerContent.content"></div>
      </n-drawer-content>
    </n-drawer>
  </n-space>
</template>
