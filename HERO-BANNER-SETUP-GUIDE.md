# Hero Banner Carousel Setup Guide

## Overview
The hero banner carousel system has been fully implemented with role-based admin access control. Multiple authenticated admins can manage up to 3 rotating banner images that display on the dashboard.

---

## Database Migrations (Run in Supabase SQL Editor)

### Step 1: Add Admin Role System
**File:** `add-admin-role-to-users.sql`

This migration:
- Adds `is_admin` column to the users table
- Creates an index for fast admin checks
- Grants admin status to specified users (update emails in the SQL file)

**IMPORTANT:** Edit line 40-43 in the SQL file to include your admin email(s):
```sql
UPDATE public.users
SET is_admin = true
WHERE email IN (
  'grjeff@gmail.com',  -- Replace with your actual admin emails
  'your-dev@email.com'  -- Add more admins here
);
```

### Step 2: Create Hero Banners Table
**File:** `create-hero-banners-table.sql`

This migration:
- Creates the `hero_banners` table with 3 slots
- Enables Row Level Security (RLS)
- Sets up policies so only admins can manage banners
- Creates automatic `updated_at` trigger

**Run this AFTER running `add-admin-role-to-users.sql`**

---

## Components Created

### 1. HeroBannerCarousel Component
**File:** `src/components/HeroBannerCarousel.jsx`
- Fetches active banners from database
- Rotates through banners on each page refresh
- Uses sessionStorage to track last shown banner
- Supports optional click-through URLs

### 2. Dashboard Integration
**File:** `src/components/Dashboard.jsx` (line 630)
- Carousel displays below main hero image
- Visible to all users (authenticated + anonymous)

### 3. AdminPanel Management
**File:** `src/components/AdminPanel.jsx`
- Full UI for managing all 3 banner slots
- Image upload to Supabase Storage (`Hero-Banners-Geotagged` bucket)
- Geotagging fields (zip code, target radius)
- Loading indicators during upload
- Individual save buttons per slot

---

## Security Features

### Authentication Required
- Admins must sign in with their own email/password
- No more shared admin login (more secure!)

### Role-Based Access Control (RBAC)
- Only users with `is_admin = true` can access Admin Panel
- Non-admin users see "Access Denied" message
- RLS policies enforce admin-only database access

### RLS Policies
1. **Public users**: Can only SELECT active banners (`is_active = true`)
2. **Admin users**: Full CRUD access (Create, Read, Update, Delete)
3. **Admin check**: All policies verify `users.is_admin = true`

---

## Usage Instructions

### For You (Setting Up Now)

1. **Run Database Migrations:**
   ```sql
   -- In Supabase SQL Editor:
   -- 1. Run add-admin-role-to-users.sql (edit emails first!)
   -- 2. Run create-hero-banners-table.sql
   ```

2. **Verify Admin Status:**
   ```sql
   -- Check which users are admins:
   SELECT email, first_name, last_name, is_admin
   FROM public.users
   WHERE is_admin = true;
   ```

3. **Upload Hero Banners:**
   - Go to `/admin` and sign in with your admin account
   - Navigate to "Dashboard" tab
   - Upload 1-3 banner images (1200x300px recommended)
   - Fill in optional fields (click URL, geotagging, alt text)
   - Click "Save Banner X" for each slot

### For Your Dev Team (Next Year)

**To grant admin access to a new user:**

```sql
-- Make user an admin:
UPDATE public.users
SET is_admin = true
WHERE email = 'newadmin@example.com';

-- Verify:
SELECT email, is_admin FROM public.users WHERE email = 'newadmin@example.com';
```

**To revoke admin access:**

```sql
UPDATE public.users
SET is_admin = false
WHERE email = 'oldadmin@example.com';
```

---

## How It Works

### Rotation Logic
1. User loads dashboard
2. HeroBannerCarousel fetches all active banners (ordered by slot_number)
3. Checks `sessionStorage.lastHeroBannerIndex` to see which banner was shown last
4. Shows the next banner in rotation
5. Saves new index to sessionStorage

**Example:**
- First visit: Shows Banner 1
- Refresh: Shows Banner 2
- Refresh: Shows Banner 3
- Refresh: Shows Banner 1 (loops back)

### Geotagging (Optional)
You can target banners by location:
- Set `target_zip` (e.g., "49503")
- Set `target_radius` (25, 50, 100 miles, statewide, or national)

**Note:** Geotagging logic is not yet implemented in the frontend. When you're ready to add it, you'll filter banners in HeroBannerCarousel.jsx based on user's location.

---

## Files Changed/Created

### New Files
- ✅ `add-admin-role-to-users.sql` - Admin role migration
- ✅ `create-hero-banners-table.sql` - Hero banners table migration
- ✅ `src/components/HeroBannerCarousel.jsx` - Carousel component
- ✅ `HERO-BANNER-SETUP-GUIDE.md` - This file

### Modified Files
- ✅ `src/components/Dashboard.jsx` - Added carousel (line 630)
- ✅ `src/components/AdminPanel.jsx` - Added banner management UI & admin role check

---

## Testing Checklist

- [ ] Run both SQL migrations in Supabase SQL Editor
- [ ] Verify your email has `is_admin = true` in users table
- [ ] Sign in to `/admin` with your credentials
- [ ] Upload a test banner to Slot 1
- [ ] Verify banner appears on dashboard
- [ ] Refresh dashboard multiple times to see rotation (if multiple banners uploaded)
- [ ] Test that non-admin users cannot access Admin Panel

---

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify RLS policies in Supabase Dashboard → Authentication → Policies
3. Confirm Supabase Storage bucket `Hero-Banners-Geotagged` exists and is public
4. Ensure migrations ran successfully without errors

---

**Next Steps:**
Ready to go! Just run the two SQL migrations and start uploading your hero banners for the December events. 🎉
