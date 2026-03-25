<script setup>
defineProps(['records'])
const emit = defineEmits(['delete'])
</script>

<template>
  <div class="mt-6">

    <div class="text-lg font-bold mb-2">
      履歴
    </div>

    <!-- 空 -->
    <div
      v-if="records.length === 0"
      class="text-center text-gray-400"
    >
      履歴はありません
    </div>

    <!-- 履歴 -->
    <div
      v-for="r in records"
      :key="r.id"
      class="card bg-base-100 shadow mb-3"
    >
      <div class="card-body">

        <!-- 日付 -->
        <div class="font-bold text-sm text-gray-500">
         {{ new Date(r.date).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
         }) }}
        </div>

        <!-- 名前＋状態 -->
        <div class="flex justify-between items-center mt-2">

          <div>
            <div class="text-lg font-bold">{{ r.name }}</div>
            <div class="text-xs text-gray-400">
              {{ new Date(r.date).toLocaleDateString('ja-JP') }}
          </div>
        </div>

        <div
           class="badge badge-lg"
           :class="r.status === '欠席'
             ? 'badge-error'
             : 'badge-warning'"
        >
          {{ r.status }}
        </div>

        </div>

        <!-- 削除 -->
        <button
          class="btn btn-sm btn-error mt-3"
          @click="emit('delete', r.id)"
        >
          削除
        </button>

      </div>
    </div>

  </div>
</template>