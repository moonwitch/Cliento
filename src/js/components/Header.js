export function Header(activePage) {
  const isLoggedInTEXT = localStorage.getItem("supabase.auth.token")
    ? true
    : false;

  const userRole = localStorage.getItem("user_role");
  const isLoggedIn = !!userRole;
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  return `
  <header class="site-header">
          <div class="site-container">
              <h2 class="brand" onclick="handleNavigation('home')" style="cursor: pointer;">Lyn & Skin</h2>

              <div class="header-actions">

                  <a id="admin-link" class="btn btn-outline" href="/admin/dashboard.html"
                     style="display: ${isAdmin ? "inline-flex" : "none"};">
                      Admin Dashboard
                  </a>

                  <nav class="hidden md:flex gap-4 items-center">
                      <a href="#" onclick="handleNavigation('treatments'); return false;" class="text-sm font-bold hover:text-brand-primary transition-colors">Behandelingen</a>
                  </nav>

                  <div class="dropdown" id="account-control">
                      <button class="btn btn-outline" onclick="toggleDropdown('account-menu')">
                          <i class="fas fa-user-circle" style="margin-right: 6px;"></i>
                          ${isLoggedIn ? "Mijn Account" : "Inloggen"}
                      </button>

                      <div class="dropdown-content" id="account-menu">
                           ${
                             isLoggedIn
                               ? `
                              <a href="#" onclick="handleNavigation('appointments'); return false;" class="dropdown-item">
                                  <i class="fas fa-calendar-alt"></i> Mijn Afspraken
                              </a>
                              <div class="dropdown-separator"></div>
                              <button onclick="handleLogout()" class="dropdown-item">
                                  <i class="fas fa-sign-out-alt"></i> Uitloggen
                              </button>
                           `
                               : `
                              <a href="#" onclick="openAuthModal('login'); return false;" class="dropdown-item">
                                  <i class="fas fa-sign-in-alt"></i> Inloggen
                              </a>
                              <a href="#" onclick="openAuthModal('register'); return false;" class="dropdown-item">
                                  <i class="fas fa-user-plus"></i> Registreren
                              </a>
                           `
                           }
                      </div>
                  </div>

              </div>
          </div>
      </header>
      `;
}

// Dropdown toggle helper
window.toggleDropdown = (id) => {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("open");
};
