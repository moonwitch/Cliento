export function Sidebar(activePage) {
  // 1. Configuratie: Alle links in een lijstje
  const menuItems = [
    // Algemeen
    { key: "dashboard", icon: "fa-home", label: "Overzicht" },
    { key: "calendar", icon: "fa-calendar-alt", label: "Agenda" },
    { key: "clients", icon: "fa-user", label: "Klanten" },

    // Tussentitel (Divider)
    { type: "header", label: "Beheer" },

    // Beheer modules
    { key: "treatments", icon: "fa-syringe", label: "Behandelingen" },
    { key: "staff", icon: "fa-user-nurse", label: "Personeel" },
    { key: "cms", icon: "fa-laptop", label: "Website" },
  ];

  // 2. Helper functie om classes te bepalen
  const isActive = (page) => (activePage === page ? "active" : "");

  // 3. Genereer de HTML voor de navigatie
  const navHTML = menuItems
    .map((item) => {
      // A. Is het een tussentitel?
      if (item.type === "header") {
        return `
                <li style="margin: 1.5rem 0 0.5rem 1rem; font-size: 0.75rem; font-weight: bold; color: rgba(255,255,255,0.4); text-transform: uppercase;">
                    ${item.label}
                </li>`;
      }

      // B. Is het een gewone link?
      return `
            <li class="nav-item">
                <a href="#" onclick="handleNavigation('${item.key}'); return false;" class="nav-link ${isActive(item.key)}">
                    <i class="fas ${item.icon}"></i> <span>${item.label}</span>
                </a>
            </li>`;
    })
    .join("");

  // 4. Return de volledige sidebar
  return `
    <aside class="sidebar">
        <div class="sidebar-header">
            <h2>LYN & SKIN</h2>
            <span style="font-size: 0.75rem; text-transform: uppercase; opacity: 0.7;">Admin Panel</span>
        </div>

        <ul class="sidebar-nav">
            ${navHTML}
        </ul>

        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
             <button onclick="handleLogout()" style="width: 100%; background: transparent; border: 1px solid var(--primary); color: var(--text-light); padding: 10px; border-radius: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                <i class="fas fa-sign-out-alt"></i> Uitloggen
             </button>
        </div>
    </aside>
    `;
}
