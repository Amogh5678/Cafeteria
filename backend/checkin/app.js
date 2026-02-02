// const express = require("express");
// const app = express();
// const swaggerUi = require("swagger-ui-express");
// const swaggerSpec = require("../swagger");
// const connectDB = require("./config/db");
// connectDB();
// const reservationRoutes = require("../routes/reservation.routes");

// app.use("/reservations", reservationRoutes);

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.use(express.json());

// // TEMP: mock auth middleware
// app.use((req, res, next) => {
//   req.user = { id: "user123" }; // w3id later
//   next();
// });

// const checkinRoutes = require("../routes/checkin.routes");
// app.use("/", checkinRoutes);
// app.listen(3000, () => {
//   console.log("Server running on port 3000");
// });

// module.exports = app;
// setInterval(() => {
//   require("./services/expiry.service").expireReservations();
// }, 60000);
// const { expireReservations } = require("./services/expiry.service");

// setInterval(async () => {
//   try {
//     const count = await expireReservations();
//     if (count > 0) {
//       console.log(`${count} reservation(s) expired`);
//     }
//   } catch (err) {
//     console.error("Expiry job failed", err);
//   }
// }, 60 * 1000); // every 1 minute