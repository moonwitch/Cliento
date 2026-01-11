-- ================================================================
-- PROJECT: LYN & SKIN
-- BESCHRIJVING: Database setup voor klantenbeheer, auth en content
-- NOTES:
-- We gebruiken ook Supabase voor de auth en row level security,
-- dat betekent dat we geen extra tabel voor de auth nodig hebben,
-- maar wel policies moeten aanmaken voor de correcte toegang.
-- ================================================================
-- 1. ENUMS & AUTH KOPPELING
-- Opzetten van de user rollen
do $$ BEGIN
  CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'employee', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- PROFILES:
-- User profiles met 'client' als standaardwaarde
create table if not exists public.profiles (
  id UUID references auth.users on delete CASCADE primary key,
  first_name TEXT not null,
  last_name TEXT not null,
  full_name TEXT not null,
  email TEXT not null,
  role user_role default 'client' not null,
  is_active BOOLEAN default true not null,
  updated_at timestamp with time zone default NOW()
);

-- 2. CRM (KLANTENFICHE)
-- Aanmaken klantenfiche met koppeling naar de auth.users tabel
-- aangezien ik Supabase gebruik voor de auth
create table if not exists public.clients (
  id UUID default gen_random_uuid () primary key,
  user_id UUID references auth.users (id) on delete set null,
  first_name TEXT not null,
  last_name TEXT not null,
  email TEXT unique,
  phone_number TEXT,
  birthday DATE,
  allergies TEXT,
  concerns TEXT,
  notes TEXT,
  created_at timestamp with time zone default NOW(),
  updated_at timestamp with time zone default NOW()
);

-- 3. INVENTORY & PRODUCTS (VOORRAADBEHEER)
create table if not exists public.brands (
  id UUID default gen_random_uuid () primary key,
  name TEXT not null unique,
  created_at timestamp with time zone default NOW()
);

create table public.suppliers (
  id UUID default gen_random_uuid () primary key,
  name TEXT not null unique,
  address TEXT,
  email TEXT,
  contact_info TEXT,
  created_at timestamp with time zone default NOW()
);

create table public.products (
  id UUID default gen_random_uuid () primary key,
  brand_id UUID references public.brands on delete CASCADE,
  name TEXT not null,
  price DECIMAL(10, 2),
  stock_quantity INTEGER default 0,
  min_stock_level INTEGER default 5,
  created_at timestamp with time zone default NOW()
);

-- CMS BLOKKEN
create table if not exists public.content_blocks (
  id UUID default gen_random_uuid () primary key,
  section_key TEXT unique not null,
  label TEXT,
  content TEXT,
  image_url TEXT,
  updated_at timestamp with time zone default NOW()
);

-- 4. CONTENT (DE BEHANDELINGEN)
create table if not exists public.treatments (
  id UUID default gen_random_uuid () primary key,
  title TEXT not null,
  description TEXT,
  price DECIMAL(10, 2),
  duration_minutes INTEGER,
  category TEXT,
  image_url TEXT,
  created_at timestamp with time zone default NOW()
);

-- 5. PLANNING (AFSPRAKEN)
create table if not exists public.appointments (
  id UUID default gen_random_uuid () primary key,
  worker_id UUID references public.profiles (id) on delete CASCADE not null,
  client_id UUID references public.clients on delete CASCADE not null,
  treatment_title TEXT,
  start_time timestamp with time zone not null,
  status TEXT default 'confirmed',
  notes TEXT,
  created_at timestamp with time zone default NOW()
);

-- 6. JOIN TABLES (KOPPELTABELLEN)
-- Er kunnen meerdere behandelingen per product zijn en meerdere producten per behandeling
create table public.treatment_products (
  treatment_id UUID references public.treatments on delete CASCADE,
  product_id UUID references public.products on delete CASCADE,
  primary key (treatment_id, product_id)
);

-- Per behandelaar de behandelingen
create table public.profile_treatments (
  profile_id UUID references public.profiles (id) on delete CASCADE,
  treatment_id UUID references public.treatments on delete CASCADE,
  primary key (profile_id, treatment_id)
);

-- Per product de leveranciers
create table public.product_suppliers (
  product_id UUID references public.products on delete CASCADE,
  supplier_id UUID references public.suppliers on delete CASCADE,
  primary key (product_id, supplier_id)
);

-- Per merk de leveranciers
create table public.brand_suppliers (
  brand_id UUID references public.brands on delete CASCADE,
  supplier_id UUID references public.suppliers on delete CASCADE,
  primary key (brand_id, supplier_id)
);
