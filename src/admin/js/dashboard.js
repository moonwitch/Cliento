// src/admin/js/dashboard.js

// 1. De Configuratie
const moduleConfig = new Map();

moduleConfig.set("dashboard", {
  title: "Dashboard",
  path: "./modules/overview.html",
});

moduleConfig.set("cms", {
  title: "CMS",
  path: "./modules/cms.html",
  function: "initCMS",
});

moduleConfig.set("staff", {
  title: "Medewerkers",
  path: "./modules/staff.html",
  function: "initStaff",
});

moduleConfig.set("treatments", {
  title: "Behandelingen",
  path: "./modules/treatments.html",
  function: "initTreatments",
});

// Agenda koppelen (gebruikt waarschijnlijk extern script of overview)
moduleConfig.set("calendar", {
  title: "Agenda",
  path: "./modules/overview.html", // Of naar een calendar.html als je die hebt
});

// Clients & Appointments (voorlopig naar overview sturen of placeholder)
moduleConfig.set("clients", {
  title: "Klanten",
  path: "./modules/overview.html",
});
moduleConfig.set("appointments", {
  title: "Afspraken",
  path: "./modules/overview.html",
});

// 2. De Router
async function loadModule(moduleName) {
  const content = document.getElementById("module-render-area");

  if (!content) {
    console.error("Kan container 'module-render-area' niet vinden in HTML.");
    return;
  }

  // Check of de module bestaat
  if (!moduleConfig.has(moduleName)) {
    content.innerHTML = `<p>${moduleName} is nog in opbouw!</p>`;
    return;
  }

  const config = moduleConfig.get(moduleName);

  // Update de UI (Actieve knop status)
  document
    .querySelectorAll(".menu-item")
    .forEach((el) => el.classList.remove("active"));
  const activeBtn = document.querySelector(
    `.menu-item[onclick*="${moduleName}"]`,
  );
  if (activeBtn) activeBtn.classList.add("active");

  // Update de titel
  // document.getElementById("page-title").innerText = config.title;

  try {
    content.innerHTML = "<p>Laden...</p>"; // Feedback voor de gebruiker

    // A. HTML Ophalen
    let response = await fetch(config.path);
    if (!response.ok) throw new Error(`Kon module ${config.title} niet laden`);
    content.innerHTML = await response.text();

    // B. Javascript Starten
    // We zoeken de functie in het globale 'window' object
    const initFunction = window[config.function];

    if (typeof initFunction === "function") {
      initFunction();
    } else {
      console.warn(
        `Geen startfunctie '${config.function}' gevonden voor ${moduleName}.`,
      );
    }
  } catch (error) {
    console.error(error);
    content.innerHTML = `<p style="color:red">Fout: ${error.message}</p>`;
  }
}
