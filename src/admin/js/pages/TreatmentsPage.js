export async function TreatmentsPage() {
  if (!window.supabaseClient)
    return `<div style="color:red">Supabase niet geladen.</div>`;

  // 1. Haal data op
  const { data: treatments, error } = await window.supabaseClient
    .from("treatments")
    .select("*")
    .order("category", { ascending: true })
    .order("title", { ascending: true });

  if (error) return `<div style="color:red">Error: ${error.message}</div>`;

  const formatPrice = (p) =>
    new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(p);

  // Unieke Categorieën ophalen voor de dropdown
  const categories = [
    ...new Set(treatments.map((t) => t.category || "Overig")),
  ].sort();

  return `
    <div class="flex-between">
        <div>
            <h2 class="text-title">Behandelingen</h2>
            <p class="text-subtitle">Beheer aanbod en prijzen.</p>
        </div>
        <button class="btn-primary" onclick="openTreatmentModal()">
            <i class="fas fa-plus"></i> Nieuw
        </button>
    </div>

    <div class="filter-bar">
        <div style="position:relative;">
            <i class="fas fa-search" style="position:absolute; left: 10px; top: 10px; color:#ccc;"></i>
            <input type="text" id="search-input" class="search-input" placeholder="Zoek behandeling..."
                   onkeyup="filterTreatments()" style="padding-left: 35px;">
        </div>

        <select id="category-filter" class="form-input" onchange="filterTreatments()">
            <option value="all">Alle Categorieën</option>
            ${categories.map((c) => `<option value="${c}">${c}</option>`).join("")}
        </select>

        <span id="count-badge" style="margin-left:auto; font-size:0.8rem; color:#888;">
            ${treatments.length} resultaten
        </span>
    </div>

    <div class="table-container">
        <table id="treatments-table">
            <thead>
                <tr>
                    <th>Behandeling</th>
                    <th>Categorie</th>
                    <th>Duur</th>
                    <th>Prijs</th>
                    <th style="text-align: right;">Actie</th>
                </tr>
            </thead>
            <tbody>
                ${treatments
                  .map(
                    (t) => `
                    <tr class="treatment-row" data-category="${t.category || "Overig"}">
                        <td>
                            <strong>${t.title}</strong>
                            ${t.description ? `<br><small style="color:#999;">${t.description.substring(0, 40)}...</small>` : ""}
                        </td>
                        <td><span style="background:#f4f4f4; padding:4px 10px; border-radius:10px; font-size:0.8rem;">${t.category || "Overig"}</span></td>
                        <td><i class="far fa-clock"></i> ${t.duration_minutes} min</td>
                        <td style="color: var(--primary); font-weight:bold;">${formatPrice(t.price)}</td>
                        <td style="text-align: right;">
                            <button onclick="openTreatmentModal('${t.id}', '${t.title}', '${t.category || "Gezicht"}', '${t.duration_minutes}', '${t.price}', '${t.description || ""}')"
                                    class="btn-icon"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteTreatment('${t.id}')" class="btn-icon delete"><i class="fas fa-trash"></i></button>
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
window.filterTreatments = () => {
  const search = document.getElementById("search-input").value.toLowerCase();
  const category = document.getElementById("category-filter").value;
  const rows = document.querySelectorAll(".treatment-row");
  let visibleCount = 0;

  rows.forEach((row) => {
    // 1. Check tekst (titel of omschrijving)
    const text = row.innerText.toLowerCase();
    const matchesSearch = text.includes(search);

    // 2. Check categorie (via data attribuut)
    const rowCat = row.dataset.category;
    const matchesCategory = category === "all" || rowCat === category;

    // 3. Toon of Verberg
    if (matchesSearch && matchesCategory) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });

  // Update teller
  document.getElementById("count-badge").innerText =
    `${visibleCount} resultaten`;
};

// --- MODAL LOGICA ---

window.openTreatmentModal = (
  id = "",
  title = "",
  category = "Gezicht",
  duration = 60,
  price = 0,
  description = "",
) => {
  const slot = document.getElementById("admin-modal-slot");
  const isEdit = id !== "";

  // Zorg dat quotes in tekst geen HTML breken
  title = title.replace(/'/g, "&apos;");
  description = description.replace(/'/g, "&apos;");

  slot.innerHTML = `
    <div class="modal-overlay open" onclick="closeAdminModal(event)">
        <div class="modal-card" onclick="event.stopPropagation()">
            <div style="display:flex; justify-content:space-between; margin-bottom: 1.5rem;">
                <h3 class="modal-title">${isEdit ? "Behandeling Bewerken" : "Nieuwe Behandeling"}</h3>
                <button onclick="closeAdminModal()" style="border:none; background:none; font-size:1.5rem; cursor:pointer;">&times;</button>
            </div>

            <form onsubmit="saveTreatment(event, '${id}')">

                <div class="form-group">
                    <label class="form-label">Naam Behandeling</label>
                    <input type="text" name="title" class="form-input" required value='${title}'>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group">
                        <label class="form-label">Categorie</label>
                        <select name="category" class="form-input" style="background:var(--brand-bg);">
                            <option value="Gezicht" ${category === "Gezicht" ? "selected" : ""}>Gezicht</option>
                            <option value="Lichaam" ${category === "Lichaam" ? "selected" : ""}>Lichaam</option>
                            <option value="Pedicure" ${category === "Pedicure" ? "selected" : ""}>Pedicure</option>
                            <option value="Massage" ${category === "Massage" ? "selected" : ""}>Massage</option>
                            <option value="Ontharing" ${category === "Ontharing" ? "selected" : ""}>Ontharing</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Duur (minuten)</label>
                        <input type="number" name="duration" class="form-input" required value="${duration}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Prijs (€)</label>
                    <input type="number" name="price" step="0.01" class="form-input" required value="${price}">
                </div>

                <div class="form-group">
                    <label class="form-label">Omschrijving (Optioneel)</label>
                    <textarea name="description" class="form-input" rows="3">${description}</textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-icon" onclick="closeAdminModal()">Annuleren</button>
                    <button type="submit" class="btn-primary">
                        ${isEdit ? "Opslaan" : "Toevoegen"}
                    </button>
                </div>
            </form>
        </div>
    </div>
`;
};

window.saveTreatment = async (e, id) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.innerText = "Bezig...";

  const formData = new FormData(e.target);
  const data = {
    title: formData.get("title"),
    category: formData.get("category"),
    duration_minutes: parseInt(formData.get("duration")),
    price: parseFloat(formData.get("price")),
    description: formData.get("description"),
  };

  try {
    let error;

    if (id) {
      // Update bestaande
      ({ error } = await window.supabaseClient
        .from("treatments")
        .update(data)
        .eq("id", id));
    } else {
      // Nieuwe aanmaken
      ({ error } = await window.supabaseClient.from("treatments").insert(data));
    }

    if (error) throw error;

    window.closeAdminModal();
    handleNavigation("treatments"); // Ververs lijst
  } catch (err) {
    alert("Fout bij opslaan: " + err.message);
    btn.innerText = "Probeer opnieuw";
  }
};

window.deleteTreatment = async (id) => {
  if (!confirm("Weet je zeker dat je deze behandeling wilt verwijderen?"))
    return;

  const { error } = await window.supabaseClient
    .from("treatments")
    .delete()
    .eq("id", id);

  if (error) alert("Fout: " + error.message);
  else handleNavigation("treatments");
};
