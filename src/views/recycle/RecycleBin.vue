<script setup>
import {disabledBtn} from "@/utils/disabledBtn";
//==============================================表格BEGIN=================================================
import {h, onMounted} from "vue";
import {NButton, NGradientText, NTag, useMessage} from "naive-ui";
import {AddReactionOutlined,AutoDeleteOutlined,AutorenewRound} from '@vicons/material'
import RecycleBinApi from '@/api/recycleBin'
import {useLoadingBar} from 'naive-ui'

const loadingBar = useLoadingBar()

const recycleData = ref([])
onMounted(() => {
  getRecycleBin()
})
const getRecycleBin = () => {
  loadingBar.start()
  const obj = {
    page: pagination.value.page,
    pageSize: pagination.value.pageSize,
    searchValue: searchValue.value,
    classifyValue: classifyValue.value
  }
  RecycleBinApi.getRecycleBin(obj).then(res => {
    if (res.data.code === 200) {
      recycleData.value = res.data.data.list
      total.value = res.data.data.total
      pageCount.value = Math.ceil(total.value / pagination.value.pageSize)
      recycleData.value.forEach(item => {
        item.title = (item.title === null || item.title === '') ? '暂无标题' : item.title
        item.tags = item.tags === null ? ['暂无标签'] : item.tags.split(',')
      })
      loadingBar.finish()
    } else {
      message.error(res.data.message)
      loadingBar.error()
    }
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
}
const message = useMessage()
//表头数据 一个对象表示一列 titel是每一列的名字 key是对应的字段名 可在对象类写每一列的宽度居中方式等样式
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
    width: 300,
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'info'
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
            type: 'info'
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
    key: 'typeName',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'info'
          },
          {default: () => '类别'}
      )
    }
  },
  {
    key: 'operationTime',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'info'
          },
          {default: () => '操作时间'}
      )
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
    //添加按钮时必须有模板组件，将按钮信息以参数形式传到组件中，在组件中写相关样式 或 使用naive ui提供的组件
    render(record) {
      return [
        h(NButton, { //NButton是naive ui提供的按钮组件模板，需要引入 import { NTag, NButton, } from 'naive-ui'
              style: {marginRight: '10px'},
              onClick: () => recoverOne(record)
            },
            {default: () => '恢复'}
        ),
        h(NButton, {
              onClick: () => deleteOne(record)
            },
            {default: () => '彻底删除'}
        )
      ]
    }
  }
])
//表格数据
//===================================================分页==============================================
const pagination = ref({
  page: 1,
  pageSize: 5,
})
const total = ref(null) //总记录数
const pageCount = ref(0) //页数
const pageChange = (page) => {
  pagination.value.page = page
  getRecycleBin()
}
//===================================================分页==============================================
//===================================================搜索框==============================================
const searchValue = ref('') //条件输入框
const options = ref([
  {
    label: "无",
    value: "",
  },
  {
    label: "小记",
    value: "0",
  },
  {
    label: "笔记",
    value: "1"
  }
])
const classifyValue = ref('')//搜索框
//===================================================搜索框==============================================
//选项
const rowKey = (row) => {
  return row.type + '^' + row.id
}
const checkedRowKeysRef = ref([]);
const handleCheck = (rowKeys) => {
  checkedRowKeysRef.value = rowKeys;
}
//===================================================彻底删除==============================================
import DelDialog from "@/components/message/DelDialog.vue";
import NoteApi from '@/api/note'
import SmallNoteApi from '@/api/smallNote'
import {storeToRefs} from "pinia";
import {useUserStore} from "@/stores/userStore";

