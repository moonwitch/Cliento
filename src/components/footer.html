<!-- Footer Component -->
<!-- NL: Discrete footer met merkstijl, auth triggers en nieuwsbrief formulier -->

<footer class="site-footer">
    <div class="footer-container">
        <div class="footer-brand">
            <div class="footer-title">LYN & SKIN</div>
            <p class="footer-text">Schoonheid met aandacht.</p>
        </div>

        <nav class="footer-nav">
            <a href="/pages/treatments.html">Behandelingen</a>
            <a href="#" data-open-auth="register">Registreren</a>
            <a href="#" data-open-auth="login">Inloggen</a>
        </nav>

        <div class="footer-newsletter">
            <div class="footer-newsletter-title">Nieuwsbrief</div>
            <form id="newsletter-form">
                <input id="newsletter-email" type="email" required placeholder="Jouw e-mailadres"
                    class="footer-newsletter-input" />
                <button type="submit" class="btn btn-primary">Abonneren</button>
            </form>
            <div id="newsletter-msg" class="footer-newsletter-msg"></div>
        </div>
    </div>

    <div class="footer-bottom">
        <span>© <span id="year"></span> Lyn & Skin</span>
    </div>

    <script>
        // NL: Jaar vullen zonder extra script imports
        (function () {
            var y = document.getElementById('year');
            if (y) y.textContent = new Date().getFullYear();
        })();

        // NL: Afhandeling nieuwsbrief formulier met Supabase insert
        (function () {
            const form = document.getElementById('newsletter-form');
            const emailInput = document.getElementById('newsletter-email');
            const msg = document.getElementById('newsletter-msg');

            if (!form) return;

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!emailInput) return;

                const email = (emailInput.value || '').trim();
                if (!email) return;

                msg.textContent = 'Even geduld...';
                msg.style.color = '#666';

                // NL: Vereist tabel 'newsletter_subscriptions' met minstens kolom 'email'
                // Optioneel: 'source', 'created_at'.
                if (!window.supabaseClient) {
                    msg.textContent = 'Niet beschikbaar (Supabase niet geladen).';
                    msg.style.color = 'red';
                    return;
                }

                try {
                    const {error} = await supabaseClient
                        .from('newsletter_subscriptions')
                        .insert({
                            email,
                            source: 'footer',
                            created_at: new Date().toISOString()
                        });

                    if (error) {
                        msg.textContent = 'Kon je inschrijving niet opslaan. Controleer of de tabel "newsletter_subscriptions" bestaat.';
                        msg.style.color = 'red';
                    } else {
                        msg.textContent = 'Dank je! Je bent ingeschreven.';
                        msg.style.color = 'green';
                        emailInput.value = '';
                    }
                } catch (err) {
                    msg.textContent = 'Er ging iets mis. Probeer het later opnieuw.';
                    msg.style.color = 'red';
                    console.error(err);
                }
            });
        })();
    </script>
</footer>
