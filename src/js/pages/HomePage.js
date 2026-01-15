// src/js/pages/HomePage.js

export async function HomePage() {
  // 1. Haal content op uit Supabase (via de globale client)
  let content = {};

  if (window.supabaseClient) {
    const { data, error } = await window.supabaseClient
      .from("site_content")
      .select("key, content")
      .eq("section", "home"); // Haal alleen home-teksten op

    if (!error && data) {
      // Zet de array om naar een handig object: { hero_title: "...", hero_subtitle: "..." }
      content = data.reduce((acc, item) => {
        acc[item.key] = item.content;
        return acc;
      }, {});
    }
  }

  // 2. Fallback teksten (als er nog niets in de database staat)
  const title = content.hero_title || "Welkom bij Lyn & Skin";
  const subtitle =
    content.hero_subtitle || "Ontdek onze behandelingen en kom tot rust.";

  return `
    <section class="hero">
        <div class="hero-inner">
            <h1 class="hero-title">${title}</h1>
            <p class="hero-subtitle">${subtitle}</p>

            <div class="hero-actions">
                <button onclick="handleNavigation('treatments')" class="btn btn-primary">
                    Bekijk Behandelingen
                </button>
                <button onclick="openAuthModal('login')" class="btn btn-outline">
                    Inloggen
                </button>
            </div>
        </div>
    </section>

    <section style="padding: 4rem 1rem; text-align: center; max-width: 800px; margin: 0 auto;">
        <h2>Over Ons</h2>
        <p>${content.about_text || "Wij staan voor persoonlijke aandacht en resultaat."}</p>
    </section>
  `;
}
