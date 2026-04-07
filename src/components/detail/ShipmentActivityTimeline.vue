<script setup lang="ts">
import { computed } from 'vue'
import type { Shipment } from '@/types'

const props = defineProps<{ shipment: Shipment }>()

interface TimelineEvent {
  date: Date
  title: string
  sub?: string
  active: boolean
  type: 'success' | 'active' | 'info' | 'warning' | 'cancelled'
}

function addHours(d: Date, h: number): Date {
  return new Date(d.getTime() + h * 3600000)
}
function addMins(d: Date, m: number): Date {
  return new Date(d.getTime() + m * 60000)
}

const events = computed((): TimelineEvent[] => {
  const s = props.shipment
  const created = new Date(s.createdAt || new Date())
  const log: TimelineEvent[] = []

  // 1. Always: Created
  log.push({
    date: created,
    title: 'Shipment registered in the system',
    sub: `Tracking number: ${s.trackingNumber}`,
    active: s.status === 'Pending' && !s.transporterId,
    type: 'info',
  })

  if (s.status === 'Cancelled') {
    log.push({
      date: addHours(created, 1),
      title: 'Shipment has been cancelled',
      sub: 'No further updates will be provided.',
      active: true,
      type: 'cancelled',
    })
    return log.reverse()
  }

  // 2. Awaiting transporter (no transporter)
  if (!s.transporterId) {
    log.push({
      date: addMins(created, 5),
      title: 'Awaiting transporter assignment',
      sub: 'Please assign a transporter to start tracking.',
      active: true,
      type: 'warning',
    })
    return log.reverse()
  }

  // 3. Transporter assigned
  log.push({
    date: addHours(created, 1),
    title: `Transporter assigned: ${s.transporterName}`,
    sub: `${s.vehicleType ?? ''} · ${s.vehiclePlate ?? ''}`.trim().replace(/^·\s*/, '').replace(/\s*·$/, '') || undefined,
    active: s.status === 'Pending',
    type: s.status === 'Pending' ? 'active' : 'info',
  })

  if (s.status === 'Pending') return log.reverse()

  // 4. Package picked up
  log.push({
    date: addHours(created, 3),
    title: 'Package picked up from origin',
    sub: `Collected from ${s.origin}`,
    active: false,
    type: 'info',
  })

  // 5. In transit
  log.push({
    date: addHours(created, 4),
    title: 'Shipment is on the way',
    sub: `En route to ${s.destination}`,
    active: s.status === 'In Transit',
    type: s.status === 'In Transit' ? 'active' : 'info',
  })

  if (s.status === 'In Transit') return log.reverse()

  // 6. Out for delivery
  log.push({
    date: new Date(s.estimatedDelivery ? new Date(s.estimatedDelivery).getTime() - 3600000 : addHours(created, 48).getTime()),
    title: 'Package is out for delivery',
    sub: `Approaching ${s.destination}`,
    active: false,
    type: 'info',
  })

  // 7. Delivered
  log.push({
    date: new Date(s.estimatedDelivery || addHours(created, 50)),
    title: 'Package delivered successfully',
    sub: `Delivered to ${s.destination}`,
    active: true,
    type: 'success',
  })

  return log.reverse() // most recent first
})

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}
function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function dotClass(type: TimelineEvent['type']) {
  const map = {
    success:   'bg-green-500 border-green-400',
    active:    'bg-orange-500 border-orange-400 ring-4 ring-orange-500/20',
    info:      'bg-zinc-300 border-zinc-300 dark:bg-zinc-600 dark:border-zinc-600',
    warning:   'bg-amber-400 border-amber-400',
    cancelled: 'bg-red-400 border-red-400',
  }
  return map[type]
}

function titleClass(type: TimelineEvent['type'], active: boolean) {
  if (active) {
    if (type === 'success') return 'text-green-600 dark:text-green-400 font-bold'
    if (type === 'cancelled') return 'text-red-500 dark:text-red-400 font-bold'
    if (type === 'warning') return 'text-amber-600 dark:text-amber-400 font-bold'
    return 'text-orange-600 dark:text-orange-400 font-bold'
  }
  return 'text-zinc-400 dark:text-zinc-500 font-medium'
}
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm p-6">
    <h3 class="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-5">Activity Timeline</h3>

    <div class="relative">
      <!-- Continuous vertical line -->
      <div class="absolute left-[68px] top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800"></div>

      <div class="space-y-5">
        <div
          v-for="(event, i) in events"
          :key="i"
          class="flex gap-4"
        >
          <!-- Date/Time column -->
          <div class="w-14 shrink-0 text-right pt-0.5">
            <p class="text-xs font-bold" :class="event.active ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-600'">
              {{ fmtDate(event.date) }}
            </p>
            <p class="text-[10px]" :class="event.active ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-300 dark:text-zinc-700'">
              {{ fmtTime(event.date) }}
            </p>
          </div>

          <!-- Dot -->
          <div class="relative flex items-start justify-center w-5 shrink-0 pt-1">
            <div
              class="w-3 h-3 rounded-full border-2 z-10 shrink-0 transition-all duration-300"
              :class="dotClass(event.type)"
            ></div>
          </div>

          <!-- Content -->
          <div class="flex-1 pb-1">
            <p class="text-sm leading-snug" :class="titleClass(event.type, event.active)">{{ event.title }}</p>
            <p v-if="event.sub" class="text-xs mt-0.5" :class="event.active ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'">
              {{ event.sub }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
