// src/admin/js/staff.js

let staffData = [];
let treatmentvsEmployeeData = [];

function initStaff() {
  console.log("Staff module gestart...");
  fetchStaff();
  fetchTreatments();
}

// 1. Alle behandelingen ophalen
async function fetchTreatments() {
  const { data, error } = await supabaseClient
    .from("treatments")
    .select("*")
    .order("title");

  if (error) {
    console.error("Fout bij ophalen behandelingen:", error);
  } else {
    treatmentvsEmployeeData = data;
    console.log("Behandelingen ingeladen:", data.length);
  }
}

// 2. Personeel ophalen
async function fetchStaff() {
  const list = document.getElementById("staff-list");
  list.innerHTML =
    '<tr><td colspan="4" style="text-align:center;">Laden...</td></tr>';

  // We halen iedereen op die géén klant is
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .neq("role", "client")
    .order("full_name");

  if (error) {
    list.innerHTML = `<tr><td colspan="4" style="color:red;">Fout: ${error.message}</td></tr>`;
    return;
  }

  staffData = data;
  renderStaffTable(data);
}

// 3. De Tabel Renderen
function renderStaffTable(data) {
  const list = document.getElementById("staff-list");
  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML =
      '<tr><td colspan="4" style="text-align:center;">Geen personeel gevonden.</td></tr>';
    return;
  }

  data.forEach((person) => {
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid #eee";

    // Status bolletje 🟢 / 🔴
    const statusColor = person.is_active ? "green" : "red";

    row.innerHTML = `
            <td style="padding: 12px;">
                <strong>${person.full_name}</strong><br>
                <span style="font-size:0.8em; color:#666;">${person.role || "Geen rol"}</span>
            </td>
            <td style="padding: 12px;">
                <strong>${person.email}</strong><br>
                <span style="font-size:0.8em; color:#666;">${person.role || "Geen rol"}</span>
            </td>
            <td style="padding: 12px;">
                <span style="height: 10px; width: 10px; background-color: ${statusColor}; border-radius: 50%; display: inline-block;"></span>
                ${person.is_active ? "Actief" : "Geblokkeerd"}
            </td>
            <td style="padding: 12px; text-align: right;">
                <button class="btn-edit" style="cursor:pointer;">✏️</button>
            </td>
        `;

    // Klik event
    row.querySelector(".btn-edit").onclick = () => openStaffModal(person);
    list.appendChild(row);
  });
}

async function openStaffModal(person = null) {
  const modal = document.getElementById("staff-modal");
  const container = document.getElementById("treatment-chips");

  // 0. Safety Check: Hebben we data?
  if (!treatmentvsEmployeeData || treatmentvsEmployeeData.length === 0) {
    console.warn("⚠️ Geen behandelingen gevonden in treatmentvsEmployeeData");
    container.innerHTML =
      "<p>Geen behandelingen beschikbaar om toe te wijzen.</p>";
    // Toch modal openen of returnen? Laten we de rest wel uitvoeren voor de email/titel.
  }

  // 1. Resetten
  container.innerHTML = "";
  document.getElementById("s-email").value = "";

  // 2. Titel instellen & E-mail invullen
  if (person) {
    document.getElementById("modal-title").innerText = "Medewerker Bewerken";
    document.getElementById("s-email").value = person.email;
    // We slaan het ID op in de knop zodat we weten WIE we updaten bij save
    document.getElementById("btn-save-staff").dataset.userId = person.id;
  } else {
    document.getElementById("modal-title").innerText = "Nieuwe Medewerker";
    document.getElementById("btn-save-staff").dataset.userId = ""; // Wis ID voor nieuwe user
  }

  // 3. OPHALEN: Wat doet deze persoon al? 🕵️‍♂️
  let existingIds = [];

  if (person) {
    const { data, error } = await supabaseClient
      .from("profile_treatments")
      .select("treatment_id")
      .eq("profile_id", person.id);

    if (!error && data) {
      existingIds = data.map((item) => item.treatment_id);
    } else if (error) {
      console.error("Fout bij ophalen bestaande skills:", error);
    }
  }

  // 4. CHIPS GENEREREN 🍟
  // STAP A: Haal UNIEKE categorieën op (Slechts 1x doen!)
  const categories = [
    ...new Set(treatmentvsEmployeeData.map((t) => t.category || "Overig")),
  ].sort();

  // STAP B: Loop door de categorieën
  categories.forEach((catName) => {
    // Maak een container voor deze groep
    const groupContainer = document.createElement("div");
    groupContainer.style.marginBottom = "15px";

    // Maak de Titel (bv. "Gelaatsverzorging")
    const title = document.createElement("h4");
    title.innerText = catName;
    title.className = "category-title"; // Gebruik class voor styling in CSS!
    // Inline styles zijn ok voor nu, maar classes zijn beter:
    title.style.margin = "0 0 8px 0";
    title.style.color = "var(--text-color, #333)";
    title.style.borderBottom = "1px solid #eee";
    groupContainer.appendChild(title);

    // Maak een container voor de chips van deze groep
    const chipsContainer = document.createElement("div");
    chipsContainer.style.display = "flex";
    chipsContainer.style.flexWrap = "wrap";
    chipsContainer.style.gap = "8px";

    // Filter de behandelingen die bij deze categorie horen
    const groupTreatments = treatmentvsEmployeeData.filter(
      (t) => (t.category || "Overig") === catName,
    );

    groupTreatments.forEach((treatment) => {
      const chip = document.createElement("div");
      chip.innerText = treatment.title;

      // Stijl
      chip.style.padding = "6px 12px";
      chip.style.border = "1px solid #ccc";
      chip.style.borderRadius = "15px";
      chip.style.cursor = "pointer";
      chip.style.fontSize = "0.85em";
      chip.style.userSelect = "none";
      chip.dataset.id = treatment.id;

      // Check: Is hij al actief?
      const isActive = existingIds.includes(treatment.id);

      // Helper functie voor visual state (DRY - Don't Repeat Yourself)
      const setVisualState = (isSelected) => {
        if (isSelected) {
          chip.style.backgroundColor = "var(--primary-color, lightgreen)"; // Gebruik var!
          chip.style.color = "white";
          chip.style.borderColor = "var(--primary-color, lightgreen)";
          chip.dataset.selected = "true";
        } else {
          chip.style.backgroundColor = "white";
          chip.style.color = "var(--text-color, black)";
          chip.style.borderColor = "#ccc";
          chip.dataset.selected = "false";
        }
      };

      // Init state
      setVisualState(isActive);

      // Klik event
      chip.onclick = () => {
        const isCurrentlySelected = chip.dataset.selected === "true";
        setVisualState(!isCurrentlySelected);
      };

      chipsContainer.appendChild(chip);
    });

    groupContainer.appendChild(chipsContainer);
    container.appendChild(groupContainer);
  });

  // 5. Modal tonen
  modal.style.display = "flex";
}

