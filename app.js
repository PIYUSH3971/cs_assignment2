const express = require("express");
const session = require("express-session");
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secure-session-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false },
  }),
);

const users = {
  student: {
    password: "password123",
    role: "Student Researcher",
    clearance: "Level 1",
  },
  admin: {
    password: "adminpassword",
    role: "System Administrator",
    clearance: "Level 3",
  },
};

const layout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Internal Portal</title>
    <style>
        :root { --primary: #4f46e5; --bg: #f8fafc; --card: #ffffff; --text: #1e293b; --border: #e2e8f0; }
        body { font-family: system-ui, -apple-system, sans-serif; background-color: var(--bg); color: var(--text); display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: var(--card); padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); width: 100%; max-width: 420px; box-sizing: border-box; border: 1px solid var(--border); }
        h2 { margin-top: 0; font-weight: 600; color: #0f172a; font-size: 1.5rem; }
        p { font-size: 0.95rem; line-height: 1.5; color: #475569; }
        input { width: 100%; padding: 0.75rem; margin: 0.5rem 0 1.25rem 0; border: 1px solid var(--border); border-radius: 6px; box-sizing: border-box; font-size: 1rem; }
        input:focus { outline: 2px solid var(--primary); border-color: transparent; }
        button { background-color: var(--primary); color: white; border: none; padding: 0.75rem; width: 100%; border-radius: 6px; font-weight: 500; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; }
        button:hover { background-color: #4338ca; }
        code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.85rem; color: #0f172a; font-family: monospace; word-break: break-all; }
        .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 500; margin-bottom: 1rem; }
        .logout-btn { display: inline-block; margin-top: 1.5rem; color: #dc2626; text-decoration: none; font-weight: 500; font-size: 0.9rem; }
        .logout-btn:hover { text-decoration: underline; }
        .cred-box { background: #f8fafc; border: 1px dashed var(--border); padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; margin-top: 1.25rem; }
    </style>
</head>
<body>
    <div class="card">
        ${content}
    </div>
</body>
</html>
`;

app.get("/", (req, res) => {
  if (req.session.user) {
    const userData = users[req.session.user];
    res.send(
      layout(`
            <span class="badge">Authenticated Session</span>
            <h2>Welcome, ${req.session.user}!</h2>
            <p><strong>Role:</strong> ${userData.role}</p>
            <p><strong>Security Clearance:</strong> ${userData.clearance}</p>
            <p style="margin-top: 1rem;">Active Session ID:<br><code>${req.sessionID}</code></p>
            <a href="/logout" class="logout-btn">Sign Out</a>
        `),
    );
  } else {
    res.send(
      layout(`
            <h2>Internal Portal</h2>
            <p style="margin-bottom: 1.5rem;">Sign in to access your secure research workspace.</p>
            <form method="POST" action="/login">
                <label style="font-size: 0.85rem; font-weight: 500;">Username</label>
                <input type="text" name="username" value="student" required>
                
                <label style="font-size: 0.85rem; font-weight: 500;">Password</label>
                <input type="password" name="password" value="password123" required>
                
                <button type="submit">Sign In</button>
            </form>
            <div class="cred-box">
                <strong>Available Credentials:</strong><br>
                Student: <code>student</code> / <code>password123</code><br>
                Admin: <code>admin</code> / <code>adminpassword</code>
            </div>
        `),
    );
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (users[username] && users[username].password === password) {
    // SECURE IMPLEMENTATION (Session Fixation Protected):
    // req.session.regenerate() creates a fresh session ID on login.
    // If you want to demonstrate the vulnerability during class/review,
    // replace the regenerate block with: req.session.user = username; res.redirect('/');
    req.session.regenerate((err) => {
      if (err) return res.status(500).send("Session error");
      req.session.user = username;
      res.redirect("/");
    });
  } else {
    res.send(
      layout(`
            <h2>Access Denied</h2>
            <p>The username or password you entered is incorrect.</p>
            <a href="/" class="logout-btn" style="color: var(--primary);">Return to Login</a>
        `),
    );
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.listen(3000, () => {
  console.log("Modern app running at http://localhost:3000");
});
