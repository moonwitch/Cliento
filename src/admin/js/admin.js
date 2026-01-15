// src/admin/js/admin.js

import { Sidebar } from "./components/Sidebar.js";

import { DashboardPage } from "./pages/DashboardPage.js";
import { CalendarPage } from "./pages/CalendarPage.js";
import { ClientsPage } from "./pages/ClientsPage.js";
import { TreatmentsPage } from "./pages/TreatmentsPage.js";
import { StaffPage } from "./pages/StaffPage.js";
import { CmsPage } from "./pages/CmsPage.js";

// Routing
const routes = {
  dashboard: { title: "Overzicht", component: DashboardPage },
  calendar: { title: "Agenda", component: CalendarPage },
  clients: { title: "Klanten", component: ClientsPage },
  treatments: { title: "Diensten", component: TreatmentsPage },
  staff: { title: "Personeel", component: StaffPage },
  cms: { title: "Website", component: CmsPage },
};

// Init
async function init() {
  console.log("🚀 Admin App gestart...");

  if (!window.supabaseClient) {
    document.getElementById("app-content").innerHTML = `
            <div class="error-message">
                Configuratie fout: Supabase client ontbreekt.
            </div>`;
    return;
  }

  // AUTH CHECK
  const {
    data: { session },
  } = await window.supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "/";
    return;
  }

  // Render de Sidebar (links)
  renderSidebar("dashboard");

  // Render de startpagina (rechts)
  handleNavigation("dashboard");
}

// 2. Navigatie Functie
window.handleNavigation = async (pageKey) => {
  const contentDiv = document.getElementById("app-content");
  const route = routes[pageKey];

  if (!route) return;

  renderSidebar(pageKey);

  contentDiv.innerHTML = `
    <div class="loading-container">
      <i class="fas fa-spinner loading-spinner"></i>
      <p>Laden...</p>
    </div>
  `;

  try {
    const html = await route.component();
    contentDiv.innerHTML = html;
    document.title = `${route.title} | Admin Panel`;
  } catch (error) {
    contentDiv.innerHTML = `
      <div class="error-message">
        <strong>Oeps!</strong> Er ging iets mis bij het laden van de pagina.<br>
        <small>${error.message}</small>
      </div>`;
  }
};

// 3. Sidebar Renderen
function renderSidebar(activePage) {
  const container = document.getElementById("sidebar-container");
  if (container) {
    container.innerHTML = Sidebar(activePage);
  }
}

// 4. Uitloggen
window.handleLogout = async () => {
  await window.supabaseClient.auth.signOut();
  window.location.href = "/";
};

// 5. Modal Sluiten
window.closeAdminModal = () => {
  document.getElementById("admin-modal-slot").innerHTML = "";
};

// START DE MOTOR!
init();
