# Supabase Setup Guide
## Real API Integration for Field Service App

---

## Step 1: Create Supabase Account (5 minutes)

1. Go to: **https://supabase.com**
2. Click: **"Start your project"**
3. Sign up with: **GitHub** or **Email**
4. Verify your email if needed

---

## Step 2: Create New Project (5 minutes)

1. Click: **"New Project"**
2. Fill in:
   - **Name**: `field-service-app`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (perfect for demo)

3. Click: **"Create new project"**
4. Wait 2-3 minutes for project to initialize

---

## Step 3: Get API Credentials (2 minutes)

1. In your Supabase dashboard, click: **Settings** (gear icon)
2. Click: **API** in the left sidebar
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

4. **COPY BOTH VALUES** - you'll need them next!

---

## Step 4: Update Environment File (2 minutes)

1. Open: `src/environments/environment.ts`
2. Replace:
   ```typescript
   url: 'YOUR_SUPABASE_URL'
   ```
   with your **Project URL**

3. Replace:
   ```typescript
   anonKey: 'YOUR_SUPABASE_ANON_KEY'
   ```
   with your **anon public key**

4. Save the file

---

## Step 5: Create Database Schema (3 minutes)

1. In Supabase dashboard, click: **SQL Editor** (left sidebar)
2. Click: **"New query"**
3. Copy entire contents of: `supabase/schema.sql`
4. Paste into SQL Editor
5. Click: **"Run"** (or press Ctrl+Enter)
6. You should see: ✅ Success message

---

## Step 6: Load Demo Data (2 minutes)

1. Still in SQL Editor, click: **"New query"**
2. Copy entire contents of: `supabase/demo-data.sql`
3. Paste into SQL Editor
4. Click: **"Run"**
5. You should see: ✅ Success message

---

## Step 7: Create Demo Users (5 minutes)

1. In Supabase dashboard, click: **Authentication** (left sidebar)
2. Click: **"Add user"** → **"Create new user"**

### Admin User:
- **Email**: `admin@saazvat.com`
- **Password**: `admin123`
- Click: **"Create user"**

### Technician User:
- **Email**: `tech@saazvat.com`
- **Password**: `tech123`
- Click: **"Create user"**

---

## Step 8: Create User Profiles (5 minutes)

1. Go back to: **SQL Editor**
2. Click: **"New query"**
3. Run this SQL (replace UUIDs with actual user IDs from Auth):

```sql
-- Get user IDs first
SELECT id, email FROM auth.users;

-- Then insert profiles (replace the UUIDs with actual IDs from above)
INSERT INTO public.profiles (id, username, full_name, role, email) VALUES
('ADMIN_USER_UUID_HERE', 'admin', 'Admin User', 'Administrator', 'admin@saazvat.com'),
('TECH_USER_UUID_HERE', 'tech', 'John Technician', 'Field Service Technician', 'tech@saazvat.com');
```

4. Click: **"Run"**

---

## Step 9: Update Work Orders with User IDs (3 minutes)

1. In SQL Editor, run:

```sql
-- Get the admin user ID
SELECT id FROM public.profiles WHERE role = 'Administrator';

-- Update some work orders to be assigned to admin
UPDATE public.work_orders 
SET assigned_to = (SELECT id FROM public.profiles WHERE role = 'Administrator' LIMIT 1)
WHERE id IN ('WO-002', 'WO-007', 'WO-009', 'WO-014');

-- Get the tech user ID
SELECT id FROM public.profiles WHERE role = 'Field Service Technician';

-- Update remaining work orders to be assigned to tech
UPDATE public.work_orders 
SET assigned_to = (SELECT id FROM public.profiles WHERE role = 'Field Service Technician' LIMIT 1)
WHERE assigned_to IS NULL;
```

---

## Step 10: Test the Integration (5 minutes)

1. In your terminal, run:
   ```bash
   npm start
   ```

2. Open browser: `http://localhost:4200`

3. Try logging in:
   - **Username**: `admin@saazvat.com`
   - **Password**: `admin123`

4. You should see:
   - ✅ Real work orders from Supabase
   - ✅ Real statistics on admin dashboard
   - ✅ Real-time updates

---

## Step 11: Verify Data in Supabase (2 minutes)

1. In Supabase dashboard, click: **Table Editor**
2. Click: **work_orders** table
3. You should see 15 work orders
4. Click: **checklists** table
5. You should see 7 checklists
6. Click: **profiles** table
7. You should see 2 users

---

## Troubleshooting

### Login fails with "Invalid username or password"
- Check that you created users in Authentication
- Check that you created profiles in profiles table
- Make sure email matches exactly

### No work orders showing
- Check that schema.sql ran successfully
- Check that demo-data.sql ran successfully
- Check browser console for errors

### "Failed to fetch" errors
- Check that environment.ts has correct URL and key
- Check that Supabase project is running (green status)
- Check browser console for CORS errors

### Real-time updates not working
- This is normal - real-time requires additional setup
- Work orders will still load and update correctly
- Real-time is a bonus feature, not required for demo

---

## What You Get

✅ **Real Database**: PostgreSQL hosted by Supabase  
✅ **Real Authentication**: Secure user login  
✅ **Real API**: REST API with instant endpoints  
✅ **Real Data**: 15 realistic work orders  
✅ **Real Statistics**: Live completion rates  
✅ **Offline Support**: Still works without internet  
✅ **Production Ready**: Scalable infrastructure  

---

## Next Steps

After setup is complete:

1. Test all features in the app
2. Build new APK with real API
3. Install on your phone
4. Test offline mode
5. Practice demo flow
6. You're ready for presentation! 🚀

---

**Total Setup Time**: ~30-40 minutes

**Created**: May 2, 2026  
**For Presentation**: May 4, 2026
