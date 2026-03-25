<script setup>
const emit = defineEmits(['submit'])
</script>

<template>
  <div class="fixed bottom-0 left-0 w-full p-3 bg-base-200 shadow-2xl">
    <button class="btn btn-primary w-full h-14 text-lg" @click="emit('submit')">
      送信する
    </button>
  </div>
</template>

<style scoped>
/* CSSだけを書く */
</style>