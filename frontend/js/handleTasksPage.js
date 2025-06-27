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

// === Task Management Logic ===

async function loadTasks() {
  const res = await fetch("/api/tasks/list", { credentials: "include" });
  const tasks = await res.json();
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";

    const descSpan = document.createElement("span");
    descSpan.textContent = task.description;
    descSpan.className = task.completed ? "task-item completed" : "task-item";

    const btn = document.createElement("button");
    btn.className = "btn btn-xs btn-primary";
    btn.textContent = task.completed ? "✓" : "✔️ Complete";
    btn.disabled = task.completed;

    btn.addEventListener("click", async () => {
      await fetch(`/api/tasks/complete/${task.id}`, {
        method: "POST",
        credentials: "include",
      });
      await loadTasks();
    });

    const wrapper = document.createElement("div");
    wrapper.className = "d-flex justify-content-between align-items-center";
    wrapper.appendChild(descSpan);
    wrapper.appendChild(btn);

    li.appendChild(wrapper);
    list.appendChild(li);
  });
}

document.getElementById("add-task-btn").addEventListener("click", async () => {
  const input = document.getElementById("task-input");
  const description = input.value.trim();
  if (!description) return;

  const res = await fetch("/api/tasks/add", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });

  const result = await res.json();
  if (res.ok) {
    input.value = "";
    await loadTasks();
  } else {
    alert(result.error || "Error adding task");
  }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await fetch("/api/logout", {
    method: "POST",
    credentials: "include",
  });
  window.location.href = "/login";
});

document.addEventListener("DOMContentLoaded", loadTasks);
