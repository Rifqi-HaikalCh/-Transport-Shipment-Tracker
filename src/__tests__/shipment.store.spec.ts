import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShipmentStore } from '@/stores/shipment'

describe('Shipment Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
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
    expect(store.filteredShipments[0]?.id).toBe('1')

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
    expect(store.filteredShipments[0]?.origin).toBe('Jakarta')

    store.setSearchQuery('TRK-002')
    expect(store.filteredShipments).toHaveLength(1)
    expect(store.filteredShipments[0]?.id).toBe('2')
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

  it('assigns transporter successfully via mock API', async () => {
    const store = useShipmentStore()
    
    store.shipments = [
      { id: 'shp-1', trackingNumber: 'T1', status: 'Pending', origin: '', destination: '', description: '', weight: 0, estimatedDelivery: '', createdAt: '', transporterId: null, transporterName: null, vehicleType: null, vehiclePlate: null },
    ]
    store.selectedShipment = store.shipments[0] || null

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        shipment: { 
          id: 'shp-1', 
          trackingNumber: 'T1', 
          status: 'In Transit', 
          origin: '', destination: '', description: '', weight: 0, estimatedDelivery: '', createdAt: '', 
          transporterId: 'tr-1', 
          transporterName: 'Transporter A', 
          vehicleType: 'Truck', 
          vehiclePlate: 'B 1234 XYZ' 
        }
      })
    })

    const result = await store.assignTransporter('shp-1', 'tr-1')

    expect(result.success).toBe(true)
    expect(store.shipments[0]?.status).toBe('In Transit')
    expect(store.shipments[0]?.transporterId).toBe('tr-1')
    expect(store.selectedShipment?.transporterName).toBe('Transporter A')
    expect(global.fetch).toHaveBeenCalledWith('/api/shipments/shp-1/assign', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ transporterId: 'tr-1' })
    }))
  })

  it('handles assign transporter failure gracefully', async () => {
    const store = useShipmentStore()
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Transporter is not available' })
    })

    const result = await store.assignTransporter('shp-1', 'tr-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Transporter is not available')
    expect(store.error).toBe('Transporter is not available')
  })
})
