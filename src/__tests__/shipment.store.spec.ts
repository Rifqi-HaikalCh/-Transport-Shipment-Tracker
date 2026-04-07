import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShipmentStore } from '@/stores/shipment'

describe('Shipment Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct initial state', () => {
    const store = useShipmentStore()
    expect(store.shipments).toEqual([])
    expect(store.transporters).toEqual([])
    expect(store.selectedShipment).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.filterStatus).toBe('All')
    expect(store.searchQuery).toBe('')
  })

  it('sets filter status correctly', () => {
    const store = useShipmentStore()
    store.setFilterStatus('Pending')
    expect(store.filterStatus).toBe('Pending')
    store.setFilterStatus('All')
    expect(store.filterStatus).toBe('All')
  })

  it('sets search query correctly', () => {
    const store = useShipmentStore()
    store.setSearchQuery('Jakarta')
    expect(store.searchQuery).toBe('Jakarta')
  })

  it('filters shipments by status', () => {
    const store = useShipmentStore()
    store.shipments = [
      { id: '1', trackingNumber: 'T1', status: 'Pending', origin: 'A', destination: 'B', description: '', weight: 10, estimatedDelivery: '', createdAt: '', transporterId: null, transporterName: null, vehicleType: null, vehiclePlate: null },
      { id: '2', trackingNumber: 'T2', status: 'Delivered', origin: 'C', destination: 'D', description: '', weight: 20, estimatedDelivery: '', createdAt: '', transporterId: null, transporterName: null, vehicleType: null, vehiclePlate: null },
    ]

    store.setFilterStatus('Pending')
    expect(store.filteredShipments).toHaveLength(1)
    expect(store.filteredShipments[0].id).toBe('1')

    store.setFilterStatus('All')
    expect(store.filteredShipments).toHaveLength(2)
  })

  it('filters shipments by search query', () => {
    const store = useShipmentStore()
    store.shipments = [
      { id: '1', trackingNumber: 'TRK-001', status: 'Pending', origin: 'Jakarta', destination: 'Surabaya', description: 'Elektronik', weight: 10, estimatedDelivery: '', createdAt: '', transporterId: null, transporterName: null, vehicleType: null, vehiclePlate: null },
      { id: '2', trackingNumber: 'TRK-002', status: 'Delivered', origin: 'Bandung', destination: 'Semarang', description: 'Textile', weight: 20, estimatedDelivery: '', createdAt: '', transporterId: null, transporterName: null, vehicleType: null, vehiclePlate: null },
    ]

    store.setSearchQuery('Jakarta')
    expect(store.filteredShipments).toHaveLength(1)
    expect(store.filteredShipments[0].origin).toBe('Jakarta')

    store.setSearchQuery('TRK-002')
    expect(store.filteredShipments).toHaveLength(1)
    expect(store.filteredShipments[0].id).toBe('2')
  })

  it('computes status counts correctly', () => {
    const store = useShipmentStore()
    store.shipments = [
      { id: '1', trackingNumber: 'T1', status: 'Pending', origin: '', destination: '', description: '', weight: 0, estimatedDelivery: '', createdAt: '', transporterId: null, transporterName: null, vehicleType: null, vehiclePlate: null },
      { id: '2', trackingNumber: 'T2', status: 'Pending', origin: '', destination: '', description: '', weight: 0, estimatedDelivery: '', createdAt: '', transporterId: null, transporterName: null, vehicleType: null, vehiclePlate: null },
      { id: '3', trackingNumber: 'T3', status: 'In Transit', origin: '', destination: '', description: '', weight: 0, estimatedDelivery: '', createdAt: '', transporterId: null, transporterName: null, vehicleType: null, vehiclePlate: null },
      { id: '4', trackingNumber: 'T4', status: 'Delivered', origin: '', destination: '', description: '', weight: 0, estimatedDelivery: '', createdAt: '', transporterId: null, transporterName: null, vehicleType: null, vehiclePlate: null },
    ]

    expect(store.statusCounts.All).toBe(4)
    expect(store.statusCounts.Pending).toBe(2)
    expect(store.statusCounts['In Transit']).toBe(1)
    expect(store.statusCounts.Delivered).toBe(1)
    expect(store.statusCounts.Cancelled).toBe(0)
  })

  it('computes available transporters', () => {
    const store = useShipmentStore()
    store.transporters = [
      { id: 't1', name: 'A', phone: '', vehicleType: '', vehiclePlate: '', rating: 4, isAvailable: true },
      { id: 't2', name: 'B', phone: '', vehicleType: '', vehiclePlate: '', rating: 3, isAvailable: false },
      { id: 't3', name: 'C', phone: '', vehicleType: '', vehiclePlate: '', rating: 5, isAvailable: true },
    ]

    expect(store.availableTransporters).toHaveLength(2)
    expect(store.availableTransporters.map(t => t.id)).toEqual(['t1', 't3'])
  })
})
