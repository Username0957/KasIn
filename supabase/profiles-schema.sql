-- Create profiles table for user settings
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Create unique constraint to ensure one profile per user
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS unique_user_profile;
ALTER TABLE profiles ADD CONSTRAINT unique_user_profile UNIQUE (user_id);
