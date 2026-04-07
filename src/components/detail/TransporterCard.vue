<script setup lang="ts">
import type { Shipment } from '@/types'

defineProps<{
  shipment: Shipment
  onAssign?: () => void
}>()

defineEmits<{ assign: [] }>()

function renderStars(rating: number | null): string {
  if (!rating) return '—'
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
}
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm p-6">
    <h3 class="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Assigned Transporter</h3>

    <!-- Assigned -->
    <div v-if="shipment.transporterName" class="space-y-4">
      <!-- Avatar + name -->
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-md">
          {{ shipment.transporterName.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-zinc-900 dark:text-white font-bold text-base truncate">{{ shipment.transporterName }}</p>
          <p class="text-zinc-500 dark:text-zinc-400 text-xs font-medium">ID: {{ shipment.transporterId }}</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-zinc-100 dark:border-zinc-800"></div>

      <!-- Vehicle details grid -->
      <div class="grid grid-cols-2 gap-4">
        <div v-if="shipment.vehicleType">
          <p class="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-1">Vehicle Type</p>
          <p class="text-zinc-900 dark:text-white font-bold text-sm">{{ shipment.vehicleType }}</p>
        </div>
        <div v-if="shipment.vehiclePlate">
          <p class="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-1">Plate No.</p>
          <p class="text-zinc-900 dark:text-white font-bold text-sm font-mono">{{ shipment.vehiclePlate }}</p>
        </div>
      </div>
    </div>

    <!-- Not assigned -->
    <div v-else>
      <div class="flex flex-col items-center justify-center py-6 text-center">
        <div class="w-14 h-14 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center mb-3">
          <svg class="w-6 h-6 text-zinc-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" />
          </svg>
        </div>
        <p class="text-zinc-700 dark:text-zinc-300 font-bold text-sm mb-1">No transporter assigned</p>
        <p class="text-zinc-400 dark:text-zinc-500 text-xs mb-4">Assign a transporter to start shipment tracking</p>
        <button
          v-if="shipment.status === 'Pending'"
          id="btn-assign-transporter-card"
          @click="$emit('assign')"
          class="w-full px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded transition-colors active:scale-95"
        >
          Assign Transporter
        </button>
      </div>
    </div>
  </div>
</template>
