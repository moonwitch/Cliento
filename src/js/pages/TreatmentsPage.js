export async function CmsPage() {
  if (!window.supabaseClient)
    return `<div class="error-message">Supabase niet geladen.</div>`;

  const { data: contents, error } = await window.supabaseClient
    .from("content_blocks")
    .select("*")
    .order("section", { ascending: true });

  if (error) return `<div class="error-message">Error: ${error.message}</div>`;

  return `
    <div class="flex-between">
        <div><h2 class="text-title">Website Content</h2><p class="text-subtitle">Beheer teksten en pagina's.</p></div>
        <button class="btn-primary" onclick="openAddPageModal()"><i class="fas fa-plus-circle"></i> Nieuwe Pagina</button>
    </div>
    <div style="display: grid; gap: 2rem;">${renderContentSections(contents)}</div>
    `;
}

function renderContentSections(contents) {
  if (!contents || contents.length === 0) return "<p>Nog geen content.</p>";
  const sections = {};
  contents.forEach((item) => {
    const sec = item.section || "Overig";
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(item);
  });

  return Object.keys(sections)
    .sort()
    .map((sectionName) => {
      const sortedItems = sortBlocks(sections[sectionName], sectionName);
      return `
        <div class="card">
            <div class="flex-between" style="border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 1rem;">
                <h3 style="text-transform: capitalize; margin:0; color:var(--brand-text);"><i class="fas fa-layer-group" style="color:var(--primary); margin-right:8px;"></i> ${sectionName}</h3>
                <div style="display:flex; gap:10px;">
                    <button class="btn-icon" onclick="openEditSectionModal('${sectionName}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="deletePage('${sectionName}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div style="display:grid; gap:10px; opacity: 0.7;">
                ${sortedItems
                  .map((item) => {
                    const label = item.key
                      .replace(sectionName + "_", "")
                      .replace(/_/g, " ");
                    const isImage =
                      item.key.includes("image") || item.key.includes("img");
                    let preview = stripHtml(item.content).substring(0, 50);
                    if (isImage)
                      preview = `<img src="${item.content}" style="height:20px;">`;
                    return `<div style="font-size:0.85rem; display:flex; gap:10px;"><strong style="min-width:120px; color:var(--primary); text-transform:capitalize;">${label}:</strong> <span>${preview}</span></div>`;
                  })
                  .join("")}
            </div>
        </div>`;
    })
    .join("");
}

// --- MODALS (MET FIX: class="open") ---
let activeQuills = {};

window.openEditSectionModal = async (sectionName) => {
  const slot = document.getElementById("admin-modal-slot");
  activeQuills = {};
  const { data: blocks } = await window.supabaseClient
    .from("content_blocks")
    .select("*")
    .eq("section", sectionName);
  const sortedBlocks = sortBlocks(blocks || [], sectionName);

  // HIER ZAT DE FOUT: class="modal-overlay" -> class="modal-overlay open"
  slot.innerHTML = `
        <div class="modal-overlay open" onclick="closeAdminModal(event)">
            <div class="modal-card modal-card-lg" onclick="event.stopPropagation()">
                <div class="modal-header-custom">
                    <h3 class="modal-title" style="text-transform: capitalize;">${sectionName} Bewerken</h3>
                    <button type="button" onclick="closeAdminModal()" class="btn-close">&times;</button>
                </div>
                <div class="modal-body-scroll">
                    <form onsubmit="saveSectionContent(event, '${sectionName}')" class="form-stack">
                        ${sortedBlocks.map((block) => renderBlockInput(block, sectionName)).join("")}
                        <div style="border-top:1px solid #eee; padding-top:1.5rem; margin-top:1rem; display:flex; justify-content:space-between;">
                            <button type="button" class="btn-outline btn-sm" onclick="openAddBlockModal('${sectionName}')"><i class="fas fa-plus"></i> Veld</button>
                            <div style="display:flex; gap:10px;"><button type="button" class="btn-outline" onclick="closeAdminModal()">Annuleren</button><button type="submit" class="btn-primary">Opslaan</button></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;

  setTimeout(() => initQuills(sortedBlocks), 50);
};

window.openAddPageModal = () => {
  const slot = document.getElementById("admin-modal-slot");
  // HIER OOK: class="modal-overlay open"
  slot.innerHTML = `
        <div class="modal-overlay open" onclick="closeAdminModal(event)">
            <div class="modal-card" onclick="event.stopPropagation()">
                <div class="modal-header-custom"><h3 class="modal-title">Nieuwe Pagina</h3><button onclick="closeAdminModal()" class="btn-close">&times;</button></div>
                <form onsubmit="createPage(event)" class="modal-body-scroll">
                    <div class="form-group"><label class="form-label">Naam</label><input name="section_name" class="form-input" required onkeyup="this.value = this.value.toLowerCase().replace(/[^a-z0-9-]/g, '')"></div>
                    <div class="form-group"><label class="form-label">Template</label><select name="template" class="form-input"><option value="basic">Standaard</option><option value="hero">Hero</option></select></div>
                    <div class="text-right"><button type="submit" class="btn-primary">Aanmaken</button></div>
                </form>
            </div>
        </div>`;
};

// --- HELPERS ---
function renderBlockInput(block, sectionName) {
  const label = block.key.replace(sectionName + "_", "").replace(/_/g, " ");
  const isImage = block.key.includes("image") || block.key.includes("hero_img");

  if (isImage) {
    return `<div class="form-group"><label class="form-label">${label}</label>
        <div style="display:flex; gap:10px; align-items:center;">
            <img id="preview-${block.key}" src="${block.content}" style="height:50px; display:${block.content ? "block" : "none"}">
            <input type="hidden" name="${block.key}" id="input-${block.key}" value="${block.content || ""}">
            <input type="file" onchange="handleImageUpload(this, '${block.key}')">
        </div></div>`;
  }
  const isSimple = block.key.match(/title|header|subtitle|button|cta|link/);
  if (isSimple)
    return `<div class="form-group"><label class="form-label">${label}</label><input type="text" name="${block.key}" class="form-input" value="${block.content || ""}"></div>`;
  return `<div class="form-group"><label class="form-label">${label}</label><div id="editor-${block.key}" style="background:white;">${block.content || ""}</div></div>`;
}

function initQuills(blocks) {
  blocks.forEach((b) => {
    if (!b.key.match(/image|title|header|subtitle|button|cta|link/)) {
      const q = new Quill(`#editor-${b.key}`, {
        theme: "snow",
        modules: {
          toolbar: [
            ["bold", "italic"],
            [{ header: [2, 3, false] }],
            ["image", "clean"],
          ],
        },
      });
      q.getModule("toolbar").addHandler("image", () => selectLocalImage(q));
      activeQuills[b.key] = q;
    }
  });
}

