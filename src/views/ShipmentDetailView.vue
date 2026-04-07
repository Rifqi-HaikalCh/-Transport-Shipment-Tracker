<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShipmentStore } from '@/stores/shipment'
import { useToast } from 'vue-toastification'
import AssignTransporterModal from '@/components/AssignTransporterModal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import ShipmentProgressTracker from '@/components/detail/ShipmentProgressTracker.vue'
import ShipmentActivityTimeline from '@/components/detail/ShipmentActivityTimeline.vue'
import TransporterCard from '@/components/detail/TransporterCard.vue'
import { AlertTriangle, Clock, CalendarDays, Package, MapPin, Flag, CheckCircle, Timer, TrendingDown } from 'lucide-vue-next'
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
    return
  }
  await store.fetchTransporters()
  store.startRealtimeSimulation()
  store.startSupabaseRealtime()
})

// Deep watch on store shipments to detect real-time status changes (e.g. In Transit → Delivered)
watch(
  () => store.shipments.find((s) => s.id === shipmentId),
  (updated) => {
    if (updated && shipment.value) {
      shipment.value = { ...updated }
    }
  },
  { deep: true },
)

const countdown = computed(() => store.shipmentCountdowns[shipmentId])
const deliveryResult = computed(() => store.deliveryResults[shipmentId])
const isUntrackable = computed(() =>
  shipment.value?.status === 'Pending' && !shipment.value?.transporterId,
)
const isDelivered = computed(() => shipment.value?.status === 'Delivered')

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Arriving soon...'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m remaining`
  if (m > 0) return `${m}m ${s}s remaining`
  return `${s}s remaining`
}

function countdownColor(seconds: number) {
  if (seconds <= 30) return 'text-red-500 dark:text-red-400'
  if (seconds <= 120) return 'text-amber-500 dark:text-amber-400'
  return 'text-green-600 dark:text-green-400'
}

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

    <div v-if="store.isLoading && !shipment" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
    </div>

    <div v-if="shipment" class="space-y-5">

      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm p-6">

        <div class="flex flex-col lg:flex-row lg:items-start gap-4 mb-5">
          <div class="flex-1 min-w-0">
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
            <p class="text-zinc-500 dark:text-zinc-400 font-medium text-sm">{{ shipment.description }}</p>
          </div>

          <button
            v-if="shipment.status === 'Pending'"
            id="btn-assign-transporter"
            @click="openAssignModal"
            class="shrink-0 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded shadow-sm transition-colors active:scale-95 flex items-center gap-2"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
            </svg>
            Assign Transporter
          </button>
        </div>

        <div class="border-t border-zinc-100 dark:border-zinc-800 mb-5"></div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin class="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div>
              <p class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Origin</p>
              <p class="text-zinc-900 dark:text-white font-bold text-sm">{{ shipment.origin }}</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
              <Flag class="w-4 h-4 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <p class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Destination</p>
              <p class="text-zinc-900 dark:text-white font-bold text-sm">{{ shipment.destination }}</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
              <Package class="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div>
              <p class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Weight</p>
              <p class="text-zinc-900 dark:text-white font-bold text-sm">{{ shipment.weight }} <span class="font-normal text-zinc-500">kg</span></p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5"
              :class="countdown !== undefined ? 'bg-orange-50 dark:bg-orange-500/10' : 'bg-zinc-100 dark:bg-zinc-800'"
            >
              <Clock
                class="w-4 h-4"
                :class="countdown !== undefined ? countdownColor(countdown) : 'text-zinc-500 dark:text-zinc-400'"
              />
            </div>
            <div>
              <p class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Est. Delivery</p>
              <template v-if="countdown !== undefined">
                <p class="font-bold text-sm tabular-nums" :class="countdownColor(countdown)">
                  {{ formatCountdown(countdown) }}
                </p>
                <p class="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">{{ formatDate(shipment.estimatedDelivery) }}</p>
              </template>
              <p v-else class="text-zinc-900 dark:text-white font-bold text-sm">
                {{ formatDate(shipment.estimatedDelivery) }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <CalendarDays class="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span class="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Created: {{ formatDate(shipment.createdAt) }}</span>
        </div>
      </div>
      <div v-if="isDelivered && deliveryResult" class="border rounded shadow-sm p-4 flex items-center gap-4" :class="[
        deliveryResult.type === 'early' ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' :
        deliveryResult.type === 'late' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' :
        'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
      ]">
        <div class="shrink-0 bg-white dark:bg-zinc-800 p-2 rounded-full shadow-sm">
          <CheckCircle v-if="deliveryResult.type === 'early'" class="w-6 h-6 text-green-500" />
          <TrendingDown v-else-if="deliveryResult.type === 'late'" class="w-6 h-6 text-red-500" />
          <Timer v-else class="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <p class="text-sm font-bold" :class="[
            deliveryResult.type === 'early' ? 'text-green-700 dark:text-green-400' :
            deliveryResult.type === 'late' ? 'text-red-700 dark:text-red-400' :
            'text-blue-700 dark:text-blue-400'
          ]">
            {{ deliveryResult.type === 'early' ? 'Delivered Early' : deliveryResult.type === 'late' ? 'Delivered Late' : 'Delivered On Time' }}
          </p>
          <p class="text-xs font-medium" :class="[
            deliveryResult.type === 'early' ? 'text-green-600 dark:text-green-500' :
            deliveryResult.type === 'late' ? 'text-red-600 dark:text-red-500' :
            'text-blue-600 dark:text-blue-500'
          ]">
            Package arrived <span v-if="deliveryResult.type !== 'on_time'">{{ deliveryResult.diffMinutes }} minutes {{ deliveryResult.type === 'early' ? 'before' : 'after' }} the estimated time.</span><span v-else>exactly on the estimated time.</span>
          </p>
        </div>
      </div>

      <ShipmentProgressTracker :shipment="shipment" :countdown="countdown" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="lg:col-span-2">
          <ShipmentActivityTimeline :shipment="shipment" />
        </div>
        <div>
          <TransporterCard :shipment="shipment" @assign="openAssignModal" />
        </div>
      </div>
    </div>

    <AssignTransporterModal
      v-if="showAssignModal"
      :transporters="store.availableTransporters"
      :is-loading="store.isLoading"
      @assign="handleAssign"
      @close="closeModal"
    />
  </div>
</template>
