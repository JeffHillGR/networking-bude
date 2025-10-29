# Photo Upload Setup for Supabase

## Step 1: Create Storage Bucket

1. Go to your Supabase project: https://moqhghbqapcppzydgqyt.supabase.co
2. Click "Storage" in the left sidebar
3. Click "Create a new bucket"
4. Settings:
   - **Name:** `profile-photos`
   - **Public bucket:** ✅ **Yes** (so photos are publicly accessible)
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/jpg`
5. Click "Create bucket"

## Step 2: Add profile_photo_url Column to users Table

Run this SQL in the Supabase SQL Editor:

```sql
-- Add profile_photo_url column to users table
ALTER TABLE users
ADD COLUMN profile_photo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.profile_photo_url IS 'URL to user profile photo stored in Supabase Storage';
```

## Step 3: Set Storage Policies

Run this SQL to allow users to upload/view their own photos:

```sql
-- Policy: Users can upload their own profile photos
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own profile photos
CREATE POLICY "Users can update their own profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own profile photos
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view profile photos (public bucket)
CREATE POLICY "Public profile photos are viewable by everyone"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
```

## Step 4: Test in Console

After setup, you can test by going to Storage > profile-photos and trying to upload a test image manually.

## File Structure

Photos will be stored as:
```
profile-photos/
  └── {user_id}/
      └── profile.jpg
```

Example URL:
```
https://moqhghbqapcppzydgqyt.supabase.co/storage/v1/object/public/profile-photos/{user_id}/profile.jpg
```

## Next: Implement in Code

After completing these Supabase steps, the React component will be updated to:
1. Allow file selection (jpg, png, webp)
2. Validate file size (<5MB)
3. Upload to Supabase Storage
4. Update users table with photo URL
5. Display uploaded photo in profile
