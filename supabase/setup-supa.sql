-- ====================================================================
-- MASTER SCRIPT: CLIENTO (Booking + Inventory + CRM)
-- ====================================================================

-- 1. SCHOON SCHIP
-- We droppen alles in de juiste volgorde om foreign key errors te voorkomen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop core booking tables
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.appointment_treatments CASCADE; -- Oude join table
DROP TABLE IF EXISTS public.profile_treatments CASCADE;     -- Nieuwe join table (Personeel <-> Behandeling)

-- Drop inventory tables (Original Setup)
DROP TABLE IF EXISTS public.treatment_products CASCADE;
DROP TABLE IF EXISTS public.product_suppliers CASCADE;
DROP TABLE IF EXISTS public.brand_suppliers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;

-- Drop base tables
DROP TABLE IF EXISTS public.treatments CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;


-- 2. ENUMS & AUTH PROFILES
-- We voegen 'editor' toe om compatibel te zijn met je originele plannen
CREATE TYPE user_role AS ENUM ('admin', 'beautician', 'editor', 'client');

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  role user_role DEFAULT 'client' NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- 3. CRM (KLANTEN)
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birthday DATE,
  allergies TEXT,
  concerns TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;


-- 4. INVENTORY & PRODUCTS (Originele Setup)
CREATE TABLE public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.brands ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;


-- 5. TREATMENTS (BEHANDELINGEN)
CREATE TABLE public.treatments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,          -- We gebruiken 'title' voor consistentie met je frontend
  description TEXT,
  price DECIMAL(10,2),
  duration_minutes INTEGER,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;


-- 6. JOIN TABLES (Koppelingen)

-- A. Welke producten worden in welke behandeling gebruikt? (Originele setup)
CREATE TABLE public.treatment_products (
  treatment_id UUID REFERENCES public.treatments ON DELETE CASCADE,
  product_id UUID REFERENCES public.products ON DELETE CASCADE,
  PRIMARY KEY (treatment_id, product_id)
);
ALTER TABLE public.treatment_products ENABLE ROW LEVEL SECURITY;

-- B. Welk PERSONEEL mag welke behandeling doen? (Nieuwe setup)
CREATE TABLE public.profile_treatments (
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES public.treatments ON DELETE CASCADE,
  PRIMARY KEY (profile_id, treatment_id)
);
ALTER TABLE public.profile_treatments ENABLE ROW LEVEL SECURITY;

-- C. Leveranciers koppelingen (Originele setup)
CREATE TABLE public.product_suppliers (
  product_id UUID REFERENCES public.products ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers ON DELETE CASCADE,
  PRIMARY KEY (product_id, supplier_id)
);
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.brand_suppliers (
  brand_id UUID REFERENCES public.brands ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers ON DELETE CASCADE,
  PRIMARY KEY (brand_id, supplier_id)
);
ALTER TABLE public.brand_suppliers ENABLE ROW LEVEL SECURITY;


-- 7. APPOINTMENTS (AFSPRAKEN)
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  beautician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Wie voert het uit?
  treatment_title TEXT, -- Snapshot van de naam
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;


-- 8. DE SMART AUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  meta_first_name text;
  meta_last_name text;
  final_role user_role;
BEGIN
  meta_first_name := new.raw_user_meta_data->>'first_name';
  meta_last_name := new.raw_user_meta_data->>'last_name';

  -- LOGICA: Is er een voornaam (via website)? -> Klant. Anders -> Personeel.
  IF meta_first_name IS NOT NULL THEN
    -- A. KLANT
    final_role := 'client';

    INSERT INTO public.profiles (id, first_name, last_name, full_name, role)
    VALUES (new.id, meta_first_name, meta_last_name, meta_first_name || ' ' || meta_last_name, final_role);

    INSERT INTO public.clients (user_id, first_name, last_name, email)
    VALUES (new.id, meta_first_name, meta_last_name, new.email);

  ELSE
    -- B. PERSONEEL (Standaard Beautician)
    final_role := 'beautician';

    INSERT INTO public.profiles (id, first_name, last_name, full_name, role)
    VALUES (new.id, 'Nieuwe', 'Collega', 'Nieuwe Collega', final_role);
    -- Geen CRM entry voor personeel!

  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 9. SECURITY POLICIES (RLS)
-- Public Read Access (Website)
CREATE POLICY "Public read treatments" ON public.treatments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read profile_treatments" ON public.profile_treatments FOR SELECT TO anon, authenticated USING (true);

-- Profiles
CREATE POLICY "Read beauticians" ON public.profiles FOR SELECT TO authenticated USING (role IN ('beautician', 'admin', 'editor'));
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- Clients
CREATE POLICY "View own client fiche" ON public.clients FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Appointments
CREATE POLICY "View own appointments" ON public.appointments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.clients WHERE id = public.appointments.client_id AND user_id = auth.uid())
);

