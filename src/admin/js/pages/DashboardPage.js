export async function DashboardPage() {
  if (!window.supabaseClient)
    return `<div style="color:red">Supabase niet geladen.</div>`;

  // Datums voor filters
  const todayStart = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const nowISO = new Date().toISOString();

  // --- 1. DATA OPHALEN (Parallel voor snelheid) ---
  const [statsReq, appointmentsReq, clientsReq] = await Promise.all([
    // A. Stats: Tel afspraken van VANDAAG
    window.supabaseClient
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("start_time", `${todayStart}T00:00:00`)
      .lte("start_time", `${todayStart}T23:59:59`),

    // B. Eerstvolgende 5 afspraken (die nog moeten komen)
    window.supabaseClient
      .from("appointments")
      .select("*, clients(first_name, last_name), treatments(title)")
      .gte("start_time", nowISO) // Alleen toekomst
      .order("start_time", { ascending: true })
      .limit(5),

    // C. Nieuwste 5 klanten
    window.supabaseClient
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Data uitpakken
  const todayCount = statsReq.count || 0;
  const nextAppts = appointmentsReq.data || [];
  const newClients = clientsReq.data || [];

  // Simpele begroeting op basis van tijd
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  // --- 2. HTML RENDEREN ---
  return `
    <div class="flex-between">
        <div>
            <h2 class="text-title">${greeting}, Admin 👋</h2>
            <p class="text-subtitle">Hier is het overzicht van vandaag.</p>
        </div>
        <button class="btn-primary" onclick="handleNavigation('calendar')">
            <i class="fas fa-calendar-plus"></i> Agenda Openen
        </button>
    </div>

    <div class="dashboard-stats">
        <div class="stat-card">
            <span class="stat-value">${todayCount}</span>
            <span class="stat-label">Afspraken Vandaag</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${nextAppts.length}</span>
            <span class="stat-label">Komende week</span>
        </div>
        <div class="stat-card" style="border-color: var(--primary);">
            <span class="stat-value" style="font-size:1.5rem; margin-bottom:5px;">
                <i class="fas fa-magic"></i>
            </span>
            <span class="stat-label">Snel Actie</span>
            <div style="margin-top:10px; display:flex; gap:10px;">
                <button onclick="openAppointmentModal()" style="font-size:0.8rem; cursor:pointer; border:none; background: #eee; padding:5px 10px; rounded:5px;">+ Afspraak</button>
                <button onclick="alert('TODO: Factuur')" style="font-size:0.8rem; cursor:pointer; border:none; background: #eee; padding:5px 10px; rounded:5px;">+ Factuur</button>
            </div>
        </div>
    </div>

    <div class="dashboard-grid">

        <div class="card">
            <div class="flex-between" style="margin-bottom:1rem;">
                <h3 style="margin:0;">📅 Eerstvolgende Afspraken</h3>
                <a href="#" onclick="handleNavigation('calendar')" style="font-size:0.85rem; color:var(--primary);">Alles zien &rarr;</a>
            </div>

            ${
              nextAppts.length === 0
                ? '<p style="color:#999;">Geen komende afspraken.</p>'
                : `
                <div class="table-container" style="box-shadow:none; border:none;">
                    <table>
                        <thead>
                            <tr>
                                <th style="padding-left:0;">Tijd</th>
                                <th>Klant</th>
                                <th>Behandeling</th>
                                <th style="text-align:right;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${nextAppts
                              .map(
                                (a) => `
                                <tr onclick="openAppointmentModal('${a.id}')" style="cursor:pointer;">
                                    <td style="padding-left:0; font-weight:bold;">
                                        ${formatDateShort(a.start_time)}
                                    </td>
                                    <td>${a.clients?.first_name} ${a.clients?.last_name}</td>
                                    <td><small>${a.treatments?.title || "-"}</small></td>
                                    <td style="text-align:right;">${getStatusDot(a.status)}</td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            `
            }
        </div>

        <div style="display:flex; flex-direction:column; gap: 1.5rem;">

            <div class="card">
                <h3 style="margin:0 0 1rem 0;">✨ Nieuwe Klanten</h3>
                ${
                  newClients.length === 0
                    ? "<p>Nog geen klanten.</p>"
                    : `
                    <ul class="widget-list">
                        ${newClients
                          .map(
                            (c) => `
                            <li class="widget-item">
                                <div class="widget-avatar">${c.first_name.charAt(0)}</div>
                                <div style="flex-grow:1;">
                                    <div style="font-weight:bold; font-size:0.9rem;">${c.first_name} ${c.last_name}</div>
                                    <div style="font-size:0.8rem; color:#888;">${new Date(c.created_at).toLocaleDateString("nl-NL")}</div>
                                </div>
                                <button onclick="openClientDossier('${c.id}')" style="border:none; background:none; cursor:pointer; color:var(--primary);">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </li>
                        `,
                          )
                          .join("")}
                    </ul>
                `
                }
                <div style="margin-top:1rem; text-align:center;">
                    <a href="#" onclick="handleNavigation('clients')" style="font-size:0.85rem; font-weight:bold;">Naar Klantenbeheer</a>
                </div>
            </div>

            <div class="card" style="background: var(--brand-bg);">
                <h3 style="margin:0 0 1rem 0; font-size:1rem;">Beheer</h3>
                <div style="display:flex; flex-wrap:wrap; gap:10px;">
                    <button onclick="handleNavigation('treatments')" style="flex:1; padding:10px; border:1px solid #ddd; background:white; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-syringe"></i><br>Diensten
                    </button>
                    <button onclick="handleNavigation('staff')" style="flex:1; padding:10px; border:1px solid #ddd; background:white; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-users"></i><br>Team
                    </button>
                    <button onclick="handleNavigation('cms')" style="flex:1; padding:10px; border:1px solid #ddd; background:white; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-laptop"></i><br>Site
                    </button>
                </div>
            </div>

        </div>
    </div>
    `;
}

// --- HELPERS ---

function formatDateShort(isoString) {
  const date = new Date(isoString);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() && date.getMonth() === today.getMonth();

  const timeStr = date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday)
    return `<span style="color:var(--primary);">Vandaag ${timeStr}</span>`;
  return `${date.getDate()}/${date.getMonth() + 1} ${timeStr}`;
}

function getStatusDot(status) {
  const colors = {
    scheduled: "orange",
    confirmed: "var(--primary)",
    completed: "green",
    cancelled: "red",
  };
  return `<i class="fas fa-circle" style="font-size:0.6rem; color:${colors[status] || "#ccc"};" title="${status}"></i>`;
}
