<script setup>
import { ref, computed, onMounted } from 'vue'

/* =====================
   GAS URL
===================== */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwDO9vI4vece_1h5s-IYPopKXW7c8I7_gNIQzhUf7z6nJrLN2dBlFiabj7ULaLh7HDd/exec' // ← ここにGAS URLを入力

/* =====================
   userId管理
===================== */
const userId = ref('')

function generateUserId() {
  return 'user-' + Math.random().toString(36).substring(2, 10)
}

function initUserId() {
  const saved = localStorage.getItem('userId')
  if (saved) {
    userId.value = saved
  } else {
    const newId = generateUserId()
    localStorage.setItem('userId', newId)
    userId.value = newId
  }
}

/* =====================
   名前保存
===================== */
function loadNames() {
  const saved = localStorage.getItem('names')
  if (!saved) return

  try {
    const list = JSON.parse(saved)
    if (!Array.isArray(list) || list.length === 0) return

    members.value = list.map(name => ({
      id: generateId(),
      name,
      status: null
    }))
  } catch (e) {
    console.error(e)
  }
}

function saveNames() {
  const names = members.value
    .map(m => m.name?.trim())
    .filter(Boolean)

  localStorage.setItem('names', JSON.stringify(names))
}

/* =====================
   日付
===================== */
const selectedDate = ref(new Date())
const calendarOpen = ref(false)
const calendarMonth = ref(new Date())
const today = new Date()

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(date) {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function sameDay(a, b) {
  if (!a || !b) return false
  return formatDate(a) === formatDate(b)
}

function formatDateTimeJP(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(
    d.getHours()
  ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/* =====================
   カレンダー
===================== */
const days = computed(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()

  const rows = []
  let week = Array(firstDay).fill(null)

  for (let d = 1; d <= lastDate; d++) {
    week.push(new Date(year, month, d))
    if (week.length === 7) {
      rows.push(week)
      week = []
    }
  }

  if (week.length) {
    while (week.length < 7) week.push(null)
    rows.push(week)
  }

  return rows
})

function prevMonth() {
  calendarMonth.value = new Date(
    calendarMonth.value.getFullYear(),
    calendarMonth.value.getMonth() - 1,
    1
  )
}

function nextMonth() {
  calendarMonth.value = new Date(
    calendarMonth.value.getFullYear(),
    calendarMonth.value.getMonth() + 1,
    1
  )
}

/* =====================
   メンバー
===================== */
function generateId() {
  return Math.random().toString(36).substring(2)
}

const members = ref([{ id: generateId(), name: '', status: null }])

function addMember() {
  members.value.push({
    id: generateId(),
    name: '',
    status: null
  })
}

function removeMember(id) {
  if (members.value.length === 1) return
  members.value = members.value.filter(m => m.id !== id)
}

function updateMember(id, key, value) {
  members.value = members.value.map(m =>
    m.id === id ? { ...m, [key]: value } : m
  )
}

/* =====================
   トースト
===================== */
const toast = ref('')

function showToast(msg) {
  toast.value = msg
  setTimeout(() => {
    toast.value = ''
  }, 2000)
}

/* =====================
   履歴
===================== */
const records = ref([])

async function fetchRecords() {
  if (!GAS_URL || !userId.value) return

  try {
    const res = await fetch(`${GAS_URL}?userId=${userId.value}`)
    const data = await res.json()

    const today = new Date()

    records.value = (data || []).filter(r => {
      const recordDate = new Date(r.date)

      const diff =
        (today - recordDate) / (1000 * 60 * 60 * 24)

      return diff <= 30 // ← ここで制限（日数）
    })

  } catch {
    showToast('履歴取得失敗')
  }
}

/* =====================
   送信
===================== */
async function handleSubmit() {
  const validMembers = members.value.filter(
    m => m.name?.trim() !== '' && m.status !== null
  )

  if (validMembers.length === 0) {
    alert('名前とステータスを入力してください')
    return
  }

  if (!GAS_URL) {
    showToast('GAS URL未設定')
    return
  }

  const payload = {
    type: 'create',
    userId: userId.value,
    date: formatDate(selectedDate.value),
    members: validMembers.map(m => ({
      name: m.name.trim(),
      status: m.status
    }))
  }

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error('POST failed')

    saveNames()
    showToast('送信完了')

    members.value = [{ id: generateId(), name: '', status: null }]
    await fetchRecords()
  } catch (e) {
    console.error(e)
    showToast('送信失敗')
  }
}

/* =====================
   編集・削除
===================== */
function handleEdit(r) {
  selectedDate.value = new Date(r.date)
  calendarMonth.value = new Date(r.date)
  members.value = [
    {
      id: generateId(),
      name: r.name,
      status: r.status
    }
  ]
  showToast('履歴を読み込みました')
}

async function handleDelete(id) {
  if (!GAS_URL) {
    showToast('GAS URL未設定')
    return
  }

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({
        type: 'delete',
        id
      })
    })

    if (!res.ok) throw new Error('DELETE failed')

    showToast('削除完了')
    await fetchRecords()
  } catch (e) {
    console.error(e)
    showToast('削除失敗')
  }
}

