<script setup>
import {h, defineComponent} from "vue";
import {NButton, NGradientText, NTag, useMessage} from "naive-ui";

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
    key: 'operationTime',
    align: 'center',
    title(column) {
      return h(
          NGradientText,
          {
            size: '16',
            type: 'success'
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
              //onClick: () => recoverOne(record)
            },
            {default: () => '预览'}
        ),
        h(NButton, {
              //onClick: () => deleteOne(record)
            },
            {default: () => '取消收藏'}
        )
      ]
    }
  }
])
const collectionData = ref([
  {serialNumber: 1, title: 'title', tags: ['标签1', '标签2'], operationTime: '2023-12-22 22:12:23'}
]);
const rowKey = (row) => {
  return row.type + '^' + row.id
}
const checkedRowKeysRef = ref([]);
const handleCheck = (rowKeys) => {
  checkedRowKeysRef.value = rowKeys;
}

</script>

<template>
  <n-space vertical>
    <n-steps style="width: 70%;margin: 30px auto">
      <n-step
          title="I Me Mine"
          description="All through the day, I me mine I me mine, I me mine"
      />
      <n-step
          title="Let It Be"
          description="When I find myself in times of trouble Mother Mary comes to me"
      />
      <n-step
          title="Come Together"
          description="Here come old flat top He come grooving up slowly"
      />
      <n-step
          title="Something"
          description="Something in the way she moves Attracts me like no other lover"
      />
    </n-steps>
    <n-data-table
        :columns="tableHead"
        :data="collectionData"
        :row-key="rowKey"
        @update:checked-row-keys="handleCheck"
        :single-line="false" :striped="true"
        :bordered="false"
        style="width: 80%;margin: 10px auto">
    </n-data-table>
  </n-space>

</template>
