import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";
import { HomePage } from "./pages/HomePage.js";
import { TreatmentsPage } from "./pages/TreatmentsPage.js";
import { AboutPage } from "./pages/AboutPage.js";
import { UserDashboard } from "./pages/user/UserDashboard.js";
import { BookPage } from "./pages/user/BookPage.js";
import { renderAuthModal } from "./components/AuthModal.js";

// Routing Map
const pages = {
  home: HomePage,
  treatments: TreatmentsPage,
  about: AboutPage,
  dashboard: UserDashboard,
  book: BookPage,
};

// Navigatie Functie
window.handleNavigation = async (pageKey) => {
  const app = document.getElementById("app");

  // 1. Render de "shell" (Header + Footer)
  const headerHTML = Header(pageKey);
  const footerHTML = Footer();

  // 2. Toon loader
  app.innerHTML = `
        ${headerHTML}
        <main class="page-content" style="min-height: 60vh; display: flex; align-items: center; justify-content: center;">
            <div style="text-align:center; color: var(--primary);">
                <i class="fas fa-circle-notch fa-spin" style="font-size: 2rem;"></i>
            </div>
        </main>
        ${footerHTML}
    `;

  // 3. Routing logic (ondersteuning voor #book/123 etc.)
  // Als pageKey leeg is (bijv. root url), pak 'home'
  if (!pageKey) pageKey = "home";

  const [basePage, param] = pageKey.split("/");
  const renderPage = pages[basePage] || pages["home"];

  // Update de URL hash zodat refreshen werkt (Deep Linking)
  if (location.hash !== `#${pageKey}`) {
    history.pushState(null, null, `#${pageKey}`);
  }

  try {
    const pageHTML =
      typeof renderPage === "function" ? await renderPage(param) : renderPage;

    const main = app.querySelector("main");
    main.style.display = "block";
    main.innerHTML = pageHTML;
  } catch (error) {
    console.error("Fout bij laden pagina:", error);
    app.querySelector("main").innerHTML =
      `<div style="text-align:center; padding:2rem; color:red;">Er ging iets mis bij het laden van de content.</div>`;
  }

  window.scrollTo(0, 0);
};

// --- GLOBAL CLICK LISTENER ---
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (link && link.getAttribute("href")?.startsWith("#")) {
    e.preventDefault();
    const path = link.getAttribute("href").substring(1);
    if (path) window.handleNavigation(path);
  }
});

// Start de app
document.addEventListener("DOMContentLoaded", () => {
  const modalContainer = document.createElement("div");
  modalContainer.id = "auth-modal-root";
  document.body.appendChild(modalContainer);

  renderAuthModal();

  const initialPage = location.hash ? location.hash.substring(1) : "home";
  handleNavigation(initialPage);
});
