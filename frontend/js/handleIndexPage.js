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


// handle subject creation and listing
  async function loadSubjects() {
    const response = await fetch('/api/subjects/', {
      method: 'GET',
      credentials: 'include'  // needed to send cookies/session
    });

    const data = await response.json();
    
    const subjectsList = document.getElementById('subjects-list');
    subjectsList.innerHTML = ''; // Clear previous list

    data.forEach(subject => {
      const item = document.createElement('div');
      item.className = 'list-group-item';
      item.textContent = subject;
      subjectsList.appendChild(item);
    });
  }

  document.getElementById('create-subject-btn').addEventListener('click', async () => {
    const newSubject = prompt("Enter new subject name:");
    if (!newSubject) return;

    const response = await fetch('/api/subjects/create', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subject: newSubject })
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message || "Subject created");
      loadSubjects();  // Refresh list
    } else {
      alert(result.error || "Failed to create subject");
    }
  });

  document.addEventListener('DOMContentLoaded', loadSubjects);