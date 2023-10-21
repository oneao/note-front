<script setup>
defineProps({
  noteId:{type:Number,required:true}
})
</script>
<template>
  <n-button>{{noteId}}</n-button>
</template>