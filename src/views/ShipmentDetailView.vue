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
  if (result.success) {
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
      class="flex items-center gap-2 text-surface-400 hover:text-white transition-colors mb-6 group"
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
      <span class="text-sm font-medium">Back to Shipments</span>
    </button>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
    </div>

    <!-- Shipment Detail -->
    <div v-else-if="shipment" class="space-y-6">
      <!-- Header Card -->
      <div class="glass-card">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-2xl font-bold text-white">{{ shipment.trackingNumber }}</h2>
              <StatusBadge :status="shipment.status" />
            </div>
            <p class="text-surface-400">{{ shipment.description }}</p>
          </div>

          <!-- Assign Button -->
          <button
            v-if="shipment.status === 'Pending'"
            id="btn-assign-transporter"
            @click="openAssignModal"
            class="shrink-0 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 active:scale-95"
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
        <div class="glass-card">
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Route Information</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="10" r="3" />
                  <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-surface-500 font-medium">Origin</p>
                <p class="text-white font-semibold">{{ shipment.origin }}</p>
              </div>
            </div>

            <!-- Arrow -->
            <div class="flex items-center pl-5">
              <div class="w-0.5 h-6 bg-gradient-to-b from-blue-400 to-green-400"></div>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <path d="m9 10 2 2 4-4" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-surface-500 font-medium">Destination</p>
                <p class="text-white font-semibold">{{ shipment.destination }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Shipment Info -->
        <div class="glass-card">
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Shipment Details</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-surface-400 text-sm">Weight</span>
              <span class="text-white font-semibold">{{ shipment.weight }} kg</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-surface-400 text-sm">Created</span>
              <span class="text-white font-semibold">{{ formatDate(shipment.createdAt) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-surface-400 text-sm">Est. Delivery</span>
              <span class="text-white font-semibold">{{ formatDate(shipment.estimatedDelivery) }}</span>
            </div>
          </div>
        </div>

        <!-- Transporter Info -->
        <div class="glass-card md:col-span-2">
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Assigned Transporter</h3>
          <div v-if="shipment.transporterName" class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
              {{ shipment.transporterName.charAt(0) }}
            </div>
            <div>
              <p class="text-white font-semibold text-lg">{{ shipment.transporterName }}</p>
              <p class="text-surface-400 text-sm">ID: {{ shipment.transporterId }}</p>
            </div>
          </div>
          <div v-else class="flex items-center gap-3 py-4">
            <div class="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="17" x2="22" y1="11" y2="11" />
              </svg>
            </div>
            <div>
              <p class="text-surface-300 font-medium">No transporter assigned</p>
              <p class="text-surface-500 text-sm">Click "Assign Transporter" to assign one.</p>
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
