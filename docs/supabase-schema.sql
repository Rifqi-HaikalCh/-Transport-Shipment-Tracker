-- =====================================================
-- SUPABASE REALTIME SETUP
-- =====================================================
-- Steps to enable Realtime for this project:
--
-- 1. Dashboard → Database → Replication → Supabase Realtime
--    Toggle ON for tables: shipments, transporters
--
-- 2. Alternatively, run these SQL commands:
--    (Supabase automatically enables Realtime via publication)

-- Enable Realtime publication for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE transporters;

-- =====================================================
-- HOW REALTIME WORKS IN THIS APP
-- =====================================================
-- The store uses Supabase JS client's `channel()` API:
--
--   supabase
--     .channel('shiptrack-realtime')
--     .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, handler)
--     .on('postgres_changes', { event: '*', schema: 'public', table: 'transporters' }, handler)
--     .subscribe()
--
-- Events handled:
--   INSERT  → adds new record to local state array
--   UPDATE  → syncs updated record in place
--   DELETE  → removes record from local state array
--
-- This means: if you UPDATE a shipment in Supabase Dashboard SQL editor,
-- the UI will update automatically within ~500ms.
--
-- =====================================================
-- TABLE SCHEMAS (for reference)
-- =====================================================

CREATE TABLE IF NOT EXISTS transporters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  vehicle_type TEXT NOT NULL,
  vehicle_plate TEXT,
  rating NUMERIC(3,1) DEFAULT 4.0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tracking_number TEXT UNIQUE NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'In Transit', 'Delivered', 'Cancelled')),
  weight NUMERIC(10,2),
  estimated_delivery DATE,
  description TEXT,
  transporter_id TEXT REFERENCES transporters(id) ON DELETE SET NULL,
  transporter_name TEXT,
  vehicle_type TEXT,
  vehicle_plate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE transporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read transporters" ON transporters FOR SELECT USING (TRUE);
CREATE POLICY "Public read shipments" ON shipments FOR SELECT USING (TRUE);

-- Public write (for demo — restrict to authenticated users in production)
CREATE POLICY "Public insert transporters" ON transporters FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public update shipments" ON shipments FOR UPDATE USING (TRUE);
CREATE POLICY "Public insert shipments" ON shipments FOR INSERT WITH CHECK (TRUE);

-- =====================================================
-- SEED DATA
-- =====================================================

INSERT INTO transporters (id, name, phone, vehicle_type, vehicle_plate, rating, is_available) VALUES
  ('tr-001', 'PT. Ekspres Logistik', '+62 812-3456-7890', 'Truck', 'B 1234 XYZ', 4.8, TRUE),
  ('tr-002', 'CV. Cepat Sampai', '+62 813-9876-5432', 'Van', 'D 5678 ABC', 4.5, TRUE),
  ('tr-003', 'PT. Andalan Kirim', '+62 821-1111-2222', 'Truck', 'F 9012 DEF', 4.2, FALSE),
  ('tr-004', 'Kargo Nusantara', '+62 856-3333-4444', 'Container', 'L 3456 GHI', 4.9, TRUE),
  ('tr-005', 'PT. Lintas Samudra', '+62 878-5555-6666', 'Ship', 'SRG-2024-01', 4.6, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO shipments (id, tracking_number, origin, destination, status, weight, estimated_delivery, transporter_id, transporter_name, vehicle_type, vehicle_plate, description) VALUES
  ('shp-001', 'TRK-2026-000001', 'Jakarta', 'Surabaya', 'In Transit', 250, '2026-04-10', 'tr-001', 'PT. Ekspres Logistik', 'Truck', 'B 1234 XYZ', 'Elektronik - Smart TV 55" (5 units)'),
  ('shp-002', 'TRK-2026-000002', 'Bandung', 'Semarang', 'Pending', 120, '2026-04-12', NULL, NULL, NULL, NULL, 'Textile - Kain Batik Premium (50 rolls)'),
  ('shp-003', 'TRK-2026-000003', 'Surabaya', 'Bali', 'Delivered', 80, '2026-04-05', 'tr-002', 'CV. Cepat Sampai', 'Van', 'D 5678 ABC', 'Makanan - Frozen Food (100 boxes)'),
  ('shp-004', 'TRK-2026-000004', 'Medan', 'Jakarta', 'Pending', 500, '2026-04-15', NULL, NULL, NULL, NULL, 'Furniture - Meja Kantor (20 sets)'),
  ('shp-005', 'TRK-2026-000005', 'Makassar', 'Manado', 'In Transit', 350, '2026-04-11', 'tr-004', 'Kargo Nusantara', 'Container', 'L 3456 GHI', 'Bahan Bangunan - Semen (200 sak)'),
  ('shp-006', 'TRK-2026-000006', 'Yogyakarta', 'Palembang', 'Cancelled', 45, '2026-04-08', NULL, NULL, NULL, NULL, 'Kerajinan - Wayang Kulit (30 pcs)'),
  ('shp-007', 'TRK-2026-000007', 'Jakarta', 'Pontianak', 'Pending', 180, '2026-04-18', NULL, NULL, NULL, NULL, 'Otomotif - Spare Part Mobil (assorted)'),
  ('shp-008', 'TRK-2026-000008', 'Semarang', 'Balikpapan', 'In Transit', 420, '2026-04-13', 'tr-005', 'PT. Lintas Samudra', 'Ship', 'SRG-2024-01', 'Farmasi - Medical Supplies (100 karton)')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COLUMN MAPPING: Supabase snake_case → Vue camelCase
-- =====================================================
-- If Supabase returns snake_case and Vue expects camelCase,
-- use aliased select in the store:
--
--   .select(`
--     id,
--     tracking_number as "trackingNumber",
--     estimated_delivery as "estimatedDelivery",
--     created_at as "createdAt",
--     transporter_id as "transporterId",
--     transporter_name as "transporterName",
--     vehicle_type as "vehicleType",
--     vehicle_plate as "vehiclePlate",
--     origin, destination, status, weight, description
--   `)
