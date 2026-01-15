// NL: Besturing van auth modal (open/close/toggle)

function openAuthModal(mode = "login") {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;

  const msg = document.getElementById("status-msg");
  if (msg) msg.innerText = "";

  const login = document.getElementById("login-box");
  const reg = document.getElementById("register-box");
  if (mode === "register") {
    if (login) login.style.display = "none";
    if (reg) reg.style.display = "block";
  } else {
    if (login) login.style.display = "block";
    if (reg) reg.style.display = "none";
  }

  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;
  modal.style.display = "none";
  document.body.style.overflow = "";
}

function toggleAuthMode() {
  const login = document.getElementById("login-box");
  const reg = document.getElementById("register-box");
  const msg = document.getElementById("status-msg");
  if (msg) msg.innerText = "";

  const loginVisible = login && login.style.display !== "none";
  if (login && reg) {
    login.style.display = loginVisible ? "none" : "block";
    reg.style.display = loginVisible ? "block" : "none";
  }
}

// NL: Klik buiten de card of op 'X' sluit het modal
document.addEventListener("click", (e) => {
  const overlay = e.target.closest("[data-modal-overlay]");
  const closeBtn = e.target.closest("[data-modal-close]");
  if (closeBtn) {
    closeAuthModal();
  } else if (overlay && e.target === overlay) {
    closeAuthModal();
  }
});

// NL: Escape sluit
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAuthModal();
});

// NL: Globale triggers voor open auth modal (login/register)
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open-auth]");
  if (!btn) return;
  const mode = btn.getAttribute("data-open-auth") || "login";
  e.preventDefault();
  openAuthModal(mode);
});
