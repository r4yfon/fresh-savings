
-- Add missing columns to food_contributions table to match the component expectations
ALTER TABLE public.food_contributions 
ADD COLUMN title TEXT,
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN user_id UUID REFERENCES auth.users;

-- Update existing data to populate the new columns
UPDATE public.food_contributions 
SET title = name, 
    user_id = contributor_id,
    is_active = CASE WHEN status = 'available' THEN true ELSE false END;

-- Make title required now that we've populated it
ALTER TABLE public.food_contributions ALTER COLUMN title SET NOT NULL;

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Update RLS policies for food_contributions to use user_id instead of contributor_id
DROP POLICY IF EXISTS "Everyone can view available food contributions" ON public.food_contributions;
DROP POLICY IF EXISTS "Users can create food contributions" ON public.food_contributions;
DROP POLICY IF EXISTS "Contributors can update their own contributions" ON public.food_contributions;
DROP POLICY IF EXISTS "Contributors can delete their own contributions" ON public.food_contributions;

CREATE POLICY "Everyone can view active food contributions" 
  ON public.food_contributions 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can create food contributions" 
  ON public.food_contributions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions" 
  ON public.food_contributions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contributions" 
  ON public.food_contributions 
  FOR DELETE 
  USING (auth.uid() = user_id);
