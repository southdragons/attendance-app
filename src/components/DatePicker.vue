<script setup>
import { ref } from 'vue'

const props = defineProps(['date'])
const emit = defineEmits(['change'])

const dateInput = ref(null)

function update(e) {
  emit('change', new Date(e.target.value))
}

function openPicker() {
  dateInput.value.showPicker() // ←これが重要
}
</script>

<template>
  <!-- 👇 ここをタップ -->
  <div class="card" @click="openPicker">
    {{ props.date.toISOString().split('T')[0] }}
  </div>

  <!-- 👇 非表示のinput -->
  <input
    ref="dateInput"
    type="date"
    :value="props.date.toISOString().split('T')[0]"
    @input="update"
    class="hidden-input"
  />
</template>

<style scoped>
.card {
  margin-bottom: 12px;
  padding: 14px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  background: #fff;
  border-radius: 12px;
}

/* 完全非表示 */
.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
</style>