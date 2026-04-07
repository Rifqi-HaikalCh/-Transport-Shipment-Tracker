<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useShipmentStore } from '@/stores/shipment'
import StatusBadge from '@/components/StatusBadge.vue'
import { AlertTriangle, Clock } from 'lucide-vue-next'

const router = useRouter()
const store = useShipmentStore()

function viewDetail(id: string) {
  router.push(`/shipments/${id}`)
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Arriving soon...'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function countdownColor(seconds: number): string {
  if (seconds <= 30) return 'text-red-500 dark:text-red-400'
  if (seconds <= 120) return 'text-amber-500 dark:text-amber-400'
  return 'text-green-600 dark:text-green-400'
}

function isUntrackable(s: { status: string; transporterId: string | null }) {
  return s.status === 'Pending' && !s.transporterId
}
</script>

<template>
  <!-- Loading -->
  <div v-if="store.isLoading" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm">
    <div class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
        <p class="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Loading shipments...</p>
      </div>
    </div>
  </div>

  <!-- Empty -->
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

    <!-- Desktop -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-left border-collapse" id="shipment-table">
        <thead>
          <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <th class="px-4 py-3.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-10">No.</th>
            <th class="px-4 py-3.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tracking No.</th>
            <th class="px-4 py-3.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Description</th>
            <th class="px-4 py-3.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Weight</th>
            <th class="px-4 py-3.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Origin</th>
            <th class="px-4 py-3.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Destination</th>
            <th class="px-4 py-3.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
            <th class="px-4 py-3.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Transporter</th>
            <th class="px-4 py-3.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Est. Delivery</th>
            <th class="px-4 py-3.5 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
          <tr
            v-for="(shipment, index) in store.filteredShipments"
            :key="shipment.id"
            class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer group"
            :class="isUntrackable(shipment) ? 'border-l-2 border-l-red-400 dark:border-l-red-500' : ''"
            @click="viewDetail(shipment.id)"
          >
            <!-- No. -->
            <td class="px-4 py-3.5">
              <span class="text-xs text-zinc-400 dark:text-zinc-600 font-bold">{{ index + 1 }}</span>
            </td>

            <!-- Tracking No. -->
            <td class="px-4 py-3.5">
              <p class="text-zinc-900 dark:text-zinc-100 font-semibold text-xs font-mono whitespace-nowrap">{{ shipment.trackingNumber }}</p>
              <p v-if="isUntrackable(shipment)" class="flex items-center gap-1 text-red-500 dark:text-red-400 text-xs font-semibold mt-0.5">
                <AlertTriangle class="w-3 h-3" /> Untrackable
              </p>
            </td>

            <!-- Description -->
            <td class="px-4 py-3.5 max-w-[180px]">
              <p class="text-zinc-600 dark:text-zinc-400 text-xs truncate" :title="shipment.description">{{ shipment.description }}</p>
            </td>

            <!-- Weight -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span class="text-zinc-700 dark:text-zinc-300 text-sm font-semibold">{{ shipment.weight }}</span>
              <span class="text-zinc-400 dark:text-zinc-500 text-xs ml-0.5">kg</span>
            </td>

            <!-- Origin -->
            <td class="px-4 py-3.5">
              <span class="text-zinc-700 dark:text-zinc-300 text-sm font-medium whitespace-nowrap">{{ shipment.origin }}</span>
            </td>

            <!-- Destination -->
            <td class="px-4 py-3.5">
              <span class="text-zinc-700 dark:text-zinc-300 text-sm font-medium whitespace-nowrap">{{ shipment.destination }}</span>
            </td>

            <!-- Status -->
            <td class="px-4 py-3.5">
              <StatusBadge :status="shipment.status" />
            </td>

            <!-- Transporter -->
            <td class="px-4 py-3.5">
              <span v-if="shipment.transporterName" class="text-zinc-700 dark:text-zinc-300 text-xs font-medium">{{ shipment.transporterName }}</span>
              <span v-else class="inline-flex items-center gap-1 text-red-500 dark:text-red-400 text-xs font-semibold">
                <AlertTriangle class="w-3 h-3" />Not Assigned
              </span>
            </td>

            <!-- Est. Delivery -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <template v-if="store.shipmentCountdowns[shipment.id] !== undefined">
                <div class="flex items-center gap-1">
                  <Clock class="w-3 h-3 shrink-0" :class="countdownColor(store.shipmentCountdowns[shipment.id] ?? 0)" />
                  <span class="text-xs font-bold tabular-nums" :class="countdownColor(store.shipmentCountdowns[shipment.id] ?? 0)">
                    {{ formatCountdown(store.shipmentCountdowns[shipment.id] ?? 0) }}
                  </span>
                </div>
                <p class="text-zinc-400 dark:text-zinc-500 text-[10px] mt-0.5">{{ formatDate(shipment.estimatedDelivery) }}</p>
              </template>
              <template v-else>
                <span class="text-zinc-600 dark:text-zinc-400 text-xs font-medium">{{ formatDate(shipment.estimatedDelivery) }}</span>
              </template>
            </td>

            <!-- Action -->
            <td class="px-4 py-3.5 text-right">
              <button class="text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                View →
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
      <div
        v-for="(shipment, index) in store.filteredShipments"
        :key="shipment.id"
        class="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        :class="isUntrackable(shipment) ? 'border-l-2 border-l-red-400 dark:border-l-red-500' : ''"
        @click="viewDetail(shipment.id)"
      >
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <span class="text-xs text-zinc-400 font-bold">#{{ index + 1 }}</span>
            <p class="text-zinc-900 dark:text-zinc-100 font-bold text-sm font-mono">{{ shipment.trackingNumber }}</p>
          </div>
          <StatusBadge :status="shipment.status" />
        </div>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-2">{{ shipment.description }}</p>
        <div class="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-medium mb-2">
          <span>{{ shipment.origin }}</span>
          <span class="text-zinc-400">→</span>
          <span>{{ shipment.destination }}</span>
          <span class="text-zinc-300 dark:text-zinc-700">·</span>
          <span class="text-zinc-500 dark:text-zinc-400">{{ shipment.weight }} kg</span>
        </div>
        <div class="flex items-center justify-between text-xs font-medium">
          <span v-if="shipment.transporterName" class="text-zinc-600 dark:text-zinc-300">{{ shipment.transporterName }}</span>
          <span v-else class="flex items-center gap-1 text-red-500 dark:text-red-400 font-semibold">
            <AlertTriangle class="w-3 h-3" /> Not Assigned
          </span>
          <span class="text-zinc-500 dark:text-zinc-400">{{ formatDate(shipment.estimatedDelivery) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
