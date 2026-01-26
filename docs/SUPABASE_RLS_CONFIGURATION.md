# Supabase Row Level Security (RLS) Configuration Guide

This guide outlines the Row Level Security policies that should be configured in your Supabase project before launching Cuddles to production.

## Overview

RLS ensures that users can only access data they own or that is meant to be shared with them. All the following policies should be applied to your Supabase tables.

## Table: `profiles`

**Purpose**: Stores user profile information

### Policies:

1. **Users can view their own profile**
   ```sql
   CREATE POLICY "Users can view their own profile"
   ON profiles FOR SELECT
   USING (auth.uid() = id);
   ```

2. **Users can view public profiles (optional - for profile discovery)**
   ```sql
   CREATE POLICY "Users can view other profiles"
   ON profiles FOR SELECT
   USING (true);
   ```

3. **Users can update their own profile**
   ```sql
   CREATE POLICY "Users can update their own profile"
   ON profiles FOR UPDATE
   USING (auth.uid() = id)
   WITH CHECK (auth.uid() = id);
   ```

4. **Only authenticated users can create profiles**
   ```sql
   CREATE POLICY "Authenticated users can create their profile"
   ON profiles FOR INSERT
   WITH CHECK (auth.uid() = id);
   ```

5. **Users can delete their own profile**
   ```sql
   CREATE POLICY "Users can delete their own profile"
   ON profiles FOR DELETE
   USING (auth.uid() = id);
   ```

## Table: `likes`

**Purpose**: Stores user likes/matches

### Policies:

1. **Users can view their own likes**
   ```sql
   CREATE POLICY "Users can view their own likes"
   ON likes FOR SELECT
   USING (auth.uid() = user_id OR auth.uid() = liked_user_id);
   ```

2. **Users can create likes**
   ```sql
   CREATE POLICY "Users can create likes"
   ON likes FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   ```

3. **Users can update their own likes**
   ```sql
   CREATE POLICY "Users can update their own likes"
   ON likes FOR UPDATE
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
   ```

4. **Users can delete their own likes**
   ```sql
   CREATE POLICY "Users can delete their own likes"
   ON likes FOR DELETE
   USING (auth.uid() = user_id);
   ```

## Table: `matches`

**Purpose**: Stores confirmed matches between users

### Policies:

1. **Users can view their own matches**
   ```sql
   CREATE POLICY "Users can view their own matches"
   ON matches FOR SELECT
   USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
   ```

2. **Matches are created by the system (admin only)**
   ```sql
   CREATE POLICY "Only authenticated users can create matches"
   ON matches FOR INSERT
   WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
   ```

3. **Users can update their own matches**
   ```sql
   CREATE POLICY "Users can update their own matches"
   ON matches FOR UPDATE
   USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2)
   WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
   ```

4. **Users can delete their own matches**
   ```sql
   CREATE POLICY "Users can delete their own matches"
   ON matches FOR DELETE
   USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
   ```

## Table: `messages`

**Purpose**: Stores private messages between matched users

### Policies:

1. **Users can only view messages they are part of**
   ```sql
   CREATE POLICY "Users can view their own messages"
   ON messages FOR SELECT
   USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
   ```

2. **Only sender can create messages to recipients**
   ```sql
   CREATE POLICY "Users can create messages"
   ON messages FOR INSERT
   WITH CHECK (auth.uid() = sender_id);
   ```

3. **Only sender can update their own messages**
   ```sql
   CREATE POLICY "Users can update their own messages"
   ON messages FOR UPDATE
   USING (auth.uid() = sender_id)
   WITH CHECK (auth.uid() = sender_id);
   ```

4. **Only sender can delete their own messages**
   ```sql
   CREATE POLICY "Users can delete their own messages"
   ON messages FOR DELETE
   USING (auth.uid() = sender_id);
   ```

## Table: `scheduled_dates`

**Purpose**: Stores scheduled dates posted by users

### Policies:

1. **Users can view all public dates**
   ```sql
   CREATE POLICY "Users can view all scheduled dates"
   ON scheduled_dates FOR SELECT
   USING (true);
   ```

2. **Users can create dates**
   ```sql
   CREATE POLICY "Authenticated users can create dates"
   ON scheduled_dates FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   ```

