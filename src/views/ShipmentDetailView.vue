<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShipmentStore } from '@/stores/shipment'
import { useToast } from 'vue-toastification'
import AssignTransporterModal from '@/components/AssignTransporterModal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import type { Shipment } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useShipmentStore()
const toast = useToast()

const shipment = ref<Shipment | null>(null)
const showAssignModal = ref(false)

const shipmentId = route.params.id as string

onMounted(async () => {
  const data = await store.fetchShipmentById(shipmentId)
  if (data) {
    shipment.value = data
  } else {
    toast.error('Shipment not found')
    router.push('/')
  }
  await store.fetchTransporters()
})

function openAssignModal() {
  showAssignModal.value = true
}

function closeModal() {
  showAssignModal.value = false
}

async function handleAssign(transporterId: string) {
  const result = await store.assignTransporter(shipmentId, transporterId)
  if (result.success && result.shipment) {
    shipment.value = result.shipment
    toast.success('Transporter assigned successfully!')
    showAssignModal.value = false
  } else {
    toast.error(result.error || 'Failed to assign transporter')
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div>
    <!-- Back Button -->
    <button
      id="btn-back"
      @click="goBack"
      class="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6 group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 group-hover:-translate-x-1 transition-transform"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      <span class="text-sm font-bold">Back to Shipments</span>
    </button>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
    </div>

    <!-- Untrackable Warning Banner -->
    <div
      v-if="shipment && shipment.status === 'Pending' && !shipment.transporterId"
      class="mb-5 flex items-start gap-3 px-5 py-4 rounded border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <path d="M12 9v4"/><path d="M12 17h.01"/>
      </svg>
      <div class="flex-1">
        <p class="text-red-700 dark:text-red-400 font-bold text-sm">This shipment cannot be tracked</p>
        <p class="text-red-600 dark:text-red-400/80 text-xs mt-0.5 font-medium">
          No transporter has been assigned. The system cannot track or update the status of this shipment until a transporter is registered.
        </p>
      </div>
      <button
        v-if="shipment.status === 'Pending'"
        @click="openAssignModal"
        class="shrink-0 px-3 py-1.5 rounded text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
      >
        Assign Now
      </button>
    </div>

    <!-- Shipment Detail -->
    <div v-if="shipment" class="space-y-6">
      <!-- Header Card -->
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm p-6">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">{{ shipment.trackingNumber }}</h2>
              <StatusBadge :status="shipment.status" />
            </div>
            <p class="text-zinc-500 dark:text-zinc-400 font-medium">{{ shipment.description }}</p>
          </div>

          <!-- Assign Button -->
          <button
            v-if="shipment.status === 'Pending'"
            id="btn-assign-transporter"
            @click="openAssignModal"
            class="shrink-0 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded shadow-sm transition-all duration-300 active:scale-95"
          >
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
              Assign Transporter
            </div>
          </button>
        </div>
      </div>

      <!-- Detail Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Route Info -->
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm p-6">
          <h3 class="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-5">Route Information</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="10" r="3" />
                  <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Origin</p>
                <p class="text-zinc-900 dark:text-white font-bold">{{ shipment.origin }}</p>
              </div>
            </div>

            <!-- Path line -->
            <div class="flex items-center pl-5">
              <div class="w-0.5 h-6 bg-zinc-200 dark:bg-zinc-700"></div>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <path d="m9 10 2 2 4-4" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Destination</p>
                <p class="text-zinc-900 dark:text-white font-bold">{{ shipment.destination }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Shipment Info -->
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm p-6">
          <h3 class="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Shipment Details</h3>
          <div class="space-y-4 pt-1">
            <div class="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
              <span class="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Weight</span>
              <span class="text-zinc-900 dark:text-white font-bold">{{ shipment.weight }} kg</span>
            </div>
            <div class="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
              <span class="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Created</span>
              <span class="text-zinc-900 dark:text-white font-bold">{{ formatDate(shipment.createdAt) }}</span>
            </div>
            <div class="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
              <span class="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Est. Delivery</span>
              <span class="text-zinc-900 dark:text-white font-bold">{{ formatDate(shipment.estimatedDelivery) }}</span>
            </div>
          </div>
        </div>

        <!-- Transporter Info -->
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm p-6 md:col-span-2">
          <h3 class="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Assigned Transporter</h3>
          <div v-if="shipment.transporterName" class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="w-12 h-12 rounded bg-orange-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {{ shipment.transporterName.charAt(0) }}
            </div>
            <div class="flex-1">
              <p class="text-zinc-900 dark:text-white font-bold text-lg">{{ shipment.transporterName }}</p>
              <p class="text-zinc-500 dark:text-zinc-400 text-sm font-medium">ID: {{ shipment.transporterId }}</p>
            </div>
            <!-- Vehicle Info -->
            <div v-if="shipment.vehicleType" class="flex items-center gap-3 sm:text-right">
              <div class="sm:hidden w-px h-8 bg-zinc-200 dark:bg-zinc-700"></div>
              <div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Vehicle Type</p>
                <p class="text-zinc-900 dark:text-white font-bold">{{ shipment.vehicleType }}</p>
                <p class="text-zinc-500 dark:text-zinc-400 text-xs font-medium mt-0.5" v-if="shipment.vehiclePlate">
                  {{ shipment.vehiclePlate }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center gap-4 py-2">
            <div class="w-12 h-12 rounded border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="17" x2="22" y1="11" y2="11" />
              </svg>
            </div>
            <div>
              <p class="text-zinc-600 dark:text-zinc-300 font-bold mb-0.5">No transporter assigned</p>
              <p class="text-zinc-500 dark:text-zinc-400 text-sm">Click "Assign Transporter" to assign one.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Transporter Modal -->
    <AssignTransporterModal
      v-if="showAssignModal"
      :transporters="store.availableTransporters"
      :is-loading="store.isLoading"
      @assign="handleAssign"
      @close="closeModal"
    />
  </div>
</template>
