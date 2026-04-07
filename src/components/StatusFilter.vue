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
      class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
      :class="
        isActive(status)
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
          : 'bg-white/5 text-surface-400 hover:bg-white/10 hover:text-white border border-white/5'
      "
    >
      {{ status }}
      <span
        class="ml-1.5 text-xs"
        :class="isActive(status) ? 'text-primary-200' : 'text-surface-500'"
      >
        {{ store.statusCounts[status] }}
      </span>
    </button>
  </div>
</template>