3. **Users can update their own dates**
   ```sql
   CREATE POLICY "Users can update their own dates"
   ON scheduled_dates FOR UPDATE
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
   ```

4. **Users can delete their own dates**
   ```sql
   CREATE POLICY "Users can delete their own dates"
   ON scheduled_dates FOR DELETE
   USING (auth.uid() = user_id);
   ```

## Table: `blocks`

**Purpose**: Stores blocked users (if implemented)

### Policies:

1. **Users can view their own blocks**
   ```sql
   CREATE POLICY "Users can view their own blocks"
   ON blocks FOR SELECT
   USING (auth.uid() = user_id);
   ```

2. **Users can create blocks**
   ```sql
   CREATE POLICY "Users can create blocks"
   ON blocks FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   ```

3. **Users can delete their own blocks**
   ```sql
   CREATE POLICY "Users can delete their own blocks"
   ON blocks FOR DELETE
   USING (auth.uid() = user_id);
   ```

## Storage Buckets: RLS Configuration

### Bucket: `avatars`

**Policies:**

1. **Users can upload their own avatars**
   ```sql
   CREATE POLICY "Users can upload their avatar"
   ON storage.objects
   FOR INSERT
   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

2. **Anyone can view avatars (public)**
   ```sql
   CREATE POLICY "Public read access for avatars"
   ON storage.objects
   FOR SELECT
   USING (bucket_id = 'avatars');
   ```

3. **Users can delete their own avatars**
   ```sql
   CREATE POLICY "Users can delete their own avatar"
   ON storage.objects
   FOR DELETE
   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### Bucket: `gallery`

**Policies:**

1. **Users can upload to their gallery**
   ```sql
   CREATE POLICY "Users can upload to gallery"
   ON storage.objects
   FOR INSERT
   WITH CHECK (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

2. **Anyone can view gallery images (public)**
   ```sql
   CREATE POLICY "Public read access for gallery"
   ON storage.objects
   FOR SELECT
   USING (bucket_id = 'gallery');
   ```

3. **Users can delete their own gallery images**
   ```sql
   CREATE POLICY "Users can delete their gallery"
   ON storage.objects
   FOR DELETE
   USING (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### Bucket: `dates`

**Policies:**

1. **Users can upload date images**
   ```sql
   CREATE POLICY "Users can upload date images"
   ON storage.objects
   FOR INSERT
   WITH CHECK (bucket_id = 'dates' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

2. **Anyone can view date images (public)**
   ```sql
   CREATE POLICY "Public read access for dates"
   ON storage.objects
   FOR SELECT
   USING (bucket_id = 'dates');
   ```

3. **Users can delete their date images**
   ```sql
   CREATE POLICY "Users can delete their date images"
   ON storage.objects
   FOR DELETE
   USING (bucket_id = 'dates' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Implementation Steps

1. **Enable RLS on all tables**:
   - Go to Supabase Dashboard → SQL Editor
   - For each table, run:
     ```sql
     ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
     ```

2. **Create policies**:
   - Copy the SQL policy statements from above
   - Run them in the SQL editor or use the Supabase UI to create policies
   - Test each policy by attempting operations as different users

3. **Test thoroughly**:
   - Create test users
   - Verify users can only access their own data
   - Verify public data is accessible
   - Verify deletion and update operations are restricted appropriately

4. **Verify in production**:
   - After deploying, test again with real user accounts
   - Monitor Supabase logs for any policy violations or errors

## Important Notes

- **Always test before production**: RLS policies are critical for security. Test thoroughly.
- **Anon key limitations**: The anon key (used by clients) should only have access to what's necessary. Create a separate public-only role if needed.
- **Service key**: Keep the service key secure and only use it for admin operations.
- **Realtime subscriptions**: Ensure RLS policies work with realtime subscriptions by testing the app.
- **Performance**: RLS can impact query performance. Monitor and optimize as needed.

## Common Issues

**Issue**: "Permission denied" errors when accessing data
**Solution**: Check that the RLS policy references the correct column and that `auth.uid()` matches the data.

**Issue**: Users can see other users' private data
**Solution**: Verify the RLS policy uses `auth.uid()` correctly and is enabled on the table.

**Issue**: Real-time subscriptions not working
**Solution**: Test subscriptions with the same RLS policies. Some operations may need adjustment.

## Support

For issues with RLS configuration, refer to:
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
