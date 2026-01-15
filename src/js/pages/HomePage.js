import * as Block from "../components/blocks.js";
import { fetchContent } from "../utils/content.js";

export async function HomePage() {
  // 1. Haal content op uit de CMS tabel (sectie: 'home')
  const content = await fetchContent("home");

  // 2. Haal services op (voor de 'Populaire behandelingen' grid)
  const { data: popularServices } = await window.supabaseClient
    .from("treatments")
    .select("*")
    .limit(3);

  // 3. Render HTML met de variabelen uit 'content'
  return `
        ${Block.ImageWithOverlay({
          // Gebruik de CMS data, of een fallback als het leeg is
          image:
            content.hero_image ||
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80",
          title: content.hero_title || "Welkom bij Lyn & Skin",
          subtitle:
            content.hero_subtitle || "Jouw specialist in huidverbetering.",
          ctaText: content.cta_text || "Maak Afspraak",
          ctaLink: content.cta_link || "#book",
        })}

        ${Block.BlockPurposeSection(`
            ${Block.SectionHeader({
              badge: content.services_badge || "Expertise",
              title: content.services_title || "Populaire Behandelingen",
              subtitle:
                content.services_intro ||
                "Ontdek onze meest geliefde services.",
            })}

            ${Block.GridResponsive(`
                ${
                  popularServices && popularServices.length > 0
                    ? popularServices
                        .map((s) =>
                          Block.ServiceCard({
                            image: null, // Of voeg images toe aan je treatments tabel
                            title: s.title,
                            price: s.price,
                            duration: s.duration,
                            link: "#book",
                          }),
                        )
                        .join("")
                    : "<p>Geen behandelingen gevonden.</p>"
                }
            `)}

            <div style="text-align:center; margin-top:2rem;">
                <a href="#treatments" class="btn-outline">Alle Behandelingen Bekijken</a>
            </div>
        `)}

        ${Block.BlockPurposeSection(
          `
            ${Block.GridResponsive(
              `
                <div>
                    ${Block.SectionHeader({
                      badge: content.about_badge || "Over Ons",
                      title: content.about_title || "Het Team",
                      subtitle: "",
                    })}
                    <div style="color:var(--text-muted); line-height:1.8;">
                        ${content.about_body || "Welkom bij ons salon..."}
                    </div>

                    <div style="margin-top: 2rem;">
                         ${Block.ContactItem("fas fa-map-marker-alt", "Vossekotstraat 30, 3271 Scherpenheuvel-Zichem")}
                         ${Block.ContactItem("fas fa-envelope", "info@lynskin.be")}
                    </div>
                </div>
                <div>
                    <img src="${content.about_image || "https://oprjavcfnfnyvqoxwnyv.supabase.co/storage/v1/object/public/images/photo-1552693673-1bf958298935.jpeg"}"
                         style="width:100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); object-fit:cover; height:100%; min-height:300px;">
                </div>
            `,
              2,
            )}
        `,
          "grey",
        )}
    `;
}
