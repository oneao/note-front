<script setup>
import {h, ref, watch} from 'vue';
import {NIcon} from "naive-ui";
import {
  AddBoxRound,
  NoteRound,
  NoteAltRound,
  SearchRound,
  AccessTimeRound,
  StarBorderRound,
  ShoppingBagOutlined,
  DeleteOutlineRound,
  NoteOutlined,
  NoteAltOutlined
} from '@vicons/material'
import bus from 'vue3-eventbus'
//引入路由对象
import {useRouter} from "vue-router";

const router = useRouter();
//读取图标
const renderIcon = (icon, size, color) => {
  return () => {
    return h(NIcon, {size, color}, {
      default: () => h(icon)
    });
  };
};
//添加选项框
const addOptions = [
  {
    label: '新增小记',
    key: 'smallNote',
    icon: renderIcon(NoteRound, 22, '#2080f0'),
    props: {
      onClick: () => {
        router.push('/smallNote').then(() => {
          bus.emit('createNewSmallNote')
        })
      }
    }
  },
  {
    label: '新增笔记',
    key: 'note',
    icon: renderIcon(NoteAltRound, 22, '#18a058')
  }
]
//主菜单
const mainMenus = [
  {
    label: '最近操作',
    icon: AccessTimeRound,
    icon_size: 26,
    to: ''
  },
  {
    label: '小记',
    icon: NoteOutlined,
    icon_size: 24,
    to: '/smallNote'
  },
  {
    label: '笔记',
    icon: NoteAltOutlined,
    icon_size: 24,
    to: ''
  },
  {
    label: '收藏',
    icon: StarBorderRound,
    icon_size: 28,
    to: ''
  },
  {
    label: '商城',
    icon: ShoppingBagOutlined,
    icon_size: 26,
    to: ''
  },
  {
    label: '回收站',
    icon: DeleteOutlineRound,
    icon_size: 28,
    to: ''
  },
]
//路由地址
const routerPath = ref(router.currentRoute.value.path)
watch(() => router.currentRoute.value,
    newData => {
      routerPath.value = newData.path
    }
)
</script>

<template>
  <n-space vertical>
    <!--添加功能-->
    <n-dropdown :options="addOptions" placement="right-start">
      <n-button text type="primary">
        <n-icon :size="34" :component="AddBoxRound"/>
      </n-button>
    </n-dropdown>
    <!--搜索功能-->
    <n-button text>
      <n-icon size="26" :component="SearchRound"/>
    </n-button>
  </n-space>
  <!--分割线-->
  <n-divider style="width: 34px;margin: 15px auto"/>
  <!--主要页面-->
  <n-space vertical :size="20">
    <n-popover v-for="item of mainMenus" :key="item.label" placement="right" trigger="hover">
      <template #trigger>
        <n-button
            style="width: 34px;padding: 0"
            :text="routerPath !== item.to"
            :type="routerPath === item.to ? 'primary' : 'default'"
            :tertiary="routerPath === item.to"
            @click="router.push(item.to)">
          <n-icon :size="item.icon_size" :component="item.icon"/>
        </n-button>
      </template>
      <span>{{ item.label }}</span>
    </n-popover>
  </n-space>
</template>