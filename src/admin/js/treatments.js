// src/admin/js/treatments.js

let treatmentsData = [];

// 1. Initialisatie
function initTreatments() {
  console.log("Treatments module gestart...");
  fetchTreatments();
}

// 2. Data Ophalen & Tabel Vullen
async function fetchTreatments() {
  const list = document.getElementById("treatments-list");
  list.innerHTML =
    '<tr><td colspan="4" style="text-align:center;">Laden...</td></tr>';

  const { data, error } = await supabaseClient
    .from("treatments")
    .select("*")
    .order("title");

  if (error) {
    list.innerHTML = `<tr><td colspan="4" style="color:red;">Fout: ${error.message}</td></tr>`;
    return;
  }

  treatmentsData = data; // Save for later
  renderTable(data);
}

function renderTable(data) {
  const list = document.getElementById("treatments-list");
  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML =
      '<tr><td colspan="4" style="text-align:center;">Nog geen behandelingen.</td></tr>';
    return;
  }

  data.forEach((item) => {
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid #eee";
    row.innerHTML = `
            <td style="padding: 12px;"><strong>${item.title}</strong></td>
            <td style="padding: 12px;">${item.duration_minutes} min</td>
            <td style="padding: 12px;">€ ${item.price}</td>
            <td style="padding: 12px; text-align: right;">
                <button class="btn-edit" style="margin-right: 5px; cursor:pointer;">✏️</button>
                <button class="btn-delete" style="cursor:pointer; color: red;">🗑️</button>
            </td>
        `;

    // Event listeners koppelen (beter dan onclick="" in HTML strings)
    row.querySelector(".btn-edit").onclick = () => openTreatmentModal(item);
    row.querySelector(".btn-delete").onclick = () => deleteTreatment(item.id);

    list.appendChild(row);
  });
}

// 3. Modal Openen (Nieuw of Bewerken)
function openTreatmentModal(treatment = null) {
  const modal = document.getElementById("treatment-modal");
  const title = document.getElementById("modal-title");

  // Reset formulier
  document.getElementById("t-msg").innerText = "";

  if (treatment) {
    // BEWERKEN: Vul velden
    title.innerText = "Behandeling Bewerken";
    document.getElementById("t-id").value = treatment.id;
    document.getElementById("t-title").value = treatment.title;
    document.getElementById("t-price").value = treatment.price;
    document.getElementById("t-duration").value = treatment.duration_minutes;
    document.getElementById("t-description").value =
      treatment.description || "";
  } else {
    // NIEUW: Leeg maken
    title.innerText = "Nieuwe Behandeling";
    document.getElementById("t-id").value = "";
    document.getElementById("t-title").value = "";
    document.getElementById("t-price").value = "";
    document.getElementById("t-duration").value = "30"; // standaard
    document.getElementById("t-description").value = "";
  }

  modal.style.display = "flex";
}

function closeTreatmentModal() {
  document.getElementById("treatment-modal").style.display = "none";
}

// 4. Opslaan (Insert of Update)
async function saveTreatment() {
  const id = document.getElementById("t-id").value;
  const title = document.getElementById("t-title").value;
  const price = document.getElementById("t-price").value;
  const duration = document.getElementById("t-duration").value;
  const desc = document.getElementById("t-description").value;
  const msg = document.getElementById("t-msg");

  if (!title || !price || !duration) {
    msg.innerText = "Vul alle verplichte velden in (*).";
    msg.style.color = "red";
    return;
  }

  msg.innerText = "Bezig met opslaan...";

  const treatmentData = {
    title: title,
    price: parseFloat(price),
    duration_minutes: parseInt(duration),
    description: desc,
  };

  let result;

  if (id) {
    // UPDATE bestaande
    result = await supabaseClient
      .from("treatments")
      .update(treatmentData)
      .eq("id", id);
  } else {
    // INSERT nieuwe
    result = await supabaseClient.from("treatments").insert([treatmentData]);
  }

  if (result.error) {
    msg.innerText = "Fout: " + result.error.message;
    msg.style.color = "red";
  } else {
    closeTreatmentModal();
    fetchTreatments(); // Ververs tabel
  }
}

// 5. Verwijderen
async function deleteTreatment(id) {
  if (!confirm("Weet je zeker dat je deze behandeling wilt verwijderen?"))
    return;

  const { error } = await supabaseClient
    .from("treatments")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Fout bij verwijderen: " + error.message);
  } else {
    fetchTreatments();
  }
}
