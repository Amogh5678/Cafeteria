const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  seatId: { type: String, required: true },
  slotStartTime: { type: Date, required: true },
  slotEndTime: { type: Date, required: true },
  checkInDeadline: { type: Date, required: true },
  checkInCode: { type: String, required: true },
  status: {
    type: String,
    enum: ["BOOKED", "CHECKED_IN", "CANCELLED", "EXPIRED"],
    default: "BOOKED"
  },
  checkedInAt: { type: Date }
});

module.exports = mongoose.model("Reservation", ReservationSchema);
