export async function CalendarPage() {
  setTimeout(initCalendar, 100); // Needed lil trick for rendering in nilla JS

  return `
    <div class="flex-between">
        <div>
            <h2 class="text-title">Agenda</h2>
            <p class="text-subtitle">Sleep om te plannen of klik voor details.</p>
        </div>
        <button class="btn-primary" onclick="openAppointmentModal()">
            <i class="fas fa-plus"></i> Afspraak Maken
        </button>
    </div>

    <div class="calendar-wrapper">
        <div id="calendar"></div>
    </div>
    `;
}

// --- VARIABELEN ---
let calendar;

// --- 1. INITIALISATIE ---
window.initCalendar = async () => {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  // FullCalendar Config (Jouw custom settings)
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    buttonText: {
      today: "vandaag",
      month: "maand",
      week: "week",
      day: "dag",
      list: "lijst",
    },
    locale: "nl",
    firstDay: 1,
    businessHours: [
      { daysOfWeek: [1, 2, 3, 5], startTime: "09:00", endTime: "21:00" },
      { daysOfWeek: [6], startTime: "13:00", endTime: "18:00" },
      { daysOfWeek: [0], startTime: "10:00", endTime: "13:00" },
    ],
    allDaySlot: false,
    height: "100%",
    selectable: true,
    editable: true,
    nowIndicator: true,

    // INTERACTIES
    select: (info) => {
      openAppointmentModal(null, info.start, info.end);
    },
    eventClick: (info) => {
      openAppointmentModal(info.event.id);
    },
    eventDrop: async (info) => {
      await updateAppointmentTime(
        info.event.id,
        info.event.start,
        info.event.end,
      );
    },
    events: fetchEventsFromSupabase,
  });

  calendar.render();
};

// --- 2. DATA OPHALEN ---
async function fetchEventsFromSupabase(
  fetchInfo,
  successCallback,
  failureCallback,
) {
  // Let op: We gebruiken hier de veldnamen van je NIEUWE DB schema (client_id, staff_id, etc)
  const { data, error } = await window.supabaseClient
    .from("appointments")
    .select(
      `
            id, start_time, end_time, status, notes,
            client_id, staff_id, treatment_id,
            clients (first_name, last_name),
            treatments (title),
            profiles (first_name)
        `,
    )
    .gte("start_time", fetchInfo.startStr)
    .lte("end_time", fetchInfo.endStr);

  if (error) {
    console.error(error);
    failureCallback(error);
    return;
  }

  const events = data.map((appt) => {
    // Veilige checks voor als data null is (bv. deleted staff)
    const clientName = appt.clients
      ? `${appt.clients.first_name} ${appt.clients.last_name}`
      : "Onbekend";
    const treatmentTitle = appt.treatments
      ? appt.treatments.title
      : "Behandeling";

    return {
      id: appt.id,
      title: `${clientName} - ${treatmentTitle}`,
      start: appt.start_time,
      end: appt.end_time,
      classNames: [`status-${appt.status}`],
      extendedProps: {
        client_id: appt.client_id,
        staff_id: appt.staff_id,
        treatment_id: appt.treatment_id,
        notes: appt.notes,
      },
    };
  });

  successCallback(events);
}

