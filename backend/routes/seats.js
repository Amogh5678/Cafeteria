const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Employee = require("../models/Employee")
const constants = require("../config/constants");
const { ensureAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/book", ensureAuth, async (req, res) => {
    try {
        const { startTime, endTime } = req.body;
        const employeeId = "A002D0744";
        const employee = await Employee.findOne({ employeeId });
        const managerId = employee.managerId;

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (end <= start) {
        return res.status(400).json({ message: "Invalid time slot" });
        }

        const durationMinutes = (end - start) / (1000 * 60);
        if (durationMinutes > constants.MAX_DAILY_MINUTES) {
        return res.status(400).json({ message: "Max 2 hours allowed per day" });
        }

        const dayStart = new Date(start);
        dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(start);
        dayEnd.setHours(23,59,59,999);

        const todaysBookings = await Booking.find({
        employeeId,
        startTime: { $gte: dayStart, $lte: dayEnd },
        status: "BOOKED"
        });

        const totalMinutesToday = todaysBookings.reduce(
        (sum, b) => sum + b.durationMinutes, 0
        );

        if (totalMinutesToday + durationMinutes > constants.MAX_DAILY_MINUTES) {
        return res.status(400).json({ message: "Daily booking limit exceeded" });
        }

        const overlappingBookings = await Booking.countDocuments({
        startTime: { $lt: end },
        endTime: { $gt: start },
        status: "BOOKED"
        });

        if (overlappingBookings >= constants.SEAT_CAPACITY) {
        return res.status(409).json({ message: "No seats available" });
        }

        const amount = durationMinutes * constants.BLU_RATE_PER_MINUTE;
        console.log(amount);
        
        await axios.post(
            `http://localhost:${process.env.PORT}/wallet/deduct`,
            { managerId, amount },
            { timeout: 3000 }
        );

        let booking;
        try {
            booking = await Booking.create({
                employeeId,
                managerId,
                startTime: start,
                endTime: end,
                durationMinutes,
                amountCharged: amount
            });
            } catch (err) {
            await axios.post(`http://localhost:${process.env.PORT}/wallet/refund`, {
                managerId,
                amount
            });
            throw err;
            }

            res.status(201).json({ message: "Seat booked", booking });
    } catch (err) {
        if (err.response) {
        return res.status(err.response.status).json(err.response.data);
        }
        res.status(500).json({ error: err.message });
    }
});


router.delete("/cancel/:bookingId", ensureAuth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { employeeId } = req.user;

    const booking = await Booking.findById(new mongoose.Types.ObjectId(bookingId));

    if (!booking || booking.status !== "BOOKED") {
      return res.status(404).json({ message: "Booking not found" });
    }

    const diffMinutes =
      (booking.startTime - new Date()) / (1000 * 60);

    if (diffMinutes < constants.CANCELLATION_CUTOFF_MINUTES) {
      return res.status(400).json({ message: "Cancellation window closed" });
    }

    await axios.post(`http://localhost:${process.env.PORT}/wallet/refund`, {
      managerId: booking.managerId,
      amount: booking.amountCharged
    });

    booking.status = "CANCELLED";
    await booking.save();

    res.json({ message: "Booking cancelled & refunded" });

  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.status(500).json({ error: err.message });
  }
});


router.get("/my-bookings", ensureAuth, async (req, res) => {
    try {
        const { employeeId } = req.user;

        const bookings = await Booking.find({ employeeId })
        .sort({ startTime: -1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
