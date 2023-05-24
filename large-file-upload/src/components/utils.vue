<template>

  <div>
    <div>工具类组件</div>
    <div>倒计时{{ data.currentTime }}</div>
  </div>

</template>

<script setup>
  import {ref, reactive, onMounted, onBeforeUnmount} from 'vue'
  import {getTime} from '../js/utils'

  const data = reactive({
    timer: '',
    currentTime: '',
  })
// let timer = ref('')
// let currentTime = ref('')

//   getTime(timer,currentTime)
  getTime(data)

//   onMounted(() => {
//     console.log(data.currentTime)
//   })

    // 组件销毁时，关闭定时器
  onBeforeUnmount(() => {
    if (data.timer) {
      clearInterval(data.timer); // 在Vue实例销毁前，清除我们的定时器
    }
  })
</script>

<style>

</style>