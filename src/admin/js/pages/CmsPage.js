export async function CmsPage() {
  if (!window.supabaseClient)
    return `<div style="color:red">Supabase niet geladen.</div>`;

  // 1. Data ophalen
  const { data: contents, error } = await window.supabaseClient
    .from("content_blocks")
    .select("*")
    .order("section");

  // Als tabel nog niet bestaat, toon instructie
  if (error && error.code === "42P01") {
    return `
            <div class="card">
                <h3 style="color: var(--primary)">⚠️ Tabel 'site_content' ontbreekt</h3>
                <p>Maak deze tabel aan in Supabase om teksten te beheren.</p>
                <code style="display:block; background:#f4f4f4; padding:10px; margin-top:10px;">
                    create table site_content (<br>
                      key text primary key,<br>
                      section text,<br>
                      content text<br>
                    );
                </code>
            </div>
        `;
  }

  if (error) return `<div style="color:red">Error: ${error.message}</div>`;

  // 2. Renderen
  return `
    <div class="flex-between">
        <div>
            <h2 class="text-title">Website Content</h2>
            <p class="text-subtitle">Pas de teksten op je website aan.</p>
        </div>
    </div>

    <div style="display: grid; gap: 2rem;">
        ${renderContentSections(contents)}
    </div>
    `;
}

// Hulpfunctie om content te groeperen per sectie (bijv. 'home', 'footer')
function renderContentSections(contents) {
  if (!contents || contents.length === 0)
    return "<p>Nog geen content gevonden.</p>";

  // Groeperen
  const sections = {};
  contents.forEach((item) => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  // HTML bouwen per sectie
  return Object.keys(sections)
    .map(
      (sectionName) => `
        <div class="card">
            <h3 style="text-transform: capitalize; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top:0;">
                <i class="fas fa-layer-group"></i> ${sectionName}
            </h3>

            <form onsubmit="handleSaveContent(event)" style="display: grid; gap: 1rem;">
                ${sections[sectionName]
                  .map(
                    (item) => `
                    <div>
                        <label style="display:block; font-weight:bold; font-size: 0.8rem; color: var(--secondary); margin-bottom: 5px;">
                            ${item.key}
                        </label>
                        <textarea name="${item.key}" rows="3"
                            style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit;"
                        >${item.content || ""}</textarea>
                    </div>
                `,
                  )
                  .join("")}

                <div style="text-align: right;">
                    <button type="submit" class="btn-primary">Opslaan</button>
                </div>
            </form>
        </div>
    `,
    )
    .join("");
}

// --- OPSLAAN LOGICA ---
window.handleSaveContent = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const updates = [];

  // Verzamel alle velden
  for (let [key, value] of formData.entries()) {
    updates.push(
      window.supabaseClient
        .from("site_content")
        .update({ content: value })
        .eq("key", key),
    );
  }

  // Alles tegelijk opslaan
  const btn = e.target.querySelector("button");
  const orgText = btn.innerText;
  btn.innerText = "Opslaan...";

  try {
    await Promise.all(updates);
    alert("✅ Teksten bijgewerkt!");
  } catch (err) {
    alert("Fout bij opslaan: " + err.message);
  } finally {
    btn.innerText = orgText;
  }
};
