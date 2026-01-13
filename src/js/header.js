// Header controller
// Initialiseert de header UI op basis van Supabase sessie/rol
// - Eén control: "Mijn Account" rechtsboven
// - Niet ingelogd: opent auth modal
// - Ingelogd: toont dropdown met "Mijn afspraken" en "Uitloggen"

function resolveBase() {
  // Als we in /pages/ zitten, ga 1 map omhoog voor root-files
  if (location.pathname.includes("/pages/")) return "..";
  return ".";
}

function initHeader() {
  const base = resolveBase();

  // DOM refs
  const adminLink = document.getElementById("admin-link");
  const accountControl = document.getElementById("account-control");
  const accountTrigger = document.getElementById("account-trigger");
  const accountMenu = document.getElementById("account-menu");
  const logoutBtn = document.getElementById("header-logout-btn");
  const apptsLink = document.getElementById("appointments-link");
  const brand = document.querySelector(".site-header .brand");

  // Brand-klik terug naar home
  if (brand)
    brand.addEventListener(
      "click",
      () => (window.location.href = `${base}/index.html`),
    );

  // Zet veilige, context-onafhankelijke links
  if (apptsLink) apptsLink.href = `${base}/user-dashboard.html`;
  if (adminLink) adminLink.href = `${base}/admin/dashboard.html`;

  // State
  let isAuthenticated = false;

  // Dropdown helpers
  function setMenuOpen(open) {
    if (!accountMenu) return;
    if (open) accountMenu.classList.add("open");
    else accountMenu.classList.remove("open");
  }

  function toggleMenu() {
    if (!accountMenu) return;
    accountMenu.classList.toggle("open");
  }

  // Click buiten menu sluit
  document.addEventListener("click", (e) => {
    if (accountControl && !accountControl.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  // Trigger gedrag: bij niet ingelogd => modal openen; bij ingelogd => dropdown togglen
  accountTrigger?.addEventListener("click", (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      if (typeof openAuthModal === "function") openAuthModal("login");
      return;
    }
    e.stopPropagation();
    toggleMenu();
  });

  // Logout
  logoutBtn?.addEventListener("click", () => {
    if (typeof handleLogout === "function") {
      handleLogout();
    } else if (window.supabaseClient) {
      supabaseClient.auth
        .signOut()
        .then(() => (window.location.href = `${base}/index.html`));
    }
  });

  // Supabase aanwezig?
  if (!window.supabaseClient) {
    console.warn(
      "Supabase client niet gevonden. Laad config.js vóór header.js",
    );
    return;
  }

  // Auth toepassen
  function applyUI(auth) {
    isAuthenticated = !!auth;
    // Verberg admin link standaard
    if (adminLink && !isAuthenticated) adminLink.style.display = "none";
    // Sluit altijd het menu bij state change
    setMenuOpen(false);
  }

  // Initiele sessie + rol
  supabaseClient.auth.getSession().then(async ({ data: { session } }) => {
    applyUI(!!session);

    if (session) {
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

  // Luister naar wijzigingen
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    applyUI(!!session);
  });
}
