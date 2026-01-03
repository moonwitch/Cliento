// src/js/auth.js

// 1. INLOGGEN
async function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const statusMsg = document.getElementById("status-msg");

  if (!email || !password) {
    statusMsg.innerText = "Vul aub beide velden in.";
    statusMsg.style.color = "red";
    return;
  }

  statusMsg.innerText = "Verbinden...";
  statusMsg.style.color = "#666";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    statusMsg.innerText = "Fout: " + error.message;
    statusMsg.style.color = "red";
  } else {
    statusMsg.innerText = "Succes! Doorverwijzen...";
    statusMsg.style.color = "green";
    window.location.href = "/dashboard.html";
  }
}

// 2. REGISTREREN (Nieuw!)
async function handleSignup() {
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const statusMsg = document.getElementById("status-msg");

  if (!email || !password) {
    statusMsg.innerText = "Kies een email en wachtwoord.";
    statusMsg.style.color = "red";
    return;
  }

  statusMsg.innerText = "Registreren...";
  statusMsg.style.color = "#666";

  // Omdat we in de SQL triggers hebben ingesteld, hoeven we hier alleen
  // de 'signUp' te doen. De database maakt zelf het profiel en de klantfiche aan.
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    statusMsg.innerText = "Fout: " + error.message;
    statusMsg.style.color = "red";
  } else {
    statusMsg.innerText = "Account aangemaakt! Je wordt ingelogd...";
    statusMsg.style.color = "green";

    // Supabase logt je vaak direct in na registratie (tenzij email confirm aan staat)
    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 1500);
  }
}

// 3. UITLOGGEN
async function handleLogout() {
  await supabaseClient.auth.signOut();
  window.location.href = "/index.html";
}

// 3. PROTECTION Logic (Put this at the top of dashboard.html)
async function checkSession() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    // No user found, kick them back to index
    window.location.href = "/index.html";
  } else {
    // User found, fetch profile/role
    const { data: profile, error } = await supabaseClient
      .from("profiles")
      .select("role, full_name")
      .eq("id", session.user.id)
      .single();

    // Update UI
    const userEmailEl = document.getElementById("user-email");
    const userRoleEl = document.getElementById("user-role");

    if (userEmailEl) userEmailEl.innerText = session.user.email;
    if (userRoleEl && profile)
      userRoleEl.innerText = profile.role.toUpperCase();

    console.log("User Role:", profile?.role);
  }
}

// 4. TEST USER LOGIN
async function loginTestUser() {
  const statusMsg = document.getElementById("status-msg");
  if (statusMsg) statusMsg.innerText = "Attempting test login...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: "kelly@test.com",
    password: "password123",
  });

  if (error) {
    if (statusMsg) {
      statusMsg.innerText = "Error: " + error.message;
      statusMsg.style.color = "red";
    }
    console.error("Test login failed:", error);
  } else {
    window.location.href = "/dashboard.html";
  }
}
