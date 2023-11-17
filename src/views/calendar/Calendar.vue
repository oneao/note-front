<script setup>
import { ref,onMounted } from "vue";
import SmallNoteApi from "@/api/smallNote";
import { useMessage } from "naive-ui";
import { isYesterday, addDays } from "date-fns/esm";
const message = useMessage();
const value = ref(addDays(Date.now(), 1).valueOf())
const handleUpdateValue = (_, { year, month, date }) =>{
  message.success(`${year}-${month}-${date}`);
}

onMounted(() => {
  getSmallNoteCalendar()
})
const result = ref([])
const getSmallNoteCalendar = () => {
  SmallNoteApi.getSmallNoteForCalendar().then(res => {
    if (res.data.code === 200){
      console.log(res)
      result.value = res.data.data
      result.value.forEach(item => {
        item.beginTime = Date.parse(item.beginTime)
        item.endTime = Date.parse(item.endTime)
        item.smallNoteEvents = JSON.parse(item.smallNoteEvents)
        console.log(item.beginTime)
        console.log(item.endTime)
      })
    }
  })
}
//const getCalendarCellClass = (item,year,month,date) => {
//  if (item.beginTime < Date.parse(`${year}-${month}-${date}`) && item.endTime > Date.parse(`${year}-${month}-${date}`)) {
//    return 'condition-matched';
//  } else {
//    return '';
//  }
//}
</script>
<template>
  <n-calendar
      v-model:value="value"
      #="{ year, month, date }"
      @update:value="handleUpdateValue"
      style="width: 80%;height: 90%;margin: 20px auto;"
      class="calendar"
  >
    <n-space vertical>
      <n-gradient-text type="danger" style="font-weight: bold;font-size: 18px" >{{ year }}-{{ month }}-{{ date }}</n-gradient-text>
      <n-space v-if="result.length > 0" v-for="item of result" vertical>
        <n-space  v-if="item.beginTime < Date.parse(`${year}-${month}-${date}`) && item.endTime > Date.parse(`${year}-${month}-${date}`)" vertical>
          <n-text style="font-weight: bold;">{{item.noteTitle}}</n-text>
          <n-text v-for="event of item.smallNoteEvents">
            {{event.toDoThing}}
            <n-text v-if="event.isChecked">✔</n-text>
            <n-text v-else>❌</n-text>
          </n-text>
        </n-space>
      </n-space>
    </n-space>
  </n-calendar>
</template>
<style scoped>

.n-calendar:deep(.n-calendar-cell .n-calendar-date .n-calendar-date__date){
}
</style>