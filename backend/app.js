require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");

const { ensureAuth } = require("./middleware/authMiddleware");

const app = express();

/**
 * --------------------
 * Middleware
 * --------------------
 */

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Session configuration
app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,      // true only in HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// Restore user from session on every request
app.use((req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
  }
  next();
});

/**
 * --------------------
 * Routes
 * --------------------
 */

// Public route
app.get("/", (req, res) => {
  res.send("Backend running OK");
});

// Debug route (to verify login)
app.get("/debug-user", (req, res) => {
  res.json(req.user || { message: "No user logged in" });
});

// Protected API
app.get("/api/me", ensureAuth, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.displayName,
    email: req.user.email,
  });
});

// Auth routes (OIDC)
app.use("/auth", require("./routes/auth"));

/**
 * --------------------
 * Server
 * --------------------
 */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
