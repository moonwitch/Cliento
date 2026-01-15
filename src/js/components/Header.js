export function Header(activePage) {
  const userRole = localStorage.getItem("user_role");
  const isLoggedIn = !!userRole;
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  return `
  <header class="site-header">
      <div class="site-container">

          <div class="brand-wrapper" onclick="handleNavigation('home')">
              <img src="../assets/Logo.png" alt="Lyn & Skin" class="header-logo">
              <h2 class="brand">Lyn & Skin</h2>
          </div>

          <div class="header-actions">

              <a id="admin-link" class="btn btn-outline" href="/admin/dashboard.html"
                 style="display: ${isAdmin ? "inline-flex" : "none"};">
                  Admin
              </a>

              <div class="dropdown" id="account-control">
                  <button class="btn btn-outline" onclick="toggleDropdown('account-menu')">
                      <i class="fas fa-user-circle"></i>
                      ${isLoggedIn ? "Account" : "Inloggen"}
                  </button>

                  <div class="dropdown-content" id="account-menu">
                       ${
                         isLoggedIn
                           ? `
                          <button onclick="handleNavigation('dashboard')" class="dropdown-item">
                              <i class="fas fa-columns"></i> Dashboard
                          </button>
                          <div class="dropdown-separator"></div>
                          <button onclick="handleLogout()" class="dropdown-item" style="color:#c0392b;">
                              <i class="fas fa-sign-out-alt"></i> Uitloggen
                          </button>
                        `
                           : `
                          <a href="#" onclick="document.querySelector('.modal-overlay').style.display='flex'; return false;" class="dropdown-item">
                              <i class="fas fa-sign-in-alt"></i> Inloggen
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

window.toggleDropdown = (id) => {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("open");
};
