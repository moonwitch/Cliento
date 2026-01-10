// src/admin/js/cms.js

let quill; // We definiëren quill nu hier, lokaal in deze module

// 1. Initialisatie (aangeroepen vanuit dashboard.js)
function initCMS() {
  if (quill) return; // Al gestart? Doe niets.

  console.log("CMS Editor initialiseren...");

  // Start Quill
  quill = new Quill("#editor-container", {
    theme: "snow",
    modules: {
      toolbar: {
        container: [
          ["bold", "italic", "underline"],
          [{ header: [2, 3, false] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["image", "clean"],
        ],
        handlers: {
          image: selectLocalImage,
        },
      },
    },
  });

  // Haal direct de blokken op
  fetchContentBlocks();
}

// 2. Blokken Ophalen
async function fetchContentBlocks() {
  const list = document.getElementById("cms-list");
  // We sorteren op section_key zodat de volgorde logisch blijft
  const { data: blocks, error } = await supabaseClient
    .from("content_blocks")
    .select("*")
    .order("section_key");

  if (error) {
    list.innerHTML = `<p style="color:red">Fout: ${error.message}</p>`;
    return;
  }

  list.innerHTML = "";
  blocks.forEach((block) => {
    const btn = document.createElement("div");
    btn.className = "menu-item";
    btn.style.cursor = "pointer";
    btn.style.border = "1px solid #eee";
    // Toon label als het er is, anders de technische key
    btn.innerHTML = `<strong>${block.label || block.section_key}</strong>`;
    btn.onclick = () => openEditor(block);
    list.appendChild(btn);
  });
}

// 3. Editor Openen
function openEditor(block) {
  document.getElementById("cms-editor").style.display = "block";

  // Header update
  document.getElementById("editor-title").innerText =
    "Bewerken: " + (block.label || block.section_key);

  // ID invullen (hidden field)
  document.getElementById("editor-id").value = block.id;

  // NIEUW: Titel invullen in het input veld
  document.getElementById("editor-label").value = block.label || "";

  // Content in Quill zetten
  quill.root.innerHTML = block.content || "";

  // Reset status bericht
  document.getElementById("cms-msg").innerText = "";
}

// 4. Opslaan
async function saveContentBlock() {
  const id = document.getElementById("editor-id").value;
  const newContent = quill.root.innerHTML;

  // NIEUW: Haal de titel op uit het input veld
  const newLabel = document.getElementById("editor-label").value;

  const msg = document.getElementById("cms-msg");
  msg.innerText = "Opslaan...";

  // We updaten nu content én label
  const { error } = await supabaseClient
    .from("content_blocks")
    .update({
      content: newContent,
      label: newLabel,
      updated_at: new Date(),
    })
    .eq("id", id);

  if (error) {
    msg.innerText = "Fout: " + error.message;
    msg.style.color = "red";
  } else {
    msg.innerText = "Succesvol opgeslagen! ✅";
    msg.style.color = "green";
    // Lijst verversen zodat je de nieuwe titel direct links ziet
    fetchContentBlocks();
  }
}

// 5. Helpers voor afbeeldingen (ongewijzigd, maar wel nodig)
function selectLocalImage() {
  const input = document.getElementById("image-upload");
  input.click();
  input.onchange = () => {
    const file = input.files[0];
    if (file) saveToSupabase(file);
  };
}

async function saveToSupabase(file) {
  // ... (deze functie kan je letterlijk overnemen uit je vorige bericht) ...
  // Voor de volledigheid:
  if (!file.type.startsWith("image/")) {
    alert("Alleen afbeeldingen");
    return;
  }
  try {
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split(".").pop()}`;
    const range = quill.getSelection();
    quill.insertText(range.index, "📸 Uploaden...", "bold", true);

    const { error } = await supabaseClient.storage
      .from("images")
      .upload(filePath, file);
    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabaseClient.storage.from("images").getPublicUrl(filePath);

    quill.deleteText(range.index, 13);
    quill.insertEmbed(range.index, "image", publicUrl);
    quill.setSelection(range.index + 1);
  } catch (e) {
    alert("Upload error: " + e.message);
  }
}