async function saveStaff() {
  const btn = document.getElementById("btn-save-staff");
  const userId = btn.dataset.userId;
  const emailInput = document.getElementById("s-email").value;

  // 1. Validatie
  if (!userId) {
    // Logica voor NIEUWE user (Invite flow) - bewaren we voor later?
    alert("Nieuwe medewerkers moeten eerst uitgenodigd worden via Auth.");
    return;
  }

  // 2. Loading state aan (UX!)
  const originalText = btn.innerText;
  btn.innerText = "Bezig...";
  btn.disabled = true;

  try {
    // STAP A: Welke chips zijn groen? 🟩
    const selectedChips = document.querySelectorAll(
      '#treatment-chips div[data-selected="true"]',
    );
    const treatmentIds = Array.from(selectedChips).map(
      (chip) => chip.dataset.id,
    );

    console.log(
      `Saving ${treatmentIds.length} treatments for user ${userId}...`,
    );

    // STAP B: Wipe (Verwijder oude skills) 🧹
    const { error: deleteError } = await supabaseClient
      .from("profile_treatments")
      .delete()
      .eq("profile_id", userId);

    if (deleteError) throw deleteError;

    // STAP C: Rewrite (Voeg nieuwe toe) ✍️
    if (treatmentIds.length > 0) {
      const inserts = treatmentIds.map((tId) => ({
        profile_id: userId,
        treatment_id: tId,
      }));

      const { error: insertError } = await supabaseClient
        .from("profile_treatments")
        .insert(inserts);

      if (insertError) throw insertError;
    }

    // 3. Success & Close
    alert("Medewerker succesvol opgeslagen!");
    document.getElementById("staff-modal").style.display = "none";

    // Herlaad de tabel (als je die functie hebt)
    if (typeof fetchEmployees === "function") fetchEmployees();
  } catch (err) {
    console.error("Save error:", err);
    alert("Er ging iets mis bij het opslaan.");
  } finally {
    // Reset button
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

// --- INVITE LOGIC ---
function openInviteModal() {
  document.getElementById("invite-modal").style.display = "flex";
  document.getElementById("invite-form").reset();
  document.getElementById("invite-status").innerText = "";
}

function closeInviteModal() {
  document.getElementById("invite-modal").style.display = "none";
}

async function handleInviteSubmit(event) {
  event.preventDefault();

  const email = document.getElementById("inv-email").value;
  const firstName = document.getElementById("inv-firstname").value;
  const lastName = document.getElementById("inv-lastname").value;
  const tempPass = "Welkom123";

  console.log("Email:", email);
  console.log("First Name:", firstName);
  console.log("Last Name:", lastName);

  // TRUCJE: Maak een tijdelijke client met de PUBLIEKE key (veilig!)
  // Maar zet persistSession uit, zodat jij ingelogd blijft als admin.
  const tempClient = supabase.createClient(
    window.supabaseClient.supabaseUrl,
    window.supabaseClient.supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );

  // Nu registreren we de user (dit mag met public key!)
  const { data, error } = await tempClient.auth.signUp({
    email: email,
    password: tempPass,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        role: "employee",
        is_active: true,
      },
    },
  });

  if (error) {
    alert("Fout: " + error.message);
  } else {
    alert(`Gelukt! Wachtwoord is: ${tempPass}`);
    closeInviteModal();
  }
}
