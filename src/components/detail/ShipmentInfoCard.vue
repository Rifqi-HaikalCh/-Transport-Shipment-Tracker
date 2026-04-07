<script setup lang="ts">
import type { Shipment } from '@/types'
import { computed } from 'vue'
import { Clock } from 'lucide-vue-next'

const props = defineProps<{
  shipment: Shipment
  countdown?: number
}>()

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Arriving soon...'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m remaining`
  if (m > 0) return `${m}m ${s}s remaining`
  return `${s}s remaining`
}

function countdownColor(seconds: number) {
  if (seconds <= 30) return 'text-red-500 dark:text-red-400'
  if (seconds <= 120) return 'text-amber-500 dark:text-amber-400'
  return 'text-green-600 dark:text-green-400'
}

const rows = computed(() => [
  { label: 'Weight',        value: `${props.shipment.weight} kg`, icon: '⚖️' },
  { label: 'Created',       value: formatDate(props.shipment.createdAt), icon: '📅' },
  { label: 'Origin',        value: props.shipment.origin, icon: '📍' },
  { label: 'Destination',   value: props.shipment.destination, icon: '🏁' },
  { label: 'Description',   value: props.shipment.description, icon: '📦' },
])
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm p-6">
    <h3 class="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Shipment Details</h3>

    <!-- Est. Delivery prominence -->
    <div class="mb-5 p-4 rounded bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
      <p class="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-1">Estimated Delivery</p>
      <div v-if="countdown !== undefined">
        <div class="flex items-center gap-2">
          <Clock class="w-4 h-4 shrink-0" :class="countdownColor(countdown)" />
          <span class="font-bold text-base tabular-nums" :class="countdownColor(countdown)">
            {{ formatCountdown(countdown) }}
          </span>
        </div>
        <p class="text-zinc-400 dark:text-zinc-500 text-xs font-medium mt-0.5">{{ formatDate(shipment.estimatedDelivery) }}</p>
      </div>
      <p v-else class="text-zinc-900 dark:text-white font-bold text-base">
        {{ formatDate(shipment.estimatedDelivery) }}
      </p>
    </div>

    <!-- Detail rows -->
    <div class="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
      <div
        v-for="row in rows"
        :key="row.label"
        class="flex items-start justify-between gap-4 py-2.5"
      >
        <span class="text-zinc-500 dark:text-zinc-400 text-sm font-medium shrink-0">{{ row.label }}</span>
        <span class="text-zinc-900 dark:text-white font-semibold text-sm text-right">{{ row.value }}</span>
      </div>
    </div>
  </div>
</template>
