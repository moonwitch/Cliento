export async function CmsPage() {
  if (!window.supabaseClient)
    return `<div class="error-message">Supabase niet geladen.</div>`;

  // 1. Data ophalen
  const { data: contents, error } = await window.supabaseClient
    .from("content_blocks")
    .select("*")
    .order("section", { ascending: true });

  if (error) return `<div class="error-message">Error: ${error.message}</div>`;

  // 2. Renderen
  return `
    <div class="flex-between">
        <div>
            <h2 class="text-title">Website Content</h2>
            <p class="text-subtitle">Beheer teksten en pagina's.</p>
        </div>
        <button class="btn-primary" onclick="openAddPageModal()">
            <i class="fas fa-plus-circle"></i> Nieuwe Pagina
        </button>
    </div>

    <div style="display: grid; gap: 2rem;">
        ${renderContentSections(contents)}
    </div>
    `;
}

// --- RENDERING (Overview Cards) ---
function renderContentSections(contents) {
  if (!contents || contents.length === 0)
    return "<p>Nog geen content. Maak een nieuwe pagina aan!</p>";

  // Groeperen per sectie
  const sections = {};
  contents.forEach((item) => {
    const sec = item.section || "Overig";
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(item);
  });

  // HTML bouwen per sectie
  return Object.keys(sections)
    .sort()
    .map((sectionName) => {
      const sortedItems = sortBlocks(sections[sectionName], sectionName);

      return `
        <div class="card">
            <div class="flex-between" style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 1rem;">
                <h3 style="text-transform: capitalize; margin:0; color:var(--brand-text);">
                    <i class="fas fa-layer-group" style="color:var(--primary); margin-right:8px;"></i> ${sectionName}
                </h3>
                <div style="display:flex; gap:10px;">
                    <button class="btn-icon" onclick="openEditSectionModal('${sectionName}')" title="Bewerken">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deletePage('${sectionName}')" title="Pagina verwijderen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>

            <div style="display:grid; gap:10px; opacity: 0.7;">
                ${sortedItems
                  .map((item) => {
                    const label = item.key
                      .replace(sectionName + "_", "")
                      .replace(/_/g, " ");
                    const isImage =
                      item.key.includes("image") ||
                      item.key.includes("img") ||
                      item.key.includes("url");

                    // Preview logica
                    let previewContent = stripHtml(item.content);
                    if (isImage) {
                      previewContent = `<img src="${item.content}" style="height:30px; border-radius:4px; vertical-align:middle;" onerror="this.style.display='none'"> <small>${item.content}</small>`;
                    }

                    return `
                    <div style="font-size:0.85rem; display:flex; gap:10px; border-bottom:1px solid #f9f9f9; padding-bottom:5px; align-items: center;">
                        <strong style="min-width:120px; color:var(--primary); text-transform:capitalize;">${label}:</strong>
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px;">
                            ${previewContent}
                        </span>
                    </div>
                `;
                  })
                  .join("")}
            </div>

            <div style="margin-top:1rem; text-align:right;">
                <button class="btn-outline btn-sm" onclick="openEditSectionModal('${sectionName}')">
                    Pagina Bewerken &rarr;
                </button>
            </div>
        </div>
    `;
    })
    .join("");
}

// --- EDIT MODAL ---
let activeQuills = {};

