// --- CONFIGURATIE ---
const BUSINESS_HOURS = [
  { daysOfWeek: [1, 2, 3], startTime: "09:00", endTime: "21:00" },
  { daysOfWeek: [5], startTime: "09:00", endTime: "18:00" },
  { daysOfWeek: [6], startTime: "13:00", endTime: "18:00" },
  { daysOfWeek: [0], startTime: "10:00", endTime: "13:00" },
];

export async function BookPage(preselectedId = null) {
  const { data: treatments } = await window.supabaseClient
    .from("treatments")
    .select("*")
    .eq("active", true)
    .order("category");

  const grouped = {};
  treatments.forEach((t) => {
    const cat = t.category || "Overig";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  });

  // We bouwen de HTML, maar voegen logic toe om de juiste option te selecteren
  setTimeout(() => {
    if (preselectedId) {
      const select = document.getElementById("treatment-select");
      if (select) {
        select.value = preselectedId;
        // Trigger handmatig het change event om de kalender te tonen
        const event = new Event("change");
        select.dispatchEvent(event);
      }
    }
  }, 100); // Korte timeout om te zorgen dat DOM geladen is

  return `
    <div style="max-width: 900px; margin: 0 auto; padding: 2rem 1rem;">
        <div style="text-align:center; margin-bottom:2rem;">
            <h2 class="text-title">Maak een Afspraak</h2>
            <p class="text-subtitle">Klik op een vrij moment in de agenda.</p>
        </div>

        <div class="card" style="padding: 1.5rem;">

            <div class="form-group" style="margin-bottom: 2rem;">
                <label class="form-label">Welke behandeling wil je boeken?</label>
                <select id="treatment-select" class="form-input" onchange="enableCalendar()" style="height:50px; font-size:1rem;">
                    <option value="" disabled ${!preselectedId ? "selected" : ""}>-- Selecteer eerst je behandeling --</option>
                    ${Object.keys(grouped)
                      .map(
                        (cat) => `
                        <optgroup label="${cat}">
                            ${grouped[cat]
                              .map(
                                (t) =>
                                  `<option value="${t.id}"
                                         data-duration="${t.duration}"
                                         data-title="${t.title}"
                                         ${String(t.id) === String(preselectedId) ? "selected" : ""}>
                                    ${t.title} (€${t.price}) - ${t.duration} min
                                </option>`,
                              )
                              .join("")}
                        </optgroup>
                    `,
                      )
                      .join("")}
                </select>
            </div>

            <div id="calendar-wrapper" style="display:none; animation: fadeIn 0.5s;">
                <div style="background: #fffaf4; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 0.9rem; color: var(--primary); border: 1px solid var(--primary);">
                    <i class="fas fa-info-circle"></i> Klik op een leeg tijdstip om te boeken.
                </div>
                <div id="booking-calendar"></div>
            </div>
        </div>
    </div>

    <div id="confirm-modal" class="modal-overlay" style="display:none;">
        <div class="modal-card">
            <div class="modal-header">
                <h3 class="modal-title">Bevestig Afspraak</h3>
                <button onclick="closeConfirmModal()" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p class="modal-subtitle">Controleer je gegevens.</p>
                <div style="background:#f9f9f9; padding:15px; border-radius:8px; margin-bottom:1rem;">
                    <div id="confirm-treatment" style="font-weight:bold; font-size:1.1rem; color:var(--primary);"></div>
                    <div id="confirm-time" style="margin-top:5px; color:var(--text-main);"></div>
                </div>
                <form onsubmit="finalizeBooking(event)">
                    <input type="hidden" name="treatment_id" id="final-treatment-id">
                    <input type="hidden" name="start_time" id="final-start-time">
                    <div class="form-group">
                        <label class="form-label">Opmerking (Optioneel)</label>
                        <textarea name="notes" class="form-input" rows="2"></textarea>
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%; justify-content:center;">Bevestigen</button>
                </form>
            </div>
        </div>
    </div>
    `;
}

// --- GLOBALE VARIABELEN ---
let calendarInstance = null;

// --- LOGICA ---

window.enableCalendar = () => {
  document.getElementById("calendar-wrapper").style.display = "block";

  // Initialiseer kalender als dat nog niet gebeurd is
  if (!calendarInstance) {
    initBookingCalendar();
  } else {
    calendarInstance.refetchEvents(); // Ververs data
  }
};

async function initBookingCalendar() {
  const calendarEl = document.getElementById("booking-calendar");

  // Bepaal view op basis van schermgrootte
  const initialView = window.innerWidth < 768 ? "timeGridDay" : "timeGridWeek";

  calendarInstance = new FullCalendar.Calendar(calendarEl, {
    initialView: initialView,
    locale: "nl",
    firstDay: 1, // Maandag eerst
    slotMinTime: "09:00:00",
    slotMaxTime: "21:00:00",
    allDaySlot: false,
    height: "auto",
    contentHeight: "auto",
    expandRows: true,
    stickyHeaderDates: true,

    // Bedrijfsuren (Grijze achtergrond voor gesloten uren)
    businessHours: BUSINESS_HOURS,

    // Zorgt dat je niet op gesloten uren kunt klikken
    selectConstraint: "businessHours",

    // Header
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: window.innerWidth < 768 ? "" : "timeGridWeek,timeGridDay",
    },

    // --- DE BELANGRIJKSTE LOGICA ---
    dateClick: handleDateClick, // Wat gebeurt er als je klikt?

    // Events ophalen (Bezette momenten)
    events: fetchBusySlots,

    // Styling van events
    eventDisplay: "background", // Toon als achtergrondblokken (niet klikbaar)
    eventColor: "#e0e0e0", // Grijs voor bezet
  });

  calendarInstance.render();
}

