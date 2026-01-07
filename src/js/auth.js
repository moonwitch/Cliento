// src/js/auth.js

// 1. INLOGGEN
async function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const statusMsg = document.getElementById("status-msg");

  try {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    console.log("Inloggen auth gelukt, nu rol ophalen...");

    // 2. De database vragen: Welke rol heeft deze user?
    const { data: role, error: roleError } =
      await supabaseClient.rpc("get_my_role");

    if (roleError) throw roleError;

    console.log("Gebruiker is ingelogd als:", role);

    // 3. De Verkeersregelaar: Stuur ze naar de juiste pagina
    if (["admin", "superadmin", "employee"].includes(role)) {
      window.location.href = "/admin/dashboard.html";
    } else {
      window.location.href = "/dashboard.html";
    }
  } catch (error) {
    console.error("Er ging iets mis:", error.message);
    alert("Inloggen mislukt: " + error.message);
  }
}

async function handleSignup() {
  // Haal de nieuwe velden op
  const firstName = document.getElementById("reg-firstname").value;
  const lastName = document.getElementById("reg-lastname").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const statusMsg = document.getElementById("status-msg");

  if (!email || !password || !firstName || !lastName) {
    statusMsg.innerText = "Vul aub alle velden in (ook je naam).";
    statusMsg.style.color = "red";
    return;
  }

  statusMsg.innerText = "Registreren...";

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        role: "client",
        phone: document.getElementById("reg-phone").value,
        birthday: document.getElementById("reg-bday").value,
      },
    },
  });

  if (error) {
    statusMsg.innerText = "Fout: " + error.message;
    statusMsg.style.color = "red";
  } else {
    statusMsg.innerText = "Gelukt! Je kan nu inloggen.";
    statusMsg.style.color = "green";
    setTimeout(() => {
      // Ga terug naar login scherm
      toggleMode();
      document.getElementById("login-email").value = email;
    }, 1500);
  }
}

// 3. UITLOGGEN
async function handleLogout() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}
