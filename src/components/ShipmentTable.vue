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
  <div v-if="store.isLoading" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm">
    <div class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
        <p class="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Loading shipments...</p>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else-if="store.filteredShipments.length === 0" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm">
    <div class="flex flex-col items-center justify-center py-16">
      <div class="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 7h-9" /><path d="M14 17H5" />
          <circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
        </svg>
      </div>
      <p class="text-zinc-900 dark:text-white font-semibold mb-1">No shipments found</p>
      <p class="text-zinc-500 dark:text-zinc-400 text-sm">Try adjusting your filters or search query.</p>
    </div>
  </div>

  <!-- Table -->
  <div v-else class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm overflow-hidden">
    <!-- Desktop Table -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-left border-collapse" id="shipment-table">
        <thead>
          <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tracking No.</th>
            <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Route</th>
            <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
            <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Transporter</th>
            <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Est. Delivery</th>
            <th class="px-6 py-4 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
          <tr
            v-for="shipment in store.filteredShipments"
            :key="shipment.id"
            class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer group"
            @click="viewDetail(shipment.id)"
          >
            <td class="px-6 py-4">
              <p class="text-zinc-900 dark:text-zinc-100 font-semibold text-sm">{{ shipment.trackingNumber }}</p>
              <p class="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5 font-medium">{{ shipment.weight }} kg</p>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2 text-sm font-medium">
                <span class="text-zinc-600 dark:text-zinc-300">{{ shipment.origin }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
                <span class="text-zinc-600 dark:text-zinc-300">{{ shipment.destination }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <StatusBadge :status="shipment.status" />
            </td>
            <td class="px-6 py-4">
              <span v-if="shipment.transporterName" class="text-zinc-700 dark:text-zinc-300 text-sm font-medium">{{ shipment.transporterName }}</span>
              <span v-else class="text-zinc-400 dark:text-zinc-500 text-sm italic font-medium">Unassigned</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-zinc-600 dark:text-zinc-400 text-sm font-medium">{{ formatDate(shipment.estimatedDelivery) }}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <button
                class="text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View →
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
      <div
        v-for="shipment in store.filteredShipments"
        :key="shipment.id"
        class="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors active:bg-zinc-100 dark:active:bg-zinc-800 cursor-pointer"
        @click="viewDetail(shipment.id)"
      >
        <div class="flex items-center justify-between mb-3">
          <p class="text-zinc-900 dark:text-zinc-100 font-bold text-sm">{{ shipment.trackingNumber }}</p>
          <StatusBadge :status="shipment.status" />
        </div>
        <div class="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-3">
          <span>{{ shipment.origin }}</span>
          <span class="text-zinc-400 dark:text-zinc-500">→</span>
          <span>{{ shipment.destination }}</span>
        </div>
        <div class="flex items-center justify-between text-xs font-medium">
          <span :class="shipment.transporterName ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500 italic'">
            {{ shipment.transporterName || 'Unassigned' }}
          </span>
          <span class="text-zinc-500 dark:text-zinc-400">{{ formatDate(shipment.estimatedDelivery) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
