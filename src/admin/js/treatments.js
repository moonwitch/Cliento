// src/admin/js/treatments.js

let treatmentsData = [];

// 1. Initialisatie
function initTreatments() {
  console.log("Treatments module gestart...");
  fetchTreatments();
}

// 2. Data Ophalen
async function fetchTreatments() {
  const list = document.getElementById("treatments-list");
  if (!list) return; // Veiligheid voor als de pagina nog niet geladen is

  list.innerHTML =
    '<tr><td colspan="4" class="p-8 text-center text-brand-text/50 italic animate-pulse">Laden...</td></tr>';

  const { data, error } = await supabaseClient
    .from("treatments")
    .select("*")
    .order("title");

  if (error) {
    list.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-500 font-bold">Fout: ${error.message}</td></tr>`;
    return;
  }

  treatmentsData = data;
  renderTable(data);
}

// 3. Tabel Renderen (Tailwind Style!)
function renderTable(data) {
  const list = document.getElementById("treatments-list");
  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML =
      '<tr><td colspan="4" class="p-8 text-center text-brand-text/50 italic">Nog geen behandelingen gevonden.</td></tr>';
    return;
  }

  data.forEach((item) => {
    const row = document.createElement("tr");
    // Tailwind classes voor hover effect en border
    row.className =
      "hover:bg-brand-bg/30 transition-colors group border-b border-brand-muted/30 last:border-none";

    row.innerHTML = `
            <td class="p-6">
                <span class="font-bold text-brand-text text-sm block">${item.title}</span>
                ${item.description ? `<span class="text-xs text-brand-text/50 truncate max-w-[200px] block">${item.description}</span>` : ""}
            </td>
            <td class="p-6 text-sm text-brand-text/80">
                <span class="bg-brand-bg px-3 py-1 rounded-full border border-brand-muted/50">
                    ⏱️ ${item.duration_minutes} min
                </span>
            </td>
            <td class="p-6 text-sm font-bold text-brand-primary">
                € ${parseFloat(item.price).toFixed(2)}
            </td>
            <td class="p-6 text-right">
                <button class="btn-edit text-brand-text/40 hover:text-brand-primary transition-colors text-lg mr-3" title="Bewerken">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete text-brand-text/40 hover:text-red-500 transition-colors text-lg" title="Verwijderen">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;

    // Events koppelen
    row.querySelector(".btn-edit").onclick = () => openTreatmentModal(item);
    row.querySelector(".btn-delete").onclick = () => deleteTreatment(item.id);

    list.appendChild(row);
  });
}

// 4. Modal Logic (HTML IDs moeten matchen met treatments.html)
function openTreatmentModal(treatment = null) {
  const modal = document.getElementById("treatment-modal");
  const title = document.getElementById("modal-title");

  document.getElementById("t-msg").innerText = "";

  if (treatment) {
    title.innerText = "Behandeling Bewerken";
    document.getElementById("t-id").value = treatment.id;
    document.getElementById("t-title").value = treatment.title;
    document.getElementById("t-price").value = treatment.price;
    document.getElementById("t-duration").value = treatment.duration_minutes;
    document.getElementById("t-description").value =
      treatment.description || "";
  } else {
    title.innerText = "Nieuwe Behandeling";
    document.getElementById("t-id").value = "";
    document.getElementById("t-title").value = "";
    document.getElementById("t-price").value = "";
    document.getElementById("t-duration").value = "30";
    document.getElementById("t-description").value = "";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeTreatmentModal() {
  const modal = document.getElementById("treatment-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// 5. Opslaan & Verwijderen (Supabase Logic)
async function saveTreatment() {
  const id = document.getElementById("t-id").value;
  const title = document.getElementById("t-title").value;
  const price = document.getElementById("t-price").value;
  const duration = document.getElementById("t-duration").value;
  const desc = document.getElementById("t-description").value;
  const msg = document.getElementById("t-msg");

  if (!title || !price || !duration) {
    msg.innerText = "⚠️ Vul alle velden met een * in.";
    msg.className = "text-center text-xs font-bold text-red-500 mt-2";
    return;
  }

  msg.innerText = "Opslaan...";
  msg.className = "text-center text-xs font-bold text-brand-primary mt-2";

  const payload = {
    title: title,
    price: parseFloat(price),
    duration_minutes: parseInt(duration),
    description: desc,
  };

  let result;
  if (id) {
    result = await supabaseClient
      .from("treatments")
      .update(payload)
      .eq("id", id);
  } else {
    result = await supabaseClient.from("treatments").insert([payload]);
  }

  if (result.error) {
    msg.innerText = "Fout: " + result.error.message;
    msg.className = "text-center text-xs font-bold text-red-500 mt-2";
  } else {
    closeTreatmentModal();
    fetchTreatments();
  }
}

async function deleteTreatment(id) {
  if (!confirm("Weet je zeker dat je deze behandeling wilt verwijderen?"))
    return;
  const { error } = await supabaseClient
    .from("treatments")
    .delete()
    .eq("id", id);
  if (error) alert("Fout: " + error.message);
  else fetchTreatments();
}