window.openEditSectionModal = async (sectionName) => {
  const slot = document.getElementById("admin-modal-slot");
  activeQuills = {};

  // 1. Data ophalen
  const { data: blocks } = await window.supabaseClient
    .from("content_blocks")
    .select("*")
    .eq("section", sectionName);

  if (!blocks) return alert("Kon data niet laden.");

  // 2. Sorteren
  const sortedBlocks = sortBlocks(blocks, sectionName);

  // 3. Render Modal
  slot.innerHTML = `
        <div class="modal-overlay open" onclick="closeAdminModal(event)">
            <div class="modal-card modal-card-lg" onclick="event.stopPropagation()">
                <div class="modal-header-custom">
                    <h3 class="modal-title" style="text-transform: capitalize;">${sectionName} Bewerken</h3>
                    <button onclick="closeAdminModal()" class="btn-close">&times;</button>
                </div>

                <div class="modal-body-scroll">
                    <form onsubmit="saveSectionContent(event, '${sectionName}')" class="form-stack">
                        ${sortedBlocks
                          .map((block) => {
                            const label = block.key
                              .replace(sectionName + "_", "")
                              .replace(/_/g, " ");

                            // Detectie: Simpel veld vs Quill vs Image Widget
                            const isSimpleText =
                              block.key.includes("title") ||
                              block.key.includes("header") ||
                              block.key.includes("subtitle") ||
                              block.key.includes("button") ||
                              block.key.includes("cta") ||
                              block.key.includes("link");
                            const isImageField =
                              block.key.includes("image") ||
                              block.key.includes("hero_img"); // Specifieke image fields (zoals hero)

                            // Als het een image field is (zoals hero_image), toon widget.
                            // Als het simpel is, toon input.
                            // Anders (body, intro) toon Quill.

                            let inputHtml = "";

                            if (isImageField) {
                              inputHtml = `
                                    <div class="image-upload-widget" style="border:1px solid #eee; padding:10px; border-radius:8px; background:#f9f9f9;">
                                        <div style="display:flex; align-items:center; gap:15px;">
                                            <div style="width:80px; height:80px; background:#e0e0e0; border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                                                <img id="preview-${block.key}" src="${block.content}" style="width:100%; height:100%; object-fit:cover; display:${block.content ? "block" : "none"};" onerror="this.style.display='none'">
                                                <i class="fas fa-image" id="icon-${block.key}" style="color:#aaa; display:${block.content ? "none" : "block"}; font-size:1.5rem;"></i>
                                            </div>
                                            <div style="flex-grow:1;">
                                                <input type="hidden" name="${block.key}" id="input-${block.key}" value="${block.content || ""}">
                                                <input type="file" id="file-${block.key}" accept="image/*" style="display:none;" onchange="handleImageUpload(this, '${block.key}')">
                                                <button type="button" class="btn-outline btn-sm" onclick="document.getElementById('file-${block.key}').click()">
                                                    <i class="fas fa-upload"></i> Kies Afbeelding
                                                </button>
                                            </div>
                                        </div>
                                    </div>`;
                            } else if (isSimpleText) {
                              inputHtml = `<input type="text" name="${block.key}" class="form-input" value="${block.content || ""}">`;
                            } else {
                              inputHtml = `<div id="editor-${block.key}" style="background:white;">${block.content || ""}</div>`;
                            }

                            return `
                            <div class="form-group">
                                <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                                    <label class="form-label" style="text-transform: capitalize; font-weight:bold;">${label}</label>
                                    <small style="color:#ccc;">${block.key}</small>
                                </div>
                                ${inputHtml}
                            </div>
                            `;
                          })
                          .join("")}

                        <div style="border-top:1px solid #eee; padding-top:1.5rem; margin-top:1rem; display: flex; justify-content: space-between; align-items: center;">
                            <button type="button" class="btn-outline btn-sm" onclick="openAddBlockModal('${sectionName}')">
                                <i class="fas fa-plus"></i> Extra Veld
                            </button>
                            <div style="display:flex; gap: 10px;">
                                <button type="button" class="btn-outline" onclick="closeAdminModal()">Annuleren</button>
                                <button type="submit" class="btn-primary">Alles Opslaan</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

  // 4. Initialiseer Quill
  setTimeout(() => {
    sortedBlocks.forEach((block) => {
      const isSimpleText =
        block.key.includes("title") ||
        block.key.includes("header") ||
        block.key.includes("subtitle") ||
        block.key.includes("button") ||
        block.key.includes("cta") ||
        block.key.includes("link");
      const isImageField =
        block.key.includes("image") || block.key.includes("hero_img");

      if (!isSimpleText && !isImageField) {
        const quill = new Quill(`#editor-${block.key}`, {
          theme: "snow",
          modules: {
            toolbar: [
              ["bold", "italic", "underline", "link"],
              [{ header: [2, 3, false] }],
              [{ list: "ordered" }, { list: "bullet" }],
              ["image", "clean"],
            ],
          },
        });
        quill
          .getModule("toolbar")
          .addHandler("image", () => selectLocalImage(quill));
        activeQuills[block.key] = quill;
      }
    });
  }, 50);
};

// --- IMAGE UPLOAD HELPER ---
function selectLocalImage(quill) {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const { data, error } = await window.supabaseClient.storage
        .from("images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = window.supabaseClient.storage
        .from("images")
        .getPublicUrl(fileName);

      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", urlData.publicUrl);
    } catch (err) {
      console.error(err);
      alert("Upload mislukt: " + err.message);
    }
  };
}

