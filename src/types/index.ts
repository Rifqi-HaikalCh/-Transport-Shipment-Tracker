/**
 * Core type definitions for Transport Shipment Tracker
 */

export type ShipmentStatus = 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled'

export interface Shipment {
  id: string
  trackingNumber: string
  origin: string
  destination: string
  status: ShipmentStatus
  weight: number // in kg
  estimatedDelivery: string // ISO date string
  createdAt: string // ISO date string
  transporterId: string | null
  transporterName: string | null
  description: string
}

export interface Transporter {
  id: string
  name: string
  phone: string
  vehicleType: string
  vehiclePlate: string
  rating: number // 1-5
  isAvailable: boolean
}

export interface AssignTransporterPayload {
  shipmentId: string
  transporterId: string
}