const userStore = useUserStore();
const {id} = storeToRefs(userStore)
const deleteObj = ref('')
const showDelete = ref(false)
const deleteOne = (item) => {
  deleteObj.value = item
  showDelete.value = true
}
const deleteOneMethod = (item) => {
  loadingBar.start()
  //删除笔记
  if (deleteObj.value.type === 1) {
    const obj = {
      noteId: deleteObj.value.id,
      deleteType: item,
      isNewBuild: -1
    }
    NoteApi.deleteNote(obj).then(res => {
      if (res.data.code === 60012) {
        showDelete.value = false
        message.success(res.data.message)
        loadingBar.finish()
        getRecycleBin()
      } else {
        message.error(res.data.message)
        loadingBar.error()
      }
    }).catch(err => {
      console.log(err)
      loadingBar.error()
    })
  } else if (deleteObj.value.type === 0) {
    console.log('11')
    //删除小记
    const obj = {
      userId: id.value,
      smallNoteId: deleteObj.value.id,
      deleteType: item,
    }
    console.log(obj)
    SmallNoteApi.deleteSmallNote(obj).then(res => {
      if (res.data.code === 60038) {
        showDelete.value = false
        message.success(res.data.message)
        loadingBar.finish()
        getRecycleBin()
      } else {
        message.error('error')
        loadingBar.error()
      }
    }).catch(err => {
      console.log(err)
      loadingBar.error()
    })
  }
}
//===================================================彻底删除==============================================
//===================================================彻底批量删除==============================================
const deleteManyButton = ref(false)
const deleteManyShow = ref(false)
const deleteManyMethod = () => {
  deleteManyShow.value = false
  loadingBar.start()
  disabledBtn(deleteManyButton,true)
  const types = []
  const ids = []
  checkedRowKeysRef.value.forEach(item => {
    var mid = item.split('^')
    types.push(mid[0])
    ids.push(mid[1])
  })
  if (types.length === 0 || ids.length === 0){
    message.warning('选中前面的复选框才能删除哦！')
    loadingBar.finish()
    disabledBtn(deleteManyButton,false,true,2)
    return
  }
  const obj = {
    types,
    ids
  }
  RecycleBinApi.deleteMany(obj).then(res => {
    if(res.data.code === 60041){
      message.success(res.data.message)
      loadingBar.finish()
      getRecycleBin()//重新获取
    }else {
      message.error(res.data.message)
      loadingBar.error()
    }
    disabledBtn(deleteManyButton,false,true,2)
  }).catch(err => {
    console.log(err)
    loadingBar.error()
    disabledBtn(deleteManyButton,false,true,2)
  })
}
//===================================================彻底批量删除==============================================
//===================================================恢复==============================================
const recoverShow = ref(false)
const recoverObj = ref('')
const recoverOne = (item) => {
  recoverObj.value = item
  recoverShow.value = true
}
const recoverMethod = () => {
  loadingBar.start()
  const obj = {
    id: recoverObj.value.id,
    type: recoverObj.value.type
  }
  RecycleBinApi.recoverOneRecord(obj).then(res => {
    if (res.data.code === 60039 || res.data.code === 60040) {
      recoverShow.value = false
      loadingBar.finish()
      message.success(res.data.message)
      getRecycleBin()
    } else {
      message.error(res.data.message)
      loadingBar.error()
    }
  }).catch(err => {
    console.log(err)
    loadingBar.error()
  })
}
const recoverType = computed(() => {
  if (recoverObj.value.type === 0) {
    return '恢复小记提醒'
  } else {
    return '恢复笔记提醒'
  }
})
//===================================================恢复==============================================
//===================================================批量恢复==============================================c
const recoverManyButton = ref(false)
const recoverManyShow = ref(false)
const recoverManyMethod = () => {
  recoverManyShow.value = false
  loadingBar.start()
  disabledBtn(recoverManyButton,true)
  const types = []
  const ids = []
  checkedRowKeysRef.value.forEach(item => {
    var mid = item.split('^')
    types.push(mid[0])
    ids.push(mid[1])
  })
  if (types.length === 0 || ids.length === 0){
    message.warning('选中前面的复选框才能删除哦！')
    loadingBar.finish()
    disabledBtn(recoverManyButton,false,true,2)
    return
  }
  const obj = {
    types,
    ids
  }
  RecycleBinApi.recoverMany(obj).then(res => {
    if(res.data.code === 60042){
      message.success(res.data.message)
      loadingBar.finish()
      getRecycleBin()//重新获取
    }else {
      message.error(res.data.message)
      loadingBar.error()
    }
    disabledBtn(recoverManyButton,false,true,2)
  }).catch(err => {
    console.log(err)
    loadingBar.error()
    disabledBtn(recoverManyButton,false,true,2)
  })
}
//===================================================批量恢复==============================================c