// --- 3. MODAL: AFSPRAAK MAKEN / BEWERKEN ---
window.openAppointmentModal = async (
  apptId = null,
  start = null,
  end = null,
) => {
  const slot = document.getElementById("admin-modal-slot");

  // Data ophalen: Clients, Treatments, Staff EN Skills (staff_treatments)
  const [clientsReq, treatmentsReq, staffReq, skillsReq, apptReq] =
    await Promise.all([
      window.supabaseClient
        .from("clients")
        .select("id, first_name, last_name")
        .order("last_name"),
      window.supabaseClient
        .from("treatments")
        .select("id, title, duration_minutes, price")
        .order("title"),
      window.supabaseClient
        .from("profiles")
        .select("id, first_name")
        .neq("role", "client"),
      window.supabaseClient.from("staff_treatments").select("*"),
      apptId
        ? window.supabaseClient
            .from("appointments")
            .select("*")
            .eq("id", apptId)
            .single()
        : Promise.resolve({ data: {} }),
    ]);

  const clients = clientsReq.data || [];
  const treatments = treatmentsReq.data || [];
  const staff = staffReq.data || [];
  const skills = skillsReq.data || [];
  const appt = apptReq.data || {};

  // Sla staff en skills globaal op voor de filter functies
  window.allStaff = staff;
  window.staffSkills = skills;

  const defaultStart = appt.start_time
    ? toLocalISO(new Date(appt.start_time))
    : start
      ? toLocalISO(start)
      : toLocalISO(new Date());
  const defaultEnd = appt.end_time
    ? toLocalISO(new Date(appt.end_time))
    : end
      ? toLocalISO(end)
      : toLocalISO(new Date(Date.now() + 3600000));

  slot.innerHTML = `
        <div class="modal-overlay open" onclick="closeAdminModal(event)">
            <div class="modal-card" onclick="event.stopPropagation()">
                <div style="display:flex; justify-content:space-between; margin-bottom: 1rem;">
                    <h3 class="modal-title">${apptId ? "Afspraak Bewerken" : "Nieuwe Afspraak"}</h3>
                    <button onclick="closeAdminModal()" style="border:none; background:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>

                <form onsubmit="saveAppointment(event, '${apptId || ""}')">

                    <div class="form-group">
                        <label class="form-label">Klant</label>
                        <input list="client-list" name="client_input" class="form-input" placeholder="Zoek naam..."
                               value="${appt.client_id ? getClientName(clients, appt.client_id) : ""}" required autocomplete="off">
                        <datalist id="client-list">
                            ${clients.map((c) => `<option data-value="${c.id}" value="${c.first_name} ${c.last_name}"></option>`).join("")}
                        </datalist>
                        <input type="hidden" name="client_id" id="hidden_client_id" value="${appt.client_id || ""}">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">
                            <label class="form-label">Behandeling</label>
                            <select name="treatment_id" id="treatment_select" class="form-input" onchange="handleTreatmentChange(this)" required>
                                <option value="">Kies...</option>
                                ${treatments
                                  .map(
                                    (t) => `
                                    <option value="${t.id}" data-duration="${t.duration_minutes}" ${appt.treatment_id === t.id ? "selected" : ""}>
                                        ${t.title} (${t.duration_minutes} min)
                                    </option>`,
                                  )
                                  .join("")}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Medewerker</label>
                            <select name="staff_id" id="staff_select" class="form-input" required>
                                <option value="">Kies eerst behandeling...</option>
                                </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group">
                            <label class="form-label">Start</label>
                            <input type="datetime-local" name="start_time" id="start_time" class="form-input" value="${defaultStart}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Eind</label>
                            <input type="datetime-local" name="end_time" id="end_time" class="form-input" value="${defaultEnd}" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select name="status" class="form-input">
                            <option value="scheduled" ${appt.status === "scheduled" ? "selected" : ""}>Ingepland</option>
                            <option value="confirmed" ${appt.status === "confirmed" ? "selected" : ""}>Bevestigd</option>
                            <option value="completed" ${appt.status === "completed" ? "selected" : ""}>Voltooid</option>
                            <option value="cancelled" ${appt.status === "cancelled" ? "selected" : ""}>Geannuleerd</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Notities</label>
                        <textarea name="notes" class="form-input" rows="2">${appt.notes || ""}</textarea>
                    </div>

                    <div class="modal-actions" style="justify-content: space-between;">
                        ${apptId ? `<button type="button" onclick="deleteAppointment('${apptId}')" style="color:red; background:none; border:none; cursor:pointer; text-decoration:underline;">Verwijderen</button>` : "<div></div>"}
                        <div style="display:flex; gap:10px;">
                            <button type="button" class="btn-icon" onclick="closeAdminModal()">Annuleren</button>
                            <button type="submit" class="btn-primary">Opslaan</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;

  // 1. Setup Client Datalist Logic
  const input = document.querySelector('input[name="client_input"]');
  input.addEventListener("input", function () {
    const list = document.getElementById("client-list");
    const hiddenInput = document.getElementById("hidden_client_id");
    const option = Array.from(list.options).find(
      (opt) => opt.value === this.value,
    );
    if (option) hiddenInput.value = option.getAttribute("data-value");
    else hiddenInput.value = "";
  });

  // 2. Initialiseer Staff Dropdown (Filter direct bij openen)
  if (appt.treatment_id) {
    updateStaffDropdown(appt.treatment_id, appt.staff_id);
  } else {
    updateStaffDropdown(null, null);
  }
};

// --- LOGICA: HANDLERS & FILTERS ---
window.handleTreatmentChange = (selectEl) => {
  const treatmentId = selectEl.value;
  autoSetEndTime(selectEl);
  updateStaffDropdown(treatmentId);
};

function updateStaffDropdown(treatmentId, selectedStaffId = null) {
  const staffSelect = document.getElementById("staff_select");
  staffSelect.innerHTML = '<option value="">Kies...</option>';

  if (!treatmentId) {
    window.allStaff.forEach((s) => {
      staffSelect.innerHTML += `<option value="${s.id}">${s.first_name}</option>`;
    });
    return;
  }

  const allowedStaffIds = window.staffSkills
    .filter((skill) => skill.treatment_id === treatmentId)
    .map((skill) => skill.staff_id);

  const capableStaff = window.allStaff.filter((s) =>
    allowedStaffIds.includes(s.id),
  );

  if (capableStaff.length === 0) {
    staffSelect.innerHTML += `<option disabled>Geen specialisten beschikbaar!</option>`;
  } else {
    capableStaff.forEach((s) => {
      const isSelected = s.id === selectedStaffId ? "selected" : "";
      staffSelect.innerHTML += `<option value="${s.id}" ${isSelected}>${s.first_name}</option>`;
    });
  }
}

// Helper: Tijd aanpassen
window.autoSetEndTime = (selectEl) => {
  const duration = parseInt(
    selectEl.options[selectEl.selectedIndex].getAttribute("data-duration") ||
      60,
  );
  const startInput = document.getElementById("start_time");
  const endInput = document.getElementById("end_time");

  if (startInput.value) {
    const startDate = new Date(startInput.value);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    endInput.value = toLocalISO(endDate);
  }
};

// --- 4. OPSLAAN & UPDATEN ---
window.saveAppointment = async (e, id) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const clientId = document.getElementById("hidden_client_id").value;

  if (!clientId) {
    alert("Selecteer a.u.b. een bestaande klant uit de lijst.");
    return;
  }

  const data = {
    client_id: clientId,
    staff_id: formData.get("staff_id"),
    treatment_id: formData.get("treatment_id"),
    start_time: new Date(formData.get("start_time")).toISOString(),
    end_time: new Date(formData.get("end_time")).toISOString(),
    status: formData.get("status"),
    notes: formData.get("notes"),
  };

  let error;
  if (id) {
    ({ error } = await window.supabaseClient
      .from("appointments")
      .update(data)
      .eq("id", id));
  } else {
    ({ error } = await window.supabaseClient.from("appointments").insert(data));
  }

  if (error) alert("Fout: " + error.message);
  else {
    window.closeAdminModal();
    calendar.refetchEvents();
  }
};

window.deleteAppointment = async (id) => {
  if (!confirm("Afspraak verwijderen?")) return;
  const { error } = await window.supabaseClient
    .from("appointments")
    .delete()
    .eq("id", id);
  if (error) alert(error.message);
  else {
    window.closeAdminModal();
    calendar.refetchEvents();
  }
};

async function updateAppointmentTime(id, start, end) {
  const { error } = await window.supabaseClient
    .from("appointments")
    .update({ start_time: start.toISOString(), end_time: end.toISOString() })
    .eq("id", id);

  if (error) {
    alert("Kon niet verplaatsen: " + error.message);
    calendar.refetchEvents();
  }
}

// Helpers
function toLocalISO(date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);
  return localISOTime;
}

function getClientName(clients, id) {
  const c = clients.find((c) => c.id === id);
  return c ? `${c.first_name} ${c.last_name}` : "";
}
