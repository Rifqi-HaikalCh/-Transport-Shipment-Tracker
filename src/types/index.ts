export type ShipmentStatus = 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled'

export interface Shipment {
  id: string
  trackingNumber: string
  origin: string
  destination: string
  status: ShipmentStatus
  weight: number
  estimatedDelivery: string
  createdAt: string
  transporterId: string | null
  transporterName: string | null
  vehicleType: string | null
  vehiclePlate: string | null
  description: string
}

export interface Transporter {
  id: string
  name: string
  phone: string
  vehicleType: string
  vehiclePlate: string
  rating: number
  isAvailable: boolean
}

export interface AssignTransporterPayload {
  shipmentId: string
  transporterId: string
}

export interface NewShipmentPayload {
  origin: string
  destination: string
  description: string
  weight: number
  estimatedDelivery: string
  transporterId?: string | null
}

export interface NewTransporterPayload {
  name: string
  phone: string
  vehicleType: string
  vehiclePlate: string
  rating?: number
}
