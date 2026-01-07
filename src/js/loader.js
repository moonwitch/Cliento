// src/js/loader.js

async function loadComponent(elementId, filePath) {
  // Find element
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element met id '${elementId}' niet gevonden.`);
    return;
  }

  try {
    // Fetch file
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Kon ${filePath} niet laden: ${response.statusText}`);
    }

    // Fetch content
    const html = await response.text();

    // Insert content to element
    element.innerHTML = html;
  } catch (error) {
    console.error("Fout bij laden component:", error);
    element.innerHTML = "<p>Fout bij laden.</p>";
  }
}
