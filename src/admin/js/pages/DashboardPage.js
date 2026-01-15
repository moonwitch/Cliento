export async function DashboardPage() {
  if (!window.supabaseClient)
    return `<div style="color:red">Supabase niet geladen.</div>`;

  // Datums voor filters
  const todayStart = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const nowISO = new Date().toISOString();

  // --- 1. DATA OPHALEN ---
  const [statsReq, appointmentsReq, clientsReq] = await Promise.all([
    // A. Stats: Tel afspraken van VANDAAG
    window.supabaseClient
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("start_time", `${todayStart}T00:00:00`)
      .lte("start_time", `${todayStart}T23:59:59`),

    // B. Eerstvolgende 5 afspraken
    window.supabaseClient
      .from("appointments")
      .select("*, clients(first_name, last_name), treatments(title)")
      .gte("start_time", nowISO)
      .order("start_time", { ascending: true })
      .limit(5),

    // C. Nieuwste 5 klanten
    window.supabaseClient
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const todayCount = statsReq.count || 0;
  const nextAppts = appointmentsReq.data || [];
  const newClients = clientsReq.data || [];

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
          <i class="fas fa-calendar-alt"></i> Agenda Openen
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
      <div class="stat-card" style="border: 1px dashed var(--border-color); background: transparent;">
        <span class="stat-label" style="margin: auto;">Nog geen meldingen</span>
      </div>
    </div>

    <div class="dashboard-grid">

      <div style="display:flex; flex-direction:column; gap: 1.5rem;">

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
                    <tbody>
                        ${nextAppts
                          .map(
                            (a) => `
                        <tr onclick="openAppointmentModal('${a.id}')" style="cursor:pointer;">
                            <td style="padding-left:0; font-weight:bold; width: 80px;">
                            ${formatDateShort(a.start_time)}
                            </td>
                            <td>
                                ${a.clients?.first_name} ${a.clients?.last_name}
                                <div style="font-size:0.8rem; color:#888;">${a.treatments?.title || "-"}</div>
                            </td>
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

        <div class="card">
            <h3 style="margin:0 0 1rem 0;">✨ Nieuwste Klanten</h3>
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
                        <button onclick="openClientDossier('${c.id}')" class="btn-icon">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </li>
                    `,
                      )
                      .join("")}
                </ul>
            `
            }
        </div>

      </div> <div>
        <div class="card" style="background: var(--brand-bg);">
            <h3 style="margin:0 0 1rem 0; font-size:1rem;">Snelle Acties</h3>
            <div style="display:flex; flex-direction:column; gap:10px;">
                <button onclick="openAppointmentModal()" class="btn-primary" style="justify-content:center; width:100%;">
                    <i class="fas fa-calendar-plus"></i> Maak Afspraak
                </button>
                <button onclick="openCreateModal()" class="btn-outline" style="justify-content:center; width:100%; background: white;">
                    <i class="fas fa-user-plus"></i> Nieuwe Klant
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
    return `<span style="color:var(--primary); font-weight:bold;">${timeStr}</span>`;
  return `${date.getDate()}/${date.getMonth() + 1} <span style="color:#999; font-size:0.8em;">${timeStr}</span>`;
}

function getStatusDot(status) {
  const colors = {
    scheduled: "orange",
    confirmed: "var(--primary)",
    completed: "green",
    cancelled: "#eee",
  };
  return `<i class="fas fa-circle" style="font-size:0.6rem; color:${colors[status] || "#ccc"};" title="${status}"></i>`;
}
