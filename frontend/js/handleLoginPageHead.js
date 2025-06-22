// redirect to index.html if already logged in
async function checkLoginStatus() {
  const response = await fetch("/api/auth/status", {
    method: "GET",
    credentials: "include", // Include the session cookie
  });

  const data = await response.json();
  if (data.authenticated) {
    window.location.href = "/index.html"; // Redirect to main page if logged in
  }
}
checkLoginStatus();
