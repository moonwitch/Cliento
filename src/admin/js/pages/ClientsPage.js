export async function ClientsPage() {
  if (!window.supabaseClient)
    return `<div style="color:red">Supabase niet geladen.</div>`;

  // 1. Haal klanten op uit JOUW tabel (public.clients)
  const { data: clients, error } = await window.supabaseClient
    .from("clients")
    .select("*")
    .order("last_name", { ascending: true });

  if (error) return `<div style="color:red">Error: ${error.message}</div>`;

  // 2. Render de Tabel
  return `
    <div class="flex-between">
        <div>
            <h2 class="text-title">Klantenbeheer</h2>
            <p class="text-subtitle">Overzicht van ${clients.length} cliënten.</p>
        </div>
        <div style="display:flex; gap:10px;">
             <div style="position:relative;">
                <input type="text" id="search-client" placeholder="Zoek naam..."
                       onkeyup="filterClients()"
                       style="padding: 10px 15px; border-radius: 20px; border: 1px solid #ddd; width: 200px;">
                <i class="fas fa-search" style="position:absolute; right: 15px; top: 12px; color: #aaa;"></i>
            </div>
            <button class="btn-primary" onclick="alert('TODO: Modal voor nieuwe klant maken')">
                <i class="fas fa-plus"></i> Klant
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
                    <th style="text-align: right;">Dossier</th>
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
                            <button onclick="openClientDossier('${c.id}')" class="btn-primary" style="padding: 6px 15px; font-size: 0.75rem;">
                                <i class="fas fa-folder-open"></i> Open
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

// --- ZOEKFUNCTIE ---
window.filterClients = () => {
  const input = document.getElementById("search-client").value.toLowerCase();
  const rows = document.querySelectorAll(".client-row");
  rows.forEach((row) => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(input) ? "" : "none";
  });
};

// --- DOSSIER MODAL ---
window.openClientDossier = async (clientId) => {
  const slot = document.getElementById("admin-modal-slot");

  // 1. Haal data op (Klant + Afspraken)
  // We gebruiken .maybeSingle() voor de klant voor het geval er iets raars is, maar .single() is ook goed.
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

  const client = clientReq.data;
  const appointments = apptReq.data || [];

  // 2. Render Modal
  slot.innerHTML = `
        <div class="modal-overlay" onclick="closeAdminModal(event)">
            <div class="modal-card" onclick="event.stopPropagation()" style="max-width: 900px; height: 85vh; display: flex; flex-direction: column; overflow: hidden; padding: 0;">

                <div style="padding: 1.5rem; border-bottom: 1px solid #eee; display:flex; justify-content:space-between; align-items:center; background: #fff;">
                    <div>
                        <h3 class="modal-title" style="margin:0;">${client.first_name} ${client.last_name}</h3>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Klant ID: ${client.id.substring(0, 8)}...</span>
                    </div>
                    <button onclick="closeAdminModal()" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>

                <div style="padding: 0 1.5rem; background: #f9f9f9; border-bottom: 1px solid #eee; display: flex; gap: 1rem;">
                    <button onclick="switchTab('info')" class="tab-btn active" id="btn-info">Algemeen</button>
                    <button onclick="switchTab('skin')" class="tab-btn" id="btn-skin">Huid & Medisch</button>
                    <button onclick="switchTab('history')" class="tab-btn" id="btn-history">Afspraken (${appointments.length})</button>
                </div>

                <div style="flex-grow: 1; overflow-y: auto; padding: 1.5rem;">

                    <div id="tab-info" class="tab-content">
                        <form onsubmit="updateClient(event, '${client.id}')" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">

                            <div class="form-group">
                                <label class="form-label">Voornaam</label>
                                <input name="first_name" class="form-input" value="${client.first_name || ""}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Achternaam</label>
                                <input name="last_name" class="form-input" value="${client.last_name || ""}" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">E-mail</label>
                                <input name="email" class="form-input" value="${client.email || ""}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Telefoon</label>
                                <input name="phone" class="form-input" value="${client.phone || ""}">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Geboortedatum</label>
                                <input name="birthday" type="date" class="form-input" value="${client.birthday || ""}">
                            </div>

                            <div style="grid-column: span 2; margin-top: 1rem; text-align: right;">
                                <button type="submit" class="btn-primary">Gegevens Opslaan</button>
                            </div>
                        </form>
                    </div>

                    <div id="tab-skin" class="tab-content" style="display:none;">
                        <form onsubmit="updateClient(event, '${client.id}')" style="display: flex; flex-direction: column; gap: 1.5rem;">

                            <div class="form-group">
                                <label class="form-label" style="color: #c0392b;">⚠️ Allergieën</label>
                                <textarea name="allergies" class="form-input" rows="2" placeholder="Bijv. Noten, Latex...">${client.allergies || ""}</textarea>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Huidzorgen & Wensen (Concerns)</label>
                                <textarea name="concerns" class="form-input" rows="3" placeholder="Bijv. Acne, droge huid, rimpels...">${client.concerns || ""}</textarea>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Algemene Notities (Interne info)</label>
                                <textarea name="notes" class="form-input" rows="4" placeholder="Bijv. Voorkeur voor thee, gevoelige ogen...">${client.notes || ""}</textarea>
                            </div>

                            <div style="text-align: right;">
                                <button type="submit" class="btn-primary">Notities Opslaan</button>
                            </div>
                        </form>
                    </div>

                    <div id="tab-history" class="tab-content" style="display:none;">
                        ${
                          appointments.length === 0
                            ? '<p style="color:#888; text-align:center; margin-top:2rem;">Nog geen afspraken gevonden.</p>'
                            : `
                            <table style="width:100%; border-collapse: collapse; font-size: 0.9rem;">
                                <thead style="background: #f9f9f9; border-bottom: 2px solid #eee;">
                                    <tr>
                                        <th style="padding:10px; text-align:left;">Datum</th>
                                        <th style="padding:10px; text-align:left;">Behandeling</th>
                                        <th style="padding:10px; text-align:left;">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${appointments
                                      .map(
                                        (a) => `
                                        <tr style="border-bottom:1px solid #eee;">
                                            <td style="padding:10px;">
                                                ${new Date(a.start_time).toLocaleDateString("nl-NL")}
                                                <br><small style="color:#888;">${new Date(a.start_time).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</small>
                                            </td>
                                            <td style="padding:10px;">
                                                <strong>${a.treatments?.title || "Onbekend"}</strong>
                                            </td>
                                            <td style="padding:10px;">
                                                ${getStatusBadge(a.status)}
                                            </td>
                                        </tr>
                                    `,
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                        `
                        }
                    </div>

                </div>
            </div>
        </div>
    `;

  addTabStyles();
};

// --- LOGICA ---

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

window.updateClient = async (e, id) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  // Converteer lege strings naar null voor datum/tekst velden
  const updates = {};
  for (let [key, value] of formData.entries()) {
    updates[key] = value.trim() === "" ? null : value;
  }

  const btn = e.target.querySelector("button");
  const orgText = btn.innerText;
  btn.innerText = "Opslaan...";

  const { error } = await window.supabaseClient
    .from("clients") // Let op: Tabel is nu 'clients'
    .update(updates)
    .eq("id", id);

  if (error) {
    alert("Fout: " + error.message);
  } else {
    // Visuele feedback knop
    btn.style.backgroundColor = "var(--secondary)";
    btn.innerText = "Gelukt!";
    setTimeout(() => {
      btn.style.backgroundColor = "";
      btn.innerText = orgText;
    }, 2000);

    // Update ook de lijst in de achtergrond (als naam veranderd is)
    handleNavigation("clients");
  }
};

// Helpers
function getStatusBadge(status) {
  const colors = {
    scheduled: "#f39c12",
    completed: "#27ae60",
    cancelled: "#c0392b",
  };
  const labels = {
    scheduled: "Ingepland",
    completed: "Voltooid",
    cancelled: "Geannuleerd",
  };
  return `<span style="color:${colors[status] || "black"}; font-weight:bold; font-size:0.8rem;">${labels[status] || status}</span>`;
}

function addTabStyles() {
  if (document.getElementById("tab-styles")) return;
  const style = document.createElement("style");
  style.id = "tab-styles";
  style.innerHTML = `
        .tab-btn {
            border: none;
            background: transparent;
            padding: 12px 20px;
            cursor: pointer;
            font-weight: bold;
            color: var(--text-muted);
            border-bottom: 3px solid transparent;
            transition: 0.2s;
        }
        .tab-btn:hover { color: var(--primary); }
        .tab-btn.active {
            color: var(--primary);
            border-bottom: 3px solid var(--primary);
        }
    `;
  document.head.appendChild(style);
}
