const Reservation = require("../models/reservation.model");

exports.checkIn = async (userId, reservationId, code) => {
  // 1️⃣ Fetch reservation from DB
  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    throw { status: 404, message: "Reservation not found" };
  }

  // 2️⃣ Ownership check
  if (reservation.userId !== userId) {
    throw { status: 403, message: "Unauthorized" };
  }

  // 3️⃣ Status checks
  if (reservation.status === "CHECKED_IN") {
    throw { status: 409, message: "Already checked in" };
  }

  if (reservation.status !== "BOOKED") {
    throw { status: 400, message: "Invalid reservation state" };
  }

  // 4️⃣ Time validation
  const now = new Date();
  if (now > reservation.checkInDeadline) {
    reservation.status = "EXPIRED";
    await reservation.save();
    throw { status: 403, message: "Check-in window expired" };
  }

  // 5️⃣ Code validation
  if (reservation.checkInCode !== code) {
    throw { status: 401, message: "Invalid check-in code" };
  }

  // 6️⃣ Success
  reservation.status = "CHECKED_IN";
  reservation.checkedInAt = now;
  await reservation.save();

  return {
    status: "CHECKED_IN",
    checkedInAt: now
  };
};
