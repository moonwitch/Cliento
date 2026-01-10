// src/admin/js/dashboard.js

// 1. De Configuratie
const moduleConfig = new Map();

moduleConfig.set("dashboard", {
  title: "Dashboard",
  path: "../dashboard.html",
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

// 2. De Router
async function loadModule(moduleName) {
  const content = document.getElementById("app-content");

  // Check of de module bestaat
  if (!moduleConfig.has(moduleName)) {
    content.innerHTML = `<p>Module niet gevonden: ${moduleName}</p>`;
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
