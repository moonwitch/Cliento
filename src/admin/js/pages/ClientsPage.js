export async function ClientsPage() {
  if (!window.supabaseClient)
    return `<div class="error-message">Supabase niet geladen.</div>`;

  // 1. Haal klanten op
  const { data: clients, error } = await window.supabaseClient
    .from("clients")
    .select("*")
    .order("last_name", { ascending: true });

  if (error) return `<div class="error-message">Error: ${error.message}</div>`;

  // 2. Render de Tabel
  return `
    <div class="flex-between">
        <div>
            <h2 class="text-title">Klantenbeheer</h2>
            <p class="text-subtitle">Overzicht van ${clients.length} cliënten.</p>
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
             <div style="position: relative;">
                <input type="text" id="search-client" class="search-input" placeholder="Zoek naam..."
                       onkeyup="filterClients()"
                       style="width: 250px; padding-left: 40px;">
                <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;"></i>
            </div>

            <button class="btn-primary" onclick="openCreateModal()">
                <i class="fas fa-plus"></i> Nieuwe Klant
            </button>
        </div>
    </div>

    <div class="table-container">
        <table id="clients-table">
            <thead>
                <tr>
                    <th>Naam</th>
                    <th>Email</th>
                    <th>Telefoon</th>
                    <th style="text-align: right;">Actie</th>
                </tr>
            </thead>
            <tbody>
                ${clients
                  .map(
                    (c) => `
                    <tr class="client-row">
                        <td><strong>${c.first_name} ${c.last_name}</strong></td>
                        <td style="color: var(--text-muted);">${c.email || "-"}</td>
                        <td>${c.phone || "-"}</td>
                        <td style="text-align: right;">
                            <button onclick="openClientDossier('${c.id}')" class="btn-icon" title="Dossier openen">
                                <i class="fas fa-folder-open"></i>
                            </button>
                        </td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>
    </div>
    `;
}

// --- LOGICA ---
window.filterClients = () => {
  const input = document.getElementById("search-client").value.toLowerCase();
  const rows = document.querySelectorAll(".client-row");
  rows.forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(input)
      ? ""
      : "none";
  });
};

window.openCreateModal = () => {
  openClientDossier(null); // Null = Nieuwe klant
};

// --- DOSSIER MODAL (Tabs voor IEDEREEN) ---
window.openClientDossier = async (clientId) => {
  const slot = document.getElementById("admin-modal-slot");

  let client = {};
  let appointments = [];
  let isNew = false;

  if (clientId) {
    // Bestaande klant ophalen
    const [clientReq, apptReq] = await Promise.all([
      window.supabaseClient
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single(),
      window.supabaseClient
        .from("appointments")
        .select("*, treatments(title)")
        .eq("client_id", clientId)
        .order("start_time", { ascending: false }),
    ]);
    client = clientReq.data;
    appointments = apptReq.data || [];
  } else {
    // Nieuwe klant: lege velden
    isNew = true;
    client = {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      birthday: "",
      allergies: "",
      concerns: "",
      notes: "",
    };
  }

  // Render Modal
  slot.innerHTML = `
        <div class="modal-overlay" onclick="closeAdminModal(event)">
            <div class="modal-card modal-card-lg" onclick="event.stopPropagation()">

                <div class="modal-header-custom">
                    <div>
                        <h3 class="modal-title" style="margin:0;">
                            ${isNew ? "Nieuwe Klant" : `${client.first_name} ${client.last_name}`}
                        </h3>
                        ${!isNew ? `<span style="font-size: 0.8rem; color: var(--text-muted);">ID: ${client.id.substring(0, 8)}...</span>` : ""}
                    </div>
                    <button onclick="closeAdminModal()" class="btn-close">&times;</button>
                </div>

                <div class="tabs-header">
                    <button onclick="switchTab('info')" class="tab-btn active" id="btn-info">Algemeen</button>
                    <button onclick="switchTab('skin')" class="tab-btn" id="btn-skin">Huid & Medisch</button>
                    <button onclick="switchTab('history')" class="tab-btn" id="btn-history">Afspraken</button>
                </div>

                <div class="modal-body-scroll">

                    <form onsubmit="saveClient(event, '${clientId || ""}')" id="client-main-form">

                        <div id="tab-info" class="tab-content">
                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label class="form-label">Voornaam *</label>
                                    <input name="first_name" class="form-input" value="${client.first_name || ""}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Achternaam *</label>
                                    <input name="last_name" class="form-input" value="${client.last_name || ""}" required>
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label class="form-label">E-mail</label>
                                    <input name="email" class="form-input" value="${client.email || ""}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Telefoon</label>
                                    <input name="phone" class="form-input" value="${client.phone || ""}">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Geboortedatum</label>
                                <input name="birthday" type="date" class="form-input" value="${client.birthday || ""}">
                            </div>

                            <div style="text-align: right; margin-top: 1rem;">
                                <button type="submit" class="btn-primary">
                                    ${isNew ? "Aanmaken" : "Opslaan"}
                                </button>
                            </div>
                        </div>

                        <div id="tab-skin" class="tab-content" style="display:none;">
                            <div class="form-stack">
                                <div class="form-group">
                                    <label class="form-label" style="color: #c0392b;">⚠️ Allergieën</label>
                                    <textarea name="allergies" class="form-input" rows="2">${client.allergies || ""}</textarea>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Huidzorgen & Wensen</label>
                                    <textarea name="concerns" class="form-input" rows="3">${client.concerns || ""}</textarea>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Interne Notities</label>
                                    <textarea name="notes" class="form-input" rows="4">${client.notes || ""}</textarea>
                                </div>

                                <div style="text-align: right; margin-top: 1rem;">
                                    <button type="submit" class="btn-primary">
                                        ${isNew ? "Aanmaken" : "Opslaan"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div id="tab-history" class="tab-content" style="display:none;">
                        ${
                          isNew
                            ? '<p class="text-muted" style="text-align:center; padding:2rem;">Sla de klant eerst op om afspraken te zien.</p>'
                            : appointments.length === 0
                              ? '<p class="text-muted" style="text-align:center; padding:2rem;">Nog geen afspraken.</p>'
                              : `<table class="table-simple">
                                    <thead><tr><th>Datum</th><th>Behandeling</th><th>Status</th></tr></thead>
                                    <tbody>${appointments
                                      .map(
                                        (a) => `
                                        <tr>
                                            <td>${new Date(a.start_time).toLocaleDateString()}</td>
                                            <td>${a.treatments?.title || "-"}</td>
                                            <td>${a.status}</td>
                                        </tr>`,
                                      )
                                      .join("")}
                                    </tbody>
                                   </table>`
                        }
                    </div>

                </div>
            </div>
        </div>
    `;
};

// --- OPSLAAN (Eén functie voor alles) ---
window.saveClient = async (e, id) => {
  e.preventDefault(); // Voorkom reload

  // FormData pakt automatisch ALLE velden in de form (ook van de verborgen tab)
  const formData = new FormData(e.target);
  const data = {};

  // Lege strings omzetten naar null
  for (let [key, value] of formData.entries()) {
    data[key] = value.trim() === "" ? null : value;
  }

  // UI Feedback op de knop die geklikt is
  // (Omdat we meerdere submit knoppen hebben, zoeken we de actieve tab knop of de target)
  const submitBtn =
    e.submitter || e.target.querySelector('button[type="submit"]');
  const orgText = submitBtn ? submitBtn.innerText : "Opslaan";
  if (submitBtn) {
    submitBtn.innerText = "Bezig...";
    submitBtn.disabled = true;
  }

  let error;
  if (id) {
    // UPDATE bestaande
    ({ error } = await window.supabaseClient
      .from("clients")
      .update(data)
      .eq("id", id));
  } else {
    // INSERT nieuwe
    ({ error } = await window.supabaseClient.from("clients").insert(data));
  }

  if (error) {
    alert("Fout: " + error.message);
    if (submitBtn) {
      submitBtn.innerText = orgText;
      submitBtn.disabled = false;
    }
  } else {
    window.closeAdminModal();
    handleNavigation("clients"); // Lijst verversen
  }
};

window.switchTab = (tabName) => {
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => (el.style.display = "none"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(`tab-${tabName}`).style.display = "block";
  document.getElementById(`btn-${tabName}`).classList.add("active");
};
