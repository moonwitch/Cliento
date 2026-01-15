import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";
import { HomePage } from "./pages/HomePage.js";
import { renderAuthModal } from "./components/AuthModal.js";

// Routing Map
const pages = {
  home: HomePage,
  treatments: () =>
    `<div style="padding:4rem; text-align:center;"><h1>Behandelingen</h1><p>Lijst komt hier...</p></div>`,
  contact: () =>
    `<div style="padding:4rem; text-align:center;"><h1>Contact</h1><p>Formulier komt hier...</p></div>`,
};

// Navigatie
window.handleNavigation = (page) => {
  const app = document.getElementById("app");

  // 1. Render Header
  const headerHTML = Header(page);

  // 2. Render Pagina
  // Als de pagina een functie is (zoals HomePage), voer hem uit.
  const renderPage = pages[page] || pages["home"];
  const pageHTML = typeof renderPage === "function" ? renderPage() : renderPage;

  // 3. Render Footer
  const footerHTML = Footer();

  // 4. Samenvoegen
  app.innerHTML = `
        ${headerHTML}
        <main class="page-content" style="min-height: 60vh;">
            ${pageHTML}
        </main>
        ${footerHTML}
    `;

  // Scroll naar boven
  window.scrollTo(0, 0);
};

// Start de app
document.addEventListener("DOMContentLoaded", () => {
  // 1. Render de (verborgen) Auth Modal in zijn slot
  renderAuthModal();

  // 2. Check URL parameters (bv. ?page=treatments) of start op home
  // Voor nu simpel:
  handleNavigation("home");
});
