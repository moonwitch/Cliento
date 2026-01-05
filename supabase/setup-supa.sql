-- ================================================================
-- PROJECT: LYNE & SKIN
-- BESCHRIJVING: Database setup voor klantenbeheer, auth en content
-- NOTES:
-- We gebruiken ook Supabase voor de auth en row level security,
-- dat betekent dat we geen extra tabel voor de auth nodig hebben,
-- maar wel policies moeten aanmaken voor de correcte toegang.
-- ================================================================

-- 1. ENUMS & AUTH KOPPELING
-- Opzetten van de user rollen
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'employee', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- PROFILES:
-- User profiles met 'client' als standaardwaarde
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'client' NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. CRM (KLANTENFICHE)
-- Aanmaken klantenfiche met koppeling naar de auth.users tabel
-- aangezien ik Supabase gebruik voor de auth
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone_number TEXT,
  birthday DATE,
  allergies TEXT,
  concerns TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 3. INVENTORY & PRODUCTS (VOORRAADBEHEER)
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  email TEXT,
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

-- 4. CONTENT (DE BEHANDELINGEN)
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  duration_minutes INTEGER,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- 5. PLANNING (AFSPRAKEN)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients ON DELETE CASCADE NOT NULL,
  treatment_title TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 6. JOIN TABLES (KOPPELTABELLEN)
-- Er kunnen meerdere behandelingen per product zijn en meerdere producten per behandeling
CREATE TABLE public.treatment_products (
  treatment_id UUID REFERENCES public.treatments ON DELETE CASCADE,
  product_id UUID REFERENCES public.products ON DELETE CASCADE,
  PRIMARY KEY (treatment_id, product_id)
);
ALTER TABLE public.treatment_products ENABLE ROW LEVEL SECURITY;

-- Per behandelaar de behandelingen
CREATE TABLE public.profile_treatments (
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES public.treatments ON DELETE CASCADE,
  PRIMARY KEY (profile_id, treatment_id)
);
ALTER TABLE public.profile_treatments ENABLE ROW LEVEL SECURITY;

-- Per product de leveranciers
CREATE TABLE public.product_suppliers (
  product_id UUID REFERENCES public.products ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers ON DELETE CASCADE,
  PRIMARY KEY (product_id, supplier_id)
);
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;

-- Per merk de leveranciers
CREATE TABLE public.brand_suppliers (
  brand_id UUID REFERENCES public.brands ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers ON DELETE CASCADE,
  PRIMARY KEY (brand_id, supplier_id)
);
ALTER TABLE public.brand_suppliers ENABLE ROW LEVEL SECURITY;

-- 7. AUTOMATISERING (TRIGGERS & FUNCTIES)
-- New user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  -- We maken variabelen aan om de data eerst schoon te maken
  safe_first_name TEXT;
  safe_last_name TEXT;
  safe_full_name TEXT;
  safe_role public.user_role;
BEGIN
  -- 1. Data voorbereiden (vangnet voor lege waardes)
  -- Als er geen naam is (bv. via dashboard aangemaakt), gebruiken we 'Onbekend'
  safe_first_name := COALESCE(new.raw_user_meta_data->>'first_name', 'Onbekend');
  safe_last_name := COALESCE(new.raw_user_meta_data->>'last_name', '');
  safe_full_name := TRIM(safe_first_name || ' ' || safe_last_name);

  -- 2. Rol bepalen en converteren (Type Casting)
  -- De ::public.user_role aan het einde is de cruciale fix voor jouw error!
  safe_role := COALESCE(new.raw_user_meta_data->>'role', 'client')::public.user_role;

  -- 3. Profiel aanmaken
  -- Let op: we vullen nu ook first_name en last_name expliciet in
  INSERT INTO public.profiles (id, first_name, last_name, full_name, role)
  VALUES (
    new.id,
    safe_first_name,
    safe_last_name,
    safe_full_name,
    safe_role
  );

  -- 4. Klantenfiche aanmaken (alleen als het een klant is)
  IF safe_role = 'client' THEN
      INSERT INTO public.clients (user_id, first_name, last_name, email, phone_number)
      VALUES (
        new.id,
        safe_first_name,
        safe_last_name,
        new.email,
        new.raw_user_meta_data->>'phone_number'
      );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- Om een user aan te maken hebben we rechten nodig, maar als een nieuwe user wil registeren lukt dat hierdoor niet. Dus moeten we ff RLS ontsnappen op deze manier.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- HULPFUNCTIE VOOR BEVEILIGING
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_data user_role;
BEGIN
    SELECT role INTO user_data
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN user_data;
  END;
  $$;

-- 8. SECURITY POLICIES (RLS)
-- PUBLIC READ
CREATE POLICY "Public read treatments" ON public.treatments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read profile_treatments" ON public.profile_treatments FOR SELECT TO anon, authenticated USING (true);

-- PROFIELEIGENAREN
CREATE POLICY "Read employee" ON public.profiles FOR SELECT TO authenticated USING (role IN ('employee', 'admin', 'superadmin'));
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- KLANTEN
CREATE POLICY "View own client fiche" ON public.clients FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "View own appointments" ON public.appointments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.clients WHERE id = public.appointments.client_id AND user_id = auth.uid())
);

