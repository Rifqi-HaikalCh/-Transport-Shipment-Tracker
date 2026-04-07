<script setup lang="ts">
import { computed } from 'vue'
import type { Shipment } from '@/types'

const props = defineProps<{ shipment: Shipment; countdown?: number }>()

type Stage = { id: number; key: string; label: string; sub: string }

const stages: Stage[] = [
  { id: 0, key: 'created',    label: 'Order Created',       sub: 'Shipment registered'     },
  { id: 1, key: 'assigned',   label: 'Transporter Assigned', sub: 'Ready to dispatch'       },
  { id: 2, key: 'in_transit', label: 'In Transit',           sub: 'On the way'              },
  { id: 3, key: 'delivered',  label: 'Delivered',            sub: 'Package received'        },
]

const activeIndex = computed(() => {
  if (props.shipment.status === 'Delivered') return 3
  if (props.shipment.status === 'In Transit') return 2
  if (props.shipment.status === 'Pending' && props.shipment.transporterId) return 1
  return 0
})

const isCancelled = computed(() => props.shipment.status === 'Cancelled')

function isCompleted(i: number) {
  return !isCancelled.value && i < activeIndex.value
}
function isActive(i: number) {
  return !isCancelled.value && i === activeIndex.value
}

const estimatedLabel = computed(() => {
  if (isCancelled.value) return 'Shipment Cancelled'
  if (props.shipment.status === 'Delivered') return 'Delivered successfully'
  if (props.countdown !== undefined && props.countdown > 0) {
    const h = Math.floor(props.countdown / 3600)
    const m = Math.floor((props.countdown % 3600) / 60)
    const s = props.countdown % 60
    if (h > 0) return `Estimated arrival in ${h}h ${m}m`
    if (m > 0) return `Estimated arrival in ${m}m ${s}s`
    return `Arriving soon...`
  }
  if (props.shipment.estimatedDelivery) {
    return `Est. delivery ${new Date(props.shipment.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  return 'Awaiting transporter assignment'
})

const headerColor = computed(() => {
  if (isCancelled.value) return 'text-zinc-500 dark:text-zinc-400'
  if (props.shipment.status === 'Delivered') return 'text-green-600 dark:text-green-400'
  if (props.shipment.status === 'In Transit') return 'text-orange-600 dark:text-orange-400'
  return 'text-zinc-700 dark:text-zinc-300'
})
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Delivery Progress</h3>
        <p class="font-bold text-base" :class="headerColor">{{ estimatedLabel }}</p>
      </div>
      <!-- Cancelled chip -->
      <span v-if="isCancelled" class="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
        Cancelled
      </span>
    </div>

    <!-- Stepper -->
    <div class="relative flex items-start">
      <!-- Progress track background -->
      <div class="absolute top-4 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-700 mx-[calc(12.5%)] z-0"></div>
      <!-- Progress fill -->
      <div
        class="absolute top-4 left-0 h-0.5 bg-orange-500 dark:bg-orange-400 mx-[calc(12.5%)] z-0 transition-all duration-700 ease-out"
        :class="isCancelled ? 'bg-zinc-400' : 'bg-orange-500'"
        :style="{ width: `calc(${(activeIndex / (stages.length - 1)) * 100}% - 0px )` }"
      ></div>

      <!-- Steps -->
      <div
        v-for="(stage, i) in stages"
        :key="stage.id"
        class="relative z-10 flex flex-col items-center"
        :style="{ width: `${100 / stages.length}%` }"
      >
        <!-- Circle -->
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 mb-2"
          :class="[
            isCompleted(i) ? 'bg-orange-500 border-orange-500 dark:bg-orange-400 dark:border-orange-400' :
            isActive(i)    ? 'bg-white dark:bg-zinc-900 border-orange-500 dark:border-orange-400' :
            isCancelled    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700' :
                             'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700'
          ]"
        >
          <!-- Check icon (completed) -->
          <svg v-if="isCompleted(i)" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <!-- Pulsing dot (active) -->
          <span v-else-if="isActive(i)" class="w-3 h-3 rounded-full bg-orange-500 dark:bg-orange-400 animate-pulse"></span>
          <!-- Number (future) -->
          <span v-else class="text-xs font-bold text-zinc-400 dark:text-zinc-600">{{ i + 1 }}</span>
        </div>

        <!-- Labels -->
        <p
          class="text-center text-xs font-bold leading-tight px-1"
          :class="isActive(i) ? 'text-orange-600 dark:text-orange-400' : isCompleted(i) ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-600'"
        >{{ stage.label }}</p>
        <p class="text-center text-[10px] text-zinc-400 dark:text-zinc-600 mt-0.5 hidden sm:block px-1">{{ stage.sub }}</p>
      </div>
    </div>
  </div>
</template>
