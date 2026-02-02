/**
 * @swagger
 * definitions:
 *   Booking:
 *     type: object
 *     properties:
 *       employeeId:
 *         type: string
 *       managerId:
 *         type: string
 *       seatId:
 *         type: integer
 *       startTime:
 *         type: string
 *         format: date-time
 *       endTime:
 *         type: string
 *         format: date-time
 *       durationMinutes:
 *         type: integer
 *       amountCharged:
 *         type: number
 *       status:
 *         type: string
 *         enum: [BOOKED, CANCELLED]
 *
 * /seats:
 *   post:
 *     summary: Book a seat
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           $ref: '#/definitions/Booking'
 *     responses:
 *       201:
 *         description: Seat booked successfully
 *         schema:
 *           $ref: '#/definitions/Booking'
 *       400:
 *         description: Bad request (e.g., invalid time, seat ID, etc.)
 *       409:
 *         description: Cafeteria full
 *   delete:
 *     summary: Cancel a booking
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         schema:
 *           type: string
 *         description: ID of the booking to cancel
 *     responses:
 *       200:
 *         description: Booking cancelled & refunded
 *       404:
 *         description: Booking not found
 *       400:
 *         description: Cancellation window closed
 *   get:
 *     summary: Get my bookings
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: List of bookings for the employee
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Booking'
 *       500:
 *         description: Internal server error
 */

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
        const { startTime, endTime, seatId } = req.body;
        const { employeeId } = req.user;
        const employee = await Employee.findOne({ employeeId });
        const managerId = employee.managerId;

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (end <= start) {
        return res.status(400).json({ message: "Invalid time slot" });
        }

        if (!seatId || seatId < 1 || seatId > constants.SEAT_CAPACITY) {
            return res.status(400).json({ message: "Invalid seat id" });
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

        const seatAlreadyBooked = await Booking.findOne({
            seatId,
            startTime: { $lt: end },
            endTime: { $gt: start },
            status: "BOOKED"
        });

        if (seatAlreadyBooked) {
            return res.status(400).json({ message: "Seat is booked for this time slot" });
        }

        const totalOverlaps = await Booking.countDocuments({ 
            startTime: { $lt: end },
            endTime: { $gt: start },
            status: "BOOKED"
        });

        if (totalOverlaps > constants.SEAT_CAPACITY) {
            return res.status(409).json({ message: "Cafeteria full" });
        }

        const amount = durationMinutes * constants.BLU_RATE_PER_MINUTE;
        
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
                seatId,
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

    console.log("Cancel")

    const booking = await Booking.findById(new mongoose.Types.ObjectId(bookingId));
    console.log("Booking");

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

        const now = new Date();
        const bookings = await Booking.find({ employeeId })
        .where('startTime')
        .gt(now)
        .sort({ startTime: -1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/check-availability/:startTime/:endTime/", ensureAuth, async (req, res) => {
  try {
    const { startTime, endTime } = req.params;

    if (!startTime || !endTime) {
            return res.status(400).json({ message: "Missing startTime or endTime" });
        }

        const overlappingBookings = await Booking.find({
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
            status: "BOOKED"
        });

        const occupiedSeats = overlappingBookings.map(b => b.seatId);

        return res.json({ occupiedSeats });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to check availability" });
    }
});


module.exports = router;
