-- =============================================
-- Inventory Module Database Schema
-- For Supabase PostgreSQL
-- =============================================

-- 1. STOCK LOCATIONS
-- Stores warehouse and technician locations
-- =============================================
CREATE TABLE IF NOT EXISTS stock_locations (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('WAREHOUSE', 'TECHNICIAN')),
    name TEXT NOT NULL,
    technician_id TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding active locations
CREATE INDEX idx_stock_locations_active ON stock_locations(is_active) WHERE is_active = true;

-- Index for technician lookups
CREATE INDEX idx_stock_locations_tech ON stock_locations(technician_id) WHERE type = 'TECHNICIAN';

-- 2. PARTS CATALOG
-- Master list of all parts/parts
-- =============================================
CREATE TABLE IF NOT EXISTS parts (
    id TEXT PRIMARY KEY,
    part_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    equipment_compatibility TEXT[] DEFAULT '{}',
    unit_cost NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    min_stock_level INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    supplier TEXT,
    supplier_part_number TEXT,
    is_serial_tracked BOOLEAN DEFAULT false,
    warranty_months INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_subcategory ON parts(subcategory);
CREATE INDEX idx_parts_name ON parts(name);
CREATE INDEX idx_parts_part_number ON parts(part_number);

-- GIN index for array columns (tags)
CREATE INDEX idx_parts_tags ON parts USING GIN(tags);
CREATE INDEX idx_parts_equipment ON parts USING GIN(equipment_compatibility);

-- 3. STOCK LEVELS
-- Tracks quantity of each part at each location
-- =============================================
CREATE TABLE IF NOT EXISTS stock_levels (
    id TEXT PRIMARY KEY,
    part_id TEXT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    location_id TEXT NOT NULL REFERENCES stock_locations(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(part_id, location_id)
);

-- Indexes
CREATE INDEX idx_stock_levels_part ON stock_levels(part_id);
CREATE INDEX idx_stock_levels_location ON stock_levels(location_id);

-- Trigger to auto-calculate available_quantity
CREATE OR REPLACE FUNCTION update_available_quantity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.available_quantity = NEW.quantity - NEW.reserved_quantity;
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_levels_available
    BEFORE INSERT OR UPDATE ON stock_levels
    FOR EACH ROW
    EXECUTE FUNCTION update_available_quantity();

-- 4. CHECKOUT SESSIONS
-- Tracks parts checked out to technicians
-- =============================================
CREATE TABLE IF NOT EXISTS checkout_sessions (
    id TEXT PRIMARY KEY,
    technician_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    from_location_id TEXT NOT NULL REFERENCES stock_locations(id),
    to_location_id TEXT NOT NULL REFERENCES stock_locations(id),
    status TEXT NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    checkout_date TIMESTAMPTZ DEFAULT NOW(),
    expected_return_date TIMESTAMPTZ,
    actual_return_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_checkout_technician ON checkout_sessions(technician_id);
CREATE INDEX idx_checkout_status ON checkout_sessions(status);

-- 5. CHECKOUT ITEMS
-- Individual items in a checkout session
-- =============================================
CREATE TABLE IF NOT EXISTS checkout_items (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES checkout_sessions(id) ON DELETE CASCADE,
    part_id TEXT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    quantity_checked_out INTEGER NOT NULL,
    quantity_used INTEGER DEFAULT 0,
    quantity_returned INTEGER DEFAULT 0,
    quantity_damaged INTEGER DEFAULT 0,
    serial_numbers TEXT[],
    status TEXT NOT NULL DEFAULT 'CHECKED_OUT'
        CHECK (status IN ('CHECKED_OUT', 'PARTIALLY_USED', 'FULLY_USED', 'RETURNED', 'PENDING_RETURN')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_checkout_items_session ON checkout_items(session_id);
CREATE INDEX idx_checkout_items_part ON checkout_items(part_id);

-- 6. PART USAGE
-- Tracks when parts are used on work orders
-- =============================================
CREATE TABLE IF NOT EXISTS part_usage (
    id TEXT PRIMARY KEY,
    work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    part_id TEXT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    checkout_session_id TEXT REFERENCES checkout_sessions(id),
    quantity INTEGER NOT NULL,
    serial_number TEXT,
    reason TEXT,
    before_photo_url TEXT,
    after_photo_url TEXT,
    customer_approved BOOLEAN DEFAULT false,
    customer_signature_url TEXT,
    installation_date TIMESTAMPTZ,
    warranty_expiration_date TIMESTAMPTZ,
    replacement_recommendation TEXT,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_part_usage_work_order ON part_usage(work_order_id);
CREATE INDEX idx_part_usage_part ON part_usage(part_id);
CREATE INDEX idx_part_usage_tech ON part_usage(technician_id);

-- 7. SERIALIZED PARTS
-- Tracks individual serial numbered parts
-- =============================================
CREATE TABLE IF NOT EXISTS serialized_parts (
    id TEXT PRIMARY KEY,
    part_id TEXT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    serial_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'IN_STOCK'
        CHECK (status IN ('IN_STOCK', 'CHECKED_OUT', 'INSTALLED', 'RETURNED', 'DEFECTIVE', 'DISPOSED')),
    current_location_id TEXT NOT NULL REFERENCES stock_locations(id),
    installation_date TIMESTAMPTZ,
    installed_on_equipment_id TEXT,
    installed_at_work_order_id TEXT REFERENCES work_orders(id),
    warranty_expiration_date TIMESTAMPTZ,
    service_history JSONB DEFAULT '[]'::jsonb,
    purchase_date TIMESTAMPTZ,
    purchase_cost NUMERIC(10, 2),
    supplier_batch_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_serialized_part ON serialized_parts(part_id);
CREATE INDEX idx_serialized_number ON serialized_parts(serial_number);
CREATE INDEX idx_serialized_status ON serialized_parts(status);

-- 8. RMA REQUESTS
-- Return Merchandise Authorization
-- =============================================
CREATE TABLE IF NOT EXISTS rma_requests (
    id TEXT PRIMARY KEY,
    part_id TEXT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    serial_number TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    reason TEXT NOT NULL
        CHECK (reason IN ('DEFECTIVE', 'DAMAGED', 'WRONG_PART', 'EXPIRED', 'OTHER')),
    description TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    request_date TIMESTAMPTZ DEFAULT NOW(),
    rma_number TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SHIPPED', 'COMPLETED')),
    supplier_response TEXT,
    resolution_type TEXT
        CHECK (resolution_type IN ('REPLACEMENT', 'REFUND', 'CREDIT')),
    resolution_date TIMESTAMPTZ,
    tracking_number TEXT
);

-- Indexes
CREATE INDEX idx_rma_status ON rma_requests(status);
CREATE INDEX idx_rma_part ON rma_requests(part_id);
CREATE INDEX idx_rma_rma_number ON rma_requests(rma_number);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE stock_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE serialized_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rma_requests ENABLE ROW LEVEL SECURITY;

-- === STOCK LOCATIONS ===
-- All authenticated users can read locations
CREATE POLICY "Anyone can view stock locations"
    ON stock_locations FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can modify
CREATE POLICY "Service can modify stock locations"
    ON stock_locations FOR ALL
    TO service_role
    USING (true);

-- === PARTS CATALOG ===
-- All authenticated users can read parts
CREATE POLICY "Anyone can view parts"
    ON parts FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can modify
CREATE POLICY "Service can modify parts"
    ON parts FOR ALL
    TO service_role
    USING (true);

-- === STOCK LEVELS ===
-- All authenticated users can read stock levels
CREATE POLICY "Anyone can view stock levels"
    ON stock_levels FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can modify
CREATE POLICY "Service can modify stock levels"
    ON stock_levels FOR ALL
    TO service_role
    USING (true);

-- === CHECKOUT SESSIONS ===
-- Technicians can view their own checkouts
CREATE POLICY "Technicians view own checkouts"
    ON checkout_sessions FOR SELECT
    TO authenticated
    USING (technician_id = auth.uid());

-- Admins can view all
CREATE POLICY "Admins view all checkouts"
    ON checkout_sessions FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can modify
CREATE POLICY "Service can modify checkouts"
    ON checkout_sessions FOR ALL
    TO service_role
    USING (true);

-- === CHECKOUT ITEMS ===
CREATE POLICY "Anyone can view checkout items"
    ON checkout_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service can modify checkout items"
    ON checkout_items FOR ALL
    TO service_role
    USING (true);

-- === PART USAGE ===
CREATE POLICY "Technicians view own usage"
    ON part_usage FOR SELECT
    TO authenticated
    USING (technician_id = auth.uid());

CREATE POLICY "Service can modify part usage"
    ON part_usage FOR ALL
    TO service_role
    USING (true);

-- === SERIALIZED PARTS ===
CREATE POLICY "Anyone can view serialized parts"
    ON serialized_parts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service can modify serialized parts"
    ON serialized_parts FOR ALL
    TO service_role
    USING (true);

-- === RMA REQUESTS ===
CREATE POLICY "Users view own RMA requests"
    ON rma_requests FOR SELECT
    TO authenticated
    USING (requested_by = auth.uid());

CREATE POLICY "Service can modify RMA requests"
    ON rma_requests FOR ALL
    TO service_role
    USING (true);

-- =============================================
-- HELPER VIEW: Inventory Summary
-- =============================================
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
    p.id as part_id,
    p.part_number,
    p.name,
    p.category,
    p.min_stock_level,
    p.unit_price,
    COALESCE(SUM(sl.quantity), 0) as total_quantity,
    COALESCE(SUM(sl.available_quantity), 0) as total_available,
    COUNT(sl.location_id) as location_count
FROM parts p
LEFT JOIN stock_levels sl ON p.id = sl.part_id
GROUP BY p.id, p.part_number, p.name, p.category, p.min_stock_level, p.unit_price;

-- =============================================
-- TEST DATA INSERT (Optional - for testing)
-- =============================================
-- Uncomment to insert test data:
/*
INSERT INTO stock_locations (id, type, name, address, is_active) VALUES
    ('loc-wh-001', 'WAREHOUSE', 'Central Warehouse', '1234 Industrial Blvd, Houston, TX 77001', true),
    ('loc-wh-002', 'WAREHOUSE', 'North Distribution Center', '5678 Commerce Way, Dallas, TX 75201', true),
    ('loc-tech-001', 'TECHNICIAN', 'John Smith (Technician)', NULL, true),
    ('loc-tech-002', 'TECHNICIAN', 'Sarah Johnson (Technician)', NULL, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO parts (id, part_number, name, description, category, unit_cost, unit_price, min_stock_level, reorder_quantity, supplier, is_serial_tracked)
VALUES 
    ('part-001', 'HVAC-REF-001', 'Copeland Scroll Compressor', 'High-efficiency scroll compressor for residential HVAC', 'HVAC', 850.00, 1299.99, 5, 10, 'Copeland', true),
    ('part-002', 'HVAC-CAP-002', 'Run Capacitor 45/5 MFD', 'Dual run capacitor for AC systems', 'HVAC', 12.50, 24.99, 50, 100, 'MARS', false),
    ('part-003', 'PLMB-VLV-001', 'Brass Ball Valve 1/2"', 'Lead-free brass ball valve', 'Plumbing', 8.75, 18.49, 100, 200, 'Apollo Valves', false)
ON CONFLICT (id) DO NOTHING;
*/