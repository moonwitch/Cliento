// Header controller
// NL-commentaar: Initialiseert de header UI op basis van Supabase sessie/rol

function resolveBase() {
  // NL: Als we in /pages/ zitten, ga 1 map omhoog voor root-files
  if (location.pathname.includes("/pages/")) return "..";
  return ".";
}

function initHeader() {
  const base = resolveBase();

  // DOM refs
  const loginLink = document.getElementById("login-link");
  const accountDropdown = document.getElementById("account-dropdown");
  const adminLink = document.getElementById("admin-link");
  const trigger = accountDropdown?.querySelector("[data-dropdown-trigger]");
  const content = accountDropdown?.querySelector("[data-dropdown-content]");
  const logoutBtn = document.getElementById("header-logout-btn");
  const apptsLink = document.getElementById("appointments-link");
  const brand = document.querySelector(".site-header .brand");

  // NL: Brand-klik terug naar home
  if (brand)
    brand.addEventListener(
      "click",
      () => (window.location.href = `${base}/index.html`),
    );

  // NL: Zet veilige, context-onafhankelijke links
  if (loginLink) loginLink.href = `${base}/index.html`;
  if (apptsLink) apptsLink.href = `${base}/user-dashboard.html`;
  if (adminLink) adminLink.href = `${base}/admin/dashboard.html`;

  // NL: Inloggen opent modal als beschikbaar; anders valt terug op href
  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      if (typeof openAuthModal === "function") {
        e.preventDefault();
        openAuthModal("login");
      }
    });
  }

  // NL: Dropdown gedrag
  function setDropdownOpen(open) {
    if (!content) return;
    if (open) content.classList.add("open");
    else content.classList.remove("open");
  }

  document.addEventListener("click", (e) => {
    if (content && accountDropdown && !accountDropdown.contains(e.target)) {
      setDropdownOpen(false);
    }
  });

  trigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    content?.classList.toggle("open");
  });

  logoutBtn?.addEventListener("click", () => {
    if (typeof handleLogout === "function") {
      handleLogout();
    } else if (window.supabaseClient) {
      supabaseClient.auth
        .signOut()
        .then(() => (window.location.href = `${base}/index.html`));
    }
  });

  // NL: Auth-state toepassen
  if (!window.supabaseClient) {
    console.warn(
      "Supabase client niet gevonden. Laad config.js vóór header.js",
    );
    return;
  }

  function applyUI(isIn) {
    if (loginLink) loginLink.style.display = isIn ? "none" : "inline-flex";
    if (accountDropdown)
      accountDropdown.style.display = isIn ? "block" : "none";
    if (!isIn && adminLink) adminLink.style.display = "none";
  }

  supabaseClient.auth.getSession().then(async ({ data: { session } }) => {
    const isIn = !!session;
    applyUI(isIn);

    if (isIn) {
      try {
        const { data: role, error } = await supabaseClient.rpc("get_my_role");
        if (
          !error &&
          role &&
          ["admin", "superadmin", "employee"].includes(role)
        ) {
          if (adminLink) adminLink.style.display = "inline-flex";
        }
      } catch (err) {
        console.debug("Rol ophalen mislukt:", err);
      }
    }
  });

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    const isIn = !!session;
    applyUI(isIn);
    setDropdownOpen(false);
  });
}
