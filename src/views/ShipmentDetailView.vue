<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShipmentStore } from '@/stores/shipment'
import { useToast } from 'vue-toastification'
import AssignTransporterModal from '@/components/AssignTransporterModal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import ShipmentProgressTracker from '@/components/detail/ShipmentProgressTracker.vue'
import ShipmentActivityTimeline from '@/components/detail/ShipmentActivityTimeline.vue'
import ShipmentInfoCard from '@/components/detail/ShipmentInfoCard.vue'
import TransporterCard from '@/components/detail/TransporterCard.vue'
import { AlertTriangle } from 'lucide-vue-next'
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

// Sync with realtime simulation updates from store
watch(
  () => store.shipments.find((s) => s.id === shipmentId),
  (updated) => {
    if (updated && shipment.value) {
      shipment.value = { ...shipment.value, ...updated }
    }
  },
)

const countdown = computed(() => store.shipmentCountdowns[shipmentId])
const isUntrackable = computed(() =>
  shipment.value?.status === 'Pending' && !shipment.value?.transporterId,
)

function openAssignModal() { showAssignModal.value = true }
function closeModal() { showAssignModal.value = false }

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

function goBack() { router.push('/') }
</script>

<template>
  <div>
    <!-- Back -->
    <button
      id="btn-back"
      @click="goBack"
      class="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6 group"
    >
      <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
      </svg>
      <span class="text-sm font-bold">Back to Shipments</span>
    </button>

    <!-- Loading -->
    <div v-if="store.isLoading && !shipment" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
    </div>

    <div v-if="shipment" class="space-y-5">

      <!-- ── HEADER CARD ─────────────────────────────────── -->
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm p-6">
        <div class="flex flex-col lg:flex-row lg:items-start gap-5">

          <!-- Left: Tracking + Status -->
          <div class="flex-1 min-w-0">
            <!-- Untrackable warning inline badge -->
            <div v-if="isUntrackable" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 mb-3">
              <AlertTriangle class="w-3.5 h-3.5 text-red-500" />
              <span class="text-xs font-bold text-red-600 dark:text-red-400">Untrackable — No transporter assigned</span>
            </div>

            <div class="flex flex-wrap items-center gap-3 mb-1.5">
              <h2 class="text-2xl font-bold text-zinc-900 dark:text-white font-mono tracking-tight">
                {{ shipment.trackingNumber }}
              </h2>
              <StatusBadge :status="shipment.status" />
            </div>
            <p class="text-zinc-500 dark:text-zinc-400 font-medium">{{ shipment.description }}</p>

            <!-- Route inline -->
            <div class="flex items-center gap-2 mt-3 text-sm font-semibold">
              <span class="text-zinc-700 dark:text-zinc-300">{{ shipment.origin }}</span>
              <svg class="w-4 h-4 text-orange-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
              <span class="text-zinc-700 dark:text-zinc-300">{{ shipment.destination }}</span>
              <span class="text-zinc-300 dark:text-zinc-700 mx-1">·</span>
              <span class="text-zinc-500 dark:text-zinc-400 font-normal">{{ shipment.weight }} kg</span>
            </div>
          </div>

          <!-- Right: CTA -->
          <div class="flex items-start gap-3 shrink-0">
            <button
              v-if="shipment.status === 'Pending'"
              id="btn-assign-transporter"
              @click="openAssignModal"
              class="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded shadow-sm transition-colors active:scale-95 flex items-center gap-2"
            >
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
              </svg>
              Assign Transporter
            </button>
          </div>
        </div>
      </div>

      <!-- ── PROGRESS TRACKER ────────────────────────────── -->
      <ShipmentProgressTracker :shipment="shipment" :countdown="countdown" />

      <!-- ── MAIN GRID: Timeline (left) + Cards (right) ─── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <!-- Activity Timeline — takes 2 cols -->
        <div class="lg:col-span-2">
          <ShipmentActivityTimeline :shipment="shipment" />
        </div>

        <!-- Right sidebar: Info + Transporter -->
        <div class="space-y-5">
          <ShipmentInfoCard :shipment="shipment" :countdown="countdown" />
          <TransporterCard :shipment="shipment" @assign="openAssignModal" />
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <AssignTransporterModal
      v-if="showAssignModal"
      :transporters="store.availableTransporters"
      :is-loading="store.isLoading"
      @assign="handleAssign"
      @close="closeModal"
    />
  </div>
</template>