/* =====================
   初期化
===================== */
onMounted(async () => {
  initUserId()
  loadNames()
  await fetchRecords()
})
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page-header">
        <h1 class="title">⚾ 出欠連絡</h1>
        <p class="subtitle">日付を選んで、出欠を登録してください</p>
      </header>

      <div v-if="toast" class="toast">
        {{ toast }}
      </div>

      <!-- 日付選択 -->
      <section class="card">
        <button class="date-button" @click="calendarOpen = !calendarOpen">
          <span class="date-label">📅 日付</span>
          <span class="date-value">{{ formatDisplay(selectedDate) }}</span>
        </button>

        <div v-if="calendarOpen" class="calendar">
          <div class="calendar-header">
            <button class="month-nav" @click="prevMonth">◀</button>
            <div class="month-title">
              {{ calendarMonth.getFullYear() }}年 {{ calendarMonth.getMonth() + 1 }}月
            </div>
            <button class="month-nav" @click="nextMonth">▶</button>
          </div>

          <div class="week-labels">
            <div class="week-label" v-for="w in ['日', '月', '火', '水', '木', '金', '土']" :key="w">
              {{ w }}
            </div>
          </div>

          <div v-for="(week, i) in days" :key="i" class="week-row">
            <button
              v-for="(d, j) in week"
              :key="j"
              class="day-cell"
              :class="{
                empty: !d,
                today: d && sameDay(d, today),
                selected: d && sameDay(d, selectedDate)
              }"
              :disabled="!d"
              @click="d && ((selectedDate = d), (calendarOpen = false))"
            >
              {{ d ? d.getDate() : '' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 入力 -->
      <section
        class="card member-card"
        v-for="(m, i) in members"
        :key="m.id"
      >
        <div class="member-head">
          <div class="member-title">{{ i + 1 }}人目</div>
          <button
            v-if="members.length > 1"
            class="mini-delete"
            @click="removeMember(m.id)"
          >
            削除
          </button>
        </div>

        <input
          v-model="m.name"
          class="name-input"
          type="text"
          placeholder="名前を入力"
        />

        <div class="status-grid">
          <button
            class="status-button absent"
            :class="{ active: m.status === '欠席' }"
            @click="updateMember(m.id, 'status', '欠席')"
          >
            ❌ 欠席
          </button>

          <button
            class="status-button late"
            :class="{ active: m.status === '10時参加' }"
            @click="updateMember(m.id, 'status', '10時参加')"
          >
            🕙 10時参加
          </button>
        </div>
      </section>

      <button class="secondary-button" @click="addMember">
        ＋ 兄弟を追加
      </button>

      <button class="primary-button" @click="handleSubmit">
        送信する
      </button>

      <!-- 履歴 -->
      <section class="history-section">
        <h2 class="section-title">履歴</h2>

        <div v-if="records.length === 0" class="empty-card">
          まだ履歴はありません
        </div>

        <div
          v-for="r in records"
          :key="r.id"
          class="card history-card"
        >
          <div class="history-meta">
            {{ formatDateTimeJP(r.timestamp) }}
          </div>

          <div class="history-main">
            <div class="history-name">{{ r.name }}</div>
            <div class="history-status">{{ r.status }}</div>
          </div>

          <div class="history-actions">
            <button class="edit-button" @click="handleEdit(r)">編集</button>
            <button class="delete-button" @click="handleDelete(r.id)">削除</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  background: #f2f4f7;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "SF Pro Text",
    "Helvetica Neue",
    Arial,
    sans-serif;
  color: #1f2937;
}

:global(button),
:global(input) {
  font: inherit;
}

.page {
  min-height: 100vh;
  background: #f2f4f7;
}

.container {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 14px 32px;
}

.page-header {
  margin-bottom: 16px;
}

.title {
  margin: 0 0 6px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.toast {
  margin-bottom: 12px;
  padding: 12px 14px;
  background: #007aff;
  color: #fff;
  border-radius: 14px;
  text-align: center;
  font-weight: 700;
}

.card,
.empty-card {
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
}

.empty-card {
  color: #6b7280;
  text-align: center;
}

.date-button {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.date-label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.date-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

.calendar {
  margin-top: 16px;
  border-top: 1px solid #eef2f7;
  padding-top: 14px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.month-title {
  font-size: 18px;
  font-weight: 700;
}

.month-nav {
  min-width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: #eef2f7;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
}

.week-labels,
.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.week-labels {
  margin-bottom: 8px;
}

.week-label {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
}

.week-row {
  margin-bottom: 6px;
}

.day-cell {
  min-height: 44px;
  border: none;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  font-weight: 600;
  color: #111827;
}

.day-cell.empty {
  background: transparent;
  cursor: default;
}

.day-cell.today {
  background: #dbeafe;
  color: #1d4ed8;
}

.day-cell.selected {
  background: #007aff;
  color: #fff;
}

.member-card {
  padding-top: 14px;
}

.member-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.member-title {
  font-size: 16px;
  font-weight: 700;
}

.mini-delete {
  min-height: 36px;
  padding: 0 12px;
  border: none;
  background: #fff1f2;
  color: #dc2626;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.name-input {
  width: 100%;
  min-height: 48px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 0 14px;
  background: #f9fafb;
  margin-bottom: 12px;
  font-size: 16px;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.status-button {
  min-height: 56px;
  border: none;
  border-radius: 16px;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.05s ease;
}

.status-button:active,
.primary-button:active,
.secondary-button:active,
.edit-button:active,
.delete-button:active,
.month-nav:active {
  transform: scale(0.98);
}

.status-button.absent {
  background: #fee2e2;
  color: #991b1b;
}

.status-button.late {
  background: #fef3c7;
  color: #92400e;
}

.status-button.active.absent {
  background: #ef4444;
  color: #fff;
}

.status-button.active.late {
  background: #f59e0b;
  color: #fff;
}

.secondary-button,
.primary-button {
  width: 100%;
  min-height: 54px;
  border: none;
  border-radius: 16px;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
}

.secondary-button {
  background: #fff;
  color: #111827;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
  margin-bottom: 12px;
}

.primary-button {
  background: #007aff;
  color: #fff;
  margin-bottom: 22px;
}

.history-section {
  margin-top: 8px;
}

.section-title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 800;
}

.history-card {
  padding-top: 14px;
}

.history-meta {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.history-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.history-name {
  font-size: 17px;
  font-weight: 700;
}

.history-status {
  font-size: 14px;
  color: #374151;
  background: #f3f4f6;
  padding: 6px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.history-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.edit-button,
.delete-button {
  min-height: 44px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.edit-button {
  background: #e0f2fe;
  color: #0369a1;
}

.delete-button {
  background: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 480px) {
  .container {
    padding: 14px 12px 28px;
  }

  .title {
    font-size: 24px;
  }

  .date-value {
    font-size: 20px;
  }

  .status-button {
    font-size: 16px;
  }
}
</style>