// src/js/auth.js

// 1. INLOGGEN
async function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const statusMsg = document.getElementById("status-msg");

  if (!email || !password) return; // Simpele check

  statusMsg.innerText = "Verbinden...";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    statusMsg.innerText = "Fout: " + error.message;
    statusMsg.style.color = "red";
  } else {
    window.location.href = "dashboard.html";
  }
}

// 2. REGISTREREN (HIER ZAT HET PROBLEEM)
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

  // Stuur naam mee als 'metadata' -> Dit triggert de database om een klantfiche te maken
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
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
