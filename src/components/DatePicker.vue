<script setup>
import { ref } from 'vue'

const props = defineProps(['date'])
const emit = defineEmits(['change'])

function update(e) {
  emit('change', new Date(e.target.value))
}
</script>

<template>
  <div class="card">
    <input
      type="date"
      :value="props.date.toISOString().split('T')[0]"
      @input="update"
      class="input"
    />
  </div>
</template>

<style scoped>
.card { margin-bottom: 12px; }
.input {
  width: 100%;
  height: 50px;
  font-size: 16px;
}
</style>