// --- FUNCTIE: OPHALEN BEZETTE SLOTEN ---
async function fetchBusySlots(info, successCallback, failureCallback) {
  const { start, end } = info;

  // Haal alle afspraken op tussen de zichtbare datums
  const { data: appointments, error } = await window.supabaseClient
    .from("appointments")
    .select("start_time, treatments(duration)")
    .gte("start_time", start.toISOString())
    .lte("start_time", end.toISOString())
    .neq("status", "cancelled");

  if (error) {
    console.error(error);
    failureCallback(error);
    return;
  }

  // Zet om naar FullCalendar events
  const busyEvents = appointments.map((appt) => {
    const startDate = new Date(appt.start_time);
    const duration = appt.treatments?.duration || 60; // Fallback
    const endDate = new Date(startDate.getTime() + duration * 60000);

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      display: "background", // Maakt het een blokkade
      className: "busy-slot", // Voor CSS styling
    };
  });

  successCallback(busyEvents);
}

// --- FUNCTIE: KLIK OP KALENDER ---
window.handleDateClick = (info) => {
  const treatmentSelect = document.getElementById("treatment-select");
  const selectedOption = treatmentSelect.options[treatmentSelect.selectedIndex];
  const duration = parseInt(selectedOption.dataset.duration);

  // Starttijd van de klik
  const startTime = info.date;
  // Eindtijd berekenen
  const endTime = new Date(startTime.getTime() + duration * 60000);

  // 1. Check: Is dit in de toekomst?
  if (startTime < new Date()) {
    alert("Je kunt niet in het verleden boeken.");
    return;
  }

  // 2. Check: Overlapt dit met een bestaande afspraak?
  // We vragen de events in de kalender op die overlappen met ons gewenste blok
  const overlappingEvents = calendarInstance.getEvents().filter((event) => {
    // Logica: (StartA < EndB) en (EndA > StartB)
    return event.start < endTime && event.end > startTime;
  });

  if (overlappingEvents.length > 0) {
    alert(
      "Helaas, dit tijdstip overlapt met een andere afspraak. Kies een ander moment.",
    );
    return;
  }

  // 3. Alles OK? Toon Modal!
  openConfirmModal(
    selectedOption.dataset.title,
    startTime,
    selectedOption.value,
  );
};

// --- MODAL LOGICA ---
window.openConfirmModal = (treatmentTitle, dateObj, treatmentId) => {
  const modal = document.getElementById("confirm-modal");

  // Vul teksten
  document.getElementById("confirm-treatment").innerText = treatmentTitle;
  document.getElementById("confirm-time").innerText =
    dateObj.toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Vul hidden inputs voor de submit
  // Belangrijk: Corrigeer de tijdzone offset voor de ISO string
  const offset = dateObj.getTimezoneOffset() * 60000;
  const localISOTime = new Date(dateObj.getTime() - offset)
    .toISOString()
    .slice(0, 16);

  document.getElementById("final-start-time").value = localISOTime; // Voor DB insert (of gebruik Date object)
  document.getElementById("final-treatment-id").value = treatmentId;

  // Supabase verwacht ISO string, laten we de originele ISO gebruiken en hopen dat Supabase UTC snapt
  // Beter: stuur de lokale ISO string en laat Supabase het regelen, of stuur UTC.
  // De eenvoudigste manier is de dateObj.toISOString() gebruiken die UTC is.
  document.getElementById("final-start-time").value = dateObj.toISOString();

  modal.style.display = "flex";
};

window.closeConfirmModal = () => {
  document.getElementById("confirm-modal").style.display = "none";
};

window.finalizeBooking = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  btn.innerText = "Bezig...";
  btn.disabled = true;

  const user = window.supabaseClient.auth.user();
  const formData = new FormData(e.target);

  const insertData = {
    client_id: user.id,
    treatment_id: formData.get("treatment_id"),
    start_time: formData.get("start_time"),
    status: "scheduled", // Staat standaard op scheduled
    notes: formData.get("notes"),
  };

  const { error } = await window.supabaseClient
    .from("appointments")
    .insert(insertData);

  if (error) {
    alert("Fout: " + error.message);
    btn.innerText = "Bevestigen";
    btn.disabled = false;
  } else {
    closeConfirmModal();
    alert("🎉 Afspraak bevestigd! Je ziet hem terug in je dashboard.");
    handleNavigation("dashboard");
  }
};
