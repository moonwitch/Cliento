-- ================================================================
-- BESTAND: 01_schema_setup.sql
-- PROJECT: LYN & SKIN ADMIN PANEL
-- BESCHRIJVING: Aanmaken van tabellen met INLINE constraints
-- ================================================================

-- 1. ENUMS (Vaste waarden voor rollen)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'employee', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PROFILES (Gekoppeld aan Supabase Auth)
CREATE TABLE public.profiles (
  -- Inline FK: Linkt direct aan auth.users en verwijdert mee (CASCADE)
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  first_name text NOT NULL,
  last_name text NOT NULL,
  -- Generated column: wordt automatisch ingevuld
  full_name text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email text NOT NULL CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text),
  role public.user_role not null default 'client'::user_role,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. CLIENTS (CRM)
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Inline FK: Linkt optioneel aan een user account. Als user weg is, zet op NULL.
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text),
  phone text,
  birthday date,
  allergies text,
  concerns text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. TREATMENTS (Behandelingen)
CREATE TABLE public.treatments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  price numeric(10,2),
  duration_minutes integer,
  category text DEFAULT 'Overig',
  image_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. STAFF TREATMENTS (Skills Matrix)
CREATE TABLE public.staff_treatments (
  -- Inline FKs: Als staff of treatment verwijderd wordt, verdwijnt deze link ook (CASCADE)
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  treatment_id uuid NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,

  -- UITZONDERING: Dit is een samengestelde sleutel (Composite Key).
  CONSTRAINT staff_treatments_pkey PRIMARY KEY (staff_id, treatment_id)
);

-- 6. APPOINTMENTS (Agenda)
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),

  -- Inline FKs: Relaties definiëren
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL, -- Als staff stopt, blijft afspraak bestaan
  treatment_id uuid REFERENCES public.treatments(id) ON DELETE SET NULL,    -- Als behandeling stopt, blijft historie bestaan

  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,

  -- Inline status check
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes text
);

-- Indexen (Voor snelheid)
CREATE INDEX idx_appt_start ON public.appointments(start_time);
CREATE INDEX idx_appt_staff ON public.appointments(staff_id);

-- 7. CMS (Content Management)
CREATE TABLE public.content_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE, -- Sleutel moet uniek zijn (bv. 'home_title')
  section text,
  content text,
  image_url text,
  updated_at timestamp with time zone DEFAULT now()
);