// Global functions (verwijst naar implementaties die je al hebt)
window.handleImageUpload = async (el, key) => {
  const file = el.files[0];
  if (!file) return;
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
  const { data, error } = await window.supabaseClient.storage
    .from("images")
    .upload(fileName, file);
  if (!error) {
    const {
      data: { publicUrl },
    } = window.supabaseClient.storage.from("images").getPublicUrl(fileName);
    document.getElementById(`input-${key}`).value = publicUrl;
    document.getElementById(`preview-${key}`).src = publicUrl;
    document.getElementById(`preview-${key}`).style.display = "block";
  } else alert(error.message);
};

window.selectLocalImage = (quill) => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    const { data, error } = await window.supabaseClient.storage
      .from("images")
      .upload(fileName, file);
    if (!error) {
      const {
        data: { publicUrl },
      } = window.supabaseClient.storage.from("images").getPublicUrl(fileName);
      quill.insertEmbed(quill.getSelection(true).index, "image", publicUrl);
    }
  };
};

// Deze functies blijven werken zoals ze waren:
window.saveSectionContent = async (e, section) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  btn.innerText = "Opslaan...";
  const fd = new FormData(e.target);
  const updates = [];
  for (let [k, v] of fd.entries()) {
    if (!activeQuills[k])
      updates.push(
        window.supabaseClient
          .from("content_blocks")
          .update({ content: v })
          .eq("key", k),
      );
  }
  for (let [k, q] of Object.entries(activeQuills)) {
    updates.push(
      window.supabaseClient
        .from("content_blocks")
        .update({ content: q.root.innerHTML })
        .eq("key", k),
    );
  }
  await Promise.all(updates);
  btn.innerText = "Opslaan";
  window.closeAdminModal();
  handleNavigation("cms");
};
window.createPage = async (e) => {
  e.preventDefault();
  /* jouw create code */
};
window.deletePage = async (section) => {
  if (confirm("Zeker weten?")) {
    await window.supabaseClient
      .from("content_blocks")
      .delete()
      .eq("section", section);
    handleNavigation("cms");
  }
};
window.openAddBlockModal = (section) => {
  const s = prompt("Key suffix?");
  if (s)
    window.supabaseClient
      .from("content_blocks")
      .insert({ section, key: section + "_" + s, content: "..." })
      .then(() => openEditSectionModal(section));
};
function sortBlocks(b) {
  return b;
} // Jouw sort logic
function stripHtml(h) {
  let d = document.createElement("div");
  d.innerHTML = h;
  return d.textContent || "";
}
