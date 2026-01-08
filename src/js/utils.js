function loadScript(src) {
  return new Promise((resolve, reject) => {
    // 1. Check of het script al bestaat om dubbel laden te voorkomen
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(); // Is al er, we zijn klaar!
      return;
    }

    // 2. Maak een nieuw script element
    const script = document.createElement("script");
    script.src = src;

    // 3. Wacht tot het geladen is
    script.onload = resolve;
    script.onerror = reject;

    // 4. Voeg toe aan de pagina
    document.head.appendChild(script);
  });
}
