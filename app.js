const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.urlencoded({ extended: true }));

// VULNERABLE CONFIGURATION: saveUninitialized creates a session immediately, 
// and we do not regenerate the ID upon login later.
app.use(session({
    secret: 'insecure-secret-key',
    resave: false,
    saveUninitialized: true, 
    cookie: { httpOnly: false } // Allows easy viewing in DevTools for the demo
}));

// Mock database
const users = { admin: 'password123' };

app.get('/', (req, res) => {
    if (req.session.user) {
        res.send(`
            <h2>Welcome back, ${req.session.user}!</h2>
            <p>Your active Session ID: <code style="background:#eee;padding:4px;">${req.sessionID}</code></p>
            <div style="padding:20px; background:#d4edda; border:1px solid #c3e6cb; color:#155724; display:inline-block;">
                <h3>Confidential Data</h3>
                <p>Bank Balance: $1,000,000</p>
            </div>
            <br><br>
            <a href="/logout">Logout</a>
        `);
    } else {
        res.send(`
            <h2>Login Page</h2>
            <p>Your current anonymous Session ID: <code style="background:#eee;padding:4px;">${req.sessionID}</code></p>
            <form method="POST" action="/login">
                Username: <input type="text" name="username" value="admin"><br><br>
                Password: <input type="password" name="password" value="password123"><br><br>
                <button type="submit">Login</button>
            </form>
        `);
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (users[username] && users[username] === password) {
        // THE VULNERABILITY: We are attaching the user to the existing session 
        // instead of issuing a brand new session identifier.
        req.session.user = username;
        res.redirect('/');
    } else {
        res.send('Invalid credentials. <a href="/">Try again</a>');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Vulnerable app running at http://localhost:3000');
});