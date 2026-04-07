/**
 * Pinia Store — Shipments
 *
 * Central state management for shipment data, including fetching,
 * filtering, and transporter assignment.
 *
 * Data source strategy:
 *   - Development (npm run dev): Mirage.js intercepts fetch() calls → mock data
 *   - Production: Supabase client queries real database tables
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Shipment, ShipmentStatus, Transporter } from '@/types'
import { supabase } from '@/utils/supabase/client'

/** Use Supabase only in production; Mirage.js handles dev via fetch() intercepts */
const USE_SUPABASE = !import.meta.env.DEV

export const useShipmentStore = defineStore('shipments', () => {
  // ─── State ─────────────────────────────────────────────
  const shipments = ref<Shipment[]>([])
  const transporters = ref<Transporter[]>([])
  const selectedShipment = ref<Shipment | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filterStatus = ref<ShipmentStatus | 'All'>('All')
  const searchQuery = ref('')
  const realtimeIntervalId = ref<ReturnType<typeof setInterval> | null>(null)

  // ─── Getters ───────────────────────────────────────────
  const filteredShipments = computed(() => {
    let result = shipments.value

    // Filter by status
    if (filterStatus.value !== 'All') {
      result = result.filter((s) => s.status === filterStatus.value)
    }

    // Filter by search query
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

  const availableTransporters = computed(() => {
    return transporters.value.filter((t) => t.isAvailable)
  })

  const statusCounts = computed(() => {
    const counts = { All: 0, Pending: 0, 'In Transit': 0, Delivered: 0, Cancelled: 0 }
    counts.All = shipments.value.length
    shipments.value.forEach((s) => {
      if (s.status in counts) {
        counts[s.status as ShipmentStatus]++
      }
    })
    return counts
  })

  // ─── Actions ───────────────────────────────────────────
  async function fetchShipments() {
    isLoading.value = true
    error.value = null
    try {
      if (USE_SUPABASE) {
        // ── Supabase (production) ──
        const { data, error: sbError } = await supabase
          .from('shipments')
          .select('*')
          .order('created_at', { ascending: false })
        if (sbError) throw new Error(sbError.message)
        shipments.value = (data ?? []) as Shipment[]
      } else {
        // ── Mirage.js (development) ──
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
        // ── Supabase (production) ──
        const { data, error: sbError } = await supabase
          .from('shipments')
          .select('*')
          .eq('id', id)
          .single()
        if (sbError) throw new Error(sbError.message)
        selectedShipment.value = data as Shipment
        return data as Shipment
      } else {
        // ── Mirage.js (development) ──
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
        // ── Supabase (production) ──
        const { data, error: sbError } = await supabase
          .from('transporters')
          .select('*')
          .order('name')
        if (sbError) throw new Error(sbError.message)
        transporters.value = (data ?? []) as Transporter[]
      } else {
        // ── Mirage.js (development) ──
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
        // ── Supabase (production) ──
        // Find the transporter in local state (already fetched)
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
        const updatedShipment = data as Shipment

        // Sync local state
        const index = shipments.value.findIndex((s) => s.id === shipmentId)
        if (index !== -1) shipments.value[index] = updatedShipment
        if (selectedShipment.value?.id === shipmentId) selectedShipment.value = updatedShipment

        return { success: true, shipment: updatedShipment }
      } else {
        // ── Mirage.js (development) ──
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
        const updatedShipment = data.shipment as Shipment

        // Update in list
        const index = shipments.value.findIndex((s) => s.id === shipmentId)
        if (index !== -1) shipments.value[index] = updatedShipment

        // Update selected if viewing detail
        if (selectedShipment.value?.id === shipmentId) selectedShipment.value = updatedShipment

        return { success: true, shipment: updatedShipment }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to assign transporter'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  function setFilterStatus(status: ShipmentStatus | 'All') {
    filterStatus.value = status
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  /**
   * Real-time Update Simulation
   *
   * Uses setInterval to periodically advance a random active shipment
   * to its next logical status, simulating live tracking updates.
   */
  function startRealtimeSimulation(intervalMs = 8000) {
    if (realtimeIntervalId.value) return // already running

    realtimeIntervalId.value = setInterval(() => {
      const progressMap: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
        Pending: 'In Transit',
        'In Transit': 'Delivered',
      }

      // Pick a random active (Pending or In Transit) shipment
      const active = shipments.value.filter(
        (s) => s.status === 'Pending' || s.status === 'In Transit',
      )
      if (active.length === 0) {
        stopRealtimeSimulation()
        return
      }

      const target = active[Math.floor(Math.random() * active.length)]!
      const nextStatus = progressMap[target.status]
      if (!nextStatus) return

      // Update in-place
      const idx = shipments.value.findIndex((s) => s.id === target.id)
      if (idx !== -1) {
        shipments.value[idx] = { ...shipments.value[idx], status: nextStatus } as typeof shipments.value[0]
      }

      // Also update selectedShipment if it's the same one
      if (selectedShipment.value?.id === target.id) {
        selectedShipment.value = { ...selectedShipment.value, status: nextStatus } as typeof shipments.value[0]
      }
    }, intervalMs)
  }

  function stopRealtimeSimulation() {
    if (realtimeIntervalId.value) {
      clearInterval(realtimeIntervalId.value)
      realtimeIntervalId.value = null
    }
  }

  return {
    // State
    shipments,
    transporters,
    selectedShipment,
    isLoading,
    error,
    filterStatus,
    searchQuery,
    // Getters
    filteredShipments,
    availableTransporters,
    statusCounts,
    // Actions
    fetchShipments,
    fetchShipmentById,
    fetchTransporters,
    assignTransporter,
    setFilterStatus,
    setSearchQuery,
    startRealtimeSimulation,
    stopRealtimeSimulation,
  }
})
