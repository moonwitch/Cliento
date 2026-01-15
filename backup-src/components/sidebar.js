// Bestand: src/js/components/Sidebar.js

export function Sidebar() {
  // 1. Hier kan je JAVASCRIPT logica zetten (boven de return)
  const userRole = "admin"; // Stel dat je dit ergens ophaalt
  const menuClass = userRole === "admin" ? "sidebar-admin" : "sidebar-user";

  // 2. Hieronder return je de HTML als string (de template)
  return `
  <nav class="sidebar">
      <h2>Cliento Admin</h2>

      <a
          href="#"
          @click.prevent="currentModule = 'dashboard'"
          :class="currentModule === 'dashboard' ? 'active' : ''"
          class="menu-item"
      >
          <i class="fas fa-home"></i> Overzicht
      </a>

      <div
          style="
              margin-top: 1rem;
              font-size: 0.8rem;
              text-transform: uppercase;
              color: #888;
              font-weight: bold;
          "
      >
          CRM
      </div>
      <a
          href="#"
          @click.prevent="currentModule = 'calendar'"
          :class="currentModule === 'calendar' ? 'active' : ''"
          class="menu-item"
      >
          <i class="fas fa-calendar-alt"></i> Agenda
      </a>
      <a href="#" onclick="loadComponent('main-content', 'modules/cms.html')">
          <i class="fas fa-calendar-alt"></i> CMS
      </a>

      <div style="margin-top: auto">
          <button
              onclick="handleLogout()"
              class="btn-secondary"
              style="width: 100%"
          >
              Uitloggen
          </button>
      </div>
  </nav>
  `;
}