-- ADMIN / STAFF POLICIES (Full Access voor personeel)
-- We geven 'beautician', 'admin' en 'editor' toegang tot beheerstaken
CREATE POLICY "Staff full access clients" ON public.clients FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'beautician', 'editor')
);
CREATE POLICY "Staff full access appointments" ON public.appointments FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'beautician', 'editor')
);
CREATE POLICY "Staff full access profiles" ON public.profiles FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'beautician', 'editor')
);
CREATE POLICY "Staff full access treatments" ON public.treatments FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'beautician', 'editor')
);
CREATE POLICY "Staff full access inventory" ON public.products FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'beautician', 'editor')
);
CREATE POLICY "Staff full access brands" ON public.brands FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'beautician', 'editor')
);
CREATE POLICY "Staff full access suppliers" ON public.suppliers FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'beautician', 'editor')
);
CREATE POLICY "Staff full access profile_treatments" ON public.profile_treatments FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'beautician', 'editor')
);
CREATE POLICY "Staff full access treatment_products" ON public.treatment_products FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'beautician', 'editor')
);


-- 10. CONTENT INJECTION (DE BEHANDELINGEN)
-- Geïmporteerd vanuit 'Behandellijst 1.docx'
INSERT INTO public.treatments (category, title, description, duration_minutes, price)
VALUES
  -- MANICURE
  ('Manicure', 'Basis manicure', 'Nagels in vorm vijlen, nagelriemen verzorgen en hydraterende handcrème.', 20, 20.00),
  ('Manicure', 'Luxe manicure', 'Nagels in vorm vijlen, nagelriemen verzorgen en nagels lakken met kleur naar keuze.', 30, 30.00),
  ('Manicure', 'Spa manicure', 'Handbad, scrub, nagelverzorging en hydraterende handcrème.', 35, 28.00),

  -- NAGELS
  ('Nagels', 'BIAB natural', 'Versteviging met natuurlijke base in een natuurlijke tint.', 60, 50.00),
  ('Nagels', 'BIAB full colour/french', 'BIAB met kleur of french.', 75, 58.00),
  ('Nagels', 'Bijwerking BIAB – natural, full colour of french', 'Opvullen van bestaande BIAB-set.', 75, 55.00),
  ('Nagels', 'Hard gel natural', 'Versteviging met gel van de natuurlijke nagels met natuurlijke tint.', 70, 60.00),
  ('Nagels', 'Hard gel colour/french', 'Versteviging met gel van de natuurlijke nagels met kleur of french afwerking.', 85, 68.00),
  ('Nagels', 'Optie: hard gel verlengingen', 'Toevoeging van verlenging bij hard gel.', 15, 10.00),
  ('Nagels', 'Nail art per nagel', 'Tekening, steentjes, glitters, etc.', 5, 1.00),
  ('Nagels', 'Verwijderen gelnagels/BIAB + manicure', 'Verwijderen product, basismanicure en verstevigende nagellak.', 40, 35.00),

  -- ONTHARINGEN
  ('Ontharingen', 'Ontharing bovenlip', 'Harsen + verzorgende crème.', 10, 10.00),
  ('Ontharingen', 'Ontharing wenkbrauwen', 'Hars of pincet + verzorgende crème.', 15, 12.00),
  ('Ontharingen', 'Ontharing volledig gelaat', 'Harsen van bovenlip, wangen en wenkbrauwen + verzorgende crème.', 20, 22.00),
  ('Ontharingen', 'Ontharing oksels', 'Harsen + verzorgende crème.', 15, 15.00),
  ('Ontharingen', 'Ontharing onderbenen + knie', 'Harsen onderbenen en knieën + verzorgende crème.', 20, 25.00),
  ('Ontharingen', 'Ontharing volledige benen', 'Harsen bovenbenen, knieën en onderbenen + verzorgende crème.', 35, 38.00),

  -- GELAATSVERZORGING
  ('Gelaatsverzorging', 'Gelaatsverzorging mini', 'Reiniging, peeling, masker en dagverzorging.', 30, 40.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging medium', 'Mini gelaatsverzorging + epilatie bovenlip en wenkbrauwen.', 45, 50.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging luxe', 'Medium gelaatsverzorging + serum en gelaatsmassage.', 60, 65.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging anti-aging', 'Luxe gelaatsverzorging + intensieve anti-aging producten.', 80, 80.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging winterpakket', 'Luxe gelaatsverzorging + extra hydraterende boost.', 80, 80.00),
  ('Gelaatsverzorging', 'Optie: speciaal masker voor het gelaat', 'Toevoeging op mini/medium/luxe-gelaatsverzorging afgestemd op huidtype.', 10, 10.00),

  -- PEDICURE
  ('Pedicure', 'Basis pedicure', 'Nagels knippen/vijlen, nagelriemen verzorging, eelt verwijderen en hydraterende voetcrème.', 60, 40.00),
  ('Pedicure', 'Luxe pedicure', 'Voetbad, scrub, basispedicure en hydraterende voetcrème.', 75, 50.00),
  ('Pedicure', 'Basis pedicure + lakken van de teennagels', 'Basispedicure + lakken van de teennagels in kleur naar keuze.', 70, 48.00),
  ('Pedicure', 'Basispedicure + gellak op de teennagels', 'Basispedicure + gellak (houdt 3-4 weken).', 75, 55.00),
  ('Pedicure', 'Basispedicure + verwijderen gellak', 'Gellak verwijderen + basispedicure + verstevigende nagellak.', 75, 48.00);

-- EINDE SCRIPT