-- PERSONEEL (Full Access via get_my_role)
CREATE POLICY "Staff full access clients" ON public.clients FOR ALL USING (
    public.get_my_role() IN ('admin', 'employee', 'superadmin')
);
CREATE POLICY "Staff full access appointments" ON public.appointments FOR ALL USING (
    public.get_my_role() IN ('admin', 'employee', 'superadmin')
);
CREATE POLICY "Staff full access profiles" ON public.profiles FOR ALL USING (
  public.get_my_role() IN ('admin', 'employee', 'superadmin')
);
CREATE POLICY "Staff full access treatments" ON public.treatments FOR ALL USING (
  public.get_my_role() IN ('admin', 'employee', 'superadmin')
);
CREATE POLICY "Staff full access inventory" ON public.products FOR ALL USING (
  public.get_my_role() IN ('admin', 'employee', 'superadmin')
);
CREATE POLICY "Staff full access brands" ON public.brands FOR ALL USING (
  public.get_my_role() IN ('admin', 'employee', 'superadmin')
);
CREATE POLICY "Staff full access suppliers" ON public.suppliers FOR ALL USING (
  public.get_my_role() IN ('admin', 'employee', 'superadmin')
);
CREATE POLICY "Staff full access profile_treatments" ON public.profile_treatments FOR ALL USING (
  public.get_my_role() IN ('admin', 'employee', 'superadmin')
);
CREATE POLICY "Staff full access treatment_products" ON public.treatment_products FOR ALL USING (
  public.get_my_role() IN ('admin', 'employee', 'superadmin')
);
CREATE POLICY "Staff full access product_suppliers" ON public.product_suppliers FOR ALL USING (
  public.get_my_role() IN ('admin', 'employee', 'superadmin')
);
CREATE POLICY "Staff full access brand_suppliers" ON public.brand_suppliers FOR ALL USING (
  public.get_my_role() IN ('admin', 'employee', 'superadmin')
);

-- 9. CONTENT INJECTION
INSERT INTO public.treatments (category, title, description, duration_minutes, price)
VALUES
  ('Manicure', 'Basis manicure', 'Nagels in vorm vijlen, nagelriemen verzorgen en hydraterende handcrème.', 20, 20.00),
  ('Manicure', 'Luxe manicure', 'Nagels in vorm vijlen, nagelriemen verzorgen en nagels lakken met kleur naar keuze.', 30, 30.00),
  ('Manicure', 'Spa manicure', 'Handbad, scrub, nagelverzorging en hydraterende handcrème.', 35, 28.00),
  ('Nagels', 'BIAB natural', 'Versteviging met natuurlijke base in een natuurlijke tint.', 60, 50.00),
  ('Nagels', 'BIAB full colour/french', 'BIAB met kleur of french.', 75, 58.00),
  ('Nagels', 'Bijwerking BIAB – natural, full colour of french', 'Opvullen van bestaande BIAB-set.', 75, 55.00),
  ('Nagels', 'Hard gel natural', 'Versteviging met gel van de natuurlijke nagels met natuurlijke tint.', 70, 60.00),
  ('Nagels', 'Hard gel colour/french', 'Versteviging met gel van de natuurlijke nagels met kleur of french afwerking.', 85, 68.00),
  ('Nagels', 'Optie: hard gel verlengingen', 'Toevoeging van verlenging bij hard gel.', 15, 10.00),
  ('Nagels', 'Nail art per nagel', 'Tekening, steentjes, glitters, etc.', 5, 1.00),
  ('Nagels', 'Verwijderen gelnagels/BIAB + manicure', 'Verwijderen product, basismanicure en verstevigende nagellak.', 40, 35.00),
  ('Ontharingen', 'Ontharing bovenlip', 'Harsen + verzorgende crème.', 10, 10.00),
  ('Ontharingen', 'Ontharing wenkbrauwen', 'Hars of pincet + verzorgende crème.', 15, 12.00),
  ('Ontharingen', 'Ontharing volledig gelaat', 'Harsen van bovenlip, wangen en wenkbrauwen + verzorgende crème.', 20, 22.00),
  ('Ontharingen', 'Ontharing oksels', 'Harsen + verzorgende crème.', 15, 15.00),
  ('Ontharingen', 'Ontharing onderbenen + knie', 'Harsen onderbenen en knieën + verzorgende crème.', 20, 25.00),
  ('Ontharingen', 'Ontharing volledige benen', 'Harsen bovenbenen, knieën en onderbenen + verzorgende crème.', 35, 38.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging mini', 'Reiniging, peeling, masker en dagverzorging.', 30, 40.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging medium', 'Mini gelaatsverzorging + epilatie bovenlip en wenkbrauwen.', 45, 50.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging luxe', 'Medium gelaatsverzorging + serum en gelaatsmassage.', 60, 65.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging anti-aging', 'Luxe gelaatsverzorging + intensieve anti-aging producten.', 80, 80.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging winterpakket', 'Luxe gelaatsverzorging + extra hydraterende boost.', 80, 80.00),
  ('Gelaatsverzorging', 'Optie: speciaal masker voor het gelaat', 'Toevoeging op mini/medium/luxe-gelaatsverzorging afgestemd op huidtype.', 10, 10.00),
  ('Pedicure', 'Basis pedicure', 'Nagels knippen/vijlen, nagelriemen verzorging, eelt verwijderen en hydraterende voetcrème.', 60, 40.00),
  ('Pedicure', 'Luxe pedicure', 'Voetbad, scrub, basispedicure en hydraterende voetcrème.', 75, 50.00),
  ('Pedicure', 'Basis pedicure + lakken van de teennagels', 'Basispedicure + lakken van de teennagels in kleur naar keuze.', 70, 48.00),
  ('Pedicure', 'Basispedicure + gellak op de teennagels', 'Basispedicure + gellak (houdt 3-4 weken).', 75, 55.00),
  ('Pedicure', 'Basispedicure + verwijderen gellak', 'Gellak verwijderen + basispedicure + verstevigende nagellak.', 75, 48.00);

-- EINDE SCRIPT
