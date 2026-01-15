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

  // 2. Toon loader terwijl we de pagina ophalen
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
  const [basePage, param] = pageKey.split("/");
  const renderPage = pages[basePage] || pages["home"];

  try {
    // Render de pagina (wacht op async data indien nodig)
    const pageHTML =
      typeof renderPage === "function" ? await renderPage(param) : renderPage;

    // Injecteer de inhoud
    const main = app.querySelector("main");
    main.style.display = "block"; // Reset de flexbox van de loader
    main.innerHTML = pageHTML;
  } catch (error) {
    console.error("Fout bij laden pagina:", error);
    app.querySelector("main").innerHTML =
      `<div style="text-align:center; padding:2rem; color:red;">Er ging iets mis bij het laden van de content.</div>`;
  }

  // Scroll naar boven
  window.scrollTo(0, 0);
};

// --- GLOBAL CLICK LISTENER ---
// Dit vangt alle kliks op linkjes met een # af
document.addEventListener("click", (e) => {
  // Zoek het dichtstbijzijnde <a> element (ook als je op een icoontje in de link klikt)
  const link = e.target.closest("a");

  // Als het een link is én hij begint met '#' (bv. href="#treatments")
  if (link && link.getAttribute("href")?.startsWith("#")) {
    e.preventDefault(); // Stop standaard browser gedrag (springen/scrollen)

    const path = link.getAttribute("href").substring(1); // Haal de '#' weg

    // Als er een path is (dus niet alleen '#'), navigeer!
    if (path) {
      window.handleNavigation(path);
    }
  }
});

// Start de app
document.addEventListener("DOMContentLoaded", () => {
  // Auth modal container injecteren (onzichtbaar tot nodig)
  const modalContainer = document.createElement("div");
  modalContainer.id = "auth-modal-root";
  document.body.appendChild(modalContainer);

  // Render de modal logica
  renderAuthModal();

  // Initiele pagina laden
  handleNavigation("home");
});
