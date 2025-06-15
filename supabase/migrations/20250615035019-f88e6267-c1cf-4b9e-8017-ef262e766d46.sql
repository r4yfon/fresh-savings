
-- Create table for grocery items in user's pantry
CREATE TABLE public.pantry_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'piece',
  expiry_date DATE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for recipes
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions TEXT NOT NULL,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER DEFAULT 1,
  difficulty TEXT DEFAULT 'easy',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for food contributions (community shared items)
CREATE TABLE public.food_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contributor_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'piece',
  location TEXT,
  available_until DATE,
  category TEXT,
  status TEXT DEFAULT 'available', -- available, claimed, expired
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_contributions ENABLE ROW LEVEL SECURITY;

-- RLS policies for pantry_items (users can only access their own items)
CREATE POLICY "Users can view their own pantry items" 
  ON public.pantry_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pantry items" 
  ON public.pantry_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pantry items" 
  ON public.pantry_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pantry items" 
  ON public.pantry_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for recipes (users can only access their own recipes)
CREATE POLICY "Users can view their own recipes" 
  ON public.recipes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes" 
  ON public.recipes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" 
  ON public.recipes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" 
  ON public.recipes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for food contributions (public viewing, only contributors can modify their own)
CREATE POLICY "Everyone can view available food contributions" 
  ON public.food_contributions 
  FOR SELECT 
  USING (status = 'available');

CREATE POLICY "Users can create food contributions" 
  ON public.food_contributions 
  FOR INSERT 
  WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Contributors can update their own contributions" 
  ON public.food_contributions 
  FOR UPDATE 
  USING (auth.uid() = contributor_id);

CREATE POLICY "Contributors can delete their own contributions" 
  ON public.food_contributions 
  FOR DELETE 
  USING (auth.uid() = contributor_id);