//==============================================表格END=================================================
</script>
<template>
  <n-space style="width: 100%;" vertical>
    <n-space style="width:90%;margin-top: 20px;" justify="end">
      <n-button type="success" @click="recoverManyShow = true">批量恢复</n-button>
      <n-button :disabled="deleteManyButton" @click="deleteManyShow = true" type="warning">批量删除</n-button>
      <n-input placeholder="搜索条件" v-model:value="searchValue" style="width: 200px"></n-input>
      <n-select placeholder="选择分类" v-model:value="classifyValue" :options="options" style="width: 100px"></n-select>
      <n-button @click="getRecycleBin" type="info">搜索</n-button>
    </n-space>
    <n-data-table :single-line="false" :striped="true"
                  :columns="tableHead" :data="recycleData"
                  :row-key="rowKey" @update:checked-row-keys="handleCheck"
                  style="width: 80%;margin: 10px auto"></n-data-table>
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
  <!--删除提醒框-->
  <del-dialog :title="deleteObj.title "
              :show="showDelete "
              :delete-complete-btn="true"
              :delete-btn="false"
              @delete-complete="deleteOneMethod"
              @cancel="showDelete = false"
  />
  <!--恢复提醒框-->
  <n-modal
      transform-origin="center"
      :show="recoverShow"
      preset="dialog"
      type="success"
      :title="recoverType"
      :closable="false"
  >
    <template #icon>
      <n-icon :component="AddReactionOutlined" style="position: relative;top:0px"></n-icon>
    </template>
    <template #default>你确定要恢复《{{ recoverObj.title }}》么？</template>
    <template #action>
      <n-button size="small" @click="recoverMethod" tertiary type="error">恢复</n-button>
      <n-button size="small" @click="recoverShow = false" tertiary>取消</n-button>
    </template>
  </n-modal>
  <!--批量删除提醒框-->
  <n-modal
      transform-origin="center"
      :show="deleteManyShow"
      preset="dialog"
      type="error"
      title="批量删除提醒"
      :closable="false"
  >
    <template #icon>
      <n-icon :component="AutoDeleteOutlined" style="position: relative;top:0px"></n-icon>
    </template>
    <template #default>你确定要批量删除这些内容么？（无法恢复哦）</template>
    <template #action>
      <n-button size="small" @click="deleteManyMethod" tertiary type="error">彻底删除</n-button>
      <n-button size="small" @click="deleteManyShow = false" tertiary>取消</n-button>
    </template>
  </n-modal>
  <!--批量恢复提醒框-->
  <n-modal
      transform-origin="center"
      :show="recoverManyShow"
      preset="dialog"
      type="error"
      title="批量恢复提醒"
      :closable="false"
  >
    <template #icon>
      <n-icon :component="AutorenewRound" style="position: relative;top:0px"></n-icon>
    </template>
    <template #default>你确定要批量恢复这些内容么？（将在你的列表中展示哦！）</template>
    <template #action>
      <n-button size="small" :disabled="recoverManyButton" @click="recoverManyMethod" tertiary type="success">恢复</n-button>
      <n-button size="small" @click="recoverManyShow = false" tertiary>取消</n-button>
    </template>
  </n-modal>
</template>

