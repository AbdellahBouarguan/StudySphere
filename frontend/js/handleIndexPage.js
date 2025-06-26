// Check login status on page load
async function checkLoginStatus() {
  const response = await fetch("/api/auth/status", {
    method: "GET",
    credentials: "include", // Include the session cookie
  });

  const data = await response.json();
  if (data.authenticated) {
    //document.getElementById("status").innerText = `Hello ${data.username}`;
  } else {
    window.location.href = "/login.html";
  }
}
checkLoginStatus();

// Handle logout button click
document.getElementById("logout-btn").addEventListener("click", async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include", // Include the session cookie
  });

  const data = await response.json();
  if (response.ok) {
    alert(data.message); // "Logged out"
    // Optionally refresh login status or redirect
    location.reload(); // or redirect to login: window.location.href = '/login.html';
  } else {
    alert("Logout failed");
  }
});
// === Study Timer Logic ===

let totalSeconds = 0;
let activeSubject = null;
let sessionTimers = {}; // { subject: current session seconds }
let totalTimers = {}; // { subject: total seconds from backend }
let intervalHandlers = {}; // { subject: interval ID }

/**
 * Format seconds as HH:MM:SS
 */
function formatTime(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}

/**
 * Update global total time display
 */
function updateTotalDisplay() {
  document.getElementById("total-timer").textContent = formatTime(totalSeconds);
}

/**
 * Initialize timers on page load
 */
async function initializeSubjectTimers() {
  sessionTimers = {};
  totalTimers = {};
  totalSeconds = 0;

  await fetchTodayDurations();
  await loadSubjects();
}

/**
 * Fetch today's totals from backend and update totalTimers & display
 */
async function fetchTodayDurations() {
  const res = await fetch("/api/study/today", { credentials: "include" });
  const data = await res.json(); // { subject: seconds }

  totalTimers = data;
  totalSeconds = Object.values(data).reduce((sum, sec) => sum + sec, 0);

  updateTotalDisplay();

  // Update total displays if already rendered
  for (const [subject, seconds] of Object.entries(data)) {
    const el = document.getElementById(`total-${subject}`);
    if (el) el.textContent = formatTime(seconds);
  }
}

/**
 * Load subject list and render each subject UI
 */
async function loadSubjects() {
  const container = document.getElementById("subjects-list");
  container.innerHTML = "";

  sessionTimers = {};
  intervalHandlers = {};

  const res = await fetch("/api/subjects/", {
    method: "GET",
    credentials: "include",
  });

  const subjects = await res.json();

  subjects.forEach((subject) => {
    sessionTimers[subject] = 0;
    totalTimers[subject] ||= 0;
    renderSubject(subject);
  });
}

/**
 * Render a subject row: label + timers + controls
 */
function renderSubject(subject) {
  const container = document.getElementById("subjects-list");

  const row = document.createElement("div");
  row.className =
    "list-group-item d-flex justify-content-between align-items-center";

  const label = document.createElement("span");
  label.innerHTML = `<strong>${subject}</strong>`;

  const sessionEl = document.createElement("span");
  sessionEl.id = `session-${subject}`;
  sessionEl.textContent = "00:00:00";

  const totalEl = document.createElement("span");
  totalEl.id = `total-${subject}`;
  totalEl.textContent = formatTime(totalTimers[subject]);

  const controlBtn = document.createElement("button");
  controlBtn.innerHTML = "▶️";
  controlBtn.className = "btn btn-sm btn-success";
  controlBtn.setAttribute("data-subject", subject);
  controlBtn.addEventListener("click", () =>
    toggleSubjectTimer(subject, controlBtn)
  );

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "🗑️";
  deleteBtn.className = "btn btn-sm btn-danger";
  deleteBtn.addEventListener("click", () => handleDeleteSubject(subject));

  const info = document.createElement("div");
  info.innerHTML = `
    <div>Session: <span id="session-${subject}">00:00:00</span></div>
    <div>Total: <span id="total-${subject}">${formatTime(
    totalTimers[subject]
  )}</span></div>
  `;

  const right = document.createElement("div");
  right.className = "d-flex gap-2 align-items-center";
  right.appendChild(info);
  right.appendChild(controlBtn);
  right.appendChild(deleteBtn);

  row.appendChild(label);
  row.appendChild(right);
  container.appendChild(row);
}

/**
 * Toggle timer on/off for a subject
 */
function toggleSubjectTimer(subject, buttonEl) {
  if (activeSubject && activeSubject !== subject) {
    stopActiveTimer();
  }

  if (!intervalHandlers[subject]) {
    // Start
    activeSubject = subject;
    buttonEl.textContent = "⏸️";

    intervalHandlers[subject] = setInterval(() => {
      sessionTimers[subject]++;
      totalSeconds++;

      document.getElementById(`session-${subject}`).textContent = formatTime(
        sessionTimers[subject]
      );
      updateTotalDisplay();
    }, 1000);
  } else {
    // Pause
    stopActiveTimer();
  }
}

/**
 * Stop the active subject timer and save session
 */
function stopActiveTimer() {
  if (!activeSubject) return;

  const subject = activeSubject;
  clearInterval(intervalHandlers[subject]);
  intervalHandlers[subject] = null;

  const seconds = sessionTimers[subject];
  if (seconds > 0) {
    saveStudySession(subject, seconds);
  }

  sessionTimers[subject] = 0;
  activeSubject = null;

  const sessionEl = document.getElementById(`session-${subject}`);
  if (sessionEl) sessionEl.textContent = "00:00:00";

  const buttonEl = document.querySelector(`[data-subject="${subject}"]`);
  if (buttonEl) buttonEl.textContent = "▶️";
}

/**
 * Save a study session to backend
 */
async function saveStudySession(subject, durationSeconds) {
  if (durationSeconds < 1) return;

  const duration = formatTime(durationSeconds); // HH:MM:SS format

  await fetch("/api/study/add", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, duration }),
  });

  await fetchTodayDurations();
}

/**
 * Create new subject via prompt
 */
document
  .getElementById("create-subject-btn")
  .addEventListener("click", async () => {
    const name = prompt("Enter subject name:");
    if (!name) return;

    const res = await fetch("/api/subjects/create", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: name }),
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message);
      await initializeSubjectTimers();
    } else {
      alert(result.error);
    }
  });

/**
 * Delete subject and all its sessions
 */
async function handleDeleteSubject(subject) {
  if (!confirm(`Delete subject "${subject}" and all its sessions?`)) return;

  const res = await fetch("/api/subjects/delete", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject }),
  });

  const result = await res.json();

  if (res.ok) {
    alert(result.message);

    // Stop timer if it's active
    if (activeSubject === subject) {
      stopActiveTimer();
    }

    // Clean up local state
    delete sessionTimers[subject];
    delete totalTimers[subject];
    if (intervalHandlers[subject]) {
      clearInterval(intervalHandlers[subject]);
      delete intervalHandlers[subject];
    }

    // Remove DOM element
    const container = document.getElementById("subjects-list");
    const rows = container.querySelectorAll(".list-group-item");
    rows.forEach((row) => {
      if (row.textContent.includes(subject)) {
        row.remove();
      }
    });

    // Refresh total display
    await fetchTodayDurations();
  } else {
    alert(result.error || "Failed to delete subject");
  }
}

/**
 * On page ready
 */
document.addEventListener("DOMContentLoaded", initializeSubjectTimers);
