require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./swagger");
const connectDB = require("./config/db");
const { ensureAuth } = require("./middleware/authMiddleware");

// Routes
const reservationRoutes = require("./routes/reservation.routes");
const checkinRoutes = require("./routes/checkin.routes");
const seatRoutes = require("./routes/seats");
const walletRoutes = require("./routes/wallet");
const authRoutes = require("./routes/auth");

// Services
const { expireReservations } = require("./services/expiry.service");

const app = express();

/**
 * --------------------
 * Database
 * --------------------
 */
connectDB();

/**
 * --------------------
 * Middleware
 * --------------------
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Session configuration (OIDC-based auth)
app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true in HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// Restore user from session
app.use((req, res, next) => {
  if (req.session?.user) {
    req.user = req.session.user;
  }
  next();
});

/**
 * --------------------
 * Routes
 * --------------------
 */

// Public health check
app.get("/", (req, res) => {
  res.send("Backend running OK");
});

// Debug route
app.get("/debug-user", (req, res) => {
  res.json(req.user || { message: "No user logged in" });
});

// Auth routes (IBM w3 OIDC)
app.use("/auth", authRoutes);

// Protected user API
app.get("/api/me", ensureAuth, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.displayName,
    email: req.user.email,
  });
});

// Business routes
app.use("/reservations", reservationRoutes);
app.use("/", checkinRoutes);
app.use("/seats", seatRoutes);
app.use("/wallet", walletRoutes);

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * --------------------
 * Background Jobs
 * --------------------
 */
setInterval(async () => {
  try {
    const count = await expireReservations();
    if (count > 0) {
      console.log(`${count} reservation(s) expired`);
    }
  } catch (err) {
    console.error("Expiry job failed", err);
  }
}, 60 * 1000); // every 1 minute

/**
 * --------------------
 * Server
 * --------------------
 */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
