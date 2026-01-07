-- Dummy data
insert into
  public.clients (first_name, last_name, email, phone_number, notes)
values
  (
    'Sophie',
    'De Vries',
    'sophie.test@example.com',
    '0471234567',
    'Allergisch voor notenolie'
  ),
  (
    'Mark',
    'Peeters',
    'mark.test@example.com',
    '0479998877',
    'Komt vaak te laat'
  ),
  (
    'Lotte',
    'Janssens',
    'lotte.test@example.com',
    '0471122334',
    'Wil altijd de nieuwste behandeling'
  ),
  (
    'Thomas',
    'Maes',
    'thomas.test@example.com',
    '0475556666',
    null
  ),
  (
    'Eva',
    'Willems',
    'eva.test@example.com',
    '0478889900',
    'Gevoelige huid'
  );

-- 2. Nu maken we afspraken (gekoppeld aan jouw employee en de nieuwe klanten)
with
  target_worker as (
    select
      id
    from
      public.profiles
    where
      id = (
        select
          id
        from
          auth.users
        where
          email = 'kelly@kellyand.coffee'
      )
  )
insert into
  public.appointments (
    worker_id,
    client_id,
    treatment_title,
    start_time,
    status,
    notes
  )
select
  (
    select
      id
    from
      target_worker
  ), -- De ID van jouw employee
  c.id, -- De ID van de klant (we pakken ze alle 5)
  case
    when c.first_name = 'Sophie' then 'Gelaatsverzorging Luxe'
    when c.first_name = 'Mark' then 'Rugmassage'
    else 'Basis Manicure'
  end,
  NOW() + (INTERVAL '1 day' * (RANDOM() * 10)::int) + (INTERVAL '1 hour' * (RANDOM() * 8)::int), -- Random datum in de komende 10 dagen
  'confirmed',
  'Gegenereerde test data'
from
  public.clients c
where
  c.email like '%@example.com';

-- We selecteren alleen de nieuwe testklanten
-- Test Content Blocks
insert into
  public.content_blocks (section_key, label, content)
values
  (
    'home_welcome',
    'Welkomsttekst Homepage',
    'Welkom bij Lyn & Skin, jouw plek voor rust.'
  ),
  (
    'about_harlyne',
    'Over Harlyne',
    'Ik ben Harlyne en ik ben gepassioneerd door huidverbetering.'
  )
on conflict (section_key) do nothing;