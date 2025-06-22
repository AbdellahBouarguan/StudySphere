document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include", // Important to include cookies!
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    alert(data.message); // Login successful
    // Optionally redirect to a protected page
    window.location.href = "/index.html"; // Redirect to main page
  } else {
    alert(data.error); // Show error
  }
});
