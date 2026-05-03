-- Add location tracking fields to work_orders table
-- Migration: Add check_in, check_out, and work_order_location columns

-- Add check_in column (JSONB to store location data and timestamp)
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS check_in JSONB;

-- Add check_out column (JSONB to store location data, timestamp, duration, and distance)
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS check_out JSONB;

-- Add work_order_location column (JSONB to store the work site location)
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS work_order_location JSONB;

-- Add comments for documentation
COMMENT ON COLUMN work_orders.check_in IS 'Check-in data: { location: { latitude, longitude, accuracy, timestamp }, timestamp, address? }';
COMMENT ON COLUMN work_orders.check_out IS 'Check-out data: { location: { latitude, longitude, accuracy, timestamp }, timestamp, address?, duration, distance }';
COMMENT ON COLUMN work_orders.work_order_location IS 'Work site location: { latitude, longitude, accuracy, timestamp, address? }';

-- Create indexes for better query performance on location data
CREATE INDEX IF NOT EXISTS idx_work_orders_check_in ON work_orders USING GIN (check_in);
CREATE INDEX IF NOT EXISTS idx_work_orders_check_out ON work_orders USING GIN (check_out);
CREATE INDEX IF NOT EXISTS idx_work_orders_location ON work_orders USING GIN (work_order_location);

-- Example of the expected JSON structure:
-- check_in: {
--   "location": {
--     "latitude": 37.7749,
--     "longitude": -122.4194,
--     "accuracy": 10.5,
--     "timestamp": "2026-05-02T18:30:00.000Z"
--   },
--   "timestamp": "2026-05-02T18:30:00.000Z",
--   "address": "123 Main St, San Francisco, CA" (optional)
-- }
--
-- check_out: {
--   "location": {
--     "latitude": 37.7750,
--     "longitude": -122.4195,
--     "accuracy": 12.3,
--     "timestamp": "2026-05-02T20:15:00.000Z"
--   },
--   "timestamp": "2026-05-02T20:15:00.000Z",
--   "address": "123 Main St, San Francisco, CA" (optional),
--   "duration": 105 (minutes),
--   "distance": 50 (meters)
-- }
