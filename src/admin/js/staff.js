// src/admin/js/staff.js

let staffData = []; // Bakje voor de mensen
let treatmentsData = []; // Bakje voor de opties (voor in de modal)

function initStaff() {
  console.log("Staff module gestart...");
  fetchStaff(); // Haal mensen op
  fetchTreatments(); // Haal opties op
}

// 1. Alle behandelingen ophalen (voor de checkboxes straks)
async function fetchTreatments() {
  // Let op: we hoeven hier niks in de HTML te zetten,
  // we hebben deze data alleen nodig voor het geheugen (de variabele).

  const { data, error } = await supabaseClient
    .from("treatments") // Gewoon de master-lijst
    .select("*")
    .order("title");

  if (error) {
    console.error("Fout bij ophalen behandelingen:", error);
  } else {
    treatmentsData = data; // ✅ In het juiste bakje!
    console.log("Behandelingen ingeladen:", data.length);
  }
}

// 2. Personeel ophalen (voor de tabel)
async function fetchStaff() {
  const list = document.getElementById("staff-list");
  list.innerHTML =
    '<tr><td colspan="4" style="text-align:center;">Laden...</td></tr>';

  // We halen iedereen op die géén klant is (dus admin of staff)
  // Pas dit filter aan als je alleen 'staff' wilt.
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    // .eq("role", "staff")  <-- Zet dit aan als je strikt wilt filteren
    .order("email"); // Profiles hebben vaak geen titel, dus email of naam is veiliger

  if (error) {
    list.innerHTML = `<tr><td colspan="4" style="color:red;">Fout: ${error.message}</td></tr>`;
    return;
  }

  staffData = data; // ✅ In het juiste bakje!
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
