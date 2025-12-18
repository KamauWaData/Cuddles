-- ============================================================================
-- SUPABASE SCHEMA EXTENSIONS FOR DATING APP MVP FEATURES
-- ============================================================================
-- Run these SQL migrations in your Supabase dashboard under SQL Editor
-- This adds support for: verification, push notifications, advanced filters,
-- read receipts, typing indicators, and online status
-- ============================================================================

-- ============================================================================
-- 1. USER VERIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL DEFAULT 'selfie', -- 'selfie', 'id', 'email', 'phone'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  image_url TEXT, -- URL to the verification image (Cloudinary)
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, verification_type)
);

CREATE INDEX idx_user_verifications_user_id ON user_verifications(user_id);
CREATE INDEX idx_user_verifications_status ON user_verifications(status);

-- ============================================================================
-- 2. PUSH NOTIFICATIONS / DEVICE TOKENS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  device_type TEXT NOT NULL, -- 'ios', 'android', 'web'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_token)
);

CREATE INDEX idx_push_tokens_user_id ON push_notification_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_notification_tokens(is_active);

-- ============================================================================
-- 3. NOTIFICATION SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  new_likes BOOLEAN DEFAULT true,
  new_matches BOOLEAN DEFAULT true,
  messages BOOLEAN DEFAULT true,
  super_likes BOOLEAN DEFAULT true,
  rewinds BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);

-- ============================================================================
-- 4. READ RECEIPTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  read_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, read_by_user_id)
);

CREATE INDEX idx_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX idx_read_receipts_read_by_user_id ON message_read_receipts(read_by_user_id);

-- ============================================================================
-- 5. TYPING INDICATORS TABLE (ephemeral, auto-cleanup)
-- ============================================================================
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '10 seconds',
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_typing_conversation_id ON typing_indicators(conversation_id);
CREATE INDEX idx_typing_expires_at ON typing_indicators(expires_at);

-- ============================================================================
-- 6. MESSAGE ATTACHMENTS TABLE (for image sharing in chat)
-- ============================================================================
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  attachment_type TEXT NOT NULL DEFAULT 'image', -- 'image', 'video', 'file'
  attachment_url TEXT NOT NULL, -- Cloudinary URL
  file_name TEXT,
  file_size INT, -- in bytes
  width INT, -- for images/videos
  height INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attachments_message_id ON message_attachments(message_id);

-- ============================================================================
-- 7. USER ATTRIBUTES TABLE (for advanced filters)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Physical attributes
  height_cm INT, -- height in centimeters
  
  -- Lifestyle
  smoking TEXT DEFAULT 'not_specified', -- 'never', 'sometimes', 'regularly', 'not_specified'
  drinking TEXT DEFAULT 'not_specified', -- 'never', 'sometimes', 'regularly', 'not_specified'
  
  -- Background
  education TEXT DEFAULT 'not_specified', -- 'high_school', 'bachelors', 'masters', 'phd', 'not_specified'
  religion TEXT DEFAULT 'not_specified', -- 'christian', 'muslim', 'jewish', 'hindu', 'buddhist', 'atheist', 'not_specified'
  
  -- Additional
  pets_preference TEXT, -- comma-separated: 'dogs', 'cats', 'other'
  relationship_type TEXT DEFAULT 'not_specified', -- 'casual', 'serious', 'not_specified'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_attributes_user_id ON user_attributes(user_id);

-- ============================================================================
-- 8. ONLINE STATUS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS online_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_online_status_user_id ON online_status(user_id);
CREATE INDEX idx_online_status_last_active ON online_status(last_active_at);

-- ============================================================================
-- 9. EXTEND EXISTING TABLES
-- ============================================================================

-- Add verification-related fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Add attributes to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height_cm INT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smoking TEXT DEFAULT 'not_specified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drinking TEXT DEFAULT 'not_specified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education TEXT DEFAULT 'not_specified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religion TEXT DEFAULT 'not_specified';

-- Add fields to messages table for read receipts
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'; -- 'text', 'image', 'file'

-- Add delivery status to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'sent'; -- 'sent', 'delivered', 'read'

-- ============================================================================
-- 10. ENABLE REALTIME FOR NEW TABLES
-- ============================================================================
-- Run these in Supabase dashboard -> Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE user_verifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE push_notification_tokens;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notification_settings;
-- ALTER PUBLICATION supabase_realtime ADD TABLE message_read_receipts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;
-- ALTER PUBLICATION supabase_realtime ADD TABLE message_attachments;
-- ALTER PUBLICATION supabase_realtime ADD TABLE user_attributes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE online_status;

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- User Verifications RLS
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verifications"
  ON user_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verifications"
  ON user_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications"
  ON user_verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Push Notification Tokens RLS
ALTER TABLE push_notification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tokens"
  ON push_notification_tokens FOR ALL
  USING (auth.uid() = user_id);

-- Notification Settings RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings"
  ON notification_settings FOR ALL
  USING (auth.uid() = user_id);

-- Read Receipts RLS
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert read receipts"
  ON message_read_receipts FOR INSERT
  WITH CHECK (auth.uid() = read_by_user_id);

CREATE POLICY "Users can view read receipts in their conversations"
  ON message_read_receipts FOR SELECT
  USING (true); -- Consider more restrictive policy based on conversation membership

-- Typing Indicators RLS
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their typing status"
  ON typing_indicators FOR ALL
  USING (auth.uid() = user_id);

-- Message Attachments RLS
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments in their messages"
  ON message_attachments FOR SELECT
  USING (true); -- Consider more restrictive policy

-- User Attributes RLS
ALTER TABLE user_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own attributes"
  ON user_attributes FOR ALL
  USING (auth.uid() = user_id);

-- Online Status RLS
ALTER TABLE online_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own status"
  ON online_status FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view online status"
  ON online_status FOR SELECT
  USING (true);

-- ============================================================================
-- END OF SCHEMA MIGRATIONS
-- ============================================================================
