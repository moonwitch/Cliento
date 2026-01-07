-- SECURITY POLICIES (RLS)
-- Enable Row Level security
alter table public.profiles ENABLE row LEVEL SECURITY;
alter table public.clients ENABLE row LEVEL SECURITY;
alter table public.brands ENABLE row LEVEL SECURITY;
alter table public.suppliers ENABLE row LEVEL SECURITY;
alter table public.products ENABLE row LEVEL SECURITY;
alter table public.content_blocks ENABLE row LEVEL SECURITY;
alter table public.treatments ENABLE row LEVEL SECURITY;
alter table public.appointments ENABLE row LEVEL SECURITY;
alter table public.treatment_products ENABLE row LEVEL SECURITY;
alter table public.profile_treatments ENABLE row LEVEL SECURITY;
alter table public.product_suppliers ENABLE row LEVEL SECURITY;
alter table public.brand_suppliers ENABLE row LEVEL SECURITY;

-- PUBLIC READ
create policy "Public read treatments" on public.treatments for
select
  to anon,
  authenticated using (true);

create policy "Public read products" on public.products for
select
  to anon,
  authenticated using (true);

create policy "Public read profile_treatments" on public.profile_treatments for
select
  to anon,
  authenticated using (true);

create policy "Public read content_blocks" on public.content_blocks for
select
  to anon,
  authenticated using (true);

-- PROFIELEIGENAREN
create policy "Read employee" on public.profiles for
select
  to authenticated using (role in ('employee', 'admin', 'superadmin'));

create policy "Read own profile" on public.profiles for
select
  to authenticated using (auth.uid () = id);

-- KLANTEN
create policy "View own client fiche" on public.clients for
select
  to authenticated using (auth.uid () = user_id);

create policy "View own appointments" on public.appointments for
select
  to authenticated using (
    exists (
      select
        1
      from
        public.clients
      where
        id = public.appointments.client_id
        and user_id = auth.uid ()
    )
  );

-- PERSONEEL (Full Access via get_my_role)
create policy "Staff full access clients" on public.clients for all using (
  public.get_my_role () in ('admin', 'employee', 'superadmin')
);

create policy "Staff full access appointments" on public.appointments for all using (
  public.get_my_role () in ('admin', 'employee', 'superadmin')
);

create policy "Staff full access profiles" on public.profiles for all using (
  public.get_my_role () in ('admin', 'employee', 'superadmin')
);

create policy "Staff full access treatments" on public.treatments for all using (
  public.get_my_role () in ('admin', 'employee', 'superadmin')
);

create policy "Staff full access inventory" on public.products for all using (
  public.get_my_role () in ('admin', 'employee', 'superadmin')
);

create policy "Staff full access brands" on public.brands for all using (
  public.get_my_role () in ('admin', 'employee', 'superadmin')
);

create policy "Staff full access suppliers" on public.suppliers for all using (
  public.get_my_role () in ('admin', 'employee', 'superadmin')
);

create policy "Staff full access profile_treatments" on public.profile_treatments for all using (
  public.get_my_role () in ('admin', 'employee', 'superadmin')
);

create policy "Staff full access treatment_products" on public.treatment_products for all using (
  public.get_my_role () in ('admin', 'employee', 'superadmin')
);

create policy "Staff full access product_suppliers" on public.product_suppliers for all using (
  public.get_my_role () in ('admin', 'employee', 'superadmin')
);

create policy "Staff full access brand_suppliers" on public.brand_suppliers for all using (
  public.get_my_role () in ('admin', 'employee', 'superadmin')
);

create policy "Admin update content_blocks" on public.content_blocks for all using (public.get_my_role () in ('admin', 'superadmin'));