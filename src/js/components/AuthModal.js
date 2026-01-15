import { handleLogin, handleRegister } from "../auth.js";

export function renderAuthModal() {
  const slot = document.getElementById("auth-modal-slot");
  if (!slot) return;

  // De HTML Template
  slot.innerHTML = `
        <div id="auth-modal-overlay" class="modal-overlay" onclick="closeAuthModal(event)">
            <div class="modal-card" onclick="event.stopPropagation()">

                <div class="modal-header">
                    <h3 id="auth-title" class="modal-title">Inloggen</h3>
                    <button class="modal-close" onclick="closeAuthModal()">&times;</button>
                </div>

                <div class="modal-body">
                    <p id="auth-subtitle" class="modal-subtitle">Welkom terug!</p>

                    <form id="auth-form" onsubmit="handleAuthSubmit(event)">

                        <div id="register-fields" style="display: none;">
                            <div class="modal-row">
                                <input type="text" name="firstname" placeholder="Voornaam" class="modal-input">
                                <input type="text" name="lastname" placeholder="Achternaam" class="modal-input">
                            </div>
                        </div>

                        <div style="margin-bottom: 10px;">
                            <input type="email" name="email" required placeholder="E-mailadres" class="modal-input">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <input type="password" name="password" required placeholder="Wachtwoord" class="modal-input">
                        </div>

                        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
                            <span id="auth-btn-text">Inloggen</span>
                        </button>
                    </form>

                    <div id="auth-status" class="modal-status" style="color: red;"></div>

                    <div class="switch-text">
                        <span id="switch-msg">Nog geen account?</span>
                        <a href="#" onclick="toggleAuthMode(); return false;" id="switch-link" style="color: var(--brand-primary); font-weight: bold;">
                            Registreer hier
                        </a>
                    </div>
                </div>

            </div>
        </div>
    `;
}

// --- LOGICA ---

let currentMode = "login"; // 'login' of 'register'

window.openAuthModal = (mode = "login") => {
  currentMode = mode;
  updateModalUI();
  const overlay = document.getElementById("auth-modal-overlay");
  if (overlay) overlay.style.display = "flex";
};

window.closeAuthModal = (e) => {
  if (
    e &&
    e.target.id !== "auth-modal-overlay" &&
    !e.target.classList.contains("modal-close")
  )
    return;

  const overlay = document.getElementById("auth-modal-overlay");
  if (overlay) overlay.style.display = "none";
};

window.toggleAuthMode = () => {
  currentMode = currentMode === "login" ? "register" : "login";
  updateModalUI();
};

function updateModalUI() {
  const isRegister = currentMode === "register";

  document.getElementById("auth-title").textContent = isRegister
    ? "Registreren"
    : "Inloggen";
  document.getElementById("auth-subtitle").textContent = isRegister
    ? "Maak een account aan"
    : "Welkom terug!";
  document.getElementById("auth-btn-text").textContent = isRegister
    ? "Account aanmaken"
    : "Inloggen";
  document.getElementById("register-fields").style.display = isRegister
    ? "block"
    : "none";

  document.getElementById("switch-msg").textContent = isRegister
    ? "Al een account?"
    : "Nog geen account?";
  document.getElementById("switch-link").textContent = isRegister
    ? "Log in"
    : "Registreer hier";
  document.getElementById("auth-status").textContent = "";
}

window.handleAuthSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  const statusEl = document.getElementById("auth-status");
  statusEl.textContent = "Bezig...";

  try {
    if (currentMode === "login") {
      await handleLogin(data.email, data.password);
      window.closeAuthModal();
      window.location.reload();
    } else {
      await handleRegister(data);
      statusEl.textContent = "Check je email om te bevestigen!";
      statusEl.style.color = "green";
    }
  } catch (error) {
    statusEl.textContent = error.message || "Er ging iets mis.";
    statusEl.style.color = "red";
  }
};
