// app.js laadt de componenten + initialiseert de header.

window.addEventListener("DOMContentLoaded", () => {
  const base = location.pathname.includes("/pages/") ? ".." : ".";
  const tasks = [];

  // Header
  if (document.getElementById("site-header")) {
    tasks.push(loadComponent("site-header", `${base}/components/header.html`));
  }

  // Auth modal
  if (document.getElementById("auth-modal-slot")) {
    tasks.push(
      loadComponent("auth-modal-slot", `${base}/components/auth-modal.html`),
    );
  }

  // Footer
  if (document.getElementById("site-footer")) {
    tasks.push(loadComponent("site-footer", `${base}/components/footer.html`));
  }

  Promise.all(tasks).then(() => {
    if (typeof initHeader === "function") initHeader();
  });
});
