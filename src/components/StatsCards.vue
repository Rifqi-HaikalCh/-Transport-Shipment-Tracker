<script setup lang="ts">
import { useShipmentStore } from '@/stores/shipment'

const store = useShipmentStore()

const stats = [
  { key: 'All', label: 'Total', icon: '📦', gradient: 'from-slate-600 to-slate-500' },
  { key: 'Pending', label: 'Pending', icon: '⏳', gradient: 'from-amber-600 to-amber-500' },
  { key: 'In Transit', label: 'In Transit', icon: '🚛', gradient: 'from-blue-600 to-blue-500' },
  { key: 'Delivered', label: 'Delivered', icon: '✅', gradient: 'from-green-600 to-green-500' },
  { key: 'Cancelled', label: 'Cancelled', icon: '❌', gradient: 'from-red-600 to-red-500' },
] as const
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
    <div
      v-for="stat in stats"
      :key="stat.key"
      class="glass-card !p-4 hover:border-white/20 transition-all duration-300 cursor-default group"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-2xl">{{ stat.icon }}</span>
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold"
          :class="stat.gradient"
        >
          {{ store.statusCounts[stat.key] }}
        </div>
      </div>
      <p class="text-xs text-surface-400 font-medium uppercase tracking-wider">{{ stat.label }}</p>
    </div>
  </div>
</template>
