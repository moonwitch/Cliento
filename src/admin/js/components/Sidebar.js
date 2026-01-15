export function Sidebar(activePage) {
  const menuItems = [
    { key: "dashboard", icon: "fa-home", label: "Overzicht" },
    { key: "calendar", icon: "fa-calendar-alt", label: "Agenda" },
    { key: "clients", icon: "fa-user", label: "Klanten" },
    { type: "header", label: "Beheer" },
    { key: "treatments", icon: "fa-syringe", label: "Behandelingen" },
    { key: "staff", icon: "fa-user-nurse", label: "Personeel" },
    { key: "cms", icon: "fa-laptop", label: "Website" },
  ];

  const isActive = (page) => (activePage === page ? "active" : "");

  const navHTML = menuItems
    .map((item) => {
      if (item.type === "header") {
        return `<li class="sidebar-section-title">${item.label}</li>`;
      }
      return `
          <li class="nav-item">
              <a href="#" onclick="handleNavigation('${item.key}'); return false;" class="nav-link ${isActive(item.key)}">
                  <i class="fas ${item.icon}"></i> <span>${item.label}</span>
              </a>
          </li>`;
    })
    .join("");

  return `
  <aside class="sidebar">
      <div class="sidebar-header">
          <h2>LYN & SKIN</h2>
          <span style="font-size: 0.75rem; text-transform: uppercase; opacity: 0.7;">Admin Panel</span>
      </div>

      <ul class="sidebar-nav">
          ${navHTML}
      </ul>

      <div class="sidebar-logout-wrapper">
            <button onclick="handleLogout()" class="btn-primary">
              <i class="fas fa-sign-out-alt"></i> Uitloggen
            </button>
      </div>
  </aside>
  `;
}
