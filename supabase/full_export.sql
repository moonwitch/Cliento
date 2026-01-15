-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  client_id uuid NOT NULL,
  staff_id uuid NOT NULL,
  treatment_id uuid,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status text DEFAULT 'scheduled'::text CHECK (status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text])),
  notes text,
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT appointments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.profiles(id),
  CONSTRAINT appointments_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.treatments(id)
);
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text),
  phone text,
  birthday date,
  allergies text,
  concerns text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.content_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  section text,
  content text,
  image_url text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT content_blocks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.newsletter_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text DEFAULT ((first_name || ' '::text) || last_name),
  email text NOT NULL CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text),
  role USER-DEFINED DEFAULT 'user'::user_role,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.staff_treatments (
  staff_id uuid NOT NULL,
  treatment_id uuid NOT NULL,
  CONSTRAINT staff_treatments_pkey PRIMARY KEY (staff_id, treatment_id),
  CONSTRAINT staff_treatments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.profiles(id),
  CONSTRAINT staff_treatments_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.treatments(id)
);
CREATE TABLE public.treatments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric,
  duration_minutes integer,
  category text DEFAULT 'Overig'::text,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT treatments_pkey PRIMARY KEY (id)
);
