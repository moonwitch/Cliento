-- ================================================================
-- BESTAND: 05_seed_data.sql
-- BESCHRIJVING: Testdata (Fake Staff, Fake Appointments)
-- ================================================================

-- FAKE MEDEWERKER & KLANTEN
-- Voeg extra klanten toe (CRM)
INSERT INTO public.clients (first_name, last_name, email, phone, notes)
VALUES
  ('Lisa', 'Willems', 'lisa@example.com', '0471234567', 'Gevoelige huid, allergisch aan noten.'),
  ('Tom', 'Janssens', 'tom@example.com', '0479988776', 'Komt voor rugklachten.'),
  ('Emma', 'De Smet', 'emma@example.com', '0475556666', 'Nieuwe klant via Instagram.'),
  ('Jeanine', 'Geerts', 'JGeerts@telenet.be', '09876513', ''),
  ('Rudi', 'Leroux', 'rudi.l@example.com', '023456789', 'Atopische eczeem.');

-- 3. KOPPEL SKILLS (Wie kan wat?)
-- We koppelen Sofie (employee) aan alle gezichtsbehandelingen
INSERT INTO public.staff_treatments (staff_id, treatment_id)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', id
FROM public.treatments
WHERE category = 'Gezicht';

-- We koppelen Mark (admin) aan Lichaam
INSERT INTO public.staff_treatments (staff_id, treatment_id)
SELECT 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', id
FROM public.treatments
WHERE category = 'Lichaam';

-- FAKE AFSPRAKEN (Agenda vullen)
-- We plannen wat afspraken in voor de komende dagen
INSERT INTO public.appointments (staff_id, client_id, treatment_id, start_time, end_time, status, notes)
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Sofie
    (SELECT id FROM public.clients WHERE first_name = 'Lisa' LIMIT 1),
    (SELECT id FROM public.treatments WHERE title = 'Gelaat Basis' LIMIT 1),
    NOW() + INTERVAL '1 day 10 hours', -- Morgen om 10u (ongeveer)
    NOW() + INTERVAL '1 day 10 hours 45 minutes',
    'confirmed',
    'Eerste afspraak'
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', -- Mark
    (SELECT id FROM public.clients WHERE first_name = 'Tom' LIMIT 1),
    (SELECT id FROM public.treatments WHERE title = 'Rugmassage' LIMIT 1),
    NOW() + INTERVAL '2 days 14 hours', -- Overmorgen om 14u
    NOW() + INTERVAL '2 days 14 hours 30 minutes',
    'scheduled',
    'Heeft last van onderrug'
  );
