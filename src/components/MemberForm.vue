<script setup>
defineProps(['members'])
const emit = defineEmits(['add','update','remove'])
</script>

<template>
  <div>

    <!-- メンバー入力 -->
    <div
      v-for="(m, i) in members"
      :key="m.id"
      class="card bg-base-100 shadow mb-4"
    >
      <div class="card-body">

        <!-- タイトル -->
        <div class="font-bold text-lg mb-2">
          {{ i + 1 }}人目
        </div>

        <!-- 名前 -->
        <input
          v-model="m.name"
          placeholder="名前を入力"
          class="input input-bordered w-full text-lg mb-3"
        />

        <!-- ステータス -->
        <div class="grid grid-cols-2 gap-2">

          <button
            class="btn h-14 text-lg"
            :class="m.status === '欠席'
              ? 'btn-error'
              : 'btn-outline'"
            @click="emit('update', m.id, 'status', '欠席')"
          >
            ❌ 欠席
          </button>

          <button
            class="btn h-14 text-lg"
            :class="m.status === '10時参加'
              ? 'btn-warning'
              : 'btn-outline'"
            @click="emit('update', m.id, 'status', '10時参加')"
          >
            ⏰ 10時参加
          </button>

        </div>

        <!-- 削除 -->
        <button
          v-if="members.length > 1"
          class="btn btn-sm btn-error mt-3"
          @click="emit('remove', m.id)"
        >
          削除
        </button>

      </div>
    </div>

    <!-- 追加 -->
    <button
      class="btn btn-outline w-full h-14 text-lg mt-2"
    >
      ＋ 兄弟を追加
    </button>

  </div>
</template>