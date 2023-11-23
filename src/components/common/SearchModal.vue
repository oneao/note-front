<script setup>
import {ref, watch, watchEffect, nextTick} from 'vue';
import NoteApi from '@/api/note'
import {useRouter} from "vue-router";//路由
const router = useRouter();
import {storeToRefs} from "pinia";
import {isShowSearchStore} from "@/stores/showSearchStore";

const showSearchStore = isShowSearchStore()
const {isShow} = storeToRefs(showSearchStore)

import {SearchOutline, ArrowUpCircle, ArrowDownCircle} from '@vicons/ionicons5'

const searchValue = ref('')
const searchModalShow = ref(false)
const listData = ref([])
const selectedIndex = ref(0)
const moveSelection = (direction) => {
  const newIndex = selectedIndex.value + direction;
  if (newIndex >= 0 && newIndex < listData.value.length) {
    selectedIndex.value = newIndex;
  }
}

watch(() => isShow.value, (newValue, oldValue) => {
  if (newValue) {
    searchModalShow.value = newValue
  } else {
    searchModalShow.value = newValue
    searchValue.value = ''
    listData.value = ''
  }
})
watch(() => searchValue.value, (newValue, oldValue) => {
  if (searchValue.value !== '') {
    NoteApi.getElasticSearchValue(searchValue.value).then(res => {
      if (res.data.code === 200) {
        if (res.data.data === null || res.data.data === '') {
        } else {
          listData.value = res.data.data
        }
      }
    })
  } else {
    listData.value = []
  }
})

