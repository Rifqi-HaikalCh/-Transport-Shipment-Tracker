<script setup lang="ts">
import { useShipmentStore } from '@/stores/shipment'
import type { ShipmentStatus } from '@/types'

const store = useShipmentStore()

const statuses: Array<ShipmentStatus | 'All'> = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled']

function isActive(status: ShipmentStatus | 'All') {
  return store.filterStatus === status
}
</script>

<template>
  <div class="flex flex-wrap gap-2 flex-1">
    <button
      v-for="status in statuses"
      :key="status"
      :id="`filter-${status.toLowerCase().replace(' ', '-')}`"
      @click="store.setFilterStatus(status)"
      class="px-4 py-2 rounded text-sm font-medium transition-all duration-200 border"
      :class="
        isActive(status)
          ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-500 shadow-sm'
      "
    >
      {{ status }}
      <span
        class="ml-1.5 text-xs"
        :class="isActive(status) ? 'text-orange-200' : 'text-zinc-400 dark:text-zinc-500'"
      >
        {{ store.statusCounts[status] }}
      </span>
    </button>
  </div>
</template>
