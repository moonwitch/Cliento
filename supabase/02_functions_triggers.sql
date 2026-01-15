-- ================================================================
-- BESTAND: 02_triggers.sql
-- BESCHRIJVING: Functies en Triggers voor automatisering
-- ================================================================

-- Helper function: get_my_role()
-- Haalt rol van user op
create or replace function public.get_my_role ()
RETURNS user_role
SET
  search_path = public as $$
DECLARE
    user_data user_role;
BEGIN
    SELECT role INTO user_data
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger functie: handle_new_user()
-- Maakt automatisch een Profile aan zodra een User zich registreert.
create or replace function public.handle_new_user () RETURNS trigger as $$
DECLARE
    first_name TEXT;
    last_name TEXT;
    full_name TEXT;
    role public.user_role;
BEGIN
  -- Data voorbereiden
  first_name := COALESCE(new.raw_user_meta_data->>'first_name', '');
  last_name := COALESCE(new.raw_user_meta_data->>'last_name', '');
  role := (new.raw_user_meta_data->>'role')::public.user_role; -- typecasting needed

  -- Profiel aanmaken
  INSERT INTO public.profiles (id, first_name, last_name, role, email, is_active)
  VALUES (
    new.id,
    first_name,
    last_name,
    role,
    new.email,
    true
  );

  -- Klantenfiche aanmaken (alleen als het een klant is)
  IF role = 'client' THEN
      INSERT INTO public.clients (id, first_name, last_name, email, phone_number)
      VALUES (
        new.id,
        first_name,
        last_name,
        new.email,
        new.raw_user_meta_data->>'phone_number'
      );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Om een user aan te maken hebben we rechten nodig, maar als een nieuwe user wil registeren lukt dat hierdoor niet. Dus moeten we ff RLS ontsnappen op deze manier.
DROP trigger IF EXISTS on_auth_user_created ON auth.users;

-- Koppel de trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
