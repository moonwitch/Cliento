-- Functions en Triggers
-- New user function
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
  full_name := TRIM(first_name || ' ' || last_name);
  role := (new.raw_user_meta_data->>'role')::public.user_role; -- typecasting needed

  -- Profiel aanmaken
  INSERT INTO public.profiles (id, first_name, last_name, full_name, role)
  VALUES (
    new.id,
    first_name,
    last_name,
    full_name,
    role
  );

  -- Klantenfiche aanmaken (alleen als het een klant is)
  IF role = 'client' THEN
      INSERT INTO public.clients (user_id, first_name, last_name, email, phone_number)
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
drop trigger IF exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after INSERT on auth.users for EACH row
execute PROCEDURE public.handle_new_user ();

-- Helper function
create or replace function public.get_my_role () RETURNS user_role LANGUAGE plpgsql SECURITY DEFINER
set
  search_path = public as $$
DECLARE
    user_data user_role;
BEGIN
    SELECT role INTO user_data
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN user_data;
  END;
  $$;