const toEditNote = (id) => {
  isShow.value = false
  router.push('/note/edit/' + id)
}
</script>
<template>
  <n-modal v-model:show="searchModalShow"
           :mask-closable="false"
           style="margin-bottom: 250px"
  >
    <n-card
        style="width: 600px;border-radius: 15px;background-color: #f1f3f9"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        @keydown.up="moveSelection(-1)"
        @keydown.down="moveSelection(1)"
    >
      <template #header>
        <n-input v-model:value="searchValue" placeholder="输入搜索内容" size="large" style=" border-radius: 10px;"
                 class="searchClass">
          <template #prefix>
            <n-icon :component="SearchOutline" :size="30" style="margin-bottom: 5px"/>
          </template>
        </n-input>
      </template>
      <template #default>
        <n-scrollbar style="max-height: 260px">
          <n-list
              hoverable clickable style="border-radius: 5px;background-color: lightsalmon"
              v-model="selectedIndex"
          >
            <n-list-item
                v-for="(item, index) in listData"
                :key="index"
                :class="{ 'selected': selectedIndex === index }"
                @click="toEditNote(item.noteId)"
            >
              <n-thing  content-style="margin-top: 10px;">
                <template #header>
                  <n-text v-if="item.title === '' || item.title === null">暂未设置标题</n-text>
                  <n-text v-else>{{item.title}}</n-text>
                </template>
                <template #header-extra>
                  {{ item.updateTime }}
                </template>
                <template #description>
                  <n-text :depth="3" v-html="item.content">
                  </n-text>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-scrollbar>
      </template>
      <template #footer>
        <n-space justify="space-between">
          <n-space :size="7">
            <n-icon :component="ArrowUpCircle" :size="28"></n-icon>
            <n-text style="font-size: 18px" :depth="3">Top</n-text>
            <n-icon :component="ArrowDownCircle" :size="28"></n-icon>
            <n-text style="font-size: 18px" :depth="3">Next</n-text>
            <n-icon :size="28">
              <svg t="1700578637445" class="icon" viewBox="0 0 1024 1024" version="1.1"
                   xmlns="http://www.w3.org/2000/svg" p-id="17503" xmlns:xlink="http://www.w3.org/1999/xlink"
                   width="200" height="200">
                <path
                    d="M282.742154 630.153846a159.901538 159.901538 0 0 1-63.291077-12.051692 104.093538 104.093538 0 0 1-45.292308-38.006154A117.169231 117.169231 0 0 1 157.538462 515.741538a123.273846 123.273846 0 0 1 30.956307-90.820923A118.784 118.784 0 0 1 276.48 393.846154a112.482462 112.482462 0 0 1 85.267692 30.129231 120.280615 120.280615 0 0 1 29.144616 87.118769q0 16.187077-14.336 16.187077H211.849846a57.304615 57.304615 0 0 0 20.637539 47.261538A90.860308 90.860308 0 0 0 289.870769 590.769231a123.037538 123.037538 0 0 0 63.724308-16.659693 10.791385 10.791385 0 0 1 4.962461-1.890461q3.150769 0 4.923077 4.174769l10.752 19.928616a11.815385 11.815385 0 0 1 1.378462 5.12 7.640615 7.640615 0 0 1-4.056615 6.025846 140.209231 140.209231 0 0 1-39.936 17.132307A192.866462 192.866462 0 0 1 282.742154 630.153846z m56.083692-137.137231a61.912615 61.912615 0 0 0-15.675077-44.937846 60.573538 60.573538 0 0 0-46.237538-16.226461 66.441846 66.441846 0 0 0-48.482462 16.659692 60.258462 60.258462 0 0 0-16.620307 44.504615zM528.068923 630.153846a228.430769 228.430769 0 0 1-52.499692-6.025846 136.428308 136.428308 0 0 1-43.992616-17.132308q-5.828923-3.229538-5.828923-6.971077a8.113231 8.113231 0 0 1 1.772308-5.080615l12.603077-22.724923q2.205538-4.135385 4.450461-4.135385a11.736615 11.736615 0 0 1 5.868308 2.284308 129.969231 129.969231 0 0 0 33.201231 13.902769 134.892308 134.892308 0 0 0 36.352 5.592616 92.396308 92.396308 0 0 0 36.352-5.12 19.889231 19.889231 0 0 0 11.185231-19.456 17.211077 17.211077 0 0 0-4.489846-12.524308 31.822769 31.822769 0 0 0-12.563693-8.782769q-8.507077-3.702154-28.238769-10.200616l-14.808615-5.12a271.911385 271.911385 0 0 1-40.841847-17.132307 66.835692 66.835692 0 0 1-23.788307-20.873847 60.337231 60.337231 0 0 1-8.073846-32.413538 52.972308 52.972308 0 0 1 25.6-47.694769A122.88 122.88 0 0 1 527.596308 393.846154a162.697846 162.697846 0 0 1 86.646154 22.252308q5.789538 3.229538 5.789538 6.931692a12.603077 12.603077 0 0 1-2.244923 6.025846l-12.091077 19.928615q-2.717538 4.174769-4.489846 4.17477a11.736615 11.736615 0 0 1-5.395692-2.323693 96.098462 96.098462 0 0 0-28.278154-11.579077 118.311385 118.311385 0 0 0-32.728616-4.647384 81.644308 81.644308 0 0 0-33.240615 5.12 18.274462 18.274462 0 0 0-10.318769 18.510769 21.149538 21.149538 0 0 0 12.130461 19.022769 264.507077 264.507077 0 0 0 43.086769 16.659693l14.808616 4.647384a112.128 112.128 0 0 1 48.915692 27.332923 56.241231 56.241231 0 0 1 14.336 39.384616 55.532308 55.532308 0 0 1-24.654769 46.788923 119.256615 119.256615 0 0 1-71.798154 18.116923zM774.931692 630.153846a135.049846 135.049846 0 0 1-93.341538-30.129231 112.521846 112.521846 0 0 1-33.240616-87.079384 123.588923 123.588923 0 0 1 15.281231-62.109539 104.841846 104.841846 0 0 1 43.52-41.708307A140.209231 140.209231 0 0 1 774.025846 393.846154a179.318154 179.318154 0 0 1 48.009846 5.553231 114.057846 114.057846 0 0 1 36.785231 18.116923 7.640615 7.640615 0 0 1 4.056615 5.986461 12.996923 12.996923 0 0 1-2.244923 6.498462l-12.130461 21.779692q-2.678154 4.608-4.923077 4.608a12.681846 12.681846 0 0 1-6.301539-2.756923 112.679385 112.679385 0 0 0-27.844923-12.996923 99.721846 99.721846 0 0 0-32.295384-4.608 68.608 68.608 0 0 0-52.932923 20.873846 78.257231 78.257231 0 0 0-19.298462 56.044308 76.012308 76.012308 0 0 0 19.298462 56.516923 78.572308 78.572308 0 0 0 56.556307 18.510769 103.975385 103.975385 0 0 0 32.768-4.608 110.158769 110.158769 0 0 0 26.899693-13.430154 11.815385 11.815385 0 0 1 5.828923-2.363077q2.717538 0 5.395692 4.647385l12.996923 22.724923a8.113231 8.113231 0 0 1 1.811692 5.12 8.664615 8.664615 0 0 1-4.489846 6.459077 129.181538 129.181538 0 0 1-38.596923 17.604923 174.001231 174.001231 0 0 1-48.443077 6.025846z"
                    p-id="17504" fill="#2c2c2c"></path>
                <path
                    d="M865.792 1024H158.208A158.326154 158.326154 0 0 1 0 865.792V158.208A158.365538 158.365538 0 0 1 158.208 0h707.584A158.365538 158.365538 0 0 1 1024 158.208v707.584A158.326154 158.326154 0 0 1 865.792 1024zM158.208 79.950769A78.375385 78.375385 0 0 0 79.950769 158.208v707.584a78.336 78.336 0 0 0 78.257231 78.257231h707.584a78.336 78.336 0 0 0 78.257231-78.257231V158.208a78.336 78.336 0 0 0-78.257231-78.257231z"
                    p-id="17505" fill="#2c2c2c"></path>
              </svg>
            </n-icon>
            <n-text style="font-size: 18px" :depth="3">Quit</n-text>
          </n-space>
          <n-space>
            <n-text :depth="3" style="font-size: 16px;">搜索引擎</n-text>
            <n-icon :size="28">
              <svg t="1700578920240" class="icon" viewBox="0 0 1024 1024" version="1.1"
                   xmlns="http://www.w3.org/2000/svg" p-id="30003" xmlns:xlink="http://www.w3.org/1999/xlink"
                   width="200" height="200">
                <path
                    d="M378.2 473.2L139.8 688.6c-2.2 14.7-3.4 29.5-3.4 44.4 0 148.6 121.2 269.5 270 269.5 87.1 0.2 168.9-41.9 219.4-112.8l40.5-213.5L617 582 378.2 473.2z"
                    fill="#24BBB1" p-id="30004"></path>
                <path
                    d="M314.5 382.1L139 334.9C73.7 358.3 27.4 421.2 25.4 490.6c-1.8 63.8 33.1 123.6 88.4 154.2L343.4 449l-28.9-66.9z"
                    fill="#17A8E0" p-id="30005"></path>
                <path
                    d="M875.1 288.7c0-148.3-120.7-269-268.9-269-86.4 0-167.5 41.6-218 111.8l-41.6 215.4 42.8 91.6 237.5 108.1 244.8-214.8c2.2-15 3.4-29.2 3.4-43.1z"
                    fill="#FED10A" p-id="30006"></path>
                <path
                    d="M697.7 674.3l-20.6 201.2c21.7 9.5 45.3 13.3 68.9 11.2 38.5-3.3 74.1-21.9 98.7-51.6 24.6-29.3 36.3-67.2 32.6-105.3-0.9-10.4-2.9-20.6-6-30.5l-173.6-25z"
                    fill="#93C83E" p-id="30007"></path>
                <path
                    d="M323.8 321.1l35.6-198.8c-20.3-10.9-43-16.5-66.1-16.2-77.3 0.7-139.7 65.9-139 145.4 0.1 10.3 1.2 20.6 3.4 30.7l166.1 38.9z"
                    fill="#EF5098" p-id="30008"></path>
                <path
                    d="M903.2 361L674.3 561.5l35.5 67.7 177.8 41.4c64.7-24.8 108.9-88.7 108.5-158.2-0.1-63.9-36-122.3-92.9-151.4z"
                    fill="#0779A1" p-id="30009"></path>
              </svg>
            </n-icon>
            <n-text style="font-size: 18px;color: #e93b98">ElasticSearch</n-text>
          </n-space>
        </n-space>

      </template>
    </n-card>
  </n-modal>
</template>
<style scoped>
.searchClass {
  border: 2px solid lightcoral;
  box-shadow: 1px 1px lightcoral;
}

.selected {
  /* 添加被选择项的样式，以突出显示 */
  background-color: lightblue;
}

</style>
