<script setup lang="ts">
import type { ShipmentStatus } from '@/types'

const props = defineProps<{
  status: ShipmentStatus
}>()

const statusConfig: Record<ShipmentStatus, { bg: string; text: string; dot: string }> = {
  Pending: {
    bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  'In Transit': {
    bg: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
    text: 'text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500 dark:bg-orange-400 animate-pulse',
  },
  Delivered: {
    bg: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500 dark:bg-green-400',
  },
  Cancelled: {
    bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500 dark:bg-red-400',
  },
}

const config = statusConfig[props.status]
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold border shadow-sm"
    :class="[config.bg, config.text]"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="config.dot"></span>
    {{ status }}
  </span>
</template>
