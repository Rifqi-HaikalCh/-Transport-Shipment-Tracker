import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Shipment, ShipmentStatus, Transporter, NewShipmentPayload, NewTransporterPayload } from '@/types'
import { supabase } from '@/utils/supabase/client'

const USE_SUPABASE = !import.meta.env.DEV

function generateTrackingNumber(): string {
  const year = new Date().getFullYear()
  const seq = Math.floor(Math.random() * 900000 + 100000)
  return `TRK-${year}-${seq}`
}

export const useShipmentStore = defineStore('shipments', () => {
  const shipments = ref<Shipment[]>([])
  const transporters = ref<Transporter[]>([])
  const selectedShipment = ref<Shipment | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filterStatus = ref<ShipmentStatus | 'All'>('All')
  const searchQuery = ref('')
  const now = ref(Math.floor(Date.now() / 1000))
  const scheduledDeliveries = ref<Record<string, number>>({})
  const scheduledTransitions = ref<Record<string, number>>({})
  let simulationTickId: ReturnType<typeof setInterval> | null = null

  let supabaseChannel: RealtimeChannel | null = null

  const filteredShipments = computed(() => {
    let result = shipments.value
    if (filterStatus.value !== 'All') {
      result = result.filter((s) => s.status === filterStatus.value)
    }
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (s) =>
          s.trackingNumber.toLowerCase().includes(query) ||
          s.origin.toLowerCase().includes(query) ||
          s.destination.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query),
      )
    }
    return result
  })

  const availableTransporters = computed(() => transporters.value.filter((t) => t.isAvailable))

  const statusCounts = computed(() => {
    const counts = { All: 0, Pending: 0, 'In Transit': 0, Delivered: 0, Cancelled: 0 }
    counts.All = shipments.value.length
    shipments.value.forEach((s) => {
      if (s.status in counts) counts[s.status as ShipmentStatus]++
    })
    return counts
  })

  const unassignedCount = computed(
    () => shipments.value.filter((s) => s.status === 'Pending' && !s.transporterId).length,
  )

  const shipmentCountdowns = computed(() => {
    const result: Record<string, number> = {}
    for (const [id, deliveryTime] of Object.entries(scheduledDeliveries.value)) {
      result[id] = Math.max(0, deliveryTime - now.value)
    }
    return result
  })

  async function fetchShipments() {
    isLoading.value = true
    error.value = null
    try {
      if (USE_SUPABASE) {
        const { data, error: sbError } = await supabase
          .from('shipments')
          .select('*')
          .order('created_at', { ascending: false })
        if (sbError) throw new Error(sbError.message)
        shipments.value = (data ?? []) as Shipment[]
      } else {
        const response = await fetch('/api/shipments')
        const data = await response.json()
        shipments.value = data.shipments
      }
    } catch (e) {
      error.value = 'Failed to fetch shipments'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchShipmentById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      if (USE_SUPABASE) {
        const { data, error: sbError } = await supabase
          .from('shipments')
          .select('*')
          .eq('id', id)
          .single()
        if (sbError) throw new Error(sbError.message)
        selectedShipment.value = data as Shipment
        return data as Shipment
      } else {
        const response = await fetch(`/api/shipments/${id}`)
        if (!response.ok) throw new Error('Shipment not found')
        const data = await response.json()
        selectedShipment.value = data.shipment
        return data.shipment as Shipment
      }
    } catch (e) {
      error.value = 'Failed to fetch shipment details'
      console.error(e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTransporters() {
    try {
      if (USE_SUPABASE) {
        const { data, error: sbError } = await supabase.from('transporters').select('*').order('name')
        if (sbError) throw new Error(sbError.message)
        transporters.value = (data ?? []) as Transporter[]
      } else {
        const response = await fetch('/api/transporters')
        const data = await response.json()
        transporters.value = data.transporters
      }
    } catch (e) {
      console.error('Failed to fetch transporters:', e)
    }
  }

  async function assignTransporter(shipmentId: string, transporterId: string) {
    isLoading.value = true
    error.value = null
    try {
      if (USE_SUPABASE) {
        const transporter = transporters.value.find((t) => t.id === transporterId)
        if (!transporter) throw new Error('Transporter not found')
        if (!transporter.isAvailable) throw new Error('Transporter is not available')

        const { data, error: sbError } = await supabase
          .from('shipments')
          .update({
            transporter_id: transporterId,
            transporter_name: transporter.name,
            vehicle_type: transporter.vehicleType,
            vehicle_plate: transporter.vehiclePlate,
            status: 'In Transit',
          })
          .eq('id', shipmentId)
          .select()
          .single()

        if (sbError) throw new Error(sbError.message)
        const updated = data as Shipment
        _syncShipmentLocal(updated)
        return { success: true, shipment: updated }
      } else {
        const response = await fetch(`/api/shipments/${shipmentId}/assign`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transporterId }),
        })
        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.error || 'Failed to assign transporter')
        }
        const data = await response.json()
        const updated = data.shipment as Shipment
        _syncShipmentLocal(updated)

        _scheduleDelivery(shipmentId)

        return { success: true, shipment: updated }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to assign transporter'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  async function addShipment(payload: NewShipmentPayload) {
    isLoading.value = true
    error.value = null
    try {
      if (USE_SUPABASE) {
        const { data, error: sbError } = await supabase
          .from('shipments')
          .insert({
            tracking_number: generateTrackingNumber(),
            origin: payload.origin,
            destination: payload.destination,
            description: payload.description,
            weight: payload.weight,
            estimated_delivery: payload.estimatedDelivery,
            transporter_id: payload.transporterId ?? null,
            status: 'Pending',
          })
          .select()
          .single()
        if (sbError) throw new Error(sbError.message)
        const newShipment = data as Shipment
        shipments.value.unshift(newShipment)
        return { success: true, shipment: newShipment }
      } else {
        const response = await fetch('/api/shipments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.error || 'Failed to create shipment')
        }
        const data = await response.json()
        const newShipment = data.shipment as Shipment
        shipments.value.unshift(newShipment)

        if (newShipment.transporterId) _scheduleDelivery(newShipment.id)

        return { success: true, shipment: newShipment }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to create shipment'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  async function addTransporter(payload: NewTransporterPayload) {
    error.value = null
    try {
      if (USE_SUPABASE) {
        const { data, error: sbError } = await supabase
          .from('transporters')
          .insert({
            name: payload.name,
            phone: payload.phone,
            vehicle_type: payload.vehicleType,
            vehicle_plate: payload.vehiclePlate,
            rating: payload.rating ?? 4.0,
            is_available: true,
          })
          .select()
          .single()
        if (sbError) throw new Error(sbError.message)
        const newT = data as Transporter
        transporters.value.push(newT)
        return { success: true, transporter: newT }
      } else {
        const response = await fetch('/api/transporters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.error || 'Failed to add transporter')
        }
        const data = await response.json()
        const newT = data.transporter as Transporter
        transporters.value.push(newT)
        return { success: true, transporter: newT }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to add transporter'
      error.value = message
      return { success: false, error: message }
    }
  }

  function setFilterStatus(status: ShipmentStatus | 'All') {
    filterStatus.value = status
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function _syncShipmentLocal(updated: Shipment) {
    const idx = shipments.value.findIndex((s) => s.id === updated.id)
    if (idx !== -1) shipments.value[idx] = updated
    if (selectedShipment.value?.id === updated.id) selectedShipment.value = updated
  }

  function _scheduleDelivery(shipmentId: string, delaySec?: number) {
    const t = Math.floor(Date.now() / 1000)
    const delay = delaySec ?? 90 + Math.floor(Math.random() * 210)
    scheduledDeliveries.value = { ...scheduledDeliveries.value, [shipmentId]: t + delay }
  }

  function startRealtimeSimulation() {
    if (simulationTickId !== null) return

    const t = Math.floor(Date.now() / 1000)

    shipments.value
      .filter((s) => s.status === 'In Transit' && s.transporterId)
      .forEach((s) => _scheduleDelivery(s.id))

    shipments.value
      .filter((s) => s.status === 'Pending' && s.transporterId)
      .forEach((s) => {
        const delay = 20 + Math.floor(Math.random() * 40)
        scheduledTransitions.value = { ...scheduledTransitions.value, [s.id]: t + delay }
      })

    simulationTickId = setInterval(() => {
      const ts = Math.floor(Date.now() / 1000)
      now.value = ts

      const transitions = { ...scheduledTransitions.value }
      for (const [id, transitionAt] of Object.entries(transitions)) {
        if (ts >= transitionAt) {
          const idx = shipments.value.findIndex((s) => s.id === id)
          if (idx !== -1 && shipments.value[idx]?.status === 'Pending' && shipments.value[idx]?.transporterId) {
            shipments.value[idx] = { ...(shipments.value[idx] as Shipment), status: 'In Transit' }
            if (selectedShipment.value?.id === id) {
              selectedShipment.value = { ...selectedShipment.value, status: 'In Transit' }
            }
            _scheduleDelivery(id)
          }
          const next = { ...scheduledTransitions.value }
          delete next[id]
          scheduledTransitions.value = next
        }
      }

      const deliveries = { ...scheduledDeliveries.value }
      for (const [id, deliverAt] of Object.entries(deliveries)) {
        if (ts >= deliverAt) {
          const idx = shipments.value.findIndex((s) => s.id === id)
          if (idx !== -1 && shipments.value[idx]?.status === 'In Transit') {
            shipments.value[idx] = { ...(shipments.value[idx] as Shipment), status: 'Delivered' }
            if (selectedShipment.value?.id === id) {
              selectedShipment.value = { ...selectedShipment.value, status: 'Delivered' }
            }
          }
          const next = { ...scheduledDeliveries.value }
          delete next[id]
          scheduledDeliveries.value = next
        }
      }
    }, 1000)
  }

  function stopRealtimeSimulation() {
    if (simulationTickId !== null) {
      clearInterval(simulationTickId)
      simulationTickId = null
    }
    scheduledDeliveries.value = {}
    scheduledTransitions.value = {}
  }

  function startSupabaseRealtime() {
    if (!USE_SUPABASE) return
    if (supabaseChannel) return

    supabaseChannel = supabase
      .channel('shiptrack-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newShipment = payload.new as Shipment
            if (!shipments.value.find((s) => s.id === newShipment.id)) {
              shipments.value.unshift(newShipment)
            }
          } else if (payload.eventType === 'UPDATE') {
            _syncShipmentLocal(payload.new as Shipment)
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            shipments.value = shipments.value.filter((s) => s.id !== deleted.id)
            if (selectedShipment.value?.id === deleted.id) selectedShipment.value = null
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transporters' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newT = payload.new as Transporter
            if (!transporters.value.find((t) => t.id === newT.id)) {
              transporters.value.push(newT)
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Transporter
            const idx = transporters.value.findIndex((t) => t.id === updated.id)
            if (idx !== -1) transporters.value[idx] = updated
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            transporters.value = transporters.value.filter((t) => t.id !== deleted.id)
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.info('[ShipTrack] Supabase Realtime connected ✓')
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('[ShipTrack] Supabase Realtime connection error')
        }
      })
  }

  function stopSupabaseRealtime() {
    if (supabaseChannel) {
      supabase.removeChannel(supabaseChannel)
      supabaseChannel = null
    }
  }

  return {
    shipments,
    transporters,
    selectedShipment,
    isLoading,
    error,
    filterStatus,
    searchQuery,
    now,
    shipmentCountdowns,
    filteredShipments,
    availableTransporters,
    statusCounts,
    unassignedCount,
    fetchShipments,
    fetchShipmentById,
    fetchTransporters,
    assignTransporter,
    addShipment,
    addTransporter,
    setFilterStatus,
    setSearchQuery,
    startRealtimeSimulation,
    stopRealtimeSimulation,
    startSupabaseRealtime,
    stopSupabaseRealtime,
  }
})
