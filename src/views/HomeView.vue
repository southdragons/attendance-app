<script setup>
import { ref, onMounted } from 'vue'
import DatePicker from '../components/DatePicker.vue'
import MemberForm from '../components/MemberForm.vue'
import HistoryList from '../components/HistoryList.vue'
import SubmitBar from '../components/SubmitBar.vue'

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwDO9vI4vece_1h5s-IYPopKXW7c8I7_gNIQzhUf7z6nJrLN2dBlFiabj7ULaLh7HDd/exec'

const userId = ref('')
const members = ref([{ id: Date.now(), name: '', status: null }])
const selectedDate = ref(new Date())
const records = ref([])
const toast = ref('')

/* userId */
function initUserId() {
  const saved = localStorage.getItem('userId')
  if (saved) userId.value = saved
  else {
    const id = 'user-' + Math.random().toString(36).substring(2, 10)
    localStorage.setItem('userId', id)
    userId.value = id
  }
}

/* メンバー */
function addMember() {
  members.value.push({ id: Date.now(), name: '', status: null })
}

function updateMember(id, key, val) {
  members.value = members.value.map(m =>
    m.id === id ? { ...m, [key]: val } : m
  )
}

function removeMember(id) {
  if (members.value.length === 1) return
  members.value = members.value.filter(m => m.id !== id)
}

/* 日付 */
function formatDate(d) {
  return d.toISOString().split('T')[0]
}

/* 履歴 */
async function fetchRecords() {
  const res = await fetch(`${GAS_URL}?userId=${userId.value}`)
  records.value = await res.json()
}

/* 送信 */
async function submit() {
  const valid = members.value.filter(m => m.name && m.status)

  if (!valid.length) {
    toast.value = '入力してください'
    return
  }

  await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      type: 'create',
      userId: userId.value,
      date: formatDate(selectedDate.value),
      members: valid
    })
  })

  toast.value = '送信完了'
  members.value = [{ id: Date.now(), name: '', status: null }]
  fetchRecords()
}

/* 削除 */
async function deleteRecord(id) {
  await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ type: 'delete', id })
  })
  fetchRecords()
}

/* 初期化 */
onMounted(() => {
  initUserId()
  fetchRecords()
})
</script>

<template>
  <div class="container">

    <div class="title">⚾ 出欠連絡</div>

    <DatePicker
      :date="selectedDate"
      @change="d => selectedDate = d"
    />

    <MemberForm
      :members="members"
      @add="addMember"
      @update="updateMember"
      @remove="removeMember"
    />

    <HistoryList
      :records="records"
      @delete="deleteRecord"
    />

    <SubmitBar @submit="submit" />

    <div v-if="toast" class="toast">{{ toast }}</div>

  </div>
</template>

<style scoped>
.container {
  padding: 12px 12px 100px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
}

.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  
  background: #2563eb;
  color: white;
  
  padding: 12px 20px;
  border-radius: 12px;
  
  font-weight: bold;
  
  width: auto;          /* ← 重要 */
  max-width: 80%;       /* ← 重要 */
  text-align: center;
  
  z-index: 9999;
}
</style>