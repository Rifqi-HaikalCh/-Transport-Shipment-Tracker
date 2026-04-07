<script setup lang="ts">
import { useShipmentStore } from '@/stores/shipment'
import { Package, Clock, Truck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-vue-next'

const store = useShipmentStore()

const stats = [
  { key: 'All', label: 'Total', icon: Package, color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
  { key: 'Pending', label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  { key: 'In Transit', label: 'In Transit', icon: Truck, color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle2, color: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' },
  { key: 'Cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
] as const
</script>

<template>
  <div class="space-y-4 mb-8">
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.key"
        class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 cursor-default"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 rounded border border-transparent" :class="stat.color">
            <component :is="stat.icon" class="w-5 h-5" />
          </div>
          <div class="text-2xl font-bold text-zinc-900 dark:text-white">
            {{ store.statusCounts[stat.key] }}
          </div>
        </div>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">{{ stat.label }}</p>
      </div>
    </div>

    <div
      v-if="store.unassignedCount > 0"
      class="flex items-center gap-3 px-5 py-3.5 rounded border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10"
    >
      <div class="p-1.5 rounded bg-red-100 dark:bg-red-500/20">
        <AlertTriangle class="w-4 h-4 text-red-600 dark:text-red-400" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-bold text-red-700 dark:text-red-400">
          {{ store.unassignedCount }} shipment{{ store.unassignedCount > 1 ? 's' : '' }} cannot be tracked
        </p>
        <p class="text-xs text-red-600/80 dark:text-red-400/70 font-medium">
          These shipments have no assigned transporter. Assign one to enable tracking.
        </p>
      </div>
    </div>
  </div>
</template>