window.handleImageUpload = async (inputElement, key) => {
  const file = inputElement.files[0];
  if (!file) return;

  const btn = inputElement.nextElementSibling;
  const orgText = btn.innerHTML;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploaden...`;
  btn.disabled = true;

  try {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    const { data, error } = await window.supabaseClient.storage
      .from("images")
      .upload(fileName, file);
    if (error) throw error;

    const { data: urlData } = window.supabaseClient.storage
      .from("images")
      .getPublicUrl(fileName);

    document.getElementById(`input-${key}`).value = urlData.publicUrl;
    const imgPreview = document.getElementById(`preview-${key}`);
    const iconPreview = document.getElementById(`icon-${key}`);

    imgPreview.src = urlData.publicUrl;
    imgPreview.style.display = "block";
    iconPreview.style.display = "none";
  } catch (err) {
    alert("Upload mislukt: " + err.message);
  } finally {
    btn.innerHTML = orgText;
    btn.disabled = false;
  }
};

window.saveSectionContent = async (e, sectionName) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orgText = btn.innerText;
  btn.innerText = "Opslaan...";

  const updates = [];
  const formData = new FormData(e.target);

  // 1. DATA UIT GEWONE INPUTS + HIDDEN IMAGE INPUTS
  for (let [key, value] of formData.entries()) {
    if (!activeQuills[key]) {
      updates.push(updateBlock(key, value));
    }
  }

  // 2. DATA UIT QUILL EDITORS
  for (const [key, quillInstance] of Object.entries(activeQuills)) {
    updates.push(updateBlock(key, quillInstance.root.innerHTML));
  }

  try {
    await Promise.all(updates);
    window.closeAdminModal();
    handleNavigation("cms");
  } catch (err) {
    alert("Fout bij opslaan: " + err.message);
  } finally {
    btn.innerText = orgText;
  }
};

function updateBlock(key, content) {
  return window.supabaseClient
    .from("content_blocks")
    .update({ content: content, updated_at: new Date() })
    .eq("key", key);
}

// --- SORTEREN ---
function sortBlocks(blocks, sectionName) {
  const priorityOrder = [
    "title",
    "hero_title",
    "header",
    "subtitle",
    "hero_subtitle",
    "intro",
    "body",
    "content",
    "description",
    "hero_image",
    "image_url", // Image velden (voor hero etc)
    "button_text",
    "cta_text",
    "cta_link",
  ];

  return blocks.sort((a, b) => {
    const keyA = a.key.replace(`${sectionName}_`, "");
    const keyB = b.key.replace(`${sectionName}_`, "");
    const indexA = priorityOrder.indexOf(keyA);
    const indexB = priorityOrder.indexOf(keyB);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return keyA.localeCompare(keyB);
  });
}

// --- PAGINA AANMAKEN & VERWIJDEREN ---

window.deletePage = async (sectionName) => {
  if (
    !confirm(
      `⚠️ Weet je zeker dat je de pagina '${sectionName}' wilt verwijderen?`,
    )
  )
    return;
  const { error } = await window.supabaseClient
    .from("content_blocks")
    .delete()
    .eq("section", sectionName);
  if (error) alert("Fout: " + error.message);
  else handleNavigation("cms");
};

window.openAddPageModal = () => {
  const slot = document.getElementById("admin-modal-slot");
  slot.innerHTML = `
        <div class="modal-overlay open" style="display: flex;" onclick="closeAdminModal(event)">
            <div class="modal-card" onclick="event.stopPropagation()">
                <div class="modal-header-custom">
                    <h3 class="modal-title">Nieuwe Pagina</h3>
                    <button onclick="closeAdminModal()" class="btn-close">&times;</button>
                </div>
                <form onsubmit="createPage(event)" class="modal-body-scroll">
                    <div class="form-group">
                        <label class="form-label">Naam (Sectie)</label>
                        <input name="section_name" class="form-input" placeholder="bv. over-ons" required
                               onkeyup="this.value = this.value.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '')">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Template</label>
                        <select name="template" class="form-input">
                            <option value="basic">Standaard (Titel + Tekst)</option>
                            <option value="rich">Uitgebreid (Titel + Intro + Body)</option>
                            <option value="hero">Hero Header (Titel + Subtitel + Knop + Achtergrond)</option>
                            <option value="blank">Leeg</option>
                        </select>
                    </div>
                    <div class="text-right"><button type="submit" class="btn-primary">Aanmaken</button></div>
                </form>
            </div>
        </div>
    `;
};

window.createPage = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const section = formData.get("section_name");
  const template = formData.get("template");

  let blocks = [];
  // AANGEPAST: Geen image_url meer in 'rich'
  if (template === "basic") blocks = ["title", "body"];
  else if (template === "rich") blocks = ["title", "intro", "body"];
  else if (template === "hero")
    blocks = [
      "hero_title",
      "hero_subtitle",
      "hero_image",
      "cta_text",
      "cta_link",
    ];
  else blocks = ["content"];

  const inserts = blocks.map((suffix) => ({
    section: section,
    key: `${section}_${suffix}`,
    content: suffix.includes("image") ? "" : `Nieuwe ${suffix}...`,
  }));

  const { error } = await window.supabaseClient
    .from("content_blocks")
    .insert(inserts);
  if (error) alert("Fout: " + error.message);
  else {
    window.closeAdminModal();
    handleNavigation("cms");
  }
};

window.openAddBlockModal = (section) => {
  const suffix = prompt("Naam (bv. 'extra_info'):");
  if (!suffix) return;
  const fullKey = `${section}_${suffix.toLowerCase().replace(/\s+/g, "_")}`;
  window.supabaseClient
    .from("content_blocks")
    .insert({
      section: section,
      key: fullKey,
      content: "...",
    })
    .then(({ error }) => {
      if (error) alert("Fout: " + error.message);
      else openEditSectionModal(section);
    });
};

function stripHtml(html) {
  let tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}
