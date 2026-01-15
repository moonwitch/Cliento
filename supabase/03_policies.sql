-- ================================================================
-- BESTAND: 03_policies.sql
-- BESCHRIJVING: Beveiliging & Toegangsregels (Row Level Security)
-- ================================================================

-- 1. RLS ACTIVEREN
-- Standaard staat alles dicht (niemand mag iets). We zetten RLS aan op alle tabellen.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpublic.ontent_blocks ENABLE ROW LEVEL SECURITY;
-- (Storage objects staan standaard al op RLS in Supabase)

-- 2. TABEL POLICIES
-- A. PROFILES
-- Iedereen mag profielen lezen (nodig om te weten wie wie is).
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
-- Alleen de eigenaar mag zijn eigen profiel aanpassen (bv. naam wijzigen).
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- B. STAFF ONLY ACCESS (Beheer Tabellen)
-- Medewerkers (Admin/Employee) mogen alles doen in deze tabellen.
-- We gebruiken de helper functie 'get_my_role()'.
CREATE POLICY "Staff manage clients" ON public.clients FOR ALL
USING ( public.get_my_role() IN ('admin', 'employee', 'superadmin') );

CREATE POLICY "Staff manage treatments" ON treatments FOR ALL
USING ( public.get_my_role() IN ('admin', 'employee', 'superadmin') );

CREATE POLICY "Staff manage appointments" ON public.appointments FOR ALL
USING ( public.get_my_role() IN ('admin', 'employee', 'superadmin') );

CREATE POLICY "Staff manage skills" ON public.staff_treatments FOR ALL
USING ( public.get_my_role() IN ('admin', 'employee', 'superadmin') );

CREATE POLICY "Staff manage content" ON public.content_blocks FOR ALL
USING ( public.get_my_role() IN ('admin', 'employee', 'superadmin') );

-- 3. PUBLIC ACCESS (Website Bezoekers)
CREATE POLICY "Public read treatments" ON public.treatments FOR SELECT USING (true);
CREATE POLICY "Public read content" ON content_blocks FOR SELECT USING (true);

-- 4. STORAGE POLICIES (Afbeeldingen)
-- Alleen personeel mag uploaden, wijzigen of verwijderen
CREATE POLICY "Staff Manage Images" ON storage.objects FOR ALL
USING (
    bucket_id = 'images'
    AND public.get_my_role() IN ('admin', 'employee', 'superadmin')
)
WITH CHECK (
    bucket_id = 'images'
    AND public.get_my_role() IN ('admin', 'employee', 'superadmin')
);
