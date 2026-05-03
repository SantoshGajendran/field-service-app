-- Add photos and signature columns to work_orders table
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN work_orders.photos IS 'Array of photo objects with url, path, and timestamp';
COMMENT ON COLUMN work_orders.signature_url IS 'URL to customer signature image';
