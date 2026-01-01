-- 1. Create Profile Table & Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'beautician', 'editor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'beautician' NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  birthday DATE,       -- From Diagram
  allergies TEXT,      -- From Diagram
  concerns TEXT,       -- From Diagram
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Brands & Suppliers
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.brands ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Treatments
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients ON DELETE CASCADE NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL, -- From Diagram
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Join Tables (Many-to-Many - as requested in conversation)
CREATE TABLE IF NOT EXISTS public.appointment_treatments (
  appointment_id UUID REFERENCES public.appointments ON DELETE CASCADE,
  treatment_id UUID REFERENCES public.treatments ON DELETE CASCADE,
  PRIMARY KEY (appointment_id, treatment_id)
);

CREATE TABLE IF NOT EXISTS public.treatment_products (
  treatment_id UUID REFERENCES public.treatments ON DELETE CASCADE,
  product_id UUID REFERENCES public.products ON DELETE CASCADE,
  PRIMARY KEY (treatment_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.product_suppliers (
  product_id UUID REFERENCES public.products ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers ON DELETE CASCADE,
  PRIMARY KEY (product_id, supplier_id)
);

CREATE TABLE IF NOT EXISTS public.brand_suppliers (
  brand_id UUID REFERENCES public.brands ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers ON DELETE CASCADE,
  PRIMARY KEY (brand_id, supplier_id)
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_suppliers ENABLE ROW LEVEL SECURITY;

-- 8. Functions & Policies

-- Function to get the role of the current user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ADMIN POLICIES
CREATE POLICY "Admins have full access" ON public.profiles FOR ALL TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "Admins have full access" ON public.clients FOR ALL TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "Admins have full access" ON public.brands FOR ALL TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "Admins have full access" ON public.suppliers FOR ALL TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "Admins have full access" ON public.products FOR ALL TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "Admins have full access" ON public.treatments FOR ALL TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "Admins have full access" ON public.appointments FOR ALL TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "Admins have full access" ON public.appointment_treatments FOR ALL TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "Admins have full access" ON public.treatment_products FOR ALL TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "Admins have full access" ON public.product_suppliers FOR ALL TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "Admins have full access" ON public.brand_suppliers FOR ALL TO authenticated USING (get_user_role() = 'admin');

-- BEAUTICIAN POLICIES
CREATE POLICY "Beauticians can manage clients" ON public.clients FOR ALL TO authenticated USING (get_user_role() = 'beautician');
CREATE POLICY "Beauticians can manage appointments" ON public.appointments FOR ALL TO authenticated USING (get_user_role() = 'beautician');
CREATE POLICY "Beauticians can view treatments/products" ON public.treatments FOR SELECT TO authenticated USING (get_user_role() = 'beautician');
CREATE POLICY "Beauticians can view treatments/products" ON public.products FOR SELECT TO authenticated USING (get_user_role() = 'beautician');

-- EDITOR POLICIES
CREATE POLICY "Editors can manage treatments" ON public.treatments FOR ALL TO authenticated USING (get_user_role() = 'editor');
CREATE POLICY "Editors can manage products" ON public.products FOR ALL TO authenticated USING (get_user_role() = 'editor');
CREATE POLICY "Editors can manage brands" ON public.brands FOR ALL TO authenticated USING (get_user_role() = 'editor');
CREATE POLICY "Editors can manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (get_user_role() = 'editor');
CREATE POLICY "Editors can view join tables" ON public.treatment_products FOR SELECT TO authenticated USING (get_user_role() = 'editor');
CREATE POLICY "Editors can view join tables" ON public.product_suppliers FOR SELECT TO authenticated USING (get_user_role() = 'editor');

-- Profile Policy for self
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- 9. Trigger for New User Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE((new.raw_user_meta_data->>'role')::user_role, 'beautician'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
END IF;
