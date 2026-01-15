import * as Block from "../components/blocks.js";
import { fetchContent } from "../utils/content.js";

export async function AboutPage() {
  // Haal content op voor sectie 'about'
  const content = await fetchContent("about");

  return `
        ${Block.ImageWithOverlay({
          image:
            content.hero_image ||
            "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=1600&q=80",
          title: content.hero_title || "Over Lyn & Skin",
          subtitle:
            content.hero_subtitle || "Passie voor huidverbetering en welzijn.",
          ctaText: "Ons Team",
          ctaLink: "#team",
        })}

        ${Block.BlockPurposeSection(`
            ${Block.SectionHeader({
              badge: "Het Verhaal",
              title: content.intro_title || "Hoe het begon",
              subtitle: "",
            })}

            <div style="max-width: 800px; margin: 0 auto; line-height: 1.8; color: var(--text-muted); text-align: center;">
                ${content.intro_body || "<p>Bij Lyn & Skin draait alles om persoonlijke aandacht...</p>"}
            </div>
        `)}

        ${Block.BlockPurposeSection(
          `
            <div id="team" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem; align-items: center;">
                <div>
                    <img src="${content.team_image || "https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?auto=format&fit=crop&w=800&q=80"}"
                         style="width:100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);">
                </div>
                <div>
                    ${Block.SectionHeader({
                      badge: "Onze Missie",
                      title: content.mission_title || "Jouw huid, onze zorg",
                      subtitle: "",
                    })}
                    <div style="color: var(--text-muted); margin-bottom: 2rem;">
                         ${content.mission_body || "Wij streven naar het beste resultaat met hoogwaardige producten."}
                    </div>

                    ${Block.FeatureItem({ icon: "fas fa-heart", title: "Persoonlijk", description: "Elke huid is uniek, onze aanpak ook." })}
                    <br>
                    ${Block.FeatureItem({ icon: "fas fa-leaf", title: "Natuurlijk", description: "Wij werken met veilige en effectieve ingrediënten." })}
                </div>
            </div>
        `,
          "grey",
        )}

        ${Block.BlockPurposeSection(`
            <div style="text-align: center;">
                <h2>Klaar om te stralen?</h2>
                <p style="margin-bottom: 2rem;">Boek vandaag nog je afspraak.</p>
                <a href="#book" class="btn-primary">Maak Afspraak</a>
            </div>
        `)}
    `;
}
