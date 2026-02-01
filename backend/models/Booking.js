const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  managerId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  amountCharged: { type: Number, required: true },
  seatId: { type: Number, required: true },

  status: { 
    type: String, 
    required: true,
    enum: ["BOOKED", "CANCELLED"],
    default: "BOOKED"
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);