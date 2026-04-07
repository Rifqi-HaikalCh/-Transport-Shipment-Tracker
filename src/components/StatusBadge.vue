<script setup lang="ts">
import type { ShipmentStatus } from '@/types'

const props = defineProps<{
  status: ShipmentStatus
}>()

const statusConfig: Record<ShipmentStatus, { bg: string; text: string; dot: string }> = {
  Pending: {
    bg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  'In Transit': {
    bg: 'bg-blue-500/10 border-blue-500/20',
    text: 'text-blue-400',
    dot: 'bg-blue-400 animate-pulse',
  },
  Delivered: {
    bg: 'bg-green-500/10 border-green-500/20',
    text: 'text-green-400',
    dot: 'bg-green-400',
  },
  Cancelled: {
    bg: 'bg-red-500/10 border-red-500/20',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
}

const config = statusConfig[props.status]
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
    :class="[config.bg, config.text]"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="config.dot"></span>
    {{ status }}
  </span>
</template>
