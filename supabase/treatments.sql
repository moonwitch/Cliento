-- Optioneel: Maak de tabel eerst leeg zodat je geen dubbels krijgt
TRUNCATE TABLE public.treatments;

INSERT INTO public.treatments (category, title, description, duration_minutes, price)
VALUES
  -- 1. MANICURE
  ('Manicure', 'Basis manicure', 'Nagels in vorm vijlen, nagelriemen verzorgen en hydraterende handcrème.', 20, 20.00),
  ('Manicure', 'Luxe manicure', 'Nagels in vorm vijlen, nagelriemen verzorgen en nagels lakken met kleur naar keuze.', 30, 30.00),
  ('Manicure', 'Spa manicure', 'Handbad, scrub, nagelverzorging en hydraterende handcrème.', 35, 28.00),

  -- 2. NAGELS
  ('Nagels', 'BIAB natural', 'Versteviging met natuurlijke base in een natuurlijke tint.', 60, 50.00),
  ('Nagels', 'BIAB full colour/french', 'BIAB met kleur of french.', 75, 58.00),
  ('Nagels', 'Bijwerking BIAB – natural, full colour of french', 'Opvullen van bestaande BIAB-set.', 75, 55.00),
  ('Nagels', 'Hard gel natural', 'Versteviging met gel van de natuurlijke nagels met natuurlijke tint.', 70, 60.00),
  ('Nagels', 'Hard gel colour/french', 'Versteviging met gel van de natuurlijke nagels met kleur of french afwerking.', 85, 68.00),
  ('Nagels', 'Optie: hard gel verlengingen', 'Toevoeging van verlenging bij hard gel.', 15, 10.00),
  ('Nagels', 'Nail art per nagel', 'Tekening, steentjes, glitters, etc. (Prijs per nagel, duur variabel).', 5, 1.00),
  ('Nagels', 'Verwijderen gelnagels/BIAB + manicure', 'Verwijderen product, basismanicure en verstevigende nagellak.', 40, 35.00),

  -- 3. ONTHARINGEN
  ('Ontharingen', 'Ontharing bovenlip', 'Harsen + verzorgende crème.', 10, 10.00),
  ('Ontharingen', 'Ontharing wenkbrauwen', 'Hars of pincet + verzorgende crème.', 15, 12.00),
  ('Ontharingen', 'Ontharing volledig gelaat', 'Harsen van bovenlip, wangen en wenkbrauwen + verzorgende crème.', 20, 22.00),
  ('Ontharingen', 'Ontharing oksels', 'Harsen + verzorgende crème.', 15, 15.00),
  ('Ontharingen', 'Ontharing onderbenen + knie', 'Harsen onderbenen en knieën + verzorgende crème.', 20, 25.00),
  ('Ontharingen', 'Ontharing volledige benen', 'Harsen bovenbenen, knieën en onderbenen + verzorgende crème.', 35, 38.00),

  -- 4. GELAATSVERZORGING
  ('Gelaatsverzorging', 'Gelaatsverzorging mini', 'Reiniging, peeling, masker en dagverzorging.', 30, 40.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging medium', 'Mini gelaatsverzorging + epilatie bovenlip en wenkbrauwen.', 45, 50.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging luxe', 'Medium gelaatsverzorging + serum en gelaatsmassage.', 60, 65.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging anti-aging', 'Luxe gelaatsverzorging + intensieve anti-aging producten.', 80, 80.00),
  ('Gelaatsverzorging', 'Gelaatsverzorging winterpakket', 'Luxe gelaatsverzorging + extra hydraterende boost.', 80, 80.00),
  ('Gelaatsverzorging', 'Optie: speciaal masker voor het gelaat', 'Toevoeging op mini/medium/luxe-gelaatsverzorging afgestemd op huidtype.', 10, 10.00),

  -- 5. PEDICURE
  ('Pedicure', 'Basis pedicure', 'Nagels knippen/vijlen, nagelriemen verzorging, eelt verwijderen en hydraterende voetcrème.', 60, 40.00),
  ('Pedicure', 'Luxe pedicure', 'Voetbad, scrub, basispedicure en hydraterende voetcrème.', 75, 50.00),
  ('Pedicure', 'Basis pedicure + lakken van de teennagels', 'Basispedicure + lakken van de teennagels in kleur naar keuze.', 70, 48.00),
  ('Pedicure', 'Basispedicure + gellak op de teennagels', 'Basispedicure + gellak (houdt 3-4 weken).', 75, 55.00),
  ('Pedicure', 'Basispedicure + verwijderen gellak', 'Gellak verwijderen + basispedicure + verstevigende nagellak.', 75, 48.00);
