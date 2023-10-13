<script setup>
import {ref,computed} from 'vue';
import {storeToRefs} from "pinia";
//模态框显示
import {handOffModalStore} from "@/stores/loginModalStore";
const handOffModal = handOffModalStore();
const {showModal} = storeToRefs(handOffModal);

//模态框内容切换
import Login from '@/components/login/Login.vue'
import Register from '@/components/login/Register.vue'
import RegisterSuccess from "@/components/login/RegisterSuccess.vue";
const modalStep = ref(1)

const showModalCard = computed(() => {
  switch (modalStep.value){
    case 1:
      return Login;
    case 2:
      return Register;
    default:
      return RegisterSuccess;
  }
})
//页面跳转切换
const changeModalStep = step => {
  modalStep.value = step;
}
</script>

<template>
  <!-- 登录模态框 -->
  <n-modal v-model:show="showModal" :mask-closable="false" transform-origin="center" style="width: 430px;">
    <Transition name="bounce" mode="out-in">
      <component :is="showModalCard" @changeModal="changeModalStep"></component>
    </Transition>
  </n-modal>
</template>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
</style>