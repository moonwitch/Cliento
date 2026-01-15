import * as Block from "../components/blocks.js";
import { fetchContent } from "../utils/content.js";

export async function TreatmentsPage() {
  if (!window.supabaseClient)
    return `<div class="error-message">Database connectie mislukt.</div>`;

  try {
    // 1. Haal data op
    const [cmsReq, treatmentsReq] = await Promise.all([
      fetchContent("treatments"),
      window.supabaseClient
        .from("treatments")
        .select("*")
        .order("category", { ascending: true }),
    ]);

    const content = cmsReq || {};
    const treatments = treatmentsReq.data || [];

    // Check op error
    if (treatmentsReq.error) {
      console.error("Supabase Error:", treatmentsReq.error);
      return `<div class="text-center p-5" style="color:red">Er ging iets mis met ophalen data.</div>`;
    }

    const grouped = {};
    treatments.forEach((t) => {
      const cat = t.category || "Overige";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(t);
    });

    // 3. HTML Bouwen
    let treatmentsHtml = "";

    // Object.entries werkt veilig op een leeg object
    const categories = Object.entries(grouped);

    if (categories.length === 0) {
      treatmentsHtml = `<p style="text-align:center; color:#888;">Nog geen behandelingen beschikbaar.</p>`;
    } else {
      for (const [category, items] of categories) {
        treatmentsHtml += `
                    <div style="margin-bottom: 4rem;">
                        <h3 style="border-bottom: 2px solid var(--primary); display:inline-block; margin-bottom: 2rem; padding-bottom: 5px; color: var(--text-main);">
                            ${category}
                        </h3>
                        ${Block.GridResponsive(
                          items
                            .map((t) =>
                              Block.ServiceCard({
                                image: null, // Of t.image_url als je dat hebt
                                title: t.title,
                                price: t.price || "Op aanvraag",
                                duration: t.duration || "??",
                                link: `#book/${t.id}`,
                              }),
                            )
                            .join(""),
                        )}
                    </div>
                `;
      }
    }

    return `
            ${Block.BlockPurposeSection(`
                ${Block.SectionHeader({
                  badge: content.page_badge || "Menu",
                  title: content.page_title || "Onze Behandelingen",
                  subtitle:
                    content.page_intro ||
                    "Kies uit ons uitgebreide aanbod van verzorgingen.",
                })}

                ${treatmentsHtml}
            `)}
        `;
  } catch (error) {
    console.error("Grote fout in TreatmentsPage:", error);
    return `<div class="text-center p-5">Er is een onverwachte fout opgetreden: ${error.message}</div>`;
  }
}
