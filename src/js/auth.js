// src/js/auth.js

export async function handleLogin(email, password) {
  if (!window.supabaseClient) throw new Error("Supabase niet geladen");

  console.log("Poging tot inloggen met:", email);

  // 1. Inloggen bij Supabase
  const { data, error } = await window.supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Supabase auth error:", error);
    throw error;
  }

  console.log("Auth succesvol, rol ophalen...");

  // 2. Rol ophalen
  const { data: role, error: roleError } =
    await window.supabaseClient.rpc("get_my_role");

  // Fallback: Als RPC faalt, kunnen we soms doorgaan, maar voor nu error gooien
  if (roleError) {
    console.error("Rol error:", roleError);
    throw new Error("Kon gebruikersrol niet ophalen.");
  }

  // 3. Opslaan en doorsturen
  localStorage.setItem("user_role", role);
  console.log("Ingelogd als:", role);

  if (["admin", "superadmin", "employee"].includes(role)) {
    window.location.href = "/admin/dashboard.html";
  } else {
    // Gewone gebruiker: herlaad pagina (zodat header update)
    window.location.reload();
  }
}

export async function handleRegister(formData) {
  if (!window.supabaseClient) throw new Error("Supabase niet geladen");

  const { email, password, firstname, lastname } = formData;

  const { data, error } = await window.supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: firstname,
        last_name: lastname,
        full_name: `${firstname} ${lastname}`,
        role: "client",
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function handleLogout() {
  if (window.supabaseClient) {
    await window.supabaseClient.auth.signOut();
  }
  localStorage.removeItem("user_role");
  window.location.href = "/";
}
