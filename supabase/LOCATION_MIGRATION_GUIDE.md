# Location Fields Migration Guide

## Overview
This migration adds GPS location tracking fields to the `work_orders` table in Supabase.

## What Gets Added

### New Columns:
1. **check_in** (JSONB) - Stores check-in location and timestamp
2. **check_out** (JSONB) - Stores check-out location, timestamp, duration, and distance
3. **work_order_location** (JSONB) - Stores the work site location

### Indexes:
- GIN indexes on all three columns for efficient JSON queries

---

## How to Run the Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste:**
   - Open `supabase/migrations/20260502_add_location_fields.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Migration:**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for success message

5. **Verify:**
   - Go to "Table Editor" → "work_orders"
   - Check that the new columns appear

---

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd C:\Santosh\Development\FieldServiceApp\field-service-app

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

---

### Option 3: Manual SQL Execution

```bash
# Connect to your database using psql or any PostgreSQL client
psql -h YOUR_DB_HOST -U postgres -d postgres

# Then paste the migration SQL
\i supabase/migrations/20260502_add_location_fields.sql
```

---

## Data Structure Examples

### check_in:
```json
{
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "accuracy": 10.5,
    "timestamp": "2026-05-02T18:30:00.000Z"
  },
  "timestamp": "2026-05-02T18:30:00.000Z",
  "address": "123 Main St, San Francisco, CA"
}
```

### check_out:
```json
{
  "location": {
    "latitude": 37.7750,
    "longitude": -122.4195,
    "accuracy": 12.3,
    "timestamp": "2026-05-02T20:15:00.000Z"
  },
  "timestamp": "2026-05-02T20:15:00.000Z",
  "address": "123 Main St, San Francisco, CA",
  "duration": 105,
  "distance": 50
}
```

---

## Verification Steps

After running the migration:

1. **Check columns exist:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'work_orders' 
   AND column_name IN ('check_in', 'check_out', 'work_order_location');
   ```

2. **Check indexes exist:**
   ```sql
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename = 'work_orders' 
   AND indexname LIKE 'idx_work_orders_%';
   ```

3. **Test insert:**
   ```sql
   UPDATE work_orders 
   SET check_in = '{"location": {"latitude": 37.7749, "longitude": -122.4194, "accuracy": 10.5, "timestamp": "2026-05-02T18:30:00.000Z"}, "timestamp": "2026-05-02T18:30:00.000Z"}'::jsonb
   WHERE id = 'YOUR_TEST_WORK_ORDER_ID';
   ```

---

## Rollback (If Needed)

If you need to undo this migration:

```sql
-- Remove indexes
DROP INDEX IF EXISTS idx_work_orders_check_in;
DROP INDEX IF EXISTS idx_work_orders_check_out;
DROP INDEX IF EXISTS idx_work_orders_location;

-- Remove columns
ALTER TABLE work_orders DROP COLUMN IF EXISTS check_in;
ALTER TABLE work_orders DROP COLUMN IF EXISTS check_out;
ALTER TABLE work_orders DROP COLUMN IF EXISTS work_order_location;
```

---

## Notes

- **JSONB vs JSON:** Using JSONB for better performance and indexing
- **Nullable:** All columns are nullable (work orders may not have location data yet)
- **Backward Compatible:** Existing work orders will have NULL values for these fields
- **No Data Loss:** This is an additive migration - no existing data is modified

---

## Next Steps

After running the migration:

1. ✅ Test check-in/check-out in the app
2. ✅ Verify data syncs to Supabase
3. ✅ Check location data appears in Supabase dashboard
4. ✅ Test offline mode with location tracking
5. ✅ Build and test on Android device

---

**Migration File:** `supabase/migrations/20260502_add_location_fields.sql`  
**Created:** 2026-05-02  
**Status:** Ready to run
