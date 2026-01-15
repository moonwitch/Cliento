export function Footer() {
  const year = new Date().getFullYear();

  return `
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-brand">
                <div class="footer-title">LYN & SKIN</div>
                <p class="footer-text">Schoonheid met aandacht.</p>
            </div>

            <nav class="footer-nav">
                <a href="#" onclick="handleNavigation('treatments'); return false;">Behandelingen</a>
                <a href="#" onclick="openAuthModal('register'); return false;">Registreren</a>
                <a href="#" onclick="openAuthModal('login'); return false;">Inloggen</a>
            </nav>

            <div class="footer-newsletter">
                <div class="footer-newsletter-title">Nieuwsbrief</div>
                <form onsubmit="handleNewsletter(event)" style="display:flex; gap:8px;">
                    <input id="newsletter-email" type="email" required placeholder="Jouw e-mailadres" class="footer-newsletter-input" />
                    <button type="submit" class="btn btn-primary">Abonneren</button>
                </form>
                <div id="newsletter-msg" class="footer-newsletter-msg"></div>
            </div>
        </div>

        <div class="footer-bottom">
            <span>© ${year} Lyn & Skin</span>
        </div>
    </footer>
    `;
}

// Nieuwsbrief logica (direct hier, lekker clean)
window.handleNewsletter = async (e) => {
  e.preventDefault();
  const email = document.getElementById("newsletter-email").value;
  const msg = document.getElementById("newsletter-msg");

  msg.textContent = "Even geduld...";

  // Simpele check (later Supabase call hierin zetten)
  setTimeout(() => {
    msg.textContent = "Dank je! Je bent ingeschreven.";
    msg.style.color = "var(--brand-secondary)";
    document.getElementById("newsletter-email").value = "";
  }, 1000);
};
