<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useShipmentStore } from '@/stores/shipment'
import StatusBadge from '@/components/StatusBadge.vue'

const router = useRouter()
const store = useShipmentStore()

function viewDetail(id: string) {
  router.push(`/shipments/${id}`)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="store.isLoading" class="glass-card">
    <div class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        <p class="text-surface-400 text-sm">Loading shipments...</p>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else-if="store.filteredShipments.length === 0" class="glass-card">
    <div class="flex flex-col items-center justify-center py-16">
      <div class="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 7h-9" /><path d="M14 17H5" />
          <circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
        </svg>
      </div>
      <p class="text-surface-300 font-medium mb-1">No shipments found</p>
      <p class="text-surface-500 text-sm">Try adjusting your filters or search query.</p>
    </div>
  </div>

  <!-- Table -->
  <div v-else class="glass rounded-2xl overflow-hidden">
    <!-- Desktop Table -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full" id="shipment-table">
        <thead>
          <tr class="border-b border-white/10">
            <th class="px-6 py-4 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Tracking No.</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Route</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Status</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Transporter</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Est. Delivery</th>
            <th class="px-6 py-4 text-right text-xs font-semibold text-surface-400 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="shipment in store.filteredShipments"
            :key="shipment.id"
            class="border-b border-white/5 hover:bg-white/5 transition-colors duration-150 cursor-pointer group"
            @click="viewDetail(shipment.id)"
          >
            <td class="px-6 py-4">
              <p class="text-white font-semibold text-sm">{{ shipment.trackingNumber }}</p>
              <p class="text-surface-500 text-xs mt-0.5">{{ shipment.weight }} kg</p>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2 text-sm">
                <span class="text-surface-300">{{ shipment.origin }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-surface-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
                <span class="text-surface-300">{{ shipment.destination }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <StatusBadge :status="shipment.status" />
            </td>
            <td class="px-6 py-4">
              <span v-if="shipment.transporterName" class="text-surface-300 text-sm">{{ shipment.transporterName }}</span>
              <span v-else class="text-surface-600 text-sm italic">Unassigned</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-surface-300 text-sm">{{ formatDate(shipment.estimatedDelivery) }}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <button
                class="text-primary-400 hover:text-primary-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View →
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden divide-y divide-white/5">
      <div
        v-for="shipment in store.filteredShipments"
        :key="shipment.id"
        class="p-4 hover:bg-white/5 transition-colors active:bg-white/10 cursor-pointer"
        @click="viewDetail(shipment.id)"
      >
        <div class="flex items-center justify-between mb-2">
          <p class="text-white font-semibold text-sm">{{ shipment.trackingNumber }}</p>
          <StatusBadge :status="shipment.status" />
        </div>
        <div class="flex items-center gap-2 text-xs text-surface-400 mb-2">
          <span>{{ shipment.origin }}</span>
          <span>→</span>
          <span>{{ shipment.destination }}</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-surface-500">
            {{ shipment.transporterName || 'Unassigned' }}
          </span>
          <span class="text-surface-500">{{ formatDate(shipment.estimatedDelivery) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
