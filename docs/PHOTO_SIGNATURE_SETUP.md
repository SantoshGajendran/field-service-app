# Photo & Signature Feature - Database Setup

## Overview
This guide helps you set up the database schema and storage bucket for the photo capture and signature features.

## Steps to Apply Changes

### 1. Run Database Migrations

You have two options:

#### Option A: Using Supabase CLI (Recommended)
```bash
# Make sure you're logged in to Supabase CLI
supabase login

# Link to your project (if not already linked)
supabase link --project-ref dvqmmnvfsjadzrjbdkya

# Push migrations to Supabase
supabase db push
```

#### Option B: Manual SQL Execution
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dvqmmnvfsjadzrjbdkya
2. Navigate to **SQL Editor**
3. Run the following migrations in order:

**Migration 1: Create Storage Bucket**
```sql
-- Copy contents from: supabase/migrations/20260502_create_storage_bucket.sql
```

**Migration 2: Add Photos and Signature Columns**
```sql
-- Copy contents from: supabase/migrations/20260502_add_photos_signature.sql
```

### 2. Verify Setup

After running migrations, verify:

1. **Storage Bucket**: Go to **Storage** in Supabase Dashboard
   - You should see a bucket named `work-order-photos`
   - It should be marked as **Public**

2. **Table Columns**: Go to **Table Editor** → `work_orders`
   - Verify `photos` column exists (type: jsonb)
   - Verify `signature_url` column exists (type: text)

3. **RLS Policies**: Go to **Authentication** → **Policies** → **storage.objects**
   - You should see 4 policies for the `work-order-photos` bucket

### 3. Test the Feature

1. Build and run the app:
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```

2. Open a work order and test:
   - Click "Take Photo" to capture from camera
   - Click "Gallery" to pick from gallery
   - Complete a work order and add a signature

## Troubleshooting

### Photos not uploading?
- Check that the storage bucket exists and is public
- Verify RLS policies are enabled
- Check browser console for errors

### Signature not saving?
- Ensure work order status is "COMPLETED"
- Check that signature_url column exists in work_orders table

### Permission errors?
- Verify you're authenticated
- Check RLS policies allow authenticated users to upload

## What's New

### Features Added:
✅ Camera integration for taking photos
✅ Gallery picker for selecting existing photos
✅ Photo upload to Supabase Storage
✅ Photo gallery display in work order details
✅ Delete photos functionality
✅ Signature pad for customer sign-off
✅ Signature capture and storage
✅ Signature display and clear functionality

### Database Changes:
- Added `photos` column (JSONB array) to `work_orders` table
- Added `signature_url` column (TEXT) to `work_orders` table
- Created `work-order-photos` storage bucket
- Added RLS policies for authenticated users

### New Services:
- `PhotoService`: Handles camera, gallery, and upload operations
- `SignaturePadComponent`: Reusable signature capture component
