export function Footer() {
  return `
    <footer class="site-footer">
        <div class="footer-container">

            <div>
                <h4 class="footer-heading">Lyn & Skin</h4>
                <p class="footer-text">
                    Jouw moment van rust en huidverbetering.<br>
                    Persoonlijke aanpak in een ontspannen sfeer.
                </p>
                <div style="margin-top: 1.5rem;">
                    <div class="footer-text"><i class="fas fa-map-marker-alt"></i> Vossekotstraat 30, 3271 Scherpenheuvel-Zichem</div>
                    <div class="footer-text"><i class="fas fa-phone"></i> +32 494 63 74 93</div>
                    <div class="footer-text"><i class="fas fa-envelope"></i> info@lynskin.be</div>
                </div>

                <div class="social-links">
                    <a href="#" class="social-btn"><i class="fa-brands fa-instagram"></i></a>
                    <a href="#" class="social-btn"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="https://wa.me/32494637493" class="social-btn"><i class="fa-brands fa-whatsapp"></i></a>
                </div>
            </div>

            <div>
                <h4 class="footer-heading">Openingsuren</h4>
                <table class="opening-hours-table">
                    <tr><td>Maandag</td><td>09:00 - 21:00</td></tr>
                    <tr><td>Dinsdag</td><td>09:00 - 21:00</td></tr>
                    <tr><td>Woensdag</td><td>09:00 - 21:00</td></tr>
                    <tr><td>Donderdag</td><td>Gesloten</td></tr>
                    <tr><td>Vrijdag</td><td>09:00 - 18:00</td></tr>
                    <tr><td>Zaterdag</td><td>13:00 - 18:00</td></tr>
                    <tr><td>Zondag</td><td>10:00 - 13:00</td></tr>
                </table>
            </div>

            <div>
                <h4 class="footer-heading">Blijf op de hoogte</h4>
                <p class="footer-text">Ontvang als eerste updates over nieuwe behandelingen en promoties.</p>

                <form onsubmit="handleNewsletterSubmit(event)" style="margin-top: 1rem;">
                    <input type="email" name="email" placeholder="Jouw e-mailadres" class="footer-newsletter-input" required>
                    <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">
                        Inschrijven
                    </button>
                    <p id="newsletter-msg" style="font-size: 0.85rem; margin-top: 10px; display: none;"></p>
                </form>
            </div>

        </div>

        <div class="footer-bottom">
            &copy; ${new Date().getFullYear()} Lyn & Skin. Alle rechten voorbehouden.
        </div>
    </footer>
    `;
}

// --- LOGICA: Nieuwsbrief Inschrijving ---
window.handleNewsletterSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector("button");
  const msg = document.getElementById("newsletter-msg");
  const email = form.email.value;

  // UI Feedback
  const orgText = btn.innerText;
  btn.innerText = "Bezig...";
  btn.disabled = true;
  msg.style.display = "none";

  try {
    const { error } = await window.supabaseClient
      .from("newsletter_subscribers")
      .insert({ email: email });

    if (error) {
      // Check voor unieke constraint error (code 23505 in Postgres)
      if (error.code === "23505") {
        throw new Error("Dit e-mailadres is al ingeschreven.");
      }
      throw error;
    }

    // Succes!
    msg.style.color = "var(--primary)";
    msg.innerText = "Bedankt! Je bent ingeschreven.";
    msg.style.display = "block";
    form.reset();
  } catch (err) {
    msg.style.color = "#c0392b"; // Rood
    msg.innerText = err.message || "Er ging iets mis.";
    msg.style.display = "block";
  } finally {
    btn.innerText = orgText;
    btn.disabled = false;
  }
};
