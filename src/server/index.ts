/**
 * Mirage.js Mock API Server
 *
 * Simulates a real REST API with realistic latency and proper HTTP status codes.
 * This replaces the need for a backend server during development.
 */
import { createServer, Model, Response, type Registry } from 'miragejs'
import type { ModelDefinition } from 'miragejs/-types'
import type Schema from 'miragejs/orm/schema'
import type { Shipment, Transporter } from '@/types'

// Type helpers for Mirage
type ShipmentModel = ModelDefinition<Shipment>
type TransporterModel = ModelDefinition<Transporter>

type AppModels = {
  shipment: ShipmentModel
  transporter: TransporterModel
}

type AppRegistry = Registry<AppModels, {}>
type AppSchema = Schema<AppRegistry>

export function makeServer({ environment = 'development' } = {}) {
  const server = createServer({
    environment,

    models: {
      shipment: Model.extend<Partial<Shipment>>({}),
      transporter: Model.extend<Partial<Transporter>>({}),
    },

    seeds(server) {
      // Seed transporters
      server.create('transporter', {
        id: 'tr-001',
        name: 'PT. Ekspres Logistik',
        phone: '+62 812-3456-7890',
        vehicleType: 'Truck',
        vehiclePlate: 'B 1234 XYZ',
        rating: 4.8,
        isAvailable: true,
      } as any)

      server.create('transporter', {
        id: 'tr-002',
        name: 'CV. Cepat Sampai',
        phone: '+62 813-9876-5432',
        vehicleType: 'Van',
        vehiclePlate: 'D 5678 ABC',
        rating: 4.5,
        isAvailable: true,
      } as any)

      server.create('transporter', {
        id: 'tr-003',
        name: 'PT. Andalan Kirim',
        phone: '+62 821-1111-2222',
        vehicleType: 'Truck',
        vehiclePlate: 'F 9012 DEF',
        rating: 4.2,
        isAvailable: false,
      } as any)

      server.create('transporter', {
        id: 'tr-004',
        name: 'Kargo Nusantara',
        phone: '+62 856-3333-4444',
        vehicleType: 'Container',
        vehiclePlate: 'L 3456 GHI',
        rating: 4.9,
        isAvailable: true,
      } as any)

      server.create('transporter', {
        id: 'tr-005',
        name: 'PT. Lintas Samudra',
        phone: '+62 878-5555-6666',
        vehicleType: 'Ship',
        vehiclePlate: 'SRG-2024-01',
        rating: 4.6,
        isAvailable: true,
      } as any)

      // Seed shipments
      server.create('shipment', {
        id: 'shp-001',
        trackingNumber: 'TRK-2026-000001',
        origin: 'Jakarta',
        destination: 'Surabaya',
        status: 'In Transit',
        weight: 250,
        estimatedDelivery: '2026-04-10',
        createdAt: '2026-04-01',
        transporterId: 'tr-001',
        transporterName: 'PT. Ekspres Logistik',
        vehicleType: 'Truck',
        vehiclePlate: 'B 1234 XYZ',
        description: 'Elektronik - Smart TV 55" (5 units)',
      } as any)

      server.create('shipment', {
        id: 'shp-002',
        trackingNumber: 'TRK-2026-000002',
        origin: 'Bandung',
        destination: 'Semarang',
        status: 'Pending',
        weight: 120,
        estimatedDelivery: '2026-04-12',
        createdAt: '2026-04-03',
        transporterId: null,
        transporterName: null,
        vehicleType: null,
        vehiclePlate: null,
        description: 'Textile - Kain Batik Premium (50 rolls)',
      } as any)

      server.create('shipment', {
        id: 'shp-003',
        trackingNumber: 'TRK-2026-000003',
        origin: 'Surabaya',
        destination: 'Bali',
        status: 'Delivered',
        weight: 80,
        estimatedDelivery: '2026-04-05',
        createdAt: '2026-03-28',
        transporterId: 'tr-002',
        transporterName: 'CV. Cepat Sampai',
        vehicleType: 'Van',
        vehiclePlate: 'D 5678 ABC',
        description: 'Makanan - Frozen Food (100 boxes)',
      } as any)

      server.create('shipment', {
        id: 'shp-004',
        trackingNumber: 'TRK-2026-000004',
        origin: 'Medan',
        destination: 'Jakarta',
        status: 'Pending',
        weight: 500,
        estimatedDelivery: '2026-04-15',
        createdAt: '2026-04-05',
        transporterId: null,
        transporterName: null,
        vehicleType: null,
        vehiclePlate: null,
        description: 'Furniture - Meja Kantor (20 sets)',
      } as any)

      server.create('shipment', {
        id: 'shp-005',
        trackingNumber: 'TRK-2026-000005',
        origin: 'Makassar',
        destination: 'Manado',
        status: 'In Transit',
        weight: 350,
        estimatedDelivery: '2026-04-11',
        createdAt: '2026-04-02',
        transporterId: 'tr-004',
        transporterName: 'Kargo Nusantara',
        vehicleType: 'Container',
        vehiclePlate: 'L 3456 GHI',
        description: 'Bahan Bangunan - Semen (200 sak)',
      } as any)

      server.create('shipment', {
        id: 'shp-006',
        trackingNumber: 'TRK-2026-000006',
        origin: 'Yogyakarta',
        destination: 'Palembang',
        status: 'Cancelled',
        weight: 45,
        estimatedDelivery: '2026-04-08',
        createdAt: '2026-04-01',
        transporterId: null,
        transporterName: null,
        vehicleType: null,
        vehiclePlate: null,
        description: 'Kerajinan - Wayang Kulit (30 pcs)',
      } as any)

      server.create('shipment', {
        id: 'shp-007',
        trackingNumber: 'TRK-2026-000007',
        origin: 'Jakarta',
        destination: 'Pontianak',
        status: 'Pending',
        weight: 180,
        estimatedDelivery: '2026-04-18',
        createdAt: '2026-04-06',
        transporterId: null,
        transporterName: null,
        vehicleType: null,
        vehiclePlate: null,
        description: 'Otomotif - Spare Part Mobil (assorted)',
      } as any)

      server.create('shipment', {
        id: 'shp-008',
        trackingNumber: 'TRK-2026-000008',
        origin: 'Semarang',
        destination: 'Balikpapan',
        status: 'In Transit',
        weight: 420,
        estimatedDelivery: '2026-04-13',
        createdAt: '2026-04-04',
        transporterId: 'tr-005',
        transporterName: 'PT. Lintas Samudra',
        vehicleType: 'Ship',
        vehiclePlate: 'SRG-2024-01',
        description: 'Farmasi - Medical Supplies (100 karton)',
      } as any)
    },

    routes() {
      this.namespace = 'api'

      // Simulate realistic network latency
      this.timing = 400

      // GET /api/shipments — List all shipments
      this.get('/shipments', (schema: AppSchema) => {
        return schema.all('shipment')
      })

      // GET /api/shipments/:id — Get single shipment detail
      this.get('/shipments/:id', (schema: AppSchema, request) => {
        const id = request.params.id
        const shipment = schema.find('shipment', id as string)

        if (!shipment) {
          return new Response(404, {}, { error: 'Shipment not found' })
        }

        return shipment
      })

      // PATCH /api/shipments/:id/assign — Assign transporter to a shipment
      this.patch('/shipments/:id/assign', (schema: AppSchema, request) => {
        const shipmentId = request.params.id
        const { transporterId } = JSON.parse(request.requestBody)

        const shipment = schema.find('shipment', shipmentId as string)
        if (!shipment) {
          return new Response(404, {}, { error: 'Shipment not found' })
        }

        const transporter = schema.find('transporter', transporterId as string)
        if (!transporter) {
          return new Response(400, {}, { error: 'Transporter not found' })
        }

        if (!transporter.attrs.isAvailable) {
          return new Response(
            400,
            {},
            { error: 'Transporter is not available' },
          )
        }

        // Validate: cannot assign to Delivered or Cancelled shipments
        if (
          shipment.attrs.status === 'Delivered' ||
          shipment.attrs.status === 'Cancelled'
        ) {
          return new Response(
            400,
            {},
            { error: 'Cannot assign transporter to a completed or cancelled shipment' },
          )
        }

        shipment.update({
          transporterId: transporter.attrs.id,
          transporterName: transporter.attrs.name,
          vehicleType: transporter.attrs.vehicleType,
          vehiclePlate: transporter.attrs.vehiclePlate,
          status: 'In Transit',
        })

        return shipment
      })

      // GET /api/transporters — List all transporters
      this.get('/transporters', (schema: AppSchema) => {
        return schema.all('transporter')
      })

      // POST /api/shipments — Create a new shipment
      this.post('/shipments', (schema: AppSchema, request) => {
        const body = JSON.parse(request.requestBody)
        const year = new Date().getFullYear()
        const seq = Math.floor(Math.random() * 900000 + 100000)
        const trackingNumber = `TRK-${year}-${seq}`
        const id = `shp-${Date.now()}`

        const newShipment = schema.create('shipment', {
          id,
          trackingNumber,
          origin: body.origin,
          destination: body.destination,
          description: body.description,
          weight: body.weight,
          estimatedDelivery: body.estimatedDelivery,
          status: 'Pending',
          transporterId: body.transporterId ?? null,
          transporterName: body.transporterId
            ? (schema.find('transporter', body.transporterId as string)?.attrs.name ?? null)
            : null,
          vehicleType: null,
          vehiclePlate: null,
          createdAt: new Date().toISOString().split('T')[0],
        } as any)

        return { shipment: newShipment.attrs }
      })

      // POST /api/transporters — Register a new transporter
      this.post('/transporters', (schema: AppSchema, request) => {
        const body = JSON.parse(request.requestBody)
        const id = `tr-${Date.now()}`

        const newTransporter = schema.create('transporter', {
          id,
          name: body.name,
          phone: body.phone,
          vehicleType: body.vehicleType,
          vehiclePlate: body.vehiclePlate,
          rating: body.rating ?? 4.0,
          isAvailable: true,
        } as any)

        return { transporter: newTransporter.attrs }
      })
    },
  })

  return server
}
