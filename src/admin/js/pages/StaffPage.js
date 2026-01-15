export async function StaffPage() {
  if (!window.supabaseClient)
    return `<div style="color:red">Supabase niet geladen.</div>`;

  // 1. Haal personeel op
  const { data: profiles, error } = await window.supabaseClient
    .from("profiles")
    .select("*")
    .neq("role", "client")
    .order("role", { ascending: false });

  if (error) return `<div style="color:red">Error: ${error.message}</div>`;

  const getRoleBadge = (role) => {
    const colors = {
      admin: "background: #D17B58; color: white;",
      employee: "background: #859573; color: white;",
      superadmin: "background: #D17B80; color: white",
    };
    const style = colors[role] || "background: #eee; color: #666;";
    return `<span style="padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; ${style}">${role}</span>`;
  };

  return `
    <div class="flex-between">
        <div>
            <h2 class="text-title">Team & Toegang</h2>
            <p class="text-subtitle">Beheer wie welke behandelingen mag uitvoeren.</p>
        </div>
        <button class="btn-primary" onclick="openInviteModal()">
            <i class="fas fa-user-plus"></i> Nieuw Teamlid
        </button>
    </div>

    <div class="filter-bar">
        <div style="position:relative;">
            <i class="fas fa-search" style="position:absolute; left: 10px; top: 10px; color:#ccc;"></i>
            <input type="text" id="search-staff" class="search-input" placeholder="Zoek naam of email..."
                   onkeyup="filterStaff()" style="padding-left: 35px;">
        </div>

        <select id="role-filter" class="form-input" onchange="filterStaff()">
            <option value="all">Alle Rollen</option>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
            <option value="superadmin">Superadmin</option>
        </select>

        <span id="staff-count" style="margin-left:auto; font-size:0.8rem; color:#888;">
            ${profiles.length} teamleden
        </span>
    </div>

    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Naam</th>
                    <th>Rol</th>
                    <th>Contact</th>
                    <th style="text-align: right;">Actie</th>
                </tr>
            </thead>
            <tbody>
                ${profiles
                  .map(
                    (p) => `
                    <tr class="staff-row" data-role="${p.role}">
                        <td><strong>${p.first_name || "-"} ${p.last_name || "-"}</strong></td>
                        <td>${getRoleBadge(p.role)}</td>
                        <td style="color: var(--text-muted); font-size: 0.9rem;">${p.email || "-"}</td>
                        <td style="text-align: right;">
                            <button onclick="openEditModal('${p.id}', '${p.role}', '${p.first_name || ""}', '${p.last_name || ""}', '${p.email || ""}')"
                                    class="btn-icon" title="Bewerken & Skills">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteUser('${p.id}')" class="btn-icon delete" title="Verwijderen">
                                <i class="fas fa-trash"></i>
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

// --- FILTER LOGICA ---
window.filterStaff = () => {
  const search = document.getElementById("search-staff").value.toLowerCase();
  const role = document.getElementById("role-filter").value;
  const rows = document.querySelectorAll(".staff-row");
  let count = 0;

  rows.forEach((row) => {
    const text = row.innerText.toLowerCase();
    const rowRole = row.dataset.role;
    const matchSearch = text.includes(search);
    const matchRole = role === "all" || rowRole === role;

    if (matchSearch && matchRole) {
      row.style.display = "";
      count++;
    } else {
      row.style.display = "none";
    }
  });

  document.getElementById("staff-count").innerText = `${count} teamleden`;
};

// --- MODALS & LOGICA ---
window.closeAdminModal = (e) => {
  if (e && !e.target.classList.contains("modal-overlay")) return;
  const slot = document.getElementById("admin-modal-slot");
  if (slot) slot.innerHTML = "";
};

// --- INVITE MODAL ---
window.openInviteModal = () => {
  const slot = document.getElementById("admin-modal-slot");
  if (!slot) return;
  slot.innerHTML = `
        <div class="modal-overlay open" onclick="closeAdminModal(event)">
            <div class="modal-card" onclick="event.stopPropagation()">
                <div style="display:flex; justify-content:space-between; margin-bottom: 1.5rem;">
                    <h3 class="modal-title">Nieuw Teamlid</h3>
                    <button onclick="closeAdminModal()" style="border:none; background:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>
                <form onsubmit="handleInvite(event)">
                    <div class="form-group"><label class="form-label">E-mail</label><input type="email" name="email" class="form-input" required></div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group"><label class="form-label">Voornaam</label><input type="text" name="firstname" class="form-input" required></div>
                        <div class="form-group"><label class="form-label">Achternaam</label><input type="text" name="lastname" class="form-input" required></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Rol</label>
                        <select name="role" class="form-input"><option value="employee">Employee</option><option value="admin">Admin</option></select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-icon" onclick="closeAdminModal()">Annuleren</button>
                        <button type="submit" class="btn-primary">Versturen</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

window.handleInvite = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orgText = btn.innerHTML;
  btn.innerHTML = "Bezig...";

  const formData = new FormData(e.target);
  const body = Object.fromEntries(formData.entries());

  try {
    const { data, error } = await window.supabaseClient.functions.invoke(
      "invite-user",
      { body },
    );
    if (error) throw new Error(error.message);
    if (data && data.error) throw new Error(data.error);

    alert(`🎉 Uitnodiging verstuurd!`);
    window.closeAdminModal();
    handleNavigation("staff");
  } catch (err) {
    alert("Fout: " + err.message);
  } finally {
    btn.innerHTML = orgText;
  }
};

// --- EDIT MODAL (Met Select All) ---
window.openEditModal = async (id, role, firstName, lastName, email) => {
  const slot = document.getElementById("admin-modal-slot");
  if (!slot) return;

  // 1. Data ophalen
  const [allTreatmentsReq, myTreatmentsReq] = await Promise.all([
    window.supabaseClient
      .from("treatments")
      .select("id, title, category")
      .order("category"),
    window.supabaseClient
      .from("staff_treatments")
      .select("treatment_id")
      .eq("staff_id", id),
  ]);

  const allTreatments = allTreatmentsReq.data || [];
  const myTreatmentIds = (myTreatmentsReq.data || []).map(
    (row) => row.treatment_id,
  );

  // 2. Groeperen
  const grouped = {};
  allTreatments.forEach((t) => {
    const cat = t.category || "Overig";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  });

  // 3. Bouw HTML met "Select All" knopjes
  let treatmentHTML = "";
  for (const [category, items] of Object.entries(grouped)) {
    // Veilige ID voor de categorie container
    const safeCatId = category.replace(/[^a-zA-Z0-9]/g, "_");

    treatmentHTML += `
            <div class="treatment-category" style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem;">
                <span>${category}</span>
                <button type="button" onclick="toggleCategory('${safeCatId}')"
                        style="background:none; border:none; color:var(--primary); font-size:0.75rem; cursor:pointer; text-decoration:underline;">
                    Alles selecteren
                </button>
            </div>
            <div class="treatment-grid" id="cat-group-${safeCatId}">`;

    items.forEach((t) => {
      const isChecked = myTreatmentIds.includes(t.id) ? "checked" : "";
      treatmentHTML += `
                <label class="checkbox-pill">
                    <input type="checkbox" name="treatments" value="${t.id}" ${isChecked}>
                    <span class="pill-content">${t.title}</span>
                </label>
            `;
    });
    treatmentHTML += `</div>`;
  }

  // 4. Render
  slot.innerHTML = `
        <div class="modal-overlay open" onclick="closeAdminModal(event)">
            <div class="modal-card" onclick="event.stopPropagation()" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 1rem;">
                    <h3 class="modal-title">Medewerker Bewerken</h3>
                    <button onclick="closeAdminModal()" style="border:none; background:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>

                <form onsubmit="saveUser(event, '${id}')">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group"><label class="form-label">Voornaam</label><input type="text" id="edit-firstname" class="form-input" value="${firstName}"></div>
                        <div class="form-group"><label class="form-label">Achternaam</label><input type="text" id="edit-lastname" class="form-input" value="${lastName}"></div>
                    </div>
                    <div class="form-group"><label class="form-label">E-mail (Alleen lezen)</label><input type="text" class="form-input" value="${email}" disabled></div>
                    <div class="form-group">
                        <label class="form-label">Rol</label>
                        <select id="edit-role" class="form-input">
                            <option value="employee" ${role === "employee" ? "selected" : ""}>Employee</option>
                            <option value="admin" ${role === "admin" ? "selected" : ""}>Admin</option>
                            <option value="superadmin" ${role === "superadmin" ? "selected" : ""}>Superadmin</option>
                        </select>
                    </div>

                    <div class="treatment-section">
                        <h4 style="margin: 0 0 10px 0; font-size: 0.9rem;">Gekoppelde Behandelingen</h4>
                        ${allTreatments.length > 0 ? treatmentHTML : "<p>Geen behandelingen gevonden.</p>"}
                    </div>

                    <div class="modal-actions" style="justify-content: space-between; margin-top: 20px;">
                         <button type="button" onclick="deleteUser('${id}')" style="color: #c0392b; background: none; border: none; cursor: pointer; text-decoration: underline;">Verwijderen</button>
                        <div style="display: flex; gap: 10px;">
                            <button type="button" class="btn-icon" onclick="closeAdminModal()">Annuleren</button>
                            <button type="submit" class="btn-primary">Opslaan</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
};

// --- NIEUWE SELECT ALL FUNCTIE ---
window.toggleCategory = (catId) => {
  const container = document.getElementById(`cat-group-${catId}`);
  if (!container) return;

  const inputs = container.querySelectorAll('input[type="checkbox"]');
  if (inputs.length === 0) return;

  // Check of ze ALLEMAAL aan staan. Zo ja -> alles uit. Anders -> alles aan.
  const allChecked = Array.from(inputs).every((input) => input.checked);

  inputs.forEach((input) => {
    input.checked = !allChecked;
  });
};

window.saveUser = async (e, id) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orgText = btn.innerText;
  btn.innerText = "Opslaan...";

  // Data verzamelen
  const newRole = document.getElementById("edit-role").value;
  const newFirst = document.getElementById("edit-firstname").value;
  const newLast = document.getElementById("edit-lastname").value;

  const checkboxes = document.querySelectorAll(
    'input[name="treatments"]:checked',
  );
  const selectedTreatmentIds = Array.from(checkboxes).map((cb) => cb.value);

  try {
    // 1. Update Profiel
    const { error: profileError } = await window.supabaseClient
      .from("profiles")
      .update({
        role: newRole,
        first_name: newFirst,
        last_name: newLast,
      })
      .eq("id", id);

    if (profileError) throw profileError;

    // 2. Update Skills (Delete All -> Insert New)
    // A. Verwijder oude
    const { error: deleteError } = await window.supabaseClient
      .from("staff_treatments")
      .delete()
      .eq("staff_id", id);

    if (deleteError) throw deleteError;

    // B. Voeg nieuwe toe
    if (selectedTreatmentIds.length > 0) {
      const newLinks = selectedTreatmentIds.map((tid) => ({
        staff_id: id,
        treatment_id: tid,
      }));

      const { error: insertError } = await window.supabaseClient
        .from("staff_treatments")
        .insert(newLinks);

      if (insertError) throw insertError;
    }

    window.closeAdminModal();
    handleNavigation("staff"); // Ververs de lijst
  } catch (err) {
    alert("Fout bij opslaan: " + err.message);
    console.error(err);
  } finally {
    btn.innerText = orgText;
  }
};

window.deleteUser = async (id) => {
  if (!confirm("Weet je zeker dat je dit teamlid wilt verwijderen?")) return;
  const { error } = await window.supabaseClient
    .from("profiles")
    .delete()
    .eq("id", id);
  if (error) alert("Fout: " + error.message);
  else {
    window.closeAdminModal();
    handleNavigation("staff");
  }
};
