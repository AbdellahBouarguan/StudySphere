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

// === Study Session Timer Logic ===

let totalSeconds = 0;
let activeSubject = null;
let intervalHandlers = {};     // { subject: interval ID }
let sessionTimers = {};        // { subject: current session seconds }
let totalTimers = {};          // { subject: total seconds from backend }

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
 * Update global total timer display
 */
function updateTotalDisplay() {
  document.getElementById("total-timer").textContent = formatTime(totalSeconds);
}

/**
 * Initialize state on page load
 */
async function initializeSubjectTimers() {
  sessionTimers = {};
  totalTimers = {};
  totalSeconds = 0;

  await fetchTodayDurations();
  await loadSubjects();
}

/**
 * Render a subject row with session + total timers and control button
 */
function renderSubject(subject) {
  const container = document.getElementById("subjects-list");

  const row = document.createElement("div");
  row.className = "list-group-item d-flex justify-content-between align-items-center";

  const label = document.createElement("span");
  label.innerHTML = `<strong>${subject}</strong>`;

  const controlBtn = document.createElement("button");
  controlBtn.innerHTML = "▶️";
  controlBtn.className = "btn btn-sm btn-success";
  controlBtn.setAttribute("data-subject", subject);
  controlBtn.addEventListener("click", () => toggleSubjectTimer(subject, controlBtn));

  const info = document.createElement("div");
  info.innerHTML = `
    <div>Session: <span id="session-${subject}">00:00:00</span></div>
    <div>Total: <span id="total-${subject}">${formatTime(totalTimers[subject] || 0)}</span></div>
  `;

  const right = document.createElement("div");
  right.className = "d-flex gap-3 align-items-center";
  right.appendChild(info);
  right.appendChild(controlBtn);

  row.appendChild(label);
  row.appendChild(right);
  container.appendChild(row);
}

/**
 * Stop the currently active timer
 */
function stopActiveTimer() {
  if (!activeSubject) return;

  const subject = activeSubject;
  clearInterval(intervalHandlers[subject]);

  const seconds = sessionTimers[subject];
  if (seconds > 0) {
    saveStudySession(subject, seconds);
  }

  sessionTimers[subject] = 0;
  document.getElementById(`session-${subject}`).textContent = "00:00:00";
  intervalHandlers[subject] = null;
  activeSubject = null;

  const btn = document.querySelector(`[data-subject="${subject}"]`);
  if (btn) btn.textContent = "▶️";
}

/**
 * Toggle (start/pause) subject timer
 */
function toggleSubjectTimer(subject, buttonEl) {
  if (activeSubject && activeSubject !== subject) {
    stopActiveTimer();
  }

  if (!intervalHandlers[subject]) {
    // Start timer
    activeSubject = subject;
    buttonEl.textContent = "⏸️";

    intervalHandlers[subject] = setInterval(() => {
      sessionTimers[subject] = (sessionTimers[subject] || 0) + 1;
      totalSeconds += 1;

      document.getElementById(`session-${subject}`).textContent = formatTime(sessionTimers[subject]);
      updateTotalDisplay();
    }, 1000);
  } else {
    // Pause timer
    clearInterval(intervalHandlers[subject]);
    intervalHandlers[subject] = null;

    if (sessionTimers[subject] > 0) {
      saveStudySession(subject, sessionTimers[subject]);
    }

    sessionTimers[subject] = 0;
    document.getElementById(`session-${subject}`).textContent = "00:00:00";
    buttonEl.textContent = "▶️";
    activeSubject = null;
  }
}

/**
 * Save session to backend and update totals
 */
async function saveStudySession(subject, durationSeconds) {
  if (durationSeconds < 1) return;

  const duration = formatTime(durationSeconds); // HH:MM:SS

  await fetch("/api/study/add", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, duration })
  });

  sessionTimers[subject] = 0;
  await fetchTodayDurations();
}

/**
 * Fetch today's totals from backend and update UI
 */
async function fetchTodayDurations() {
  const res = await fetch("/api/study/today", { credentials: "include" });
  const data = await res.json(); // { subject: seconds }

  totalTimers = data;
  totalSeconds = 0;

  for (const [subject, seconds] of Object.entries(data)) {
    totalSeconds += seconds;
    const el = document.getElementById(`total-${subject}`);
    if (el) el.textContent = formatTime(seconds);
  }

  updateTotalDisplay();
}

/**
 * Load subjects and render them
 */
async function loadSubjects() {
  const res = await fetch("/api/subjects/", {
    method: "GET",
    credentials: "include"
  });

  const subjects = await res.json();
  const container = document.getElementById("subjects-list");
  container.innerHTML = "";

  subjects.forEach((subject) => {
    if (!(subject in sessionTimers)) sessionTimers[subject] = 0;
    if (!(subject in totalTimers)) totalTimers[subject] = 0;
    renderSubject(subject);
  });
}

/**
 * Create new subject
 */
document.getElementById("create-subject-btn").addEventListener("click", async () => {
  const name = prompt("Enter subject name:");
  if (!name) return;

  const res = await fetch("/api/subjects/create", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject: name })
  });

  const result = await res.json();
  if (res.ok) {
    alert(result.message);
    await loadSubjects();
  } else {
    alert(result.error);
  }
});

/**
 * On DOM ready, initialize everything
 */
document.addEventListener("DOMContentLoaded", initializeSubjectTimers);
