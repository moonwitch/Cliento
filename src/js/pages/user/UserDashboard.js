import { IconBox } from "../../components/blocks.js";

export async function UserDashboard() {
  const user = window.supabaseClient.auth.user();
  if (!user)
    return `<div class="text-center p-5">Je bent niet ingelogd. <a href="#" onclick="document.querySelector('.modal-overlay').style.display='flex'">Log in</a></div>`;

  // 1. Haal data op (Profiel + Afspraken)
  const [profileReq, apptReq] = await Promise.all([
    window.supabaseClient
      .from("clients")
      .select("*")
      .eq("id", user.id)
      .single(),
    window.supabaseClient
      .from("appointments")
      .select("*, treatments(title, duration, price)")
      .eq("client_id", user.id)
      .order("start_time", { ascending: true }),
  ]);

  const client = profileReq.data || { first_name: "Klant" };
  const appointments = apptReq.data || [];

  // Splitsen in toekomstig en verleden
  const now = new Date();
  const upcoming = appointments.filter(
    (a) => new Date(a.start_time) >= now && a.status !== "cancelled",
  );
  const past = appointments.filter((a) => new Date(a.start_time) < now);

  return `
    <div style="max-width: 800px; margin: 0 auto; padding: 2rem 1rem;">

        <div class="flex-between" style="align-items:end; margin-bottom: 2rem;">
            <div>
                <h1 style="margin:0;">Hi, ${client.first_name} 👋</h1>
                <p style="color:var(--text-muted);">Welkom terug bij Lyn & Skin.</p>
            </div>
            <button class="btn-primary" onclick="handleNavigation('book')">
                <i class="fas fa-plus"></i> Nieuwe Afspraak
            </button>
        </div>

        ${
          upcoming.length > 0
            ? renderNextAppointment(upcoming[0])
            : `<div class="card" style="text-align:center; padding:3rem; margin-bottom:2rem;">
                ${IconBox("fas fa-calendar-check")}
                <h3>Geen afspraken gepland</h3>
                <p class="text-muted">Tijd voor wat me-time?</p>
                <button class="btn-outline" onclick="handleNavigation('book')">Boek nu</button>
           </div>`
        }

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">

            <div class="card">
                <div class="flex-between">
                    <h3>Mijn Gegevens</h3>
                    <button class="btn-icon" onclick="handleNavigation('profile')"><i class="fas fa-edit"></i></button>
                </div>
                <div style="line-height: 1.8; color: var(--text-muted);">
                    <strong>${client.first_name} ${client.last_name}</strong><br>
                    ${client.email}<br>
                    ${client.phone || "Geen nummer"}<br>
                    ${client.address || ""}
                </div>
            </div>

            <div class="card">
                <h3>Vorige Behandelingen</h3>
                ${
                  past.length === 0
                    ? '<p class="text-muted">Nog geen geschiedenis.</p>'
                    : past
                        .slice(0, 3)
                        .map(
                          (a) => `
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding: 10px 0; font-size:0.9rem;">
                        <span>${new Date(a.start_time).toLocaleDateString()}</span>
                        <strong>${a.treatments?.title}</strong>
                    </div>
                  `,
                        )
                        .join("")
                }
            </div>
        </div>

    </div>
    `;
}

function renderNextAppointment(appt) {
  const date = new Date(appt.start_time);
  return `
    <div class="card" style="background: var(--brand-bg); border-color: var(--primary); margin-bottom: 2rem; display:flex; gap: 2rem; align-items:center; flex-wrap:wrap;">
        <div style="background:white; padding: 1rem 2rem; border-radius: var(--radius-md); text-align:center; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.9rem; text-transform:uppercase; color:var(--text-muted); font-weight:bold;">${date.toLocaleDateString("nl-NL", { month: "short" })}</div>
            <div style="font-size: 2.5rem; font-weight:bold; color:var(--primary); line-height:1;">${date.getDate()}</div>
            <div style="font-size: 0.9rem; color:var(--text-main);">${date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
        <div style="flex-grow:1;">
            <span class="badge" style="background:white; color:var(--primary); margin-bottom:0.5rem;">Eerstvolgende</span>
            <h2 style="margin:0.5rem 0;">${appt.treatments?.title}</h2>
            <p style="margin:0;"><i class="far fa-clock"></i> ${appt.treatments?.duration} min &bull; €${appt.treatments?.price}</p>
        </div>
        <div>
            <button onclick="cancelAppointment('${appt.id}')" class="btn-outline" style="border-color: #c0392b; color: #c0392b; background:white;">
                Annuleren
            </button>
        </div>
    </div>
    `;
}

// Global window function for canceling
window.cancelAppointment = async (id) => {
  if (!confirm("Ben je zeker dat je deze afspraak wilt annuleren?")) return;

  const { error } = await window.supabaseClient
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) alert("Fout: " + error.message);
  else handleNavigation("dashboard"); // Reload
};
