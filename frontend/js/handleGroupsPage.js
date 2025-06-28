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

// === Group Management Logic ===

async function createGroup() {
  const name = document.getElementById("group-name").value.trim();
  if (!name) return alert("Please enter a group name");

  const res = await fetch("/api/groups/create", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  alert(data.message || data.error);
}

async function joinGroup() {
  const group_id = document.getElementById("join-group-id").value;
  if (!group_id) return alert("Enter a group ID");

  const res = await fetch("/api/groups/join", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ group_id }),
  });
  const data = await res.json();
  alert(data.message || data.error);
}

async function viewMembers() {
  const group_id = document.getElementById("member-group-id").value;
  if (!group_id) return alert("Enter a group ID");

  const res = await fetch(`/api/groups/members/${group_id}`, {
    credentials: "include",
  });
  const members = await res.json();

  const list = document.getElementById("members-list");
  list.innerHTML = "";
  members.forEach((username) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = username;
    list.appendChild(li);
  });
}

async function viewRanking() {
  const group_id = document.getElementById("ranking-group-id").value;
  if (!group_id) return alert("Enter a group ID");

  const res = await fetch(`/api/groups/ranking/${group_id}`, {
    credentials: "include",
  });
  const rankings = await res.json();

  const list = document.getElementById("ranking-list");
  list.innerHTML = "";
  for (const [user, seconds] of Object.entries(rankings)) {
    const li = document.createElement("li");
    const time = new Date(seconds * 1000).toISOString().substr(11, 8);
    li.className = "list-group-item";
    li.textContent = `${user} – ${time}`;
    list.appendChild(li);
  }
}
