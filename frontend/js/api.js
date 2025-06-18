async function login(username, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, password})
  });
  return await res.json();
}

console.log(login("testuser", "testpassword"));

