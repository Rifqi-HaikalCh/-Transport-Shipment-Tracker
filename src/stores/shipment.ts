/**
 * Pinia Store — Shipments
 *
 * Central state management for shipment data, including fetching,
 * filtering, and transporter assignment.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Shipment, ShipmentStatus, Transporter } from '@/types'

export const useShipmentStore = defineStore('shipments', () => {
  // ─── State ─────────────────────────────────────────────
  const shipments = ref<Shipment[]>([])
  const transporters = ref<Transporter[]>([])
  const selectedShipment = ref<Shipment | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filterStatus = ref<ShipmentStatus | 'All'>('All')
  const searchQuery = ref('')

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
      const response = await fetch('/api/shipments')
      const data = await response.json()
      shipments.value = data.shipments
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
      const response = await fetch(`/api/shipments/${id}`)
      if (!response.ok) {
        throw new Error('Shipment not found')
      }
      const data = await response.json()
      selectedShipment.value = data.shipment
      return data.shipment
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
      const response = await fetch('/api/transporters')
      const data = await response.json()
      transporters.value = data.transporters
    } catch (e) {
      console.error('Failed to fetch transporters:', e)
    }
  }

  async function assignTransporter(shipmentId: string, transporterId: string) {
    isLoading.value = true
    error.value = null
    try {
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
      const updatedShipment = data.shipment

      // Update in list
      const index = shipments.value.findIndex((s) => s.id === shipmentId)
      if (index !== -1) {
        shipments.value[index] = updatedShipment
      }

      // Update selected if viewing detail
      if (selectedShipment.value?.id === shipmentId) {
        selectedShipment.value = updatedShipment
      }

      return { success: true, shipment: updatedShipment }
    } catch (e: any) {
      error.value = e.message
      return { success: false, error: e.message }
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
  }
})
