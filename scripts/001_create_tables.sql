-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waste_classifications table to store user's classification history
CREATE TABLE IF NOT EXISTS public.waste_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  classification_result JSONB NOT NULL,
  confidence_score DECIMAL(5,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pickup_requests table for waste pickup scheduling
CREATE TABLE IF NOT EXISTS public.pickup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  waste_types TEXT[] NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time_slot TEXT NOT NULL,
  special_instructions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for waste_classifications
CREATE POLICY "classifications_select_own" ON public.waste_classifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "classifications_insert_own" ON public.waste_classifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "classifications_update_own" ON public.waste_classifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "classifications_delete_own" ON public.waste_classifications FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for pickup_requests
CREATE POLICY "pickups_select_own" ON public.pickup_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pickups_insert_own" ON public.pickup_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pickups_update_own" ON public.pickup_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pickups_delete_own" ON public.pickup_requests FOR DELETE USING (auth.uid() = user_id);
